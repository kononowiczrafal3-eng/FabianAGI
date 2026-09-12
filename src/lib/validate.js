const allowedRoles = new Set(["user", "assistant"]);

export const limits = {
  maxUserMessageLength: 500,
  maxAssistantMessageLength: 12000,
  maxBodyBytes: 1024 * 1024
};

export function validateChatBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Nieprawidłowe żądanie." };
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Brak wiadomości." };
  }
  const clean = [];
  for (const message of messages) {
    if (!message || typeof message !== "object") {
      return { ok: false, error: "Nieprawidłowa wiadomość." };
    }
    if (!allowedRoles.has(message.role)) {
      return { ok: false, error: "Nieprawidłowa rola wiadomości." };
    }
    if (typeof message.content !== "string") {
      return { ok: false, error: "Nieprawidłowa treść wiadomości." };
    }
    const content = message.content.trim();
    if (!content) {
      return { ok: false, error: "Pusta wiadomość." };
    }
    const limit =
      message.role === "user"
        ? limits.maxUserMessageLength
        : limits.maxAssistantMessageLength;
    if (content.length > limit) {
      return {
        ok: false,
        error:
          message.role === "user"
            ? "Wiadomość może mieć maksymalnie 500 znaków."
            : "Nieprawidłowa wiadomość."
      };
    }
    clean.push({ role: message.role, content });
  }
  if (clean[0].role !== "user") {
    return { ok: false, error: "Rozmowa musi zaczynać się od wiadomości użytkownika." };
  }
  return { ok: true, messages: clean };
}

export function sanitizePersona(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const result = {};
  if (typeof raw.name === "string") {
    const name = raw.name.trim().replace(/\s+/g, " ").slice(0, 30);
    if (name) result.name = name;
  }
  if (typeof raw.personality === "string") {
    const personality = raw.personality.trim().slice(0, 2000);
    if (personality) result.personality = personality;
  }
  if (raw.mode === "replace") result.mode = "replace";
  if (!result.name && !result.personality) return null;
  return result;
}

export function sanitizeAttachments(raw) {
  if (!Array.isArray(raw)) return [];
  const clean = [];
  for (const item of raw.slice(0, 5)) {
    if (!item || typeof item !== "object") return [];
    if (typeof item.name !== "string" || !item.name.trim() || item.name.length > 200) {
      return [];
    }
    const name = item.name.trim();
    if (typeof item.content === "string" && item.content.trim() && item.content.length <= 20000) {
      clean.push({ name, content: item.content.slice(0, 20000) });
      continue;
    }
    if (typeof item.zip === "string" && item.zip.length >= 100 && item.zip.length <= 900000) {
      clean.push({ name, zip: item.zip });
      continue;
    }
    return [];
  }
  return clean;
}

export function composeMessages(messages, attachments) {
  if (!attachments.length) return messages;
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return messages;
  const parts = [last.content, "", "Załączone pliki:"];
  for (const att of attachments) {
    parts.push("### " + att.name + "\n" + att.content);
  }
  return [...messages.slice(0, -1), { role: "user", content: parts.join("\n") }];
}
