/*
  # Gestion des instances de tâches récurrentes

  1. Nouvelles colonnes
    - Ajouter `parent_task_id` pour lier les instances à la tâche parent
    - Ajouter `occurrence_date` pour identifier quelle occurrence c'est

  2. Fonction de génération
    - Créer une fonction pour générer automatiquement les instances de tâches récurrentes
    - Appelée lors de la création/modification d'une tâche avec récurrence

  3. Sécurité
    - Les instances héritent du group_id de la tâche parent
*/

-- Ajouter les colonnes pour gérer les instances de tâches récurrentes
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS occurrence_date DATE;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_occurrence_date ON tasks(occurrence_date);

-- Fonction pour générer les instances d'une tâche récurrente
CREATE OR REPLACE FUNCTION generate_recurring_task_instances(
  task_id UUID,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  task_record RECORD;
  current_occurrence DATE;
  occurrence_count INTEGER := 0;
  task_duration INTERVAL;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  max_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer la tâche parent
  SELECT * INTO task_record FROM tasks WHERE id = task_id AND parent_task_id IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tâche non trouvée ou est déjà une instance';
  END IF;

  -- Si pas de récurrence, ne rien faire
  IF task_record.recurrence_type IS NULL OR task_record.recurrence_type = 'none' THEN
    RETURN 0;
  END IF;

  -- Supprimer les instances existantes qui n'ont pas été assignées
  DELETE FROM tasks
  WHERE parent_task_id = task_id
    AND (assigned_to IS NULL OR status = 'pending');

  -- Déterminer la date maximale de génération (max 1 an dans le futur)
  IF task_record.recurrence_end_date IS NOT NULL THEN
    max_date := LEAST(
      task_record.recurrence_end_date,
      CURRENT_DATE + INTERVAL '1 year'
    );
  ELSIF end_date IS NOT NULL THEN
    max_date := LEAST(
      end_date,
      CURRENT_DATE + INTERVAL '1 year'
    );
  ELSE
    -- Par défaut, générer pour 1 an maximum
    max_date := CURRENT_DATE + INTERVAL '1 year';
  END IF;

  -- Calculer la durée de la tâche
  task_duration := task_record.end_date - task_record.start_date;

  -- Première occurrence = la tâche originale elle-même
  current_occurrence := task_record.start_date::DATE;
  
  -- Boucle pour générer les occurrences suivantes
  LOOP
    -- Calculer la prochaine occurrence selon le type
    CASE task_record.recurrence_type
      WHEN 'daily' THEN
        current_occurrence := current_occurrence + INTERVAL '1 day';
      WHEN 'weekly' THEN
        current_occurrence := current_occurrence + INTERVAL '1 week';
      WHEN 'biweekly' THEN
        current_occurrence := current_occurrence + INTERVAL '2 weeks';
      WHEN 'monthly' THEN
        current_occurrence := current_occurrence + INTERVAL '1 month';
      WHEN 'bimonthly' THEN
        current_occurrence := current_occurrence + INTERVAL '2 months';
      WHEN 'quarterly' THEN
        current_occurrence := current_occurrence + INTERVAL '3 months';
      WHEN 'semiannual' THEN
        current_occurrence := current_occurrence + INTERVAL '6 months';
      WHEN 'annual' THEN
        current_occurrence := current_occurrence + INTERVAL '1 year';
      ELSE
        EXIT; -- Type inconnu, sortir
    END CASE;

    -- Vérifier si on a dépassé la date maximale
    IF current_occurrence > max_date::DATE THEN
      EXIT;
    END IF;

    -- Calculer les nouvelles dates pour cette occurrence
    new_start_date := current_occurrence::TIMESTAMP WITH TIME ZONE
                    + (task_record.start_date::TIME - '00:00:00'::TIME);
    new_end_date := new_start_date + task_duration;

    -- Créer l'instance de tâche
    INSERT INTO tasks (
      title,
      description,
      priority,
      status,
      start_date,
      end_date,
      duration,
      group_id,
      created_by,
      parent_task_id,
      occurrence_date,
      recurrence_type,
      recurrence_end_date
    ) VALUES (
      task_record.title,
      task_record.description,
      task_record.priority,
      'pending',
      new_start_date,
      new_end_date,
      task_record.duration,
      task_record.group_id,
      task_record.created_by,
      task_id,
      current_occurrence,
      'none', -- Les instances ne sont pas elles-mêmes récurrentes
      NULL
    );

    occurrence_count := occurrence_count + 1;

    -- Limite de sécurité pour éviter les boucles infinies
    IF occurrence_count > 1000 THEN
      RAISE WARNING 'Limite de 1000 occurrences atteinte pour la tâche %', task_id;
      EXIT;
    END IF;
  END LOOP;

  RETURN occurrence_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour générer automatiquement les instances lors de la création/modification
CREATE OR REPLACE FUNCTION auto_generate_recurring_instances()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement pour les tâches parent (pas les instances)
  IF NEW.parent_task_id IS NULL AND NEW.recurrence_type IS NOT NULL AND NEW.recurrence_type != 'none' THEN
    -- Générer les instances de manière asynchrone via pg_notify pour éviter de bloquer la transaction
    PERFORM pg_notify('generate_instances', NEW.id::TEXT);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_instances ON tasks;
CREATE TRIGGER trigger_auto_generate_instances
  AFTER INSERT OR UPDATE OF recurrence_type, recurrence_end_date
  ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_recurring_instances();

-- Commentaires
COMMENT ON COLUMN tasks.parent_task_id IS 'Référence à la tâche parent si c''est une instance de récurrence';
COMMENT ON COLUMN tasks.occurrence_date IS 'Date de cette occurrence pour les tâches récurrentes';
COMMENT ON FUNCTION generate_recurring_task_instances IS 'Génère les instances futures d''une tâche récurrente (max 1 an)';

-- Fonction pour nettoyer les anciennes instances de tâches récurrentes
-- Garde seulement les instances des 12 derniers mois et supprime les plus anciennes
CREATE OR REPLACE FUNCTION cleanup_old_task_instances()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les instances terminées de plus de 1 an
  DELETE FROM tasks
  WHERE parent_task_id IS NOT NULL
    AND occurrence_date < CURRENT_DATE - INTERVAL '1 year'
    AND status IN ('completed', 'cancelled');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Nettoyage: % instance(s) supprimée(s)', deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_task_instances IS 'Supprime les instances de tâches récurrentes terminées de plus d''un an';

-- Fonction pour maintenance périodique: nettoyer + régénérer
CREATE OR REPLACE FUNCTION maintain_recurring_tasks()
RETURNS TABLE(cleaned INTEGER, regenerated INTEGER) AS $$
DECLARE
  clean_count INTEGER;
  regen_count INTEGER := 0;
  task_record RECORD;
BEGIN
  -- 1. Nettoyer les anciennes instances
  SELECT cleanup_old_task_instances() INTO clean_count;
  
  -- 2. Régénérer les instances pour toutes les tâches récurrentes actives
  FOR task_record IN 
    SELECT id, title
    FROM tasks
    WHERE parent_task_id IS NULL
      AND recurrence_type IS NOT NULL
      AND recurrence_type != 'none'
      AND (recurrence_end_date IS NULL OR recurrence_end_date >= CURRENT_DATE)
  LOOP
    BEGIN
      regen_count := regen_count + generate_recurring_task_instances(task_record.id, NULL);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur lors de la régénération de la tâche %: %', task_record.title, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Maintenance terminée: % nettoyées, % régénérées', clean_count, regen_count;
  
  RETURN QUERY SELECT clean_count, regen_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION maintain_recurring_tasks IS 'Nettoie les anciennes instances et régénère les futures (à exécuter périodiquement)';

