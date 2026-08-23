import React, { useState } from 'react';
import { StudyDocument, AcademicSubject, CourseDocumentItem } from '../types';
import {
  FileText,
  Upload,
  Sparkles,
  Eye,
  Download,
  Trash2,
  X,
  ShieldCheck,
  Music,
  Folder,
  FolderPlus,
  MoreVertical,
  BookOpen,
  Calendar,
  Layers,
  FileCode,
  Tag,
  Filter,
  Check,
  ArrowUpRight,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import { AddToCourseModal } from './AddToCourseModal';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedIcon } from './AnimatedIcon';

interface DocumentsViewProps {
  documents: StudyDocument[];
  subjects: AcademicSubject[];
  onAddDocument: (doc: StudyDocument) => void;
  onUpdateDocument: (doc: StudyDocument) => void;
  onDeleteDocument: (docId: string) => void; // Soft-delete to trash
  onGenerateDeckFromDoc?: (doc: StudyDocument) => void;
  onAddToAmbientSound?: (audioTitle: string, docText: string) => void;
  onAddToCourse?: (
    subjectId: string,
    chapterId: string,
    documentItem: CourseDocumentItem,
    newChapterTitle?: string
  ) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  subjects,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onGenerateDeckFromDoc,
  onAddToAmbientSound,
  onAddToCourse,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<StudyDocument | null>(null);
  const [showReaderModal, setShowReaderModal] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Active filter tab
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'audio' | 'pdf' | 'text' | 'ia_generated' | 'folder'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // AI Generation Modal
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [aiGenSubject, setAiGenSubject] = useState(subjects[0]?.name || 'Mathématiques');
  const [aiGenType, setAiGenType] = useState<'text' | 'formulas' | 'exam_prep' | 'audio_script'>('text');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Add to course modal
  const [itemToAddToCourse, setItemToAddToCourse] = useState<{
    id: string;
    title: string;
    content?: string;
    fileCategory?: any;
    fileName?: string;
    audioUrl?: string;
  } | null>(null);

  // 3-dots open menu tracking
  const [openMenuDocId, setOpenMenuDocId] = useState<string | null>(null);

  // Download authorization modal
  const [showDownloadAuthModal, setShowDownloadAuthModal] = useState<boolean>(false);
  const [userConfirmedAuth, setUserConfirmedAuth] = useState<boolean>(false);
  const [pendingDownloadDoc, setPendingDownloadDoc] = useState<StudyDocument | null>(null);

  // Handle file uploads (supports PDF, Audio, Text, MD, JSON)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const textContent = (e.target?.result as string) || '';

