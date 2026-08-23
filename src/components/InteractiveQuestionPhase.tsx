import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  Volume2,
  VolumeX,
  Target,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { NovaAvatar2D } from './NovaAvatar2D';
import { useTheme } from '../context/ThemeContext';

export interface QuestionOption {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
  icon?: any;
}

export interface ClarificationQuestion {
  id: string;
  title: string;
  description?: string;
  options?: QuestionOption[];
  requiresDocumentUpload?: boolean;
  allowVoiceInput?: boolean;
  contextTag?: string;
}

interface InteractiveQuestionPhaseProps {
  question: ClarificationQuestion;
  onAnswerSelected: (answerText: string, attachedFile?: { name: string; type: 'image' | 'file' }) => void;
  onVoiceRecordToggle?: () => void;
  isListeningVoice?: boolean;
}

export const InteractiveQuestionPhase: React.FC<InteractiveQuestionPhaseProps> = ({
  question,
  onAnswerSelected,
  onVoiceRecordToggle,
  isListeningVoice = false,
}) => {
  const { currentTheme } = useTheme();

  const [customInput, setCustomInput] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: 'image' | 'file' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSelectOption = (opt: QuestionOption) => {
    setSelectedOptionId(opt.id);
    onAnswerSelected(opt.value, attachedFile || undefined);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() && !attachedFile) return;
    onAnswerSelected(customInput.trim() || 'Document / Exercice joint', attachedFile || undefined);
    setCustomInput('');
  };

  // Direct Audio Speech Recognition on the bubble
  const handleToggleAudio = () => {
    if (!isRecording) {
      setIsRecording(true);
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.lang = 'fr-FR';
        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setCustomInput(text);
          setIsRecording(false);
          onAnswerSelected(text, attachedFile || undefined);
        };
        rec.onerror = () => {
          setIsRecording(false);
        };
        rec.start();
      } else {
        setTimeout(() => {
          const sample = '10 questions niveau Terminale sur le régime de Vichy et la France Libre.';
          setCustomInput(sample);
          setIsRecording(false);
          onAnswerSelected(sample, attachedFile || undefined);
        }, 1800);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({ name: file.name, type });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 dark:from-purple-950/30 dark:via-zinc-900 dark:to-indigo-950/20 border-2 border-purple-300 dark:border-purple-800/80 shadow-md p-5 sm:p-6 space-y-4 my-3 text-left"
    >
      {/* HEADER WITH QUESTION PHASE TAG & NOVA 2D */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <NovaAvatar2D expression="questioning" size="md" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Phase de Précision Pédagogique
              </span>
              {question.contextTag && (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  · {question.contextTag}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-[#161922] dark:text-white leading-snug">
              {question.title}
            </h4>

            {question.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {question.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT / EXERCISE UPLOAD DROPZONE IF REQUIRED */}
      {question.requiresDocumentUpload && (
        <div className="p-4 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-zinc-850/80 text-center space-y-3">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 hover:bg-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Prendre une photo</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Importer énoncé / PDF</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(e) => handleFileUpload(e, 'file')}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
          />

          {attachedFile ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fichier prêt : {attachedFile.name}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium">
              Glisse ton fichier ou saisis directement ton texte ci-dessous pour que Nova résolve pas à pas.
            </p>
          )}
        </div>
      )}

      {/* QUICK PRE-CONFIGURED OPTIONS */}
      {question.options && question.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {question.options.map((opt) => (
            <motion.button
              key={opt.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectOption(opt)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                selectedOptionId === opt.id
                  ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-[#161922] dark:text-zinc-200 hover:border-purple-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black">{opt.label}</div>
                {opt.subLabel && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {opt.subLabel}
                  </div>
                )}
              </div>
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* ANSWER SECTION AT BOTTOM WITH INTEGRATED AUDIO BUTTON */}
      <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-purple-100 dark:border-purple-900/40">
        <div className="flex items-center gap-2">
          {/* MICROPHONE AUDIO BUTTON ON ANSWER BUBBLE */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`p-2.5 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 border-slate-200 dark:border-zinc-700 hover:bg-purple-50'
            }`}
            title="Parler au micro pour répondre"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* TEXT INPUT FIELD */}
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={isRecording ? 'Je t’écoute...' : 'Ou écris ta précision ici...'}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-[#161922] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="px-4 py-2.5 rounded-2xl font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Valider</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
