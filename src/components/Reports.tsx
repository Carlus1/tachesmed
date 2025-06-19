import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import Breadcrumb from './Breadcrumb';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlobalCalendar from './GlobalCalendar';

interface ReportsProps {
  user: User;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

interface UserStats {
  total: number;
  active: number;
  byRole: {
    owner: number;
    admin: number;
    user: number;
  };
}

interface GroupStats {
  total: number;
  averageMembers: number;
  mostActive: {
    name: string;
    taskCount: number;
  };
}

interface AvailabilityStats {
  total: number;
  averageDuration: number;
  mostAvailableDay: string;
}

export default function Reports({ user }: ReportsProps) {
  const [selectedReport, setSelectedReport] = useState<string>('calendar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [groupStats, setGroupStats] = useState<GroupStats | null>(null);
  const [availabilityStats, setAvailabilityStats] = useState<AvailabilityStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [selectedReport]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (selectedReport) {
        case 'tasks':
          await loadTaskStats();
          break;
        case 'users':
          await loadUserStats();
          break;
        case 'groups':
          await loadGroupStats();
          break;
        case 'availabilities':
          await loadAvailabilityStats();
          break;
        case 'calendar':
          // No need to load anything, GlobalCalendar handles its own data
          setLoading(false);
          break;
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadTaskStats = async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) throw error;

    const stats: TaskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter(t => new Date(t.end_date) < new Date()).length || 0,
      inProgress: tasks?.filter(t => new Date(t.end_date) >= new Date()).length || 0,
      byPriority: {
        high: tasks?.filter(t => t.priority === 'high').length || 0,
        medium: tasks?.filter(t => t.priority === 'medium').length || 0,
        low: tasks?.filter(t => t.priority === 'low').length || 0
      }
    };

    setTaskStats(stats);
  };

