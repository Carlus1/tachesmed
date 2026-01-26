import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { supabase } from '../supabase';
import { maintainRecurringTasks } from '../utils/taskInstances';
import {
  calendarOptimizationService,
  OptimizationConstraints,
  OptimizationResult,
  TaskAssignment,
  PeriodConfig,
} from '../services/calendarOptimization';
import ProposalCalendar from './ProposalCalendar';

export default function CalendarProposal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [showConstraints, setShowConstraints] = useState(false);
  
  // Configuration de période
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig>({
    duration: 8,
    unit: 'weeks',
  });
  
  // Date de début personnalisée (optionnelle)
  const [customStartDate, setCustomStartDate] = useState<string>('');
  
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    balanceWorkload: true,
    respectPriority: true,
    minimizeConflicts: true,
    maxTasksPerUser: null,
    preferredStartHour: 8,
    preferredEndHour: 18,
    avoidTaskRepetition: true,
    avoidConsecutiveWeeks: true,
    considerPreviousPeriod: true,
  });

  useEffect(() => {
    loadPreferences();
    loadGroups();
  }, []);

  // Sélectionner automatiquement le premier groupe si aucun n'est sélectionné
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      console.log('🔄 Auto-sélection du premier groupe:', groups[0].id);
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Suggérer automatiquement la date de début après la période active
  useEffect(() => {
    if (selectedGroupId) {
      suggestNextStartDate();
    }
  }, [selectedGroupId]);

  const suggestNextStartDate = async () => {
    if (!selectedGroupId) return;

    try {
      const { data: existingPeriods } = await supabase
        .from('optimization_periods')
        .select('end_date')
        .eq('group_id', selectedGroupId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1);

      if (existingPeriods && existingPeriods.length > 0) {
        const lastPeriodEnd = new Date(existingPeriods[0].end_date);
        const suggestedDate = new Date(lastPeriodEnd);
        suggestedDate.setDate(suggestedDate.getDate() + 1); // Lendemain
        
        setCustomStartDate(suggestedDate.toISOString().split('T')[0]);
        console.log('💡 Date suggérée (après période):', suggestedDate.toLocaleDateString('fr-FR'));
      } else {
        // Pas de période active, utiliser la date d'aujourd'hui
        const today = new Date();
        setCustomStartDate(today.toISOString().split('T')[0]);
        console.log('💡 Date suggérée (aujourd\'hui):', today.toLocaleDateString('fr-FR'));
      }
    } catch (error) {
      console.error('Erreur lors de la suggestion de date:', error);
    }
  };

  // Charger les préférences sauvegardées
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('calendarProposalPreferences');
      console.log('📦 Chargement préférences:', saved);
      if (saved) {
        const prefs = JSON.parse(saved);
        console.log('✅ Préférences chargées:', prefs);
        if (prefs.selectedGroupId) setSelectedGroupId(prefs.selectedGroupId);
        if (prefs.periodConfig) setPeriodConfig(prefs.periodConfig);
        if (prefs.constraints) setConstraints(prefs.constraints);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des préférences:', err);
    }
  };

  // Sauvegarder les préférences
  const savePreferences = () => {
    try {
      const prefs = {
        selectedGroupId,
        periodConfig,
        constraints,
      };
      console.log('💾 Sauvegarde préférences:', prefs);
      localStorage.setItem('calendarProposalPreferences', JSON.stringify(prefs));
      console.log('✅ Préférences sauvegardées');
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde des préférences:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Vérifier le rôle de l'utilisateur
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      const isOwner = userProfile?.role === 'owner';

      let groupsQuery = supabase
        .from('groups')
        .select('id, name')
        .order('name');

      // Si pas owner, filtrer uniquement les groupes dont l'utilisateur est admin
      if (!isOwner) {
        groupsQuery = groupsQuery.eq('admin_id', userData.user.id);
      }

      const { data, error } = await groupsQuery;

      if (error) throw error;

      setGroups(data || []);
      
      console.log('📋 Groupes chargés:', data?.length);
    } catch (err) {
      console.error('Erreur lors du chargement des groupes:', err);
    }
  };

  const generateProposal = async () => {
    if (!selectedGroupId) {
      setError(t.calendarProposal?.selectGroup || 'Veuillez sélectionner un groupe');
      return;
    }

    // Sauvegarder les préférences
    savePreferences();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Calculer d'abord la période qu'on veut générer
      const startDate = customStartDate ? new Date(customStartDate) : new Date();
      const endDate = new Date(startDate);
      
      if (periodConfig.unit === 'weeks') {
        endDate.setDate(endDate.getDate() + ((periodConfig.duration - 1) * 7));
      } else if (periodConfig.unit === 'months') {
        endDate.setMonth(endDate.getMonth() + periodConfig.duration);
      }

      // **VÉRIFICATION CHEVAUCHEMENT avec périodes existantes**
      const { data: existingPeriods } = await supabase
        .from('optimization_periods')
        .select('id, start_date, end_date, status')
        .eq('group_id', selectedGroupId)
        .eq('status', 'active');

      if (existingPeriods && existingPeriods.length > 0) {
        // Vérifier si la nouvelle période CHEVAUCHE une période existante
        const hasOverlap = existingPeriods.some(period => {
          const existingStart = new Date(period.start_date);
          const existingEnd = new Date(period.end_date);
          
          // Chevauchement si: nouvelle commence avant fin existante ET nouvelle finit après début existante
          return startDate <= existingEnd && endDate >= existingStart;
        });

        if (hasOverlap) {
          const period = existingPeriods[0];
          const existingEndDate = new Date(period.end_date);
          const suggestedStartDate = new Date(existingEndDate);
          suggestedStartDate.setDate(suggestedStartDate.getDate() + 1); // Jour après la fin
          
          const startStr = new Date(period.start_date).toLocaleDateString('fr-FR');
          const endStr = existingEndDate.toLocaleDateString('fr-FR');
          const suggestedStr = suggestedStartDate.toISOString().split('T')[0];
          
          throw new Error(
            `❌ La période que vous tentez de générer chevauche une période déjà acceptée (${startStr} au ${endStr}).\n\n` +
            `💡 Suggestion: Choisissez une date de début après le ${endStr}, par exemple le ${suggestedStartDate.toLocaleDateString('fr-FR')}.\n\n` +
            `Cliquez sur "Date de début" ci-dessus et sélectionnez ${suggestedStartDate.toLocaleDateString('fr-FR')} ou plus tard.`
          );
        }
      }

      const optimizationResult = await calendarOptimizationService.generateOptimizedCalendar(
        selectedGroupId,
        constraints,
        startDate,
        endDate
      );

      console.log('📊 Résultat optimisation:', optimizationResult);

      if (optimizationResult.assignments.length === 0) {
        setError(t.calendarProposal?.noTasksToAssign || 'Aucune tâche à assigner');
        setResult(null); // Ne pas afficher les boutons d'action
      } else {
        setResult(optimizationResult);
        
        // Afficher un message d'information si solution non optimale
        if (optimizationResult.message) {
          setSuccess(`✅ Solution générée (tentative ${optimizationResult.attemptNumber}). ${optimizationResult.message}`);
          // Effacer après 10 secondes pour les messages longs
          setTimeout(() => setSuccess(null), 10000);
        } else if (optimizationResult.isOptimal) {
          setSuccess(`✅ Solution optimale trouvée à la tentative ${optimizationResult.attemptNumber}!`);
          setTimeout(() => setSuccess(null), 5000);
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la génération:', err);
      console.error('Détails erreur:', JSON.stringify(err, null, 2));
      
      const errorMessage = err?.message || err?.error?.message || 
        t.calendarProposal?.generationError || 'Erreur lors de la génération de la proposition';
      
      setError(errorMessage);
      setResult(null); // Reset result to show generate button again
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async () => {
    if (!result || result.assignments.length === 0 || !selectedGroupId) return;

    setLoading(true);
    setError(null);

    try {
      // Vérifier que l'utilisateur est admin du groupe
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data: groupData } = await supabase
        .from('groups')
        .select('admin_id')
        .eq('id', selectedGroupId)
        .single();

      if (!groupData || groupData.admin_id !== userData.user.id) {
        throw new Error('Seul l\'administrateur du groupe peut accepter une proposition');
      }

      // Calculer les dates de la période
      const startDate = new Date();
      const endDate = new Date();
      
      if (periodConfig.unit === 'weeks') {
        // Pour N semaines, générer N occurrences hebdomadaires = (N-1) * 7 jours
        endDate.setDate(endDate.getDate() + ((periodConfig.duration - 1) * 7));
      } else if (periodConfig.unit === 'months') {
        endDate.setMonth(endDate.getMonth() + periodConfig.duration);
      }

      // Vérifier qu'il n'existe pas déjà une période pour ce groupe à ces dates
      const { data: existingPeriods } = await supabase
        .from('optimization_periods')
        .select('id, start_date, end_date')
        .eq('group_id', selectedGroupId)
        .eq('status', 'active')
        .gte('end_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString());

      if (existingPeriods && existingPeriods.length > 0) {
        const period = existingPeriods[0];
        const existingStart = new Date(period.start_date).toLocaleDateString('fr-FR');
        const existingEnd = new Date(period.end_date).toLocaleDateString('fr-FR');
        throw new Error(
          `Une période d'optimisation existe déjà pour ce groupe (${existingStart} - ${existingEnd}). ` +
          `Supprimez-la avant d'en créer une nouvelle.`
        );
      }

      // Sauvegarder les assignations et créer la période verrouillée
      const saveResult = await calendarOptimizationService.saveAssignments(
        result.assignments,
        selectedGroupId,
        startDate,
        endDate,
        result.statistics.totalTasks
      );
      
      setSuccess(
        `✅ Proposition acceptée et période verrouillée (ID: ${saveResult.periodId.substring(0, 8)}...). ` +
        `Les modifications d'indisponibilités sont maintenant bloquées pour cette période.`
      );
      setResult(null);
      
      // Attendre un peu puis effacer le message
      setTimeout(() => setSuccess(null), 8000);
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
      setError(
        err instanceof Error ? err.message : 
        (t.calendarProposal?.acceptError || 'Erreur lors de l\'acceptation de la proposition')
      );
    } finally {
      setLoading(false);
    }
  };

  const viewInCalendar = () => {
    navigate('/calendar');
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary-700">
          {t.calendarProposal?.title || t.dashboard.calendarProposal}
        </h2>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-sm text-success-800">{success}</p>
        </div>
      )}

      <div className="p-4">
        {/* Sélection du groupe */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            {t.calendarProposal?.selectGroup || 'Sélectionner un groupe'}
          </label>
          <select
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            disabled={loading}
          >
            <option value="">{t.calendarProposal?.chooseGroup || 'Choisir un groupe...'}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Configuration de la période */}
        <div className="mb-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
          <h3 className="text-sm font-semibold text-primary-800 mb-3">
            {t.calendarProposal?.periodConfiguration || 'Configuration de la période'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-primary-700 mb-1">
                {t.calendarProposal?.periodDuration || 'Durée'}
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={periodConfig.duration}
                onChange={(e) =>
                  setPeriodConfig({
                    ...periodConfig,
                    duration: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-primary-700 mb-1">
                {t.calendarProposal?.periodUnit || 'Unité'}
              </label>
              <select
                value={periodConfig.unit}
                onChange={(e) =>
                  setPeriodConfig({
                    ...periodConfig,
                    unit: e.target.value as 'weeks' | 'months',
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg"
                disabled={loading}
              >
                <option value="weeks">{t.calendarProposal?.weeks || 'Semaines'}</option>
                <option value="months">{t.calendarProposal?.months || 'Mois'}</option>
              </select>
            </div>
          </div>
          
          {/* Date de début personnalisée */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              📅 {t.calendarProposal?.startDate || 'Date de début'}
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-border rounded-lg"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-primary-600">
              📆 Période: {customStartDate 
                ? `${new Date(customStartDate).toLocaleDateString('fr-FR')} → ${new Date(new Date(customStartDate).getTime() + (periodConfig.unit === 'weeks' ? (periodConfig.duration - 1) * 7 : periodConfig.duration * 30) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}`
                : 'Chargement...'}
            </p>
          </div>
          
          <p className="mt-2 text-xs text-primary-600">
            {t.calendarProposal?.periodInfo || 'La proposition sera générée pour cette période'}
          </p>
        </div>

        {/* Bouton pour afficher/masquer les contraintes */}
        <button
          onClick={() => setShowConstraints(!showConstraints)}
          className="mb-4 text-sm text-accent-500 hover:text-accent-600 flex items-center gap-2"
          disabled={loading}
        >
          <span>{showConstraints ? '▼' : '▶'}</span>
          {t.calendarProposal?.constraints || 'Contraintes d\'optimisation'}
        </button>

        {/* Panneau des contraintes */}
        {showConstraints && (
          <div className="mb-4 p-4 bg-primary-50 rounded-lg space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={constraints.balanceWorkload}
                onChange={(e) =>
                  setConstraints({ ...constraints, balanceWorkload: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-primary-700">
                {t.calendarProposal?.balanceWorkload || 'Équilibrer la charge de travail'}
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={constraints.respectPriority}
                onChange={(e) =>
                  setConstraints({ ...constraints, respectPriority: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-primary-700">
                {t.calendarProposal?.respectPriority || 'Respecter les priorités'}
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={constraints.minimizeConflicts}
                onChange={(e) =>
                  setConstraints({ ...constraints, minimizeConflicts: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-primary-700">
                {t.calendarProposal?.minimizeConflicts || 'Minimiser les conflits'}
              </span>
            </label>

            {/* Nouvelles contraintes de répétition */}
            <div className="border-t border-primary-200 pt-3 mt-3">
              <p className="text-xs font-semibold text-primary-800 mb-2">
                {t.calendarProposal?.repetitionConstraints || 'Contraintes de répétition'}
              </p>
              
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={constraints.avoidTaskRepetition}
                  onChange={(e) =>
                    setConstraints({ ...constraints, avoidTaskRepetition: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-primary-700">
                  {t.calendarProposal?.avoidTaskRepetition || 'Éviter qu\'un utilisateur fasse la même tâche plusieurs fois'}
                </span>
              </label>

              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={constraints.avoidConsecutiveWeeks}
                  onChange={(e) =>
                    setConstraints({ ...constraints, avoidConsecutiveWeeks: e.target.checked })
                  }
                  className="rounded"
                  disabled={!constraints.avoidTaskRepetition}
                />
                <span className={`text-sm ${constraints.avoidTaskRepetition ? 'text-primary-700' : 'text-primary-400'}`}>
                  {t.calendarProposal?.avoidConsecutiveWeeks || 'Éviter les semaines consécutives (si répétition nécessaire)'}
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={constraints.considerPreviousPeriod}
                  onChange={(e) =>
                    setConstraints({ ...constraints, considerPreviousPeriod: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-primary-700">
                  {t.calendarProposal?.considerPreviousPeriod || 'Tenir compte de la période précédente'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-primary-700 mb-1">
                  {t.calendarProposal?.startHour || 'Heure de début'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={constraints.preferredStartHour}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      preferredStartHour: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-primary-700 mb-1">
                  {t.calendarProposal?.endHour || 'Heure de fin'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={constraints.preferredEndHour}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      preferredEndHour: parseInt(e.target.value) || 23,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-primary-700 mb-1">
                {t.calendarProposal?.maxTasksPerUser || 'Nombre max de tâches par utilisateur (optionnel)'}
              </label>
              <input
                type="number"
                min="1"
                value={constraints.maxTasksPerUser || ''}
                onChange={(e) =>
                  setConstraints({
                    ...constraints,
                    maxTasksPerUser: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder={t.calendarProposal?.unlimited || 'Illimité'}
                className="w-full px-3 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Bouton de génération */}
        {!result && (
          <button
            onClick={generateProposal}
            disabled={loading || !selectedGroupId}
            className="w-full mb-4 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:bg-primary-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⟳</span>
                {t.calendarProposal?.generating || 'Génération en cours...'}
              </>
            ) : (
              t.calendarProposal?.generate || 'Générer la proposition'
            )}
          </button>
        )}

        {/* Résultats */}
        {result && (
          <>
            {/* Calendrier de prévisualisation */}
            <div className="mb-4">
              <ProposalCalendar 
                assignments={result.assignments}
                view="month"
              />
            </div>

            {/* Statistiques */}
            <div className="mb-4 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-semibold text-primary-800 mb-2">
                {t.calendarProposal?.statistics || 'Statistiques'}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.totalTasks || 'Tâches totales'} :
                  </span>
                  <span className="ml-2 font-semibold">{result.statistics.totalTasks}</span>
                </div>
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.assignedTasks || 'Tâches assignées'} :
                  </span>
                  <span className="ml-2 font-semibold text-success-700">
                    {result.statistics.assignedTasks}
                  </span>
                </div>
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.unassignedTasks || 'Non assignées'} :
                  </span>
                  <span className="ml-2 font-semibold text-danger-700">
                    {result.statistics.unassignedTasks}
                  </span>
                </div>
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.conflicts || 'Conflits détectés'} :
                  </span>
                  <span className="ml-2 font-semibold text-warning-700">
                    {result.statistics.conflictsDetected}
                  </span>
                </div>
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.repetitions || 'Répétitions'} :
                  </span>
                  <span className="ml-2 font-semibold text-warning-600">
                    {result.statistics.repetitionsCount}
                  </span>
                </div>
                <div>
                  <span className="text-primary-600">
                    {t.calendarProposal?.consecutiveWeeks || 'Semaines consécutives'} :
                  </span>
                  <span className="ml-2 font-semibold text-warning-600">
                    {result.statistics.consecutiveWeeksCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Tâches non assignées */}
            {result.unassignedTasks.length > 0 && (
              <div className="mb-4 p-4 bg-danger-50 rounded-lg">
                <h3 className="font-semibold text-danger-800 mb-2">
                  {t.calendarProposal?.unassignedTasksTitle || 'Tâches non assignées'}
                </h3>
                <ul className="list-disc list-inside text-sm text-danger-700">
                  {result.unassignedTasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Boutons d'action */}
      {result && (
        <div className="flex border-t border-border">
          <button
            onClick={acceptProposal}
            disabled={loading || result.assignments.length === 0}
            className="flex-1 py-3 text-center text-success-700 hover:bg-success-50 transition-colors disabled:text-primary-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              t.calendarProposal?.accept || t.dashboard.accept
            )}
          </button>
          <button
            onClick={viewInCalendar}
            className="flex-1 py-3 text-center text-primary-700 hover:bg-primary-50 transition-colors border-l border-border font-medium"
          >
            📅 {t.calendarProposal?.viewInCalendar || 'Voir dans le calendrier'}
          </button>
          <button
            onClick={() => {
              setResult(null);
              generateProposal();
            }}
            disabled={loading}
            className="flex-1 py-3 text-center text-accent-500 hover:bg-primary-50 transition-colors border-l border-border disabled:text-primary-300 disabled:cursor-not-allowed"
          >
            {t.calendarProposal?.regenerate || t.dashboard.regenerate}
          </button>
        </div>
      )}
    </div>
  );
}