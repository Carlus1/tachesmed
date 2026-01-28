-- ==========================================
-- FIX: Politique RLS pour group_members
-- ==========================================
-- Permettre aux utilisateurs de voir tous les membres de leurs groupes

-- 1. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- 2. Activer RLS si pas déjà fait
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 3. Créer la politique de lecture: 
-- Un utilisateur peut voir tous les membres des groupes dont il est membre
CREATE POLICY "Users can view all members of their groups"
ON group_members
FOR SELECT
USING (
  group_id IN (
    SELECT gm.group_id 
    FROM group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- 4. Politique d'insertion (seulement pour owners et admins du groupe)
CREATE POLICY "Admins can add members to their groups"
ON group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_id
    AND (
      g.admin_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'owner'
      )
    )
  )
);

-- 5. Politique de suppression (seulement pour owners et admins du groupe)
CREATE POLICY "Admins can remove members from their groups"
ON group_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_id
    AND (
      g.admin_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'owner'
      )
    )
  )
);

-- 6. Vérification
SELECT 
  'group_members RLS policies' as table_name,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'group_members';
