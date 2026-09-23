import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { StudySessionLog, SubjectMetric, Task, FlashcardDeck, StudyDocument } from '../types';
import { Activity, Award, BookOpen, CalendarDays, CheckCircle2, Clock3, Flame, RefreshCw, Target, Timer, TrendingUp } from 'lucide-react';
import { AchievementsSection } from './AchievementsSection';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  logs: StudySessionLog[];
  subjectMetrics: SubjectMetric[];
  tasks: Task[];
  decks: FlashcardDeck[];
  documents?: StudyDocument[];
}

interface DailyPoint {
  day: string;
  focusedMinutes: number;
  sessionsCompleted: number;
  cardsReviewed: number;
  cardsMastered: number;
  xpEarned: number;
  streakDays: number;
}

interface AnalyticsResponse {
  periodDays: number;
  totals: { focusedMinutes: number; sessionsCompleted: number; cardsReviewed: number; cardsMastered: number; xpEarned: number };
  currentStreak: number;
  daily: DailyPoint[];
  subjects: { subject: string; minutes: number; sessions: number }[];
  pomodoro: { completed: number; total: number; focusedMinutes: number };
  insights: { averageSessionMinutes: number; activeDays: number; bestDay: string };
}

const periodOptions = [7, 30, 90];
const formatDay = (value: string) => new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
const formatHours = (minutes: number) => `${(minutes / 60).toFixed(minutes >= 600 ? 0 : 1)} h`;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, subjectMetrics, tasks, decks, documents = [] }) => {
  const { currentTheme } = useTheme();
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo<AnalyticsResponse>(() => {
    const dailyMap = logs.reduce<Record<string, DailyPoint>>((acc, log) => {
      const day = log.date;
      const current = acc[day] || { day, focusedMinutes: 0, sessionsCompleted: 0, cardsReviewed: 0, cardsMastered: 0, xpEarned: 0, streakDays: 0 };
      current.focusedMinutes += log.durationMinutes;
      current.sessionsCompleted += 1;
      acc[day] = current;
      return acc;
    }, {});
    const subjectsMap = logs.reduce<Record<string, { subject: string; minutes: number; sessions: number }>>((acc, log) => {
      const current = acc[log.subject] || { subject: log.subject, minutes: 0, sessions: 0 };
      current.minutes += log.durationMinutes;
      current.sessions += 1;
      acc[log.subject] = current;
      return acc;
    }, {});
    const daily = Object.values(dailyMap).sort((a, b) => a.day.localeCompare(b.day)).slice(-period);
    return {
      periodDays: period,
      // Deck/task fixtures are not analytics events. Only persisted study logs may be used offline.
      totals: { focusedMinutes: logs.reduce((sum, log) => sum + log.durationMinutes, 0), sessionsCompleted: logs.length, cardsReviewed: 0, cardsMastered: 0, xpEarned: 0 },
      currentStreak: 0,
      daily,
      subjects: Object.values(subjectsMap).sort((a, b) => b.minutes - a.minutes),
      pomodoro: { completed: logs.filter((log) => log.type === 'pomodoro').length, total: logs.filter((log) => log.type === 'pomodoro').length, focusedMinutes: logs.filter((log) => log.type === 'pomodoro').reduce((sum, log) => sum + log.durationMinutes, 0) },
      insights: { averageSessionMinutes: logs.length ? Math.round(logs.reduce((sum, log) => sum + log.durationMinutes, 0) / logs.length) : 0, activeDays: daily.length, bestDay: daily.sort((a, b) => b.focusedMinutes - a.focusedMinutes)[0]?.day || '' },
    };
  }, [decks, logs, period, tasks]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/analytics/overview?days=${period}`, { credentials: 'include' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Connexion requise pour synchroniser les statistiques.' : 'Les statistiques Supabase sont momentanément indisponibles.');
      setData(await response.json() as AnalyticsResponse);
    } catch (requestError) {
      setData(null);
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAnalytics(); }, [period]);

  const analytics = data || fallback;
  const maxMinutes = Math.max(1, ...analytics.daily.map((point) => point.focusedMinutes));
  const maxSubjectMinutes = Math.max(1, ...analytics.subjects.map((subject) => subject.minutes));
  const taskCompletion = data && tasks.length ? Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100) : 0;
  const mastery = analytics.totals.cardsReviewed ? Math.round((analytics.totals.cardsMastered / analytics.totals.cardsReviewed) * 100) : 0;
  const productivityScore = Math.min(100, Math.round(analytics.totals.focusedMinutes / 6 + taskCompletion * 0.25 + mastery * 0.15 + analytics.pomodoro.completed * 2));
  const heatmap = Array.from({ length: Math.min(35, analytics.daily.length) }, (_, index) => analytics.daily[Math.max(0, analytics.daily.length - Math.min(35, analytics.daily.length) + index)]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24 font-sans">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] bg-[#161922] p-6 text-white shadow-xl md:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: currentTheme.accentColor }} />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: currentTheme.accentColor }}><Activity className="h-4 w-4" /> Suivi analytique synchronisé</div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Votre progression, en clair.</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-300">Une vue consolidée de vos sessions, matières, cartes mémoires et cycles de concentration enregistrés dans Supabase.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {periodOptions.map((option) => <button key={option} onClick={() => setPeriod(option)} className={`rounded-xl px-3 py-2 text-xs font-black transition ${period === option ? 'bg-white text-[#161922]' : 'text-zinc-300 hover:bg-white/10'}`}>{option} j</button>)}
            </div>
            <button onClick={() => void loadAnalytics()} aria-label="Actualiser les statistiques" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition hover:bg-white/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
        {error && <div className="relative mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-xs font-semibold text-amber-100">{error} Affichage de la dernière vue locale en attendant la reconnexion.</div>}
      </motion.section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: <Clock3 className="h-4 w-4" />, value: formatHours(analytics.totals.focusedMinutes), label: 'Temps de focus', tone: 'bg-[#F4FDE0] text-[#4D7C0F]' },
          { icon: <CalendarDays className="h-4 w-4" />, value: String(analytics.totals.sessionsCompleted), label: 'Sessions terminées', tone: 'bg-[#EEF2FF] text-[#4F46E5]' },
          { icon: <Flame className="h-4 w-4" />, value: `${analytics.currentStreak} j`, label: 'Série actuelle', tone: 'bg-[#FFF1EB] text-[#EA580C]' },
          { icon: <Target className="h-4 w-4" />, value: `${productivityScore}/100`, label: 'Score de régularité', tone: 'bg-[#F3F0FF] text-[#7C3AED]' },
        ].map((card) => <motion.div key={card.label} whileHover={{ y: -3 }} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div><div className="text-2xl font-black tracking-tight text-[#161922] dark:text-white">{card.value}</div><div className="mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">{card.label}</div></motion.div>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <div className="mb-6 flex items-start justify-between"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><TrendingUp className="h-4 w-4" /> Activité quotidienne</div><h3 className="mt-1 text-lg font-black text-[#161922] dark:text-white">Temps de focus par jour</h3></div><span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-300">{analytics.insights.activeDays} jours actifs</span></div>
          <div className="flex h-56 items-end gap-1.5 sm:gap-2">{analytics.daily.map((point) => <div key={point.day} className="group flex h-full flex-1 flex-col justify-end"><div className="relative flex min-h-[4px] w-full items-end rounded-t-lg bg-slate-100 dark:bg-zinc-800" style={{ height: `${Math.max(3, (point.focusedMinutes / maxMinutes) * 100)}%` }}><div className="h-full w-full rounded-t-lg transition group-hover:brightness-110" style={{ background: point.focusedMinutes ? `linear-gradient(180deg, ${currentTheme.accentColor}, #8BBF2F)` : undefined }} /><span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#161922] px-2 py-1 text-[10px] font-bold text-white group-hover:block">{point.focusedMinutes} min</span></div><span className="mt-2 truncate text-center text-[9px] font-bold text-slate-400">{point.day.slice(8)}</span></div>)}</div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><BookOpen className="h-4 w-4" /> Répartition</div><h3 className="mt-1 text-lg font-black text-[#161922] dark:text-white">Temps par matière</h3></div><span className="text-xs font-bold text-slate-400">{analytics.subjects.length} matières</span></div><div className="space-y-4">{analytics.subjects.slice(0, 5).map((subject, index) => <div key={subject.subject}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate font-bold text-slate-700 dark:text-zinc-200">{subject.subject}</span><span className="shrink-0 font-black text-slate-400">{formatHours(subject.minutes)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(5, (subject.minutes / maxSubjectMinutes) * 100)}%`, backgroundColor: [currentTheme.accentColor, '#7DD3FC', '#F8BED6', '#C4B5FD', '#FDBA74'][index % 5] }} /></div></div>)}{!analytics.subjects.length && <p className="rounded-2xl bg-slate-50 p-5 text-center text-xs font-semibold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">Commencez une session pour voir apparaître vos matières.</p>}</div></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="mb-5 flex items-center gap-2"><Timer className="h-5 w-5 text-violet-500" /><h3 className="text-lg font-black text-[#161922] dark:text-white">Focus Pomodoro</h3></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-950/30"><div className="text-2xl font-black text-violet-700 dark:text-violet-300">{analytics.pomodoro.completed}</div><div className="mt-1 text-xs font-bold text-violet-600/70 dark:text-violet-300/70">cycles terminés</div></div><div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/30"><div className="text-2xl font-black text-sky-700 dark:text-sky-300">{formatHours(analytics.pomodoro.focusedMinutes)}</div><div className="mt-1 text-xs font-bold text-sky-600/70 dark:text-sky-300/70">focus effectif</div></div></div><div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400"><span>Session moyenne</span><span className="text-[#161922] dark:text-white">{analytics.insights.averageSessionMinutes} min</span></div><div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-violet-400" style={{ width: `${analytics.pomodoro.total ? Math.round((analytics.pomodoro.completed / analytics.pomodoro.total) * 100) : 0}%` }} /></div></div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Activity className="h-4 w-4" /> Régularité</div><h3 className="mt-1 text-lg font-black text-[#161922] dark:text-white">Carte des jours actifs</h3></div><div className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span>calme</span><i className="h-3 w-3 rounded bg-slate-100 dark:bg-zinc-800" /><i className="h-3 w-3 rounded bg-lime-200" /><i className="h-3 w-3 rounded bg-lime-400" /><i className="h-3 w-3 rounded bg-lime-600" /><span>intense</span></div></div><div className="grid grid-cols-7 gap-2">{heatmap.map((point) => <div key={point.day} title={`${formatDay(point.day)} · ${point.focusedMinutes} min`} className={`aspect-square rounded-md ${point.focusedMinutes === 0 ? 'bg-slate-100 dark:bg-zinc-800' : point.focusedMinutes < 30 ? 'bg-lime-200' : point.focusedMinutes < 60 ? 'bg-lime-400' : 'bg-lime-600'}`} />)}</div><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400"><CheckCircle2 className="h-4 w-4 text-lime-600" /> Meilleure journée : {analytics.insights.bestDay ? formatDay(analytics.insights.bestDay) : 'Pas encore de données'}</div></div>
      </section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-[#161922] p-6 text-white shadow-md"><div className="flex flex-col items-center justify-between gap-5 md:flex-row"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: currentTheme.accentColor }}><Award className="h-4 w-4" /> Performance académique</div><h3 className="text-2xl font-black">Score global : {productivityScore} / 100</h3><p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-zinc-400">Le score combine le temps réellement étudié, la régularité, les sessions Pomodoro et la progression des cartes. Il sert de repère, pas de jugement.</p></div><div className="relative flex h-24 w-24 shrink-0 items-center justify-center"><svg className="h-full w-full -rotate-90" viewBox="0 0 36 36"><path stroke="#2B303A" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path stroke={currentTheme.accentColor} strokeDasharray={`${productivityScore}, 100`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg><span className="absolute text-xl font-black" style={{ color: currentTheme.accentColor }}>{productivityScore}</span></div></div></motion.section>

      <AchievementsSection logs={logs} tasks={tasks} decks={decks} documents={documents} />
      {loading && <p className="text-center text-xs font-bold text-slate-400">Synchronisation des statistiques Supabase…</p>}
    </div>
  );
};
