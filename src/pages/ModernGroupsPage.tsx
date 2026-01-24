import type { User } from '@supabase/gotrue-js';
import ModernLayout from '../components/ModernLayout';
import GroupManagement from '../components/GroupManagement';

interface ModernGroupsPageProps {
  user: User;
}

export default function ModernGroupsPage({ user }: ModernGroupsPageProps) {
  return (
    <ModernLayout user={user}>
      <GroupManagement user={user} />
    </ModernLayout>
  );
}
