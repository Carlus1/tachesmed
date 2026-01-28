import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/gotrue-js';
import { supabase } from '../supabase';
import Breadcrumb from './Breadcrumb';

interface UserManagementProps {
  user: User;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_status: string;
  inactive_from: string | null;
  inactive_until: string | null;
  inactive_reason: string | null;
  created_at: string;
  last_login?: string;
}

interface EditUserData {
  id: string;
  full_name: string;
  role: string;
  subscription_status: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
  userId?: string;
}

export default function UserManagement({ user }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState<string | null>(null);
  const [absenceData, setAbsenceData] = useState({
    inactive_from: '',
    inactive_until: '',
    inactive_reason: ''
  });
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'user'
  });
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => setMessages([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const ref = messageRefs.current[lastMessage.userId || 'global'];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [messages]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer le rôle de l'utilisateur actuel
      const { data: currentUserData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = currentUserData?.role || 'user';
      setCurrentUserRole(userRole);

      let usersToDisplay: UserProfile[] = [];

      if (userRole === 'owner') {
        // OWNER: Voir tous les utilisateurs
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        usersToDisplay = data || [];
        
      } else if (userRole === 'admin') {
        // ADMIN: Voir seulement les utilisateurs des groupes dont il est admin
        // 1. Récupérer les groupes où l'utilisateur est admin
        const { data: adminGroups, error: groupsError } = await supabase
          .from('groups')
          .select('id')
          .eq('admin_id', user.id);

        if (groupsError) throw groupsError;

        if (adminGroups && adminGroups.length > 0) {
          const groupIds = adminGroups.map(g => g.id);

          // 2. Récupérer les membres de ces groupes
          const { data: groupMembers, error: membersError } = await supabase
            .from('group_members')
            .select('user_id, users!inner(*)')
            .in('group_id', groupIds);

          if (membersError) throw membersError;

          // 3. Extraire les utilisateurs uniques
          const userMap = new Map<string, UserProfile>();
          groupMembers?.forEach((member: any) => {
            if (member.users) {
              userMap.set(member.users.id, member.users);
            }
          });

          usersToDisplay = Array.from(userMap.values());
        }
      }
      
      // Dédupliquer les utilisateurs par email (insensible à la casse)
      const uniqueUsers = new Map<string, UserProfile>();
      
      usersToDisplay.forEach(user => {
        const lowerEmail = user.email.toLowerCase();
        // Si l'utilisateur n'existe pas encore ou si cet utilisateur est plus récent
        if (!uniqueUsers.has(lowerEmail) || 
            new Date(user.created_at) > new Date(uniqueUsers.get(lowerEmail)!.created_at)) {
          uniqueUsers.set(lowerEmail, user);
        }
      });
      
      setUsers(Array.from(uniqueUsers.values()));
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      addMessage('error', 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (type: 'success' | 'error', text: string, userId?: string) => {
    setMessages(prev => [...prev, { type, text, userId }]);
  };

  // Filtrer les utilisateurs en fonction de la recherche et du rôle sélectionné
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      setProcessingAction(editingUser.id);
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          subscription_status: editingUser.subscription_status
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      addMessage('success', 'Utilisateur mis à jour avec succès', editingUser.id);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      addMessage('error', error.message, editingUser.id);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setProcessingAction(userId);
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) throw dbError;

      addMessage('success', 'Utilisateur supprimé avec succès');
      setShowDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      addMessage('error', error.message);
    } finally {
      setProcessingAction(null);
    }
  };

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      setProcessingAction(userId);
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) throw error;

      const statusText = newStatus ? 'activé' : 'désactivé (absent)';
      addMessage('success', `Utilisateur ${statusText} avec succès`, userId);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      addMessage('error', error.message, userId);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleSetAbsence = async () => {
    if (!showAbsenceModal) return;

    try {
      setProcessingAction(showAbsenceModal);
      
      // Validation: Si date de début fournie, elle doit être >= aujourd'hui
      if (absenceData.inactive_from) {
        const fromDate = new Date(absenceData.inactive_from);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (fromDate < today) {
          throw new Error('La date de début ne peut pas être dans le passé');
        }
      }

      // Validation: Si date de fin fournie, elle doit être >= date de début
      if (absenceData.inactive_from && absenceData.inactive_until) {
        if (absenceData.inactive_until < absenceData.inactive_from) {
          throw new Error('La date de fin doit être après la date de début');
        }
      }

      const updateData: any = {
        inactive_from: absenceData.inactive_from || null,
        inactive_until: absenceData.inactive_until || null,
        inactive_reason: absenceData.inactive_reason || null
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', showAbsenceModal);

      if (error) throw error;

      addMessage('success', 'Période d\'absence enregistrée', showAbsenceModal);
      setShowAbsenceModal(null);
      setAbsenceData({ inactive_from: '', inactive_until: '', inactive_reason: '' });
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
      addMessage('error', error.message, showAbsenceModal);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleClearAbsence = async (userId: string) => {
    try {
      setProcessingAction(userId);
      
      const { error } = await supabase
        .from('users')
        .update({
          inactive_from: null,
          inactive_until: null,
          inactive_reason: null
        })
        .eq('id', userId);

      if (error) throw error;

      addMessage('success', 'Absence annulée, utilisateur réactivé', userId);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation de l\'absence:', error);
      addMessage('error', error.message, userId);
    } finally {
      setProcessingAction(null);
    }
  };

  // Helper pour vérifier si l'utilisateur est actuellement actif
  const isUserCurrentlyActive = (user: UserProfile): boolean => {
    if (!user.inactive_from) return true;
    
    const today = new Date();
    const inactiveFrom = new Date(user.inactive_from);
    
    // L'absence n'a pas encore commencé
    if (today < inactiveFrom) return true;
    
    // Pas de date de fin = absence indéfinie
    if (!user.inactive_until) return false;
    
    const inactiveUntil = new Date(user.inactive_until);
    // L'absence est terminée
    if (today > inactiveUntil) return true;
    
    // En période d'absence
    return false;
  };

  // Helper pour obtenir le texte de statut
  const getUserStatusText = (user: UserProfile): { text: string; color: string; emoji: string } => {
    if (!user.inactive_from) {
      return { text: 'Actif', color: 'success', emoji: '✅' };
    }
    
    const today = new Date();
    const inactiveFrom = new Date(user.inactive_from);
    
    // Absence planifiée future
    if (today < inactiveFrom) {
      const daysUntil = Math.ceil((inactiveFrom.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `Absence dans ${daysUntil}j`, 
        color: 'blue',
        emoji: '📅'
      };
    }
    
    // En période d'absence
    if (!user.inactive_until) {
      return { text: 'Absent (∞)', color: 'orange', emoji: '⏸️' };
    }
    
    const inactiveUntil = new Date(user.inactive_until);
    if (today <= inactiveUntil) {
      const daysLeft = Math.ceil((inactiveUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `Absent (${daysLeft}j)`, 
        color: 'orange',
        emoji: '⏸️'
      };
    }
    
    // Absence terminée
    return { text: 'Actif', color: 'success', emoji: '✅' };
  };

  const handleCreateUser = async () => {
    try {
      setProcessingAction('new');
      
      // Vérifier si l'email existe déjà
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .ilike('email', newUser.email);
        
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      // Créer l'utilisateur dans auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      });
      
      if (authError) throw authError;
      
      // Mettre à jour le rôle dans la table users
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: newUser.role,
            created_by: user.id
          })
          .eq('id', authData.user.id);
          
        if (updateError) throw updateError;
      }
      
      addMessage('success', 'Utilisateur créé avec succès');
      setShowCreateModal(false);
      setNewUser({
        email: '',
        full_name: '',
        password: '',
        role: 'user'
      });
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      addMessage('error', error.message);
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb />
      <div className="max-w-7xl mx-auto py-8 sm:px-8 lg:px-12">
        <div className="bg-surface shadow-xl rounded-2xl overflow-hidden border border-border">
          <div className="px-8 py-8 sm:p-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight">Gestion des utilisateurs</h1>
                {currentUserRole === 'admin' && (
                  <p className="text-sm text-primary-500 mt-2">
                    ℹ️ Vous voyez uniquement les membres de vos groupes
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-accent-400 text-white rounded-xl hover:bg-accent-500 shadow-md font-semibold transition-all"
              >
                Nouvel utilisateur
              </button>
            </div>

            <div className="mb-6 flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 border border-border rounded-xl bg-background text-primary-700 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 placeholder:text-primary-300 transition-all"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-5 py-3 border border-border rounded-xl bg-background text-primary-700 focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
              >
                <option value="all">Tous les rôles</option>
                <option value="owner">Propriétaire</option>
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Disponibilité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-muted">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary-700">
                          {user.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 inline-flex text-xs leading-5 font-bold rounded-xl shadow-sm border ${
                          user.role === 'owner' ? 'bg-accent-100 text-accent-500 border-accent-200' :
                          user.role === 'admin' ? 'bg-primary-100 text-primary-500 border-primary-200' :
                          'bg-muted text-primary-400 border-border'
                        }`}>
                          {user.role === 'owner' ? 'Propriétaire' :
                           user.role === 'admin' ? 'Administrateur' :
                           'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const status = getUserStatusText(user);
                          const isActive = isUserCurrentlyActive(user);
                          
                          return (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => {
                                  setShowAbsenceModal(user.id);
                                  setAbsenceData({
                                    inactive_from: user.inactive_from || '',
                                    inactive_until: user.inactive_until || '',
                                    inactive_reason: user.inactive_reason || ''
                                  });
                                }}
                                disabled={processingAction === user.id}
                                className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-bold rounded-xl shadow-sm border transition-colors ${
                                  status.color === 'success'
                                    ? 'bg-success-100 text-success-700 border-success-200 hover:bg-success-200' 
                                    : status.color === 'blue'
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                                    : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
                                } ${processingAction === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title={isActive ? 'Cliquer pour planifier une absence' : `Du ${user.inactive_from} au ${user.inactive_until || '∞'}`}
                              >
                                {status.emoji} {status.text}
                              </button>
                              {user.inactive_reason && (
                                <span className="text-xs text-primary-400 italic">
                                  {user.inactive_reason}
                                </span>
                              )}
                              {!isActive && (
                                <button
                                  onClick={() => handleClearAbsence(user.id)}
                                  disabled={processingAction === user.id}
                                  className="text-xs text-primary-600 hover:text-primary-900 underline"
                                >
                                  Annuler l'absence
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 inline-flex text-xs leading-5 font-bold rounded-xl shadow-sm border ${
                          user.subscription_status === 'active' ? 'bg-success-100 text-success-700 border-success-200' :
                          user.subscription_status === 'cancelled' ? 'bg-accent-100 text-accent-500 border-accent-200' :
                          'bg-accent-100 text-accent-600 border-accent-200'
                        }`}>
                          {user.subscription_status === 'active' ? 'Actif' :
                           user.subscription_status === 'cancelled' ? 'Annulé' :
                           'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col items-end">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => setEditingUser({
                                id: user.id,
                                full_name: user.full_name,
                                role: user.role,
                                subscription_status: user.subscription_status
                              })}
                              className="text-primary-600 hover:text-primary-900"
                              disabled={processingAction === user.id}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="text-error-600 hover:text-error-800"
                              disabled={processingAction === user.id}
                            >
                              {processingAction === user.id ? 'En cours...' : 'Supprimer'}
                            </button>
                          </div>
                          {messages.map((message, index) => 
                            message.userId === user.id && (
                              <div
                                key={index}
                                ref={el => messageRefs.current[user.id] = el}
                                className={`mt-2 px-3 py-1 text-sm rounded-md animate-fade-in ${
                                  message.type === 'success' 
                                    ? 'bg-success-100 text-success-700' 
                                    : 'bg-error-100 text-error-700'
                                }`}
                              >
                                {message.text}
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {messages.map((message, index) => 
              !message.userId && (
                <div
                    key={index}
                    ref={el => messageRefs.current['global'] = el}
                    className={`mt-4 p-4 rounded-md animate-fade-in ${
                      message.type === 'success' 
                        ? 'bg-success-100 text-success-700' 
                        : 'bg-error-100 text-error-700'
                    }`}
                  >
                    {message.text}
                  </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {editingUser && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-medium mb-4 text-primary-700">Modifier l'utilisateur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700">Nom complet</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700">Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="owner">Propriétaire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700">Statut</label>
                <select
                  value={editingUser.subscription_status}
                  onChange={(e) => setEditingUser({ ...editingUser, subscription_status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded-md text-primary-700 hover:bg-surface"
                disabled={processingAction === editingUser.id}
              >
                Annuler
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-accent-400 text-white rounded-md hover:bg-accent-500 disabled:opacity-50"
                disabled={processingAction === editingUser.id}
              >
                {processingAction === editingUser.id ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-medium mb-4 text-primary-700">Confirmer la suppression</h3>
            <p className="text-primary-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border rounded-md text-primary-700 hover:bg-surface"
                disabled={processingAction === showDeleteConfirm}
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 disabled:opacity-50"
                disabled={processingAction === showDeleteConfirm}
              >
                {processingAction === showDeleteConfirm ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion d'absence */}
      {showAbsenceModal && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-lg w-full mx-4 border border-border">
            <h3 className="text-lg font-medium mb-4 text-primary-700">Planifier une absence</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-700">
                  <strong>ℹ️ Absences exceptionnelles uniquement:</strong> Maladie, opération, accident, urgence.
                  <br />
                  <strong>❌ Pas pour les vacances</strong> → L'utilisateur les saisit dans ses indisponibilités.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Date de début d'absence
                </label>
                <input
                  type="date"
                  value={absenceData.inactive_from}
                  onChange={(e) => setAbsenceData({ ...absenceData, inactive_from: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  placeholder="Laissez vide pour aujourd'hui"
                />
                <p className="text-xs text-primary-400 mt-1">
                  Exemple: Opération prévue dans 3 jours → Sélectionnez la date
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Date de retour (fin d'absence)
                </label>
                <input
                  type="date"
                  value={absenceData.inactive_until}
                  onChange={(e) => setAbsenceData({ ...absenceData, inactive_until: e.target.value })}
                  min={absenceData.inactive_from || new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  placeholder="Laissez vide pour absence indéfinie"
                />
                <p className="text-xs text-primary-400 mt-1">
                  Laissez vide pour absence de durée indéterminée
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Raison (optionnel)
                </label>
                <input
                  type="text"
                  value={absenceData.inactive_reason}
                  onChange={(e) => setAbsenceData({ ...absenceData, inactive_reason: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  placeholder="Ex: Opération, Congé maladie, Accident..."
                  maxLength={100}
                />
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <p className="text-sm text-orange-700">
                  <strong>⚠️ Pendant l'absence:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>L'utilisateur ne recevra aucune nouvelle tâche</li>
                    <li>Aucun courriel de rappel ne sera envoyé</li>
                    <li>Les tâches déjà assignées sont conservées</li>
                  </ul>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAbsenceModal(null);
                  setAbsenceData({ inactive_from: '', inactive_until: '', inactive_reason: '' });
                }}
                className="px-4 py-2 border rounded-md text-primary-700 hover:bg-surface"
                disabled={processingAction === showAbsenceModal}
              >
                Annuler
              </button>
              <button
                onClick={handleSetAbsence}
                className="px-4 py-2 bg-accent-400 text-white rounded-md hover:bg-accent-500 disabled:opacity-50"
                disabled={processingAction === showAbsenceModal}
              >
                {processingAction === showAbsenceModal ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-medium mb-4 text-primary-700">Nouvel utilisateur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700">Nom complet</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700">Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700">Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-accent-400 focus:ring-accent-400 p-2 border"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                  <option value="owner">Propriétaire</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUser({
                    email: '',
                    full_name: '',
                    password: '',
                    role: 'user'
                  });
                }}
                className="px-4 py-2 border rounded-md text-primary-700 hover:bg-surface"
                disabled={processingAction === 'new'}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-accent-400 text-white rounded-md hover:bg-accent-500 disabled:opacity-50"
                disabled={processingAction === 'new' || !newUser.email || !newUser.full_name || !newUser.password}
              >
                {processingAction === 'new' ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}