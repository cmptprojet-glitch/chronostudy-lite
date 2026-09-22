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

// In-memory User and Session Store
const usersMap = new Map<string, ServerUser>(); // email -> ServerUser
const sessionsMap = new Map<string, SessionData>(); // token -> SessionData

// In-memory Rate Limiting Store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Helper to hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

// Seed initial default user for seamless demo / test continuity
(function seedDefaultUser() {
  const salt = crypto.randomBytes(16).toString("hex");
  const defaultUser: ServerUser = {
    id: "user-default-1",
    name: "Julien Dupont",
    email: "julien.dupont@chronostudy.fr",
    passwordSalt: salt,
    passwordHash: hashPassword("ChronoStudy2026!", salt),
    role: "Master 2 Data Science & IA",
    university: "Université Paris-Saclay / Sorbonne",
    avatarInitials: "JD",
    createdAt: new Date().toISOString(),
  };
  usersMap.set(defaultUser.email.toLowerCase(), defaultUser);
})();

// Rate limiter middleware (Section S5)
export function rateLimiter(maxRequests = 60, windowSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowSeconds * 1000 });
      return next();
    }

    clientRecord.count += 1;
    if (clientRecord.count > maxRequests) {
      return res.status(429).json({
        error: "Trop de requêtes. Veuillez patienter avant de renouveler l'opération.",
        retryAfterSeconds: Math.ceil((clientRecord.resetTime - now) / 1000),
      });
    }

    next();
  };
}

// Extract authenticated user helper
export function getAuthenticatedUser(req: Request): ServerUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const session = sessionsMap.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    sessionsMap.delete(token);
    return null;
  }

  for (const user of usersMap.values()) {
    if (user.id === session.userId) return user;
  }
  return null;
}

// Auth Controller
export const AuthController = {
  register(req: Request, res: Response) {
    const { name, email, password, role, university } = req.body || {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Le nom complet doit comporter au moins 2 caractères." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Adresse email invalide." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit comporter au moins 6 caractères." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (usersMap.has(normalizedEmail)) {
      return res.status(409).json({ error: "Un compte existe déjà avec cette adresse email." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);

    const nameParts = name.trim().split(" ");
    let avatarInitials = "ET";
    if (nameParts.length >= 2) {
      avatarInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      avatarInitials = nameParts[0].substring(0, 2).toUpperCase();
    }

    const newUser: ServerUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      name: name.trim().slice(0, 80),
      email: normalizedEmail,
      passwordSalt: salt,
      passwordHash,
      role: (role && typeof role === "string") ? role.trim().slice(0, 80) : "Étudiant",
      university: (university && typeof university === "string") ? university.trim().slice(0, 100) : "Université",
      avatarInitials,
      createdAt: new Date().toISOString(),
    };

    usersMap.set(normalizedEmail, newUser);

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const session: SessionData = {
      userId: newUser.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    sessionsMap.set(token, session);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        university: newUser.university,
        avatarInitials: newUser.avatarInitials,
      },
    });
  },

  login(req: Request, res: Response) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe valides." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = usersMap.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const inputHash = hashPassword(String(password), user.passwordSalt);
    if (inputHash !== user.passwordHash) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const session: SessionData = {
      userId: user.id,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    sessionsMap.set(token, session);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        avatarInitials: user.avatarInitials,
      },
    });
  },

  logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      sessionsMap.delete(token);
    }
    return res.json({ success: true, message: "Déconnexion réussie." });
  },

  me(req: Request, res: Response) {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Non authentifié ou session expirée." });
    }
    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        avatarInitials: user.avatarInitials,
      },
    });
  },
};
