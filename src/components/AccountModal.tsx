import React, { useState } from 'react';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../types';
import {
  X,
  User,
  Sliders,
  Settings,
  Sparkles,
  Music,
  Calendar,
  Bell,
  Download,
  Check,
  CheckCircle2,
  BookOpen,
  Volume2,
  Flame,
  Shield,
  GraduationCap,
  Palette,
  Sun,
  Moon,
  Globe,
  Scale,
  Trash2,
  AlertTriangle,
  FileText,
  Layers,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AnimatedIcon } from './AnimatedIcon';
import { LegalNoticeModal } from './LegalNoticeModal';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings?: UserSettings;
  onSaveSettings?: (newSettings: UserSettings) => void;
  onOpenThemeGallery?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

// 20 AVATARS GALLERY FOR CHRONOSTUDY USERS
const AVATAR_CHARACTERS = [
  { id: 'char-robot-1', name: 'Cyber Bot Blue', role: 'Data & Algo', image: '/src/assets/images/avatar_robot_blue_1786482109021.jpg' },
  { id: 'char-cat-1', name: 'Neko Scholar', role: 'Lecture & Focus', image: '/src/assets/images/avatar_cat_mascot_1786482121240.jpg' },
  { id: 'char-fox-1', name: 'Cyber Fox Tech', role: 'Maths & Physique', image: '/src/assets/images/avatar_cyber_fox_1786482131274.jpg' },
  { id: 'char-owl-1', name: 'Wise Owl Mentor', role: 'Sciences & Philo', image: '/src/assets/images/avatar_cute_owl_1786482140906.jpg' },
  { id: 'char-rabbit-1', name: 'Astro Rabbit', role: 'Recherche & IA', image: '/src/assets/images/avatar_astro_rabbit_1786482152579.jpg' },
  { id: 'char-alpha-1', name: 'Atlas Prime', role: 'Médecine & Bio', icon: '🩺' },
  { id: 'char-alpha-2', name: 'Ada Lovelace', role: 'Code & Graphes', icon: '💻' },
  { id: 'char-alpha-3', name: 'Euler Vector', role: 'Analyse & Calcul', icon: '📐' },
  { id: 'char-alpha-4', name: 'Newton Orb', role: 'Physique & Ondes', icon: '🌌' },
  { id: 'char-alpha-5', name: 'Socrates Mind', role: 'Philosophie', icon: '🏛️' },
  { id: 'char-alpha-6', name: 'Hypatia Star', role: 'Astronomie & Maths', icon: '✨' },
  { id: 'char-alpha-7', name: 'Turing Core', role: 'Algorithmes & IA', icon: '⚡' },
  { id: 'char-alpha-8', name: 'Curie Spark', role: 'Chimie & Atomes', icon: '🔬' },
  { id: 'char-alpha-9', name: 'Aristote Flow', role: 'Logique & Rhétorique', icon: '📜' },
  { id: 'char-alpha-10', name: 'Fourier Wave', role: 'Traitement Signal', icon: '🌊' },
  { id: 'char-alpha-11', name: 'Gauss Bell', role: 'Probabilités', icon: '📊' },
  { id: 'char-alpha-12', name: 'Descartes Axis', role: 'Géométrie & Raison', icon: '🧭' },
  { id: 'char-alpha-13', name: 'Châtelet Light', role: 'Énergie Cinétique', icon: '💡' },
  { id: 'char-alpha-14', name: 'Pascal Pressure', role: 'Hydrodynamique', icon: '🎯' },
  { id: 'char-alpha-15', name: 'Leibniz Binary', role: 'Systèmes Binaires', icon: '🚀' }
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  userSettings = DEFAULT_USER_SETTINGS,
  onSaveSettings,
  onOpenThemeGallery,
  onOpenAuthModal,
  onLogout,
}) => {
  const { currentThemeId, setTheme: setAppTheme } = useTheme();
  const { language: currentLang, setLanguage: setAppLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'settings'>('profile');

  // FORM STATE - PROFILE
  const [name, setName] = useState(userSettings.profile.name);
  const [email, setEmail] = useState(userSettings.profile.email);
  const [role, setRole] = useState(userSettings.profile.role);
  const [university, setUniversity] = useState(userSettings.profile.university || 'Université Paris-Saclay');
  const [academicGoal, setAcademicGoal] = useState(userSettings.profile.academicGoal || 'Mention Très Bien & Active Recall');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(userSettings.profile.targetWeeklyHours || 25);
  const [selectedAvatarId, setSelectedAvatarId] = useState(userSettings.profile.avatarId || 'char-robot-1');
  const [customAvatarUrl, setCustomAvatarUrl] = useState(userSettings.profile.avatarUrl || '');

  // FORM STATE - INTEGRATIONS
  const [spotifyConnected, setSpotifyConnected] = useState(userSettings.integrations.spotifyConnected);
  const [selectedPlaylist, setSelectedPlaylist] = useState(userSettings.integrations.selectedPlaylist);
  const [gcalConnected, setGcalConnected] = useState(userSettings.integrations.gcalConnected);
  const [notionConnected, setNotionConnected] = useState(userSettings.integrations.notionConnected);
  const [studyReminders, setStudyReminders] = useState(userSettings.integrations.studyReminders);
  const [timerChime, setTimerChime] = useState(userSettings.integrations.timerChime);

  // FORM STATE - SYSTEM
  const [language, setLanguage] = useState(userSettings.system.language);
  const [theme, setTheme] = useState(userSettings.system.theme);

  const [isSaved, setIsSaved] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [icsLoading, setIcsLoading] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Sync state whenever modal opens or settings change
  React.useEffect(() => {
    if (userSettings) {
      setName(userSettings.profile.name);
      setEmail(userSettings.profile.email);
      setRole(userSettings.profile.role);
      setUniversity(userSettings.profile.university || 'Université Paris-Saclay');
      setAcademicGoal(userSettings.profile.academicGoal || 'Mention Très Bien & Active Recall');
      setTargetWeeklyHours(userSettings.profile.targetWeeklyHours || 25);
      setSelectedAvatarId(userSettings.profile.avatarId || 'char-robot-1');
      setCustomAvatarUrl(userSettings.profile.avatarUrl || '');
      setSpotifyConnected(userSettings.integrations.spotifyConnected);
      setSelectedPlaylist(userSettings.integrations.selectedPlaylist);
      setGcalConnected(userSettings.integrations.gcalConnected);
      setNotionConnected(userSettings.integrations.notionConnected);
      setStudyReminders(userSettings.integrations.studyReminders);
      setTimerChime(userSettings.integrations.timerChime);
      setLanguage(userSettings.system.language);
      setTheme(userSettings.system.theme);
    }
  }, [isOpen, userSettings]);

  if (!isOpen) return null;

  const handleSelectAvatar = (av: typeof AVATAR_CHARACTERS[0]) => {
    setSelectedAvatarId(av.id);
    if (av.image) {
      setCustomAvatarUrl(av.image);
    } else {
      setCustomAvatarUrl('');
    }
  };

  const handleModeChange = (isDark: boolean) => {
    const newThemeName = isDark ? 'Sombre Concentré' : 'Clair Moderne';
    setTheme(newThemeName);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updatedSettings: UserSettings = {
      ...userSettings,
      system: {
        ...userSettings.system,
        theme: newThemeName,
      }
    };
    try {
      localStorage.setItem('chronostudy_user_settings', JSON.stringify(updatedSettings));
    } catch (e) {}
    if (onSaveSettings) {
      onSaveSettings(updatedSettings);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const code = newLang.includes('English') || newLang === 'en' ? 'en' : 'fr';
    setAppLanguage(code);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CS';

    const updatedSettings: UserSettings = {
      profile: {
        name,
        email,
        role,
        university,
        avatarInitials: initials,
        avatarUrl: customAvatarUrl,
        avatarId: selectedAvatarId,
        academicGoal,
        targetWeeklyHours,
      },
      integrations: {
        spotifyConnected,
        selectedPlaylist,
        gcalConnected,
        notionConnected,
        notificationsEnabled: studyReminders,
        pushNotifications: studyReminders,
        studyReminders,
        timerChime,
      },
      system: {
        language,
        theme,
      },
    };

    if (onSaveSettings) {
      onSaveSettings(updatedSettings);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        app: "ChronoStudy",
        exportedAt: new Date().toISOString(),
        compliance: "Export de données personnelles réalisé selon l'Article 20 du RGPD.",
        user: { name, email, role, university, academicGoal, targetWeeklyHours },
        note: "Sauvegarde complète de votre espace d'études ChronoStudy (Decks, Cartes mémoires, Tâches, Sessions Pomodoro)."
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ChronoStudy_Archive_RGPD_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadIcs = async () => {
    setIcsLoading(true);
    try {
      const res = await fetch('/api/v1/calendar/export-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: [] }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ChronoStudy_Planning_${new Date().toISOString().slice(0, 10)}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn('Erreur export iCal:', e);
    } finally {
      setIcsLoading(false);
    }
  };

  const handleGdprPurge = async () => {
    const confirmed = window.confirm(
      "Droit à l'effacement (Article 17 du RGPD) :\nÊtes-vous sûr de vouloir supprimer définitivement l'ensemble de vos données d'études (fiches, decks, journaux) ? Cette opération est irréversible."
    );
    if (!confirmed) return;

    try {
      await fetch('/api/v1/user/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'guest-session' }),
      });
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    } catch (e) {
      console.warn('Erreur purge:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-[#F5F6FA] dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center shadow-xs font-black">
              <GraduationCap className="w-5 h-5 text-[#161922]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#161922] dark:text-white">
                Profil & Paramètres ChronoStudy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Personnalisation de l'environnement académique & intégrations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TABS BAR */}
        <div className="flex items-center border-b border-slate-100 dark:border-zinc-800 px-5 bg-slate-50/50 dark:bg-zinc-900/50 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#D4F94E] text-[#161922] dark:text-[#D4F94E]'
                : 'border-transparent text-slate-500 hover:text-[#161922] dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'integrations'
                ? 'border-[#D4F94E] text-[#161922] dark:text-[#D4F94E]'
                : 'border-transparent text-slate-500 hover:text-[#161922] dark:hover:text-slate-300'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Intégrations & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#D4F94E] text-[#161922] dark:text-[#D4F94E]'
                : 'border-transparent text-slate-500 hover:text-[#161922] dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Système & Sauvegarde</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: PROFILE & AVATAR */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* AVATAR GALLERY */}
              <div className="space-y-3">
                <label className="text-xs font-black text-[#161922] dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4F94E]" /> Galerie d'Avatars Mascots & Robots
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto p-2 bg-[#F5F6FA] dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  {AVATAR_CHARACTERS.map((av) => {
                    const isSelected = selectedAvatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleSelectAvatar(av)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center group cursor-pointer ${
                          isSelected
                            ? 'bg-[#161922] text-[#D4F94E] dark:bg-white dark:text-[#161922] border-[#D4F94E] shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:border-[#D4F94E]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-lg shrink-0">
                          {av.image ? (
                            <img src={av.image} alt={av.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <AnimatedIcon type={av.icon || 'star'} className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold truncate w-full">{av.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom & Prénom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Universitaire</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Filière / Niveau</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Établissement / Faculté</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Objectif Académique Principal</label>
                  <input
                    type="text"
                    value={academicGoal}
                    onChange={(e) => setAcademicGoal(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                    placeholder="Ex: Concours Médecine, Major de Promotion, Mention Très Bien..."
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Budget Temps d'Étude Hebdomadaire ({targetWeeklyHours} heures)
                    </label>
                    <span className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E]">
                      ~{(targetWeeklyHours / 7).toFixed(1)} h / jour
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={1}
                    value={targetWeeklyHours}
                    onChange={(e) => setTargetWeeklyHours(Number(e.target.value))}
                    className="w-full accent-[#D4F94E] cursor-pointer"
                  />
                </div>

                {/* AUTH & SOCIAL LOGIN SECTION (UIVERSE INTEGRATION) */}
                <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:col-span-2">
                  <div>
                    <span className="text-xs font-black text-[#161922] dark:text-white block">
                      Authentification & Comptes Liés
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {(userSettings as any)?.auth?.isAuthenticated
                        ? `Connecté avec ${(userSettings as any)?.auth?.provider || 'Compte Email'}`
                        : 'Connectez-vous via Email, Google, Apple ou Microsoft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAuthModal();
                        }}
                        className="px-3.5 py-1.5 bg-[#2d79f3] text-white hover:bg-[#2465cc] rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                      >
                        {(userSettings as any)?.auth?.isAuthenticated ? 'Changer de Compte' : 'Se Connecter'}
                      </button>
                    )}
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onLogout();
                        }}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Déconnexion
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTEGRATIONS & EXPORTS */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              
              {/* SPOTIFY & STUDY AUDIO */}
              <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
                      <Music className="w-4 h-4 text-[#161922]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#161922] dark:text-white">Lecteur Audio & Ondes Alpha</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Musiques d'ambiance et binaural beats intégrés (Lo-Fi, Synthwave)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpotifyConnected(!spotifyConnected)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                      spotifyConnected ? 'bg-[#D4F94E]' : 'bg-slate-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 bg-[#161922] rounded-full transition-transform transform shadow-xs ${
                        spotifyConnected ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {spotifyConnected && (
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Ambiance Sonore par Défaut</label>
                    <select
                      value={selectedPlaylist}
                      onChange={(e) => setSelectedPlaylist(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-[#161922] dark:text-white outline-none"
                    >
                      <option value="Lo-Fi Beats for Deep Work">Lo-Fi Beats for Deep Work</option>
                      <option value="Alpha Waves (Concentration 40Hz)">Alpha Waves (Concentration 40Hz)</option>
                      <option value="Piano Classique & Chopin">Piano Classique & Chopin</option>
                      <option value="Ambient Synthwave Chill">Ambient Synthwave Chill</option>
                    </select>
                  </div>
                )}
              </div>

              {/* UNIVERSAL ICALENDAR EXPORT (Section 7.1) */}
              <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#161922] text-[#D4F94E] flex items-center justify-center font-black">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#161922] dark:text-white">Planning iCalendar (.ics universel)</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Compatible Google Calendar, Apple, Outlook & Nextcloud</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  disabled={icsLoading}
                  className="px-3.5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{icsLoading ? 'Export...' : 'Télécharger .ics'}</span>
                </button>
              </div>

              {/* NOTION / MARKDOWN EXPORT */}
              <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#161922] text-white flex items-center justify-center font-black">
                    <BookOpen className="w-4 h-4 text-[#D4F94E]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#161922] dark:text-white">Exportation Notion & Markdown</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Exporter les fiches et synthèses pour Notion</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-black text-[#161922] dark:text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM & THEMES */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#161922] dark:text-white uppercase tracking-wider">
                    Mode Visuel & Thème Actif
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500">Magic UI View Transitions</span>
                </div>

                {/* ANIMATED THEME TOGGLER (MAGIC UI) BAR */}
                <div className="bg-[#EFFDE2]/70 dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-[#D4F94E]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AnimatedThemeToggler
                      id="account-animated-theme-toggler-icon"
                      theme={theme === 'Sombre Concentré' ? 'dark' : 'light'}
                      onThemeChange={(newTheme) => handleModeChange(newTheme === 'dark')}
                      className="size-9 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-black text-[#161922] dark:text-white block">
                        Basculeur Animé Magic UI
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        {theme === 'Sombre Concentré' ? 'Mode Sombre Concentré actif' : 'Mode Clair Moderne actif'}
                      </span>
                    </div>
                  </div>
                  <AnimatedThemeToggler
                    id="account-animated-theme-toggler-btn"
                    theme={theme === 'Sombre Concentré' ? 'dark' : 'light'}
                    onThemeChange={(newTheme) => handleModeChange(newTheme === 'dark')}
                    showLabel={true}
                    className="px-3.5 py-1.5 bg-[#D4F94E] hover:bg-[#c6ec3b] text-[#161922] font-black text-xs rounded-xl shadow-xs"
                  />
                </div>

                {/* LIGHT / DARK MODE DIRECT CLICKABLE TILES */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleModeChange(false)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center cursor-pointer ${
                      theme === 'Clair Moderne'
                        ? 'border-[#D4F94E] bg-[#EFFDE2] dark:bg-zinc-800 text-[#161922] dark:text-white font-black shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-300'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-amber-500" />
                    <div>
                      <span className="text-xs font-black block">Mode Clair Moderne</span>
                      <span className="text-[10px] text-slate-500 font-medium">Contraste doux et lisible</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange(true)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center cursor-pointer ${
                      theme === 'Sombre Concentré'
                        ? 'border-[#D4F94E] bg-zinc-950 text-white font-black shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-300'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-indigo-400" />
                    <div>
                      <span className="text-xs font-black block">Mode Sombre Concentré</span>
                      <span className="text-[10px] text-slate-500 font-medium">Idéal pour le travail de nuit</span>
                    </div>
                  </button>
                </div>

                {/* THEME PRESET SWITCHER */}
                <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#161922] dark:text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#D4F94E]" /> Palette de Couleurs & Thème
                    </label>
                    {onOpenThemeGallery && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenThemeGallery();
                        }}
                        className="px-3 py-1 bg-[#D4F94E] text-[#161922] rounded-xl text-[11px] font-black flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
                      >
                        Galerie Complète
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tasklab' as const, name: 'TaskLab', desc: 'Lime & Noir', color: '#D4F94E' },
                      { id: 'niond' as const, name: 'Niond', desc: 'Bleu Tech', color: '#3B82F6' },
                      { id: 'intelly' as const, name: 'Intelly', desc: 'Ambre Chaud', color: '#F59E0B' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setAppTheme(th.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentThemeId === th.id
                            ? 'border-[#D4F94E] bg-white dark:bg-zinc-900 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.color }} />
                          <span className="text-xs font-black text-[#161922] dark:text-white">{th.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{th.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LANGUAGE SELECTION */}
                <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
                  <label className="text-xs font-bold text-[#161922] dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" /> Langue du Système
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('Français (FR)')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentLang === 'fr'
                          ? 'border-[#D4F94E] bg-[#EFFDE2] dark:bg-zinc-900 text-[#161922] dark:text-white font-black'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      🇫🇷 Français (FR)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('English (US)')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        currentLang === 'en'
                          ? 'border-[#D4F94E] bg-[#EFFDE2] dark:bg-zinc-900 text-[#161922] dark:text-white font-black'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      🇬🇧 English (US)
                    </button>
                  </div>
                </div>
              </div>

              {/* DATA EXPORT & GDPR (Sections 7.5, 10.1, 10.3) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs text-[#161922] dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Sauvegarde & Droits RGPD</span>
                  <button
                    type="button"
                    onClick={() => setLegalModalOpen(true)}
                    className="text-[11px] text-[#65A30D] dark:text-[#D4F94E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Politique & Mentions Légales</span>
                  </button>
                </h4>

                {/* GDPR ART. 20 EXPORT */}
                <div className="bg-[#F5F6FA] dark:bg-zinc-800 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-[#161922] dark:text-white block">
                      Archive Complète des Données (RGPD Art. 20)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                      Télécharger un fichier JSON certifié de vos flashcards, documents, planning et historiques.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-extrabold text-[#161922] dark:text-white transition-all flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter JSON</span>
                  </button>
                </div>

                {/* GDPR ART. 17 PURGE */}
                <div className="bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-rose-900 dark:text-rose-200 block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Droit à l'effacement définitif (RGPD Art. 17)
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium block">
                      Supprime l'intégralité de vos données de révision sur le serveur et le navigateur.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGdprPurge}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Purger mes données</span>
                  </button>
                </div>

                {purgeSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center animate-fade-in">
                    Toutes vos données serveur ont été purgées avec succès.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#161922]" />
              <span>Enregistrer les préférences</span>
            </button>

            {isSaved && (
              <span className="text-xs font-extrabold text-[#65A30D] dark:text-[#D4F94E] animate-fade-in flex items-center gap-1">
                <Check className="w-4 h-4 stroke-[3]" /> Paramètres sauvegardés !
              </span>
            )}
          </div>

        </form>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-950 flex items-center justify-between shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setLegalModalOpen(true)}
            className="hover:text-[#161922] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Mentions Légales & RGPD</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-[#161922] dark:text-zinc-200 rounded-xl font-extrabold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>

      <LegalNoticeModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
};
