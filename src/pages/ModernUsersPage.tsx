import type { User } from '@supabase/gotrue-js';
import ModernLayout from '../components/ModernLayout';
import UserManagement from '../components/UserManagement';

interface ModernUsersPageProps {
  user: User;
}

export default function ModernUsersPage({ user }: ModernUsersPageProps) {
  return (
    <ModernLayout user={user}>
      <UserManagement user={user} />
    </ModernLayout>
  );
}
