import { deleteEventsByIp, isOptedOut, logEvent, setOptout } from "../lib/audit.js";

function readJson(req) {
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
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function validIp(ip) {
  return typeof ip === "string" && ip.length <= 60 && /^[0-9a-fA-F.:]{3,60}$/.test(ip);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

export async function handlePrivacy(req, res) {
  let body;
  try {
    body = await readJson(req);
  } catch {
    sendJson(res, 400, { error: "Nieprawidłowe żądanie." });
    return;
  }
  const ip = (body.ip || "").trim();
  const action = body.action;
  if (!validIp(ip) || !["delete", "optout", "optin"].includes(action)) {
    sendJson(res, 400, { error: "Nieprawidłowe dane." });
    return;
  }

  if (action === "delete") {
    const removed = deleteEventsByIp(ip);
    logEvent({ action: "privacy-delete", ip, removed });
    sendJson(res, 200, {
      ok: true,
      removed: removed < 0 ? 0 : removed,
      note: "Sam wniosek o usunięcie został zapisany w logach."
    });
    return;
  }

  if (action === "optout") {
    setOptout(ip, true);
    logEvent({ action: "privacy-optout", ip });
    sendJson(res, 200, { ok: true, optedOut: true });
    return;
  }

  setOptout(ip, false);
  logEvent({ action: "privacy-optin", ip });
  sendJson(res, 200, { ok: true, optedOut: false });
}
