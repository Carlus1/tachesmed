# Vérification Complète - Instances de Tâches Récurrentes

## 📋 Problématique

Le système génère maintenant les instances de tâches récurrentes **en base de données** via la fonction SQL `generate_recurring_task_instances()`.

**Il ne faut PLUS** utiliser `generateRecurringOccurrences()` côté client pour afficher les tâches récurrentes.

## ✅ Composants Corrigés (Filtrage OK)

### 1. TaskList.tsx
- ✅ Filtre instances non assignées
- ✅ Affiche tâches parent + instances assignées

### 2. TaskManagement.tsx
- ✅ Filtre instances non assignées
- ✅ Affiche tâches parent + instances assignées

### 3. Dashboard.tsx
- ✅ Filtre instances non assignées
- ✅ Limite augmentée pour compenser filtrage

### 4. DashboardGrid.tsx
- ✅ Filtre instances non assignées
- ✅ Limite augmentée pour compenser filtrage

### 5. Reports.tsx
- ✅ Filtre instances non assignées dans les statistiques

### 6. CalendarView.tsx
- ✅ Filtre instances non assignées
- ✅ Masque tâches parent récurrentes
- ✅ **SUPPRIMÉ** génération client-side avec `generateRecurringOccurrences()`

## ❌ Composants À Corriger

### 7. taskScheduling.ts (GlobalCalendar)
- ❌ Utilise encore `generateRecurringOccurrences()` ligne 160
- ❌ Doit charger les instances depuis la BDD au lieu de les générer

### 8. ProposalCalendar.tsx
- ℹ️ OK - Affiche les assignments proposés (pas de requête SQL directe)

## 🎯 Règles de Filtrage Appliquées

```typescript
// Pour les LISTES de tâches
const filteredTasks = (data || []).filter(task => 
  task.parent_task_id === null ||  // Tâches parent (toutes)
  task.assigned_to !== null         // Instances assignées
);

// Pour le CALENDRIER
const filteredTasks = (data || []).filter(task => {
  // Instance assignée → AFFICHER
  if (task.parent_task_id !== null && task.assigned_to !== null) {
    return true;
  }
  
  // Instance non assignée → MASQUER
  if (task.parent_task_id !== null && task.assigned_to === null) {
    return false;
  }
  
  // Tâche parent non récurrente → AFFICHER
  if (task.parent_task_id === null && 
      (!task.recurrence_type || task.recurrence_type === 'none')) {
    return true;
  }
  
  // Tâche parent récurrente → MASQUER (on affiche ses instances)
  return false;
});
```

## 🔄 Workflow Complet

1. **Création tâche récurrente** : Tâche parent créée avec `recurrence_type`
2. **Trigger automatique** : SQL génère instances avec `parent_task_id` renseigné
3. **Affichage listes** : Instances masquées (non assignées)
4. **Génération optimisation** : `calendarOptimization.ts` charge instances non assignées
5. **Acceptation** : Instances deviennent `assigned`, apparaissent dans calendrier
6. **Suppression période** : Instances redeviennent `assigned_to = NULL`, disparaissent

## 📊 Requêtes SQL de Vérification

```sql
-- Vérifier structure actuelle
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN parent_task_id IS NULL THEN 1 END) as taches_parent,
  COUNT(CASE WHEN parent_task_id IS NOT NULL THEN 1 END) as instances,
  COUNT(CASE WHEN parent_task_id IS NOT NULL AND assigned_to IS NOT NULL THEN 1 END) as instances_assignees,
  COUNT(CASE WHEN parent_task_id IS NOT NULL AND assigned_to IS NULL THEN 1 END) as instances_non_assignees
FROM tasks;

-- Voir les tâches récurrentes et leurs instances
SELECT 
  t.title as tache_parent,
  t.recurrence_type,
  COUNT(i.id) as nb_instances,
  COUNT(CASE WHEN i.assigned_to IS NOT NULL THEN 1 END) as instances_assignees
FROM tasks t
LEFT JOIN tasks i ON i.parent_task_id = t.id
WHERE t.parent_task_id IS NULL 
  AND t.recurrence_type IS NOT NULL
  AND t.recurrence_type != 'none'
GROUP BY t.id, t.title, t.recurrence_type;
```

## 🚀 Prochaines Étapes

1. ✅ Nettoyer toutes les instances : `DELETE FROM tasks WHERE parent_task_id IS NOT NULL;`
2. ✅ Vérifier CalendarView ne génère plus côté client
3. ❌ **Corriger GlobalCalendar/taskScheduling** pour charger instances BDD
4. ✅ Tester génération → acceptation → affichage calendrier
5. ✅ Vérifier suppression période → désassignation → disparition calendrier
