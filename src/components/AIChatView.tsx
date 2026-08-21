import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task, StudyDocument } from '../types';
import { Bot, Send, Sparkles, User, Paperclip, FileText, X, GraduationCap, CheckCircle2, RotateCw, Lightbulb, HelpCircle, Target } from 'lucide-react';

interface AIChatViewProps {
  tasks: Task[];
  documents: StudyDocument[];
  reviewedCardsCount: number;
}

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  tasks,
  documents,
  reviewedCardsCount,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "Bonjour ! Je suis **ChronoStudy AI**, votre assistant d'études global et tuteur pédagogique.\n\nJe peux vous expliquer des concepts complexes (Maths, Physique, Droit, Info, Médecine...), résoudre des exercices pas à pas, créer des plans de révision et analyser vos documents de cours. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const textContent = (event.target?.result as string) || '';
      setAttachedFile({
        name: file.name,
        type: file.type || 'document',
        size: file.size,
        content: textContent.slice(0, 8000),
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    let text = textToSend || inputMsg;
    if ((!text.trim() && !attachedFile) || isLoading) return;

    if (attachedFile) {
      text += `\n\n[📎 Fichier joint: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]\nContenu du document :\n${attachedFile.content.slice(0, 3000)}`;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const activeTaskTitles = tasks.filter((t) => t.status !== 'completed').map((t) => t.title);
      const documentNames = documents.map((d) => d.name);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          userContext: {
            subjects: ['Mathématiques', 'Physique-Chimie', 'Informatique', 'Droit', 'Médecine & SVT'],
            activeTaskTitles,
            cardsReviewed: reviewedCardsCount,
            documentNames,
          },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const aiMessage: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Error in chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] font-sans">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#161922] dark:text-white tracking-tight flex items-center gap-2">
              <span>ChronoStudy AI Tutor</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#161922] text-[#D4F94E] px-2 py-0.5 rounded-full">
                Active Recall Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Assistant pédagogique 24/7 • Explications pas-à-pas, résolution d'exercices & préparation aux examens
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4F94E] animate-pulse" />
          <span>Prêt à aider</span>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 bg-white dark:bg-[#161922] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col overflow-hidden">
        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-black ${
                  msg.sender === 'user'
                    ? 'bg-[#161922] text-white dark:bg-white dark:text-[#161922]'
                    : 'bg-[#D4F94E] text-[#161922]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-3xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#161922] text-white dark:bg-zinc-800 dark:text-white rounded-tr-none font-medium'
                    : 'bg-[#F5F6FA] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[#161922] dark:text-zinc-100 shadow-xs rounded-tl-none font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-2 text-right font-bold ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#EFFDE2] dark:bg-zinc-900 border border-[#D4F94E] dark:border-zinc-800 p-3 rounded-2xl text-xs text-[#161922] dark:text-slate-300 font-bold flex items-center gap-2">
                <span>ChronoStudy AI formule votre explication...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* QUICK SUGGESTIONS CHIPS (In soft pastel tints) */}
        <div className="py-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => handleSendMessage("Explique-moi les équations de Maxwell en Physique de façon claire et intuitive.")}
            className="px-3.5 py-1.5 bg-[#FFF1EB] text-[#FF7A59] hover:opacity-90 rounded-full shrink-0 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Explication de cours</span>
          </button>
          <button
            onClick={() => handleSendMessage("Génère un mini-quiz de 3 questions sur les structures de données (arbres, graphes, tables de hachage).")}
            className="px-3.5 py-1.5 bg-[#EFFDE2] text-[#65A30D] hover:opacity-90 rounded-full shrink-0 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Mini-quiz Active Recall</span>
          </button>
          <button
            onClick={() => handleSendMessage("Donne-moi une méthodologie optimale de répétition espacée pour réviser un examen dans 10 jours.")}
            className="px-3.5 py-1.5 bg-[#F3F0FF] text-[#8B5CF6] hover:opacity-90 rounded-full shrink-0 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Plan de révision</span>
          </button>
        </div>

        {/* ATTACHED FILE PREVIEW */}
        {attachedFile && (
          <div className="mb-2 p-2.5 bg-[#EFFDE2] dark:bg-zinc-900 border border-[#D4F94E] rounded-2xl flex items-center justify-between text-xs font-bold text-[#161922] dark:text-[#D4F94E]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#65A30D]" />
              <span>
                Fichier joint : <strong>{attachedFile.name}</strong> ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 shrink-0"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.json,.pdf,.txt,.md,.csv"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Joindre un cours, document ou exercice (JPG, PNG, PDF, TXT...)"
            className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-2xl transition-all font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline text-xs">Joindre</span>
          </button>

          <input
            type="text"
            placeholder="Posez une question, collez un problème ou demandez une explication..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs text-[#161922] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={(!inputMsg.trim() && !attachedFile) || isLoading}
            className="p-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] disabled:opacity-40 rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-xs shrink-0 flex items-center justify-center font-black cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
