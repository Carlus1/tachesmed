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
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: Date; tasks: Task[] } | null>(null);

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
      
      // Charger toutes les tâches qui chevauchent la période
      // Une tâche est visible si : start_date <= end_period ET end_date >= start_period
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          user:users (full_name)
        `)
        .lte('start_date', end.toISOString())
        .gte('end_date', start.toISOString())
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
      
      <div className="p-4 border-t border-border bg-primary-100">
        <span className="text-sm text-primary-400">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} cette semaine
        </span>
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
    <>
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
                    <button 
                      onClick={() => setSelectedDayTasks({ date: day, tasks: dayTasks })}
                      className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium w-full text-left"
                    >
                      +{dayTasks.length - 2} tâche{dayTasks.length - 2 > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-primary-100">
        <span className="text-sm text-primary-400">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} ce mois
        </span>
      </div>
    </div>

    {/* Modal pour afficher toutes les tâches d'un jour */}
    {selectedDayTasks && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDayTasks(null)}>
        <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary-700">
              Tâches du {format(selectedDayTasks.date, 'd MMMM yyyy', { locale: fr })}
            </h3>
            <button 
              onClick={() => setSelectedDayTasks(null)}
              className="text-primary-400 hover:text-primary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
            <div className="space-y-3">
              {selectedDayTasks.tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}
                >
                  <h4 className="font-semibold mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs opacity-75 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span>
                      {format(parseISO(task.start_date), 'HH:mm')} - {format(parseISO(task.end_date), 'HH:mm')}
                    </span>
                    {task.user && (
                      <span className="italic">{task.user.full_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}