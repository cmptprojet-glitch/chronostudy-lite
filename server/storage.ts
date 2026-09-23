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

interface GroupRow {
  id: string;
  created_by: string;
  name: string;
  subject: string;
  description: string;
  code: string;
  is_private: boolean;
  created_at: string;
}

interface MemberRow {
  group_id: string;
  user_id: string;
  role: "leader" | "member";
  display_name: string;
  avatar_initials: string;
}

interface MessageRow {
  id: string;
  group_id: string;
  author_id: string;
  text: string;
  created_at: string;
  display_name?: string;
  avatar_initials?: string;
}

interface SharedDeckRow {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  card_count: number;
  created_at: string;
  display_name?: string;
}

function inFilter(ids: string[]): string {
  return `in.(${ids.join(",")})`;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function loadGroups(accessToken: string, groupFilter?: string): Promise<ServerStudyGroup[]> {
  const groupQuery = groupFilter
    ? `/study_groups?id=eq.${encodeURIComponent(groupFilter)}&select=id,created_by,name,subject,description,code,is_private,created_at&limit=1`
    : "/study_groups?select=id,created_by,name,subject,description,code,is_private,created_at&order=created_at.desc&limit=100";
  const groups = await supabaseRestRequest<GroupRow[]>(groupQuery, { method: "GET", accessToken });
  if (!groups.length) return [];
  const ids = groups.map((group) => group.id);
  const filter = inFilter(ids);
  const [members, messages, sharedDecks] = await Promise.all([
    supabaseRestRequest<MemberRow[]>(`/study_group_members?group_id=${filter}&select=group_id,user_id,role,display_name,avatar_initials&order=joined_at.asc&limit=1000`, { method: "GET", accessToken }),
    supabaseRestRequest<MessageRow[]>(`/study_group_messages?group_id=${filter}&select=id,group_id,author_id,text,created_at&order=created_at.asc&limit=2000`, { method: "GET", accessToken }),
    supabaseRestRequest<SharedDeckRow[]>(`/study_group_shared_decks?group_id=${filter}&select=id,group_id,author_id,title,card_count,created_at&order=created_at.desc&limit=1000`, { method: "GET", accessToken }),
  ]);
  const memberByUser = new Map(members.map((member) => [member.user_id, member]));
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    subject: group.subject,
    description: group.description,
    code: group.code,
    memberCount: members.filter((member) => member.group_id === group.id).length,
    members: members.filter((member) => member.group_id === group.id).map((member) => ({
      id: member.user_id,
      name: member.display_name,
      role: member.role,
      avatarInitials: member.avatar_initials,
    })),
    messages: messages.filter((message) => message.group_id === group.id).map((message) => {
      const author = memberByUser.get(message.author_id);
      return { id: message.id, sender: author?.display_name || "Étudiant", avatar: author?.avatar_initials || "ET", text: message.text, time: formatTime(message.created_at) };
    }),
    sharedDecks: sharedDecks.filter((deck) => deck.group_id === group.id).map((deck) => ({
      id: deck.id,
      title: deck.title,
      cardCount: deck.card_count,
      author: memberByUser.get(deck.author_id)?.display_name || "Étudiant",
    })),
    isPrivate: group.is_private,
    createdAt: group.created_at,
  }));
}

