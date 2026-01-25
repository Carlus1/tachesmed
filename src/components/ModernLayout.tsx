import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import { supabase } from '../supabase';

interface ModernLayoutProps {
  user: User;
  children: React.ReactNode;
}

export default function ModernLayout({ user, children }: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (_e) { void _e; /* ignore */ }
  }, [dark]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary-700 dark:text-surface">
      <ModernHeader
        user={user}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onToggleDark={() => setDark((d: boolean) => !d)}
        dark={dark}
        onSignOut={handleSignOut}
      />

      <div className="flex">
        <ModernSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
