import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format, startOfWeek, endOfWeek, addDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../i18n/LanguageContext';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
  assigned_to: string | null;
  parent_task_id: string | null;
  occurrence_date: string | null;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'bi-monthly' | 'quarterly' | 'semi-annually' | 'yearly' | null;
  recurrence_end_date?: string | null;
  created_by_user?: {
    id: string;
    full_name: string;
  };
  assigned_to_user?: {
    id: string;
    full_name: string;
  };
}

interface OptimizationPeriod {
  id: string;
  group_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface CalendarViewProps {
  view?: 'week' | 'month';
}

export default function CalendarView({ view = 'week' }: CalendarViewProps) {
  const { t, language } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [optimizationPeriods, setOptimizationPeriods] = useState<OptimizationPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: Date; tasks: Task[] } | null>(null);

  const getDateFnsLocale = () => {
    switch (language) {
      case 'fr': return fr;
      case 'es': return es;
      default: return enUS; // English is default
    }
  };

  useEffect(() => {
    loadTasks();
    loadOptimizationPeriods();
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
      
      // Charger toutes les tâches avec les utilisateurs assignés
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          created_by_user:users!created_by (id, full_name),
          assigned_to_user:users!assigned_to (id, full_name)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      // Filtrer pour afficher seulement:
      // 1. Les tâches parent NON récurrentes
      // 2. Les instances assignées (tâches récurrentes planifiées)
      const tasksToDisplay = (data || []).filter(task => {
        // Instance assignée → AFFICHER
        if (task.parent_task_id !== null && task.assigned_to !== null) {
          return true;
        }
        
        // Instance non assignée → MASQUER
        if (task.parent_task_id !== null && task.assigned_to === null) {
          return false;
        }
        
        // Tâche parent non récurrente → AFFICHER
        if (task.parent_task_id === null && 
            (!task.recurrence_type || task.recurrence_type === 'none')) {
          return true;
        }
        
        // Tâche parent récurrente → MASQUER (on affiche ses instances)
        return false;
      });
      
      setTasks(tasksToDisplay);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptimizationPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('optimization_periods')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setOptimizationPeriods(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error);
    }
  };

  // Vérifie si une tâche est dans une période figée
  const isTaskLocked = (task: Task): boolean => {
    if (!task.occurrence_date) return false;
    
    // Normaliser les dates (enlever les heures) pour comparaison fiable
    const taskDateStr = task.occurrence_date.split('T')[0];
    
    return optimizationPeriods.some(period => {
      const periodStartStr = period.start_date.split('T')[0];
      const periodEndStr = period.end_date.split('T')[0];
      return taskDateStr >= periodStartStr && taskDateStr <= periodEndStr;
    });
  };

