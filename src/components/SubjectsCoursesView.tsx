import React, { useState } from 'react';
import {
  AcademicSubject,
  CourseChapter,
  CourseDocumentItem,
  FlashcardDeck,
  StudyDocument,
} from '../types';
import { OFFICIAL_CURRICULUM_OPTIONS } from '../data/initialData';
import { AnimatedIcon } from './AnimatedIcon';
import {
  BookOpen,
  FolderPlus,
  Plus,
  Layers,
  FileText,
  Upload,
  Sparkles,
  Music,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  Search,
  Folder,
  ArrowRight,
  GraduationCap,
  Clock,
  Tag,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubjectsCoursesViewProps {
  subjects: AcademicSubject[];
  decks: FlashcardDeck[];
  documents?: StudyDocument[];
  onAddDocument?: (doc: StudyDocument) => void;
  onUpdateSubjects: (updatedSubjects: AcademicSubject[]) => void;
  onSelectDeckForStudy?: (deck: FlashcardDeck) => void;
  onSoftDeleteItem: (item: {
    originalId: string;
    type: 'document' | 'deck' | 'audio' | 'course_chapter';
    title: string;
    subject?: string;
    data: any;
    fileCategory?: 'pdf' | 'audio' | 'text' | 'ia_generated' | 'deck';
  }) => void;
  onGenerateDeckFromDoc?: (doc: { name: string; content: string }) => void;
}

export const SubjectsCoursesView: React.FC<SubjectsCoursesViewProps> = ({
  subjects,
  decks,
  documents = [],
  onAddDocument,
  onUpdateSubjects,
  onSelectDeckForStudy,
  onSoftDeleteItem,
  onGenerateDeckFromDoc,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || 'sub-maths'
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showImportCourseModal, setShowImportCourseModal] = useState(false);
  const [showReaderDoc, setShowReaderDoc] = useState<CourseDocumentItem | null>(null);

  // New chapter form
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');

  // Import course form & modes: 'local_file' | 'hub_documents' | 'ai_generate'
  const [importMode, setImportMode] = useState<'local_file' | 'hub_documents' | 'ai_generate'>('hub_documents');
  const [importedTitle, setImportedTitle] = useState('');
  const [importedContent, setImportedContent] = useState('');
  const [importedType, setImportedType] = useState<CourseDocumentItem['type']>('text');
  const [importedTargetChapter, setImportedTargetChapter] = useState<string>('');
  const [importedFileName, setImportedFileName] = useState('');
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [selectedHubDocId, setSelectedHubDocId] = useState<string | null>(null);

  // AI Course Generator
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiEducationLevel, setAiEducationLevel] = useState('Lycée / Université');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<{
    title: string;
    content: string;
    summary: string;
    keyConcepts: string[];
    suggestedChapter?: string;
  } | null>(null);

  // Current Subject
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const chapters = currentSubject?.chapters || [];

  // Set default selected chapter if not set
  React.useEffect(() => {
    if (chapters.length > 0 && (!selectedChapterId || !chapters.some((c) => c.id === selectedChapterId))) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [selectedSubjectId, chapters, selectedChapterId]);

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  // Handle adding a subject from curriculum
  const handleToggleSubjectFromCurriculum = (curriculumItem: typeof OFFICIAL_CURRICULUM_OPTIONS[0]) => {
    const existingIndex = subjects.findIndex((s) => s.name === curriculumItem.name);
    if (existingIndex >= 0) {
      const updated = [...subjects];
      updated[existingIndex].enabled = !updated[existingIndex].enabled;
      onUpdateSubjects(updated);
    } else {
      const newSub: AcademicSubject = {
        id: `sub-${Date.now()}`,
        name: curriculumItem.name,
        code: `${curriculumItem.name.slice(0, 4).toUpperCase()}-01`,
        category: curriculumItem.category as any,
        color: curriculumItem.color,
        icon: curriculumItem.icon,
        enabled: true,
        targetWeeklyHours: 5,
        chapters: [
          {
            id: `chap-${Date.now()}-1`,
            title: 'Chapitre 1 : Introduction & Fondamentaux',
            description: `Bases et notions clés de ${curriculumItem.name}`,
            order: 1,
            documents: [],
            deckIds: [],
            completed: false,
          },
        ],
      };
      const updated = [...subjects, newSub];
      onUpdateSubjects(updated);
      setSelectedSubjectId(newSub.id);
    }
  };

  // Handle adding a new chapter
  const handleCreateChapter = () => {
    if (!newChapterTitle.trim() || !currentSubject) return;

    const newChapter: CourseChapter = {
      id: `chap-${Date.now()}`,
      title: newChapterTitle.trim(),
      description: newChapterDesc.trim() || 'Notions et cours du chapitre.',
      order: chapters.length + 1,
      documents: [],
      deckIds: [],
      completed: false,
    };

    const updatedSubjects = subjects.map((sub) => {
      if (sub.id === currentSubject.id) {
        return {
          ...sub,
          chapters: [...sub.chapters, newChapter],
        };
      }
      return sub;
    });

    onUpdateSubjects(updatedSubjects);
    setSelectedChapterId(newChapter.id);
    setNewChapterTitle('');
    setNewChapterDesc('');
    setShowAddChapterModal(false);
  };

  // Handle file upload for course import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    if (!importedTitle) {
      setImportedTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.type.includes('pdf')) {
      setImportedType('pdf');
    } else if (file.type.includes('audio')) {
      setImportedType('audio');
    } else {
      setImportedType('text');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportedContent((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Handle import from Hub Documents selection
  const handleSelectDocFromHub = (doc: StudyDocument) => {
    setSelectedHubDocId(doc.id);
    setImportedTitle(doc.name.replace(/\.[^/.]+$/, ''));
    setImportedContent(
      doc.content ||
        `# ${doc.name}\n\n${doc.aiAnalysis?.summary || ''}\n\nConcepts clés:\n${doc.aiAnalysis?.keyConcepts?.join('\n- ') || ''}`
    );
    setImportedFileName(doc.name);
    setImportedType(
      doc.fileCategory === 'audio'
        ? 'audio'
        : doc.fileCategory === 'pdf'
        ? 'pdf'
        : doc.fileCategory === 'ia_generated'
        ? 'ia_summary'
        : 'text'
    );
  };

  // Handle AI Course Generation
  const handleGenerateCourseWithAI = async () => {
    if (!aiPromptText.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-study-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          promptText: aiPromptText,
          fileType: 'text',
          level: aiEducationLevel,
        }),
      });
      const data = await res.json();
      if (data && data.title) {
        setAiGeneratedPreview({
          title: data.title,
          content: data.content,
          summary: data.summary,
          keyConcepts: data.keyConcepts || [],
          suggestedChapter: data.suggestedChapter,
        });
        setImportedTitle(data.title);
        setImportedContent(data.content);
        setImportedFileName(data.fileName || `${data.title}.md`);
        setImportedType('ia_summary');

        // Also add to global Hub Documents if callback available
        if (onAddDocument) {
          const newHubDoc: StudyDocument = {
            id: `doc-hub-${Date.now()}`,
            name: data.fileName || `${data.title}.md`,
            size: data.content?.length || 2048,
            type: 'text/markdown',
            uploadDate: new Date().toISOString(),
            fileCategory: 'ia_generated',
            content: data.content || '',
            subject: currentSubject.name,
            isAiGenerated: true,
            aiAnalysis: {
              summary: data.summary || '',
              keyConcepts: data.keyConcepts || [],
              formulasAndDefs: [],
              studySuggestions: [],
              generatedAt: new Date().toISOString(),
            },
          };
          onAddDocument(newHubDoc);
        }
      }
    } catch (err) {
      console.error('Error generating course with AI:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle submit imported course
  const handleSaveImportedCourse = () => {
    if (!importedTitle.trim() || !currentSubject) return;

    const targetChapterId = importedTargetChapter || activeChapter?.id || chapters[0]?.id;
    if (!targetChapterId) return;

    const newDoc: CourseDocumentItem = {
      id: `cdoc-${Date.now()}`,
      title: importedTitle.trim(),
      content: importedContent || `# ${importedTitle}\n\nCours importé avec succès.`,
      type: importedType,
      fileName: importedFileName || `${importedTitle}.md`,
      fileSize: importedContent.length || 4500,
      addedAt: new Date().toISOString().split('T')[0],
      tags: [currentSubject.name],
    };

    const updatedSubjects = subjects.map((sub) => {
      if (sub.id === currentSubject.id) {
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => {
            if (chap.id === targetChapterId) {
              return {
                ...chap,
                documents: [newDoc, ...chap.documents],
              };
            }
            return chap;
          }),
        };
      }
      return sub;
    });

    onUpdateSubjects(updatedSubjects);
    setShowImportCourseModal(false);
    setImportedTitle('');
    setImportedContent('');
    setImportedFileName('');
    setAiGeneratedPreview(null);
    setAiPromptText('');
    setSelectedHubDocId(null);
  };

  // Toggle chapter completion
  const handleToggleChapterComplete = (chapId: string) => {
    if (!currentSubject) return;
    const updatedSubjects = subjects.map((sub) => {
      if (sub.id === currentSubject.id) {
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => {
            if (chap.id === chapId) {
              return { ...chap, completed: !chap.completed };
            }
            return chap;
          }),
        };
      }
      return sub;
    });
    onUpdateSubjects(updatedSubjects);
  };

  // Delete a document from chapter (soft delete to Trash)
  const handleDeleteDocFromChapter = (chapId: string, doc: CourseDocumentItem) => {
    if (!currentSubject) return;

    onSoftDeleteItem({
      originalId: doc.id,
      type: 'document',
      title: doc.title,
      subject: currentSubject.name,
      fileCategory: doc.type === 'audio' ? 'audio' : doc.type === 'pdf' ? 'pdf' : 'text',
      data: { ...doc, subjectId: currentSubject.id, chapterId: chapId },
    });

    const updatedSubjects = subjects.map((sub) => {
      if (sub.id === currentSubject.id) {
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => {
            if (chap.id === chapId) {
              return {
                ...chap,
                documents: chap.documents.filter((d) => d.id !== doc.id),
              };
            }
            return chap;
          }),
        };
      }
      return sub;
    });

    onUpdateSubjects(updatedSubjects);
  };

  // Get decks associated with current subject/chapter
  const subjectDecks = decks.filter(
    (d) =>
      d.subject.toLowerCase() === currentSubject?.name.toLowerCase() ||
      activeChapter?.deckIds?.includes(d.id)
  );

  const filteredHubDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
    (d.aiAnalysis?.summary && d.aiAnalysis.summary.toLowerCase().includes(hubSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-md">
            <AnimatedIcon type="graduation" className="w-6 h-6 text-[#161922]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#161922] dark:text-white tracking-tight">
              Matières & Cours par Chapitres
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Organisation thématique officielle du cursus • Hub Documents, fiches IA, decks & synthèses audio
            </p>
          </div>
        </div>

        {/* TOP BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Gérer mes matières</span>
          </button>

          <button
            onClick={() => {
              setImportedTargetChapter(activeChapter?.id || '');
              setShowImportCourseModal(true);
            }}
            className="px-4 py-2.5 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Importer un cours (Hub & IA)</span>
          </button>
        </div>
      </motion.div>

      {/* SUBJECTS TABS HORIZONTAL SCROLLER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {subjects
          .filter((s) => s.enabled)
          .map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubjectId(sub.id);
                  if (sub.chapters.length > 0) {
                    setSelectedChapterId(sub.chapters[0].id);
                  }
                }}
                className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#161922] dark:bg-white text-white dark:text-[#161922] shadow-md scale-102'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <span className="text-base">{sub.icon || '📚'}</span>
                <span>{sub.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isSelected
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-[#161922]'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                  }`}
                >
                  {sub.chapters.length} chap.
                </span>
              </button>
            );
          })}

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="px-3.5 py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-slate-400 hover:border-[#D4F94E] hover:text-[#161922] dark:hover:text-white text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter une matière</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CHAPTERS LIST & CHAPTER DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CHAPTERS OF CURRENT SUBJECT (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#161922] dark:text-white flex items-center gap-2">
                  <span>{currentSubject.icon}</span>
                  <span>Chapitres ({chapters.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">{currentSubject.name}</p>
              </div>

              <button
                onClick={() => setShowAddChapterModal(true)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-[#D4F94E] hover:text-[#161922] text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Ajouter un chapitre"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* CHAPTERS VERTICAL LIST */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {chapters.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                  <p>Aucun chapitre créé dans cette matière.</p>
                  <button
                    onClick={() => setShowAddChapterModal(true)}
                    className="px-3 py-1.5 bg-[#D4F94E] text-[#161922] font-black rounded-xl cursor-pointer"
                  >
                    + Créer le 1er chapitre
                  </button>
                </div>
              ) : (
                chapters.map((chap, idx) => {
                  const isSelected = activeChapter?.id === chap.id;
                  return (
                    <motion.div
                      key={chap.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedChapterId(chap.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#161922] dark:border-[#D4F94E] bg-slate-50 dark:bg-zinc-800/90 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Chapitre {idx + 1}
                          </span>
                          <h4 className="font-extrabold text-sm text-[#161922] dark:text-white leading-tight">
                            {chap.title}
                          </h4>
                          {chap.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                              {chap.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleChapterComplete(chap.id);
                          }}
                          className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            chap.completed
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                              : 'text-slate-400 hover:text-emerald-500'
                          }`}
                          title={chap.completed ? 'Marqué comme terminé' : 'Marquer comme terminé'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* STATS PILL */}
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-700/60 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          {chap.documents.length} doc{chap.documents.length > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-purple-500" />
                          {chap.deckIds?.length || 0} deck(s)
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAPTER CONTENT & DOCUMENTS (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeChapter ? (
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {/* CHAPTER BANNER */}
              <div className="bg-gradient-to-r from-slate-900 to-zinc-800 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#D4F94E] text-[#161922] text-xs font-black rounded-full uppercase tracking-wider">
                      {currentSubject.name}
                    </span>
                    {activeChapter.completed && (
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[11px] font-black rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Chapitre Maîtrisé
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{activeChapter.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                    {activeChapter.description || 'Consultez les fiches de cours, cours importés et flashcards associées à ce chapitre.'}
                  </p>
                </div>
              </div>

              {/* SECTION: COURS ET DOCUMENTS DU CHAPITRE */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-[#161922] dark:text-white flex items-center gap-2">
                    <AnimatedIcon type="document" className="w-5 h-5 text-blue-500" />
                    <span>Fiches de Cours & Documents ({activeChapter.documents.length})</span>
                  </h4>

                  <button
                    onClick={() => {
                      setImportedTargetChapter(activeChapter.id);
                      setShowImportCourseModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] hover:bg-[#D4F94E] hover:text-[#161922] rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Importer (Hub / IA)
                  </button>
                </div>

                {activeChapter.documents.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Aucun document ou cours n'a encore été importé dans ce chapitre.
                    </p>
                    <button
                      onClick={() => {
                        setImportedTargetChapter(activeChapter.id);
                        setShowImportCourseModal(true);
                      }}
                      className="px-4 py-2 bg-[#D4F94E] text-[#161922] font-black text-xs rounded-xl cursor-pointer"
                    >
                      + Importer depuis Hub Documents ou IA
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeChapter.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/60 hover:border-[#D4F94E] transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                doc.type === 'audio'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                  : doc.type === 'pdf'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                  : doc.type === 'ia_summary'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              }`}
                            >
                              {doc.type === 'ia_summary' ? '✨ IA SYNTHÈSE' : doc.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{doc.addedAt}</span>
                          </div>

                          <h5 className="font-black text-sm text-[#161922] dark:text-white leading-tight truncate">
                            {doc.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-medium">
                            {doc.content.slice(0, 140)}...
                          </p>
                        </div>

                        {/* ACTIONS ON DOCUMENT */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-xs">
                          <button
                            onClick={() => setShowReaderDoc(doc)}
                            className="px-3 py-1.5 bg-white dark:bg-zinc-700 text-[#161922] dark:text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#D4F94E] hover:text-[#161922] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lire
                          </button>

                          {onGenerateDeckFromDoc && (
                            <button
                              onClick={() => onGenerateDeckFromDoc({ name: doc.title, content: doc.content })}
                              className="px-3 py-1.5 bg-[#D4F94E] text-[#161922] rounded-xl font-black text-xs flex items-center gap-1 hover:bg-[#CBF33B] transition-colors cursor-pointer"
                              title="Générer des flashcards Active Recall avec l'IA"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> IA Flashcards
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteDocFromChapter(activeChapter.id, doc)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Déplacer vers la corbeille (30j)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: FLASHCARD DECKS DU SUJET & CHAPITRE */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-[#161922] dark:text-white flex items-center gap-2">
                    <AnimatedIcon type="layers" className="w-5 h-5 text-purple-500" />
                    <span>Decks Flashcards Associés ({subjectDecks.length})</span>
                  </h4>
                </div>

                {subjectDecks.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center">
                    Aucun deck de flashcards n'est encore lié à {currentSubject.name}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjectDecks.map((deck) => (
                      <div
                        key={deck.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-3 hover:border-purple-400 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-full">
                              {deck.cards.length} Cartes
                            </span>
                            <span className="text-xs font-bold text-slate-400">{deck.difficulty || 'Moyen'}</span>
                          </div>
                          <h5 className="font-black text-sm text-[#161922] dark:text-white leading-tight">
                            {deck.title}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                            {deck.description}
                          </p>
                        </div>

                        {onSelectDeckForStudy && (
                          <button
                            onClick={() => onSelectDeckForStudy(deck)}
                            className="w-full py-2 bg-[#161922] dark:bg-white text-white dark:text-[#161922] hover:bg-[#D4F94E] hover:text-[#161922] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Réviser en Active Recall</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
              <p className="font-bold">Sélectionnez ou créez un chapitre pour voir son contenu.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: GÉRER / CHOISIR LES MATIÈRES DE L'ÉLÈVE */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-lg text-[#161922] dark:text-white">
                  Sélection des Matières du Cursus
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Activez ou désactivez les matières que vous suivez cette année
                </p>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CURRICULUM SELECTION LIST */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1">
              {OFFICIAL_CURRICULUM_OPTIONS.map((item) => {
                const isActivated = subjects.some((s) => s.name === item.name && s.enabled);
                return (
                  <div
                    key={item.name}
                    onClick={() => handleToggleSubjectFromCurriculum(item)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      isActivated
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-xs text-[#161922] dark:text-white">{item.name}</p>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        isActivated
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'
                      }`}
                    >
                      {isActivated ? '✓' : '+'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="px-5 py-2.5 bg-[#D4F94E] text-[#161922] font-black rounded-xl text-xs cursor-pointer"
              >
                Terminer la configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: AJOUTER UN CHAPITRE */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-[#161922] dark:text-white">
              Nouveau Chapitre • {currentSubject.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Titre du chapitre :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chapitre 4 : Calcul Intégral & Primitives"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Description / Objectifs :
                </label>
                <textarea
                  rows={3}
                  placeholder="Notions abordées, théorèmes et définitions à maîtriser..."
                  value={newChapterDesc}
                  onChange={(e) => setNewChapterDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddChapterModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateChapter}
                disabled={!newChapterTitle.trim()}
                className="px-5 py-2 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-xl text-xs font-black disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Créer le chapitre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: IMPORTER UN COURS (3 MODES: LOCAL FILE, HUB DOCUMENTS, IA GEMINI) */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {showImportCourseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#161922] dark:text-white">
                  Importer un cours • {currentSubject.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choisissez la source d'importation vers votre chapitre
                </p>
              </div>
              <button onClick={() => setShowImportCourseModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {/* 3 IMPORT SOURCE TABS */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setImportMode('hub_documents')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'hub_documents'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white font-black shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-blue-500" />
                <span>Hub Documents ({documents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('ai_generate')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'ai_generate'
                    ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#161922]" />
                <span>Générer avec l'IA</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('local_file')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  importMode === 'local_file'
                    ? 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white font-black shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Fichier Local</span>
              </button>
            </div>

            {/* MODAL BODY CONTENT */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* TARGET CHAPTER SELECTOR (ALWAYS VISIBLE) */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Chapitre de destination dans {currentSubject.name} :
                </label>
                <select
                  value={importedTargetChapter || activeChapter?.id || ''}
                  onChange={(e) => setImportedTargetChapter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* MODE 1: IMPORT FROM HUB DOCUMENTS */}
              {importMode === 'hub_documents' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans le Hub Documents..."
                      value={hubSearchQuery}
                      onChange={(e) => setHubSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                  {documents.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6 font-medium">
                      Aucun document dans le Hub. Vous pouvez en générer un avec l'IA ou importer un fichier local.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredHubDocs.map((doc) => {
                        const isSelected = selectedHubDocId === doc.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => handleSelectDocFromHub(doc)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-[#161922] dark:border-[#D4F94E] bg-[#EFFDE2] dark:bg-zinc-800 shadow-xs'
                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-[#161922] dark:text-white truncate">
                                  {doc.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {Math.round(doc.size / 1024)} KB • {(doc.fileCategory || 'document').toUpperCase()} {doc.aiAnalysis?.summary && `• ${doc.aiAnalysis.summary.slice(0, 45)}...`}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black text-xs shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: GENERATE WITH GEMINI AI */}
              {importMode === 'ai_generate' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Sujet ou notion du cours à rédiger :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Les lois de Newton et dynamique des solides, ou Les figures de style au Bac"
                      value={aiPromptText}
                      onChange={(e) => setAiPromptText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Niveau d'étude</label>
                      <select
                        value={aiEducationLevel}
                        onChange={(e) => setAiEducationLevel(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-[#161922] dark:text-white outline-none"
                      >
                        <option value="Collège">Collège (Brevet)</option>
                        <option value="Lycée">Lycée (Baccalauréat)</option>
                        <option value="Prépa / Université">Prépa & Université (Licence/Master)</option>
                        <option value="Grand Concours">Concours & Médecine</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={isAiGenerating || !aiPromptText.trim()}
                        onClick={handleGenerateCourseWithAI}
                        className="w-full py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        {isAiGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rédacteur IA actif...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Rédiger la Fiche IA
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {aiGeneratedPreview && (
                    <div className="p-3 bg-emerald-50 dark:bg-zinc-800/80 rounded-2xl border border-emerald-300 dark:border-emerald-700 text-xs space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black">
                        <FileCheck className="w-4 h-4" /> Cours IA Généré : {aiGeneratedPreview.title}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {aiGeneratedPreview.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 3: LOCAL FILE UPLOAD */}
              {importMode === 'local_file' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl p-4 text-center hover:border-[#D4F94E] transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.json,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {importedFileName ? `Fichier : ${importedFileName}` : 'Glissez-déposez un fichier de cours (.txt, .md, .pdf)'}
                    </p>
                  </div>
                </div>
              )}

              {/* TITLE & CONTENT PREVIEW */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Titre du cours / Fiche :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Synthèse des Développements Limités"
                  value={importedTitle}
                  onChange={(e) => setImportedTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Contenu texte / Markdown du cours :
                </label>
                <textarea
                  rows={4}
                  placeholder="Collez ou vérifiez les notes de cours ici..."
                  value={importedContent}
                  onChange={(e) => setImportedContent(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowImportCourseModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveImportedCourse}
                disabled={!importedTitle.trim()}
                className="px-5 py-2 bg-[#D4F94E] text-[#161922] font-black rounded-xl text-xs disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Enregistrer le cours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LECTEUR DE DOCUMENT */}
      {showReaderDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-lg text-[#161922] dark:text-white">{showReaderDoc.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{showReaderDoc.addedAt} • {showReaderDoc.type.toUpperCase()}</p>
              </div>
              <button onClick={() => setShowReaderDoc(null)} className="p-2 text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {showReaderDoc.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowReaderDoc(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
