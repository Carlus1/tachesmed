import { useEffect, useState } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import RoleBadge from './RoleBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardProps { user: User }

interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  subscription_status: string;
  created_at: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadTasks();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email?.toLowerCase(),
              full_name: (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
              role: user.email?.toLowerCase() === 'carl.frenee@gmail.com' ? 'owner' : 'user',
              subscription_status: 'active',
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile as UserProfile);
      } else {
        setProfile(profileData as UserProfile);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          created_by_user:users!created_by (id, full_name),
          assigned_to_user:users!assigned_to (id, full_name)
        `)
        .order('start_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      setTasks((data || []) as TaskItem[]);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      navigate('/login');
    }
  };

  const formatDate = (date: string) => format(new Date(date), 'PPP', { locale: fr });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <p className="text-error-600 mb-4">{error || 'Profil non trouvé'}</p>
          <button onClick={handleSignOut} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary-700">TachesMed</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-primary-400">Bonjour, {profile.full_name}</span>
              <RoleBadge role={profile.role} />
              <button onClick={() => navigate('/profile')} className="px-4 py-2 text-primary-700 hover:text-primary-900 font-medium transition-colors">
                Mon Profil
              </button>
              <button onClick={handleSignOut} className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-800 transition-colors">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
                  <div className="bg-surface p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-primary-700 mb-6">Tableau de bord</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {profile.role === 'owner' && (
                <>
                  <button onClick={() => navigate('/users')} className="p-6 bg-gradient-to-br from-primary-100 to-primary-200 hover:from-primary-100 hover:to-primary-200 rounded-xl text-left transition-all transform hover:scale-105">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-primary-700">Gestion des utilisateurs</h4>
                    </div>
                    <p className="text-primary-600">Gérer les utilisateurs et les accès</p>
                  </button>

                  <button onClick={() => navigate('/reports')} className="p-6 bg-gradient-to-br from-success-100 to-success-200 hover:from-success-100 hover:to-success-200 rounded-xl text-left transition-all transform hover:scale-105">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-success-800">Rapports</h4>
                    </div>
                    <p className="text-success-600">Voir les statistiques et rapports</p>
                  </button>

                  <button onClick={() => navigate('/groups')} className="p-6 bg-gradient-to-br from-accent-100 to-accent-200 hover:from-accent-100 hover:to-accent-200 rounded-xl text-left transition-all transform hover:scale-105">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-accent-800">Gestion des groupes</h4>
                    </div>
                    <p className="text-accent-600">Gérer les groupes et membres</p>
                  </button>

                  <button onClick={() => navigate('/tasks')} className="p-6 bg-gradient-to-br from-accent-100 to-accent-200 hover:from-accent-100 hover:to-accent-200 rounded-xl text-left transition-all transform hover:scale-105">
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-accent-800">Gestion des tâches</h4>
                    </div>
                    <p className="text-accent-600">Créer et gérer les tâches</p>
                  </button>
                </>
              )}

              <button onClick={() => navigate('/availabilities')} className="p-6 bg-gradient-to-br from-primary-100 to-primary-200 hover:from-primary-100 hover:to-primary-200 rounded-xl text-left transition-all transform hover:scale-105">
                <div className="mb-3">
                  <h4 className="text-lg font-semibold text-primary-700">Mes disponibilités</h4>
                </div>
                <p className="text-primary-600">Gérer mes disponibilités</p>
              </button>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary-700">Tâches récentes</h3>
                <button onClick={() => navigate('/tasks')} className="text-primary-600 hover:text-primary-800 font-medium">Voir toutes les tâches →</button>
              </div>

                {tasks.length === 0 ? (
                <div className="text-center py-8 text-primary-400 bg-primary-100 rounded-lg">
                  <p className="mb-4">Aucune tâche pour le moment.</p>
                </div>
              ) : (
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-primary-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">Titre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">Priorité</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">Date de début</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">Durée</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        {tasks.map((task) => (
                          <tr key={task.id} className="hover:bg-surface transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-primary-700">{task.title}</div>
                              <div className="text-sm text-primary-400">{task.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400">{formatDate(task.start_date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-400">{task.duration} minutes</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
