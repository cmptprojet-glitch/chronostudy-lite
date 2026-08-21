export type ThemeId = 'niond' | 'intelly' | 'tasklab';

export interface ThemePaletteColor {
  name: string;
  hex: string;
  role: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  inspiration: string;
  sourceImageName: string;
  accentColor: string;
  accentTextColor: string;
  accentSubtle: string;
  accentSubtleText: string;
  canvasBgLight: string;
  canvasBgDark: string;
  sidebarBgLight: string;
  sidebarBgDark: string;
  sidebarTextLight: string;
  sidebarTextDark: string;
  sidebarActiveBgLight: string;
  sidebarActiveBgDark: string;
  sidebarActiveTextLight: string;
  sidebarActiveTextDark: string;
  headerBgLight: string;
  headerBgDark: string;
  cardBgLight: string;
  cardBgDark: string;
  cardBorderLight: string;
  cardBorderDark: string;
  palette: ThemePaletteColor[];
  tags: string[];
  previewElements: {
    heroCardBg: string;
    heroCardText: string;
    heroTitle: string;
    heroSubtitle: string;
    pillActiveBg: string;
    pillActiveText: string;
    sidebarBg: string;
    sidebarText: string;
    badgeBg: string;
    badgeText: string;
    chartColor: string;
    accentPill: string;
    accentPillText: string;
    card1Bg: string;
    card1Text: string;
    card2Bg: string;
    card2Text: string;
    card3Bg: string;
    card3Text: string;
    card4Bg: string;
    card4Text: string;
  };
}

