-- NE PAS modifier recurrence_type - la contrainte accepte 'bi-weekly'
-- La fonction a été corrigée pour accepter 'bi-weekly'

-- Vérification des tâches
SELECT 
  title,
  recurrence_type,
  '✅ OK avec tiret' as statut
FROM tasks
WHERE parent_task_id IS NULL
  AND title IN ('Shawinigan', 'HDA');

-- Régénérer les instances (la fonction accepte maintenant 'bi-weekly')
SELECT generate_recurring_task_instances(
  id,
  (CURRENT_DATE + INTERVAL '9 weeks')::TIMESTAMP WITH TIME ZONE
) as instances_generees
FROM tasks
WHERE parent_task_id IS NULL
  AND title IN ('Shawinigan', 'HDA');
