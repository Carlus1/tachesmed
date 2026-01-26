-- Voir la contrainte recurrence_type
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname LIKE '%recurrence%'
  AND conrelid = 'tasks'::regclass;
