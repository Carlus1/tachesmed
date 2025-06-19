import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
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

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    loadTasks();
    generateWeekDays();
  }, [currentDate]);

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
      
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      
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
      case 'high': return 'bg-red-100 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-200 text-green-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.start_date);
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Calendrier</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousWeek}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">
            Semaine du {format(weekDays[0] || currentDate, 'dd/MM/yyyy', { locale: fr })}
          </span>
          <button 
            onClick={nextWeek}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center border-r border-gray-200 last:border-r-0">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {format(day, 'EEE', { locale: fr })}
            </p>
            <p className={`text-lg font-semibold ${
              day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear() 
                ? 'text-blue-600' 
                : 'text-gray-900'
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
              className={`border-r border-gray-200 last:border-r-0 p-2 ${
                day.getDate() === new Date().getDate() && 
                day.getMonth() === new Date().getMonth() && 
                day.getFullYear() === new Date().getFullYear() 
                  ? 'bg-blue-50' 
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
                  <span className="text-xs text-gray-400">Aucune tâche</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} cette semaine
        </span>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Voir le calendrier complet →
        </button>
      </div>
    </div>
  );
}