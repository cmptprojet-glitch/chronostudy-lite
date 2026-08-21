import React, { useState } from 'react';
import { AcademicSubject, CourseChapter, CourseDocumentItem } from '../types';
import { BookOpen, FolderPlus, Check, X, Layers, Sparkles, FileText, Music, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddToCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToAdd: {
    id: string;
    title: string;
    content?: string;
    type?: string;
    fileCategory?: 'pdf' | 'audio' | 'text' | 'ia_generated' | 'deck' | 'folder' | 'code';
    audioUrl?: string;
    fileSize?: number;
    fileName?: string;
  } | null;
  subjects: AcademicSubject[];
  onConfirmAddToCourse: (
    subjectId: string,
    chapterId: string,
    documentItem: CourseDocumentItem,
    newChapterTitle?: string
  ) => void;
}

export const AddToCourseModal: React.FC<AddToCourseModalProps> = ({
  isOpen,
  onClose,
  itemToAdd,
  subjects,
  onConfirmAddToCourse,
}) => {
  const activeSubjects = subjects.filter((s) => s.enabled);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSubjects[0]?.id || subjects[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [isCreatingNewChapter, setIsCreatingNewChapter] = useState<boolean>(false);
  const [newChapterTitle, setNewChapterTitle] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const chapters = currentSubject?.chapters || [];

  // Reset chapter selection when subject changes
  React.useEffect(() => {
    if (chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
      setIsCreatingNewChapter(false);
    } else {
      setSelectedChapterId('');
      setIsCreatingNewChapter(true);
    }
  }, [selectedSubjectId, subjects]);

  if (!isOpen || !itemToAdd) return null;

  const handleConfirm = () => {
    if (!selectedSubjectId) return;
    if (isCreatingNewChapter && !newChapterTitle.trim()) return;
    if (!isCreatingNewChapter && !selectedChapterId) return;

    const docType: CourseDocumentItem['type'] =
      itemToAdd.fileCategory === 'audio'
        ? 'audio'
        : itemToAdd.fileCategory === 'pdf'
        ? 'pdf'
        : itemToAdd.fileCategory === 'ia_generated'
        ? 'ia_summary'
        : 'text';

    const courseDoc: CourseDocumentItem = {
      id: `cdoc-${Date.now()}`,
      title: itemToAdd.title,
      content: itemToAdd.content || itemToAdd.title,
      type: docType,
      fileName: itemToAdd.fileName || itemToAdd.title,
      fileSize: itemToAdd.fileSize || 5000,
      audioUrl: itemToAdd.audioUrl,
      addedAt: new Date().toISOString().split('T')[0],
      tags: [currentSubject?.name || 'Général'],
    };

    onConfirmAddToCourse(
      selectedSubjectId,
      isCreatingNewChapter ? 'new' : selectedChapterId,
      courseDoc,
      isCreatingNewChapter ? newChapterTitle.trim() : undefined
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#161922] dark:text-white">
                Ajouter à mes cours & chapitres
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Classez ce fichier directement dans votre cursus académique
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

        {/* FILE PREVIEW CARD */}
        <div className="p-3.5 bg-[#F5F6FA] dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-zinc-700 text-blue-600 dark:text-[#D4F94E] flex items-center justify-center shrink-0">
            {itemToAdd.fileCategory === 'audio' ? (
              <Music className="w-4 h-4" />
            ) : itemToAdd.fileCategory === 'deck' ? (
              <Layers className="w-4 h-4" />
            ) : itemToAdd.fileCategory === 'ia_generated' ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#161922] dark:text-white truncate">
              {itemToAdd.title}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
              Type : {itemToAdd.fileCategory?.toUpperCase() || 'DOCUMENT'} • Prêt à classer
            </p>
          </div>
        </div>

        {/* STEP 1: CHOOSE SUBJECT */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
            1. Choisissez la matière cible :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'border-[#161922] dark:border-[#D4F94E] bg-[#D4F94E]/15 dark:bg-[#D4F94E]/10 ring-2 ring-[#D4F94E]'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800'
                  }`}
                >
                  <span className="text-base">{sub.icon || '📚'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#161922] dark:text-white truncate">
                      {sub.name}
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                      {sub.chapters.length} chap.
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: CHOOSE OR CREATE CHAPTER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              2. Choisissez le chapitre :
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingNewChapter(!isCreatingNewChapter)}
              className="text-[11px] font-bold text-blue-600 dark:text-[#D4F94E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {isCreatingNewChapter ? 'Choisir un existant' : '+ Nouveau chapitre'}
            </button>
          </div>

          {isCreatingNewChapter ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Ex: Chapitre 3 : Dynamique des Réactions Chimiques"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                autoFocus
              />
              <p className="text-[10px] text-slate-500 font-medium">
                Un nouveau chapitre sera automatiquement créé dans "{currentSubject?.name}".
              </p>
            </div>
          ) : (
            <div>
              {chapters.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {chapters.map((chap) => {
                    const isSelected = selectedChapterId === chap.id;
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => setSelectedChapterId(chap.id)}
                        className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#161922] dark:border-[#D4F94E] bg-slate-100 dark:bg-zinc-800 font-black'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs text-[#161922] dark:text-white font-bold truncate">
                            {chap.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {chap.documents.length} doc{chap.documents.length > 1 ? 's' : ''} • {chap.deckIds?.length || 0} deck(s)
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#D4F94E] text-[#161922] flex items-center justify-center shrink-0 font-black text-xs">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  Aucun chapitre existant dans cette matière. Cliquez sur "+ Nouveau chapitre" pour en créer un.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isSuccess ||
              !selectedSubjectId ||
              (isCreatingNewChapter ? !newChapterTitle.trim() : !selectedChapterId)
            }
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] disabled:opacity-40'
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Ajouté aux cours !</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Valider le classement</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
