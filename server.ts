import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
}) : null;

// Helper to handle missing API Key
const checkAi = (res: express.Response) => {
  if (!ai) {
    res.status(500).json({ error: "La clé API GEMINI_API_KEY n'est pas configurée dans l'environnement serveur." });
    return false;
  }
  return true;
};

// API Route 1: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!ai, timestamp: new Date().toISOString() });
});

// API Route 2: Generate Flashcards Deck (ChronoStudy Deck Pro)
app.post("/api/gemini/generate-flashcards", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { subject, topic, cardCount = 6, documentText } = req.body;

    const prompt = documentText
      ? `Génère exactement ${cardCount} cartes mémoire (flashcards) pédagogiques d'apprentissage actif (Active Recall) au format JSON à partir du document suivant pour la matière "${subject}".\nDocument:\n${documentText.slice(0, 4000)}`
      : `Génère exactement ${cardCount} cartes mémoire (flashcards) pédagogiques d'apprentissage actif (Active Recall) au format JSON pour le sujet "${topic}" dans la matière "${subject}".`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un expert en pédagogie universitaire et répétition espacée (SM-2/Anki). Génère des questions précises et des réponses synthétiques, très claires et mémorables.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Titre explicatif du deck" },
            description: { type: Type.STRING, description: "Brève description du contenu" },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Question ou concept d'apprentissage actif à tester" },
                  answer: { type: Type.STRING, description: "Réponse concise et exacte avec explications claires" }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["title", "description", "cards"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    res.status(500).json({ error: error?.message || "Erreur lors de la génération des flashcards" });
  }
});

// API Route 3: Generate Custom Educational Widget from AI
app.post("/api/gemini/generate-widget", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { promptText, category = "education", widgetType = "metric" } = req.body;

    const prompt = `Génère la configuration complète d'un widget interactif sur-mesure dédié aux études et à la réussite académique pour ChronoStudy.
Demande utilisateur : "${promptText}"
Catégorie cible : ${category} (education, active_recall, planning, exam, study_budget).
Type de widget suggéré : ${widgetType} (metric, chart, habit_streak, countdown, quote, active_recall, time_budget).

Retourne un objet JSON valide avec :
- title : titre court et impactant lié aux études
- category : education, active_recall, planning, exam, ou study_budget
- type : metric, chart, habit_streak, countdown, quote, active_recall, ou time_budget
- value : valeur clé affichée (ex: "88%", "94.2%", "14 jours", "32/40h", "12 jours")
- target : nombre cible objectif (ex: 100, 95, 21, 40, 12)
- unit : unité de mesure (ex: "%", "hrs", "jours", "cartes", "sessions")
- color : code couleur hexa soigné (ex: "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4")
- icon : un emoji représentatif de l'éducation (ex: "📚", "🧠", "🎯", "⏱️", "⚡", "📊")
- description : brève phrase explicative sur l'utilité pédagogique
- chartData : si le type est chart, active_recall ou time_budget, tableau de 5 à 7 points avec label (string) et value (number).`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un designer d'UI et d'analyse de performance académique pour le dashboard d'études ChronoStudy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING },
            value: { type: Type.STRING },
            target: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            color: { type: Type.STRING },
            icon: { type: Type.STRING },
            description: { type: Type.STRING },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["label", "value"]
              }
            }
          },
          required: ["title", "category", "type", "value", "color", "icon", "description"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating widget:", error);
    res.status(500).json({ error: error?.message || "Erreur lors de la génération du widget" });
  }
});

// API Route 4: Analyze Document (Study Support AI)
app.post("/api/gemini/analyze-document", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { fileName, fileContent } = req.body;

    const prompt = `Analyse le document académique suivant ("${fileName}") et retourne une analyse structurée complète en JSON pour aider l'étudiant.\n\nContenu du document:\n${fileContent.slice(0, 6000)}`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un assistant universitaire expert en pédagogie, analyse de cours, extraction de formules et fiches de révision de haute clarté.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Résumé exécutif synthétique en 3 à 5 phrases" },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste des 4 à 6 concepts clés identifiés"
            },
            formulasAndDefs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste des formules mathématiques, scientifiques ou définitions indispensables"
            },
            studySuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Conseils et questions d'active recall ciblées"
            }
          },
          required: ["summary", "keyConcepts", "formulasAndDefs", "studySuggestions"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing document:", error);
    res.status(500).json({ error: error?.message || "Erreur lors de l'analyse du document" });
  }
});

