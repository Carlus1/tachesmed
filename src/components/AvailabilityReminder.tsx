import { useState } from 'react';
import { supabase } from '../supabase';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AvailabilityReminder() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [availabilities, setAvailabilities] = useState<{
    date: Date;
    slots: { start: string; end: string; selected: boolean }[];
  }[]>([
    {
      date: addDays(new Date(), 7),
      slots: [
        { start: '08:00', end: '10:00', selected: false },
        { start: '10:00', end: '12:00', selected: false },
        { start: '14:00', end: '16:00', selected: false },
        { start: '16:00', end: '18:00', selected: false }
      ]
    },
    {
      date: addDays(new Date(), 8),
      slots: [
        { start: '08:00', end: '10:00', selected: false },
        { start: '10:00', end: '12:00', selected: false },
        { start: '14:00', end: '16:00', selected: false },
        { start: '16:00', end: '18:00', selected: false }
      ]
    },
    {
      date: addDays(new Date(), 9),
      slots: [
        { start: '08:00', end: '10:00', selected: false },
        { start: '10:00', end: '12:00', selected: false },
        { start: '14:00', end: '16:00', selected: false },
        { start: '16:00', end: '18:00', selected: false }
      ]
    }
  ]);

  const toggleSlot = (dateIndex: number, slotIndex: number) => {
    const newAvailabilities = [...availabilities];
    newAvailabilities[dateIndex].slots[slotIndex].selected = 
      !newAvailabilities[dateIndex].slots[slotIndex].selected;
    setAvailabilities(newAvailabilities);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      // Préparer les disponibilités à insérer
      const availabilitiesToInsert = availabilities.flatMap(day => 
        day.slots
          .filter(slot => slot.selected)
          .map(slot => {
            const startDate = new Date(day.date);
            const [startHour, startMinute] = slot.start.split(':').map(Number);
            startDate.setHours(startHour, startMinute, 0, 0);
            
            const endDate = new Date(day.date);
            const [endHour, endMinute] = slot.end.split(':').map(Number);
            endDate.setHours(endHour, endMinute, 0, 0);
            
            return {
              user_id: userData.user.id,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString()
            };
          })
      );
      
      if (availabilitiesToInsert.length === 0) {
        alert('Veuillez sélectionner au moins une disponibilité');
        return;
      }
      
      const { error } = await supabase
        .from('availabilities')
        .insert(availabilitiesToInsert);
        
      if (error) throw error;
      
      setShowModal(false);
      // Réinitialiser les sélections
      setAvailabilities(availabilities.map(day => ({
        ...day,
        slots: day.slots.map(slot => ({ ...slot, selected: false }))
      })));
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des disponibilités:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Rappel de disponibilités</h2>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-center mb-2">Il reste 2 jours</h3>
        <p className="text-gray-600 text-center mb-6">
          pour compléter vos disponibilités pour la semaine du 10/07.
        </p>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Compléter maintenant
        </button>
      </div>

      {/* Modal de saisie des disponibilités */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Saisir mes disponibilités</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez vos disponibilités pour la semaine du {format(availabilities[0].date, 'dd/MM/yyyy', { locale: fr })}
              </p>
              
              <div className="space-y-6">
                {availabilities.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">
                        {format(day.date, 'EEEE d MMMM', { locale: fr })}
                      </h3>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-3">
                      {day.slots.map((slot, slotIndex) => (
                        <button
                          key={slotIndex}
                          onClick={() => toggleSlot(dayIndex, slotIndex)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            slot.selected 
                              ? 'bg-blue-100 border-blue-300 text-blue-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {slot.start} - {slot.end}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}