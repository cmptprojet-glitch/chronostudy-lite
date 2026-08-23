import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlashcardDeck,
  Task,
  StudySessionLog,
  SubjectMetric,
  StudyDocument,
  AcademicSubject,
  AIConversationItem,
  NovaPersonalizationConfig,
  UserSettings,
  DEFAULT_USER_SETTINGS,
} from '../types';
import { TabType } from './Navbar';
import {
  Sparkles,
  Plus,
  Send,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  FileUp,
  Youtube,
  ShieldCheck,
  Brain,
  GraduationCap,
  Layers,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  X,
  ChevronRight,
  Flame,
  Zap,
  Clock,
  BookOpen,
  FileText,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Calendar,
  Compass,
  Lightbulb,
  History,
  Trash2,
  Search,
  MessageSquare,
  Target,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  User,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AnimatedIcon, IconType } from './AnimatedIcon';
import { NovaAvatar2D } from './NovaAvatar2D';
import { NovaAvatar3D, NovaExpression } from './NovaAvatar3D';
import { NovaPersonalizationModal } from './NovaPersonalizationModal';
import { RevisionPlanWizardModal } from './RevisionPlanWizardModal';
import { NovaOnboardingQuizModal } from './NovaOnboardingQuizModal';
import {
  InteractiveRevisionPlanCard,
  StructuredRevisionPlan,
} from './InteractiveRevisionPlanCard';
import {
  InteractiveQuestionPhase,
  ClarificationQuestion,
} from './InteractiveQuestionPhase';

interface DashboardViewProps {
  tasks: Task[];
  decks: FlashcardDeck[];
  logs: StudySessionLog[];
  documents?: StudyDocument[];
  subjects?: AcademicSubject[];
  levelTitle?: string;
  userXP?: number;
  userStreak?: number;
  subjectMetrics?: SubjectMetric[];
  userSettings?: UserSettings;
  onSaveUserSettings?: (settings: UserSettings) => void;
  onSaveDeck?: (deck: FlashcardDeck) => void;
  onAddTask?: (task: Task) => void;
  onAddDocument?: (doc: StudyDocument) => void;
  onAwardXP?: (amount: number, reason: string) => void;
  setActiveTab: (tab: TabType) => void;
  onStartPomodoroWithTask?: (taskId: string) => void;
  onOpenDeck?: (deckId: string) => void;
  onOpenAiChat?: () => void;
  onOpenWorldClock?: () => void;
}

export type ResponseMode = 'coach' | 'solve' | 'exam' | 'chat';

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: typeof Sparkles;
  mode: ResponseMode;
  tag: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'summarize_docs',
    label: 'Résumer documents récents',
    prompt: 'Fais-moi un résumé clair, visuel et synthétique des points essentiels de mes documents récents de cours avec les formules clés.',
    icon: FileText,
    mode: 'coach',
    tag: 'Synthèse',
    color: '#06B6D4',
    bgLight: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100',
    bgDark: 'dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60 dark:hover:bg-cyan-950/70',
  },
  {
    id: 'create_plan',
    label: 'Créer un plan de révision',
    prompt: 'Crée-moi un plan de révision sur mesure pour mes prochains examens avec objectifs journaliers et méthodes de travail.',
    icon: Target,
    mode: 'coach',
    tag: 'Planning',
    color: '#10B981',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 dark:hover:bg-emerald-950/70',
  },
  {
    id: 'explain_concept',
    label: 'Expliquer un concept',
    prompt: 'Explique-moi un concept difficile étape par étape avec des analogies simples et des exemples concrets du quotidien.',
    icon: Lightbulb,
    mode: 'coach',
    tag: 'Pédagogie',
    color: '#F59E0B',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 dark:hover:bg-amber-950/70',
  },
  {
    id: 'quiz_express',
    label: 'Quiz express (10 QCM)',
    prompt: 'Génère un quiz interactif de 10 questions QCM avec 3 options et justification détaillée pour tester ma mémoire.',
    icon: Sparkles,
    mode: 'exam',
    tag: '10 Questions',
    color: '#8B5CF6',
    bgLight: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    bgDark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 dark:hover:bg-purple-950/70',
  },
  {
    id: 'solve_step_by_step',
    label: 'Résoudre pas à pas',
    prompt: 'Résous cet exercice étape par étape en explicitant chaque formule, calcul intermédiaire et justification théorique.',
    icon: Zap,
    mode: 'solve',
    tag: 'Corrigé type',
    color: '#EC4899',
    bgLight: 'bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100',
    bgDark: 'dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60 dark:hover:bg-pink-950/70',
  },
  {
    id: 'key_definitions',
    label: 'Vocabulaire & Définitions',
    prompt: 'Dresse la liste des définitions, formules et repères incontournables à retenir par cœur pour mon contrôle.',
    icon: BookOpen,
    mode: 'coach',
    tag: 'Fiche Mémo',
    color: '#6366F1',
    bgLight: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100',
    bgDark: 'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 dark:hover:bg-indigo-950/70',
  },
];

