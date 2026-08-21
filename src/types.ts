export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  subtasks: SubTask[];
  createdAt: string;
  dueDate?: string;
}

export type CardType = 'classic' | 'qcm' | 'cloze' | 'true_false' | 'code' | 'ordering' | 'matching';

export interface FlashcardOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  type?: CardType;
  options?: FlashcardOption[];
  isTrue?: boolean; // for true_false
  orderItems?: string[]; // for ordering sequence
  matchPairs?: MatchPair[]; // for matching items
  hint?: string;
  explanation?: string;
  codeLanguage?: string;
  intervalDays: number;
  easinessFactor: number;
  nextReviewDate: string; // ISO date string
  lastEvaluated?: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  tags?: string[];
}

export interface DeckAttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  content?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  description: string;
  color: string;
  icon?: string;
  difficulty?: 'Facile' | 'Moyen' | 'Avancé' | 'Expert';
  tags?: string[];
  cards: Flashcard[];
  attachedFiles?: DeckAttachedFile[];
  createdAt: string;
  settings?: {
    retentionGoal?: number;
    initialInterval?: number;
    maxNewCardsPerDay?: number;
    algorithm?: 'sm2' | 'anki_standard' | 'fsrs';
  };
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  subject: string;
  taskId?: string;
  type: 'pomodoro' | 'manual' | 'flashcards';
}

export interface StudyDocument {
  id: string;
  name: string;
  size: number;
  type: string; // 'application/pdf' | 'text/plain' | 'audio/mpeg' | 'text/markdown' | etc.
  uploadDate: string;
  content: string;
  subject?: string;
  chapter?: string;
  fileCategory?: 'pdf' | 'audio' | 'text' | 'ia_generated' | 'folder' | 'spreadsheet' | 'code';
  audioUrl?: string;
  folderId?: string;
  tags?: string[];
  isAiGenerated?: boolean;
  aiAnalysis?: {
    summary: string;
    keyConcepts: string[];
    formulasAndDefs: string[];
    studySuggestions: string[];
    generatedAt: string;
  };
}

export type TrashItemType = 'deck' | 'document' | 'audio' | 'course_chapter' | 'ai_file';

export interface TrashItem {
  id: string;
  originalId: string;
  type: TrashItemType;
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  fileCategory?: 'pdf' | 'audio' | 'text' | 'ia_generated' | 'deck' | 'folder' | 'code' | 'spreadsheet';
  size?: number;
  data: any;
  deletedAt: string; // ISO date string
  expiresAt?: string; // ISO date string
}

export interface CourseDocumentItem {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'audio' | 'ia_summary' | 'slides' | 'notes';
  fileName?: string;
  fileSize?: number;
  audioUrl?: string;
  addedAt: string;
  tags?: string[];
}

export interface CourseChapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  documents: CourseDocumentItem[];
  deckIds?: string[]; // flashcard decks linked to this chapter
  completed?: boolean;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code?: string;
  category: 'Scientifique' | 'Littéraire' | 'Sciences Humaines' | 'Langues' | 'Autre';
  color: string;
  icon?: string;
  enabled: boolean;
  targetWeeklyHours?: number;
  chapters: CourseChapter[];
}

export interface ScheduleSession {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  timeSlot: 'Matin' | 'Après-midi' | 'Soir';
  subject: string;
  topic: string;
  durationMinutes: number;
  completed: boolean;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isQuiz?: boolean;
}

export interface SubjectMetric {
  subject: string;
  hours: number;
  color: string;
  masteryPercentage: number;
}

export interface DailyProductivityScore {
  date: string;
  score: number; // 0-100
  tasksCompleted: number;
  pomodorosFinished: number;
  cardsReviewed: number;
  totalHours: number;
}

export type WidgetType = 'metric' | 'chart' | 'habit_streak' | 'countdown' | 'quote' | 'active_recall' | 'time_budget';
export type WidgetCategory = 'education' | 'active_recall' | 'planning' | 'exam' | 'study_budget';

export interface CustomWidget {
  id: string;
  title: string;
  category: WidgetCategory;
  type: WidgetType;
  value: string | number;
  target?: number;
  unit?: string;
  color: string;
  icon?: string;
  description?: string;
  chartData?: { label: string; value: number }[];
  streakDays?: boolean[];
  createdAt: string;
  enabledOnDashboard: boolean;
}

