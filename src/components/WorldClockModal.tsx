import React, { useState, useEffect } from 'react';
import { Clock, Globe, Plus, Trash2, X, Search, Check, Sun, Moon, ArrowRight, Laptop } from 'lucide-react';
import { WorldClockCity } from '../types';

interface WorldClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  clocks: WorldClockCity[];
  onUpdateClocks: (clocks: WorldClockCity[]) => void;
}

const AVAILABLE_WORLD_TIMEZONES = [
  { name: 'Paris', country: 'France', timezone: 'Europe/Paris', flagEmoji: '🇫🇷' },
  { name: 'Londres', country: 'Royaume-Uni', timezone: 'Europe/London', flagEmoji: '🇬🇧' },
  { name: 'Dakar', country: 'Sénégal', timezone: 'Africa/Dakar', flagEmoji: '🇸🇳' },
  { name: 'New York', country: 'États-Unis (Est)', timezone: 'America/New_York', flagEmoji: '🇺🇸' },
  { name: 'San Francisco', country: 'États-Unis (Pacifique)', timezone: 'America/Los_Angeles', flagEmoji: '🇺🇸' },
  { name: 'Tokyo', country: 'Japon', timezone: 'Asia/Tokyo', flagEmoji: '🇯🇵' },
  { name: 'Montréal', country: 'Canada', timezone: 'America/Toronto', flagEmoji: '🇨🇦' },
  { name: 'Dubaï', country: 'Émirats Arabes Unis', timezone: 'Asia/Dubai', flagEmoji: '🇦🇪' },
  { name: 'Sydney', country: 'Australie', timezone: 'Australia/Sydney', flagEmoji: '🇦🇺' },
  { name: 'Berlin', country: 'Allemagne', timezone: 'Europe/Berlin', flagEmoji: '🇩🇪' },
  { name: 'Singapour', country: 'Singapour', timezone: 'Asia/Singapore', flagEmoji: '🇸🇬' },
  { name: 'São Paulo', country: 'Brésil', timezone: 'America/Sao_Paulo', flagEmoji: '🇧🇷' },
  { name: 'Casablanca', country: 'Maroc', timezone: 'Africa/Casablanca', flagEmoji: '🇲🇦' },
  { name: 'Le Caire', country: 'Égypte', timezone: 'Africa/Cairo', flagEmoji: '🇪🇬' },
  { name: 'Séoul', country: 'Corée du Sud', timezone: 'Asia/Seoul', flagEmoji: '🇰🇷' },
  { name: 'Abidjan', country: 'Côte d\'Ivoire', timezone: 'Africa/Abidjan', flagEmoji: '🇨🇮' },
];

