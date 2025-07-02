import { Link, useLocation } from 'react-router-dom';

const routes = {
    '/': 'Accueil',
    '/tasks': 'Gestion des tâches',
    '/users': 'Gestion des utilisateurs',
    '/reports': 'Rapports',
    '/groups': 'Gestion des groupes',
    '/availabilities': 'Mes disponibilités',
    '/profile': 'Mon profil'
};

export default function Breadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-12">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link
                                to="/"
                                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                            >
                                Accueil
                            </Link>
                        </li>
                        {pathnames.map((value, index) => {
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;

                            return (
                                <li key={to} className="flex items-center">
                                    <span className="text-gray-400 mx-2">/</span>
                                    {isLast ? (
                                        <span className="text-gray-900 font-medium">
                                            {routes[to as keyof typeof routes]}
                                        </span>
                                    ) : (
                                        <Link
                                            to={to}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            {routes[to as keyof typeof routes]}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </nav>
    );
}