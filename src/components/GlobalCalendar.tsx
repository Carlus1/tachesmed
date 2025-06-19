import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { taskSchedulingService } from '../services/taskScheduling';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface GlobalCalendarProps {
  groupId?: string;
}

export default function GlobalCalendar({ groupId }: GlobalCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  useEffect(() => {
    loadCalendarData();
  }, [groupId]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Load from 1 month ago
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Load 3 months ahead

      const { tasks, assignments, conflicts } = await taskSchedulingService.getGlobalCalendar(
        startDate,
        endDate
      );

      // Create a map of task assignments
      const taskAssignments = new Map();
      assignments.forEach(assignment => {
        if (!taskAssignments.has(assignment.task_id)) {
          taskAssignments.set(assignment.task_id, []);
        }
        taskAssignments.get(assignment.task_id).push({
          userId: assignment.user_id,
          userName: assignment.user.full_name,
          date: assignment.assigned_date
        });
      });

      // Convert tasks and assignments to calendar events
      const calendarEvents = tasks.flatMap(task => {
        const taskAssignmentsList = taskAssignments.get(task.id) || [];
        
        // Create an event for each assignment
        if (taskAssignmentsList.length > 0) {
          return taskAssignmentsList.map(assignment => ({
            id: `${task.id}-${assignment.userId}`,
            title: `${task.title} - ${assignment.userName}`,
            start: task.start_date,
            end: task.end_date,
            backgroundColor: '#10B981', // Green for assigned tasks
            borderColor: '#059669',
            extendedProps: {
              type: 'task',
              description: task.description,
              groupName: task.group.name,
              assignedUser: assignment.userName,
              taskTitle: task.title
            }
          }));
        }

        // Create a single event for unassigned task
        return [{
          id: task.id,
          title: `${task.title} - Non assigné`,
          start: task.start_date,
          end: task.end_date,
          backgroundColor: '#3B82F6', // Blue for unassigned tasks
          borderColor: '#2563EB',
          extendedProps: {
            type: 'task',
            description: task.description,
            groupName: task.group.name,
            assignedUser: 'Non assigné',
            taskTitle: task.title
          }
        }];
      });

      setEvents(calendarEvents);
      setConflicts(conflicts);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données du calendrier:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info: any) => {
    setSelectedDate(info.date);
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === info.date.toDateString();
    });
    setSelectedEvents(dayEvents);
  };

  const handleEventClick = (info: any) => {
    const event = info.event;
    setSelectedEvents([{
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      extendedProps: event.extendedProps
    }]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Calendrier Global</h2>
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Tâches non assignées</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Tâches assignées</span>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </div>

      {conflicts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Conflits détectés</h3>
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <ul className="space-y-2">
              {conflicts.map((conflict, index) => (
                <li key={index} className="text-red-700">
                  <span className="font-medium">{conflict.userName}</span> est assigné à plusieurs tâches le{' '}
                  {format(new Date(conflict.date), 'PPP', { locale: fr })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locale="fr"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              allDaySlot={false}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              buttonText={{
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour'
              }}
              eventContent={(eventInfo) => {
                return (
                  <div className="text-xs p-1">
                    <div className="font-semibold">{eventInfo.event.extendedProps.taskTitle}</div>
                    <div>{eventInfo.event.extendedProps.assignedUser}</div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? (
              format(selectedDate, 'PPP', { locale: fr })
            ) : (
              'Sélectionnez une date'
            )}
          </h3>

          {selectedEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white p-4 rounded-md shadow-sm border border-gray-200"
                >
                  <h4 className="font-medium">{event.extendedProps.taskTitle}</h4>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {event.extendedProps.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Groupe: {event.extendedProps.groupName}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Assigné à: {event.extendedProps.assignedUser}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">Aucun événement sélectionné</p>
              <p className="text-sm text-gray-400">Cliquez sur une date ou un événement pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .calendar-container {
          margin: 0 auto;
          max-width: 100%;
          height: calc(100vh - 300px);
          min-height: 500px;
        }
        .fc {
          height: 100%;
        }
        .fc-event {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fc-event:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .fc-event.selected-event {
          box-shadow: 0 0 0 2px #3B82F6;
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}