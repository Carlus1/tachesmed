-- ==========================================
-- GESTION DES ABSENCES UTILISATEURS
-- ==========================================
-- Ajouter des champs pour gérer les absences planifiées avec dates
-- Les utilisateurs absents restent dans l'équipe mais:
-- - Ne reçoivent pas de nouvelles assignations
-- - Ne reçoivent pas de courriels de rappel

-- 1. Supprimer l'ancienne colonne booléenne si elle existe
ALTER TABLE users DROP COLUMN IF EXISTS is_active;

-- 2. Ajouter les colonnes de période d'absence
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS inactive_from DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inactive_until DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inactive_reason TEXT DEFAULT NULL;

-- 3. Ajouter des commentaires explicatifs
COMMENT ON COLUMN users.inactive_from IS 'Date de début d''absence. NULL = utilisateur actif';
COMMENT ON COLUMN users.inactive_until IS 'Date de fin d''absence. NULL = absence indéfinie';
COMMENT ON COLUMN users.inactive_reason IS 'Raison de l''absence (optionnel): "Opération", "Vacances", etc.';

-- 4. Créer un index composite pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_inactive_dates ON users(inactive_from, inactive_until);

-- 5. Créer une fonction helper pour vérifier si un utilisateur est actuellement actif
CREATE OR REPLACE FUNCTION is_user_active(
  p_inactive_from DATE,
  p_inactive_until DATE,
  p_check_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Si pas de date d'absence, l'utilisateur est actif
  IF p_inactive_from IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Si l'absence n'a pas encore commencé
  IF p_check_date < p_inactive_from THEN
    RETURN TRUE;
  END IF;
  
  -- Si l'absence a une date de fin et est terminée
  IF p_inactive_until IS NOT NULL AND p_check_date > p_inactive_until THEN
    RETURN TRUE;
  END IF;
  
  -- L'utilisateur est en période d'absence
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Créer une vue pour faciliter les requêtes
CREATE OR REPLACE VIEW users_with_status AS
SELECT 
  u.*,
  is_user_active(u.inactive_from, u.inactive_until) AS is_currently_active,
  CASE 
    WHEN is_user_active(u.inactive_from, u.inactive_until) THEN '✅ Actif'
    WHEN u.inactive_until IS NULL THEN '⏸️ Absent (indéfini)'
    ELSE '⏸️ Absent jusqu''au ' || TO_CHAR(u.inactive_until, 'DD/MM/YYYY')
  END as status_display,
  CASE
    WHEN u.inactive_from IS NOT NULL AND CURRENT_DATE < u.inactive_from THEN
      '📅 Absence planifiée à partir du ' || TO_CHAR(u.inactive_from, 'DD/MM/YYYY')
    ELSE NULL
  END as upcoming_absence
FROM users u;

-- 7. Vérification
SELECT 
  id,
  full_name,
  email,
  inactive_from,
  inactive_until,
  inactive_reason,
  is_currently_active,
  status_display,
  upcoming_absence
FROM users_with_status
ORDER BY full_name;
