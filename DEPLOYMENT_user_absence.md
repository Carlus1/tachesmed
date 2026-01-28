# Déploiement: Gestion des absences utilisateurs

## 📋 Étapes de déploiement

### 1. Déployer la migration SQL

**Ouvrir SQL Editor dans Supabase:**
1. Dashboard Supabase → SQL Editor
2. Copier le contenu de: `supabase/migrations/20260127_add_user_active_status.sql`
3. Exécuter (bouton "Run")

**Vérification:**
```sql
-- Vérifier que la colonne existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_active';

-- Tous les utilisateurs doivent être actifs par défaut
SELECT full_name, is_active FROM users;
```

### 2. Tester la fonctionnalité

1. **Aller dans "Gestion des utilisateurs"** (interface admin)
2. **Nouvelle colonne "Disponibilité"** visible avec badge `✅ Actif`
3. **Cliquer sur le badge** d'un utilisateur → devient `⏸️ Absent` (orange)
4. **Générer une nouvelle proposition** → Utilisateur absent ne reçoit aucune tâche
5. **Re-cliquer le badge** → Redevient `✅ Actif` (vert)

### 3. Workflow admin

**Scénario: Utilisateur absent brusquement**

1. Admin clique sur `✅ Actif` → `⏸️ Absent`
2. Si période future déjà acceptée:
   - Aller dans "Propositions calendrier"
   - Supprimer la période acceptée
   - Générer nouvelle période → Exclut l'utilisateur absent
   - Accepter la nouvelle proposition

**Scénario: Utilisateur de retour**

1. Admin clique sur `⏸️ Absent` → `✅ Actif`
2. Prochaines générations incluent à nouveau cet utilisateur

## ✅ Fonctionnalités

- **Badge cliquable**: Toggle direct dans le tableau
- **Couleurs distinctes**: 
  - Vert ✅ = Actif (inclus dans optimisations)
  - Orange ⏸️ = Absent (exclu des optimisations)
- **Persistance**: État sauvegardé en base de données
- **Logs console**: Affiche membres actifs vs absents lors de l'optimisation

## 🔒 Sécurité

- Seuls les admins peuvent modifier le statut
- Utilisateurs absents restent dans l'équipe
- Leurs tâches passées sont préservées
- Aucune perte de données

## 📊 Impact base de données

```sql
-- Nouvelle colonne
users.is_active BOOLEAN DEFAULT TRUE NOT NULL

-- Nouvel index
idx_users_is_active ON users(is_active)
```

Aucun impact sur données existantes - tous les utilisateurs deviennent `is_active = TRUE` par défaut.
