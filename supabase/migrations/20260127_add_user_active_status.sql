-- ==========================================
-- GESTION DES ABSENCES UTILISATEURS
-- ==========================================
-- Ajouter un champ is_active pour gérer les absences temporaires
-- Les utilisateurs inactifs restent dans l'équipe mais ne sont pas assignés

-- 1. Ajouter la colonne is_active (par défaut TRUE)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- 2. Ajouter un commentaire explicatif
COMMENT ON COLUMN users.is_active IS 'Indique si l''utilisateur est actif. FALSE = absence temporaire, ne sera pas inclus dans les optimisations futures';

-- 3. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 4. Mettre à jour tous les utilisateurs existants à actifs
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- 5. Vérification
SELECT 
  id,
  full_name,
  email,
  is_active,
  CASE 
    WHEN is_active THEN '✅ Actif'
    ELSE '⏸️ Absent'
  END as statut
FROM users
ORDER BY full_name;
