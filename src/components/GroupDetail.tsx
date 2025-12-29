import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface GroupDetailProps {
    groupId: string;
    onClose: () => void;
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

export default function GroupDetail({ groupId, onClose }: GroupDetailProps) {
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        loadGroupDetails();
    }, [groupId]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const loadGroupDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger les détails du groupe
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;
            setGroup(groupData);

            // Charger les membres du groupe
            const { data: membersData, error: membersError } = await supabase
                .from('users')
                .select('*')
                .in('id', (
                    await supabase
                        .from('group_members')
                        .select('user_id')
                        .eq('group_id', groupId)
                ).data?.map(m => m.user_id) || []);

            if (membersError) throw membersError;
            setMembers(membersData || []);

            // Charger les utilisateurs disponibles
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('full_name');

            if (usersError) throw usersError;

            // Filtrer les utilisateurs qui ne sont pas déjà membres
            const memberIds = new Set(membersData?.map(m => m.id) || []);
            setAvailableUsers(usersData?.filter(u => !memberIds.has(u.id)) || []);

        } catch (error: any) {
            console.error('Erreur lors du chargement des détails du groupe:', error);
            setError('Erreur lors du chargement des détails du groupe');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMembers = async () => {
        try {
            setError(null);

            // Ajouter les nouveaux membres
            const memberInserts = selectedUsers.map(userId => ({
                group_id: groupId,
                user_id: userId
            }));

            const { error: insertError } = await supabase
                .from('group_members')
                .insert(memberInserts);

            if (insertError) throw insertError;

            setSuccess('Membres ajoutés avec succès');
            setShowAddMembers(false);
            setSelectedUsers([]);
            loadGroupDetails();
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout des membres:', error);
            setError('Erreur lors de l\'ajout des membres');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            setError(null);

            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', userId);

            if (error) throw error;

            setSuccess('Membre retiré avec succès');
            loadGroupDetails();
        } catch (error: any) {
            console.error('Erreur lors du retrait du membre:', error);
            setError('Erreur lors du retrait du membre');
        }
    };

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
                <div className="bg-surface rounded-lg p-6 max-w-4xl w-full mx-4">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-primary-700">
                        {group?.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-primary-400 hover:text-primary-700 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {group?.description && (
                    <p className="text-primary-400 mb-6">{group.description}</p>
                )}

                {error && (
                    <div className="mb-4 p-4 text-error-700 bg-error-100 rounded-md border border-error-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 text-success-700 bg-success-100 rounded-md border border-success-200">
                        {success}
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 mr-4">
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddMembers(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                        Ajouter des membres
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-primary-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                                    Membre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-primary-400 uppercase tracking-wider">
                                    Rôle
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-primary-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-surface transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-primary-700">
                                            {member.full_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-primary-400">
                                            {member.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'owner' ? 'bg-accent-100 text-accent-800' :
                                                member.role === 'admin' ? 'bg-primary-100 text-primary-800' :
                                                    'bg-primary-100 text-primary-700'
                                            }`}>
                                            {member.role === 'owner' ? 'Propriétaire' :
                                                member.role === 'admin' ? 'Administrateur' :
                                                    'Utilisateur'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-error-600 hover:text-error-800 transition-colors"
                                        >
                                            Retirer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal d'ajout de membres */}
                {showAddMembers && (
                    <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
                        <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-primary-700">Ajouter des membres</h3>
                                <button
                                    onClick={() => {
                                        setShowAddMembers(false);
                                        setSelectedUsers([]);
                                    }}
                                    className="text-primary-400 hover:text-primary-700 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {availableUsers.map((user) => (
                                    <div
                                            key={user.id}
                                            className="flex items-center p-2 hover:bg-surface transition-colors"
                                        >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(prev => [...prev, user.id]);
                                                } else {
                                                    setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                }
                                            }}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-primary-700">{user.full_name}</p>
                                            <p className="text-sm text-primary-400">{user.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddMembers(false);
                                        setSelectedUsers([]);
                                    }}
                                    className="px-4 py-2 border border-border rounded-md text-primary-700 hover:bg-surface transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={selectedUsers.length === 0}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}