import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { TaskAssignment } from '../services/calendarOptimization';
import { useTranslation } from '../i18n/LanguageContext';

interface ProposalCalendarProps {
  assignments: TaskAssignment[];
  view?: 'month' | 'week';
  startDate?: Date;  // Date de début de la période pour positionner le calendrier
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;  // YYYY-MM-DD format pour éviter timezone issues
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    userName: string;
    hasConflict: boolean;
    conflictReason?: string;
    score?: number;
    scoreDetails?: string;
    isRepetition?: boolean;
    isConsecutive?: boolean;
  };
}

// Couleurs pour différencier les utilisateurs (couleurs vives avec bon contraste pour texte blanc)
const USER_COLORS = [
  { bg: '#2563EB', border: '#1E40AF' }, // Bleu foncé
  { bg: '#059669', border: '#047857' }, // Vert foncé
  { bg: '#D97706', border: '#B45309' }, // Orange foncé
  { bg: '#7C3AED', border: '#6D28D9' }, // Violet foncé
  { bg: '#DC2626', border: '#B91C1C' }, // Rouge foncé
  { bg: '#0891B2', border: '#0E7490' }, // Cyan foncé
  { bg: '#DB2777', border: '#BE185D' }, // Rose foncé
  { bg: '#4F46E5', border: '#4338CA' }, // Indigo foncé
];

