import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n/LanguageContext';
import TimePicker from './TimePicker';

// Normalized file to ensure no accidental line-wrapping within JSX attributes

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  groups: any[];
  taskId?: string | null;
}

export default function TaskModal({ isOpen, onClose, onTaskCreated, groups, taskId }: TaskModalProps) {
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
    group_id: '',
    recurrence_type: 'none',
    recurrence_interval: null as number | null,
    recurrence_end_date: ''
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep group_id in sync when modal opens or groups change
  useEffect(() => {
    if (isOpen && groups && groups.length > 0) {
      if (taskId) {
        loadTask();
      } else {
        const firstGroupId = groups[0].id;
        setNewTask(prev => ({ ...prev, group_id: firstGroupId, group: groups[0].name }));
        setSelectedGroupIds([firstGroupId]);
      }
    }
  }, [isOpen, groups, taskId]);

  const loadTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      if (data) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        
        setNewTask({
          title: data.title,
          description: data.description,
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          startTime: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5),
          priority: data.priority,
          group: '',
          group_id: data.group_id,
          recurrence_type: data.recurrence_type || 'none',
          recurrence_interval: data.recurrence_interval || null,
          recurrence_end_date: data.recurrence_end_date ? new Date(data.recurrence_end_date).toISOString().slice(0, 10) : ''
        });

        // Load associated groups from task_groups table
        const { data: taskGroups, error: tgError } = await supabase
          .from('task_groups')
          .select('group_id')
          .eq('task_id', taskId);

        if (!tgError && taskGroups) {
          setSelectedGroupIds(taskGroups.map(tg => tg.group_id));
        } else if (data.group_id) {
          setSelectedGroupIds([data.group_id]);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement de la tâche:', err);
      setError('Erreur lors du chargement de la tâche');
    }
  };

  const handleCreateTask = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('TaskModal: saving task', newTask, 'groups:', selectedGroupIds);
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

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        duration: Math.floor((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)),
        group_id: selectedGroupIds[0], // Primary group for backward compat
        recurrence_type: newTask.recurrence_type,
        recurrence_interval: newTask.recurrence_type === 'custom' ? newTask.recurrence_interval : null,
        recurrence_end_date: newTask.recurrence_end_date ? new Date(`${newTask.recurrence_end_date}T23:59:59`).toISOString() : null
      };

      if (taskId) {
        // Update existing task
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId);

        if (updateError) throw updateError;

        // Delete old task_groups and insert new ones
        await supabase.from('task_groups').delete().eq('task_id', taskId);
        const taskGroupsData = selectedGroupIds.map(gid => ({ task_id: taskId, group_id: gid }));
        const { error: tgError } = await supabase.from('task_groups').insert(taskGroupsData);
        if (tgError) throw tgError;
      } else {
        // Create new task
        const { data: insertedTask, error: insertError } = await supabase
          .from('tasks')
          .insert([{
            ...taskData,
            created_by: userData.user.id
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
      }

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
        group_id: '',
        recurrence_type: 'none',
        recurrence_interval: null,
        recurrence_end_date: ''
      });
      setSelectedGroupIds([]);
      onTaskCreated();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      const msg = error?.message || String(error);
      setError(msg);
      try { alert('Erreur lors de la sauvegarde de la tâche : ' + msg); } catch (_e) { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = 'w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-400 bg-background text-primary-700 placeholder:text-primary-300 transition-all';

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl p-10 w-full max-w-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-primary-700 tracking-tight">{taskId ? t.tasks.editTask : t.tasks.createTask}</h2>
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
              <TimePicker
                value={newTask.startTime}
                onChange={(time) => setNewTask({ ...newTask, startTime: time })}
                className="flex-1"
              />
            </div>
            <div className="flex space-x-3">
              <input
                type="date"
                className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-primary-700"
                value={newTask.endDate}
                onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
              />
              <TimePicker
                value={newTask.endTime}
                onChange={(time) => setNewTask({ ...newTask, endTime: time })}
                className="flex-1"
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
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                {t.tasks.recurrenceLabel}
              </label>
              <select
                className={baseInputClass}
                value={newTask.recurrence_type}
                onChange={e => setNewTask({ ...newTask, recurrence_type: e.target.value })}
              >
                <option value="none">{t.tasks.noRecurrence}</option>
                <option value="weekly">{t.tasks.weekly}</option>
                <option value="bi-weekly">{t.tasks.biWeekly}</option>
                <option value="monthly">{t.tasks.monthly}</option>
                <option value="bi-monthly">{t.tasks.biMonthly}</option>
                <option value="quarterly">{t.tasks.quarterly}</option>
                <option value="semi-annually">{t.tasks.semiAnnually}</option>
                <option value="yearly">{t.tasks.yearly}</option>
                <option value="custom">{t.tasks.custom}</option>
              </select>
              {newTask.recurrence_type === 'custom' && (
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    className={baseInputClass}
                    placeholder={t.tasks.customWeeks}
                    value={newTask.recurrence_interval || ''}
                    onChange={e => {
                      const weeks = parseInt(e.target.value) || null;
                      setNewTask({ ...newTask, recurrence_interval: weeks });
                    }}
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    {t.tasks.customWeeksHelp}
                  </p>
                </div>
              )}
              {newTask.recurrence_type !== 'none' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    {t.tasks.recurrenceEndDate}
                  </label>
                  <input
                    type="date"
                    className={baseInputClass}
                    value={newTask.recurrence_end_date}
                    onChange={e => setNewTask({ ...newTask, recurrence_end_date: e.target.value })}
                  />
                  <p className="text-xs text-primary-400 mt-1">
                    {t.tasks.recurrenceEndDateHelp}
                  </p>
                </div>
              )}
              <p className="text-xs text-primary-400 mt-1">
                {t.tasks.recurrenceHelp}
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
            >
              {t.common.cancel}
            </button>
            <button
              className="px-5 py-2 bg-accent-400 text-white rounded-xl hover:bg-accent-500 font-semibold shadow-md transition-all disabled:opacity-50"
              onClick={handleCreateTask}
              disabled={loading}
            >
              {loading ? t.tasks.creating : (taskId ? t.tasks.modify : t.tasks.create)}
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}