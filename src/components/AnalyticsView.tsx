import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudySessionLog, SubjectMetric, Task, FlashcardDeck, StudyDocument } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Timer,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { AchievementsSection } from './AchievementsSection';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  logs: StudySessionLog[];
  subjectMetrics: SubjectMetric[];
  tasks: Task[];
  decks: FlashcardDeck[];
  documents?: StudyDocument[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  subjectMetrics,
  tasks,
  decks,
  documents = [],
}) => {
  const { currentTheme } = useTheme();
  // Weekly carousel state (0 = current week, -1 = last week, -2 = 2 weeks ago, etc.)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Activity & evolution curve bar chart state
  const [activityTimeframe, setActivityTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(4);

  const weeklyBarData = [
    { day: 'Dim', hours: 2.5, date: '13 Août', fullDate: 'Dimanche 13 Août' },
    { day: 'Lun', hours: 5.0, date: '14 Août', fullDate: 'Lundi 14 Août' },
    { day: 'Mar', hours: 3.2, date: '15 Août', fullDate: 'Mardi 15 Août' },
    { day: 'Mer', hours: 7.0, date: '16 Août', fullDate: 'Mercredi 16 Août' },
    { day: 'Jeu', hours: 6.75, date: '17 Août', fullDate: "Jeudi 17 Août (Aujourd'hui)", isCurrent: true },
    { day: 'Ven', hours: 2.0, date: '18 Août', fullDate: 'Vendredi 18 Août' },
    { day: 'Sam', hours: 5.5, date: '19 Août', fullDate: 'Samedi 19 Août' },
  ];

  const monthlyBarData = [
    { day: 'Sem 1', hours: 26.5, date: '1 - 7 Août', fullDate: 'Semaine 1 (1 - 7 Août)' },
    { day: 'Sem 2', hours: 31.0, date: '8 - 14 Août', fullDate: 'Semaine 2 (8 - 14 Août)' },
    { day: 'Sem 3', hours: 34.5, date: '15 - 21 Août', fullDate: 'Semaine 3 (15 - 21 Août)', isCurrent: true },
    { day: 'Sem 4', hours: 28.0, date: '22 - 28 Août', fullDate: 'Semaine 4 (22 - 28 Août)' },
  ];

  const currentBarChartData = activityTimeframe === 'Weekly' ? weeklyBarData : monthlyBarData;
  const maxBarHours = activityTimeframe === 'Weekly' ? 8 : 40;
  const activeHoverBarItem = hoveredBarIdx !== null && hoveredBarIdx < currentBarChartData.length
    ? currentBarChartData[hoveredBarIdx]
    : currentBarChartData[currentBarChartData.length - 1];

  // Calculate aggregated metrics
  const totalMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Total hours across subjects
  const totalSubjectHours = subjectMetrics.reduce((acc, s) => acc + s.hours, 0).toFixed(1);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalPomodoros = logs.filter((l) => l.type === 'pomodoro').length;

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.lastEvaluated === 'easy').length,
    0
  );
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Dynamic Productivity Score formula
  const productivityScore = Math.min(
    100,
    Math.round(45 + taskCompletionRate * 0.25 + masteryRate * 0.15 + totalPomodoros * 2.5)
  );

  // Date and Week calculation
  // Base date is today, anchored to calendar
  const today = new Date();
  // Monday of the target week:
  const getTargetWeekMonday = (offset: number) => {
    const d = new Date(today);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + diffToMonday + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const currentWeekMonday = getTargetWeekMonday(weekOffset);
  const prevWeekMonday = getTargetWeekMonday(weekOffset - 1);

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getWeekRangeLabel = (mondayDate: Date) => {
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    const startStr = mondayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const endStr = sundayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Semaine du ${startStr} au ${endStr}`;
  };

  // Weekdays definition
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const dayCodes = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Base preset curves per week to simulate realistic historic logs
  const weekPresetData: Record<number, number[]> = {
    0: [120, 90, 210, 150, 80, 140, 160], // current week (minutes)
    '-1': [100, 110, 150, 120, 90, 130, 140], // previous week
    '-2': [90, 80, 120, 140, 110, 100, 120],
    '-3': [80, 95, 110, 100, 75, 110, 130],
  };

  const currentWeekMinutesArray = weekPresetData[weekOffset] || [90, 100, 110, 120, 90, 130, 140];
  const prevWeekMinutesArray = weekPresetData[weekOffset - 1] || [80, 90, 100, 110, 85, 120, 130];

  // Construct day-by-day comparison dataset
  const weeklyComparisonData = dayNames.map((name, index) => {
    const curDate = new Date(currentWeekMonday);
    curDate.setDate(curDate.getDate() + index);

    const prevDate = new Date(prevWeekMonday);
    prevDate.setDate(prevDate.getDate() + index);

    const curMin = currentWeekMinutesArray[index];
    const prevMin = prevWeekMinutesArray[index];

    const curHours = Number((curMin / 60).toFixed(1));
    const prevHours = Number((prevMin / 60).toFixed(1));

    const diffHours = Number((curHours - prevHours).toFixed(1));
    const percentDiff =
      prevHours > 0
        ? Math.round(((curHours - prevHours) / prevHours) * 100)
        : curHours > 0
        ? 100
        : 0;

    return {
      day: dayCodes[index],
      fullName: name,
      fullDate: curDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      prevFullDate: prevDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      duration: curMin,
      durationHours: curHours,
      prevDuration: prevMin,
      prevDurationHours: prevHours,
      diffHours,
      percentDiff,
      isToday:
        weekOffset === 0 &&
        curDate.getDate() === today.getDate() &&
        curDate.getMonth() === today.getMonth(),
    };
  });

  // Calculate total week minutes and evolution vs previous week
  const currentWeekTotalMinutes = currentWeekMinutesArray.reduce((a, b) => a + b, 0);
  const prevWeekTotalMinutes = prevWeekMinutesArray.reduce((a, b) => a + b, 0);
  const totalWeekHours = (currentWeekTotalMinutes / 60).toFixed(1);
  const prevTotalWeekHours = (prevWeekTotalMinutes / 60).toFixed(1);
  const overallWeekDiffHours = Number(((currentWeekTotalMinutes - prevWeekTotalMinutes) / 60).toFixed(1));
  const overallWeekPercent = Math.round(
    ((currentWeekTotalMinutes - prevWeekTotalMinutes) / (prevWeekTotalMinutes || 1)) * 100
  );

  // Selected Day comparison (either hovered or the latest active)
  const activeDayComparison =
    hoveredDayIndex !== null
      ? weeklyComparisonData[hoveredDayIndex]
      : weeklyComparisonData[Math.min(today.getDay() === 0 ? 6 : today.getDay() - 1, 6)];

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* HEADER WIDGET */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xs"
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Rapports d'Apprentissage & Analytics
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Statistiques en temps réel, évolution hebdomadaire comparative et temps d'étude synchronisé
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" /> Score : {productivityScore}/100
          </span>
        </div>
      </motion.div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <Clock className="w-4 h-4" />,
            iconBg: 'bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white',
            val: `${totalHours} hrs`,
            label: "Temps d'étude total cumulé",
          },
          {
            icon: <CheckCircle2 className="w-4 h-4" />,
            iconStyle: { backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText },
            val: `${taskCompletionRate}%`,
            label: `${completedTasks} / ${tasks.length} devoirs validés`,
          },
          {
            icon: <Timer className="w-4 h-4" />,
            iconBg: 'bg-[#F3F0FF] text-[#8B5CF6]',
            val: `${totalPomodoros}`,
            label: 'Sessions Pomodoro réussies',
          },
          {
            icon: <BookOpen className="w-4 h-4" />,
            iconBg: 'bg-[#FFF1EB] text-[#FF7A59]',
            val: `${masteryRate}%`,
            label: 'Taux de maîtrise flashcards',
          },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-3xl shadow-xs space-y-2"
          >
            <div
              style={kpi.iconStyle}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${kpi.iconBg || ''}`}
            >
              {kpi.icon}
            </div>
            <p className="text-2xl font-black text-[#161922] dark:text-white tracking-tight">{kpi.val}</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* CHARTS GRID: EVOLUTION COMPARATOR & SUBJECT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CHART 1: WEEKLY CAROUSEL & COMPARATIVE EVOLUTION GRAPH (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-xs space-y-5"
        >
          
          {/* CAROUSEL CONTROLLER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#161922] dark:text-white text-sm">
                  Évolution du Temps d'Étude
                </h3>
                {weekOffset === 0 && (
                  <span
                    style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  >
                    Cette Semaine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{getWeekRangeLabel(currentWeekMonday)}</span>
              </p>
            </div>

            {/* WEEK STEPPER CAROUSEL BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Consulter la semaine précédente"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sem. Précédente</span>
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
                disabled={weekOffset >= 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  weekOffset >= 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-zinc-800 text-slate-400'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white'
                }`}
                title="Consulter la semaine suivante"
              >
                <span className="hidden sm:inline">Sem. Suivante</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC COMPARISON HIGHLIGHT BANNER */}
          <div className="bg-[#F9FAFC] dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Semaine vs Semaine Précédente
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#161922] dark:text-white">
                  {totalWeekHours}h de travail
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  (précédent : {prevTotalWeekHours}h)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                style={
                  overallWeekPercent >= 0
                    ? { backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }
                    : undefined
                }
                className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full ${
                  overallWeekPercent >= 0
                    ? ''
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {overallWeekPercent >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {overallWeekPercent >= 0 ? `+${overallWeekDiffHours}h` : `${overallWeekDiffHours}h`} (
                  {overallWeekPercent >= 0 ? `+${overallWeekPercent}%` : `${overallWeekPercent}%`})
                </span>
              </span>
            </div>
          </div>

          {/* AREA CHART WITH HOVER COMPARISON */}
          <div className="h-56 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyComparisonData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                    setHoveredDayIndex(Number(state.activeTooltipIndex));
                  }
                }}
                onMouseLeave={() => setHoveredDayIndex(null)}
              >
                <defs>
                  <linearGradient id="colorCurrentWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentTheme.accentColor} stopOpacity={0.85} />
                    <stop offset="95%" stopColor={currentTheme.accentColor} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPrevWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `${Math.round(val / 60)}h`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isUp = data.percentDiff >= 0;
                      return (
                        <div className="bg-[#161922] text-white p-3.5 rounded-2xl shadow-xl border border-zinc-700 text-xs space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-zinc-700 pb-1.5">
                            <span style={{ color: currentTheme.accentColor }} className="font-extrabold">{data.fullDate}</span>
                            {data.isToday && (
                              <span
                                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                                className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                              >
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-zinc-300">
                              <span>Temps travaillé :</span>
                              <span className="font-black text-white">{data.durationHours}h ({data.duration} min)</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                              <span>Même jour sem. -1 :</span>
                              <span className="font-bold">{data.prevDurationHours}h ({data.prevDuration} min)</span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-zinc-700 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-zinc-400">Évolution :</span>
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                                isUp ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {isUp ? `+${data.diffHours}h (+${data.percentDiff}%)` : `${data.diffHours}h (${data.percentDiff}%)`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="prevDuration"
                  name="Semaine Précédente"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPrevWeek)"
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  name="Semaine Sélectionnée"
                  stroke={currentTheme.accentColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCurrentWeek)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* DAY BY DAY COMPARISON QUICK TILES WITH SELECTION FEEDBACK */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {weeklyComparisonData.map((d, idx) => {
              const isSelected = hoveredDayIndex === idx || (hoveredDayIndex === null && d.isToday);
              const isUp = d.percentDiff >= 0;
              return (
                <motion.button
                  key={d.day}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHoveredDayIndex(idx)}
                  className={`p-2 rounded-2xl text-center transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#161922] text-white border-[#161922] dark:border-zinc-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-zinc-950 border-slate-100 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold block opacity-75">{d.day}</span>
                  <span className="text-xs font-black block my-0.5">{d.durationHours}h</span>
                  <span
                    style={isSelected && isUp ? { color: currentTheme.accentColor } : undefined}
                    className={`text-[9px] font-black block ${
                      isSelected
                        ? isUp
                          ? ''
                          : 'text-rose-400'
                        : isUp
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isUp ? `+${d.percentDiff}%` : `${d.percentDiff}%`}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* ANIMATED DETAILED DAY COMPARISON PANEL */}
          <AnimatePresence mode="wait">
            {activeDayComparison && (
              <motion.div
                key={activeDayComparison.day + weekOffset}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#161922] dark:text-white capitalize">
                      {activeDayComparison.fullDate}
                    </span>
                    {activeDayComparison.isToday && (
                      <span
                        style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                        className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                      >
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vs même jour semaine passée : {activeDayComparison.prevDurationHours}h
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    style={{ color: currentTheme.accentColor }}
                    className="text-base font-black font-mono"
                  >
                    {activeDayComparison.durationHours}h
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      activeDayComparison.percentDiff >= 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {activeDayComparison.percentDiff >= 0
                      ? `+${activeDayComparison.diffHours}h (+${activeDayComparison.percentDiff}%)`
                      : `${activeDayComparison.diffHours}h (${activeDayComparison.percentDiff}%)`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CHART 2: SUBJECT TIME BREAKDOWN WITH TOTAL STUDY HOURS (5 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-[#161922] dark:text-white text-sm">
                  Répartition par Matière
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Heures de travail et charge par discipline
                </p>
              </div>

              {/* TOTAL STUDY HOURS BADGE */}
              <div
                style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText, borderColor: `${currentTheme.accentColor}66` }}
                className="border px-3 py-1.5 rounded-2xl text-right shrink-0"
              >
                <span className="text-[9px] font-black uppercase tracking-wider block">Total Répartition</span>
                <span className="text-sm font-black">{totalSubjectHours} hrs</span>
              </div>
            </div>

            {/* DONUT PIE CHART */}
            <div className="h-44 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectMetrics}
                    dataKey="hours"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {subjectMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as SubjectMetric;
                        const pct = Math.round((item.hours / Number(totalSubjectHours || 1)) * 100);
                        return (
                          <div className="bg-[#161922] text-white p-2.5 rounded-xl text-xs border border-zinc-700 shadow-xl">
                            <p style={{ color: currentTheme.accentColor }} className="font-black">{item.subject}</p>
                            <p className="text-zinc-300 font-bold">{item.hours}h ({pct}% du total)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SUBJECT METRICS SUMMARY LIST */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            {subjectMetrics.map((sub, idx) => {
              const pct = Math.round((sub.hours / Number(totalSubjectHours || 1)) * 100);
              return (
                <motion.div
                  key={sub.subject}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold truncate flex-1">
                    {sub.subject}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{pct}%</span>
                  <span className="font-black text-[#161922] dark:text-white shrink-0 ml-1">{sub.hours}h</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ACTIVITÉ & COURBE D'ÉVOLUTION + MAÎTRISE DISCIPLINAIRE (MIGRATED WIDGETS)  */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* HOURS ACTIVITY BAR CHART & EVOLUTION CURVE (7 Cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-zinc-800 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
                Activité & Courbe d'Évolution
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                ↗ +3% de progression par rapport à la période précédente
              </span>
            </div>

            {/* TIMEFRAME TOGGLE (WEEKLY / MONTHLY) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => {
                  setActivityTimeframe('Weekly');
                  setHoveredBarIdx(4);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activityTimeframe === 'Weekly'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Hebdo
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivityTimeframe('Monthly');
                  setHoveredBarIdx(2);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activityTimeframe === 'Monthly'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Mensuel
              </button>
            </div>
          </div>

          {/* DYNAMIC SELECTED DAY EVOLUTION HIGHLIGHT */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {activeHoverBarItem && (
                <motion.div
                  key={activeHoverBarItem.day + (hoveredBarIdx ?? 0) + activityTimeframe}
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
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{activeHoverBarItem.fullDate}</span>
                        {activeHoverBarItem.isCurrent && (
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
                      {activeHoverBarItem.hours}h
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      {Math.round(activeHoverBarItem.hours * 60)} min
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* VERTICAL BARS */}
            <div className="h-32 flex items-end justify-between px-2 gap-2 mt-2">
              {currentBarChartData.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.hours / maxBarHours) * 100));
                const isSelected = hoveredBarIdx === idx;
                return (
                  <div
                    key={item.day + idx}
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onClick={() => setHoveredBarIdx(idx)}
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
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#161922] dark:text-white tracking-tight">
                  Maîtrise Disciplinaire
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  Niveau d'acquisition par matière
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              {subjectMetrics.length} matières
            </span>
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
            <span className="font-semibold">Objectif hebdomadaire : 25h</span>
            <span className="font-black text-[#161922] dark:text-white">
              {totalHours}h / 25h
            </span>
          </div>
        </motion.div>

      </div>

      {/* DYNAMIC PRODUCTIVITY SCORE PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#161922] text-white p-7 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award style={{ color: currentTheme.accentColor }} className="w-5 h-5" />
            <span style={{ color: currentTheme.accentColor }} className="text-[10px] font-black uppercase tracking-widest">
              Score de Performance Académique
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Score Global : {productivityScore} / 100</h3>
          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed font-medium">
            Calculé en temps réel à partir du ratio de complétion de vos devoirs, du taux de rétention des cartes mémoires et des blocs Pomodoro validés.
          </p>
        </div>

        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke={currentTheme.accentColor}
              className="transition-all duration-1000 ease-out"
              strokeDasharray={`${productivityScore}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span style={{ color: currentTheme.accentColor }} className="absolute text-xl font-black">{productivityScore}%</span>
        </div>
      </motion.div>

      {/* ACHIEVEMENTS & MILESTONES SYSTEM */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <AchievementsSection
          logs={logs}
          tasks={tasks}
          decks={decks}
          documents={documents}
        />
      </motion.div>
    </div>
  );
};