  const loadUserStats = async () => {
    const { data: usersData, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    const uniqueUsers = new Map<string, any>();
    
    usersData?.forEach(user => {
      const lowerEmail = user.email.toLowerCase();
      if (!uniqueUsers.has(lowerEmail) || 
          new Date(user.created_at) > new Date(uniqueUsers.get(lowerEmail).created_at)) {
        uniqueUsers.set(lowerEmail, user);
      }
    });
    
    const users = Array.from(uniqueUsers.values());

    const stats: UserStats = {
      total: users.length || 0,
      active: users.filter(u => u.subscription_status === 'active').length || 0,
      byRole: {
        owner: users.filter(u => u.role === 'owner').length || 0,
        admin: users.filter(u => u.role === 'admin').length || 0,
        user: users.filter(u => u.role === 'user').length || 0
      }
    };

    setUserStats(stats);
  };

  const loadGroupStats = async () => {
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(count),
        tasks(count)
      `);

    if (groupsError) throw groupsError;

    const stats: GroupStats = {
      total: groups?.length || 0,
      averageMembers: groups?.reduce((acc, g) => acc + (g.members?.count || 0), 0) / (groups?.length || 1),
      mostActive: {
        name: 'Aucun groupe',
        taskCount: 0
      }
    };

    if (groups && groups.length > 0) {
      const mostActive = groups.reduce((max, g) => 
        (g.tasks?.count || 0) > (max.tasks?.count || 0) ? g : max
      );
      stats.mostActive = {
        name: mostActive.name,
        taskCount: mostActive.tasks?.count || 0
      };
    }

    setGroupStats(stats);
  };

  const loadAvailabilityStats = async () => {
    const { data: availabilities, error } = await supabase
      .from('availabilities')
      .select('*');

    if (error) throw error;

    const stats: AvailabilityStats = {
      total: availabilities?.length || 0,
      averageDuration: 0,
      mostAvailableDay: 'Aucune donnée'
    };

    if (availabilities && availabilities.length > 0) {
      const totalDuration = availabilities.reduce((acc, a) => {
        const start = new Date(a.start_time);
        const end = new Date(a.end_time);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);
      stats.averageDuration = totalDuration / availabilities.length;

      const dayCount: { [key: string]: number } = {};
      availabilities.forEach(a => {
        const day = format(new Date(a.start_time), 'EEEE', { locale: fr });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      stats.mostAvailableDay = Object.entries(dayCount)
        .reduce((max, [day, count]) => count > (dayCount[max] || 0) ? day : max, '');
    }

    setAvailabilityStats(stats);
  };

  const renderStats = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      );
    }

    switch (selectedReport) {
      case 'calendar':
        return <GlobalCalendar />;

      case 'tasks':
        return taskStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Total des tâches</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{taskStats.total}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-green-900">Tâches terminées</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{taskStats.completed}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-yellow-900">Tâches en cours</h3>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{taskStats.inProgress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium mb-6 text-gray-900">Répartition par priorité</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Haute</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${taskStats.total ? (taskStats.byPriority.high / taskStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{taskStats.byPriority.high}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Moyenne</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${taskStats.total ? (taskStats.byPriority.medium / taskStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{taskStats.byPriority.medium}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Basse</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${taskStats.total ? (taskStats.byPriority.low / taskStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{taskStats.byPriority.low}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return userStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-purple-900">Total des utilisateurs</h3>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{userStats.total}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-green-900">Utilisateurs actifs</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{userStats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium mb-6 text-gray-900">Répartition par rôle</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Propriétaire</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${userStats.total ? (userStats.byRole.owner / userStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{userStats.byRole.owner}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Admin</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${userStats.total ? (userStats.byRole.admin / userStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{userStats.byRole.admin}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">Utilisateur</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-in-out" 
                      style={{ width: `${userStats.total ? (userStats.byRole.user / userStats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-600">{userStats.byRole.user}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'groups':
        return groupStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-indigo-900">Total des groupes</h3>
                  <p className="text-4xl font-bold text-indigo-600 mt-2">{groupStats.total}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Moyenne des membres</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{groupStats.averageMembers.toFixed(1)}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-green-900">Groupe le plus actif</h3>
                  <p className="text-xl font-bold text-green-600 mt-2">{groupStats.mostActive.name}</p>
                  <p className="text-sm text-green-500">{groupStats.mostActive.taskCount} tâches</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'availabilities':
        return availabilityStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Total des disponibilités</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{availabilityStats.total}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-green-900">Durée moyenne</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {Math.round(availabilityStats.averageDuration)} min
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-purple-900">Jour le plus disponible</h3>
                  <p className="text-xl font-bold text-purple-600 mt-2">{availabilityStats.mostAvailableDay}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Breadcrumb />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Rapports et statistiques</h1>
          <p className="mt-2 text-gray-600">Sélectionnez un rapport pour voir les statistiques détaillées</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Liste des rapports */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-4 space-y-2">
            {[
              {
                id: 'calendar',
                title: 'Calendrier Global',
                description: 'Vue globale des tâches et assignations',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                id: 'tasks',
                title: 'Rapport des tâches',
                description: 'Statistiques sur les tâches',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )
              },
              {
                id: 'users',
                title: 'Rapport des utilisateurs',
                description: "Vue d'ensemble des utilisateurs",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              },
              {
                id: 'groups',
                title: 'Rapport des groupes',
                description: 'Analyse des groupes',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                id: 'availabilities',
                title: 'Rapport des disponibilités',
                description: 'Statistiques des disponibilités',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 flex items-center ${
                  selectedReport === report.id
                    ? 'bg-blue-50 shadow-sm transform scale-[1.02]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${
                  selectedReport === report.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {report.icon}
                </div>
                <div>
                  <div className={`font-medium ${
                    selectedReport === report.id
                      ? 'text-blue-700'
                      : 'text-gray-900'
                  }`}>
                    {report.title}
                  </div>
                  <div className={`text-sm ${
                    selectedReport === report.id
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}>
                    {report.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Contenu du rapport */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            {renderStats()}
          </div>
        </div>
      </div>
    </div>
  );
}