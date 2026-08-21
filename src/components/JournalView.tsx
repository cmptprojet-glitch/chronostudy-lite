import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Sparkles,
  Tag,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  ArrowUpRight,
  Download,
  Flame,
  Brain,
  Smile,
  Zap,
  Filter,
  X,
  Share2,
  Bot
} from 'lucide-react';
import { JournalEntry, JournalCategory, JournalMood } from '../types';

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

const CATEGORY_MAP: Record<JournalCategory, { label: string; bg: string; text: string; emoji: string }> = {
  daily_reflection: { label: 'Réflexion Quotidienne', bg: 'bg-[#E8F4FD]', text: 'text-[#0284C7]', emoji: '🌅' },
  concept_breakthrough: { label: 'Déclic & Compréhension', bg: 'bg-[#FFF1EB]', text: 'text-[#FF7A59]', emoji: '💡' },
  exam_prep: { label: 'Préparation Examen', bg: 'bg-[#F3F0FF]', text: 'text-[#8B5CF6]', emoji: '🎯' },
  weekly_review: { label: 'Bilan Hebdomadaire', bg: 'bg-[#EFFDE2]', text: 'text-[#65A30D]', emoji: '📊' },
  study_plan: { label: 'Plan & Objectifs', bg: 'bg-[#FEF9E6]', text: 'text-[#CA8A04]', emoji: '🗺️' },
};

