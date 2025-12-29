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
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Dédupliquer les utilisateurs par email (insensible à la casse)
      const uniqueUsers = new Map<string, UserProfile>();
      
      data?.forEach(user => {
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
              <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight">Gestion des utilisateurs</h1>
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