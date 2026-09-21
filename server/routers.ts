import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createDeck,
  createPomodoroSession,
  createSubject,
  createTask,
  ensureProfile,
  getProfile,
  getStudyMinutes,
  listDecks,
  listSubjects,
  listTasks,
  toggleTask,
  updateProfile,
} from "./db";

const subjectColors = ["#756BDB", "#F17C68", "#E8B949", "#5BB7E8", "#8BCF4D", "#A277D5"] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    me: protectedProcedure.query(({ ctx }) => ensureProfile(ctx.user.id, ctx.user.name)),
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().trim().min(1).max(120).optional(),
        schoolLevel: z.string().max(80).optional(),
        schoolName: z.string().max(160).optional(),
        timezone: z.string().max(80).optional(),
        language: z.enum(["fr", "en"]).optional(),
        theme: z.enum(["light", "dark"]).optional(),
        onboardingCompleted: z.boolean().optional(),
        weeklyTargetMinutes: z.number().int().min(30).max(2400).optional(),
      }))
      .mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),
  }),
  subjects: router({
    list: protectedProcedure.query(({ ctx }) => listSubjects(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().trim().min(1).max(120),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: z.string().max(64).optional(),
        weeklyTargetMinutes: z.number().int().min(15).max(1200).optional(),
      }))
      .mutation(({ ctx, input }) => createSubject(ctx.user.id, {
        userId: ctx.user.id,
        name: input.name,
        color: input.color ?? subjectColors[Math.floor(Math.random() * subjectColors.length)],
        icon: input.icon ?? "BookOpen",
        weeklyTargetMinutes: input.weeklyTargetMinutes ?? 60,
        archived: false,
      })),
  }),
  tasks: router({
    list: protectedProcedure.query(({ ctx }) => listTasks(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(200),
        subjectId: z.number().int().positive().optional(),
        description: z.string().max(1000).optional(),
        estimatedMinutes: z.number().int().min(5).max(600).default(25),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      }))
      .mutation(({ ctx, input }) => createTask(ctx.user.id, {
        userId: ctx.user.id,
        title: input.title,
        subjectId: input.subjectId,
        description: input.description,
        estimatedMinutes: input.estimatedMinutes,
        priority: input.priority,
        status: "todo",
      })),
    setStatus: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["todo", "in_progress", "completed"]) }))
      .mutation(({ ctx, input }) => toggleTask(ctx.user.id, input.id, input.status)),
  }),
  decks: router({
    list: protectedProcedure.query(({ ctx }) => listDecks(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(160),
        subjectId: z.number().int().positive().optional(),
        description: z.string().max(1000).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#A277D5"),
      }))
      .mutation(({ ctx, input }) => createDeck(ctx.user.id, {
        userId: ctx.user.id,
        title: input.title,
        subjectId: input.subjectId,
        description: input.description,
        color: input.color,
        cardCount: 0,
        dueCount: 0,
        mastery: 0,
      })),
  }),
  pomodoro: router({
    totalMinutes: protectedProcedure.query(({ ctx }) => getStudyMinutes(ctx.user.id)),
    complete: protectedProcedure
      .input(z.object({
        subjectId: z.number().int().positive().optional(),
        taskId: z.number().int().positive().optional(),
        plannedMinutes: z.number().int().min(1).max(180),
        actualMinutes: z.number().int().min(1).max(180),
        outcome: z.enum(["completed", "abandoned"]),
        startedAt: z.coerce.date(),
        endedAt: z.coerce.date(),
      }))
      .mutation(({ ctx, input }) => createPomodoroSession(ctx.user.id, {
        userId: ctx.user.id,
        subjectId: input.subjectId,
        taskId: input.taskId,
        plannedMinutes: input.plannedMinutes,
        actualMinutes: input.actualMinutes,
        outcome: input.outcome,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
      })),
  }),
});

export type AppRouter = typeof appRouter;
