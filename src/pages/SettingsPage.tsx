import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [notifications, setNotifications] = useState<boolean>(() => {
    try { return localStorage.getItem('pref_notifications') === '1'; } catch { return true; }
  });
  const [timezone, setTimezone] = useState<string>(() => {
    try { return localStorage.getItem('pref_timezone') ?? Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // No-op for now, could load server-side prefs if available
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      localStorage.setItem('pref_notifications', notifications ? '1' : '0');
      localStorage.setItem('pref_timezone', timezone);

      // Try to persist preferences in a users_metadata column if Supabase user metadata is used
      try {
        await supabase.auth.updateUser({ data: { pref_notifications: notifications ? '1' : '0', pref_timezone: timezone } });
      } catch (err) {
        // ignore server-side persist errors
        console.warn('Preferences not persisted server-side:', err);
      }

      setMessage('Préférences enregistrées');
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde des préférences:', err);
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <ModernLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Paramètres</h1>
        <p className="text-primary-400 mt-2">Paramètres du compte et préférences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface rounded-lg shadow-sm border border-border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-primary-700">Notifications</h2>
          <p className="text-sm text-primary-400">Gérer les notifications par email et in-app.</p>
          <div className="mt-3">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="mr-2" />
              <span className="text-primary-700">Recevoir des notifications</span>
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-primary-700">Fuseau horaire</h2>
          <p className="text-sm text-primary-400">Sélectionnez votre fuseau horaire pour les heures affichées.</p>
          <div className="mt-3">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="border border-border rounded-md px-3 py-2">
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
              <option value="UTC">UTC</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="rounded-md bg-background p-3 text-sm text-primary-700">{message}</div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md">
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </ModernLayout>
  );
}