export const AVAILABLE_THEMES: Record<ThemeId, ThemeDefinition> = {
  niond: {
    id: 'niond',
    name: 'Niond Soft Modern',
    tagline: 'Clean Bento Pastel & Vibrant Lime',
    description: 'Palette lumineuse et aérée avec cartes pastel douces (Lavande, Ciel, Menthe, Sarcelle) et pilules d\'accent vert lime frais.',
    inspiration: 'Inspiré du design Niond Dashboard (Image 1)',
    sourceImageName: 'télécharger.jpg',
    accentColor: '#D5F862',
    accentTextColor: '#161922',
    accentSubtle: '#EFFDE2',
    accentSubtleText: '#15803D',
    canvasBgLight: '#F4F5FA',
    canvasBgDark: '#13161C',
    sidebarBgLight: '#FFFFFF',
    sidebarBgDark: '#1A1D24',
    sidebarTextLight: '#6B7280',
    sidebarTextDark: '#9CA3AF',
    sidebarActiveBgLight: '#D5F862',
    sidebarActiveBgDark: '#D5F862',
    sidebarActiveTextLight: '#161922',
    sidebarActiveTextDark: '#161922',
    headerBgLight: '#FFFFFF',
    headerBgDark: '#1A1D24',
    cardBgLight: '#FFFFFF',
    cardBgDark: '#1E222D',
    cardBorderLight: '#E5E7EB',
    cardBorderDark: '#292E3B',
    palette: [
      { name: 'Lime Niond', hex: '#D5F862', role: 'Accent Primaire & Onglets' },
      { name: 'Lavande Douce', hex: '#E3E0FD', role: 'Cartes Bento & Flashcards' },
      { name: 'Bleu Ciel', hex: '#DBEBFF', role: 'Planning & Sessions' },
      { name: 'Menthe Fraîche', hex: '#CDF5DD', role: 'Tâches & Succès' },
      { name: 'Sarcelle Profond', hex: '#0D8383', role: 'Pro / Analytics' },
      { name: 'Canvas Clair', hex: '#F4F5FA', role: 'Arrière-plan Moderne' },
    ],
    tags: ['Bento Pastel', 'Vert Lime', 'Airy & Propre', 'SaaS Élégant'],
    previewElements: {
      heroCardBg: '#0D8383',
      heroCardText: '#FFFFFF',
      heroTitle: 'ChronoStudy Pro',
      heroSubtitle: 'Boost d\'apprentissage actif',
      pillActiveBg: '#D5F862',
      pillActiveText: '#161922',
      sidebarBg: '#FFFFFF',
      sidebarText: '#6B7280',
      badgeBg: '#D5F862',
      badgeText: '#161922',
      chartColor: '#D5F862',
      accentPill: '#D5F862',
      accentPillText: '#161922',
      card1Bg: '#E3E0FD',
      card1Text: '#3D3685',
      card2Bg: '#DBEBFF',
      card2Text: '#28538E',
      card3Bg: '#CDF5DD',
      card3Text: '#1B633C',
      card4Bg: '#0D8383',
      card4Text: '#FFFFFF',
    },
  },
  intelly: {
    id: 'intelly',
    name: 'Intelly Warm Neo-Pastel',
    tagline: 'Warm Cream, Obsidian Sidebar & Candy Pastels',
    description: 'Ambiance chaleureuse avec fond vanille/crème doux, sidebar noire obsidian contrastée et blocs pastel bonbon (Jaune Soleil, Rose Poudré, Sauge, Pervenche).',
    inspiration: 'Inspiré du dashboard Intelly Healthcare (Image 2)',
    sourceImageName: 'Intelly — HealthCare App Dashboard.jpg',
    accentColor: '#F8BED6',
    accentTextColor: '#141414',
    accentSubtle: '#FDF2F8',
    accentSubtleText: '#9D174D',
    canvasBgLight: '#F9F4EB',
    canvasBgDark: '#181615',
    sidebarBgLight: '#141414',
    sidebarBgDark: '#0F0E0E',
    sidebarTextLight: '#9CA3AF',
    sidebarTextDark: '#9CA3AF',
    sidebarActiveBgLight: '#FFFFFF',
    sidebarActiveBgDark: '#F8BED6',
    sidebarActiveTextLight: '#141414',
    sidebarActiveTextDark: '#141414',
    headerBgLight: '#FFFFFF',
    headerBgDark: '#221E1C',
    cardBgLight: '#FFFFFF',
    cardBgDark: '#221E1C',
    cardBorderLight: '#ECE4D5',
    cardBorderDark: '#322D2A',
    palette: [
      { name: 'Crème Vanille', hex: '#F9F4EB', role: 'Fond Chaleureux & Confort' },
      { name: 'Obsidian Noir', hex: '#141414', role: 'Sidebar & Boutons Maîtres' },
      { name: 'Rose Poudré', hex: '#F8BED6', role: 'Accent Primaire & Badges' },
      { name: 'Jaune Beurre', hex: '#FDE38C', role: 'Notes & Pomodoro' },
      { name: 'Sauge Olive', hex: '#B2C98A', role: 'Objectifs & Validations' },
      { name: 'Pervenche', hex: '#A8C4E8', role: 'Analytiques & Horloge' },
    ],
    tags: ['Fond Crème', 'Sidebar Noire', 'Pastel Doux', 'Haute Lisibilité'],
    previewElements: {
      heroCardBg: '#F8BED6',
      heroCardText: '#7C1D48',
      heroTitle: 'Bonjour Julien ☀️',
      heroSubtitle: '45 cartes à revoir aujourd\'hui',
      pillActiveBg: '#FFFFFF',
      pillActiveText: '#141414',
      sidebarBg: '#141414',
      sidebarText: '#9CA3AF',
      badgeBg: '#F8BED6',
      badgeText: '#7C1D48',
      chartColor: '#141414',
      accentPill: '#F8BED6',
      accentPillText: '#7C1D48',
      card1Bg: '#FDE38C',
      card1Text: '#6A5200',
      card2Bg: '#F8BED6',
      card2Text: '#7C1D48',
      card3Bg: '#B2C98A',
      card3Text: '#374F18',
      card4Bg: '#A8C4E8',
      card4Text: '#1E3F6D',
    },
  },
  tasklab: {
    id: 'tasklab',
    name: 'TaskLab Neo-Brutalist Lime',
    tagline: 'Frosted Silver, Deep Black Cards & Electric Lime',
    description: 'Design ultra-moderne et percutant avec fond argent dépoli, cartes noires profondes `#141414` et touches de vert néon électrique `#D2F843`.',
    inspiration: 'Inspiré du dashboard TaskLab Project & Team Management (Image 3)',
    sourceImageName: 'Task and Project Management Dashboard.jpg',
    accentColor: '#D2F843',
    accentTextColor: '#121212',
    accentSubtle: '#F4FCE3',
    accentSubtleText: '#3F6212',
    canvasBgLight: '#ECEEF1',
    canvasBgDark: '#0F1115',
    sidebarBgLight: '#FFFFFF',
    sidebarBgDark: '#15181E',
    sidebarTextLight: '#6B7280',
    sidebarTextDark: '#9CA3AF',
    sidebarActiveBgLight: '#121212',
    sidebarActiveBgDark: '#D2F843',
    sidebarActiveTextLight: '#FFFFFF',
    sidebarActiveTextDark: '#121212',
    headerBgLight: '#FFFFFF',
    headerBgDark: '#15181E',
    cardBgLight: '#FFFFFF',
    cardBgDark: '#191D24',
    cardBorderLight: '#E0E2E7',
    cardBorderDark: '#262B35',
    palette: [
      { name: 'Néon Lime', hex: '#D2F843', role: 'Accent Électrique & Stats' },
      { name: 'Obsidian Profond', hex: '#141414', role: 'Cartes Sombres & Graphiques' },
      { name: 'Argent Dépoli', hex: '#ECEEF1', role: 'Fond Minimaliste Clair' },
      { name: 'Blanc Pur', hex: '#FFFFFF', role: 'Surfaces Épurées' },
      { name: 'Gris Graphique', hex: '#6B7280', role: 'Indicateurs de Données' },
      { name: 'Noir Carbone', hex: '#0F1115', role: 'Mode Sombre Contrasté' },
    ],
    tags: ['Neo-Brutalism', 'Electric Lime', 'Dark Cards', 'High Tech'],
    previewElements: {
      heroCardBg: '#141414',
      heroCardText: '#FFFFFF',
      heroTitle: 'Productivité : +13%',
      heroSubtitle: 'Rythme d\'étude optimal',
      pillActiveBg: '#121212',
      pillActiveText: '#FFFFFF',
      sidebarBg: '#FFFFFF',
      sidebarText: '#6B7280',
      badgeBg: '#D2F843',
      badgeText: '#121212',
      chartColor: '#D2F843',
      accentPill: '#D2F843',
      accentPillText: '#121212',
      card1Bg: '#D2F843',
      card1Text: '#121212',
      card2Bg: '#141414',
      card2Text: '#FFFFFF',
      card3Bg: '#FFFFFF',
      card3Text: '#121212',
      card4Bg: '#D2F843',
      card4Text: '#121212',
    },
  },
};
