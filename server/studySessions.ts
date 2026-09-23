import { Request, Response } from "express";
import { getAuthenticatedUser, readSessionToken, ServerUser } from "./auth";
import { supabaseRestRequest } from "./supabase";

interface AuthContext {
  user: ServerUser;
  accessToken: string;
}

async function currentUser(req: Request, res: Response): Promise<AuthContext | null> {
  const user = res.locals.authenticatedUser as ServerUser | undefined || await getAuthenticatedUser(req);
  const accessToken = res.locals.supabaseAccessToken as string | undefined || readSessionToken(req);
  return user && accessToken ? { user, accessToken } : null;
}

interface StudySessionRow {
  id: string;
  user_id: string;
  session_type: "manual" | "pomodoro" | "flashcards";
  subject: string;
  topic: string | null;
  task_id: string | null;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface PomodoroRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  planned_seconds: number;
  focused_seconds: number;
  status: "running" | "completed" | "abandoned";
  subject: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

function toStudySession(row: StudySessionRow) {
  return {
    id: row.id,
    type: row.session_type,
    subject: row.subject,
    topic: row.topic,
    taskId: row.task_id,
    durationMinutes: row.duration_minutes,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    metadata: row.metadata,
  };
}

function toPomodoro(row: PomodoroRow) {
  return {
    id: row.id,
    status: row.status,
    subject: row.subject,
    plannedSeconds: row.planned_seconds,
    focusedSeconds: row.focused_seconds,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    metadata: row.metadata,
  };
}

function numberInRange(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback;
}

export const StudySessionsController = {
  async listStudySessions(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const limit = numberInRange(req.query.limit, 50, 1, 200);
    const rows = await supabaseRestRequest<StudySessionRow[]>(`/study_sessions?select=id,user_id,session_type,subject,topic,task_id,duration_minutes,started_at,ended_at,metadata,created_at&order=started_at.desc&limit=${limit}`, { method: "GET", accessToken: context.accessToken });
    return res.json(rows.map(toStudySession));
  },

  async createStudySession(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const durationMinutes = numberInRange(req.body?.durationMinutes, 1, 1, 1440);
    const startedAt = typeof req.body?.startedAt === "string" ? req.body.startedAt : new Date(Date.now() - durationMinutes * 60_000).toISOString();
    const endedAt = typeof req.body?.endedAt === "string" ? req.body.endedAt : new Date().toISOString();
    const sessionType = ["manual", "pomodoro", "flashcards"].includes(req.body?.type) ? req.body.type : "manual";
    const subject = typeof req.body?.subject === "string" ? req.body.subject.trim().slice(0, 120) || "Études" : "Études";
    const rows = await supabaseRestRequest<StudySessionRow[]>("/study_sessions", {
      method: "POST",
      accessToken: context.accessToken,
      headers: { Prefer: "return=representation" },
      body: {
        user_id: context.user.id,
        session_type: sessionType,
        subject,
        topic: typeof req.body?.topic === "string" ? req.body.topic.trim().slice(0, 200) || null : null,
        task_id: typeof req.body?.taskId === "string" ? req.body.taskId : null,
        duration_minutes: durationMinutes,
        started_at: startedAt,
        ended_at: endedAt,
        metadata: req.body?.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
      },
    });
    return res.status(201).json(toStudySession(rows[0]));
  },

  async startPomodoro(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const plannedSeconds = numberInRange(req.body?.plannedSeconds, 25 * 60, 60, 24 * 60 * 60);
    const rows = await supabaseRestRequest<PomodoroRow[]>("/pomodoro_sessions", {
      method: "POST",
      accessToken: context.accessToken,
      headers: { Prefer: "return=representation" },
      body: {
        user_id: context.user.id,
        started_at: new Date().toISOString(),
        planned_seconds: plannedSeconds,
        focused_seconds: 0,
        status: "running",
        subject: typeof req.body?.subject === "string" ? req.body.subject.trim().slice(0, 120) || null : null,
        metadata: { taskId: typeof req.body?.taskId === "string" ? req.body.taskId : null },
      },
    });
    return res.status(201).json(toPomodoro(rows[0]));
  },

  async finishPomodoro(req: Request, res: Response) {
    const context = await currentUser(req, res);
    if (!context) return res.status(401).json({ error: "Authentification requise." });
    const focusedSeconds = numberInRange(req.body?.focusedSeconds, 0, 0, 24 * 60 * 60);
    const status = req.body?.status === "abandoned" ? "abandoned" : "completed";
    const rows = await supabaseRestRequest<PomodoroRow[]>(`/pomodoro_sessions?id=eq.${encodeURIComponent(req.params.id)}&user_id=eq.${encodeURIComponent(context.user.id)}`, {
      method: "PATCH",
      accessToken: context.accessToken,
      headers: { Prefer: "return=representation" },
      body: { ended_at: new Date().toISOString(), focused_seconds: focusedSeconds, status },
    });
    if (!rows.length) return res.status(404).json({ error: "Session Pomodoro introuvable." });
    const pomodoro = toPomodoro(rows[0]);
    if (status === "completed" && focusedSeconds >= 60) {
      await supabaseRestRequest("/study_sessions", {
        method: "POST",
        accessToken: context.accessToken,
        headers: { Prefer: "return=minimal" },
        body: {
          user_id: context.user.id,
          session_type: "pomodoro",
          subject: pomodoro.subject || "Études",
          duration_minutes: Math.max(1, Math.round(focusedSeconds / 60)),
          started_at: pomodoro.startedAt,
          ended_at: pomodoro.endedAt,
          metadata: { pomodoroId: pomodoro.id },
        },
      });
    }
    return res.json(pomodoro);
  },
};
