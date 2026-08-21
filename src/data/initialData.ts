import {
  FlashcardDeck,
  Task,
  StudyDocument,
  ScheduleSession,
  StudySessionLog,
  SubjectMetric,
  CustomWidget,
  StudyGroup,
  DashboardWidgetConfig,
  AcademicSubject,
  TrashItem,
} from '../types';

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  {
    id: 'layout-sys-tasks',
    title: 'Tâches & Projets Académiques',
    category: 'education',
    type: 'system_tasks',
    colSpan: 2,
    enabled: true,
    order: 0,
    icon: '✅',
    color: '#10b981',
  },
  {
    id: 'layout-sys-decks',
    title: 'ChronoStudy — Decks & Active Recall',
    category: 'active_recall',
    type: 'system_decks',
    colSpan: 1,
    enabled: true,
    order: 1,
    icon: '📚',
    color: '#06b6d4',
  },
  {
    id: 'layout-sys-schedule',
    title: 'Planning Hebdomadaire & Cours',
    category: 'planning',
    type: 'system_schedule',
    colSpan: 2,
    enabled: true,
    order: 2,
    icon: '📅',
    color: '#6366f1',
  },
  {
    id: 'layout-sys-time-budget',
    title: 'Budget Temps d\'Étude & Répartition',
    category: 'study_budget',
    type: 'system_time_budget',
    colSpan: 1,
    enabled: true,
    order: 3,
    icon: '⏱️',
    color: '#f59e0b',
  },
  {
    id: 'layout-sys-mastery',
    title: 'Maîtrise Disciplinaire & Analytics',
    category: 'education',
    type: 'system_mastery',
    colSpan: 1,
    enabled: true,
    order: 4,
    icon: '📊',
    color: '#8b5cf6',
  },
  {
    id: 'layout-sys-notes',
    title: 'Formules, Concepts & Journal d\'Étude',
    category: 'education',
    type: 'system_notes',
    colSpan: 2,
    enabled: true,
    order: 5,
    icon: '📝',
    color: '#64748b',
  },
  {
    id: 'layout-custom-countdown',
    title: 'Décompte Concours & Examens',
    category: 'exam',
    type: 'custom',
    customWidgetRefId: 'w-exam-countdown',
    colSpan: 1,
    enabled: true,
    order: 6,
    icon: '🎯',
    color: '#ef4444',
  },
  {
    id: 'layout-custom-recall',
    title: 'Rétention Active Recall SM-2',
    category: 'active_recall',
    type: 'custom',
    customWidgetRefId: 'w-recall-retention',
    colSpan: 1,
    enabled: true,
    order: 7,
    icon: '🧠',
    color: '#06b6d4',
  },
  {
    id: 'layout-custom-streak',
    title: 'Régularité & Séries de Révision',
    category: 'education',
    type: 'custom',
    customWidgetRefId: 'w-study-streak',
    colSpan: 1,
    enabled: true,
    order: 8,
    icon: '⚡',
    color: '#10b981',
  },
];

export const INITIAL_WIDGETS: CustomWidget[] = [
  {
    id: 'w-exam-countdown',
    title: 'Décompte Concours & Examens',
    category: 'exam',
    type: 'countdown',
    value: '14 jours',
    target: 14,
    unit: 'jours',
    color: '#ef4444',
    icon: '🎯',
    description: 'Échéance officielle des examens finaux de semestre.',
    createdAt: new Date().toISOString(),
    enabledOnDashboard: true,
  },
  {
    id: 'w-recall-retention',
    title: 'Rétention Active Recall SM-2',
    category: 'active_recall',
    type: 'chart',
    value: '92.4%',
    target: 95,
    unit: '%',
    color: '#06b6d4',
    icon: '🧠',
    description: 'Taux moyen de rétention mnémotechnique après 4 répétitions espacées.',
    chartData: [
      { label: 'Sem 1', value: 78 },
      { label: 'Sem 2', value: 84 },
      { label: 'Sem 3', value: 89 },
      { label: 'Sem 4', value: 92 },
      { label: 'Sem 5', value: 94 },
      { label: 'Sem 6', value: 96 },
    ],
    createdAt: new Date().toISOString(),
    enabledOnDashboard: true,
  },
  {
    id: 'w-study-streak',
    title: 'Régularité & Séries de Révision',
    category: 'education',
    type: 'habit_streak',
    value: '14 jours',
    target: 21,
    unit: 'jours',
    color: '#10b981',
    icon: '⚡',
    description: 'Série consécutive de sessions d\'études et révisions validées.',
    streakDays: [true, true, true, true, true, true, true],
    createdAt: new Date().toISOString(),
    enabledOnDashboard: true,
  },
  {
    id: 'w-time-budget',
    title: 'Budget Heures de Focus Mensuel',
    category: 'study_budget',
    type: 'time_budget',
    value: '68 / 80h',
    target: 80,
    unit: 'heures',
    color: '#f59e0b',
    icon: '⏱️',
    description: 'Budget temps alloué aux matières prioritaires ce mois-ci.',
    chartData: [
      { label: 'Maths', value: 24 },
      { label: 'Physique', value: 18 },
      { label: 'Info/IA', value: 16 },
      { label: 'Philo', value: 10 },
    ],
    createdAt: new Date().toISOString(),
    enabledOnDashboard: true,
  }
];

