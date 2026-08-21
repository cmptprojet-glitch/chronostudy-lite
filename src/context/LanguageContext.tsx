import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'fr' | 'en';

export interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Navigation
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'nav.subjects_courses': { fr: 'Matières & Cours', en: 'Subjects & Courses' },
  'nav.flashcards': { fr: 'Flashcards & Decks', en: 'Flashcards & Decks' },
  'nav.tasks': { fr: 'Devoirs & Tâches', en: 'Assignments & Tasks' },
  'nav.planner': { fr: 'Planning & Emploi du temps', en: 'Calendars & Schedule' },
  'nav.journal': { fr: "Journal d'Études", en: 'Study Journal & Logs' },
  'nav.study_groups': { fr: "Groupes d'Études", en: 'Study Groups' },
  'nav.pomodoro': { fr: 'Focus Pomodoro', en: 'Focus Pomodoro' },
  'nav.documents': { fr: 'Hub Documents & IA', en: 'Study Docs & AI Hub' },
  'nav.analytics': { fr: 'Rapports & Stats', en: 'Reports & Analytics' },
  'nav.trash': { fr: 'Corbeille (30j)', en: 'Trash Bin (30d)' },
  'nav.ai_tutor': { fr: 'Tuteur IA Chrono', en: 'AI Tutor' },
  'nav.deck_builder': { fr: 'Studio Decks Pro', en: 'Deck Studio Pro' },
  'nav.widget_builder': { fr: 'Widgets & Budget Temps', en: 'Widget & Time Budget' },

  // Header & General
  'header.welcome': { fr: 'Bon retour', en: 'Welcome back' },
  'header.search_placeholder': { fr: 'Rechercher cours, decks, devoirs...', en: 'Search courses, decks, tasks...' },
  'header.themes': { fr: 'Thèmes', en: 'Themes' },
  'header.world_clock': { fr: 'Horloge Mondiale', en: 'World Clock' },
  'header.ai_assistant': { fr: 'Assistant IA', en: 'AI Assistant' },
  'header.profile': { fr: 'Mon Profil & Paramètres', en: 'My Profile & Settings' },
  'header.toggle_dark': { fr: 'Mode Sombre / Clair', en: 'Toggle Dark / Light' },

  // Dashboard
  'dashboard.new_courses': { fr: "Nouveaux Cours & Decks d'Active Recall", en: 'New Courses & Active Recall Decks' },
  'dashboard.view_all': { fr: 'Tout afficher', en: 'View All' },
  'dashboard.go_premium': { fr: 'ChronoStudy Pro & IA', en: 'Go Premium' },
  'dashboard.go_premium_desc': { fr: 'Accédez à plus de 25 000 flashcards intelligentes avec tuteur IA personnalisé.', en: 'Explore 25k+ smart recall cards with AI personal tutor.' },
  'dashboard.get_access': { fr: 'Activer le Tuteur', en: 'Get Access' },
  'dashboard.hours_activity': { fr: 'Activité Horaire', en: 'Hours Activity' },
  'dashboard.weekly': { fr: 'Hebdomadaire', en: 'Weekly' },
  'dashboard.monthly': { fr: 'Mensuel', en: 'Monthly' },
  'dashboard.activity_increase': { fr: '↗ +3% par rapport à la période précédente', en: '↗ +3% increase than last period' },
  'dashboard.daily_schedule': { fr: 'Planning du Jour', en: 'Daily Schedule' },
  'dashboard.see_all': { fr: 'Voir tout', en: 'See All' },
  'dashboard.calendar': { fr: 'Calendrier des Révisions', en: 'Revision Calendar' },
  'dashboard.expand_calendar': { fr: 'Agrandir le calendrier', en: 'Expand calendar' },
  'dashboard.courses_taking': { fr: 'Cours & Decks en Cours', en: "Courses You're Taking" },
  'dashboard.assignments': { fr: 'Devoirs & Échéances', en: 'Assignments & Deadlines' },
  'dashboard.custom_widgets': { fr: 'Mes Widgets Personnalisés & Objectifs', en: 'My Custom Widgets & Goals' },
  'dashboard.add_widget': { fr: 'Nouveau Widget', en: 'New Widget' },
  'dashboard.time_widget_title': { fr: 'Horloge & Fuseaux Horaires', en: 'Time & World Clock' },
  'dashboard.study_time_today': { fr: "Temps d'étude aujourd'hui", en: 'Study time today' },

  // Pomodoro
  'pomodoro.title': { fr: 'Focus & Minuteur Pomodoro', en: 'Focus & Pomodoro Timer' },
  'pomodoro.subtitle': { fr: "Cycles de concentration cadencés, anti-triche et lecteur audio immersif", en: 'Cadenced focus cycles, anti-cheat, and immersive audio player' },
  'pomodoro.work': { fr: 'Travail', en: 'Work' },
  'pomodoro.short_break': { fr: 'Courte Pause', en: 'Short Break' },
  'pomodoro.long_break': { fr: 'Longue Pause', en: 'Long Break' },
  'pomodoro.start': { fr: 'Démarrer le Focus', en: 'Start Focus' },
  'pomodoro.pause': { fr: 'Mettre en Pause', en: 'Pause Timer' },
  'pomodoro.resume': { fr: 'Reprendre le Focus', en: 'Resume Focus' },
  'pomodoro.reset': { fr: 'Réinitialiser', en: 'Reset' },
  'pomodoro.complete': { fr: 'Terminer la session', en: 'Complete Session' },
  'pomodoro.anti_cheat_title': { fr: 'Système Anti-Triche Actif', en: 'Anti-Cheat Protection' },
  'pomodoro.anti_cheat_msg': { fr: 'Pour valider l\'XP complète, vous devez effectuer au moins 10 min de focus effectif.', en: 'To gain full XP, you must focus for at least 10 minutes.' },
  'pomodoro.real_time': { fr: 'Temps réel étudié', en: 'Real focus time' },
  'pomodoro.link_task': { fr: 'Lier à une Matière / Devoir', en: 'Link to Subject / Task' },

  // Audio Player
  'audio.title': { fr: "Lecteur Audio d'Ambiance & Fichiers", en: 'Ambient Audio & File Player' },
  'audio.subtitle': { fr: 'Musiques Lo-Fi, ondes cérébrales et importation de fichiers audio', en: 'Lo-Fi beats, brainwaves, and audio file import' },
  'audio.upload_btn': { fr: 'Importer un Fichier Audio (MP3/WAV)', en: 'Upload Audio File (MP3/WAV)' },
  'audio.drop_zone': { fr: 'Glissez-déposez votre fichier audio ici', en: 'Drag and drop your audio file here' },

  // Deck Studio & Files
  'deck.studio_title': { fr: 'Studio de Création de Decks & Quiz Pro', en: 'Pro Deck & Quiz Studio' },
  'deck.manual': { fr: 'Éditeur Manuel', en: 'Manual Editor' },
  'deck.ai_gen': { fr: 'Générateur IA', en: 'AI Generator' },
  'deck.files_gen': { fr: 'Génération par Fichier / Document', en: 'Generate from File / Doc' },
  'deck.presets': { fr: 'Modèles Prêts', en: 'Preset Decks' },
  'deck.attach_file_btn': { fr: 'Joindre un Fichier (PDF, TXT, DOC, MD)', en: 'Attach File (PDF, TXT, DOC, MD)' },
  'deck.generate_from_file': { fr: 'Générer des Flashcards & Quiz depuis ce fichier', en: 'Generate Flashcards & Quiz from this file' },
  'deck.save_to_app': { fr: 'Enregistrer le Deck', en: 'Save Deck' },

  // Widget Studio
  'widget.studio_title': { fr: 'Studio de Widgets Académiques & Budget Temps', en: 'Academic Widget & Time Budget Studio' },
  'widget.save_and_add': { fr: 'Enregistrer et Ajouter au Dashboard', en: 'Save and Add to Dashboard' },
  'widget.manual_editor': { fr: 'Éditeur Manuel', en: 'Manual Editor' },
  'widget.ai_builder': { fr: 'Assistant IA Widget', en: 'AI Widget Assistant' },
  'widget.presets': { fr: 'Widgets Prédéfinis', en: 'Preset Widgets' },
  'widget.my_widgets': { fr: 'Mes Widgets Actifs', en: 'My Active Widgets' },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_language');
      if (saved === 'fr' || saved === 'en') return saved;
      return 'fr'; // Default to French as requested
    } catch {
      return 'fr';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chronostudy_language', language);
    } catch (e) {
      console.error('Error saving language preference', e);
    }
  }, [language]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = DICTIONARY[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
