import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFeedback } from '../context/FeedbackContext';
import { useFeedbackScanner } from '../hooks/useFeedbackScanner';
import { Priority, AnnotationStatus } from '../types';
import {
  MessageSquarePlus,
  X,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Code2,
  Sparkles,
  AlertCircle,
  FileCode,
  ListFilter,
  RefreshCw,
  Terminal,
  Send,
  Sliders,
  Layers,
  BookOpen
} from 'lucide-react';

const APP_MODULES = [
  { id: 'dashboard', name: 'Tableau de Bord', codeRef: 'src/components/DashboardView.tsx' },
  { id: 'flashcards', name: 'Courses & Decks Active Recall', codeRef: 'src/components/FlashcardsView.tsx' },
  { id: 'tasks', name: 'Assignments & Devoirs', codeRef: 'src/components/TasksView.tsx' },
  { id: 'study_groups', name: 'Groupes d\'Études', codeRef: 'src/components/StudyGroupsView.tsx' },
  { id: 'pomodoro', name: 'Pomodoro Focus Studio', codeRef: 'src/components/PomodoroView.tsx' },
  { id: 'documents', name: 'Documents IA & Synthèses', codeRef: 'src/components/DocumentsView.tsx' },
  { id: 'ai_tutor', name: 'ChronoStudy AI Tutor', codeRef: 'src/components/AIChatView.tsx' },
  { id: 'analytics', name: 'Rapports & Analytics', codeRef: 'src/components/AnalyticsView.tsx' },
];

