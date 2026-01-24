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
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPrefs, setSuccessPrefs] = useState<string | null>(null);
  const [successProfile, setSuccessProfile] = useState<string | null>(null);

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

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSuccessPrefs(null);
    setError(null);

    try {
      localStorage.setItem('pref_notifications', notifications ? '1' : '0');
      localStorage.setItem('pref_timezone', timezone);

      try {
        await supabase.auth.updateUser({ data: { pref_notifications: notifications ? '1' : '0', pref_timezone: timezone } });
      } catch (err) {
        console.warn('Preferences not persisted server-side:', err);
      }

      setSuccessPrefs('Préférences enregistrées');
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde des préférences:', err);
      setError('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSavingPrefs(false);
      setTimeout(() => setSuccessPrefs(null), 3000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessProfile(null);
    setSavingProfile(true);

    try {
      // Mise à jour du nom complet
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

      setSuccessProfile('Profil mis à jour avec succès');
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));
      
      await loadProfile();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError(error.message);
    } finally {
      setSavingProfile(false);
      setTimeout(() => setSuccessProfile(null), 3000);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Paramètres</h1>
        <p className="text-primary-400 mt-2">Gérez votre profil et vos préférences.</p>
      </div>

      <div className="space-y-6">
        {/* Section Profil */}
        <form onSubmit={handleUpdateProfile} className="bg-surface rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-primary-700 mb-4">Informations du profil</h2>
          
          <div className="space-y-4">
            {/* Email (non modifiable) */}
            <div>
              <label className="block text-sm font-medium text-primary-700">
                Email
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
                Nom complet
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
                Rôle
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
                Changer le mot de passe
              </h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-primary-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700">
                    Confirmer le nouveau mot de passe
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

          {successProfile && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 mt-4">
              {successProfile}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </button>
          </div>
        </form>

        {/* Section Préférences */}
        <form onSubmit={handleSavePreferences} className="bg-surface rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-primary-700 mb-4">{t.settings.preferences}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-primary-700">{t.settings.language}</h3>
              <p className="text-sm text-primary-400">
                {language === 'fr' ? 'Choisissez la langue de l\'interface.' : 
                 language === 'es' ? 'Elige el idioma de la interfaz.' : 
                 'Choose the interface language.'}
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
                {language === 'fr' ? 'Gérer les notifications par email et in-app.' : 
                 language === 'es' ? 'Gestionar notificaciones por correo electrónico y en la aplicación.' :
                 'Manage email and in-app notifications.'}
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

          {successPrefs && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 mt-4">
              {successPrefs}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={savingPrefs}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {savingPrefs ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </button>
          </div>
        </form>

        {/* Messages d'erreur globaux */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
