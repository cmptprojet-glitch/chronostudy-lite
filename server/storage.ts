import { Request, Response } from "express";
import { getAuthenticatedUser } from "./auth";

// In-memory persistent collections indexed by userId
const userStudyDataStore = new Map<string, any>();

// Shared Study Groups store
export interface ServerStudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  code: string;
  memberCount: number;
  members: Array<{ id: string; name: string; role: "leader" | "member"; avatarInitials: string }>;
  messages: Array<{ id: string; sender: string; avatar: string; text: string; time: string }>;
  sharedDecks: Array<{ id: string; title: string; cardCount: number; author: string }>;
  isPrivate: boolean;
  createdAt: string;
}

const studyGroupsStore = new Map<string, ServerStudyGroup>();

// Initialize some starter study groups so students can collaborate immediately
(function seedStarterGroups() {
  const group1: ServerStudyGroup = {
    id: "grp-1",
    name: "Master Data & IA 2026",
    subject: "Informatique & IA",
    description: "Groupe d'entraide, partage de flashcards Machine Learning et révision de partiels.",
    code: "IA-2026",
    memberCount: 5,
    members: [
      { id: "m-1", name: "Julien Dupont", role: "leader", avatarInitials: "JD" },
      { id: "m-2", name: "Sarah Connor", role: "member", avatarInitials: "SC" },
      { id: "m-3", name: "Thomas Anderson", role: "member", avatarInitials: "TA" },
    ],
    messages: [
      { id: "msg-1", sender: "Julien Dupont", avatar: "JD", text: "Bienvenue à tous ! Partagez vos decks de révision ici.", time: "10:30" },
      { id: "msg-2", sender: "Sarah Connor", avatar: "SC", text: "Merci ! J'ai ajouté un deck sur les réseaux de neurones.", time: "11:15" },
    ],
    sharedDecks: [
      { id: "sd-1", title: "Réseaux Neuronaux & Backpropagation", cardCount: 12, author: "Sarah Connor" },
    ],
    isPrivate: false,
    createdAt: new Date().toISOString(),
  };

  const group2: ServerStudyGroup = {
    id: "grp-2",
    name: "Objectif Concours Médecine",
    subject: "Sciences Médicales",
    description: "Répétition espacée collective, anatomie, physiologie et QCM intensifs.",
    code: "MED-99",
    memberCount: 8,
    members: [
      { id: "m-4", name: "Dr. House", role: "leader", avatarInitials: "DH" },
      { id: "m-5", name: "Claire Redfield", role: "member", avatarInitials: "CR" },
    ],
    messages: [
      { id: "msg-3", sender: "Claire Redfield", avatar: "CR", text: "Prêts pour la session Pomodoro de 18h ?", time: "14:00" },
    ],
    sharedDecks: [
      { id: "sd-2", title: "Système Cardiovasculaire & Électrocardiogramme", cardCount: 24, author: "Dr. House" },
    ],
    isPrivate: false,
    createdAt: new Date().toISOString(),
  };

  studyGroupsStore.set(group1.id, group1);
  studyGroupsStore.set(group2.id, group2);
})();

