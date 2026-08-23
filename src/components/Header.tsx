import React, { useState, useEffect } from 'react';
import { Search, Menu, Globe, Focus } from 'lucide-react';
import { TabType } from './Navbar';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedIcon } from './AnimatedIcon';

interface HeaderProps {
  totalStudyMinutes: number;
  streakDays: number;
  dueFlashcardsCount: number;
  educationScore?: number;
  userName?: string;
  userInitials?: string;
  userAvatarUrl?: string;
  currentTheme?: string;
  isDeepFocus?: boolean;
  onToggleDeepFocus?: () => void;
  onOpenTutorial?: () => void;
  onToggleTheme?: () => void;
  onOpenMobileNav?: () => void;
  onOpenAccountModal?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateTab?: (tab: TabType) => void;
  onOpenAIChat?: () => void;
  onOpenWorldClock?: () => void;
  onOpenThemeGallery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalStudyMinutes,
  streakDays,
  dueFlashcardsCount,
  educationScore = 92,
  userName = 'Julien Dupont',
  userInitials = 'JD',
  userAvatarUrl,
  currentTheme = 'Clair Moderne',
  isDeepFocus = false,
  onToggleDeepFocus,
  onOpenTutorial,
  onToggleTheme,
  onOpenMobileNav,
  onOpenAccountModal,
  onOpenAuthModal,
  onNavigateTab,
  onOpenAIChat,
  onOpenWorldClock,
  onOpenThemeGallery,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const firstName = userName.split(' ')[0] || 'Julien';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onOpenAIChat) onOpenAIChat();
  };

  return (
    <header className="header-themed h-16 bg-[#F5F6FA] dark:bg-zinc-950 px-4 md:px-6 flex items-center justify-between shrink-0 select-none transition-colors border-b border-slate-200/60 dark:border-zinc-800">
      {/* LEFT: WELCOME BACK GREETING WITH ANIMATED WAVE */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-2 text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-zinc-800 shadow-xs cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-extrabold text-[#161922] dark:text-white tracking-tight flex items-center gap-2 truncate">
            <span>{t('header.welcome')} {firstName}</span>
            <AnimatedIcon type="wave" className="w-5 h-5" />
          </h1>
        </div>
      </div>

      {/* RIGHT: SEARCH BAR, DEEP FOCUS, LANGUAGE TOGGLE, CLOCK, METRICS, AVATAR */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* SEARCH INPUT FIELD */}
        <form onSubmit={handleSearchSubmit} className="relative hidden xl:block">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('header.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 lg:w-52 pl-9 pr-4 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-[#161922] dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white transition-all shadow-xs"
          />
        </form>

        {/* DEEP FOCUS TOGGLE BUTTON */}
        {onToggleDeepFocus && (
          <button
            id="deep-focus-toggle-btn"
            onClick={onToggleDeepFocus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-xs cursor-pointer ${
              isDeepFocus
                ? 'bg-[#161922] text-[#D4F94E] border border-zinc-700'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 hover:bg-[#EFFDE2] dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
            }`}
            title="Activer le mode Deep Focus sans distraction"
          >
            <Focus className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#D4F94E]" />
            <span className="hidden sm:inline">Deep Focus</span>
          </button>
        )}

        {/* LANGUAGE TOGGLE BUTTON */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-900 hover:bg-[#EFFDE2] dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-extrabold text-[#161922] dark:text-white transition-all shadow-xs cursor-pointer group"
          title="Changer de langue (Français / English)"
        >
          <Globe className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#D4F94E] group-hover:rotate-45 transition-transform" />
          <span className="font-bold text-[11px]">{language.toUpperCase()}</span>
        </button>

        {/* WORLD CLOCK QUICK TRIGGER & LIVE DISPLAY */}
        {onOpenWorldClock && (
          <button
            onClick={onOpenWorldClock}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-[#EFFDE2] dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-full text-xs font-bold text-[#161922] dark:text-white transition-colors shadow-xs cursor-pointer group"
            title="Ouvrir le système d'Horloge Mondiale & Fuseaux"
          >
            <AnimatedIcon type="clock" className="w-3.5 h-3.5 text-[#65A30D]" />
            <span className="font-mono font-black">{liveTime || '12:00'}</span>
          </button>
        )}

        {/* STREAK & DUE CARDS METRICS */}
        <div className="hidden lg:flex items-center gap-2.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-1 text-xs font-black text-amber-500">
            <AnimatedIcon type="flame" className="w-3.5 h-3.5 text-orange-500" animateContinuous />
            <span>{streakDays}j</span>
          </div>
          <span className="w-1 h-3 bg-slate-200 dark:bg-zinc-700 rounded-full" />
          <div className="flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-300">
            <AnimatedIcon type="deck" className="w-3.5 h-3.5 text-blue-500" />
            <span>{dueFlashcardsCount} dues</span>
          </div>
        </div>

        {/* USER AVATAR & ACCOUNT / SETTINGS TRIGGER */}
        <button
          onClick={onOpenAccountModal}
          className="w-8 h-8 rounded-full bg-[#161922] text-white dark:bg-white dark:text-[#161922] font-black text-xs flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-xs hover:ring-2 hover:ring-[#D4F94E] transition-all cursor-pointer overflow-hidden shrink-0"
          title={t('header.profile')}
        >
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span>{userInitials}</span>
          )}
        </button>
      </div>
    </header>
  );
};
