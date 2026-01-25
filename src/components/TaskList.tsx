import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskModal from './TaskModal';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration?: number;
  group?: { name: string } | null;
  groups?: Array<{ id: string; name: string }>;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { loadTasks(); }, []);

  useEffect(() => { loadUserGroups(); }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          group:groups (name),
          created_by_user:users!created_by (id, full_name),
          assigned_to_user:users!assigned_to (id, full_name)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Load task_groups associations
      const tasksWithGroups = await Promise.all((data || []).map(async (task) => {
        const { data: taskGroups } = await supabase
          .from('task_groups')
          .select('group:groups (id, name)')
          .eq('task_id', task.id);
        
        return {
          ...task,
          groups: taskGroups?.map((tg: any) => tg.group).filter(Boolean) || []
        };
      }));

      setTasks(tasksWithGroups || []);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      const { data: adminGroups } = await supabase
        .from('groups')
        .select('id, name')
        .eq('admin_id', userId);

      const { data: memberGroups } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      const memberGroupItems = ((memberGroups || []) as any[]).map((mg) => mg.groups).flat().filter(Boolean) as any[];
      const allGroups = [ ...(adminGroups || []), ...memberGroupItems ];

      const unique = Array.from(new Map(allGroups.map((g: any) => [g.id, g])).values());
      setGroups(unique);
    } catch (err) {
      console.error('Erreur lors du chargement des groupes utilisateur:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-accent-100/20 text-accent-500 border-accent-200';
      case 'medium': return 'bg-primary-100 text-primary-500 border-primary-200';
      case 'low': return 'bg-background text-primary-400 border-muted';
      default: return 'bg-muted text-primary-400 border-border';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-[60vh] rounded-2xl shadow-md">
      <h2 className="text-3xl font-extrabold mb-6 text-primary-700 tracking-tight">Liste des tâches</h2>

      {tasks.length === 0 ? (
        <div className="text-primary-400 text-center">Aucune tâche trouvée.</div>
      ) : (
        <div className="space-y-5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between transition-all hover:shadow-xl cursor-pointer border border-border group"
              onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${getPriorityColor(task.priority)} shadow-sm tracking-wide uppercase`}>{getPriorityLabel(task.priority)}</span>
                </div>
                {(task.groups && task.groups.length > 0) && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.groups.map((g) => (
                      <span key={g.id} className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-xl border border-primary-200 shadow-sm">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="text-lg font-bold text-primary-700 mb-1 group-hover:text-accent-500 transition-colors">{task.title}</h3>
                <p className="text-primary-400 mb-1">{task.description}</p>
                <div className="text-xs text-primary-300">
                  {format(new Date(task.start_date), 'PPPp', { locale: fr })} - {format(new Date(task.end_date), 'PPPp', { locale: fr })}
                </div>
              </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
                <button
                  className="px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl shadow-md font-semibold transition-all"
                  onClick={e => { e.stopPropagation(); setSelectedTask(task); setShowTaskModal(true); }}
                >
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && selectedTask && (
        <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onTaskCreated={loadTasks} groups={groups} />
      )}
    </div>
  );
}