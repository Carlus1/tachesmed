-- ==========================================
-- FIX v2: Nettoyer et recréer politiques group_members
-- ==========================================

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "group_members_user" ON group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;
DROP POLICY IF EXISTS "group_members_access" ON group_members;
DROP POLICY IF EXISTS "Users can view all members of their groups" ON group_members;
DROP POLICY IF EXISTS "Admins can add members to their groups" ON group_members;
DROP POLICY IF EXISTS "Admins can remove members from their groups" ON group_members;

-- Recréer politique SELECT simple et correcte:
-- Un utilisateur peut voir TOUS les membres de TOUS ses groupes
CREATE POLICY "view_group_members"
ON group_members
FOR SELECT
USING (
  -- Soit c'est une ligne où je suis membre
  user_id = auth.uid()
  OR
  -- Soit c'est une ligne d'un groupe dont je suis membre
  EXISTS (
    SELECT 1 
    FROM group_members my_groups
    WHERE my_groups.user_id = auth.uid()
    AND my_groups.group_id = group_members.group_id
  )
);

-- Politique INSERT/UPDATE/DELETE pour admins et owners
CREATE POLICY "manage_group_members"
ON group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'owner'
  )
  OR
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.admin_id = auth.uid()
  )
);

-- Vérification
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lecture'
    WHEN cmd = 'ALL' THEN 'Toutes opérations'
    ELSE cmd
  END as description
FROM pg_policies
WHERE tablename = 'group_members'
ORDER BY cmd;
