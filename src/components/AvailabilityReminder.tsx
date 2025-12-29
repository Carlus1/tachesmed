export default function AvailabilityReminder() {
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary-700">Rappel de disponibilités</h2>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-warning-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-warning-600 font-bold text-xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-center mb-2">Il reste 2 jours</h3>
        <p className="text-primary-400 text-center mb-6">
          pour compléter vos disponibilités pour la semaine du 10/07.
        </p>
        <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
          Compléter maintenant
        </button>
      </div>
    </div>
  );
}