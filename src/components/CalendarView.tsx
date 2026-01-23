import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format, startOfWeek, endOfWeek, addDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
  user?: {
    full_name: string;
  };
}

interface CalendarViewProps {
  view?: 'week' | 'month';
}

export default function CalendarView({ view = 'week' }: CalendarViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    loadTasks();
    if (view === 'week') {
      generateWeekDays();
    }
  }, [currentDate, view]);

  const generateWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lundi
    const end = endOfWeek(currentDate, { weekStartsOn: 1 }); // Dimanche
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    setWeekDays(days);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      let start: Date;
      let end: Date;
      
      if (view === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          user:users (full_name)
        `)
        .gte('start_date', start.toISOString())
        .lte('end_date', end.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error-100 border-error-200 text-error-800';
      case 'medium': return 'bg-accent-100 border-accent-200 text-accent-800';
      case 'low': return 'bg-success-100 border-success-200 text-success-800';
      default: return 'bg-primary-100 border-border text-primary-700';
    }
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskStartDate = parseISO(task.start_date);
      const taskEndDate = parseISO(task.end_date);
      
      // Normaliser les dates pour comparer uniquement les jours (sans les heures)
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const taskStart = new Date(taskStartDate.getFullYear(), taskStartDate.getMonth(), taskStartDate.getDate());
      const taskEnd = new Date(taskEndDate.getFullYear(), taskEndDate.getMonth(), taskEndDate.getDate());
      
      // La tâche est visible si le jour est entre la date de début et de fin (inclus)
      return dayStart >= taskStart && dayStart <= taskEnd;
    });
  };

  const previousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const previousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (view === 'week') {
    return (
      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary-700">Calendrier</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousWeek}
            className="p-1 rounded-full hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-primary-700">
            Semaine du {format(weekDays[0] || currentDate, 'dd/MM/yyyy', { locale: fr })}
          </span>
          <button 
            onClick={nextWeek}
            className="p-1 rounded-full hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
  <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center border-r border-border last:border-r-0">
            <p className="text-xs font-medium text-primary-400 uppercase">
              {format(day, 'EEE', { locale: fr })}
            </p>
            <p className={`text-lg font-semibold ${
              day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear() 
                  ? 'text-primary-600' 
                  : 'text-primary-700'
            }`}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          return (
              <div 
              key={index} 
              className={`border-r border-border last:border-r-0 p-2 ${
                day.getDate() === new Date().getDate() && 
                day.getMonth() === new Date().getMonth() && 
                day.getFullYear() === new Date().getFullYear() 
                  ? 'bg-primary-100' 
                  : ''
              }`}
            >
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`p-2 rounded-lg border text-xs ${getPriorityColor(task.priority)}`}
                    >
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs opacity-75">
                        {format(parseISO(task.start_date), 'HH:mm')} - {format(parseISO(task.end_date), 'HH:mm')}
                      </p>
                      {task.user && <p className="text-xs italic mt-1">{task.user.full_name}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-primary-400">Aucune tâche</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border bg-primary-100 flex justify-between items-center">
        <span className="text-sm text-primary-400">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} cette semaine
        </span>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Voir le calendrier complet →
        </button>
      </div>
      </div>
    );
  }

  // Vue par mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Obtenir les jours du mois précédent et suivant pour compléter la grille
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary-700">Calendrier</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousMonth}
            className="p-1 rounded-full hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-primary-700">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-border bg-primary-50">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
          <div key={index} className="p-2 text-center border-r border-border last:border-r-0">
            <p className="text-xs font-medium text-primary-400 uppercase">{day}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 min-h-[500px]">
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.getDate() === new Date().getDate() && 
                         day.getMonth() === new Date().getMonth() && 
                         day.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={index} 
              className={`border-r border-border last:border-r-0 p-2 min-h-[70px] ${
                !isCurrentMonth ? 'bg-primary-50 opacity-50' : ''
              } ${isToday ? 'bg-primary-100' : ''}`}
            >
              <p className={`text-sm font-semibold mb-1 ${
                isToday ? 'text-primary-600' : 'text-primary-700'
              }`}>
                {format(day, 'd')}
              </p>
              {dayTasks.length > 0 && (
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div 
                      key={task.id} 
                      className={`p-1 rounded text-xs font-medium truncate ${getPriorityColor(task.priority)}`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-xs text-primary-400">+{dayTasks.length - 2}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-primary-100 flex justify-between items-center">
        <span className="text-sm text-primary-400">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} ce mois
        </span>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Voir plus →
        </button>
      </div>
    </div>
  );
}