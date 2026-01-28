-- ==========================================
-- ROLLBACK: Restaurer accès group_members
-- ==========================================

-- Supprimer la politique problématique
DROP POLICY IF EXISTS "Users can view all members of their groups" ON group_members;
DROP POLICY IF EXISTS "Admins can add members to their groups" ON group_members;
DROP POLICY IF EXISTS "Admins can remove members from their groups" ON group_members;

-- Vérifier les politiques restantes
SELECT 
  'group_members RLS policies' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'group_members';
