const storageKey = "fabian_chats";
const backupKey = "fabian_chats_backup";

const emptyState = () => ({ version: 1, activeId: null, conversations: [] });

function isValidMessage(message) {
  return (
    message &&
    typeof message === "object" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function isValidConversation(conversation) {
  return (
    conversation &&
    typeof conversation === "object" &&
    typeof conversation.id === "string" &&
    typeof conversation.title === "string" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isValidMessage)
  );
}

function isValidState(data) {
  return (
    data &&
    typeof data === "object" &&
    (data.activeId === null || typeof data.activeId === "string") &&
    Array.isArray(data.conversations) &&
    data.conversations.every(isValidConversation)
  );
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "chat-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

export function loadChats() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    if (!isValidState(data)) throw new Error("invalid shape");
    if (data.activeId && !data.conversations.some((c) => c.id === data.activeId)) {
      data.activeId = data.conversations[0]?.id ?? null;
    }
    return data;
  } catch {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) localStorage.setItem(backupKey, raw);
    } catch {
      /* backup is best effort */
    }
    return emptyState();
  }
}

export function saveChats(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    console.warn("fabian_chats: zapis do localStorage nie powiódł się (przekroczony limit?)");
    return false;
  }
}

export function createConversation(state, title) {
  const conversation = {
    id: makeId(),
    title: title || "Nowa rozmowa",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };
  state.conversations.unshift(conversation);
  state.activeId = conversation.id;
  return conversation;
}

export function getActiveConversation(state) {
  return state.conversations.find((c) => c.id === state.activeId) || null;
}

export function setActiveConversation(state, id) {
  state.activeId = state.conversations.some((c) => c.id === id) ? id : null;
}

export function renameConversation(state, id, title) {
  const conversation = state.conversations.find((c) => c.id === id);
  if (!conversation) return;
  const trimmed = String(title || "").trim();
  conversation.title = trimmed || conversation.title;
  conversation.updatedAt = Date.now();
}

export function deleteConversation(state, id) {
  state.conversations = state.conversations.filter((c) => c.id !== id);
  if (state.activeId === id) {
    state.activeId = state.conversations[0]?.id ?? null;
  }
}

export function addMessage(state, conversationId, role, content) {
  const conversation = state.conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;
  const message = { role, content, ts: Date.now() };
  conversation.messages.push(message);
  conversation.updatedAt = Date.now();
  if (conversation.messages.length === 1 && role === "user") {
    conversation.title = content.replace(/\s+/g, " ").trim().slice(0, 48) || conversation.title;
  }
  return message;
}
