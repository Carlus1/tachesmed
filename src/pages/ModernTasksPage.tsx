import { useState } from 'react';
import ModernLayout from '../components/ModernLayout';
import TaskList from '../components/TaskList';
import type { User } from '@supabase/gotrue-js';

interface ModernTasksPageProps {
  user: User;
}

export default function ModernTasksPage({ user }: ModernTasksPageProps) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  return (
  <ModernLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-700">Gestion des tâches</h1>
        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle tâche
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Filtrer par</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Toutes les tâches</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminées</option>
                <option value="high">Priorité haute</option>
                <option value="medium">Priorité moyenne</option>
                <option value="low">Priorité basse</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Date</option>
                <option value="priority">Priorité</option>
                <option value="title">Titre</option>
                <option value="group">Groupe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Groupe</label>
              <select
                className="w-full sm:w-auto px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les groupes</option>
                <option value="team-a">Équipe A</option>
                <option value="team-b">Équipe B</option>
                <option value="team-c">Équipe C</option>
              </select>
            </div>
            
            <div className="ml-auto self-end">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TaskList />
      </div>
    </ModernLayout>
  );
}