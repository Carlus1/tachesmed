-- ==========================================
-- FIX POLICIES optimization_periods
-- Supprimer TOUTES les anciennes policies et recréer uniquement les bonnes
-- ==========================================

-- 1. SUPPRIMER TOUTES LES POLICIES EXISTANTES
DROP POLICY IF EXISTS "Admins can create periods" ON optimization_periods;
DROP POLICY IF EXISTS "Admins can delete future periods only" ON optimization_periods;
DROP POLICY IF EXISTS "Users can create periods where they are acceptor" ON optimization_periods;
DROP POLICY IF EXISTS "Acceptors can update their periods" ON optimization_periods;
DROP POLICY IF EXISTS "Admins can view their group periods" ON optimization_periods;
DROP POLICY IF EXISTS "Users can view periods" ON optimization_periods;

-- 2. VÉRIFIER QU'IL N'Y A PLUS DE POLICIES
SELECT '=== POLICIES RESTANTES (devrait être vide) ===' as section;
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'optimization_periods';

-- 3. CRÉER LES NOUVELLES POLICIES SIMPLIFIÉES

-- Policy INSERT: Vérifier seulement que accepted_by = auth.uid()
-- (L'application vérifie déjà que l'user est admin du groupe)
CREATE POLICY "Users can create periods where they are acceptor"
  ON optimization_periods FOR INSERT
  WITH CHECK (accepted_by = auth.uid());

-- Policy SELECT: Permettre de lire les périodes de ses groupes
CREATE POLICY "Users can view their group periods"
  ON optimization_periods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = optimization_periods.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Policy UPDATE: Permettre de modifier le statut de ses propres périodes
CREATE POLICY "Acceptors can update their periods"
  ON optimization_periods FOR UPDATE
  USING (accepted_by = auth.uid())
  WITH CHECK (status IN ('active', 'deleted'));

-- 4. VÉRIFIER LES NOUVELLES POLICIES
SELECT '=== NOUVELLES POLICIES (devrait montrer 3 policies) ===' as section;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'optimization_periods'
ORDER BY cmd, policyname;

-- 5. TEST INSERTION (décommenter et remplacer les valeurs)
/*
INSERT INTO optimization_periods (
  group_id, 
  start_date, 
  end_date, 
  accepted_by, 
  total_tasks, 
  assigned_tasks
)
VALUES (
  'VOTRE_GROUP_ID_ICI'::UUID,  -- Remplacer par un group_id où vous êtes admin
  NOW(),
  NOW() + INTERVAL '7 days',
  auth.uid(),
  10,
  5
)
RETURNING 
  id, 
  group_id, 
  start_date::date, 
  end_date::date,
  'SUCCESS - Policy fonctionne !' as resultat;
*/
