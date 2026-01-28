-- ==========================================
-- URGENCE: Désactiver RLS sur group_members
-- ==========================================
-- Restaurer l'accès complet temporairement

ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS activé"
FROM pg_tables
WHERE tablename = 'group_members';
