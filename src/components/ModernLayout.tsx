import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';

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
  }, [dark]);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-primary-700 dark:text-surface">
      <ModernHeader
        user={user}
        onToggleSidebar={() => setSidebarOpen(open => !open)}
        onToggleDark={() => setDark(d => !d)}
        dark={dark}
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
