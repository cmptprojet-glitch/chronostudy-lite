import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Layers,
  Plus,
  Zap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  Flame,
  MessageCircle,
} from 'lucide-react';
import { FlashcardDeck, Task, StudyDocument } from '../types';
import { useTheme } from '../context/ThemeContext';

export interface RevisionMilestone {
  id: string;
  dayLabel: string;
  title: string;
  focusMinutes: number;
  type: 'concept' | 'exercise' | 'exam_sim' | 'flashcards';
  description: string;
  keyFormulas?: string[];
  completed: boolean;
  xpReward: number;
}

export interface StructuredRevisionPlan {
  id: string;
  subject: string;
  title: string;
  targetScore: number;
  examDate?: string;
  daysRemaining?: number;
  totalHours: number;
  milestones: RevisionMilestone[];
  tips: string[];
}

interface InteractiveRevisionPlanCardProps {
  plan: StructuredRevisionPlan;
  onAddTask?: (task: Task) => void;
  onSaveDeck?: (deck: FlashcardDeck) => void;
  onAddDocument?: (doc: StudyDocument) => void;
  onStartPomodoro?: (minutes: number, title: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
  onSendFeedback?: (feedback: string) => void;
}

export const InteractiveRevisionPlanCard: React.FC<InteractiveRevisionPlanCardProps> = ({
  plan,
  onAddTask,
  onSaveDeck,
  onAddDocument,
  onStartPomodoro,
  onAwardXP,
  onSendFeedback,
}) => {
  const { currentTheme } = useTheme();

  const [milestones, setMilestones] = useState<RevisionMilestone[]>(plan.milestones);
  const [tasksAdded, setTasksAdded] = useState(false);
  const [deckCreated, setDeckCreated] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextState = !m.completed;
          if (nextState && onAwardXP) {
            onAwardXP(m.xpReward, `Étape plan validée : ${m.title}`);
          }
          return { ...m, completed: nextState };
        }
        return m;
      })
    );
  };

  const handleAddAllToTasks = () => {
    if (!onAddTask) return;
    milestones.forEach((m) => {
      onAddTask({
        id: `task-plan-${Date.now()}-${m.id}`,
        title: `[Plan ${plan.subject}] ${m.title}`,
        subject: plan.subject,
        estimatedMinutes: m.focusMinutes,
        priority: 'high',
        status: 'todo',
        subtasks: [
          { id: `sub-1`, title: 'Revoir cours & définitions', completed: false },
          { id: `sub-2`, title: 'Faire exercices d’application', completed: false },
        ],
        createdAt: new Date().toISOString(),
        dueDate: plan.examDate,
      });
    });
    setTasksAdded(true);
    if (onAwardXP) onAwardXP(30, 'Plan synchronisé aux tâches');
    setTimeout(() => setTasksAdded(false), 3000);
  };

  const handleCreateDeckFromPlan = () => {
    if (!onSaveDeck) return;
    const newDeck: FlashcardDeck = {
      id: `deck-plan-${Date.now()}`,
      title: `Deck Spécial : ${plan.subject} (${plan.title})`,
      subject: plan.subject,
      description: `Deck généré pour le plan de révision vers l'objectif ${plan.targetScore}/20`,
      color: currentTheme.accentColor,
      cards: [
        {
          id: `c-1`,
          question: `Définition fondamentale pour l'examen de ${plan.subject}`,
          answer: 'Principe fondamental et hypothèses de calcul.',
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        },
        {
          id: `c-2`,
          question: `Formule essentielle pour l'étape 1`,
          answer: 'Application numérique et unités du Système International.',
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        },
        {
          id: `c-3`,
          question: `Piège classique à éviter absolument`,
          answer: 'Ne pas oublier de vérifier le domaine de validité et de poser les grandeurs.',
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    onSaveDeck(newDeck);
    setDeckCreated(true);
    if (onAwardXP) onAwardXP(25, 'Deck créé depuis le plan');
    setTimeout(() => setDeckCreated(false), 3000);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md overflow-hidden space-y-4 p-5 sm:p-6 my-3">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Plan Interactif Vérifié
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {plan.subject}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#161922] dark:text-white">
            {plan.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* TARGET SCORE BADGE */}
          <div className="px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Objectif {plan.targetScore}/20</span>
          </div>

          {/* TOTAL HOURS */}
          <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{plan.totalHours}h au total</span>
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">Progression du plan :</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">
            {completedCount} / {milestones.length} étapes ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#D4F94E]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* INTERACTIVE MILESTONES TIMELINE */}
      <div className="space-y-2.5 pt-2">
        {milestones.map((m, idx) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.01 }}
            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              m.completed
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 text-slate-500 dark:text-slate-400'
                : 'bg-slate-50/70 dark:bg-zinc-850/60 border-slate-200 dark:border-zinc-750 text-[#161922] dark:text-zinc-200'
            }`}
          >
            {/* LEFT: CHECKBOX & INFO */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => handleToggleMilestone(m.id)}
                className="mt-0.5 text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                {m.completed ? (
                  <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:text-zinc-900" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-500" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                    {m.dayLabel}
                  </span>
                  <span className={`text-xs sm:text-sm font-black ${m.completed ? 'line-through text-slate-400' : ''}`}>
                    {m.title}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-current" /> +{m.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {m.description}
                </p>

                {m.keyFormulas && m.keyFormulas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.keyFormulas.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-purple-100/70 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-mono text-[10px] font-bold"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: QUICK START FOCUS POMODORO */}
            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              {onStartPomodoro && (
                <button
                  type="button"
                  onClick={() => onStartPomodoro(m.focusMinutes, `[${plan.subject}] ${m.title}`)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Focus ({m.focusMinutes} min)</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* ADD TO TASKS */}
          <button
            type="button"
            onClick={handleAddAllToTasks}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {tasksAdded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{tasksAdded ? 'Ajouté aux tâches !' : 'Ajouter à mes tâches'}</span>
          </button>

          {/* CREATE DECK */}
          <button
            type="button"
            onClick={handleCreateDeckFromPlan}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {deckCreated ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Layers className="w-3.5 h-3.5" />}
            <span>{deckCreated ? 'Deck créé !' : 'Générer Deck associé'}</span>
          </button>
        </div>

        {/* FEEDBACK BUTTONS */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">Ce plan te convient ?</span>
          {['Parfait !', 'Trop chargé', 'Ajoute des quiz'].map((fb) => (
            <button
              key={fb}
              type="button"
              onClick={() => {
                setFeedbackSent(fb);
                if (onSendFeedback) onSendFeedback(fb);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                feedbackSent === fb
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              {fb}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
