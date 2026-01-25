# Maintenance des Tâches Récurrentes

## Vue d'ensemble

Le système génère automatiquement des instances de tâches récurrentes et gère leur cycle de vie pour optimiser les performances.

## Limites et Nettoyage

### Génération d'instances
- **Maximum futur**: 1 an à partir de la date actuelle
- **Instances générées**: Tâches indépendantes avec `parent_task_id` et `occurrence_date`

### Nettoyage automatique
- **Conservation**: 12 mois dans le passé
- **Critères de suppression**: Instances terminées ou annulées de plus d'1 an
- **Fréquence**: Automatique à chaque connexion utilisateur

## Fonctions SQL Disponibles

### 1. Générer les instances d'une tâche
```sql
SELECT generate_recurring_task_instances(
  '<task_id>'::UUID,
  '2027-01-24'::TIMESTAMP  -- Date de fin optionnelle
);
```

### 2. Nettoyer les anciennes instances
```sql
SELECT cleanup_old_task_instances();
```
Retourne le nombre d'instances supprimées.

### 3. Maintenance complète (recommandé)
```sql
SELECT * FROM maintain_recurring_tasks();
```
Retourne: `{ cleaned: N, regenerated: M }`

## Maintenance Manuelle

### Via l'interface administrateur
L'application effectue automatiquement la maintenance au démarrage.

### Via SQL (pour les admins DB)
Pour forcer une maintenance complète :

```sql
-- Voir le statut actuel
SELECT 
  COUNT(*) FILTER (WHERE parent_task_id IS NOT NULL) as instances,
  COUNT(*) FILTER (WHERE parent_task_id IS NULL AND recurrence_type IS NOT NULL) as recurring_parents
FROM tasks;

-- Lancer la maintenance
SELECT * FROM maintain_recurring_tasks();
```

### Planification périodique (Supabase)
Pour automatiser via pg_cron (si disponible) :

```sql
-- Exécuter tous les jours à 2h du matin
SELECT cron.schedule(
  'maintain-recurring-tasks',
  '0 2 * * *',
  'SELECT maintain_recurring_tasks()'
);
```

## Monitoring

### Vérifier le nombre d'instances
```sql
SELECT 
  t.title as tache_parent,
  COUNT(i.id) as nb_instances,
  MIN(i.occurrence_date) as premiere_occurrence,
  MAX(i.occurrence_date) as derniere_occurrence
FROM tasks t
LEFT JOIN tasks i ON i.parent_task_id = t.id
WHERE t.parent_task_id IS NULL 
  AND t.recurrence_type IS NOT NULL
GROUP BY t.id, t.title
ORDER BY nb_instances DESC;
```

### Identifier les anciennes instances à nettoyer
```sql
SELECT 
  title,
  occurrence_date,
  status,
  EXTRACT(days FROM CURRENT_DATE - occurrence_date) as jours_passes
FROM tasks
WHERE parent_task_id IS NOT NULL
  AND occurrence_date < CURRENT_DATE - INTERVAL '1 year'
  AND status IN ('completed', 'cancelled')
ORDER BY occurrence_date;
```

## Performance

### Index créés
- `idx_tasks_parent_task_id`: Accès rapide aux instances d'une tâche
- `idx_tasks_occurrence_date`: Filtrage par date d'occurrence

### Recommandations
- La maintenance automatique s'exécute en arrière-plan sans bloquer l'UI
- Pour de très gros volumes, envisager une maintenance nocturne via cron
- Surveiller la taille de la table `tasks` mensuellement

## Dépannage

### Les instances ne se génèrent pas
1. Vérifier que `recurrence_type` n'est pas NULL ou 'none'
2. Vérifier la `recurrence_end_date` (doit être future ou NULL)
3. Exécuter manuellement: `SELECT generate_recurring_task_instances('<task_id>')`

### Trop d'instances anciennes
Exécuter manuellement le nettoyage:
```sql
SELECT cleanup_old_task_instances();
```

### Performance dégradée
```sql
-- Vérifier le nombre total d'instances
SELECT COUNT(*) FROM tasks WHERE parent_task_id IS NOT NULL;

-- Si > 10,000, considérer réduire la fenêtre de génération future
-- ou augmenter la fréquence de nettoyage
```
