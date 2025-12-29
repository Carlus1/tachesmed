interface ModernSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function ModernSidebar({ isOpen = false, onClose }: ModernSidebarProps) {
    return (
        <aside className={`bg-surface dark:bg-surface-dark border-r border-border dark:border-surface p-4 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0 fixed z-40 left-0 top-16 h-[calc(100vh-64px)] w-64' : 'hidden md:block w-80 relative h-[calc(100vh-64px)]'}`}>
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                        Tableau de bord
                    </button>
                </div>

                <nav className="space-y-1">
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg bg-primary-100">
                        Tableau de bord
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg hover:bg-surface transition-colors">
                        Calendrier
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg hover:bg-surface transition-colors">
                        Tâches
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg hover:bg-surface transition-colors">
                        Groupes
                    </a>
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg hover:bg-surface transition-colors">
                        Messages
                    </a>
                </nav>

                <div className="mt-auto">
                    <a href="#" className="flex items-center px-3 py-2 text-primary-700 rounded-lg hover:bg-surface transition-colors">
                        Paramètres
                    </a>
                    <button onClick={() => onClose?.()} className="mt-2 w-full text-left px-3 py-2 text-primary-700 dark:text-surface rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors">
                        Fermer
                    </button>
                </div>
            </div>
        </aside>
    );
}