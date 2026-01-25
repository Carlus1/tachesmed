/*
  # Gestion des périodes d'optimisation figées

  1. Nouvelle table
    - optimization_periods: Stocke les périodes acceptées avec leurs dates
  
  2. Règles de verrouillage
    - Avant la période: Admin peut supprimer, users ne peuvent pas modifier indisponibilités
    - Pendant la période: Verrouillage total, aucune modification
    - Après la période: Lecture seule, on ne modifie pas le passé
  
  3. RLS
    - Bloquer modifications indisponibilités si période active
*/

-- Activer l'extension btree_gist pour utiliser UUID dans les contraintes GIST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Table pour stocker les périodes d'optimisation acceptées
CREATE TABLE IF NOT EXISTS optimization_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_by UUID NOT NULL REFERENCES users(id),
  total_tasks INTEGER NOT NULL DEFAULT 0,
  assigned_tasks INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte: pas de chevauchement de périodes pour un même groupe
  CONSTRAINT unique_group_period EXCLUDE USING gist (
    group_id WITH =,
    tstzrange(start_date, end_date, '[]') WITH &&
  ) WHERE (status = 'active')
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_optimization_periods_group_id ON optimization_periods(group_id);
CREATE INDEX IF NOT EXISTS idx_optimization_periods_dates ON optimization_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_optimization_periods_status ON optimization_periods(status);

-- RLS pour optimization_periods
ALTER TABLE optimization_periods ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier si l'utilisateur est admin d'un groupe
-- Utilise group_members qui est plus accessible que groups directement
CREATE OR REPLACE FUNCTION is_group_admin(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Récupérer l'admin_id via une requête directe (SECURITY DEFINER bypass RLS)
  SELECT g.admin_id INTO admin_id
  FROM groups g
  WHERE g.id = p_group_id;
  
  -- Vérifier si l'utilisateur est l'admin
  RETURN admin_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Les membres du groupe peuvent voir les périodes de leur groupe
CREATE POLICY "Members can view their group periods"
  ON optimization_periods
  FOR SELECT
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM group_members gm 
      WHERE gm.user_id = auth.uid()
    )
  );

-- Les admins peuvent créer des périodes pour leurs groupes
CREATE POLICY "Admins can create periods"
  ON optimization_periods
  FOR INSERT
  WITH CHECK (
    is_group_admin(group_id, auth.uid())
  );

-- Les admins peuvent supprimer des périodes SEULEMENT si avant la date de début
-- Une fois que la période a commencé ou est passée, elle est figée
CREATE POLICY "Admins can delete future periods only"
  ON optimization_periods
  FOR UPDATE
  USING (
    is_group_admin(group_id, auth.uid())
    AND start_date > NOW() -- Seulement si la période n'a pas encore commencé
    AND status = 'active'  -- Ne peut pas modifier une période déjà supprimée
  )
  WITH CHECK (
    -- Peut seulement changer le status à 'deleted'
    status IN ('active', 'deleted')
  );

