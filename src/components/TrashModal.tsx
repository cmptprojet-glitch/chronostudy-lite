import React, { useState } from 'react';
import { TrashItem, TrashItemType } from '../types';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Music,
  Layers,
  Sparkles,
  Folder,
  X,
  Check,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashItems: TrashItem[];
  onRestoreItem: (trashId: string) => void;
  onPermanentDeleteItem: (trashId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  trashItems,
  onRestoreItem,
  onPermanentDeleteItem,
  onEmptyTrash,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | TrashItemType>('all');
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate days remaining out of 30 days
  const calculateDaysRemaining = (deletedAtStr: string) => {
    const deletedTime = new Date(deletedAtStr).getTime();
    const now = Date.now();
    const elapsedDays = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 30 - elapsedDays);
    return remaining;
  };

  const filteredItems = trashItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleRestore = (id: string) => {
    setRestoredId(id);
    setTimeout(() => {
      onRestoreItem(id);
      setRestoredId(null);
    }, 400);
  };

  const getItemIcon = (item: TrashItem) => {
    if (item.fileCategory === 'audio' || item.type === 'audio') {
      return <Music className="w-4 h-4 text-purple-500" />;
    }
    if (item.fileCategory === 'deck' || item.type === 'deck') {
      return <Layers className="w-4 h-4 text-blue-500" />;
    }
    if (item.fileCategory === 'ia_generated' || item.type === 'ai_file') {
      return <Sparkles className="w-4 h-4 text-emerald-500" />;
    }
    if (item.type === 'course_chapter') {
      return <Folder className="w-4 h-4 text-amber-500" />;
    }
    return <FileText className="w-4 h-4 text-rose-500" />;
  };

  const getItemBadge = (item: TrashItem) => {
    if (item.fileCategory === 'audio' || item.type === 'audio') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300">Audio MP3</span>;
    }
    if (item.fileCategory === 'deck' || item.type === 'deck') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">Deck Flashcards</span>;
    }
    if (item.fileCategory === 'ia_generated' || item.type === 'ai_file') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">Fiche IA</span>;
    }
    if (item.type === 'course_chapter') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300">Chapitre / Cours</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300">Document / PDF</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-[#161922] dark:text-white">
                  Corbeille & Rétention 30 Jours
                </h3>
                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black text-xs rounded-full">
                  {trashItems.length} élément{trashItems.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Les éléments supprimés sont conservés 30 jours avant purge définitive automatique.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-DAY NOTICE BANNER */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 shrink-0">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 font-medium">
            <span className="font-bold">Délai de récupération :</span> Tout deck, document de cours ou audio supprimé peut être restauré en 1 clic à son emplacement d'origine pendant 30 jours.
          </div>
          {trashItems.length > 0 && (
            <button
              onClick={() => setConfirmEmpty(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Vider tout
            </button>
          )}
        </div>

        {/* EMPTY CONFIRMATION DIALOG */}
        {confirmEmpty && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Êtes-vous certain de vouloir vider définitivement toute la corbeille ? Cette action est irréversible.</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onEmptyTrash();
                  setConfirmEmpty(false);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
              >
                Confirmer la suppression irréversible
              </button>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          {(
            [
              { id: 'all', label: 'Tous les éléments', count: trashItems.length },
              { id: 'deck', label: 'Decks', count: trashItems.filter((i) => i.type === 'deck').length },
              { id: 'document', label: 'Documents & PDF', count: trashItems.filter((i) => i.type === 'document').length },
              { id: 'audio', label: 'Fichiers Audio', count: trashItems.filter((i) => i.type === 'audio').length },
              { id: 'ai_file', label: 'Fiches IA', count: trashItems.filter((i) => i.type === 'ai_file').length },
              { id: 'course_chapter', label: 'Cours & Chapitres', count: trashItems.filter((i) => i.type === 'course_chapter').length },
            ] as const
          ).map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#161922] dark:bg-white text-white dark:text-[#161922] font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* LIST OF TRASHED ITEMS */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                <Trash2 className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">La corbeille est vide</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Aucun deck, document ou fichier audio n'est actuellement en attente de purge.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const daysLeft = calculateDaysRemaining(item.deletedAt);
              const isRestoring = restoredId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRestoring
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300'
                      : 'bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                      {getItemIcon(item)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-[#161922] dark:text-white truncate">
                          {item.title}
                        </h4>
                        {getItemBadge(item)}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {item.subject && <span>Matière : <strong>{item.subject}</strong></span>}
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                          <Clock className="w-3 h-3" /> Purge dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RESTORE & DELETE PERMANENT BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="px-3 py-1.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Restaurer l'élément à sa place initiale"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurer</span>
                    </button>
                    <button
                      onClick={() => onPermanentDeleteItem(item.id)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Supprimer définitivement tout de suite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{trashItems.length} fichier(s) en zone tampon de sécurité</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
