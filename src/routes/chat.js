import { createGroqClient, streamChat } from "../lib/groq.js";
import { rateLimit } from "../lib/rateLimit.js";
import { isOptedOut, logEvent } from "../lib/audit.js";
import { extractTextFiles } from "../lib/zip.js";
import {
  composeMessages,
  limits,
  sanitizeAttachments,
  sanitizeModel,
  sanitizeMemory,
  sanitizePersona,
  sanitizeUserPersona,
  validateChatBody
} from "../lib/validate.js";

const groqClient = process.env.GROQ_API_KEY
  ? createGroqClient(process.env.GROQ_API_KEY)
  : null;

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
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

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function resolveClient(body) {
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey) {
    return { client: groqClient };
  }
  if (!/^[\w\-.]{8,200}$/.test(apiKey)) {
    return { error: "Nieprawidłowy klucz API." };
  }
  let baseURL;
  const rawBaseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : "";
  if (rawBaseUrl) {
    try {
      const url = new URL(rawBaseUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("bad protocol");
      }
      baseURL = url.toString();
    } catch {
      return { error: "Nieprawidłowy adres API." };
    }
  }
  try {
    return { client: createGroqClient(apiKey, baseURL) };
  } catch {
    return { error: "Nieprawidłowy klucz API." };
  }
}

export async function handleChat(req, res) {
  if (!rateLimit(clientIp(req))) {
    sendJson(res, 429, { error: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req, limits.maxBodyBytes);
  } catch {
    sendJson(res, 400, { error: "Nieprawidłowe żądanie." });
    return;
  }

  const check = validateChatBody(body);
  if (!check.ok) {
    sendJson(res, 400, { error: check.error });
    return;
  }

  const resolved = resolveClient(body);
  if (resolved.error) {
    sendJson(res, 400, { error: resolved.error });
    return;
  }
  if (!resolved.client) {
    sendJson(res, 503, { error: "Usługa AI jest chwilowo niedostępna." });
    return;
  }

  const model = sanitizeModel(body.model);
  const persona = sanitizePersona(body.persona);
  const userPersona = sanitizeUserPersona(body.userPersona);
  const lastUserMsg = [...check.messages].reverse().find((m) => m.role === "user");
  const startedAt = Date.now();
  const auditBase = {
    ip: clientIp(req),
    model: model || "groq/compound-mini",
    persona: persona && persona.name ? persona.name : "Fabian",
    personaMode: persona && persona.mode ? persona.mode : "append",
    msgs: check.messages.length,
    lastUser: lastUserMsg ? lastUserMsg.content.slice(0, 300) : "",
    attachments: Array.isArray(body.attachments) ? body.attachments.length : 0,
    userPersona: userPersona ? userPersona.slice(0, 200) : "",
    messages: check.messages.map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
    response: ""
  };

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);
  res.on("close", () => clearInterval(heartbeat));

  try {
    const memory = sanitizeMemory(body.memory);
    const rawAttachments = sanitizeAttachments(body.attachments);
    const attachments = [];
    for (const att of rawAttachments) {
      if (att.zip) {
        try {
          const extracted = extractTextFiles(att.zip);
          for (const file of extracted) {
            attachments.push({ name: att.name + ":/" + file.name, content: file.content });
          }
        } catch {
          /* uszkodzony zip - pomijamy */
        }
      } else {
        attachments.push(att);
      }
    }
    const providerMessages = composeMessages(
      check.messages,
      attachments.slice(0, 12),
      memory,
      userPersona
    );
    const lang = body.lang === "en" ? "en" : "pl";
    const stream = await streamChat(resolved.client, providerMessages, persona, model, lang);
    let responseText = "";
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content ?? "";
      if (delta) {
        responseText += delta;
        res.write("data: " + JSON.stringify({ delta }) + "\n\n");
      }
    }
    res.write("data: [DONE]\n\n");
    auditBase.response = responseText.slice(0, 20000);
    if (!isOptedOut(auditBase.ip)) {
      logEvent({ ...auditBase, durationMs: Date.now() - startedAt });
    }
  } catch {
    res.write(
      "data: " + JSON.stringify({ error: "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie." }) + "\n\n"
    );
    if (!isOptedOut(auditBase.ip)) {
      logEvent({ ...auditBase, durationMs: Date.now() - startedAt, error: true });
    }
  }
  res.end();
}

export async function handleCompact(req, res) {
  if (!rateLimit(clientIp(req))) {
    sendJson(res, 429, { error: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie." });
    return;
  }
  let body;
  try {
    body = await readJsonBody(req, limits.maxBodyBytes);
  } catch {
    sendJson(res, 400, { error: "Nieprawidłowe żądanie." });
    return;
  }
  const check = validateChatBody(body);
  if (!check.ok) {
    sendJson(res, 400, { error: check.error });
    return;
  }
  const resolved = resolveClient(body);
  if (resolved.error) {
    sendJson(res, 400, { error: resolved.error });
    return;
  }
  if (!resolved.client) {
    sendJson(res, 503, { error: "Usługa AI jest chwilowo niedostępna." });
    return;
  }
  try {
    const slice = check.messages.slice(-60);
    const completion = await resolved.client.chat.completions.create({
      model: "groq/compound-mini",
      messages: [
        {
          role: "system",
          content:
            "Streszczasz rozmowę do pamięci asystenta. Wypisz po polsku 5-10 najważniejszych punktów: kim jest rozmówca, o czym rozmawiali, jakie decyzje i fakty padły. Same punkty, bez wstępu i zakończenia."
        },
        ...slice
      ],
      stream: false,
      max_completion_tokens: 600
    });
    const summary = completion?.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      sendJson(res, 502, { error: "Nie udało się zapamiętać. Spróbuj ponownie." });
      return;
    }
    sendJson(res, 200, { summary });
  } catch {
    sendJson(res, 502, { error: "Nie udało się zapamiętać. Spróbuj ponownie." });
  }
}
