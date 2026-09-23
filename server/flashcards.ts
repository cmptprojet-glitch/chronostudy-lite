import { Request, Response } from "express";
import { getAuthenticatedUser, readSessionToken, ServerUser } from "./auth";
import { supabaseRestRequest } from "./supabase";

interface Context { user: ServerUser; accessToken: string; }
interface DeckRow { id: string; user_id: string; title: string; subject: string | null; description: string | null; cards: unknown[]; source: string; created_at: string; updated_at: string; }
interface CardRow { id: string; deck_id: string; card_key: string; question: string; answer: string; card_type: string; options: unknown[]; explanation: string | null; tags: unknown[]; position: number; }
interface SrsRow { id: string; deck_id: string; card_key: string; interval_days: number; ease_factor: number; repetitions: number; due_at: string; updated_at: string; }
interface AnalyticsRow { day: string; focused_minutes: number; sessions_completed: number; cards_reviewed: number; cards_mastered: number; xp_earned: number; streak_days: number; }
interface SessionAnalyticsRow { duration_minutes: number; started_at: string; }

async function context(req: Request, res: Response): Promise<Context | null> {
  const user = res.locals.authenticatedUser as ServerUser | undefined || await getAuthenticatedUser(req);
  const accessToken = res.locals.supabaseAccessToken as string | undefined || readSessionToken(req);
  return user && accessToken ? { user, accessToken } : null;
}

function cleanText(value: unknown, fallback: string, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) || fallback : fallback;
}

function mapCard(card: CardRow, progress?: SrsRow) {
  return {
    id: card.id,
    cardKey: card.card_key,
    question: card.question,
    answer: card.answer,
    type: card.card_type,
    options: card.options,
    explanation: card.explanation,
    tags: card.tags,
    position: card.position,
    progress: progress ? { intervalDays: progress.interval_days, easinessFactor: Number(progress.ease_factor), repetitions: progress.repetitions, nextReviewDate: progress.due_at } : null,
  };
}

async function loadDecks(accessToken: string, deckId?: string) {
  const deckQuery = deckId
    ? `/flashcard_decks?id=eq.${encodeURIComponent(deckId)}&select=id,user_id,title,subject,description,cards,source,created_at,updated_at&limit=1`
    : "/flashcard_decks?select=id,user_id,title,subject,description,cards,source,created_at,updated_at&order=updated_at.desc&limit=100";
  const decks = await supabaseRestRequest<DeckRow[]>(deckQuery, { method: "GET", accessToken });
  if (!decks.length) return [];
  const ids = decks.map((deck) => deck.id).join(",");
  const [cards, progress] = await Promise.all([
    supabaseRestRequest<CardRow[]>(`/flashcards?deck_id=in.(${ids})&select=id,deck_id,card_key,question,answer,card_type,options,explanation,tags,position&order=position.asc&limit=5000`, { method: "GET", accessToken }),
    supabaseRestRequest<SrsRow[]>(`/srs_progress?deck_id=in.(${ids})&select=id,deck_id,card_key,interval_days,ease_factor,repetitions,due_at,updated_at&limit=5000`, { method: "GET", accessToken }),
  ]);
  return decks.map((deck) => ({
    id: deck.id,
    title: deck.title,
    subject: deck.subject,
    description: deck.description,
    source: deck.source,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at,
    cards: cards.filter((card) => card.deck_id === deck.id).map((card) => mapCard(card, progress.find((item) => item.deck_id === deck.id && item.card_key === card.card_key))),
  }));
}

async function recordDailyAnalytics(accessToken: string, userId: string, changes: Partial<AnalyticsRow>) {
  const day = new Date().toISOString().slice(0, 10);
  const existing = await supabaseRestRequest<AnalyticsRow[]>(`/analytics_daily?day=eq.${day}&select=day,focused_minutes,sessions_completed,cards_reviewed,cards_mastered,xp_earned,streak_days&limit=1`, { method: "GET", accessToken });
  const current = existing[0] || { day, focused_minutes: 0, sessions_completed: 0, cards_reviewed: 0, cards_mastered: 0, xp_earned: 0, streak_days: 0 };
  const next = {
    user_id: userId,
    day,
    focused_minutes: current.focused_minutes + (changes.focused_minutes || 0),
    sessions_completed: current.sessions_completed + (changes.sessions_completed || 0),
    cards_reviewed: current.cards_reviewed + (changes.cards_reviewed || 0),
    cards_mastered: current.cards_mastered + (changes.cards_mastered || 0),
    xp_earned: current.xp_earned + (changes.xp_earned || 0),
    streak_days: Math.max(current.streak_days, changes.streak_days || 0),
  };
  await supabaseRestRequest("/analytics_daily", { method: "POST", accessToken, headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: next });
}

