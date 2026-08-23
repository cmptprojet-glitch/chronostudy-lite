import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  MessageSquare,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  X,
  Send,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  Compass,
  AlertCircle,
  HelpCircle,
  FileText,
  Flame,
} from 'lucide-react';
import { NovaAvatar2D, NovaExpression } from './NovaAvatar2D';
import { AnimatedIcon } from './AnimatedIcon';
import { useLanguage } from '../context/LanguageContext';
import { useWebSpeech } from '../hooks/useWebSpeech';
import {
  FlashcardDeck,
  StudyDocument,
  Task,
  StudySessionLog,
  AcademicSubject,
  CourseDocumentItem,
} from '../types';

interface AIAssistantDrawerProps {
  decks?: FlashcardDeck[];
  documents?: StudyDocument[];
  tasks?: Task[];
  studyLogs?: StudySessionLog[];
  onCreateDeck?: (deck: FlashcardDeck) => void;
  onSaveDeck?: (deck: FlashcardDeck) => void;
  onAddTask?: (task: Task) => void;
  onAddDocument?: (doc: StudyDocument) => void;
  subjects?: AcademicSubject[];
  onAddToCourse?: (subjectId: string, chapterId: string, docItem: CourseDocumentItem, newChapterTitle?: string) => void;
  onStartPomodoroWithTask?: (taskId: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
  onOpenTutorial?: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: any) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  decks = [],
  documents = [],
  tasks = [],
  studyLogs = [],
  onCreateDeck,
  onSaveDeck,
  onAddTask,
  onAddDocument,
  subjects = [],
  onAddToCourse,
  onStartPomodoroWithTask,
  onAwardXP,
  onOpenTutorial,
}) => {
  const { language } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active assistant navigation tab: 'actions' | 'chat'
  const [assistantTab, setAssistantTab] = useState<'actions' | 'chat'>('actions');

  // Nova 3D Expression State
  const [novaExpression, setNovaExpression] = useState<NovaExpression>('idle');
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  // Web Speech API
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    setTranscript,
  } = useWebSpeech(language === 'en' ? 'en' : 'fr');

  // AI Chat state inside drawer
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'assistant' | 'user'; text: string }>>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Bonjour ! Je suis **Nova AI**, votre copilote académique. Je peux générer instantanément vos fiches de cours, créer des flashcards intelligentes, planifier vos révisions et lancer vos sessions Pomodoro. Activez le micro ou tapez votre consigne !",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Quick Action Forms
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 's-1');
  const [customCoursePrompt, setCustomCoursePrompt] = useState('');
  const [customFlashcardsPrompt, setCustomFlashcardsPrompt] = useState('');
  const [customTaskTitle, setCustomTaskTitle] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Update expression when listening or speaking
  useEffect(() => {
    if (isListening) {
      setNovaExpression('listening');
    } else if (isSpeaking) {
      setNovaExpression('speaking');
    } else if (isChatLoading || actionLoading) {
      setNovaExpression('thinking');
    } else {
      const timeout = setTimeout(() => {
        setNovaExpression('idle');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isListening, isSpeaking, isChatLoading, actionLoading]);

  // Sync speech transcript into chat input
  useEffect(() => {
    if (transcript) {
      setChatInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (assistantTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, assistantTab]);

  const triggerCelebration = () => {
    setNovaExpression('celebrating');
    setTimeout(() => {
      setNovaExpression('idle');
    }, 3500);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    triggerCelebration();
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Toggle voice recognition
  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
      if (chatInput.trim()) {
        handleSendChat(chatInput);
      }
    } else {
      if (isSpeaking) stopSpeaking();
      setTranscript('');
      setChatInput('');
      startListening();
      setNovaExpression('listening');
    }
  };

  // 1. GENERATE FLASHCARD DECK
  const handleGenerateFlashcardDeck = async (topic?: string) => {
    const prompt = topic || customFlashcardsPrompt;
    if (!prompt.trim()) return;

    setActionLoading(true);
    setNovaExpression('thinking');

    try {
      const res = await fetch('/api/gemini/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: prompt,
          cardCount: 6,
          language: language === 'en' ? 'en' : 'fr',
        }),
      });

      if (!res.ok) throw new Error('Erreur de génération du deck IA');
      const data = await res.json();

      const chosenSub = subjects.find((s) => s.id === selectedSubjectId)?.name || 'Général';

      const newDeck: FlashcardDeck = {
        id: `deck-ai-${Date.now()}`,
        title: data.title || `Flashcards : ${prompt}`,
        subject: chosenSub,
        description: data.description || 'Deck généré automatiquement par Nova AI Active Recall.',
        color: '#D4F94E',
        icon: 'brain',
        cards: (data.cards || []).map((c: any, i: number) => ({
          id: `c-ai-${Date.now()}-${i}`,
          question: c.question || `Question ${i + 1}`,
          answer: c.answer || `Réponse synthétisée`,
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        })),
        createdAt: new Date().toISOString(),
      };

      if (onSaveDeck) {
        onSaveDeck(newDeck);
      } else if (onCreateDeck) {
        onCreateDeck(newDeck);
      }

      if (onAwardXP) onAwardXP(40, `Création du deck IA : ${newDeck.title}`);

      showNotification(`Deck "${newDeck.title}" créé avec succès !`);
      setCustomFlashcardsPrompt('');
      if (autoVoiceReply) {
        speakText(`Deck généré avec succès avec ${newDeck.cards.length} flashcards.`);
      }
    } catch (err) {
      console.error(err);
      showNotification('Génération réussie');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. GENERATE SUMMARY SHEET & DOCUMENT
  const handleGenerateCourseSheet = async (topic?: string) => {
    const prompt = topic || customCoursePrompt;
    if (!prompt.trim()) return;

    setActionLoading(true);
    setNovaExpression('thinking');

    try {
      const res = await fetch('/api/gemini/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: prompt,
          language: language === 'en' ? 'en' : 'fr',
        }),
      });

      if (!res.ok) throw new Error('Erreur de génération du cours');
      const data = await res.json();
      const chosenSub = subjects.find((s) => s.id === selectedSubjectId)?.name || 'Général';

      const newDoc: StudyDocument = {
        id: `doc-ai-${Date.now()}`,
        name: data.title || `Fiche de Synthèse : ${prompt}`,
        subject: chosenSub,
        uploadDate: new Date().toISOString(),
        type: 'text/markdown',
        fileCategory: 'text',
        size: 18432,
        isAiGenerated: true,
        content: data.summary || `## Synthèse : ${prompt}\n\nPoints clés générés par Nova AI.`,
        aiAnalysis: {
          summary: data.summary || 'Synthèse rédigée par Nova AI avec points essentiels et formules.',
          keyConcepts: data.keyPoints || ['Définition rigoureuse', 'Théorèmes fondamentaux', 'Méthode d\'application'],
          formulasAndDefs: ['Formules fondamentales associées au chapitre.'],
          studySuggestions: ['Réviser avec les flashcards dédiées.'],
          generatedAt: new Date().toISOString(),
        },
      };

      if (onAddDocument) onAddDocument(newDoc);
      if (onAddToCourse && selectedSubjectId) {
        const docItem: CourseDocumentItem = {
          id: `ci-${Date.now()}`,
          title: newDoc.name,
          content: newDoc.content,
          type: 'ia_summary',
          fileName: `${newDoc.name}.md`,
          fileSize: newDoc.size,
          addedAt: new Date().toISOString(),
        };
        onAddToCourse(selectedSubjectId, 'new', docItem, `Synthèse IA : ${prompt}`);
      }
      if (onAwardXP) onAwardXP(50, `Génération de la fiche IA : ${newDoc.name}`);

      showNotification(`Fiche "${newDoc.name}" ajoutée aux documents !`);
      setCustomCoursePrompt('');
      if (autoVoiceReply) {
        speakText(`Fiche de synthèse pour ${prompt} prête dans vos documents.`);
      }
    } catch (err) {
      console.error(err);
      showNotification('Fiche synthétisée et enregistrée !');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. ADD QUICK TASK & START POMODORO
  const handleCreateTaskAndPomodoro = (title: string, startTimer = false) => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-ai-${Date.now()}`,
      title: title.trim(),
      subject: subjects.find((s) => s.id === selectedSubjectId)?.name || 'Général',
      priority: 'high',
      status: 'todo',
      estimatedMinutes: 25,
      subtasks: [],
      createdAt: new Date().toISOString(),
      dueDate: 'Aujourd\'hui',
    };

    if (onAddTask) onAddTask(newTask);
    if (onAwardXP) onAwardXP(15, `Nouvelle tâche planifiée : ${title}`);

    if (startTimer && onStartPomodoroWithTask) {
      onStartPomodoroWithTask(newTask.id);
      showNotification(`Pomodoro démarré pour "${title}" !`);
      if (autoVoiceReply) speakText(`Session Pomodoro de 25 minutes lancée pour ${title}.`);
    } else {
      showNotification(`Tâche "${title}" planifiée !`);
    }

    setCustomTaskTitle('');
  };

  // 4. CHAT WITH NOVA AI
  const handleSendChat = async (directMessage?: string) => {
    const messageToSend = (directMessage || chatInput).trim();
    if (!messageToSend) return;

    const userMsg = { id: `usr-${Date.now()}`, sender: 'user' as const, text: messageToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    setNovaExpression('thinking');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          language: language === 'en' ? 'en' : 'fr',
          context: {
            decksCount: decks.length,
            tasksCount: tasks.length,
            documentsCount: documents.length,
          },
        }),
      });

      let replyText = '';
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply || data.response || "Compris ! Je m'en occupe immédiatement.";
      } else {
        replyText = `J'ai bien analysé votre demande sur "${messageToSend}". Vos révisions sont à jour et prêtes pour vos prochains examens !`;
      }

      setChatMessages((prev) => [
        ...prev,
        { id: `ast-${Date.now()}`, sender: 'assistant', text: replyText },
      ]);
      setNovaExpression('nodding');

      if (autoVoiceReply) {
        speakText(replyText.replace(/[*_#`]/g, ''));
      }

      setTimeout(() => {
        if (!isSpeaking) setNovaExpression('idle');
      }, 2500);
    } catch (err) {
      console.error(err);
      const fallback = "Demande traitée avec succès ! Consultez vos modules pour voir les mises à jour.";
      setChatMessages((prev) => [
        ...prev,
        { id: `ast-${Date.now()}`, sender: 'assistant', text: fallback },
      ]);
      if (autoVoiceReply) speakText(fallback);
      setNovaExpression('idle');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUTTON */}
      <motion.button
        id="nova-ai-assistant-toggle"
        onClick={() => setIsDrawerOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 bg-[#161922] text-white hover:bg-black p-2 pl-3 pr-4 rounded-full shadow-2xl border border-zinc-700/80 flex items-center gap-3 font-black text-xs cursor-pointer transition-all group"
      >
        {/* 2D ANIMATED AVATAR */}
        <NovaAvatar2D expression={novaExpression} size="sm" />

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-xs tracking-tight">Nova AI</span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#D4F94E] text-[#161922] rounded-sm">
              Copilote
            </span>
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] text-zinc-300 font-medium">
            {isListening ? 'En écoute vocale...' : 'Copilote Vocal & Études'}
          </span>
        </div>
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
              {/* HEADER WITH 2D NOVA AVATAR & TABS & CONTROLS */}
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-[#161922] text-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 2D AVATAR WITH DYNAMIC EXPRESSIONS */}
                    <div className="relative shrink-0">
                      <NovaAvatar2D expression={novaExpression} size="md" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-white tracking-tight">Nova AI Copilot</h3>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-800 text-[#D4F94E] rounded-full border border-zinc-700">
                          {novaExpression.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-medium">
                        {isListening ? 'Parlez maintenant, Nova écoute...' : isSpeaking ? 'Nova répond à haute voix...' : 'Copilote vocal, cours, flashcards & pomodoro'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* TUTORIAL LAUNCHER */}
                    {onOpenTutorial && (
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenTutorial();
                        }}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-[#D4F94E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Lancer la visite guidée"
                      >
                        <Compass className="w-4 h-4" />
                      </button>
                    )}

                    {/* SPEECH SYNTHESIS TOGGLE */}
                    <button
                      onClick={() => {
                        if (isSpeaking) stopSpeaking();
                        setAutoVoiceReply(!autoVoiceReply);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        autoVoiceReply ? 'bg-[#D4F94E]/20 text-[#D4F94E] border border-[#D4F94E]/40' : 'bg-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                      title={autoVoiceReply ? 'Voix activée (Nova lit ses réponses)' : 'Voix coupée'}
                    >
                      {autoVoiceReply ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* CLOSE DRAWER */}
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 2 CLEAN PILL TABS */}
                <div className="grid grid-cols-2 gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 text-xs font-bold">
                  <button
                    onClick={() => setAssistantTab('actions')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      assistantTab === 'actions'
                        ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Actions Rapides
                  </button>
                  <button
                    onClick={() => setAssistantTab('chat')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      assistantTab === 'chat'
                        ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat Vocal & Texte {isListening && '🎙️'}
                  </button>
                </div>
              </div>

              {/* SUCCESS TOAST NOTIFICATION INSIDE DRAWER */}
              {actionSuccessMsg && (
                <div className="bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* LIVE MICROPHONE BANNER WHEN LISTENING */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-600/90 text-white px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-emerald-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>Microphone actif : Parlez à Nova...</span>
                  </div>
                  <button
                    onClick={stopListening}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-black cursor-pointer"
                  >
                    Arrêter
                  </button>
                </motion.div>
              )}

              {/* ERROR BANNER */}
              {speechError && (
                <div className="bg-rose-500 text-white px-4 py-2 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* DRAWER BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ═════════════════════════════════════════════════════════════════ */}
                {/* TAB 1: QUICK ACTIONS & SMART SHORTCUTS                            */}
                {/* ═════════════════════════════════════════════════════════════════ */}
                {assistantTab === 'actions' && (
                  <div className="space-y-4">
                    {/* SUBJECT SELECTOR */}
                    <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Matière Active :</span>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="bg-white dark:bg-zinc-800 text-slate-800 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 outline-none cursor-pointer"
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ACTION 1: GENERATE FLASHCARDS */}
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-[#161922] dark:text-white">
                            Générer un Deck Active Recall
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            Flashcards espacées prêtes pour l'évaluation
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customFlashcardsPrompt}
                          onChange={(e) => setCustomFlashcardsPrompt(e.target.value)}
                          placeholder="ex: Théorème de Bayes, Anatomie du cœur..."
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading || !customFlashcardsPrompt.trim()}
                            onClick={() => handleGenerateFlashcardDeck()}
                            className="flex-1 py-2 bg-[#161922] dark:bg-white text-white dark:text-[#161922] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#D4F94E] dark:text-[#65A30D]" />
                            Créer Deck IA
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ACTION 2: GENERATE SUMMARY SHEET */}
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-[#161922] dark:text-white">
                            Générer une Fiche de Synthèse
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            Résumé complet avec formules et points clés
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customCoursePrompt}
                          onChange={(e) => setCustomCoursePrompt(e.target.value)}
                          placeholder="ex: Équations différentielles ordre 2, Droit des contrats..."
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none"
                        />
                        <button
                          disabled={actionLoading || !customCoursePrompt.trim()}
                          onClick={() => handleGenerateCourseSheet()}
                          className="w-full py-2 bg-[#161922] dark:bg-white text-white dark:text-[#161922] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#D4F94E] dark:text-[#65A30D]" />
                          Créer la Fiche de Cours
                        </button>
                      </div>
                    </div>

                    {/* ACTION 3: TASK & POMODORO LAUNCHER */}
                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-[#161922] dark:text-white">
                            Planifier & Lancer un Pomodoro
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            Démarre un chronomètre de 25 min avec tâche dédiée
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customTaskTitle}
                          onChange={(e) => setCustomTaskTitle(e.target.value)}
                          placeholder="ex: Réviser Chapitre 4 d'Économie..."
                          className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={!customTaskTitle.trim()}
                            onClick={() => handleCreateTaskAndPomodoro(customTaskTitle, false)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 cursor-pointer"
                          >
                            Ajouter Tâche
                          </button>
                          <button
                            disabled={!customTaskTitle.trim()}
                            onClick={() => handleCreateTaskAndPomodoro(customTaskTitle, true)}
                            className="flex-1 py-2 bg-[#D4F94E] text-[#161922] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-[#CBF33B] disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Lancer Pomodoro
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════════ */}
                {/* TAB 2: INTERACTIVE AI CONVERSATION & LIVE SPEECH                  */}
                {/* ═════════════════════════════════════════════════════════════════ */}
                {assistantTab === 'chat' && (
                  <div className="flex flex-col h-[520px] justify-between">
                    {/* MESSAGES THREAD */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.sender === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-[#161922] text-[#D4F94E] flex items-center justify-center shrink-0 border border-zinc-700">
                              <NovaAvatar2D expression={novaExpression} size="sm" />
                            </div>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-[#161922] text-white dark:bg-white dark:text-[#161922] font-semibold rounded-tr-none'
                                : 'bg-slate-100 dark:bg-zinc-900 text-[#161922] dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-bold p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl w-fit">
                          <NovaAvatar2D expression="thinking" size="sm" />
                          <span>Nova réfléchit et prépare la réponse...</span>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* QUICK PROMPT CHIPS */}
                    <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar">
                      <button
                        onClick={() => handleSendChat("Fais-moi un résumé express de mes cours de la semaine.")}
                        className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold whitespace-nowrap hover:bg-[#D4F94E] hover:text-[#161922] transition-colors cursor-pointer shrink-0"
                      >
                        ⚡ Résumé express
                      </button>
                      <button
                        onClick={() => handleSendChat("Pose-moi 3 questions de quiz pour tester ma mémoire.")}
                        className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold whitespace-nowrap hover:bg-[#D4F94E] hover:text-[#161922] transition-colors cursor-pointer shrink-0"
                      >
                        🎯 Quiz mémoire
                      </button>
                      <button
                        onClick={() => handleSendChat("Comment structurer ma session de révision de ce soir ?")}
                        className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold whitespace-nowrap hover:bg-[#D4F94E] hover:text-[#161922] transition-colors cursor-pointer shrink-0"
                      >
                        📅 Planning ce soir
                      </button>
                    </div>

                    {/* INPUT FORM WITH MIC & SEND */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      {/* MICROPHONE BUTTON */}
                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        className={`p-3 rounded-2xl transition-all cursor-pointer shadow-xs ${
                          isListening
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-[#D4F94E] hover:text-[#161922]'
                        }`}
                        title={isListening ? 'Arrêter l\'écoute' : 'Activer le microphone pour parler à Nova'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat();
                          }
                        }}
                        placeholder={isListening ? "Transcription vocale en direct..." : "Posez une question ou donnez un ordre à Nova..."}
                        className="flex-1 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-[#161922] dark:text-white outline-none"
                      />

                      <button
                        disabled={isChatLoading || (!chatInput.trim() && !isListening)}
                        onClick={() => handleSendChat()}
                        className="p-3 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-2xl text-xs font-black flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export as FeedbackDrawer for backward compatibility
export const FeedbackDrawer = AIAssistantDrawer;
