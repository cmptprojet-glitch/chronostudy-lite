import React from 'react';
import { LayoutDashboard, Layers, BarChart3, Timer, CheckSquare, FileText, Bot, Sparkles, Plus, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type TabType =
  | 'dashboard'
  | 'subjects_courses'
  | 'flashcards'
  | 'deck_builder'
  | 'analytics'
  | 'pomodoro'
  | 'tasks'
  | 'documents'
  | 'ai_tutor'
  | 'study_groups'
  | 'trash';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onQuickAdd?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  const { currentTheme } = useTheme();
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Courses / Decks', icon: <Layers className="w-4 h-4" /> },
    { id: 'study_groups', label: 'Groups', icon: <Users className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Timer className="w-4 h-4" /> },
    { id: 'tasks', label: 'Assignments', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'documents', label: 'Docs IA', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'ai_tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
      <nav className="flex items-center gap-1 bg-[#161922] text-slate-300 backdrop-blur-2xl p-1.5 rounded-full border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={
                isActive
                  ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                  : undefined
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'font-black shadow-md scale-105'
                  : 'hover:text-white hover:bg-zinc-800/80 text-slate-400'
              }`}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}

        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            title="Création Rapide"
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="flex items-center justify-center w-8 h-8 ml-1 rounded-full font-black transition-transform hover:scale-110 active:scale-95 shadow-sm cursor-pointer hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </nav>
    </div>
  );
};
