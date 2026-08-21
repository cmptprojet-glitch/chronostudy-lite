import React, { useState } from 'react';
import { CustomWidget, WidgetType, WidgetCategory } from '../types';
import { TabType } from './Navbar';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  Check,
  CheckCircle2,
  Zap,
  Palette,
  Layout,
  BarChart2,
  Clock,
  Eye,
  RotateCw,
  X,
  FileText,
  GraduationCap,
  Layers,
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WidgetBuilderStudioProps {
  onSaveWidget: (widget: CustomWidget) => void;
  setActiveTab: (tab: TabType) => void;
  existingWidgets?: CustomWidget[];
  onToggleWidgetStatus?: (widgetId: string) => void;
  onDeleteWidget?: (widgetId: string) => void;
}

// PRE-BUILT WIDGET TEMPLATES (100% ChronoStudy Education)
const PRESET_WIDGETS: {
  id: string;
  title: string;
  category: WidgetCategory;
  type: WidgetType;
  value: string | number;
  target?: number;
  unit?: string;
  color: string;
  icon: string;
  description: string;
  chartData?: { label: string; value: number }[];
  streakDays?: boolean[];
}[] = [
  {
    id: 'preset-w-recall',
    title: 'Rétention Active Recall SM-2',
    category: 'active_recall',
    type: 'chart',
    value: '94.5%',
    target: 95,
    unit: '%',
    color: '#D4F94E',
    icon: '🧠',
    description: 'Score moyen de rétention mémorielle après 4 répétitions espacées.',
    chartData: [
      { label: 'Sem 1', value: 75 },
      { label: 'Sem 2', value: 82 },
      { label: 'Sem 3', value: 88 },
      { label: 'Sem 4', value: 92 },
      { label: 'Sem 5', value: 95 },
      { label: 'Sem 6', value: 97 },
    ]
  },
  {
    id: 'preset-w-time-budget',
    title: 'Budget Heures de Focus Mensuel',
    category: 'study_budget',
    type: 'time_budget',
    value: '68 / 80h',
    target: 80,
    unit: 'heures',
    color: '#D4F94E',
    icon: '⏱️',
    description: 'Temps d\'étude approfondie alloué aux matières clés.',
    chartData: [
      { label: 'Maths', value: 24 },
      { label: 'Physique', value: 18 },
      { label: 'Info/IA', value: 16 },
      { label: 'Philo', value: 10 },
    ]
  },
  {
    id: 'preset-w-streak',
    title: 'Série Ininterrompue de Révision',
    category: 'education',
    type: 'habit_streak',
    value: '14 jours',
    target: 21,
    unit: 'jours',
    color: '#D4F94E',
    icon: '🔥',
    description: 'Régularité des sessions d\'études validées au quotidien.',
    streakDays: [true, true, true, true, true, true, true]
  },
  {
    id: 'preset-w-code',
    title: 'Progression Exercices & Devoirs',
    category: 'education',
    type: 'metric',
    value: '42 / 50',
    target: 50,
    unit: 'exercices',
    color: '#D4F94E',
    icon: '💻',
    description: 'Volume d\'exercices d\'entraînement complétés ce mois-ci.'
  },
  {
    id: 'preset-w-countdown',
    title: 'Décompte Concours & Partiels',
    category: 'exam',
    type: 'countdown',
    value: '12 jours',
    target: 12,
    unit: 'jours',
    color: '#D4F94E',
    icon: '🎯',
    description: 'Échéance officielle des examens universitaires du semestre.'
  },
  {
    id: 'preset-w-quote',
    title: 'Citation Motivation Académique',
    category: 'education',
    type: 'quote',
    value: '« La répétition espacée transforme l\'effort en mémoire durable. »',
    color: '#D4F94E',
    icon: '⚡',
    description: 'Principe pédagogique de révision active pour booster la mémoire.'
  }
];

