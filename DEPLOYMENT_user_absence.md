# Déploiement: Gestion avancée des absences avec dates planifiées

## 📋 Étapes de déploiement

### 1. Déployer la migration SQL

**Ouvrir SQL Editor dans Supabase:**
1. Dashboard Supabase → SQL Editor
2. Copier le contenu de: `supabase/migrations/20260127_add_user_active_status.sql`
3. Exécuter (bouton "Run")

**Vérification:**
```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('inactive_from', 'inactive_until', 'inactive_reason');

-- Vérifier la fonction helper
SELECT is_user_active(NULL, NULL, CURRENT_DATE); -- Devrait retourner TRUE

-- Vérifier la vue
SELECT * FROM users_with_status LIMIT 5;
```

### 2. Tester la fonctionnalité

**Scénario 1: Opération programmée dans 3 jours**
1. Aller dans "Gestion des utilisateurs"
2. Cliquer sur badge `✅ Actif` d'un utilisateur
3. Planifier:
   - Date début: Aujourd'hui + 3 jours
   - Date retour: Aujourd'hui + 10 jours
   - Raison: "Opération chirurgicale"
4. Badge devient: `📅 Absence dans 3j` (bleu)
5. Générer proposition → Utilisateur inclus (absence pas commencée)
6. Attendre 3 jours (ou modifier date) → Badge devient `⏸️ Absent (7j)` (orange)
7. Nouvelle génération → Utilisateur exclu

> **💡 Note:** Les vacances planifiées ne doivent PAS utiliser ce système.
> Les utilisateurs les saisissent directement dans leurs **indisponibilités**.

**Scénario 2: Absence brusque indéfinie**
1. Cliquer sur badge utilisateur
2. Planifier:
   - Date début: Aujourd'hui (ou vide)
   - Date retour: Vide
   - Raison: "Congé maladie"
3. Badge devient: `⏸️ Absent (∞)` (orange)
4. Générer proposition → Utilisateur exclu
5. Aucun courriel envoyé pendant absence

**Scénario 3: Réactivation**
1. Utilisateur absent avec badge `⏸️ Absent (Nj)`
2. Cliquer sur "Annuler l'absence"
3. Badge redevient `✅ Actif` (vert)
4. Prochaines générations l'incluent
5. Courriels reprennent

### 3. Workflow admin complet

**Utilisateur doit se faire opérer:**

1. **Planifier l'absence** (3 jours avant):
   ```
   Date début: 30/01/2026
   Date retour: 10/02/2026
   Raison: Opération
   ```

2. **Période déjà acceptée?**
   - Si oui: Supprimer période future → Régénérer sans l'utilisateur
   - Si non: Rien à faire, prochaine génération l'exclura automatiquement

3. **Pendant l'absence (30/01 → 10/02)**:
   - Utilisateur ne reçoit aucune tâche
   - Aucun courriel de rappel
   - Badge affiche: `⏸️ Absent (Nj)` avec décompte

4. **Retour anticipé?**
   - Modifier date de retour dans le modal
   - OU cliquer "Annuler l'absence"

## ✅ Fonctionnalités

### ⚠️ Usage prévu
Ce système gère les **absences exceptionnelles** uniquement:
- ✅ Congé maladie soudain
- ✅ Opération chirurgicale
- ✅ Accident / Urgence
- ✅ Invalidité temporaire
- ❌ ~~Vacances planifiées~~ → À saisir dans les **indisponibilités**

### Badges intelligents
- **✅ Actif** (vert): Utilisateur disponible
- **📅 Absence dans Nj** (bleu): Absence exceptionnelle planifiée
- **⏸️ Absent (Nj)** (orange): En absence avec décompte jours restants
- **⏸️ Absent (∞)** (orange): Absence de durée indéterminée

### Modal de planification
- Champs dates avec validation
- Date début ≥ aujourd'hui
- Date fin ≥ date début
- Raison optionnelle (100 caractères max)
- Instructions et avertissements

### Protection automatique
- ❌ Pas de nouvelles assignations
- ❌ Pas de courriels de rappel
- ✅ Tâches passées préservées
- ✅ Membre reste dans l'équipe

## 🔒 Base de données

### Nouvelles colonnes
```sql
users.inactive_from    DATE        -- Date début absence
users.inactive_until   DATE        -- Date fin (NULL = indéfini)
users.inactive_reason  TEXT        -- Raison optionnelle
```

### Fonction SQL
```sql
is_user_active(inactive_from, inactive_until, check_date)
-- Retourne TRUE si utilisateur actif à la date donnée
```

### Vue matérialisée
```sql
users_with_status
-- Inclut: is_currently_active, status_display, upcoming_absence
```

## 💡 Exemples de requêtes

```sql
-- Lister tous les utilisateurs absents actuellement
SELECT full_name, inactive_from, inactive_until, inactive_reason
FROM users
WHERE NOT is_user_active(inactive_from, inactive_until, CURRENT_DATE);

-- Lister les absences planifiées futures
SELECT full_name, inactive_from, inactive_reason
FROM users
WHERE inactive_from > CURRENT_DATE;

-- Utilisateurs qui reviennent dans les 7 jours
SELECT full_name, inactive_until
FROM users
WHERE inactive_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';
```

## 🎯 Impact utilisateur final

### Pour l'utilisateur absent:
- ✅ Aucune nouvelle tâche pendant absence
- ✅ Aucun rappel par courriel
- ✅ Peut se concentrer sur rétablissement
- ✅ Réintégration automatique après retour

### Pour l'administrateur:
- ✅ Planification anticipée (opérations, vacances)
- ✅ Visibilité complète (badges, dates, raisons)
- ✅ Gestion flexible (modifier dates, annuler)
- ✅ Optimisations automatiques sans utilisateur absent

### Pour l'équipe:
- ✅ Transparence sur disponibilités
- ✅ Répartition équitable entre membres actifs
- ✅ Pas de surcharge sur personne absente
