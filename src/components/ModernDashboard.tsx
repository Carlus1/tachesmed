import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface ModernDashboardProps {
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
  group?: {
    name: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  color: string;
}

export default function ModernDashboard({ user }: ModernDashboardProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les tâches
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          group:groups (name)
        `)
        .order('start_date', { ascending: true })
        .limit(10);

      // Charger les groupes
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      setTasks(tasksData || []);
      
      // Simuler des groupes avec couleurs
      const groupsWithColors = (groupsData || []).map((group, index) => ({
        ...group,
        memberCount: Math.floor(Math.random() * 10) + 3,
        color: ['bg-blue-500', 'bg-teal-500', 'bg-purple-500'][index % 3]
      }));
      
      setGroups(groupsWithColors);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
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
          group_id: groups[0]?.id // Utiliser le premier groupe disponible
        }]);

      if (error) throw error;

      setShowTaskModal(false);
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
      loadData();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate('/login');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">🏥 TachesMed</h1>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Tâches</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Calendrier</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Messages</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  1
                </span>
              </button>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-64px)] p-4">
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <button 
                onClick={() => setShowTaskModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </button>
            </div>
            
            {/* Tâches à venir */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tâches à venir</h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Réunion d'équipe</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Haute
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Discussion sur les projets en cours</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6H2a1 1 0 110-2h4z" />
                    </svg>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Rapport trimestriel</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Moyenne
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Préparation et révision du rapport</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6H2a1 1 0 110-2h4z" />
                    </svg>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Formation nouveau logiciel</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Basse
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Session de formation sur le nouveau système</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 Your project has been cleaned, you should be able to conti