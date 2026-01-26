-- ==========================================
-- DIAGNOSTIC ERREUR 403 RLS - VOS DONNÉES
-- ==========================================

-- 1. Récupérer votre user_id actuel (auth.uid())
SELECT '=== VOTRE USER ID ===' as section;
SELECT auth.uid() as mon_user_id;

-- 2. Récupérer vos groupes dont vous êtes admin
SELECT '=== VOS GROUPES (ADMIN) ===' as section;
SELECT 
  id as group_id,
  name as group_name,
  admin_id,
  created_at
FROM groups
WHERE admin_id = auth.uid()
ORDER BY created_at DESC;

-- 3. Tester la fonction is_group_admin avec VOS vraies valeurs
-- COPIER UN group_id de la requête ci-dessus et le coller ici:
SELECT '=== TEST is_group_admin() ===' as section;

-- EXEMPLE: Remplacer 'COPIER_VOTRE_GROUP_ID_ICI' par le vrai UUID
-- SELECT is_group_admin('COPIER_VOTRE_GROUP_ID_ICI'::UUID, auth.uid()) as est_admin;

-- 4. Vérifier si vous pouvez lire la table groups
SELECT '=== LECTURE TABLE GROUPS ===' as section;
SELECT COUNT(*) as nb_groupes_lisibles FROM groups;

-- 5. Vérifier les policies RLS de groups qui pourraient bloquer
SELECT '=== POLICIES RLS GROUPS ===' as section;
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'groups';

-- 6. TEST DIRECT: Essayer d'insérer une période (avec vos valeurs)
SELECT '=== TEST INSERTION DIRECTE ===' as section;

-- COPIER UN group_id de la section 2 ci-dessus
-- DÉCOMMENTER ET REMPLACER 'COPIER_VOTRE_GROUP_ID_ICI':

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
  'COPIER_VOTRE_GROUP_ID_ICI'::UUID,  -- ← Remplacer par votre group_id
  NOW(),
  NOW() + INTERVAL '7 days',
  auth.uid(),
  10,
  5
)
RETURNING 
  id as period_id,
  group_id,
  start_date,
  end_date,
  'SUCCESS - La période a été créée !' as resultat;
*/

-- 7. Vérifier que la fonction is_group_admin peut accéder à groups
SELECT '=== DEBUG is_group_admin ===' as section;

-- Test en exécutant manuellement ce que fait la fonction
-- COPIER UN group_id de la section 2:
/*
SELECT 
  g.id as group_id,
  g.admin_id,
  auth.uid() as mon_user_id,
  (g.admin_id = auth.uid()) as je_suis_admin
FROM groups g
WHERE g.id = 'COPIER_VOTRE_GROUP_ID_ICI'::UUID;  -- ← Remplacer
*/

-- 8. SOLUTION ALTERNATIVE: Tester avec auth.uid() directement dans policy
SELECT '=== TEST POLICY ALTERNATIVE ===' as section;

-- Cette requête teste si l'approche directe fonctionne mieux
-- COPIER UN group_id de la section 2:
/*
SELECT 
  g.id as group_id,
  g.name as group_name,
  EXISTS(
    SELECT 1 FROM groups 
    WHERE id = 'COPIER_VOTRE_GROUP_ID_ICI'::UUID  -- ← Remplacer
    AND admin_id = auth.uid()
  ) as auth_directe_ok
FROM groups g
WHERE g.id = 'COPIER_VOTRE_GROUP_ID_ICI'::UUID;  -- ← Remplacer
*/

-- ==========================================
-- INSTRUCTIONS
-- ==========================================

/*
ÉTAPES À SUIVRE:

1. Exécutez la section 1 et 2 pour obtenir votre user_id et group_id

2. Copiez un group_id depuis les résultats de la section 2

3. Dans la section 3, décommentez la ligne SELECT is_group_admin...
   et remplacez 'COPIER_VOTRE_GROUP_ID_ICI' par le vrai UUID

4. Exécutez la requête modifiée:
   - Si elle retourne TRUE → Fonction OK mais policy bloque
   - Si elle retourne FALSE → Fonction ne marche pas
   - Si elle donne une erreur → Problème d'accès à la table groups

5. Dans la section 6, décommentez le INSERT
   et remplacez 'COPIER_VOTRE_GROUP_ID_ICI' par le vrai UUID
   
6. Exécutez l'INSERT:
   - Si SUCCESS → Le problème vient de l'application, pas du SQL
   - Si erreur 403 → Le problème est bien dans les policies RLS

7. ENVOYEZ-MOI LES RÉSULTATS de toutes ces requêtes
   pour que je puisse identifier exactement le problème !
*/
