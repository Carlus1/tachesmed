import { useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  user: User;
}

export default function GroupModal({ isOpen, onClose, onGroupCreated, user }: GroupModalProps) {
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    try {
      setError(null);
      setLoading(true);

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
          },
        ]);

      if (insertError) throw insertError;

      setNewGroup({ name: '', description: '' });
      onClose();
      onGroupCreated();
    } catch (err: any) {
      console.error('Erreur lors de la création du groupe:', err);
      const msg = err?.message || String(err);
      setError(msg);
      try { alert('Erreur lors de la création du groupe : ' + msg); } catch (_e) { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = 'w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-background text-primary-700 placeholder:text-primary-300 transition-all';

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-primary-700 tracking-tight">Créer un groupe</h2>
          <div className="space-y-5">
            <input
              className={baseInputClass}
              placeholder="Nom du groupe"
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <textarea
              className={baseInputClass}
              placeholder="Description (optionnel)"
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 rounded border border-error-200 bg-error-50 text-error-700">{error}</div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <button
              className="px-5 py-2 bg-muted text-primary-400 rounded-xl hover:bg-primary-100 font-semibold transition-all"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className="px-5 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 font-semibold shadow-md transition-all disabled:opacity-50"
              onClick={handleCreateGroup}
              disabled={loading || !newGroup.name.trim()}
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}
