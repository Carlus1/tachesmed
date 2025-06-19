import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Group {
    id: string;
    name: string;
    description: string;
    admin_id: string;
    memberCount?: number;
    color?: string;
}

export default function GroupList() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);

            // Charger les groupes
            const { data: groupsData, error } = await supabase
                .from('groups')
                .select('*')
                .order('name');

            if (error) throw error;

            // Pour chaque groupe, compter les membres
            const groupsWithCounts = await Promise.all(
                (groupsData || []).map(async (group) => {
                    const { count } = await supabase
                        .from('group_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('group_id', group.id);

                    // Assigner une couleur aléatoire
                    const colors = ['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];

                    return {
                        ...group,
                        memberCount: count || 0,
                        color: randomColor
                    };
                })
            );

            setGroups(groupsWithCounts);
        } catch (error) {
            console.error('Erreur lors du chargement des groupes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        try {
            if (!newGroup.name.trim()) return;

            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            const { error } = await supabase
                .from('groups')
                .insert([{
                    name: newGroup.name.trim(),
                    description: newGroup.description.trim(),
                    admin_id: userData.user.id
                }]);

            if (error) throw error;

            setShowCreateModal(false);
            setNewGroup({ name: '', description: '' });
            loadGroups();
        } catch (error) {
            console.error('Erreur lors de la création du groupe:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mes groupes</h2>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="divide-y divide-gray-200">
                {groups.map((group) => (
                    <div key={group.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg ${group.color} flex items-center justify-center text-white mr-3`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500">{group.memberCount} membres</p>
                            </div>
                            <button className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>Aucun groupe disponible</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Créer un groupe
                </button>
            </div>

            {/* Modal de création de groupe */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Créer un nouveau groupe</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe</label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Entrez le nom du groupe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Entrez une description pour ce groupe"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                disabled={!newGroup.name.trim()}
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}