# Déploiement de la correction generate_recurring_task_instances

## Problème
La fonction génère des occurrences jusqu'à 1 an au lieu de s'arrêter à la fin de période demandée.

**Exemple:**
- Période: 03/01/2026 → 28/02/2026 (9 semaines)
- Fonction générait: 03/01/2026 → 31/12/2026 (1 an entier)

## Solution
Retirer `LEAST(end_date, CURRENT_DATE + INTERVAL '1 year')` quand `end_date` est fourni.

## Instructions de déploiement

1. **Ouvrir SQL Editor dans Supabase**
   - Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT
   - Cliquer sur "SQL Editor"

2. **Copier-coller le contenu du fichier:**
   ```
   supabase/migrations/fix_recurrence_function.sql
   ```

3. **Exécuter** (bouton "Run")

## Vérification
```sql
-- Générer pour une période de 9 semaines
SELECT generate_recurring_task_instances('task_id', '2026-02-28'::timestamp);

-- Vérifier que seulement 9 occurrences sont créées
SELECT COUNT(*) FROM tasks 
WHERE parent_task_id = 'task_id' 
AND occurrence_date <= '2026-02-28';
```

## Impact
✅ Calendrier utilisateur affichera TOUTES les périodes acceptées (passées, actuelles, futures)
✅ Génération créera UNIQUEMENT les occurrences de la période demandée
