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
import { AccountModal } from './components/AccountModal';
import { AuthModal } from './components/AuthModal';
import { LoginComponent } from './components/LoginComponent';
import { DeckBuilderStudio } from './components/DeckBuilderStudio';
import { StudyGroupsView } from './components/StudyGroupsView';
import { ThemeGalleryModal } from './components/ThemeGalleryModal';
import { ThemeProvider } from './context/ThemeContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { FeedbackDrawer } from './components/FeedbackDrawer';
import { DeepFocusBanner } from './components/DeepFocusBanner';
import { NovaTutorialOverlay } from './components/NovaTutorialOverlay';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_SUBJECT_METRICS } from './data/initialData';
import { Task } from './types';
import { useGamification } from './hooks/useGamification';
import { useStudyData } from './hooks/useStudyData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [worldClockModalOpen, setWorldClockModalOpen] = useState(false);
  const [themeGalleryOpen, setThemeGalleryOpen] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // Initial authentication gate / login screen at the start (au début)
  const [showInitialLogin, setShowInitialLogin] = useState<boolean>(() => {
    try {
      const isCompleted = localStorage.getItem('chronostudy_auth_completed');
      return isCompleted !== 'true';
    } catch {
      return true;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('chronostudy_auth_completed');
      localStorage.removeItem('chronostudy_auth_user');
    } catch {}
    const updated = {
      ...userSettings,
      auth: {
        isAuthenticated: false,
        isGuest: false,
      },
    };
    handleSaveUserSettings(updated as any);
    setShowInitialLogin(true);
  };

  // Deep Focus Mode State
  const [isDeepFocus, setIsDeepFocus] = useState(false);

  // Interactive Nova Tutorial Overlay State
  const [showTutorial, setShowTutorial] = useState(false);

  // Check tutorial status on initial load
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem('chronostudy_tutorial_completed');
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const handleCompleteTutorial = () => {
    try {
      localStorage.setItem('chronostudy_tutorial_completed', 'true');
    } catch {}
    setShowTutorial(false);
    handleAwardXP(50, 'Découverte de votre co-pilote Nova AI');
  };

  // Cross-Navigation states
  const [selectedDeckIdForStudy, setSelectedDeckIdForStudy] = useState<string | undefined>(undefined);
  const [selectedTaskForPomodoro, setSelectedTaskForPomodoro] = useState<Task | undefined>(undefined);

  // Gamification Hook
  const { userXP, xpToast, levelInfo, handleAwardXP } = useGamification();

  // Study Data & Storage Hook
  const {
    userSettings,
    handleToggleTheme,
    handleSaveUserSettings,
    tasks,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    decks,
    handleSaveDeck,
    handleDeleteDeck,
    documents,
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    subjects,
    setSubjects,
    handleAddToCourse,
    trashItems,
    handleSoftDeleteGeneralItem,
    handleRestoreTrashItem,
    handlePermanentDeleteTrashItem,
    handleEmptyTrash,
    logs,
    handleLogSession,
    worldClocks,
    setWorldClocks,
    studyGroups,
    handleCreateGroup,
    handleJoinGroup,
    handleShareDeckToGroup,
    handlePostGroupMessage,
    handleAddDocTrack,
    totalStudyMinutes,
  } = useStudyData(handleAwardXP);

  // Due flashcards calculation
  const dueFlashcardsCount = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => new Date(c.nextReviewDate) <= new Date()).length,
    0
  );

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <div className="app-root-container w-full h-screen bg-[#F5F6FA] dark:bg-black text-[#161922] dark:text-zinc-100 font-sans flex overflow-hidden transition-colors relative">
          {/* INTERACTIVE TUTORIAL OVERLAY */}
          <NovaTutorialOverlay
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleCompleteTutorial}
            onNavigateTab={setActiveTab}
          />

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
                      {levelInfo.title}
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
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
          />

          {/* AUTHENTICATION / LOGIN MODAL */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            userSettings={userSettings}
            onUpdateUserSettings={handleSaveUserSettings}
          />

          {/* INITIAL AUTHENTICATION SCREEN / LOGIN MODAL (AU DÉBUT) */}
          <AnimatePresence>
            {showInitialLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              >
                <div className="w-full max-w-md">
                  <LoginComponent
                    isInitialScreen={true}
                    userSettings={userSettings}
                    onUpdateUserSettings={handleSaveUserSettings}
                    onSuccess={() => {
                      setShowInitialLogin(false);
                      handleAwardXP(50, 'Connexion à votre espace ChronoStudy');
                    }}
                    onGuestMode={() => {
                      setShowInitialLogin(false);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* DESKTOP SIDEBAR (HIDDEN IN DEEP FOCUS) */}
          {!isDeepFocus && (
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
                onOpenAiChat={() => setActiveTab('dashboard')}
                userSettings={userSettings}
                userXP={userXP}
                trashCount={trashItems.length}
              />
            </div>
          )}

          {/* MOBILE SIDEBAR DRAWER OVERLAY */}
          {mobileNavOpen && !isDeepFocus && (
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
                    setActiveTab('dashboard');
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
            {/* TOP HEADER OR DEEP FOCUS BANNER */}
            {isDeepFocus ? (
              <DeepFocusBanner
                onExit={() => setIsDeepFocus(false)}
                activeTab={activeTab}
                onNavigateTab={setActiveTab}
                currentTaskTitle={selectedTaskForPomodoro?.title}
              />
            ) : (
              <Header
                totalStudyMinutes={totalStudyMinutes}
                streakDays={14}
                educationScore={94}
                dueFlashcardsCount={dueFlashcardsCount}
                userName={userSettings.profile.name}
                userInitials={userSettings.profile.avatarInitials}
                userAvatarUrl={userSettings.profile.avatarUrl}
                currentTheme={userSettings.system.theme}
                isDeepFocus={isDeepFocus}
                onToggleDeepFocus={() => setIsDeepFocus(true)}
                onOpenTutorial={() => setShowTutorial(true)}
                onToggleTheme={handleToggleTheme}
                onOpenMobileNav={() => setMobileNavOpen(true)}
                onOpenAccountModal={() => setAccountModalOpen(true)}
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onOpenWorldClock={() => setWorldClockModalOpen(true)}
                onOpenThemeGallery={() => setThemeGalleryOpen(true)}
                onNavigateTab={setActiveTab}
                onOpenAIChat={() => setActiveTab('dashboard')}
              />
            )}

            {/* MAIN VIEWPORT AREA */}
            <main className={`main-viewport flex-1 overflow-y-auto bg-[#F5F6FA] dark:bg-zinc-950 transition-all ${
              isDeepFocus ? 'p-4 md:p-8 max-w-5xl mx-auto w-full' : 'p-4 md:p-6'
            }`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full min-h-full"
                >
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      tasks={tasks}
                      decks={decks}
                      logs={logs}
                      documents={documents}
                      subjects={subjects}
                      levelTitle={levelInfo.title}
                      userXP={userXP}
                      subjectMetrics={INITIAL_SUBJECT_METRICS}
                      userSettings={userSettings}
                      onSaveUserSettings={handleSaveUserSettings}
                      onSaveDeck={handleSaveDeck}
                      onAddTask={handleAddTask}
                      onAddDocument={handleAddDocument}
                      onAwardXP={handleAwardXP}
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
                      onOpenAiChat={() => setActiveTab('dashboard')}
                      onOpenWorldClock={() => setWorldClockModalOpen(true)}
                    />
                  )}

                  {activeTab === 'subjects_courses' && (
                    <SubjectsCoursesView
                      subjects={subjects}
                      decks={decks}
                      documents={documents}
                      onAddDocument={handleAddDocument}
                      onUpdateSubjects={setSubjects}
                      onSelectDeckForStudy={(deck) => {
                        setSelectedDeckIdForStudy(deck.id);
                        setActiveTab('flashcards');
                      }}
                      onSoftDeleteItem={handleSoftDeleteGeneralItem}
                      onGenerateDeckFromDoc={() => {
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
                      onGenerateDeckFromDoc={() => {
                        setActiveTab('flashcards');
                      }}
                      onAddToAmbientSound={handleAddDocTrack}
                      onAddToCourse={handleAddToCourse}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* MOBILE FLOATING PILL NAVBAR */}
            {!isDeepFocus && (
              <div className="md:hidden">
                <Navbar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onQuickAdd={() => setActiveTab('tasks')}
                />
              </div>
            )}
          </div>

          {/* NOVA AI ASSISTANT DRAWER (CROSS-POLE CO-PILOT WITH VOICE & 3D AVATAR) */}
          <FeedbackDrawer
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
            tasks={tasks}
            onAddTask={handleAddTask}
            decks={decks}
            onSaveDeck={handleSaveDeck}
            documents={documents}
            onAddDocument={handleAddDocument}
            subjects={subjects}
            onAddToCourse={handleAddToCourse}
            onStartPomodoroWithTask={(taskId) => {
              const task = tasks.find((t) => t.id === taskId);
              setSelectedTaskForPomodoro(task);
              setActiveTab('pomodoro');
            }}
            onAwardXP={handleAwardXP}
            onOpenTutorial={() => setShowTutorial(true)}
          />
        </div>
      </FeedbackProvider>
    </ThemeProvider>
  );
}