export const WidgetBuilderStudio: React.FC<WidgetBuilderStudioProps> = ({
  onSaveWidget,
  setActiveTab,
  existingWidgets = [],
  onToggleWidgetStatus,
  onDeleteWidget,
}) => {
  const [activeBuilderTab, setActiveBuilderTab] = useState<'manual' | 'ai' | 'presets' | 'my_widgets'>('manual');

  // WIDGET CONFIGURATION STATE
  const [widgetTitle, setWidgetTitle] = useState('Rétention Active Recall SM-2');
  const [widgetCategory, setWidgetCategory] = useState<WidgetCategory>('active_recall');
  const [widgetType, setWidgetType] = useState<WidgetType>('chart');
  const [widgetValue, setWidgetValue] = useState('92%');
  const [widgetTarget, setWidgetTarget] = useState<number>(100);
  const [widgetUnit, setWidgetUnit] = useState('%');
  const [widgetColor, setWidgetColor] = useState('#D4F94E');
  const [widgetIcon, setWidgetIcon] = useState('🧠');
  const [widgetDescription, setWidgetDescription] = useState('Suivi de la courbe d\'oubli d\'Ebbinghaus et de la mémorisation.');

  // AI GENERATOR STATE
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<WidgetCategory>('education');
  const [aiWidgetType, setAiWidgetType] = useState<WidgetType>('metric');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // STATUS FEEDBACK
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Handle Save Widget
  const handleSaveCurrentWidget = () => {
    if (!widgetTitle.trim()) {
      alert('Veuillez entrer un titre pour votre widget.');
      return;
    }

    const newWidget: CustomWidget = {
      id: `widget-${Date.now()}`,
      title: widgetTitle.trim(),
      category: widgetCategory,
      type: widgetType,
      value: widgetValue,
      target: widgetTarget,
      unit: widgetUnit,
      color: widgetColor,
      icon: widgetIcon,
      description: widgetDescription.trim(),
      createdAt: new Date().toISOString(),
      enabledOnDashboard: true,
      chartData:
        widgetType === 'chart' || widgetType === 'time_budget' || widgetType === 'active_recall'
          ? [
              { label: 'Sem 1', value: 20 },
              { label: 'Sem 2', value: 45 },
              { label: 'Sem 3', value: 65 },
              { label: 'Sem 4', value: 80 },
              { label: 'Sem 5', value: 92 },
            ]
          : undefined,
      streakDays: widgetType === 'habit_streak' ? [true, true, true, true, true, false, true] : undefined,
    };

    onSaveWidget(newWidget);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setSaveStatus('Widget académique créé et ajouté au Dashboard !');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Handle AI Generation
  const handleGenerateAiWidget = async () => {
    if (!aiPrompt.trim() || isGeneratingAi) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/gemini/generate-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: aiPrompt,
          category: aiCategory,
          widgetType: aiWidgetType,
        }),
      });

      const data = await res.json();
      if (data && data.title) {
        setWidgetTitle(data.title);
        setWidgetCategory((data.category as WidgetCategory) || aiCategory);
        setWidgetType((data.type as WidgetType) || aiWidgetType);
        setWidgetValue(data.value || '100%');
        setWidgetTarget(data.target || 100);
        setWidgetUnit(data.unit || '');
        setWidgetColor(data.color || '#D4F94E');
        setWidgetIcon(data.icon || '📚');
        setWidgetDescription(data.description || 'Widget généré par ChronoAI');
        setActiveBuilderTab('manual');
        setSaveStatus('Configuration générée par l\'IA avec succès !');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error('Error generating AI widget:', err);
      alert('Erreur lors de la génération IA du widget.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_WIDGETS[0]) => {
    setWidgetTitle(preset.title);
    setWidgetCategory(preset.category);
    setWidgetType(preset.type);
    setWidgetValue(String(preset.value));
    setWidgetTarget(preset.target || 100);
    setWidgetUnit(preset.unit || '');
    setWidgetColor(preset.color);
    setWidgetIcon(preset.icon);
    setWidgetDescription(preset.description);
    setActiveBuilderTab('manual');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans select-none">
      
      {/* STUDIO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Studio de Widgets Académiques & Budget Temps
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Concevez des widgets sur-mesure d'apprentissage actif, temps d'études et décomptes
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0"
        >
          ← Retour au Dashboard
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveBuilderTab('manual')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeBuilderTab === 'manual'
              ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Éditeur Manuel
        </button>

        <button
          onClick={() => setActiveBuilderTab('ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeBuilderTab === 'ai'
              ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Générateur IA Gemini
        </button>

        <button
          onClick={() => setActiveBuilderTab('presets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeBuilderTab === 'presets'
              ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" /> Modèles Prédéfinis ({PRESET_WIDGETS.length})
        </button>

        <button
          onClick={() => setActiveBuilderTab('my_widgets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeBuilderTab === 'my_widgets'
              ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Mes Widgets ({existingWidgets.length})
        </button>
      </div>

      {/* SUCCESS STATUS NOTIFICATION */}
      {saveStatus && (
        <div className="p-4 bg-[#EFFDE2] dark:bg-zinc-800 border border-[#D4F94E] text-[#161922] dark:text-white text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E] shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* TAB CONTENT 1: MANUAL BUILDER & LIVE PREVIEW */}
      {activeBuilderTab === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CONFIGURATION FORM */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
              <Sliders className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Propriétés du Widget
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Titre du Widget</label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="Ex: Rétention Active Recall SM-2..."
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Catégorie</label>
                  <select
                    value={widgetCategory}
                    onChange={(e) => setWidgetCategory(e.target.value as WidgetCategory)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  >
                    <option value="active_recall">Active Recall (Flashcards)</option>
                    <option value="study_budget">Budget Temps d'Étude</option>
                    <option value="education">Éducation & Notes</option>
                    <option value="exam">Examens & Concours</option>
                    <option value="planning">Planning & Séances</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Type d'Affichage</label>
                  <select
                    value={widgetType}
                    onChange={(e) => setWidgetType(e.target.value as WidgetType)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  >
                    <option value="chart">Graphique Linéaire de Rétention</option>
                    <option value="time_budget">Budget Temps / Heures Focus</option>
                    <option value="habit_streak">Série Quotidienne (Streaks)</option>
                    <option value="metric">Jauge Métrique (Progression)</option>
                    <option value="countdown">Compte à Rebours Examen</option>
                    <option value="quote">Citation / Règle Pédagogique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Valeur</label>
                  <input
                    type="text"
                    value={widgetValue}
                    onChange={(e) => setWidgetValue(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Cible</label>
                  <input
                    type="number"
                    value={widgetTarget}
                    onChange={(e) => setWidgetTarget(Number(e.target.value))}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Unité</label>
                  <input
                    type="text"
                    value={widgetUnit}
                    onChange={(e) => setWidgetUnit(e.target.value)}
                    placeholder="%, hrs, cartes..."
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Description</label>
                <textarea
                  value={widgetDescription}
                  onChange={(e) => setWidgetDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 text-xs font-medium text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveCurrentWidget}
                  className="w-full py-3 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4 text-[#161922]" />
                  <span>Enregistrer et Intégrer au Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Aperçu Réel du Widget
                </span>
                <span className="text-[10px] bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] px-2.5 py-0.5 rounded-full font-bold">
                  Design Eduplex
                </span>
              </div>

              {/* THE RENDERED WIDGET CARD */}
              <div className="bg-[#161922] text-white rounded-3xl p-5 border border-zinc-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base">{widgetIcon}</span> {widgetTitle}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-zinc-800 text-[#D4F94E]">
                    {widgetCategory}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-black text-white tracking-tight">{widgetValue}</span>
                  {widgetTarget && (
                    <span className="text-xs font-bold text-zinc-400">
                      Cible : {widgetTarget} {widgetUnit}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  {widgetDescription}
                </p>

                {widgetType === 'chart' && (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
                      {[30, 45, 60, 75, 90, 95].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-md bg-[#D4F94E] transition-all duration-500"
                            style={{ height: `${val}%` }}
                          />
                          <span className="text-[9px] text-zinc-500 font-bold">S{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {widgetType === 'habit_streak' && (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between gap-1">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-xl bg-[#D4F94E] text-[#161922] font-black text-[10px] flex items-center justify-center shadow-xs"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: AI GENERATOR */}
      {activeBuilderTab === 'ai' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#161922] dark:text-white">
                Génération de Widgets Pédagogiques avec Gemini IA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Décrivez en langage naturel le widget ou indicateur d'apprentissage que vous souhaitez créer
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">
                Prompt / Description de votre besoin académique
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Je veux un widget pour suivre mes heures d'exercices de physique et mon taux de réussite aux QCMs avec un graphique sur 6 semaines..."
                rows={3}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3.5 text-xs font-medium text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Catégorie cible</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value as WidgetCategory)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                >
                  <option value="education">Éducation & Révisions</option>
                  <option value="active_recall">Active Recall & Mémorisation</option>
                  <option value="study_budget">Budget Temps & Pomodoro</option>
                  <option value="exam">Concours & Examens</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#161922] dark:text-slate-200 block mb-1">Type de structure</label>
                <select
                  value={aiWidgetType}
                  onChange={(e) => setAiWidgetType(e.target.value as WidgetType)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#161922] dark:text-white outline-none focus:ring-2 focus:ring-[#D4F94E]"
                >
                  <option value="chart">Graphique Linéaire</option>
                  <option value="metric">Métrique Jauge</option>
                  <option value="habit_streak">Série de Jours</option>
                  <option value="countdown">Compte à Rebours</option>
                  <option value="time_budget">Budget Temps</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateAiWidget}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className="w-full py-3 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#161922]" />
                  <span>Génération intelligente en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#161922]" />
                  <span>Générer le widget avec Gemini IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PRESETS */}
      {activeBuilderTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_WIDGETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs hover:border-[#D4F94E] flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{preset.icon}</span> {preset.title}
                  </span>
                  <span className="text-[10px] bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] px-2.5 py-0.5 rounded-full font-bold">
                    {preset.category}
                  </span>
                </div>
                <div className="text-xl font-black text-[#161922] dark:text-white">{preset.value}</div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleApplyPreset(preset)}
                className="w-full py-2.5 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Utiliser ce modèle</span>
                <Check className="w-3.5 h-3.5 text-[#161922]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 4: MY WIDGETS */}
      {activeBuilderTab === 'my_widgets' && (
        <div className="space-y-4">
          {existingWidgets.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl text-center space-y-2 border border-slate-100 dark:border-zinc-800">
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Aucun widget personnalisé enregistré.</p>
              <button
                onClick={() => setActiveBuilderTab('manual')}
                className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E] hover:underline cursor-pointer"
              >
                Créer un widget maintenant →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {existingWidgets.map((w) => (
                <div
                  key={w.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{w.icon || '📚'}</span>
                      <h4 className="text-xs font-extrabold text-[#161922] dark:text-white truncate">{w.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      {w.value} • {w.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onToggleWidgetStatus && (
                      <button
                        onClick={() => onToggleWidgetStatus(w.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors cursor-pointer ${
                          w.enabledOnDashboard
                            ? 'bg-[#EFFDE2] text-[#65A30D] dark:bg-zinc-800 dark:text-[#D4F94E]'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {w.enabledOnDashboard ? 'Actif' : 'Masqué'}
                      </button>
                    )}
                    {onDeleteWidget && (
                      <button
                        onClick={() => onDeleteWidget(w.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
