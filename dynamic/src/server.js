import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const port = Number(process.env.PORT ?? 8787);
const Host = process.env.HOST ?? '127.0.0.1';
const DevelopmentOpenLogin = process.env.NODE_ENV !== 'production' && process.env.DEV_OPEN_LOGIN !== 'false';
const PublicSiteUrl = process.env.PUBLIC_SITE_URL ?? 'https://yarui-peng.github.io/';
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

function LegacyPageLayout(title, body, session) {
  const userMenu = session
    ? `<span class="UserBadge">${EscapeHtml(session.Username)}${session.IsAdmin ? ' · admin' : ''}</span><a href="/logout">Log out</a>`
    : '<a href="/login">Log in</a>';
  return `<!doctype html><html lang="en" data-theme="e3da-light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="E3DA Lab member services"><title>${EscapeHtml(title)} · E3DA Lab</title><script>(()=>{const themes=['e3da-light','e3da-dark'];const saved=localStorage.getItem('e3da-theme');document.documentElement.dataset.theme=themes.includes(saved??'')?saved:'e3da-light';})();</script><style>
    :root{color-scheme:light;--Page:#fff;--Ink:#1e1e1e;--Muted:#5d6470;--Panel:#fff;--Primary:#2776b9;--PrimaryContent:#fff;--Secondary:#087a38;--SecondaryContent:#fff;--Accent:#26326d;--AccentContent:#fff;--Line:#d6deef}html[data-theme="e3da-dark"]{color-scheme:dark;--Page:#171426;--Ink:#f4f7ff;--Muted:#c4c9d8;--Panel:#171426;--Primary:#44398d;--PrimaryContent:#f4f1ff;--Secondary:#176b4b;--SecondaryContent:#f6f2ff;--Accent:#2b1d52;--AccentContent:#f4f1ff;--Line:#382e57}*{box-sizing:border-box}body{margin:0;background:var(--Page);color:var(--Ink);font:16px/1.5 Arial,Helvetica,sans-serif}.Shell{width:min(100% - 1.5rem,71.25rem);margin:auto}.Bar{position:fixed;inset:0 0 auto;background:var(--Accent);color:var(--AccentContent);z-index:10}.BarInner{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:3rem}.Brand,.Nav a,.ThemeButton{color:var(--AccentContent);text-decoration:none}.Brand{font-weight:700}.Nav{display:flex;align-items:center;gap:.75rem}.UserBadge{font-size:.9rem;opacity:.9}.ThemeButton{border:0;background:transparent;padding:.4rem .6rem;border-radius:6px;font:inherit;cursor:pointer}.ThemeButton:hover{background:color-mix(in srgb,var(--AccentContent) 14%,var(--Accent))}.Main{padding:4rem 0 2rem}.Panel{background:var(--Panel);border:2px solid var(--Primary);border-radius:6px;margin-bottom:1rem;box-shadow:0 .125rem .5rem color-mix(in srgb,var(--Ink) 10%,transparent);transition:box-shadow .18s ease}.Panel:hover{box-shadow:0 .35rem 1rem color-mix(in srgb,var(--Ink) 23%,transparent)}.PanelHeader{margin:0;border-bottom:1px solid var(--Primary);border-radius:4px 4px 0 0;background:var(--Primary);color:var(--PrimaryContent);padding:.6rem .75rem;text-align:center;font-size:1.2rem}.PanelBody{padding:1rem}.Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}.Title{margin:0 0 .4rem;font-size:clamp(1.5rem,4vw,2.2rem)}.Muted{color:var(--Muted)}label{display:block;font-weight:600;margin:.75rem 0 .25rem}input{width:100%;padding:.65rem;border:1px solid var(--Line);border-radius:6px;background:var(--Panel);color:var(--Ink);font:inherit}button,.Button{display:inline-block;margin-top:1rem;padding:.65rem 1rem;border:0;border-radius:6px;background:var(--Primary);color:var(--PrimaryContent);font:inherit;text-decoration:none;cursor:pointer}.Button:hover,button:hover{filter:brightness(1.1)}.Notice{padding:.75rem;border-left:4px solid var(--Secondary);background:color-mix(in srgb,var(--Secondary) 12%,var(--Panel))}.TableWrap{overflow:auto}.DataTable{border-collapse:collapse;width:100%;min-width:480px}.DataTable th,.DataTable td{text-align:left;padding:.65rem;border-bottom:1px solid var(--Line);white-space:nowrap}.DataTable th{background:var(--Accent);color:var(--AccentContent);font-weight:700;text-align:center}.DataTable tbody tr:hover{background:color-mix(in srgb,var(--Primary) 12%,var(--Panel))}.Small{font-size:.85rem}@media(max-width:600px){.BarInner{align-items:flex-start;flex-direction:column;padding:.7rem 0}.Nav{width:100%;justify-content:flex-end}.Main{padding-top:5rem}.PanelBody{padding:.75rem}}
  </style></head><body><header class="Bar"><div class="Shell BarInner"><a class="Brand" href="/app">E3DA Lab · Member Services</a><nav class="Nav"><a href="${EscapeHtml(PublicSiteUrl)}">Public site</a><button class="ThemeButton" type="button" id="theme-toggle" aria-label="Toggle light/dark mode">☀ <span id="theme-label">Light</span></button>${userMenu}</nav></div></header><main class="Shell Main">${body}</main><script>const button=document.querySelector('#theme-toggle');const label=document.querySelector('#theme-label');const themes=['e3da-light','e3da-dark'];function update(){const index=Math.max(0,themes.indexOf(document.documentElement.dataset.theme??'e3da-light'));if(label)label.textContent=index===0?'Light':'Dark';if(button)button.setAttribute('aria-label','Toggle light/dark mode (current: '+(index===0?'Light':'Dark')+')')}update();button?.addEventListener('click',()=>{const current=document.documentElement.dataset.theme??'e3da-light';const next=themes[(themes.indexOf(current)+1)%themes.length];document.documentElement.dataset.theme=next;localStorage.setItem('e3da-theme',next);update()});</script></body></html>`;
}

