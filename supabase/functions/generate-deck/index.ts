import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request) => {
  const body = await request.json();
  const subject = String(body.subject ?? "General").slice(0, 120);
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const documentText = String(body.documentText ?? "").slice(0, 30000);
  if (topic.length < 2) return json({ error: "topic is required" }, 400);
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "AI provider is not configured" }, 503);
  const count = Math.min(50, Math.max(1, Number(body.cardCount) || 10));
  const prompt = "Generate " + count + " study flashcards as strict JSON with a cards array. Each item must have question, answer, explanation and tags. Subject: " + subject + ". Topic: " + topic.slice(0, 300) + ". Source text: " + documentText;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(apiKey), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) });
  if (!response.ok) return json({ error: "AI provider request failed" }, 502);
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "{\"cards\":[]}";
  try { return json(JSON.parse(text)); } catch { return json({ error: "AI returned invalid JSON" }, 502); }
}));
