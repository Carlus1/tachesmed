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
    saving: string;
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
  };
  
  // Dashboard
  dashboard: {
    upcomingTasks: string;
    calendarProposal: string;
    noTasks: string;
    viewAllTasks: string;
    weekOf: string;
    accept: string;
    regenerate: string;
    high: string;
    medium: string;
    low: string;
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
      saving: 'Enregistrement...',
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
      weekOf: 'Semaine du',
      accept: 'Accepter',
      regenerate: 'Régénérer',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
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
      saving: 'Saving...',
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
      weekOf: 'Week of',
      accept: 'Accept',
      regenerate: 'Regenerate',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
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
      saving: 'Saving...',
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
      weekOf: 'Week of',
      accept: 'Accept',
      regenerate: 'Regenerate',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
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
      saving: 'Guardando...',
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
      weekOf: 'Semana del',
      accept: 'Aceptar',
      regenerate: 'Regenerar',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
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