export const StorageController = {
  // GET user's synced study data
  getUserData(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const targetId = user ? user.id : (req.query.sessionId as string) || "guest-session";
    const data = userStudyDataStore.get(targetId) || null;

    return res.json({
      userId: targetId,
      authenticated: !!user,
      data,
      lastSyncedAt: data?.lastSyncedAt || null,
    });
  },

  // SAVE user's synced study data
  saveUserData(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const targetId = user ? user.id : (req.body?.sessionId as string) || "guest-session";
    const payload = req.body?.data || req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Format de données invalide." });
    }

    const recordToSave = {
      ...payload,
      lastSyncedAt: new Date().toISOString(),
      ownerId: targetId,
    };

    userStudyDataStore.set(targetId, recordToSave);

    return res.json({
      success: true,
      lastSyncedAt: recordToSave.lastSyncedAt,
      message: "Données synchronisées avec succès.",
    });
  },

  // GDPR ART. 20 - EXPORT USER DATA ARCHIVE
  exportUserData(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const targetId = user ? user.id : (req.query.sessionId as string) || "guest-session";
    const data = userStudyDataStore.get(targetId) || {};

    const archive = {
      exportMetadata: {
        application: "ChronoStudy",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        userId: targetId,
        userEmail: user?.email || "guest@local",
        complianceNotice: "Export réalisé conformément à l'Article 20 du RGPD (Portabilité des données).",
      },
      userProfile: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        createdAt: user.createdAt,
      } : { role: "Invité / Local" },
      studyData: data,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="chronostudy-export-${Date.now()}.json"`);
    return res.send(JSON.stringify(archive, null, 2));
  },

  // GDPR ART. 17 - PURGE / RIGHT TO ERASURE
  purgeUserData(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    const targetId = user ? user.id : (req.body?.sessionId as string) || "guest-session";

    userStudyDataStore.delete(targetId);

    return res.json({
      success: true,
      message: "Toutes les données associées à cette session/utilisateur ont été définitivement purgées du serveur conformément au RGPD.",
    });
  },

  // GROUPS: List all groups
  getGroups(req: Request, res: Response) {
    return res.json(Array.from(studyGroupsStore.values()));
  },

  // GROUPS: Create a new group
  createGroup(req: Request, res: Response) {
    const { name, subject, description, isPrivate } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return res.status(400).json({ error: "Le nom du groupe doit comporter au moins 3 caractères." });
    }

    const user = getAuthenticatedUser(req);
    const code = `${(subject || "CS").slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGroup: ServerStudyGroup = {
      id: `grp-${Date.now()}`,
      name: name.trim().slice(0, 80),
      subject: (subject && typeof subject === "string") ? subject.trim().slice(0, 60) : "Général",
      description: (description && typeof description === "string") ? description.trim().slice(0, 300) : "Groupe d'études",
      code,
      memberCount: 1,
      members: [
        {
          id: user?.id || "usr-me",
          name: user?.name || "Moi",
          role: "leader",
          avatarInitials: user?.avatarInitials || "ME",
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "Système",
          avatar: "CS",
          text: `Groupe "${name}" créé avec succès. Code d'invitation : ${code}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
      sharedDecks: [],
      isPrivate: !!isPrivate,
      createdAt: new Date().toISOString(),
    };

    studyGroupsStore.set(newGroup.id, newGroup);
    return res.status(201).json(newGroup);
  },

  // GROUPS: Join group by code
  joinGroup(req: Request, res: Response) {
    const { code } = req.body || {};
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code d'invitation manquant." });
    }

    const cleanCode = code.trim().toUpperCase();
    let foundGroup: ServerStudyGroup | null = null;
    for (const g of studyGroupsStore.values()) {
      if (g.code.toUpperCase() === cleanCode) {
        foundGroup = g;
        break;
      }
    }

    if (!foundGroup) {
      return res.status(404).json({ error: "Aucun groupe d'étude trouvé avec ce code d'invitation." });
    }

    const user = getAuthenticatedUser(req);
    const memberId = user?.id || `guest-${Date.now()}`;
    const alreadyMember = foundGroup.members.some((m) => m.id === memberId);

    if (!alreadyMember) {
      foundGroup.members.push({
        id: memberId,
        name: user?.name || "Nouvel Étudiant",
        role: "member",
        avatarInitials: user?.avatarInitials || "ET",
      });
      foundGroup.memberCount = foundGroup.members.length;
      foundGroup.messages.push({
        id: `msg-${Date.now()}`,
        sender: "Système",
        avatar: "CS",
        text: `${user?.name || "Un nouvel étudiant"} a rejoint le groupe d'études !`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    return res.json({ success: true, group: foundGroup });
  },

  // GROUPS: Post message
  postGroupMessage(req: Request, res: Response) {
    const { id } = req.params;
    const { text, sender, avatar } = req.body || {};

    const group = studyGroupsStore.get(id);
    if (!group) {
      return res.status(404).json({ error: "Groupe introuvable." });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Message vide." });
    }

    const user = getAuthenticatedUser(req);
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: user?.name || sender || "Étudiant",
      avatar: user?.avatarInitials || avatar || "ET",
      text: text.trim().slice(0, 1000),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    group.messages.push(newMsg);
    // Keep max 100 messages
    if (group.messages.length > 100) group.messages.shift();

    return res.json({ success: true, message: newMsg });
  },

  // GROUPS: Share flashcard deck
  shareDeckToGroup(req: Request, res: Response) {
    const { id } = req.params;
    const { deckTitle, cardCount, author } = req.body || {};

    const group = studyGroupsStore.get(id);
    if (!group) {
      return res.status(404).json({ error: "Groupe introuvable." });
    }

    const user = getAuthenticatedUser(req);
    const shared = {
      id: `sd-${Date.now()}`,
      title: (deckTitle && typeof deckTitle === "string") ? deckTitle.trim().slice(0, 100) : "Deck partagé",
      cardCount: Number(cardCount) || 10,
      author: user?.name || author || "Étudiant",
    };

    group.sharedDecks.push(shared);
    return res.json({ success: true, sharedDeck: shared });
  },
};
