/**
 * Service de gestion des notifications navigateur
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Demande la permission d'envoyer des notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Les notifications ne sont pas supportées par ce navigateur');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Envoie une notification navigateur
 */
export function sendBrowserNotification(options: NotificationOptions): void {
  if (!('Notification' in window)) {
    console.warn('Les notifications ne sont pas supportées par ce navigateur');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permission de notification refusée');
    return;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || 'tachesmed-notification',
      requireInteraction: options.requireInteraction || false,
      badge: '/favicon.ico',
    });

    // Auto-fermeture après 10 secondes si pas requireInteraction
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    // Gestion du clic sur la notification
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}

/**
 * Vérifie si l'utilisateur a activé les notifications dans ses préférences
 */
export function areNotificationsEnabled(): boolean {
  try {
    return localStorage.getItem('pref_notifications') === '1';
  } catch {
    return false;
  }
}

/**
 * Envoie une notification de rappel d'indisponibilités
 */
export async function sendUnavailabilityReminder(daysRemaining: number, isFirstTime: boolean = false): Promise<void> {
  // Vérifier la préférence utilisateur
  if (!areNotificationsEnabled()) {
    return;
  }

  // Demander la permission si nécessaire
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return;
  }

  // Préparer le message
  let title: string;
  let body: string;
  let requireInteraction = false;

  if (isFirstTime) {
    title = '📅 Indisponibilités non saisies';
    body = 'Pensez à saisir vos indisponibilités pour faciliter la planification.';
    requireInteraction = true;
  } else if (daysRemaining === 0) {
    title = '⚠️ Mise à jour requise';
    body = 'Vos indisponibilités doivent être mises à jour aujourd\'hui.';
    requireInteraction = true;
  } else if (daysRemaining <= 3) {
    title = '⏰ Rappel : Mise à jour prochaine';
    body = `Pensez à mettre à jour vos indisponibilités (${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}).`;
  } else {
    return; // Pas de notification si plus de 3 jours
  }

  sendBrowserNotification({
    title,
    body,
    tag: 'unavailability-reminder',
    requireInteraction,
  });
}

/**
 * Enregistre la dernière fois qu'une notification a été envoyée
 */
export function setLastNotificationTime(): void {
  try {
    localStorage.setItem('last_notification_time', new Date().toISOString());
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du timestamp de notification:', error);
  }
}

/**
 * Vérifie si une notification a déjà été envoyée aujourd'hui
 */
export function wasNotificationSentToday(): boolean {
  try {
    const lastTime = localStorage.getItem('last_notification_time');
    if (!lastTime) return false;

    const lastDate = new Date(lastTime);
    const today = new Date();
    
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}
