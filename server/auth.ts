import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: string;
  university: string;
  avatarInitials: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SessionData {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

// Transitional store only. Supabase Auth/Postgres replaces these maps in the next backend lot.
const usersMap = new Map<string, ServerUser>();
const sessionsMap = new Map<string, SessionData>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const SESSION_COOKIE = "chronostudy_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

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

function readSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }
  return readCookies(req)[SESSION_COOKIE] || null;
}

function createSession(userId: string): SessionData {
  const now = new Date();
  const session: SessionData = {
    userId,
    token: crypto.randomBytes(32).toString("hex"),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString(),
  };
  sessionsMap.set(session.token, session);
  return session;
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

export function setSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
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

export function getAuthenticatedUser(req: Request): ServerUser | null {
  const token = readSessionToken(req);
  if (!token) return null;
  const session = sessionsMap.get(token);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    sessionsMap.delete(token);
    return null;
  }
  for (const user of usersMap.values()) {
    if (user.id === session.userId) return user;
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!getAuthenticatedUser(req)) {
    return res.status(401).json({ error: "Authentification requise." });
  }
  return next();
}

function issueSession(res: Response, user: ServerUser) {
  const session = createSession(user.id);
  setSessionCookie(res, session.token);
  return { success: true, token: session.token, user: publicUser(user) };
}

export const AuthController = {
  register(req: Request, res: Response) {
    const { name, email: rawEmail, password, role, university } = req.body || {};
    const email = normalizeEmail(rawEmail);
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ error: "Le nom complet doit comporter entre 2 et 80 caractères." });
    }
    if (!email) return res.status(400).json({ error: "Adresse email invalide." });
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: "Le mot de passe doit comporter entre 8 et 128 caractères." });
    }
    if (usersMap.has(email)) return res.status(409).json({ error: "Un compte existe déjà avec cette adresse email." });

    const nameParts = name.trim().split(/\s+/);
    const avatarInitials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();
    const salt = crypto.randomBytes(16).toString("hex");
    const user: ServerUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      name: name.trim(),
      email,
      passwordSalt: salt,
      passwordHash: hashPassword(password, salt),
      role: typeof role === "string" ? role.trim().slice(0, 80) || "Étudiant" : "Étudiant",
      university: typeof university === "string" ? university.trim().slice(0, 100) || "Université" : "Université",
      avatarInitials,
      createdAt: new Date().toISOString(),
    };
    usersMap.set(email, user);
    return res.status(201).json(issueSession(res, user));
  },

  login(req: Request, res: Response) {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || typeof password !== "string") return res.status(400).json({ error: "Identifiants invalides." });
    const user = usersMap.get(email);
    if (!user || !safeEqualHex(hashPassword(password, user.passwordSalt), user.passwordHash)) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
    return res.json(issueSession(res, user));
  },

  logout(req: Request, res: Response) {
    const token = readSessionToken(req);
    if (token) sessionsMap.delete(token);
    clearSessionCookie(res);
    return res.json({ success: true, message: "Déconnexion réussie." });
  },

  me(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Non authentifié ou session expirée." });
    return res.json({ authenticated: true, user: publicUser(user) });
  },
};

// Demo account is opt-in and never seeded in production by default.
if (process.env.ENABLE_DEMO_USER === "true" && process.env.NODE_ENV !== "production") {
  const salt = crypto.randomBytes(16).toString("hex");
  usersMap.set("julien.dupont@chronostudy.fr", {
    id: "user-default-1",
    name: "Julien Dupont",
    email: "julien.dupont@chronostudy.fr",
    passwordSalt: salt,
    passwordHash: hashPassword("ChronoStudy2026!", salt),
    role: "Master 2 Data Science & IA",
    university: "Université Paris-Saclay / Sorbonne",
    avatarInitials: "JD",
    createdAt: new Date().toISOString(),
  });
}
