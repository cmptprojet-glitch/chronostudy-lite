import React, { useState } from 'react';
import {
  StudyGroup,
  GroupMember,
  SharedGroupDeck,
  GroupActivity,
  FlashcardDeck,
  UserSettings,
} from '../types';
import {
  Users,
  Plus,
  Key,
  Share2,
  Trophy,
  Flame,
  BookOpen,
  MessageSquare,
  Sparkles,
  Search,
  Check,
  Copy,
  Download,
  Heart,
  Crown,
  Shield,
  Clock,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Lock,
  Globe,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmoothCarousel } from './SmoothCarousel';

interface StudyGroupsViewProps {
  groups: StudyGroup[];
  userDecks: FlashcardDeck[];
  userSettings?: UserSettings;
  onCreateGroup: (newGroup: StudyGroup) => void;
  onJoinGroup: (groupCode: string) => boolean;
  onShareDeckToGroup: (groupId: string, deckId: string) => void;
  onImportDeck: (importedDeck: FlashcardDeck) => void;
  onPostMessage: (groupId: string, text: string) => void;
}

export const StudyGroupsView: React.FC<StudyGroupsViewProps> = ({
  groups,
  userDecks,
  userSettings,
  onCreateGroup,
  onJoinGroup,
  onShareDeckToGroup,
  onImportDeck,
  onPostMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'my_groups' | 'explore' | 'leaderboard'>('my_groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups.find((g) => g.isUserMember)?.id || groups[0]?.id || ''
  );
  const [subTab, setSubTab] = useState<'leaderboard' | 'decks' | 'chat' | 'members'>('leaderboard');

  // Search & Filter state for Groups
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Global Leaderboard state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalCategory, setGlobalCategory] = useState<string>('all');
  const [globalSortBy, setGlobalSortBy] = useState<'cards' | 'hours' | 'streak'>('cards');
  const [cheeredMembers, setCheeredMembers] = useState<Record<string, boolean>>({});
  const [isGlobalLeaderboardExpanded, setIsGlobalLeaderboardExpanded] = useState(false);
  const [isGroupLeaderboardExpanded, setIsGroupLeaderboardExpanded] = useState(false);

  // Global Leaderboard Member Aggregation
  const globalLeaderboardMembers = React.useMemo(() => {
    const memberMap = new Map<string, {
      id: string;
      name: string;
      avatar: string;
      role: 'leader' | 'co-leader' | 'member';
      studyMinutesThisWeek: number;
      cardsMastered: number;
      currentStreak: number;
      status: 'online' | 'studying' | 'offline';
      groupsCount: number;
      primaryGroupName: string;
      primaryGroupCategory: string;
      primaryGroupEmoji: string;
      isCurrentUser: boolean;
    }>();

    groups.forEach((group) => {
      group.members.forEach((member) => {
        const cleanName = member.name.replace(' (Vous)', '').trim();
        const isUser = member.id === 'm-user' || member.name.includes('(Vous)');
        const key = isUser ? 'm-user' : cleanName.toLowerCase();

        if (memberMap.has(key)) {
          const existing = memberMap.get(key)!;
          existing.cardsMastered = Math.max(existing.cardsMastered, member.cardsMastered);
          existing.studyMinutesThisWeek = Math.max(existing.studyMinutesThisWeek, member.studyMinutesThisWeek);
          existing.currentStreak = Math.max(existing.currentStreak, member.currentStreak);
          existing.groupsCount += 1;
        } else {
          memberMap.set(key, {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role,
            studyMinutesThisWeek: member.studyMinutesThisWeek,
            cardsMastered: member.cardsMastered,
            currentStreak: member.currentStreak,
            status: member.status,
            groupsCount: 1,
            primaryGroupName: group.name,
            primaryGroupCategory: group.category,
            primaryGroupEmoji: group.avatarEmoji,
            isCurrentUser: isUser,
          });
        }
      });
    });

    return Array.from(memberMap.values());
  }, [groups]);

  // Filtered & Sorted Global Members
  const sortedGlobalMembers = React.useMemo(() => {
    return [...globalLeaderboardMembers]
      .filter((m) => {
        const matchSearch =
          m.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          m.primaryGroupName.toLowerCase().includes(globalSearchQuery.toLowerCase());
        const matchCat = globalCategory === 'all' || m.primaryGroupCategory === globalCategory;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (globalSortBy === 'cards') return b.cardsMastered - a.cardsMastered;
        if (globalSortBy === 'hours') return b.studyMinutesThisWeek - a.studyMinutesThisWeek;
        if (globalSortBy === 'streak') return b.currentStreak - a.currentStreak;
        return b.cardsMastered - a.cardsMastered;
      });
  }, [globalLeaderboardMembers, globalSearchQuery, globalCategory, globalSortBy]);

  // Summary Metrics for Leaderboard
  const totalCardsMasteredCommunity = React.useMemo(() => {
    return globalLeaderboardMembers.reduce((sum, m) => sum + m.cardsMastered, 0);
  }, [globalLeaderboardMembers]);

  const currentUserGlobalRankIndex = React.useMemo(() => {
    return sortedGlobalMembers.findIndex((m) => m.isCurrentUser);
  }, [sortedGlobalMembers]);

  const topStudent = sortedGlobalMembers[0];

  const handleCheerMember = (memberId: string) => {
    setCheeredMembers((prev) => ({ ...prev, [memberId]: true }));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isShareDeckModalOpen, setIsShareDeckModalOpen] = useState(false);
  const [previewDeckModal, setPreviewDeckModal] = useState<SharedGroupDeck | null>(null);

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Médecine & Santé');
  const [newGroupEmoji, setNewGroupEmoji] = useState('📚');
  const [newGroupGoalHours, setNewGroupGoalHours] = useState(20);
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);

  // Join code state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  // Share deck state
  const [deckToShareId, setDeckToShareId] = useState<string>(userDecks[0]?.id || '');

  // Chat message state
  const [chatInputText, setChatInputText] = useState('');
  const [copiedCodeMessage, setCopiedCodeMessage] = useState(false);

  // Filtered groups
  const myGroups = groups.filter((g) => g.isUserMember);
  const exploreGroups = groups.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeMessage(true);
    setTimeout(() => setCopiedCodeMessage(false), 2000);
  };

  // Submit Create Group
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      description: newGroupDesc || 'Groupe de révision communautaire.',
      category: newGroupCategory,
      code: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
      isPrivate: newGroupIsPrivate,
      avatarEmoji: newGroupEmoji,
      color: '#D4F94E',
      weeklyGoalHours: newGroupGoalHours,
      announcement: 'Bienvenue dans notre nouveau groupe de révision !',
      isUserMember: true,
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        {
          id: 'm-user',
          name: `${userSettings?.profile.name || 'Julien Dupont'} (Vous)`,
          avatar: userSettings?.profile.avatarInitials || 'JD',
          role: 'leader',
          studyMinutesThisWeek: 420,
          cardsMastered: 85,
          currentStreak: 12,
          status: 'online',
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ],
      sharedDecks: [],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          userName: userSettings?.profile.name || 'Julien Dupont',
          userAvatar: userSettings?.profile.avatarInitials || 'JD',
          type: 'joined',
          content: 'a créé le groupe d\'études.',
          timestamp: 'À l\'instant',
        },
      ],
    };

    onCreateGroup(newGroup);
    setSelectedGroupId(newGroup.id);
    setIsCreateModalOpen(false);
    setNewGroupName('');
    setNewGroupDesc('');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  // Submit Join Code
  const handleJoinCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCodeInput.trim()) return;

    const success = onJoinGroup(joinCodeInput.trim().toUpperCase());
    if (success) {
      const foundGroup = groups.find((g) => g.code.toUpperCase() === joinCodeInput.trim().toUpperCase());
      if (foundGroup) {
        setSelectedGroupId(foundGroup.id);
      }
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setJoinError('Code invalide ou vous êtes déjà membre de ce groupe.');
    }
  };

  // Share deck handler
  const handleShareDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckToShareId || !selectedGroup) return;

    onShareDeckToGroup(selectedGroup.id, deckToShareId);
    setIsShareDeckModalOpen(false);
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
  };

  // Import shared deck
  const handleImportSharedDeck = (sharedDeck: SharedGroupDeck) => {
    const imported: FlashcardDeck = {
      id: `deck-imported-${Date.now()}`,
      title: `${sharedDeck.title} (importé)`,
      subject: sharedDeck.subject,
      description: sharedDeck.description,
      color: sharedDeck.color || '#D4F94E',
      createdAt: new Date().toISOString(),
      cards: sharedDeck.cards.map((c, i) => ({
        id: `c-imp-${Date.now()}-${i}`,
        question: c.question,
        answer: c.answer,
        intervalDays: 1,
        easinessFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 0,
      })),
    };

    onImportDeck(imported);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  // Post Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedGroup) return;

    onPostMessage(selectedGroup.id, chatInputText.trim());
    setChatInputText('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans select-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#161922] dark:text-white tracking-tight">
                Groupes d'Études & Communauté
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Travaillez en équipe, partagez vos decks de flashcards et comparez votre progression d'apprentissage
              </p>
            </div>
          </div>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#161922] dark:text-white font-bold rounded-2xl text-xs transition-all cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E]" /> Rejoindre par Code
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#161922]" /> Créer un Groupe
          </button>
        </div>
      </div>

      {/* TOP TABS: MY GROUPS VS EXPLORE VS GLOBAL LEADERBOARD */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('my_groups')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'my_groups'
                ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Mes Groupes
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-[#161922] text-white font-extrabold">
              {myGroups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Explorer & Annuaire
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-[#161922] text-white font-extrabold">
              {groups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#161922]" /> Classement Global Active Recall
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-[#161922] text-white font-extrabold">
              {globalLeaderboardMembers.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: MY GROUPS MAIN WORKSPACE */}
      {activeTab === 'my_groups' && (
        <>
          {myGroups.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4 shadow-xs">
              <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-zinc-700" />
              <div>
                <h3 className="text-xl font-extrabold text-[#161922] dark:text-white">Vous n'avez rejoint aucun groupe d'études</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto font-medium">
                  Rejoignez un groupe existant avec un code d'invitation ou explorez les groupes publics de la communauté pour commencer à réviser ensemble !
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white font-bold rounded-2xl text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Entrer un code d'invitation
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2.5 bg-[#D4F94E] text-[#161922] font-black rounded-2xl text-xs hover:bg-[#CBF33B] cursor-pointer"
                >
                  Parcourir l'annuaire
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* LEFT SIDEBAR: MY GROUPS SELECTOR */}
              <div className="lg:col-span-1 space-y-3">
                <p className="text-xs font-black uppercase text-[#65A30D] dark:text-[#D4F94E] tracking-wider px-1">
                  Vos Groupes Actifs
                </p>
                <div className="space-y-2">
                  {myGroups.map((group) => {
                    const isSelected = group.id === selectedGroupId;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFFDE2] dark:bg-zinc-800 border-[#D4F94E] shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-[#161922] dark:text-white border-slate-100 dark:border-zinc-800 hover:border-[#D4F94E]'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-[#F5F6FA] dark:bg-zinc-800 rounded-xl shrink-0">
                          {group.avatarEmoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm truncate text-[#161922] dark:text-white">{group.name}</h4>
                          <p className="text-[11px] font-semibold truncate text-slate-500 dark:text-slate-400">
                            {group.members.length} membres • {group.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CREATION QUICK LINK */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full p-3 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#D4F94E] text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Créer un nouveau groupe
                </button>
              </div>

              {/* RIGHT MAIN WORKSPACE: SELECTED GROUP DETAILS */}
              {selectedGroup && (
                <div className="lg:col-span-3 space-y-6">
                  {/* GROUP BANNER */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl p-3 bg-[#F5F6FA] dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                          {selectedGroup.avatarEmoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-black text-[#161922] dark:text-white">
                              {selectedGroup.name}
                            </h3>
                            {selectedGroup.isPrivate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> Privé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] px-2.5 py-0.5 rounded-full">
                                <Globe className="w-3 h-3" /> Public
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {selectedGroup.description}
                          </p>
                        </div>
                      </div>

                      {/* GROUP INVITE CODE PILL */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyCode(selectedGroup.code)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#161922] dark:text-white font-extrabold rounded-xl text-xs transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
                          title="Copier le code d'invitation"
                        >
                          <Key className="w-3.5 h-3.5 text-[#65A30D] dark:text-[#D4F94E]" />
                          <span>Code : {selectedGroup.code}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                        {copiedCodeMessage && (
                          <span className="text-[10px] font-extrabold text-[#65A30D] dark:text-[#D4F94E] animate-fade-in">
                            Copié !
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ANNOUNCEMENT BANNER */}
                    {selectedGroup.announcement && (
                      <div className="bg-[#EFFDE2] dark:bg-zinc-800 border border-[#D4F94E] p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-[#161922] dark:text-white">
                        <Zap className="w-4 h-4 text-[#65A30D] dark:text-[#D4F94E] shrink-0" />
                        <span className="flex-1">{selectedGroup.announcement}</span>
                      </div>
                    )}

                    {/* SUB-TAB NAVIGATOR */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                      {[
                        { id: 'leaderboard', label: 'Classement & Progrès', icon: Trophy },
                        { id: 'decks', label: 'Flashcards Partagées', icon: BookOpen },
                        { id: 'chat', label: 'Discussion & Feed', icon: MessageSquare },
                        { id: 'members', label: 'Membres', icon: Users },
                      ].map((tab) => {
                        const IconComp = tab.icon;
                        const active = subTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                              active
                                ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:text-[#161922] dark:hover:text-white'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SUB-TAB CONTENT 1: LEADERBOARD / PROGRESS COMPARISON */}
                  {subTab === 'leaderboard' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" /> Classement Hebdomadaire du Groupe
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                            Objectif collectif : {selectedGroup.weeklyGoalHours}h d'étude par membre / semaine
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('leaderboard')}
                          className="px-3.5 py-2 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Trophy className="w-4 h-4 text-[#161922]" /> Classement Global Active Recall 🏆
                        </button>
                      </div>

                      {/* MEMBERS RANKING LIST */}
                      <div className="space-y-3">
                        {(() => {
                          const sortedMembers = [...selectedGroup.members].sort(
                            (a, b) => b.studyMinutesThisWeek - a.studyMinutesThisWeek
                          );
                          const visibleMembers = isGroupLeaderboardExpanded
                            ? sortedMembers
                            : sortedMembers.slice(0, 10);

                          return (
                            <>
                              {visibleMembers.map((member, index) => {
                                const hours = (member.studyMinutesThisWeek / 60).toFixed(1);
                                const goalPercent = Math.min(
                                  100,
                                  Math.round((member.studyMinutesThisWeek / (selectedGroup.weeklyGoalHours * 60)) * 100)
                                );
                                const isCurrentUser = member.name.includes('(Vous)');

                                return (
                                  <div
                                    key={member.id}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                      isCurrentUser
                                        ? 'bg-[#EFFDE2] dark:bg-zinc-800/90 border-[#D4F94E]'
                                        : 'bg-[#F5F6FA] dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700'
                                    }`}
                                  >
                                    {/* LEFT: RANK MEDAL & MEMBER INFO */}
                                    <div className="flex items-center gap-3">
                                      {/* MEDAL BADGE */}
                                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                                        {index === 0 && <span className="text-2xl">🥇</span>}
                                        {index === 1 && <span className="text-2xl">🥈</span>}
                                        {index === 2 && <span className="text-2xl">🥉</span>}
                                        {index > 2 && (
                                          <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                                        )}
                                      </div>

                                      {/* AVATAR */}
                                      <div className="w-10 h-10 rounded-xl bg-[#161922] text-[#D4F94E] font-black flex items-center justify-center text-xs shrink-0 border border-zinc-700">
                                        {member.avatar}
                                      </div>

                                      {/* MEMBER NAME & DETAILS */}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-extrabold text-[#161922] dark:text-white text-sm">
                                            {member.name}
                                          </h5>
                                          {member.role === 'leader' && (
                                            <span className="text-[10px] font-black text-[#65A30D] dark:text-[#D4F94E] bg-[#EFFDE2] dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                              Leader
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                          <span className="flex items-center gap-1 text-[#65A30D] dark:text-[#D4F94E] font-bold">
                                            <Flame className="w-3.5 h-3.5" /> {member.currentStreak}j de série
                                          </span>
                                          <span>•</span>
                                          <span className="font-bold text-slate-600 dark:text-slate-300">
                                            {member.cardsMastered} cartes maîtrisées
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGHT: PROGRESS BAR & HOURS */}
                                    <div className="sm:w-48 space-y-1">
                                      <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-600 dark:text-slate-300">{hours} heures</span>
                                        <span className="text-[#161922] dark:text-white">{goalPercent}% objectif</span>
                                      </div>
                                      <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-[#D4F94E] h-full rounded-full transition-all duration-500"
                                          style={{ width: `${goalPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* TOGGLE EXPAND IF > 10 */}
                              {sortedMembers.length > 10 && (
                                <div className="text-center pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsGroupLeaderboardExpanded(!isGroupLeaderboardExpanded)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#161922] dark:text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                                  >
                                    {isGroupLeaderboardExpanded ? (
                                      <span>Replier le classement (Afficher le Top 10) ▴</span>
                                    ) : (
                                      <span>Afficher la suite du classement (+{sortedMembers.length - 10} membres) ▾</span>
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB CONTENT 2: SHARED FLASHCARD DECKS */}
                  {subTab === 'decks' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" /> Decks de Flashcards Partagés par les Membres
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                            Importez directement les decks partagés dans vos révisions personnelles Active Recall
                          </p>
                        </div>

                        <button
                          onClick={() => setIsShareDeckModalOpen(true)}
                          className="px-4 py-2.5 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#161922]" /> Partager un Deck
                        </button>
                      </div>

                      {/* SHARED DECKS SMOOTH CAROUSEL */}
                      {selectedGroup.sharedDecks.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4">
                          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Aucun deck partagé dans ce groupe pour le moment.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsShareDeckModalOpen(true)}
                            className="mt-3 px-4 py-2 bg-[#D4F94E] text-[#161922] hover:bg-[#CBF33B] font-black text-xs rounded-xl cursor-pointer"
                          >
                            Soyez le premier à partager un deck !
                          </button>
                        </div>
                      ) : (
                        <SmoothCarousel
                          totalItems={selectedGroup.sharedDecks.length}
                          gap="md"
                        >
                          {selectedGroup.sharedDecks.map((deck) => (
                            <div
                              key={deck.id}
                              className="min-w-[260px] sm:min-w-[290px] max-w-[320px] shrink-0 snap-start bg-[#F5F6FA] dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4F94E] transition-all"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E]">
                                    {deck.subject}
                                  </span>
                                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {deck.cardCount} cartes
                                  </span>
                                </div>

                                <h5 className="font-extrabold text-[#161922] dark:text-white text-base leading-snug">
                                  {deck.title}
                                </h5>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {deck.description}
                                </p>

                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  <div className="w-5 h-5 rounded-full bg-[#161922] text-[#D4F94E] flex items-center justify-center text-[10px] font-bold">
                                    {deck.sharedByAvatar}
                                  </div>
                                  <span>Partagé par {deck.sharedBy}</span>
                                </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-700/80">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDeckModal(deck)}
                                  className="flex-1 py-2 px-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[#161922] dark:text-white font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                >
                                  Aperçu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImportSharedDeck(deck)}
                                  className="flex-1 py-2 px-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-[#161922]" /> Importer
                                </button>
                              </div>
                            </div>
                          ))}
                        </SmoothCarousel>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB CONTENT 3: GROUP CHAT & ACTIVITY FEED */}
                  {subTab === 'chat' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6">
                      <h4 className="text-lg font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" /> Discussion & Journal d'Activité
                      </h4>

                      {/* FEED LIST */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {selectedGroup.activityFeed.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#F5F6FA] dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#161922] text-[#D4F94E] font-black flex items-center justify-center text-xs shrink-0">
                              {item.userAvatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-[#161922] dark:text-white">
                                  {item.userName}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                  {item.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CHAT INPUT FORM */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                        <input
                          type="text"
                          placeholder="Écrivez un message ou posez une question au groupe..."
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          className="flex-1 bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-[#161922]" /> Envoyer
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUB-TAB CONTENT 4: MEMBERS LIST */}
                  {subTab === 'members' && (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                      <h4 className="text-lg font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" /> Membres du Groupe ({selectedGroup.members.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedGroup.members.map((member) => (
                          <div
                            key={member.id}
                            className="bg-[#F5F6FA] dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-[#161922] text-[#D4F94E] font-black flex items-center justify-center text-xs">
                                  {member.avatar}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                                    member.status === 'online'
                                      ? 'bg-[#D4F94E]'
                                      : member.status === 'studying'
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                                  }`}
                                />
                              </div>

                              <div>
                                <h5 className="font-extrabold text-[#161922] dark:text-white text-xs">
                                  {member.name}
                                </h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                  Rejoint le {member.joinedAt}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[#161922] dark:text-white">
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: EXPLORE & DIRECTORY OF PUBLIC GROUPS */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* SEARCH & CATEGORY FILTERS */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, matière ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'Toutes les filières' },
                { id: 'Médecine & Santé', label: 'Médecine' },
                { id: 'Informatique & Tech', label: 'Informatique' },
                { id: 'Droit & Sciences Politiques', label: 'Droit' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* GROUPS DIRECTORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreGroups.map((group) => {
              const isJoined = group.isUserMember;
              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#D4F94E] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl p-2.5 bg-[#F5F6FA] dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                        {group.avatarEmoji}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E]">
                        {group.category}
                      </span>
                    </div>

                    <h4 className="text-lg font-extrabold text-[#161922] dark:text-white leading-snug">
                      {group.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <span>{group.members.length} membres</span>
                      <span>{group.sharedDecks.length} decks</span>
                      <span className="text-[#65A30D] dark:text-[#D4F94E] font-black">{group.weeklyGoalHours}h/sem</span>
                    </div>
                  </div>

                  {/* JOIN OR VIEW BUTTON */}
                  {isJoined ? (
                    <button
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setActiveTab('my_groups');
                      }}
                      className="w-full py-2.5 px-4 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Membre (Ouvrir le Workspace)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onJoinGroup(group.code);
                        setSelectedGroupId(group.id);
                        setActiveTab('my_groups');
                        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                      }}
                      className="w-full py-2.5 px-4 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#161922]" /> Rejoindre ce Groupe
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL LEADERBOARD COMPONENT */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6 animate-fade-in duration-300">
          {/* BANNER / SUMMARY STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* STAT 1: CHAMPION */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#65A30D] dark:text-[#D4F94E] tracking-wider">
                  🥇 Leader Actuel
                </span>
                <Crown className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4F94E] text-[#161922] font-black flex items-center justify-center text-sm shadow-xs">
                  {topStudent?.avatar || '🥇'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-[#161922] dark:text-white text-sm truncate">
                    {topStudent?.name || 'Aucun'}
                  </h4>
                  <p className="text-xs font-black text-[#65A30D] dark:text-[#D4F94E]">
                    {topStudent?.cardsMastered || 0} cartes maîtrisées
                  </p>
                </div>
              </div>
            </div>

            {/* STAT 2: TOTAL COMMUNITY CARDS */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  🎴 Cumul Communautaire
                </span>
                <BookOpen className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-[#161922] dark:text-white tracking-tight">
                  {totalCardsMasteredCommunity}
                </p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Cartes mémorisées au total
                </p>
              </div>
            </div>

            {/* STAT 3: CONSTANCE MEDIANE */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  🔥 Constance Médiane
                </span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-[#161922] dark:text-white tracking-tight">
                  {Math.round(
                    globalLeaderboardMembers.reduce((acc, m) => acc + m.currentStreak, 0) /
                      (globalLeaderboardMembers.length || 1)
                  )}{' '}
                  Jours
                </p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Série moyenne par étudiant
                </p>
              </div>
            </div>

            {/* STAT 4: YOUR GLOBAL RANK */}
            <div className="bg-[#EFFDE2] dark:bg-zinc-800 border border-[#D4F94E] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#65A30D] dark:text-[#D4F94E] tracking-wider">
                  🏅 Votre Position Global
                </span>
                <Trophy className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" />
              </div>
              <div className="mt-2">
                <p className="text-2xl font-black text-[#161922] dark:text-white tracking-tight">
                  #{currentUserGlobalRankIndex >= 0 ? currentUserGlobalRankIndex + 1 : '—'}{' '}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    / {sortedGlobalMembers.length}
                  </span>
                </p>
                <p className="text-[11px] font-bold text-[#65A30D] dark:text-[#D4F94E] mt-0.5">
                  {sortedGlobalMembers[currentUserGlobalRankIndex]?.cardsMastered || 0} cartes maîtrisées
                </p>
              </div>
            </div>
          </div>

          {/* TOP CHAMPIONS LEADERBOARD SMOOTH CAROUSEL */}
          {sortedGlobalMembers.length >= 3 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <SmoothCarousel
                title={
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] font-black text-[10px] uppercase rounded-full tracking-wider border border-[#D4F94E]/40">
                      Podium & Top Champions
                    </span>
                  </div>
                }
                subtitle="Glissez pour explorer les meilleurs révisants Active Recall de la communauté"
                totalItems={Math.min(sortedGlobalMembers.length, 6)}
                gap="md"
              >
                {sortedGlobalMembers.slice(0, 6).map((member, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;
                  const isTop3 = index < 3;

                  return (
                    <div
                      key={member.id}
                      className={`min-w-[240px] sm:min-w-[270px] max-w-[290px] shrink-0 snap-start rounded-3xl p-5 shadow-xs text-center relative flex flex-col justify-between space-y-3 transition-all ${
                        isFirst
                          ? 'bg-[#EFFDE2] dark:bg-zinc-800 border-2 border-[#D4F94E] shadow-sm'
                          : isSecond
                          ? 'bg-[#F5F6FA] dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700'
                          : isThird
                          ? 'bg-[#FFFBEB] dark:bg-zinc-800/40 border border-amber-200 dark:border-zinc-700'
                          : 'bg-white dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800'
                      }`}
                    >
                      {/* BADGE */}
                      <div className="flex justify-center -mt-2 mb-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs ${
                            isFirst
                              ? 'bg-[#D4F94E] text-[#161922]'
                              : isSecond
                              ? 'bg-slate-200 dark:bg-zinc-700 text-[#161922] dark:text-white'
                              : isThird
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 text-[10px]'
                          }`}
                        >
                          {isFirst
                            ? '👑 1ère Place'
                            : isSecond
                            ? '🥈 2ème Place'
                            : isThird
                            ? '🥉 3ème Place'
                            : `⚡ #${index + 1} Challenger`}
                        </span>
                      </div>

                      {/* AVATAR & NAME */}
                      <div className="pt-1">
                        <div
                          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-xl font-black shadow-xs ${
                            isFirst
                              ? 'bg-[#161922] text-[#D4F94E]'
                              : 'bg-slate-100 dark:bg-zinc-800 text-[#161922] dark:text-white'
                          }`}
                        >
                          {member.avatar}
                        </div>
                        <h4 className="font-extrabold text-[#161922] dark:text-white text-base mt-2 truncate">
                          {member.name}
                        </h4>
                        <p className="text-[11px] font-extrabold text-[#65A30D] dark:text-[#D4F94E] flex items-center justify-center gap-1 truncate">
                          <span>{member.primaryGroupEmoji}</span>
                          <span className="truncate">{member.primaryGroupName}</span>
                        </p>
                      </div>

                      {/* STATS BOX */}
                      <div className="bg-white dark:bg-zinc-900/90 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1 shadow-xs">
                        <p className="text-2xl font-black text-[#65A30D] dark:text-[#D4F94E]">
                          {member.cardsMastered}
                        </p>
                        <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Cartes Maîtrisées
                        </p>
                        <div className="flex justify-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
                          <span className="flex items-center gap-1 text-orange-500">
                            <Flame className="w-3.5 h-3.5" /> {member.currentStreak}j
                          </span>
                          <span>•</span>
                          <span>{(member.studyMinutesThisWeek / 60).toFixed(1)}h</span>
                        </div>
                      </div>

                      {/* CHEER BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleCheerMember(member.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                          cheeredMembers[member.id]
                            ? 'bg-[#D4F94E] text-[#161922]'
                            : isFirst
                            ? 'bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922]'
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-[#161922] dark:text-white'
                        }`}
                      >
                        {cheeredMembers[member.id] ? 'Bravo ! 🎉' : isFirst ? 'Encourager le Leader 👏' : 'Féliciter 👏'}
                      </button>
                    </div>
                  );
                })}
              </SmoothCarousel>
            </div>
          )}

          {/* SEARCH, CATEGORY FILTER & SORTING CONTROLS */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un membre ou un groupe..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'Toutes les filières' },
                { id: 'Médecine & Santé', label: 'Médecine' },
                { id: 'Informatique & Tech', label: 'Informatique' },
                { id: 'Droit & Sciences Politiques', label: 'Droit' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setGlobalCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    globalCategory === cat.id
                      ? 'bg-[#D4F94E] text-[#161922] font-black shadow-xs'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Toggle Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-full md:w-auto justify-center">
              <button
                onClick={() => setGlobalSortBy('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  globalSortBy === 'cards'
                    ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Cartes
              </button>
              <button
                onClick={() => setGlobalSortBy('hours')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  globalSortBy === 'hours'
                    ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Heures
              </button>
              <button
                onClick={() => setGlobalSortBy('streak')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  globalSortBy === 'streak'
                    ? 'bg-[#D4F94E] text-[#161922] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#161922] dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Série
              </button>
            </div>
          </div>

          {/* FULL RANKING TABLE */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h4 className="text-base font-extrabold text-[#161922] dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#65A30D] dark:text-[#D4F94E]" /> Classement Complet ({sortedGlobalMembers.length} étudiants)
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Trié par : {globalSortBy === 'cards' ? 'Cartes Maîtrisées 🎴' : globalSortBy === 'hours' ? 'Heures d\'étude ⏱️' : 'Série de jours 🔥'}
              </span>
            </div>

            <div className="space-y-2.5">
              {(() => {
                const visibleMembers = isGlobalLeaderboardExpanded
                  ? sortedGlobalMembers
                  : sortedGlobalMembers.slice(0, 10);

                return (
                  <>
                    {visibleMembers.map((member, index) => {
                      const rank = index + 1;
                      const isTop1 = rank === 1;
                      const isTop2 = rank === 2;
                      const isTop3 = rank === 3;
                      const isUser = member.isCurrentUser;

                      // Mastery Tier Badge helper
                      let badgeLabel = 'Apprenti';
                      let badgeStyle = 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300';
                      if (member.cardsMastered >= 200) {
                        badgeLabel = '👑 Légende Active Recall';
                        badgeStyle = 'bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E] border border-[#D4F94E]/40';
                      } else if (member.cardsMastered >= 150) {
                        badgeLabel = '💎 Maître Flashcards';
                        badgeStyle = 'bg-purple-100 dark:bg-zinc-800 text-purple-800 dark:text-purple-300';
                      } else if (member.cardsMastered >= 100) {
                        badgeLabel = '🌟 Expert Mémorisation';
                        badgeStyle = 'bg-blue-100 dark:bg-zinc-800 text-blue-800 dark:text-blue-300';
                      } else if (member.cardsMastered >= 50) {
                        badgeLabel = '⚡ Initié Spaced Repetition';
                        badgeStyle = 'bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E]';
                      }

                      const maxCards = topStudent?.cardsMastered || 1;
                      const percentOfMax = Math.min(100, Math.round((member.cardsMastered / maxCards) * 100));

                      return (
                        <div
                          key={`${member.id}-${index}`}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isUser
                              ? 'bg-[#EFFDE2] dark:bg-zinc-800/90 border-[#D4F94E] shadow-xs'
                              : isTop1
                              ? 'bg-[#EFFDE2]/60 dark:bg-zinc-800/70 border-[#D4F94E]'
                              : 'bg-[#F5F6FA] dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700 hover:border-[#D4F94E]'
                          }`}
                        >
                          {/* LEFT: RANK, AVATAR, NAME & GROUP */}
                          <div className="flex items-center gap-3.5">
                            {/* RANK MEDAL OR NUMBER */}
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                              {isTop1 && <span className="text-2xl">🥇</span>}
                              {isTop2 && <span className="text-2xl">🥈</span>}
                              {isTop3 && <span className="text-2xl">🥉</span>}
                              {!isTop1 && !isTop2 && !isTop3 && (
                                <span className="text-xs font-black text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-zinc-700 w-8 h-8 rounded-xl flex items-center justify-center">
                                  #{rank}
                                </span>
                              )}
                            </div>

                            {/* AVATAR WITH STATUS DOT */}
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-[#161922] text-[#D4F94E] font-black flex items-center justify-center text-xs border border-zinc-700">
                                {member.avatar}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                                  member.status === 'online'
                                    ? 'bg-[#D4F94E]'
                                    : member.status === 'studying'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                            </div>

                            {/* MEMBER DETAILS */}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-extrabold text-[#161922] dark:text-white text-sm">
                                  {member.name}
                                </h5>
                                {isUser && (
                                  <span className="text-[10px] font-black text-[#161922] bg-[#D4F94E] px-2 py-0.5 rounded-full">
                                    Vous
                                  </span>
                                )}
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                                  {badgeLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                <span className="flex items-center gap-1">
                                  <span>{member.primaryGroupEmoji}</span>
                                  <span>{member.primaryGroupName}</span>
                                </span>
                                {member.groupsCount > 1 && (
                                  <span className="text-[10px] bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded-md font-bold">
                                    +{member.groupsCount - 1} autre groupe
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: CARDS MASTERED, STREAK & ACTION */}
                          <div className="flex items-center gap-4 justify-between sm:justify-end">
                            {/* STATS COLUMNS */}
                            <div className="flex items-center gap-4 text-right">
                              {/* CARDS MASTERED */}
                              <div className="space-y-0.5 min-w-[90px]">
                                <p className="text-base font-black text-[#161922] dark:text-white">
                                  {member.cardsMastered}{' '}
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">cartes</span>
                                </p>
                                <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#D4F94E] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${percentOfMax}%` }}
                                  />
                                </div>
                              </div>

                              {/* STREAK */}
                              <div className="hidden sm:block min-w-[70px]">
                                <p className="text-xs font-black text-orange-500 flex items-center justify-end gap-1">
                                  <Flame className="w-3.5 h-3.5" /> {member.currentStreak}j
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">série</p>
                              </div>

                              {/* HOURS */}
                              <div className="hidden md:block min-w-[70px]">
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                  {(member.studyMinutesThisWeek / 60).toFixed(1)}h
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">cette sem.</p>
                              </div>
                            </div>

                            {/* CHEER ACTION */}
                            <button
                              onClick={() => handleCheerMember(member.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                cheeredMembers[member.id]
                                  ? 'bg-[#D4F94E] text-[#161922]'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#161922] dark:text-white'
                              }`}
                              title="Envoyer une félicitation"
                            >
                              {cheeredMembers[member.id] ? '🎉' : '👏'}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* TOGGLE EXPAND IF > 10 */}
                    {sortedGlobalMembers.length > 10 && (
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setIsGlobalLeaderboardExpanded(!isGlobalLeaderboardExpanded)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#161922] dark:text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          {isGlobalLeaderboardExpanded ? (
                            <span>Replier le classement (Afficher le Top 10) ▴</span>
                          ) : (
                            <span>Afficher la suite du classement (+{sortedGlobalMembers.length - 10} étudiants) ▾</span>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE GROUP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-6 animate-fade-in duration-200">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-[#161922] dark:text-white">Créer un Groupe d'Études</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                Rassemblez vos camarades pour partager vos fiches et suivre vos objectifs de révision
              </p>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Groupe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prep PACES / Pass Anatomie 🩺"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Filière / Matière
                  </label>
                  <select
                    value={newGroupCategory}
                    onChange={(e) => setNewGroupCategory(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-xs text-[#161922] dark:text-white font-bold"
                  >
                    <option value="Médecine & Santé">Médecine & Santé</option>
                    <option value="Informatique & Tech">Informatique & Tech</option>
                    <option value="Droit & Sciences Politiques">Droit & Sciences Politiques</option>
                    <option value="Sciences & Économie">Sciences & Économie</option>
                    <option value="Langues & Lettres">Langues & Lettres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emoji / Icône
                  </label>
                  <input
                    type="text"
                    value={newGroupEmoji}
                    onChange={(e) => setNewGroupEmoji(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#161922] dark:text-white text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description du groupe
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectif du groupe, fréquence des sessions d'étude..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F5F6FA] dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <p className="text-xs font-bold text-[#161922] dark:text-white">Objectif d'étude hebdomadaire</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Target conseillée par membre</p>
                </div>
                <span className="text-sm font-black text-[#65A30D] dark:text-[#D4F94E]">{newGroupGoalHours}h / sem</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs transition-all shadow-xs cursor-pointer"
              >
                Créer le Groupe & Obtenir le Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JOIN GROUP BY CODE */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 animate-fade-in duration-200">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#D4F94E] text-[#161922] flex items-center justify-center font-black shadow-xs">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#161922] dark:text-white">Rejoindre un Groupe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Entrez le code d'invitation à 6 caractères (ex: MED-2026, CODE-42) fourni par votre camarade.
              </p>
            </div>

            <form onSubmit={handleJoinCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="CODE D'INVITATION Ex: MED-2026"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-center text-base font-black tracking-wider uppercase text-[#161922] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4F94E]"
                />
                {joinError && (
                  <p className="text-xs font-bold text-rose-500 text-center mt-2">{joinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs transition-all shadow-xs cursor-pointer"
              >
                Valider & Rejoindre le Groupe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SHARE DECK TO GROUP */}
      {isShareDeckModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 animate-fade-in duration-200">
            <button
              onClick={() => setIsShareDeckModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-[#161922] dark:text-white">Partager un Deck avec le Groupe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                Sélectionnez l'un de vos decks personnels à publier dans {selectedGroup.name}
              </p>
            </div>

            {userDecks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Vous n'avez pas encore créé de decks dans vos flashcards.
              </p>
            ) : (
              <form onSubmit={handleShareDeckSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sélectionner un deck
                  </label>
                  <select
                    value={deckToShareId}
                    onChange={(e) => setDeckToShareId(e.target.value)}
                    className="w-full bg-[#F5F6FA] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-xs text-[#161922] dark:text-white font-bold outline-none focus:ring-2 focus:ring-[#D4F94E]"
                  >
                    {userDecks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.title} ({deck.cards.length} cartes - {deck.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  Publier dans le Groupe
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: PREVIEW DECK CARDS */}
      {previewDeckModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5 animate-fade-in duration-200">
            <button
              onClick={() => setPreviewDeckModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#161922] dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#EFFDE2] dark:bg-zinc-800 text-[#65A30D] dark:text-[#D4F94E]">
                {previewDeckModal.subject}
              </span>
              <h3 className="text-xl font-extrabold text-[#161922] dark:text-white mt-1">
                {previewDeckModal.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {previewDeckModal.description}
              </p>
            </div>

            {/* CARDS LIST PREVIEW */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {previewDeckModal.cards.map((card, i) => (
                <div
                  key={i}
                  className="bg-[#F5F6FA] dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1"
                >
                  <p className="text-xs font-black text-[#161922] dark:text-white">
                    Q{i + 1}: {card.question}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                    R: {card.answer}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                handleImportSharedDeck(previewDeckModal);
                setPreviewDeckModal(null);
              }}
              className="w-full py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#161922]" /> Importer dans mes Flashcards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