export const OFFICIAL_CURRICULUM_OPTIONS = [
  { name: 'Mathématiques', category: 'Scientifique', color: '#3b82f6', icon: '📐' },
  { name: 'Physique-Chimie', category: 'Scientifique', color: '#8b5cf6', icon: '⚛️' },
  { name: 'Maths Spé & Expertes', category: 'Scientifique', color: '#2563eb', icon: '🔢' },
  { name: 'Français & Littérature', category: 'Littéraire', color: '#f59e0b', icon: '📖' },
  { name: 'SES (Sciences Éco & Sociales)', category: 'Sciences Humaines', color: '#10b981', icon: '📊' },
  { name: "Sciences de l'Ingénieur (SI)", category: 'Scientifique', color: '#06b6d4', icon: '⚙️' },
  { name: 'SVT (Sciences de la Vie & Terre)', category: 'Scientifique', color: '#10b981', icon: '🌿' },
  { name: 'HGGSP (Histoire-Géo & Géopolitique)', category: 'Sciences Humaines', color: '#ec4899', icon: '🌍' },
  { name: 'HLP (Humanités, Littérature & Philo)', category: 'Littéraire', color: '#d946ef', icon: '🏛️' },
  { name: 'NSI (Numérique & Informatique)', category: 'Scientifique', color: '#0ea5e9', icon: '💻' },
  { name: 'Enseignement Scientifique', category: 'Scientifique', color: '#14b8a6', icon: '🔬' },
  { name: 'Anglais (LVA / LVB)', category: 'Langues', color: '#6366f1', icon: '🇬🇧' },
  { name: 'Allemand', category: 'Langues', color: '#eab308', icon: '🇩🇪' },
  { name: 'Espagnol', category: 'Langues', color: '#f97316', icon: '🇪🇸' },
  { name: 'AMC (Anglais Monde Contemporain)', category: 'Langues', color: '#8b5cf6', icon: '🌐' },
  { name: 'Philosophie', category: 'Littéraire', color: '#f43f5e', icon: '💡' },
  { name: 'Histoire-Géographie', category: 'Sciences Humaines', color: '#ea580c', icon: '📜' },
];

export const INITIAL_ACADEMIC_SUBJECTS: AcademicSubject[] = [
  {
    id: 'sub-maths',
    name: 'Mathématiques',
    code: 'MATH-01',
    category: 'Scientifique',
    color: '#3b82f6',
    icon: '📐',
    enabled: true,
    targetWeeklyHours: 8,
    chapters: [
      {
        id: 'chap-math-1',
        title: 'Chapitre 1 : Analyse & Dérivation avancée',
        description: 'Fonctions usuelles, développements limités, continuité et dérivabilité sur ℝ.',
        order: 1,
        deckIds: ['deck-1'],
        completed: false,
        documents: [
          {
            id: 'cdoc-m1',
            title: 'Fiche Synthèse - Théorèmes Fondamentaux Analyse',
            content: '# Analyse & Calcul Différentiel\n\n## 1. Théorème des Valeurs Intermédiaires\nSoit f : [a, b] → ℝ une fonction continue. Pour tout réel k compris entre f(a) et f(b), il existe au moins un c ∈ [a, b] tel que f(c) = k.\n\n## 2. Développements Limités en 0\n- sin(x) = x - x³/6 + o(x³)\n- cos(x) = 1 - x²/2 + o(x²)\n- ln(1+x) = x - x²/2 + x³/3 + o(x³)',
            type: 'text',
            fileName: 'Fiche_Theoremes_Analyse.md',
            fileSize: 4200,
            addedAt: '2026-08-15',
            tags: ['Analyse', 'Fiche', 'Maths'],
          },
        ],
      },
      {
        id: 'chap-math-2',
        title: 'Chapitre 2 : Algèbre linéaire & Matrices',
        description: 'Espaces vectoriels, applications linéaires, diagonalisation et déterminants.',
        order: 2,
        deckIds: [],
        completed: true,
        documents: [
          {
            id: 'cdoc-m2',
            title: 'Polycopié Cours - Espaces Vectoriels & Diagonalisation',
            content: '# Algèbre Linéaire\n\n- Définition d\'une famille libre et génératrice.\n- Théorème du rang : dim(E) = dim(Ker f) + dim(Im f).\n- Calcul des valeurs propres det(A - λI) = 0.',
            type: 'pdf',
            fileName: 'Cours_Algebre_Lineaire_Complet.pdf',
            fileSize: 184000,
            addedAt: '2026-08-10',
            tags: ['Algèbre', 'Matrices'],
          },
        ],
      },
    ],
  },
  {
    id: 'sub-physique',
    name: 'Physique-Chimie',
    code: 'PHYS-01',
    category: 'Scientifique',
    color: '#8b5cf6',
    icon: '⚛️',
    enabled: true,
    targetWeeklyHours: 6,
    chapters: [
      {
        id: 'chap-phys-1',
        title: 'Chapitre 1 : Électromagnétisme & Lois de Maxwell',
        description: 'Équations de Maxwell dans le vide et dans la matière, ondes EM et induction.',
        order: 1,
        deckIds: ['deck-2'],
        completed: false,
        documents: [
          {
            id: 'cdoc-p1',
            title: 'Formulaire Essentiel - 4 Lois de Maxwell',
            content: '# Électromagnétisme\n\n1. div E = ρ / ε₀ (Maxwell-Gauss)\n2. div B = 0 (Maxwell-Thomson)\n3. rot E = -∂B/∂t (Maxwell-Faraday)\n4. rot B = μ₀ j + μ₀ε₀ ∂E/∂t (Maxwell-Ampère)',
            type: 'text',
            fileName: 'Formulaire_Maxwell.txt',
            fileSize: 2800,
            addedAt: '2026-08-12',
            tags: ['Électromagnétisme', 'Formules'],
          },
        ],
      },
    ],
  },
  {
    id: 'sub-nsi',
    name: 'NSI (Numérique & Informatique)',
    code: 'NSI-01',
    category: 'Scientifique',
    color: '#0ea5e9',
    icon: '💻',
    enabled: true,
    targetWeeklyHours: 5,
    chapters: [
      {
        id: 'chap-nsi-1',
        title: 'Chapitre 1 : Algorithmique avancée & Structures',
        description: 'Arbres binaires, graphes, programmation dynamique et complexité asymptotique.',
        order: 1,
        deckIds: [],
        completed: false,
        documents: [
          {
            id: 'cdoc-n1',
            title: 'Cours Audio - Arbres Binaires de Recherche & DFS',
            content: 'Audio récapitulatif des parcours infixe, préfixe et suffixe des arbres binaires.',
            type: 'audio',
            fileName: 'Podcast_Arbres_Binaires.mp3',
            audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
            fileSize: 3200000,
            addedAt: '2026-08-16',
            tags: ['NSI', 'Audio', 'Algorithmes'],
          },
        ],
      },
    ],
  },
  {
    id: 'sub-svt',
    name: 'SVT (Sciences de la Vie & Terre)',
    code: 'SVT-01',
    category: 'Scientifique',
    color: '#10b981',
    icon: '🌿',
    enabled: true,
    targetWeeklyHours: 4,
    chapters: [
      {
        id: 'chap-svt-1',
        title: 'Chapitre 1 : Génétique, diversité & Dynamique des populations',
        description: 'Méiose, fécondation, brassage inter/intra-chromosomique et sélection naturelle.',
        order: 1,
        deckIds: [],
        completed: false,
        documents: [],
      },
    ],
  },
  {
    id: 'sub-philo',
    name: 'Philosophie',
    code: 'PHIL-01',
    category: 'Littéraire',
    color: '#f43f5e',
    icon: '💡',
    enabled: true,
    targetWeeklyHours: 3,
    chapters: [
      {
        id: 'chap-phil-1',
        title: 'Chapitre 1 : La Conscience, l\'Inconscient & le Sujet',
        description: 'Descartes, Freud, Kant, Sartre et l\'émergence de la subjectivité.',
        order: 1,
        deckIds: [],
        completed: false,
        documents: [],
      },
    ],
  },
  {
    id: 'sub-anglais',
    name: 'Anglais (LVA / LVB)',
    code: 'ANG-01',
    category: 'Langues',
    color: '#6366f1',
    icon: '🇬🇧',
    enabled: true,
    targetWeeklyHours: 3,
    chapters: [],
  },
];

