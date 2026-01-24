export type Language = 'fr' | 'en' | 'en-US' | 'es';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    tasks: string;
    groups: string;
    calendar: string;
    reports: string;
    settings: string;
    logout: string;
  };
  
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    close: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    name: string;
    description: string;
    actions: string;
  };
  
  // Auth
  auth: {
    login: string;
    email: string;
    password: string;
    signIn: string;
    signOut: string;
    createAccount: string;
    backToLogin: string;
    forgotPassword: string;
    resetPassword: string;
    sendResetLink: string;
    createAccountTitle: string;
    resetPasswordTitle: string;
    loginTitle: string;
    loading: string;
    passwordResetSent: string;
    accountCreated: string;
    accountCreatedConfirm: string;
  };
  
  // Settings
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    preferences: string;
    language: string;
    notifications: string;
    timezone: string;
    fullName: string;
    role: string;
    changePassword: string;
    newPassword: string;
    confirmPassword: string;
    receiveNotifications: string;
    selectTimezone: string;
    saveProfile: string;
    savePreferences: string;
    save: string;
    saving: string;
    savedSuccessfully: string;
    profileSaved: string;
    preferencesSaved: string;
    profileInfo: string;
    leaveBlankNoChange: string;
    chooseLanguage: string;
    manageNotifications: string;
  };
  
  // Groups
  groups: {
    title: string;
    createGroup: string;
    editGroup: string;
    deleteGroup: string;
    groupName: string;
    members: string;
    tasks: string;
    taskCount: string;
    createdAt: string;
    unavailabilityFrequency: string;
    frequencyDescription: string;
    confirmDelete: string;
    deleteWarning: string;
    everyWeek: string;
    every2Weeks: string;
    everyMonth: string;
    every2Months: string;
    every3Months: string;
    every6Months: string;
    everyYear: string;
    manageMembers: string;
    newGroup: string;
    noGroups: string;
    noGroupsMessage: string;
    description: string;
    deleting: string;
    // GroupModal keys
    groupNamePlaceholder: string;
    descriptionOptional: string;
    frequencyLabel: string;
    frequencyHelp: string;
    customWeeks: string;
    customWeeksHelp: string;
    creating: string;
    create: string;
    groupNameRequired: string;
  };
  
  // Dashboard
  dashboard: {
    upcomingTasks: string;
    calendarProposal: string;
    noTasks: string;
    viewAllTasks: string;
    viewAllGroups: string;
    weekOf: string;
    accept: string;
    regenerate: string;
    high: string;
    medium: string;
    low: string;
    myGroups: string;
    createGroup: string;
    seeAll: string;
    member: string;
    members: string;
    seeDetails: string;
    noGroupMember: string;
    createOrJoinGroup: string;
  };

  // Tasks
  tasks: {
    title: string;
    createTask: string;
    editTask: string;
    deleteTask: string;
    taskName: string;
    dueDate: string;
    assignedTo: string;
    status: string;
    priority: string;
    pending: string;
    inProgress: string;
    completed: string;
    management: string;
    newTask: string;
    noTasks: string;
    noTasksMessage: string;
    group: string;
    unknownGroup: string;
    startDate: string;
    duration: string;
    minutes: string;
    modify: string;
    deleting: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    deleteSuccess: string;
    deleteError: string;
    // TaskModal keys
    associatedGroups: string;
    noGroupAvailable: string;
    atLeastOneGroup: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    highPriority: string;
    mediumPriority: string;
    lowPriority: string;
    creating: string;
    create: string;
    noGroupSelected: string;
    endDate: string;
    recurrenceLabel: string;
    recurrenceHelp: string;
    noRecurrence: string;
    weekly: string;
    biWeekly: string;
    monthly: string;
    biMonthly: string;
    quarterly: string;
    semiAnnually: string;
    yearly: string;
    custom: string;
    customWeeks: string;
    customWeeksHelp: string;
    recurrenceEndDate: string;
    recurrenceEndDateHelp: string;
  };
  
  // Calendar
  calendar: {
    title: string;
    today: string;
    week: string;
    month: string;
    viewFullCalendar: string;
    weekOf: string;
    noTask: string;
    taskCount: string;
    thisWeek: string;
    thisMonth: string;
    tasksOf: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
  
  // Reports
  reports: {
    title: string;
    subtitle: string;
    errorLoading: string;
    calendarProposal: string;
    calendarProposalDesc: string;
    globalCalendar: string;
    globalCalendarDesc: string;
    taskReport: string;
    taskReportDesc: string;
    userReport: string;
    userReportDesc: string;
    groupReport: string;
    groupReportDesc: string;
    availabilityReport: string;
    availabilityReportDesc: string;
    totalTasks: string;
    completedTasks: string;
    tasksInProgress: string;
    priorityDistribution: string;
    totalUsers: string;
    activeUsers: string;
    roleDistribution: string;
    owner: string;
    admin: string;
    user: string;
    totalGroups: string;
    averageMembers: string;
    mostActiveGroup: string;
    totalAvailabilities: string;
    averageDuration: string;
    mostAvailableDay: string;
    noData: string;
    noGroup: string;
  };
  
  // Unavailabilities
  unavailabilities: {
    title: string;
    reminder: string;
    upToDate: string;
    actionRequired: string;
    updateNow: string;
    enterNow: string;
    daysRemaining: string;
    enterUnavailabilities: string;
    updateUnavailabilities: string;
    nextUpdateIn: string;
    manageUnavailabilities: string;
    myUnavailabilities: string;
    manageAllUnavailabilities: string;
    selectUser: string;
    unavailable: string;
    selected: string;
    close: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    added: string;
    updated: string;
    deleted: string;
    errorAdding: string;
    errorUpdating: string;
    errorDeleting: string;
    errorLoading: string;
    readOnlyMode: string;
    readOnlyMessage: string;
    day: string;
  };
  
  // Notifications
  notifications: {
    unavailabilitiesNotEntered: string;
    updateRequiredToday: string;
    reminderUpdateSoon: string;
    daysLeft: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      tasks: 'Tâches',
      groups: 'Groupes',
      calendar: 'Calendrier',
      reports: 'Rapports',
      settings: 'Paramètres',
      logout: 'Déconnexion',
    },
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      close: 'Fermer',
      confirm: 'Confirmer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      name: 'Nom',
      description: 'Description',
      actions: 'Actions',
    },
    auth: {
      login: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',
      signIn: 'Se connecter',
      signOut: 'Déconnexion',
      createAccount: 'Créer un compte',
      backToLogin: 'Retour à la connexion',
      forgotPassword: 'Mot de passe oublié ?',
      resetPassword: 'Réinitialiser le mot de passe',
      sendResetLink: 'Envoyer le lien',
      createAccountTitle: 'Créer un compte',
      resetPasswordTitle: 'Réinitialiser le mot de passe',
      loginTitle: 'Connexion à votre compte',
      loading: 'Chargement...',
      passwordResetSent: 'Email de réinitialisation envoyé',
      accountCreated: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      accountCreatedConfirm: 'Compte créé ! Vérifiez votre email pour confirmer votre compte.',
    },
    settings: {
      title: 'Paramètres',
      subtitle: 'Gérez votre profil et vos préférences.',
      profile: 'Informations du profil',
      preferences: 'Préférences',
      language: 'Langue',
      notifications: 'Notifications',
      timezone: 'Fuseau horaire',
      fullName: 'Nom complet',
      role: 'Rôle',
      changePassword: 'Changer le mot de passe',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le nouveau mot de passe',
      receiveNotifications: 'Recevoir des notifications',
      selectTimezone: 'Sélectionnez votre fuseau horaire pour les heures affichées.',
      saveProfile: 'Enregistrer le profil',
      savePreferences: 'Enregistrer les préférences',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      savedSuccessfully: 'Paramètres enregistrés avec succès',
      profileSaved: 'Profil mis à jour avec succès',
      preferencesSaved: 'Préférences enregistrées',
      profileInfo: 'Informations du profil',
      leaveBlankNoChange: 'Laisser vide pour ne pas changer',
      chooseLanguage: 'Choisissez la langue de l\'interface.',
      manageNotifications: 'Gérer les notifications par email et in-app.',
    },
    dashboard: {
      upcomingTasks: 'Tâches à venir',
      calendarProposal: 'Proposition de calendrier',
      noTasks: 'Aucune tâche à venir',
      viewAllTasks: 'Voir toutes les tâches',
      viewAllGroups: 'Voir tous les groupes',
      weekOf: 'Semaine du',
      accept: 'Accepter',
      regenerate: 'Régénérer',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      myGroups: 'Mes groupes',
      createGroup: 'Créer un groupe',
      seeAll: 'Voir tous',
      member: 'membre',
      members: 'membres',
      seeDetails: 'Voir détails',
      noGroupMember: 'Vous n\'êtes membre d\'aucun groupe',
      createOrJoinGroup: 'Créer ou rejoindre un groupe',
    },
    groups: {
      title: 'Mes groupes',
      createGroup: 'Nouveau groupe',
      editGroup: 'Modifier le groupe',
      deleteGroup: 'Supprimer',
      groupName: 'Nom du groupe',
      members: 'Membres',
      tasks: 'Tâches',
      taskCount: 'tâche',
      createdAt: 'Créé le',
      unavailabilityFrequency: 'Fréquence de mise à jour des indisponibilités',
      frequencyDescription: 'Les membres devront mettre à jour leurs indisponibilités selon cette fréquence',
      confirmDelete: 'Confirmer la suppression',
      deleteWarning: 'Êtes-vous sûr de vouloir supprimer ce groupe',
      everyWeek: 'Chaque semaine',
      every2Weeks: 'Toutes les 2 semaines',
      everyMonth: 'Chaque mois (4 semaines)',
      every2Months: 'Tous les 2 mois (8 semaines)',
      every3Months: 'Tous les 3 mois (12 semaines)',
      every6Months: 'Tous les 6 mois (24 semaines)',
      everyYear: 'Chaque année (52 semaines)',
      manageMembers: 'Gérer les membres',
      newGroup: 'Nouveau groupe',
      noGroups: 'Aucun groupe',
      noGroupsMessage: 'Commencez par créer votre premier groupe',
      description: 'Description',
      deleting: 'Suppression...',
      groupNamePlaceholder: 'Nom du groupe',
      descriptionOptional: 'Description (optionnel)',
      frequencyLabel: 'Fréquence de mise à jour des indisponibilités',
      frequencyHelp: 'Les membres devront mettre à jour leurs indisponibilités selon cette fréquence',
      customWeeks: 'Nombre de semaines',
      customWeeksHelp: 'Entrez le nombre de semaines (1 à 104)',
      creating: 'Création...',
      create: 'Créer',
      groupNameRequired: 'Le nom du groupe est requis',
    },
    tasks: {
      title: 'Tâches',
      createTask: 'Créer une tâche',
      editTask: 'Modifier la tâche',
      deleteTask: 'Supprimer la tâche',
      taskName: 'Nom de la tâche',
      dueDate: 'Date d\'échéance',
      assignedTo: 'Assigné à',
      status: 'Statut',
      priority: 'Priorité',
      pending: 'En attente',
      inProgress: 'En cours',
      completed: 'Terminé',
      management: 'Gestion des tâches',
      newTask: 'Nouvelle tâche',
      noTasks: 'Aucune tâche',
      noTasksMessage: 'Aucune tâche n\'a été créée pour le moment.',
      group: 'Groupe',
      unknownGroup: 'Groupe inconnu',
      startDate: 'Date de début',
      duration: 'Durée',
      minutes: 'minutes',
      modify: 'Modifier',
      deleting: 'Suppression...',
      confirmDelete: 'Confirmer la suppression',
      confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.',
      deleteSuccess: 'Tâche supprimée avec succès',
      deleteError: 'Erreur lors de la suppression de la tâche',
      associatedGroups: 'Groupes associés',
      noGroupAvailable: 'Aucun groupe disponible',
      atLeastOneGroup: 'Au moins un groupe doit être sélectionné',
      titlePlaceholder: 'Titre',
      descriptionPlaceholder: 'Description',
      highPriority: 'Haute priorité',
      mediumPriority: 'Priorité moyenne',
      lowPriority: 'Basse priorité',
      creating: 'Création...',
      create: 'Créer',
      noGroupSelected: 'Aucun groupe sélectionné — sélectionnez au moins un groupe avant de créer une tâche.',
      endDate: 'Date de fin',
      recurrenceLabel: 'Répétition',
      recurrenceHelp: 'Définir si cette tâche doit se répéter automatiquement',
      noRecurrence: 'Pas de répétition',
      weekly: 'Chaque semaine',
      biWeekly: 'Toutes les 2 semaines',
      monthly: 'Chaque mois',
      biMonthly: 'Tous les 2 mois',
      quarterly: 'Tous les 3 mois',
      semiAnnually: 'Tous les 6 mois',
      yearly: 'Chaque année',
      custom: 'Personnalisé',
      customWeeks: 'Nombre de semaines',
      customWeeksHelp: 'Entrez le nombre de semaines entre chaque répétition',
      recurrenceEndDate: 'Date de fin de répétition (optionnel)',
      recurrenceEndDateHelp: 'Laissez vide pour une répétition infinie',
    },
    calendar: {
      title: 'Calendrier',
      today: 'Aujourd\'hui',
      week: 'Semaine',
      month: 'Mois',
      viewFullCalendar: 'Voir le calendrier complet',
      weekOf: 'Semaine du',
      noTask: 'Aucune tâche',
      taskCount: 'tâche',
      thisWeek: 'cette semaine',
      thisMonth: 'ce mois',
      tasksOf: 'Tâches du',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mer',
      thu: 'Jeu',
      fri: 'Ven',
      sat: 'Sam',
      sun: 'Dim',
    },
    reports: {
      title: 'Rapports et statistiques',
      subtitle: 'Sélectionnez un rapport pour voir les statistiques détaillées',
      errorLoading: 'Erreur lors du chargement des statistiques',
      calendarProposal: 'Proposition de calendrier',
      calendarProposalDesc: 'Générer automatiquement un calendrier optimisé',
      globalCalendar: 'Calendrier Global',
      globalCalendarDesc: 'Vue globale des tâches et assignations',
      taskReport: 'Rapport des tâches',
      taskReportDesc: 'Statistiques sur les tâches',
      userReport: 'Rapport des utilisateurs',
      userReportDesc: 'Vue d\'ensemble des utilisateurs',
      groupReport: 'Rapport des groupes',
      groupReportDesc: 'Analyse des groupes',
      availabilityReport: 'Rapport des disponibilités',
      availabilityReportDesc: 'Statistiques des disponibilités',
      totalTasks: 'Total des tâches',
      completedTasks: 'Tâches terminées',
      tasksInProgress: 'Tâches en cours',
      priorityDistribution: 'Répartition par priorité',
      totalUsers: 'Total des utilisateurs',
      activeUsers: 'Utilisateurs actifs',
      roleDistribution: 'Répartition par rôle',
      owner: 'Propriétaire',
      admin: 'Admin',
      user: 'Utilisateur',
      totalGroups: 'Total des groupes',
      averageMembers: 'Moyenne des membres',
      mostActiveGroup: 'Groupe le plus actif',
      totalAvailabilities: 'Total des disponibilités',
      averageDuration: 'Durée moyenne',
      mostAvailableDay: 'Jour le plus disponible',
      noData: 'Aucune donnée',
      noGroup: 'Aucun groupe',
    },
    unavailabilities: {
      title: 'Indisponibilités',
      reminder: 'Rappel d\'indisponibilités',
      upToDate: 'Indisponibilités à jour',
      actionRequired: 'Action requise',
      updateNow: 'Mettre à jour maintenant',
      enterNow: 'Saisir maintenant',
      daysRemaining: 'jours restants',
      enterUnavailabilities: 'Saisissez vos indisponibilités',
      updateUnavailabilities: 'Mettez à jour vos indisponibilités',
      nextUpdateIn: 'Prochaine mise à jour dans',
      manageUnavailabilities: 'Gérer mes indisponibilités',
      myUnavailabilities: 'Mes indisponibilités',
      manageAllUnavailabilities: 'Gérer les indisponibilités',
      selectUser: 'Sélectionner un utilisateur',
      unavailable: 'Indisponible',
      selected: 'Indisponibilité sélectionnée',
      close: 'Fermer',
      confirmDelete: 'Confirmer la suppression',
      confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer cette indisponibilité ?',
      added: 'Indisponibilité ajoutée avec succès',
      updated: 'Indisponibilité mise à jour avec succès',
      deleted: 'Indisponibilité supprimée avec succès',
      errorAdding: 'Erreur lors de l\'ajout de l\'indisponibilité',
      errorUpdating: 'Erreur lors de la mise à jour de l\'indisponibilité',
      errorDeleting: 'Erreur lors de la suppression de l\'indisponibilité',
      errorLoading: 'Erreur lors du chargement des indisponibilités',
      readOnlyMode: 'Mode consultation uniquement',
      readOnlyMessage: 'Vous ne pouvez pas modifier les indisponibilités',
      day: 'Jour',
    },
    notifications: {
      unavailabilitiesNotEntered: 'Pensez à saisir vos indisponibilités pour faciliter la planification.',
      updateRequiredToday: 'Vos indisponibilités doivent être mises à jour aujourd\'hui.',
      reminderUpdateSoon: 'Pensez à mettre à jour vos indisponibilités',
      daysLeft: 'jours restants',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      groups: 'Groups',
      calendar: 'Calendar',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      close: 'Close',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      name: 'Name',
      description: 'Description',
      actions: 'Actions',
    },
    auth: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      createAccount: 'Create Account',
      backToLogin: 'Back to Login',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      sendResetLink: 'Send Reset Link',
      createAccountTitle: 'Create Account',
      resetPasswordTitle: 'Reset Password',
      loginTitle: 'Login to your account',
      loading: 'Loading...',
      passwordResetSent: 'Password reset email sent',
      accountCreated: 'Account created successfully! You can now log in.',
      accountCreatedConfirm: 'Account created! Check your email to confirm your account.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your profile and preferences.',
      profile: 'Profile Information',
      preferences: 'Preferences',
      language: 'Language',
      notifications: 'Notifications',
      timezone: 'Timezone',
      fullName: 'Full Name',
      role: 'Role',
      changePassword: 'Change Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      receiveNotifications: 'Receive notifications',
      selectTimezone: 'Select your timezone for displayed times.',
      saveProfile: 'Save Profile',
      savePreferences: 'Save Preferences',
      save: 'Save',
      saving: 'Saving...',
      savedSuccessfully: 'Settings saved successfully',
      profileSaved: 'Profile updated successfully',
      preferencesSaved: 'Preferences saved',
      profileInfo: 'Profile Information',
      leaveBlankNoChange: 'Leave blank to keep unchanged',
      chooseLanguage: 'Choose the interface language.',
      manageNotifications: 'Manage email and in-app notifications.',
    },
    dashboard: {
      upcomingTasks: 'Upcoming Tasks',
      calendarProposal: 'Calendar Proposal',
      noTasks: 'No upcoming tasks',
      viewAllTasks: 'View all tasks',
      viewAllGroups: 'View all groups',
      weekOf: 'Week of',
      accept: 'Accept',
      regenerate: 'Regenerate',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      myGroups: 'My Groups',
      createGroup: 'Create Group',
      seeAll: 'See all',
      member: 'member',
      members: 'members',
      seeDetails: 'See details',
      noGroupMember: 'You are not a member of any group',
      createOrJoinGroup: 'Create or join a group',
    },
    groups: {
      title: 'My Groups',
      createGroup: 'New Group',
      editGroup: 'Edit Group',
      deleteGroup: 'Delete',
      groupName: 'Group Name',
      members: 'Members',
      tasks: 'Tasks',
      taskCount: 'task',
      createdAt: 'Created on',
      unavailabilityFrequency: 'Unavailability Update Frequency',
      frequencyDescription: 'Members will need to update their unavailabilities according to this frequency',
      confirmDelete: 'Confirm Deletion',
      deleteWarning: 'Are you sure you want to delete this group',
      everyWeek: 'Every week',
      every2Weeks: 'Every 2 weeks',
      everyMonth: 'Every month (4 weeks)',
      every2Months: 'Every 2 months (8 weeks)',
      every3Months: 'Every 3 months (12 weeks)',
      every6Months: 'Every 6 months (24 weeks)',
      everyYear: 'Every year (52 weeks)',
      manageMembers: 'Manage Members',
      newGroup: 'New Group',
      noGroups: 'No groups',
      noGroupsMessage: 'Start by creating your first group',
      description: 'Description',
      deleting: 'Deleting...',
      groupNamePlaceholder: 'Group Name',
      descriptionOptional: 'Description (optional)',
      frequencyLabel: 'Unavailability Update Frequency',
      frequencyHelp: 'Members will need to update their unavailabilities according to this frequency',
      customWeeks: 'Number of weeks',
      customWeeksHelp: 'Enter the number of weeks (1 to 104)',
      creating: 'Creating...',
      create: 'Create',
      groupNameRequired: 'Group name is required',
    },
    tasks: {
      title: 'Tasks',
      createTask: 'Create Task',
      editTask: 'Edit Task',
      deleteTask: 'Delete Task',
      taskName: 'Task Name',
      dueDate: 'Due Date',
      assignedTo: 'Assigned To',
      status: 'Status',
      priority: 'Priority',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      management: 'Task Management',
      newTask: 'New Task',
      noTasks: 'No tasks',
      noTasksMessage: 'No tasks have been created yet.',
      group: 'Group',
      unknownGroup: 'Unknown group',
      startDate: 'Start Date',
      duration: 'Duration',
      minutes: 'minutes',
      modify: 'Modify',
      deleting: 'Deleting...',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this task? This action is irreversible.',
      deleteSuccess: 'Task deleted successfully',
      deleteError: 'Error deleting task',
      associatedGroups: 'Associated Groups',
      noGroupAvailable: 'No group available',
      atLeastOneGroup: 'At least one group must be selected',
      titlePlaceholder: 'Title',
      descriptionPlaceholder: 'Description',
      highPriority: 'High priority',
      mediumPriority: 'Medium priority',
      lowPriority: 'Low priority',
      creating: 'Creating...',
      create: 'Create',
      noGroupSelected: 'No group selected — select at least one group before creating a task.',
      endDate: 'End Date',
      recurrenceLabel: 'Recurrence',
      recurrenceHelp: 'Define if this task should repeat automatically',
      noRecurrence: 'No recurrence',
      weekly: 'Every week',
      biWeekly: 'Every 2 weeks',
      monthly: 'Every month',
      biMonthly: 'Every 2 months',
      quarterly: 'Every 3 months',
      semiAnnually: 'Every 6 months',
      yearly: 'Every year',
      custom: 'Custom',
      customWeeks: 'Number of weeks',
      customWeeksHelp: 'Enter the number of weeks between each recurrence',
      recurrenceEndDate: 'Recurrence end date (optional)',
      recurrenceEndDateHelp: 'Leave blank for infinite recurrence',
    },
    calendar: {
      title: 'Calendar',
      today: 'Today',
      week: 'Week',
      month: 'Month',
      viewFullCalendar: 'View Full Calendar',
      weekOf: 'Week of',
      noTask: 'No task',
      taskCount: 'task',
      thisWeek: 'this week',
      thisMonth: 'this month',
      tasksOf: 'Tasks of',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    },
    reports: {
      title: 'Reports and Statistics',
      subtitle: 'Select a report to view detailed statistics',
      errorLoading: 'Error loading statistics',
      calendarProposal: 'Calendar Proposal',
      calendarProposalDesc: 'Automatically generate an optimized calendar',
      globalCalendar: 'Global Calendar',
      globalCalendarDesc: 'Global view of tasks and assignments',
      taskReport: 'Task Report',
      taskReportDesc: 'Task statistics',
      userReport: 'User Report',
      userReportDesc: 'User overview',
      groupReport: 'Group Report',
      groupReportDesc: 'Group analysis',
      availabilityReport: 'Availability Report',
      availabilityReportDesc: 'Availability statistics',
      totalTasks: 'Total Tasks',
      completedTasks: 'Completed Tasks',
      tasksInProgress: 'Tasks in Progress',
      priorityDistribution: 'Priority Distribution',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      roleDistribution: 'Role Distribution',
      owner: 'Owner',
      admin: 'Admin',
      user: 'User',
      totalGroups: 'Total Groups',
      averageMembers: 'Average Members',
      mostActiveGroup: 'Most Active Group',
      totalAvailabilities: 'Total Availabilities',
      averageDuration: 'Average Duration',
      mostAvailableDay: 'Most Available Day',
      noData: 'No data',
      noGroup: 'No group',
    },
    unavailabilities: {
      title: 'Unavailabilities',
      reminder: 'Unavailability Reminder',
      upToDate: 'Unavailabilities up to date',
      actionRequired: 'Action Required',
      updateNow: 'Update Now',
      enterNow: 'Enter Now',
      daysRemaining: 'days remaining',
      enterUnavailabilities: 'Enter your unavailabilities',
      updateUnavailabilities: 'Update your unavailabilities',
      nextUpdateIn: 'Next update in',
      manageUnavailabilities: 'Manage my unavailabilities',
      myUnavailabilities: 'My Unavailabilities',
      manageAllUnavailabilities: 'Manage Unavailabilities',
      selectUser: 'Select a user',
      unavailable: 'Unavailable',
      selected: 'Selected unavailability',
      close: 'Close',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this unavailability?',
      added: 'Unavailability added successfully',
      updated: 'Unavailability updated successfully',
      deleted: 'Unavailability deleted successfully',
      errorAdding: 'Error adding unavailability',
      errorUpdating: 'Error updating unavailability',
      errorDeleting: 'Error deleting unavailability',
      errorLoading: 'Error loading unavailabilities',
      readOnlyMode: 'Read-only mode',
      readOnlyMessage: 'You cannot modify unavailabilities',
      day: 'Day',
    },
    notifications: {
      unavailabilitiesNotEntered: 'Remember to enter your unavailabilities to facilitate planning.',
      updateRequiredToday: 'Your unavailabilities must be updated today.',
      reminderUpdateSoon: 'Remember to update your unavailabilities',
      daysLeft: 'days left',
    },
  },
  'en-US': {
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      groups: 'Groups',
      calendar: 'Calendar',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      close: 'Close',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      name: 'Name',
      description: 'Description',
      actions: 'Actions',
    },
    auth: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      createAccount: 'Create Account',
      backToLogin: 'Back to Login',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      sendResetLink: 'Send Reset Link',
      createAccountTitle: 'Create Account',
      resetPasswordTitle: 'Reset Password',
      loginTitle: 'Login to your account',
      loading: 'Loading...',
      passwordResetSent: 'Password reset email sent',
      accountCreated: 'Account created successfully! You can now log in.',
      accountCreatedConfirm: 'Account created! Check your email to confirm your account.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your profile and preferences.',
      profile: 'Profile Information',
      preferences: 'Preferences',
      language: 'Language',
      notifications: 'Notifications',
      timezone: 'Time Zone',
      fullName: 'Full Name',
      role: 'Role',
      changePassword: 'Change Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      receiveNotifications: 'Receive notifications',
      selectTimezone: 'Select your time zone for displayed times.',
      saveProfile: 'Save Profile',
      savePreferences: 'Save Preferences',
      save: 'Save',
      saving: 'Saving...',
      savedSuccessfully: 'Settings saved successfully',
      profileSaved: 'Profile updated successfully',
      preferencesSaved: 'Preferences saved',
      profileInfo: 'Profile Information',
      leaveBlankNoChange: 'Leave blank to keep unchanged',
      chooseLanguage: 'Choose the interface language.',
      manageNotifications: 'Manage email and in-app notifications.',
    },
    dashboard: {
      upcomingTasks: 'Upcoming Tasks',
      calendarProposal: 'Calendar Proposal',
      noTasks: 'No upcoming tasks',
      viewAllTasks: 'View all tasks',
      viewAllGroups: 'View all groups',
      weekOf: 'Week of',
      accept: 'Accept',
      regenerate: 'Regenerate',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      myGroups: 'My Groups',
      createGroup: 'Create Group',
      seeAll: 'See all',
      member: 'member',
      members: 'members',
      seeDetails: 'See details',
      noGroupMember: 'You are not a member of any group',
      createOrJoinGroup: 'Create or join a group',
    },
    groups: {
      title: 'My Groups',
      createGroup: 'New Group',
      editGroup: 'Edit Group',
      deleteGroup: 'Delete',
      groupName: 'Group Name',
      members: 'Members',
      tasks: 'Tasks',
      taskCount: 'task',
      createdAt: 'Created on',
      unavailabilityFrequency: 'Unavailability Update Frequency',
      frequencyDescription: 'Members will need to update their unavailabilities according to this frequency',
      confirmDelete: 'Confirm Deletion',
      deleteWarning: 'Are you sure you want to delete this group',
      everyWeek: 'Every week',
      every2Weeks: 'Every 2 weeks',
      everyMonth: 'Every month (4 weeks)',
      every2Months: 'Every 2 months (8 weeks)',
      every3Months: 'Every 3 months (12 weeks)',
      every6Months: 'Every 6 months (24 weeks)',
      everyYear: 'Every year (52 weeks)',
      manageMembers: 'Manage Members',
      newGroup: 'New Group',
      noGroups: 'No groups',
      noGroupsMessage: 'Start by creating your first group',
      description: 'Description',
      deleting: 'Deleting...',
      groupNamePlaceholder: 'Group Name',
      descriptionOptional: 'Description (optional)',
      frequencyLabel: 'Unavailability Update Frequency',
      frequencyHelp: 'Members will need to update their unavailabilities according to this frequency',
      customWeeks: 'Number of weeks',
      customWeeksHelp: 'Enter the number of weeks (1 to 104)',
      creating: 'Creating...',
      create: 'Create',
      groupNameRequired: 'Group name is required',
    },
    tasks: {
      title: 'Tasks',
      createTask: 'Create Task',
      editTask: 'Edit Task',
      deleteTask: 'Delete Task',
      taskName: 'Task Name',
      dueDate: 'Due Date',
      assignedTo: 'Assigned To',
      status: 'Status',
      priority: 'Priority',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      management: 'Task Management',
      newTask: 'New Task',
      noTasks: 'No tasks',
      noTasksMessage: 'No tasks have been created yet.',
      group: 'Group',
      unknownGroup: 'Unknown group',
      startDate: 'Start Date',
      duration: 'Duration',
      minutes: 'minutes',
      modify: 'Modify',
      deleting: 'Deleting...',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this task? This action is irreversible.',
      deleteSuccess: 'Task deleted successfully',
      deleteError: 'Error deleting task',
      associatedGroups: 'Associated Groups',
      noGroupAvailable: 'No group available',
      atLeastOneGroup: 'At least one group must be selected',
      titlePlaceholder: 'Title',
      descriptionPlaceholder: 'Description',
      highPriority: 'High priority',
      mediumPriority: 'Medium priority',
      lowPriority: 'Low priority',
      creating: 'Creating...',
      create: 'Create',
      noGroupSelected: 'No group selected — select at least one group before creating a task.',
      endDate: 'End Date',
      recurrenceLabel: 'Recurrence',
      recurrenceHelp: 'Define if this task should repeat automatically',
      noRecurrence: 'No recurrence',
      weekly: 'Every week',
      biWeekly: 'Every 2 weeks',
      monthly: 'Every month',
      biMonthly: 'Every 2 months',
      quarterly: 'Every 3 months',
      semiAnnually: 'Every 6 months',
      yearly: 'Every year',
      custom: 'Custom',
      customWeeks: 'Number of weeks',
      customWeeksHelp: 'Enter the number of weeks between each recurrence',
      recurrenceEndDate: 'Recurrence end date (optional)',
      recurrenceEndDateHelp: 'Leave blank for infinite recurrence',
    },
    calendar: {
      title: 'Calendar',
      today: 'Today',
      week: 'Week',
      month: 'Month',
      viewFullCalendar: 'View Full Calendar',
      weekOf: 'Week of',
      noTask: 'No task',
      taskCount: 'task',
      thisWeek: 'this week',
      thisMonth: 'this month',
      tasksOf: 'Tasks of',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    },
    reports: {
      title: 'Reports and Statistics',
      subtitle: 'Select a report to view detailed statistics',
      errorLoading: 'Error loading statistics',
      calendarProposal: 'Calendar Proposal',
      calendarProposalDesc: 'Automatically generate an optimized calendar',
      globalCalendar: 'Global Calendar',
      globalCalendarDesc: 'Global view of tasks and assignments',
      taskReport: 'Task Report',
      taskReportDesc: 'Task statistics',
      userReport: 'User Report',
      userReportDesc: 'User overview',
      groupReport: 'Group Report',
      groupReportDesc: 'Group analysis',
      availabilityReport: 'Availability Report',
      availabilityReportDesc: 'Availability statistics',
      totalTasks: 'Total Tasks',
      completedTasks: 'Completed Tasks',
      tasksInProgress: 'Tasks in Progress',
      priorityDistribution: 'Priority Distribution',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      roleDistribution: 'Role Distribution',
      owner: 'Owner',
      admin: 'Admin',
      user: 'User',
      totalGroups: 'Total Groups',
      averageMembers: 'Average Members',
      mostActiveGroup: 'Most Active Group',
      totalAvailabilities: 'Total Availabilities',
      averageDuration: 'Average Duration',
      mostAvailableDay: 'Most Available Day',
      noData: 'No data',
      noGroup: 'No group',
    },
    unavailabilities: {
      title: 'Unavailabilities',
      reminder: 'Unavailability Reminder',
      upToDate: 'Unavailabilities up to date',
      actionRequired: 'Action Required',
      updateNow: 'Update Now',
      enterNow: 'Enter Now',
      daysRemaining: 'days remaining',
      enterUnavailabilities: 'Enter your unavailabilities',
      updateUnavailabilities: 'Update your unavailabilities',
      nextUpdateIn: 'Next update in',
      manageUnavailabilities: 'Manage my unavailabilities',
      myUnavailabilities: 'My Unavailabilities',
      manageAllUnavailabilities: 'Manage Unavailabilities',
      selectUser: 'Select a user',
      unavailable: 'Unavailable',
      selected: 'Selected unavailability',
      close: 'Close',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this unavailability?',
      added: 'Unavailability added successfully',
      updated: 'Unavailability updated successfully',
      deleted: 'Unavailability deleted successfully',
      errorAdding: 'Error adding unavailability',
      errorUpdating: 'Error updating unavailability',
      errorDeleting: 'Error deleting unavailability',
      errorLoading: 'Error loading unavailabilities',
      readOnlyMode: 'Read-only mode',
      readOnlyMessage: 'You cannot modify unavailabilities',
      day: 'Day',
    },
    notifications: {
      unavailabilitiesNotEntered: 'Remember to enter your unavailabilities to facilitate planning.',
      updateRequiredToday: 'Your unavailabilities must be updated today.',
      reminderUpdateSoon: 'Remember to update your unavailabilities',
      daysLeft: 'days left',
    },
  },
  es: {
    nav: {
      dashboard: 'Panel de control',
      tasks: 'Tareas',
      groups: 'Grupos',
      calendar: 'Calendario',
      reports: 'Informes',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      close: 'Cerrar',
      confirm: 'Confirmar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      name: 'Nombre',
      description: 'Descripción',
      actions: 'Acciones',
    },
    auth: {
      login: 'Iniciar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar sesión',
      signOut: 'Cerrar sesión',
      createAccount: 'Crear cuenta',
      backToLogin: 'Volver al inicio de sesión',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer contraseña',
      sendResetLink: 'Enviar enlace',
      createAccountTitle: 'Crear cuenta',
      resetPasswordTitle: 'Restablecer contraseña',
      loginTitle: 'Iniciar sesión en tu cuenta',
      loading: 'Cargando...',
      passwordResetSent: 'Correo de restablecimiento enviado',
      accountCreated: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.',
      accountCreatedConfirm: '¡Cuenta creada! Verifica tu correo para confirmar tu cuenta.',
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Gestiona tu perfil y preferencias.',
      profile: 'Información del perfil',
      preferences: 'Preferencias',
      language: 'Idioma',
      notifications: 'Notificaciones',
      timezone: 'Zona horaria',
      fullName: 'Nombre completo',
      role: 'Rol',
      changePassword: 'Cambiar contraseña',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar nueva contraseña',
      receiveNotifications: 'Recibir notificaciones',
      selectTimezone: 'Selecciona tu zona horaria para las horas mostradas.',
      saveProfile: 'Guardar perfil',
      savePreferences: 'Guardar preferencias',
      save: 'Guardar',
      saving: 'Guardando...',
      savedSuccessfully: 'Configuración guardada correctamente',
      profileSaved: 'Perfil actualizado correctamente',
      preferencesSaved: 'Preferencias guardadas',
      profileInfo: 'Información del perfil',
      leaveBlankNoChange: 'Dejar en blanco para no cambiar',
      chooseLanguage: 'Elige el idioma de la interfaz.',
      manageNotifications: 'Gestionar notificaciones por correo electrónico y en la aplicación.',
    },
    dashboard: {
      upcomingTasks: 'Tareas Próximas',
      calendarProposal: 'Propuesta de Calendario',
      noTasks: 'Sin tareas próximas',
      viewAllTasks: 'Ver todas las tareas',
      viewAllGroups: 'Ver todos los grupos',
      weekOf: 'Semana del',
      accept: 'Aceptar',
      regenerate: 'Regenerar',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      myGroups: 'Mis Grupos',
      createGroup: 'Crear Grupo',
      seeAll: 'Ver todos',
      member: 'miembro',
      members: 'miembros',
      seeDetails: 'Ver detalles',
      noGroupMember: 'No eres miembro de ningún grupo',
      createOrJoinGroup: 'Crear o unirse a un grupo',
    },
    groups: {
      title: 'Mis Grupos',
      createGroup: 'Nuevo Grupo',
      editGroup: 'Editar Grupo',
      deleteGroup: 'Eliminar',
      groupName: 'Nombre del Grupo',
      members: 'Miembros',
      tasks: 'Tareas',
      taskCount: 'tarea',
      createdAt: 'Creado el',
      unavailabilityFrequency: 'Frecuencia de Actualización de Indisponibilidades',
      frequencyDescription: 'Los miembros deberán actualizar sus indisponibilidades según esta frecuencia',
      confirmDelete: 'Confirmar Eliminación',
      deleteWarning: '¿Está seguro de que desea eliminar este grupo',
      everyWeek: 'Cada semana',
      every2Weeks: 'Cada 2 semanas',
      everyMonth: 'Cada mes (4 semanas)',
      every2Months: 'Cada 2 meses (8 semanas)',
      every3Months: 'Cada 3 meses (12 semanas)',
      every6Months: 'Cada 6 meses (24 semanas)',
      everyYear: 'Cada año (52 semanas)',
      manageMembers: 'Gestionar Miembros',
      newGroup: 'Nuevo Grupo',
      noGroups: 'Sin grupos',
      noGroupsMessage: 'Comienza creando tu primer grupo',
      description: 'Descripción',
      deleting: 'Eliminando...',
      groupNamePlaceholder: 'Nombre del Grupo',
      descriptionOptional: 'Descripción (opcional)',
      frequencyLabel: 'Frecuencia de Actualización de Indisponibilidades',
      frequencyHelp: 'Los miembros deberán actualizar sus indisponibilidades según esta frecuencia',
      customWeeks: 'Número de semanas',
      customWeeksHelp: 'Ingrese el número de semanas (1 a 104)',
      creating: 'Creando...',
      create: 'Crear',
      groupNameRequired: 'El nombre del grupo es obligatorio',
    },
    tasks: {
      title: 'Tareas',
      createTask: 'Crear tarea',
      editTask: 'Editar tarea',
      deleteTask: 'Eliminar tarea',
      taskName: 'Nombre de la tarea',
      dueDate: 'Fecha de vencimiento',
      assignedTo: 'Asignado a',
      status: 'Estado',
      priority: 'Prioridad',
      pending: 'Pendiente',
      inProgress: 'En curso',
      completed: 'Completado',
      management: 'Gestión de tareas',
      newTask: 'Nueva tarea',
      noTasks: 'Sin tareas',
      noTasksMessage: 'No se ha creado ninguna tarea por el momento.',
      group: 'Grupo',
      unknownGroup: 'Grupo desconocido',
      startDate: 'Fecha de inicio',
      duration: 'Duración',
      minutes: 'minutos',
      modify: 'Modificar',
      deleting: 'Eliminando...',
      confirmDelete: 'Confirmar Eliminación',
      confirmDeleteMessage: '¿Está seguro de que desea eliminar esta tarea? Esta acción es irreversible.',
      deleteSuccess: 'Tarea eliminada correctamente',
      deleteError: 'Error al eliminar tarea',
      associatedGroups: 'Grupos Asociados',
      noGroupAvailable: 'Ningún grupo disponible',
      atLeastOneGroup: 'Debe seleccionarse al menos un grupo',
      titlePlaceholder: 'Título',
      descriptionPlaceholder: 'Descripción',
      highPriority: 'Prioridad alta',
      mediumPriority: 'Prioridad media',
      lowPriority: 'Prioridad baja',
      creating: 'Creando...',
      create: 'Crear',
      noGroupSelected: 'Ningún grupo seleccionado — seleccione al menos un grupo antes de crear una tarea.',
      endDate: 'Fecha de Fin',
      recurrenceLabel: 'Repetición',
      recurrenceHelp: 'Definir si esta tarea debe repetirse automáticamente',
      noRecurrence: 'Sin repetición',
      weekly: 'Cada semana',
      biWeekly: 'Cada 2 semanas',
      monthly: 'Cada mes',
      biMonthly: 'Cada 2 meses',
      quarterly: 'Cada 3 meses',
      semiAnnually: 'Cada 6 meses',
      yearly: 'Cada año',
      custom: 'Personalizado',
      customWeeks: 'Número de semanas',
      customWeeksHelp: 'Ingrese el número de semanas entre cada repetición',
      recurrenceEndDate: 'Fecha de fin de repetición (opcional)',
      recurrenceEndDateHelp: 'Dejar en blanco para repetición infinita',
    },
    calendar: {
      title: 'Calendario',
      today: 'Hoy',
      week: 'Semana',
      month: 'Mes',
      viewFullCalendar: 'Ver calendario completo',
      weekOf: 'Semana del',
      noTask: 'Sin tarea',
      taskCount: 'tarea',
      thisWeek: 'esta semana',
      thisMonth: 'este mes',
      tasksOf: 'Tareas del',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',
    },
    reports: {
      title: 'Informes y Estadísticas',
      subtitle: 'Seleccione un informe para ver estadísticas detalladas',
      errorLoading: 'Error al cargar las estadísticas',
      calendarProposal: 'Propuesta de calendario',
      calendarProposalDesc: 'Generar automáticamente un calendario optimizado',
      globalCalendar: 'Calendario Global',
      globalCalendarDesc: 'Vista global de tareas y asignaciones',
      taskReport: 'Informe de Tareas',
      taskReportDesc: 'Estadísticas de tareas',
      userReport: 'Informe de Usuarios',
      userReportDesc: 'Vista general de usuarios',
      groupReport: 'Informe de Grupos',
      groupReportDesc: 'Análisis de grupos',
      availabilityReport: 'Informe de Disponibilidades',
      availabilityReportDesc: 'Estadísticas de disponibilidades',
      totalTasks: 'Total de Tareas',
      completedTasks: 'Tareas Completadas',
      tasksInProgress: 'Tareas en Curso',
      priorityDistribution: 'Distribución por Prioridad',
      totalUsers: 'Total de Usuarios',
      activeUsers: 'Usuarios Activos',
      roleDistribution: 'Distribución por Rol',
      owner: 'Propietario',
      admin: 'Admin',
      user: 'Usuario',
      totalGroups: 'Total de Grupos',
      averageMembers: 'Promedio de Miembros',
      mostActiveGroup: 'Grupo Más Activo',
      totalAvailabilities: 'Total de Disponibilidades',
      averageDuration: 'Duración Promedio',
      mostAvailableDay: 'Día Más Disponible',
      noData: 'Sin datos',
      noGroup: 'Sin grupo',
    },
    unavailabilities: {
      title: 'Indisponibilidades',
      reminder: 'Recordatorio de indisponibilidades',
      upToDate: 'Indisponibilidades actualizadas',
      actionRequired: 'Acción requerida',
      updateNow: 'Actualizar ahora',
      enterNow: 'Ingresar ahora',
      daysRemaining: 'días restantes',
      enterUnavailabilities: 'Ingresa tus indisponibilidades',
      updateUnavailabilities: 'Actualiza tus indisponibilidades',
      nextUpdateIn: 'Próxima actualización en',
      manageUnavailabilities: 'Gestionar mis indisponibilidades',
      myUnavailabilities: 'Mis Indisponibilidades',
      manageAllUnavailabilities: 'Gestionar Indisponibilidades',
      selectUser: 'Seleccionar un usuario',
      unavailable: 'No disponible',
      selected: 'Indisponibilidad seleccionada',
      close: 'Cerrar',
      confirmDelete: 'Confirmar Eliminación',
      confirmDeleteMessage: '¿Está seguro de que desea eliminar esta indisponibilidad?',
      added: 'Indisponibilidad agregada correctamente',
      updated: 'Indisponibilidad actualizada correctamente',
      deleted: 'Indisponibilidad eliminada correctamente',
      errorAdding: 'Error al agregar indisponibilidad',
      errorUpdating: 'Error al actualizar indisponibilidad',
      errorDeleting: 'Error al eliminar indisponibilidad',
      errorLoading: 'Error al cargar indisponibilidades',
      readOnlyMode: 'Modo de solo lectura',
      readOnlyMessage: 'No puede modificar las indisponibilidades',
      day: 'Día',
    },
    notifications: {
      unavailabilitiesNotEntered: 'Recuerda ingresar tus indisponibilidades para facilitar la planificación.',
      updateRequiredToday: 'Tus indisponibilidades deben actualizarse hoy.',
      reminderUpdateSoon: 'Recuerda actualizar tus indisponibilidades',
      daysLeft: 'días restantes',
    },
  },
};
