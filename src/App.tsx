import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './components/Login';
import ModernDashboard from './components/ModernDashboard';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import GroupManagement from './components/GroupManagement';
import TaskManagement from './components/TaskManagement';
import Availabilities from './components/Availabilities';
import Profile from './components/Profile';
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user ? 'Utilisateur connecté' : 'Pas d\'utilisateur');
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de TachesMed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur de Configuration</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-2">Variables d'environnement requises :</p>
              <ul className="text-left space-y-1">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <Route path="/users" element={user ? <UserManagement user={user} /> : <Navigate to="/login" />} />
        <Route path="/reports" element={user ? <Reports user={user} /> : <Navigate to="/login" />} />
        <Route path="/groups" element={user ? <GroupManagement user={user} /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={user ? <TaskManagement user={user} /> : <Navigate to="/login" />} />
        <Route path="/availabilities" element={user ? <Availabilities user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;