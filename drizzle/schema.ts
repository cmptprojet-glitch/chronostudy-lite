import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 120 }),
  schoolLevel: varchar("schoolLevel", { length: 80 }),
  schoolName: varchar("schoolName", { length: 160 }),
  timezone: varchar("timezone", { length: 80 }).default("Europe/Paris").notNull(),
  language: varchar("language", { length: 8 }).default("fr").notNull(),
  theme: mysqlEnum("theme", ["light", "dark"]).default("light").notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  weeklyTargetMinutes: int("weeklyTargetMinutes").default(300).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  color: varchar("color", { length: 16 }).notNull(),
  icon: varchar("icon", { length: 64 }).default("BookOpen").notNull(),
  weeklyTargetMinutes: int("weeklyTargetMinutes").default(60).notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studyGoals = mysqlTable("study_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  kind: mysqlEnum("kind", ["quick_test", "regular_test", "final_exam", "general_review"]).notNull(),
  dueAt: timestamp("dueAt"),
  subjectId: int("subjectId"),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  progress: int("progress").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studyTasks = mysqlTable("study_tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subjectId: int("subjectId"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt"),
  estimatedMinutes: int("estimatedMinutes").default(25).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "completed"]).default("todo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const flashcardDecks = mysqlTable("flashcard_decks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subjectId: int("subjectId"),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 16 }).notNull(),
  cardCount: int("cardCount").default(0).notNull(),
  dueCount: int("dueCount").default(0).notNull(),
  mastery: int("mastery").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pomodoroSessions = mysqlTable("pomodoro_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subjectId: int("subjectId"),
  taskId: int("taskId"),
  plannedMinutes: int("plannedMinutes").notNull(),
  actualMinutes: int("actualMinutes").notNull(),
  outcome: mysqlEnum("outcome", ["completed", "abandoned"]).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type StudyGoal = typeof studyGoals.$inferSelect;
export type StudyTask = typeof studyTasks.$inferSelect;
export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
