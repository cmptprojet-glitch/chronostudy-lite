import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeId, ThemeDefinition } from '../types/theme';
import {
  X,
  Palette,
  Check,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Eye,
  Layers,
  LayoutGrid,
  Zap,
  Star,
  CheckCheck,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedThemeToggler, TransitionVariant } from '@/registry/magicui/animated-theme-toggler';

interface ThemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ThemeGalleryModal: React.FC<ThemeGalleryModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const { currentThemeId, currentTheme, setTheme, availableThemes } = useTheme();
  const [selectedPreviewId, setSelectedPreviewId] = useState<ThemeId>(currentThemeId);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<TransitionVariant>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('chronostudy_theme_vt_variant');
      if (saved) return saved as TransitionVariant;
    }
    return 'circle';
  });

  const handleSelectVariant = (variant: TransitionVariant) => {
    setSelectedVariant(variant);
    try {
      localStorage.setItem('chronostudy_theme_vt_variant', variant);
    } catch (e) {}
  };

  if (!isOpen) return null;

  const handleApplyTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    setSelectedPreviewId(themeId);

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D5F862', '#F8BED6', '#D2F843', '#161922'],
    });

    const themeName = availableThemes[themeId].name;
    setAppliedToast(`Le thème "${themeName}" a été appliqué sur tout le système !`);
    setTimeout(() => {
      setAppliedToast(null);
    }, 2800);
  };

  const themeList = Object.values(availableThemes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-3xl w-full max-w-5xl max-h-[92vh] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-5 md:px-7 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center font-black shadow-xs shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Galerie de Thèmes ChronoStudy
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] px-2 py-0.5 rounded-full border border-[#D4F94E]/40">
                  3 Styles Uniques
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Choisissez l'ambiance visuelle de votre espace d'étude — appliquée instantanément sur l'ensemble de l'application.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleDarkMode && (
              <AnimatedThemeToggler
                theme={isDarkMode ? 'dark' : 'light'}
                onThemeChange={() => onToggleDarkMode()}
                showLabel={true}
                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs"
              />
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-2xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST CONFIRMATION BANNER */}
        {appliedToast && (
          <div className="bg-[#EFFDE2] dark:bg-zinc-800 border-b border-[#D4F94E] px-6 py-2.5 flex items-center justify-between text-xs font-black text-[#161922] dark:text-[#D4F94E] animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" />
              <span>{appliedToast}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ✓ Synchronisé avec l'ensemble des modules
            </span>
          </div>
        )}

        {/* BODY: THEME CARDS GRID */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themeList.map((theme) => {
              const isActive = currentThemeId === theme.id;
              const isSelectedForPreview = selectedPreviewId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedPreviewId(theme.id)}
                  className={`rounded-3xl border-2 transition-all overflow-hidden flex flex-col justify-between cursor-pointer bg-white dark:bg-zinc-950/80 group ${
                    isActive
                      ? 'border-[#D4F94E] shadow-lg ring-2 ring-[#D4F94E]/20'
                      : isSelectedForPreview
                      ? 'border-slate-400 dark:border-zinc-600 shadow-md'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* TOP MOCKUP PREVIEW */}
                  <div
                    className="p-4 relative transition-colors h-48 flex flex-col justify-between overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode ? theme.canvasBgDark : theme.canvasBgLight,
                    }}
                  >
                    {/* Header bar in preview */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black"
                          style={{
                            backgroundColor: theme.previewElements.badgeBg,
                            color: theme.previewElements.badgeText,
                          }}
                        >
                          ⚡
                        </div>
                        <span
                          className="text-[10px] font-black truncate"
                          style={{ color: isDarkMode ? '#FFFFFF' : '#161922' }}
                        >
                          ChronoStudy
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-black"
                          style={{
                            backgroundColor: theme.previewElements.pillActiveBg,
                            color: theme.previewElements.pillActiveText,
                          }}
                        >
                          ● Actif
                        </span>
                      </div>
                    </div>

                    {/* Mini Bento Cards Simulator */}
                    <div className="grid grid-cols-2 gap-2 my-auto">
                      {/* Mini Card 1 */}
                      <div
                        className="p-2.5 rounded-xl flex flex-col justify-between shadow-2xs"
                        style={{
                          backgroundColor: theme.previewElements.card1Bg,
                          color: theme.previewElements.card1Text,
                        }}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Focus</span>
                        <div className="font-extrabold text-sm leading-none mt-1">25:00</div>
                        <span className="text-[8px] font-semibold opacity-75 mt-0.5">Pomodoro</span>
                      </div>

                      {/* Mini Card 2 */}
                      <div
                        className="p-2.5 rounded-xl flex flex-col justify-between shadow-2xs"
                        style={{
                          backgroundColor: theme.previewElements.card2Bg,
                          color: theme.previewElements.card2Text,
                        }}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Decks</span>
                        <div className="font-extrabold text-sm leading-none mt-1">42 cartes</div>
                        <span className="text-[8px] font-semibold opacity-75 mt-0.5">Active Recall</span>
                      </div>
                    </div>

                    {/* Mini Bottom Status Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-[9px] font-bold">
                      <span
                        className="truncate"
                        style={{ color: isDarkMode ? '#A1A1AA' : '#52525B' }}
                      >
                        {theme.tagline}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>

                    {/* ACTIVE THEME RIBBON */}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-[#D4F94E] text-[#161922] text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" /> Actif
                      </div>
                    )}
                  </div>

                  {/* DETAILS BODY */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {theme.name}
                        </h4>
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                          {theme.accentColor}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-3">
                        {theme.description}
                      </p>

                      {/* PALETTE SWATCH CHIPS */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Nuances Clés
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {theme.palette.slice(0, 5).map((color, idx) => (
                            <div
                              key={idx}
                              title={`${color.name} (${color.hex}) - ${color.role}`}
                              className="w-6 h-6 rounded-lg border border-black/10 dark:border-white/10 shadow-2xs flex items-center justify-center text-[9px] font-black cursor-help transition-transform hover:scale-110"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* TAGS */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {theme.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                      {isActive ? (
                        <div className="w-full py-2.5 px-4 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] border border-[#D4F94E] rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" />
                          <span>Thème Actuellement Appliqué</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTheme(theme.id);
                          }}
                          className="w-full py-2.5 px-4 bg-[#161922] hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#161922] rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#D4F94E] group-hover:text-[#161922] cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#D4F94E] group-hover:text-[#161922]" />
                          <span>Appliquer ce thème</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MAGIC UI ANIMATED THEME TOGGLER SHOWCASE */}
          <div className="bg-[#EFFDE2]/60 dark:bg-zinc-900/80 p-5 rounded-3xl border border-[#D4F94E]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Animation de Transition de Thème (Magic UI)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Cliquez pour tester l'animation fluide par clip-path View Transitions API. Choisissez votre forme géométrique préférée.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <AnimatedThemeToggler
                  variant={selectedVariant}
                  theme={isDarkMode ? 'dark' : 'light'}
                  onThemeChange={() => onToggleDarkMode?.()}
                  className="size-11 bg-white dark:bg-zinc-800 border-2 border-[#D4F94E] shadow-xs hover:scale-105"
                />
                <AnimatedThemeToggler
                  variant={selectedVariant}
                  theme={isDarkMode ? 'dark' : 'light'}
                  onThemeChange={() => onToggleDarkMode?.()}
                  showLabel={true}
                  className="px-4 py-2 bg-[#D4F94E] hover:bg-[#c3e835] text-[#161922] font-black text-xs rounded-xl shadow-xs"
                />
              </div>
            </div>

            {/* VARIANT SELECTOR */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                Forme de propagation de l'animation (Variant)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(
                  [
                    { id: 'circle', label: 'Cercle', desc: 'Classique' },
                    { id: 'star', label: 'Étoile', desc: 'Magic UI' },
                    { id: 'diamond', label: 'Losange', desc: 'Moderne' },
                    { id: 'hexagon', label: 'Hexagone', desc: 'Tech' },
                    { id: 'square', label: 'Carré', desc: 'Minimal' },
                    { id: 'triangle', label: 'Triangle', desc: 'Vif' },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVariant(v.id as TransitionVariant)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedVariant === v.id
                        ? 'border-[#D4F94E] bg-white dark:bg-zinc-800 shadow-xs font-black text-[#161922] dark:text-white ring-2 ring-[#D4F94E]/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-xs block">{v.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SYSTEM COMPARISON & SPECS */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Impact Global de la Sélection de Thème
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              En appliquant un thème, les couleurs d'accent, l'arrière-plan de l'application, les cartes Bento, la barre latérale, les indicateurs de révision active recall, le minuteur Pomodoro et les graphiques de performance s'adaptent instantanément tout en conservant 100% de vos données et fonctionnalités.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 px-7 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Thème sélectionné : </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {currentTheme.name} ({currentTheme.tagline})
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl font-extrabold transition-all cursor-pointer"
          >
            Fermer la galerie
          </button>
        </div>

      </div>
    </div>
  );
};