export const INITIAL_TRASH_ITEMS: TrashItem[] = [
  {
    id: 'trash-demo-1',
    originalId: 'deck-archive-old',
    type: 'deck',
    title: 'Ancien Deck - Vocabulaire Espagnol B1',
    description: 'Cartes mémoires archivées de l\'année précédente.',
    subject: 'Espagnol',
    fileCategory: 'deck',
    deletedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      id: 'deck-archive-old',
      title: 'Vocabulaire Espagnol B1',
      subject: 'Espagnol',
      description: 'Cartes mémoires archivées.',
      color: '#f97316',
      cards: [],
    },
  },
  {
    id: 'trash-demo-2',
    originalId: 'doc-archive-1',
    type: 'document',
    title: 'Brouillon_TD3_Optique.pdf',
    description: 'Fichier PDF de brouillon d\'exercices résolus.',
    subject: 'Physique-Chimie',
    fileCategory: 'pdf',
    size: 245000,
    deletedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      id: 'doc-archive-1',
      name: 'Brouillon_TD3_Optique.pdf',
      size: 245000,
      type: 'application/pdf',
      uploadDate: '12/08/2026',
      content: 'Contenu archivé TD Optique ondulatoire.',
    },
  },
];

export const INITIAL_SUBJECTS = ['Mathématiques', 'Physique-Chimie', 'SVT & Biologie', 'Informatique & IA', 'Philosophie', 'Langues (Anglais)'];

export const SUBJECT_COLORS: Record<string, string> = {
  'Mathématiques': '#3b82f6',
  'Physique-Chimie': '#8b5cf6',
  'SVT & Biologie': '#10b981',
  'Informatique & IA': '#06b6d4',
  'Philosophie': '#f59e0b',
  'Langues (Anglais)': '#ec4899',
};

