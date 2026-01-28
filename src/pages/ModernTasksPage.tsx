import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import ModernLayout from '../components/ModernLayout';
import TaskManagement from '../components/TaskManagement';
import { supabase } from '../supabase';

interface ModernTasksPageProps {
  user: User;
}

export default function ModernTasksPage({ user }: ModernTasksPageProps) {
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setUserRole(data?.role || 'user');
      } catch (err) {
        console.error('Erreur lors de la vérification du rôle:', err);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, [user.id]);

  if (loading) {
    return (
      <ModernLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-primary-500">Chargement...</div>
        </div>
      </ModernLayout>
    );
  }

  if (userRole !== 'owner' && userRole !== 'admin') {
    return (
      <ModernLayout user={user}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="bg-surface rounded-lg p-8 max-w-md text-center border border-border">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-primary-700 mb-2">Accès restreint</h2>
            <p className="text-primary-500">
              Cette page est réservée aux administrateurs et propriétaires.
            </p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout user={user}>
      <TaskManagement user={user} />
    </ModernLayout>
  );
}
