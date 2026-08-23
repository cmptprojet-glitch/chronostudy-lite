import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { calculateLevel, calculateBaselineXP, LevelInfo } from '../utils/gamification';
import { StudySessionLog, Task, FlashcardDeck } from '../types';
import { INITIAL_LOGS, INITIAL_TASKS, INITIAL_DECKS } from '../data/initialData';

export interface XPToastNotification {
  id: number;
  amount: number;
  reason: string;
}

export function useGamification(
  initialLogs: StudySessionLog[] = INITIAL_LOGS,
  initialTasks: Task[] = INITIAL_TASKS,
  initialDecks: FlashcardDeck[] = INITIAL_DECKS
) {
  const [userXP, setUserXP] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_user_xp');
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
      return calculateBaselineXP(initialLogs, initialTasks, initialDecks);
    } catch {
      return calculateBaselineXP(initialLogs, initialTasks, initialDecks);
    }
  });

  const [xpToast, setXpToast] = useState<XPToastNotification | null>(null);

  useEffect(() => {
    localStorage.setItem('chronostudy_user_xp', userXP.toString());
  }, [userXP]);

  // Auto-dismiss XP Toast
  useEffect(() => {
    if (xpToast) {
      const timer = setTimeout(() => {
        setXpToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [xpToast]);

  const handleAwardXP = useCallback((amount: number, reason: string) => {
    if (amount <= 0) return;
    setUserXP((prevXP) => {
      const oldLevelInfo = calculateLevel(prevXP);
      const newXP = prevXP + amount;
      const newLevelInfo = calculateLevel(newXP);

      if (newLevelInfo.level > oldLevelInfo.level) {
        try {
          confetti({ particleCount: 130, spread: 80, origin: { y: 0.5 } });
        } catch {
          // Ignore confetti errors if not supported
        }
      }

      setXpToast({ id: Date.now(), amount, reason });
      return newXP;
    });
  }, []);

  const levelInfo: LevelInfo = calculateLevel(userXP);

  return {
    userXP,
    setUserXP,
    xpToast,
    setXpToast,
    levelInfo,
    handleAwardXP,
  };
}
