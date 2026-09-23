import { FormEvent, useState } from "react";

interface ApiResult {
  status: number;
  body: unknown;
}

async function request(path: string, options: RequestInit = {}): Promise<ApiResult> {
  const response = await fetch(path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  let body: unknown = text;
  try { body = text ? JSON.parse(text) : {}; } catch {}
  return { status: response.status, body };
}

export function SupabaseAuthTestPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("Test ChronoStudy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("StrongPass-2026");
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const run = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const body = mode === "register" ? { name, email, password, role: "Étudiant", university: "Test" } : { email, password };
      const response = await request(`/api/v1/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      setResult({ action: mode, ...response });
    } catch (error) {
      setResult({ action: mode, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  };

  const checkMe = async () => {
    setBusy(true);
    try { setResult({ action: "me", ...(await request("/api/v1/auth/me")) }); }
    catch (error) { setResult({ action: "me", error: error instanceof Error ? error.message : String(error) }); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    try { setResult({ action: "logout", ...(await request("/api/v1/auth/logout", { method: "POST" })) }); }
    catch (error) { setResult({ action: "logout", error: error instanceof Error ? error.message : String(error) }); }
    finally { setBusy(false); }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", color: "#172033", padding: "48px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", background: "white", borderRadius: 20, padding: 32, boxShadow: "0 14px 45px rgba(25,35,70,.10)" }}>
        <p style={{ color: "#5865f2", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", fontSize: 12 }}>ChronoStudy / Auth smoke test</p>
        <h1 style={{ margin: "8px 0 10px", fontSize: 32 }}>Tester Supabase Auth</h1>
        <p style={{ color: "#596273", lineHeight: 1.6 }}>Cette page utilise <code>credentials: include</code>. Le token reste dans le cookie HttpOnly du serveur; JavaScript ne peut pas le lire.</p>

        <div style={{ display: "flex", gap: 8, margin: "24px 0" }}>
          <button type="button" onClick={() => setMode("register")} style={tabStyle(mode === "register")}>Inscription</button>
          <button type="button" onClick={() => setMode("login")} style={tabStyle(mode === "login")}>Connexion</button>
        </div>

        <form onSubmit={run} style={{ display: "grid", gap: 14 }}>
          {mode === "register" && <label style={labelStyle}>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} required minLength={2} /></label>}
          <label style={labelStyle}>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} placeholder="vous@domaine.fr" required /></label>
          <label style={labelStyle}>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} required minLength={8} /></label>
          <button disabled={busy} type="submit" style={primaryButton}>{busy ? "Requête en cours…" : mode === "register" ? "Créer le compte Supabase" : "Se connecter"}</button>
        </form>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
          <button disabled={busy} type="button" onClick={checkMe} style={secondaryButton}>Appeler /api/v1/auth/me</button>
          <button disabled={busy} type="button" onClick={logout} style={secondaryButton}>Déconnexion</button>
        </div>

        <div style={{ marginTop: 26, padding: 16, background: "#101828", color: "#d1fae5", borderRadius: 12, minHeight: 120, overflow: "auto" }}>
          <div style={{ color: "#98a2b3", marginBottom: 8 }}>Réponse serveur</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{result ? JSON.stringify(result, null, 2) : "Aucune requête exécutée."}</pre>
        </div>
      </section>
    </main>
  );
}

const labelStyle = { display: "grid", gap: 6, fontWeight: 600, fontSize: 14 } as const;
const inputStyle = { border: "1px solid #d0d5dd", borderRadius: 10, padding: "11px 12px", fontSize: 15 } as const;
const primaryButton = { border: 0, borderRadius: 10, padding: "12px 16px", background: "#5865f2", color: "white", fontWeight: 700, cursor: "pointer" } as const;
const secondaryButton = { border: "1px solid #d0d5dd", borderRadius: 10, padding: "11px 14px", background: "white", color: "#344054", fontWeight: 600, cursor: "pointer" } as const;
const tabStyle = (active: boolean) => ({ border: 0, borderRadius: 999, padding: "9px 14px", background: active ? "#e0e7ff" : "#f2f4f7", color: active ? "#3730a3" : "#667085", fontWeight: 700, cursor: "pointer" });
