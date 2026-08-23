import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AcademicSubject } from '../types';

interface RevisionPlanWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: AcademicSubject[];
  onApplyPlan: (planTitle: string, subjectName: string, topics: string[]) => void;
}

export const RevisionPlanWizardModal: React.FC<RevisionPlanWizardModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onApplyPlan,
}) => {
  const { currentTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [goal, setGoal] = useState<'quick' | 'test' | 'final' | 'review'>('test');
  const [targetGrade, setTargetGrade] = useState<number>(16);
  const [currentGrade, setCurrentGrade] = useState<number>(12);
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Règles de Circulation',
    'Signalisation Verticale',
    'Marquages et Feux',
    'Intersections et Priorités',
    'Limites de Vitesse',
    'Croisement et Dépassement',
  ]);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || 'Mathématiques');

  if (!isOpen) return null;

  const totalSteps = 6;
  const gradeGap = targetGrade - currentGrade;

  const ALL_TOPICS_BY_SUBJECT: Record<string, string[]> = {
    Mathématiques: [
      'Théorème de Pythagore & Thalès',
      'Fonctions affines et polynômes du 2nd degré',
      'Dérivation et étude de variations',
      'Suites arithmétiques et géométriques',
      'Probabilités conditionnelles',
      'Vecteurs et géométrie dans l’espace',
      'Intégration et primitives',
      'Équations différentielles',
    ],
    'Physique-Chimie': [
      'Circuit RC : charge et décharge',
      'Rendement d’une cellule photovoltaïque',
      'Débit volumique et viscosité d’un fluide',
      'Dosage par étalonnage spectrophotométrique',
      'Dosage conductimétrique',
      'Mécanique de Newton et trajectoires',
      'Thermodynamique et calorimétrie',
      'Ondes mécaniques et optique ondulatoire',
    ],
    Philosophie: [
      'La Conscience et l’Inconscient',
      'La Liberté et le Déterminisme',
      'Le Devoir et la Morale',
      'L’État, la Justice et le Droit',
      'La Vérité et la Science',
      'L’Art et la Technique',
    ],
    'Histoire-Géo': [
      'La Seconde Guerre Mondiale',
      'La Guerre Froide et le monde bipolaire',
      'La construction européenne',
      'Mers et océans au cœur de la mondialisation',
      'Les dynamiques territoriales de la France',
    ],
  };

  const availableTopics =
    ALL_TOPICS_BY_SUBJECT[selectedSubject] || [
      'Thème 1 : Notions fondamentales',
      'Thème 2 : Théorèmes directeurs',
      'Thème 3 : Applications pratiques',
      'Thème 4 : Exercices d’annales',
      'Thème 5 : Fiche mémo & formules clés',
    ];

  const filteredTopics = availableTopics.filter((t) =>
    t.toLowerCase().includes(searchTopic.toLowerCase())
  );

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleFinish = () => {
    onApplyPlan(
      `Plan Vérifié : ${selectedSubject} (Objectif ${targetGrade}/20)`,
      selectedSubject,
      selectedTopics
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-[#0F1117] text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-left flex flex-col max-h-[90vh]"
      >
        {/* PROGRESS BAR */}
        <div className="h-1.5 w-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((p) => p - 1)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs text-zinc-400 font-bold">
                Le plan de révision est généré par IA · Étape {currentStep}/{totalSteps}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-center">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: OBJECTIF DE RÉVISION                                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-3xl mb-3 shadow-lg">
                  👾
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  C'est quoi ton objectif de révision ?
                </h3>
              </div>

              {/* SUBJECT PICKER */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedSubject === sub.name
                        ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              {/* GOAL TILES */}
              <div className="space-y-2.5 text-left">
                {[
                  { id: 'quick', label: 'Contrôle rapide', desc: 'Révision flash en 1 ou 2 jours', icon: Zap, color: 'text-cyan-400' },
                  { id: 'test', label: 'Contrôle', desc: 'Devoir surveillé standard de classe', icon: ShieldCheck, color: 'text-amber-400' },
                  { id: 'final', label: 'Examen final / Bac / Partiel', desc: 'Grand oral, Baccalauréat, Concours', icon: GraduationCap, color: 'text-purple-400' },
                  { id: 'review', label: 'Juste une révision', desc: 'Remise à niveau et consolidation', icon: BookOpen, color: 'text-emerald-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setGoal(item.id as any);
                      setCurrentStep(2);
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      goal === item.id
                        ? 'bg-zinc-900 border-purple-500 ring-1 ring-purple-500'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">{item.label}</span>
                        <span className="text-xs text-zinc-400">{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: NOTE VISÉE                                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl mb-2">
                  🎯
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Quelle note on vise ?
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Définis ton objectif d'excellence</p>
              </div>

              {/* BIG SCORE DISPLAY */}
              <div className="py-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {targetGrade}
                </span>
                <span className="text-sm font-bold text-zinc-500 mt-1">/ 20</span>
              </div>

              {/* QUICK GRADE SELECTOR */}
              <div className="grid grid-cols-5 gap-2">
                {[12, 14, 16, 18, 20].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setTargetGrade(grade)}
                    className={`py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                      targetGrade === grade
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md cursor-pointer"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: NOTE ACTUELLE                                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl mb-2">
                  📊
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Sans pression, t'as quelle note en ce moment ?
                </h3>
              </div>

              {/* BIG SCORE DISPLAY */}
              <div className="py-6 bg-zinc-900/80 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {currentGrade}
                </span>
                <span className="text-sm font-bold text-zinc-500 mt-1">/ 20</span>
              </div>

              {/* GRADE GAP PILL */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-left">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Progression de note :{' '}
                    <span className="text-emerald-400 font-extrabold">
                      {gradeGap > 0 ? `+${gradeGap} pts` : `${gradeGap} pts`}
                    </span>
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {gradeGap >= 6
                      ? 'Un objectif ambitieux — défi accepté ! 🚀'
                      : gradeGap >= 3
                      ? 'Un objectif réaliste — t’as ce qu’il faut ! 💪'
                      : 'Un petit pas — largement faisable ! ✨'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    gradeGap >= 6
                      ? 'bg-purple-900/60 text-purple-300'
                      : 'bg-emerald-900/60 text-emerald-300'
                  }`}
                >
                  {gradeGap >= 6 ? 'Ambitieux' : 'Réalisable'}
                </span>
              </div>

              {/* QUICK GRADE SELECTOR */}
              <div className="grid grid-cols-5 gap-2">
                {[8, 10, 12, 14, 15].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setCurrentGrade(grade)}
                    className={`py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                      currentGrade === grade
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md cursor-pointer"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 4: SELECTION DES SUJETS / CHAPITRES                          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-4 text-left">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Quels sujets tu veux réviser en {selectedSubject} ?
                </h3>
              </div>

              {/* SEARCH */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="Rechercher des chapitres ou thèmes..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              {/* TOPICS CHECKLIST */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredTopics.map((topic) => {
                  const isChecked = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-zinc-900 border-purple-500 text-white'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{topic}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isChecked
                            ? 'bg-purple-600 text-white'
                            : 'border border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {isChecked ? '✓' : '+'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md cursor-pointer mt-2"
              >
                Continuer ({selectedTopics.length} chapitres)
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 5: SUPPORTS DE RÉVISION / ATTACHMENTS                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-2xl mb-2">
                  📑
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Ajoute tes supports de cours
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Photos de cahier, polycopiés de cours ou PDF
                </p>
              </div>

              {/* UPLOAD SLOTS */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((slot) => (
                  <div
                    key={slot}
                    className="h-28 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-purple-500/60 bg-zinc-900/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-500 hover:text-white transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[11px] font-bold">Document {slot}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="flex-1 py-3.5 rounded-2xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Passer cette étape
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                  className="flex-1 py-3.5 rounded-2xl font-black text-xs shadow-md cursor-pointer"
                >
                  Générer mon plan
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 6: RESULTAT DU PLAN VÉRIFIÉ                                 */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentStep === 6 && (
            <div className="space-y-4 text-left">
              <div className="text-center pb-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">
                  Ton plan {selectedSubject} vérifié
                </h3>
                <p className="text-xs text-zinc-400">
                  Basé sur le programme officiel · Objectif {targetGrade}/20
                </p>
              </div>

              {/* THEMES ACCORDION CARD */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-extrabold text-xs">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Thème 1 : Les Incontournables de l'Examen</span>
                </div>

                <div className="space-y-2 pt-1">
                  {selectedTopics.slice(0, 6).map((topic, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Utiliser ce plan de révision</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
                >
                  Créer un autre plan personnalisé
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
