import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardProps {
    user: User;
}

interface UserProfile {
    id: string;
    email: string;
    role: string;
    full_name: string;
    subscription_status: string;
    created_at: string;
}

interface Task {
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
    const [tasks, setTasks] = useState<Task[]>([]);
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

            // Essayer d'abord de récupérer le profil depuis la table users
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) throw profileError;

            // Si le profil n'existe pas, le créer
            if (!profileData) {
                const { data: newProfile, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        id: user.id,
                        email: user.email?.toLowerCase(),
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
                        role: user.email?.toLowerCase() === 'carl.frenee@gmail.com' ? 'owner' : 'user',
                        subscription_status: 'active'
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                setProfile(newProfile);
            } else {
                setProfile(profileData);
            }
        } catch (error: any) {
            console.error('Erreur lors du chargement du profil:', error);
            setError('Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('start_date', { ascending: true })
                .limit(5);

            if (error) throw error;
            setTasks(data || []);
        } catch (error: any) {
            console.error('Erreur lors du chargement des tâches:', error);
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

    const formatDate = (date: string) => {
        return format(new Date(date), 'PPP', { locale: fr });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <p className="text-red-600 mb-4">{error || 'Profil non trouvé'}</p>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                TachesMed
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Bonjour, {profile.full_name}
                            </span>
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                                Mon Profil
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Tableau de bord
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {profile.role === 'owner' && (
                                <>
                                    <button
                                        onClick={() => navigate('/users')}
                                        className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-left transition-all transform hover:scale-105"
                                    >
                                        <div className="mb-3">
                                            <h4 className="text-lg font-semibold text-blue-900">Gestion des utilisateurs</h4>
                                        </div>
                                        <p className="text-blue-700">Gérer les utilisateurs et les accès</p>
                                    </button>

                                    <button
                                        onClick={() => navigate('/reports')}
                                        className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all transform hover:scale-105"
                                    >
                                        <div className="mb-3">
                                            <h4 className="text-lg font-semibold text-green-900">Rapports</h4>
                                        </div>
                                        <p className="text-green-700">Voir les statistiques et rapports</p>
                                    </button>
                                </>
                            )}

                            {(profile.role === 'owner' || profile.role === 'admin') && (
                                <>
                                    <button
                                        onClick={() => navigate('/groups')}
                                        className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-left transition-all transform hover:scale-105"
                                    >
                                        <div className="mb-3">
                                            <h4 className="text-lg font-semibold text-purple-900">Gestion des groupes</h4>
                                        </div>
                                        <p className="text-purple-700">Gérer les groupes et membres</p>
                                    </button>

                                    <button
                                        onClick={() => navigate('/tasks')}
                                        className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl text-left transition-all transform hover:scale-105"
                                    >
                                        <div className="mb-3">
                                            <h4 className="text-lg font-semibold text-yellow-900">Gestion des tâches</h4>
                                        </div>
                                        <p className="text-yellow-700">Créer et gérer les tâches</p>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => navigate('/availabilities')}
                                className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl text-left transition-all transform hover:scale-105"
                            >
                                <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-indigo-900">Mes disponibilités</h4>
                                </div>
                                <p className="text-indigo-700">Gérer mes disponibilités</p>
                            </button>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Tâches récentes</h3>
                                <button
                                    onClick={() => navigate('/tasks')}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Voir toutes les tâches →
                                </button>
                            </div>

                            {tasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    <p className="mb-4">Aucune tâche pour le moment.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Titre
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Priorité
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date de début
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Durée
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {tasks.map((task) => (
                                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                                            <div className="text-sm text-gray-500">{task.description}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                                                                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(task.start_date)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {task.duration} minutes
                                                        </td>
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