export const INITIAL_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'Analyse & Calcul Différentiel',
    subject: 'Mathématiques',
    description: 'Théorèmes fondamentaux, dérivées usuelles, limites et développements limités.',
    color: '#3b82f6',
    difficulty: 'Avancé',
    tags: ['Analyse', 'Calcul', 'L2'],
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c1',
        question: "Quelle est la dérivée de f(x) = ln(x) ?",
        answer: "f'(x) = 1 / x pour tout x > 0.",
        type: 'classic',
        intervalDays: 4,
        easinessFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 3,
        lastEvaluated: 'easy'
      },
      {
        id: 'c2',
        question: "Énoncer le Théorème des Valeurs Intermédiaires (TVI).",
        answer: "Si f est continue sur [a, b], alors pour tout k entre f(a) et f(b), il existe au moins un c ∈ [a, b] tel que f(c) = k.",
        type: 'classic',
        intervalDays: 2,
        easinessFactor: 2.3,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'medium'
      },
      {
        id: 'c3',
        question: "Développement limité en 0 à l'ordre 3 de sin(x) ?",
        answer: "sin(x) = x - x³/6 + o(x³)",
        type: 'classic',
        intervalDays: 1,
        easinessFactor: 2.1,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 1,
        lastEvaluated: 'hard'
      },
      {
        id: 'c3-qcm',
        question: "Quelle est la limite de (sin x)/x quand x tend vers 0 ?",
        answer: "1",
        type: 'qcm',
        options: [
          { id: 'o1', text: '0', isCorrect: false },
          { id: 'o2', text: '1', isCorrect: true, explanation: "C'est la dérivée du sinus en 0." },
          { id: 'o3', text: '+∞', isCorrect: false },
          { id: 'o4', text: 'Indéterminée', isCorrect: false }
        ],
        intervalDays: 3,
        easinessFactor: 2.4,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'easy'
      }
    ]
  },
  {
    id: 'deck-2',
    title: 'Physique Quantique & Électromagnétisme',
    subject: 'Physique-Chimie',
    description: 'Lois de Maxwell, dualité onde-corpuscule et équation de Schrödinger.',
    color: '#8b5cf6',
    difficulty: 'Expert',
    tags: ['Physique', 'Maxwell', 'Quantique'],
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c4',
        question: "Quelle est l'expression de la loi de Maxwell-Faraday ?",
        answer: "rot(E) = - ∂B / ∂t (Traduit l'induction électromagnétique)",
        type: 'classic',
        intervalDays: 3,
        easinessFactor: 2.4,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'easy'
      },
      {
        id: 'c5',
        question: "Quelle est la relation de Planck-Einstein pour l'énergie d'un photon ?",
        answer: "E = h·ν = ħ·ω où h est la constante de Planck et ν la fréquence.",
        type: 'classic',
        intervalDays: 1,
        easinessFactor: 2.2,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 1,
        lastEvaluated: 'medium'
      },
      {
        id: 'c6',
        question: "Équation de Schrödinger indépendante du temps ?",
        answer: "Ĥ |Ψ⟩ = E |Ψ⟩ où Ĥ est l'opérateur hamiltonien.",
        type: 'classic',
        intervalDays: 2,
        easinessFactor: 2.0,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'hard'
      }
    ]
  },
  {
    id: 'deck-3',
    title: 'Structures de Données & Algorithmes Avancés',
    subject: 'Informatique & IA',
    description: 'Arbres AVL, Graphes de Dijkstra, Programmation Dynamique & Complexités.',
    color: '#06b6d4',
    difficulty: 'Avancé',
    tags: ['Algo', 'Graphes', 'Python'],
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c7',
        question: "Quelle est la complexité temporelle moyenne de la recherche dans un Arbre Binaire de Recherche (ABR) équilibré ?",
        answer: "O(log n).",
        type: 'classic',
        intervalDays: 5,
        easinessFactor: 2.6,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 4,
        lastEvaluated: 'easy'
      },
      {
        id: 'c8',
        question: "Quelle est la différence fondamentale entre les parcours BFS et DFS ?",
        answer: "BFS (largeur) explore couche par couche avec une file FIFO ; DFS (profondeur) explore au plus profond avec une pile LIFO / récursion.",
        type: 'classic',
        intervalDays: 3,
        easinessFactor: 2.3,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'medium'
      },
      {
        id: 'c9',
        question: "Dans quel cas l'algorithme de Dijkstra est-il mis en défaut ?",
        answer: "Lorsque le graphe contient des arêtes à poids strictement négatifs (utiliser alors Bellman-Ford).",
        type: 'classic',
        intervalDays: 2,
        easinessFactor: 2.2,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 1,
        lastEvaluated: 'easy'
      }
    ]
  },
  {
    id: 'deck-4',
    title: 'Philosophie : Conscience, Travail & Vérité',
    subject: 'Philosophie',
    description: 'Citations, repères conceptuels et thèses de Descartes, Kant, Hegel et Nietzsche.',
    color: '#f59e0b',
    difficulty: 'Moyen',
    tags: ['Philo', 'Bac', 'Dissertation'],
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c10',
        question: "Que signifie la formule de Sartre : « L'existence précède l'essence » ?",
        answer: "L'homme n'est pas prédéfini par une nature divine ou biologique ; il se définit et se crée continuellement par ses choix et ses actes libres.",
        type: 'classic',
        intervalDays: 4,
        easinessFactor: 2.4,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 3,
        lastEvaluated: 'easy'
      },
      {
        id: 'c11',
        question: "Quelle distinction Kant opère-t-il entre impératif hypothétique et impératif catégorique ?",
        answer: "L'impératif hypothétique prescrit une action comme moyen d'atteindre une fin souhaitée (« Si tu veux X, fais Y »). L'impératif catégorique commande l'action inconditionnellement par pur devoir moral.",
        type: 'classic',
        intervalDays: 2,
        easinessFactor: 2.1,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 2,
        lastEvaluated: 'medium'
      }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Réviser le chapitre 4 : Lois de Maxwell & Ondes',
    subject: 'Physique-Chimie',
    estimatedMinutes: 60,
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    dueDate: 'Demain',
    subtasks: [
      { id: 'st-1', title: 'Relire les notes de cours et équations', completed: true },
      { id: 'st-2', title: 'Faire les exercices d\'entraînement p.142', completed: false },
      { id: 'st-3', title: 'Créer 5 flashcards sur les équations', completed: false }
    ]
  },
  {
    id: 't-2',
    title: 'Préparer le TD d\'Algorithmique & Graphes de Dijkstra',
    subject: 'Informatique & IA',
    estimatedMinutes: 45,
    priority: 'high',
    status: 'todo',
    createdAt: new Date().toISOString(),
    dueDate: 'Dans 2 jours',
    subtasks: [
      { id: 'st-4', title: 'Implémenter l\'algorithme de Dijkstra en TypeScript', completed: false },
      { id: 'st-5', title: 'Calculer les complexités spatiale et temporelle', completed: false }
    ]
  },
  {
    id: 't-3',
    title: 'Fiche de synthèse : La Conscience et la Liberté',
    subject: 'Philosophie',
    estimatedMinutes: 30,
    priority: 'medium',
    status: 'completed',
    createdAt: new Date().toISOString(),
    dueDate: 'Hier',
    subtasks: [
      { id: 'st-6', title: 'Citer Descartes, Kant et Sartre', completed: true },
      { id: 'st-7', title: 'Rédiger une introduction type bac', completed: true }
    ]
  },
  {
    id: 't-4',
    title: 'Session Active Recall : 25 Flashcards Mathématiques',
    subject: 'Mathématiques',
    estimatedMinutes: 20,
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    dueDate: 'Aujourd\'hui',
    subtasks: [
      { id: 'st-8', title: 'Réviser 15 cartes du deck Analyse', completed: true },
      { id: 'st-9', title: 'Auto-évaluer la maîtrise SM-2', completed: false }
    ]
  }
];

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-1',
    name: 'Cours_Analyse_Mathematique_L2.txt',
    size: 24500,
    type: 'text/plain',
    uploadDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('fr-FR'),
    content: `CHAPITRE 3 : SUITES ET SÉRIES DE FONCTIONS
1. Convergence Simple et Convergence Uniforme
Soit (fn) une suite de fonctions définies sur un intervalle I à valeurs dans R.
On dit que fn converge simplement vers f sur I si pour tout x ∈ I, la suite numérique fn(x) converge vers f(x).

Définition de la convergence uniforme :
Sup_{x ∈ I} |fn(x) - f(x)| ---> 0 lorsque n ---> +∞.

Théorème de continuité de la limite :
Si chaque fn est continue sur I et si (fn) converge uniformément vers f sur I, alors la fonction limite f est continue sur I.

2. Séries de Fourier
Soit f une fonction 2π-périodique et intégrable.
Coefficients de Fourier :
a_0(f) = (1/2π) ∫_{-π}^{π} f(t) dt
a_n(f) = (1/π) ∫_{-π}^{π} f(t) cos(nt) dt
b_n(f) = (1/π) ∫_{-π}^{π} f(t) sin(nt) dt`,
    aiAnalysis: {
      summary: "Synthèse sur la convergence simple vs uniforme des suites de fonctions et introduction aux Séries de Fourier.",
      keyConcepts: [
        "Convergence simple vs Convergence uniforme",
        "Transfert de continuité par convergence uniforme",
        "Coefficients de Fourier (a0, an, bn)"
      ],
      formulasAndDefs: [
        "Convergence uniforme : lim (n->∞) sup |fn(x) - f(x)| = 0",
        "Coefficients a_n = (1/π) ∫ f(t) cos(nt) dt"
      ],
      studySuggestions: [
        "S'entraîner sur la preuve du théorème de transfert de continuité",
        "Calculer les coefficients de Fourier pour une fonction créneau"
      ],
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: 'doc-2',
    name: 'Fiche_Physique_Quantique_Notes.md',
    size: 18200,
    type: 'text/markdown',
    uploadDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('fr-FR'),
    content: `# Fiche Révision Physique Quantique

## 1. Postulats de la Mécanique Quantique
- **Postulat 1 (État quantique)** : L'état d'un système est décrit par un vecteur d'onde |Ψ⟩ dans un espace d'Hilbert.
- **Postulat 2 (Observables)** : À toute grandeur physique correspond un opérateur hermitique Â.
- **Équation de Schrödinger** : iħ ∂|Ψ⟩/∂t = Ĥ|Ψ⟩

## 2. Effet Photoélectrique
Explication par Einstein (1905) : L'énergie d'un photon est E = h·ν.
Si h·ν > W (travail d'extraction), l'électron est éjecté avec une énergie cinétique Ec = h·ν - W.`
  }
];

