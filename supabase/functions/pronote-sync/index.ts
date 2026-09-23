import { authenticated, json } from "../_shared/http.ts";

Deno.serve((request) => authenticated(request, async (request, userId) => {
  const endpoint = Deno.env.get("PRONOTE_SYNC_URL");
  const token = Deno.env.get("PRONOTE_SYNC_TOKEN");
  if (!endpoint || !token) return json({ error: "Pronote integration is not configured", userId }, 503);
  const upstream = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
  if (!upstream.ok) return json({ error: "Pronote synchronization failed" }, 502);
  return json({ synchronized: true, data: await upstream.json() });
}));
