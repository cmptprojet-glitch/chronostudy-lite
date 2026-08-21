import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlashcardDeck,
  Task,
  StudySessionLog,
  SubjectMetric
} from '../types';
import { TabType } from './Navbar';
import {
  Clock,
  ChevronDown,
  Star,
  Plus,
  Play,
  Maximize2,
  TrendingUp,
  Award,
  CheckCircle2,
  Layers,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { SmoothCarousel } from './SmoothCarousel';

interface DashboardViewProps {
  decks: FlashcardDeck[];
  tasks: Task[];
  logs: StudySessionLog[];
  subjectMetrics: SubjectMetric[];
  setActiveTab: (tab: TabType) => void;
  onStartPomodoroWithTask?: (taskId: string) => void;
  onOpenDeck?: (deckId: string) => void;
  onOpenAiChat?: () => void;
  onOpenWorldClock?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  decks,
  tasks,
  logs,
  subjectMetrics,
  setActiveTab,
  onOpenDeck,
  onOpenWorldClock,
}) => {
  const { language } = useLanguage();
  const { currentTheme } = useTheme();

  const [activeCourseFilter, setActiveCourseFilter] = useState<'Active' | 'Completed' | 'All'>('Active');
  const [activityTimeframe, setActivityTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(4);

  // Live time for 3-Zone Time Widget
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute total study hours from logs
  const totalStudyMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalStudyHoursToday = (totalStudyMinutes / 60).toFixed(1);

  // Weekly study data
  const weeklyData = [
    { day: language === 'fr' ? 'Dim' : 'Su', hours: 2.5, date: '13 Août', fullDate: 'Dimanche 13 Août' },
    { day: language === 'fr' ? 'Lun' : 'Mo', hours: 5.0, date: '14 Août', fullDate: 'Lundi 14 Août' },
    { day: language === 'fr' ? 'Mar' : 'Tu', hours: 3.2, date: '15 Août', fullDate: 'Mardi 15 Août' },
    { day: language === 'fr' ? 'Mer' : 'We', hours: 7.0, date: '16 Août', fullDate: 'Mercredi 16 Août' },
    { day: language === 'fr' ? 'Jeu' : 'Th', hours: 6.75, date: '17 Août', fullDate: 'Jeudi 17 Août (Aujourd\'hui)', isCurrent: true },
    { day: language === 'fr' ? 'Ven' : 'Fr', hours: 2.0, date: '18 Août', fullDate: 'Vendredi 18 Août' },
    { day: language === 'fr' ? 'Sam' : 'Sa', hours: 5.5, date: '19 Août', fullDate: 'Samedi 19 Août' },
  ];

  // Monthly study data
  const monthlyData = [
    { day: language === 'fr' ? 'Sem 1' : 'Wk 1', hours: 26.5, date: '1 - 7 Août', fullDate: 'Semaine 1 (1 - 7 Août)' },
    { day: language === 'fr' ? 'Sem 2' : 'Wk 2', hours: 31.0, date: '8 - 14 Août', fullDate: 'Semaine 2 (8 - 14 Août)' },
    { day: language === 'fr' ? 'Sem 3' : 'Wk 3', hours: 34.5, date: '15 - 21 Août', fullDate: 'Semaine 3 (15 - 21 Août)', isCurrent: true },
    { day: language === 'fr' ? 'Sem 4' : 'Wk 4', hours: 28.0, date: '22 - 28 Août', fullDate: 'Semaine 4 (22 - 28 Août)' },
  ];

  const currentChartData = activityTimeframe === 'Weekly' ? weeklyData : monthlyData;
  const maxHours = activityTimeframe === 'Weekly' ? 8 : 40;

  // Selected bar item
  const activeHoverItem = hoveredBarIndex !== null && hoveredBarIndex < currentChartData.length
    ? currentChartData[hoveredBarIndex]
    : currentChartData[currentChartData.length - 1];

  const cardColorPresets = [
    { bg: 'bg-[#FFF1EB]', text: 'text-[#FF7A59]' },
    { bg: 'bg-[#EFFDE2]', text: 'text-[#65A30D]' },
    { bg: 'bg-[#F3F0FF]', text: 'text-[#8B5CF6]' },
    { bg: 'bg-[#E8F4FD]', text: 'text-[#0284C7]' },
  ];

  // Filtered decks for course section
  const filteredDecks = decks.filter((d) => {
    if (activeCourseFilter === 'All') return true;
    if (activeCourseFilter === 'Active') return d.cards.length > 0;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans select-none">
      
      {/* TOP GRID: RECENT DECKS CAROUSEL (LEFT) & FOCUS SUMMARY BOOSTER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT 8 COLS: DECKS SMOOTH CAROUSEL */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-zinc-800 flex flex-col justify-between"
        >
          <SmoothCarousel
            title={language === 'fr' ? 'Decks & Active Recall' : 'Active Recall Decks'}
            subtitle={`${decks.length} ${language === 'fr' ? 'decks disponibles pour réviser' : 'decks available to study'}`}
            totalItems={decks.length}
            headerRight={
              <button
                type="button"
                onClick={() => setActiveTab('flashcards')}
                className="text-xs font-bold text-slate-500 hover:text-[#161922] dark:hover:text-white transition-colors cursor-pointer mr-2"
              >
                {language === 'fr' ? 'Voir Tout →' : 'View All →'}
              </button>
            }
          >
            {decks.map((deck, idx) => {
              const preset = cardColorPresets[idx % cardColorPresets.length];
              const masteredCount = deck.cards.filter((c) => c.easinessFactor > 2.4).length;
              return (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onOpenDeck ? onOpenDeck(deck.id) : setActiveTab('flashcards')}
                  className="min-w-[210px] sm:min-w-[230px] max-w-[250px] shrink-0 snap-start bg-[#F9FAFC] dark:bg-zinc-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 hover:border-(--accent-color) transition-colors cursor-pointer group flex flex-col justify-between space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl ${preset.bg} ${preset.text} flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}>
                      {idx % 4 === 0 ? '📝' : idx % 4 === 1 ? '💬' : idx % 4 === 2 ? '🔬' : '💡'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-black text-[#161922] dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {deck.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                        {deck.cards.length} {language === 'fr' ? 'Flashcards' : 'Cards'} • {masteredCount} {language === 'fr' ? 'acquis' : 'mastered'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {deck.description || (language === 'fr' ? 'Révisez vos notions clés avec répétition espacée.' : 'Review key concepts with spaced repetition.')}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 dark:border-zinc-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                    <div className="flex items-center gap-1 text-[#161922] dark:text-white">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{(4.5 + (idx * 0.1) % 0.5).toFixed(1)}</span>
                    </div>
                    <span className="truncate max-w-[100px] bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700 text-slate-700 dark:text-slate-300">
                      {deck.subject}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </SmoothCarousel>
        </motion.div>

        {/* RIGHT 4 COLS: FOCUS & POMODORO QUICK START BOOSTER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hero-promo-card lg:col-span-4 bg-[#161922] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#D4F94E]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
              >
                ⚡
              </span>
              <span className="text-xs font-black tracking-tight text-white">Focus & Productivité</span>
            </div>

            <h3 className="text-base font-black text-white tracking-tight leading-snug">
              {language === 'fr' ? 'Session Pomodoro Rapide' : 'Quick Pomodoro Session'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
              {language === 'fr'
                ? `Aujourd'hui : ${totalStudyHoursToday}h cumulées. Lancez un bloc de concentration pour maintenir votre série de révisions.`
                : `Today: ${totalStudyHoursToday}h studied. Start a focused interval to keep your study streak alive.`}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('pomodoro')}
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="px-4 py-2.5 rounded-xl text-xs font-black transition-transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5 hover:opacity-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'fr' ? 'Lancer Pomodoro' : 'Start Focus'}</span>
            </button>

            <span className="text-2xl select-none">⏱️</span>
          </div>
        </motion.div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 2. MIDDLE SECTION: STUDY ACTIVITY CHART & MASTERY PROGRESS               */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* HOURS ACTIVITY BAR CHART & EVOLUTION CURVE (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-zinc-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
                {language === 'fr' ? 'Activité & Courbe d\'Évolution' : 'Hours Activity & Evolution'}
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                ↗ +3% {language === 'fr' ? 'de progression par rapport à la période précédente' : 'increase than last period'}
              </span>
            </div>

            {/* TIMEFRAME TOGGLE (WEEKLY / MONTHLY) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => {
                  setActivityTimeframe('Weekly');
                  setHoveredBarIndex(4);
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activityTimeframe === 'Weekly'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {language === 'fr' ? 'Hebdo' : 'Weekly'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivityTimeframe('Monthly');
                  setHoveredBarIndex(2);
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activityTimeframe === 'Monthly'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {language === 'fr' ? 'Mensuel' : 'Monthly'}
              </button>
            </div>
          </div>

          {/* DYNAMIC SELECTED DAY EVOLUTION HIGHLIGHT WITH SMOOTH ANIMATION */}
          <div className="relative pt-4 pb-1">
            
            {/* ANIMATED DAY DETAILS BANNER */}
            <AnimatePresence mode="wait">
              {activeHoverItem && (
                <motion.div
                  key={activeHoverItem.day + (hoveredBarIndex ?? 0) + activityTimeframe}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3 p-3 bg-[#161922] text-white rounded-2xl shadow-lg border border-zinc-700/80 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                    >
                      ⏱️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{activeHoverItem.fullDate}</span>
                        {activeHoverItem.isCurrent && (
                          <span
                            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                            className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                          >
                            Actuel
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Temps de travail enregistré et synchronisé
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      style={{ color: currentTheme.accentColor }}
                      className="text-base font-black font-mono block leading-none"
                    >
                      {activeHoverItem.hours}h
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      {Math.round(activeHoverItem.hours * 60)} min
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* VERTICAL BARS WITH SPRING HEIGHT ANIMATIONS */}
            <div className="h-32 flex items-end justify-between px-2 gap-2 mt-2">
              {currentChartData.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.hours / maxHours) * 100));
                const isSelected = hoveredBarIndex === idx;
                return (
                  <div
                    key={item.day + idx}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onClick={() => setHoveredBarIndex(idx)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-28 rounded-full relative flex items-end justify-center p-0.5 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        style={{
                          backgroundColor:
                            item.isCurrent || isSelected
                              ? currentTheme.accentColor
                              : undefined,
                        }}
                        className={`w-full rounded-full ${
                          item.isCurrent || isSelected
                            ? 'shadow-xs'
                            : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold transition-colors ${
                        isSelected
                          ? 'text-[#161922] dark:text-white font-black scale-110'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* SUBJECT MASTERY & STUDY BALANCE (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-zinc-800 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{
                  backgroundColor: currentTheme.accentSubtle,
                  color: currentTheme.accentSubtleText,
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
              >
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
                  {language === 'fr' ? 'Maîtrise Disciplinaire' : 'Subject Mastery'}
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  {language === 'fr' ? 'Niveau d\'acquisition par matière' : 'Acquisition level per subject'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Stats →' : 'Stats →'}
            </button>
          </div>

          <div className="space-y-3">
            {subjectMetrics.slice(0, 4).map((metric, idx) => (
              <motion.div
                key={metric.subject}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{metric.subject}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{metric.hours}h</span>
                    <span className="font-black text-[#161922] dark:text-white font-mono">{metric.masteryPercentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.masteryPercentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + idx * 0.08 }}
                    style={{
                      backgroundColor:
                        idx === 0
                          ? currentTheme.accentColor
                          : idx === 1
                          ? '#60A5FA'
                          : idx === 2
                          ? '#C084FC'
                          : '#FBBF24',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">
              {language === 'fr' ? 'Objectif hebdomadaire :' : 'Weekly Goal:'} 25h
            </span>
            <span className="font-black text-[#161922] dark:text-white">
              {totalStudyHoursToday}h / 25h
            </span>
          </div>
        </motion.div>

      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 3. BOTTOM SECTION: ACTIVE COURSES / DECKS (LEFT) & ASSIGNMENTS (RIGHT)  */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT 8 COLS: COURSE YOU'RE TAKING / ACTIVE REVISION DECKS */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-zinc-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
              {language === 'fr' ? 'Vos Formations & Decks Actifs' : 'Course You\'re Taking'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCourseFilter(activeCourseFilter === 'Active' ? 'All' : 'Active')}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                {activeCourseFilter === 'Active' ? (language === 'fr' ? 'Actifs' : 'Active') : (language === 'fr' ? 'Tous' : 'All')} <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('deck_builder')}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer hover:opacity-95"
                title="Créer un nouveau Deck Pro"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDecks.map((deck, idx) => {
              const percentages = [45, 75, 60, 90];
              const remainingTimes = ['8h 45 min', '18h 12 min', '5h 30 min', '12h 00 min'];
              const authors = ['Micheal Andrew', 'Natalia Vaman', 'Dr. Laurent Bellier', 'Prof. Sarah Cohen'];
              const icons = ['🎨', '💻', '🧪', '📊'];
              const bgs = ['bg-[#F3F0FF]', 'bg-[#FFF1EB]', 'bg-[#EFFDE2]', 'bg-[#E8F4FD]'];

              const pct = percentages[idx % percentages.length];
              const remTime = remainingTimes[idx % remainingTimes.length];
              const author = authors[idx % authors.length];

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ x: 3 }}
                  onClick={() => onOpenDeck ? onOpenDeck(deck.id) : setActiveTab('flashcards')}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFC] dark:bg-zinc-950/70 border border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl ${bgs[idx % bgs.length]} flex items-center justify-center text-lg shrink-0`}>
                      {icons[idx % icons.length]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#161922] dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {deck.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {author} • {deck.subject} {deck.attachedFiles && deck.attachedFiles.length > 0 && `• 📎 ${deck.attachedFiles.length} fichier(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {language === 'fr' ? 'Restant' : 'Remaining'}
                      </span>
                      <span className="text-xs font-black text-[#161922] dark:text-white">{remTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <svg className="w-9 h-9 transform -rotate-90">
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-200 dark:text-zinc-800"
                            fill="transparent"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            stroke={currentTheme.accentColor}
                            strokeWidth="3"
                            strokeDasharray={88}
                            strokeDashoffset={88 - (88 * pct) / 100}
                            strokeLinecap="round"
                            style={{ stroke: currentTheme.accentColor }}
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute text-[9px] font-black text-[#161922] dark:text-white">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* RIGHT 4 COLS: ASSIGNMENTS / TÂCHES */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-zinc-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
              {language === 'fr' ? 'Devoirs & Tâches' : 'Assignments'}
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer hover:opacity-95"
              title="Ajouter une Tâche"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task, idx) => {
              const statusPills = {
                in_progress: { label: language === 'fr' ? 'En cours' : 'In progress', bg: 'bg-[#EFEAFF] text-[#6366F1]' },
                completed: { label: language === 'fr' ? 'Terminé' : 'Completed', bg: 'bg-[#EFFDE2] text-[#65A30D]' },
                todo: { label: language === 'fr' ? 'À venir' : 'Upcoming', bg: 'bg-[#FFF1EB] text-[#F97316]' },
              };
              const pill = statusPills[task.status] || statusPills.todo;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveTab('tasks')}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFC] dark:bg-zinc-950/70 border border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-slate-200/60 dark:border-zinc-700 flex items-center justify-center text-xs shrink-0">
                      {idx === 0 ? '📊' : idx === 1 ? '🎯' : '📑'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#161922] dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">
                        {task.dueDate || '12 Mai, 11:00'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${pill.bg}`}>
                    {pill.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

    </div>
  );
};
