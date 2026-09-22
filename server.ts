import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { AiProviderService } from "./server/aiProvider";
import { AuthController, rateLimiter } from "./server/auth";
import { StorageController } from "./server/storage";
import { CalendarController } from "./server/calendar";

dotenv.config();

const app = express();
const PORT = 3000;

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
      authProvider: "session_token_pbkdf2",
      offlineCapable: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. AUTHENTICATION (P0.1, S1, S2)
// ==========================================
app.post("/api/v1/auth/register", generalRateLimit, AuthController.register);
app.post("/api/v1/auth/login", generalRateLimit, AuthController.login);
app.post("/api/v1/auth/logout", generalRateLimit, AuthController.logout);
app.get("/api/v1/auth/me", generalRateLimit, AuthController.me);

// Backward-compatible auth aliases
app.post("/api/auth/register", generalRateLimit, AuthController.register);
app.post("/api/auth/login", generalRateLimit, AuthController.login);
app.post("/api/auth/logout", generalRateLimit, AuthController.logout);
app.get("/api/auth/me", generalRateLimit, AuthController.me);

// ==========================================
// 3. STORAGE & GDPR (P0.2, S3, Section 10)
// ==========================================
app.get("/api/v1/user/data", generalRateLimit, StorageController.getUserData);
app.post("/api/v1/user/data", generalRateLimit, StorageController.saveUserData);
app.get("/api/v1/user/export", generalRateLimit, StorageController.exportUserData);
app.post("/api/v1/user/purge", generalRateLimit, StorageController.purgeUserData);

// ==========================================
// 4. STUDY GROUPS (Section 7.2)
// ==========================================
app.get("/api/v1/groups", generalRateLimit, StorageController.getGroups);
app.post("/api/v1/groups", generalRateLimit, StorageController.createGroup);
app.post("/api/v1/groups/join", generalRateLimit, StorageController.joinGroup);
app.post("/api/v1/groups/:id/messages", generalRateLimit, StorageController.postGroupMessage);
app.post("/api/v1/groups/:id/share-deck", generalRateLimit, StorageController.shareDeckToGroup);

// Backward-compatible groups aliases
app.get("/api/groups", generalRateLimit, StorageController.getGroups);
app.post("/api/groups", generalRateLimit, StorageController.createGroup);
app.post("/api/groups/join", generalRateLimit, StorageController.joinGroup);
app.post("/api/groups/:id/messages", generalRateLimit, StorageController.postGroupMessage);
app.post("/api/groups/:id/share-deck", generalRateLimit, StorageController.shareDeckToGroup);

// ==========================================
// 5. CALENDAR EXPORT (iCal / .ics - Section 7.1 & 11.4)
// ==========================================
app.post("/api/v1/calendar/export-ics", generalRateLimit, CalendarController.exportIcs);
app.post("/api/calendar/export-ics", generalRateLimit, CalendarController.exportIcs);
app.get("/api/calendar/export-ics", generalRateLimit, CalendarController.exportIcs);

// ==========================================
// 6. AI PROVIDER ENDPOINTS (P0.3, S6, S7, 11.2)
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

app.post("/api/v1/ai/generate-flashcards", aiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/generate-flashcards", aiRateLimit, handleFlashcardsGen);
app.post("/api/v1/ai/flashcards", aiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/flashcards", aiRateLimit, handleFlashcardsGen);
app.post("/api/v1/ai/generate-deck", aiRateLimit, handleFlashcardsGen);
app.post("/api/gemini/generate-deck", aiRateLimit, handleFlashcardsGen);

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

app.post("/api/v1/ai/generate-summary", aiRateLimit, handleSummaryGen);
app.post("/api/gemini/generate-summary", aiRateLimit, handleSummaryGen);

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

app.post("/api/v1/ai/generate-widget", aiRateLimit, handleWidgetGen);
app.post("/api/gemini/generate-widget", aiRateLimit, handleWidgetGen);

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

app.post("/api/v1/ai/analyze-document", aiRateLimit, handleAnalyzeDoc);
app.post("/api/gemini/analyze-document", aiRateLimit, handleAnalyzeDoc);

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

app.post("/api/v1/ai/auto-plan", aiRateLimit, handleAutoPlan);
app.post("/api/gemini/auto-plan", aiRateLimit, handleAutoPlan);

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

app.post("/api/v1/ai/chat", aiRateLimit, handleChat);
app.post("/api/gemini/chat", aiRateLimit, handleChat);

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

app.post("/api/v1/ai/generate-study-file", aiRateLimit, handleStudyFileGen);
app.post("/api/gemini/generate-study-file", aiRateLimit, handleStudyFileGen);

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
