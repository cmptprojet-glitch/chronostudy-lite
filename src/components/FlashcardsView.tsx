import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlashcardDeck, Flashcard, DeckAttachedFile } from '../types';
import { Layers, Plus, RotateCw, CheckCircle2, Sparkles, BookOpen, Trash2, Edit3, X, ArrowLeft, Volume2, Check, Brain, ChevronRight, Paperclip, FileText, Download, Upload, Share2, Copy, FileDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { XP_RATES } from '../utils/gamification';
import { SmoothCarousel } from './SmoothCarousel';

interface FlashcardsViewProps {
  decks: FlashcardDeck[];
  onSaveDeck: (deck: FlashcardDeck) => void;
  onDeleteDeck: (deckId: string) => void;
  selectedDeckId?: string | null;
  onOpenDeckBuilder?: () => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  decks,
  onSaveDeck,
  onDeleteDeck,
  selectedDeckId,
  onOpenDeckBuilder,
  onAwardXP,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(selectedDeckId || (decks.length > 0 ? decks[0].id : null));
  const [isStudying, setIsStudying] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isDecksFolded, setIsDecksFolded] = useState<boolean>(false);
  const [deckCarouselIndex, setDeckCarouselIndex] = useState<number>(0);
  
  // Modals
  const [showAddDeckModal, setShowAddDeckModal] = useState<boolean>(false);
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [showAiGenModal, setShowAiGenModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Import State
  const [importText, setImportText] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importSubject, setImportSubject] = useState('Mathématiques');

  // Forms
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('Mathématiques');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#D4F94E');

  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');

  // AI Gen Form
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Physique-Chimie');
  const [aiCardCount, setAiCardCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];

  React.useEffect(() => {
    if (selectedDeckId) {
      setActiveDeckId(selectedDeckId);
      setIsStudying(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  }, [selectedDeckId]);

  const handleStartStudy = (deckId: string) => {
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudying(true);
  };

  // Evaluate card response and calculate spaced repetition intervals
  const handleEvaluateCard = (evaluation: 'easy' | 'medium' | 'hard') => {
    if (!activeDeck) return;
    const currentCard = activeDeck.cards[currentCardIndex];
    if (!currentCard) return;

    let newInterval = currentCard.intervalDays;
    let newEasiness = currentCard.easinessFactor;

    if (evaluation === 'easy') {
      newInterval = Math.round(newInterval * 2.5) || 4;
      newEasiness += 0.15;
    } else if (evaluation === 'medium') {
      newInterval = newInterval + 2;
    } else {
      newInterval = 1; // reset for hard
      newEasiness = Math.max(1.3, newEasiness - 0.2);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    const updatedCard: Flashcard = {
      ...currentCard,
      intervalDays: newInterval,
      easinessFactor: newEasiness,
      nextReviewDate: nextDate.toISOString(),
      lastEvaluated: evaluation,
      reviewCount: currentCard.reviewCount + 1,
    };

    const updatedCards = [...activeDeck.cards];
    updatedCards[currentCardIndex] = updatedCard;

    const updatedDeck: FlashcardDeck = {
      ...activeDeck,
      cards: updatedCards,
    };

    onSaveDeck(updatedDeck);

    // Award XP for reviewing the individual card
    if (onAwardXP) {
      const xpEarned =
        evaluation === 'easy'
          ? XP_RATES.FLASHCARD_EASY
          : evaluation === 'medium'
          ? XP_RATES.FLASHCARD_MEDIUM
          : XP_RATES.FLASHCARD_HARD;
      onAwardXP(xpEarned, `Flashcard révisée (${evaluation === 'easy' ? 'Facile' : evaluation === 'medium' ? 'Moyen' : 'Difficile'})`);
    }

    // Next Card or Finish
    if (currentCardIndex + 1 < activeDeck.cards.length) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setIsStudying(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Add Card Manually
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuestion.trim() || !newCardAnswer.trim() || !activeDeck) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question: newCardQuestion.trim(),
      answer: newCardAnswer.trim(),
      intervalDays: 1,
      easinessFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    };

    const updatedDeck: FlashcardDeck = {
      ...activeDeck,
      cards: [...activeDeck.cards, newCard],
    };

    onSaveDeck(updatedDeck);
    setShowAddCardModal(false);
    setNewCardQuestion('');
    setNewCardAnswer('');
  };

  // Create New Deck
  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      title: newDeckTitle.trim(),
      subject: newDeckSubject,
      description: newDeckDesc.trim() || 'Deck de révision personnalisé',
      color: newDeckColor || '#D4F94E',
      createdAt: new Date().toISOString(),
      cards: [],
    };

    onSaveDeck(newDeck);
    setActiveDeckId(newDeck.id);
    setShowAddDeckModal(false);
    setNewDeckTitle('');
    setNewDeckDesc('');
  };

  // Gemini AI Generation
  const handleGenerateAiDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          subject: aiSubject,
          count: aiCardCount,
        }),
      });

      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        const generatedCards: Flashcard[] = data.cards.map((c: any, index: number) => ({
          id: `ai-card-${Date.now()}-${index}`,
          question: c.question,
          answer: c.answer,
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        }));

        const newDeck: FlashcardDeck = {
          id: `deck-ai-${Date.now()}`,
          title: data.title || `Flashcards : ${aiTopic}`,
          subject: aiSubject,
          description: data.description || `Généré automatiquement par Gemini pour ${aiTopic}`,
          color: '#D4F94E',
          createdAt: new Date().toISOString(),
          cards: generatedCards,
        };

        onSaveDeck(newDeck);
        setActiveDeckId(newDeck.id);
        setShowAiGenModal(false);
        setAiTopic('');
        confetti({ particleCount: 60, spread: 50 });
      }
    } catch (err) {
      console.error('Error generating deck:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export handlers
  const handleDownloadDeckJson = (deck: FlashcardDeck) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.toLowerCase().replace(/\s+/g, '_')}_deck.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = (deck: FlashcardDeck) => {
    const md = deck.cards
      .map((c, i) => `### Carte ${i + 1}\n**Q:** ${c.question}\n**R:** ${c.answer}\n`)
      .join('\n');
    navigator.clipboard.writeText(`# ${deck.title} (${deck.subject})\n\n${md}`);
    setCopiedNotification('Contenu copié en Markdown dans le presse-papier !');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Import handler (Supports JSON and Markdown / Text pairs)
  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      // Check if it's raw JSON
      if (importText.trim().startsWith('{')) {
        const parsed = JSON.parse(importText);
        if (parsed.cards && Array.isArray(parsed.cards)) {
          const importedDeck: FlashcardDeck = {
            id: `deck-import-${Date.now()}`,
            title: parsed.title || importTitle || 'Deck Importé',
            subject: parsed.subject || importSubject || 'Mathématiques',
            description: parsed.description || 'Deck importé via JSON',
            color: '#D4F94E',
            createdAt: new Date().toISOString(),
            cards: parsed.cards.map((c: any, i: number) => ({
              id: `imported-card-${Date.now()}-${i}`,
              question: c.question || c.q || 'Question',
              answer: c.answer || c.a || 'Réponse',
              intervalDays: 1,
              easinessFactor: 2.5,
              nextReviewDate: new Date().toISOString(),
              reviewCount: 0,
            })),
          };
          onSaveDeck(importedDeck);
          setActiveDeckId(importedDeck.id);
          setShowImportModal(false);
          setImportText('');
          confetti({ particleCount: 50, spread: 60 });
          return;
        }
      }

      // Parse text lines formatted with Q: and R: / A: or separator lines
      const lines = importText.split('\n');
      const cards: Flashcard[] = [];
      let currentQ = '';
      let currentA = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^(\*\*Q:\*\*|Q:|Question:|\?)/i)) {
          if (currentQ && currentA) {
            cards.push({
              id: `imported-card-${Date.now()}-${cards.length}`,
              question: currentQ.trim(),
              answer: currentA.trim(),
              intervalDays: 1,
              easinessFactor: 2.5,
              nextReviewDate: new Date().toISOString(),
              reviewCount: 0,
            });
            currentQ = '';
            currentA = '';
          }
          currentQ = line.replace(/^(\*\*Q:\*\*|Q:|Question:|\?)\s*/i, '');
        } else if (line.match(/^(\*\*R:\*\*|\*\*A:\*\*|R:|A:|Answer:|Réponse:)/i)) {
          currentA = line.replace(/^(\*\*R:\*\*|\*\*A:\*\*|R:|A:|Answer:|Réponse:)\s*/i, '');
        } else if (line.includes('---') || line.includes('###')) {
          if (currentQ && currentA) {
            cards.push({
              id: `imported-card-${Date.now()}-${cards.length}`,
              question: currentQ.trim(),
              answer: currentA.trim(),
              intervalDays: 1,
              easinessFactor: 2.5,
              nextReviewDate: new Date().toISOString(),
              reviewCount: 0,
            });
            currentQ = '';
            currentA = '';
          }
        } else if (currentA) {
          currentA += '\n' + line;
        } else if (currentQ) {
          currentQ += '\n' + line;
        }
      }

      if (currentQ && currentA) {
        cards.push({
          id: `imported-card-${Date.now()}-${cards.length}`,
          question: currentQ.trim(),
          answer: currentA.trim(),
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        });
      }

      if (cards.length > 0) {
        const newDeck: FlashcardDeck = {
          id: `deck-import-${Date.now()}`,
          title: importTitle.trim() || `Deck Importé (${cards.length} cartes)`,
          subject: importSubject,
          description: `Deck généré depuis l'import de ${cards.length} cartes`,
          color: '#D4F94E',
          createdAt: new Date().toISOString(),
          cards,
        };
        onSaveDeck(newDeck);
        setActiveDeckId(newDeck.id);
        setShowImportModal(false);
        setImportText('');
        setImportTitle('');
        confetti({ particleCount: 50, spread: 60 });
      } else {
        alert('Format non reconnu. Assurez-vous d\'utiliser des lignes "Q: Question" et "R: Réponse" ou du format JSON.');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Erreur lors de l\'analyse du texte ou du JSON.');
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
              Flashcards & Active Recall
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Répétition espacée (Spaced Repetition) et auto-évaluation interactive
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onOpenDeckBuilder && (
            <button
              onClick={onOpenDeckBuilder}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] border border-[#D4F94E] hover:bg-[#D4F94E] hover:text-[#161922] rounded-2xl text-xs font-black transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Studio Création Pro</span>
            </button>
          )}

          <button
            onClick={() => setShowAiGenModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161922] text-white dark:bg-white dark:text-[#161922] rounded-2xl text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4F94E] dark:text-[#161922]" />
            <span>Générer par IA</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Importer Decks</span>
          </button>

          <button
            onClick={() => setShowAddDeckModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#161922]" />
            <span>Nouveau Deck</span>
          </button>
        </div>
      </div>

      {/* STUDY MODE ACTIVE */}
      {isStudying && activeDeck && activeDeck.cards.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
            <button
              onClick={() => setIsStudying(false)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quitter l'entraînement
            </button>

            <div className="text-center">
              <span className="text-xs font-extrabold text-[#161922] dark:text-white uppercase tracking-wider">
                {activeDeck.title}
              </span>
              <p className="text-[11px] text-slate-500">
                Carte {currentCardIndex + 1} sur {activeDeck.cards.length}
              </p>
            </div>

            <div className="w-16 h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4F94E] rounded-full transition-all"
                style={{ width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* FLIP CARD */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeDeck.id}-${currentCardIndex}`}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[320px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-md flex flex-col justify-between transition-all select-none"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="uppercase tracking-widest text-[#65A30D] dark:text-[#D4F94E]">{isFlipped ? 'Réponse' : 'Question'}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <RotateCw className="w-3.5 h-3.5" /> Cliquer pour retourner
                </span>
              </div>

              <div className="my-auto text-center space-y-4 px-4">
                <p className="text-xl md:text-2xl font-extrabold text-[#161922] dark:text-white leading-relaxed">
                  {isFlipped ? activeDeck.cards[currentCardIndex].answer : activeDeck.cards[currentCardIndex].question}
                </p>
              </div>

              <div className="text-center text-xs text-slate-400 font-medium">
                {isFlipped ? 'Auto-évaluez votre niveau de maîtrise ci-dessous' : 'Réfléchissez à la réponse avant d\'afficher le verso'}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* EVALUATION BUTTONS (EASY, MEDIUM, HARD) */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-3"
              >
                <button
                  onClick={() => handleEvaluateCard('hard')}
                  className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Difficile</span>
                  <span className="text-[10px] font-normal opacity-90">Revoir à 1 jour</span>
                </button>

                <button
                  onClick={() => handleEvaluateCard('medium')}
                  className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Moyen</span>
                  <span className="text-[10px] font-normal opacity-90">+2 jours</span>
                </button>

                <button
                  onClick={() => handleEvaluateCard('easy')}
                  className="py-3 px-4 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl font-black text-xs shadow-xs transition-all flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span>Facile</span>
                  <span className="text-[10px] font-bold text-[#161922] opacity-90">+4 jours (Maîtrisé)</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* DECK LIST GRID & CARD DETAILS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: DECK LIST WITH CAROUSEL & UNFOLDING SYSTEM (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#65A30D] dark:text-[#D4F94E]">
                Mes Decks ({decks.length})
              </h3>
              {decks.length > 2 && (
                <button
                  onClick={() => setIsDecksFolded(!isDecksFolded)}
                  className="text-xs font-bold text-slate-500 hover:text-[#161922] dark:hover:text-white transition-colors cursor-pointer bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full"
                >
                  {isDecksFolded ? `Déplier (${decks.length}) ▾` : 'Replier en Carrousel ▴'}
                </button>
              )}
            </div>

            {/* IF FOLDED: CAROUSEL VIEW WITH FLUID TOUCH & CLICK NAVIGATION */}
            {isDecksFolded && decks.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
                <SmoothCarousel
                  title={<span className="text-sm font-black text-[#161922] dark:text-white">Carrousel de Decks</span>}
                  subtitle="Glissez latéralement ou utilisez les flèches"
                  totalItems={decks.length}
                  gap="md"
                >
                  {decks.map((deck, idx) => {
                    const isSelected = deck.id === activeDeckId;
                    const masteredCount = deck.cards.filter((c) => c.easinessFactor > 2.4).length;
                    return (
                      <div
                        key={deck.id}
                        onClick={() => setActiveDeckId(deck.id)}
                        className={`min-w-[260px] sm:min-w-[280px] max-w-[320px] shrink-0 snap-start p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 ${
                          isSelected
                            ? 'bg-[#EFFDE2]/70 dark:bg-zinc-800 border-[#D4F94E] shadow-xs ring-2 ring-[#D4F94E]/40'
                            : 'bg-[#F9FAFC] dark:bg-zinc-950/60 border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#161922] text-[#D4F94E] dark:bg-zinc-700">
                              {deck.subject}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm mb-1 text-[#161922] dark:text-white truncate">
                            {deck.title}
                          </h4>
                          <p className="text-xs line-clamp-2 text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-2">
                            {deck.description || 'Deck de révision interactif.'}
                          </p>

                          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                            <span>📚 {deck.cards.length} Cartes</span>
                            <span className="text-emerald-500 font-black">
                              {masteredCount} Maîtrisées
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeckId(deck.id);
                              handleStartStudy(deck.id);
                            }}
                            className="flex-1 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Brain className="w-3.5 h-3.5" /> Entraîner
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeckId(deck.id);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#161922] text-white dark:bg-white dark:text-[#161922]'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            {isSelected ? 'Actif' : 'Choisir'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </SmoothCarousel>
              </div>
            ) : (
              /* EXPANDED FULL LIST VIEW */
              <div className="space-y-3">
                <AnimatePresence>
                  {decks.map((deck, idx) => {
                    const isSelected = deck.id === activeDeckId;
                    return (
                      <motion.div
                        key={deck.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.26,
                          delay: Math.min(idx * 0.04, 0.25),
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        onClick={() => setActiveDeckId(deck.id)}
                        className={`cursor-pointer p-4 rounded-3xl border transition-all ${
                          isSelected
                            ? 'bg-[#EFFDE2] dark:bg-zinc-800 border-[#D4F94E] shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-[#161922] dark:text-white hover:border-[#D4F94E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#161922] text-[#D4F94E] dark:bg-zinc-700">
                            {deck.subject}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {deck.cards.length} cartes
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base mb-1 text-[#161922] dark:text-white">{deck.title}</h4>
                        <p className="text-xs line-clamp-2 text-slate-500 dark:text-slate-400">
                          {deck.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartStudy(deck.id);
                            }}
                            className="font-black text-[#65A30D] dark:text-[#D4F94E] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Brain className="w-3.5 h-3.5" /> Lancer l'entraînement
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Voulez-vous supprimer ce deck ?')) onDeleteDeck(deck.id);
                            }}
                            className="text-rose-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT: DECK CARDS LIST & MANAGEMENT (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xs rounded-3xl p-6 space-y-4">
            {activeDeck ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#161922] dark:text-white">{activeDeck.title}</h3>
                    <p className="text-xs text-slate-500">{activeDeck.subject} • {activeDeck.cards.length} cartes mémoire</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Exporter ce deck en JSON ou Markdown"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </button>

                    <button
                      onClick={() => handleStartStudy(activeDeck.id)}
                      className="px-4 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Brain className="w-4 h-4 text-[#161922]" />
                      <span>Mode Active Recall</span>
                    </button>

                    <button
                      onClick={() => setShowAddCardModal(true)}
                      className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter Carte</span>
                    </button>
                  </div>
                </div>

                {/* ATTACHED FILES SECTION (IF PRESENT) */}
                {activeDeck.attachedFiles && activeDeck.attachedFiles.length > 0 && (
                  <div className="p-4 bg-[#EFFDE2] dark:bg-zinc-800/80 border border-[#D4F94E]/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> Fichiers Joints au Deck ({activeDeck.attachedFiles.length})
                      </span>
                      {onOpenDeckBuilder && (
                        <button
                          type="button"
                          onClick={onOpenDeckBuilder}
                          className="text-[11px] font-black text-[#161922] dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#65A30D] dark:text-[#D4F94E]" />
                          <span>Générer d'autres Quiz d'après fichiers</span>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeDeck.attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-bold text-[#161922] dark:text-white shadow-xs"
                        >
                          <span>{file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.md') ? '📝' : '📄'}</span>
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {activeDeck.cards.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold">Aucune carte dans ce deck.</p>
                      <p className="text-xs">Ajoutez-en une manuellement ou utilisez l'IA Gemini pour en générer !</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {activeDeck.cards.map((card, idx) => (
                        <motion.div
                          key={card.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.22,
                            delay: Math.min(idx * 0.03, 0.2),
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                          className="p-4 bg-[#F5F6FA] dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xs transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>Carte #{idx + 1}</span>
                            <span className="text-[#65A30D] dark:text-[#D4F94E]">Intervalle : {card.intervalDays}j</span>
                          </div>
                          <p className="text-sm font-bold text-[#161922] dark:text-white">Q: {card.question}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                            R: {card.answer}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">Sélectionnez ou créez un deck pour commencer.</div>
            )}
          </div>
        </div>
      )}

      {/* AI GENERATION MODAL */}
      {showAiGenModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#161922] dark:text-white">Générateur de Flashcards IA Gemini</h3>
              </div>
              <button onClick={() => setShowAiGenModal(false)} className="text-slate-400 hover:text-[#161922] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAiDeck} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Matière Académique</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white font-medium"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT & Biologie">SVT & Biologie</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="Langues (Anglais)">Langues (Anglais)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sujet ou Chapitre Précis</label>
                <input
                  type="text"
                  placeholder="ex: Les lois de Newton et l'orbitographie..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de cartes à générer</label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={aiCardCount}
                  onChange={(e) => setAiCardCount(parseInt(e.target.value) || 5)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiGenModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isGenerating ? 'Génération...' : 'Générer Deck IA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DECK MODAL */}
      {showAddDeckModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#161922] dark:text-white">Créer un Nouveau Deck</h3>
              <button onClick={() => setShowAddDeckModal(false)} className="text-slate-400 hover:text-[#161922] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Titre du Deck</label>
                <input
                  type="text"
                  placeholder="ex: Chapitre 2 : Integrales"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Matière</label>
                <select
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT & Biologie">SVT & Biologie</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="Langues (Anglais)">Langues (Anglais)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  placeholder="Bref résumé des sujets traités..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 h-20 text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeckModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black cursor-pointer shadow-xs">
                  Créer le Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CARD MODAL */}
      {showAddCardModal && activeDeck && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#161922] dark:text-white">Ajouter une Carte</h3>
              <button onClick={() => setShowAddCardModal(false)} className="text-slate-400 hover:text-[#161922] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Question (Recto)</label>
                <textarea
                  placeholder="Énoncé de la question ou formule..."
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 h-20 text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Réponse (Verso)</label>
                <textarea
                  placeholder="Réponse exacte ou explication..."
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 h-24 text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black cursor-pointer shadow-xs">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EXPORT DECK MODAL */}
      {showExportModal && activeDeck && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#161922] dark:text-white">Exporter le Deck</h3>
                  <p className="text-xs text-slate-500">{activeDeck.title} ({activeDeck.cards.length} cartes)</p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-[#161922] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {copiedNotification && (
              <div className="p-3 bg-[#EFFDE2] border border-[#D4F94E] rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{copiedNotification}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadDeckJson(activeDeck)}
                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm text-[#161922] dark:text-white block flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-blue-500" /> Télécharger en JSON (.json)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    Format universel de sauvegarde et de partage instantané
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleCopyMarkdown(activeDeck)}
                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm text-[#161922] dark:text-white block flex items-center gap-2">
                    <Copy className="w-4 h-4 text-emerald-500" /> Copier en Markdown / Texte
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    Copier le texte formaté Q & R dans le presse-papier pour Notion, Obsidian ou Anki
                  </span>
                </div>
                <Share2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT DECK MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#161922] dark:text-white">Importer des Flashcards</h3>
                  <p className="text-xs text-slate-500">Collez du texte ou du JSON pour créer un deck instantanément</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-[#161922] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Titre du Deck (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Formules Trigonométrie"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Matière</label>
                  <select
                    value={importSubject}
                    onChange={(e) => setImportSubject(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-[#161922] dark:text-white"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                    <option value="SVT & Biologie">SVT & Biologie</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Langues (Anglais)">Langues (Anglais)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Contenu (JSON ou paires Q: / R:)
                  </label>
                  <span className="text-[10px] text-slate-400">Ex: Q: Théorème de Pythagore \n R: a² + b² = c²</span>
                </div>
                <textarea
                  placeholder={`Q: Quelle est la vitesse de la lumière ?\nR: Environ 300 000 km/s\n\nQ: Formule de l'énergie cinétique ?\nR: Ec = 1/2 * m * v²`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 h-36 font-mono text-xs text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black cursor-pointer shadow-xs"
                >
                  Créer et Importer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
