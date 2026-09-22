import React from 'react';
import { motion } from 'motion/react';
import { StudySessionLog, SubjectMetric, Task, FlashcardDeck, StudyDocument } from '../types';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Timer,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { AchievementsSection } from './AchievementsSection';
import { useTheme } from '../context/ThemeContext';
import { UIComponents } from './UIComponents';

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

  // Calculate aggregated metrics
  const totalMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

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

      {/* 4 MODULES D'ANALYTICS RÉUNIS (ÉVOLUTION DU TEMPS D'ÉTUDE, RÉPARTITION PAR MATIÈRE, ACTIVITÉ & COURBE, MAÎTRISE DISCIPLINAIRE) */}
      <UIComponents
        logs={logs}
        subjectMetrics={subjectMetrics}
        totalHours={totalHours}
      />

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