const MOOD_MAP: Record<JournalMood, { label: string; emoji: string }> = {
  inspired: { label: 'Inspiré', emoji: '🔥' },
  productive: { label: 'Très Productif', emoji: '⚡' },
  focused: { label: 'Concentré', emoji: '🎯' },
  neutral: { label: 'Stable / Calme', emoji: '🧘' },
  tired: { label: 'Fatigué / Éprouvé', emoji: '😴' },
};

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onAwardXP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAiFeedback, setIsGeneratingAiFeedback] = useState(false);

  // Form state for creating / editing
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<JournalCategory>('concept_breakthrough');
  const [formMood, setFormMood] = useState<JournalMood>('inspired');
  const [formSubject, setFormSubject] = useState('Mathématiques & Analyse');
  const [formTagsInput, setFormTagsInput] = useState('Analyse, Déclic');
  const [formStudyTime, setFormStudyTime] = useState(60);
  const [formTakeawayInput, setFormTakeawayInput] = useState('');
  const [formTakeaways, setFormTakeaways] = useState<string[]>([]);

  const handleStartCreate = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('concept_breakthrough');
    setFormMood('inspired');
    setFormSubject('Mathématiques & Analyse');
    setFormTagsInput('Analyse, Déclic');
    setFormStudyTime(60);
    setFormTakeaways([]);
    setFormTakeawayInput('');
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormCategory(entry.category);
    setFormMood(entry.mood);
    setFormSubject(entry.subject || '');
    setFormTagsInput(entry.tags.join(', '));
    setFormStudyTime(entry.studyTimeMinutes || 0);
    setFormTakeaways(entry.keyTakeaways || []);
    setFormTakeawayInput('');
    setActiveEntry(entry);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleAddTakeaway = () => {
    if (!formTakeawayInput.trim()) return;
    setFormTakeaways([...formTakeaways, formTakeawayInput.trim()]);
    setFormTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormTakeaways(formTakeaways.filter((_, i) => i !== index));
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tags = formTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEditing && activeEntry) {
      const updated: JournalEntry = {
        ...activeEntry,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        mood: formMood,
        subject: formSubject.trim(),
        tags,
        keyTakeaways: formTakeaways,
        studyTimeMinutes: formStudyTime,
        updatedAt: new Date().toISOString(),
      };
      onUpdateEntry(updated);
      setActiveEntry(updated);
      setIsEditing(false);
    } else {
      const newEntry: JournalEntry = {
        id: `j-${Date.now()}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        mood: formMood,
        subject: formSubject.trim(),
        tags,
        keyTakeaways: formTakeaways,
        studyTimeMinutes: formStudyTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddEntry(newEntry);
      setActiveEntry(newEntry);
      setIsCreating(false);

      if (onAwardXP) {
        onAwardXP(25, 'Entrée de Journal Académique rédigée');
      }
    }
  };

  const handleGenerateAIFeedback = (entry: JournalEntry) => {
    setIsGeneratingAiFeedback(true);
    setTimeout(() => {
      const feedbackOptions = [
        `Excellente analyse ! Votre compréhension des concepts clés montre un apprentissage en profondeur. Continuez à appliquer la répétition espacée sur ces notions.`,
        `Très belle prise de recul. Structurer vos notes avec des points clés favorise la mémoire sémantique. Conseil : transformez vos 3 points clés en flashcards QCM pour tester votre rappel actif.`,
        `Remarquable régularité d'étude ! Ce journal reflète une méthode de travail rigoureuse. N'hésitez pas à planifier une session de révision croisée en groupe d'études.`,
      ];
      const selectedFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      const updated: JournalEntry = {
        ...entry,
        aiFeedback: selectedFeedback,
      };
      onUpdateEntry(updated);
      setActiveEntry(updated);
      setIsGeneratingAiFeedback(false);
      if (onAwardXP) {
        onAwardXP(10, 'Analyse réflexive IA consultée');
      }
    }, 1000);
  };

  const handleExportJournal = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chronostudy_journal_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.subject && entry.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;

    return matchesSearch && matchesCategory && matchesMood;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* HEADER SECTION                                                         */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Journal d'Études & Réflexions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Ancrez vos déclics intellectuels, bilans de révision et progression académique
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJournal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            title="Exporter le journal en JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] text-xs font-black rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Entrée (+25 XP)</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* SEARCH, CATEGORIES & MOOD FILTERS                                       */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, sujet, formule ou tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-[#161922] dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#161922] text-white dark:bg-white dark:text-black font-black'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tous ({entries.length})
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                selectedCategory === key
                  ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MAIN TWO-COLUMN JOURNAL LAYOUT                                         */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ENTRIES LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-zinc-800 space-y-3">
              <span className="text-4xl">📖</span>
              <h4 className="text-sm font-extrabold text-[#161922] dark:text-white">
                Aucune entrée trouvée
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Commencez à noter vos réflexions, vos bilans ou vos déclics mathématiques et scientifiques.
              </p>
              <button
                onClick={handleStartCreate}
                className="px-4 py-2 bg-[#D4F94E] text-[#161922] font-black rounded-xl text-xs shadow-xs hover:bg-[#CBF33B] cursor-pointer"
              >
                Rédiger ma première note
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const cat = CATEGORY_MAP[entry.category] || CATEGORY_MAP.daily_reflection;
              const mood = MOOD_MAP[entry.mood] || MOOD_MAP.focused;
              const isSelected = activeEntry?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    setActiveEntry(entry);
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-900 border-[#161922] dark:border-[#D4F94E] shadow-md'
                      : 'bg-white dark:bg-zinc-900/70 border-slate-100 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className="text-xs" title={`Humeur : ${mood.label}`}>
                        {mood.emoji}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#161922] dark:text-white leading-snug">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                    {entry.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 font-bold">
                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                      📚 {entry.subject || 'Général'}
                    </span>
                    {entry.studyTimeMinutes && (
                      <span>⏱️ {entry.studyTimeMinutes} min d'étude</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ENTRY DETAIL / FORM EDITOR (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs min-h-[500px]">
          {isCreating || isEditing ? (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-base font-extrabold text-[#161922] dark:text-white">
                  {isEditing ? 'Modifier l\'entrée' : 'Nouvelle entrée de journal'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="p-1 text-slate-400 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Titre de la réflexion
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Déclic sur les équations de Maxwell & rot(E)..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white"
                />
              </div>

              {/* Category, Mood, Subject Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Catégorie
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as JournalCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#161922] dark:text-white outline-none"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.emoji} {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Humeur / Énergie
                  </label>
                  <select
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value as JournalMood)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#161922] dark:text-white outline-none"
                  >
                    {Object.entries(MOOD_MAP).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.emoji} {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Temps d'étude (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={formStudyTime}
                    onChange={(e) => setFormStudyTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#161922] dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Subject & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Matière / Domaine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Physique-Chimie, Droit, Médecine..."
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#161922] dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tags (séparés par virgule)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Maxwell, Induction, Formules"
                    value={formTagsInput}
                    onChange={(e) => setFormTagsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#161922] dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Corps du Journal & Réflexions
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Écrivez ce que vous avez appris, vos difficultés surmontées, vos intuitions ou votre bilan de la journée..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white leading-relaxed resize-y"
                />
              </div>

              {/* Key Takeaways Builder */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Points Clés & Découvertes Mémorables
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter un point clé..."
                    value={formTakeawayInput}
                    onChange={(e) => setFormTakeawayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTakeaway();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="px-3 py-2 bg-[#D4F94E] text-[#161922] font-black rounded-xl text-xs hover:bg-[#CBF33B] cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                {formTakeaways.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {formTakeaways.map((point, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-100 dark:bg-zinc-800/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#161922] dark:bg-[#D4F94E]" />
                          <span>{point}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(i)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  {isEditing ? 'Enregistrer les modifications' : 'Publier dans le Journal (+25 XP)'}
                </button>
              </div>
            </form>
          ) : activeEntry ? (
            /* VIEW ACTIVE ENTRY DETAIL */
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const cat = CATEGORY_MAP[activeEntry.category] || CATEGORY_MAP.daily_reflection;
                      const mood = MOOD_MAP[activeEntry.mood] || MOOD_MAP.focused;
                      return (
                        <>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                            {cat.emoji} {cat.label}
                          </span>
                          <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-bold">
                            {mood.emoji} {mood.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <h2 className="text-lg font-black text-[#161922] dark:text-white tracking-tight">
                    {activeEntry.title}
                  </h2>

                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                    <span>
                      📅 {new Date(activeEntry.createdAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {activeEntry.studyTimeMinutes && (
                      <>
                        <span>•</span>
                        <span>⏱️ {activeEntry.studyTimeMinutes} min d'étude</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartEdit(activeEntry)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Modifier cette entrée"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer cette entrée de journal ?')) {
                        onDeleteEntry(activeEntry.id);
                        setActiveEntry(null);
                      }
                    }}
                    className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                {activeEntry.content}
              </div>

              {/* Key Takeaways Box */}
              {activeEntry.keyTakeaways && activeEntry.keyTakeaways.length > 0 && (
                <div className="p-4 bg-[#EFFDE2] dark:bg-zinc-950 border border-[#D4F94E] dark:border-zinc-800 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-[#161922] dark:text-white flex items-center gap-1.5">
                    <span>💡</span> Points Clés Retenus
                  </h4>
                  <ul className="space-y-1.5">
                    {activeEntry.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="text-xs font-bold text-[#161922] dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#65A30D] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags list */}
              {activeEntry.tags && activeEntry.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tags :</span>
                  {activeEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Feedback Coach Box */}
              <div className="p-4 bg-[#161922] text-white rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#D4F94E] text-[#161922] flex items-center justify-center text-xs font-black">
                      🤖
                    </span>
                    <span className="text-xs font-black text-[#D4F94E]">
                      ChronoStudy AI Coach
                    </span>
                  </div>

                  <button
                    onClick={() => handleGenerateAIFeedback(activeEntry)}
                    disabled={isGeneratingAiFeedback}
                    className="flex items-center gap-1 text-[10px] font-black bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#D4F94E]" />
                    <span>{isGeneratingAiFeedback ? 'Analyse en cours...' : 'Analyser / Actualiser'}</span>
                  </button>
                </div>

                {activeEntry.aiFeedback ? (
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {activeEntry.aiFeedback}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    Cliquez sur Analyser pour obtenir un feedback pédagogique et des conseils de révision personnalisés de l'IA sur cette note.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* DEFAULT EMPTY SELECTION */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#EFFDE2] text-[#65A30D] flex items-center justify-center text-2xl font-black">
                📝
              </div>
              <h3 className="text-base font-extrabold text-[#161922] dark:text-white">
                Sélectionnez une note ou créez-en une
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Le journal d'études vous permet de documenter vos séances, formaliser vos découvertes et recevoir des conseils méthodologiques de l'IA.
              </p>
              <button
                onClick={handleStartCreate}
                className="px-5 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
              >
                + Nouvelle note de journal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
