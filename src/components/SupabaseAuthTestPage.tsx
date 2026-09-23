import { FormEvent, useState } from "react";

interface ApiResult { status: number; body: any; }
interface StudyGroup { id: string; name: string; subject: string; code: string; memberCount: number; messages: Array<{ id: string; sender: string; text: string; time: string }>; }

async function request(path: string, options: RequestInit = {}): Promise<ApiResult> {
  const response = await fetch(path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  let body: any = text;
  try { body = text ? JSON.parse(text) : {}; } catch {}
  return { status: response.status, body };
}

export function SupabaseAuthTestPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("Test ChronoStudy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("StrongPass-2026");
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [groupName, setGroupName] = useState("Groupe de test Supabase");
  const [groupCode, setGroupCode] = useState("");
  const [message, setMessage] = useState("Message de test depuis ChronoStudy");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [pomodoroId, setPomodoroId] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const runRequest = async (action: string, path: string, options: RequestInit = {}) => {
    setBusy(true);
    try { setResult({ action, ...(await request(path, options)) }); }
    catch (error) { setResult({ action, error: error instanceof Error ? error.message : String(error) }); }
    finally { setBusy(false); }
  };

  const runAuth = async (event: FormEvent) => {
    event.preventDefault();
    const body = mode === "register" ? { name, email, password, role: "Étudiant", university: "Test" } : { email, password };
    await runRequest(mode, `/api/v1/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
  };

  const loadGroups = async () => {
    setBusy(true);
    try {
      const response = await request("/api/v1/groups");
      setGroups(Array.isArray(response.body) ? response.body : []);
      setResult({ action: "list-groups", ...response });
    } finally { setBusy(false); }
  };

  const createGroup = async (event: FormEvent) => {
    event.preventDefault();
    const response = await request("/api/v1/groups", { method: "POST", body: JSON.stringify({ name: groupName, subject: "Test", description: "Groupe de validation Supabase", isPrivate: false }) });
    setResult({ action: "create-group", ...response });
    if (response.body?.id) { setGroups((previous) => [response.body, ...previous]); setSelectedGroup(response.body.id); }
  };

  const joinGroup = async (event: FormEvent) => {
    event.preventDefault();
    const response = await request("/api/v1/groups/join", { method: "POST", body: JSON.stringify({ code: groupCode }) });
    setResult({ action: "join-group", ...response });
    if (response.body?.group) { setGroups((previous) => previous.some((group) => group.id === response.body.group.id) ? previous : [response.body.group, ...previous]); setSelectedGroup(response.body.group.id); }
  };

  const postMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedGroup) return setResult({ action: "message", error: "Sélectionnez un groupe." });
    await runRequest("post-message", `/api/v1/groups/${selectedGroup}/messages`, { method: "POST", body: JSON.stringify({ text: message }) });
    await loadGroups();
  };

  const startPomodoro = async () => {
    const response = await request("/api/v1/pomodoro/start", { method: "POST", body: JSON.stringify({ plannedSeconds: 60, subject: "Test Supabase" }) });
    setResult({ action: "start-pomodoro", ...response });
    if (response.body?.id) setPomodoroId(response.body.id);
  };

  const finishPomodoro = async () => {
    if (!pomodoroId) return setResult({ action: "finish-pomodoro", error: "Démarrez d'abord un Pomodoro." });
    await runRequest("finish-pomodoro", `/api/v1/pomodoro/${pomodoroId}/finish`, { method: "PATCH", body: JSON.stringify({ focusedSeconds: 60, status: "completed" }) });
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", color: "#172033", padding: "36px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <section style={{ maxWidth: 980, margin: "0 auto", background: "white", borderRadius: 20, padding: 32, boxShadow: "0 14px 45px rgba(25,35,70,.10)" }}>
        <p style={{ color: "#5865f2", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", fontSize: 12 }}>ChronoStudy / Supabase integration test</p>
        <h1 style={{ margin: "8px 0 10px", fontSize: 32 }}>Tester l’authentification et les groupes</h1>
        <p style={{ color: "#596273", lineHeight: 1.6 }}>Tous les appels utilisent <code>credentials: include</code>. Les tokens restent dans les cookies HttpOnly gérés par le serveur.</p>

        <div style={gridStyle}>
          <article style={cardStyle}>
            <h2>1. Authentification</h2>
            <div style={{ display: "flex", gap: 8, margin: "14px 0" }}><button type="button" onClick={() => setMode("register")} style={tabStyle(mode === "register")}>Inscription</button><button type="button" onClick={() => setMode("login")} style={tabStyle(mode === "login")}>Connexion</button></div>
            <form onSubmit={runAuth} style={{ display: "grid", gap: 10 }}>
              {mode === "register" && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom complet" style={inputStyle} required />}
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@domaine.fr" style={inputStyle} required />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" style={inputStyle} required minLength={8} />
              <button disabled={busy} type="submit" style={primaryButton}>{mode === "register" ? "Créer le compte" : "Se connecter"}</button>
            </form>
            <div style={buttonRow}><button disabled={busy} onClick={() => runRequest("me", "/api/v1/auth/me")} style={secondaryButton}>Appeler /auth/me</button><button disabled={busy} onClick={() => runRequest("logout", "/api/v1/auth/logout", { method: "POST" })} style={secondaryButton}>Déconnexion</button></div>
          </article>

          <article style={cardStyle}>
            <h2>2. Groupes d’étude</h2>
            <form onSubmit={createGroup} style={{ display: "grid", gap: 10, marginTop: 14 }}><input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Nom du groupe" style={inputStyle} required /><button disabled={busy} type="submit" style={primaryButton}>Créer un groupe</button></form>
            <form onSubmit={joinGroup} style={{ display: "flex", gap: 8, marginTop: 10 }}><input value={groupCode} onChange={(event) => setGroupCode(event.target.value)} placeholder="Code IA-1234" style={{ ...inputStyle, flex: 1 }} required /><button disabled={busy} type="submit" style={secondaryButton}>Rejoindre</button></form>
            <button disabled={busy} onClick={loadGroups} style={{ ...secondaryButton, marginTop: 10 }}>Charger les groupes</button>
            <select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)} style={{ ...inputStyle, width: "100%", marginTop: 10 }}><option value="">Sélectionner un groupe</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name} · {group.code}</option>)}</select>
            <form onSubmit={postMessage} style={{ display: "flex", gap: 8, marginTop: 10 }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" style={{ ...inputStyle, flex: 1 }} required /><button disabled={busy} type="submit" style={secondaryButton}>Publier</button></form>
            <div style={{ marginTop: 12, color: "#596273", fontSize: 13 }}>{groups.length ? groups.map((group) => <div key={group.id}><strong>{group.name}</strong> · {group.memberCount} membre(s) · {group.messages?.length || 0} message(s)</div>) : "Aucun groupe chargé."}</div>
          </article>

          <article style={cardStyle}>
            <h2>3. Sessions et Pomodoro</h2>
            <p style={{ color: "#596273", fontSize: 13 }}>Ces actions vérifient les écritures dans `pomodoro_sessions` et `study_sessions`.</p>
            <div style={buttonRow}><button disabled={busy} onClick={startPomodoro} style={primaryButton}>Démarrer 1 min</button><button disabled={busy || !pomodoroId} onClick={finishPomodoro} style={secondaryButton}>Terminer</button></div>
            <button disabled={busy} onClick={() => runRequest("list-sessions", "/api/v1/study-sessions")} style={{ ...secondaryButton, marginTop: 10 }}>Lister mes sessions</button>
            {pomodoroId && <p style={{ fontSize: 12, color: "#667085" }}>Pomodoro actif : {pomodoroId}</p>}
          </article>
        </div>

        <div style={{ marginTop: 22, padding: 16, background: "#101828", color: "#d1fae5", borderRadius: 12, minHeight: 150, overflow: "auto" }}><div style={{ color: "#98a2b3", marginBottom: 8 }}>Dernière réponse serveur</div><pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{result ? JSON.stringify(result, null, 2) : "Aucune requête exécutée."}</pre></div>
      </section>
    </main>
  );
}

const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 26 } as const;
const cardStyle = { border: "1px solid #eaecf0", borderRadius: 14, padding: 18 } as const;
const inputStyle = { border: "1px solid #d0d5dd", borderRadius: 10, padding: "11px 12px", fontSize: 14 } as const;
const buttonRow = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 } as const;
const primaryButton = { border: 0, borderRadius: 10, padding: "11px 14px", background: "#5865f2", color: "white", fontWeight: 700, cursor: "pointer" } as const;
const secondaryButton = { border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 12px", background: "white", color: "#344054", fontWeight: 600, cursor: "pointer" } as const;
const tabStyle = (active: boolean) => ({ border: 0, borderRadius: 999, padding: "9px 14px", background: active ? "#e0e7ff" : "#f2f4f7", color: active ? "#3730a3" : "#667085", fontWeight: 700, cursor: "pointer" });
