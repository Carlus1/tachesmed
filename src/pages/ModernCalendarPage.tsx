import { useState } from 'react';
import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import CalendarView from '../components/CalendarView';

interface ModernCalendarPageProps {
  user: User;
}

export default function ModernCalendarPage({ user }: ModernCalendarPageProps) {
  const [view, setView] = useState<'week' | 'month'>('week');

  return (
  <ModernLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
  <h1 className="text-2xl font-bold text-primary-700">Calendrier</h1>
        <div className="flex items-center space-x-2">
            <div className="bg-surface rounded-lg shadow-sm border border-border p-1 flex">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                view === 'week' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                view === 'month' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              Mois
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
        <CalendarView view={view} />
      </div>
    </ModernLayout>
  );
}