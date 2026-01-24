import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

interface SettingsPageProps {
  user: User;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  subscription_status: string;
  created_at: string;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const { language, setLanguage, t } = useTranslation();
  
  // États pour les préférences
  const [notifications, setNotifications] = useState<boolean>(() => {
    try { return localStorage.getItem('pref_notifications') === '1'; } catch { return true; }
  });
  const [timezone, setTimezone] = useState<string>(() => {
    try { return localStorage.getItem('pref_timezone') ?? Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  
  // États pour le profil
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // États de sauvegarde
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData(prev => ({
        ...prev,
        fullName: data.full_name
      }));
    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Sauvegarde des préférences
      localStorage.setItem('pref_notifications', notifications ? '1' : '0');
      localStorage.setItem('pref_timezone', timezone);

      try {
        await supabase.auth.updateUser({ data: { pref_notifications: notifications ? '1' : '0', pref_timezone: timezone } });
      } catch (err) {
        console.warn('Preferences not persisted server-side:', err);
      }

      // Mise à jour du profil
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mise à jour du mot de passe si fourni
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      setSuccess(t.settings.savedSuccessfully);
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));
      
      await loadProfile();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };



  if (loading) {
    return (
      <ModernLayout user={user}>
        <div className="flex justify-center items-center py-12">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout user={user}>
      <form onSubmit={handleSaveAll}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">{t.settings.title}</h1>
            <p className="text-primary-400 mt-2">{t.settings.subtitle}</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t.settings.saving}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.settings.save}
              </>
            )}
          </button>
        </div>

        {/* Messages de succès et d'erreur globaux */}
        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 mb-4">
            <div className="text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Section Profil */}
          <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-primary-700 mb-4">{t.settings.profileInfo}</h2>
          
          <div className="space-y-4">
            {/* Email (non modifiable) */}
            <div>
              <label className="block text-sm font-medium text-primary-700">
                {t.auth.email}
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-border rounded-md shadow-sm text-primary-400"
              />
            </div>

            {/* Nom complet */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-primary-700">
                {t.settings.fullName}
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Rôle (non modifiable) */}
            <div>
              <label className="block text-sm font-medium text-primary-700">
                {t.settings.role}
              </label>
              <input
                type="text"
                value={profile?.role || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-border rounded-md shadow-sm text-primary-400 capitalize"
              />
            </div>

            {/* Changement de mot de passe */}
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-md font-medium text-primary-700 mb-3">
                {t.settings.changePassword}
              </h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-primary-700">
                    {t.settings.newPassword}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={t.settings.leaveBlankNoChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700">
                    {t.settings.confirmPassword}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Section Préférences */}
          <div className="bg-surface rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-primary-700 mb-4">{t.settings.preferences}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-primary-700">{t.settings.language}</h3>
              <p className="text-sm text-primary-400">
                {t.settings.chooseLanguage}
              </p>
              <div className="mt-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="border border-border rounded-md px-3 py-2 bg-surface"
                >
                  <option value="fr">Français</option>
                  <option value="en">English (UK)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-primary-700">{t.settings.notifications}</h3>
              <p className="text-sm text-primary-400">
                {t.settings.manageNotifications}
              </p>
              <div className="mt-3">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-primary-700">{t.settings.receiveNotifications}</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-primary-700">{t.settings.timezone}</h3>
              <p className="text-sm text-primary-400">{t.settings.selectTimezone}</p>
              <div className="mt-3">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="border border-border rounded-md px-3 py-2 bg-surface"
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        </div>
      </form>
    </ModernLayout>
  );
}
