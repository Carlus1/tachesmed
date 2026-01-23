import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';

interface MyGroupsSectionProps {
    user: User;
    onCreateGroup: () => void;
}

interface Group {
    id: string;
    name: string;
    description?: string;
    member_count?: number;
}

export default function MyGroupsSection({ user, onCreateGroup }: MyGroupsSectionProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGroups();
    }, [user]);

    const loadGroups = async () => {
        try {
            setLoading(true);
            
            // Charger les groupes dont l'utilisateur est admin
            const { data: adminGroups, error: adminError } = await supabase
                .from('groups')
                .select(`
                    id,
                    name,
                    description,
                    group_members(count)
                `)
                .eq('admin_id', user.id);

            if (adminError) throw adminError;

            // Charger les groupes dont l'utilisateur est membre
            const { data: memberGroups, error: memberError } = await supabase
                .from('group_members')
                .select(`
                    groups (
                        id,
                        name,
                        description,
                        group_members(count)
                    )
                `)
                .eq('user_id', user.id);

            if (memberError) throw memberError;

            // Combiner et dédupliquer les groupes
            const allGroups = new Map<string, Group>();
            
            adminGroups?.forEach(g => {
                allGroups.set(g.id, {
                    id: g.id,
                    name: g.name,
                    description: g.description,
                    member_count: (g.group_members as any)?.[0]?.count || 0
                });
            });

            memberGroups?.forEach((m: any) => {
                const g = m.groups;
                if (g && !allGroups.has(g.id)) {
                    allGroups.set(g.id, {
                        id: g.id,
                        name: g.name,
                        description: g.description,
                        member_count: (g.group_members as any)?.[0]?.count || 0
                    });
                }
            });

            setGroups(Array.from(allGroups.values()));
        } catch (error) {
            console.error('Erreur lors du chargement des groupes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-primary-700">Mes groupes</h2>
                </div>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    const colors = ['bg-primary-100', 'bg-accent-50', 'bg-success-50'];
    const textColors = ['text-primary-700', 'text-accent-800', 'text-success-800'];

    return (
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="text-lg font-semibold text-primary-700">Mes groupes</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onCreateGroup}
                        className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                        Créer un groupe
                    </button>
                    <Link to="/groups" className="text-sm text-primary-600 hover:text-primary-700 hover:underline">
                        Voir tous →
                    </Link>
                </div>
            </div>
            {groups.length > 0 ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.slice(0, 3).map((group, index) => (
                        <div key={group.id} className={`${colors[index % colors.length]} rounded-lg p-4 relative overflow-hidden`}>
                            <div className="flex justify-between items-start mb-8">
                                <h3 className={`font-medium ${textColors[index % textColors.length]}`}>{group.name}</h3>
                                <span className="text-sm text-primary-600">{group.member_count || 0} membre{(group.member_count || 0) > 1 ? 's' : ''}</span>
                            </div>
                            <Link 
                                to={`/groups/${group.id}`} 
                                className="absolute bottom-2 right-2 text-primary-600 hover:text-primary-800 hover:underline"
                            >
                                Voir détails
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-primary-400">
                    <p>Vous n'êtes membre d'aucun groupe</p>
                    <Link to="/groups" className="text-primary-600 hover:text-primary-700 hover:underline mt-2 inline-block">
                        Créer ou rejoindre un groupe →
                    </Link>
                </div>
            )}
        </div>
    );
}