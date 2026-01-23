import { supabase } from '../supabase';

interface TaskSchedule {
  id: string;
  taskId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  status: 'pending' | 'active' | 'completed';
}

interface TaskAssignment {
  assignedDate: Date;
  userId: string;
  hasConflict: boolean;
}

export const taskSchedulingService = {
  async generateSchedule(
    taskId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .rpc('generate_task_schedule', {
          p_task_id: taskId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate?.toISOString()
        });

      if (error) throw error;

      return data.map((assignment: any) => ({
        assignedDate: new Date(assignment.assigned_date),
        userId: assignment.user_id,
        hasConflict: assignment.has_conflict
      }));
    } catch (error) {
      console.error('Erreur lors de la g�n�ration du planning:', error);
      throw error;
    }
  },

  async saveSchedule(
    taskId: string,
    assignments: TaskAssignment[]
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('validate_and_save_schedule', {
          p_task_id: taskId,
          p_assignments: assignments.map(a => ({
            assigned_date: a.assignedDate.toISOString(),
            user_id: a.userId
          }))
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du planning:', error);
      throw error;
    }
  },

  async getTaskSchedule(taskId: string): Promise<TaskSchedule | null> {
    try {
      const { data, error } = await supabase
        .from('task_schedules')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        taskId: data.task_id,
        frequency: data.frequency,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        status: data.status
      };
    } catch (error) {
      console.error('Erreur lors de la r�cup�ration du planning de t�che:', error);
      throw error;
    }
  },

  async getAssignments(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments_history')
        .select('*')
        .eq('task_id', taskId)
        .gte('assigned_date', startDate.toISOString())
        .lte('assigned_date', endDate.toISOString())
        .order('assigned_date', { ascending: true });

      if (error) throw error;

      return data.map(assignment => ({
        assignedDate: new Date(assignment.assigned_date),
        userId: assignment.user_id,
        hasConflict: false
      }));
    } catch (error) {
      console.error('Erreur lors de la r�cup�ration des assignations:', error);
      throw error;
    }
  },

  async getGlobalCalendar(
    startDate: Date,
    endDate: Date
  ): Promise<{
    tasks: any[];
    assignments: any[];
    conflicts: any[];
  }> {
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          group:groups (
            name,
            admin_id
          ),
          schedule:task_schedules (
            frequency,
            start_date,
            end_date,
            status
          )
        `)
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString());

      if (tasksError) throw tasksError;

      const { data: assignments, error: assignmentsError } = await supabase
        .from('task_assignments_history')
        .select(`
          *,
          user:users (
            full_name
          )
        `)
        .gte('assigned_date', startDate.toISOString())
        .lte('assigned_date', endDate.toISOString());

      if (assignmentsError) throw assignmentsError;

      // Obtenir les conflits (utilisateurs assignés à plusieurs tâches en même temps)
      const conflicts = assignments.reduce((acc: any[], curr: any) => {
        const overlapping = assignments.filter(a => 
          a.id !== curr.id && 
          a.user_id === curr.user_id &&
          new Date(a.assigned_date).getTime() === new Date(curr.assigned_date).getTime()
        );

        if (overlapping.length > 0) {
          acc.push({
            date: curr.assigned_date,
            userId: curr.user_id,
            userName: curr.user?.full_name || 'Utilisateur inconnu',
            taskIds: [curr.task_id, ...overlapping.map((o: any) => o.task_id)]
          });
        }

        return acc;
      }, []);

      return {
        tasks: tasks || [],
        assignments: assignments || [],
        conflicts
      };
    } catch (error) {
      console.error('Erreur lors de la r�cup�ration du calendrier global:', error);
      throw error;
    }
  }
};