// API Route 5: Auto-Plan Weekly Schedule (ChronoStudy Auto-Planner)
app.post("/api/gemini/auto-plan", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { subjects, targetDailyHours = 4, priorityGoals = "" } = req.body;

    const prompt = `Génère un emploi du temps d'études hebdomadaire équilibré et optimisé sur 7 jours (Lundi au Dimanche) pour l'étudiant.
Matières: ${subjects.join(", ")}.
Volume horaire visé: ${targetDailyHours} heures par jour.
Objectifs prioritaires: ${priorityGoals || "Équilibre global, révisions actives et sessions Pomodoro"}.
Répartis les créneaux intelligemment entre 'Matin', 'Après-midi', et 'Soir' avec des thèmes précis.`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es ChronoAI, le moteur de planification académique intelligent de ChronoStudy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "Jour: Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche" },
              timeSlot: { type: Type.STRING, description: "Créneau: Matin, Après-midi, ou Soir" },
              subject: { type: Type.STRING, description: "Nom exact de la matière" },
              topic: { type: Type.STRING, description: "Sujet ou objectif spécifique du créneau" },
              durationMinutes: { type: Type.NUMBER, description: "Durée en minutes (ex: 60, 90, 120)" }
            },
            required: ["day", "timeSlot", "subject", "topic", "durationMinutes"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    res.json(data);
  } catch (error: any) {
    console.error("Error auto-planning schedule:", error);
    res.status(500).json({ error: error?.message || "Erreur lors de la génération de la planification" });
  }
});

// API Route 6: AI Chrono Study Assistant Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { message, history = [], userContext = {} } = req.body;

    const contextPrompt = `Contexte de l'étudiant ChronoStudy :
- Matières étudiées : ${userContext.subjects?.join(", ") || "Mathématiques, Physique, Informatique, Philosophie, Langues"}
- Tâches en cours : ${userContext.activeTaskTitles?.join("; ") || "Aucune"}
- Cartes révisées aujourd'hui : ${userContext.cardsReviewed || 0}
- Documents de cours : ${userContext.documentNames?.join(", ") || "Aucun"}

Tu es l'Assistant IA Global de ChronoStudy, spécialement dédié à l'éducation, à l'apprentissage actif, à l'explication conceptuelle et au soutien de l'étudiant dans l'ensemble de ses devoirs, révisions et projets.
Fournis des réponses structurées, claires, encourageantes et directes.`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: contextPrompt }] },
        ...history.map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "Sois concis, structuré, pédagogue avec des explications pas-à-pas, des listes claires et des exemples si utile. Réponds en français."
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in AI Chat:", error);
    res.status(500).json({ error: error?.message || "Erreur de l'Assistant IA ChronoStudy" });
  }
});

// API Route 7: Generate Complete Study Document or Folder (AI File & Folder Hub)
app.post("/api/gemini/generate-study-file", async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { promptText, subject, fileType = "text", level = "Lycée / Université" } = req.body;

    const prompt = `Génère un document de cours / fiche de révision académique de haute qualité au format JSON pour ChronoStudy.
Matière : "${subject || "Général"}"
Niveau d'étude : "${level}"
Type de ressource demandée : "${fileType}" (text, audio_script, formulas, exam_prep, folder_structure)
Instruction / Thème de l'étudiant : "${promptText}"

Retourne un objet JSON valide avec :
- title : Titre clair et précis du fichier/cours
- fileName : Nom de fichier avec extension appropriée (ex: "Fiche_Synthese_Thermodynamique.md" ou "Cours_Derivees.txt")
- fileCategory : "text" | "ia_generated" | "pdf" | "audio"
- content : Contenu Markdown complet, exhaustif et très bien structuré (titres #, ##, définitions clés, formules, théorèmes, pièges à éviter, 3 questions d'active recall à la fin)
- summary : Synthèse en 2-3 phrases
- keyConcepts : Liste des 4 à 6 concepts fondamentaux
- suggestedChapter : Nom suggéré du chapitre pour classer ce document (ex: "Chapitre 1 : Les Fondamentaux", "Chapitre 3 : Dynamique des Systèmes")
- tags : Tableau de 3 à 5 mots-clés`;

    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un professeur agrégé et tuteur de méthodologie universitaire. Rédige des fiches de cours complètes, claires, mathématiquement ou scientifiquement rigoureuses et adaptées à l'Active Recall.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            fileName: { type: Type.STRING },
            fileCategory: { type: Type.STRING },
            content: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedChapter: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "fileName", "content", "summary", "keyConcepts"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating study file:", error);
    res.status(500).json({ error: error?.message || "Erreur lors de la génération du document IA" });
  }
});

// Start Server with Vite or Express static
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
