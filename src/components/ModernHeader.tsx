import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/gotrue-js';

interface ModernHeaderProps {
  user: User;
  onSignOut: () => void;
}

export default function ModernHeader({ user, onSignOut }: ModernHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold text-gray-900">🏥 TachesMed</h1>
          <nav className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Tâches</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Calendrier</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Messages</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                1
              </span>
            </button>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}