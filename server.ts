import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { AiProviderService } from "./server/aiProvider";
import { AuthController, rateLimiter, requireAuth } from "./server/auth";
import { StorageController } from "./server/storage";
import { CalendarController } from "./server/calendar";
import { isSupabaseConfigured } from "./server/supabase";
import { StudySessionsController } from "./server/studySessions";
import { FlashcardsController } from "./server/flashcards";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Security: Disable X-Powered-By header (Section S8)
app.disable("x-powered-by");

// Security Headers Middleware (Section S8, S10)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// JSON body parser with sensible cap (10MB)
app.use(express.json({ limit: "10mb" }));

// Initialize AI Provider
const aiProvider = new AiProviderService();

// General API Rate Limiting (60 req / min)
const generalRateLimit = rateLimiter(60, 60);
// AI Endpoints Rate Limiting (20 req / min to prevent cost explosions - Section S5)
const aiRateLimit = rateLimiter(20, 60);
const privateRateLimit = [generalRateLimit, requireAuth];
const privateAiRateLimit = [aiRateLimit, requireAuth];
const asyncHandler = (handler: express.RequestHandler): express.RequestHandler => {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
};

// ==========================================
// 1. HEALTH & METRICS
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: aiProvider.isAiConfigured(),
    version: "1.1.0",
    compliance: {
      gdprReady: true,
      authProvider: isSupabaseConfigured() ? "supabase_auth" : "supabase_not_configured",
      offlineCapable: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. AUTHENTICATION (P0.1, S1, S2)
// ==========================================
app.post("/api/v1/auth/register", generalRateLimit, asyncHandler(AuthController.register));
app.post("/api/v1/auth/login", generalRateLimit, asyncHandler(AuthController.login));
app.post("/api/v1/auth/logout", generalRateLimit, asyncHandler(AuthController.logout));
app.get("/api/v1/auth/me", generalRateLimit, asyncHandler(AuthController.me));

// Backward-compatible auth aliases
app.post("/api/auth/register", generalRateLimit, asyncHandler(AuthController.register));
app.post("/api/auth/login", generalRateLimit, asyncHandler(AuthController.login));
app.post("/api/auth/logout", generalRateLimit, asyncHandler(AuthController.logout));
app.get("/api/auth/me", generalRateLimit, asyncHandler(AuthController.me));

// ==========================================
// 3. STORAGE & GDPR (P0.2, S3, Section 10)
// ==========================================
app.get("/api/v1/user/data", privateRateLimit, asyncHandler(StorageController.getUserData));
app.post("/api/v1/user/data", privateRateLimit, asyncHandler(StorageController.saveUserData));
app.get("/api/v1/user/export", privateRateLimit, asyncHandler(StorageController.exportUserData));
app.post("/api/v1/user/purge", privateRateLimit, asyncHandler(StorageController.purgeUserData));

// ==========================================
// 4. STUDY GROUPS (Section 7.2)
// ==========================================
app.get("/api/v1/groups", privateRateLimit, asyncHandler(StorageController.getGroups));
app.post("/api/v1/groups", privateRateLimit, asyncHandler(StorageController.createGroup));
app.post("/api/v1/groups/join", privateRateLimit, asyncHandler(StorageController.joinGroup));
app.post("/api/v1/groups/:id/messages", privateRateLimit, asyncHandler(StorageController.postGroupMessage));
app.post("/api/v1/groups/:id/share-deck", privateRateLimit, asyncHandler(StorageController.shareDeckToGroup));

// Backward-compatible groups aliases
app.get("/api/groups", privateRateLimit, asyncHandler(StorageController.getGroups));
app.post("/api/groups", privateRateLimit, asyncHandler(StorageController.createGroup));
app.post("/api/groups/join", privateRateLimit, asyncHandler(StorageController.joinGroup));
app.post("/api/groups/:id/messages", privateRateLimit, asyncHandler(StorageController.postGroupMessage));
app.post("/api/groups/:id/share-deck", privateRateLimit, asyncHandler(StorageController.shareDeckToGroup));

// ==========================================
// 5. CALENDAR EXPORT (iCal / .ics - Section 7.1 & 11.4)
// ==========================================
app.post("/api/v1/calendar/export-ics", privateRateLimit, CalendarController.exportIcs);
app.post("/api/calendar/export-ics", privateRateLimit, CalendarController.exportIcs);
app.get("/api/calendar/export-ics", privateRateLimit, CalendarController.exportIcs);

// ==========================================
// 6. STUDY SESSIONS & POMODORO
// ==========================================
app.get("/api/v1/study-sessions", privateRateLimit, asyncHandler(StudySessionsController.listStudySessions));
app.post("/api/v1/study-sessions", privateRateLimit, asyncHandler(StudySessionsController.createStudySession));
app.post("/api/v1/pomodoro/start", privateRateLimit, asyncHandler(StudySessionsController.startPomodoro));
app.patch("/api/v1/pomodoro/:id/finish", privateRateLimit, asyncHandler(StudySessionsController.finishPomodoro));

// ==========================================
// 7. FLASHCARDS, SRS & ANALYTICS
// ==========================================
app.get("/api/v1/decks", privateRateLimit, asyncHandler(FlashcardsController.listDecks));
app.post("/api/v1/decks", privateRateLimit, asyncHandler(FlashcardsController.createDeck));
app.patch("/api/v1/decks/:id", privateRateLimit, asyncHandler(FlashcardsController.updateDeck));
app.delete("/api/v1/decks/:id", privateRateLimit, asyncHandler(FlashcardsController.deleteDeck));
app.post("/api/v1/srs/review", privateRateLimit, asyncHandler(FlashcardsController.reviewCard));
app.get("/api/v1/analytics/overview", privateRateLimit, asyncHandler(FlashcardsController.analyticsOverview));
app.get("/api/v1/dashboard/preferences", privateRateLimit, asyncHandler(FlashcardsController.getDashboardPreferences));
app.put("/api/v1/dashboard/preferences", privateRateLimit, asyncHandler(FlashcardsController.saveDashboardPreferences));

// ==========================================
// 8. AI PROVIDER ENDPOINTS (P0.3, S6, S7, 11.2)
// Both /api/v1/ai/* and /api/gemini/* supported!
// ==========================================

// Flashcards & Decks Handlers
const handleFlashcardsGen = async (req: express.Request, res: express.Response) => {
  try {
    const { subject, topic, cardCount, count, documentText } = req.body || {};
    const finalCount = cardCount || count || 6;
    const finalTopic = topic || subject || "Concepts Clés";
    const result = await aiProvider.generateFlashcards({
      subject,
      topic: finalTopic,
      cardCount: finalCount,
      documentText,
    });
    res.json(result);
  } catch (error: any) {
    console.warn("[API] Erreur flashcards:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de la génération des flashcards." });
  }
};

