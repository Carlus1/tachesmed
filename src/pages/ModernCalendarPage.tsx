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
        <CalendarView view={view} onViewChange={setView} />
        
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary-700">Prochains événements</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="p-4 hover:bg-surface transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-primary-700">Réunion d'équipe</h3>
                  <p className="text-sm text-primary-300">Demain, 10:00 - 11:30</p>
                  <p className="text-sm text-primary-300 mt-1">Équipe A</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-surface transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-primary-700">Conférence médicale</h3>
                  <p className="text-sm text-primary-300">05/07/2023, 14:00 - 15:30</p>
                  <p className="text-sm text-primary-300 mt-1">Salle de conférence</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-surface transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-primary-700">Rapport trimestriel</h3>
                  <p className="text-sm text-primary-300">07/07/2023, 14:00 - 16:00</p>
                  <p className="text-sm text-primary-300 mt-1">Bureau principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}