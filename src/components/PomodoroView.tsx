import React, { useState, useEffect } from 'react';
import { Task, StudySessionLog } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  Flame,
  ShieldAlert,
  AlertTriangle,
  Award,
  Timer,
  Zap,
  Target,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AmbientAudioPlayer } from './AmbientAudioPlayer';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface PomodoroViewProps {
  tasks: Task[];
  onLogSession: (session: StudySessionLog) => void;
  onAwardXP?: (amount: number, reason: string) => void;
  selectedTaskId?: string;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  onLogSession,
  onAwardXP,
  selectedTaskId,
}) => {
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);

  const [phase, setPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [attachedTaskId, setAttachedTaskId] = useState<string | undefined>(selectedTaskId);
  const [attachedSubject, setAttachedSubject] = useState<string>('Mathématiques');

  // Anti-Cheat protection dialog state
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'skip' | 'switch_break' | null>(null);

  // Sync selected task and automatically program focus duration if linked from task
  useEffect(() => {
    if (selectedTaskId) {
      setAttachedTaskId(selectedTaskId);
      const found = tasks.find((t) => t.id === selectedTaskId);
      if (found) {
        setAttachedSubject(found.subject);
        if (found.estimatedMinutes && found.estimatedMinutes > 0) {
          setWorkMinutes(found.estimatedMinutes);
          if (!isRunning) {
            setTimeLeft(found.estimatedMinutes * 60);
          }
        }
      }
    }
  }, [selectedTaskId, tasks]);

  // Main countdown timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleNaturalPhaseComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Play audio chime
  const playCompletionBell = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // Audio context might be restricted
    }
  };

  // XP calculation rule: +10 XP every 5 minutes added
  // Minimum required: 4/5 (80%) of the configured work duration
  const requiredSecondsForXP = Math.floor((workMinutes * 60 * 4) / 5);
  const potentialFullXP = Math.max(10, Math.floor(workMinutes / 5) * 10);

  const handleNaturalPhaseComplete = () => {
    setIsRunning(false);
    playCompletionBell();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    if (phase === 'work') {
      const duration = workMinutes;
      onLogSession({
        id: `log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: duration,
        subject: attachedSubject,
        taskId: attachedTaskId || undefined,
        type: 'pomodoro',
      });

      if (onAwardXP) {
        onAwardXP(potentialFullXP, `Session Pomodoro Validée (${duration} min, +10 XP / 5 min)`);
      }

      setPhase('shortBreak');
      setTimeLeft(shortBreakMinutes * 60);
    } else {
      setPhase('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  const totalPhaseSeconds =
    phase === 'work' ? workMinutes * 60 : phase === 'shortBreak' ? shortBreakMinutes * 60 : longBreakMinutes * 60;

  const elapsedSeconds = totalPhaseSeconds - timeLeft;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // 4/5 threshold validation check
  const hasMetThreshold = elapsedSeconds >= requiredSecondsForXP;

  const handleAttemptSkipOrComplete = () => {
    if (phase === 'work') {
      // Check if user has NOT met 4/5 threshold
      if (elapsedSeconds < requiredSecondsForXP && timeLeft > 0) {
        setIsRunning(false);
        setPendingAction('skip');
        setShowAntiCheatModal(true);
        return;
      }
    }
    // If valid or break phase
    handleExecuteSkip(true);
  };

  const handleExecuteSkip = (grantReward: boolean) => {
    setShowAntiCheatModal(false);
    playCompletionBell();

    if (phase === 'work') {
      const studiedMins = Math.max(1, Math.round(elapsedSeconds / 60));
      if (grantReward && elapsedSeconds >= requiredSecondsForXP) {
        const earnedXP = Math.max(10, Math.floor(studiedMins / 5) * 10);
        onLogSession({
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          durationMinutes: studiedMins,
          subject: attachedSubject,
          taskId: attachedTaskId || undefined,
          type: 'pomodoro',
        });
        if (onAwardXP) {
          onAwardXP(earnedXP, `Focus Validé (≥ 4/5 temps fait, ${studiedMins} min : +${earnedXP} XP)`);
        }
        confetti({ particleCount: 70, spread: 60 });
      }
      setPhase('shortBreak');
      setTimeLeft(shortBreakMinutes * 60);
      setIsRunning(false);
    } else {
      setPhase('work');
      setTimeLeft(workMinutes * 60);
      setIsRunning(false);
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (phase === 'work') setTimeLeft(workMinutes * 60);
    else if (phase === 'shortBreak') setTimeLeft(shortBreakMinutes * 60);
    else setTimeLeft(longBreakMinutes * 60);
  };

  const handleSwitchPhase = (newPhase: 'work' | 'shortBreak' | 'longBreak') => {
    if (isRunning && phase === 'work' && elapsedSeconds < requiredSecondsForXP && timeLeft > 0) {
      setIsRunning(false);
      setPendingAction('switch_break');
      setShowAntiCheatModal(true);
      return;
    }
    setIsRunning(false);
    setPhase(newPhase);
    if (newPhase === 'work') setTimeLeft(workMinutes * 60);
    else if (newPhase === 'shortBreak') setTimeLeft(shortBreakMinutes * 60);
    else setTimeLeft(longBreakMinutes * 60);
  };

  const handleUpdateWorkMinutes = (mins: number) => {
    const validMins = Math.max(5, mins);
    setWorkMinutes(validMins);
    if (phase === 'work' && !isRunning) {
      setTimeLeft(validMins * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((totalPhaseSeconds - timeLeft) / totalPhaseSeconds) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans select-none">
      {/* HEADER & DYNAMIC XP COUNTER BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xs"
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                  Focus & Minuteur Pomodoro
                </h2>
                <span
                  style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                >
                  {workMinutes} min
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Barème dynamique : +10 XP par tranche de 5 min (Validation requise : 4/5 du temps)
              </p>
            </div>
          </div>
        </div>

        {/* LIVE XP REWARD COUNTER BADGE */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText, borderColor: `${currentTheme.accentColor}66` }}
            className="border px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs"
          >
            <Zap className="w-4 h-4 fill-current" />
            <div className="text-xs">
              <span className="font-bold block">Récompense visée :</span>
              <span className="font-black text-sm">+{potentialFullXP} XP</span>
              <span className="text-[10px] opacity-80 ml-1.5">(seuil 4/5 : {Math.ceil(workMinutes * 0.8)} min)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TIMER WIDGET (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center">
          
          {/* PHASE SELECTOR TABS */}
          <div className="w-full space-y-3 mb-2">
            <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => handleSwitchPhase('work')}
                style={
                  phase === 'work'
                    ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                    : undefined
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  phase === 'work'
                    ? 'font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                Travail ({workMinutes}m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPhase('shortBreak')}
                style={
                  phase === 'shortBreak'
                    ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                    : undefined
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  phase === 'shortBreak'
                    ? 'font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                Courte Pause ({shortBreakMinutes}m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPhase('longBreak')}
                style={
                  phase === 'longBreak'
                    ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                    : undefined
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  phase === 'longBreak'
                    ? 'font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                Longue Pause ({longBreakMinutes}m)
              </button>
            </div>

            {/* DURATION PRESETS WITH SCALED XP REWARDS */}
            {phase === 'work' && (
              <div className="flex flex-wrap items-center justify-center gap-2 bg-[#F5F6FA] dark:bg-zinc-800/60 p-3 rounded-2xl text-xs">
                <span className="font-extrabold text-[#161922] dark:text-white mr-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#161922] dark:text-white" /> Durée :
                </span>
                {[25, 30, 45, 60, 90].map((presetMins) => {
                  const xpForPreset = Math.floor(presetMins / 5) * 10;
                  return (
                    <button
                      key={presetMins}
                      type="button"
                      onClick={() => handleUpdateWorkMinutes(presetMins)}
                      style={
                        workMinutes === presetMins
                          ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                          : undefined
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        workMinutes === presetMins
                          ? 'font-black shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{presetMins}m</span>
                      <span className="text-[10px] opacity-75">(+{xpForPreset} XP)</span>
                    </button>
                  );
                })}

                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-zinc-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Custom :</span>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={workMinutes}
                    onChange={(e) => handleUpdateWorkMinutes(Number(e.target.value))}
                    className="w-14 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-center font-bold text-[#161922] dark:text-white text-xs outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">m</span>
                </div>
              </div>
            )}
          </div>

          {/* TIMER DISPLAY RING */}
          <div className="relative w-64 h-64 my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-zinc-800"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={currentTheme.accentColor}
                className="transition-all duration-1000 ease-linear"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-[#161922] dark:text-white tracking-tighter font-mono">
                {formatTime(timeLeft)}
              </span>
              <span
                style={{ color: currentTheme.accentColor }}
                className="text-xs font-extrabold uppercase tracking-wider mt-2"
              >
                {phase === 'work' ? 'Session Deep Focus' : 'Pause Récupération'}
              </span>
              {phase === 'work' && (
                <div className="mt-1 space-y-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    Écoulé : {formatTime(elapsedSeconds)} / {workMinutes}m
                  </span>
                  <span className={`text-[10px] font-black block ${hasMetThreshold ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {hasMetThreshold ? '✓ Seuil 4/5 atteint (+XP éligible)' : `Objectif 4/5 : ${Math.ceil(workMinutes * 0.8)}m requis`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleReset}
              title="Réinitialiser le chrono"
              className="p-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-2xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleStartPause}
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="px-8 py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 hover:opacity-95"
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Mettre en Pause' : 'Démarrer le Focus'}</span>
            </button>

            <button
              type="button"
              onClick={handleAttemptSkipOrComplete}
              title="Valider / Passer à l'étape suivante"
              className="p-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-2xl transition-all cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TASK LINKAGE & AUDIO FILE PLAYER (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* TASK LINKAGE CARD */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-3xl shadow-xs space-y-3">
            <div>
              <span
                style={{ color: currentTheme.accentColor }}
                className="text-[10px] font-black uppercase tracking-wider"
              >
                Traçabilité & XP
              </span>
              <h3 className="font-extrabold text-[#161922] dark:text-white text-sm">
                Lier à un Devoir / Matière
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Matière Associée
                </label>
                <select
                  value={attachedSubject}
                  onChange={(e) => setAttachedSubject(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-2.5 text-[#161922] dark:text-white font-bold text-xs focus:ring-2 outline-none"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT & Biologie">SVT & Biologie</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Droit">Droit</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="Langues (Anglais)">Langues (Anglais)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tâche / Devoir Sélectionné
                </label>
                <select
                  value={attachedTaskId || ''}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setAttachedTaskId(tid);
                    const selected = tasks.find((t) => t.id === tid);
                    if (selected) {
                      setAttachedSubject(selected.subject);
                      if (selected.estimatedMinutes) {
                        handleUpdateWorkMinutes(selected.estimatedMinutes);
                      }
                    }
                  }}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-2.5 text-[#161922] dark:text-white font-bold text-xs focus:ring-2 outline-none"
                >
                  <option value="">-- Aucune tâche spécifique --</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.estimatedMinutes}m - {task.subject})
                    </option>
                  ))}
                </select>
              </div>

              {attachedTaskId && (
                <div className="bg-[#EFFDE2] dark:bg-zinc-800 p-2.5 rounded-xl border border-[#D4F94E]/40 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#65A30D] shrink-0" />
                  <span>
                    Chrono synchronisé sur <strong>{workMinutes} minutes</strong> pour cette tâche.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AMBIENT AUDIO FILE PLAYER */}
          <AmbientAudioPlayer />
        </div>
      </div>

      {/* ANTI-CHEAT MODAL / DIALOG (4/5 THRESHOLD) */}
      {showAntiCheatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 font-black">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#161922] dark:text-white">
                  Seuil de Concentration Insuffisant (Règle des 4/5)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Validation d'expérience non éligible</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5 font-medium leading-relaxed">
              <p>
                Vous avez étudié pendant <strong>{elapsedMinutes} min {elapsedSeconds % 60}s</strong> sur une session prévue de <strong>{workMinutes} min</strong>.
              </p>
              <p>
                Pour obtenir la récompense de <strong>+{potentialFullXP} XP</strong> (10 XP / 5 min), vous devez compléter au moins <strong>4/5 du temps défini ({Math.ceil(workMinutes * 0.8)} min)</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAntiCheatModal(false);
                  setIsRunning(true);
                }}
                className="py-2.5 px-3 bg-[#161922] text-[#D4F94E] rounded-xl text-xs font-black hover:opacity-90 transition-all cursor-pointer"
              >
                Reprendre le Focus
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSkip(false)}
                className="py-2.5 px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                Passer sans XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
