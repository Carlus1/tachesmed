-- Corriger la fonction pour accepter 'bi-weekly' au lieu de 'biweekly'
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

  -- ⚠️ NE SUPPRIMER QUE LES INSTANCES NON ASSIGNÉES
  -- Les instances assignées sont dans des périodes acceptées et doivent être préservées
  DELETE FROM tasks
  WHERE parent_task_id = task_id
    AND assigned_to IS NULL;

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
      WHEN 'bi-weekly' THEN  -- ✅ Accepter avec tiret
        current_occurrence := current_occurrence + INTERVAL '2 weeks';
      WHEN 'monthly' THEN
        current_occurrence := current_occurrence + INTERVAL '1 month';
      WHEN 'bi-monthly' THEN  -- ✅ Accepter avec tiret
        current_occurrence := current_occurrence + INTERVAL '2 months';
      WHEN 'quarterly' THEN
        current_occurrence := current_occurrence + INTERVAL '3 months';
      WHEN 'semi-annually' THEN  -- ✅ Accepter avec tiret
        current_occurrence := current_occurrence + INTERVAL '6 months';
      WHEN 'yearly' THEN
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
