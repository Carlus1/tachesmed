import { Link } from 'react-router-dom';

export default function MyGroupsSection() {
    return (
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary-700">Mes groupes</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-primary-700">Équipe A</h3>
                        <span className="text-sm text-primary-600">5 membres</span>
                    </div>
                    <Link to="/groups/1" className="absolute bottom-2 right-2 text-primary-600 hover:text-primary-800">
                        Voir détails
                    </Link>
                </div>

                <div className="bg-accent-50 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-accent-800">Équipe B</h3>
                        <span className="text-sm text-accent-600">8 membres</span>
                    </div>
                    <Link to="/groups/2" className="absolute bottom-2 right-2 text-accent-600 hover:text-accent-800">
                        Voir détails
                    </Link>
                </div>

                <div className="bg-accent-50 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-accent-800">Équipe C</h3>
                        <span className="text-sm text-accent-600">3 membres</span>
                    </div>
                    <Link to="/groups/3" className="absolute bottom-2 right-2 text-accent-600 hover:text-accent-800">
                        Voir détails
                    </Link>
                </div>
            </div>
        </div>
    );
}