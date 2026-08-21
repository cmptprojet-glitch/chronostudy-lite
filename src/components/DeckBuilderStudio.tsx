import React, { useState, useRef } from 'react';
import { FlashcardDeck, Flashcard, CardType, FlashcardOption, DeckAttachedFile } from '../types';
import { TabType } from './Navbar';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Layers,
  Code,
  CheckCircle2,
  HelpCircle,
  FileText,
  Download,
  Upload,
  RotateCw,
  Sliders,
  Check,
  Brain,
  Zap,
  BookOpen,
  ArrowRight,
  Palette,
  ShieldCheck,
  Tag,
  Lightbulb,
  X,
  Play,
  Paperclip,
  FileUp,
  Eye,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

interface DeckBuilderStudioProps {
  onSaveDeck: (deck: FlashcardDeck) => void;
  setActiveTab: (tab: TabType) => void;
  onOpenDeck?: (deckId: string) => void;
}

// PRE-BUILT PROFESSIONAL TEMPLATES
const PRESET_TEMPLATES: {
  id: string;
  title: string;
  subject: string;
  description: string;
  color: string;
  icon: string;
  difficulty: 'Facile' | 'Moyen' | 'Avancé' | 'Expert';
  tags: string[];
  cards: Partial<Flashcard>[];
}[] = [
  {
    id: 'preset-langues-c1',
    title: 'Vocabulaire Anglais C1/C2 & Phrasal Verbs',
    subject: 'Langues (Anglais)',
    description: '10 expressions idiomatiques et tournures académiques pour le TOEIC/IELTS.',
    color: '#D4F94E',
    icon: '🇬🇧',
    difficulty: 'Avancé',
    tags: ['Vocabulaire', 'TOEIC', 'Grammaire'],
    cards: [
      { question: 'What does "To gloss over something" mean?', answer: 'To treat or represent something as less serious or important than it really is.', type: 'classic', hint: 'Think about covering up mistakes' },
      { question: 'Synonym for "Ubiquitous"', answer: 'Omnipresent / Present, appearing, or found everywhere.', type: 'classic' },
      { question: 'Meaning of "To hit the nail on the head"', answer: 'To describe exactly what is causing a situation or problem.', type: 'classic' },
      { question: 'Correct meaning of "Acquiesce"', answer: 'Accept something reluctantly but without protest.', type: 'classic' },
      { question: 'Complete: "She decided to _____ the offer after consideration." (Accept reluctantly)', answer: 'acquiesce in / to', type: 'cloze' },
    ]
  },
  {
    id: 'preset-anatomie-neuro',
    title: 'Anatomie & Système Nerveux Central',
    subject: 'SVT & Biologie',
    description: 'Cartes mémoires de haute précision sur l\'encéphale et les neurones.',
    color: '#D4F94E',
    icon: '🧠',
    difficulty: 'Expert',
    tags: ['Médecine', 'Anatomie', 'Neurosciences'],
    cards: [
      { question: 'Rôle principal de l\'Hippocampe dans le cerveau ?', answer: 'Consolidation de la mémoire à long terme et orientation spatiale.', type: 'classic' },
      { question: 'Quel neurotransmetteur est le principal inhibiteur du système nerveux central ?', answer: 'Le GABA (Acide gamma-aminobutyrique).', type: 'classic' },
      { question: 'Vrai ou Faux : La gaine de myéline ralentit la vitesse de conduction de l\'influx nerveux.', answer: 'FAUX. La gaine de myéline accélère la conduction (conduction saltatoire).', type: 'true_false' },
      { question: 'Quelle aire cérébrale est responsable de la production du langage articulé ?', answer: 'L\'aire de Broca (dans le lobe frontal).', type: 'classic' }
    ]
  },
  {
    id: 'preset-python-algo',
    title: 'Code Python, Algorithmique & Big-O',
    subject: 'Informatique',
    description: 'Complexité temporelle, structures de données et syntaxe avancée Python 3.',
    color: '#D4F94E',
    icon: '💻',
    difficulty: 'Avancé',
    tags: ['Python', 'Algorithmes', 'Big-O'],
    cards: [
      { question: 'Quelle est la complexité temporelle moyenne du Quicksort ?', answer: 'O(n log n). Au pire des cas O(n²).', type: 'code', codeLanguage: 'python' },
      { question: 'Différence entre "is" et "==" en Python ?', answer: '"==" compare les valeurs de deux objets, tandis que "is" compare l\'identité mémoire (si ce sont le même objet en RAM).', type: 'code', codeLanguage: 'python' },
      { question: 'Complexité de la recherche dichotomique (Binary Search) sur tableau trié ?', answer: 'O(log n).', type: 'classic' }
    ]
  },
  {
    id: 'preset-droit-civil',
    title: 'Droit Civil & Responsabilité Contractuelle',
    subject: 'Droit & Sciences Politiques',
    description: 'Fiches juridiques essentielles sur la réforme du droit des obligations (Code Civil).',
    color: '#D4F94E',
    icon: '⚖️',
    difficulty: 'Avancé',
    tags: ['Droit Civil', 'Code Civil', 'Jurisprudence'],
    cards: [
      { question: 'Quelles sont les 3 conditions cumulatives de la responsabilité civile extracontractuelle ?', answer: '1. Une faute (ou fait générateur) \n2. Un dommage certain \n3. Un lien de causalité direct.', type: 'classic' },
      { question: 'Quel article du Code Civil consacre le principe de bonne foi dans les contrats ?', answer: 'L\'article 1104 du Code Civil ("Les contrats doivent être négociés, formés et exécutés de bonne foi").', type: 'classic' }
    ]
  },
  {
    id: 'preset-quantique-relativite',
    title: 'Physique Quantique & Relativité',
    subject: 'Physique-Chimie',
    description: 'Équations fondamentales, constante de Planck et mécanique ondulatoire.',
    color: '#D4F94E',
    icon: '⚛️',
    difficulty: 'Expert',
    tags: ['Physique', 'Quantique', 'Formules'],
    cards: [
      { question: 'Quelle est l\'Équation d\'Einstein pour l\'équivalence masse-énergie ?', answer: 'E = m · c²', type: 'code', codeLanguage: 'latex' },
      { question: 'Enoncé du Principe d\'Incertitude d\'Heisenberg ?', answer: 'Δx · Δp ≥ ℏ / 2 (Impossible de mesurer simultanément avec une précision infinie la position et la quantité de mouvement).', type: 'classic' }
    ]
  },
  {
    id: 'preset-finance-bilan',
    title: 'Finance d\'Entreprise & Analyse de Bilan',
    subject: 'Économie & Gestion',
    description: 'Ratios financiers, WACC, EBITDA et évaluation d\'entreprise.',
    color: '#D4F94E',
    icon: '📊',
    difficulty: 'Moyen',
    tags: ['Finance', 'Bilan', 'Gestion'],
    cards: [
      { question: 'Que signifie l\'acronyme EBITDA ?', answer: 'Earnings Before Interest, Taxes, Depreciation, and Amortization (Excédent Brut d\'Exploitation - EBE).', type: 'classic' },
      { question: 'Formule du Besoin en Fonds de Roulement (BFR) ?', answer: 'BFR = Actif Circulant (Stocks + Créances clients) - Passif Circulant (Dettes fournisseurs).', type: 'classic' }
    ]
  }
];

