import { addDays, addWeeks, addMonths, parseISO } from 'date-fns';

export interface RecurringTask {
  id: string;
  start_date: string;
  end_date: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | null;
  recurrence_end_date?: string | null;
  [key: string]: any;
}

/**
 * Génère toutes les occurrences d'une tâche récurrente dans une plage de dates donnée
 * @param task - La tâche avec ses paramètres de récurrence
 * @param rangeStart - Date de début de la plage
 * @param rangeEnd - Date de fin de la plage
 * @returns Array de tâches avec les dates ajustées pour chaque occurrence
 */
export function generateRecurringOccurrences<T extends RecurringTask>(
  task: T,
  rangeStart: Date,
  rangeEnd: Date
): T[] {
  // Si pas de récurrence ou récurrence = 'none', retourner la tâche originale
  if (!task.recurrence_type || task.recurrence_type === 'none') {
    return [task];
  }

  const occurrences: T[] = [];
  const taskStart = parseISO(task.start_date);
  const taskEnd = parseISO(task.end_date);
  const taskDuration = taskEnd.getTime() - taskStart.getTime();
  const recurrenceEnd = task.recurrence_end_date ? parseISO(task.recurrence_end_date) : rangeEnd;

  let currentOccurrence = taskStart;

  while (currentOccurrence <= rangeEnd && currentOccurrence <= recurrenceEnd) {
    const occurrenceEnd = new Date(currentOccurrence.getTime() + taskDuration);

    // Ajouter l'occurrence si elle chevauche la plage visible
    if (occurrenceEnd >= rangeStart && currentOccurrence <= rangeEnd) {
      occurrences.push({
        ...task,
        start_date: currentOccurrence.toISOString(),
        end_date: occurrenceEnd.toISOString(),
      });
    }

    // Calculer la prochaine occurrence selon le type de récurrence
    switch (task.recurrence_type) {
      case 'daily':
        currentOccurrence = addDays(currentOccurrence, 1);
        break;
      case 'weekly':
        currentOccurrence = addWeeks(currentOccurrence, 1);
        break;
      case 'biweekly':
        currentOccurrence = addWeeks(currentOccurrence, 2);
        break;
      case 'monthly':
        currentOccurrence = addMonths(currentOccurrence, 1);
        break;
      case 'bimonthly':
        currentOccurrence = addMonths(currentOccurrence, 2);
        break;
      case 'quarterly':
        currentOccurrence = addMonths(currentOccurrence, 3);
        break;
      case 'semiannual':
        currentOccurrence = addMonths(currentOccurrence, 6);
        break;
      case 'annual':
        currentOccurrence = addMonths(currentOccurrence, 12);
        break;
      default:
        // Si type inconnu, sortir de la boucle
        currentOccurrence = new Date(rangeEnd.getTime() + 1);
    }
  }

  return occurrences;
}
