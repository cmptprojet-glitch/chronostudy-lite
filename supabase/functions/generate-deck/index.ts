import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request) => {
  const { subject, topic, documentText, cardCount = 10 } = await request.json();
  if (typeof topic !== "string" || topic.trim().length < 2) return json({ error: "topic is required" }, 400);
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "AI provider is not configured" }, 503);
  const prompt = `Generate ${Math.min(50, Math.max(1, Number(cardCount) || 10)} study flashcards as strict JSON with a cards array. Each item must have question, answer, explanation and tags. Subject: ${String(subject ?? "General").slice(0, 120)}. Topic: ${topic.slice(0, 300)}. Source text: ${String(documentText ?? "").slice(0, 30000)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) });
  if (!response.ok) return json({ error: "AI provider request failed" }, 502);
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "{\"cards\":[]}";
  try { return json(JSON.parse(text)); } catch { return json({ error: "AI returned invalid JSON" }, 502); }
}));
