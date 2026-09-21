import { and, asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  flashcardDecks,
  InsertUser,
  pomodoroSessions,
  subjects,
  studyTasks,
  userProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function ensureProfile(userId: number, fallbackName?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getProfile(userId);
  if (existing) return existing;
  await db.insert(userProfiles).values({
    userId,
    displayName: fallbackName || "Étudiant",
    timezone: "Europe/Paris",
    language: "fr",
    theme: "light",
    onboardingCompleted: false,
    weeklyTargetMinutes: 300,
  });
  return getProfile(userId);
}

export async function updateProfile(userId: number, values: Partial<typeof userProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(userProfiles).set(values).where(eq(userProfiles.userId, userId));
  return getProfile(userId);
}

export async function listSubjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(subjects)
    .where(and(eq(subjects.userId, userId), eq(subjects.archived, false)))
    .orderBy(asc(subjects.name));
}

export async function createSubject(userId: number, values: typeof subjects.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(subjects).values({ ...values, userId });
  const id = Number(result[0].insertId);
  const created = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return created[0];
}

export async function listTasks(userId: number, limit = 8) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(studyTasks).where(eq(studyTasks.userId, userId)).orderBy(
    sql`CASE WHEN ${studyTasks.status} = 'completed' THEN 1 ELSE 0 END`,
    asc(studyTasks.dueAt),
    desc(studyTasks.createdAt),
  ).limit(limit);
}

export async function createTask(userId: number, values: typeof studyTasks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(studyTasks).values({ ...values, userId });
  const id = Number(result[0].insertId);
  const created = await db.select().from(studyTasks).where(eq(studyTasks.id, id)).limit(1);
  return created[0];
}

export async function toggleTask(userId: number, taskId: number, status: "todo" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(studyTasks).set({ status }).where(and(eq(studyTasks.id, taskId), eq(studyTasks.userId, userId)));
  const result = await db.select().from(studyTasks).where(and(eq(studyTasks.id, taskId), eq(studyTasks.userId, userId))).limit(1);
  return result[0];
}

export async function listDecks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(flashcardDecks).where(eq(flashcardDecks.userId, userId)).orderBy(desc(flashcardDecks.updatedAt));
}

export async function createDeck(userId: number, values: typeof flashcardDecks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(flashcardDecks).values({ ...values, userId });
  const id = Number(result[0].insertId);
  const created = await db.select().from(flashcardDecks).where(eq(flashcardDecks.id, id)).limit(1);
  return created[0];
}

export async function createPomodoroSession(userId: number, values: typeof pomodoroSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(pomodoroSessions).values({ ...values, userId });
  const id = Number(result[0].insertId);
  const created = await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.id, id)).limit(1);
  return created[0];
}

export async function getStudyMinutes(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select({ total: sql<number>`COALESCE(SUM(${pomodoroSessions.actualMinutes}), 0)` })
    .from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId));
  return Number(result[0]?.total ?? 0);
}
