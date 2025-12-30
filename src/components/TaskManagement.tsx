import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Breadcrumb from './Breadcrumb';
import TaskForm from './TaskForm';

interface TaskManagementProps {
  user: User;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
  group_id: string;
  group?: {
    name: string;
  };
}

export default function TaskManagement({ user: _user }: TaskManagementProps) {
  void _user;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          group:groups (
            name
          )
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des tâches:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
    loadTasks();
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTask(taskId);
      setError(null);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setSuccess('Tâche supprimée avec succès');
      setShowDeleteConfirm(null);
      loadTasks();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      setError('Erreur lors de la suppression de la tâche: ' + error.message);
    } finally {
      setDeletingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error-600 bg-error-50 border-error-200';
      case 'medium':
        return 'text-accent-600 bg-accent-50 border-accent-200';
      case 'low':
        return 'text-success-600 bg-success-50 border-success-200';
      default:
        return 'text-primary-400 bg-primary-100 border-border';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP', { locale: fr });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary-700">Gestion des tâches</h1>
          <button
            onClick={() => {
              setEditingTaskId(null);
              setShowTaskForm(true);
            }}
            className="px-4 py-2.5 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors flex items-center shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle tâche
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-error-700 bg-error-100 rounded-lg border border-error-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 text-success-700 bg-success-100 rounded-lg border border-success-200 animate-fade-in">
            {success}
          </div>
        )}

  <div className="bg-surface rounded-lg shadow-sm border overflow-hidden">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-primary-300">
                <svg className="mx-auto h-12 w-12 text-primary-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Aucune tâche n'a été créée pour le moment.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-primary-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Groupe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Date de début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-700">{task.title}</div>
                        <div className="text-sm text-primary-300">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-700">{task.group?.name || 'Groupe inconnu'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-300">
                        {formatDate(task.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-300">
                        {task.duration} minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTask(task.id)}
                          className="text-primary-600 hover:text-primary-700 mr-4 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(task.id)}
                          className="text-error-600 hover:text-error-800 transition-colors"
                          disabled={deletingTask === task.id}
                        >
                          {deletingTask === task.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showTaskForm && (
          <TaskForm 
            onClose={handleTaskCreated} 
            taskId={editingTaskId}
          />
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
              <h3 className="text-lg font-medium mb-4 text-primary-700">Confirmer la suppression</h3>
              <p className="text-primary-400 mb-4">
                Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border rounded-md text-primary-700 hover:bg-surface transition-colors"
                  disabled={deletingTask !== null}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm) handleDeleteTask(showDeleteConfirm);
                  }}
                  disabled={deletingTask !== null}
                  className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 disabled:opacity-50 transition-colors"
                >
                  {deletingTask ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}