function PageLayout(title, body, session) {
  const userMenu = session
    ? `<span class="UserBadge">${EscapeHtml(session.Username)}${session.IsAdmin ? ' · admin' : ''}</span><a href="/logout">Log out</a>`
    : '<a href="/login">Log in</a>';
  return `<!doctype html><html lang="en" data-theme="e3da-light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="E3DA Lab member services"><title>${EscapeHtml(title)} · E3DA Lab</title><script>(()=>{const themes=['e3da-light','e3da-dark'];const saved=localStorage.getItem('e3da-theme');document.documentElement.dataset.theme=themes.includes(saved??'')?saved:'e3da-light';})();</script><style>
    :root{color-scheme:light;--e3da-radius:.375rem;--color-base-100:#fff;--color-base-200:#f3f6fc;--color-base-300:#d6deef;--color-base-content:#1e1e1e;--color-primary:#2776b9;--color-primary-content:#fff;--color-secondary:#087a38;--color-secondary-content:#fff;--color-accent:#26326d;--color-accent-content:#fff;--color-info:#2776b9}html[data-theme="e3da-dark"]{color-scheme:dark;--color-base-100:#171426;--color-base-200:#211b38;--color-base-300:#382e57;--color-base-content:#f4f7ff;--color-primary:#44398d;--color-primary-content:#f4f1ff;--color-secondary:#176b4b;--color-secondary-content:#f6f2ff;--color-accent:#2b1d52;--color-accent-content:#f4f1ff;--color-info:#77b9e8}*{box-sizing:border-box}body{margin:0;color:var(--color-base-content);background:var(--color-base-100);font:16px/1.5 Arial,Helvetica,sans-serif}.site-page{padding-top:3.5rem}.site-container{width:min(100% - 1.5rem,71.25rem);margin:auto}.site-navbar{position:fixed;inset:0 0 auto;z-index:10;display:flex;min-height:3rem;align-items:center;justify-content:space-between;padding:0 .75rem;background:var(--color-accent);color:var(--color-accent-content)}.navbar-brand,.site-navbar a,.theme-toggle{color:color-mix(in srgb,var(--color-accent-content) 90%,transparent);text-decoration:none}.navbar-brand{font-weight:600}.navbar-end{display:flex;align-items:center;gap:.75rem}.theme-toggle{margin-top:0;border:0;border-radius:var(--e3da-radius);background:transparent;padding:.4rem .6rem;font:inherit;cursor:pointer}.theme-toggle:hover{background:color-mix(in srgb,var(--color-accent-content) 14%,var(--color-accent))}.UserBadge{font-size:.9rem;opacity:.9}.site-card{margin-bottom:.5rem;border:2px solid var(--color-primary);border-radius:var(--e3da-radius);overflow:hidden;background:var(--color-base-100);box-shadow:0 .125rem .5rem color-mix(in srgb,var(--color-base-content) 10%,transparent);transition:box-shadow 180ms ease}.site-card-success{border-color:var(--color-secondary)}.site-card:hover{box-shadow:0 .35rem 1rem color-mix(in srgb,var(--color-base-content) 23%,transparent)}.site-card-header{margin:0;border-bottom:1px solid currentColor;border-radius:calc(var(--e3da-radius) - 2px) calc(var(--e3da-radius) - 2px) 0 0;padding:.5rem 1rem;background:var(--color-primary);color:var(--color-primary-content);text-align:center;font-size:1.2rem}.site-card-success .site-card-header{background:var(--color-secondary);color:var(--color-secondary-content)}.card-body{padding:1rem}.card-body p{margin-top:0}.Muted,.text-base-content\/70{color:color-mix(in srgb,var(--color-base-content) 68%,var(--color-base-100))}.site-data-table{border-collapse:collapse;width:100%;min-width:480px}.table-scroll{overflow:auto}.site-data-table th,.site-data-table td{text-align:left;padding:.65rem;border-bottom:1px solid var(--color-base-300);white-space:nowrap}.site-data-table th{background:var(--color-accent);color:var(--color-accent-content);font-weight:700;text-align:center}.site-data-table tbody tr:hover{background:color-mix(in srgb,var(--color-primary) 12%,var(--color-base-100))}.site-data-table tbody tr:nth-child(even){background:var(--color-base-200)}label{display:block;margin:.75rem 0 .25rem;font-weight:600}input{width:100%;padding:.65rem;border:1px solid var(--color-base-300);border-radius:var(--e3da-radius);background:var(--color-base-100);color:var(--color-base-content);font:inherit}button,.btn{display:inline-block;margin-top:1rem;border:0;border-radius:var(--e3da-radius);padding:.65rem 1rem;background:var(--color-primary);color:var(--color-primary-content);font:inherit;text-decoration:none;cursor:pointer}.Notice{padding:.75rem;border-left:4px solid var(--color-secondary);background:color-mix(in srgb,var(--color-secondary) 12%,var(--color-base-100))}.Small{font-size:.85rem}@media(max-width:600px){.site-navbar{min-height:4rem;align-items:flex-start;padding-top:.7rem;padding-bottom:.7rem}.site-page{padding-top:5rem}.navbar-end{gap:.35rem}.card-body{padding:.75rem}}
  </style></head><body class="site-page"><header class="site-navbar"><a class="navbar-brand" href="/app">E3DA Lab · Member Services</a><div class="navbar-end"><a class="hidden-sm" href="${EscapeHtml(PublicSiteUrl)}">Public site</a><button class="theme-toggle" type="button" id="theme-toggle" aria-label="Toggle light/dark mode">☀ <span id="theme-label">Light</span></button><nav>${userMenu}</nav></div></header><main class="site-container">${body}</main><script>const button=document.querySelector('#theme-toggle');const label=document.querySelector('#theme-label');const themes=['e3da-light','e3da-dark'];function update(){const index=Math.max(0,themes.indexOf(document.documentElement.dataset.theme??'e3da-light'));if(label)label.textContent=index===0?'Light':'Dark';if(button)button.setAttribute('aria-label','Toggle light/dark mode (current: '+(index===0?'Light':'Dark')+')')}update();button?.addEventListener('click',()=>{const current=document.documentElement.dataset.theme??'e3da-light';const next=themes[(themes.indexOf(current)+1)%themes.length];document.documentElement.dataset.theme=next;localStorage.setItem('e3da-theme',next);update()});</script></body></html>`;
}

