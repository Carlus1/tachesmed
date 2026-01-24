# Migration: Ajout de la répétition des tâches

## Date
24 janvier 2026

## Objectif
Ajouter la fonctionnalité de répétition des tâches, permettant aux tâches de se répéter automatiquement (hebdomadaire, bi-hebdomadaire, mensuel, etc.).

## Fichier de migration
`supabase/migrations/20260124_add_task_recurrence.sql`

## Changements effectués

### 1. Base de données
- Ajout de 3 nouvelles colonnes à la table `tasks`:
  - `recurrence_type` (VARCHAR): Type de répétition (none, weekly, bi-weekly, monthly, bi-monthly, quarterly, semi-annually, yearly, custom)
  - `recurrence_interval` (INTEGER): Nombre de semaines entre chaque répétition (utilisé quand recurrence_type = 'custom')
  - `recurrence_end_date` (TIMESTAMPTZ): Date de fin optionnelle pour la répétition

- Index créés pour optimiser les requêtes:
  - `idx_tasks_recurrence_type`: Index sur les tâches récurrentes
  - `idx_tasks_recurrence_end_date`: Index sur la date de fin de récurrence

### 2. Interface utilisateur (TaskModal)
- Ajout d'un sélecteur de type de répétition
- Champ personnalisé pour définir le nombre de semaines (si type = 'custom')
- Champ optionnel pour la date de fin de répétition
- Interface traduite en 4 langues (FR, EN, EN-US, ES)

### 3. Traductions
Ajout des clés de traduction dans les 4 langues:
- `recurrenceLabel`, `recurrenceHelp`
- `noRecurrence`, `weekly`, `biWeekly`, `monthly`, `biMonthly`, `quarterly`, `semiAnnually`, `yearly`, `custom`
- `customWeeks`, `customWeeksHelp`
- `recurrenceEndDate`, `recurrenceEndDateHelp`

## Application de la migration

### Via Supabase Dashboard
1. Se connecter au projet Supabase
2. Aller dans SQL Editor
3. Copier le contenu de `supabase/migrations/20260124_add_task_recurrence.sql`
4. Exécuter la requête

### Via CLI Supabase (si configuré)
```bash
supabase db push
```

## Validation

Après application de la migration, vérifier:
1. Les colonnes `recurrence_type`, `recurrence_interval`, `recurrence_end_date` existent dans la table `tasks`
2. Les index `idx_tasks_recurrence_type` et `idx_tasks_recurrence_end_date` sont créés
3. La création/modification de tâches avec répétition fonctionne correctement
4. Les traductions s'affichent correctement dans les 4 langues

## Fonctionnement

### Types de répétition disponibles
- **Pas de répétition** (none): Tâche unique (par défaut)
- **Chaque semaine** (weekly): Se répète toutes les semaines
- **Toutes les 2 semaines** (bi-weekly): Se répète toutes les 2 semaines
- **Chaque mois** (monthly): Se répète tous les mois (4 semaines)
- **Tous les 2 mois** (bi-monthly): Se répète tous les 2 mois
- **Tous les 3 mois** (quarterly): Se répète tous les 3 mois
- **Tous les 6 mois** (semi-annually): Se répète tous les 6 mois
- **Chaque année** (yearly): Se répète tous les ans
- **Personnalisé** (custom): Définir un intervalle personnalisé en semaines

### Utilisation
1. Lors de la création/modification d'une tâche, sélectionner un type de répétition
2. Si "Personnalisé" est sélectionné, entrer le nombre de semaines entre chaque répétition
3. Optionnel: Définir une date de fin de répétition (sinon, la tâche se répète indéfiniment)

## Notes techniques
- La répétition est stockée dans la base de données mais la génération des occurrences futures devra être implémentée ultérieurement
- Pour l'instant, seuls les champs sont sauvegardés, la logique de génération des tâches récurrentes sera ajoutée dans une prochaine itération
- La colonne `recurrence_type` a une contrainte CHECK pour valider les valeurs acceptées