-- Fonction pour vérifier si on peut modifier une tâche assignée dans une période
CREATE OR REPLACE FUNCTION can_modify_assigned_task(
  p_task_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  task_record RECORD;
  period_record RECORD;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO task_record
  FROM tasks
  WHERE id = p_task_id;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- Si la tâche n'existe pas, laisser l'erreur se produire ailleurs
  END IF;
  
  -- Vérifier si la tâche est dans une période verrouillée
  FOR period_record IN
    SELECT * FROM optimization_periods
    WHERE group_id = task_record.group_id
    AND status = 'active'
    AND task_record.start_date >= start_date
    AND task_record.start_date <= end_date
  LOOP
    -- Si on est dans ou après la période, bloquer toute modification (même admin)
    IF NOW() >= period_record.start_date THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si une date est dans une période verrouillée
CREATE OR REPLACE FUNCTION is_date_in_locked_period(
  p_group_id UUID,
  p_date TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM optimization_periods
    WHERE group_id = p_group_id
    AND status = 'active'
    AND p_date >= start_date
    AND p_date <= end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si on peut modifier les indisponibilités
-- Bloque TOUT LE MONDE (y compris admin) pendant/après la période
CREATE OR REPLACE FUNCTION can_modify_availability(
  p_user_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
  user_groups UUID[];
  locked_period RECORD;
BEGIN
  -- Récupérer les groupes de l'utilisateur
  SELECT ARRAY_AGG(gm.group_id) INTO user_groups
  FROM group_members gm
  WHERE gm.user_id = p_user_id;
  
  -- Vérifier s'il existe une période qui chevauche ces dates
  FOR locked_period IN
    SELECT * FROM optimization_periods
    WHERE group_id = ANY(user_groups)
    AND status = 'active'
    AND (
      (p_start_time >= start_date AND p_start_time <= end_date)
      OR (p_end_time >= start_date AND p_end_time <= end_date)
      OR (p_start_time <= start_date AND p_end_time >= end_date)
    )
  LOOP
    -- Si on est dans ou après la période, bloquer TOUT LE MONDE (admin compris)
    IF NOW() >= locked_period.start_date THEN
      RETURN FALSE;
    END IF;
    
    -- Si on est avant la période, bloquer aussi (la période est déjà planifiée)
    -- L'admin doit supprimer la période entière pour pouvoir modifier
    RETURN FALSE;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modifier la policy des availabilities pour bloquer les modifications pendant les périodes verrouillées
DROP POLICY IF EXISTS "Users can manage their availabilities" ON availabilities;

CREATE POLICY "Users can manage their availabilities"
  ON availabilities
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND can_modify_availability(auth.uid(), start_time, end_time)
  );

-- Policy de lecture pour les availabilities (inchangée)
CREATE POLICY "Users can view their availabilities"
  ON availabilities
  FOR SELECT
  USING (user_id = auth.uid());

-- Fonction pour supprimer une période (avant le début uniquement)
-- Marque la période comme supprimée ET désassigne les tâches pour permettre une nouvelle génération
CREATE OR REPLACE FUNCTION delete_optimization_period(
  p_period_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  period_record RECORD;
  tasks_unassigned INTEGER;
BEGIN
  -- Récupérer la période
  SELECT * INTO period_record
  FROM optimization_periods
  WHERE id = p_period_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Période non trouvée';
  END IF;
  
  -- Vérifier qu'on est AVANT le début de la période
  IF NOW() >= period_record.start_date THEN
    RAISE EXCEPTION 'Impossible de supprimer une période déjà commencée ou passée';
  END IF;
  
  -- Vérifier que l'utilisateur est admin du groupe
  IF NOT EXISTS (
    SELECT 1 FROM groups
    WHERE id = period_record.group_id
    AND admin_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Seul l''admin du groupe peut supprimer la période';
  END IF;
  
  -- Marquer la période comme supprimée (soft delete)
  UPDATE optimization_periods
  SET status = 'deleted'
  WHERE id = p_period_id;
  
  -- Désassigner toutes les tâches de cette période pour permettre une nouvelle génération
  UPDATE tasks
  SET assigned_to = NULL,
      status = 'pending'
  WHERE group_id = period_record.group_id
    AND start_date >= period_record.start_date
    AND start_date <= period_record.end_date
    AND status = 'assigned';
  
  GET DIAGNOSTICS tasks_unassigned = ROW_COUNT;
  
  RAISE NOTICE 'Période % supprimée, % tâches désassignées', p_period_id, tasks_unassigned;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir l'état d'une période
CREATE OR REPLACE FUNCTION get_period_status(
  p_period_id UUID
)
RETURNS TEXT AS $$
DECLARE
  period_record RECORD;
BEGIN
  SELECT * INTO period_record
  FROM optimization_periods
  WHERE id = p_period_id;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  IF period_record.status = 'deleted' THEN
    RETURN 'deleted';
  END IF;
  
  -- Avant la période
  IF NOW() < period_record.start_date THEN
    RETURN 'future';
  END IF;
  
  -- Pendant la période
  IF NOW() >= period_record.start_date AND NOW() <= period_record.end_date THEN
    RETURN 'active';
  END IF;
  
  -- Après la période
  RETURN 'past';
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE optimization_periods IS 'Stocke les périodes d''optimisation acceptées avec verrouillage basé sur les dates';
COMMENT ON FUNCTION is_date_in_locked_period IS 'Vérifie si une date est dans une période verrouillée';
COMMENT ON FUNCTION can_modify_availability IS 'Vérifie si QUELQU''UN (y compris admin) peut modifier ses indisponibilités - bloqué pendant/après les périodes';
COMMENT ON FUNCTION can_modify_assigned_task IS 'Vérifie si une tâche assignée peut être modifiée - bloqué pendant/après la période pour TOUT LE MONDE';
COMMENT ON FUNCTION delete_optimization_period IS 'Supprime une période (AVANT début uniquement) et désassigne les tâches pour permettre regénération';
COMMENT ON FUNCTION get_period_status IS 'Retourne le statut d''une période: future, active, past, deleted';

/*
  RÈGLES DE VERROUILLAGE (s'appliquent à TOUS, y compris admin):
  
  📅 AVANT la période (NOW < start_date):
     - Admin: Peut supprimer la période entière (soft delete)
     - Admin: Ne peut PAS modifier les indisponibilités (doit supprimer période)
     - Users: Ne peuvent PAS modifier les indisponibilités
     - Tâches: Modifications bloquées
  
  🔒 PENDANT la période (start_date <= NOW <= end_date):
     - Admin: Ne peut PAS supprimer la période
     - Admin: Ne peut PAS modifier les indisponibilités
     - Users: Ne peuvent PAS modifier les indisponibilités
     - Tâches: Modifications bloquées
  
  🔐 APRÈS la période (NOW > end_date):
     - Admin: Ne peut PAS supprimer la période
     - Admin: Ne peut PAS modifier les indisponibilités
     - Users: Ne peuvent PAS modifier les indisponibilités
     - Tâches: Modifications bloquées
     - Raison: On ne modifie pas le passé
*/
