import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/gotrue-js';
import { useTranslation } from '../i18n/LanguageContext';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  user: User;
  groupId?: string | null;
}

export default function GroupModal({ isOpen, onClose, onGroupCreated, user, groupId }: GroupModalProps) {
  const { t } = useTranslation();
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    unavailability_period_weeks: 2
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load group data when editing
  useEffect(() => {
    if (isOpen && groupId) {
      loadGroup();
    } else if (isOpen && !groupId) {
      // Reset form for new group
      setNewGroup({ name: '', description: '', unavailability_period_weeks: 2 });
    }
  }, [isOpen, groupId]);

  const loadGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      if (data) {
        setNewGroup({
          name: data.name,
          description: data.description,
          unavailability_period_weeks: data.unavailability_period_weeks
        });
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du groupe:', err);
      setError('Erreur lors du chargement du groupe');
    }
  };

  const handleCreateGroup = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!newGroup.name.trim()) {
        setError(t.groups.groupNameRequired);
        return;
      }

      const groupData = {
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        unavailability_period_weeks: newGroup.unavailability_period_weeks,
      };

      if (groupId) {
        // Update existing group
        const { error: updateError } = await supabase
          .from('groups')
          .update(groupData)
          .eq('id', groupId);

        if (updateError) throw updateError;
      } else {
        // Create new group
        const { error: insertError } = await supabase
          .from('groups')
          .insert([{
            ...groupData,
            admin_id: user.id,
          }]);

        if (insertError) throw insertError;
      }

      setNewGroup({ name: '', description: '', unavailability_period_weeks: 2 });
      onClose();
      onGroupCreated();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du groupe:', err);
      const msg = err?.message || String(err);
      setError(msg);
      try { alert('Erreur lors de la sauvegarde du groupe : ' + msg); } catch (_e) { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = 'w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-background text-primary-700 placeholder:text-primary-300 transition-all';

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-primary-700 tracking-tight">{groupId ? t.groups.editGroup : t.groups.createGroup}</h2>
          <div className="space-y-5">
            <input
              className={baseInputClass}
              placeholder={t.groups.groupNamePlaceholder}
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <textarea
              className={baseInputClass}
              placeholder={t.groups.descriptionOptional}
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                {t.groups.frequencyLabel}
              </label>
              <select
                className={baseInputClass}
                value={newGroup.unavailability_period_weeks}
                onChange={e => setNewGroup({ ...newGroup, unavailability_period_weeks: parseInt(e.target.value) })}
              >
                <option value={1}>{t.groups.everyWeek}</option>
                <option value={2}>{t.groups.every2Weeks}</option>
                <option value={4}>{t.groups.everyMonth}</option>
                <option value={8}>{t.groups.every2Months}</option>
                <option value={12}>{t.groups.every3Months}</option>
                <option value={24}>{t.groups.every6Months}</option>
                <option value={52}>{t.groups.everyYear}</option>
                <option value={0}>Personnalisé</option>
              </select>
              {newGroup.unavailability_period_weeks === 0 && (
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    max="104"
                    className={baseInputClass}
                    placeholder={t.groups.customWeeks}
                    onChange={e => {
                      const weeks = parseInt(e.target.value) || 2;
                      setNewGroup({ ...newGroup, unavailability_period_weeks: weeks });
                    }}
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    {t.groups.customWeeksHelp}
                  </p>
                </div>
              )}
              <p className="text-xs text-primary-400 mt-1">
                {t.groups.frequencyHelp}
              </p>
            </div>
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
              {t.common.cancel}
            </button>
            <button
              className="px-5 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 font-semibold shadow-md transition-all disabled:opacity-50"
              onClick={handleCreateGroup}
              disabled={loading || !newGroup.name.trim()}
            >
              {loading ? t.groups.creating : (groupId ? t.common.save : t.groups.create)}
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}
