import { useState } from 'react';
import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import CalendarView from '../components/CalendarView';
import { useTranslation } from '../i18n/LanguageContext';

interface ModernCalendarPageProps {
  user: User;
}

export default function ModernCalendarPage({ user }: ModernCalendarPageProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'week' | 'month'>('month');
  const [showGlobal, setShowGlobal] = useState(false);

  return (
  <ModernLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
  <h1 className="text-2xl font-bold text-primary-700">{t.calendar.title}</h1>
        <div className="flex items-center space-x-4">
          {/* Checkbox pour vue globale/personnelle */}
          <label className="flex items-center space-x-2 cursor-pointer bg-surface rounded-lg shadow-sm border border-border px-3 py-2">
            <input
              type="checkbox"
              checked={showGlobal}
              onChange={(e) => setShowGlobal(e.target.checked)}
              className="w-4 h-4 text-accent-400 border-border rounded focus:ring-accent-400"
            />
            <span className="text-sm font-medium text-primary-700">
              {showGlobal ? '🌍 Vue globale' : '👤 Vue personnelle'}
            </span>
          </label>
          
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
        <CalendarView view={view} showGlobal={showGlobal} />
      </div>
    </ModernLayout>
  );
}