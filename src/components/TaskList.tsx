import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskModal from './TaskModal';
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
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, group:groups (name)`)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-accent-400/10 text-accent-500 border-accent-200';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-400"></div>
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
                  {task.group && (
                    <span className="ml-2 text-xs text-primary-400 bg-background px-2 py-1 rounded-xl border border-muted shadow-sm">{task.group.name}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-primary-700 mb-1 group-hover:text-accent-400 transition-colors">{task.title}</h3>
                <p className="text-primary-400 mb-1">{task.description}</p>
                <div className="text-xs text-primary-300">
                  {format(new Date(task.start_date), 'PPPp', { locale: fr })} - {format(new Date(task.end_date), 'PPPp', { locale: fr })}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
                <button
                  className="px-5 py-2 bg-accent-400 hover:bg-accent-500 text-white rounded-xl shadow-md font-semibold transition-all"
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
        <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onTaskCreated={loadTasks} groups={[]} />
      )}
    </div>
  );
}