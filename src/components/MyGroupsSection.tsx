export default function MyGroupsSection() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mes groupes</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-blue-800">Équipe A</h3>
                        <span className="text-sm text-blue-600">5 membres</span>
                    </div>
                    <button className="absolute bottom-2 right-2 text-blue-600 hover:text-blue-800">
                        <span className="sr-only">Voir détails</span>
                    </button>
                </div>

                <div className="bg-teal-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-teal-800">Équipe B</h3>
                        <span className="text-sm text-teal-600">8 membres</span>
                    </div>
                    <button className="absolute bottom-2 right-2 text-teal-600 hover:text-teal-800">
                        <span className="sr-only">Voir détails</span>
                    </button>
                </div>

                <div className="bg-purple-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-purple-800">Équipe C</h3>
                        <span className="text-sm text-purple-600">3 membres</span>
                    </div>
                    <button className="absolute bottom-2 right-2 text-purple-600 hover:text-purple-800">
                        <span className="sr-only">Voir détails</span>
                    </button>
                </div>
            </div>
        </div>
    );
}