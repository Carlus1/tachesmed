interface ModernSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function ModernSidebar({ onSignOut }: ModernSidebarProps) {
    return (
        <aside className={`bg-white dark:bg-surface-dark border-r dark:border-surface p-4 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0 fixed z-40 left-0 top-16 h-[calc(100vh-64px)] w-64' : 'hidden md:block w-80 relative h-[calc(100vh-64px)]'}`}>
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                        Tableau de bord
                    </button>
                </div>

                <nav className="space-y-1">
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg bg-gray-100">
                        Tableau de bord
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Calendrier
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Tâches
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Groupes
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Messages
                    </a>
                </nav>

                <div className="mt-auto">
                    <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Paramètres
                    </a>
                    <button onClick={() => onClose?.()} className="mt-2 w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-surface transition-colors">
                        Fermer
                    </button>
                </div>
            </div>
        </aside>
    );
}