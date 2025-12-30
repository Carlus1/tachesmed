import type { User } from '@supabase/gotrue-js';
import { Link } from 'react-router-dom';

interface ModernHeaderProps {
    user: User;
    onToggleSidebar?: () => void;
    onToggleDark?: () => void;
    dark?: boolean;
    onSignOut?: () => void;
}

export default function ModernHeader({ user, onToggleSidebar, onToggleDark, dark }: ModernHeaderProps) {
    return (
        <header className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-surface p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onToggleSidebar} className="p-2 md:hidden text-gray-600 dark:text-gray-300">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">TachesMed</h1>
                    <div className="hidden md:block">
                        <input placeholder="Recherche..." className="form-input w-72" />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={onToggleDark} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-surface">
                        {dark ? (
                            <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H21M3 12H4.34M18.36 18.36l-.7.7M6.34 6.34l-.7.7M18.36 5.64l-.7-.7M6.34 17.66l-.7-.7M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                        )}
                    </button>

                    <div className="relative group">
                        <button className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.email?.split('@')[0]}</span>
                        </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface">Mon profil</Link>
                                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface">Paramètres</Link>
                                <button onClick={() => onSignOut?.()} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface">Déconnexion</button>
                            </div>
                    </div>
                </div>
            </div>
        </header>
    );
}