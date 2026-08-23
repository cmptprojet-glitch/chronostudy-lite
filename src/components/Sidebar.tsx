import React, { useState } from 'react';
import { TabType } from './Navbar';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Timer,
  CheckSquare,
  FileText,
  Sparkles,
  Users,
  Settings,
  Zap,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Clock,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../types';
import { calculateLevel, XP_RATES } from '../utils/gamification';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedIcon } from './AnimatedIcon';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAiChat?: (initialMessage?: string) => void;
  onOpenAccountModal?: () => void;
  onOpenWorldClock?: () => void;
  onOpenThemeGallery?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userSettings?: UserSettings;
  userXP?: number;
  trashCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAccountModal,
  onOpenWorldClock,
  isCollapsed = false,
  onToggleCollapse,
  userSettings = DEFAULT_USER_SETTINGS,
  userXP = 450,
  trashCount = 0,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [showXpDetails, setShowXpDetails] = useState(false);
  const levelInfo = calculateLevel(userXP);

  // Modern, large & readable nav items
  const navItems: { id: TabType; labelKey: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'subjects_courses', labelKey: 'nav.subjects_courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'flashcards', labelKey: 'nav.flashcards', icon: <Layers className="w-5 h-5" /> },
    { id: 'documents', labelKey: 'nav.documents', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'tasks', labelKey: 'nav.tasks', icon: <CheckSquare className="w-5 h-5" />, badge: '3' },
    { id: 'pomodoro', labelKey: 'nav.pomodoro', icon: <Timer className="w-5 h-5" /> },
    { id: 'study_groups', labelKey: 'nav.study_groups', icon: <Users className="w-5 h-5" /> },
    { id: 'analytics', labelKey: 'nav.analytics', icon: <BarChart3 className="w-5 h-5" /> },
    {
      id: 'trash',
      labelKey: 'nav.trash',
      icon: <Trash2 className="w-5 h-5" />,
      badge: trashCount > 0 ? `${trashCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <aside
      className={`sidebar-themed bg-[#161922] text-white flex flex-col h-full shrink-0 select-none justify-between transition-all duration-300 border-r border-zinc-800 relative ${
        isCollapsed ? 'w-16 p-2 items-center' : 'w-64 p-4'
      }`}
    >
      {/* BRANDING LOGO & COLLAPSE TOGGLE */}
      <div className="space-y-4 w-full">
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2 pt-1' : 'justify-between px-1 pt-1 gap-1.5'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="sidebar-logo-box w-8 h-8 bg-[#D4F94E] text-[#161922] rounded-xl flex items-center justify-center font-black shadow-md shrink-0">
              <AnimatedIcon type="zap" size={16} className="text-[#161922]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-black text-sm tracking-tight text-white leading-tight truncate">
                  ChronoStudy
                </h1>
                <span className="text-[10px] text-zinc-400 font-bold block truncate tracking-wide">Cursus & Active Recall</span>
              </div>
            )}
          </div>

          {/* COLLAPSE ARROW & TOGGLE */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
              className="p-1.5 text-zinc-400 hover:text-[#D4F94E] hover:bg-zinc-800 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#D4F94E]" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* NAVIGATION LIST WITH LARGER TYPOGRAPHY (text-sm & font-extrabold) */}
        <nav className="flex flex-col space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5 w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? t(item.labelKey) : undefined}
                className={`sidebar-nav-item w-full rounded-2xl text-sm font-extrabold flex items-center transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 justify-between text-left'
                } ${
                  isActive
                    ? 'sidebar-nav-active bg-[#D4F94E] text-[#161922] shadow-sm font-black scale-101'
                    : 'text-[#8E95A5] hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                  <span className={`shrink-0 ${isActive ? 'text-[#161922]' : 'text-[#8E95A5]'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-black rounded-full shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-[#161922] text-[#D4F94E]' : 'bg-[#FF7A59] text-white')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM CARDS: XP PROGRESS & USER PROFILE */}
      <div className="space-y-2.5 pt-3 border-t border-zinc-800/80 w-full">
        {/* XP LEVEL & PROGRESS CARD */}
        {!isCollapsed ? (
          <div className="sidebar-xp-card bg-[#D4F94E] text-[#161922] rounded-2xl p-3 shadow-md relative overflow-hidden transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#161922] text-[#D4F94E] flex items-center justify-center text-xs font-black shrink-0">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-black leading-tight tracking-tight">
                    Niv. {levelInfo.level} • {levelInfo.title}
                  </p>
                  <p className="text-[9px] font-bold text-[#161922]/70">
                    {levelInfo.totalXP.toLocaleString()} XP Total
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowXpDetails(!showXpDetails)}
                className="w-5 h-5 rounded-full bg-[#161922]/10 hover:bg-[#161922]/20 flex items-center justify-center text-[10px] font-black cursor-pointer transition-colors"
                title="Détails des points XP"
              >
                <ArrowUpRight className="w-3 h-3 text-[#161922]" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black text-[#161922]/80">
                <span>Progression</span>
                <span>{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full bg-[#161922]/15 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#161922] rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Expandable XP details */}
            {showXpDetails && (
              <div className="mt-2 pt-2 border-t border-[#161922]/15 text-[9px] space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>⏱️ Focus Pomodoro</span>
                  <span className="font-black">+{XP_RATES.POMODORO_SESSION} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>✅ Tâche Finie</span>
                  <span className="font-black">+{XP_RATES.TASK_COMPLETED} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>📖 Entrée Journal</span>
                  <span className="font-black">+{XP_RATES.JOURNAL_ENTRY} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>📚 Flashcard</span>
                  <span className="font-black">+{XP_RATES.FLASHCARD_MEDIUM} XP</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            title={`Niv. ${levelInfo.level} (${levelInfo.totalXP} XP)`}
            className="w-10 h-10 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black text-sm mx-auto shadow-sm cursor-pointer"
            onClick={onOpenAccountModal}
          >
            ⚡
          </div>
        )}

        {/* USER PROFILE PILL */}
        <div
          onClick={onOpenAccountModal}
          title={isCollapsed ? (userSettings?.profile.name || 'Compte') : undefined}
          className={`flex items-center rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer group ${
            isCollapsed ? 'p-1.5 justify-center' : 'p-2.5 justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center font-black text-xs shrink-0 border border-zinc-600">
              {userSettings?.profile.avatarInitials || 'JD'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate leading-tight group-hover:text-[#D4F94E] transition-colors">
                  {userSettings?.profile.name || 'Julien Dupont'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate font-semibold">
                  {userSettings?.profile.role || 'Étudiant'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />}
        </div>
      </div>
    </aside>
  );
};
