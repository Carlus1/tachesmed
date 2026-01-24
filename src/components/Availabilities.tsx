import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import Breadcrumb from './Breadcrumb';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// date-fns imports removed (not used in this file)

interface AvailabilitiesProps {
  user: User;
}

interface Availability {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function Availabilities({ user }: AvailabilitiesProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(user.id);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    checkOwnerRole();
    if (isOwner) {
      loadUsers();
    }
  }, [isOwner]);

  useEffect(() => {
    loadAvailabilities();
  }, [selectedUserId]);

  const checkOwnerRole = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsOwner(data.role === 'owner');
    } catch (error) {
      console.error('Erreur lors de la v�rification du r�le:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const loadAvailabilities = async () => {
    try {
      // Sauvegarder la date actuelle du calendrier avant le rechargement
      const currentDate = calendarRef.current?.getApi()?.getDate();
      
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('availabilities')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
      
      // Restaurer la date après le rechargement
      if (currentDate && calendarRef.current) {
        setTimeout(() => {
          calendarRef.current.getApi().gotoDate(currentDate);
        }, 0);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des indisponibilités:', error);
      setError('Erreur lors du chargement des indisponibilités');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = useCallback(async (selectInfo: any) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('availabilities')
        .insert([{
          user_id: selectedUserId,
          start_time: selectInfo.start.toISOString(),
          end_time: selectInfo.end.toISOString()
        }])
        .select();

      if (error) throw error;

      // Ajouter directement au state au lieu de recharger
      if (data && data.length > 0) {
        setAvailabilities(prev => [...prev, data[0]]);
      }

      setSuccess('Indisponibilité ajoutée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'indisponibilité:', error);
      setError('Erreur lors de l\'ajout de l\'indisponibilité');
    }
  }, [selectedUserId]);

  const handleEventClick = useCallback((clickInfo: any) => {
    setSelectedEvent(clickInfo.event.id);
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: any) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('availabilities')
        .update({
          start_time: dropInfo.event.start.toISOString(),
          end_time: dropInfo.event.end.toISOString()
        })
        .eq('id', dropInfo.event.id)
        .eq('user_id', selectedUserId);

      if (error) throw error;

      // Mise à jour optimiste du state
      setAvailabilities(prev => prev.map(av => 
        av.id === dropInfo.event.id 
          ? { ...av, start_time: dropInfo.event.start.toISOString(), end_time: dropInfo.event.end.toISOString() }
          : av
      ));

      setSuccess('Indisponibilité mise à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'indisponibilité:', error);
      setError('Erreur lors de la mise à jour de l\'indisponibilité');
      dropInfo.revert();
    }
  }, [selectedUserId]);

  const handleEventResize = useCallback(async (resizeInfo: any) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('availabilities')
        .update({
          start_time: resizeInfo.event.start.toISOString(),
          end_time: resizeInfo.event.end.toISOString()
        })
        .eq('id', resizeInfo.event.id)
        .eq('user_id', selectedUserId);

      if (error) throw error;

      // Mise à jour optimiste du state
      setAvailabilities(prev => prev.map(av => 
        av.id === resizeInfo.event.id 
          ? { ...av, start_time: resizeInfo.event.start.toISOString(), end_time: resizeInfo.event.end.toISOString() }
          : av
      ));

      setSuccess('Indisponibilité mise à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'indisponibilité:', error);
      setError('Erreur lors de la mise à jour de l\'indisponibilité');
      resizeInfo.revert();
    }
  }, [selectedUserId]);

  const handleDeleteAvailability = async () => {
    if (!selectedEvent) return;

    try {
      setError(null);

      const { error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', selectedEvent)
        .eq('user_id', selectedUserId);

      if (error) throw error;

      // Mise à jour optimiste du state
      setAvailabilities(prev => prev.filter(av => av.id !== selectedEvent));

      setSuccess('Indisponibilité supprimée avec succès');
      setSelectedEvent(null);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'indisponibilité:', error);
      setError('Erreur lors de la suppression de l\'indisponibilité');
    }
  };

  const events = availabilities.map(availability => ({
    id: availability.id,
    title: 'Indisponible',
    start: availability.start_time,
    end: availability.end_time,
    // Use CSS variable-based rgb so colors follow the theme tokens at runtime
    backgroundColor: `rgb(var(--color-error-500) / 1)`,
    borderColor: `rgb(var(--color-error-600) / 1)`,
    editable: true,
    durationEditable: true,
    startEditable: true,
    classNames: [
      selectedEvent === availability.id ? 'selected-event' : ''
    ]
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-primary-700">
                {isOwner ? 'Gérer les indisponibilités' : 'Mes indisponibilités'}
              </h1>
            </div>

            {isOwner && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Sélectionner un utilisateur
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 text-error-600 bg-error-50 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 text-success-600 bg-success-50 rounded-md animate-fade-in">
                {success}
              </div>
            )}

            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale="fr"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                editable={true}
                height="700px"
                allDaySlot={false}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                scrollTime="06:00:00"
                scrollTimeReset={false}
                buttonText={{
                  today: "Aujourd'hui",
                  month: 'Mois',
                  week: 'Semaine',
                  day: 'Jour'
                }}
              />
            </div>

            {selectedEvent && (
                <div 
                  className="mt-4 flex justify-end"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-600"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
              </div>
            )}

            {/* Modale de confirmation de suppression */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-primary-700 mb-4">
                    Confirmer la suppression
                  </h3>
                  <p className="text-primary-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer cette indisponibilité ?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                      }}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDeleteAvailability}
                      className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
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
        }
        .fc-event.selected-event {
          box-shadow: 0 0 0 2px rgb(var(--color-primary-500) / 1);
          transform: scale(1.02);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}