function LoginPage(message = '') {
  const DevelopmentNotice = DevelopmentOpenLogin ? '<div class="Notice Small">Development mode: any non-empty username is accepted. This mode must not be used in production.</div>' : '';
  return PageLayout('Login', `<section class="site-card site-card-primary" style="max-width:30rem;margin:2rem auto"><h1 class="site-card-header" style="border-radius:0">Member services login</h1><div class="card-body"><p class="Muted">Sign in to access teaching and member services.</p>${DevelopmentNotice}${message ? `<p class="Notice">${EscapeHtml(message)}</p>` : ''}<form method="post" action="/login"><label for="username">Username</label><input id="username" name="username" autocomplete="username" required><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">Log in</button></form></div></section>`, undefined);
}

function DashboardPage(session, rows) {
  const headings = rows.length ? Object.keys(rows[0]) : [];
  const table = rows.length ? `<div class="TableWrap"><table class="DataTable"><thead><tr>${headings.map((heading) => `<th>${EscapeHtml(heading)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headings.map((heading) => `<td>${EscapeHtml(row[heading])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="Muted">No teaching records yet.</p>';
  return PageLayout('Dashboard', `<section class="site-card site-card-primary"><h1 class="site-card-header" style="border-radius:0">Member dashboard</h1><div class="card-body"><p>Welcome, <strong>${EscapeHtml(session.Username)}</strong>.</p><p class="Muted">This standalone site is intentionally separate from the public Astro site.</p></div></section><section class="site-card site-card-success"><h2 class="site-card-header" style="border-radius:0">Teaching records</h2><div class="card-body">${table}</div></section>${session.IsAdmin ? '<section class="site-card site-card-success"><h2 class="site-card-header" style="border-radius:0">Administration</h2><div class="card-body"><p class="Muted">Admin tools will be added behind explicit role checks. The development identity <code>yrpeng</code> currently receives the admin role.</p></div></section>' : ''}`, session);
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
