import type { User } from '@supabase/gotrue-js';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import DashboardGrid from './DashboardGrid';

interface DashboardLayoutProps {
  user: User;
  onSignOut: () => void;
}

export default function DashboardLayout({ user, onSignOut }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader user={user} onSignOut={onSignOut} />
      
      <div className="flex">
        <ModernSidebar onSignOut={onSignOut} />
        <main className="flex-1 p-6 overflow-auto">
          <DashboardGrid />
        </main>
      </div>
    </div>
  );
}