export const StorageController = {
  async getUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<StudyDataRow[]>(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}&select=user_id,payload,last_synced_at&limit=1`, { method: "GET", accessToken: context.accessToken });
    const row = rows[0] || null;
    return res.json({ userId: context.user.id, authenticated: true, data: row?.payload || null, lastSyncedAt: row?.last_synced_at || null });
  },

  async saveUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const payload = req.body?.data || req.body;
    if (!payload || typeof payload !== "object") return res.status(400).json({ error: "Format de données invalide." });
    const lastSyncedAt = new Date().toISOString();
    await supabaseRestRequest("/user_study_data", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: { user_id: context.user.id, payload, last_synced_at: lastSyncedAt } });
    return res.json({ success: true, lastSyncedAt, message: "Données synchronisées avec succès." });
  },

  async exportUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<StudyDataRow[]>(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}&select=payload&limit=1`, { method: "GET", accessToken: context.accessToken });
    const user = context.user;
    const archive = { exportMetadata: { application: "ChronoStudy", version: "1.0.0", exportedAt: new Date().toISOString(), userId: user.id, userEmail: user.email, complianceNotice: "Export réalisé conformément à l'Article 20 du RGPD (Portabilité des données)." }, userProfile: { id: user.id, name: user.name, email: user.email, role: user.role, university: user.university, createdAt: user.createdAt }, studyData: rows[0]?.payload || {} };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="chronostudy-export-${Date.now()}.json"`);
    return res.send(JSON.stringify(archive, null, 2));
  },

  async purgeUserData(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    await supabaseRestRequest(`/user_study_data?user_id=eq.${encodeURIComponent(context.user.id)}`, { method: "DELETE", accessToken: context.accessToken });
    return res.json({ success: true, message: "Toutes les données associées à cet utilisateur ont été définitivement purgées du serveur conformément au RGPD." });
  },

  async getGroups(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    return res.json(await loadGroups(context.accessToken));
  },

  async createGroup(req: Request, res: Response) {
    const { name, subject, description, isPrivate } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 3) return res.status(400).json({ error: "Le nom du groupe doit comporter au moins 3 caractères." });
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const cleanSubject = typeof subject === "string" ? subject.trim().slice(0, 60) || "Général" : "Général";
    const cleanName = name.trim().slice(0, 80);
    const code = `${cleanSubject.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const rows = await supabaseRestRequest<GroupRow[]>("/study_groups", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=representation" }, body: { created_by: context.user.id, name: cleanName, subject: cleanSubject, description: typeof description === "string" ? description.trim().slice(0, 300) || "Groupe d'études" : "Groupe d'études", code, is_private: Boolean(isPrivate) } });
    const group = rows[0];
    if (!group) return res.status(502).json({ error: "Le groupe n'a pas pu être créé." });
    await supabaseRestRequest("/study_group_members", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=minimal" }, body: { group_id: group.id, user_id: context.user.id, role: "leader", display_name: context.user.name, avatar_initials: context.user.avatarInitials } });
    await supabaseRestRequest("/study_group_messages", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=minimal" }, body: { group_id: group.id, author_id: context.user.id, text: `Groupe "${cleanName}" créé avec succès. Code d'invitation : ${code}` } });
    const created = await loadGroups(context.accessToken, group.id);
    return res.status(201).json(created[0]);
  },

  async joinGroup(req: Request, res: Response) {
    const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
    if (!code) return res.status(400).json({ error: "Code d'invitation manquant." });
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const groups = await supabaseRestRequest<GroupRow[]>(`/study_groups?code=eq.${encodeURIComponent(code)}&select=id&limit=1`, { method: "GET", accessToken: context.accessToken });
    const group = groups[0];
    if (!group) return res.status(404).json({ error: "Aucun groupe d'étude trouvé avec ce code d'invitation." });
    const existing = await supabaseRestRequest<MemberRow[]>(`/study_group_members?group_id=eq.${group.id}&user_id=eq.${context.user.id}&select=group_id&limit=1`, { method: "GET", accessToken: context.accessToken });
    if (!existing.length) {
      await supabaseRestRequest("/study_group_members", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=minimal" }, body: { group_id: group.id, user_id: context.user.id, role: "member", display_name: context.user.name, avatar_initials: context.user.avatarInitials } });
      await supabaseRestRequest("/study_group_messages", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=minimal" }, body: { group_id: group.id, author_id: context.user.id, text: `${context.user.name} a rejoint le groupe d'études !` } });
    }
    const joined = await loadGroups(context.accessToken, group.id);
    return res.json({ success: true, group: joined[0] });
  },

  async postGroupMessage(req: Request, res: Response) {
    const text = typeof req.body?.text === "string" ? req.body.text.trim().slice(0, 1000) : "";
    if (!text) return res.status(400).json({ error: "Message vide." });
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<MessageRow[]>("/study_group_messages", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=representation" }, body: { group_id: req.params.id, author_id: context.user.id, text } });
    const message = rows[0];
    if (!message) return res.status(502).json({ error: "Le message n'a pas pu être publié." });
    return res.json({ success: true, message: { id: message.id, sender: context.user.name, avatar: context.user.avatarInitials, text: message.text, time: formatTime(message.created_at) } });
  },

  async shareDeckToGroup(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const title = typeof req.body?.deckTitle === "string" ? req.body.deckTitle.trim().slice(0, 100) || "Deck partagé" : "Deck partagé";
    const rows = await supabaseRestRequest<SharedDeckRow[]>("/study_group_shared_decks", { method: "POST", accessToken: context.accessToken, headers: { Prefer: "return=representation" }, body: { group_id: req.params.id, author_id: context.user.id, title, card_count: Math.max(0, Number(req.body?.cardCount) || 0) } });
    const shared = rows[0];
    if (!shared) return res.status(502).json({ error: "Le deck n'a pas pu être partagé." });
    return res.json({ success: true, sharedDeck: { id: shared.id, title: shared.title, cardCount: shared.card_count, author: context.user.name } });
  },
};
