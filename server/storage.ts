import { Request, Response } from "express";
import { getAuthenticatedUser, readSessionToken, ServerUser } from "./auth";
import { supabaseRestRequest } from "./supabase";

interface StudyDataRow {
  user_id: string;
  payload: Record<string, unknown>;
  last_synced_at: string;
}

async function currentUser(req: Request, res: Response): Promise<{ user: ServerUser; accessToken: string } | null> {
  const user = res.locals.authenticatedUser as ServerUser | undefined || await getAuthenticatedUser(req);
  const accessToken = res.locals.supabaseAccessToken as string | undefined || readSessionToken(req);
  return user && accessToken ? { user, accessToken } : null;
}

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
  async getUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<StudyDataRow[]>(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}&select=user_id,payload,last_synced_at&limit=1`, {
      method: "GET",
      accessToken: context.accessToken,
    });
    const row = rows[0] || null;

    return res.json({
      userId: context.user.id,
      authenticated: true,
      data: row?.payload || null,
      lastSyncedAt: row?.last_synced_at || null,
    });
  },

  // SAVE user's synced study data
  async saveUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const payload = req.body?.data || req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Format de données invalide." });
    }

    const lastSyncedAt = new Date().toISOString();
    await supabaseRestRequest("/user_study_data", {
      method: "POST",
      accessToken: context.accessToken,
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: { user_id: context.user.id, payload, last_synced_at: lastSyncedAt },
    });

    return res.json({
      success: true,
      lastSyncedAt,
      message: "Données synchronisées avec succès.",
    });
  },

  // GDPR ART. 20 - EXPORT USER DATA ARCHIVE
  async exportUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<StudyDataRow[]>(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}&select=payload&limit=1`, {
      method: "GET",
      accessToken: context.accessToken,
    });
    const data = rows[0]?.payload || {};
    const user = context.user;

    const archive = {
      exportMetadata: {
        application: "ChronoStudy",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        complianceNotice: "Export réalisé conformément à l'Article 20 du RGPD (Portabilité des données).",
      },
      userProfile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        createdAt: user.createdAt,
      },
      studyData: data,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="chronostudy-export-${Date.now()}.json"`);
    return res.send(JSON.stringify(archive, null, 2));
  },

  // GDPR ART. 17 - PURGE / RIGHT TO ERASURE
  async purgeUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    await supabaseRestRequest(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}`, {
      method: "DELETE",
      accessToken: context.accessToken,
    });

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

    const user = res.locals.authenticatedUser as ServerUser | undefined;
    if (!user) return res.status(401).json({ error: "Authentification requise." });
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
          id: user.id,
          name: user.name,
          role: "leader",
          avatarInitials: user.avatarInitials,
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

    const user = res.locals.authenticatedUser as ServerUser | undefined;
    if (!user) return res.status(401).json({ error: "Authentification requise." });
    const memberId = user.id;
    const alreadyMember = foundGroup.members.some((m) => m.id === memberId);

    if (!alreadyMember) {
      foundGroup.members.push({
        id: memberId,
        name: user.name,
        role: "member",
        avatarInitials: user.avatarInitials,
      });
      foundGroup.memberCount = foundGroup.members.length;
      foundGroup.messages.push({
        id: `msg-${Date.now()}`,
        sender: "Système",
        avatar: "CS",
        text: `${user.name} a rejoint le groupe d'études !`,
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

    const user = res.locals.authenticatedUser as ServerUser | undefined;
    if (!user) return res.status(401).json({ error: "Authentification requise." });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: user.name,
      avatar: user.avatarInitials,
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

    const user = res.locals.authenticatedUser as ServerUser | undefined;
    if (!user) return res.status(401).json({ error: "Authentification requise." });
    const shared = {
      id: `sd-${Date.now()}`,
      title: (deckTitle && typeof deckTitle === "string") ? deckTitle.trim().slice(0, 100) : "Deck partagé",
      cardCount: Number(cardCount) || 10,
      author: user.name,
    };

    group.sharedDecks.push(shared);
    return res.json({ success: true, sharedDeck: shared });
  },
};
