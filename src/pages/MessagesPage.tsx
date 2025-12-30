import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';

interface MessagesPageProps {
  user: User;
}

export default function MessagesPage({ user }: MessagesPageProps) {
  return (
    <ModernLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Messages</h1>
        <p className="text-primary-400 mt-2">Boîte de réception et conversations à venir.</p>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
        <p className="text-primary-400">Aucune conversation pour le moment.</p>
      </div>
    </ModernLayout>
  );
}
