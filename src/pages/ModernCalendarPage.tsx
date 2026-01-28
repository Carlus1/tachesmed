import { useState, useEffect } from 'react';
import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import CalendarView from '../components/CalendarView';
import { useTranslation } from '../i18n/LanguageContext';
import { supabase } from '../supabase';

interface ModernCalendarPageProps {
  user: User;
}

interface UserGroup {
  id: string;
  name: string;
}

export default function ModernCalendarPage({ user }: ModernCalendarPageProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'week' | 'month'>('month');
  const [showGlobal, setShowGlobal] = useState(false);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Charger les groupes de l'utilisateur
  useEffect(() => {
    const loadUserGroups = async () => {
      const { data: groupMemberships } = await supabase
        .from('group_members')
        .select('group_id, groups!inner(id, name)')
        .eq('user_id', user.id);

      if (groupMemberships) {
        const groups = groupMemberships.map(m => ({
          id: (m as any).groups.id,
          name: (m as any).groups.name
        }));
        setUserGroups(groups);
      }
    };
    loadUserGroups();
  }, [user.id]);

  return (
  <ModernLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
  <h1 className="text-2xl font-bold text-primary-700">{t.calendar.title}</h1>
        <div className="flex items-center space-x-4">
          {/* Checkbox pour vue équipe/personnelle */}
          <label className="flex items-center space-x-2 cursor-pointer bg-surface rounded-lg shadow-sm border border-border px-3 py-2">
            <input
              type="checkbox"
              checked={showGlobal}
              onChange={(e) => setShowGlobal(e.target.checked)}
              className="w-4 h-4 text-accent-400 border-border rounded focus:ring-accent-400"
            />
            <span className="text-sm font-medium text-primary-700">
              {showGlobal ? '👥 Vue équipe' : '👤 Mes tâches'}
            </span>
          </label>

          {/* Sélecteur de groupe si plusieurs groupes et vue équipe */}
          {showGlobal && userGroups.length > 1 && (
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="px-3 py-2 bg-surface rounded-lg shadow-sm border border-border text-sm font-medium text-primary-700 focus:ring-accent-400 focus:border-accent-400"
            >
              <option value="">Tous mes groupes</option>
              {userGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          )}
          
            <div className="bg-surface rounded-lg shadow-sm border border-border p-1 flex">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                view === 'week' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              {t.calendar.week}
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                view === 'month' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              {t.calendar.month}
            </button>
          </div>
          <button className="p-2 bg-accent-400 text-white rounded-lg hover:bg-accent-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CalendarView view={view} showGlobal={showGlobal} selectedGroupId={selectedGroupId} />
      </div>
    </ModernLayout>
  );
}