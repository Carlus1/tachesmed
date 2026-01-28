import { useEffect } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';
import { addWeeks, differenceInDays } from 'date-fns';
import { sendUnavailabilityReminder, setLastNotificationTime, wasNotificationSentToday } from '../services/notificationService';

interface UsePeriodicNotificationProps {
  user: User;
  intervalMinutes?: number;
}

/**
 * Hook pour vérifier périodiquement si une notification doit être envoyée
 * Par défaut, vérifie toutes les heures
 */
export function usePeriodicNotification({ user, intervalMinutes = 60 }: UsePeriodicNotificationProps) {
  useEffect(() => {
    const checkAndNotify = async () => {
      // Ne pas envoyer si déjà envoyé aujourd'hui
      if (wasNotificationSentToday()) return;

      try {
        // ✅ VÉRIFIER SI L'UTILISATEUR EST ACTUELLEMENT ACTIF
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('inactive_from, inactive_until')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Erreur lors de la vérification du statut utilisateur:', userError);
        }

        // Si l'utilisateur est en période d'absence, ne pas envoyer de notification
        if (userData) {
          const today = new Date();
          const inactiveFrom = userData.inactive_from ? new Date(userData.inactive_from) : null;
          const inactiveUntil = userData.inactive_until ? new Date(userData.inactive_until) : null;

          // Vérifier si l'utilisateur est actuellement inactif
          if (inactiveFrom && today >= inactiveFrom) {
            if (!inactiveUntil || today <= inactiveUntil) {
              console.log('⏸️ Utilisateur absent - Pas de notification envoyée');
              return; // ⚠️ Ne pas envoyer de notification
            }
          }
        }

        // Récupérer la fréquence depuis les groupes de l'utilisateur
        let weeksPeriod = 2;
        
        const { data: adminGroups } = await supabase
          .from('groups')
          .select('unavailability_period_weeks')
          .eq('admin_id', user.id)
          .order('unavailability_period_weeks', { ascending: false })
          .limit(1);
        
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select(`
            groups (
              unavailability_period_weeks
            )
          `)
          .eq('user_id', user.id);
        
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

        // Vérifier la dernière mise à jour
        const { data } = await supabase
          .from('availabilities')
          .select('created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!data || data.length === 0) {
          // Jamais saisi d'indisponibilités
          await sendUnavailabilityReminder(0, true);
          setLastNotificationTime();
        } else {
          const lastUpdate = new Date(data[0].updated_at || data[0].created_at);
          const nextUpdateDate = addWeeks(lastUpdate, weeksPeriod);
          const daysLeft = differenceInDays(nextUpdateDate, new Date());
          
          if (daysLeft <= 3) {
            await sendUnavailabilityReminder(Math.max(0, daysLeft), false);
            setLastNotificationTime();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification périodique:', error);
      }
    };

    // Vérification initiale
    checkAndNotify();

    // Vérification périodique
    const intervalId = setInterval(checkAndNotify, intervalMinutes * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, intervalMinutes]);
}
