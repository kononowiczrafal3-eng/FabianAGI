import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const eventsFile = path.join(dataDir, "events.jsonl");
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

let lastPruneAt = 0;

function ensureDir() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
  }
}

function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPruneAt < 6 * 60 * 60 * 1000) return;
  lastPruneAt = now;
  try {
    const lines = fs.readFileSync(eventsFile, "utf8").split("\n").filter(Boolean);
    const kept = lines.filter((line) => {
      try {
        return JSON.parse(line).ts > now - RETENTION_MS;
      } catch {
        return false;
      }
    });
    if (kept.length !== lines.length) {
      fs.writeFileSync(eventsFile, kept.join("\n") + "\n");
    }
  } catch {
  }
}

export function logEvent(event) {
  try {
    ensureDir();
    const line = JSON.stringify({ ts: Date.now(), ...event }) + "\n";
    fs.appendFileSync(eventsFile, line);
    pruneIfNeeded();
  } catch {
  }
}

export function readEvents(limit) {
  const max = limit || 200;
  try {
    const lines = fs.readFileSync(eventsFile, "utf8").split("\n").filter(Boolean);
    const events = [];
    for (let i = lines.length - 1; i >= 0 && events.length < max; i -= 1) {
      try {
        events.push(JSON.parse(lines[i]));
      } catch {
      }
    }
    return events;
  } catch {
    return [];
  }
}

export function computeStats(events) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const ips = new Set();
  const models = {};
  let last24h = 0;
  let errors = 0;
  for (const e of events) {
    if (e.ip) ips.add(e.ip);
    if (e.ts > dayAgo) last24h += 1;
    if (e.error) errors += 1;
    const m = e.model || "groq/compound-mini";
    models[m] = (models[m] || 0) + 1;
  }
  return { total: events.length, last24h, uniqueIps: ips.size, errors, models };
}

const optoutsFile = path.join(dataDir, "optouts.json");

export function isOptedOut(ip) {
  try {
    const list = JSON.parse(fs.readFileSync(optoutsFile, "utf8"));
    return Array.isArray(list) && list.includes(ip);
  } catch {
    return false;
  }
}

function saveOptouts(list) {
  ensureDir();
  fs.writeFileSync(optoutsFile, JSON.stringify(list, null, 2));
}

export function setOptout(ip, value) {
  try {
    let list = [];
    try {
      const raw = JSON.parse(fs.readFileSync(optoutsFile, "utf8"));
      if (Array.isArray(raw)) list = raw;
    } catch {
    }
    const next = value ? Array.from(new Set([...list, ip])) : list.filter((x) => x !== ip);
    saveOptouts(next);
    return true;
  } catch {
    return false;
  }
}

export function deleteEventsByIp(ip) {
  try {
    const lines = fs.readFileSync(eventsFile, "utf8").split("\n").filter(Boolean);
    const kept = lines.filter((line) => {
      try {
        return JSON.parse(line).ip !== ip;
      } catch {
        return true;
      }
    });
    if (kept.length !== lines.length) {
      fs.writeFileSync(eventsFile, kept.join("\n") + "\n");
      return lines.length - kept.length;
    }
    return 0;
  } catch {
    return -1;
  }
}
