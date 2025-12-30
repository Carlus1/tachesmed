import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';

interface GroupDetailPageProps {
  user: User;
}

interface GroupMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  admin_id: string;
}

export default function GroupDetailPage({ user }: GroupDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    if (!id) {
      setError('ID du groupe non spécifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger les détails du groupe
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, description, admin_id')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Charger les membres du groupe
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          users (id, email, full_name)
        `)
        .eq('group_id', id);

      if (memberError) throw memberError;

      const formattedMembers = (memberData || []).map((m: any) => ({
        id: m.user_id,
        email: m.users?.email || '',
        full_name: m.users?.full_name || 'Inconnu',
        role: 'member'
      }));

      setMembers(formattedMembers);
    } catch (err: any) {
      console.error('Erreur lors du chargement du groupe:', err);
      setError(err?.message || 'Erreur lors du chargement du groupe');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-lg text-center max-w-md">
          <p className="text-error-600 mb-4">{error || 'Groupe non trouvé'}</p>
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retour aux groupes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/groups')}
              className="text-primary-600 hover:text-primary-700 text-sm mb-2"
            >
              ← Retour aux groupes
            </button>
            <h1 className="text-3xl font-bold text-primary-700">{group.name}</h1>
            {group.description && (
              <p className="text-primary-500 mt-2">{group.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-primary-700">Membres ({members.length})</h2>
          </div>

          {members.length === 0 ? (
            <div className="p-6 text-center text-primary-400">
              <p>Aucun membre dans ce groupe</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-primary-50 transition-colors">
                  <div>
                    <p className="font-medium text-primary-700">{member.full_name}</p>
                    <p className="text-sm text-primary-400">{member.email}</p>
                  </div>
                  <span className="text-sm text-primary-600">{member.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
