import React from 'react';
import { motion } from 'motion/react';
import { Minimize2, Sparkles, Clock, Volume2, VolumeX, Eye, Flame, BookOpen, Layers, CheckSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TabType } from './Navbar';

interface DeepFocusBannerProps {
  onExit: () => void;
  activeTab?: TabType;
  onNavigateTab?: (tab: TabType) => void;
  currentTaskTitle?: string;
  activeTabTitle?: string;
  activeTime?: string;
}

export const DeepFocusBanner: React.FC<DeepFocusBannerProps> = ({
  onExit,
  activeTab = 'dashboard',
  onNavigateTab,
  currentTaskTitle,
  activeTabTitle,
  activeTime,
}) => {
  const { language } = useLanguage();

  const getDisplayTitle = () => {
    if (currentTaskTitle) return currentTaskTitle;
    if (activeTabTitle) return activeTabTitle;
    switch (activeTab) {
      case 'pomodoro':
        return language === 'fr' ? 'Session Pomodoro en cours' : 'Active Pomodoro Session';
      case 'flashcards':
        return language === 'fr' ? 'Étude Flashcards & Mémorisation' : 'Flashcard Recall Session';
      case 'documents':
        return language === 'fr' ? 'Lecture de Document Sans Distraction' : 'Distraction-Free Reading';
      case 'tasks':
        return language === 'fr' ? 'Exécution des Tâches Prioritaires' : 'Priority Tasks Execution';
      default:
        return language === 'fr' ? 'Espace de Concentration Maximale' : 'Deep Concentration Workspace';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full bg-[#161922]/95 backdrop-blur-md text-white border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between shadow-lg select-none"
    >
      {/* LEFT: DEEP FOCUS STATUS & PULSING BADGE */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#D4F94E]/10 border border-[#D4F94E]/30 px-2.5 py-1 rounded-full text-xs font-black text-[#D4F94E]">
          <span className="w-2 h-2 rounded-full bg-[#D4F94E] animate-ping" />
          <span>{language === 'fr' ? 'DEEP FOCUS ACTIF' : 'DEEP FOCUS ACTIVE'}</span>
        </div>
        <span className="hidden sm:inline-block text-xs font-bold text-zinc-300 truncate max-w-xs md:max-w-md">
          {getDisplayTitle()}
        </span>
      </div>

      {/* RIGHT: SHORTCUT REMINDER & EXIT BUTTON */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-block text-[11px] text-zinc-400 font-medium">
          {language === 'fr' ? 'Mode sans distraction activé' : 'Distraction-free mode enabled'}
        </span>

        <button
          onClick={onExit}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
          title={language === 'fr' ? 'Quitter le mode Deep Focus' : 'Exit Deep Focus Mode'}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Quitter Focus' : 'Exit Focus'}</span>
        </button>
      </div>
    </motion.div>
  );
};

