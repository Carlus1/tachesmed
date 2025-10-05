import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
  group?: {
    name: string;
  };
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          group:groups (name)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
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

  const getPriorityText = (priority: string) => {
    return (
      <div className="p-8 bg-background min-h-[60vh] rounded-2xl shadow-md">
        <h2 className="text-3xl font-extrabold mb-6 text-primary-700 tracking-tight">Liste des tâches</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-400"></div>
          </div>
        ) : (
          <div className="space-y-5">
            {tasks.length === 0 ? (
              <div className="text-primary-400 text-center">Aucune tâche trouvée.</div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-surface rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between transition-all hover:shadow-xl cursor-pointer border border-border group"
                  onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${getPriorityColor(task.priority)} shadow-sm tracking-wide uppercase`}>{getPriorityText(task.priority)}</span>
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
              ))
            )}
          </div>
        )}
        {showTaskModal && selectedTask && (
          <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onTaskCreated={loadTasks} groups={[]} />
        )}
      </div>
    );
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {format(new Date(task.start_date), 'dd/MM/yyyy', { locale: fr })} — {format(new Date(task.start_date), 'HH:mm')}-{format(new Date(task.end_date), 'HH:mm')}
              </span>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Aucune tâche à venir</p>
          </div>
        )}
      </div>
      
      {/* Modal de détail de tâche */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Détails de la tâche</h2>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                  {getPriorityText(selectedTask.priority)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{selectedTask.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {format(new Date(selectedTask.start_date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {format(new Date(selectedTask.start_date), 'HH:mm')} - {format(new Date(selectedTask.end_date), 'HH:mm')}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>
                    {selectedTask.group?.name || 'Aucun groupe'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Durée: {selectedTask.duration} minutes
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-gray-200">
              <button 
                className="flex-1 py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedTask(null)}
              >
                Fermer
              </button>
              <button className="flex-1 py-3 text-center text-blue-600 hover:bg-blue-50 transition-colors border-l border-gray-200">
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}