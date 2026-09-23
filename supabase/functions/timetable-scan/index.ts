import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request) => {
  const { documentText } = await request.json();
  if (typeof documentText !== "string" || documentText.trim().length < 5) return json({ error: "documentText is required" }, 400);
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "OCR provider is not configured" }, 503);
  const prompt = `Extract study schedule entries from this OCR text. Return strict JSON {"entries":[{"title":string,"subject":string,"startsAt":ISO8601,"endsAt":ISO8601,"location":string|null}]}. Do not invent entries. Text: ${documentText.slice(0, 40000)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) });
  if (!response.ok) return json({ error: "OCR provider request failed" }, 502);
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "{\"entries\":[]}";
  try { return json(JSON.parse(text)); } catch { return json({ error: "OCR returned invalid JSON" }, 502); }
}));