app.post("/api/v1/ai/generate-flashcards", privateAiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/generate-flashcards", privateAiRateLimit, handleFlashcardsGen);
app.post("/api/v1/ai/flashcards", privateAiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/flashcards", privateAiRateLimit, handleFlashcardsGen);
app.post("/api/v1/ai/generate-deck", privateAiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/generate-deck", privateAiRateLimit, handleFlashcardsGen);

// Summary Handler (AIAssistantDrawer)
const handleSummaryGen = async (req: express.Request, res: express.Response) => {
  try {
    const { topic, subject, language } = req.body || {};
    const result = await aiProvider.generateSummary({ topic, subject, language });
    res.json(result);
  } catch (error: any) {
    console.warn("[API] Erreur summary:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de la génération du résumé." });
  }
};

app.post("/api/v1/ai/generate-summary", privateAiRateLimit, handleSummaryGen);
app.post("/api/gemini/generate-summary", privateAiRateLimit, handleSummaryGen);

// Custom Educational Widget Handler
const handleWidgetGen = async (req: express.Request, res: express.Response) => {
  try {
    const { promptText, category, widgetType } = req.body || {};
    const result = await aiProvider.generateWidget({ promptText, category, widgetType });
    res.json(result);
  } catch (error: any) {
    console.warn("[API] Erreur widget:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de la génération du widget." });
  }
};

app.post("/api/v1/ai/generate-widget", privateAiRateLimit, handleWidgetGen);
app.post("/api/gemini/generate-widget", privateAiRateLimit, handleWidgetGen);

// Document Analysis Handler
const handleAnalyzeDoc = async (req: express.Request, res: express.Response) => {
  try {
    const { fileName, fileContent } = req.body || {};
    const result = await aiProvider.analyzeDocument({ fileName, fileContent });
    res.json(result);
  } catch (error: any) {
    console.warn("[API] Erreur analyze:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de l'analyse du document." });
  }
};

app.post("/api/v1/ai/analyze-document", privateAiRateLimit, handleAnalyzeDoc);
app.post("/api/gemini/analyze-document", privateAiRateLimit, handleAnalyzeDoc);

// Auto-Plan Weekly Schedule Handler
const handleAutoPlan = async (req: express.Request, res: express.Response) => {
  try {
    const { subjects, targetDailyHours, priorityGoals } = req.body || {};
    const result = await aiProvider.autoPlan({ subjects, targetDailyHours, priorityGoals });
    // Keep backwards compatibility: return array if expected or result
    res.json(result.schedule);
  } catch (error: any) {
    console.warn("[API] Erreur auto-plan:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de la planification automatique." });
  }
};

app.post("/api/v1/ai/auto-plan", privateAiRateLimit, handleAutoPlan);
app.post("/api/gemini/auto-plan", privateAiRateLimit, handleAutoPlan);

// AI Chatbot Handler
const handleChat = async (req: express.Request, res: express.Response) => {
  try {
    const { message, history, userContext } = req.body || {};
    const result = await aiProvider.chat({ message, history, userContext });
    res.json({ reply: result.reply, provenance: result.provenance, provider: result.provider });
  } catch (error: any) {
    console.warn("[API] Erreur chat:", error?.message || error);
    res.status(500).json({ error: "Erreur de l'Assistant IA ChronoStudy." });
  }
};

app.post("/api/v1/ai/chat", privateAiRateLimit, handleChat);
app.post("/api/gemini/chat", privateAiRateLimit, handleChat);

// Complete Study Document / File Generator Handler
const handleStudyFileGen = async (req: express.Request, res: express.Response) => {
  try {
    const { promptText, subject, fileType, level } = req.body || {};
    const result = await aiProvider.generateStudyFile({ promptText, subject, fileType, level });
    res.json(result);
  } catch (error: any) {
    console.warn("[API] Erreur study-file:", error?.message || error);
    res.status(500).json({ error: "Erreur lors de la génération du document IA." });
  }
};

app.post("/api/v1/ai/generate-study-file", privateAiRateLimit, handleStudyFileGen);
app.post("/api/gemini/generate-study-file", privateAiRateLimit, handleStudyFileGen);

// ==========================================
// 7. CENTRALIZED ERROR HANDLING MIDDLEWARE (Section S10)
// ==========================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server Error]", err?.message || err);
  if (res.headersSent) return next(err);
  return res.status(500).json({
    error: "Une erreur interne est survenue. Veuillez réessayer ultérieurement.",
  });
});

// ==========================================
// 8. VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ChronoStudy running on http://localhost:${PORT}`);
  });
}

startServer();
