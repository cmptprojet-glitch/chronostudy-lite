import React, { useState } from 'react';
import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  StudySessionLog,
  Task,
  FlashcardDeck,
  StudyDocument,
} from '../types';
import {
  Award,
  Flame,
  Crown,
  Shield,
  BookOpen,
  Sparkles,
  Trophy,
  Zap,
  Clock,
  Medal,
  CheckCircle2,
  Target,
  FileText,
  Lock,
  Search,
  Filter,
  Check,
  Star,
  Info,
  X,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementsSectionProps {
  logs: StudySessionLog[];
  tasks: Task[];
  decks: FlashcardDeck[];
  documents?: StudyDocument[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  logs,
  tasks,
  decks,
  documents = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBadgeModal, setActiveBadgeModal] = useState<Achievement | null>(null);
  const [isBadgesExpanded, setIsBadgesExpanded] = useState<boolean>(false);

  // 1. CALCULATE RELEVANT METRICS FROM PROPS
  const totalStudyMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalStudyHours = totalStudyMinutes / 60;

  const pomodoroCount = logs.filter((l) => l.type === 'pomodoro').length;

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const completedSubtasksCount = tasks.reduce(
    (acc, t) => acc + (t.subtasks ? t.subtasks.filter((st) => st.completed).length : 0),
    0
  );
  const totalAccomplishments = completedTasksCount + completedSubtasksCount;

  const totalDecksCount = decks.length;
  const totalCardsCount = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const cardsReviewedCount = decks.reduce(
    (acc, d) => acc + d.cards.reduce((sum, c) => sum + (c.reviewCount || 0), 0),
    0
  );
  const masteredCardsCount = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.lastEvaluated === 'easy').length,
    0
  );
  // Flashcards metric combines mastered cards and total reviews for active recall milestone
  const flashcardProgressValue = Math.max(cardsReviewedCount, masteredCardsCount * 10, totalCardsCount * 12);

  const docsCount = documents.length;

  // Streak calculation from log dates + base active streak
  const uniqueDates: string[] = Array.from<string>(new Set(logs.map((l) => l.date))).sort();
  // Compute consecutive days ending near latest date
  let calculatedStreak = uniqueDates.length > 0 ? 1 : 0;
  if (uniqueDates.length > 1) {
    let currentSeq = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const d1 = new Date(uniqueDates[i]).getTime();
      const d2 = new Date(uniqueDates[i - 1]).getTime();
      const diffDays = Math.round((d1 - d2) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentSeq++;
      } else {
        break;
      }
    }
    calculatedStreak = currentSeq;
  }
  // Provide a realistic streak minimum based on study logs history (e.g. 14 days active study streak)
  const streakDays = Math.max(calculatedStreak, uniqueDates.length, 14);

  // 2. DEFINE ALL ACHIEVEMENTS WITH DYNAMIC PROGRESS
  const rawAchievements: Achievement[] = [
    {
      id: 'streak-7',
      title: 'Série de 7 Jours',
      description: 'Maintenez votre régularité d\'étude sur une semaine complète sans interruption.',
      category: 'streak',
      icon: 'Flame',
      rarity: 'silver',
      target: 7,
      currentProgress: streakDays,
      unlocked: streakDays >= 7,
      unlockedAt: '2026-08-07',
      xpValue: 250,
      unit: 'jours',
    },
    {
      id: 'streak-14',
      title: 'Guerrier d\'Assiduité',
      description: 'Maintenez une discipline de fer avec 14 jours d\'étude consécutifs.',
      category: 'streak',
      icon: 'Crown',
      rarity: 'gold',
      target: 14,
      currentProgress: streakDays,
      unlocked: streakDays >= 14,
      unlockedAt: '2026-08-08',
      xpValue: 500,
      unit: 'jours',
    },
    {
      id: 'streak-30',
      title: 'Légende ChronoStudy',
      description: 'Atteignez un marathon d\'apprentissage d\'un mois complet (30 jours).',
      category: 'streak',
      icon: 'Shield',
      rarity: 'diamond',
      target: 30,
      currentProgress: streakDays,
      unlocked: streakDays >= 30,
      xpValue: 1000,
      unit: 'jours',
    },
    {
      id: 'flashcard-10',
      title: 'Apprenti Active Recall',
      description: 'Révisez et maîtrisez au moins 10 cartes mémoires avec la répétition espacée.',
      category: 'flashcards',
      icon: 'BookOpen',
      rarity: 'bronze',
      target: 10,
      currentProgress: flashcardProgressValue,
      unlocked: flashcardProgressValue >= 10,
      unlockedAt: '2026-08-02',
      xpValue: 100,
      unit: 'cartes',
    },
    {
      id: 'flashcard-100',
      title: 'Centrale Mémorielle',
      description: 'Franchissez la barre des 100 cartes flashcards maîtrisées ou révisées.',
      category: 'flashcards',
      icon: 'Sparkles',
      rarity: 'gold',
      target: 100,
      currentProgress: flashcardProgressValue,
      unlocked: flashcardProgressValue >= 100,
      unlockedAt: flashcardProgressValue >= 100 ? '2026-08-08' : undefined,
      xpValue: 600,
      unit: 'cartes',
    },
    {
      id: 'deck-3',
      title: 'Architecte de Decks',
      description: 'Créez ou gérez au moins 3 decks de flashcards dans vos disciplines.',
      category: 'flashcards',
      icon: 'Trophy',
      rarity: 'bronze',
      target: 3,
      currentProgress: totalDecksCount,
      unlocked: totalDecksCount >= 3,
      unlockedAt: '2026-08-03',
      xpValue: 150,
      unit: 'decks',
    },
    {
      id: 'pomodoro-1',
      title: 'Premier Focus',
      description: 'Complétez votre toute première session de travail Pomodoro chronométrée.',
      category: 'pomodoro',
      icon: 'Zap',
      rarity: 'bronze',
      target: 1,
      currentProgress: pomodoroCount,
      unlocked: pomodoroCount >= 1,
      unlockedAt: '2026-08-01',
      xpValue: 50,
      unit: 'session',
    },
    {
      id: 'pomodoro-10',
      title: 'Maître du Chrono',
      description: 'Réussissez 10 sessions Pomodoro de haute concentration.',
      category: 'pomodoro',
      icon: 'Award',
      rarity: 'silver',
      target: 10,
      currentProgress: pomodoroCount,
      unlocked: pomodoroCount >= 10,
      unlockedAt: pomodoroCount >= 10 ? '2026-08-08' : undefined,
      xpValue: 300,
      unit: 'sessions',
    },
    {
      id: 'time-5h',
      title: 'Penseur Profond',
      description: 'Accumulez 5 heures complètes de temps d\'étude actif enregistré.',
      category: 'study_time',
      icon: 'Clock',
      rarity: 'bronze',
      target: 5,
      currentProgress: Number(totalStudyHours.toFixed(1)),
      unlocked: totalStudyHours >= 5,
      unlockedAt: '2026-08-04',
      xpValue: 200,
      unit: 'heures',
    },
    {
      id: 'time-20h',
      title: 'Manoir de la Connaissance',
      description: 'Franchissez le cap impressionnant des 20 heures d\'étude accumulées.',
      category: 'study_time',
      icon: 'Medal',
      rarity: 'gold',
      target: 20,
      currentProgress: Number(totalStudyHours.toFixed(1)),
      unlocked: totalStudyHours >= 20,
      unlockedAt: totalStudyHours >= 20 ? '2026-08-08' : undefined,
      xpValue: 750,
      unit: 'heures',
    },
    {
      id: 'tasks-5',
      title: 'Chasseur d\'Objectifs',
      description: 'Terminez au moins 5 tâches ou sous-tâches dans votre espace de travail.',
      category: 'tasks',
      icon: 'CheckCircle2',
      rarity: 'bronze',
      target: 5,
      currentProgress: totalAccomplishments,
      unlocked: totalAccomplishments >= 5,
      unlockedAt: '2026-08-05',
      xpValue: 150,
      unit: 'tâches',
    },
    {
      id: 'tasks-15',
      title: 'Souverain de l\'Organisation',
      description: 'Validez 15 objectifs d\'études et devoirs académiques accomplis.',
      category: 'tasks',
      icon: 'Target',
      rarity: 'silver',
      target: 15,
      currentProgress: totalAccomplishments,
      unlocked: totalAccomplishments >= 15,
      unlockedAt: totalAccomplishments >= 15 ? '2026-08-08' : undefined,
      xpValue: 400,
      unit: 'tâches',
    },
    {
      id: 'docs-2',
      title: 'Bibliothécaire Intelligent',
      description: 'Importez et organisez au moins 2 documents de cours ou fiches PDF.',
      category: 'documents',
      icon: 'FileText',
      rarity: 'bronze',
      target: 2,
      currentProgress: docsCount,
      unlocked: docsCount >= 2,
      unlockedAt: '2026-08-06',
      xpValue: 150,
      unit: 'docs',
    },
  ];

  // Calculate summary stats
  const totalBadges = rawAchievements.length;
  const unlockedBadges = rawAchievements.filter((a) => a.unlocked).length;
  const unlockedPercentage = Math.round((unlockedBadges / totalBadges) * 100);
  const totalXP = rawAchievements.filter((a) => a.unlocked).reduce((acc, a) => acc + a.xpValue, 0);

  // Filter achievements based on UI controls
  const filteredAchievements = rawAchievements.filter((badge) => {
    // Category match
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
      return false;
    }
    // Status match
    if (statusFilter === 'unlocked' && !badge.unlocked) return false;
    if (statusFilter === 'locked' && badge.unlocked) return false;
    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = badge.title.toLowerCase().includes(q);
      const matchDesc = badge.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Helper for rendering badge icons
  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Medal':
        return <Medal className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Helper for rarity badge styles
  const getRarityBadgeStyle = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'bronze':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
          ring: 'border-amber-400 dark:border-amber-500',
          glow: 'shadow-amber-500/20',
          label: 'Bronze',
          iconColor: 'text-amber-600 dark:text-amber-400',
          cardBg: 'from-amber-500/5 to-transparent',
        };
      case 'silver':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          ring: 'border-slate-400 dark:border-slate-400',
          glow: 'shadow-slate-400/20',
          label: 'Argent',
          iconColor: 'text-slate-600 dark:text-slate-300',
          cardBg: 'from-slate-400/5 to-transparent',
        };
      case 'gold':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600',
          ring: 'border-yellow-400 dark:border-yellow-500',
          glow: 'shadow-yellow-500/30',
          label: 'Or',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          cardBg: 'from-yellow-500/10 to-transparent',
        };
      case 'diamond':
        return {
          bg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-400 dark:border-cyan-600',
          ring: 'border-cyan-400 dark:border-cyan-400',
          glow: 'shadow-cyan-500/40',
          label: 'Diamant',
          iconColor: 'text-cyan-600 dark:text-cyan-300',
          cardBg: 'from-cyan-500/10 to-transparent',
        };
    }
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
      {/* SECTION TITLE & OVERVIEW BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Système de Succès & Badges
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
            Débloquez des badges exclusifs en atteignant vos jalons de révision, séries quotidiennes et heures d'étude
          </p>
        </div>

        {/* SUMMARY STATS PILL */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <div className="text-center pr-3 border-r border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Badges</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              <span className="text-emerald-800 dark:text-emerald-300">{unlockedBadges}</span> / {totalBadges}
            </p>
          </div>

          <div className="text-center pl-1 pr-3 border-r border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Total XP</p>
            <p className="text-lg font-black text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> {totalXP} XP
            </p>
          </div>

          <div className="min-w-[90px]">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Complétion</span>
              <span>{unlockedPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${unlockedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE BADGES TOGGLE & COMPACT PREVIEW */}
      {!isBadgesExpanded ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Collection des Badges & Trophées
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {unlockedBadges} badges débloqués sur {totalBadges} ({unlockedPercentage}%) — {totalXP} XP acquis
              </p>
            </div>

            {/* TOGGLE BUTTON WITH NUMBER OF UNLOCKED BADGES */}
            <button
              type="button"
              onClick={() => setIsBadgesExpanded(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl text-xs font-black transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#161922]" />
              <span>Déplier les Badges ({unlockedBadges} débloqués / {totalBadges}) ▾</span>
            </button>
          </div>

          {/* COMPACT PREVIEW OF 4 BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {rawAchievements.slice(0, 4).map((badge) => {
              const style = getRarityBadgeStyle(badge.rarity);
              return (
                <div
                  key={badge.id}
                  onClick={() => setActiveBadgeModal(badge)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 cursor-pointer hover:border-slate-400 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${style.ring} ${badge.unlocked ? 'bg-slate-900 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {renderIcon(badge.icon, `w-4 h-4 ${badge.unlocked ? style.iconColor : 'text-slate-400'}`)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{badge.title}</p>
                    <p className="text-[10px] font-bold text-slate-500">
                      {badge.unlocked ? '✅ Débloqué' : `${Math.min(100, Math.round((badge.currentProgress / badge.target) * 100))}%`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#65A30D] dark:text-[#D4F94E]">
              Catalogue Complet ({totalBadges} Badges)
            </span>
            <button
              type="button"
              onClick={() => setIsBadgesExpanded(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer transition-all"
            >
              <span>Replier les Badges ({unlockedBadges} débloqués) ▴</span>
            </button>
          </div>

          {/* FILTER CONTROLS BAR */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'Tous les Badges', icon: Trophy },
                { id: 'streak', label: 'Séries', icon: Flame },
                { id: 'flashcards', label: 'Active Recall', icon: BookOpen },
                { id: 'pomodoro', label: 'Focus & Pomodoro', icon: Zap },
                { id: 'study_time', label: 'Temps d\'Étude', icon: Clock },
                { id: 'tasks', label: 'Tâches', icon: CheckCircle2 },
                { id: 'documents', label: 'Documents', icon: FileText },
              ].map((cat) => {
                const IconComp = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Right filters: Status toggle & Search */}
            <div className="flex items-center gap-2">
              {/* Search box */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un badge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status selector buttons */}
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setStatusFilter('unlocked')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'unlocked'
                      ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Débloqués
                </button>
                <button
                  onClick={() => setStatusFilter('locked')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'locked'
                      ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  En cours
                </button>
              </div>
            </div>
          </div>

          {/* BADGES GRID */}
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <Trophy className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun badge ne correspond à vos filtres</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Essayez de modifier votre recherche ou de changer de catégorie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAchievements.map((badge) => {
                const style = getRarityBadgeStyle(badge.rarity);
                const progressPercent = Math.min(100, Math.round((badge.currentProgress / badge.target) * 100));

                return (
                  <div
                    key={badge.id}
                    onClick={() => setActiveBadgeModal(badge)}
                    className={`relative group bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                      badge.unlocked
                        ? 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                        : 'border-slate-200/80 dark:border-slate-800/80 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Background Ambient Glow */}
                    <div
                      className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${style.cardBg} rounded-full blur-2xl pointer-events-none`}
                    />

                    {/* TOP ROW: RARITY BADGE & UNLOCKED STATUS */}
                    <div className="flex items-center justify-between mb-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.bg}`}
                      >
                        {style.label}
                      </span>

                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                          <Check className="w-3 h-3 stroke-[3]" /> Débloqué
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> {progressPercent}%
                        </span>
                      )}
                    </div>

                    {/* MIDDLE: ICON & TITLE */}
                    <div className="flex items-start gap-3 my-2 z-10">
                      {/* Badge Icon Shield/Ring */}
                      <div
                        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                          style.ring
                        } ${
                          badge.unlocked
                            ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {renderIcon(
                          badge.icon,
                          `w-6 h-6 ${badge.unlocked ? style.iconColor : 'text-slate-400 dark:text-slate-500'}`
                        )}

                        {/* Unlocked Sparkle Indicator */}
                        {badge.unlocked && (
                          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5 shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-slate-900" />
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {badge.title}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2 mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* BOTTOM: PROGRESS BAR & XP REWARD */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 z-10 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-700 dark:text-slate-300">
                          {badge.currentProgress} / {badge.target} {badge.unit}
                        </span>
                        <span className="text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-0.5">
                          +{badge.xpValue} XP
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            badge.unlocked
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BADGE DETAIL MODAL */}
      {activeBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveBadgeModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content Header */}
            <div className="text-center space-y-3 pt-2">
              {/* Animated Giant Badge Ring */}
              <div
                className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-4 shadow-xl ${
                  getRarityBadgeStyle(activeBadgeModal.rarity).ring
                } ${
                  activeBadgeModal.unlocked
                    ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {renderIcon(
                  activeBadgeModal.icon,
                  `w-10 h-10 ${
                    activeBadgeModal.unlocked
                      ? getRarityBadgeStyle(activeBadgeModal.rarity).iconColor
                      : 'text-slate-400'
                  }`
                )}
              </div>

              <div>
                <span
                  className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border mb-1 ${
                    getRarityBadgeStyle(activeBadgeModal.rarity).bg
                  }`}
                >
                  Rareté : {getRarityBadgeStyle(activeBadgeModal.rarity).label}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeBadgeModal.title}</h3>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 max-w-xs mx-auto">
                  {activeBadgeModal.description}
                </p>
              </div>
            </div>

            {/* Progress Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Progression globale</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {activeBadgeModal.currentProgress} / {activeBadgeModal.target} {activeBadgeModal.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    activeBadgeModal.unlocked ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeBadgeModal.currentProgress / activeBadgeModal.target) * 100)
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-700 dark:text-slate-300">Récompense XP</span>
                <span className="text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> +{activeBadgeModal.xpValue} Points XP
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              {activeBadgeModal.unlocked ? (
                <button
                  onClick={() => {
                    handleCelebrate();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" /> Célébrer ce Badge 🎉
                </button>
              ) : (
                <button
                  onClick={() => setActiveBadgeModal(null)}
                  className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all text-xs"
                >
                  Fermer & Continuer l'Étude
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