export const FlashcardsController = {
  async listDecks(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    return res.json(await loadDecks(auth.accessToken));
  },

  async createDeck(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const title = cleanText(req.body?.title, "Deck sans titre", 160);
    const rows = await supabaseRestRequest<DeckRow[]>("/flashcard_decks", { method: "POST", accessToken: auth.accessToken, headers: { Prefer: "return=representation" }, body: { user_id: auth.user.id, title, subject: cleanText(req.body?.subject, "Général", 120), description: cleanText(req.body?.description, "", 500), source: ["manual", "ai", "document", "cloud"].includes(req.body?.source) ? req.body.source : "manual" } });
    const deck = rows[0];
    if (!deck) return res.status(502).json({ error: "Le deck n'a pas pu être créé." });
    const inputCards = Array.isArray(req.body?.cards) ? req.body.cards : [];
    if (inputCards.length) {
      const cards = inputCards.slice(0, 500).map((card: any, index: number) => ({ user_id: auth.user.id, deck_id: deck.id, card_key: cleanText(card.cardKey || card.id, `card-${index + 1}`, 120), question: cleanText(card.question, "Question", 5000), answer: cleanText(card.answer, "Réponse", 10000), card_type: ["classic", "qcm", "cloze", "true_false", "code", "ordering", "matching"].includes(card.type) ? card.type : "classic", options: Array.isArray(card.options) ? card.options : [], explanation: typeof card.explanation === "string" ? card.explanation : null, tags: Array.isArray(card.tags) ? card.tags : [], position: index }));
      await supabaseRestRequest("/flashcards", { method: "POST", accessToken: auth.accessToken, headers: { Prefer: "return=minimal" }, body: cards });
    }
    return res.status(201).json((await loadDecks(auth.accessToken, deck.id))[0]);
  },

  async updateDeck(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const body: Record<string, unknown> = {};
    if (req.body?.title !== undefined) body.title = cleanText(req.body.title, "Deck sans titre", 160);
    if (req.body?.subject !== undefined) body.subject = cleanText(req.body.subject, "Général", 120);
    if (req.body?.description !== undefined) body.description = cleanText(req.body.description, "", 500);
    if (!Object.keys(body).length) return res.status(400).json({ error: "Aucune modification fournie." });
    const rows = await supabaseRestRequest<DeckRow[]>(`/flashcard_decks?id=eq.${encodeURIComponent(req.params.id)}&user_id=eq.${encodeURIComponent(auth.user.id)}`, { method: "PATCH", accessToken: auth.accessToken, headers: { Prefer: "return=representation" }, body });
    if (!rows.length) return res.status(404).json({ error: "Deck introuvable." });
    return res.json((await loadDecks(auth.accessToken, rows[0].id))[0]);
  },

  async deleteDeck(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    await supabaseRestRequest(`/flashcard_decks?id=eq.${encodeURIComponent(req.params.id)}&user_id=eq.${encodeURIComponent(auth.user.id)}`, { method: "DELETE", accessToken: auth.accessToken });
    return res.json({ success: true });
  },

  async reviewCard(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const quality = Math.min(5, Math.max(0, Math.round(Number(req.body?.quality))));
    const deckId = cleanText(req.body?.deckId, "", 80);
    const cardKey = cleanText(req.body?.cardKey, "", 120);
    if (!deckId || !cardKey || !Number.isFinite(quality)) return res.status(400).json({ error: "deckId, cardKey et quality sont requis." });
    const existing = await supabaseRestRequest<SrsRow[]>(`/srs_progress?deck_id=eq.${encodeURIComponent(deckId)}&card_key=eq.${encodeURIComponent(cardKey)}&user_id=eq.${encodeURIComponent(auth.user.id)}&select=id,deck_id,card_key,interval_days,ease_factor,repetitions,due_at,updated_at&limit=1`, { method: "GET", accessToken: auth.accessToken });
    const previous = existing[0] || { interval_days: 0, ease_factor: 2.5, repetitions: 0 } as SrsRow;
    const ease = Math.max(1.3, Number(previous.ease_factor) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const repetitions = quality < 3 ? 0 : previous.repetitions + 1;
    const intervalDays = quality < 3 ? 1 : previous.repetitions === 0 ? 1 : previous.repetitions === 1 ? 6 : Math.max(1, Math.round(previous.interval_days * ease));
    const dueAt = new Date(Date.now() + intervalDays * 86_400_000).toISOString();
    const rows = await supabaseRestRequest<SrsRow[]>("/srs_progress", { method: "POST", accessToken: auth.accessToken, headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: { user_id: auth.user.id, deck_id: deckId, card_key: cardKey, interval_days: intervalDays, ease_factor: Number(ease.toFixed(2)), repetitions, due_at: dueAt } });
    await recordDailyAnalytics(auth.accessToken, auth.user.id, { cards_reviewed: 1, cards_mastered: quality >= 4 ? 1 : 0, xp_earned: quality >= 4 ? 5 : 1 });
    return res.json({ success: true, progress: rows[0] ? { intervalDays: rows[0].interval_days, easinessFactor: Number(rows[0].ease_factor), repetitions: rows[0].repetitions, nextReviewDate: rows[0].due_at } : { intervalDays, easinessFactor: ease, repetitions, nextReviewDate: dueAt } });
  },

  async analyticsOverview(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const startDate = new Date(Date.now() - days * 86_400_000).toISOString();
    const [rows, studySessions] = await Promise.all([
      supabaseRestRequest<AnalyticsRow[]>(`/analytics_daily?select=day,focused_minutes,sessions_completed,cards_reviewed,cards_mastered,xp_earned,streak_days&order=day.desc&limit=${days}`, { method: "GET", accessToken: auth.accessToken }),
      supabaseRestRequest<SessionAnalyticsRow[]>(`/study_sessions?started_at=gte.${encodeURIComponent(startDate)}&select=duration_minutes,started_at&order=started_at.desc&limit=5000`, { method: "GET", accessToken: auth.accessToken }),
    ]);
    const analyticsTotals = rows.reduce((acc, row) => ({ cardsReviewed: acc.cardsReviewed + row.cards_reviewed, cardsMastered: acc.cardsMastered + row.cards_mastered, xpEarned: acc.xpEarned + row.xp_earned }), { cardsReviewed: 0, cardsMastered: 0, xpEarned: 0 });
    const totals = { focusedMinutes: studySessions.reduce((sum, session) => sum + session.duration_minutes, 0), sessionsCompleted: studySessions.length, ...analyticsTotals };
    return res.json({ periodDays: days, totals, currentStreak: rows[0]?.streak_days || 0, daily: rows });
  },

  async getDashboardPreferences(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<Array<{ layout: unknown[]; widgets: unknown[]; updated_at: string }>>(`/dashboard_preferences?user_id=eq.${encodeURIComponent(auth.user.id)}&select=layout,widgets,updated_at&limit=1`, { method: "GET", accessToken: auth.accessToken });
    return res.json(rows[0] || { layout: [], widgets: [], updatedAt: null });
  },

  async saveDashboardPreferences(req: Request, res: Response) {
    const auth = await context(req, res);
    if (!auth) return res.status(401).json({ error: "Authentification requise." });
    const rows = await supabaseRestRequest<Array<{ layout: unknown[]; widgets: unknown[]; updated_at: string }>>("/dashboard_preferences", { method: "POST", accessToken: auth.accessToken, headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: { user_id: auth.user.id, layout: Array.isArray(req.body?.layout) ? req.body.layout : [], widgets: Array.isArray(req.body?.widgets) ? req.body.widgets : [] } });
    return res.json(rows[0] || { success: true });
  },
};
