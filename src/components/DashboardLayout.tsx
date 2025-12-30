import type { User } from '@supabase/gotrue-js';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import DashboardGrid from './DashboardGrid';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  user: User;
  onSignOut: () => void;
}

export default function DashboardLayout({ user, onSignOut }: DashboardLayoutProps) {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('theme');
      return v === 'dark';
    } catch (_e) {
      void _e;
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (_e) {
      void _e;
      // ignore
    }
  }, [dark]);

  const handleToggleDark = () => setDark((d) => !d);

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader user={user} onSignOut={onSignOut} dark={dark} onToggleDark={handleToggleDark} />

      <div className="flex">
        <ModernSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <DashboardGrid user={user} />
        </main>
      </div>
    </div>
  );
}