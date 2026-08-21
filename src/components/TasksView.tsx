import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority, TaskStatus } from '../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  CheckCircle2,
  Play,
  Check,
  Zap,
  ListTodo,
  Layers,
  Sparkles,
} from 'lucide-react';
import { XP_RATES } from '../utils/gamification';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onAwardXP?: (amount: number, reason: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartPomodoro,
  onAwardXP,
}) => {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTabStatus, setActiveTabStatus] = useState<'all' | 'in_progress' | 'upcoming' | 'completed'>('all');

  // Expanded subtasks state
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Add Task Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathématiques');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newSubtasksText, setNewSubtasksText] = useState('');

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Real-Time Search & Multi-Criteria Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm.trim() ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subtasks.some((st) => st.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || task.subject === selectedSubject;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    // Status matching for tab
    const matchesTab =
      activeTabStatus === 'all' ||
      (activeTabStatus === 'in_progress' && task.status === 'in_progress') ||
      (activeTabStatus === 'upcoming' && task.status === 'todo') ||
      (activeTabStatus === 'completed' && task.status === 'completed');

    return matchesSearch && matchesSubject && matchesPriority && matchesTab;
  });

  // Categorized counts
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const upcomingTasks = tasks.filter((t) => t.status === 'todo');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSelectedPriority('all');
    setActiveTabStatus('all');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subtasksList = newSubtasksText
      .split('\n')
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => ({ id: `st-${Date.now()}-${idx}`, title: s.trim(), completed: false }));

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      estimatedMinutes: newDuration,
      priority: newPriority,
      status: newStatus,
      createdAt: new Date().toISOString(),
      subtasks: subtasksList,
    };

    onAddTask(newTask);
    setShowAddModal(false);
    setNewTitle('');
    setNewSubtasksText('');
    setNewDuration(30);
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updatedSubtasks = task.subtasks.map((st) => ({
      ...st,
      completed: nextStatus === 'completed',
    }));

    if (nextStatus === 'completed' && onAwardXP) {
      onAwardXP(XP_RATES.TASK_COMPLETED, `Devoir / Tâche terminée : "${task.title}"`);
    }

    onUpdateTask({
      ...task,
      status: nextStatus,
      subtasks: updatedSubtasks,
    });
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updatedSubtasks = task.subtasks.map((st) => ({
      ...st,
      completed: newStatus === 'completed',
    }));

    if (newStatus === 'completed' && task.status !== 'completed' && onAwardXP) {
      onAwardXP(XP_RATES.TASK_COMPLETED, `Devoir terminé : "${task.title}"`);
    }

    onUpdateTask({
      ...task,
      status: newStatus,
      subtasks: updatedSubtasks,
    });
  };

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const targetSubtask = task.subtasks.find((st) => st.id === subtaskId);
    const willBeCompleted = targetSubtask ? !targetSubtask.completed : false;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allCompleted = updatedSubtasks.every((st) => st.completed);
    const someCompleted = updatedSubtasks.some((st) => st.completed);

    if (willBeCompleted && onAwardXP) {
      onAwardXP(XP_RATES.SUBTASK_COMPLETED, `Sous-étape validée : "${targetSubtask?.title || 'Étape'}"`);
    }

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      status: allCompleted ? 'completed' : someCompleted ? 'in_progress' : 'todo',
    });
  };

  // Helper to render task card
  const renderTaskCard = (task: Task, idx: number) => {
    const isExpanded = !!expandedTaskIds[task.id];
    const completedSubtasksCount = task.subtasks.filter((st) => st.completed).length;
    const subtaskProgress =
      task.subtasks.length > 0 ? Math.round((completedSubtasksCount / task.subtasks.length) * 100) : 0;

    const isDone = task.status === 'completed';
    const isInProgress = task.status === 'in_progress';

    // XP calculation: 10 XP per 5 min of focus time
    const potentialXP = Math.floor(task.estimatedMinutes / 5) * 10;

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
        transition={{
          duration: 0.25,
          delay: Math.min(idx * 0.03, 0.25),
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={`bg-white dark:bg-zinc-900 border rounded-3xl p-4 sm:p-5 shadow-xs transition-all ${
          isDone
            ? 'border-[#D4F94E] dark:border-zinc-800 bg-[#EFFDE2]/30 dark:bg-zinc-950/40 opacity-85'
            : isInProgress
            ? 'border-purple-200 dark:border-purple-900/40 shadow-sm'
            : 'border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => handleToggleTaskStatus(task)}
              className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer mt-0.5 sm:mt-0 ${
                isDone
                  ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                  : 'border-2 border-slate-300 dark:border-zinc-700 hover:border-[#161922] dark:hover:border-white'
              }`}
            >
              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status selector badge */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none outline-none cursor-pointer ${
                    isDone
                      ? 'bg-[#EFFDE2] text-[#65A30D]'
                      : isInProgress
                      ? 'bg-[#F3F0FF] text-[#8B5CF6]'
                      : 'bg-[#FFF1EB] text-[#FF7A59]'
                  }`}
                >
                  <option value="in_progress">In progress (En cours)</option>
                  <option value="todo">Upcoming (À venir)</option>
                  <option value="completed">Completed (Terminé)</option>
                </select>

                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                  {task.subject}
                </span>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-400'
                  }`}
                >
                  {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>

                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.estimatedMinutes} min
                </span>
              </div>

              <h4
                className={`font-extrabold text-sm text-[#161922] dark:text-white truncate ${
                  isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}
              >
                {task.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* FOCUS BUTTON WITH DURATION & AUTO PROGRAMMING */}
            {onStartPomodoro && !isDone && (
              <button
                type="button"
                onClick={() => onStartPomodoro(task)}
                title={`Lancer un bloc Focus de ${task.estimatedMinutes} minutes (+${potentialXP} XP)`}
                className="px-3.5 py-1.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Focus ({task.estimatedMinutes}m)</span>
              </button>
            )}

            {task.subtasks.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(task.id)}
                className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
                title="Afficher les sous-tâches"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Supprimer la tâche"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtasks Progress Bar & Checklist */}
        {task.subtasks.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Sous-tâches & Étapes ({completedSubtasksCount}/{task.subtasks.length})</span>
              <span className="font-black text-[#161922] dark:text-white">{subtaskProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4F94E] rounded-full transition-all"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-1.5 pt-2 pl-3 border-l-2 border-[#D4F94E] overflow-hidden"
                >
                  {task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtask(task, st.id)}
                      className="cursor-pointer flex items-center gap-2.5 text-xs text-[#161922] dark:text-slate-200 font-semibold hover:opacity-80"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded accent-[#161922] cursor-pointer"
                      />
                      <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Assignments & Gestion des Devoirs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Organisation par statut (In Progress, Upcoming, Completed) & programmation automatique du Focus
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] text-xs font-black rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Tâche / Devoir</span>
        </button>
      </div>

      {/* CATEGORY STATUS TABS (IN PROGRESS, UPCOMING, COMPLETED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTabStatus('all')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTabStatus === 'all'
              ? 'bg-[#161922] text-white dark:bg-white dark:text-[#161922] shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Toutes les tâches</span>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-700 text-[#161922] dark:text-white">
            {tasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabStatus('in_progress')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTabStatus === 'in_progress'
              ? 'bg-[#8B5CF6] text-white shadow-xs'
              : 'text-[#8B5CF6] bg-[#F3F0FF] dark:bg-purple-950/40 hover:opacity-90'
          }`}
        >
          <span>🚀 In Progress (En cours)</span>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white text-[#8B5CF6]">
            {inProgressTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabStatus('upcoming')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTabStatus === 'upcoming'
              ? 'bg-[#FF7A59] text-white shadow-xs'
              : 'text-[#FF7A59] bg-[#FFF1EB] dark:bg-orange-950/40 hover:opacity-90'
          }`}
        >
          <span>⏳ Upcoming (À venir)</span>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white text-[#FF7A59]">
            {upcomingTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabStatus('completed')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTabStatus === 'completed'
              ? 'bg-[#65A30D] text-white shadow-xs'
              : 'text-[#65A30D] bg-[#EFFDE2] dark:bg-emerald-950/40 hover:opacity-90'
          }`}
        >
          <span>✅ Completed (Terminées)</span>
          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white text-[#65A30D]">
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* REAL-TIME SEARCH & FILTER BAR */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-3xl shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un devoir, mot-clé ou matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-[#161922] dark:text-white font-semibold outline-none focus:ring-2 focus:ring-[#161922] dark:focus:ring-white placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MULTI-CRITERIA DROPDOWNS */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 font-bold mr-1">
              <Filter className="w-3.5 h-3.5" /> Matière / Priorité :
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-[#161922] dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Toutes les matières</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique-Chimie">Physique-Chimie</option>
              <option value="SVT & Biologie">SVT & Biologie</option>
              <option value="Informatique">Informatique</option>
              <option value="Droit">Droit</option>
              <option value="Philosophie">Philosophie</option>
              <option value="Langues (Anglais)">Langues (Anglais)</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-[#161922] dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          {(searchTerm || selectedSubject !== 'all' || selectedPriority !== 'all' || activeTabStatus !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-rose-500 hover:underline ml-auto cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* TASKS LIST OR STRUCTURED GROUPS */}
      {activeTabStatus === 'all' ? (
        <div className="space-y-6">
          {/* GROUP 1: IN PROGRESS */}
          {inProgressTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#8B5CF6]">
                  In Progress / En cours ({inProgressTasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task, idx) => renderTaskCard(task, idx))}
              </div>
            </div>
          )}

          {/* GROUP 2: UPCOMING */}
          {upcomingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A59]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF7A59]">
                  Upcoming / À venir ({upcomingTasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map((task, idx) => renderTaskCard(task, idx))}
              </div>
            </div>
          )}

          {/* GROUP 3: COMPLETED */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#65A30D]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#65A30D]">
                  Completed / Terminées ({completedTasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task, idx) => renderTaskCard(task, idx))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-10 text-center text-slate-400 space-y-2">
              <CheckSquare className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="font-extrabold text-sm text-[#161922] dark:text-white">Aucun devoir enregistré</p>
              <p className="text-xs text-slate-400">Cliquez sur « Nouvelle Tâche » pour démarrer.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-10 text-center text-slate-400 space-y-2">
              <CheckSquare className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="font-extrabold text-sm text-[#161922] dark:text-white">Aucune tâche trouvée dans cette section</p>
              <p className="text-xs text-slate-400">Modifiez vos filtres ou ajoutez une nouvelle tâche.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, idx) => renderTaskCard(task, idx))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-[#161922] dark:text-white">Nouvelle Tâche / Assignment</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Titre de la Tâche</label>
                <input
                  type="text"
                  placeholder="ex: Réviser le TD d'Algorithmique et faire les exercices..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold outline-none text-xs text-[#161922] dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Matière</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 font-bold outline-none text-[#161922] dark:text-white"
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
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Durée Focus (min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 font-bold outline-none text-[#161922] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Statut Initial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 font-bold outline-none text-[#161922] dark:text-white"
                  >
                    <option value="todo">Upcoming (À venir)</option>
                    <option value="in_progress">In Progress (En cours)</option>
                    <option value="completed">Completed (Terminé)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 font-bold outline-none text-[#161922] dark:text-white"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sous-étapes (1 par ligne)
                </label>
                <textarea
                  rows={3}
                  placeholder="Relire le cours&#10;Faire l'exercice 1 et 2&#10;Vérifier les formules"
                  value={newSubtasksText}
                  onChange={(e) => setNewSubtasksText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-2 font-bold outline-none text-xs text-[#161922] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-xl cursor-pointer shadow-xs"
                >
                  Créer la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
