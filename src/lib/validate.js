const allowedRoles = new Set(["user", "assistant"]);

export const limits = {
  maxMessages: 60,
  maxUserMessageLength: 100,
  maxAssistantMessageLength: 12000,
  maxBodyBytes: 100 * 1024
};

export function validateChatBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Nieprawidłowe żądanie." };
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Brak wiadomości." };
  }
  if (messages.length > limits.maxMessages) {
    return { ok: false, error: "Zbyt długa rozmowa. Utwórz nową." };
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
            ? "Wiadomość może mieć maksymalnie 100 znaków."
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
  return Object.keys(result).length ? result : null;
}
