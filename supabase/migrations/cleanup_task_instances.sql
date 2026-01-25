-- Nettoyage complet des instances de tâches récurrentes
-- À exécuter dans Supabase SQL Editor pour repartir à zéro

-- 1. Afficher le nombre d'instances à supprimer
SELECT 
  COUNT(*) as total_instances,
  COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as instances_assignees,
  COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) as instances_non_assignees
FROM tasks
WHERE parent_task_id IS NOT NULL;

-- 2. Supprimer TOUTES les instances (assignées et non assignées)
DELETE FROM tasks
WHERE parent_task_id IS NOT NULL;

-- 3. Vérifier qu'il ne reste que les tâches parent
SELECT 
  COUNT(*) as total_taches,
  COUNT(CASE WHEN recurrence_type IS NOT NULL AND recurrence_type != 'none' THEN 1 END) as taches_recurrentes
FROM tasks
WHERE parent_task_id IS NULL;

-- 4. (Optionnel) Supprimer aussi les périodes d'optimisation créées
-- Décommenter si vous voulez aussi supprimer les périodes
-- DELETE FROM optimization_periods;

-- RÉSULTAT ATTENDU:
-- Toutes les instances supprimées
-- Seules les tâches parent restent
-- Prêt pour de nouveaux tests propres
