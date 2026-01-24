import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import GroupDetail from './GroupDetail';
import { useTranslation } from '../i18n/LanguageContext';

interface GroupManagementProps {
  user: User;
}

interface Group {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  created_at: string;
  task_count?: number;
  unavailability_period_weeks: number;
}

export default function GroupManagement({ user }: GroupManagementProps) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', unavailability_period_weeks: 2 });
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = userData?.role;

      // If owner, show all groups; otherwise show only user's admin groups
      let query = supabase
        .from('groups')
        .select('*');

      if (userRole !== 'owner') {
        query = query.eq('admin_id', user.id);
      }

      const { data: groupsData, error: groupsError } = await query
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      const groupsWithTaskCount = await Promise.all(
        (groupsData || []).map(async (group: any) => {
          const { count } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            task_count: count || 0,
          } as Group;
        })
      );

      setGroups(groupsWithTaskCount);
    } catch (err: any) {
      console.error('Erreur lors du chargement des groupes:', err);
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      setError(null);

      if (!newGroup.name.trim()) {
        setError('Le nom du groupe est requis');
        return;
      }

      const { error: insertError } = await supabase
        .from('groups')
        .insert([
          {
            name: newGroup.name.trim(),
            description: newGroup.description.trim(),
            admin_id: user.id,
            unavailability_period_weeks: newGroup.unavailability_period_weeks,
          },
        ]);

      if (insertError) throw insertError;

      setSuccess('Groupe créé avec succès');
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', unavailability_period_weeks: 2 });
      loadGroups();
    } catch (err: any) {
      console.error('Erreur lors de la création du groupe:', err);
      setError('Erreur lors de la création du groupe');
    }
  };
  const handleUpdateGroup = async () => {
    if (!editingGroup || !editingGroup.name.trim()) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: editingGroup.name.trim(),
          description: editingGroup.description.trim(),
          unavailability_period_weeks: editingGroup.unavailability_period_weeks,
        })
        .eq('id', editingGroup.id);

      if (updateError) throw updateError;

      setSuccess('Groupe modifié avec succès');
      setShowEditModal(false);
      setEditingGroup(null);
      loadGroups();
    } catch (err: any) {
      console.error('Erreur lors de la modification du groupe:', err);
      setError('Erreur lors de la modification du groupe');
    }
  };
  const handleDeleteGroup = async (group: Group) => {
    try {
      setError(null);
      setDeletingGroup(group);

      if (group.task_count && group.task_count > 0) {
        const { error: tasksError } = await supabase
          .from('tasks')
          .delete()
          .eq('group_id', group.id);

        if (tasksError) throw tasksError;
      }

      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id);

      if (membersError) throw membersError;

      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id)
        .eq('admin_id', user.id);

      if (groupError) throw groupError;

      setSuccess('Groupe et toutes ses données associées supprimés avec succès');
      setShowDeleteConfirm(null);
      loadGroups();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du groupe:', err);
      setError('Erreur lors de la suppression du groupe');
    } finally {
      setDeletingGroup(null);
    }
  };

  if (loading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-surface shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-primary-700">{t.groups.title}</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.groups.createGroup}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 text-error-700 bg-error-100 rounded-md border border-error-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 text-success-700 bg-success-100 rounded-md border border-success-200 animate-fade-in">
                {success}
              </div>
            )}

            {groups.length === 0 ? (
              <div className="text-center py-8 text-primary-400">
                <svg className="mx-auto h-12 w-12 text-primary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>{t.groups.noGroupsMessage}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">{t.common.name}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">{t.common.description}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">{t.groups.tasks}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-primary-400 uppercase tracking-wider">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-border">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-700">{group.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary-400">{group.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary-400">{group.task_count} {t.groups.taskCount}{group.task_count !== 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => setSelectedGroupId(group.id)} className="text-primary-600 hover:text-primary-800 mr-2 transition-colors">{t.groups.manageMembers}</button>
                          <button 
                            onClick={() => {
                              setEditingGroup(group);
                              setShowEditModal(true);
                            }} 
                            className="text-blue-600 hover:text-blue-800 mr-2 transition-colors"
                          >
                            {t.common.edit}
                          </button>
                          <button onClick={() => setShowDeleteConfirm(group.id)} className="text-error-600 hover:text-error-800 transition-colors" disabled={deletingGroup?.id === group.id}>{deletingGroup?.id === group.id ? t.groups.deleting : t.groups.deleteGroup}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* Modal de création de groupe */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
        <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-primary-700">{t.groups.newGroup}</h3>
            <button onClick={() => { setShowCreateModal(false); setNewGroup({ name: '', description: '', unavailability_period_weeks: 2 }); }} className="text-primary-400 hover:text-primary-700 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.groups.groupName}</label>
              <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500" placeholder="Entrez le nom du groupe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.common.description}</label>
              <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} rows={3} className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500" placeholder="Décrivez le but de ce groupe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.groups.unavailabilityFrequency}</label>
              <select 
                value={newGroup.unavailability_period_weeks} 
                onChange={(e) => setNewGroup({ ...newGroup, unavailability_period_weeks: parseInt(e.target.value) })} 
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500"
              >
                <option value={1}>{t.groups.everyWeek}</option>
                <option value={2}>{t.groups.every2Weeks}</option>
                <option value={4}>{t.groups.everyMonth}</option>
                <option value={8}>{t.groups.every2Months}</option>
                <option value={12}>{t.groups.every3Months}</option>
                <option value={24}>{t.groups.every6Months}</option>
                <option value={52}>{t.groups.everyYear}</option>
              </select>
              <p className="text-xs text-primary-400 mt-1">{t.groups.frequencyDescription}</p>
            </div>
          </div>

            <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => { setShowCreateModal(false); setNewGroup({ name: '', description: '', unavailability_period_weeks: 2 }); }} className="px-4 py-2 border border-border rounded-md text-primary-700 hover:bg-surface transition-colors">{t.common.cancel}</button>
            <button onClick={handleCreateGroup} disabled={!newGroup.name.trim()} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors">{t.common.create}</button>
          </div>
        </div>
      </div>
    )}

    {/* Modal d'édition de groupe */}
    {showEditModal && editingGroup && (
      <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
        <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-primary-700">{t.groups.editGroup}</h3>
            <button onClick={() => { setShowEditModal(false); setEditingGroup(null); }} className="text-primary-400 hover:text-primary-700 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.groups.groupName}</label>
              <input 
                type="text" 
                value={editingGroup.name} 
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })} 
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500" 
                placeholder="Entrez le nom du groupe" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.common.description}</label>
              <textarea 
                value={editingGroup.description} 
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })} 
                rows={3} 
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500" 
                placeholder="Décrivez le but de ce groupe" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700">{t.groups.unavailabilityFrequency}</label>
              <select 
                value={editingGroup.unavailability_period_weeks} 
                onChange={(e) => setEditingGroup({ ...editingGroup, unavailability_period_weeks: parseInt(e.target.value) })} 
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-transparent focus:ring-primary-500"
              >
                <option value={1}>{t.groups.everyWeek}</option>
                <option value={2}>{t.groups.every2Weeks}</option>
                <option value={4}>{t.groups.everyMonth}</option>
                <option value={8}>{t.groups.every2Months}</option>
                <option value={12}>{t.groups.every3Months}</option>
                <option value={24}>{t.groups.every6Months}</option>
                <option value={52}>{t.groups.everyYear}</option>
              </select>
              <p className="text-xs text-primary-400 mt-1">{t.groups.frequencyDescription}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => { setShowEditModal(false); setEditingGroup(null); }} className="px-4 py-2 border border-border rounded-md text-primary-700 hover:bg-surface transition-colors">{t.common.cancel}</button>
            <button onClick={handleUpdateGroup} disabled={!editingGroup.name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">{t.common.save}</button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmation de suppression */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
        <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium mb-4 text-primary-700">{t.groups.confirmDelete}</h3>
          <p className="text-primary-400 mb-4">{`${t.groups.deleteWarning}${groups.find(g => g.id === showDeleteConfirm)?.task_count ? ` et toutes ses ${groups.find(g => g.id === showDeleteConfirm)?.task_count} ${t.groups.taskCount}s associées` : ''} ? Cette action est irréversible.`}</p>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-border rounded-md text-primary-700 hover:bg-surface transition-colors" disabled={deletingGroup !== null}>{t.common.cancel}</button>
            <button onClick={() => { const group = groups.find(g => g.id === showDeleteConfirm); if (group) handleDeleteGroup(group); }} disabled={deletingGroup !== null} className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-800 disabled:opacity-50 transition-colors">{deletingGroup ? t.groups.deleting : t.groups.deleteGroup}</button>
          </div>
        </div>
      </div>
    )}

    {/* Composant de détail du groupe */}
    {selectedGroupId && (
      <GroupDetail groupId={selectedGroupId} onClose={() => setSelectedGroupId(null)} />
    )}
    </>
  );
}