export const INITIAL_SCHEDULE: ScheduleSession[] = [
  { id: 'sch-1', day: 'Lundi', timeSlot: 'Matin', subject: 'Mathématiques', topic: 'Calcul Différentiel & Intégrales', durationMinutes: 120, completed: true, color: '#3b82f6' },
  { id: 'sch-2', day: 'Lundi', timeSlot: 'Après-midi', subject: 'Physique-Chimie', topic: 'Lois de Maxwell TD', durationMinutes: 90, completed: true, color: '#8b5cf6' },
  { id: 'sch-3', day: 'Mardi', timeSlot: 'Matin', subject: 'Informatique & IA', topic: 'Algorithmique & Graphes', durationMinutes: 120, completed: true, color: '#06b6d4' },
  { id: 'sch-4', day: 'Mardi', timeSlot: 'Soir', subject: 'Philosophie', topic: 'Lecture Descartes / Fiche', durationMinutes: 60, completed: false, color: '#f59e0b' },
  { id: 'sch-5', day: 'Mercredi', timeSlot: 'Matin', subject: 'SVT & Biologie', topic: 'Génétique & ADN', durationMinutes: 90, completed: false, color: '#10b981' },
  { id: 'sch-6', day: 'Jeudi', timeSlot: 'Après-midi', subject: 'Mathématiques', topic: 'Exercices d\'Analyse Complexité', durationMinutes: 120, completed: false, color: '#3b82f6' },
  { id: 'sch-7', day: 'Vendredi', timeSlot: 'Matin', subject: 'Langues (Anglais)', topic: 'Vocabulaire Académique & Essay', durationMinutes: 60, completed: false, color: '#ec4899' },
  { id: 'sch-8', day: 'Samedi', timeSlot: 'Matin', subject: 'Physique-Chimie', topic: 'Annales d\'Examens', durationMinutes: 150, completed: false, color: '#8b5cf6' },
  { id: 'sch-9', day: 'Dimanche', timeSlot: 'Après-midi', subject: 'Informatique & IA', topic: 'Projet Code & Tests', durationMinutes: 120, completed: false, color: '#06b6d4' }
];

