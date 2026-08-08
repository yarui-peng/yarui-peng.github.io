import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const port = Number(process.env.PORT ?? 8787);
const Host = process.env.HOST ?? '127.0.0.1';
const DevelopmentOpenLogin = process.env.NODE_ENV !== 'production' && process.env.DEV_OPEN_LOGIN !== 'false';
const SessionMaxAgeMs = 8 * 60 * 60 * 1000;
const SessionStore = new Map();
const DataDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');

function SendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function SendHtml(response, status, markup) {
  response.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(markup);
}

function EscapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function ParseCookies(request) {
  return Object.fromEntries((request.headers.cookie ?? '').split(';').filter(Boolean).map((part) => {
    const [name, ...value] = part.trim().split('=');
    return [name, decodeURIComponent(value.join('='))];
  }));
}

function GetSession(request) {
  const token = ParseCookies(request).E3DASession;
  const session = token ? SessionStore.get(token) : undefined;
  if (!session || session.ExpiresAt < Date.now()) {
    if (token) SessionStore.delete(token);
    return undefined;
  }
  return session;
}

function CreateSession(username) {
  const token = randomBytes(24).toString('base64url');
  SessionStore.set(token, { Username: username, IsAdmin: username === 'yrpeng', ExpiresAt: Date.now() + SessionMaxAgeMs });
  return token;
}

