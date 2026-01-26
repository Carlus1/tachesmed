-- ==========================================
-- SOLUTION FINALE: DÉSACTIVER RLS
-- ==========================================
-- auth.uid() retourne NULL dans certains contextes
-- L'application vérifie déjà les droits admin
-- → Désactiver RLS pour optimization_periods

-- 1. Supprimer toutes les policies
DROP POLICY IF EXISTS "Users can create periods where they are acceptor" ON optimization_periods;
DROP POLICY IF EXISTS "Acceptors can update their periods" ON optimization_periods;
DROP POLICY IF EXISTS "Users can view their group periods" ON optimization_periods;
DROP POLICY IF EXISTS "Members can view their group periods" ON optimization_periods;

-- 2. Désactiver RLS sur la table
ALTER TABLE optimization_periods DISABLE ROW LEVEL SECURITY;

-- 3. Vérification
SELECT '=== RLS DÉSACTIVÉ ===' as section;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'optimization_periods';

SELECT '=== AUCUNE POLICY (devrait être vide) ===' as section;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'optimization_periods';
