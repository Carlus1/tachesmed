export default function CalendarProposal() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Proposition de calendrier</h2>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Semaine du 03/07/2023 au 09/07</p>

                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                            10:00-11:30
                        </div>
                        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h3 className="font-medium text-blue-800">Réunion d'équipe</h3>
                            <p className="text-sm text-blue-600">(Jean Dupont)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                            14:00-15:30
                        </div>
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                            <h3 className="font-medium text-green-800">Conférence du 05/07</h3>
                            <p className="text-sm text-green-600">(Marie Martin)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-gray-500">
                            14:00-16:00
                        </div>
                        <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <h3 className="font-medium text-purple-800">Rapport trimestriel</h3>
                            <p className="text-sm text-purple-600">(Pierre Lambert)</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex border-t border-gray-200">
                <button className="flex-1 py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors">
                    Accepter
                </button>
                <button className="flex-1 py-3 text-center text-gray-700 hover:bg-gray-50 transition-colors border-l border-gray-200">
                    Regénérer
                </button>
            </div>
        </div>
    );
}