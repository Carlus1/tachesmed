import { supabase } from '../supabase';

/**
 * Génère les instances de tâches récurrentes pour une tâche donnée
 * @param taskId - ID de la tâche parent
 * @param endDate - Date de fin optionnelle pour la génération (par défaut: 1 an)
 * @returns Nombre d'instances générées
 */
export async function generateTaskInstances(
  taskId: string,
  endDate?: Date
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('generate_recurring_task_instances', {
      task_id: taskId,
      end_date: endDate?.toISOString() || null
    });

    if (error) {
      console.error('Erreur lors de la génération des instances:', error);
      throw error;
    }

    console.log(`✅ ${data || 0} instances générées pour la tâche ${taskId}`);
    return data || 0;
  } catch (err) {
    console.error('Exception lors de la génération des instances:', err);
    throw err;
  }
}

/**
 * Génère les instances pour toutes les tâches récurrentes d'un groupe
 * @param groupId - ID du groupe
 * @param endDate - Date de fin pour la génération
 * @returns Nombre total d'instances générées
 */
export async function generateGroupTaskInstances(
  groupId: string,
  endDate: Date
): Promise<number> {
  try {
    // Récupérer toutes les tâches récurrentes du groupe (tâches parent uniquement)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, recurrence_type')
      .eq('group_id', groupId)
      .is('parent_task_id', null)
      .not('recurrence_type', 'is', null)
      .neq('recurrence_type', 'none');

    if (tasksError) {
      console.error('Erreur lors de la récupération des tâches:', tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      console.log('ℹ️ Aucune tâche récurrente trouvée pour le groupe');
      return 0;
    }

    console.log(`📋 ${tasks.length} tâche(s) récurrente(s) trouvée(s)`);

    let totalInstances = 0;

    // Générer les instances pour chaque tâche
    for (const task of tasks) {
      console.log(`🔄 Génération des instances pour: ${task.title}`);
      const count = await generateTaskInstances(task.id, endDate);
      totalInstances += count;
    }

    console.log(`✅ Total: ${totalInstances} instances générées pour le groupe`);
    return totalInstances;
  } catch (err) {
    console.error('Exception lors de la génération des instances du groupe:', err);
    throw err;
  }
}
