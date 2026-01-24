import type { User } from '@supabase/gotrue-js';
import ModernLayout from '../components/ModernLayout';
import Reports from '../components/Reports';

interface ModernReportsPageProps {
  user: User;
}

export default function ModernReportsPage({ user }: ModernReportsPageProps) {
  return (
    <ModernLayout user={user}>
      <Reports user={user} />
    </ModernLayout>
  );
}