export const DeckBuilderStudio: React.FC<DeckBuilderStudioProps> = ({
  onSaveDeck,
  setActiveTab,
  onOpenDeck,
}) => {
  const { currentTheme } = useTheme();
  const [activeBuilderTab, setActiveBuilderTab] = useState<'manual' | 'ai' | 'files_quiz' | 'presets' | 'import'>('manual');

  // DECK METADATA STATE
  const [deckTitle, setDeckTitle] = useState('Master Deck : Algorithmes & Data');
  const [deckSubject, setDeckSubject] = useState('Informatique');
  const [deckDescription, setDeckDescription] = useState('Deck complet pour révisions d\'examens et entretiens techniques.');
  const [deckColor, setDeckColor] = useState(currentTheme.accentColor);
  const [deckIcon, setDeckIcon] = useState('⚡');
  const [deckDifficulty, setDeckDifficulty] = useState<'Facile' | 'Moyen' | 'Avancé' | 'Expert'>('Avancé');
  const [deckTagsInput, setDeckTagsInput] = useState('Data, Python, Examen');

  // ATTACHED FILES STATE
  const [attachedFiles, setAttachedFiles] = useState<DeckAttachedFile[]>([]);
  const [isGeneratingFromFile, setIsGeneratingFromFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ADVANCED ALGORITHM SETTINGS
  const [retentionGoal, setRetentionGoal] = useState<number>(90);
  const [initialInterval, setInitialInterval] = useState<number>(1);
  const [maxNewCardsPerDay, setMaxNewCardsPerDay] = useState<number>(20);
  const [algorithmType, setAlgorithmType] = useState<'sm2' | 'anki_standard' | 'fsrs'>('sm2');

  // MANUAL CARD BUILDER STATE
  const [cardsList, setCardsList] = useState<Flashcard[]>([
    {
      id: 'c1',
      question: 'Qu\'est-ce qu\'un arbre binaire de recherche (BST) ?',
      answer: 'Un arbre où chaque nœud a au plus 2 enfants, avec les valeurs inférieures à gauche et supérieures à droite.',
      type: 'classic',
      hint: 'Pensez à la propriété d\'ordre gauche < racine < droite',
      explanation: 'Cette structure permet une recherche en O(log n) si l\'arbre est équilibré.',
      intervalDays: 1,
      easinessFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    },
    {
      id: 'c2',
      question: 'Quelle est la complexité du Tri Fusion (Merge Sort) ?',
      answer: 'O(n log n) dans tous les cas (pire, meilleur, moyen).',
      type: 'classic',
      intervalDays: 1,
      easinessFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    }
  ]);

  // SINGLE CARD INPUTS
  const [cardType, setCardType] = useState<CardType>('classic');
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [cardHint, setCardHint] = useState('');
  const [cardExplanation, setCardExplanation] = useState('');
  const [cardCodeLang, setCardCodeLang] = useState('python');

  // QCM OPTIONS STATE
  const [qcmOptions, setQcmOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([
    { id: 'opt-1', text: 'Option A', isCorrect: true },
    { id: 'opt-2', text: 'Option B', isCorrect: false },
    { id: 'opt-3', text: 'Option C', isCorrect: false },
  ]);

  // ORDERING & MATCHING STATES
  const [orderingItems, setOrderingItems] = useState<string[]>([
    'Étape 1 : Hypothèse initiale',
    'Étape 2 : Expérimentation',
    'Étape 3 : Analyse des résultats',
    'Étape 4 : Conclusion théorique',
  ]);
  const [matchingPairs, setMatchingPairs] = useState<{ id: string; left: string; right: string }[]>([
    { id: 'p-1', left: 'ADN', right: 'Support de l\'information génétique' },
    { id: 'p-2', left: 'Ribosome', right: 'Synthèse des protéines' },
    { id: 'p-3', left: 'Mitochondrie', right: 'Production d\'énergie (ATP)' },
  ]);

  // AI GENERATOR STATE
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Informatique');
  const [aiCardCount, setAiCardCount] = useState<number>(8);
  const [aiNotesText, setAiNotesText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // IMPORT / EXPORT STATE
  const [rawImportText, setRawImportText] = useState('');
  const [importSeparator, setImportSeparator] = useState<';' | '|' | 'tab'>(';');

  // LIVE PREVIEW FLIP STATE
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);

  // STATUS FEEDBACK
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: DeckAttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          type: file.type || file.name.split('.').pop() || 'document',
          uploadedAt: new Date().toISOString(),
          content: content || '',
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Generate Flashcards & Quiz from Attached Files
  const handleGenerateCardsFromFiles = async () => {
    if (attachedFiles.length === 0) {
      alert('Veuillez d\'abord ajouter des fichiers joints (PDF, texte, cours, notes) pour lancer la génération.');
      return;
    }

    setIsGeneratingFromFile(true);
    try {
      const combinedSnippets = attachedFiles
        .map((f) => `=== Document: ${f.name} ===\n${(f.content || '').slice(0, 3000)}`)
        .join('\n\n');

      const res = await fetch('/api/gemini/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Synthèse & Quiz d'après ${attachedFiles.map((f) => f.name).join(', ')}`,
          subject: deckSubject || 'Matière générale',
          count: 8,
          additionalContext: combinedSnippets || `Fichiers joints: ${attachedFiles.map((f) => f.name).join(', ')}`,
        }),
      });

      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        const generatedCards: Flashcard[] = data.cards.map((c: any, idx: number) => ({
          id: `file-gen-card-${Date.now()}-${idx}`,
          question: c.question,
          answer: c.answer,
          type: c.type || 'classic',
          options: c.options || undefined,
          hint: c.hint || `Extrait de ${attachedFiles[0]?.name || 'cours'}`,
          explanation: c.explanation || undefined,
          intervalDays: initialInterval,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        }));

        setCardsList((prev) => [...prev, ...generatedCards]);
        if (deckTitle.includes('Master Deck')) {
          setDeckTitle(`Deck : ${attachedFiles[0]?.name.replace(/\.[^/.]+$/, '')}`);
        }
        setActiveBuilderTab('manual');
        alert(`${generatedCards.length} flashcards et questions de quiz générées avec succès d'après vos fichiers joints !`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'analyse des fichiers par l\'IA.');
    } finally {
      setIsGeneratingFromFile(false);
    }
  };

  // Add Option to QCM
  const handleAddQcmOption = () => {
    setQcmOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, text: `Option ${String.fromCharCode(65 + prev.length)}`, isCorrect: false }
    ]);
  };

  const handleToggleQcmCorrect = (optId: string) => {
    setQcmOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optId ? !opt.isCorrect : opt.isCorrect,
      }))
    );
  };

  const handleUpdateQcmText = (optId: string, newText: string) => {
    setQcmOptions((prev) =>
      prev.map((opt) => (opt.id === optId ? { ...opt, text: newText } : opt))
    );
  };

  const handleRemoveQcmOption = (optId: string) => {
    if (qcmOptions.length <= 2) return;
    setQcmOptions((prev) => prev.filter((opt) => opt.id !== optId));
  };

  // Add Card to Current List
  const handleAddCardToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardQuestion.trim()) return;

    let finalAnswer = cardAnswer.trim();
    let formattedOptions: FlashcardOption[] | undefined = undefined;

    if (cardType === 'qcm') {
      formattedOptions = qcmOptions.map((o) => ({
        id: o.id,
        text: o.text.trim(),
        isCorrect: o.isCorrect,
      }));
      const correctOpt = qcmOptions.find((o) => o.isCorrect);
      finalAnswer = correctOpt ? correctOpt.text : qcmOptions[0].text;
    } else if (cardType === 'true_false') {
      finalAnswer = cardAnswer || 'VRAI';
    } else if (cardType === 'ordering') {
      finalAnswer = orderingItems.join(' → ');
    } else if (cardType === 'matching') {
      finalAnswer = matchingPairs.map((p) => `${p.left} ↔ ${p.right}`).join('\n');
    }

    const newCard: Flashcard = {
      id: `card-pro-${Date.now()}`,
      question: cardQuestion.trim(),
      answer: finalAnswer,
      type: cardType,
      options: formattedOptions,
      orderItems: cardType === 'ordering' ? orderingItems.filter((it) => it.trim().length > 0) : undefined,
      matchPairs: cardType === 'matching' ? matchingPairs.map((p) => ({ id: p.id, left: p.left, right: p.right })) : undefined,
      hint: cardHint.trim() || undefined,
      explanation: cardExplanation.trim() || undefined,
      codeLanguage: cardType === 'code' ? cardCodeLang : undefined,
      intervalDays: initialInterval,
      easinessFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    };

    setCardsList((prev) => [...prev, newCard]);
    setCardQuestion('');
    setCardAnswer('');
    setCardHint('');
    setCardExplanation('');
    setPreviewCardIndex(cardsList.length);
  };

  // Remove Card
  const handleRemoveCard = (cardId: string) => {
    setCardsList((prev) => prev.filter((c) => c.id !== cardId));
    if (previewCardIndex >= cardsList.length - 1) {
      setPreviewCardIndex(Math.max(0, cardsList.length - 2));
    }
  };

  // Duplicate Card
  const handleDuplicateCard = (card: Flashcard) => {
    const dup: Flashcard = {
      ...card,
      id: `card-dup-${Date.now()}`,
      question: `${card.question} (Copie)`,
    };
    setCardsList((prev) => [...prev, dup]);
  };

  // AI Generation Trigger
  const handleGenerateAiDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() && !aiNotesText.trim()) {
      alert('Veuillez renseigner un sujet ou coller des notes de cours.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || `Notes sur ${aiSubject}`,
          subject: aiSubject,
          count: aiCardCount,
          additionalContext: aiNotesText,
        }),
      });

      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        const generatedCards: Flashcard[] = data.cards.map((c: any, idx: number) => ({
          id: `ai-card-${Date.now()}-${idx}`,
          question: c.question,
          answer: c.answer,
          type: 'classic',
          hint: c.hint || undefined,
          explanation: c.explanation || undefined,
          intervalDays: initialInterval,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        }));

        setCardsList((prev) => [...prev, ...generatedCards]);
        if (aiTopic) setDeckTitle(`Deck IA : ${aiTopic}`);
        setDeckSubject(aiSubject);
        setActiveBuilderTab('manual');
        alert(`${generatedCards.length} flashcards générées avec succès par Gemini !`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Load Preset Template
  const handleLoadPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setDeckTitle(preset.title);
    setDeckSubject(preset.subject);
    setDeckDescription(preset.description);
    setDeckColor(preset.color);
    setDeckIcon(preset.icon);
    setDeckDifficulty(preset.difficulty);
    setDeckTagsInput(preset.tags.join(', '));

    const loadedCards: Flashcard[] = preset.cards.map((c, idx) => ({
      id: `preset-card-${Date.now()}-${idx}`,
      question: c.question || 'Question modèle',
      answer: c.answer || 'Réponse modèle',
      type: c.type || 'classic',
      hint: c.hint,
      explanation: c.explanation,
      codeLanguage: c.codeLanguage,
      intervalDays: 1,
      easinessFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    }));

    setCardsList(loadedCards);
    setActiveBuilderTab('manual');
    setPreviewCardIndex(0);
    setIsPreviewFlipped(false);
  };

  // Parse Raw Import Text
  const handleParseImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawImportText.trim()) return;

    const lines = rawImportText.split('\n');
    const newImportedCards: Flashcard[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let parts: string[] = [];
      if (importSeparator === ';') parts = trimmed.split(';');
      else if (importSeparator === '|') parts = trimmed.split('|');
      else parts = trimmed.split('\t');

      if (parts.length >= 2) {
        newImportedCards.push({
          id: `imp-${Date.now()}-${idx}`,
          question: parts[0].trim(),
          answer: parts[1].trim(),
          hint: parts[2] ? parts[2].trim() : undefined,
          type: 'classic',
          intervalDays: 1,
          easinessFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
        });
      }
    });

    if (newImportedCards.length > 0) {
      setCardsList((prev) => [...prev, ...newImportedCards]);
      setRawImportText('');
      setActiveBuilderTab('manual');
      alert(`${newImportedCards.length} cartes importées avec succès !`);
    } else {
      alert('Format invalide. Assurez-vous d\'utiliser le séparateur sélectionné (ex: Question ; Réponse).');
    }
  };

  // Save Deck to Global State
  const handleSaveDeckToApp = () => {
    if (!deckTitle.trim()) {
      alert('Veuillez spécifier un titre pour votre deck.');
      return;
    }
    if (cardsList.length === 0) {
      alert('Ajoutez au moins une carte dans votre deck avant d\'enregistrer.');
      return;
    }

    const tagList = deckTagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const newDeck: FlashcardDeck = {
      id: `deck-pro-${Date.now()}`,
      title: deckTitle.trim(),
      subject: deckSubject,
      description: deckDescription.trim(),
      color: deckColor,
      icon: deckIcon,
      difficulty: deckDifficulty,
      tags: tagList,
      cards: cardsList,
      attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
      createdAt: new Date().toISOString(),
      settings: {
        retentionGoal,
        initialInterval,
        maxNewCardsPerDay,
        algorithm: algorithmType,
      }
    };

    onSaveDeck(newDeck);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setSaveStatus(`Le deck "${newDeck.title}" a été enregistré dans votre Pôle Éducation !`);

    if (onOpenDeck) {
      setTimeout(() => {
        onOpenDeck(newDeck.id);
        setActiveTab('flashcards');
      }, 1500);
    }
  };

  const previewCard = cardsList[previewCardIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans select-none">
      
      {/* HEADER POLE CREATION BRANDING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xs"
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Studio de Création de Decks Pro
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Éditeur manuel SM-2, générateur IA Gemini, QCM et modèles de révision prêts à l'emploi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSaveDeckToApp}
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="px-5 py-2.5 font-black text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 hover:opacity-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enregistrer le Deck ({cardsList.length} cartes)</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {saveStatus && (
        <div
          style={{ backgroundColor: currentTheme.accentSubtle, borderColor: currentTheme.accentColor }}
          className="p-4 border text-[#161922] dark:text-white rounded-3xl text-xs font-bold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 style={{ color: currentTheme.accentColor }} className="w-5 h-5" />
            <span>{saveStatus}</span>
          </div>
          <button
            onClick={() => setActiveTab('flashcards')}
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Aller aux Flashcards →
          </button>
        </div>
      )}

      {/* CREATION MODE NAVIGATION TABS */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveBuilderTab('manual')}
          style={
            activeBuilderTab === 'manual'
              ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
              : undefined
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeBuilderTab === 'manual'
              ? 'shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Éditeur Manuel Pro</span>
          <span className="text-[10px] bg-[#161922] text-white px-2 py-0.5 rounded-full font-bold">
            {cardsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('files_quiz')}
          style={
            activeBuilderTab === 'files_quiz'
              ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
              : undefined
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeBuilderTab === 'files_quiz'
              ? 'shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Fichiers Joints & Quiz IA</span>
          {attachedFiles.length > 0 && (
            <span
              style={{ backgroundColor: currentTheme.accentSubtleText }}
              className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold"
            >
              {attachedFiles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveBuilderTab('ai')}
          style={
            activeBuilderTab === 'ai'
              ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
              : undefined
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeBuilderTab === 'ai'
              ? 'shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Générateur IA Gemini</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('presets')}
          style={
            activeBuilderTab === 'presets'
              ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
              : undefined
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeBuilderTab === 'presets'
              ? 'shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Modèles & Presets Pros</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('import')}
          style={
            activeBuilderTab === 'import'
              ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
              : undefined
          }
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeBuilderTab === 'import'
              ? 'shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import Massif CSV / Text</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: EDITEUR MANUEL PRO */}
      {/* ========================================================================= */}
      {activeBuilderTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: CONFIGURATOR & CARD BUILDER */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SECTION 1: DECK CONFIGURATION METADATA */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <Palette className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Configuration Générale du Deck
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[#161922] dark:text-slate-200">Titre du Deck</label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                    placeholder="ex: Médecine - Système Cardio-Vasculaire"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#161922] dark:text-slate-200">Matière / Domaine</label>
                  <select
                    value={deckSubject}
                    onChange={(e) => setDeckSubject(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  >
                    <option value="Informatique">Informatique & Code</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                    <option value="SVT & Biologie">SVT & Biologie / Médecine</option>
                    <option value="Droit & Sciences Politiques">Droit & Jurisprudence</option>
                    <option value="Économie & Gestion">Économie & Finance</option>
                    <option value="Langues (Anglais)">Langues & Vocabulaire</option>
                    <option value="Philosophie">Philosophie & Culture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#161922] dark:text-slate-200">Niveau de Difficulté</label>
                  <select
                    value={deckDifficulty}
                    onChange={(e) => setDeckDifficulty(e.target.value as any)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  >
                    <option value="Facile">Facile (Initiation)</option>
                    <option value="Moyen">Moyen (L2/L3)</option>
                    <option value="Avancé">Avancé (Master / Concours)</option>
                    <option value="Expert">Expert (Recherche / Spécialiste)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[#161922] dark:text-slate-200">Description du contenu</label>
                  <textarea
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 font-medium text-[#161922] dark:text-white outline-none h-16 text-xs focus:ring-2 focus:ring-[#D4F94E]"
                    placeholder="Brève synthèse des chapitres et compétences évaluées..."
                  />
                </div>
              </div>

              {/* SPACED REPETITION SETTINGS TUNING */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/60 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-black text-[#161922] dark:text-[#D4F94E] uppercase tracking-wider block">
                  ⚙️ Algorithme de Répétition Espacée (Spaced Repetition SM-2)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Rétention Ciblée</label>
                    <select
                      value={retentionGoal}
                      onChange={(e) => setRetentionGoal(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 font-bold text-[#161922] dark:text-white outline-none"
                    >
                      <option value={85}>85% (Révisions modérées)</option>
                      <option value={90}>90% (Standard recommandé)</option>
                      <option value={95}>95% (Excellence concours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Cartes Nouvelles / jour</label>
                    <input
                      type="number"
                      value={maxNewCardsPerDay}
                      onChange={(e) => setMaxNewCardsPerDay(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1 font-bold text-[#161922] dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Algorithme</label>
                    <select
                      value={algorithmType}
                      onChange={(e) => setAlgorithmType(e.target.value as any)}
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 font-bold text-[#161922] dark:text-white outline-none"
                    >
                      <option value="sm2">SM-2 (Anki Classic)</option>
                      <option value="fsrs">FSRS (Pro Optimisé)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ADD CARD FORM WITH TYPE OPTIONS */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Ajouter une Carte au Deck
                </h3>
                <span className="text-xs font-black bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] px-2.5 py-0.5 rounded-full">
                  {cardType.toUpperCase()}
                </span>
              </div>

              {/* CARD TYPE SELECTOR */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'classic', label: 'Q&A Classique' },
                  { id: 'qcm', label: 'QCM Choix Multiples' },
                  { id: 'true_false', label: 'Vrai / Faux' },
                  { id: 'ordering', label: 'Mise en Ordre' },
                  { id: 'matching', label: 'Association Paires' },
                  { id: 'cloze', label: 'Texte à trous' },
                  { id: 'code', label: 'Code / Formule' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCardType(t.id as CardType)}
                    style={
                      cardType === t.id
                        ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                        : undefined
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cardType === t.id
                        ? 'font-black shadow-xs'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddCardToList} className="space-y-4 text-xs">
                {/* QUESTION INPUT */}
                <div className="space-y-1">
                  <label className="font-bold text-[#161922] dark:text-slate-200">Énoncé / Question (Recto)</label>
                  <textarea
                    value={cardQuestion}
                    onChange={(e) => setCardQuestion(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 font-semibold text-[#161922] dark:text-white outline-none h-20 focus:ring-2 focus:ring-[#D4F94E]"
                    placeholder={
                      cardType === 'cloze'
                        ? 'Ex: Le principe d\'incertitude d\'Heisenberg relie la position et la [quantité de mouvement].'
                        : 'Intitulé exact de la question...'
                    }
                    required
                  />
                </div>

                {/* DYNAMIC ANSWER INPUT DEPENDING ON TYPE */}
                {cardType === 'qcm' ? (
                  <div className="space-y-2 bg-[#F5F6FA] dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    <label className="font-black text-[#161922] dark:text-white block">Options de réponses QCM :</label>
                    <div className="space-y-2">
                      {qcmOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleQcmCorrect(opt.id)}
                            className={`w-6 h-6 rounded-lg font-bold text-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                              opt.isCorrect
                                ? 'bg-[#D4F94E] text-[#161922] font-black'
                                : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300'
                            }`}
                            title="Cliquer pour définir comme bonne réponse"
                          >
                            {opt.isCorrect ? '✓' : '✗'}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleUpdateQcmText(opt.id, e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 font-bold text-[#161922] dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQcmOption(opt.id)}
                            className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQcmOption}
                      className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      + Ajouter une option
                    </button>
                  </div>
                ) : cardType === 'true_false' ? (
                  <div className="space-y-2 bg-[#F5F6FA] dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    <label className="font-black text-[#161922] dark:text-white block">Réponse attendue :</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCardAnswer('VRAI')}
                        className={`px-5 py-2 rounded-xl font-black text-xs cursor-pointer ${
                          cardAnswer === 'VRAI' ? 'bg-[#D4F94E] text-[#161922]' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        VRAI
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardAnswer('FAUX')}
                        className={`px-5 py-2 rounded-xl font-black text-xs cursor-pointer ${
                          cardAnswer === 'FAUX' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        FAUX
                      </button>
                    </div>
                  </div>
                ) : cardType === 'ordering' ? (
                  <div className="space-y-2 bg-[#F5F6FA] dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    <label className="font-black text-[#161922] dark:text-white block">
                      Éléments à ordonner (Saisissez dans l'ordre chronologique / logique exact) :
                    </label>
                    <div className="space-y-2">
                      {orderingItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#D4F94E] text-[#161922] font-black text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...orderingItems];
                              updated[idx] = e.target.value;
                              setOrderingItems(updated);
                            }}
                            className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 font-bold text-[#161922] dark:text-white text-xs"
                            placeholder={`Étape ${idx + 1}...`}
                          />
                          {orderingItems.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setOrderingItems(orderingItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderingItems([...orderingItems, `Étape ${orderingItems.length + 1}`])}
                      className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      + Ajouter une étape
                    </button>
                  </div>
                ) : cardType === 'matching' ? (
                  <div className="space-y-2 bg-[#F5F6FA] dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    <label className="font-black text-[#161922] dark:text-white block">
                      Paires à associer (Terme à gauche ↔ Définition à droite) :
                    </label>
                    <div className="space-y-2">
                      {matchingPairs.map((pair, idx) => (
                        <div key={pair.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative group">
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => {
                              const updated = [...matchingPairs];
                              updated[idx] = { ...pair, left: e.target.value };
                              setMatchingPairs(updated);
                            }}
                            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 font-bold text-[#161922] dark:text-white text-xs"
                            placeholder="Terme / Mot clé..."
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={pair.right}
                              onChange={(e) => {
                                const updated = [...matchingPairs];
                                updated[idx] = { ...pair, right: e.target.value };
                                setMatchingPairs(updated);
                              }}
                              className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 font-bold text-[#161922] dark:text-white text-xs"
                              placeholder="Définition / Traduction..."
                            />
                            {matchingPairs.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMatchingPairs([
                          ...matchingPairs,
                          { id: `p-${Date.now()}`, left: '', right: '' },
                        ])
                      }
                      className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      + Ajouter une paire
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-[#161922] dark:text-slate-200">Réponse exacte (Verso)</label>
                    <textarea
                      value={cardAnswer}
                      onChange={(e) => setCardAnswer(e.target.value)}
                      className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 font-semibold text-[#161922] dark:text-white outline-none h-20 focus:ring-2 focus:ring-[#D4F94E]"
                      placeholder="Réponse concise et rigoureuse..."
                      required
                    />
                  </div>
                )}

                {/* HINT & EXPLANATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-[#161922] dark:text-slate-200 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#D4F94E]" /> Indice (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={cardHint}
                      onChange={(e) => setCardHint(e.target.value)}
                      className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-medium text-[#161922] dark:text-white outline-none"
                      placeholder="Petite aide sans révéler la réponse..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#161922] dark:text-slate-200 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Explication complémentaire
                    </label>
                    <input
                      type="text"
                      value={cardExplanation}
                      onChange={(e) => setCardExplanation(e.target.value)}
                      className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-medium text-[#161922] dark:text-white outline-none"
                      placeholder="Remarque ou démonstration..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                  className="w-full py-3 font-black rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter cette carte ({cardsList.length} prêtes)</span>
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT 5 COLS: CARDS MANAGEMENT & LIVE PREVIEW TESTER */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* LIVE PREVIEW TESTER CARD */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Aperçu Réel Active Recall
                </h3>
                {cardsList.length > 0 && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Carte {previewCardIndex + 1} / {cardsList.length}
                  </span>
                )}
              </div>

              {previewCard ? (
                <div className="space-y-3">
                  <div
                    onClick={() => setIsPreviewFlipped(!isPreviewFlipped)}
                    className="cursor-pointer min-h-[220px] bg-[#161922] text-white rounded-3xl p-6 shadow-md border border-zinc-800 flex flex-col justify-between transition-all transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between text-[11px] font-black text-[#D4F94E]">
                      <span className="uppercase">{isPreviewFlipped ? 'VERSO (RÉPONSE)' : 'RECTO (QUESTION)'}</span>
                      <span className="text-zinc-400 font-normal">Cliquer pour retourner</span>
                    </div>

                    <div className="my-auto text-center py-4">
                      <p className="text-base font-extrabold leading-relaxed text-white">
                        {isPreviewFlipped ? previewCard.answer : previewCard.question}
                      </p>

                      {previewCard.hint && !isPreviewFlipped && (
                        <span className="inline-block mt-3 bg-zinc-800 text-[#D4F94E] px-3 py-1 rounded-full text-xs font-medium">
                          💡 Indice : {previewCard.hint}
                        </span>
                      )}
                    </div>

                    <div className="text-center text-[10px] text-zinc-400 font-mono">
                      Intervalle SM-2 : {previewCard.intervalDays} jour(s)
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      disabled={previewCardIndex === 0}
                      onClick={() => {
                        setPreviewCardIndex((p) => Math.max(0, p - 1));
                        setIsPreviewFlipped(false);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold text-[#161922] dark:text-white disabled:opacity-30 cursor-pointer"
                    >
                      ← Précédente
                    </button>

                    <button
                      disabled={previewCardIndex >= cardsList.length - 1}
                      onClick={() => {
                        setPreviewCardIndex((p) => Math.min(cardsList.length - 1, p + 1));
                        setIsPreviewFlipped(false);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold text-[#161922] dark:text-white disabled:opacity-30 cursor-pointer"
                    >
                      Suivante →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs font-semibold text-slate-400">
                  Aucune carte dans ce deck. Ajoutez-en une pour tester l'aperçu !
                </div>
              )}
            </div>

            {/* LIST OF CURRENT CARDS IN DECK */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Cartes dans le Deck ({cardsList.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {cardsList.map((card, idx) => (
                  <div
                    key={card.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                      previewCardIndex === idx
                        ? 'bg-[#EFFDE2] dark:bg-zinc-800/90 border-[#D4F94E]'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 hover:border-[#D4F94E]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span># {idx + 1} • {card.type?.toUpperCase()}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setPreviewCardIndex(idx);
                            setIsPreviewFlipped(false);
                          }}
                          className="text-[#65A30D] dark:text-[#D4F94E] hover:underline px-2 py-0.5 rounded bg-white dark:bg-zinc-800 font-bold cursor-pointer"
                        >
                          Tester
                        </button>
                        <button
                          onClick={() => handleDuplicateCard(card)}
                          className="text-slate-500 hover:text-[#161922] dark:hover:text-white p-1 cursor-pointer"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-extrabold text-[#161922] dark:text-white line-clamp-1">
                      Q: {card.question}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
                      R: {card.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: GENERATEUR IA GEMINI PRO */}
      {/* ========================================================================= */}
      {activeBuilderTab === 'ai' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="w-12 h-12 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center shadow-xs font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#161922] dark:text-white">Générateur Automatique de Deck par IA Gemini</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Saisissez un thème de cours ou collez vos notes pour générer un deck structuré instantané.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateAiDeck} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#161922] dark:text-slate-200">Matière Académique</label>
                <select
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                >
                  <option value="Informatique">Informatique & Code</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT & Biologie">SVT & Biologie / Médecine</option>
                  <option value="Droit & Sciences Politiques">Droit & Jurisprudence</option>
                  <option value="Économie & Gestion">Économie & Finance</option>
                  <option value="Langues (Anglais)">Langues & Vocabulaire</option>
                  <option value="Philosophie">Philosophie</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#161922] dark:text-slate-200">Nombre de cartes à générer</label>
                <input
                  type="number"
                  min="3"
                  max="25"
                  value={aiCardCount}
                  onChange={(e) => setAiCardCount(Number(e.target.value))}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#161922] dark:text-slate-200">Sujet ou Chapitre Précis</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                placeholder="ex: Les équations de Maxwell et l'induction électromagnétique"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#161922] dark:text-slate-200">
                OU Coller le texte / résumé de votre cours
              </label>
              <textarea
                value={aiNotesText}
                onChange={(e) => setAiNotesText(e.target.value)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 font-medium text-[#161922] dark:text-white outline-none h-32 focus:ring-2 focus:ring-[#D4F94E]"
                placeholder="Collez ici les paragraphes de votre polycopié ou votre fiche de révision..."
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isGeneratingAi}
                className="px-6 py-3 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black rounded-2xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-[#161922]" />
                    <span>Génération Gemini en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#161922]" />
                    <span>Générer le Deck par IA Gemini →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE: FICHIERS JOINTS & GÉNÉRATEUR DE QUIZ IA DEPUIS DOCUMENTS */}
      {/* ========================================================================= */}
      {activeBuilderTab === 'files_quiz' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="w-12 h-12 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center shadow-xs font-black">
              <Paperclip className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#161922] dark:text-white">
                Fichiers Joints & Quiz / Flashcards Automatiques
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Importez vos cours, fiches de révision, polycopiés (PDF, Word, Markdown, Texte) pour générer des quiz et flashcards sur-mesure.
              </p>
            </div>
          </div>

          {/* DROPZONE / FILE UPLOADER */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#D4F94E] dark:hover:border-[#D4F94E] bg-slate-50 dark:bg-zinc-950/60 rounded-3xl p-8 text-center cursor-pointer transition-all hover:scale-[1.01] space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] flex items-center justify-center mx-auto font-black shadow-xs">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-[#161922] dark:text-white">
                Cliquez pour choisir un ou plusieurs fichiers de cours
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formats acceptés : PDF, Word/Docx, Markdown (.md), Texte (.txt), CSV, JSON
              </p>
            </div>
          </div>

          {/* LIST OF ATTACHED FILES */}
          {attachedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#161922] dark:text-white uppercase tracking-wider">
                  📎 Documents Rattachés au Deck ({attachedFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles([])}
                  className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Tout effacer
                </button>
              </div>

              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.md') ? '📝' : file.name.endsWith('.csv') ? '📊' : '📄'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#161922] dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB • Importé à {new Date(file.uploadedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* GENERATE BUTTON FROM FILES */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleGenerateCardsFromFiles}
                  disabled={isGeneratingFromFile}
                  style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                  className="w-full py-3.5 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50 hover:opacity-95"
                >
                  {isGeneratingFromFile ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Analyse des documents et génération des quiz / flashcards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Générer Flashcards & Quiz IA depuis ces {attachedFiles.length} fichier(s) →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: MODÈLES & PRESETS PRÊTS À L'EMPLOI */}
      {/* ========================================================================= */}
      {activeBuilderTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
              <Zap style={{ color: currentTheme.accentColor }} className="w-5 h-5" /> Modèles de Decks Prêts à l'Emploi
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Sélectionnez un modèle pour charger immédiatement ses cartes dans l'éditeur.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_TEMPLATES.map((preset) => (
              <div
                key={preset.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs hover:border-(--accent-color) transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{preset.icon}</span>
                    <span
                      style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
                    >
                      {preset.subject}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[#161922] dark:text-white leading-snug">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {preset.cards.length} cartes
                  </span>
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                    className="px-4 py-2 font-black rounded-xl transition-all cursor-pointer shadow-xs hover:opacity-95"
                  >
                    Utiliser ce modèle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: IMPORT MASSIF CSV / TEXT */}
      {/* ========================================================================= */}
      {activeBuilderTab === 'import' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Upload style={{ color: currentTheme.accentColor }} className="w-6 h-6" />
            <div>
              <h3 className="text-base font-extrabold text-[#161922] dark:text-white">Importation de Cartes en Masse</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Collez des lignes structurées pour importer rapidement un ensemble de cartes.
              </p>
            </div>
          </div>

          <form onSubmit={handleParseImport} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="font-bold text-[#161922] dark:text-slate-200">Séparateur de colonnes</label>
              <select
                value={importSeparator}
                onChange={(e) => setImportSeparator(e.target.value as any)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-(--accent-color)"
              >
                <option value=";">Point-virgule (Question ; Réponse ; Indice)</option>
                <option value="|">Barre verticale (Question | Réponse | Indice)</option>
                <option value="tab">Tabulation (Format Anki / Excel)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#161922] dark:text-slate-200">Contenu CSV / Texte</label>
              <textarea
                value={rawImportText}
                onChange={(e) => setRawImportText(e.target.value)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 font-mono text-xs text-[#161922] dark:text-white outline-none h-40 focus:ring-2 focus:ring-(--accent-color)"
                placeholder={`Exemple :\nQu'est-ce que l'ADN ? ; Acide Désoxyribonucléique ; Molécule génétique\nQuel est le symbole du Sodium ? ; Na ; Tableau périodique`}
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
                className="px-6 py-2.5 font-black rounded-xl transition-all shadow-xs cursor-pointer hover:opacity-95"
              >
                Traiter et Importer les Cartes →
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