      let cat: StudyDocument['fileCategory'] = 'text';
      if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
        cat = 'pdf';
      } else if (file.type.includes('audio') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        cat = 'audio';
      }

      const newDoc: StudyDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        fileCategory: cat,
        uploadDate: new Date().toLocaleDateString('fr-FR'),
        content: textContent,
        subject: selectedSubjectFilter !== 'all' ? selectedSubjectFilter : 'Général',
        tags: [cat.toUpperCase(), 'Importé'],
      };

      onAddDocument(newDoc);
    };

    reader.readAsText(file);
  };

  // AI Generation of complete study document
  const handleGenerateAiStudyFile = async () => {
    if (!aiGenPrompt.trim() || isGeneratingAi) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/gemini/generate-study-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: aiGenPrompt,
          subject: aiGenSubject,
          fileType: aiGenType,
        }),
      });

      const data = await res.json();
      if (data.title && data.content) {
        const newDoc: StudyDocument = {
          id: `doc-ai-${Date.now()}`,
          name: data.fileName || `${data.title}.md`,
          size: data.content.length || 6000,
          type: 'text/markdown',
          fileCategory: 'ia_generated',
          isAiGenerated: true,
          uploadDate: new Date().toLocaleDateString('fr-FR'),
          content: data.content,
          subject: aiGenSubject,
          tags: ['IA Gemini', ...(data.tags || [])],
          aiAnalysis: {
            summary: data.summary || '',
            keyConcepts: data.keyConcepts || [],
            formulasAndDefs: [],
            studySuggestions: [],
            generatedAt: new Date().toISOString(),
          },
        };

        onAddDocument(newDoc);
        setShowAiGenModal(false);
        setAiGenPrompt('');
        setSelectedDoc(newDoc);
      }
    } catch (err) {
      console.error('Error generating AI study file:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI Document Analysis
  const handleAnalyzeWithAi = async (doc: StudyDocument) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: doc.name,
          fileContent: doc.content,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        const updatedDoc: StudyDocument = {
          ...doc,
          aiAnalysis: {
            summary: data.summary,
            keyConcepts: data.keyConcepts || [],
            formulasAndDefs: data.formulasAndDefs || [],
            studySuggestions: data.studySuggestions || [],
            generatedAt: new Date().toISOString(),
          },
        };

        onUpdateDocument(updatedDoc);
        setSelectedDoc(updatedDoc);
      }
    } catch (err) {
      console.error('Error analyzing document:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download handling
  const triggerDownloadDoc = (doc: StudyDocument) => {
    setPendingDownloadDoc(doc);
    setUserConfirmedAuth(false);
    setShowDownloadAuthModal(true);
  };

  const executeAuthorizedDownload = () => {
    if (!pendingDownloadDoc || !userConfirmedAuth) return;

    const blob = new Blob([pendingDownloadDoc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pendingDownloadDoc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowDownloadAuthModal(false);
    setPendingDownloadDoc(null);
  };

  // Export all documents as JSON
  const handleExportAllDocuments = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documents, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ChronoStudy_Documents_Export_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Tab filter
    if (activeTabFilter === 'audio' && doc.fileCategory !== 'audio' && !doc.type.includes('audio')) {
      return false;
    }
    if (activeTabFilter === 'pdf' && doc.fileCategory !== 'pdf' && !doc.type.includes('pdf')) {
      return false;
    }
    if (activeTabFilter === 'ia_generated' && !doc.isAiGenerated && doc.fileCategory !== 'ia_generated') {
      return false;
    }
    if (activeTabFilter === 'text' && (doc.fileCategory === 'audio' || doc.fileCategory === 'pdf')) {
      return false;
    }

    // Subject filter
    if (selectedSubjectFilter !== 'all' && doc.subject && doc.subject !== selectedSubjectFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        (doc.subject && doc.subject.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Get color code and badge by file type
  const getFileTypeBadge = (doc: StudyDocument) => {
    if (doc.fileCategory === 'audio' || doc.type.includes('audio')) {
      return {
        label: 'Audio MP3',
        color: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: <Music className="w-3 h-3" />,
      };
    }
    if (doc.fileCategory === 'pdf' || doc.type.includes('pdf')) {
      return {
        label: 'PDF Document',
        color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: <FileText className="w-3 h-3" />,
      };
    }
    if (doc.isAiGenerated || doc.fileCategory === 'ia_generated') {
      return {
        label: 'Génération IA',
        color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <Sparkles className="w-3 h-3" />,
      };
    }
    return {
      label: 'Fiche Markdown / Texte',
      color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: <FileText className="w-3 h-3" />,
    };
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* HEADER WITH AI & IMPORT/EXPORT BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#161922] dark:text-white tracking-tight">
              Pôle IA & Hub Documentaire
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Génération IA de fiches de cours, importation multi-formats (.pdf, .mp3, .md), podcast audio & classement par matière
            </p>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAiGenModal(true)}
            className="px-4 py-2.5 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Générer un cours IA</span>
          </button>

          <button
            onClick={handleExportAllDocuments}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#161922] dark:text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exporter tous les documents en JSON"
          >
            <Download className="w-4 h-4" />
            <span>Exporter tout</span>
          </button>
        </div>
      </motion.div>

      {/* DRAG & DROP MULTI-FORMAT UPLOAD ZONE */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-3xl p-6 text-center hover:border-[#D4F94E] transition-all group cursor-pointer relative shadow-xs"
      >
        <input
          type="file"
          accept=".txt,.md,.json,.pdf,.csv,.mp3,.wav,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="w-12 h-12 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-xs">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-sm sm:text-base text-[#161922] dark:text-white">
          Glissez-déposez vos fichiers ici (PDF, Audio MP3, Cours Markdown, Textes)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Tous formats supportés • Indexation instantanée et compatibilité avec l'Active Recall
        </p>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
        {/* FILE TYPE FILTER TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'Tous', iconType: 'document', count: documents.length },
              { id: 'ia_generated', label: 'IA Gemini', iconType: 'sparkles', count: documents.filter((d) => d.isAiGenerated).length },
              { id: 'pdf', label: 'PDF', iconType: 'pdf', count: documents.filter((d) => d.fileCategory === 'pdf').length },
              { id: 'audio', label: 'Audio MP3', iconType: 'audio', count: documents.filter((d) => d.fileCategory === 'audio').length },
              { id: 'text', label: 'Fiches & Notes', iconType: 'text', count: documents.filter((d) => d.fileCategory === 'text' || !d.fileCategory).length },
            ] as const
          ).map((tab) => {
            const isSelected = activeTabFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#161922] dark:bg-white text-white dark:text-[#161922] font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <AnimatedIcon type={tab.iconType} className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* SUBJECT SELECTOR & SEARCH */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun document ne correspond à ce filtre.</p>
            <p className="text-xs text-slate-400">Importez un nouveau document ou générez-en un avec l'IA.</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const badge = getFileTypeBadge(doc);
            const isMenuOpen = openMenuDocId === doc.id;

            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4F94E] transition-all relative"
              >
                <div>
                  {/* TOP ROW: BADGE + 3-DOTS MENU */}
                  <div className="flex items-center justify-between mb-2.5 relative">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${badge.color}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    {/* 3-DOTS MENU TRIGGER */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuDocId(isMenuOpen ? null : doc.id)}
                        className="p-1.5 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Options du fichier"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* POPUP 3-DOTS DROPDOWN MENU */}
                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl p-1.5 space-y-1 text-xs font-bold"
                          >
                            {/* ACTION: AJOUTER À MES COURS (REQUIRED BY USER) */}
                            <button
                              onClick={() => {
                                setOpenMenuDocId(null);
                                setItemToAddToCourse({
                                  id: doc.id,
                                  title: doc.name,
                                  content: doc.content,
                                  fileCategory: doc.fileCategory,
                                  fileName: doc.name,
                                });
                              }}
                              className="w-full px-3 py-2 text-left text-slate-800 dark:text-white hover:bg-[#D4F94E] hover:text-[#161922] rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span>Ajouter à mes cours</span>
                            </button>

                            {/* ACTION: SYNTHÈSE IA */}
                            <button
                              onClick={() => {
                                setOpenMenuDocId(null);
                                handleAnalyzeWithAi(doc);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-800 dark:text-white hover:bg-[#D4F94E] hover:text-[#161922] rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Synthèse IA Gemini</span>
                            </button>

                            {/* ACTION: TÉLÉCHARGER */}
                            <button
                              onClick={() => {
                                setOpenMenuDocId(null);
                                triggerDownloadDoc(doc);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              <span>Télécharger</span>
                            </button>

                            {/* ACTION: METTRE À LA CORBEILLE (30 JOURS) */}
                            <button
                              onClick={() => {
                                setOpenMenuDocId(null);
                                onDeleteDocument(doc.id);
                              }}
                              className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Corbeille (30j)</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* DOCUMENT TITLE & SUBJECT BADGE */}
                  <h4 className="font-extrabold text-sm sm:text-base text-[#161922] dark:text-white leading-tight truncate mb-1">
                    {doc.name}
                  </h4>

                  <div className="flex items-center gap-2 my-2 flex-wrap">
                    {doc.subject && (
                      <span className="text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg">
                        {doc.subject}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {doc.uploadDate}
                    </span>
                  </div>

                  {/* AI SYNTHESIS SUMMARY PREVIEW */}
                  {doc.aiAnalysis && (
                    <div className="mt-2.5 p-3 bg-[#F5F6FA] dark:bg-zinc-800/80 rounded-2xl text-xs space-y-1 border border-slate-100 dark:border-zinc-700">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-[#D4F94E] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Synthèse IA
                      </span>
                      <p className="text-[#161922] dark:text-slate-200 text-xs font-medium line-clamp-3 leading-relaxed">
                        {doc.aiAnalysis.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* BOTTOM PRIMARY ACTIONS */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowReaderModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white rounded-xl font-black hover:bg-[#D4F94E] hover:text-[#161922] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Lire
                  </button>

                  <button
                    onClick={() =>
                      setItemToAddToCourse({
                        id: doc.id,
                        title: doc.name,
                        content: doc.content,
                        fileCategory: doc.fileCategory,
                        fileName: doc.name,
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-xl font-black transition-all cursor-pointer shadow-xs"
                    title="Classer dans une matière et un chapitre"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ajouter aux cours</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL: GÉNÉRATEUR DE COURS / FICHE IA GEMINI */}
      {showAiGenModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[#161922] dark:text-white font-black text-lg">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Générateur de Cours IA Gemini</span>
              </div>
              <button onClick={() => setShowAiGenModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Matière cible :
                </label>
                <select
                  value={aiGenSubject}
                  onChange={(e) => setAiGenSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Type de document à produire :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'text', label: 'Fiche Synthèse Complète' },
                    { id: 'formulas', label: 'Formulaire & Définitions' },
                    { id: 'exam_prep', label: 'Fiche Entraînement Concours' },
                    { id: 'audio_script', label: 'Script Podcast Audio' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAiGenType(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                        aiGenType === t.id
                          ? 'border-[#161922] dark:border-[#D4F94E] bg-[#D4F94E]/15 font-black'
                          : 'border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Thème ou consigne précise :
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Théorème de Bayes, probabilités conditionnelles et arbres avec 3 questions d'active recall..."
                  value={aiGenPrompt}
                  onChange={(e) => setAiGenPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setShowAiGenModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleGenerateAiStudyFile}
                disabled={!aiGenPrompt.trim() || isGeneratingAi}
                className="px-5 py-2 bg-[#D4F94E] text-[#161922] font-black rounded-xl text-xs disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isGeneratingAi ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Génération IA en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Générer le cours</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TO COURSE / CHAPTER */}
      {itemToAddToCourse && (
        <AddToCourseModal
          isOpen={!!itemToAddToCourse}
          onClose={() => setItemToAddToCourse(null)}
          itemToAdd={itemToAddToCourse}
          subjects={subjects}
          onConfirmAddToCourse={(subId, chapId, docItem, newChapTitle) => {
            if (onAddToCourse) {
              onAddToCourse(subId, chapId, docItem, newChapTitle);
            }
          }}
        />
      )}

      {/* MODAL: DOCUMENT READER */}
      {showReaderModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-lg text-[#161922] dark:text-white">{selectedDoc.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {selectedDoc.uploadDate} • {(selectedDoc.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setShowReaderModal(false)}
                className="p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI ANALYSIS SUMMARY IF PRESENT */}
            {selectedDoc.aiAnalysis && (
              <div className="p-4 bg-[#161922] text-white rounded-2xl space-y-2 text-xs border border-zinc-800">
                <h4 className="font-black text-[#D4F94E] flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4" /> Synthèse IA Gemini
                </h4>
                <p className="text-zinc-300 leading-relaxed font-medium">{selectedDoc.aiAnalysis.summary}</p>
              </div>
            )}

            {/* RAW CONTENT PREVIEW */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedDoc.content}
            </div>

            <div className="pt-2 flex justify-between items-center">
              {onGenerateDeckFromDoc && (
                <button
                  onClick={() => {
                    setShowReaderModal(false);
                    onGenerateDeckFromDoc(selectedDoc);
                  }}
                  className="px-4 py-2.5 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Générer Flashcards à partir du doc</span>
                </button>
              )}

              <button
                onClick={() => triggerDownloadDoc(selectedDoc)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 ml-auto flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY EXPLICIT AUTHORIZATION MODAL FOR FILE DOWNLOAD */}
      {showDownloadAuthModal && pendingDownloadDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#65A30D] dark:text-[#D4F94E]">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <h3 className="font-extrabold text-lg text-[#161922] dark:text-white">Autorisation de Téléchargement</h3>
                <p className="text-xs text-slate-500 font-medium">Export local sécurisé</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-[#F5F6FA] dark:bg-zinc-800 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 font-medium">
              Voulez-vous télécharger le document local <strong>"{pendingDownloadDoc.name}"</strong> sur votre appareil ?
            </p>

            <label className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={userConfirmedAuth}
                onChange={(e) => setUserConfirmedAuth(e.target.checked)}
                className="w-4 h-4 rounded text-[#161922] focus:ring-[#D4F94E]"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                J'autorise le téléchargement de ce fichier.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDownloadAuthModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={executeAuthorizedDownload}
                disabled={!userConfirmedAuth}
                className="px-5 py-2 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] rounded-xl text-xs font-black disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                Confirmer & Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
