import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n/LanguageContext';

// Normalized file to ensure no accidental line-wrapping within JSX attributes

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  groups: any[];
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, groups }: TaskModalProps) {
  const { t } = useTranslation();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '10:30',
    endTime: '16:30',
    priority: 'high',
    group: 'Équipe B',
    group_id: ''
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Keep group_id in sync when modal opens or groups change
  useEffect(() => {
    if (isOpen && groups && groups.length > 0) {
      const firstGroupId = groups[0].id;
      setNewTask(prev => ({ ...prev, group_id: firstGroupId, group: groups[0].name }));
      setSelectedGroupIds([firstGroupId]);
    }
  }, [isOpen, groups]);

  const handleCreateTask = async () => {
    try {
      setError(null);
      console.log('TaskModal: creating task', newTask, 'groups:', selectedGroupIds);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const startDateTime = new Date(`${newTask.startDate}T${newTask.startTime}`);
      const endDateTime = new Date(`${newTask.endDate}T${newTask.endTime}`);

      if (selectedGroupIds.length === 0) {
        const msg = t.tasks.noGroupSelected;
        setError(msg);
        try { alert(msg); } catch (_e) {}
        return;
      }

      const { data: insertedTask, error: insertError } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          duration: Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)),
          created_by: userData.user.id,
          group_id: selectedGroupIds[0] // Primary group for backward compat
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Insert task_groups associations
      const taskGroupsData = selectedGroupIds.map(gid => ({
        task_id: insertedTask.id,
        group_id: gid
      }));
      
      const { error: tgError } = await supabase.from('task_groups').insert(taskGroupsData);
      if (tgError) throw tgError;

      onClose();
      setNewTask({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '10:30',
        endTime: '16:30',
        priority: 'high',
        group: 'Équipe B',
        group_id: ''
      });
      setSelectedGroupIds([]);
      onTaskCreated();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      const msg = error?.message || String(error);
      setError(msg);
      try { alert('Erreur lors de la création de la tâche : ' + msg); } catch (_e) { /* ignore */ }
    }
  };

  const baseInputClass = 'w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-background text-primary-700 placeholder:text-primary-300 transition-all';

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-primary-700 tracking-tight">{t.tasks.createTask}</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">{t.tasks.associatedGroups}</label>
              <div className="border border-border rounded-xl p-3 max-h-40 overflow-y-auto bg-background space-y-2">
                {groups.length === 0 ? (
                  <p className="text-primary-400 text-sm">{t.tasks.noGroupAvailable}</p>
                ) : (
                  groups.map(g => (
                    <label key={g.id} className="flex items-center cursor-pointer hover:bg-primary-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroupIds([...selectedGroupIds, g.id]);
                          } else {
                            setSelectedGroupIds(selectedGroupIds.filter(id => id !== g.id));
                          }
                        }}
                        className="w-4 h-4 accent-primary-600 cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-primary-700">{g.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedGroupIds.length === 0 && (
                <p className="text-error-600 text-xs mt-1">{t.tasks.atLeastOneGroup}</p>
              )}
            </div>
            <input
              className={baseInputClass}
              placeholder={t.tasks.titlePlaceholder}
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              className={baseInputClass}
              placeholder={t.tasks.descriptionPlaceholder}
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="flex space-x-3">
              <input
                type="date"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.startDate}
                onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
              />
              <input
                type="time"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.startTime}
                onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
              />
            </div>
            <div className="flex space-x-3">
              <input
                type="date"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.endDate}
                onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
              />
              <input
                type="time"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.endTime}
                onChange={e => setNewTask({ ...newTask, endTime: e.target.value })}
              />
            </div>
            <select
              className="w-full border border-border rounded-xl px-4 py-3 bg-background text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all"
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="high">{t.tasks.highPriority}</option>
              <option value="medium">{t.tasks.mediumPriority}</option>
              <option value="low">{t.tasks.lowPriority}</option>
            </select>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded border border-error-200 bg-error-50 text-error-700">{error}</div>
          )}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              className="px-5 py-2 bg-muted text-primary-400 rounded-xl hover:bg-primary-100 font-semibold transition-all"
              onClick={onClose}
            >
              {t.common.cancel}
            </button>
            <button
              className="px-5 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 font-semibold shadow-md transition-all"
              onClick={handleCreateTask}
            >
              {t.tasks.create}
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}