-- Ajout du champ pour la période de mise à jour des indisponibilités dans les groupes
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS unavailability_period_weeks INTEGER DEFAULT 2 CHECK (unavailability_period_weeks > 0);

-- Commentaire pour expliquer le champ
COMMENT ON COLUMN groups.unavailability_period_weeks IS 'Fréquence en semaines pour la mise à jour des indisponibilités (1 semaine à 2 ans/104 semaines)';
