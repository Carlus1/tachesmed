import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';
import TasksSection from './TasksSection';
import CalendarProposal from './CalendarProposal';
import GroupsSection from './GroupsSection';
import AvailabilityReminder from './AvailabilityReminder';
import MyGroupsSection from './MyGroupsSection';
import TaskModal from './TaskModal';
import GroupModal from './GroupModal';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  duration: number;
  group?: {
    name: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  color: string;
}

interface DashboardGridProps {
  user: User;
}

export default function DashboardGrid({ user }: DashboardGridProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`*, group:groups (name)`)
        .order('start_date', { ascending: true })
        .limit(10);

      // Load task_groups associations for each task
      const tasksWithGroups = await Promise.all((tasksData || []).map(async (task) => {
        const { data: taskGroups } = await supabase
          .from('task_groups')
          .select('group:groups (id, name)')
          .eq('task_id', task.id);
        
        return {
          ...task,
          groups: taskGroups?.map((tg: any) => tg.group).filter(Boolean) || []
        };
      }));

      // Charger uniquement les groupes auxquels l'utilisateur a accès (admin ou membre)
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      let groupsData: any[] = [];
      if (userId) {
        const { data: adminGroups } = await supabase
          .from('groups')
          .select('id, name, description')
          .eq('admin_id', userId);

        const { data: memberGroups } = await supabase
          .from('group_members')
          .select(`
            group_id,
            groups (
              id,
              name,
              description
            )
          `)
          .eq('user_id', userId);

        const memberGroupItems = ((memberGroups || []) as any[]).map(m => m.groups).flat().filter(Boolean) as any[];
        groupsData = [ ...(adminGroups || []), ...memberGroupItems ];
      }

      if (groupsError) {
        // Log full error details to the browser console so we can inspect 500 responses
        console.error('Supabase groups fetch error:', groupsError);
      }

      setTasks(tasksWithGroups || []);

      const groupsWithColors = (groupsData || []).map((group, index) => ({
        ...group,
        memberCount: Math.floor(Math.random() * 10) + 3,
        color: ['bg-primary-500', 'bg-accent-500', 'bg-success-500'][index % 3]
      }));
      
      setGroups(groupsWithColors);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    loadData();
  };

  const handleCreateGroup = () => {
    // Open group creation modal directly
    setShowGroupModal(true);
  };

  const handleGroupCreated = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksSection tasks={tasks} onAddTask={() => setShowTaskModal(true)} />
        <CalendarProposal />
        <GroupsSection groups={groups} onCreateGroup={handleCreateGroup} />
        <AvailabilityReminder />
        <MyGroupsSection />
      </div>

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={handleTaskCreated}
          groups={groups}
        />
      )}

      {showGroupModal && (
        <GroupModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={handleGroupCreated}
          user={user}
        />
      )}
    </>
  );
}
