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
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary-700">Groupes</h2>
                <button
                    onClick={onCreateGroup}
                    className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    Créer un groupe
                </button>
            </div>
            <div className="divide-y divide-border">
                {groups.map((group) => (
                    <div key={group.id} className="p-4 hover:bg-surface transition-colors">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg ${group.color} flex items-center justify-center text-white mr-3`}>
                                <span className="text-sm font-medium">G</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-primary-700">{group.name}</h3>
                                <p className="text-sm text-primary-400">{group.memberCount} membres</p>
                            </div>
                            <button className="ml-auto text-primary-400 hover:text-primary-700">
                                Voir détails
                            </button>
                        </div>
                    </div>
                ))}
                {groups.length === 0 && (
                    <div className="p-6 text-center text-primary-400">
                        <p>Aucun groupe disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
}