import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Sparkles, Radio, Music, Gauge } from 'lucide-react';
import { StudyDocument } from '../types';

interface AudioSummaryPlayerProps {
  document: StudyDocument;
  onAddToAmbientSound?: (audioTitle: string, docText: string) => void;
}

export const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({
  document,
  onAddToAmbientSound,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [addedToAmbiance, setAddedToAmbiance] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const textToRead = document.aiAnalysis?.summary || document.content.slice(0, 1000) || "Document d'étude prêt pour la lecture audio.";

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'fr-FR';
        utterance.rate = speechRate;
        utterance.pitch = voicePitch;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleSendToAmbiance = () => {
    if (onAddToAmbientSound) {
      onAddToAmbientSound(`Résumé Audio: ${document.name}`, textToRead);
      setAddedToAmbiance(true);
      setTimeout(() => setAddedToAmbiance(false), 3000);
    }
  };

  return (
    <div className="bg-[#161922] text-white rounded-3xl p-4 space-y-3 border border-zinc-800 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#D4F94E] block">
              Studio Podcasting & Synthèse Vocale IA
            </span>
            <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
              {document.name}
            </h4>
          </div>
        </div>

        {/* Play/Pause/Stop controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B]'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Écouter'}</span>
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs cursor-pointer"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Speed & Pitch Configuration */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-[11px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-400 font-semibold">
            <span>Vitesse: {speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="2.0"
            step="0.25"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#D4F94E]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-400 font-semibold">
            <span>Tonalité: {voicePitch}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={voicePitch}
            onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#D4F94E]"
          />
        </div>
      </div>

      {/* Action to link to ambient sound */}
      {onAddToAmbientSound && (
        <div className="pt-2 flex items-center justify-between border-t border-zinc-800 text-[11px]">
          <span className="text-zinc-400 font-medium truncate">Diffuser en fond pendant le Pomodoro</span>
          <button
            type="button"
            onClick={handleSendToAmbiance}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              addedToAmbiance
                ? 'bg-[#EFFDE2] text-[#65A30D] dark:bg-zinc-800 dark:text-[#D4F94E]'
                : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{addedToAmbiance ? '✓ Ajouté à l\'ambiance' : '+ Lier au Timer'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
