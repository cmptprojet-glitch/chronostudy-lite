import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardWidgetConfig, WidgetColSpan, CustomWidget, Task, FlashcardDeck, StudyDocument, ScheduleSession, StudySessionLog, SubjectMetric, WidgetCategory } from '../types';
import { TabType } from './Navbar';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Check,
  LayoutGrid,
  ChevronRight,
  Sliders,
  X,
  ArrowUp,
  ArrowDown,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Bot
} from 'lucide-react';

interface DashboardLayoutManagerProps {
  layout: DashboardWidgetConfig[];
  onUpdateLayout: (newLayout: DashboardWidgetConfig[]) => void;
  customWidgets: CustomWidget[];
  tasks: Task[];
  decks: FlashcardDeck[];
  documents: StudyDocument[];
  schedule: ScheduleSession[];
  logs: StudySessionLog[];
  subjectMetrics: SubjectMetric[];
  isEditingLayout: boolean;
  setIsEditingLayout: (editing: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  onStartPomodoroWithTask?: (task: Task) => void;
  onOpenDeck?: (deckId: string) => void;
}

export const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({
  layout,
  onUpdateLayout,
  customWidgets,
  tasks,
  decks,
  documents,
  schedule,
  logs,
  subjectMetrics,
  isEditingLayout,
  setIsEditingLayout,
  setActiveTab,
  onStartPomodoroWithTask,
  onOpenDeck,
}) => {
  // Drag State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Widget Library Drawer Modal State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<'all' | WidgetCategory>('all');

  // Quick Notes State
  const [quickNote, setQuickNote] = useState('');
  const [notesList, setNotesList] = useState([
    { id: 1, title: 'Réviser les théorèmes d\'analyse pour le partiel', time: 'Aujourd\'hui, 10:15' },
    { id: 2, title: 'Préparer 15 flashcards sur la thermodynamique', time: 'Hier, 16:40' },
  ]);

  // Sorting helper
  const sortedLayout = [...layout].sort((a, b) => a.order - b.order);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const currentList = [...sortedLayout];
    const draggedIdx = currentList.findIndex((item) => item.id === draggedItemId);
    const targetIdx = currentList.findIndex((item) => item.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Swap / Reorder
    const [movedItem] = currentList.splice(draggedIdx, 1);
    currentList.splice(targetIdx, 0, movedItem);

    // Reassign orders
    const updatedList = currentList.map((item, idx) => ({ ...item, order: idx }));

    onUpdateLayout(updatedList);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Reordering via Up / Down buttons
  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentList = [...sortedLayout];
    const idx = currentList.findIndex((item) => item.id === id);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    // Swap
    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;

    const updatedList = currentList.map((item, index) => ({ ...item, order: index }));
    onUpdateLayout(updatedList);
  };

  // Change Col Span
  const updateColSpan = (id: string, colSpan: WidgetColSpan) => {
    const updated = layout.map((item) => (item.id === id ? { ...item, colSpan } : item));
    onUpdateLayout(updated);
  };

  // Toggle Visibility
  const toggleVisibility = (id: string) => {
    const updated = layout.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item));
    onUpdateLayout(updated);
  };

  // Remove Widget
  const removeWidget = (id: string) => {
    const updated = layout.filter((item) => item.id !== id);
    onUpdateLayout(updated);
  };

  // Add Widget from Library
  const addWidgetToLayout = (widgetConfig: Omit<DashboardWidgetConfig, 'order'>) => {
    const maxOrder = layout.length > 0 ? Math.max(...layout.map((l) => l.order)) : -1;
    const newItem: DashboardWidgetConfig = {
      ...widgetConfig,
      order: maxOrder + 1,
    };
    onUpdateLayout([...layout, newItem]);
  };

  // Apply Presets
  const applyPreset = (presetName: 'balanced' | 'education' | 'compact') => {
    let presetItems: DashboardWidgetConfig[] = [];

    if (presetName === 'balanced') {
      presetItems = [
        { id: 'layout-sys-tasks', title: 'Tâches & Devoirs Prioritaires', category: 'education', type: 'system_tasks', colSpan: 2, enabled: true, order: 0, icon: '✅', color: '#06b6d4' },
        { id: 'layout-sys-decks', title: 'ChronoStudy — Decks & Active Recall', category: 'active_recall', type: 'system_decks', colSpan: 1, enabled: true, order: 1, icon: '📚', color: '#3b82f6' },
        { id: 'layout-sys-notes', title: 'Journal d\'Étude & Notes Rapides', category: 'education', type: 'system_notes', colSpan: 3, enabled: true, order: 2, icon: '📝', color: '#64748b' },
      ];
    } else if (presetName === 'education') {
      presetItems = [
        { id: 'layout-sys-decks', title: 'ChronoStudy — Decks & Active Recall', category: 'active_recall', type: 'system_decks', colSpan: 2, enabled: true, order: 0, icon: '📚', color: '#3b82f6' },
        { id: 'layout-sys-tasks', title: 'Tâches & Devoirs Prioritaires', category: 'education', type: 'system_tasks', colSpan: 1, enabled: true, order: 1, icon: '✅', color: '#06b6d4' },
        { id: 'layout-sys-notes', title: 'Journal d\'Étude & Notes Rapides', category: 'education', type: 'system_notes', colSpan: 3, enabled: true, order: 2, icon: '📝', color: '#64748b' },
      ];
    } else if (presetName === 'compact') {
      presetItems = layout.map((item) => ({ ...item, colSpan: 1 as WidgetColSpan }));
    }

    onUpdateLayout(presetItems);
  };

  // Add Note Handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setNotesList((prev) => [
      { id: Date.now(), title: quickNote.trim(), time: 'À l\'instant' },
      ...prev,
    ]);
    setQuickNote('');
  };

  // Helper for colSpan class
  const getColSpanClass = (span: WidgetColSpan) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 lg:col-span-2';
      case 3:
        return 'col-span-1 lg:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  // Render Widget Content inside slot
  const renderWidgetContent = (item: DashboardWidgetConfig) => {
    // If it's a custom widget reference
    if (item.type === 'custom' && item.customWidgetRefId) {
      const cw = customWidgets.find((w) => w.id === item.customWidgetRefId);
      if (!cw) {
        return (
          <div className="p-4 bg-zinc-900 rounded-xl text-xs text-zinc-400 font-medium">
            Widget personnalisé introuvable.
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{cw.value}</span>
            {cw.unit && <span className="text-xs font-black text-zinc-400 uppercase">{cw.unit}</span>}
          </div>
          {cw.description && (
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              {cw.description}
            </p>
          )}
          {cw.chartData && cw.chartData.length > 0 && (
            <div className="flex items-end justify-between gap-1 pt-3 h-16 border-t border-zinc-800">
              {cw.chartData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.min(100, Math.max(15, (d.value / Math.max(...cw.chartData!.map((c) => c.value))) * 100))}%`,
                      backgroundColor: cw.color || '#3b82f6',
                    }}
                  />
                  <span className="text-[9px] font-bold text-zinc-400">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // System Widget Renderers
    switch (item.type) {
      case 'system_tasks':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {tasks.filter((t) => t.status !== 'completed').length} Tâches En Cours
              </span>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                Gérer les Tâches <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">{t.subject}</span>
                    <h5 className="font-bold text-xs text-white truncate">{t.title}</h5>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                      t.priority === 'high'
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system_decks':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {decks.length} Decks Actifs
              </span>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                Réviser Decks <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {decks.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => onOpenDeck && onOpenDeck(d.id)}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800/80 rounded-xl border border-zinc-800 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="truncate">
                      <h5 className="font-bold text-xs text-white truncate">{d.title}</h5>
                      <p className="text-[10px] text-zinc-400 font-medium">{d.cards.length} Flashcards • {d.subject}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white text-black font-bold text-[10px] rounded-lg">
                    Lancer →
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system_notes':
        return (
          <div className="space-y-3">
            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nouvelle note d'étude..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="flex-1 p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-medium text-white outline-none focus:border-zinc-600"
              />
              <button type="submit" className="px-3 py-2 bg-white text-black font-bold rounded-xl text-xs cursor-pointer">
                + Ajouter
              </button>
            </form>
            <div className="space-y-1.5">
              {notesList.map((n) => (
                <div key={n.id} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-200 truncate">{n.title}</span>
                  <span className="text-[10px] text-zinc-500 font-medium shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-zinc-900 rounded-xl text-xs text-zinc-400 font-medium">
            Aperçu du widget {item.title}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* HEADER BANNER & ACTION BAR (Black with high-contrast text) */}
      <div className="bg-black text-white rounded-3xl p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-cyan-400 border border-zinc-800 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5" /> Personnalisation de l'Espace d'Étude
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Gestion de la Grille & Widgets
            </h2>
            <p className="text-xs text-zinc-400 font-medium max-w-2xl">
              Glissez-déposez vos modules, ajustez la largeur des colonnes (1, 2 ou 3) et composez l'espace pédagogique qui correspond à votre rythme d'apprentissage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingLayout(!isEditingLayout)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                isEditingLayout
                  ? 'bg-[#D4F94E] text-[#161922] shadow-md'
                  : 'bg-[#161922] text-white dark:bg-white dark:text-[#161922] hover:opacity-90'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {isEditingLayout ? '✅ Terminer l\'Édition' : '🎨 Mode Édition Grille'}
            </button>

            <button
              onClick={() => setIsLibraryOpen(true)}
              className="px-4 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Ajouter un Widget
            </button>
          </div>
        </div>

        {/* PRESET QUICK BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4F94E]" /> Dispositions Prédéfinies :
          </span>

          <button
            onClick={() => applyPreset('balanced')}
            className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-[#EFFDE2] dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-xl text-[11px] font-bold border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            ⚡ Équilibre ChronoStudy
          </button>

          <button
            onClick={() => applyPreset('education')}
            className="px-3 py-1 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] hover:bg-[#D4F94E] hover:text-[#161922] rounded-xl text-[11px] font-black border border-[#D4F94E]/40 transition-colors cursor-pointer"
          >
            🎓 Focus Decks & Active Recall
          </button>

          <button
            onClick={() => applyPreset('compact')}
            className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            📐 Mode Compact (1 Col)
          </button>

          <button
            onClick={() => applyPreset('balanced')}
            className="px-2.5 py-1 text-slate-400 hover:text-black dark:hover:text-white rounded-xl text-[11px] font-bold ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* EDITING INDICATOR BANNER */}
      <AnimatePresence>
        {isEditingLayout && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-4 bg-zinc-900 rounded-2xl border border-cyan-800 text-cyan-300 flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Mode Édition Actif : Glissez-déposez les cartes ou utilisez les flèches pour réordonner vos widgets.</span>
            </div>
            <button
              onClick={() => setIsEditingLayout(false)}
              className="px-3 py-1 bg-white text-black font-bold rounded-xl text-[11px] hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Enregistrer & Quitter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN DRAG AND DROP GRID */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {sortedLayout.map((item, idx) => {
            const isDragging = draggedItemId === item.id;
            const isDragOver = dragOverItemId === item.id;

            if (!item.enabled && !isEditingLayout) return null;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{
                  opacity: isDragging ? 0.35 : !item.enabled ? 0.4 : 1,
                  scale: isDragging ? 0.95 : isDragOver ? 1.02 : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.88, y: 10 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 28,
                  mass: 0.8,
                }}
                whileHover={isEditingLayout ? { y: -3, transition: { duration: 0.15 } } : { y: -1, transition: { duration: 0.15 } }}
                whileTap={isEditingLayout ? { scale: 0.98 } : undefined}
                draggable={isEditingLayout}
                onDragStart={(e) => handleDragStart(e as any, item.id)}
                onDragOver={(e) => handleDragOver(e as any, item.id)}
                onDrop={(e) => handleDrop(e as any, item.id)}
                onDragEnd={handleDragEnd}
                className={`rounded-3xl border transition-colors relative flex flex-col justify-between ${getColSpanClass(
                  item.colSpan
                )} ${
                  !item.enabled
                    ? 'grayscale bg-zinc-900 border-dashed border-zinc-800'
                    : 'bg-black text-white border-zinc-800 shadow-xl hover:border-zinc-700'
                } ${isDragging ? 'border-cyan-500 border-2' : ''} ${
                  isDragOver ? 'ring-4 ring-cyan-500/40 border-cyan-500' : ''
                }`}
              >
                {/* CARD HEADER WITH DRAG CONTROLS */}
                <div className="p-4 pb-3 border-b border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {isEditingLayout && (
                      <div className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-cyan-400 p-1 shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-lg shrink-0">{item.icon || '⚡'}</span>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* EDITING CONTROLS ON CARD */}
                  {isEditingLayout ? (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Directional Move Buttons */}
                      <button
                        onClick={() => moveItem(item.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 disabled:opacity-20 cursor-pointer"
                        title="Déplacer vers le haut"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(item.id, 'down')}
                        disabled={idx === sortedLayout.length - 1}
                        className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 disabled:opacity-20 cursor-pointer"
                        title="Déplacer vers le bas"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* ColSpan Selector */}
                      <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 text-[10px] font-bold border border-zinc-800">
                        <button
                          onClick={() => updateColSpan(item.id, 1)}
                          className={`px-1.5 py-0.5 rounded-md cursor-pointer ${
                            item.colSpan === 1 ? 'bg-white text-black' : 'text-zinc-400'
                          }`}
                          title="1 Colonne"
                        >
                          1 col
                        </button>
                        <button
                          onClick={() => updateColSpan(item.id, 2)}
                          className={`px-1.5 py-0.5 rounded-md cursor-pointer ${
                            item.colSpan === 2 ? 'bg-white text-black' : 'text-zinc-400'
                          }`}
                          title="2 Colonnes"
                        >
                          2 cols
                        </button>
                        <button
                          onClick={() => updateColSpan(item.id, 3)}
                          className={`px-1.5 py-0.5 rounded-md cursor-pointer ${
                            item.colSpan === 3 ? 'bg-white text-black' : 'text-zinc-400'
                          }`}
                          title="Plein Écran (3 Cols)"
                        >
                          3 cols
                        </button>
                      </div>

                      {/* Toggle Visibility */}
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 cursor-pointer"
                        title={item.enabled ? 'Masquer' : 'Afficher'}
                      >
                        {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                      </button>

                      {/* Delete Widget */}
                      <button
                        onClick={() => removeWidget(item.id)}
                        className="p-1.5 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 rounded-lg cursor-pointer"
                        title="Retirer du dashboard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#3b82f6' }}
                    />
                  )}
                </div>

                {/* CARD BODY CONTENT */}
                <div className="p-5 flex-1">{renderWidgetContent(item)}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* WIDGET LIBRARY MODAL / DRAWER */}
      <AnimatePresence>
        {isLibraryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="bg-black text-white rounded-3xl p-6 border border-zinc-800 w-full max-w-2xl shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-cyan-400" /> Bibliothèque de Widgets
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Sélectionnez des modules pédagogiques ou vos widgets créés dans le Studio ChronoStudy.
                  </p>
                </div>
                <button
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CATEGORY FILTERS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', 'education', 'active_recall', 'study_budget', 'exam', 'planning'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryCategoryFilter(cat as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      libraryCategoryFilter === cat
                        ? 'bg-white text-black shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat === 'all' ? 'Tous les Widgets' : cat.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>

              {/* CUSTOM WIDGETS SECTION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                  🎨 Mes Widgets Personnalisés (Studio ChronoStudy)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customWidgets
                    .filter((cw) => libraryCategoryFilter === 'all' || cw.category === libraryCategoryFilter)
                    .map((cw) => {
                      const isAlreadyAdded = layout.some((l) => l.customWidgetRefId === cw.id);
                      return (
                        <div
                          key={cw.id}
                          className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cw.icon || '⚡'}</span>
                              <h5 className="font-bold text-xs text-white">{cw.title}</h5>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">{cw.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              addWidgetToLayout({
                                id: `layout-custom-${Date.now()}`,
                                title: cw.title,
                                category: cw.category,
                                type: 'custom',
                                customWidgetRefId: cw.id,
                                colSpan: 1,
                                enabled: true,
                                icon: cw.icon,
                                color: cw.color,
                              });
                            }}
                            disabled={isAlreadyAdded}
                            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isAlreadyAdded
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-zinc-200'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {isAlreadyAdded ? 'Déjà sur le Dashboard' : 'Ajouter au Dashboard'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* CREATE CUSTOM WIDGET LINK */}
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">
                    Créer un tout nouveau widget pédagogique ?
                  </h5>
                  <p className="text-[11px] text-zinc-400">
                    Utilisez le Studio de Widgets pour générer des métriques, ratios d'étude et graphiques custom.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsLibraryOpen(false);
                    setActiveTab('analytics');
                  }}
                  className="px-3.5 py-2 bg-white text-black font-bold rounded-xl text-xs shrink-0 cursor-pointer hover:bg-zinc-200"
                >
                  Ouvrir Analytics →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
