import crypto from "node:crypto";
import { computeStats, readEvents } from "../lib/audit.js";
import { rateLimit } from "../lib/rateLimit.js";

const COOKIE_NAME = "fabian_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

function signature(value) {
  return crypto
    .createHmac("sha256", process.env.ADMIN_TOKEN || "")
    .update(value)
    .digest("hex");
}

export function isAdminAuthed(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const raw = parseCookies(req)[COOKIE_NAME];
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = signature(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 16 * 1024) {
        reject(new Error("too_large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function basePage(title, body) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<style>
  :root { --bg:#131315; --panel:#1c1c20; --border:#2c2c33; --text:#f4f1ec; --text2:#a5a39d; --text3:#71706b; --orange:#ff6a1f; --red:#e5484d; --radius:4px; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:"Roboto", Arial, sans-serif; font-size:14px; line-height:1.6; padding:24px; }
  .wrap { max-width:1080px; margin:0 auto; }
  h1 { font-size:22px; margin-bottom:20px; }
  h1 small { color:var(--text3); font-size:13px; font-weight:400; margin-left:10px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:24px; }
  .stat { background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:14px 16px; }
  .stat b { display:block; font-size:22px; color:var(--orange); }
  .stat span { color:var(--text3); font-size:12px; }
  table { width:100%; border-collapse:collapse; background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; font-size:12.5px; }
  th, td { text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
  th { background:#222227; color:var(--text3); font-weight:500; font-size:11px; text-transform:lowercase; }
  td { color:var(--text2); }
  .msg { max-width:340px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ip { font-family:monospace; color:var(--text); }
  .mono { font-family:monospace; font-size:11.5px; }
  .err { color:var(--red); }
  .loginBox { max-width:340px; margin:10vh auto 0; background:var(--panel); border:1px solid var(--border); border-radius:var(--radius); padding:24px; }
  .loginBox h1 { font-size:18px; margin-bottom:14px; }
  input { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius); color:var(--text); padding:10px 12px; font-size:14px; margin-bottom:12px; outline:none; }
  input:focus { border-color:rgba(255,106,31,0.55); }
  button { background:var(--orange); color:#1a0d04; border:none; border-radius:var(--radius); padding:10px 18px; font-size:14px; font-weight:500; cursor:pointer; width:100%; }
  .bad { color:var(--red); font-size:13px; margin-bottom:10px; }
  a { color:var(--orange); }
</style>
</head>
<body><div class="wrap">${body}</div></body>
</html>`;
}

function conversationHtml(event) {
  const msgs = Array.isArray(event.messages) ? event.messages : [];
  if (!msgs.length) return "";
  const blocks = msgs.map((m) => {
    const who = m.role === "user" ? "Użytkownik" : escapeHtml(event.persona || "Fabian");
    return `<div style="margin-bottom:8px"><div class="mono" style="color:var(--orange);font-size:11px">${who}</div><div class="convMsg">${escapeHtml(m.content)}</div></div>`;
  }).join("");
  const resp = event.response
    ? `<div style="margin-bottom:4px"><div class="mono" style="color:var(--orange);font-size:11px">${escapeHtml(event.persona || "Fabian")} (odpowiedź)</div><div class="convMsg">${escapeHtml(event.response)}</div></div>`
    : "";
  return `<details style="margin-top:6px"><summary class="mono" style="cursor:pointer;color:var(--text3);font-size:11px">rozmowa (${msgs.length}) + odpowiedź</summary><div style="margin-top:8px">${blocks}${resp}</div></details>`;
}

export async function handleAdmin(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  const ipFilter = new URL(req.url, "http://localhost").searchParams.get("ip") || "";
  if (!process.env.ADMIN_TOKEN) {
    res.end(basePage("Admin", "<h1>Panel administracyjny</h1><p>Brak konfiguracji. Ustaw zmienną <code>ADMIN_TOKEN</code> w Railway.</p>"));
    return;
  }
  if (!isAdminAuthed(req)) {
    res.end(basePage("Logowanie", '<form class="loginBox" method="POST" action="/admin/login"><h1>Panel FabianAGI</h1><input type="password" name="password" placeholder="Hasło administratora" autofocus><button type="submit">Zaloguj</button></form>'));
    return;
  }
  let events = readEvents(500);
  if (ipFilter) {
    events = events.filter((e) => e.ip === ipFilter);
  }
  const stats = computeStats(ipFilter ? events : readEvents(500));
  const rows = events.map((e) => {
    const d = new Date(e.ts);
    const time = d.toLocaleString("pl-PL");
    const convo = conversationHtml(e);
    return `<tr>
      <td class="mono">${time}</td>
      <td class="ip"><a href="/admin?ip=${encodeURIComponent(e.ip || "")}">${escapeHtml(e.ip || "-")}</a></td>
      <td class="mono">${escapeHtml(e.model || "mini")}</td>
      <td>${escapeHtml(e.persona || "Fabian")}${e.personaMode === "replace" ? " <span class=mono>(replace)</span>" : ""}</td>
      <td class="mono">${e.msgs != null ? e.msgs : "-"}</td>
      <td class="msg" title="${escapeHtml(e.lastUser || "")}">${escapeHtml(e.lastUser || "-")}${convo}</td>
      <td class="mono">${e.durationMs != null ? e.durationMs + " ms" : "-"}</td>
      <td>${e.error ? '<span class="err">błąd</span>' : "ok"}</td>
    </tr>`;
  }).join("");
  const modelRows = Object.entries(stats.models).sort((a, b) => b[1] - a[1])
    .map(([m, c]) => `${escapeHtml(m)}: ${c}`).join(" · ");
  res.end(basePage("Admin - FabianAGI", `
    <h1>Panel administracyjny<small>logi czatu · retencja 30 dni</small>${ipFilter ? ` <a class="mono" href="/admin" style="font-size:12px">← wszystkie IP</a>` : ""}</h1>
    ${ipFilter ? `<p class="mono" style="margin-bottom:14px;color:var(--orange)">filtr IP: ${escapeHtml(ipFilter)} · ${events.length} zdarzeń</p>` : ""}
    <div class="stats">
      <div class="stat"><b>${stats.total}</b><span>zapytań (okno 300)</span></div>
      <div class="stat"><b>${stats.last24h}</b><span>ostatnie 24 h</span></div>
      <div class="stat"><b>${stats.uniqueIps}</b><span>unikalne IP</span></div>
      <div class="stat"><b>${stats.errors}</b><span>błędów</span></div>
    </div>
    <p class="mono" style="margin-bottom:16px;color:var(--text3)">${modelRows}</p>
    <table>
      <thead><tr><th>czas</th><th>ip</th><th>model</th><th>persona</th><th>wiad.</th><th>ostatnia wiadomość</th><th>czas odp.</th><th>status</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="8">Brak zdarzeń.</td></tr>'}</tbody>
    </table>`));
}

export async function handleAdminLogin(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (!rateLimit("admin:" + ip)) {
    res.writeHead(429, { "Content-Type": "text/html; charset=utf-8" });
    res.end("Za dużo prób. Odczekaj.");
    return;
  }
  let body = "";
  try {
    body = await readBody(req);
  } catch {
    res.writeHead(400).end("bad");
    return;
  }
  const password = new URLSearchParams(body).get("password") || "";
  const token = process.env.ADMIN_TOKEN || "";
  const a = Buffer.from(password);
  const b = Buffer.from(token);
  const ok = token && a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    res.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
    res.end(basePage("Błąd", '<form class="loginBox" method="POST" action="/admin/login"><h1>Panel FabianAGI</h1><p class="bad">Nieprawidłowe hasło.</p><input type="password" name="password" placeholder="Hasło administratora" autofocus><button type="submit">Zaloguj</button></form>'));
    return;
  }
  const exp = Date.now() + SESSION_MS;
  const value = exp + "." + signature(String(exp));
  const secure = req.socket.encrypted || req.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  res.writeHead(303, {
    "Set-Cookie": `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=${SESSION_MS / 1000}${secure}`,
    Location: "/admin"
  });
  res.end();
}