  const getPriorityColor = (priority: string, isLocked: boolean = false) => {
    const baseClasses = isLocked
      ? 'border-2 border-dashed' // Tâche figée : bordure pointillée
      : 'border';
    
    // 🎨 Couleurs enrichies pour plus de variété visuelle
    switch (priority) {
      case 'high': return `${baseClasses} bg-red-100 border-red-500 text-red-900 hover:bg-red-200`;
      case 'medium': return `${baseClasses} bg-orange-100 border-orange-500 text-orange-900 hover:bg-orange-200`;
      case 'low': return `${baseClasses} bg-green-100 border-green-500 text-green-900 hover:bg-green-200`;
      default: return `${baseClasses} bg-blue-100 border-blue-500 text-blue-900 hover:bg-blue-200`;
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
          <h2 className="text-lg font-semibold text-primary-700">{t.calendar.title}</h2>
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
            {t.calendar.weekOf} {format(weekDays[0] || currentDate, 'dd/MM/yyyy', { locale: getDateFnsLocale() })}
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
              {format(day, 'EEE', { locale: getDateFnsLocale() })}
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
                  {dayTasks.map(task => {
                    const locked = isTaskLocked(task);
                    return (
                      <div 
                        key={task.id} 
                        className={`p-2 rounded-lg ${getPriorityColor(task.priority, locked)} relative`}
                        title={locked ? `🔒 ${task.title} - Période figée` : task.title}
                      >
                        {locked && (
                          <div className="absolute top-1 right-1">
                            <svg className="w-3 h-3 text-current opacity-60" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <p className="font-medium truncate text-xs pr-4">{task.title}</p>
                        {task.assigned_to_user && (
                          <p className="text-xs font-semibold mt-1 truncate">
                            👤 {task.assigned_to_user.full_name}
                          </p>
                        )}
                        <p className="text-xs opacity-75 mt-0.5">
                          {format(parseISO(task.start_date), 'HH:mm')} - {format(parseISO(task.end_date), 'HH:mm')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-primary-400">{t.calendar.noTask}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border bg-primary-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm text-primary-400">
            {tasks.length} {t.calendar.taskCount}{tasks.length !== 1 ? 's' : ''} {t.calendar.thisWeek}
          </span>
          
          {/* Légende */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary-100 border border-primary-400 rounded"></div>
              <span className="text-primary-600">Modifiable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary-100 border-2 border-dashed border-primary-400 rounded"></div>
              <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary-600">Période figée</span>
            </div>
          </div>
        </div>
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
        <h2 className="text-lg font-semibold text-primary-700">{t.calendar.title}</h2>
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
            {format(currentDate, 'MMMM yyyy', { locale: getDateFnsLocale() })}
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
        {[t.calendar.mon, t.calendar.tue, t.calendar.wed, t.calendar.thu, t.calendar.fri, t.calendar.sat, t.calendar.sun].map((day, index) => (
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
                  {dayTasks.slice(0, 2).map(task => {
                    const locked = isTaskLocked(task);
                    return (
                      <div 
                        key={task.id} 
                        className={`p-1 rounded text-xs ${getPriorityColor(task.priority, locked)} relative`}
                        title={locked ? `🔒 ${task.title}${task.assigned_to_user ? ` - ${task.assigned_to_user.full_name}` : ''}` : `${task.title}${task.assigned_to_user ? ` - ${task.assigned_to_user.full_name}` : ''}`}
                      >
                        <div className="flex items-start gap-1">
                          {locked && (
                            <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-current opacity-60" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            {task.assigned_to_user && (
                              <p className="text-[10px] font-semibold truncate opacity-80">
                                {task.assigned_to_user.full_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <button 
                      onClick={() => setSelectedDayTasks({ date: day, tasks: dayTasks })}
                      className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium w-full text-left"
                    >
                      +{dayTasks.length - 2} {t.calendar.taskCount}{dayTasks.length - 2 > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-primary-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm text-primary-400">
            {tasks.length} {t.calendar.taskCount}{tasks.length !== 1 ? 's' : ''} {t.calendar.thisMonth}
          </span>
          
          {/* Légende */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary-100 border border-primary-400 rounded"></div>
              <span className="text-primary-600">Modifiable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary-100 border-2 border-dashed border-primary-400 rounded"></div>
              <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-primary-600">Période figée</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal pour afficher toutes les tâches d'un jour */}
    {selectedDayTasks && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDayTasks(null)}>
        <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary-700">
              {t.calendar.tasksOf} {format(selectedDayTasks.date, 'd MMMM yyyy', { locale: getDateFnsLocale() })}
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
              {selectedDayTasks.tasks.map(task => {
                const locked = isTaskLocked(task);
                return (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-lg ${getPriorityColor(task.priority, locked)} relative`}
                  >
                    {locked && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-current opacity-60" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <h4 className="font-semibold mb-1 pr-6">{task.title}</h4>
                    {task.assigned_to_user && (
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <span>👤</span>
                        <span>{task.assigned_to_user.full_name}</span>
                      </p>
                    )}
                    {task.description && (
                      <p className="text-xs opacity-75 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        {format(parseISO(task.start_date), 'HH:mm')} - {format(parseISO(task.end_date), 'HH:mm')}
                      </span>
                      {locked && (
                        <span className="text-xs font-semibold opacity-80">🔒 Période figée</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}