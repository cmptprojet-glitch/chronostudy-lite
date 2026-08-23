import { useState, useEffect, useCallback } from 'react';
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
} from '../types';
import {
  INITIAL_DECKS,
  INITIAL_TASKS,
  INITIAL_DOCUMENTS,
  INITIAL_SCHEDULE,
  INITIAL_LOGS,
  INITIAL_WIDGETS,
  INITIAL_GROUPS,
  DEFAULT_DASHBOARD_LAYOUT,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_WORLD_CLOCKS,
  INITIAL_ACADEMIC_SUBJECTS,
  INITIAL_TRASH_ITEMS,
} from '../data/initialData';
import { XP_RATES } from '../utils/gamification';

export function useStudyData(onAwardXP?: (amount: number, reason: string) => void) {
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

  // Clean up legacy keys once
  useEffect(() => {
    try {
      const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('lifeos_'));
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error cleaning legacy storage keys:', e);
    }
  }, []);

  const handleToggleTheme = useCallback(() => {
    setUserSettings((prev) => {
      const isCurrentlyDark = prev?.system?.theme === 'Sombre Concentré';
      const newTheme = isCurrentlyDark ? 'Clair Moderne' : 'Sombre Concentré';
      return {
        ...prev,
        system: {
          ...(prev?.system || DEFAULT_USER_SETTINGS.system),
          theme: newTheme,
        },
      };
    });
  }, []);

  const handleSaveUserSettings = useCallback((newSettings: UserSettings) => {
    setUserSettings(newSettings);
  }, []);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Decks
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_decks');
      return saved ? JSON.parse(saved) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  // Documents
  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_docs');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  // Subjects & Courses
  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_subjects');
      return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_SUBJECTS;
    } catch {
      return INITIAL_ACADEMIC_SUBJECTS;
    }
  });

  // Trash with 30-day retention
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_trash_items');
      return saved ? JSON.parse(saved) : INITIAL_TRASH_ITEMS;
    } catch {
      return INITIAL_TRASH_ITEMS;
    }
  });

  // Schedule & Logs
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

  // Journal & Clocks
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

  // Custom Widgets & Layout
  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_widgets');
      return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
    } catch {
      return INITIAL_WIDGETS;
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

  // Study Groups
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_groups');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  // Custom Ambient Document Audio Tracks
  const [customDocTracks, setCustomDocTracks] = useState<
    { id: string; title: string; text: string; soundType: 'rain' | 'binaural' | 'whitenoise'; docId: string }[]
  >([]);

  // 30-Day Trash Auto-Purge
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chronostudy_user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

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
    localStorage.setItem('chronostudy_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('chronostudy_trash_items', JSON.stringify(trashItems));
  }, [trashItems]);

  useEffect(() => {
    localStorage.setItem('chronostudy_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('chronostudy_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('chronostudy_journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('chronostudy_world_clocks', JSON.stringify(worldClocks));
  }, [worldClocks]);

  useEffect(() => {
    localStorage.setItem('chronostudy_widgets', JSON.stringify(customWidgets));
  }, [customWidgets]);

  useEffect(() => {
    localStorage.setItem('chronostudy_dashboard_layout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  useEffect(() => {
    localStorage.setItem('chronostudy_groups', JSON.stringify(studyGroups));
  }, [studyGroups]);

  // Tasks CRUD
  const handleAddTask = useCallback((newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Flashcards CRUD
  const handleSaveDeck = useCallback((deck: FlashcardDeck) => {
    setDecks((prev) => {
      const idx = prev.findIndex((d) => d.id === deck.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = deck;
        return next;
      }
      return [deck, ...prev];
    });
  }, []);

  const handleDeleteDeck = useCallback((deckId: string) => {
    setDecks((prev) => {
      const targetDeck = prev.find((d) => d.id === deckId);
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
        setTrashItems((t) => [trashItem, ...t]);
      }
      return prev.filter((d) => d.id !== deckId);
    });
  }, []);

  // Documents CRUD
  const handleAddDocument = useCallback((newDoc: StudyDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const handleUpdateDocument = useCallback((updatedDoc: StudyDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  }, []);

  const handleDeleteDocument = useCallback((docId: string) => {
    setDocuments((prev) => {
      const targetDoc = prev.find((d) => d.id === docId);
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
        setTrashItems((t) => [trashItem, ...t]);
      }
      return prev.filter((d) => d.id !== docId);
    });
  }, []);

  // Soft-Delete General Item
  const handleSoftDeleteGeneralItem = useCallback((item: {
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
  }, []);

  // Restore Trash Item
  const handleRestoreTrashItem = useCallback((trashId: string) => {
    setTrashItems((prev) => {
      const item = prev.find((t) => t.id === trashId);
      if (!item) return prev;

      if (item.type === 'deck') {
        setDecks((d) => [item.data, ...d]);
      } else if (item.type === 'document' || item.type === 'audio' || item.type === 'ai_file') {
        setDocuments((docs) => [item.data, ...docs]);
      } else if (item.type === 'course_chapter') {
        const targetSubId = item.data.subjectId;
        setSubjects((subs) =>
          subs.map((sub) => {
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
      return prev.filter((t) => t.id !== trashId);
    });
  }, []);

  const handlePermanentDeleteTrashItem = useCallback((trashId: string) => {
    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
  }, []);

  const handleEmptyTrash = useCallback(() => {
    setTrashItems([]);
  }, []);

  // Add to Course & Chapter
  const handleAddToCourse = useCallback((
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
  }, []);

  // Widgets CRUD
  const handleSaveWidget = useCallback((widget: CustomWidget) => {
    setCustomWidgets((prev) => {
      const exists = prev.some((w) => w.id === widget.id);
      if (exists) {
        return prev.map((w) => (w.id === widget.id ? widget : w));
      }
      return [widget, ...prev];
    });
  }, []);

  const handleToggleWidgetStatus = useCallback((widgetId: string) => {
    setCustomWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, enabledOnDashboard: !w.enabledOnDashboard } : w))
    );
  }, []);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    setCustomWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  }, []);

  // Session Logging
  const handleLogSession = useCallback((newLog: StudySessionLog) => {
    setLogs((prev) => [newLog, ...prev]);
    if (onAwardXP) {
      const xpGained =
        newLog.durationMinutes * XP_RATES.STUDY_MINUTE +
        (newLog.type === 'pomodoro' ? XP_RATES.POMODORO_SESSION : 0);
      onAwardXP(xpGained, `Session de focus terminée (${newLog.durationMinutes} min)`);
    }
  }, [onAwardXP]);

  // Study Groups Handlers
  const handleCreateGroup = useCallback((newGroup: StudyGroup) => {
    setStudyGroups((prev) => [newGroup, ...prev]);
  }, []);

  const handleJoinGroup = useCallback((groupCode: string): boolean => {
    let joined = false;
    setStudyGroups((prev) =>
      prev.map((g) => {
        if (g.code.toUpperCase() === groupCode.toUpperCase()) {
          joined = true;
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
    return joined;
  }, [userSettings?.profile.name, userSettings?.profile.avatarInitials]);

  const handleShareDeckToGroup = useCallback((groupId: string, deckId: string) => {
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
  }, [decks, userSettings?.profile.name, userSettings?.profile.avatarInitials]);

  const handlePostGroupMessage = useCallback((groupId: string, text: string) => {
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
  }, [userSettings?.profile.name, userSettings?.profile.avatarInitials]);

  // Audio track helpers
  const handleAddDocTrack = useCallback((audioTitle: string, docText: string) => {
    const trackId = `track-${Date.now()}`;
    const newTrack = {
      id: trackId,
      title: audioTitle.length > 22 ? `${audioTitle.slice(0, 22)}...` : audioTitle,
      text: docText,
      soundType: 'binaural' as const,
      docId: trackId,
    };
    setCustomDocTracks((prev) => [...prev, newTrack]);
  }, []);

  const handleRemoveDocTrack = useCallback((trackId: string) => {
    setCustomDocTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const totalStudyMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return {
    userSettings,
    setUserSettings,
    handleToggleTheme,
    handleSaveUserSettings,
    tasks,
    setTasks,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    decks,
    setDecks,
    handleSaveDeck,
    handleDeleteDeck,
    documents,
    setDocuments,
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    subjects,
    setSubjects,
    handleAddToCourse,
    trashItems,
    setTrashItems,
    handleSoftDeleteGeneralItem,
    handleRestoreTrashItem,
    handlePermanentDeleteTrashItem,
    handleEmptyTrash,
    schedule,
    setSchedule,
    logs,
    setLogs,
    handleLogSession,
    journalEntries,
    setJournalEntries,
    worldClocks,
    setWorldClocks,
    customWidgets,
    setCustomWidgets,
    handleSaveWidget,
    handleToggleWidgetStatus,
    handleDeleteWidget,
    dashboardLayout,
    setDashboardLayout,
    studyGroups,
    setStudyGroups,
    handleCreateGroup,
    handleJoinGroup,
    handleShareDeckToGroup,
    handlePostGroupMessage,
    customDocTracks,
    handleAddDocTrack,
    handleRemoveDocTrack,
    totalStudyMinutes,
  };
}