export const FeedbackDrawer: React.FC = () => {
  const {
    annotations,
    addAnnotation,
    deleteAnnotation,
    toggleAnnotationStatus,
    exportFormattedForAI,
    isDrawerOpen,
    setIsDrawerOpen,
    activeModuleId,
    setActiveModuleId,
  } = useFeedback();

  const { generateAIScanReport, refreshScanner, openCount } = useFeedbackScanner();

  // Form State
  const [selectedModuleId, setSelectedModuleId] = useState<string>('dashboard');
  const [feedbackText, setFeedbackText] = useState('');
  const [codeReference, setCodeReference] = useState('src/components/DashboardView.tsx');
  const [priority, setPriority] = useState<Priority>('medium');

  // Filter Tab
  const [filterStatus, setFilterStatus] = useState<'open' | 'all' | 'addressed'>('open');

  // UI States
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showScannerReport, setShowScannerReport] = useState(false);

  // Handle module selection change
  const handleModuleChange = (modId: string) => {
    setSelectedModuleId(modId);
    const found = APP_MODULES.find((m) => m.id === modId);
    if (found) {
      setCodeReference(found.codeRef);
    }
  };

  // Submit Feedback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const moduleObj = APP_MODULES.find((m) => m.id === selectedModuleId) || {
      id: selectedModuleId,
      name: 'Module Général',
    };

    addAnnotation(
      moduleObj.id,
      moduleObj.name,
      feedbackText.trim(),
      codeReference.trim() || undefined,
      priority
    );

    setFeedbackText('');
    refreshScanner();
  };

  // Copy Prompt for AI
  const handleCopyAIPrompt = () => {
    const promptText = exportFormattedForAI();
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const filteredAnnotations = annotations.filter((ann) => {
    if (filterStatus === 'open') return ann.status === 'open';
    if (filterStatus === 'addressed') return ann.status === 'addressed';
    return true;
  });

  const scannerReport = generateAIScanReport();

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <motion.button
        onClick={() => setIsDrawerOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 bg-[#161922] text-[#D4F94E] hover:bg-black p-3.5 pl-4 pr-5 rounded-full shadow-2xl border border-zinc-800 flex items-center gap-2.5 font-black text-xs cursor-pointer transition-all"
      >
        <div className="relative">
          <MessageSquarePlus className="w-5 h-5 text-[#D4F94E]" />
          {openCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#D4F94E] text-[#161922] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
              {openCount}
            </span>
          )}
        </div>
        <span className="tracking-tight text-white">Directives & Feedback IA</span>
      </motion.button>

      {/* DRAWER MODAL */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            {/* BACKDROP CLICK */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 cursor-pointer"
            />

            {/* SLIDE OVER PANEL */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#161922] h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col justify-between overflow-hidden z-10"
            >
              {/* HEADER */}
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-[#161922] text-white flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-[#D4F94E] text-[10px] font-black uppercase tracking-wider border border-zinc-700">
                    <Code2 className="w-3 h-3 text-[#D4F94E]" /> Annotations ChronoStudy
                  </div>
                  <h3 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                    Feedback Context & Scanner
                  </h3>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BODY SCROLLABLE AREA */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                {/* TOP AI PROMPT GENERATOR ACTION */}
                <div className="p-4 bg-[#EFFDE2] dark:bg-zinc-900 rounded-3xl border border-[#D4F94E] dark:border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-xs text-[#161922] dark:text-[#D4F94E] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" />
                        Prompt IA Pré-Formaté ({openCount} consigne{openCount > 1 ? 's' : ''})
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                        Copiez ces instructions pour les transmettre directement à l'assistant.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAIPrompt}
                      className="flex-1 py-2.5 px-4 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> Copié dans le Presse-Papier !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copier les Consignes pour l'IA
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowScannerReport(!showScannerReport)}
                      className="p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer"
                      title="Inspecter le scanner localStorage"
                    >
                      <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>

                  {/* SCANNER LIVE DEBUG VIEW */}
                  {showScannerReport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-[#161922] text-[#D4F94E] rounded-2xl text-[11px] font-mono space-y-1.5 overflow-x-auto border border-zinc-800"
                    >
                      <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-zinc-800 text-[10px] font-bold">
                        <span>LocalStorage Key: chronostudy_user_feedback_annotations</span>
                        <button onClick={refreshScanner} className="hover:text-white flex items-center gap-1 cursor-pointer">
                          <RefreshCw className="w-3 h-3" /> Re-scan
                        </button>
                      </div>
                      <div>Total Annotations : {scannerReport.totalAnnotations}</div>
                      <div>Actives / Non-traitées : {scannerReport.openCount}</div>
                      <div>Priorités Hautes : {scannerReport.highPriorityCount}</div>
                      <div>Fichiers ciblés : {scannerReport.codeFilesTagged.join(', ') || 'Aucun'}</div>
                    </motion.div>
                  )}
                </div>

                {/* FORM FOR ADDING ANNOTATION */}
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <h4 className="font-black text-xs text-[#161922] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Send className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#D4F94E]" /> Ajouter une Annotation / Consigne
                  </h4>

                  {/* MODULE SELECTOR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Module Cible</label>
                      <select
                        value={selectedModuleId}
                        onChange={(e) => handleModuleChange(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#161922] dark:text-white outline-none cursor-pointer"
                      >
                        {APP_MODULES.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Priorité</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#161922] dark:text-white outline-none cursor-pointer"
                      >
                        <option value="low">🟢 Basse (Amélioration mineure)</option>
                        <option value="medium">🟡 Moyenne (Standard)</option>
                        <option value="high">🔴 Haute (Bloquant / Urgent)</option>
                      </select>
                    </div>
                  </div>

                  {/* CODE REFERENCE */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Fichier de Référence (Optionnel)</label>
                    <input
                      type="text"
                      value={codeReference}
                      onChange={(e) => setCodeReference(e.target.value)}
                      placeholder="ex: src/components/TasksView.tsx"
                      className="w-full p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none"
                    />
                  </div>

                  {/* FEEDBACK TEXT */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Description / Consigne</label>
                    <textarea
                      required
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Décrivez précisément ce que l'IA doit corriger ou modifier..."
                      className="w-full p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#161922] dark:bg-white text-white dark:text-[#161922] rounded-2xl text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Enregistrer la Directive
                  </button>
                </form>

                {/* ANNOTATIONS LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Directives Enregistrées ({filteredAnnotations.length})
                    </h4>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-[10px] font-bold">
                      <button
                        onClick={() => setFilterStatus('open')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'open' ? 'bg-[#D4F94E] text-[#161922] font-black' : 'text-slate-500'
                        }`}
                      >
                        En cours
                      </button>
                      <button
                        onClick={() => setFilterStatus('addressed')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'addressed' ? 'bg-[#D4F94E] text-[#161922] font-black' : 'text-slate-500'
                        }`}
                      >
                        Traitées
                      </button>
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'all' ? 'bg-[#D4F94E] text-[#161922] font-black' : 'text-slate-500'
                        }`}
                      >
                        Toutes
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredAnnotations.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6 font-medium">
                        Aucune consigne dans cette catégorie
                      </p>
                    ) : (
                      filteredAnnotations.map((ann) => (
                        <div
                          key={ann.id}
                          className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                            ann.status === 'addressed'
                              ? 'bg-slate-50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 opacity-60'
                              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                {ann.moduleName}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  ann.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700'
                                    : ann.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {ann.priority}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleAnnotationStatus(ann.id)}
                                title={ann.status === 'open' ? 'Marquer comme traitée' : 'Rouvrir'}
                                className={`p-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  ann.status === 'addressed'
                                    ? 'text-[#65A30D]'
                                    : 'text-slate-400 hover:text-black dark:hover:text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteAnnotation(ann.id)}
                                title="Supprimer"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-[#161922] dark:text-white leading-snug">
                            {ann.text}
                          </p>

                          {ann.codeReference && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              📁 {ann.codeReference}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
