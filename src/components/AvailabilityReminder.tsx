export default function AvailabilityReminder() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Rappel de disponibilités</h2>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-yellow-500 font-bold text-xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-center mb-2">Il reste 2 jours</h3>
        <p className="text-gray-600 text-center mb-6">
          pour compléter vos disponibilités pour la semaine du 10/07.
        </p>
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Compléter maintenant
        </button>
      </div>
    </div>
  );
}