import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Upload,
  Music,
  Disc3,
  ListMusic,
  Repeat,
  Radio,
  FileAudio,
  Sparkles,
  Trash2,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  category: 'lofi' | 'nature' | 'binaural' | 'uploaded' | 'custom';
  url: string;
  duration?: number;
  icon?: string;
  isCustomFile?: boolean;
}

// CURATED HIGH QUALITY AUDIO STREAMS & STUDY TRACKS
const DEFAULT_STUDY_TRACKS: AudioTrack[] = [
  {
    id: 'track-lofi-1',
    title: 'Lo-Fi Chill Study Beats',
    artist: 'ChronoStudy Chillhop',
    category: 'lofi',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    icon: '🎧',
  },
  {
    id: 'track-rain-1',
    title: 'Pluie Douce & Orage Lointain',
    artist: 'Atmosphère Nature',
    category: 'nature',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_732a39281a.mp3?filename=rain-and-thunder-16705.mp3',
    icon: '🌧️',
  },
  {
    id: 'track-alpha-1',
    title: 'Ondes Alpha 432Hz (Deep Focus)',
    artist: 'NeuroWave Frequencies',
    category: 'binaural',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=meditation-impromptu-01-14051.mp3',
    icon: '🧠',
  },
  {
    id: 'track-cafe-1',
    title: 'Ambiance Café Étudiant & Jazz',
    artist: 'Cozy Library Session',
    category: 'lofi',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=relaxing-guitar-loop-125039.mp3',
    icon: '☕',
  },
  {
    id: 'track-forest-1',
    title: 'Forêt & Ruisseau Cristallin',
    artist: 'Nature Sanctuary',
    category: 'nature',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=forest-lullaby-110624.mp3',
    icon: '🌲',
  },
  {
    id: 'track-gamma-1',
    title: 'Ondes Bêta & Gamma Boost Mémoire',
    artist: 'Synapse Cognition',
    category: 'binaural',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3508d85f8.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    icon: '⚡',
  },
];

export const AmbientAudioPlayer: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const [playlist, setPlaylist] = useState<AudioTrack[]>(() => {
    try {
      const saved = localStorage.getItem('chronostudy_audio_playlist');
      return saved ? JSON.parse(saved) : DEFAULT_STUDY_TRACKS;
    } catch {
      return DEFAULT_STUDY_TRACKS;
    }
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'lofi' | 'nature' | 'binaural' | 'uploaded'>('all');
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = playlist[currentTrackIndex] || playlist[0] || DEFAULT_STUDY_TRACKS[0];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = currentTrack.url;
    audio.loop = isLooping;
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (!isLooping) {
        handleNextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentTrack.url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Upload Local Audio File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: AudioTrack[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.ogg') || file.name.endsWith('.m4a')) {
        const objectUrl = URL.createObjectURL(file);
        newTracks.push({
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Fichier Importé',
          category: 'uploaded',
          url: objectUrl,
          icon: '🎵',
          isCustomFile: true,
        });
      }
    });

    if (newTracks.length > 0) {
      setPlaylist((prev) => [...newTracks, ...prev]);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setActiveCategory('uploaded');
    }
  };

  const handleRemoveTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack.id === trackId) {
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const formatSecs = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredPlaylist = activeCategory === 'all'
    ? playlist
    : playlist.filter((t) => t.category === activeCategory);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4 font-sans select-none">
      
      {/* HEADER WITH TITLE & UPLOAD BUTTON */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="w-9 h-9 rounded-2xl flex items-center justify-center font-black shadow-xs"
          >
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#161922] dark:text-white tracking-tight">
              {language === 'fr' ? 'Lecteur Audio de Focus' : 'Focus Audio Player'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {language === 'fr' ? 'Musique Lo-Fi, ondes alpha & fichiers MP3' : 'Lo-Fi beats, alpha waves & audio files'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs hover:opacity-90"
          title={language === 'fr' ? 'Importer un fichier audio local (MP3, WAV, OGG)' : 'Upload audio file'}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{language === 'fr' ? 'Importer Audio' : 'Upload Audio'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* ACTIVE TRACK DISPLAY WITH ROTATING DISC ANIMATION */}
      <div className="bg-[#F9FAFC] dark:bg-zinc-950/80 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3.5">
        <div
          style={{ color: currentTheme.accentColor }}
          className={`w-12 h-12 rounded-2xl bg-[#161922] flex items-center justify-center font-black text-xl shadow-md shrink-0 transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`}
        >
          <Disc3 className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{currentTrack.icon || '🎵'}</span>
            <h5 className="text-xs font-black text-[#161922] dark:text-white truncate">
              {currentTrack.title}
            </h5>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* EQUALIZER ANIMATION BARS */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 shrink-0">
            <span style={{ backgroundColor: currentTheme.accentColor }} className="w-1 rounded-full animate-pulse h-3" />
            <span style={{ backgroundColor: currentTheme.accentColor }} className="w-1 rounded-full animate-pulse h-4 delay-75" />
            <span style={{ backgroundColor: currentTheme.accentColor }} className="w-1 rounded-full animate-pulse h-2 delay-150" />
            <span style={{ backgroundColor: currentTheme.accentColor }} className="w-1 rounded-full animate-pulse h-3.5 delay-200" />
          </div>
        )}
      </div>

      {/* SCRUBBER TIMELINE */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
          <span>{formatSecs(currentTime)}</span>
          <span>{formatSecs(duration || 0)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{ accentColor: currentTheme.accentColor }}
          className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* CONTROLS (PREV, PLAY/PAUSE, NEXT, LOOP, VOLUME) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevTrack}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Piste Précédente"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            style={{ backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }}
            className="p-3 rounded-2xl font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleNextTrack}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Piste Suivante"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            style={
              isLooping
                ? { backgroundColor: currentTheme.accentSubtle, color: currentTheme.accentSubtleText }
                : undefined
            }
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLooping
                ? ''
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Répéter la piste en boucle"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* VOLUME SLIDER */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            style={{ accentColor: currentTheme.accentColor }}
            className="w-16 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* CATEGORY FILTER TABS & PLAYLIST DRAWER TOGGLE */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {(['all', 'lofi', 'nature', 'binaural', 'uploaded'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={
                  activeCategory === cat
                    ? { backgroundColor: currentTheme.accentColor, color: currentTheme.accentTextColor }
                    : undefined
                }
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {cat === 'all' ? 'Toutes' : cat === 'uploaded' ? 'Fichiers' : cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
            className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>{playlist.length} pistes</span>
          </button>
        </div>

        {/* EXPANDABLE PLAYLIST TRACKS */}
        {showPlaylistDrawer && (
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1 pt-1">
            {filteredPlaylist.map((tr) => {
              const isSelected = tr.id === currentTrack.id;
              return (
                <div
                  key={tr.id}
                  onClick={() => {
                    const actualIdx = playlist.findIndex((p) => p.id === tr.id);
                    if (actualIdx >= 0) {
                      setCurrentTrackIndex(actualIdx);
                      setIsPlaying(true);
                    }
                  }}
                  style={
                    isSelected
                      ? {
                          backgroundColor: currentTheme.accentSubtle,
                          color: currentTheme.accentSubtleText,
                          borderColor: `${currentTheme.accentColor}66`,
                        }
                      : undefined
                  }
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'font-black'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">{tr.icon || '🎵'}</span>
                    <span className="truncate">{tr.title}</span>
                  </div>
                  {tr.isCustomFile && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveTrack(tr.id, e)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Supprimer la piste"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
