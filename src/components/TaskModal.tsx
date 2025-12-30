import { useState } from 'react';
import { supabase } from '../supabase';

// Normalized file to ensure no accidental line-wrapping within JSX attributes

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  groups: any[];
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, groups }: TaskModalProps) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '10:30',
    endTime: '16:30',
    priority: 'high',
    group: 'Équipe B'
  });

  const handleCreateTask = async () => {
    try {
      console.log('TaskModal: creating task', newTask);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const startDateTime = new Date(`${newTask.startDate}T${newTask.startTime}`);
      const endDateTime = new Date(`${newTask.endDate}T${newTask.endTime}`);

      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          duration: Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)),
          created_by: userData.user.id,
          group_id: groups[0]?.id
        }]);

      if (error) throw error;

      onClose();
      setNewTask({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '10:30',
        endTime: '16:30',
        priority: 'high',
        group: 'Équipe B'
      });
      onTaskCreated();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      try { alert('Erreur lors de la création de la tâche : ' + (error?.message || String(error))); } catch (_e) { /* ignore */ }
    }
  };

  const baseInputClass = 'w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-background text-primary-700 placeholder:text-primary-300 transition-all';

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-primary-700 tracking-tight">Créer une tâche</h2>
          <div className="space-y-5">
            <input
              className={baseInputClass}
              placeholder="Titre"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              className={baseInputClass}
              placeholder="Description"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="flex space-x-3">
              <input
                type="date"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.startDate}
                onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
              />
              <input
                type="time"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.startTime}
                onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
              />
            </div>
            <div className="flex space-x-3">
              <input
                type="date"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.endDate}
                onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
              />
              <input
                type="time"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.endTime}
                onChange={e => setNewTask({ ...newTask, endTime: e.target.value })}
              />
            </div>
            <select
              className="w-full border border-border rounded-xl px-4 py-3 bg-background text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all"
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="high">Haute priorité</option>
              <option value="medium">Priorité moyenne</option>
              <option value="low">Basse priorité</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-8">
            <button
              className="px-5 py-2 bg-muted text-primary-400 rounded-xl hover:bg-primary-100 font-semibold transition-all"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className="px-5 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 font-semibold shadow-md transition-all"
              onClick={handleCreateTask}
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}