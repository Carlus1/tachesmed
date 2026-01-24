import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';
import { startOfWeek, endOfWeek, addDays, addWeeks, format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendUnavailabilityReminder, setLastNotificationTime, wasNotificationSentToday } from '../services/notificationService';

interface AvailabilityReminderProps {
  user: User;
}

export default function AvailabilityReminder({ user }: AvailabilityReminderProps) {
  const navigate = useNavigate();
  const [lastUpdateDate, setLastUpdateDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodWeeks, setPeriodWeeks] = useState(2); // Par défaut 2 semaines
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    checkLastUpdate();
  }, [user]);

  // Envoyer une notification si nécessaire
  useEffect(() => {
    if (loading) return;

    // Ne pas envoyer si déjà envoyé aujourd'hui
    if (wasNotificationSentToday()) return;

    // Envoyer la notification selon le statut
    if (lastUpdateDate === null) {
      // Jamais saisi d'indisponibilités
      sendUnavailabilityReminder(0, true);
      setLastNotificationTime();
    } else if (daysRemaining <= 3) {
      // Mise à jour bientôt nécessaire ou urgent
      sendUnavailabilityReminder(daysRemaining, false);
      setLastNotificationTime();
    }
  }, [loading, lastUpdateDate, daysRemaining]);

  const checkLastUpdate = async () => {
    try {
      setLoading(true);
      
      // Récupérer la fréquence depuis les groupes de l'utilisateur
      let weeksPeriod = 2; // Valeur par défaut
      
      // Récupérer les groupes dont l'utilisateur est admin
      const { data: adminGroups } = await supabase
        .from('groups')
        .select('unavailability_period_weeks')
        .eq('admin_id', user.id)
        .order('unavailability_period_weeks', { ascending: false })
        .limit(1);
      
      // Récupérer les groupes dont l'utilisateur est membre
      const { data: memberGroups } = await supabase
        .from('group_members')
        .select(`
          groups (
            unavailability_period_weeks
          )
        `)
        .eq('user_id', user.id);
      
      // Prendre la période la plus courte (la plus contraignante)
      const allPeriods: number[] = [];
      
      if (adminGroups && adminGroups.length > 0) {
        allPeriods.push(...adminGroups.map(g => g.unavailability_period_weeks).filter(Boolean));
      }
      
      if (memberGroups && memberGroups.length > 0) {
        memberGroups.forEach((m: any) => {
          if (m.groups?.unavailability_period_weeks) {
            allPeriods.push(m.groups.unavailability_period_weeks);
          }
        });
      }
      
      if (allPeriods.length > 0) {
        weeksPeriod = Math.min(...allPeriods);
      }
      
      setPeriodWeeks(weeksPeriod);

      // Vérifier la dernière mise à jour des indisponibilités
      const { data, error } = await supabase
        .from('availabilities')
        .select('created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastUpdate = new Date(data[0].updated_at || data[0].created_at);
        setLastUpdateDate(lastUpdate);
        
        // Calculer les jours restants avant la prochaine mise à jour
        const nextUpdateDate = addWeeks(lastUpdate, weeksPeriod);
        const daysLeft = differenceInDays(nextUpdateDate, new Date());
        setDaysRemaining(Math.max(0, daysLeft));
      } else {
        // Aucune indisponibilité saisie
        setLastUpdateDate(null);
        setDaysRemaining(0);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des indisponibilités:', error);
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
          <h2 className="text-lg font-semibold text-primary-700">Rappel d'indisponibilités</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si la mise à jour est encore valide (plus de jours restants)
  if (daysRemaining > 3) {
    return (
      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary-700">Rappel d'indisponibilités</h2>
        </div>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-center mb-2 text-success-700">Indisponibilités à jour</h3>
          <p className="text-primary-400 text-center mb-4">
            Prochaine mise à jour dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
          </p>
          <button 
            onClick={handleComplete}
            className="w-full py-3 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg transition-colors"
          >
            Gérer mes indisponibilités
          </button>
        </div>
      </div>
    );
  }

  // Affichage d'alerte si mise à jour bientôt nécessaire ou jamais faite
  const isUrgent = daysRemaining === 0 || lastUpdateDate === null;
  
  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary-700">Rappel d'indisponibilités</h2>
      </div>
      <div className="p-6 flex flex-col items-center justify-center">
        <div className={`w-16 h-16 ${isUrgent ? 'bg-error-50' : 'bg-warning-50'} rounded-full flex items-center justify-center mb-4`}>
          <span className={`${isUrgent ? 'text-error-600' : 'text-warning-600'} font-bold text-2xl`}>!</span>
        </div>
        <h3 className={`text-lg font-medium text-center mb-2 ${isUrgent ? 'text-error-700' : 'text-warning-700'}`}>
          {isUrgent ? 'Action requise' : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`}
        </h3>
        <p className="text-primary-400 text-center mb-6">
          {lastUpdateDate 
            ? `Mettez à jour vos indisponibilités (période de ${periodWeeks} semaine${periodWeeks > 1 ? 's' : ''})`
            : `Saisissez vos indisponibilités pour les ${periodWeeks} prochaines semaines`
          }
        </p>
        <button 
          onClick={handleComplete}
          className={`w-full py-3 ${isUrgent ? 'bg-error-600 hover:bg-error-700' : 'bg-primary-600 hover:bg-primary-700'} text-white font-medium rounded-lg transition-colors`}
        >
          {lastUpdateDate ? 'Mettre à jour maintenant' : 'Saisir maintenant'}
        </button>
      </div>
    </div>
  );
}