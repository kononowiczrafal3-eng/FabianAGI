import { rateLimit } from "../lib/rateLimit.js";

const VOICES = new Set(["diana", "hannah", "autumn", "austin", "daniel", "troy"]);

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 32 * 1024) {
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

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

export async function handleSpeech(req, res) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" && forwarded.split(",")[0].trim()) || req.socket.remoteAddress || "unknown";
  if (!rateLimit("speech:" + ip)) {
    sendJson(res, 429, { error: "Zbyt wiele żądań." });
    return;
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: "Lektor jest niedostępny (brak GROQ_API_KEY)." });
    return;
  }
  let body;
  try {
    body = await readJson(req);
  } catch {
    sendJson(res, 400, { error: "Nieprawidłowe żądanie." });
    return;
  }
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 4000) : "";
  const voice = VOICES.has(body.voice) ? body.voice : "autumn";
  if (!text) {
    sendJson(res, 400, { error: "Brak tekstu." });
    return;
  }
  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "canopylabs/orpheus-v1-english",
        voice: voice,
        response_format: "wav",
        input: text
      })
    });
    if (!upstream.ok || !upstream.body) {
      console.error("SPEECH ERROR:", upstream.status);
      sendJson(res, 502, { error: "Lektor nie odpowiada. Spróbuj ponownie." });
      return;
    }
    res.writeHead(200, {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error("SPEECH ERROR:", err && err.message ? err.message : "unknown");
    sendJson(res, 502, { error: "Lektor nie odpowiada. Spróbuj ponownie." });
  }
}