function PageLayout(title, body, session) {
  const userMenu = session
    ? `<span class="UserBadge">${EscapeHtml(session.Username)}${session.IsAdmin ? ' · admin' : ''}</span><a href="/logout">Log out</a>`
    : '<a href="/login">Log in</a>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${EscapeHtml(title)} · E3DA</title><style>
    :root{color-scheme:light;--Ink:#17233c;--Muted:#5d6b82;--Panel:#fff;--Page:#eef3fb;--Accent:#26326d;--Line:#d6deef;--Good:#0a9543}*{box-sizing:border-box}body{margin:0;background:var(--Page);color:var(--Ink);font:16px/1.5 ui-sans-serif,system-ui,sans-serif}.Shell{max-width:1080px;margin:auto;padding:0 1rem}.Bar{background:var(--Accent);color:#fff}.BarInner{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:3.5rem}.Brand{font-weight:700;color:#fff;text-decoration:none;letter-spacing:.02em}.Nav{display:flex;align-items:center;gap:1rem}.Nav a{color:#fff;text-decoration:none}.UserBadge{font-size:.9rem;opacity:.9}.Main{padding:2rem 0}.Panel{background:var(--Panel);border:1px solid var(--Line);border-radius:6px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 5px 18px #26326d12}.Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.Title{margin:0 0 .4rem;font-size:clamp(1.5rem,4vw,2.2rem)}.Muted{color:var(--Muted)}label{display:block;font-weight:600;margin:.75rem 0 .25rem}input{width:100%;padding:.65rem;border:1px solid var(--Line);border-radius:4px;font:inherit}button,.Button{display:inline-block;margin-top:1rem;padding:.65rem 1rem;border:0;border-radius:4px;background:var(--Accent);color:#fff;font:inherit;text-decoration:none;cursor:pointer}.Notice{padding:.75rem;border-left:4px solid var(--Good);background:#e8f6ee}.TableWrap{overflow:auto}.DataTable{border-collapse:collapse;width:100%;min-width:480px}.DataTable th,.DataTable td{text-align:left;padding:.65rem;border-bottom:1px solid var(--Line);white-space:nowrap}.DataTable th{background:#f3f6fc}.Small{font-size:.85rem}@media(max-width:600px){.BarInner{align-items:flex-start;flex-direction:column;padding:.7rem 0}.Nav{width:100%;justify-content:space-between}.Main{padding:1rem 0}.Panel{padding:1rem}}
  </style></head><body><header class="Bar"><div class="Shell BarInner"><a class="Brand" href="/app">E3DA Lab · Dynamic</a><nav class="Nav">${userMenu}</nav></div></header><main class="Shell Main">${body}</main></body></html>`;
}

function LoginPage(message = '') {
  const DevelopmentNotice = DevelopmentOpenLogin ? '<div class="Notice Small">Development mode: any non-empty username is accepted. This mode must not be used in production.</div>' : '';
  return PageLayout('Login', `<section class="Panel" style="max-width:30rem;margin:2rem auto"><h1 class="Title">Dynamic site login</h1><p class="Muted">Sign in to access teaching and member services.</p>${DevelopmentNotice}${message ? `<p class="Notice">${EscapeHtml(message)}</p>` : ''}<form method="post" action="/login"><label for="username">Username</label><input id="username" name="username" autocomplete="username" required><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">Log in</button></form></section>`, undefined);
}

function DashboardPage(session, rows) {
  const headings = rows.length ? Object.keys(rows[0]) : [];
  const table = rows.length ? `<div class="TableWrap"><table class="DataTable"><thead><tr>${headings.map((heading) => `<th>${EscapeHtml(heading)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headings.map((heading) => `<td>${EscapeHtml(row[heading])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="Muted">No teaching records yet.</p>';
  return PageLayout('Dashboard', `<section class="Panel"><h1 class="Title">Member dashboard</h1><p>Welcome, <strong>${EscapeHtml(session.Username)}</strong>.</p><p class="Muted">This standalone site is intentionally separate from the public Astro site.</p></section><section class="Panel"><h2>Teaching records</h2>${table}</section>${session.IsAdmin ? '<section class="Panel"><h2>Administration</h2><p class="Muted">Admin tools will be added behind explicit role checks. The development identity <code>yrpeng</code> currently receives the admin role.</p></section>' : ''}`, session);
}

function ParseCsv(text) {
  const Records = [];
  let Record = [], Field = '', Quoted = false;
  for (let Index = 0; Index < text.length; Index += 1) {
    const Character = text[Index];
    const Next = text[Index + 1];
    if (Character === '"' && Quoted && Next === '"') { Field += '"'; Index += 1; }
    else if (Character === '"') Quoted = !Quoted;
    else if (Character === ',' && !Quoted) { Record.push(Field); Field = ''; }
    else if ((Character === '\n' || Character === '\r') && !Quoted) {
      if (Character === '\r' && Next === '\n') Index += 1;
      Record.push(Field); Field = '';
      if (Record.some((Value) => Value.length)) Records.push(Record);
      Record = [];
    } else Field += Character;
  }
  if (Field.length || Record.length) { Record.push(Field); Records.push(Record); }
  const [Headers, ...Values] = Records;
  return Values.map((Value) => Object.fromEntries(Headers.map((Header, Index) => [Header, Value[Index] ?? ''])));
}

async function ReadTeachingRecords() {
  try {
    return ParseCsv(await readFile(path.join(DataDirectory, 'teaching.csv'), 'utf8'));
  } catch {
    return [];
  }
}

async function ReadRequestBody(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return new URLSearchParams(body);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const session = GetSession(request);

  if (request.method === 'GET' && url.pathname === '/healthz') {
    SendJson(response, 200, { service: 'e3da-v3-dynamic', status: 'ok' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/') {
    response.writeHead(302, { Location: '/app' });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/login') {
    SendHtml(response, 200, LoginPage());
    return;
  }

  if (request.method === 'POST' && url.pathname === '/login') {
    const form = await ReadRequestBody(request);
    const username = (form.get('username') ?? '').trim().toLowerCase();
    if (!DevelopmentOpenLogin) {
      SendHtml(response, 401, LoginPage('Login is not configured for this environment.'));
      return;
    }
    if (!username) {
      SendHtml(response, 401, LoginPage('Enter a username.'));
      return;
    }
    const token = CreateSession(username);
    response.writeHead(302, { Location: '/app', 'Set-Cookie': `E3DASession=${token}; HttpOnly; SameSite=Lax; Path=/` });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/logout') {
    const token = ParseCookies(request).E3DASession;
    if (token) SessionStore.delete(token);
    response.writeHead(302, { Location: '/login', 'Set-Cookie': 'E3DASession=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/' });
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/app') {
    if (!session) {
      response.writeHead(302, { Location: '/login' });
      response.end();
      return;
    }
    SendHtml(response, 200, DashboardPage(session, await ReadTeachingRecords()));
    return;
  }

  SendJson(response, 404, { error: 'not_found' });
});

server.listen(port, Host, () => {
  console.log(`E3DA v3 dynamic service listening on ${Host}:${port}`);
});
