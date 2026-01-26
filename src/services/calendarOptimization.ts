import { supabase } from '../supabase';
import { generateGroupTaskInstances } from '../utils/taskInstances';

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
  parent_task_id?: string | null;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | null;
  recurrence_end_date?: string | null;
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
  score?: number;                   // Score d'assignation
  scoreDetails?: string;            // Détails du calcul du score
  isRepetition?: boolean;           // Indique si c'est une répétition
  isConsecutive?: boolean;          // Indique si semaines consécutives
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
  attemptNumber?: number;               // Numéro de la tentative réussie
  isOptimal?: boolean;                  // true si solution optimale, false si meilleure solution après plusieurs tentatives
  message?: string;                     // Message explicatif si solution non optimale
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

      // 6. Exécuter l'algorithme d'optimisation avec système de retry
      const result = this.optimizeWithRetry(
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
    try {
      // ⚠️ SÉCURITÉ: Vérifier qu'il n'y a pas de période active qui chevauche
      // pour éviter de régénérer et supprimer les instances assignées
      const { data: existingPeriods } = await supabase
        .from('optimization_periods')
        .select('start_date, end_date')
        .eq('group_id', groupId)
        .eq('status', 'active');

      const hasOverlap = existingPeriods?.some(period => {
        const pStart = new Date(period.start_date);
        const pEnd = new Date(period.end_date);
        return startDate <= pEnd && endDate >= pStart;
      });

      if (hasOverlap) {
        console.warn('⚠️ Période existante détectée - Pas de régénération pour éviter suppression');
      } else {
        // Générer les instances de tâches récurrentes SEULEMENT si pas de chevauchement
        console.log('🔄 Génération des instances de tâches récurrentes...');
        console.log(`📅 Période: ${startDate.toISOString()} → ${endDate.toISOString()}`);
        
        const instancesGenerated = await generateGroupTaskInstances(groupId, endDate);
        console.log(`✅ ${instancesGenerated} instance(s) générée(s)`);
      }
      
      // Charger SEULEMENT les instances (pas les tâches parent) non assignées
      // qui tombent dans la période
      // ⚠️ Utiliser occurrence_date pour les instances, pas start_date
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .is('assigned_to', null)
        .not('parent_task_id', 'is', null)  // ✅ SEULEMENT les instances
        .gte('occurrence_date', startDate.toISOString().split('T')[0])
        .lte('occurrence_date', endDate.toISOString().split('T')[0]);

      if (error) {
        console.error('Erreur fetchUnassignedTasks:', error);
        throw error;
      }
      
      // Filtrer les tâches complétées
      const activeTasks = (data || []).filter(task => task.status !== 'completed');
      
      console.log(`📅 ${activeTasks.length} tâche(s) non assignée(s) dans la période`);
      console.log('Détail tâches:', activeTasks.map(t => ({ 
        title: t.title, 
        start: t.start_date,
        end: t.end_date
      })));
      
      return activeTasks;
    } catch (err) {
      console.error('Exception dans fetchUnassignedTasks:', err);
      throw err;
    }
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

    const members = (data || []).map((item: any) => ({
      id: item.users.id,
      full_name: item.users.full_name,
      email: item.users.email,
      role: item.users.role,
    }));
    
    console.log(`👥 ${members.length} membre(s) trouvé(s) dans le groupe:`, members.map(m => m.full_name));
    
    return members;
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
    // Charger toutes les tâches assignées dans la période (instances incluses)
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
   * Optimisation avec système de retry et différentes stratégies
   */
  optimizeWithRetry(
    tasks: Task[],
    members: UserProfile[],
    unavailabilities: Availability[],
    existingAssignments: Task[],
    previousPeriodAssignments: HistoricalAssignment[],
    constraints: OptimizationConstraints,
    startDate: Date,
    endDate: Date
  ): OptimizationResult {
    const MAX_ATTEMPTS = 5;
    let bestResult: OptimizationResult | null = null;
    let bestScore = -Infinity;

    console.log(`🔄 Début optimisation avec ${MAX_ATTEMPTS} tentatives maximum`);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`\n📊 === TENTATIVE ${attempt}/${MAX_ATTEMPTS} ===`);
      
      // Créer une variation des contraintes selon la tentative
      const attemptConstraints = this.getConstraintsForAttempt(attempt, constraints);
      
      // Ajouter de la randomisation pour les tentatives suivantes
      const shuffledTasks = attempt === 1 ? tasks : this.shuffleTasks(tasks, attempt);
      
      const result = this.optimizeAssignments(
        shuffledTasks,
        members,
        unavailabilities,
        existingAssignments,
        previousPeriodAssignments,
        attemptConstraints,
        startDate,
        endDate
      );

      // Calculer le score de cette solution
      const score = this.calculateSolutionScore(result);
      
      console.log(`📈 Tentative ${attempt}: ${result.assignments.length}/${tasks.length} assignées, ${result.statistics.conflictsDetected} conflits, score=${score}`);

      // Si on a une solution parfaite (tout assigné, pas de conflits)
      if (result.assignments.length === tasks.length && result.statistics.conflictsDetected === 0) {
        console.log(`✅ Solution parfaite trouvée à la tentative ${attempt}!`);
        return {
          ...result,
          attemptNumber: attempt,
          isOptimal: true,
        };
      }

      // Garder la meilleure solution
      if (score > bestScore) {
        bestScore = score;
        bestResult = {
          ...result,
          attemptNumber: attempt,
        };
      }

      // Si on a assigné toutes les tâches (même avec quelques conflits), c'est acceptable
      if (result.assignments.length === tasks.length) {
        console.log(`✅ Toutes les tâches assignées à la tentative ${attempt} (${result.statistics.conflictsDetected} conflits)`);
        return {
          ...result,
          attemptNumber: attempt,
          isOptimal: result.statistics.conflictsDetected === 0,
          message: result.statistics.conflictsDetected > 0 
            ? `Solution trouvée avec ${result.statistics.conflictsDetected} conflit(s). Le système a fait de son mieux avec les contraintes données.`
            : undefined,
        };
      }
    }

    // Après toutes les tentatives, retourner la meilleure solution
    console.warn(`⚠️ Aucune solution parfaite après ${MAX_ATTEMPTS} tentatives. Meilleure solution: ${bestResult?.assignments.length}/${tasks.length}`);
    
    return {
      ...bestResult!,
      isOptimal: false,
      message: `Le système a essayé ${MAX_ATTEMPTS} stratégies différentes. ` +
        `Meilleure solution: ${bestResult?.assignments.length}/${tasks.length} tâches assignées. ` +
        `Certaines tâches n'ont pas pu être assignées en raison des contraintes de disponibilité.`,
    };
  },

  /**
   * Adapte les contraintes selon le numéro de tentative
   */
  getConstraintsForAttempt(attemptNumber: number, baseConstraints: OptimizationConstraints): OptimizationConstraints {
    switch (attemptNumber) {
      case 1:
        // Tentative 1: Contraintes strictes originales
        return baseConstraints;
      
      case 2:
        // Tentative 2: Assouplir la répétition de tâches
        return {
          ...baseConstraints,
          avoidTaskRepetition: false,
        };
      
      case 3:
        // Tentative 3: Assouplir les semaines consécutives
        return {
          ...baseConstraints,
          avoidTaskRepetition: false,
          avoidConsecutiveWeeks: false,
        };
      
      case 4:
        // Tentative 4: Ignorer la période précédente
        return {
          ...baseConstraints,
          avoidTaskRepetition: false,
          avoidConsecutiveWeeks: false,
          considerPreviousPeriod: false,
        };
      
      case 5:
        // Tentative 5: Seulement respecter les conflits réels
        return {
          ...baseConstraints,
          avoidTaskRepetition: false,
          avoidConsecutiveWeeks: false,
          considerPreviousPeriod: false,
          balanceWorkload: true, // Garder l'équilibrage
          respectPriority: false, // Ignorer les priorités
        };
      
      default:
        return baseConstraints;
    }
  },

  /**
   * Mélange les tâches pour créer de la variété entre les tentatives
   */
  shuffleTasks(tasks: Task[], seed: number): Task[] {
    const shuffled = [...tasks];
    
    // Utiliser le seed pour avoir un mélange déterministe mais différent à chaque tentative
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((Math.sin(seed * (i + 1)) * 10000) % (i + 1));
      const absJ = Math.abs(j);
      [shuffled[i], shuffled[absJ]] = [shuffled[absJ], shuffled[i]];
    }
    
    return shuffled;
  },

  /**
   * Calcule un score pour évaluer la qualité d'une solution
   */
  calculateSolutionScore(result: OptimizationResult): number {
    let score = 0;
    
    // Priorité 1: Nombre de tâches assignées (poids très élevé)
    score += result.assignments.length * 1000;
    
    // Priorité 2: Absence de conflits (poids élevé)
    score -= result.statistics.conflictsDetected * 500;
    
    // Priorité 3: Équilibrage de la charge (poids moyen)
    const workloads = Object.values(result.statistics.workloadDistribution);
    if (workloads.length > 0) {
      const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
      const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
      score -= variance * 10; // Pénaliser la variance
    }
    
    // Priorité 4: Minimiser les répétitions (poids faible)
    score -= result.statistics.repetitionsCount * 20;
    
    // Priorité 5: Minimiser les semaines consécutives (poids faible)
    score -= result.statistics.consecutiveWeeksCount * 10;
    
    return score;
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

    // Initialiser workloadDistribution à 0 pour tous les membres
    members.forEach(member => {
      workloadDistribution[member.id] = 0;
    });

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
        
        // Calculer la durée en heures (pour les instances, duration_hours peut être undefined)
        const taskDurationHours = task.duration_hours || 
          (assignment.endDate.getTime() - assignment.startDate.getTime()) / (1000 * 60 * 60);
        
        workloadDistribution[assignment.userId] = (workloadDistribution[assignment.userId] || 0) + taskDurationHours;
        
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
        console.warn('❌ Impossible d\'assigner la tâche:', task.title, {
          start_date: task.start_date,
          end_date: task.end_date,
          duration_hours: task.duration_hours,
          parent: task.parent_task_id ? 'instance' : 'parent'
        });
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
    let bestScoreDetails: string[] = []; // Détails du calcul du score
    let isRepetition = false;
    let isConsecutive = false;

    // Calculer la date et heure de début/fin de la tâche
    // Pour les instances récurrentes, start_date contient déjà date + heure
    let taskStartDateTime: Date;
    let taskEndDateTime: Date;
    let effectiveDate: string; // Déclaré ici pour être accessible partout
    
    if (task.start_time) {
      // Ancienne méthode (tâches avec start_time séparé)
      effectiveDate = task.start_date;
      taskStartDateTime = new Date(`${task.start_date}T${task.start_time}`);
      taskEndDateTime = new Date(taskStartDateTime);
      taskEndDateTime.setHours(taskEndDateTime.getHours() + task.duration_hours);
    } else {
      // Nouvelle méthode (instances récurrentes avec occurrence_date)
      // ⚠️ IMPORTANT: Utiliser occurrence_date pour instances, pas start_date
      effectiveDate = (task as any).occurrence_date || task.start_date;
      taskStartDateTime = new Date(effectiveDate);
      if (task.end_date) {
        taskEndDateTime = new Date(task.end_date);
      } else {
        taskEndDateTime = new Date(taskStartDateTime);
        taskEndDateTime.setHours(taskEndDateTime.getHours() + (task.duration_hours || 1));
      }
    }
    
    // Vérifier si les dates sont valides
    if (isNaN(taskStartDateTime.getTime()) || isNaN(taskEndDateTime.getTime())) {
      console.warn('⚠️ Dates invalides pour la tâche:', task.title, {
        start_date: task.start_date,
        occurrence_date: (task as any).occurrence_date,
        start_time: task.start_time,
        end_date: task.end_date
      });
      return null;
    }
    
    // Calculer le numéro de semaine actuel
    const currentWeek = Math.floor(
      (taskStartDateTime.getTime() - periodStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    console.log(`🔍 Recherche membre pour "${task.title}" (${members.length} candidats)`);
    console.log(`   Tâche: ${effectiveDate} → ${task.end_date}`);

    for (const member of members) {
      let score = 0; // Score de ce membre pour cette tâche (plus élevé = meilleur)
      let memberHasConflict = false;
      let memberConflictReason: string | undefined;
      const scoreDetails: string[] = [];

      // Vérifier la limite de tâches par utilisateur
      if (constraints.maxTasksPerUser !== null) {
        const memberTaskCount = currentAssignments.filter(
          a => a.userId === member.id
        ).length;
        
        if (memberTaskCount >= constraints.maxTasksPerUser) {
          console.log(`⏭️ ${member.full_name} ignoré: limite tâches atteinte (${memberTaskCount}/${constraints.maxTasksPerUser})`);
          continue;
        }
      }

      // CONTRAINTE 1: Éviter la continuité avec la période précédente
      if (constraints.considerPreviousPeriod && currentWeek === 0) {
        // C'est la première semaine de la nouvelle période
        if (lastWeekTasks[member.id]?.includes(task.id)) {
          // Ce membre avait cette tâche la dernière semaine de la période précédente
          score -= 20; // Pénalité légère (réduit de 100 à 20)
          scoreDetails.push('continuité période -20');
          memberHasConflict = true;
          memberConflictReason = 'Continuité avec période précédente';
        } else {
          score += 10; // Bonus pour éviter la continuité
          scoreDetails.push('évite continuité +10');
        }
      }

      // CONTRAINTE 2: Éviter la répétition de tâche
      if (constraints.avoidTaskRepetition) {
        const taskAssignments = userTaskHistory[member.id]?.[task.id] || [];
        if (taskAssignments.length > 0) {
          // Ce membre a déjà fait cette tâche dans cette période
          score -= 10; // Pénalité légère pour répétition (réduit de 50 à 10)
          scoreDetails.push(`répétition -10 (${taskAssignments.length}x)`);
          
          // CONTRAINTE 3: Éviter les semaines consécutives si répétition
          if (constraints.avoidConsecutiveWeeks) {
            const lastWeek = taskAssignments[taskAssignments.length - 1];
            if (currentWeek - lastWeek === 1) {
              // Semaines consécutives
              score -= 15; // Pénalité supplémentaire (réduit de 30 à 15)
              scoreDetails.push('semaines consécutives -15');
              memberHasConflict = true;
              memberConflictReason = 'Semaines consécutives pour même tâche';
            } else if (currentWeek - lastWeek < 3) {
              // Trop proche (moins de 3 semaines d'écart)
              score -= 5; // Réduit de 15 à 5
              scoreDetails.push(`trop proche -5 (écart: ${currentWeek - lastWeek})`);
            } else {
              score += 5; // Léger bonus si suffisamment espacé
              scoreDetails.push('bien espacé +5');
            }
          }
        } else {
          score += 20; // Bonus pour première fois
          scoreDetails.push('première fois +20');
        }
      }

      // Vérifier les indisponibilités - INTERDICTION STRICTE
      const isUnavailable = this.checkUnavailability(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        unavailabilities
      );

      if (isUnavailable) {
        // TOUJOURS ignorer ce membre si indisponible (un utilisateur ne peut pas être à deux endroits)
        console.log(`⏭️ ${member.full_name} ignoré pour "${task.title}": indisponible`);
        continue;
      }

      // Vérifier les conflits avec les tâches déjà assignées - INTERDICTION STRICTE
      const conflictingTask = this.checkTaskConflict(
        member.id,
        taskStartDateTime,
        taskEndDateTime,
        existingAssignments,
        currentAssignments
      );

      if (conflictingTask) {
        // TOUJOURS ignorer ce membre si conflit (un utilisateur ne peut faire qu'une tâche à la fois)
        const taskName = 'title' in conflictingTask ? conflictingTask.title : conflictingTask.taskTitle;
        console.log(`⏭️ ${member.full_name} ignoré pour "${task.title}": conflit avec "${taskName}"`);
        continue;
      }

      // Vérifier les heures préférées
      const taskHour = taskStartDateTime.getHours();
      if (
        taskHour < constraints.preferredStartHour ||
        taskHour > constraints.preferredEndHour
      ) {
        score -= 20; // Pénalité légère au lieu d'éliminer
        scoreDetails.push(`heure ${taskHour}h -20`);
      } else {
        score += 10; // Bonus pour heures préférées
        scoreDetails.push(`heure OK +10`);
      }

      // Équilibrage de la charge
      const currentWorkload = workloadDistribution[member.id];
      
      if (constraints.balanceWorkload) {
        // Bonus inversement proportionnel à la charge
        const workloadScore = 50 - (currentWorkload * 2);
        score += workloadScore;
        scoreDetails.push(`charge(${currentWorkload}) ${workloadScore > 0 ? '+' : ''}${workloadScore}`);
      }

      // Log du score final pour ce membre
      console.log(`   ${member.full_name}: score=${score} [${scoreDetails.join(', ')}]`);

      // Choisir le membre avec le meilleur score
      if (score > bestScore || (score === bestScore && currentWorkload < lowestWorkload)) {
        bestScore = score;
        lowestWorkload = currentWorkload;
        bestMember = member;
        hasConflict = memberHasConflict;
        conflictReason = memberConflictReason;
        bestScoreDetails = scoreDetails;
        
        // Détecter si c'est une répétition ou consécutif
        const taskHistory = userTaskHistory[member.id]?.[task.id] || [];
        isRepetition = taskHistory.length > 0;
        if (taskHistory.length > 0) {
          const lastWeek = taskHistory[taskHistory.length - 1];
          isConsecutive = (currentWeek - lastWeek === 1);
        }
      }
    }

    if (!bestMember) {
      console.warn(`❌ Aucun membre disponible pour "${task.title}" - Tous éliminés (bestScore=${bestScore})`);
      return null;
    }

    console.log(`   ✅ Sélectionné: ${bestMember.full_name} (score=${bestScore})`);

    return {
      taskId: task.id,
      taskTitle: task.title,
      userId: bestMember.id,
      userName: bestMember.full_name,
      startDate: taskStartDateTime,
      endDate: taskEndDateTime,
      hasConflict,
      conflictReason,
      score: bestScore,
      scoreDetails: bestScoreDetails.join(', '),
      isRepetition,
      isConsecutive,
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
   * Crée une période d'optimisation verrouillée
   */
  async createOptimizationPeriod(
    groupId: string,
    startDate: Date,
    endDate: Date,
    totalTasks: number,
    assignedTasks: number
  ): Promise<string> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('optimization_periods')
        .insert({
          group_id: groupId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          accepted_by: userData.user.id,
          total_tasks: totalTasks,
          assigned_tasks: assignedTasks,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Période d\'optimisation créée:', data.id);
      return data.id;
    } catch (error) {
      console.error('Erreur lors de la création de la période:', error);
      throw error;
    }
  },

  /**
   * Supprime une période d'optimisation (uniquement AVANT le début)
   * Désassigne automatiquement les tâches pour permettre une nouvelle génération
   */
  async deleteOptimizationPeriod(periodId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('delete_optimization_period', {
          p_period_id: periodId
        });

      if (error) throw error;
      
      console.log('✅ Période supprimée, tâches désassignées');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la période:', error);
      throw new Error(error.message || 'Impossible de supprimer la période');
    }
  },

  /**
   * Récupère les périodes d'un groupe
   */
  async getOptimizationPeriods(groupId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('optimization_periods')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des périodes:', error);
      return [];
    }
  },

  /**
   * Sauvegarde les assignations acceptées et crée une période verrouillée
   */
  async saveAssignments(
    assignments: TaskAssignment[],
    groupId: string,
    startDate: Date,
    endDate: Date,
    totalTasks: number
  ): Promise<{ success: boolean; periodId: string }> {
    try {
      // 1. Créer la période d'optimisation verrouillée
      const periodId = await this.createOptimizationPeriod(
        groupId,
        startDate,
        endDate,
        totalTasks,
        assignments.length
      );

      // 2. Mettre à jour chaque tâche avec son assignation
      for (const assignment of assignments) {
        const { error } = await supabase
          .from('tasks')
          .update({
            assigned_to: assignment.userId,
            // Status reste 'pending' - la tâche est assignée mais pas encore commencée
          })
          .eq('id', assignment.taskId);

        if (error) throw error;
      }

      console.log(`✅ ${assignments.length} tâches assignées pour la période ${periodId}`);
      return { success: true, periodId };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des assignations:', error);
      throw error;
    }
  },
};
