import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
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
  const [useModernUI, setUseModernUI] = useState(true); // Activer l'interface moderne par défaut

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? (useModernUI ? <ModernDashboard user={user} /> : <Dashboard user={user} />) : <Navigate to="/login" />} />
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