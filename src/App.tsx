import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './components/Login';
import ModernDashboard from './components/ModernDashboard';
import ModernCalendarPage from './pages/ModernCalendarPage';
import ModernTasksPage from './pages/ModernTasksPage';
import ModernGroupsPage from './pages/ModernGroupsPage';
import ModernReportsPage from './pages/ModernReportsPage';
import ModernUsersPage from './pages/ModernUsersPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import Availabilities from './components/Availabilities';
import type { User } from '@supabase/gotrue-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App: Initializing...');
    
    // Vérifier la configuration Supabase
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Configuration Supabase manquante. Vérifiez vos variables d\'environnement.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setError('Erreur de connexion à Supabase');
      } else {
        setUser(session?.user ?? null);
        console.log('Session récupérée:', session?.user ? 'Utilisateur connecté' : 'Pas d\'utilisateur');
      }
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user ? 'Utilisateur connecté' : 'Pas d\'utilisateur');
      setUser(session?.user ?? null);
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-400">Chargement de TachesMed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 border border-border">
          <div className="text-center">
            <div className="text-accent-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-primary-700 mb-2">Erreur de Configuration</h1>
            <p className="text-primary-400 mb-4">{error}</p>
            <div className="text-sm text-primary-400 bg-background p-3 rounded-xl border border-border">
              <p className="font-semibold mb-2">Variables d'environnement requises :</p>
              <ul className="text-left space-y-1">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 shadow-md transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <ModernDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/users" element={user ? <ModernUsersPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/reports" element={user ? <ModernReportsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <ModernCalendarPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/groups" element={user ? <ModernGroupsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/groups/:id" element={user ? <GroupDetailPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={user ? <ModernTasksPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <MessagesPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <SettingsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/availabilities" element={user ? <Availabilities user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={<Navigate to="/settings" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;