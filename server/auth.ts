import { Request, Response, NextFunction } from "express";
import { supabaseAuthRequest, SupabaseAuthSession, SupabaseAuthUser } from "./supabase";

interface SupabaseSignUpResponse {
  user: SupabaseAuthUser;
  session: SupabaseAuthSession | null;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  university: string;
  avatarInitials: string;
  avatarUrl?: string;
  createdAt: string;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const SESSION_COOKIE = "chronostudy_session";
const REFRESH_COOKIE = "chronostudy_refresh";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

function readCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").flatMap((part) => {
      const separator = part.indexOf("=");
      if (separator < 0) return [];
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      return key ? [[key, decodeURIComponent(value)]] : [];
    }),
  );
}

export function readSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }
  return readCookies(req)[SESSION_COOKIE] || null;
}

function readRefreshToken(req: Request): string | null {
  return readCookies(req)[REFRESH_COOKIE] || null;
}

function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0] || email).slice(0, 2).toUpperCase();
}

function mapUser(user: SupabaseAuthUser): ServerUser {
  const metadata = user.user_metadata || {};
  const name = typeof metadata.name === "string" && metadata.name.trim()
    ? metadata.name.trim()
    : (user.email || "Étudiant").split("@")[0];
  return {
    id: user.id,
    name,
    email: user.email || "",
    role: typeof metadata.role === "string" ? metadata.role : "Étudiant",
    university: typeof metadata.university === "string" ? metadata.university : "Université",
    avatarInitials: initials(name, user.email || "ET"),
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    createdAt: user.created_at || new Date().toISOString(),
  };
}

function supabaseErrorStatus(error: unknown): number {
  const status = (error as { status?: number })?.status;
  return typeof status === "number" ? status : 502;
}

export function setSessionCookie(res: Response, token: string, expiresIn = SESSION_TTL_SECONDS): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.max(60, expiresIn)}${secure}`,
  );
}

export function setSessionCookies(res: Response, session: SupabaseAuthSession): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", [
    `${SESSION_COOKIE}=${encodeURIComponent(session.access_token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.max(60, session.expires_in || 3600)}${secure}`,
    `${REFRESH_COOKIE}=${encodeURIComponent(session.refresh_token || "")}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
  ]);
}

export function clearSessionCookie(res: Response): void {
  res.setHeader("Set-Cookie", [
    `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    `${REFRESH_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  ]);
}

export function rateLimiter(maxRequests = 60, windowSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const current = rateLimitMap.get(ip);
    if (!current || now > current.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowSeconds * 1000 });
      return next();
    }
    current.count += 1;
    if (current.count > maxRequests) {
      return res.status(429).json({
        error: "Trop de requêtes. Veuillez patienter avant de renouveler l'opération.",
        retryAfterSeconds: Math.ceil((current.resetTime - now) / 1000),
      });
    }
    return next();
  };
}

export interface AuthenticatedContext {
  user: ServerUser;
  accessToken: string;
}

export async function getAuthenticatedContext(req: Request, res?: Response): Promise<AuthenticatedContext | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  try {
    const user = await supabaseAuthRequest<SupabaseAuthUser>("/user", {
      method: "GET",
      accessToken: token,
    });
    return { user: mapUser(user), accessToken: token };
  } catch (error) {
    if (supabaseErrorStatus(error) !== 401) return null;
    const refreshToken = readRefreshToken(req);
    if (!refreshToken) return null;
    try {
      const refreshed = await supabaseAuthRequest<SupabaseAuthSession>("/token?grant_type=refresh_token", {
        method: "POST",
        body: { refresh_token: refreshToken },
      });
      if (res) setSessionCookies(res, refreshed);
      return { user: mapUser(refreshed.user), accessToken: refreshed.access_token };
    } catch {
      if (res) clearSessionCookie(res);
      return null;
    }
  }
}

export async function getAuthenticatedUser(req: Request): Promise<ServerUser | null> {
  return (await getAuthenticatedContext(req))?.user || null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const context = await getAuthenticatedContext(req, res);
  if (!context) return res.status(401).json({ error: "Authentification requise." });
  res.locals.authenticatedUser = context.user;
  res.locals.supabaseAccessToken = context.accessToken;
  return next();
}

function publicUser(user: ServerUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    university: user.university,
    avatarInitials: user.avatarInitials,
  };
}

function respondWithSession(res: Response, session: SupabaseAuthSession | null, user: SupabaseAuthUser, status = 200) {
  if (session?.access_token && session.refresh_token) setSessionCookies(res, session);
  return res.status(status).json({
    success: true,
    token: session?.access_token || null,
    user: publicUser(mapUser(user)),
    requiresEmailConfirmation: !session,
  });
}

export const AuthController = {
  async register(req: Request, res: Response) {
    const { name, email: rawEmail, password, role, university } = req.body || {};
    const email = normalizeEmail(rawEmail);
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ error: "Le nom complet doit comporter entre 2 et 80 caractères." });
    }
    if (!email) return res.status(400).json({ error: "Adresse email invalide." });
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: "Le mot de passe doit comporter entre 8 et 128 caractères." });
    }
    try {
      const result = await supabaseAuthRequest<SupabaseSignUpResponse>("/signup", {
        method: "POST",
        body: {
          email,
          password,
          data: {
            name: name.trim(),
            role: typeof role === "string" ? role.trim().slice(0, 80) : "Étudiant",
            university: typeof university === "string" ? university.trim().slice(0, 100) : "Université",
          },
        },
      });
      const session = result.session || (result.access_token
        ? {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            expires_in: result.expires_in,
            user: result.user,
          }
        : null);
      return respondWithSession(res, session, result.user, session ? 201 : 202);
    } catch (error) {
      return res.status(supabaseErrorStatus(error)).json({ error: error instanceof Error ? error.message : "Inscription Supabase impossible." });
    }
  },

  async login(req: Request, res: Response) {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || typeof password !== "string") return res.status(400).json({ error: "Identifiants invalides." });
    try {
      const session = await supabaseAuthRequest<SupabaseAuthSession>("/token?grant_type=password", {
        method: "POST",
        body: { email, password },
      });
      return respondWithSession(res, session, session.user);
    } catch (error) {
      return res.status(supabaseErrorStatus(error)).json({ error: error instanceof Error ? error.message : "Connexion Supabase impossible." });
    }
  },

  async logout(req: Request, res: Response) {
    const token = readSessionToken(req);
    if (token) {
      try {
        await supabaseAuthRequest<void>("/logout", { method: "POST", accessToken: token });
      } catch {
        // Always clear the local cookie, even if Supabase already expired the session.
      }
    }
    clearSessionCookie(res);
    return res.json({ success: true, message: "Déconnexion réussie." });
  },

  async me(req: Request, res: Response) {
    const context = await getAuthenticatedContext(req, res);
    if (!context) return res.status(401).json({ error: "Non authentifié ou session expirée." });
    return res.json({ authenticated: true, user: publicUser(context.user) });
  },
};