export const WorldClockModal: React.FC<WorldClockModalProps> = ({
  isOpen,
  onClose,
  clocks,
  onUpdateClocks,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Auto tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const getTimeString = (timezone: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !use24Hour,
        timeZone: timezone === 'local' ? localTimezone : timezone,
      };
      return new Intl.DateTimeFormat('fr-FR', options).format(currentTime);
    } catch {
      return '--:--:--';
    }
  };

  const getDateString = (timezone: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: timezone === 'local' ? localTimezone : timezone,
      };
      return new Intl.DateTimeFormat('fr-FR', options).format(currentTime);
    } catch {
      return '';
    }
  };

  const getTimeDifference = (timezone: string) => {
    if (timezone === 'local' || timezone === localTimezone) return 'Même heure';
    try {
      const localDate = new Date();
      const localFormatted = new Date(localDate.toLocaleString('en-US', { timeZone: localTimezone }));
      const targetFormatted = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
      const diffHours = Math.round((targetFormatted.getTime() - localFormatted.getTime()) / (1000 * 60 * 60));
      if (diffHours === 0) return 'Même heure';
      return diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`;
    } catch {
      return '';
    }
  };

  const isNight = (timezone: string) => {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone === 'local' ? localTimezone : timezone,
      }).format(currentTime);
      const hour = parseInt(hourStr, 10);
      return hour < 6 || hour >= 20;
    } catch {
      return false;
    }
  };

  const handleAddClock = (tz: typeof AVAILABLE_WORLD_TIMEZONES[0]) => {
    if (clocks.some((c) => c.timezone === tz.timezone)) return;
    const newClock: WorldClockCity = {
      id: `clk-${Date.now()}`,
      name: tz.name,
      country: tz.country,
      timezone: tz.timezone,
      flagEmoji: tz.flagEmoji,
      isPrimary: false,
    };
    onUpdateClocks([...clocks, newClock]);
    setShowAddMenu(false);
  };

  const handleRemoveClock = (id: string) => {
    if (clocks.length <= 1) return;
    onUpdateClocks(clocks.filter((c) => c.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    onUpdateClocks(
      clocks.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const filteredTimezones = AVAILABLE_WORLD_TIMEZONES.filter(
    (tz) =>
      !clocks.some((c) => c.timezone === tz.timezone) &&
      (tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.timezone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#161922] text-[#161922] dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-xs"
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Horloge Mondiale & Fuseaux Horaires
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Synchronisée en temps réel avec votre ordinateur ({localTimezone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 12h / 24h toggle */}
            <button
              onClick={() => setUse24Hour(!use24Hour)}
              className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-black rounded-full transition-colors cursor-pointer"
            >
              {use24Hour ? 'Format 24h' : 'Format 12h (AM/PM)'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* PRIMARY CLOCK HERO CARD */}
          {(() => {
            const primaryClock = clocks.find((c) => c.isPrimary) || clocks[0];
            const night = isNight(primaryClock?.timezone || 'local');
            return (
              <div className="bg-[#161922] text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{primaryClock.flagEmoji}</span>
                    <span
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      {primaryClock.name} • {primaryClock.country}
                    </span>
                    {night ? (
                      <span className="flex items-center gap-1 text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        <Moon className="w-3 h-3" /> Nuit
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        <Sun className="w-3 h-3" /> Jour
                      </span>
                    )}
                  </div>
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                    {getTimeString(primaryClock.timezone)}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    {getDateString(primaryClock.timezone)} • Fuseau : {primaryClock.timezone === 'local' ? localTimezone : primaryClock.timezone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 bg-zinc-800 text-slate-300 rounded-xl">
                    {getTimeDifference(primaryClock.timezone)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* ACTIVE CLOCKS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Vos Villes & Horloges Actives ({clocks.length})
              </h3>

              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un Fuseau</span>
              </button>
            </div>

            {/* ADD CLOCK DRAWER / SEARCH */}
            {showAddMenu && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une ville, pays ou fuseau..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredTimezones.map((tz) => (
                    <button
                      key={tz.timezone}
                      onClick={() => handleAddClock(tz)}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{tz.flagEmoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#161922] dark:text-white truncate">
                            {tz.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {tz.country}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white shrink-0" />
                    </button>
                  ))}
                  {filteredTimezones.length === 0 && (
                    <p className="col-span-2 text-center text-xs text-slate-400 py-3">
                      Aucun autre fuseau trouvé
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CLOCKS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clocks.map((clock) => {
                const night = isNight(clock.timezone);
                const timeDiff = getTimeDifference(clock.timezone);
                return (
                  <div
                    key={clock.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      clock.isPrimary
                        ? 'border-2'
                        : 'bg-slate-50/80 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800'
                    }`}
                    style={clock.isPrimary ? {
                      backgroundColor: 'var(--accent-subtle)',
                      borderColor: 'var(--accent-color)'
                    } : undefined}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{clock.flagEmoji}</span>
                        <span className="text-xs font-black text-[#161922] dark:text-white truncate">
                          {clock.name}
                        </span>
                        {clock.isPrimary && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}
                          >
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-black font-mono tracking-tight text-[#161922] dark:text-white">
                        {getTimeString(clock.timezone)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        {getDateString(clock.timezone)} • {timeDiff}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="p-1 text-slate-400">
                        {night ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      </span>

                      <div className="flex items-center gap-1">
                        {!clock.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(clock.id)}
                            title="Définir comme horloge principale"
                            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-black dark:hover:text-white text-[10px] font-bold cursor-pointer"
                          >
                            ⭐
                          </button>
                        )}
                        {clocks.length > 1 && (
                          <button
                            onClick={() => handleRemoveClock(clock.id)}
                            title="Supprimer cette horloge"
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            💡 Utilisez les horloges pour planifier vos séances internationales ou sessions de groupe.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#161922] dark:bg-white text-white dark:text-[#161922] rounded-xl text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
