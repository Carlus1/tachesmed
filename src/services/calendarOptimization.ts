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
  avoidTaskRepetition: boolean;     // Éviter qu'un utilisateur fasse la même tâche plusieurs fois
  avoidConsecutiveWeeks: boolean;   // Éviter les semaines consécutives pour la même tâche
  considerPreviousPeriod: boolean;  // Tenir compte de la période précédente
}

export interface PeriodConfig {
  duration: number;                 // Durée de la période
  unit: 'weeks' | 'months';         // Unité de temps
}

export interface HistoricalAssignment {
  taskId: string;
  taskTitle: string;
  userId: string;
  weekNumber: number;               // Numéro de semaine dans la période
  periodEndDate: Date;              // Date de fin de la période
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
    repetitionsCount: number;          // Nombre de répétitions de tâches
    consecutiveWeeksCount: number;     // Nombre de semaines consécutives
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

      // 5. Récupérer l'historique de la période précédente si demandé
      const previousPeriodAssignments = constraints.considerPreviousPeriod
        ? await this.fetchPreviousPeriodAssignments(groupId, startDate)
        : [];

      // 6. Exécuter l'algorithme d'optimisation
      const result = this.optimizeAssignments(
        tasks,
        members,
        availabilities,
        existingAssignments,
        previousPeriodAssignments,
        constraints,
        startDate,
        endDate
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
      .not('status', 'eq', 'completed');

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
   * Récupère les assignations de la période précédente
   * Pour éviter qu'un utilisateur termine une période avec une tâche
   * et commence la suivante avec la même tâche
   */
  async fetchPreviousPeriodAssignments(
    groupId: string,
    currentPeriodStart: Date
  ): Promise<HistoricalAssignment[]> {
    // Calculer la date de fin de la période précédente (juste avant le début de la période actuelle)
    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    
    // Récupérer les 4 dernières semaines avant le début de la période actuelle
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 28); // 4 semaines

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, assigned_to, start_date')
      .eq('group_id', groupId)
      .not('assigned_to', 'is', null)
      .gte('start_date', previousPeriodStart.toISOString().split('T')[0])
      .lte('start_date', previousPeriodEnd.toISOString().split('T')[0])
      .neq('status', 'cancelled');

    if (error) throw error;

    // Convertir en HistoricalAssignment avec calcul du numéro de semaine
    return (data || []).map(task => {
      const taskDate = new Date(task.start_date);
      const weeksDiff = Math.floor((taskDate.getTime() - previousPeriodStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      return {
        taskId: task.id,
        taskTitle: task.title,
        userId: task.assigned_to,
        weekNumber: weeksDiff,
        periodEndDate: previousPeriodEnd,
      };
    });
  },

  /**
   * Algorithme principal d'optimisation
   */
  optimizeAssignments(
    tasks: Task[],
    members: UserProfile[],
    unavailabilities: Availability[],
    existingAssignments: Task[],
    previousPeriodAssignments: HistoricalAssignment[],
    constraints: OptimizationConstraints,
    startDate: Date,
    endDate: Date
  ): OptimizationResult {
    const assignments: TaskAssignment[] = [];
    const unassignedTasks: Task[] = [];
    const workloadDistribution: { [userId: string]: number } = {};
    let conflictsDetected = 0;
    let repetitionsCount = 0;
    let consecutiveWeeksCount = 0;

    // Tracker pour les tâches assignées par utilisateur
    const userTaskHistory: { [userId: string]: { [taskId: string]: number[] } } = {};
    
    // Initialiser la charge de travail et l'historique
    members.forEach(member => {
      workloadDistribution[member.id] = 0;
      userTaskHistory[member.id] = {};
    });

    // Trouver les dernières tâches de la période précédente (dernière semaine)
    const lastWeekTasks: { [userId: string]: string[] } = {};
    if (constraints.considerPreviousPeriod && previousPeriodAssignments.length > 0) {
      const maxWeek = Math.max(...previousPeriodAssignments.map(a => a.weekNumber));
      previousPeriodAssignments
        .filter(a => a.weekNumber === maxWeek)
        .forEach(a => {
          if (!lastWeekTasks[a.userId]) {
            lastWeekTasks[a.userId] = [];
          }
          lastWeekTasks[a.userId].push(a.taskId);
        });
    }

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
        assignments,
        userTaskHistory,
        lastWeekTasks,
        startDate
      );

      if (assignment) {
        assignments.push(assignment);
        workloadDistribution[assignment.userId] += task.duration_hours;
        
        // Tracker l'historique des tâches par utilisateur
        if (!userTaskHistory[assignment.userId][task.id]) {
          userTaskHistory[assignment.userId][task.id] = [];
        }
        
        // Calculer le numéro de semaine dans la période
        const weekNumber = Math.floor(
          (assignment.startDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        userTaskHistory[assignment.userId][task.id].push(weekNumber);
        
        // Vérifier si c'est une répétition
        if (userTaskHistory[assignment.userId][task.id].length > 1) {
          repetitionsCount++;
          
          // Vérifier si c'est consécutif
          const weeks = userTaskHistory[assignment.userId][task.id];
          if (weeks.length >= 2 && weeks[weeks.length - 1] - weeks[weeks.length - 2] === 1) {
            consecutiveWeeksCount++;
          }
        }
        
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
        repetitionsCount,
        consecutiveWeeksCount,
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
    currentAssignments: TaskAssignment[],
    userTaskHistory: { [userId: string]: { [taskId: string]: number[] } },
    lastWeekTasks: { [userId: string]: string[] },
    periodStartDate: Date
  ): TaskAssignment | null {
    let bestMember: UserProfile | null = null;
    let lowestWorkload = Infinity;
    let hasConflict = false;
    let conflictReason: string | undefined;
    let bestScore = -Infinity; // Score pour choisir le meilleur membre

    // Calculer la date et heure de début/fin de la tâche
    const taskStartDateTime = new Date(`${task.start_date}T${task.start_time}`);
    const taskEndDateTime = new Date(taskStartDateTime);
    taskEndDateTime.setHours(taskEndDateTime.getHours() + task.duration_hours);
    
    // Calculer le numéro de semaine actuel
    const currentWeek = Math.floor(
      (taskStartDateTime.getTime() - periodStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    for (const member of members) {
      let score = 0; // Score de ce membre pour cette tâche (plus élevé = meilleur)
      let memberHasConflict = false;
      let memberConflictReason: string | undefined;

      // Vérifier la limite de tâches par utilisateur
      if (constraints.maxTasksPerUser !== null) {
        const memberTaskCount = currentAssignments.filter(
          a => a.userId === member.id
        ).length;
        
        if (memberTaskCount >= constraints.maxTasksPerUser) {
          continue;
        }
      }

      // CONTRAINTE 1: Éviter la continuité avec la période précédente
      if (constraints.considerPreviousPeriod && currentWeek === 0) {
        // C'est la première semaine de la nouvelle période
        if (lastWeekTasks[member.id]?.includes(task.id)) {
          // Ce membre avait cette tâche la dernière semaine de la période précédente
          score -= 100; // Forte pénalité
          memberHasConflict = true;
          memberConflictReason = 'Continuité avec période précédente';
        } else {
          score += 10; // Bonus pour éviter la continuité
        }
      }

      // CONTRAINTE 2: Éviter la répétition de tâche
      if (constraints.avoidTaskRepetition) {
        const taskAssignments = userTaskHistory[member.id]?.[task.id] || [];
        if (taskAssignments.length > 0) {
          // Ce membre a déjà fait cette tâche dans cette période
          score -= 50; // Pénalité pour répétition
          
          // CONTRAINTE 3: Éviter les semaines consécutives si répétition
          if (constraints.avoidConsecutiveWeeks) {
            const lastWeek = taskAssignments[taskAssignments.length - 1];
            if (currentWeek - lastWeek === 1) {
              // Semaines consécutives
              score -= 30; // Pénalité supplémentaire
              memberHasConflict = true;
              memberConflictReason = 'Semaines consécutives pour même tâche';
            } else if (currentWeek - lastWeek < 3) {
              // Trop proche (moins de 3 semaines d'écart)
              score -= 15;
            } else {
              score += 5; // Léger bonus si suffisamment espacé
            }
          }
        } else {
          score += 20; // Bonus pour première fois
        }
      }

      // Vérifier les indisponibilités
      const isUnavailable = this.checkUnavailability(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        unavailabilities
      );

      if (isUnavailable) {
        if (constraints.minimizeConflicts) {
          continue; // Ignorer ce membre
        }
        score -= 40;
        memberHasConflict = true;
        memberConflictReason = 'Indisponibilité du membre';
      }

      // Vérifier les conflits avec les tâches déjà assignées
      const conflictingTask = this.checkTaskConflict(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        existingAssignments,
        currentAssignments
      );

      if (conflictingTask) {
        if (constraints.minimizeConflicts) {
          continue;
        }
        score -= 35;
        memberHasConflict = true;
        const taskName = 'title' in conflictingTask ? conflictingTask.title : conflictingTask.taskTitle;
        memberConflictReason = `Conflit avec: ${taskName}`;
      }

      // Vérifier les heures préférées
      const taskHour = taskStartDateTime.getHours();
      if (
        taskHour < constraints.preferredStartHour ||
        taskHour > constraints.preferredEndHour
      ) {
        score -= 20; // Pénalité légère au lieu d'éliminer
      } else {
        score += 10; // Bonus pour heures préférées
      }

      // Équilibrage de la charge
      const currentWorkload = workloadDistribution[member.id];
      
      if (constraints.balanceWorkload) {
        // Bonus inversement proportionnel à la charge
        const workloadScore = 50 - (currentWorkload * 2);
        score += workloadScore;
      }

      // Choisir le membre avec le meilleur score
      if (score > bestScore || (score === bestScore && currentWorkload < lowestWorkload)) {
        bestScore = score;
        lowestWorkload = currentWorkload;
        bestMember = member;
        hasConflict = memberHasConflict;
        conflictReason = memberConflictReason;
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
