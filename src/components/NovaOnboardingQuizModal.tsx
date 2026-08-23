import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Target,
  GraduationCap,
  BookOpen,
  Award,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { NovaAvatar2D, NovaExpression } from './NovaAvatar2D';
import { UserSettings, AcademicSubject, NovaPersonalizationConfig } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NovaOnboardingQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onSaveUserSettings: (settings: UserSettings) => void;
  subjects?: AcademicSubject[];
  onAwardXP?: (amount: number, reason: string) => void;
}

export const NovaOnboardingQuizModal: React.FC<NovaOnboardingQuizModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onSaveUserSettings,
  subjects = [],
  onAwardXP,
}) => {
  const { currentTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Form State
  const [schoolGrade, setSchoolGrade] = useState<string>(
    userSettings.profile.role || 'Terminale Générale (Spé Maths/Physique)'
  );
  const [universityOrSchool, setUniversityOrSchool] = useState<string>(
    userSettings.profile.university || 'Lycée Condorcet / Université Paris-Saclay'
  );
  const [currentAverage, setCurrentAverage] = useState<number>(13.5);
  const [targetAverage, setTargetAverage] = useState<number>(16.5);
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    userSettings.profile.academicGoal || 'Décrocher Mention Très Bien & Maîtrise Active Recall'
  );
  const [selectedPrioritySubjects, setSelectedPrioritySubjects] = useState<string[]>([
    'Mathématiques',
    'Physique-Chimie',
  ]);
  const [learningStyle, setLearningStyle] = useState<'coach' | 'sympa' | 'direct'>('sympa');
  const [emojisPreference, setEmojisPreference] = useState<'expressif' | 'modere' | 'aucun'>('expressif');

  if (!isOpen) return null;

  // Mascot position and expression based on step
  const getMascotConfig = (): { expression: NovaExpression; position: string; speech: string } => {
    switch (currentStep) {
      case 0:
        return {
          expression: 'celebrating',
          position: 'top-center',
          speech: 'Bienvenue sur ChronoStudy ! Faisons connaissance en 1 minute pour que je puisse t’aider à cartonner ! 🚀',
        };
      case 1:
        return {
          expression: 'questioning',
          position: 'top-left',
          speech: 'En quelle classe ou année d’études es-tu actuellement ?',
        };
      case 2:
        return {
          expression: 'thinking',
          position: 'top-right',
          speech: 'Dans quel lycée, université ou établissement étudies-tu ?',
        };
      case 3:
        return {
          expression: 'happy',
          position: 'top-left',
          speech: 'Quelle est ta moyenne actuelle et quel objectif souhaites-tu atteindre ? 🎯',
        };
      case 4:
        return {
          expression: 'speaking',
          position: 'top-right',
          speech: 'Quelles sont les matières où tu veux le plus progresser ?',
        };
      case 5:
        return {
          expression: 'nodding',
          position: 'top-left',
          speech: 'Quel style d’accompagnement préfères-tu avec moi ?',
        };
      case 6:
        return {
          expression: 'celebrating',
          position: 'center',
          speech: 'Incroyable ! Ton profil est configuré, je suis prête à t’accompagner ! 🎉',
        };
      default:
        return {
          expression: 'idle',
          position: 'top-center',
          speech: 'Continuons ensemble !',
        };
    }
  };

  const mascot = getMascotConfig();

  // Speak with Web Speech TTS if enabled
  const speakText = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_$\\]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const nextMascot = getMascotConfig();
      speakText(nextMascot.speech);
    } else {
      // Save and Complete
      const updated: UserSettings = {
        ...userSettings,
        profile: {
          ...userSettings.profile,
          role: schoolGrade,
          university: universityOrSchool,
          academicGoal: primaryGoal,
        },
      };
      onSaveUserSettings(updated);

      // Save to Nova Personalization
      const config: NovaPersonalizationConfig = {
        respondLikeTeacher: true,
        schoolGrade,
        country: 'France',
        drawStudentExamples: true,
        adaptLearningPace: true,
        targetAverage,
        ambiance: learningStyle,
        warmth: 'chaleureux',
        emojis: emojisPreference,
      };
      try {
        localStorage.setItem('chronostudy_nova_personalization', JSON.stringify(config));
        localStorage.setItem('chronostudy_onboarding_completed', 'true');
      } catch {}

      if (onAwardXP) {
        onAwardXP(100, 'Questionnaire initial complété avec succès !');
      }
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const GRADE_OPTIONS = [
    'Collège (3ème / Brevet)',
    'Seconde Générale & Techno',
    'Première (Bac Français & Spés)',
    'Terminale (Bac & Parcoursup)',
    'CPGE / Prépa Scientifique',
    'CPGE / Prépa HEC / Littéraire',
    'Licence / Bachelor (L1 / L2 / L3)',
    'Master / École d’Ingénieur / Commerce',
    'PASS / LAS / Études de Santé',
    'Autre / Reconversion',
  ];

  const GOALS_OPTIONS = [
    'Décrocher la Mention Très Bien au Bac / Diplôme',
    'Réussir mes concours & partiels d’excellence',
    'Mémoriser sur le long terme avec l’Active Recall',
    'Gagner en régularité & éliminer la procrastination',
    'Comprendre les exercices difficiles étape par étape',
  ];

  const COMMON_SUBJECTS = [
    'Mathématiques',
    'Physique-Chimie',
    'Histoire-Géographie',
    'SVT / Biologie',
    'Philosophie',
    'Français & Littérature',
    'Anglais LV1',
    'SES / Économie',
    'Informatique / NSI',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* TOP HEADER */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#161922] dark:text-white">
                  Configuration de ton Copilote Nova IA
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Étape {currentStep + 1} sur 7 · Personnalisation pédagogique
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isVoiceEnabled
                    ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}
                title="Lecture vocale de Nova"
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4F94E] via-purple-500 to-indigo-500"
              animate={{ width: `${((currentStep + 1) / 7) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* BODY: MASCOT + INTERACTIVE QUESTIONS */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* ANIMATED 2D MASCOT & SPEECH BUBBLE */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-slate-50 to-indigo-50/50 dark:from-purple-950/20 dark:via-zinc-900 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-900/30">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="shrink-0"
              >
                <NovaAvatar2D expression={mascot.expression} size="xl" />
              </motion.div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Nova IA
                  </span>
                  <span className="text-[10px] bg-purple-200/60 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-bold px-2 py-0.5 rounded-full">
                    Copilote Interactif
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#161922] dark:text-white leading-relaxed">
                  {mascot.speech}
                </p>
              </div>
            </div>

            {/* STEP 0: WELCOME */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center py-4"
              >
                <h4 className="text-lg font-black text-[#161922] dark:text-white">
                  Prêt à débloquer ton plein potentiel académique ?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  En répondant à ces quelques questions, Nova adaptera ses explications, ses quiz, ses fiches mémoires
                  et son rythme à ton niveau et tes objectifs réels.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left space-y-1">
                    <Target className="w-5 h-5 text-emerald-500" />
                    <div className="text-xs font-black text-[#161922] dark:text-white">Plans Sur Mesure</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adaptés à tes dates d’examens et devoirs.
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left space-y-1">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <div className="text-xs font-black text-[#161922] dark:text-white">Active Recall IA</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Génération instantanée de decks & quiz.
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left space-y-1">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div className="text-xs font-black text-[#161922] dark:text-white">+100 XP Immédiats</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Boost initial pour ta progression.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: NIVEAU SCOLAIRE */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                  Sélectionne ton niveau actuel :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setSchoolGrade(grade)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center justify-between ${
                        schoolGrade === grade
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-900 dark:text-purple-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{grade}</span>
                      {schoolGrade === grade && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: ÉTABLISSEMENT */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                    Nom de ton établissement / filière :
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={universityOrSchool}
                      onChange={(e) => setUniversityOrSchool(e.target.value)}
                      placeholder="Ex: Lycée Condorcet, Université Paris-Saclay, Prépa Saint-Louis..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-[#161922] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400">Suggestions rapides :</span>
                  {['Lycée Général', 'Lycée Professionnel', 'Université Paris-Saclay', 'Sorbonne Université', 'CPGE', 'IUT'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUniversityOrSchool(s)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-purple-100 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: MOYENNES & OBJECTIFS */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* CURRENT AVERAGE */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#161922] dark:text-white">Moyenne actuelle :</span>
                    <span className="text-base font-black text-slate-700 dark:text-slate-200">{currentAverage} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.5"
                    value={currentAverage}
                    onChange={(e) => setCurrentAverage(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* TARGET AVERAGE */}
                <div className="space-y-2 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200">Objectif visé :</span>
                    <span className="text-lg font-black text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {targetAverage} / 20
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    step="0.5"
                    value={targetAverage}
                    onChange={(e) => setTargetAverage(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 font-medium">
                    Progression visée : +{(targetAverage - currentAverage).toFixed(1)} points
                  </p>
                </div>

                {/* PRIMARY OBJECTIVE */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                    Objectif principal :
                  </label>
                  <div className="space-y-1.5">
                    {GOALS_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPrimaryGoal(g)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border transition-colors cursor-pointer flex items-center justify-between ${
                          primaryGoal === g
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>{g}</span>
                        {primaryGoal === g && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: MATIÈRES PRIORITAIRES */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                  Sélectionne tes matières prioritaires (2 à 5) :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_SUBJECTS.map((sub) => {
                    const isSelected = selectedPrioritySubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPrioritySubjects((prev) => prev.filter((s) => s !== sub));
                          } else {
                            setSelectedPrioritySubjects((prev) => [...prev, sub]);
                          }
                        }}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200 shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>{sub}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: STYLE PÉDAGOGIQUE */}
            {currentStep === 5 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                  Ambiance et ton de Nova :
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'sympa', title: 'Bienveillant & Pédagogue', desc: 'Analogies simples, encouragement et patience.' },
                    { id: 'coach', title: 'Coach Exigeant', desc: 'Rigueur de raisonnement, pièges d’examens et timing.' },
                    { id: 'direct', title: 'Synthétique & Direct', desc: 'Formules directes, étapes clés sans fioriture.' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLearningStyle(style.id as any)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer space-y-1 ${
                        learningStyle === style.id
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-black">{style.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{style.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-zinc-400">
                    Niveau d’émojis dans les réponses :
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'expressif', label: 'Expressif (🎉 ⚡ 🚀)' },
                      { id: 'modere', label: 'Modéré (📌 💡)' },
                      { id: 'aucun', label: 'Aucun émoji' },
                    ].map((em) => (
                      <button
                        key={em.id}
                        type="button"
                        onClick={() => setEmojisPreference(em.id as any)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          emojisPreference === em.id
                            ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-200'
                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {em.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: RECAP & CONFIRM */}
            {currentStep === 6 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h4 className="text-base sm:text-lg font-black text-[#161922] dark:text-white">
                  Tout est prêt pour booster tes résultats !
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-left space-y-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <div>
                    <span className="text-slate-400">Niveau :</span> <span className="font-bold text-[#161922] dark:text-white">{schoolGrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Établissement :</span> <span className="font-bold text-[#161922] dark:text-white">{universityOrSchool}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Objectif de moyenne :</span>{' '}
                    <span className="font-black text-purple-600 dark:text-purple-400">{targetAverage} / 20</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Matières prioritaires :</span>{' '}
                    <span className="font-bold text-[#161922] dark:text-white">{selectedPrioritySubjects.join(', ')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNextStep}
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStep === 6 ? 'Terminer & Commencer (+100 XP)' : 'Suivant'}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
