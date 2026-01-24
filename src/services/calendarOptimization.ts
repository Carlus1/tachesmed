import { supabase } from '../supabase';

// Types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string | null;
  duration_hours: number;
  priority: 'low' | 'medium' | 'high';
  status: string;
  assigned_to: string | null;
  created_by: string;
  group_id: string | null;
}

export interface Availability {
  id: string;
  user_id: string;
  start_time: string; // ISO timestamp
  end_time: string;   // ISO timestamp
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface OptimizationConstraints {
  balanceWorkload: boolean;        // Équilibrer la charge entre les membres
  respectPriority: boolean;         // Respecter les priorités des tâches
  minimizeConflicts: boolean;       // Minimiser les conflits de planning
  maxTasksPerUser: number | null;   // Limite de tâches par utilisateur
  preferredStartHour: number;       // Heure de début préférée (0-23)
  preferredEndHour: number;         // Heure de fin préférée (0-23)
}

export interface TaskAssignment {
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  hasConflict: boolean;
  conflictReason?: string;
}

export interface OptimizationResult {
  assignments: TaskAssignment[];
  unassignedTasks: Task[];
  statistics: {
    totalTasks: number;
    assignedTasks: number;
    unassignedTasks: number;
    conflictsDetected: number;
    workloadDistribution: { [userId: string]: number };
  };
}

// Service d'optimisation
export const calendarOptimizationService = {
  /**
   * Génère une proposition de calendrier optimisé pour un groupe
   */
  async generateOptimizedCalendar(
    groupId: string,
    constraints: OptimizationConstraints,
    startDate: Date,
    endDate: Date
  ): Promise<OptimizationResult> {
    try {
      // 1. Récupérer toutes les tâches non assignées du groupe
      const tasks = await this.fetchUnassignedTasks(groupId, startDate, endDate);

      // 2. Récupérer les membres du groupe
      const members = await this.fetchGroupMembers(groupId);

      // 3. Récupérer les disponibilités de tous les membres
      const availabilities = await this.fetchAvailabilities(
        members.map(m => m.id),
        startDate,
        endDate
      );

      // 4. Récupérer les tâches déjà assignées pour détecter les conflits
      const existingAssignments = await this.fetchExistingAssignments(
        members.map(m => m.id),
        startDate,
        endDate
      );

      // 5. Exécuter l'algorithme d'optimisation
      const result = this.optimizeAssignments(
        tasks,
        members,
        availabilities,
        existingAssignments,
        constraints
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la génération du calendrier optimisé:', error);
      throw error;
    }
  },

  /**
   * Récupère les tâches non assignées d'un groupe
   */
  async fetchUnassignedTasks(
    groupId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .is('assigned_to', null)
      .gte('start_date', startDate.toISOString().split('T')[0])
      .lte('start_date', endDate.toISOString().split('T')[0])
      .neq('status', 'completed');

    if (error) throw error;
    return data || [];
  },

  /**
   * Récupère les membres d'un groupe
   */
  async fetchGroupMembers(groupId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, users!inner(id, full_name, email, role)')
      .eq('group_id', groupId);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.users.id,
      full_name: item.users.full_name,
      email: item.users.email,
      role: item.users.role,
    }));
  },

  /**
   * Récupère les indisponibilités des membres
   */
  async fetchAvailabilities(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Availability[]> {
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .in('user_id', userIds)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString());

    if (error) throw error;
    return data || [];
  },

  /**
   * Récupère les tâches déjà assignées
   */
  async fetchExistingAssignments(
    userIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('assigned_to', userIds)
      .gte('start_date', startDate.toISOString().split('T')[0])
      .lte('start_date', endDate.toISOString().split('T')[0])
      .neq('status', 'completed');

    if (error) throw error;
    return data || [];
  },

  /**
   * Algorithme principal d'optimisation
   */
  optimizeAssignments(
    tasks: Task[],
    members: UserProfile[],
    unavailabilities: Availability[],
    existingAssignments: Task[],
    constraints: OptimizationConstraints
  ): OptimizationResult {
    const assignments: TaskAssignment[] = [];
    const unassignedTasks: Task[] = [];
    const workloadDistribution: { [userId: string]: number } = {};
    let conflictsDetected = 0;

    // Initialiser la charge de travail
    members.forEach(member => {
      workloadDistribution[member.id] = 0;
    });

    // Trier les tâches par priorité si demandé
    const sortedTasks = constraints.respectPriority
      ? [...tasks].sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
      : [...tasks];

    // Pour chaque tâche, trouver le meilleur membre disponible
    for (const task of sortedTasks) {
      const assignment = this.findBestAssignment(
        task,
        members,
        unavailabilities,
        existingAssignments,
        workloadDistribution,
        constraints,
        assignments
      );

      if (assignment) {
        assignments.push(assignment);
        workloadDistribution[assignment.userId] += task.duration_hours;
        
        if (assignment.hasConflict) {
          conflictsDetected++;
        }
      } else {
        unassignedTasks.push(task);
      }
    }

    return {
      assignments,
      unassignedTasks,
      statistics: {
        totalTasks: tasks.length,
        assignedTasks: assignments.length,
        unassignedTasks: unassignedTasks.length,
        conflictsDetected,
        workloadDistribution,
      },
    };
  },

  /**
   * Trouve la meilleure assignation pour une tâche
   */
  findBestAssignment(
    task: Task,
    members: UserProfile[],
    unavailabilities: Availability[],
    existingAssignments: Task[],
    workloadDistribution: { [userId: string]: number },
    constraints: OptimizationConstraints,
    currentAssignments: TaskAssignment[]
  ): TaskAssignment | null {
    let bestMember: UserProfile | null = null;
    let lowestWorkload = Infinity;
    let hasConflict = false;
    let conflictReason: string | undefined;

    // Calculer la date et heure de début/fin de la tâche
    const taskStartDateTime = new Date(`${task.start_date}T${task.start_time}`);
    const taskEndDateTime = new Date(taskStartDateTime);
    taskEndDateTime.setHours(taskEndDateTime.getHours() + task.duration_hours);

    for (const member of members) {
      // Vérifier la limite de tâches par utilisateur
      if (constraints.maxTasksPerUser !== null) {
        const memberTaskCount = currentAssignments.filter(
          a => a.userId === member.id
        ).length;
        
        if (memberTaskCount >= constraints.maxTasksPerUser) {
          continue;
        }
      }

      // Vérifier les indisponibilités
      const isUnavailable = this.checkUnavailability(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        unavailabilities
      );

      if (isUnavailable && constraints.minimizeConflicts) {
        continue;
      }

      // Vérifier les conflits avec les tâches déjà assignées
      const conflictingTask = this.checkTaskConflict(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        existingAssignments,
        currentAssignments
      );

      if (conflictingTask && constraints.minimizeConflicts) {
        continue;
      }

      // Vérifier les heures préférées
      const taskHour = taskStartDateTime.getHours();
      if (
        taskHour < constraints.preferredStartHour ||
        taskHour > constraints.preferredEndHour
      ) {
        continue;
      }

      // Équilibrage de la charge
      const currentWorkload = workloadDistribution[member.id];
      
      if (constraints.balanceWorkload) {
        if (currentWorkload < lowestWorkload) {
          lowestWorkload = currentWorkload;
          bestMember = member;
          hasConflict = isUnavailable || !!conflictingTask;
          
          if (isUnavailable) {
            conflictReason = 'Indisponibilité du membre';
          } else if (conflictingTask) {
            const taskName = 'title' in conflictingTask ? conflictingTask.title : conflictingTask.taskTitle;
            conflictReason = `Conflit avec: ${taskName}`;
          }
        }
      } else {
        // Prendre le premier membre disponible
        bestMember = member;
        hasConflict = isUnavailable || !!conflictingTask;
        
        if (isUnavailable) {
          conflictReason = 'Indisponibilité du membre';
        } else if (conflictingTask) {
          const taskName = 'title' in conflictingTask ? conflictingTask.title : conflictingTask.taskTitle;
          conflictReason = `Conflit avec: ${taskName}`;
        }
        break;
      }
    }

    if (!bestMember) {
      return null;
    }

    return {
      taskId: task.id,
      taskTitle: task.title,
      userId: bestMember.id,
      userName: bestMember.full_name,
      startDate: taskStartDateTime,
      endDate: taskEndDateTime,
      hasConflict,
      conflictReason,
    };
  },

  /**
   * Vérifie si un membre est indisponible pendant une période
   */
  checkUnavailability(
    userId: string,
    startDate: Date,
    endDate: Date,
    unavailabilities: Availability[]
  ): boolean {
    return unavailabilities.some(unavail => {
      if (unavail.user_id !== userId) return false;

      const unavailStart = new Date(unavail.start_time);
      const unavailEnd = new Date(unavail.end_time);

      // Vérifier le chevauchement
      return (
        (startDate >= unavailStart && startDate < unavailEnd) ||
        (endDate > unavailStart && endDate <= unavailEnd) ||
        (startDate <= unavailStart && endDate >= unavailEnd)
      );
    });
  },

  /**
   * Vérifie les conflits avec les tâches existantes
   */
  checkTaskConflict(
    userId: string,
    startDate: Date,
    endDate: Date,
    existingAssignments: Task[],
    currentAssignments: TaskAssignment[]
  ): Task | TaskAssignment | null {
    // Vérifier les tâches déjà en base
    const existingConflict = existingAssignments.find(task => {
      if (task.assigned_to !== userId) return false;

      const taskStart = new Date(`${task.start_date}T${task.start_time}`);
      const taskEnd = new Date(taskStart);
      taskEnd.setHours(taskEnd.getHours() + task.duration_hours);

      return (
        (startDate >= taskStart && startDate < taskEnd) ||
        (endDate > taskStart && endDate <= taskEnd) ||
        (startDate <= taskStart && endDate >= taskEnd)
      );
    });

    if (existingConflict) return existingConflict;

    // Vérifier les assignations en cours de génération
    const currentConflict = currentAssignments.find(assignment => {
      if (assignment.userId !== userId) return false;

      return (
        (startDate >= assignment.startDate && startDate < assignment.endDate) ||
        (endDate > assignment.startDate && endDate <= assignment.endDate) ||
        (startDate <= assignment.startDate && endDate >= assignment.endDate)
      );
    });

    return currentConflict || null;
  },

  /**
   * Sauvegarde les assignations acceptées
   */
  async saveAssignments(assignments: TaskAssignment[]): Promise<boolean> {
    try {
      // Mettre à jour chaque tâche avec son assignation
      for (const assignment of assignments) {
        const { error } = await supabase
          .from('tasks')
          .update({
            assigned_to: assignment.userId,
            status: 'assigned',
          })
          .eq('id', assignment.taskId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des assignations:', error);
      throw error;
    }
  },
};
