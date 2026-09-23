import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test, before, after } from "node:test";

const port = 4300 + Math.floor(Math.random() * 200);
const baseUrl = `http://127.0.0.1:${port}`;
let serverProcess;

function cookieHeader(response) {
  const cookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : (response.headers.get("set-cookie") || "").split(/,(?=[^;]+=[^;]+)/);
  return cookies.map((cookie) => cookie.split(";", 1)[0]).filter(Boolean).join("; ");
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : {}; } catch {}
  return { response, body };
}

before(async () => {
  serverProcess = spawn(process.execPath, ["dist/server.cjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Serveur non prêt. Sortie: ${output}`)), 10000);
    serverProcess.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes(`:${port}`)) { clearTimeout(timer); resolve(); }
    });
    serverProcess.stderr.on("data", (chunk) => { output += chunk.toString(); });
    serverProcess.once("error", reject);
    serverProcess.once("exit", (code) => code !== 0 && reject(new Error(`Serveur arrêté (${code}). Sortie: ${output}`)));
  });
  await ready;
});

after(async () => {
  if (!serverProcess) return;
  serverProcess.kill("SIGTERM");
  await Promise.race([once(serverProcess, "exit"), new Promise((resolve) => setTimeout(resolve, 1000))]);
});

test("health confirme Supabase Auth", async () => {
  const { response, body } = await api("/api/health");
  assert.equal(response.status, 200);
  assert.equal(body.compliance.authProvider, "supabase_auth");
});

test("les routes privées refusent une requête sans session", async () => {
  const paths = [
    ["GET", "/api/v1/auth/me"],
    ["GET", "/api/v1/groups"],
    ["GET", "/api/v1/study-sessions"],
    ["POST", "/api/v1/pomodoro/start"],
    ["GET", "/api/v1/decks"],
    ["POST", "/api/v1/srs/review"],
    ["GET", "/api/v1/analytics/overview"],
  ];
  for (const [method, path] of paths) {
    const { response } = await api(path, { method });
    assert.equal(response.status, 401, `${method} ${path} doit répondre 401`);
  }
});

test("le shell frontend auth-test est disponible", async () => {
  const { response, body } = await api("/auth-test");
  assert.equal(response.status, 200);
  assert.match(String(body), /<div id="root"><\/div>/);
});

const hasCredentials = Boolean(process.env.TEST_AUTH_EMAIL && process.env.TEST_AUTH_PASSWORD);
test("flux authentifié Supabase: auth, groupes, sessions et Pomodoro", { skip: !hasCredentials }, async () => {
  const login = await api("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: process.env.TEST_AUTH_EMAIL, password: process.env.TEST_AUTH_PASSWORD }),
  });
  assert.equal(login.response.status, 200, JSON.stringify(login.body));
  const cookies = cookieHeader(login.response);
  assert.match(cookies, /chronostudy_session=/);
  assert.match(cookies, /chronostudy_refresh=/);

  const me = await api("/api/v1/auth/me", { headers: { cookie: cookies } });
  assert.equal(me.response.status, 200, JSON.stringify(me.body));
  assert.equal(me.body.authenticated, true);

  const group = await api("/api/v1/groups", { headers: { cookie: cookies } });
  assert.equal(group.response.status, 200, JSON.stringify(group.body));
  assert.ok(Array.isArray(group.body));

  const createdGroup = await api("/api/v1/groups", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ name: `Integration ${Date.now()}`, subject: "Tests", description: "Groupe de test automatisé" }),
  });
  assert.equal(createdGroup.response.status, 201, JSON.stringify(createdGroup.body));
  assert.ok(createdGroup.body.id);

  const message = await api(`/api/v1/groups/${createdGroup.body.id}/messages`, {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ text: "Message d'intégration" }),
  });
  assert.equal(message.response.status, 200, JSON.stringify(message.body));

  const session = await api("/api/v1/study-sessions", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ type: "manual", subject: "Tests", topic: "Auth", durationMinutes: 5 }),
  });
  assert.equal(session.response.status, 201, JSON.stringify(session.body));
  assert.equal(session.body.durationMinutes, 5);

  const pomodoro = await api("/api/v1/pomodoro/start", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ plannedSeconds: 60, subject: "Tests" }),
  });
  assert.equal(pomodoro.response.status, 201, JSON.stringify(pomodoro.body));
  const finished = await api(`/api/v1/pomodoro/${pomodoro.body.id}/finish`, {
    method: "PATCH",
    headers: { cookie: cookies },
    body: JSON.stringify({ focusedSeconds: 60, status: "completed" }),
  });
  assert.equal(finished.response.status, 200, JSON.stringify(finished.body));

  const sessions = await api("/api/v1/study-sessions", { headers: { cookie: cookies } });
  assert.equal(sessions.response.status, 200, JSON.stringify(sessions.body));
  assert.ok(sessions.body.some((entry) => entry.id === session.body.id));

  const deck = await api("/api/v1/decks", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ title: `Deck integration ${Date.now()}`, subject: "Tests", cards: [{ cardKey: "card-1", question: "2+2 ?", answer: "4" }] }),
  });
  assert.equal(deck.response.status, 201, JSON.stringify(deck.body));
  assert.ok(deck.body.id);
  assert.equal(deck.body.cards.length, 1);

  const review = await api("/api/v1/srs/review", {
    method: "POST",
    headers: { cookie: cookies },
    body: JSON.stringify({ deckId: deck.body.id, cardKey: "card-1", quality: 5 }),
  });
  assert.equal(review.response.status, 200, JSON.stringify(review.body));
  assert.equal(review.body.success, true);

  const analytics = await api("/api/v1/analytics/overview", { headers: { cookie: cookies } });
  assert.equal(analytics.response.status, 200, JSON.stringify(analytics.body));
  assert.ok(analytics.body.totals);
  assert.ok(Array.isArray(analytics.body.daily));
  assert.ok(Array.isArray(analytics.body.subjects));
  assert.ok(analytics.body.pomodoro);
  assert.ok(analytics.body.insights);
});
