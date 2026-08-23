import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Sparkles, User, MessageCircle, Sliders, ArrowLeft, Check, Plus, Shield } from 'lucide-react';
import { NovaPersonalizationConfig } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NovaPersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NovaPersonalizationConfig;
  onSaveConfig: (newConfig: NovaPersonalizationConfig) => void;
}

export const NovaPersonalizationModal: React.FC<NovaPersonalizationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const { currentTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'main' | 'context' | 'personality'>('main');
  const [localConfig, setLocalConfig] = useState<NovaPersonalizationConfig>(config);
  const [activeTabSub, setActiveTabSub] = useState<'ambiance' | 'chaleur' | 'emojis'>('ambiance');

  if (!isOpen) return null;

  const handleToggle = (key: keyof NovaPersonalizationConfig) => {
    const updated = { ...localConfig, [key]: !localConfig[key] };
    setLocalConfig(updated);
    onSaveConfig(updated);
  };

  const handleSelect = <K extends keyof NovaPersonalizationConfig>(key: K, value: NovaPersonalizationConfig[K]) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onSaveConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
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
        className="relative w-full max-w-md bg-[#10121A] text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-left flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentView !== 'main' && (
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {currentView === 'main'
                ? 'Ta personnalisation'
                : currentView === 'context'
                ? 'Ton contexte'
                : 'La personnalité de Nova'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* VIEW: MAIN MENU                                                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentView === 'main' && (
            <div className="space-y-6 text-center">
              {/* MASCOT ANIMATION */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center relative">
                  <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 animate-bounce">
                    <span className="text-2xl font-black">👾</span>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-zinc-100 max-w-xs leading-snug">
                  Mes réponses dans le chat s'adaptent selon ce que tu partages
                </h4>
              </div>

              {/* ACTION TILES */}
              <div className="space-y-2.5 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => setCurrentView('context')}
                  className="w-full p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white block group-hover:text-purple-400 transition-colors">
                        Ton contexte
                      </span>
                      <span className="text-xs text-zinc-400">
                        {localConfig.schoolGrade} · {localConfig.country}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('personality')}
                  className="w-full p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white block group-hover:text-indigo-400 transition-colors">
                        La personnalité de Nova
                      </span>
                      <span className="text-xs text-zinc-400 capitalize">
                        {localConfig.ambiance} · {localConfig.warmth} · Emojis {localConfig.emojis}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* VIEW: TON CONTEXTE                                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentView === 'context' && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <span className="text-3xl">👾</span>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                  C'est quoi ta vie scolaire ?
                </h4>
              </div>

              {/* CARD 1: REPONDS COMME TON PROF */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-white block">
                      Réponds comme ton prof l'attendrait
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Les mêmes méthodes que dans tes examens
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle('respondLikeTeacher')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      localConfig.respondLikeTeacher ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        localConfig.respondLikeTeacher ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* SELECTORS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <select
                    value={localConfig.schoolGrade}
                    onChange={(e) => handleSelect('schoolGrade', e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-hidden"
                  >
                    <option value="Seconde">Seconde</option>
                    <option value="Première">Première</option>
                    <option value="Terminale">Terminale</option>
                    <option value="Licence / Sup">Licence / Sup</option>
                    <option value="Prépa">Classe Prépa</option>
                    <option value="Collège">Collège (3ème)</option>
                  </select>

                  <select
                    value={localConfig.country}
                    onChange={(e) => handleSelect('country', e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-hidden"
                  >
                    <option value="France">France 🇫🇷</option>
                    <option value="Sénégal">Sénégal 🇸🇳</option>
                    <option value="Belgique">Belgique 🇧🇪</option>
                    <option value="Suisse">Suisse 🇨🇭</option>
                    <option value="Canada">Canada 🇨🇦</option>
                    <option value="Maroc">Maroc 🇲🇦</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire 🇨🇮</option>
                  </select>
                </div>
              </div>

              {/* CARD 2: TIRE DES EXEMPLES D'ELEVES */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">
                    Tire des exemples d'élèves comme toi
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Cas pratiques ancrés dans ton niveau
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('drawStudentExamples')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    localConfig.drawStudentExamples ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      localConfig.drawStudentExamples ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* CARD 3: S'ADAPTE AU RYTHME */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">
                    S'adapte à ton rythme d'apprentissage
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    On utilise ta progression et ta mémoire de chat
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('adaptLearningPace')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    localConfig.adaptLearningPace ? 'bg-purple-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      localConfig.adaptLearningPace ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* VIEW: LA PERSONNALITÉ DE NOVA                                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {currentView === 'personality' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <span className="text-3xl">👾</span>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                  Comment tu veux que je te parle ?
                </h4>
              </div>

              {/* 1. AMBIANCE */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Ambiance
                  </span>
                  <span className="text-xs font-extrabold text-white capitalize bg-zinc-800 px-2 py-0.5 rounded-md">
                    {localConfig.ambiance}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {(['sympa', 'detendu', 'coach', 'direct'] as const).map((amb) => (
                    <button
                      key={amb}
                      type="button"
                      onClick={() => handleSelect('ambiance', amb)}
                      className={`p-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer text-center ${
                        localConfig.ambiance === amb
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {amb === 'sympa' ? 'Sympa' : amb === 'detendu' ? 'Détendu' : amb === 'coach' ? 'Coach' : 'Direct'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CHALEUR */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Chaleur
                  </span>
                  <span className="text-xs font-extrabold text-white capitalize bg-zinc-800 px-2 py-0.5 rounded-md">
                    {localConfig.warmth}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['neutre', 'equilibre', 'chaleureux'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleSelect('warmth', w)}
                      className={`p-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer text-center ${
                        localConfig.warmth === w
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {w === 'neutre' ? 'Neutre' : w === 'equilibre' ? 'Équilibré' : 'Chaleureux'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. EMOJIS */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Emojis
                  </span>
                  <span className="text-xs font-extrabold text-white capitalize bg-zinc-800 px-2 py-0.5 rounded-md">
                    {localConfig.emojis}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['aucun', 'modere', 'expressif'] as const).map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleSelect('emojis', emo)}
                      className={`p-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer text-center ${
                        localConfig.emojis === emo
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {emo === 'aucun' ? 'Aucun' : emo === 'modere' ? 'Modéré' : 'Expressif 🎉'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-800/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            Enregistrer les préférences
          </button>
        </div>
      </motion.div>
    </div>
  );
};
