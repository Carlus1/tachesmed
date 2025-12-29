import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface TaskFormProps {
  onClose: () => void;
  taskId?: string | null;
}

interface Group {
  id: string;
  name: string;
}

export default function TaskForm({ onClose, taskId }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    duration: '30',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16),
    group_id: ''
  });

  useEffect(() => {
    loadGroups();
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadGroups = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Charger les groupes où l'utilisateur est admin
      const { data: adminGroups, error: adminError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('admin_id', userData.user.id);

      if (adminError) throw adminError;

      // Charger les groupes où l'utilisateur est membre
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name
          )
        `)
        .eq('user_id', userData.user.id);

      if (memberError) throw memberError;

      // Combiner et dédupliquer les groupes
      const memberGroupItems = ((memberGroups || []) as any[]).map((mg) => mg.groups).flat().filter(Boolean) as any[];
      const allGroups = [ ...(adminGroups || []), ...memberGroupItems ];

      // Dédupliquer les groupes par ID
      const uniqueGroups = Array.from(
        new Map((allGroups as any[]).map((group) => [group.id, group])).values()
      ) as Group[];

      setGroups(uniqueGroups);

      // Si c'est une nouvelle tâche et qu'il y a des groupes, sélectionner le premier par défaut
      if (!taskId && uniqueGroups.length > 0) {
        setTask(prev => ({ ...prev, group_id: uniqueGroups[0].id }));
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des groupes:', error);
      setError('Erreur lors du chargement des groupes');
    }
  };

  const loadTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      if (data) {
        setTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          duration: data.duration.toString(),
          start_date: new Date(data.start_date).toISOString().slice(0, 16),
          end_date: new Date(data.end_date).toISOString().slice(0, 16),
          group_id: data.group_id
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement de la tâche:', error);
      setError('Erreur lors du chargement de la tâche');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!task.group_id) {
        throw new Error('Veuillez sélectionner un groupe');
      }

      const taskData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        duration: parseInt(task.duration),
        start_date: new Date(task.start_date).toISOString(),
        end_date: new Date(task.end_date).toISOString(),
        group_id: task.group_id,
        created_by: userData.user.id
      };

      if (taskId) {
        // Mise à jour d'une tâche existante
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId);

        if (updateError) throw updateError;
      } else {
        // Création d'une nouvelle tâche
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-border w-96 shadow-lg rounded-md bg-surface">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-primary-700">{taskId ? 'Modifier la tâche' : 'Nouvelle tâche'}</h3>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-primary-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Groupe
            </label>
            <select
              value={task.group_id}
              onChange={(e) => setTask({ ...task, group_id: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un groupe</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Description
            </label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Priorité
            </label>
            <select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Durée (minutes)
            </label>
            <input
              type="number"
              value={task.duration}
              onChange={(e) => setTask({ ...task, duration: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Date de début
            </label>
            <input
              type="datetime-local"
              value={task.start_date}
              onChange={(e) => setTask({ ...task, start_date: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Date de fin
            </label>
            <input
              type="datetime-local"
              value={task.end_date}
              onChange={(e) => setTask({ ...task, end_date: e.target.value })}
              className="w-full p-2 border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

            {error && (
            <div className="mb-4 p-2 text-error-600 bg-error-50 rounded border border-error-200">
              {error}
            </div>
          )}

            <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-primary-400 border-border rounded-md hover:bg-surface transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : (taskId ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}