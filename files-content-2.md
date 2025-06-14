## 📄 **5. src/main.tsx** (Point d'entrée React)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 📄 **6. src/supabase.ts** (Configuration Supabase)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'tachesmed' }
  }
});
```

## 📄 **7. src/App.tsx** (Composant principal - PARTIE 1)

```typescript
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
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
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
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
```