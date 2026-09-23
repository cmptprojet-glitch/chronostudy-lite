import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request) => {
  const { prompt, context } = await request.json();
  if (typeof prompt !== "string" || prompt.trim().length < 2) return json({ error: "prompt is required" }, 400);
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "AI provider is not configured" }, 503);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: `${context ? `Context:\n${String(context).slice(0, 12000)}\n\n` : ""}${prompt.slice(0, 12000)}` }] }] }) });
  if (!response.ok) return json({ error: "AI provider request failed" }, 502);
  const payload = await response.json();
  return json({ text: payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "" });
}));
