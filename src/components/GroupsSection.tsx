interface Group {
    id: string;
    name: string;
    memberCount: number;
    color: string;
}

interface GroupsSectionProps {
    groups: Group[];
    onCreateGroup: () => void;
}

export default function GroupsSection({ groups, onCreateGroup }: GroupsSectionProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Groupes</h2>
                <button className="text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Voir plus</span>
                    Voir plus
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                {groups.map((group) => (
                    <div key={group.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg ${group.color} flex items-center justify-center text-white mr-3`}>
                                <span className="text-sm font-medium">G</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500">{group.memberCount} membres</p>
                            </div>
                            <button className="ml-auto text-gray-400 hover:text-gray-600">
                                Voir détails
                            </button>
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <p>Aucun groupe disponible</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={onCreateGroup}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Créer un groupe
                </button>
            </div>
        </div>
    );
}