import type { User } from '@supabase/gotrue-js';
import ModernLayout from '../components/ModernLayout';
import TaskManagement from '../components/TaskManagement';

interface ModernTasksPageProps {
  user: User;
}

export default function ModernTasksPage({ user }: ModernTasksPageProps) {
  return (
    <ModernLayout user={user}>
      <TaskManagement user={user} />
    </ModernLayout>
  );
}
