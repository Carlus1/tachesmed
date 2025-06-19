import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import TasksSection from './TasksSection';
import CalendarProposal from './CalendarProposal';
import GroupsSection from './GroupsSection';
import AvailabilityReminder from './AvailabilityReminder';
import MyGroupsSection from './MyGroupsSection';
import TaskModal from './TaskModal';

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

export default function DashboardGrid() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
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

      const { data: groupsData } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      setTasks(tasksData || []);
      
      const groupsWithColors = (groupsData || []).map((group, index) => ({
        ...group,
        memberCount: Math.floor(Math.random() * 10) + 3,
        color: ['bg-blue-500', 'bg-teal-500', 'bg-purple-500'][index % 3]
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
    console.log('Créer un groupe');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    </>
  );
}