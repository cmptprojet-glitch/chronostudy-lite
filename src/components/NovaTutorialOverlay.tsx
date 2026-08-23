import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NovaAvatar3D, NovaExpression } from './NovaAvatar3D';
import { X, ChevronRight, ChevronLeft, Sparkles, Check, Play, Mic, Eye, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import { TabType } from './Navbar';

interface NovaTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onNavigateTab?: (tab: TabType) => void;
  onOpenVoiceAssistant?: () => void;
  onToggleDeepFocus?: () => void;
}

interface StepInfo {
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  targetId?: string;
  expression: NovaExpression;
  iconType: 'sparkles' | 'deck' | 'clock' | 'chart' | 'eye' | 'mic';
}

const TUTORIAL_STEPS: StepInfo[] = [
  {
    titleFr: 'Rencontrez Nova AI, votre Copilote',
    titleEn: 'Meet Nova AI, your Co-pilot',
    descFr:
      'Bonjour ! Je suis Nova AI. Je suis connectée à tous vos cours, flashcards, pomodoros et documents. Vous pouvez me parler au micro pour un guidage mains libres ou automatiser vos fiches.',
    descEn:
      'Hello! I am Nova AI. I am connected to all your courses, flashcards, pomodoros, and documents. You can speak to me hands-free or automate your summaries.',
    expression: 'celebrating',
    iconType: 'sparkles',
  },
  {
    titleFr: 'Decks & Répétition Espacée',
    titleEn: 'Active Recall & Decks',
    descFr:
      'Faites défiler vos paquets de cartes mémoire avec calcul de maîtrise instantané et révisez selon l\'algorithme d\'espacement optimal.',
    descEn:
      'Browse your flashcard decks with real-time mastery tracking and practice with spaced repetition algorithms.',
    targetId: 'tutorial-decks-carousel',
    expression: 'nodding',
    iconType: 'deck',
  },
  {
    titleFr: 'Booster Pomodoro & Séries',
    titleEn: 'Quick Pomodoro & Streak',
    descFr:
      'Lancez directement une session de concentration calibrée pour votre matière ou devoir actuel et gagnez des points d\'XP.',
    descEn:
      'Launch a calibrated focus session for your current subject or task in one click and earn XP points.',
    targetId: 'tutorial-pomodoro-booster',
    expression: 'speaking',
    iconType: 'clock',
  },
  {
    titleFr: 'Maîtrise & Évolution Graphique',
    titleEn: 'Subject Mastery & Analytics',
    descFr:
      'Consultez vos heures d\'étude hebdomadaires, l\'évolution de vos révisions et l\'équilibre entre chaque discipline.',
    descEn:
      'Check your weekly study hours, revision trends, and balance between different academic disciplines.',
    targetId: 'tutorial-subject-mastery',
    expression: 'thinking',
    iconType: 'chart',
  },
  {
    titleFr: 'Mode "Deep Focus" Sans Distraction',
    titleEn: '"Deep Focus" Distraction-Free Mode',
    descFr:
      'Masquez les barres latérales et concentrez-vous à 100% sur votre tâche ou fiche de révision avec une interface ultra-épurée.',
    descEn:
      'Collapse the navigation and focus 100% on your active task or document in an ultra-clean centered layout.',
    targetId: 'tutorial-deep-focus-toggle',
    expression: 'listening',
    iconType: 'eye',
  },
  {
    titleFr: 'Assistant Vocal & Actions Instantanées',
    titleEn: 'Voice Assistant & Instant Actions',
    descFr:
      'Cliquez sur mon orbe en bas à droite pour ouvrir la console, activer le microphone ou générer un cours complet en quelques secondes !',
    descEn:
      'Click my avatar orb on the bottom right to open the drawer, activate microphone speech, or generate a complete course in seconds!',
    targetId: 'nova-ai-assistant-button',
    expression: 'celebrating',
    iconType: 'mic',
  },
];

export const NovaTutorialOverlay: React.FC<NovaTutorialOverlayProps> = ({
  isOpen,
  onClose,
  onComplete,
  onNavigateTab,
  onOpenVoiceAssistant,
  onToggleDeepFocus,
}) => {
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Calculate spotlight position
  useEffect(() => {
    if (!isOpen) return;

    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [currentStepIndex, isOpen, step.targetId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished tutorial
      try {
        localStorage.setItem('chronostudy_tutorial_completed', 'true');
      } catch {}
      if (onComplete) {
        onComplete();
      } else {
        onClose();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden">
        {/* SEMI-TRANSPARENT BACKDROP WITH SPOTLIGHT HOLE IF TARGET RECT EXISTS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />

        {/* SPOTLIGHT GLOW EFFECT AROUND TARGET */}
        {targetRect && (
          <motion.div
            layoutId="spotlight-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              top: Math.max(10, targetRect.top - 8),
              left: Math.max(10, targetRect.left - 8),
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed pointer-events-none rounded-3xl border-2 border-[#D4F94E] shadow-[0_0_40px_rgba(212,249,78,0.4)] z-50"
          />
        )}

        {/* TUTORIAL DIALOG CARD */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 w-full max-w-md mx-4 bg-[#161922] text-white rounded-3xl p-6 shadow-2xl border border-zinc-700 overflow-hidden flex flex-col justify-between"
        >
          {/* BACKGROUND AMBIENT GLOW */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#D4F94E]/15 rounded-full blur-3xl pointer-events-none" />

          {/* TOP BAR: STEP COUNTER + CLOSE BUTTON */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#D4F94E] text-[#161922] rounded-md tracking-wider">
                {language === 'fr' ? 'Visite Guidée' : 'Interactive Tour'}
              </span>
              <span className="text-xs text-zinc-400 font-bold">
                {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Passer la visite"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CONTENT WITH ANIMATED 3D AVATAR */}
          <div className="py-5 flex items-start gap-4">
            <div className="shrink-0 flex flex-col items-center">
              <NovaAvatar3D expression={step.expression} size="lg" />
              <span className="mt-2 text-[10px] font-black text-[#D4F94E] uppercase tracking-wider">
                Nova AI
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                {language === 'fr' ? step.titleFr : step.titleEn}
              </h3>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-medium">
                {language === 'fr' ? step.descFr : step.descEn}
              </p>
            </div>
          </div>

          {/* STEP PROGRESS DOTS */}
          <div className="flex items-center justify-center gap-1.5 my-2">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#D4F94E]'
                    : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                currentStepIndex === 0
                  ? 'text-zinc-600 opacity-40 cursor-not-allowed'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'fr' ? 'Précédent' : 'Back'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Passer' : 'Skip'}
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#D4F94E] hover:bg-[#c2e83d] text-[#161922] font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isLastStep ? (language === 'fr' ? 'Commencer !' : 'Get Started!') : (language === 'fr' ? 'Suivant' : 'Next')}</span>
                {isLastStep ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