export default function ProposalCalendar({ assignments, view = 'month', startDate }: ProposalCalendarProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState(view);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [userColorMap, setUserColorMap] = useState<Map<string, { bg: string; border: string }>>(new Map());
  const [initialDate, setInitialDate] = useState<Date>(startDate || new Date());

  useEffect(() => {
    if (startDate) {
      setInitialDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    // Créer une map de couleurs pour chaque utilisateur
    const uniqueUsers = Array.from(new Set(assignments.map(a => a.userId)));
    const colorMap = new Map<string, { bg: string; border: string }>();
    
    uniqueUsers.forEach((userId, index) => {
      colorMap.set(userId, USER_COLORS[index % USER_COLORS.length]);
    });
    
    setUserColorMap(colorMap);

    // Convertir les assignations en événements de calendrier
    const calendarEvents: CalendarEvent[] = assignments.map((assignment, index) => {
      const colors = colorMap.get(assignment.userId) || USER_COLORS[0];
      
      // Extraire juste la date sans l'heure pour éviter décalage timezone
      const startDateStr = assignment.startDate instanceof Date 
        ? assignment.startDate.toISOString().split('T')[0]
        : assignment.startDate.split('T')[0];
      const endDateStr = assignment.endDate instanceof Date
        ? assignment.endDate.toISOString().split('T')[0]
        : assignment.endDate.split('T')[0];
      
      return {
        id: `assignment-${index}`,
        title: `${assignment.taskTitle} - ${assignment.userName}`,
        start: startDateStr,  // String YYYY-MM-DD au lieu de Date object
        end: endDateStr,
        backgroundColor: assignment.hasConflict ? '#FEF3C7' : colors.bg,
        borderColor: assignment.hasConflict ? '#F59E0B' : colors.border,
        extendedProps: {
          userName: assignment.userName,
          hasConflict: assignment.hasConflict,
          conflictReason: assignment.conflictReason,
          score: assignment.score,
          scoreDetails: assignment.scoreDetails,
          isRepetition: assignment.isRepetition,
          isConsecutive: assignment.isConsecutive,
        },
      };
    });

    setEvents(calendarEvents);
  }, [assignments]);

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const props = event.extendedProps;
    
    return (
      <div className="fc-event-main-frame">
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky">
            {props.hasConflict && <span className="mr-1">⚠️</span>}
            {props.isRepetition && <span className="mr-1">🔄</span>}
            {event.title}
          </div>
        </div>
      </div>
    );
  };

  const handleEventMouseEnter = (info: any) => {
    const event = info.event;
    const props = event.extendedProps;
    
    // Créer le tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'proposal-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      z-index: 10000;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      max-width: 350px;
      font-size: 13px;
      pointer-events: none;
    `;
    
    let content = `
      <div style="font-weight: 600; color: #1F2937; margin-bottom: 8px; font-size: 14px;">
        ${event.title}
      </div>
    `;
    
    // Informations sur l'assignation
    content += `
      <div style="color: #6B7280; margin-bottom: 4px;">
        👤 <strong>Assigné à:</strong> ${props.userName}
      </div>
      <div style="color: #6B7280; margin-bottom: 8px;">
        🕒 ${event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
        ${event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    `;
    
    // Score et détails
    if (props.score !== undefined && props.scoreDetails) {
      content += `
        <div style="background: #F3F4F6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
          <div style="color: #374151; font-weight: 600; margin-bottom: 4px;">
            📊 Score: ${props.score}
          </div>
          <div style="color: #6B7280; font-size: 12px;">
            ${props.scoreDetails}
          </div>
        </div>
      `;
    }
    
    // Avertissements
    if (props.isRepetition) {
      content += `
        <div style="background: #FEF3C7; padding: 6px; border-radius: 4px; margin-bottom: 4px; color: #92400E; font-size: 12px;">
          🔄 ${props.userName} fait cette tâche plusieurs fois
        </div>
      `;
    }
    
    if (props.isConsecutive) {
      content += `
        <div style="background: #FEF3C7; padding: 6px; border-radius: 4px; margin-bottom: 4px; color: #92400E; font-size: 12px;">
          📅 Tâches sur des semaines consécutives
        </div>
      `;
    }
    
    if (props.hasConflict) {
      content += `
        <div style="background: #FEE2E2; padding: 6px; border-radius: 4px; color: #991B1B; font-size: 12px;">
          ⚠️ ${props.conflictReason || 'Conflit détecté'}
        </div>
      `;
    }
    
    tooltip.innerHTML = content;
    document.body.appendChild(tooltip);
    
    // Fonction pour positionner le tooltip en suivant la souris
    const positionTooltip = (e: MouseEvent) => {
      const offsetX = 15; // Décalage horizontal
      const offsetY = 15; // Décalage vertical
      
      // Position par défaut: à droite et en bas du curseur
      let left = e.clientX + offsetX;
      let top = e.clientY + offsetY;
      
      // Vérifier si le tooltip dépasse à droite de l'écran
      const tooltipRect = tooltip.getBoundingClientRect();
      if (left + tooltipRect.width > window.innerWidth) {
        // Afficher à gauche du curseur
        left = e.clientX - tooltipRect.width - offsetX;
      }
      
      // Vérifier si le tooltip dépasse en bas de l'écran
      if (top + tooltipRect.height > window.innerHeight) {
        // Afficher au-dessus du curseur
        top = e.clientY - tooltipRect.height - offsetY;
      }
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };
    
    // Positionner initialement
    positionTooltip(info.jsEvent);
    
    // Suivre le mouvement de la souris
    const mouseMoveHandler = (e: MouseEvent) => positionTooltip(e);
    info.el.addEventListener('mousemove', mouseMoveHandler);
    
    // Stocker les références pour le nettoyage
    info.el.tooltipElement = tooltip;
    info.el.mouseMoveHandler = mouseMoveHandler;
  };

  const handleEventMouseLeave = (info: any) => {
    if (info.el.tooltipElement) {
      document.body.removeChild(info.el.tooltipElement);
      info.el.tooltipElement = null;
    }
    if (info.el.mouseMoveHandler) {
      info.el.removeEventListener('mousemove', info.el.mouseMoveHandler);
      info.el.mouseMoveHandler = null;
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-primary-700">
            📅 Aperçu de la proposition
          </h3>
          <p className="text-sm text-primary-600 mt-1">
            Survolez les tâches pour voir les détails de l'assignation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-primary-50 rounded-lg shadow-sm border border-border p-1 flex">
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                currentView === 'week' 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              {t.calendar?.week || 'Semaine'}
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                currentView === 'month' 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'text-primary-400 hover:bg-surface'
              }`}
            >
              {t.calendar?.month || 'Mois'}
            </button>
          </div>
        </div>
      </div>

      {/* Légende des couleurs */}
      <div className="p-4 border-b border-border bg-primary-25">
        <div className="flex flex-wrap gap-3">
          {Array.from(userColorMap.entries()).map(([userId, colors]) => {
            const assignment = assignments.find(a => a.userId === userId);
            if (!assignment) return null;
            
            return (
              <div key={userId} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: '2px' }}
                />
                <span className="text-sm text-primary-700">{assignment.userName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendrier FullCalendar */}
      <div className="p-4">
        <style>{`
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            color: #1F2937;
            font-weight: 600;
          }
          
          .fc .fc-button {
            background-color: #6366F1;
            border-color: #6366F1;
            text-transform: capitalize;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .fc .fc-button:hover {
            background-color: #4F46E5;
            border-color: #4F46E5;
          }
          
          .fc .fc-button-primary:not(:disabled):active,
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            background-color: #4338CA;
            border-color: #4338CA;
          }
          
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.875rem;
            color: white !important;
            font-weight: 500;
          }
          
          .fc-event-title {
            font-weight: 600;
            color: white !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          
          .fc-event-time {
            color: white !important;
            opacity: 0.95;
            font-weight: 500;
          }
          
          .fc-daygrid-event {
            white-space: normal;
          }
          
          .fc .fc-daygrid-day-number {
            color: #374151;
            font-weight: 500;
          }
          
          .fc .fc-col-header-cell-cushion {
            color: #6B7280;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
          }
          
          .fc .fc-timegrid-slot-label {
            color: #6B7280;
            font-size: 0.75rem;
          }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView === 'month' ? 'dayGridMonth' : 'timeGridWeek'}
          initialDate={initialDate}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          locale={frLocale}
          events={events}
          eventContent={renderEventContent}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          editable={false}
          selectable={false}
          dayMaxEvents={true}
          views={{
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
            },
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' }
            }
          }}
        />
      </div>
    </div>
  );
}
