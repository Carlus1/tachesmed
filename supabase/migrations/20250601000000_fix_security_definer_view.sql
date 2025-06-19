-- Supprimer la vue existante
DROP VIEW IF EXISTS availability_access_debug;

-- Recréer la vue avec SECURITY INVOKER (comportement par défaut)
CREATE OR REPLACE VIEW availability_access_debug AS
SELECT 
    t.table_name,
    p.policyname,
    p.permissive,
    p.roles,
    p.cmd,
    p.qual,
    p.with_check
FROM pg_policies p
RIGHT JOIN information_schema.tables t 
    ON t.table_name = p.tablename
WHERE t.table_name = 'availabilities';