export const INITIAL_LOGS: StudySessionLog[] = [
  { id: 'log-1', date: '2026-08-01', durationMinutes: 120, subject: 'Mathématiques', type: 'pomodoro' },
  { id: 'log-2', date: '2026-08-02', durationMinutes: 90, subject: 'Physique-Chimie', type: 'pomodoro' },
  { id: 'log-3', date: '2026-08-03', durationMinutes: 110, subject: 'Informatique & IA', type: 'pomodoro' },
  { id: 'log-4', date: '2026-08-04', durationMinutes: 150, subject: 'Mathématiques', type: 'manual' },
  { id: 'log-5', date: '2026-08-05', durationMinutes: 80, subject: 'Philosophie', type: 'flashcards' },
  { id: 'log-6', date: '2026-08-06', durationMinutes: 140, subject: 'Physique-Chimie', type: 'pomodoro' },
];

export const INITIAL_SUBJECT_METRICS: SubjectMetric[] = [
  { subject: 'Mathématiques', hours: 14.5, color: '#3b82f6', masteryPercentage: 88 },
  { subject: 'Physique-Chimie', hours: 11.0, color: '#8b5cf6', masteryPercentage: 75 },
  { subject: 'Informatique & IA', hours: 9.5, color: '#06b6d4', masteryPercentage: 92 },
  { subject: 'Philosophie', hours: 5.0, color: '#f59e0b', masteryPercentage: 65 },
  { subject: 'SVT & Biologie', hours: 4.0, color: '#10b981', masteryPercentage: 70 },
  { subject: 'Langues (Anglais)', hours: 3.5, color: '#ec4899', masteryPercentage: 85 },
];