export type WidgetColSpan = 1 | 2 | 3;

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  category: WidgetCategory;
  type: string; // 'system_tasks' | 'system_decks' | 'system_schedule' | 'system_mastery' | 'system_notes' | 'system_pomodoro' | 'system_time_budget' | 'custom'
  colSpan: WidgetColSpan;
  enabled: boolean;
  order: number;
  customWidgetRefId?: string;
  icon?: string;
  color?: string;
}

export type AchievementCategory = 'streak' | 'flashcards' | 'pomodoro' | 'tasks' | 'study_time' | 'documents';
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  target: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
  unit: string;
}

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    role: string;
    university?: string;
    avatarInitials: string;
    avatarUrl?: string;
    avatarId?: string;
    academicGoal?: string;
    targetWeeklyHours?: number;
  };
  integrations: {
    spotifyConnected: boolean;
    selectedPlaylist: string;
    gcalConnected: boolean;
    notionConnected: boolean;
    notificationsEnabled: boolean;
    pushNotifications: boolean;
    studyReminders: boolean;
    timerChime: boolean;
  };
  system: {
    language: string;
    theme: string;
  };
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    name: 'Julien Dupont',
    email: 'julien.dupont@chronostudy.fr',
    role: 'Master 2 Data Science & IA',
    university: 'Université Paris-Saclay / Sorbonne',
    avatarInitials: 'JD',
    avatarId: 'char-robot-1',
    avatarUrl: '',
    academicGoal: 'Mention Très Bien & Maîtrise Active Recall',
    targetWeeklyHours: 25,
  },
  integrations: {
    spotifyConnected: true,
    selectedPlaylist: 'Lo-Fi Beats for Deep Work',
    gcalConnected: true,
    notionConnected: true,
    notificationsEnabled: true,
    pushNotifications: true,
    studyReminders: true,
    timerChime: true,
  },
  system: {
    language: 'Français (FR)',
    theme: 'Clair Moderne',
  },
};

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'co-leader' | 'member';
  studyMinutesThisWeek: number;
  cardsMastered: number;
  currentStreak: number;
  status: 'online' | 'studying' | 'offline';
  joinedAt: string;
}

export interface GroupActivity {
  id: string;
  userName: string;
  userAvatar: string;
  type: 'deck_shared' | 'milestone_reached' | 'joined' | 'message' | 'session_completed';
  content: string;
  timestamp: string;
  deckTitle?: string;
  deckId?: string;
}

export interface SharedGroupDeck {
  id: string;
  title: string;
  subject: string;
  description: string;
  cardCount: number;
  color: string;
  sharedBy: string;
  sharedByAvatar: string;
  downloads: number;
  likes: number;
  cards: { question: string; answer: string }[];
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  isPrivate: boolean;
  avatarEmoji: string;
  color: string;
  weeklyGoalHours: number;
  announcement?: string;
  members: GroupMember[];
  sharedDecks: SharedGroupDeck[];
  activityFeed: GroupActivity[];
  messages?: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userRole: string;
    content: string;
    timestamp: string;
    likes: number;
  }[];
  createdAt: string;
  isUserMember?: boolean;
}

export type AnnotationStatus = 'open' | 'addressed' | 'archived';

export interface ModuleAnnotation {
  id: string;
  moduleId: string;
  moduleName: string;
  author: string;
  text: string;
  codeReference?: string;
  status: AnnotationStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACADEMIC STUDY JOURNAL TYPES
// ══════════════════════════════════════════════════════════════════════════════
export type JournalMood = 'focused' | 'productive' | 'tired' | 'inspired' | 'neutral';
export type JournalCategory = 'daily_reflection' | 'exam_prep' | 'concept_breakthrough' | 'study_plan' | 'weekly_review';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: JournalCategory;
  mood: JournalMood;
  subject?: string;
  tags: string[];
  keyTakeaways: string[];
  studyTimeMinutes?: number;
  aiFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// WORLD CLOCK SYSTEM TYPES
// ══════════════════════════════════════════════════════════════════════════════
export interface WorldClockCity {
  id: string;
  name: string;
  country: string;
  timezone: string;
  flagEmoji: string;
  isPrimary?: boolean;
}

