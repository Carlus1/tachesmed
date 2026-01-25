-- ============================================
-- DIAGNOSTIC COMPLET - Workflow Tâches Récurrentes
-- ============================================

-- 1. État actuel de la table tasks
SELECT '=== ÉTAT ACTUEL TASKS ===' as section;

SELECT 
  COUNT(*) as total_taches,
  COUNT(CASE WHEN parent_task_id IS NULL THEN 1 END) as taches_parent,
  COUNT(CASE WHEN parent_task_id IS NOT NULL THEN 1 END) as instances,
  COUNT(CASE WHEN recurrence_type IS NOT NULL AND recurrence_type != 'none' THEN 1 END) as taches_recurrentes,
  COUNT(CASE WHEN parent_task_id IS NOT NULL AND assigned_to IS NOT NULL THEN 1 END) as instances_assignees,
  COUNT(CASE WHEN parent_task_id IS NOT NULL AND assigned_to IS NULL THEN 1 END) as instances_non_assignees
FROM tasks;

-- 2. Détail des tâches parent récurrentes
SELECT '=== TÂCHES RÉCURRENTES PARENT ===' as section;

SELECT 
  id,
  title,
  recurrence_type,
  recurrence_end_date,
  start_date,
  group_id,
  created_at
FROM tasks
WHERE parent_task_id IS NULL 
  AND recurrence_type IS NOT NULL 
  AND recurrence_type != 'none'
ORDER BY created_at DESC;

-- 3. Vérifier l'existence de la table optimization_periods
SELECT '=== PÉRIODES D''OPTIMISATION ===' as section;

SELECT 
  COUNT(*) as nb_periodes,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as actives,
  COUNT(CASE WHEN status = 'deleted' THEN 1 END) as supprimees
FROM optimization_periods;

-- 4. Détail des périodes si elles existent
SELECT 
  id,
  group_id,
  start_date,
  end_date,
  status,
  total_tasks,
  assigned_tasks,
  accepted_at
FROM optimization_periods
ORDER BY created_at DESC
LIMIT 5;

-- 5. Vérifier la fonction is_group_admin
SELECT '=== TEST FONCTION is_group_admin ===' as section;

-- Remplacer <votre_group_id> et <votre_user_id> par vos vraies valeurs pour tester
-- SELECT is_group_admin('<votre_group_id>'::UUID, '<votre_user_id>'::UUID);

-- 6. Vérifier les policies RLS sur optimization_periods
SELECT '=== POLICIES RLS optimization_periods ===' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'optimization_periods';

-- 7. Vérifier les policies RLS sur groups (pour diagnostiquer le problème RLS)
SELECT '=== POLICIES RLS groups ===' as section;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'groups';

-- 8. Vérifier la vue group_admins_view
SELECT '=== VUE group_admins_view ===' as section;

SELECT COUNT(*) as nb_groupes_avec_admin 
FROM group_admins_view;

-- Afficher les 5 premiers
SELECT * FROM group_admins_view LIMIT 5;

-- 9. Vérifier l'extension btree_gist
SELECT '=== EXTENSION btree_gist ===' as section;

SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname = 'btree_gist';

-- 10. Test complet du workflow (à exécuter manuellement)
SELECT '=== INSTRUCTIONS WORKFLOW TEST ===' as section;

/*
WORKFLOW À TESTER MANUELLEMENT:

1. VÉRIFIER ÉTAT INITIAL
   - Exécuter cette requête pour confirmer 0 instances
   SELECT COUNT(*) FROM tasks WHERE parent_task_id IS NOT NULL;
   
2. CRÉER UNE TÂCHE RÉCURRENTE dans l'application
   - Titre: "Test Astreinte"
   - Récurrence: Hebdomadaire
   - Groupe: Votre groupe de test
   - Date début: Aujourd'hui
   - Date fin récurrence: Dans 3 mois

3. VÉRIFIER GÉNÉRATION AUTOMATIQUE
   - Les instances devraient être créées automatiquement par le trigger
   SELECT COUNT(*) FROM tasks WHERE parent_task_id IS NOT NULL;
   - Devrait afficher ~12-15 instances (3 mois hebdomadaires)

4. ALLER DANS L'APPLICATION
   - Calendrier → Devrait être VIDE (instances non assignées masquées)
   - Liste tâches → Devrait montrer SEULEMENT la tâche parent

5. GÉNÉRER PROPOSITION
   - Aller dans CalendarProposal
   - Cliquer "Générer proposition"
   - Vérifier que des assignments sont proposés

6. ACCEPTER PROPOSITION
   - Cliquer "Accepter"
   - Si ERREUR 403 → Exécuter diagnostic RLS ci-dessous
   - Si SUCCÈS → Vérifier période créée:
   SELECT * FROM optimization_periods ORDER BY created_at DESC LIMIT 1;

7. VÉRIFIER AFFICHAGE
   - Calendrier → Instances assignées VISIBLES
   - Liste tâches → Instances assignées VISIBLES

8. TESTER SUPPRESSION PÉRIODE (avant début)
   - Récupérer l'ID de la période
   - Exécuter: SELECT delete_optimization_period('<period_id>'::UUID);
   - Vérifier désassignation:
   SELECT COUNT(*) FROM tasks 
   WHERE parent_task_id IS NOT NULL AND assigned_to IS NULL;

9. VÉRIFIER DISPARITION
   - Calendrier → Instances MASQUÉES à nouveau
   - Liste tâches → Instances MASQUÉES
*/

-- 11. DIAGNOSTIC ERREUR 403 (si elle se produit)
SELECT '=== DIAGNOSTIC ERREUR 403 ===' as section;

/*
Si vous obtenez une erreur 403 lors de l'acceptation:

1. Vérifier votre auth.uid() actuel:
   SELECT auth.uid();

2. Vérifier que vous êtes admin du groupe:
   SELECT g.id, g.name, g.admin_id
   FROM groups g
   WHERE g.admin_id = auth.uid();

3. Tester la fonction is_group_admin avec vos vraies valeurs:
   SELECT is_group_admin(
     '<votre_group_id>'::UUID, 
     auth.uid()
   );
   -- Devrait retourner TRUE

4. Tester l'insertion directe (bypass application):
   INSERT INTO optimization_periods (
     group_id, 
     start_date, 
     end_date, 
     accepted_by, 
     total_tasks, 
     assigned_tasks
   )
   VALUES (
     '<votre_group_id>'::UUID,
     NOW(),
     NOW() + INTERVAL '7 days',
     auth.uid(),
     10,
     5
   )
   RETURNING *;
   
   -- Si cette requête fonctionne, le problème vient de l'application
   -- Si elle échoue aussi, le problème est dans les policies RLS

5. Vérifier les policies de la table groups:
   -- Voir section 7 ci-dessus
   -- Le problème est probablement que is_group_admin() ne peut pas 
   -- lire la table groups à cause de RLS, même avec SECURITY DEFINER
*/

-- ============================================
-- FIN DU DIAGNOSTIC
-- ============================================
