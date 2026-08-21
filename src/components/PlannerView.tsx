import React, { useState } from 'react';
import { ScheduleSession } from '../types';
import { Calendar, Plus, Sparkles, Download, Printer, CheckCircle2, X, Clock, Trash2, Check, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface PlannerViewProps {
  schedule: ScheduleSession[];
  onAddSession: (session: ScheduleSession) => void;
  onUpdateSession: (session: ScheduleSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onReplaceSchedule: (sessions: ScheduleSession[]) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  schedule,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
  onReplaceSchedule,
}) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = ['Matin', 'Après-midi', 'Soir'];

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAutoPlanModal, setShowAutoPlanModal] = useState<boolean>(false);

  // New Session Form
  const [newDay, setNewDay] = useState<any>('Lundi');
  const [newSlot, setNewSlot] = useState<any>('Matin');
  const [newSubject, setNewSubject] = useState('Mathématiques');
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState<number>(90);

  // Auto Plan Form
  const [targetHours, setTargetHours] = useState<number>(4);
  const [priorityGoals, setPriorityGoals] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  const totalMinutesPlanned = schedule.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHoursPlanned = (totalMinutesPlanned / 60).toFixed(1);

  const completedSessions = schedule.filter((s) => s.completed).length;
  const completionRate = schedule.length > 0 ? Math.round((completedSessions / schedule.length) * 100) : 0;

  // Handle Manual Add Session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newSession: ScheduleSession = {
      id: `sch-${Date.now()}`,
      day: newDay,
      timeSlot: newSlot,
      subject: newSubject,
      topic: newTopic,
      durationMinutes: newDuration,
      completed: false,
      color: '#D4F94E',
    };

    onAddSession(newSession);
    setShowAddModal(false);
    setNewTopic('');
  };

  // ChronoAI Auto-Plan Generator
  const handleGenerateAutoPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPlan(true);

    try {
      const res = await fetch('/api/gemini/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: ['Mathématiques', 'Physique-Chimie', 'Informatique', 'Droit', 'Médecine & SVT'],
          targetDailyHours: targetHours,
          priorityGoals,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const generatedSessions: ScheduleSession[] = data.map((item: any, index: number) => ({
          id: `sch-ai-${Date.now()}-${index}`,
          day: item.day || 'Lundi',
          timeSlot: item.timeSlot || 'Matin',
          subject: item.subject || 'Mathématiques',
          topic: item.topic || 'Révisions générales',
          durationMinutes: item.durationMinutes || 90,
          completed: false,
          color: '#D4F94E',
        }));

        onReplaceSchedule(generatedSessions);
        setShowAutoPlanModal(false);
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {
      console.error('Error generating auto-plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Export PDF using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('ChronoStudy - Emploi du Temps Hebdomadaire', 14, 20);

    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} • Total planifié : ${totalHoursPlanned} hrs • Taux de complétion : ${completionRate}%`, 14, 28);

    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    let yPosition = 42;

    days.forEach((day) => {
      const daySessions = schedule.filter((s) => s.day === day);
      if (daySessions.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(day, 14, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        daySessions.forEach((s) => {
          const status = s.completed ? '[Fait]' : '[En attente]';
          const line = `  • ${s.timeSlot} | ${s.subject} - ${s.topic} (${s.durationMinutes} min) ${status}`;
          doc.text(line, 14, yPosition);
          yPosition += 5;

          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });

        yPosition += 4;
      }
    });

    doc.save(`Planning_ChronoStudy_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto font-sans px-2 sm:px-4">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#161922] dark:text-white tracking-tight break-words whitespace-normal">
                Emploi du Temps & Planning d'Études
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold break-words whitespace-normal mt-0.5">
                Organisation hebdomadaire assistée, gestion intelligente des créneaux et export PDF
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAutoPlanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161922] text-white dark:bg-white dark:text-[#161922] rounded-2xl text-xs font-black shadow-xs hover:opacity-90 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4F94E] dark:text-[#161922]" />
            <span>Auto-Planification</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl text-xs font-black shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Séance</span>
          </button>
        </div>
      </div>

      {/* STATS & DAY FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
          <div>
            <span className="text-slate-400 font-semibold">Heures Planifiées :</span>
            <span className="text-[#161922] dark:text-white ml-1.5 font-black">{totalHoursPlanned} hrs</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700" />
          <div>
            <span className="text-slate-400 font-semibold">Taux de Réalisation :</span>
            <span className="text-[#65A30D] dark:text-[#D4F94E] ml-1.5 font-black bg-[#EFFDE2] dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* DAY SELECTOR FILTER */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-[#161922] text-white dark:bg-white dark:text-[#161922] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Toute la semaine
          </button>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDayFilter(d)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedDayFilter === d
                  ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* WEEKLY MATRIX GRID - LARGER, SPACIOUS, WRAPPING TEXT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {days
          .filter((d) => selectedDayFilter === 'all' || selectedDayFilter === d)
          .map((day) => {
            const daySessions = schedule.filter((s) => s.day === day);
            return (
              <div
                key={day}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col space-y-3.5 min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-[#161922] dark:text-white text-sm">{day}</h3>
                  <span className="text-[11px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                    {daySessions.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {daySessions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">Repos / Libre</div>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                          session.completed
                            ? 'bg-[#EFFDE2] dark:bg-zinc-950 border-[#D4F94E] dark:border-zinc-700 text-[#161922] dark:text-slate-200'
                            : 'bg-slate-50/90 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 text-[#161922] dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                            {session.timeSlot}
                          </span>

                          <button
                            onClick={() => onDeleteSession(session.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            title="Supprimer la séance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subject & Topic with full line wrap */}
                        <div className="space-y-1">
                          <p className="font-extrabold text-xs sm:text-sm text-[#161922] dark:text-white break-words whitespace-normal leading-snug">
                            {session.subject}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words whitespace-normal">
                            {session.topic}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">{session.durationMinutes} min</span>
                          <button
                            onClick={() => onUpdateSession({ ...session, completed: !session.completed })}
                            className={`px-3 py-1 rounded-xl text-xs font-black transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                              session.completed
                                ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                                : 'bg-white dark:bg-zinc-700 text-[#161922] dark:text-white hover:bg-slate-100'
                            }`}
                          >
                            {session.completed ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Fait</span>
                              </>
                            ) : (
                              <span>Valider</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* CHRONOAI AUTO-PLAN MODAL */}
      {showAutoPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#161922] dark:text-white">Générateur ChronoAI Auto-Plan</h3>
              </div>
              <button onClick={() => setShowAutoPlanModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAutoPlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Volume Horaire Visé (Heures par jour)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={targetHours}
                  onChange={(e) => setTargetHours(parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Objectifs et Examens Prochains</label>
                <textarea
                  placeholder="ex: Préparer le CC de Mathématiques du jeudi et réviser le TP Physique..."
                  value={priorityGoals}
                  onChange={(e) => setPriorityGoals(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 h-24 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAutoPlanModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingPlan}
                  className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isGeneratingPlan ? 'Génération...' : 'Injecter le Planning IA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL SESSION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#161922] dark:text-white">Ajouter une Séance d'Étude</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Jour</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold outline-none"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Créneau</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold outline-none"
                  >
                    {timeSlots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Matière</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold outline-none"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT & Biologie">SVT & Biologie</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Droit">Droit</option>
                  <option value="Philosophie">Philosophie</option>
                  <option value="Langues (Anglais)">Langues (Anglais)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Thème ou Exercices</label>
                <input
                  type="text"
                  placeholder="ex: TD Annales Intégrales & Séries Fourier..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Durée (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={newDuration}
                  onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-semibold outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-xl font-black cursor-pointer shadow-xs">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
