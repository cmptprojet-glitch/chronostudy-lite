import { GoogleGenAI, Type } from "@google/genai";

export interface AiMetadata {
  provenance: "ai" | "local_deterministic";
  provider: string;
  generatedAt: string;
}

export interface FlashcardItem {
  question: string;
  answer: string;
}

export interface FlashcardsResult extends AiMetadata {
  title: string;
  description: string;
  cards: FlashcardItem[];
}

export interface SummaryResult extends AiMetadata {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface WidgetResult extends AiMetadata {
  title: string;
  category: string;
  type: string;
  value: string;
  target: number;
  unit: string;
  color: string;
  icon: string;
  description: string;
  chartData?: { label: string; value: number }[];
}

export interface DocumentAnalysisResult extends AiMetadata {
  summary: string;
  keyConcepts: string[];
  formulasAndDefs: string[];
  studySuggestions: string[];
}

export interface ScheduleSlot {
  day: string;
  timeSlot: string;
  subject: string;
  topic: string;
  durationMinutes: number;
}

export interface AutoPlanResult extends AiMetadata {
  schedule: ScheduleSlot[];
}

export interface ChatResult extends AiMetadata {
  reply: string;
}

export interface StudyFileResult extends AiMetadata {
  title: string;
  fileName: string;
  fileCategory: string;
  content: string;
  summary: string;
  keyConcepts: string[];
  suggestedChapter: string;
  tags: string[];
}

// Sanitization helper
export function sanitizeInput(str: any, maxLen = 8000): string {
  if (typeof str !== "string") return "";
  // Strip null bytes and hazardous HTML script tags
  const cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\0/g, "");
  return cleaned.trim().slice(0, maxLen);
}