export const INITIAL_GROUPS: StudyGroup[] = [
  {
    id: 'grp-medecine',
    name: 'Club Médecine Pass / Las 🩺',
    description: 'Entraide pour la première année de santé : anatomie, pharmacologie, histologie et QCMs chronométrés.',
    category: 'Médecine & Santé',
    code: 'MED-2026',
    isPrivate: false,
    avatarEmoji: '🩺',
    color: '#ef4444',
    weeklyGoalHours: 25,
    announcement: '🔥 Session QCM Anatomie ce jeudi à 18h ! Pensez à réviser le deck d\'Osteologie du membre supérieur.',
    isUserMember: true,
    createdAt: '2026-07-15',
    members: [
      { id: 'm-user', name: 'Julien Dupont (Vous)', avatar: 'JD', role: 'leader', studyMinutesThisWeek: 680, cardsMastered: 142, currentStreak: 14, status: 'studying', joinedAt: '2026-07-15' },
      { id: 'm-1', name: 'Camille Moreau', avatar: 'CM', role: 'co-leader', studyMinutesThisWeek: 820, cardsMastered: 185, currentStreak: 21, status: 'online', joinedAt: '2026-07-16' },
      { id: 'm-2', name: 'Lucas Benali', avatar: 'LB', role: 'member', studyMinutesThisWeek: 540, cardsMastered: 98, currentStreak: 9, status: 'offline', joinedAt: '2026-07-18' },
      { id: 'm-3', name: 'Inès Lefebvre', avatar: 'IL', role: 'member', studyMinutesThisWeek: 420, cardsMastered: 84, currentStreak: 6, status: 'online', joinedAt: '2026-07-20' },
      { id: 'm-4', name: 'Thomas Bernard', avatar: 'TB', role: 'member', studyMinutesThisWeek: 310, cardsMastered: 60, currentStreak: 4, status: 'offline', joinedAt: '2026-07-22' },
    ],
    sharedDecks: [
      {
        id: 'sd-1',
        title: 'Anatomie : Squelette & Ostéologie',
        subject: 'Médecine',
        description: '25 cartes clés sur la colonne vertébrale, cage thoracique et ceintures scapulaires.',
        cardCount: 25,
        color: '#ef4444',
        sharedBy: 'Camille Moreau',
        sharedByAvatar: 'CM',
        downloads: 48,
        likes: 19,
        cards: [
          { question: "Combien de vertèbres composent la colonne vertébrale humaine ?", answer: "33 vertèbres (7 cervicales, 12 thoraciques, 5 lombaires, 5 sacrées soudées, 4 coccygiennes)." },
          { question: "Quel est l'os le plus long du corps humain ?", answer: "Le fémur." },
          { question: "Quelle est la particularité de l'os hyoïde ?", answer: "C'est le seul os du squelette qui ne s'articule directement avec aucun autre os." },
        ],
      },
      {
        id: 'sd-2',
        title: 'Pharmacologie & Récepteurs Moléculaires',
        subject: 'Médecine',
        description: 'Fiches de mémorisation sur les agonistes, antagonistes et cibles enzymatiques.',
        cardCount: 18,
        color: '#f97316',
        sharedBy: 'Julien Dupont',
        sharedByAvatar: 'JD',
        downloads: 32,
        likes: 12,
        cards: [
          { question: "Définition d'un agoniste pur en pharmacologie ?", answer: "Molécule se liant à un récepteur et provoquant un effet biologique maximal identique au ligand endogène." },
          { question: "Qu'est-ce que la clairance rénale d'un médicament ?", answer: "Le volume de plasma totalement débarrassé de la substance par unité de temps par les reins." },
        ],
      },
    ],
    activityFeed: [
      { id: 'act-1', userName: 'Camille Moreau', userAvatar: 'CM', type: 'deck_shared', content: 'a partagé un nouveau deck : Anatomie : Squelette & Ostéologie', timestamp: 'Il y a 2 heures', deckTitle: 'Anatomie : Squelette & Ostéologie', deckId: 'sd-1' },
      { id: 'act-2', userName: 'Julien Dupont', userAvatar: 'JD', type: 'milestone_reached', content: 'a atteint la série de 14 jours d\'étude consécutifs ! 🎉', timestamp: 'Hier' },
      { id: 'act-3', userName: 'Lucas Benali', userAvatar: 'LB', type: 'session_completed', content: 'a complété 3 sessions Pomodoro en Biochimie (75 min)', timestamp: 'Hier' },
      { id: 'act-4', userName: 'Inès Lefebvre', userAvatar: 'IL', type: 'joined', content: 'a rejoint le groupe de révision.', timestamp: 'Il y a 3 jours' },
    ],
  },
  {
    id: 'grp-dev-ia',
    name: 'Fullstack & IA Devs 💻',
    description: 'Entraînement algorithmique, React, TypeScript, Python & Architectures d\'IA Générative.',
    category: 'Informatique & Tech',
    code: 'CODE-42',
    isPrivate: false,
    avatarEmoji: '💻',
    color: '#06b6d4',
    weeklyGoalHours: 20,
    announcement: '🚀 Challenge LeetCode/Flashcards sur les Algorithmes de Graphes ce week-end !',
    isUserMember: true,
    createdAt: '2026-07-10',
    members: [
      { id: 'm-user', name: 'Julien Dupont (Vous)', avatar: 'JD', role: 'member', studyMinutesThisWeek: 570, cardsMastered: 110, currentStreak: 14, status: 'studying', joinedAt: '2026-07-10' },
      { id: 'm-5', name: 'Alexandre Petit', avatar: 'AP', role: 'leader', studyMinutesThisWeek: 910, cardsMastered: 210, currentStreak: 28, status: 'online', joinedAt: '2026-07-10' },
      { id: 'm-6', name: 'Sarah Zhang', avatar: 'SZ', role: 'co-leader', studyMinutesThisWeek: 740, cardsMastered: 160, currentStreak: 19, status: 'online', joinedAt: '2026-07-11' },
      { id: 'm-7', name: 'Hugo Martin', avatar: 'HM', role: 'member', studyMinutesThisWeek: 480, cardsMastered: 75, currentStreak: 8, status: 'offline', joinedAt: '2026-07-14' },
    ],
    sharedDecks: [
      {
        id: 'sd-3',
        title: 'Algorithmes, Complexité O(N) & Graphes',
        subject: 'Informatique & IA',
        description: 'Concepts fondamentaux : BFS, DFS, Dijkstra, Dynamic Programming & Heuristiques.',
        cardCount: 30,
        color: '#06b6d4',
        sharedBy: 'Alexandre Petit',
        sharedByAvatar: 'AP',
        downloads: 76,
        likes: 34,
        cards: [
          { question: "Quelle est la différence entre BFS et DFS ?", answer: "BFS utilise une file FIFO et explore par niveau (parfait pour plus court chemin). DFS utilise une pile LIFO / récursion et explore en profondeur." },
          { question: "Complexité temporelle de l'algorithme de Dijkstra avec un tas binaire ?", answer: "O((V + E) log V) où V est le nombre de sommets et E le nombre d'arêtes." },
        ],
      },
    ],
    activityFeed: [
      { id: 'act-5', userName: 'Alexandre Petit', userAvatar: 'AP', type: 'session_completed', content: 'a complété un sprint de 120 min de code Python & LLM', timestamp: 'Il y a 1 heure' },
      { id: 'act-6', userName: 'Sarah Zhang', userAvatar: 'SZ', type: 'deck_shared', content: 'a partagé le deck Algorithmes & Graphes', timestamp: 'Il y a 5 heures', deckTitle: 'Algorithmes, Complexité O(N) & Graphes', deckId: 'sd-3' },
    ],
  },
  {
    id: 'grp-droit',
    name: 'Droit & Jurisprudence ⚖️',
    description: 'Droit constitutionnel, civil, pénal et commentaires d\'arrêt pour concours.',
    category: 'Droit & Sciences Politiques',
    code: 'LEX-789',
    isPrivate: false,
    avatarEmoji: '⚖️',
    color: '#f59e0b',
    weeklyGoalHours: 18,
    announcement: '📚 Fiches de synthèse sur la responsabilité civile contractuelle mises à jour.',
    isUserMember: false,
    createdAt: '2026-07-01',
    members: [
      { id: 'm-8', name: 'Élodie Caron', avatar: 'EC', role: 'leader', studyMinutesThisWeek: 620, cardsMastered: 130, currentStreak: 12, status: 'online', joinedAt: '2026-07-01' },
      { id: 'm-9', name: 'Antoine Roy', avatar: 'AR', role: 'member', studyMinutesThisWeek: 450, cardsMastered: 90, currentStreak: 7, status: 'offline', joinedAt: '2026-07-05' },
    ],
    sharedDecks: [
      {
        id: 'sd-4',
        title: 'Grands Arrêts du Droit Administratif (GAJA)',
        subject: 'Droit',
        description: 'Les 20 arrêts fondateurs du Conseil d\'État indispensables pour les examens.',
        cardCount: 20,
        color: '#f59e0b',
        sharedBy: 'Élodie Caron',
        sharedByAvatar: 'EC',
        downloads: 54,
        likes: 28,
        cards: [
          { question: "Portée de l'Arrêt Blanco (Tribunal des Conflits, 1873) ?", answer: "Consacre la compétence de la juridiction administrative et l'autonomie du droit administratif en matière de responsabilité de l'État." },
        ],
      },
    ],
    activityFeed: [
      { id: 'act-7', userName: 'Élodie Caron', userAvatar: 'EC', type: 'deck_shared', content: 'a publié le deck GAJA Essentiel', timestamp: 'Il y a 1 jour' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// INITIAL ACADEMIC STUDY JOURNAL ENTRIES
// ══════════════════════════════════════════════════════════════════════════════
export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: 'j-1',
    title: 'Déclic sur la transformée de Fourier & Intégration par parties',
    content: `Aujourd'hui, session très productive de 90 minutes sur les séries de Fourier. J'ai enfin visualisé le passage du domaine temporel au domaine fréquentiel comme une projection orthogonale dans un espace de Hilbert L²(T). 

Points clés retenus :
- Les coefficients de Fourier c_n(f) décroissent plus vite si f est régulière (C^k implique c_n = o(1/n^k)).
- Le théorème de Dirichlet donne la convergence ponctuelle vers la demi-somme des limites à gauche et à droite.
- Formule de Parseval = conservation de l'énergie en physique !

Objectif de demain : faire les exercices d'annales 2024 sur les équations aux dérivées partielles.`,
    category: 'concept_breakthrough' as const,
    mood: 'inspired' as const,
    subject: 'Mathématiques & Analyse',
    tags: ['Fourier', 'Analyse', 'Hilbert', 'Déclic'],
    keyTakeaways: [
      'Projection orthogonale dans un espace de Hilbert',
      'Théorème de Dirichlet et conditions de régularité',
      'Identité de Parseval et conservation de l\'énergie'
    ],
    studyTimeMinutes: 90,
    aiFeedback: 'Excellente intuition mathématique ! La métaphore de la projection dans les espaces de Hilbert est fondamentale pour aborder la mécanique quantique.',
    createdAt: '2026-08-18T16:30:00Z',
    updatedAt: '2026-08-18T16:30:00Z',
  },
  {
    id: 'j-2',
    title: 'Bilan hebdomadaire : 24h d\'étude & 140 flashcards maîtrisées',
    content: `Bilan de ma 3e semaine de révision intensive. Le système Spaced Repetition (SM-2) porte vraiment ses fruits. Mon taux de rétention sur le deck d'Algèbre linéaire est monté à 92%.

Ce qui a bien fonctionné :
- Pomodoro 50/10 le matin : concentration maximale.
- Revue des cartes difficiles immédiatement après le déjeuner.

À améliorer pour la semaine prochaine :
- Réduire les distractions numériques avant 11h.
- Ajouter plus de cartes orientées QCM pour la biochimie.`,
    category: 'weekly_review' as const,
    mood: 'productive' as const,
    subject: 'Général & Méthodologie',
    tags: ['Bilan', 'Méthode', 'SM-2', 'Productivité'],
    keyTakeaways: [
      'Taux de rétention à 92% en Algèbre',
      'Format 50/10 idéal pour les cours théoriques',
      'Planifier des QCM pour la biochimie'
    ],
    studyTimeMinutes: 120,
    aiFeedback: 'Félicitations pour cette belle régularité ! Maintenir ce rythme tout en préservant le sommeil garantit des résultats exceptionnels aux partiels.',
    createdAt: '2026-08-16T18:00:00Z',
    updatedAt: '2026-08-16T18:00:00Z',
  },
  {
    id: 'j-3',
    title: 'Préparation Examen Blanc : Algorithmique Avancée & Graphes',
    content: `Session de révision ciblée sur les algorithmes de plus court chemin (Dijkstra, Bellman-Ford, Floyd-Warshall). J'ai refait l'implémentation du tas de Fibonacci et vérifié la preuve d'optimalité par récurrence.`,
    category: 'exam_prep' as const,
    mood: 'focused' as const,
    subject: 'Informatique & IA',
    tags: ['Graphes', 'Dijkstra', 'Examen', 'Complexité'],
    keyTakeaways: [
      'Dijkstra ne gère pas les poids négatifs',
      'Complexité O(E + V log V) avec Fibonacci heap'
    ],
    studyTimeMinutes: 60,
    createdAt: '2026-08-15T11:15:00Z',
    updatedAt: '2026-08-15T11:15:00Z',
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// INITIAL WORLD CLOCKS ACROSS MAJOR TIMEZONES
// ══════════════════════════════════════════════════════════════════════════════
export const INITIAL_WORLD_CLOCKS = [
  { id: 'clk-local', name: 'Heure Locale (Appareil)', country: 'Votre Position', timezone: 'local', flagEmoji: '💻', isPrimary: true },
  { id: 'clk-paris', name: 'Paris / Europe', country: 'France', timezone: 'Europe/Paris', flagEmoji: '🇫🇷', isPrimary: false },
  { id: 'clk-london', name: 'Londres (GMT/UTC)', country: 'Royaume-Uni', timezone: 'Europe/London', flagEmoji: '🇬🇧', isPrimary: false },
  { id: 'clk-ny', name: 'New York (EDT/EST)', country: 'États-Unis', timezone: 'America/New_York', flagEmoji: '🇺🇸', isPrimary: false },
  { id: 'clk-dakar', name: 'Dakar (GMT)', country: 'Sénégal', timezone: 'Africa/Dakar', flagEmoji: '🇸🇳', isPrimary: false },
  { id: 'clk-tokyo', name: 'Tokyo (JST)', country: 'Japon', timezone: 'Asia/Tokyo', flagEmoji: '🇯🇵', isPrimary: false },
  { id: 'clk-sf', name: 'San Francisco (PDT)', country: 'Californie', timezone: 'America/Los_Angeles', flagEmoji: '🇺🇸', isPrimary: false },
];

