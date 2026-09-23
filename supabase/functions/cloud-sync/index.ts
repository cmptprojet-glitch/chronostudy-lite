import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request, userId) => {
  const { provider, operation = "pull", payload = {} } = await request.json();
  if (!["google_drive", "onedrive", "dropbox", "icloud"].includes(provider)) return json({ error: "Unsupported provider" }, 400);
  const endpoint = Deno.env.get(`${String(provider).toUpperCase()}_SYNC_URL`);
  const token = Deno.env.get(`${String(provider).toUpperCase()}_SYNC_TOKEN`);
  if (!endpoint || !token) return json({ error: `${provider} integration is not configured` }, 503);
  const upstream = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ userId, operation, payload }) });
  if (!upstream.ok) return json({ error: `${provider} synchronization failed` }, 502);
  return json({ provider, operation, synchronized: true, data: await upstream.json() });
}));
