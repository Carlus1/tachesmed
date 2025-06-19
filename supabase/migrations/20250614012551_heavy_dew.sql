/*
  # Fix Security Definer View

  1. Changes
    - Drop existing view with SECURITY DEFINER property
    - Recreate the view with default SECURITY INVOKER property
    - Maintain the same functionality for debugging availability access

  2. Security
    - Remove potential security risk from SECURITY DEFINER
    - Ensure view operates with proper permissions
*/

-- Drop existing view
DROP VIEW IF EXISTS availability_access_debug;

-- Recreate view with SECURITY INVOKER (default)
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