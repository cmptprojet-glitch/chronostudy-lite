import { StudySessionLog, Task, FlashcardDeck } from '../types';

export interface LevelInfo {
  level: number;
  title: string;
  badge: string;
  color: string;
  currentLevelXP: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalXP: number;
  totalXPNeededForLevel: number;
}

export interface XPGainNotification {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

export const XP_RATES = {
  POMODORO_SESSION: 50,
  STUDY_MINUTE: 2,
  TASK_COMPLETED: 30,
  SUBTASK_COMPLETED: 10,
  FLASHCARD_EASY: 20,
  FLASHCARD_MEDIUM: 15,
  FLASHCARD_HARD: 10,
  DECK_COMPLETED: 50,
  JOURNAL_ENTRY: 40,
} as const;

interface LevelThreshold {
  level: number;
  xpRequired: number; // XP from previous level to reach this level
  cumulatedXP: number; // Total XP at the start of this level
  title: string;
  badge: string;
  color: string;
}

const LEVEL_DEFINITIONS: LevelThreshold[] = [
  { level: 1, xpRequired: 200, cumulatedXP: 0, title: 'Apprenti Novice', badge: '🌱', color: '#10b981' },
  { level: 2, xpRequired: 300, cumulatedXP: 200, title: 'Étudiant Régulier', badge: '📖', color: '#06b6d4' },
  { level: 3, xpRequired: 450, cumulatedXP: 500, title: 'Stratège Active Recall', badge: '🧠', color: '#3b82f6' },
  { level: 4, xpRequired: 650, cumulatedXP: 950, title: 'Major de Promotion', badge: '🎓', color: '#8b5cf6' },
  { level: 5, xpRequired: 900, cumulatedXP: 1600, title: 'Érudit ChronoStudy', badge: '⚡', color: '#f59e0b' },
  { level: 6, xpRequired: 1200, cumulatedXP: 2500, title: 'Maître Spaced Repetition', badge: '🌟', color: '#ec4899' },
  { level: 7, xpRequired: 1600, cumulatedXP: 3700, title: 'Grand Savant Académique', badge: '👑', color: '#eab308' },
  { level: 8, xpRequired: 2200, cumulatedXP: 5300, title: 'Légende du Savoir', badge: '💎', color: '#06b6d4' },
];

/**
 * Computes level, current level progress, next level threshold and rank title from total XP.
 */
export function calculateLevel(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, Math.round(totalXP || 0));

  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    const def = LEVEL_DEFINITIONS[i];
    if (safeXP >= def.cumulatedXP) {
      const currentLevelXP = safeXP - def.cumulatedXP;
      const xpForNextLevel = def.xpRequired;
      const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXP / xpForNextLevel) * 100)));

      return {
        level: def.level,
        title: def.title,
        badge: def.badge,
        color: def.color,
        currentLevelXP,
        xpForNextLevel,
        progressPercent,
        totalXP: safeXP,
        totalXPNeededForLevel: def.cumulatedXP,
      };
    }
  }

  const first = LEVEL_DEFINITIONS[0];
  return {
    level: 1,
    title: first.title,
    badge: first.badge,
    color: first.color,
    currentLevelXP: safeXP,
    xpForNextLevel: first.xpRequired,
    progressPercent: Math.min(100, Math.max(0, Math.round((safeXP / first.xpRequired) * 100))),
    totalXP: safeXP,
    totalXPNeededForLevel: 0,
  };
}

/**
 * Calculates initial baseline XP from existing study logs, completed tasks, and flashcard reviews.
 */
export function calculateBaselineXP(
  logs: StudySessionLog[],
  tasks: Task[],
  decks: FlashcardDeck[]
): number {
  let xp = 0;

  // XP from logs
  logs.forEach((log) => {
    xp += log.durationMinutes * XP_RATES.STUDY_MINUTE;
    if (log.type === 'pomodoro') {
      xp += XP_RATES.POMODORO_SESSION;
    }
  });

  // XP from completed tasks and subtasks
  tasks.forEach((task) => {
    if (task.status === 'completed') {
      xp += XP_RATES.TASK_COMPLETED;
    }
    if (task.subtasks) {
      task.subtasks.forEach((st) => {
        if (st.completed) {
          xp += XP_RATES.SUBTASK_COMPLETED;
        }
      });
    }
  });

  // XP from flashcard reviews
  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      if (card.reviewCount > 0) {
        xp += card.reviewCount * XP_RATES.FLASHCARD_MEDIUM;
      }
    });
  });

  return Math.max(150, xp);
}
