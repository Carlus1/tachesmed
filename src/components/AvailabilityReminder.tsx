import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AvailabilityReminderProps {
  user: User;
}

export default function AvailabilityReminder({ user }: AvailabilityReminderProps) {
  const navigate = useNavigate();
  const [hasAvailabilities, setHasAvailabilities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextWeekStart, setNextWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    checkAvailabilities();
  }, [user]);

  const checkAvailabilities = async () => {
    try {
      setLoading(true);
      
      // Calculer la semaine prochaine
      const today = new Date();
      const nextWeek = addDays(today, 7);
      const weekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(nextWeek, { weekStartsOn: 1 });
      setNextWeekStart(weekStart);

      // Vérifier s'il y a des disponibilités pour la semaine prochaine
      const { data, error } = await supabase
        .from('availabilities')
        .select('id')
        .eq('user_id', user.id)
        .gte('start_time', weekStart.toISOString())
        .lte('end_time', weekEnd.toISOString())
        .limit(1);

      if (error) throw error;
      setHasAvailabilities((data?.length || 0) > 0);
    } catch (error) {
      console.error('Erreur lors de la vérification des disponibilités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/availabilities');
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary-700">Rappel de disponibilités</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (hasAvailabilities) {
    return (
      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary-700">Rappel de disponibilités</h2>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-center mb-2 text-success-700">Disponibilités à jour</h3>
          <p className="text-primary-400 text-center mb-4">
            Vos disponibilités pour la semaine du {format(nextWeekStart, 'dd/MM', { locale: fr })} sont complètes.
          </p>
          <button 
            onClick={handleComplete}
            className="w-full py-3 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg transition-colors"
          >
            Modifier mes disponibilités
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary-700">Rappel de disponibilités</h2>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-warning-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-warning-600 font-bold text-2xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-center mb-2 text-warning-700">Action requise</h3>
        <p className="text-primary-400 text-center mb-6">
          Complétez vos disponibilités pour la semaine du {format(nextWeekStart, 'dd/MM', { locale: fr })}.
        </p>
        <button 
          onClick={handleComplete}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          Compléter maintenant
        </button>
      </div>
    </div>
  );
}