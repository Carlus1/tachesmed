interface ModernSidebarProps {
    onSignOut: () => void;
}

export default function ModernSidebar({ onSignOut }: ModernSidebarProps) {
    return (
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-64px)] p-4">
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
                    <a href="#" onClick={(e) => { e.preventDefault(); onSignOut(); }} className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        Déconnexion
                    </a>
                </div>
            </div>
        </aside>
    );
}