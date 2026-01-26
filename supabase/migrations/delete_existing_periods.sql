-- ==========================================
-- SUPPRIMER LES PÉRIODES ET INSTANCES EXISTANTES
-- ==========================================

-- 1. Voir vos périodes existantes
SELECT 
  '=== VOS PÉRIODES ACTIVES ===' as section;

SELECT 
  id,
  group_id,
  start_date::date as debut,
  end_date::date as fin,
  total_tasks,
  assigned_tasks,
  created_at::date as cree_le
FROM optimization_periods
WHERE status = 'active'
ORDER BY created_at DESC;

-- 2. Supprimer TOUTES les périodes actives
DELETE FROM optimization_periods WHERE status = 'active';

-- 3. Voir le nombre d'instances de tâches
SELECT 
  '=== INSTANCES DE TÂCHES ===' as section;

SELECT COUNT(*) as nb_instances 
FROM tasks 
WHERE parent_task_id IS NOT NULL;

-- 4. Supprimer TOUTES les instances de tâches récurrentes
DELETE FROM tasks WHERE parent_task_id IS NOT NULL;

-- 5. Vérification finale
SELECT 
  '=== VÉRIFICATION FINALE ===' as section;

SELECT 
  COUNT(*) as nb_periodes_actives 
FROM optimization_periods 
WHERE status = 'active';

SELECT 
  COUNT(*) as nb_instances_restantes 
FROM tasks 
WHERE parent_task_id IS NOT NULL;

SELECT 
  COUNT(*) as nb_taches_parent 
FROM tasks 
WHERE parent_task_id IS NULL;
