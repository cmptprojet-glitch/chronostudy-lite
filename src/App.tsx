import React, { useState, useEffect } from 'react';
import { TabType, Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FlashcardsView } from './components/FlashcardsView';
import { AnalyticsView } from './components/AnalyticsView';
import { PomodoroView } from './components/PomodoroView';
import { TasksView } from './components/TasksView';
import { DocumentsView } from './components/DocumentsView';
import { SubjectsCoursesView } from './components/SubjectsCoursesView';
import { TrashModal } from './components/TrashModal';
import { WorldClockModal } from './components/WorldClockModal';
import { AIChatView } from './components/AIChatView';
import { AccountModal } from './components/AccountModal';
import { AuthModal } from './components/AuthModal';
import { DeckBuilderStudio } from './components/DeckBuilderStudio';
import { StudyGroupsView } from './components/StudyGroupsView';
import { ThemeGalleryModal } from './components/ThemeGalleryModal';
import { ThemeProvider } from './context/ThemeContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { FeedbackDrawer } from './components/FeedbackDrawer';
import { calculateLevel, calculateBaselineXP, XP_RATES } from './utils/gamification';
import { Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import {
  INITIAL_DECKS,
  INITIAL_TASKS,
  INITIAL_DOCUMENTS,
  INITIAL_SCHEDULE,
  INITIAL_LOGS,
  INITIAL_SUBJECT_METRICS,
  INITIAL_WIDGETS,
  INITIAL_GROUPS,
  DEFAULT_DASHBOARD_LAYOUT,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_WORLD_CLOCKS,
  INITIAL_ACADEMIC_SUBJECTS,
  INITIAL_TRASH_ITEMS,
} from './data/initialData';

import {
  FlashcardDeck,
  Task,
  StudyDocument,
  ScheduleSession,
  StudySessionLog,
  UserSettings,
  DEFAULT_USER_SETTINGS,
  CustomWidget,
  StudyGroup,
  DashboardWidgetConfig,
  JournalEntry,
  WorldClockCity,
  AcademicSubject,
  CourseChapter,
  CourseDocumentItem,
  TrashItem,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [worldClockModalOpen, setWorldClockModalOpen] = useState(false);
  const [themeGalleryOpen, setThemeGalleryOpen] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_user_settings');
      if (!saved) return DEFAULT_USER_SETTINGS;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_USER_SETTINGS,
        ...parsed,
        profile: { ...DEFAULT_USER_SETTINGS.profile, ...(parsed.profile || {}) },
        integrations: { ...DEFAULT_USER_SETTINGS.integrations, ...(parsed.integrations || {}) },
        system: { ...DEFAULT_USER_SETTINGS.system, ...(parsed.system || {}) },
      };
    } catch (e) {
      console.error('Error loading userSettings from localStorage:', e);
      return DEFAULT_USER_SETTINGS;
    }
  });

  // Dark mode effect
  useEffect(() => {
    const isDark = userSettings?.system?.theme === 'Sombre Concentré';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings?.system?.theme]);

  // Clean up legacy lifeos_ keys once on mount
  useEffect(() => {
    try {
      const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('lifeos_'));
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error cleaning legacy storage keys:', e);
    }
  }, []);

  const handleToggleTheme = () => {
    const isCurrentlyDark = userSettings?.system?.theme === 'Sombre Concentré';
    const newTheme = isCurrentlyDark ? 'Clair Moderne' : 'Sombre Concentré';
    const updated: UserSettings = {
      ...userSettings,
      system: {
        ...(userSettings?.system || DEFAULT_USER_SETTINGS.system),
        theme: newTheme,
      },
    };
    setUserSettings(updated);
  };

  // Persistent States with local Storage fallback
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_decks');
      return saved ? JSON.parse(saved) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_docs');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_subjects');
      return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_SUBJECTS;
    } catch {
      return INITIAL_ACADEMIC_SUBJECTS;
    }
  });

  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_trash_items');
      return saved ? JSON.parse(saved) : INITIAL_TRASH_ITEMS;
    } catch {
      return INITIAL_TRASH_ITEMS;
    }
  });

  const [schedule, setSchedule] = useState<ScheduleSession[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  const [logs, setLogs] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_journal_entries');
      return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
    } catch {
      return INITIAL_JOURNAL_ENTRIES;
    }
  });

  const [worldClocks, setWorldClocks] = useState<WorldClockCity[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_world_clocks');
      return saved ? JSON.parse(saved) : INITIAL_WORLD_CLOCKS;
    } catch {
      return INITIAL_WORLD_CLOCKS;
    }
  });

  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_widgets');
      return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
    } catch {
      return INITIAL_WIDGETS;
    }
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_dashboard_layout');
      return saved ? JSON.parse(saved) : DEFAULT_DASHBOARD_LAYOUT;
    } catch {
      return DEFAULT_DASHBOARD_LAYOUT;
    }
  });

  // 30-DAY TRASH AUTO PURGE EFFECT: Items older than 30 days are purged permanently
  useEffect(() => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    setTrashItems((prev) =>
      prev.filter((item) => {
        const itemTime = new Date(item.deletedAt).getTime();
        return now - itemTime < thirtyDaysMs;
      })
    );
  }, []);

  // Experience Points (XP) Gamification State
  const [userXP, setUserXP] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_user_xp');
      if (saved !== null && !isNaN(Number(saved))) return Number(saved);
      return calculateBaselineXP(INITIAL_LOGS, INITIAL_TASKS, INITIAL_DECKS);
    } catch {
      return calculateBaselineXP(INITIAL_LOGS, INITIAL_TASKS, INITIAL_DECKS);
    }
  });

  const [xpToast, setXpToast] = useState<{ id: number; amount: number; reason: string } | null>(null);

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

  const handleAwardXP = (amount: number, reason: string) => {
    if (amount <= 0) return;
    setUserXP((prevXP) => {
      const oldLevelInfo = calculateLevel(prevXP);
      const newXP = prevXP + amount;
      const newLevelInfo = calculateLevel(newXP);

      if (newLevelInfo.level > oldLevelInfo.level) {
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.5 } });
      }

      setXpToast({ id: Date.now(), amount, reason });
      return newXP;
    });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('chronostudy_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('chronostudy_trash_items', JSON.stringify(trashItems));
  }, [trashItems]);

  useEffect(() => {
    localStorage.setItem('chronostudy_journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('chronostudy_world_clocks', JSON.stringify(worldClocks));
  }, [worldClocks]);

  useEffect(() => {
    localStorage.setItem('chronostudy_dashboard_layout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  useEffect(() => {
    localStorage.setItem('chronostudy_groups', JSON.stringify(studyGroups));
  }, [studyGroups]);

  useEffect(() => {
    localStorage.setItem('chronostudy_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chronostudy_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('chronostudy_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('chronostudy_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('chronostudy_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('chronostudy_widgets', JSON.stringify(customWidgets));
  }, [customWidgets]);

  useEffect(() => {
    localStorage.setItem('chronostudy_user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Study Group Handlers
  const handleCreateGroup = (newGroup: StudyGroup) => {
    setStudyGroups((prev) => [newGroup, ...prev]);
  };

  const handleJoinGroup = (groupCode: string): boolean => {
    const target = studyGroups.find((g) => g.code.toUpperCase() === groupCode.toUpperCase());
    if (!target) return false;

    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id === target.id) {
          if (g.isUserMember) return g;
          const userMember = {
            id: 'm-user',
            name: `${userSettings?.profile.name || 'Julien Dupont'} (Vous)`,
            avatar: userSettings?.profile.avatarInitials || 'JD',
            role: 'member' as const,
            studyMinutesThisWeek: 320,
            cardsMastered: 45,
            currentStreak: 12,
            status: 'online' as const,
            joinedAt: new Date().toISOString().split('T')[0],
          };
          const newActivity = {
            id: `act-${Date.now()}`,
            userName: `${userSettings?.profile.name || 'Julien Dupont'}`,
            userAvatar: userSettings?.profile.avatarInitials || 'JD',
            type: 'joined' as const,
            content: 'a rejoint le groupe de révision !',
            timestamp: 'À l\'instant',
          };
          return {
            ...g,
            isUserMember: true,
            members: [...g.members, userMember],
            activityFeed: [newActivity, ...g.activityFeed],
          };
        }
        return g;
      })
    );
    return true;
  };

  const handleShareDeckToGroup = (groupId: string, deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newSharedDeck = {
            id: `shared-${Date.now()}`,
            title: deck.title,
            subject: deck.subject,
            description: deck.description || 'Deck partagé',
            cardCount: deck.cards.length,
            color: deck.color || '#6366f1',
            sharedBy: `${userSettings?.profile.name || 'Julien Dupont'}`,
            sharedByAvatar: userSettings?.profile.avatarInitials || 'JD',
            downloads: 0,
            likes: 0,
            cards: deck.cards.map((c) => ({ question: c.question, answer: c.answer })),
          };
          const newActivity = {
            id: `act-${Date.now()}`,
            userName: `${userSettings?.profile.name || 'Julien Dupont'}`,
            userAvatar: userSettings?.profile.avatarInitials || 'JD',
            type: 'deck_shared' as const,
            content: `a partagé le deck "${deck.title}" (${deck.cards.length} cartes)`,
            timestamp: 'À l\'instant',
            deckTitle: deck.title,
            deckId: deck.id,
          };
          return {
            ...g,
            sharedDecks: [newSharedDeck, ...g.sharedDecks],
            activityFeed: [newActivity, ...g.activityFeed],
          };
        }
        return g;
      })
    );
  };

  const handlePostGroupMessage = (groupId: string, text: string) => {
    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            userId: 'm-user',
            userName: `${userSettings?.profile.name || 'Julien Dupont'}`,
            userAvatar: userSettings?.profile.avatarInitials || 'JD',
            userRole: 'Membre',
            content: text,
            timestamp: 'À l\'instant',
            likes: 0,
          };
          return {
            ...g,
            messages: [...(g.messages || []), newMsg],
          };
        }
        return g;
      })
    );
  };

  // Cross-Navigation & Selected entity states
  const [selectedDeckIdForStudy, setSelectedDeckIdForStudy] = useState<string | undefined>(undefined);
  const [selectedTaskForPomodoro, setSelectedTaskForPomodoro] = useState<Task | undefined>(undefined);

  // Custom Audio tracks added from Documents View
  const [customDocTracks, setCustomDocTracks] = useState<
    { id: string; title: string; text: string; soundType: 'rain' | 'binaural' | 'whitenoise'; docId: string }[]
  >([]);

  const handleAddDocTrack = (audioTitle: string, docText: string) => {
    const trackId = `track-${Date.now()}`;
    const newTrack = {
      id: trackId,
      title: audioTitle.length > 22 ? `${audioTitle.slice(0, 22)}...` : audioTitle,
      text: docText,
      soundType: 'binaural' as const,
      docId: trackId,
    };
    setCustomDocTracks((prev) => [...prev, newTrack]);
  };

  const handleRemoveDocTrack = (trackId: string) => {
    setCustomDocTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Total Study Minutes Calculation
  const totalStudyMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Flashcards CRUD
  const handleSaveDeck = (deck: FlashcardDeck) => {
    setDecks((prev) => {
      const idx = prev.findIndex((d) => d.id === deck.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = deck;
        return next;
      }
      return [deck, ...prev];
    });
  };

  // SOFT-DELETE DECK (Moves to 30-day Trash)
  const handleDeleteDeck = (deckId: string) => {
    const targetDeck = decks.find((d) => d.id === deckId);
    if (targetDeck) {
      const trashItem: TrashItem = {
        id: `trash-${Date.now()}`,
        originalId: targetDeck.id,
        type: 'deck',
        title: targetDeck.title,
        subject: targetDeck.subject,
        deletedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        fileCategory: 'deck',
        data: targetDeck,
      };
      setTrashItems((prev) => [trashItem, ...prev]);
    }
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  // SOFT-DELETE DOCUMENT (Moves to 30-day Trash)
  const handleDeleteDocument = (docId: string) => {
    const targetDoc = documents.find((d) => d.id === docId);
    if (targetDoc) {
      const trashItem: TrashItem = {
        id: `trash-${Date.now()}`,
        originalId: targetDoc.id,
        type: targetDoc.fileCategory === 'audio' ? 'audio' : targetDoc.isAiGenerated ? 'ai_file' : 'document',
        title: targetDoc.name,
        subject: targetDoc.subject,
        deletedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        fileCategory: targetDoc.fileCategory,
        data: targetDoc,
      };
      setTrashItems((prev) => [trashItem, ...prev]);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // SOFT-DELETE GENERAL ITEM (From Courses/Chapters)
  const handleSoftDeleteGeneralItem = (item: {
    originalId: string;
    type: 'document' | 'deck' | 'audio' | 'course_chapter';
    title: string;
    subject?: string;
    data: any;
    fileCategory?: 'pdf' | 'audio' | 'text' | 'ia_generated' | 'deck';
  }) => {
    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      originalId: item.originalId,
      type: item.type,
      title: item.title,
      subject: item.subject,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      fileCategory: item.fileCategory,
      data: item.data,
    };
    setTrashItems((prev) => [trashItem, ...prev]);
  };

  // RESTORE ITEM FROM TRASH
  const handleRestoreTrashItem = (trashId: string) => {
    const item = trashItems.find((t) => t.id === trashId);
    if (!item) return;

    if (item.type === 'deck') {
      setDecks((prev) => [item.data, ...prev]);
    } else if (item.type === 'document' || item.type === 'audio' || item.type === 'ai_file') {
      setDocuments((prev) => [item.data, ...prev]);
    } else if (item.type === 'course_chapter') {
      // Re-insert into subject if subject exists
      const targetSubId = item.data.subjectId;
      setSubjects((prev) =>
        prev.map((sub) => {
          if (sub.id === targetSubId) {
            return {
              ...sub,
              chapters: sub.chapters.map((chap) => {
                if (chap.id === item.data.chapterId) {
                  return {
                    ...chap,
                    documents: [item.data, ...chap.documents],
                  };
                }
                return chap;
              }),
            };
          }
          return sub;
        })
      );
    }

    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
  };

  // PERMANENT DELETE ITEM FROM TRASH
  const handlePermanentDeleteTrashItem = (trashId: string) => {
    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
  };

  // EMPTY ALL TRASH
  const handleEmptyTrash = () => {
    setTrashItems([]);
  };

  // ADD TO COURSE & CHAPTER HANDLER
  const handleAddToCourse = (
    subjectId: string,
    chapterId: string,
    docItem: CourseDocumentItem,
    newChapterTitle?: string
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          if (chapterId === 'new' && newChapterTitle) {
            const newChapter: CourseChapter = {
              id: `chap-${Date.now()}`,
              title: newChapterTitle,
              description: `Chapitre créé pour ${docItem.title}`,
              order: sub.chapters.length + 1,
              documents: [docItem],
              deckIds: [],
              completed: false,
            };
            return {
              ...sub,
              chapters: [...sub.chapters, newChapter],
            };
          } else {
            return {
              ...sub,
              chapters: sub.chapters.map((chap) => {
                if (chap.id === chapterId) {
                  return {
                    ...chap,
                    documents: [docItem, ...chap.documents],
                  };
                }
                return chap;
              }),
            };
          }
        }
        return sub;
      })
    );
  };

  // Custom Widgets CRUD
  const handleSaveWidget = (widget: CustomWidget) => {
    setCustomWidgets((prev) => {
      const exists = prev.some((w) => w.id === widget.id);
      if (exists) {
        return prev.map((w) => (w.id === widget.id ? widget : w));
      }
      return [widget, ...prev];
    });
  };

  const handleToggleWidgetStatus = (widgetId: string) => {
    setCustomWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, enabledOnDashboard: !w.enabledOnDashboard } : w))
    );
  };

  const handleDeleteWidget = (widgetId: string) => {
    setCustomWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  // User Settings Update
  const handleSaveUserSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
  };

  // Tasks CRUD
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Document Handler Functions
  const handleAddDocument = (newDoc: StudyDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleUpdateDocument = (updatedDoc: StudyDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  };

  // Log Pomodoro Session & Award XP
  const handleLogSession = (newLog: StudySessionLog) => {
    setLogs((prev) => [newLog, ...prev]);
    const xpGained =
      newLog.durationMinutes * XP_RATES.STUDY_MINUTE +
      (newLog.type === 'pomodoro' ? XP_RATES.POMODORO_SESSION : 0);
    handleAwardXP(xpGained, `Session de focus terminée (${newLog.durationMinutes} min)`);
  };

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <div className="app-root-container w-full h-screen bg-[#F5F6FA] dark:bg-black text-[#161922] dark:text-zinc-100 font-sans flex overflow-hidden transition-colors relative">
          {/* FLOATING XP TOAST NOTIFICATION */}
          {xpToast && (
            <div
              id="xp-gain-toast"
              className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none"
            >
              <div className="bg-[#161922] text-white px-4 py-3 rounded-2xl border border-zinc-800 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shrink-0 shadow-md">
                  <Zap className="w-5 h-5 fill-[#161922] text-[#161922]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#D4F94E]">
                      +{xpToast.amount} XP
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded font-bold uppercase">
                      {calculateLevel(userXP).title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    {xpToast.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* THEME GALLERY MODAL (3 THEMES) */}
          <ThemeGalleryModal
            isOpen={themeGalleryOpen}
            onClose={() => setThemeGalleryOpen(false)}
            isDarkMode={userSettings.system.theme === 'Sombre Concentré'}
            onToggleDarkMode={handleToggleTheme}
          />

          {/* ACCOUNT & INTEGRATIONS MODAL */}
          <AccountModal
            isOpen={accountModalOpen}
            onClose={() => setAccountModalOpen(false)}
            userSettings={userSettings}
            onSaveSettings={handleSaveUserSettings}
            onOpenThemeGallery={() => setThemeGalleryOpen(true)}
          />

          {/* AUTHENTICATION / LOGIN MODAL */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            userSettings={userSettings}
            onUpdateUserSettings={handleSaveUserSettings}
          />

          {/* TRASH 30-DAY RETENTION MODAL */}
          <TrashModal
            isOpen={showTrashModal || activeTab === 'trash'}
            onClose={() => {
              setShowTrashModal(false);
              if (activeTab === 'trash') setActiveTab('dashboard');
            }}
            trashItems={trashItems}
            onRestoreItem={handleRestoreTrashItem}
            onPermanentDeleteItem={handlePermanentDeleteTrashItem}
            onEmptyTrash={handleEmptyTrash}
          />

          {/* WORLD CLOCK MODAL */}
          <WorldClockModal
            isOpen={worldClockModalOpen}
            onClose={() => setWorldClockModalOpen(false)}
            clocks={worldClocks}
            onUpdateClocks={setWorldClocks}
          />

          {/* DESKTOP HIGH DENSITY SIDEBAR */}
          <div className="hidden md:flex shrink-0 h-full">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                if (tab === 'trash') {
                  setShowTrashModal(true);
                } else {
                  setActiveTab(tab);
                }
              }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              onOpenAccountModal={() => setAccountModalOpen(true)}
              onOpenWorldClock={() => setWorldClockModalOpen(true)}
              onOpenThemeGallery={() => setThemeGalleryOpen(true)}
              onOpenAiChat={(msg) => {
                setActiveTab('ai_tutor');
              }}
              userSettings={userSettings}
              userXP={userXP}
              trashCount={trashItems.length}
            />
          </div>

          {/* MOBILE SIDEBAR DRAWER OVERLAY */}
          {mobileNavOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden flex">
              <div className="w-64 bg-white dark:bg-zinc-950 h-full shadow-2xl relative">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={(tab) => {
                    if (tab === 'trash') {
                      setShowTrashModal(true);
                    } else {
                      setActiveTab(tab);
                    }
                    setMobileNavOpen(false);
                  }}
                  onOpenAccountModal={() => {
                    setMobileNavOpen(false);
                    setAccountModalOpen(true);
                  }}
                  onOpenWorldClock={() => {
                    setMobileNavOpen(false);
                    setWorldClockModalOpen(true);
                  }}
                  onOpenThemeGallery={() => {
                    setMobileNavOpen(false);
                    setThemeGalleryOpen(true);
                  }}
                  onOpenAiChat={() => {
                    setActiveTab('ai_tutor');
                    setMobileNavOpen(false);
                  }}
                  userSettings={userSettings}
                  userXP={userXP}
                  trashCount={trashItems.length}
                />
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="absolute top-4 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
            </div>
          )}

          {/* RIGHT MAIN WORKSPACE COLUMN */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {/* TOP HIGH DENSITY HEADER */}
            <Header
              totalStudyMinutes={totalStudyMinutes}
              streakDays={14}
              educationScore={94}
              dueFlashcardsCount={decks.reduce(
                (acc, d) => acc + d.cards.filter((c) => new Date(c.nextReviewDate) <= new Date()).length,
                0
              )}
              userName={userSettings.profile.name}
              userInitials={userSettings.profile.avatarInitials}
              userAvatarUrl={userSettings.profile.avatarUrl}
              currentTheme={userSettings.system.theme}
              onToggleTheme={handleToggleTheme}
              onOpenMobileNav={() => setMobileNavOpen(true)}
              onOpenAccountModal={() => setAccountModalOpen(true)}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onOpenWorldClock={() => setWorldClockModalOpen(true)}
              onOpenThemeGallery={() => setThemeGalleryOpen(true)}
              onNavigateTab={setActiveTab}
              onOpenAIChat={() => setActiveTab('ai_tutor')}
            />

            {/* MAIN VIEWPORT AREA */}
            <main className="main-viewport flex-1 p-4 md:p-6 overflow-y-auto bg-[#F5F6FA] dark:bg-zinc-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full min-h-full"
                >
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      tasks={tasks}
                      decks={decks}
                      logs={logs}
                      subjectMetrics={INITIAL_SUBJECT_METRICS}
                      setActiveTab={setActiveTab}
                      onStartPomodoroWithTask={(taskId) => {
                        const task = tasks.find((t) => t.id === taskId);
                        setSelectedTaskForPomodoro(task);
                        setActiveTab('pomodoro');
                      }}
                      onOpenDeck={(deckId) => {
                        setSelectedDeckIdForStudy(deckId);
                        setActiveTab('flashcards');
                      }}
                      onOpenAiChat={() => setActiveTab('ai_tutor')}
                      onOpenWorldClock={() => setWorldClockModalOpen(true)}
                    />
                  )}

                  {activeTab === 'subjects_courses' && (
                    <SubjectsCoursesView
                      subjects={subjects}
                      decks={decks}
                      onUpdateSubjects={setSubjects}
                      onSelectDeckForStudy={(deck) => {
                        setSelectedDeckIdForStudy(deck.id);
                        setActiveTab('flashcards');
                      }}
                      onSoftDeleteItem={handleSoftDeleteGeneralItem}
                      onGenerateDeckFromDoc={(doc) => {
                        setActiveTab('flashcards');
                      }}
                    />
                  )}

                  {activeTab === 'flashcards' && (
                    <FlashcardsView
                      decks={decks}
                      onSaveDeck={handleSaveDeck}
                      onDeleteDeck={handleDeleteDeck}
                      selectedDeckId={selectedDeckIdForStudy}
                      onOpenDeckBuilder={() => setActiveTab('deck_builder')}
                      onAwardXP={handleAwardXP}
                    />
                  )}

                  {activeTab === 'study_groups' && (
                    <StudyGroupsView
                      groups={studyGroups}
                      userDecks={decks}
                      userSettings={userSettings}
                      onCreateGroup={handleCreateGroup}
                      onJoinGroup={handleJoinGroup}
                      onShareDeckToGroup={handleShareDeckToGroup}
                      onImportDeck={handleSaveDeck}
                      onPostMessage={handlePostGroupMessage}
                    />
                  )}

                  {activeTab === 'deck_builder' && (
                    <DeckBuilderStudio
                      onSaveDeck={handleSaveDeck}
                      setActiveTab={setActiveTab}
                      onOpenDeck={(deckId) => {
                        setSelectedDeckIdForStudy(deckId);
                        setActiveTab('flashcards');
                      }}
                    />
                  )}

                  {activeTab === 'analytics' && (
                    <AnalyticsView
                      logs={logs}
                      subjectMetrics={INITIAL_SUBJECT_METRICS}
                      tasks={tasks}
                      decks={decks}
                      documents={documents}
                    />
                  )}

                  {activeTab === 'pomodoro' && (
                    <PomodoroView
                      tasks={tasks}
                      onLogSession={handleLogSession}
                      selectedTaskId={selectedTaskForPomodoro?.id}
                      onAwardXP={handleAwardXP}
                    />
                  )}

                  {activeTab === 'tasks' && (
                    <TasksView
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                      onStartPomodoro={(task) => {
                        setSelectedTaskForPomodoro(task);
                        setActiveTab('pomodoro');
                      }}
                      onAwardXP={handleAwardXP}
                    />
                  )}

                  {activeTab === 'documents' && (
                    <DocumentsView
                      documents={documents}
                      subjects={subjects}
                      onAddDocument={handleAddDocument}
                      onUpdateDocument={handleUpdateDocument}
                      onDeleteDocument={handleDeleteDocument}
                      onGenerateDeckFromDoc={(doc) => {
                        setActiveTab('flashcards');
                      }}
                      onAddToAmbientSound={handleAddDocTrack}
                      onAddToCourse={handleAddToCourse}
                    />
                  )}

                  {activeTab === 'ai_tutor' && (
                    <AIChatView
                      tasks={tasks}
                      documents={documents}
                      reviewedCardsCount={decks.reduce(
                        (acc, d) => acc + d.cards.reduce((sum, c) => sum + c.reviewCount, 0),
                        0
                      )}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* MOBILE FLOATING PILL NAVBAR */}
            <div className="md:hidden">
              <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onQuickAdd={() => setActiveTab('tasks')}
              />
            </div>
          </div>

          {/* FEEDBACK & ANNOTATION DRAWER */}
          <FeedbackDrawer />
        </div>
      </FeedbackProvider>
    </ThemeProvider>
  );
}