export const QUICK_ACTIONS: {
  id: string;
  title: string;
  iconType: IconType;
  badge?: string;
  badgeColor?: string;
  bgLight: string;
  bgDark: string;
  promptSeed: string;
  mode: ResponseMode;
}[] = [
  {
    id: 'summarize',
    title: 'Résumer un cours',
    iconType: 'document',
    badge: 'Express',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    bgLight: 'bg-cyan-50/70 text-cyan-900 border-cyan-200/80',
    bgDark: 'dark:bg-cyan-950/30 dark:text-cyan-200 dark:border-cyan-800/50',
    promptSeed: 'Fais-moi un résumé synthétique en 5 points clés avec définitions incontournables.',
    mode: 'coach',
  },
  {
    id: 'solve',
    title: 'Scanner un exercice',
    iconType: 'camera',
    badge: 'Photo IA',
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
    bgLight: 'bg-pink-50/70 text-pink-900 border-pink-200/80',
    bgDark: 'dark:bg-pink-950/30 dark:text-pink-200 dark:border-pink-800/50',
    promptSeed: 'Résous cet exercice pas à pas avec formules et calculs détaillés.',
    mode: 'solve',
  },
  {
    id: 'quiz',
    title: 'Quiz express',
    iconType: 'sparkles',
    badge: '10 QCM',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    bgLight: 'bg-purple-50/70 text-purple-900 border-purple-200/80',
    bgDark: 'dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-800/50',
    promptSeed: 'Génère un quiz QCM interactif de 5 questions avec corrections.',
    mode: 'exam',
  },
  {
    id: 'focus',
    title: 'Mode Examen',
    iconType: 'target',
    badge: 'Chrono',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    bgLight: 'bg-rose-50/70 text-rose-900 border-rose-200/80',
    bgDark: 'dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-800/50',
    promptSeed: 'Mets-moi en condition réelle d’examen avec notation sur 20 et questions piégées.',
    mode: 'exam',
  },
  {
    id: 'memo',
    title: 'Fiches de révision',
    iconType: 'flashcard',
    badge: 'Mémoire',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    bgLight: 'bg-amber-50/70 text-amber-900 border-amber-200/80',
    bgDark: 'dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/50',
    promptSeed: 'Crée un deck de cartes mémoire avec définitions clés et pièges d’examen.',
    mode: 'coach',
  },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: ResponseMode;
  attachments?: { name: string; type: 'image' | 'file'; url?: string }[];
  flashcards?: { front: string; back: string }[];
  steps?: string[];
  reaction?: 'like' | 'dislike' | null;
  questionPhase?: ClarificationQuestion;
  revisionPlan?: StructuredRevisionPlan;
  followUpQuestion?: string;
  scannedContext?: { documentsCount: number; decksCount: number; subjectMatched?: string };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  decks,
  logs,
  documents = [],
  subjects = [],
  levelTitle = 'Niveau 2 · Apprenti Studieux',
  userXP = 18,
  userStreak = 4,
  userSettings,
  onSaveUserSettings,
  onSaveDeck,
  onAddTask,
  onAwardXP,
  setActiveTab,
  onOpenWorldClock,
}) => {
  const { currentTheme } = useTheme();

  // Input & Chat State
  const [inputValue, setInputValue] = useState('');
  const [activeChipMode, setActiveChipMode] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: 'image' | 'file'; url?: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals & Drawers States (ONLY open when explicitly clicked!)
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isPlanWizardOpen, setIsPlanWizardOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isXPModalOpen, setIsXPModalOpen] = useState(false);
  const [isRecentConversationsOpen, setIsRecentConversationsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Voice recording & TTS
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState<NovaExpression>('idle');
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [savedDeckMessageId, setSavedDeckMessageId] = useState<string | null>(null);

  // Search in conversation drawer
  const [recentConversationsSearch, setRecentConversationsSearch] = useState('');
  const [conversationFilterMode, setConversationFilterMode] = useState<string>('all');

  // Check first launch for interactive onboarding quiz
  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem('chronostudy_onboarding_completed');
      if (!hasCompletedOnboarding) {
        setIsOnboardingOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Personalization Config
  const [personalizationConfig, setPersonalizationConfig] = useState<NovaPersonalizationConfig>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_nova_personalization');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      respondLikeTeacher: true,
      schoolGrade: 'Terminale',
      country: 'France',
      drawStudentExamples: true,
      adaptLearningPace: true,
      ambiance: 'sympa',
      warmth: 'chaleureux',
      emojis: 'expressif',
    };
  });

  // Recent History Persistence
  const [conversations, setConversations] = useState<AIConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_dashboard_conversations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Programme de la matinée ?';
    if (hour >= 12 && hour < 18) return "Programme de l'aprem ?";
    if (hour >= 18 && hour < 23) return 'Programme de la soirée ?';
    return 'Session nocturne ?';
  };

  // Avatar speech greeting on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubbleText("Salut ! Que veux-tu réviser ou résoudre aujourd'hui ?");
      setAvatarExpression('speaking');
      const resetTimer = setTimeout(() => {
        setAvatarExpression('idle');
      }, 3500);
      return () => clearTimeout(resetTimer);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Mascot Click Reaction
  const handleMascotClick = () => {
    const quotes = [
      'Je suis là pour résoudre tes exercices et t’expliquer tes cours ! 🚀',
      'Tu as déjà 4 jours de série, continue comme ça ! 🔥',
      'Prêt pour un petit quiz express de 3 minutes ? 🧠',
      'N’hésite pas à me scanner un exercice de maths ou de physique ! 📸',
      'Besoin d’un plan de révision sur mesure pour tes examens ? 🎯',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechBubbleText(quote);
    setAvatarExpression('celebrating');
    setTimeout(() => {
      setAvatarExpression('idle');
    }, 2800);
  };

  // Submit a query (Classic Conversational Assistant Flow with Live Scan & Clarification Phases)
  const handleSendQuery = (textToSend?: string, modeOverride?: ResponseMode) => {
    const text = (textToSend || inputValue).trim();
    if (!text && attachedFiles.length === 0) return;

    const currentMode = modeOverride || (activeChipMode as ResponseMode) || 'coach';
    const lower = text.toLowerCase();

    // 1. Append User Message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text || 'Analyse du document joint',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: currentMode,
      attachments: [...attachedFiles],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    const sentAttachments = [...attachedFiles];
    setAttachedFiles([]);
    setIsAiThinking(true);
    setAvatarExpression('thinking');
    setSpeechBubbleText('Analyse en cours...');

    // 2. Cross-Poles Scanner
    const matchedSubject =
      subjects.find((s) => lower.includes(s.name.toLowerCase()) || lower.includes(s.id.toLowerCase()))?.name ||
      (lower.includes('histoire') || lower.includes('seconde guerre') || lower.includes('ww2') || lower.includes('guerre')
        ? 'Histoire-Géo'
        : lower.includes('physique') || lower.includes('chimie') || lower.includes('rc') || lower.includes('condensateur')
        ? 'Physique-Chimie'
        : lower.includes('math') || lower.includes('dérivée') || lower.includes('intégrale') || lower.includes('calcul')
        ? 'Mathématiques'
        : lower.includes('philo')
        ? 'Philosophie'
        : 'Général');

    const matchedDocs = documents.filter(
      (d) =>
        lower.includes(d.name.toLowerCase()) ||
        (d.subject && lower.includes(d.subject.toLowerCase())) ||
        (matchedSubject !== 'Général' && d.subject?.toLowerCase() === matchedSubject.toLowerCase())
    );
    const matchedDecks = decks.filter(
      (d) =>
        lower.includes(d.title.toLowerCase()) ||
        (d.subject && lower.includes(d.subject.toLowerCase())) ||
        (matchedSubject !== 'Général' && d.subject?.toLowerCase() === matchedSubject.toLowerCase())
    );

    // 3. Generate simulated AI response with dynamic educational intelligence
    setTimeout(() => {
      setIsAiThinking(false);
      setAvatarExpression('speaking');

      let generatedAnswer = '';
      let generatedSteps: string[] = [];
      let generatedFlashcards: { front: string; back: string }[] = [];
      let questionPhase: ClarificationQuestion | undefined = undefined;
      let revisionPlan: StructuredRevisionPlan | undefined = undefined;
      let followUpQuestion: string | undefined = undefined;

      // CASE A: QUIZ REQUEST (Interactive clarification phase)
      const isQuizRequest =
        lower.includes('quiz') ||
        lower.includes('qcm') ||
        lower.includes('interroge-moi') ||
        (lower.includes('seconde guerre') && !lower.includes('vichy') && !lower.includes('résistance') && !lower.includes('procès'));

      const isSpecificQuizAnswer =
        lower.includes('vichy') ||
        lower.includes('résistance') ||
        lower.includes('guerre totale') ||
        lower.includes('fronts') ||
        lower.includes('nuremberg') ||
        lower.includes('grand quiz') ||
        lower.includes('10 questions') ||
        lower.includes('5 questions');

      if (isQuizRequest && !isSpecificQuizAnswer) {
        generatedAnswer = `Excellente idée ! J'ai scanné tes cours et documents en **${matchedSubject}** 📚\n\nPour que ce quiz soit le plus efficace possible pour ton niveau et tes révisions, précise l'axe que tu souhaites travailler :`;
        
        questionPhase = {
          id: `clarify-quiz-${Date.now()}`,
          title: `Précision pour ton quiz : ${lower.includes('seconde guerre') || lower.includes('ww2') ? 'Seconde Guerre Mondiale' : matchedSubject}`,
          description: `Nova a détecté ton programme d'étude. Choisis le thème ciblé ci-dessous ou dicte ta consigne avec le micro :`,
          options: [
            {
              id: 'opt-ww2-1',
              label: 'La France sous Vichy, l’Occupation & la Résistance (10 QCM)',
              value: 'Génère un quiz approfondi sur La France sous le régime de Vichy, la collaboration et la Résistance (1940-1944) avec explications détaillées.',
            },
            {
              id: 'opt-ww2-2',
              label: 'Guerre totale, tournant 1942 & Fronts mondial (8 questions)',
              value: 'Génère un quiz sur la guerre totale, les batailles décisives (Stalingrad, Midway, El-Alamein) et la capitulation de l’Axe.',
            },
            {
              id: 'opt-ww2-3',
              label: 'Bilan humain, Procès de Nuremberg & Reconstruction (5 questions)',
              value: 'Génère un quiz sur le bilan humain et moral, les procès de Nuremberg/Tokyo et la création de l’ONU.',
            },
            {
              id: 'opt-ww2-4',
              label: 'Grand Quiz de Synthèse type Bac (15 questions chrono)',
              value: 'Fais-moi un grand quiz de synthèse complet sur toute la Seconde Guerre Mondiale avec chronométrage et barème sur 20.',
            },
          ],
          allowVoiceInput: true,
        };
      } else if (isSpecificQuizAnswer || (lower.includes('quiz') && isSpecificQuizAnswer)) {
        generatedAnswer = `### Quiz Interactif & Corrigé Détaillé : Seconde Guerre Mondiale 🎖️\n\nVoici ta série de questions avec corrections pédagogiques et mémorisation espacée :\n\n---\n\n#### **Question 1** : En quelle année et par quel discours le Général de Gaulle lance-t-il son appel à la Résistance depuis Londres ?\n- A) 17 juin 1940\n- **B) 18 juin 1940 (✅ Réponse exacte)**\n- C) 10 juillet 1940\n- D) 6 juin 1944\n\n> 💡 *Explication historique* : Le 18 juin 1940, Charles de Gaulle refuse l'armistice demandé par le maréchal Pétain et fonde la France Libre sur les ondes de la BBC.\n\n---\n\n#### **Question 2** : Quel organisme Jean Moulin a-t-il unifié en mai 1943 pour coordonner la résistance intérieure ?\n- A) Les FFI (Forces Françaises de l'Intérieur)\n- B) Le STO (Service du Travail Obligatoire)\n- **C) Le CNR (Conseil National de la Résistance) (✅ Réponse exacte)**\n- D) Le CFLN\n\n> 💡 *Explication historique* : Jean Moulin réunit le CNR à Paris le 27 mai 1943, rassemblant 8 mouvements de résistance, 6 partis politiques et 2 syndicats.\n\n---\n\n#### **Question 3** : Quelle notion juridique inédite a été introduite lors du procès de Nuremberg en 1945 ?\n- A) Haute trahison\n- **B) Crime contre l'humanité (✅ Réponse exacte)**\n- C) Crime de piraterie\n- D) Rupture d'armistice\n\n> 💡 *Explication historique* : Le statut du Tribunal Militaire International de Nuremberg définit pour la première fois le « crime contre l'humanité », imprescriptible.`;

        generatedSteps = [
          'Analyse des questions clés du programme officiel',
          'Vérification des dates repères et notions juridiques',
          'Génération des fiches mémoires de réactivation',
        ];

        generatedFlashcards = [
          { front: 'Appel du 18 juin 1940', back: 'Discours de Charles de Gaulle à la BBC fondant la France Libre' },
          { front: 'Création et rôle du CNR (mai 1943)', back: 'Conseil National de la Résistance unifié par Jean Moulin' },
          { front: 'Notion juridique créée à Nuremberg (1945)', back: 'Crime contre l’humanité (imprescriptible)' },
        ];

        followUpQuestion = "Veux-tu qu'on enchaîne avec 5 questions supplémentaires ou que j'ajoute ces 3 flashcards à ton deck d'Histoire ?";
      }
      // CASE B: SOLVE EXERCISES REQUEST
      else if (
        (lower.includes('résous') || lower.includes('résoudre') || lower.includes('calculer') || currentMode === 'solve') &&
        sentAttachments.length === 0 &&
        text.length < 25
      ) {
        generatedAnswer = `Pour que je résolve ton exercice avec **toutes les étapes détaillées**, les formules et les justifications théoriques :\n\nTransmets-moi ton document ou la photo de l'énoncé ci-dessous, ou dicte directement les données :`;
        
        questionPhase = {
          id: `clarify-solve-${Date.now()}`,
          title: 'Transmets ton exercice à Nova',
          description: 'Prends en photo ton énoncé ou importe ton document (PDF, Word, image). Nova identifiera les variables, posera les théorèmes et détaillera chaque calcul.',
          requiresDocumentUpload: true,
          allowVoiceInput: true,
        };
      }
      // CASE C: REVISION PLAN
      else if (lower.includes('plan de révision') || lower.includes('planning') || lower.includes('programme de révision')) {
        generatedAnswer = `### Ton Plan de Révision Stratégique & Interactif 🎯\n\nJ'ai structuré ce programme en combinant **mémorisation espacée**, **séances Pomodoro adaptées** et **objectifs journaliers** concrets pour **${matchedSubject}**.`;
        
        revisionPlan = {
          id: `plan-dynamic-${Date.now()}`,
          title: `Plan de Révision : ${matchedSubject}`,
          subject: matchedSubject,
          targetScore: 18,
          examDate: 'Vendredi 28 Mars',
          daysRemaining: 7,
          totalHours: 6.5,
          tips: [
            'Alterner rappel actif (flashcards) et pratique sans note.',
            'Prendre 5 min de pause toutes les 25 min (méthode Pomodoro).',
            'Relire les erreurs après chaque session pour fixer les automatismes.',
          ],
          milestones: [
            {
              id: `m-${Date.now()}-1`,
              dayLabel: 'Jour 1 · Synthèse & Définitions Clés',
              title: 'Mémorisation des définitions indispensables et formules directrices',
              focusMinutes: 50,
              type: 'concept',
              description: 'Relire la fiche synthétique et ancrer les 6 flashcards de vocabulaire et repères.',
              completed: false,
              xpReward: 25,
            },
            {
              id: `m-${Date.now()}-2`,
              dayLabel: 'Jour 2 · Exercices d’Application Types',
              title: 'Résolution méthodique pas à pas et repérage des pièges classiques',
              focusMinutes: 75,
              type: 'exercise',
              description: 'Refaire 3 exercices types sans consulter le corrigé puis auto-correction.',
              completed: false,
              xpReward: 30,
            },
            {
              id: `m-${Date.now()}-3`,
              dayLabel: 'Jour 3 · Simulation Examen & Consolidation',
              title: 'Épreuve blanche chronométrée en conditions réelles et révision flash',
              focusMinutes: 60,
              type: 'exam_sim',
              description: 'Simulation test chronométré 30 min et tour complet de réactivation flashcards.',
              completed: false,
              xpReward: 35,
            },
          ],
        };

        generatedSteps = [
          'Calcul du volume horaire optimal (25 min Focus / 5 min Pause)',
          'Répartition équilibrée théorie (35%) / pratique (65%)',
          'Synchronisation possible en 1 clic avec le planificateur de tâches',
        ];

        generatedFlashcards = [
          { front: `Règle d'or de révision (${matchedSubject})`, back: 'Alterner rappel actif (flashcards) et pratique d’exercices sans note.' },
        ];

        followUpQuestion = "Que penses-tu de ce plan de révision ? Veux-tu ajuster les durées ou qu'on commence la première session ensemble ?";
      }
      // CASE D: PHYSICS / MATH / CIRCUIT RC
      else if (lower.includes('circuit rc') || lower.includes('tau') || lower.includes('décharge') || lower.includes('condensateur')) {
        generatedAnswer = `Voici l'explication complète et le corrigé pour le **Circuit RC** en Physique-Chimie ⚡\n\n### 1. Équation différentielle de la charge\nD'après la loi des mailles :\n$$u_R(t) + u_C(t) = E$$\nSachant que $i(t) = C \\frac{du_C}{dt}$ et $u_R = R \\cdot i$, on obtient :\n$$R C \\frac{du_C(t)}{dt} + u_C(t) = E$$\n\n### 2. Solution analytique\nLa constante de temps vaut :\n$$\\tau = R \\cdot C \\quad (\\text{en secondes s})$$\nLa tension aux bornes du condensateur s'écrit :\n$$u_C(t) = E \\left(1 - e^{-t/\\tau}\\right)$$\n\n### 3. Points clés pour l'examen\n- À $t = \\tau$ : le condensateur est chargé à **63%** de $E$ ($u_C(\\tau) \\approx 0{,}63 E$).\n- À $t = 5\\tau$ : la charge est considérée comme **complète à plus de 99%**.\n- La tangente à l'origine coupe l'asymptote $u_C = E$ en $t = \\tau$.`;
        
        generatedFlashcards = [
          { front: 'Constante de temps Tau (Circuit RC)', back: 'Tau = R * C (en secondes s)' },
          { front: 'Tension à t = Tau lors de la charge', back: 'uC(Tau) = 0,63 * E (63% de la tension max)' },
          { front: 'Durée du régime transitoire', back: 'Approximativement 5 * Tau (charge > 99%)' },
        ];
        
        generatedSteps = [
          'Application de la loi des mailles',
          'Résolution de l’équation différentielle',
          'Calcul de la constante de temps Tau',
        ];
      }
      // CASE E: GENERIC DETAILED RESPONSE
      else {
        generatedAnswer = `### Explication Pédagogique & Structurée 💡\n\n**Sujet analysé** : *"${text}"*\n\n1. **L'analogie du quotidien** :\n   Pense à ce concept comme à un circuit de distribution fluide : la régulation s'effectue automatiquement selon la pression disponible.\n\n2. **Les principes fondamentaux à retenir** :\n   - Identifier rigoureusement les données et hypothèses.\n   - Appliquer le théorème directeur sans omettre les conditions de validité.\n   - Présenter le résultat avec ses unités et une phrase de conclusion soignée.\n\n3. **La méthode infaillible pour ton contrôle** :\n   Rédige toujours ta justification théorique avant de poser les calculs numériques !`;
        
        generatedFlashcards = [
          { front: `Point clé : ${text.slice(0, 35)}...`, back: 'Définition et méthode d’application à réciter lors du devoir.' },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: generatedAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: currentMode,
        flashcards: generatedFlashcards,
        steps: generatedSteps,
        questionPhase: questionPhase,
        revisionPlan: revisionPlan,
        followUpQuestion: followUpQuestion,
        scannedContext: {
          documentsCount: matchedDocs.length,
          decksCount: matchedDecks.length,
          subjectMatched: matchedSubject,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to recent conversations
      const newConvItem: AIConversationItem = {
        id: `conv-${Date.now()}`,
        query: text || 'Analyse de document',
        answer: generatedAnswer,
        mode: currentMode,
        timestamp: "À l'instant",
        createdAt: new Date().toISOString(),
        subject: matchedSubject,
        steps: generatedSteps,
        flashcardsGenerated: generatedFlashcards,
      };

      setConversations((prev) => {
        const filtered = prev.filter((c) => c.query.toLowerCase() !== text.toLowerCase());
        const updated = [newConvItem, ...filtered];
        try {
          localStorage.setItem('chronostudy_dashboard_conversations', JSON.stringify(updated.slice(0, 40)));
        } catch {
          // ignore
        }
        return updated;
      });

      if (onAwardXP) {
        onAwardXP(15, 'Interaction Nova IA');
      }

      setTimeout(() => {
        setAvatarExpression('idle');
      }, 2500);
    }, 1000);
  };

  // Copy response to clipboard
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // TTS Voice reading
  const handleSpeakText = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      setAvatarExpression('idle');
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[#*`_$\\]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setAvatarExpression('speaking');
      };
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAvatarExpression('idle');
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAvatarExpression('idle');
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Save Flashcards Deck from Assistant Message
  const handleSaveDeckFromMsg = (msg: ChatMessage) => {
    if (!msg.flashcards || msg.flashcards.length === 0 || !onSaveDeck) return;
    const newDeck: FlashcardDeck = {
      id: `ai-deck-${Date.now()}`,
      title: `Deck Nova : ${msg.content.slice(0, 30).replace(/[^a-zA-Z0-9À-ÿ ]/g, '')}...`,
      subject: subjects[0]?.name || 'Général',
      description: 'Généré automatiquement par Nova IA',
      color: currentTheme.accentColor,
      cards: msg.flashcards.map((c, i) => ({
        id: `card-${Date.now()}-${i}`,
        question: c.front,
        answer: c.back,
        intervalDays: 1,
        easinessFactor: 2.5,
        reviewCount: 0,
        nextReviewDate: new Date().toISOString(),
        lastEvaluated: 'easy',
      })),
      createdAt: new Date().toISOString(),
    };
    onSaveDeck(newDeck);
    setSavedDeckMessageId(msg.id);
    if (onAwardXP) onAwardXP(20, 'Création deck IA');
    setTimeout(() => setSavedDeckMessageId(null), 3000);
  };

  // Voice recording toggle
  const handleToggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setAvatarExpression('listening');
      setSpeechBubbleText('Je t’écoute attentivement...');
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = 'fr-FR';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecordingVoice(false);
          setAvatarExpression('speaking');
          setSpeechBubbleText(`Compris : "${transcript}"`);
          handleSendQuery(transcript);
        };
        recognition.onerror = () => {
          setIsRecordingVoice(false);
          setAvatarExpression('idle');
        };
        recognition.start();
      } else {
        setTimeout(() => {
          const sample = 'Explique-moi le circuit RC en Physique-Chimie et donne-moi la formule de Tau.';
          setInputValue(sample);
          setIsRecordingVoice(false);
          setAvatarExpression('speaking');
          setSpeechBubbleText(`Dicté : "${sample}"`);
          handleSendQuery(sample);
        }, 2200);
      }
    } else {
      setIsRecordingVoice(false);
      setAvatarExpression('idle');
    }
  };

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles((prev) => [...prev, { name: file.name, type }]);
      inputRef.current?.focus();
    }
  };

  // Clear or Start New Conversation
  const handleStartNewChat = () => {
    setMessages([]);
    setActiveChipMode(null);
    setAttachedFiles([]);
    setAvatarExpression('idle');
    setSpeechBubbleText(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between pb-3 max-w-5xl mx-auto space-y-4">
      
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP BAR: STATUS, STREAK, XP & INTERFACES TRIGGERS                      */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
        
        {/* LEFT: XP & STREAK (CLICKABLE TO OPEN DETAILED MODALS) */}
        <div className="flex items-center gap-2">
          {/* XP BADGE -> OPENS LEVEL MODAL */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsXPModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs cursor-pointer transition-colors"
            title="Voir ton niveau et ta progression d'XP"
          >
            <div
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px]"
            >
              <Zap className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs font-black text-[#161922] dark:text-white">
              {userXP} XP
            </span>
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
              · {levelTitle.split('·')[0]}
            </span>
          </motion.button>

          {/* STREAK BADGE -> OPENS STREAK MODAL */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsStreakModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs cursor-pointer transition-colors"
            title="Voir tes jours de série"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="text-[#161922] dark:text-white font-black text-xs">
              {userStreak} Jours
            </span>
          </motion.button>
        </div>

        {/* RIGHT: PERSONALISATION, DISCUSSIONS & NEW CHAT */}
        <div className="flex items-center gap-1.5">
          {/* NEW CHAT BUTTON (SHOWN WHEN IN ONGOING CONVERSATION) */}
          {messages.length > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              title="Commencer une nouvelle discussion"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouvelle discussion</span>
            </motion.button>
          )}

          {/* PERSONALISATION MODAL TRIGGER */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsPersonalizationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-zinc-800 text-[#161922] dark:text-white rounded-2xl shadow-xs text-xs font-bold transition-colors cursor-pointer"
            title="Personnaliser le comportement de Nova"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Personnalisé</span>
          </motion.button>

          {/* RECENT DISCUSSIONS DRAWER TRIGGER */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsRecentConversationsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-[#161922] dark:text-white rounded-2xl shadow-xs text-xs font-bold transition-colors cursor-pointer"
            title="Historique des discussions"
          >
            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Discussions</span>
            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {conversations.length}
            </span>
          </motion.button>

          {/* WORLD CLOCK SHORTCUT */}
          {onOpenWorldClock && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenWorldClock}
              className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs transition-colors cursor-pointer"
              title="Horloge mondiale"
            >
              <Compass className="w-4 h-4" />
            </motion.button>
          )}

          {/* FOCUS POMODORO */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('pomodoro')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-[#161922] dark:text-white rounded-2xl shadow-xs text-xs font-bold transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Focus</span>
          </motion.button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN VIEW: CHAT CONVERSATION (OR HOME IF NO MESSAGES)                  */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-start">
        
        {/* A. CONVERSATION STREAM (CLASSIC AI ASSISTANT CHAT) */}
        {messages.length > 0 ? (
          <div className="space-y-6 pb-6 pt-2">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* 1. USER BUBBLE */}
                {msg.role === 'user' ? (
                  <div className="max-w-xl text-right space-y-1.5">
                    <div className="inline-block p-4 rounded-3xl rounded-tr-xs bg-[#161922] dark:bg-zinc-800 text-white font-medium text-xs sm:text-sm text-left shadow-md">
                      {/* ATTACHMENTS PREVIEW */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-700/60">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-700/80 text-[11px] font-bold text-zinc-200"
                            >
                              {att.type === 'image' ? <Camera className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              <span className="truncate max-w-[120px]">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-semibold px-2">
                      <span>{msg.timestamp}</span>
                      {msg.mode && (
                        <span className="uppercase text-purple-600 dark:text-purple-400 font-black">
                          · {msg.mode}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2. NOVA ASSISTANT MESSAGE */
                  <div className="w-full max-w-3xl space-y-3 text-left">
                    {/* ASSISTANT HEADER */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black">
                          <NovaAvatar2D expression="idle" size="sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-[#161922] dark:text-white">
                              Nova IA
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              PRO Réponse Smart
                            </span>
                            {msg.scannedContext && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                                <span>📚 {msg.scannedContext.subjectMatched}</span>
                                {msg.scannedContext.documentsCount > 0 && <span>· {msg.scannedContext.documentsCount} doc(s)</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-semibold">{msg.timestamp}</span>
                    </div>

                    {/* ASSISTANT CONTENT CARD */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 text-xs sm:text-sm leading-relaxed text-[#161922] dark:text-zinc-200">
                      
                      {/* FORMATTED TEXT */}
                      <div className="whitespace-pre-wrap font-medium space-y-3">
                        {msg.content.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('### ')) {
                            return (
                              <h4 key={idx} className="text-sm sm:text-base font-black text-[#161922] dark:text-white pt-1">
                                {paragraph.replace('### ', '')}
                              </h4>
                            );
                          }
                          if (paragraph.startsWith('$$') && paragraph.endsWith('$$')) {
                            return (
                              <div
                                key={idx}
                                className="py-2.5 px-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 font-mono text-xs sm:text-sm text-purple-950 dark:text-purple-200 font-bold overflow-x-auto"
                              >
                                {paragraph.slice(2, -2)}
                              </div>
                            );
                          }
                          if (paragraph.startsWith('> ')) {
                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs font-semibold"
                              >
                                {paragraph.replace('> ', '')}
                              </div>
                            );
                          }
                          return <p key={idx}>{paragraph}</p>;
                        })}
                      </div>

                      {/* 1. INTERACTIVE QUESTION PHASE (CLARIFICATION & DIRECT AUDIO) */}
                      {msg.questionPhase && (
                        <div className="pt-2">
                          <InteractiveQuestionPhase
                            question={msg.questionPhase}
                            onAnswerSelected={(ansText, file) => {
                              if (file) {
                                setAttachedFiles([file]);
                              }
                              handleSendQuery(ansText);
                            }}
                          />
                        </div>
                      )}

                      {/* 2. STRUCTURED REVISION PLAN (INTERACTIVE TIMELINE & MILESTONES) */}
                      {msg.revisionPlan && (
                        <div className="pt-2">
                          <InteractiveRevisionPlanCard
                            plan={msg.revisionPlan}
                            onStartPomodoro={(_minutes, _topic) => {
                              setActiveTab('pomodoro');
                            }}
                            onAddTask={(task) => {
                              if (onAddTask) {
                                onAddTask(task);
                                if (onAwardXP) onAwardXP(20, 'Tâche de révision planifiée !');
                              }
                            }}
                            onSaveDeck={(deck) => {
                              if (onSaveDeck) {
                                onSaveDeck(deck);
                                if (onAwardXP) onAwardXP(25, 'Deck de révision enregistré !');
                              }
                            }}
                            onAwardXP={onAwardXP}
                            onSendFeedback={(feedback) => {
                              handleSendQuery(feedback, 'coach');
                            }}
                          />
                        </div>
                      )}

                      {/* 3. FOLLOW-UP CONVERSATIONAL QUESTION */}
                      {msg.followUpQuestion && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                              {msg.followUpQuestion}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSendQuery('Oui, commençons la première session maintenant !', 'coach')}
                              className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold transition-colors cursor-pointer"
                            >
                              Commencer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendQuery('Peux-tu adapter les durées et alléger le programme ?', 'coach')}
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              Ajuster
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. CONTEXTUAL FILE ACTION CHIPS (ONLY IF DOCUMENTS OR SPECIFIC ANALYSIS PRESENT) */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                            Que veux-tu que je fasse avec ces fichiers / ce cours ?
                          </span>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'Faire une fiche de révision', prompt: 'Fais-moi une fiche de révision complète et synthétique avec les définitions clés.', icon: FileText },
                              { label: 'Expliquer les notions importantes', prompt: 'Explique-moi en détail les notions importantes avec des exemples clairs.', icon: Lightbulb },
                              { label: 'Résoudre les exercices', prompt: 'Résous les exercices correspondants étape par étape avec les calculs détaillés.', icon: Zap },
                              { label: 'Préparer un quiz', prompt: 'Génère un quiz interactif de 5 questions QCM pour tester ma compréhension.', icon: Sparkles },
                              { label: 'Corriger mes réponses', prompt: 'Aide-moi à vérifier et corriger mes réponses aux exercices.', icon: CheckCircle2 },
                              { label: 'Extraire les formules', prompt: 'Dresse la liste exhaustive de toutes les formules mathématiques et physiques à retenir.', icon: Target },
                            ].map((item, i) => (
                              <motion.button
                                key={i}
                                type="button"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleSendQuery(item.prompt, 'coach')}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-zinc-800 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-zinc-700 text-[11px] font-bold text-slate-700 dark:text-zinc-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <item.icon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                <span>{item.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DATE PICKER FOLLOW-UP CHIPS (FROM VIDEO 1) */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>C'est quand ton exam de Physique/Chimie ?</span>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {['LUN 24', 'MAR 25', 'MER 26', 'JEU 27'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleSendQuery(`Mon examen est prévu le ${d}. Établis le planning d'ici là.`)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-extrabold text-slate-700 dark:text-zinc-300 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              {d}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setIsPlanWizardOpen(true)}
                            className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter un plan</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* ACTION TOOLBAR UNDER ASSISTANT MESSAGE */}
                    <div className="flex items-center justify-between px-2 pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-slate-400">
                        {/* THUMBS UP */}
                        <button
                          type="button"
                          onClick={() => {
                            setMessages((prev) =>
                              prev.map((m) => (m.id === msg.id ? { ...m, reaction: 'like' } : m))
                            );
                          }}
                          className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            msg.reaction === 'like' ? 'text-emerald-600 font-black' : ''
                          }`}
                          title="Utile"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>

                        {/* THUMBS DOWN */}
                        <button
                          type="button"
                          onClick={() => {
                            setMessages((prev) =>
                              prev.map((m) => (m.id === msg.id ? { ...m, reaction: 'dislike' } : m))
                            );
                          }}
                          className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            msg.reaction === 'dislike' ? 'text-rose-600 font-black' : ''
                          }`}
                          title="Pas utile"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>

                        {/* COPY BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Copier la réponse"
                        >
                          {copiedMessageId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMessageId === msg.id ? 'Copié !' : 'Copier'}</span>
                        </button>

                        {/* TTS AUDIO BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.content)}
                          className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            isPlayingAudio ? 'text-teal-600 animate-pulse' : 'text-slate-600 dark:text-slate-300'
                          }`}
                          title="Écouter la réponse"
                        >
                          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* REGENERATE */}
                        <button
                          type="button"
                          onClick={() => handleSendQuery('Peux-tu reformuler cette réponse de manière encore plus concise et claire ?')}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Régénérer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* SAVE AS DECK IF FLASHCARDS AVAILABLE */}
                        {msg.flashcards && msg.flashcards.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSaveDeckFromMsg(msg)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{savedDeckMessageId === msg.id ? 'Deck enregistré !' : `Enregistrer Deck (${msg.flashcards.length})`}</span>
                          </button>
                        )}

                        {/* CUSTOMIZE PERSONALISATION */}
                        <button
                          type="button"
                          onClick={() => setIsPersonalizationOpen(true)}
                          className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Personnalisé</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* AI THINKING / STREAMING LOADER */}
            {isAiThinking && (
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold animate-pulse pt-2">
                <div className="w-8 h-8 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black">
                  <NovaAvatar2D expression="thinking" size="sm" />
                </div>
                <span>Nova réfléchit et formule la meilleure explication...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        ) : (
          /* B. HOME SCREEN (WHEN CONVERSATION IS EMPTY) */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-4 pb-6 space-y-5">
            
            {/* INTERACTIVE MASCOT WITH SPEECH BUBBLE */}
            <div className="relative flex flex-col items-center cursor-pointer group" onClick={handleMascotClick}>
              <AnimatePresence>
                {speechBubbleText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute -top-14 sm:-top-16 bg-[#161922] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border border-zinc-700/80 max-w-xs z-20 pointer-events-none"
                  >
                    <p>{speechBubbleText}</p>
                    <div className="w-2.5 h-2.5 bg-[#161922] border-r border-b border-zinc-700/80 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="p-3 relative">
                <NovaAvatar2D expression={avatarExpression} size="hero" showAura={true} className="drop-shadow-2xl" />
                <div className="absolute -bottom-1 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>En ligne</span>
                </div>
              </motion.div>
            </div>

            {/* DYNAMIC TITLE & GREETING */}
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#161922] dark:text-white tracking-tight">
                  {getGreeting()}
                </h1>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-300/70 dark:border-emerald-700/70 rounded-full shadow-xs cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 tracking-wide uppercase">
                    Active & Prête
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Nova résout tes exercices, t'explique tes cours et prépare tes examens avec précision.
              </p>
            </div>

            {/* HERO ACTION BANNER: PLANS DE RÉVISION VÉRIFIÉS (OPENS WIZARD ON CLICK) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPlanWizardOpen(true)}
              className="w-full max-w-md p-3.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-[#161922] dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-[#D4F94E] transition-colors">
                    Plans de révision vérifiés & Objectifs du jour
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                    <span>{tasks.filter((t) => t.status !== 'completed').length} objectifs en cours</span>
                    <span>·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimisé par Nova IA</span>
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-[#D4F94E] group-hover:text-[#161922] text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* QUICK ACTIONS HORIZONTAL CAROUSEL */}
            <div className="w-full max-w-4xl pt-2">
              <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1">
                {QUICK_ACTIONS.map((action) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (action.id === 'solve') {
                        cameraInputRef.current?.click();
                      } else {
                        handleSendQuery(action.promptSeed, action.mode);
                      }
                    }}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs text-xs font-bold transition-all cursor-pointer ${action.bgLight} ${action.bgDark}`}
                  >
                    <AnimatedIcon type={action.iconType} size={16} />
                    <span className="font-extrabold text-[#161922] dark:text-white whitespace-nowrap">
                      {action.title}
                    </span>
                    {action.badge && (
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 3. STICKY BOTTOM INPUT BAR & SUGGESTED PROMPTS                            */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-2 z-30 px-2 sm:px-4 space-y-2 max-w-3xl mx-auto w-full">
        
        {/* ACTIVE BADGE FILTER OR ATTACHED FILES CHIPS */}
        {(activeChipMode || attachedFiles.length > 0) && (
          <div className="flex items-center gap-2 px-2 flex-wrap">
            {activeChipMode && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#161922] text-white dark:bg-zinc-700 shadow-sm">
                <span>Mode : {activeChipMode}</span>
                <button
                  type="button"
                  onClick={() => setActiveChipMode(null)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {attachedFiles.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs"
              >
                {f.type === 'image' ? <Camera className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                <span className="truncate max-w-[140px]">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                  className="hover:text-rose-500 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* SUGGESTED PROMPT BUTTONS (HORIZONTAL SCROLLING ROW) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Suggestions :</span>
          </div>

          {SUGGESTED_PROMPTS.map((item) => {
            const IconComp = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSendQuery(item.prompt, item.mode)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer ${item.bgLight} ${item.bgDark}`}
                title={item.label}
              >
                <IconComp className="w-3.5 h-3.5" style={{ color: item.color }} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* MODERN INPUT BAR */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl p-2 sm:p-2.5 flex items-center gap-2 backdrop-blur-md">
          
          {/* [+] BUTTON: OPENS TOOLS DRAWER */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsToolsDrawerOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Outils & Modes Nova"
          >
            <Plus className="w-5 h-5 font-black" />
          </motion.button>

          {/* MAIN PROMPT INPUT */}
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (inputValue.trim() || attachedFiles.length > 0)) {
                  handleSendQuery();
                }
              }}
              placeholder="Pose n'importe quelle question, scanne ou dicte..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-[#161922] dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-hidden"
            />
          </div>

          {/* HIDDEN INPUTS */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg"
            onChange={(e) => handleFileUpload(e, 'file')}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
          />

          {/* CAMERA / SCANNER BUTTON */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => cameraInputRef.current?.click()}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors cursor-pointer shrink-0"
            title="Scanner une photo / un exercice"
          >
            <Camera className="w-5 h-5" />
          </motion.button>

          {/* VOICE BUTTON */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleVoiceRecording}
            className={`p-2.5 rounded-2xl transition-colors cursor-pointer shrink-0 ${
              isRecordingVoice
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
            title="Dicter une question à voix haute"
          >
            {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          {/* SEND BUTTON */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSendQuery()}
            disabled={!inputValue.trim() && attachedFiles.length === 0}
            style={{
              backgroundColor: inputValue.trim() || attachedFiles.length > 0 ? currentTheme.accentColor : undefined,
              color: inputValue.trim() || attachedFiles.length > 0 ? currentTheme.accentTextColor : undefined,
            }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              inputValue.trim() || attachedFiles.length > 0
                ? 'shadow-md font-black'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
            }`}
            title="Envoyer à Nova"
          >
            <Send className="w-4 h-4" />
          </motion.button>

        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 4. TOOLS DRAWER (OPENED BY [+] IN INPUT BAR)                              */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isToolsDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsToolsDrawerOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 text-left"
            >
              {/* DRAWER HEADER */}
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black"
                  >
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#161922] dark:text-white text-sm">
                      Outils & Modes Nova IA
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Sélectionne une fonctionnalité pour commencer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsToolsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER CONTENT */}
              <div className="p-5 overflow-y-auto space-y-6">
                
                {/* 1. OUTILS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Outils
                  </span>
                  <div className="grid grid-cols-4 gap-2.5">
                    
                    {/* CAMERA */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDrawerOpen(false);
                        cameraInputRef.current?.click();
                      }}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 rounded-2xl flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#161922] dark:text-white">Caméra</span>
                    </button>

                    {/* PHOTOS */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDrawerOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 rounded-2xl flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#161922] dark:text-white">Photos</span>
                    </button>

                    {/* FICHIERS */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDrawerOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 rounded-2xl flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#161922] dark:text-white">Fichiers</span>
                    </button>

                    {/* LIEN YOUTUBE */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDrawerOpen(false);
                        handleSendQuery('Résume cette vidéo de cours YouTube et extrait les formules indispensables.');
                      }}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 rounded-2xl flex flex-col items-center gap-2 text-center transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#161922] dark:text-white">Lien web</span>
                    </button>
                  </div>
                </div>

                {/* 2. MODE DE RÉPONSE */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Mode de réponse
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'coach', title: '💡 Coach-moi', desc: 'Indices progressifs sans spoiler', icon: Lightbulb, color: 'text-amber-500' },
                      { id: 'solve', title: '⚡ Résoudre', desc: 'Corrigé complet étape par étape', icon: Zap, color: 'text-pink-500' },
                      { id: 'exam', title: '🔒 Mode Examen', desc: 'Chrono & notation sur 20', icon: Brain, color: 'text-rose-500' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setActiveChipMode(mode.id);
                          setIsToolsDrawerOpen(false);
                          inputRef.current?.focus();
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          activeChipMode === mode.id
                            ? 'bg-[#161922] text-white border-[#161922] dark:border-zinc-600 shadow-md'
                            : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <mode.icon className={`w-5 h-5 ${mode.color} shrink-0 mt-0.5`} />
                        <div>
                          <span className="text-xs font-black block">{mode.title}</span>
                          <span className="text-[10px] opacity-75 block mt-0.5">{mode.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. ENTRAÎNE-TOI POUR CONTRÔLES */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Entraîne-toi pour contrôles & exams
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { title: 'Quiz-moi', desc: 'Questions interactives avec score', prompt: 'Génère un quiz QCM express de 5 questions.', icon: '📝' },
                      { title: 'Explique à voix haute', desc: 'Synthèse vocale fluide', prompt: 'Explique-moi ce concept à voix haute.', icon: '🎙️' },
                      { title: 'Créer des cartes mémoire', desc: 'Sauvegarde automatique dans l’app', prompt: 'Génère 6 flashcards sur les notions clés.', icon: '🧠' },
                      { title: 'Vocabulaire & Formules', desc: 'Fiche mémo pour révision rapide', prompt: 'Dresse la fiche de vocabulaire et formules clés.', icon: '📖' },
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setIsToolsDrawerOpen(false);
                          handleSendQuery(item.prompt);
                        }}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-[#161922] dark:text-white block">{item.title}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 5. PERSONALIZATION MODAL (EXPLICIT ON CLICK ONLY)                         */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <NovaPersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        config={personalizationConfig}
        onSaveConfig={(newCfg) => {
          setPersonalizationConfig(newCfg);
          try {
            localStorage.setItem('chronostudy_nova_personalization', JSON.stringify(newCfg));
          } catch {
            // ignore
          }
        }}
      />

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 6. VERIFIED REVISION PLAN WIZARD MODAL (EXPLICIT ON CLICK ONLY)           */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <RevisionPlanWizardModal
        isOpen={isPlanWizardOpen}
        onClose={() => setIsPlanWizardOpen(false)}
        subjects={subjects}
        onApplyPlan={(title, subject, topics) => {
          if (onAddTask) {
            onAddTask({
              id: `plan-task-${Date.now()}`,
              title: title,
              subject: subject,
              priority: 'high',
              status: 'todo',
              subtasks: topics.slice(0, 5).map((t, idx) => ({
                id: `sub-${Date.now()}-${idx}`,
                title: `Réviser : ${t}`,
                completed: false,
              })),
              createdAt: new Date().toISOString(),
              estimatedMinutes: 60,
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            });
          }
          handleSendQuery(`J'ai créé mon plan vérifié pour ${subject} (${topics.length} chapitres). Aide-moi à commencer la première session !`);
        }}
      />

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 7. STREAK MODAL (EXPLICIT ON CLICK ON 🔥 ONLY)                           */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isStreakModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStreakModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-[#10121A] text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-center p-6 space-y-5"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl">
                🔥
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{userStreak} Jours de série</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Continue comme ça ! Révise chaque jour pour maintenir ta flamme active et débloquer des bonus d'XP.
                </p>
              </div>

              {/* DAYS CHECKMARKS */}
              <div className="grid grid-cols-6 gap-1.5 pt-2">
                {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day, i) => (
                  <div
                    key={day}
                    className={`py-2 rounded-xl text-xs font-black flex flex-col items-center gap-1 ${
                      i < userStreak
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-[10px]">{i < userStreak ? '✓' : '·'}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsStreakModalOpen(false)}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-full py-3 rounded-2xl font-black text-xs shadow-md cursor-pointer"
              >
                C'est parti !
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 8. LEVEL & XP MODAL (EXPLICIT ON CLICK ON ⚡ ONLY)                        */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isXPModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsXPModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-[#10121A] text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-center p-6 space-y-5"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsXPModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl">
                ⚡
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{levelTitle}</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Tu as accumulé <span className="text-purple-400 font-extrabold">{userXP} XP</span>.
                </p>
              </div>

              {/* XP PROGRESS BAR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-400">
                  <span>Niveau 2</span>
                  <span>{userXP} / 25 XP</span>
                  <span>Niveau 3</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (userXP / 25) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Encore {Math.max(0, 25 - userXP)} XP pour débloquer le Niveau 3 !
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsXPModalOpen(false)}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-full py-3 rounded-2xl font-black text-xs shadow-md cursor-pointer"
              >
                Continuer à réviser
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* 9. RECENT CONVERSATIONS SIDEBAR DRAWER                                   */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRecentConversationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecentConversationsOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl h-full flex flex-col z-10 text-left"
            >
              {/* HEADER */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center font-black">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#161922] dark:text-white text-base">
                      Discussions récentes
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Historique de tes questions Nova IA
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecentConversationsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SEARCH */}
              <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-zinc-800 space-y-2.5">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={recentConversationsSearch}
                    onChange={(e) => setRecentConversationsSearch(e.target.value)}
                    placeholder="Rechercher dans l'historique..."
                    className="w-full bg-slate-100 dark:bg-zinc-800/80 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-[#161922] dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-hidden"
                  />
                  {recentConversationsSearch && (
                    <button
                      type="button"
                      onClick={() => setRecentConversationsSearch('')}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* FILTERS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'Toutes' },
                    { id: 'coach', label: 'Coaching' },
                    { id: 'solve', label: 'Corrigés' },
                    { id: 'exam', label: 'Quiz' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setConversationFilterMode(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        conversationFilterMode === f.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                {conversations
                  .filter((conv) => {
                    const matchQuery =
                      conv.query.toLowerCase().includes(recentConversationsSearch.toLowerCase()) ||
                      conv.answer.toLowerCase().includes(recentConversationsSearch.toLowerCase());
                    const matchMode = conversationFilterMode === 'all' || conv.mode === conversationFilterMode;
                    return matchQuery && matchMode;
                  })
                  .map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        handleSendQuery(conv.query, (conv.mode as ResponseMode) || 'coach');
                        setIsRecentConversationsOpen(false);
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-purple-50/50 dark:bg-zinc-800/60 dark:hover:bg-purple-950/20 border border-slate-200 dark:border-zinc-800 hover:border-purple-300 rounded-2xl transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          {conv.mode === 'solve' ? 'Corrigé' : conv.mode === 'exam' ? 'Quiz' : 'Coaching'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{conv.timestamp}</span>
                      </div>

                      <h4 className="font-extrabold text-xs sm:text-sm text-[#161922] dark:text-white line-clamp-2 mt-1.5 group-hover:text-purple-600 transition-colors">
                        {conv.query}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-medium">
                        {conv.answer.replace(/[#*`_$\\]/g, '')}
                      </p>
                    </div>
                  ))}

                {conversations.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Aucune discussion précédente.
                  </div>
                )}
              </div>

              {/* FOOTER */}
              {conversations.length > 0 && (
                <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setConversations([]);
                      try {
                        localStorage.removeItem('chronostudy_dashboard_conversations');
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tout effacer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRecentConversationsOpen(false);
                      handleStartNewChat();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Nouvelle question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ONBOARDING QUIZ MODAL (FIRST LAUNCH OR USER TRIGGERED)                   */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <NovaOnboardingQuizModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userSettings={userSettings || DEFAULT_USER_SETTINGS}
        onSaveUserSettings={(settings) => {
          if (onSaveUserSettings) onSaveUserSettings(settings);
          setIsOnboardingOpen(false);
          if (onAwardXP) onAwardXP(50, 'Profil d’apprentissage Nova configuré !');
        }}
        subjects={subjects}
        onAwardXP={onAwardXP}
      />

    </div>
  );
};
