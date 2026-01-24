export type Language = 'fr' | 'en';

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
  };
  
  // Calendar
  calendar: {
    title: string;
    today: string;
    week: string;
    month: string;
    viewFullCalendar: string;
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
    },
    groups: {
      title: 'Groupes',
      createGroup: 'Créer un groupe',
      editGroup: 'Modifier le groupe',
      deleteGroup: 'Supprimer le groupe',
      groupName: 'Nom du groupe',
      members: 'Membres',
      tasks: 'Tâches',
      createdAt: 'Créé le',
      unavailabilityFrequency: 'Fréquence de mise à jour des indisponibilités',
      frequencyDescription: 'Les membres devront mettre à jour leurs indisponibilités selon cette fréquence',
      confirmDelete: 'Confirmer la suppression',
      deleteWarning: 'Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.',
      everyWeek: 'Chaque semaine',
      every2Weeks: 'Toutes les 2 semaines',
      everyMonth: 'Chaque mois (4 semaines)',
      every2Months: 'Tous les 2 mois (8 semaines)',
      every3Months: 'Tous les 3 mois (12 semaines)',
      every6Months: 'Tous les 6 mois (24 semaines)',
      everyYear: 'Chaque année (52 semaines)',
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
    },
    calendar: {
      title: 'Calendrier',
      today: 'Aujourd\'hui',
      week: 'Semaine',
      month: 'Mois',
      viewFullCalendar: 'Voir le calendrier complet',
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
    },
    groups: {
      title: 'Groups',
      createGroup: 'Create Group',
      editGroup: 'Edit Group',
      deleteGroup: 'Delete Group',
      groupName: 'Group Name',
      members: 'Members',
      tasks: 'Tasks',
      createdAt: 'Created on',
      unavailabilityFrequency: 'Unavailability Update Frequency',
      frequencyDescription: 'Members will need to update their unavailabilities according to this frequency',
      confirmDelete: 'Confirm Deletion',
      deleteWarning: 'Are you sure you want to delete this group? This action is irreversible.',
      everyWeek: 'Every week',
      every2Weeks: 'Every 2 weeks',
      everyMonth: 'Every month (4 weeks)',
      every2Months: 'Every 2 months (8 weeks)',
      every3Months: 'Every 3 months (12 weeks)',
      every6Months: 'Every 6 months (24 weeks)',
      everyYear: 'Every year (52 weeks)',
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
    },
    calendar: {
      title: 'Calendar',
      today: 'Today',
      week: 'Week',
      month: 'Month',
      viewFullCalendar: 'View Full Calendar',
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
    },
    notifications: {
      unavailabilitiesNotEntered: 'Remember to enter your unavailabilities to facilitate planning.',
      updateRequiredToday: 'Your unavailabilities must be updated today.',
      reminderUpdateSoon: 'Remember to update your unavailabilities',
      daysLeft: 'days left',
    },
  },
};
