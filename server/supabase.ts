import "dotenv/config";

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface SupabaseAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SupabaseAuthUser;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase non configuré: SUPABASE_URL et SUPABASE_ANON_KEY sont requis.");
  }
  return { url, key };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }
  if (!response.ok) {
    const error = body as { msg?: string; message?: string; error_description?: string; error?: string };
    const message = error.error_description || error.msg || error.message || error.error || `Supabase HTTP ${response.status}`;
    const failure = new Error(message);
    (failure as Error & { status?: number }).status = response.status;
    throw failure;
  }
  return body as T;
}

export async function supabaseAuthRequest<T>(
  path: string,
  options: { method: string; body?: unknown; accessToken?: string },
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  const response = await fetch(`${url}/auth/v1${path}`, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return parseResponse<T>(response);
}

export async function supabaseRestRequest<T>(
  path: string,
  options: { method: string; body?: unknown; accessToken: string; headers?: Record<string, string> },
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    method: options.method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${options.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return parseResponse<T>(response);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}
