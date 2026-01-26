-- Vérifier les tâches parent qui n'ont pas généré d'instances
SELECT 
  '=== TÂCHES SANS INSTANCES ===' as section;

SELECT 
  id,
  title,
  start_date,
  end_date,
  recurrence_type,
  recurrence_interval,
  recurrence_end_date,
  CASE 
    WHEN start_date::date > CURRENT_DATE + INTERVAL '9 weeks' THEN '⚠️ Start date APRÈS période optimisation'
    WHEN recurrence_type IS NULL OR recurrence_type = 'none' THEN '⚠️ Pas de récurrence définie'
    WHEN start_date::date > CURRENT_DATE THEN '✅ Start date dans le futur (normal pour décalage)'
    ELSE '✅ Start date OK'
  END as diagnostic
FROM tasks
WHERE parent_task_id IS NULL
  AND id IN (
    '69368d23-b749-485c-b217-0570628423a8',  -- Shawinigan
    '20d5a50c-7108-4e7d-af68-4ccc681568c5'   -- HDA
  );

-- Vérifier combien d'instances existent pour ces tâches
SELECT 
  '=== INSTANCES EXISTANTES ===' as section;

SELECT 
  parent_task_id,
  COUNT(*) as nb_instances
FROM tasks
WHERE parent_task_id IN (
  '69368d23-b749-485c-b217-0570628423a8',
  '20d5a50c-7108-4e7d-af68-4ccc681568c5'
)
GROUP BY parent_task_id;

-- Tester manuellement la génération
SELECT 
  '=== TEST GÉNÉRATION MANUELLE ===' as section;

SELECT generate_recurring_task_instances(
  '69368d23-b749-485c-b217-0570628423a8'::UUID,
  (CURRENT_DATE + INTERVAL '9 weeks')::TIMESTAMP WITH TIME ZONE
) as instances_shawinigan;

SELECT generate_recurring_task_instances(
  '20d5a50c-7108-4e7d-af68-4ccc681568c5'::UUID,
  (CURRENT_DATE + INTERVAL '9 weeks')::TIMESTAMP WITH TIME ZONE
) as instances_hda;
