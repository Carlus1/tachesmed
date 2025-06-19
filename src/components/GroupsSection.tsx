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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {groups.map((group) => (
          <div key={group.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg ${group.color} flex items-center justify-center text-white mr-3`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.memberCount} membres</p>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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