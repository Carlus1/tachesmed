import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  return (
    <ModernLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Paramètres</h1>
        <p className="text-primary-400 mt-2">Paramètres du compte et préférences.</p>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
        <p className="text-primary-400">Aucune option disponible pour le moment.</p>
      </div>
    </ModernLayout>
  );
}
