export default function CalendarProposal() {
    return (
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary-700">Proposition de calendrier</h2>
            </div>
            <div className="p-4">
                <p className="text-sm text-primary-400 mb-4">Semaine du 03/07/2023 au 09/07</p>

                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-primary-400">
                            10:00-11:30
                        </div>
                        <div className="flex-1 bg-primary-100 border border-border rounded-lg p-3">
                            <h3 className="font-medium text-primary-800">Réunion d'équipe</h3>
                            <p className="text-sm text-primary-600">(Jean Dupont)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-primary-400">
                            14:00-15:30
                        </div>
                        <div className="flex-1 bg-success-50 border border-border rounded-lg p-3">
                            <h3 className="font-medium text-success-800">Conférence du 05/07</h3>
                            <p className="text-sm text-success-600">(Marie Martin)</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm text-primary-400">
                            14:00-16:00
                        </div>
                        <div className="flex-1 bg-accent-100 border border-border rounded-lg p-3">
                            <h3 className="font-medium text-accent-500">Rapport trimestriel</h3>
                            <p className="text-sm text-accent-500">(Pierre Lambert)</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex border-t border-border">
                <button className="flex-1 py-3 text-center text-primary-700 hover:bg-surface transition-colors">
                    Accepter
                </button>
                <button className="flex-1 py-3 text-center text-primary-700 hover:bg-surface transition-colors border-l border-border">
                    Regénérer
                </button>
            </div>
        </div>
    );
}