import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Authentication required");
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new Error("Invalid session");
  return { client, user: data.user };
}

export async function authenticated(request: Request, handler: (request: Request, userId: string) => Promise<Response>) {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { user } = await requireUser(request);
    return await handler(request, user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return json({ error: message }, message.includes("Authentication") || message.includes("session") ? 401 : 500);
  }
}