export class AiProviderService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim().length > 5) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { "User-Agent": "chronostudy-build" } },
        });
      } catch (e) {
        console.warn("[AiProvider] Erreur d'initialisation du client Gemini:", e);
        this.ai = null;
      }
    }
  }

  public isAiConfigured(): boolean {
    return !!this.ai;
  }

  // 1. FLASHCARDS
  async generateFlashcards(params: {
    subject?: string;
    topic?: string;
    cardCount?: number;
    documentText?: string;
  }): Promise<FlashcardsResult> {
    const subject = sanitizeInput(params.subject || "Études Générales", 100);
    const topic = sanitizeInput(params.topic || "Concepts Clés", 200);
    const cardCount = Math.min(Math.max(Number(params.cardCount) || 6, 3), 20);
    const documentText = sanitizeInput(params.documentText || "", 5000);

    if (this.ai) {
      try {
        const prompt = documentText
          ? `Génère exactement ${cardCount} cartes mémoire (flashcards) d'apprentissage actif pour la matière "${subject}".\nDocument:\n${documentText}`
          : `Génère exactement ${cardCount} cartes mémoire d'apprentissage actif pour le thème "${topic}" dans la matière "${subject}".`;

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Expert pédagogique en répétition espacée (SM-2/Anki). Rédige des questions stimulantes et des réponses claires.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                cards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                    required: ["question", "answer"],
                  },
                },
              },
              required: ["title", "description", "cards"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
          return {
            title: parsed.title || `Flashcards : ${topic}`,
            description: parsed.description || `Deck créé pour ${subject}`,
            cards: parsed.cards.map((c: any) => ({
              question: sanitizeInput(c.question, 300),
              answer: sanitizeInput(c.answer, 500),
            })),
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini generateFlashcards, utilisation du moteur local déterministe:", err);
      }
    }

    // Fallback Déterministe Pédagogique
    return {
      title: `Active Recall : ${topic}`,
      description: `Deck généré par le moteur pédagogique ChronoStudy pour ${subject}.`,
      cards: [
        {
          question: `Définition fondamentale de : ${topic}`,
          answer: `Concept pivot en ${subject} nécessitant une assimilation des principes directeurs et des termes exacts.`,
        },
        {
          question: `Quel est le mécanisme ou théorème central lié à "${topic}" ?`,
          answer: `Il repose sur une chaîne logique de déductions, vérifiable par l'application méthodique des règles de cours.`,
        },
        {
          question: `Quelles sont les 3 erreurs classiques à éviter sur ${topic} ?`,
          answer: `1. Confondre les notations ou unités. 2. Omettre les hypothèses initiales. 3. Sauter les étapes de justification.`,
        },
        {
          question: `Donner un exemple concret d'application pratique de "${topic}".`,
          answer: `Mise en situation directe permettant d'illustrer la pertinence de la formule ou de la règle dans un cas type d'examen.`,
        },
        {
          question: `Comment relier ${topic} aux autres chapitres de ${subject} ?`,
          answer: `Ce concept constitue un prérequis indispensable pour aborder les synthèses de fin de semestre et les épreuves terminales.`,
        },
        {
          question: `Quelle formule ou propriété clé faut-il mémoriser sans hésitation ?`,
          answer: `La relation fondamentale liant les grandeurs caractéristiques de ${topic}, avec ses conditions de validité.`,
        },
      ].slice(0, cardCount),
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 2. SUMMARY
  async generateSummary(params: { topic?: string; subject?: string; language?: string }): Promise<SummaryResult> {
    const topic = sanitizeInput(params.topic || "Thème d'étude", 200);
    const subject = sanitizeInput(params.subject || "Général", 100);

    if (this.ai) {
      try {
        const prompt = `Génère une fiche de synthèse académique structurée pour "${topic}" (${subject}).`;
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Tu es un professeur agrégé et tuteur de méthodologie d'études. Rédige un résumé clair et une liste de points essentiels.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["title", "summary", "keyPoints"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.summary) {
          return {
            title: parsed.title || `Fiche : ${topic}`,
            summary: parsed.summary,
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ["Concept clé 1", "Point d'application 2"],
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini generateSummary, utilisation du moteur local déterministe:", err);
      }
    }

    return {
      title: `Synthèse : ${topic}`,
      summary: `Cette fiche de synthèse sur "${topic}" récapitule les notions incontournables en ${subject}. Elle synthétise les définitions prioritaires, les théorèmes et la méthode de résolution type recommandée pour les partiels et examens.`,
      keyPoints: [
        `Maîtrise du vocabulaire précis et des conventions en ${subject}`,
        `Identification des conditions d'application pour ${topic}`,
        `Méthodologie de démonstration étape par étape`,
        `Application directe aux exercices types et annales`,
      ],
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 3. WIDGET
  async generateWidget(params: { promptText?: string; category?: string; widgetType?: string }): Promise<WidgetResult> {
    const promptText = sanitizeInput(params.promptText || "Productivité d'études", 300);
    const category = sanitizeInput(params.category || "education", 50);
    const widgetType = sanitizeInput(params.widgetType || "metric", 50);

    if (this.ai) {
      try {
        const prompt = `Génère la configuration JSON d'un widget pour ChronoStudy. Demande : "${promptText}". Catégorie : ${category}, Type : ${widgetType}.`;
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Designer d'analyse de performance académique.",
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
                      value: { type: Type.NUMBER },
                    },
                    required: ["label", "value"],
                  },
                },
              },
              required: ["title", "category", "type", "value", "color", "icon", "description"],
            },
          },
        });

        const data = JSON.parse(response.text || "{}");
        if (data.title) {
          return {
            ...data,
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini generateWidget:", err);
      }
    }

    return {
      title: `Objectif : ${promptText.slice(0, 30)}`,
      category: category || "education",
      type: widgetType || "metric",
      value: "85%",
      target: 100,
      unit: "%",
      color: "#10b981",
      icon: "🎯",
      description: `Suivi d'optimisation pour : ${promptText}`,
      chartData: [
        { label: "Lun", value: 65 },
        { label: "Mar", value: 72 },
        { label: "Mer", value: 80 },
        { label: "Jeu", value: 78 },
        { label: "Ven", value: 85 },
      ],
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 4. ANALYZE DOCUMENT
  async analyzeDocument(params: { fileName?: string; fileContent?: string }): Promise<DocumentAnalysisResult> {
    const fileName = sanitizeInput(params.fileName || "Document.txt", 150);
    const fileContent = sanitizeInput(params.fileContent || "", 8000);

    if (this.ai && fileContent.length > 20) {
      try {
        const prompt = `Analyse le document "${fileName}" et retourne l'analyse structurée en JSON.\n\nContenu :\n${fileContent}`;
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Expert universitaire en pédagogie et extraction de concepts clés pour révision active.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                formulasAndDefs: { type: Type.ARRAY, items: { type: Type.STRING } },
                studySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["summary", "keyConcepts", "formulasAndDefs", "studySuggestions"],
            },
          },
        });

        const data = JSON.parse(response.text || "{}");
        if (data.summary) {
          return {
            ...data,
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini analyzeDocument:", err);
      }
    }

    return {
      summary: `Analyse académique du document "${fileName}". Le document aborde les notions clés et présente une vue d'ensemble propice à des sessions d'Active Recall et de synthèse méthodique.`,
      keyConcepts: [
        "Structure fondamentale et terminologie spécialisée",
        "Relations de cause à effet et principes sous-jacents",
        "Applications directes et exercices types",
        "Méthode de vérification des résultats",
      ],
      formulasAndDefs: [
        "Définition formelle des variables et constantes introduites",
        "Théorèmes d'équivalence et cas limites",
      ],
      studySuggestions: [
        "Créer un deck de flashcards pour vérifier l'ancrage mémoriel",
        "Planifier 2 blocs Pomodoro de 25 minutes pour approfondir les exercices",
        "Rédiger un résumé personnel en 5 phrases sans consulter le document",
      ],
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 5. AUTO PLAN
  async autoPlan(params: { subjects?: string[]; targetDailyHours?: number; priorityGoals?: string }): Promise<AutoPlanResult> {
    const subjects = Array.isArray(params.subjects) && params.subjects.length > 0
      ? params.subjects.map((s) => sanitizeInput(s, 50))
      : ["Mathématiques", "Informatique", "Physique"];
    const targetDailyHours = Math.min(Math.max(Number(params.targetDailyHours) || 4, 1), 12);
    const priorityGoals = sanitizeInput(params.priorityGoals || "Équilibre et révisions", 200);

    if (this.ai) {
      try {
        const prompt = `Génère un emploi du temps d'études sur 7 jours (Lundi à Dimanche) pour les matières : ${subjects.join(", ")}. Heures par jour : ${targetDailyHours}. Objectif : ${priorityGoals}.`;
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Planificateur d'études universitaires.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                },
                required: ["day", "timeSlot", "subject", "topic", "durationMinutes"],
              },
            },
          },
        });

        const list = JSON.parse(response.text || "[]");
        if (Array.isArray(list) && list.length > 0) {
          return {
            schedule: list,
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini autoPlan:", err);
      }
    }

    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const slots = ["Matin", "Après-midi", "Soir"];
    const fallbackSchedule: ScheduleSlot[] = [];

    days.forEach((day, dIdx) => {
      slots.forEach((slot, sIdx) => {
        const sub = subjects[(dIdx + sIdx) % subjects.length];
        fallbackSchedule.push({
          day,
          timeSlot: slot,
          subject: sub,
          topic: `Approfondissement & Active Recall : ${sub}`,
          durationMinutes: 90,
        });
      });
    });

    return {
      schedule: fallbackSchedule.slice(0, 14),
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 6. CHAT
  async chat(params: { message?: string; history?: any[]; userContext?: any }): Promise<ChatResult> {
    const message = sanitizeInput(params.message || "Bonjour", 2000);
    const rawHistory = Array.isArray(params.history) ? params.history.slice(-10) : [];

    if (this.ai) {
      try {
        const contextText = `Contexte de l'étudiant : matières [${(params.userContext?.subjects || []).join(", ")}].`;
        const contents = [
          { role: "user", parts: [{ text: contextText }] },
          ...rawHistory.map((h: any) => ({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: sanitizeInput(h.text || "", 1000) }],
          })),
          { role: "user", parts: [{ text: message }] },
        ];

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction: "Tu es Nova AI, copilote académique fiable. Réponds en français, sans inventer de données et sans réponse générique. Structure chaque réponse avec : 1) réponse directe, 2) explication pédagogique étape par étape, 3) exemple ou application, 4) points à retenir, 5) une question de clarification seulement si l'énoncé est insuffisant. Pour un exercice, identifie les données, la méthode, les calculs et vérifie le résultat avec les unités. Adapte le niveau à userContext et signale clairement toute incertitude.",
          },
        });

        if (response.text) {
          return {
            reply: response.text,
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini chat:", err);
      }
    }

    return {
      reply: `Je suis **Nova AI** en mode local d'assistance pédagogique. 
Pour réussir efficacement vos révisions sur "${message.slice(0, 40)}" :
1. **Active Recall** : Testez vos connaissances sans regarder vos notes grâce aux flashcards.
2. **Pomodoro** : Lancez une session de 25 minutes de Deep Focus.
3. **Fiche synthétique** : Consultez vos documents ou générez une fiche de synthèse.
*Remarque de transparence : cette réponse est assistée par le moteur local ChronoStudy.*`,
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }

  // 7. STUDY FILE / COMPLETE DOCUMENT
  async generateStudyFile(params: {
    promptText?: string;
    subject?: string;
    fileType?: string;
    level?: string;
  }): Promise<StudyFileResult> {
    const promptText = sanitizeInput(params.promptText || "Synthèse de cours", 500);
    const subject = sanitizeInput(params.subject || "Général", 100);
    const fileType = sanitizeInput(params.fileType || "text", 50);
    const level = sanitizeInput(params.level || "Lycée / Université", 80);

    if (this.ai) {
      try {
        const prompt = `Génère un document de révision académique complet au format JSON pour ChronoStudy.
Matière : "${subject}"
Niveau : "${level}"
Type : "${fileType}"
Thème : "${promptText}"`;

        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Professeur agrégé et tuteur universitaire. Rédige un cours complet en Markdown structuré avec formules, théorèmes et questions d'active recall.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                fileName: { type: Type.STRING },
                fileCategory: { type: Type.STRING },
                content: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedChapter: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "fileName", "content", "summary", "keyConcepts"],
            },
          },
        });

        const data = JSON.parse(response.text || "{}");
        if (data.title && data.content) {
          return {
            title: data.title,
            fileName: data.fileName || `${subject}_Synthese.md`,
            fileCategory: data.fileCategory || "text",
            content: data.content,
            summary: data.summary || "Synthèse rédigée par Nova AI.",
            keyConcepts: data.keyConcepts || ["Concept principal"],
            suggestedChapter: data.suggestedChapter || "Chapitre 1 : Fondamentaux",
            tags: data.tags || [subject, "Révision", "Active Recall"],
            provenance: "ai",
            provider: "Gemini 2.5 Flash",
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("[AiProvider] Erreur Gemini generateStudyFile:", err);
      }
    }

    const safeTitle = `Fiche : ${promptText.slice(0, 40)}`;
    const mdContent = `# ${safeTitle}
**Matière :** ${subject} | **Niveau :** ${level}

## 1. Vue d'ensemble et Objectifs d'apprentissage
Cette ressource pédagogique a été structurée pour ancrer les connaissances indispensables relatives à **${promptText}**.

## 2. Concepts Fondamentaux et Définitions
- **Notion 1 :** Définition stricte et formalisme scientifique ou littéraire.
- **Notion 2 :** Propriétés intrinsèques et règles d'usage.
- **Théorème / Règle d'or :** Énoncé des conditions nécessaires et suffisantes.

## 3. Méthodologie et Pièges à Éviter
1. Ne pas négliger la phase d'analyse de l'énoncé.
2. Vérifier systématiquement la cohérence des hypothèses et des unités.
3. Toujours justifier chaque étape intermédiaire.

## 4. Questions d'Active Recall (Auto-évaluation)
- *Question 1 :* Êtes-vous capable de redéfinir ${promptText} de mémoire en 2 phrases ?
- *Question 2 :* Quelles sont les 3 conditions d'application de cette notion ?
- *Question 3 :* Comment démontre-t-on le résultat principal ?

---
*Généré par le moteur pédagogique ChronoStudy.*`;

    return {
      title: safeTitle,
      fileName: `${subject.replace(/[^a-zA-Z0-9]/g, "_")}_Fiche.md`,
      fileCategory: "text",
      content: mdContent,
      summary: `Synthèse pédagogique structurée pour ${promptText} dans la matière ${subject}.`,
      keyConcepts: [
        `Définition et formalisme de ${promptText}`,
        "Propriétés et théorèmes centraux",
        "Méthodologie de résolution sans pièges",
        "Auto-évaluation par Active Recall",
      ],
      suggestedChapter: `Chapitre 1 : Fondamentaux de ${subject}`,
      tags: [subject, "Fiche", "Active Recall", "Examen"],
      provenance: "local_deterministic",
      provider: "ChronoStudy Academic Engine",
      generatedAt: new Date().toISOString(),
    };
  }
}
