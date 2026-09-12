import {
  addMessage,
  createConversation,
  deleteConversation,
  getActiveConversation,
  loadChats,
  renameConversation,
  saveChats,
  setActiveConversation
} from "/js/storage.js?v=1.2.0";

const state = loadChats();
let sending = false;
let pendingAttachments = [];
const maxLength = 100;
const settingsKey = "fabian_settings";

const elements = {
  sidebar: document.getElementById("chatSidebar"),
  overlay: document.getElementById("sideOverlay"),
  sideList: document.getElementById("sideList"),
  newChatBtn: document.getElementById("newChatBtn"),
  sideToggle: document.getElementById("sideToggle"),
  chatTitle: document.getElementById("chatTitle"),
  chatScroll: document.getElementById("chatScroll"),
  chatEmpty: document.getElementById("chatEmpty"),
  messages: document.getElementById("messages"),
  composerForm: document.getElementById("composerForm"),
  composerInput: document.getElementById("composerInput"),
  sendBtn: document.getElementById("sendBtn"),
  scrollPill: document.getElementById("scrollPill"),
  charCounter: document.getElementById("charCounter"),
  attachBtn: document.getElementById("attachBtn"),
  fileInput: document.getElementById("fileInput"),
  attachRow: document.getElementById("attachRow"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsOverlay: document.getElementById("settingsOverlay"),
  settingsClose: document.getElementById("settingsClose"),
  settingsSave: document.getElementById("settingsSave"),
  settingsClear: document.getElementById("settingsClear"),
  settingsApiKey: document.getElementById("settingsApiKey"),
  settingsBaseUrl: document.getElementById("settingsBaseUrl"),
  settingsName: document.getElementById("settingsName"),
  settingsPersonality: document.getElementById("settingsPersonality"),
  emptyHeading: document.getElementById("emptyHeading"),
  composerHint: document.getElementById("composerHint")
};

const menu = document.createElement("div");
menu.className = "chatMenu";
menu.innerHTML =
  '<button type="button" data-action="rename">Zmień nazwę</button>' +
  '<button type="button" data-action="delete" class="menuDanger">Usuń rozmowę</button>';
document.body.appendChild(menu);
let menuTargetId = null;

function asCleanString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed === "undefined" || trimmed === "null" ? "" : trimmed;
}

function loadSettings() {
  const fallback = { apiKey: "", baseUrl: "", name: "", personality: "" };
  try {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return fallback;
    return {
      apiKey: asCleanString(data.apiKey),
      baseUrl: asCleanString(data.baseUrl),
      name: asCleanString(data.name),
      personality: asCleanString(data.personality)
    };
  } catch {
    return fallback;
  }
}

let settings = loadSettings();
let defaultPersonality = "";

fetch("/api/persona")
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => {
    if (data && typeof data.personality === "string") {
      defaultPersonality = data.personality;
    }
  })
  .catch(() => {
    /* endpoint niedostepny - brak prefill */
  });

function persistSettings() {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  } catch {
    console.warn("fabian_settings: zapis do localStorage nie powiódł się");
  }
}

function assistantName() {
  const name = settings.name.trim();
  return name || "Fabian";
}

function keyLooksValid(key) {
  return typeof key === "string" && /^[\w\-.]{8,200}$/.test(key.trim());
}

function validBaseUrl(raw) {
  if (typeof raw !== "string" || !raw.trim()) return "";
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function updateIndicators() {
  if (!elements.settingsBtn || !elements.composerHint) return;
  const customKey = keyLooksValid(settings.apiKey) ? settings.apiKey : "";
  elements.settingsBtn.classList.toggle("hasCustom", Boolean(customKey));
  const parts = [];
  if (customKey) parts.push("Własny klucz API aktywny");
  const name = settings.name.trim();
  if (name) parts.push("Persona: " + name);
  elements.composerHint.textContent = parts.length
    ? parts.join(" · ")
    : "Enter - wyślij · Shift + Enter - nowa linia";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(value) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`\n]+)`/g, '<code class="mdInline">$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
    if (!/^https?:\/\//i.test(url)) return label;
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + "</a>";
  });
  return text;
}

function renderMarkdown(source) {
  const lines = source.split("\n");
  let html = "";
  let inCode = false;
  let listType = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html += "<p>" + paragraph.map(formatInline).join("<br>") + "</p>";
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      html += "</" + listType + ">";
      listType = null;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      closeList();
      html += inCode ? "</code></pre>" : '<pre class="mdCode"><code>';
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      html += escapeHtml(line) + "\n";
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length + 1;
      html += "<h" + level + ">" + formatInline(heading[2]) + "</h" + level + ">";
      continue;
    }
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html += "<ul>";
        listType = "ul";
      }
      html += "<li>" + formatInline(ul[1]) + "</li>";
      continue;
    }
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html += "<ol>";
        listType = "ol";
      }
      html += "<li>" + formatInline(ol[1]) + "</li>";
      continue;
    }
    closeList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  closeList();
  if (inCode) html += "</code></pre>";
  return html;
}

let pinnedToBottom = true;

function syncPinned() {
  const distance =
    elements.chatScroll.scrollHeight -
    elements.chatScroll.scrollTop -
    elements.chatScroll.clientHeight;
  pinnedToBottom = distance < 80;
  elements.scrollPill.hidden = pinnedToBottom;
}

function updateScroll() {
  if (pinnedToBottom) {
    elements.chatScroll.scrollTop = elements.chatScroll.scrollHeight;
  }
}

function forceScroll() {
  pinnedToBottom = true;
  elements.chatScroll.scrollTop = elements.chatScroll.scrollHeight;
  elements.scrollPill.hidden = true;
}

function formatTime(ts) {
  const date = new Date(ts);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  if (sameDay) return hh + ":" + mm;
  return date.getDate() + "." + (date.getMonth() + 1);
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.overlay.classList.remove("open");
}

function closeMenu() {
  menu.classList.remove("open");
  menuTargetId = null;
}

function renderSidebar() {
  const sorted = [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  elements.sideList.innerHTML = "";
  if (sorted.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sideEmpty";
    empty.textContent = "Brak rozmów. Zacznij nową.";
    elements.sideList.appendChild(empty);
    return;
  }
  for (const conversation of sorted) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "sideItem" + (conversation.id === state.activeId ? " active" : "");
    item.dataset.id = conversation.id;

    const text = document.createElement("span");
    text.className = "sideItemText";
    const title = document.createElement("span");
    title.className = "sideItemTitle";
    title.textContent = conversation.title;
    const time = document.createElement("span");
    time.className = "sideItemTime";
    time.textContent = formatTime(conversation.updatedAt);
    text.appendChild(title);
    text.appendChild(time);

    const menuBtn = document.createElement("span");
    menuBtn.className = "sideMenuBtn";
    menuBtn.setAttribute("role", "button");
    menuBtn.setAttribute("tabindex", "0");
    menuBtn.setAttribute("aria-label", "Opcje rozmowy");
    menuBtn.textContent = "⋯";

    item.appendChild(text);
    item.appendChild(menuBtn);
    elements.sideList.appendChild(item);
  }
  const activeItem = elements.sideList.querySelector(".sideItem.active");
  if (activeItem) activeItem.scrollIntoView({ block: "nearest" });
}

function createAttachChip(name, onRemove) {
  const chip = document.createElement("span");
  chip.className = "attachChip";
  const label = document.createElement("span");
  label.textContent = name;
  chip.appendChild(label);
  if (onRemove) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Usuń załącznik " + name);
    btn.textContent = "×";
    btn.addEventListener("click", onRemove);
    chip.appendChild(btn);
  }
  return chip;
}

function renderAttachRow() {
  if (!elements.attachRow) return;
  elements.attachRow.innerHTML = "";
  elements.attachRow.style.display = pendingAttachments.length ? "" : "none";
  pendingAttachments.forEach((att, index) => {
    elements.attachRow.appendChild(
      createAttachChip(att.name, () => {
        pendingAttachments.splice(index, 1);
        renderAttachRow();
      })
    );
  });
}

function buildMessageNode(role, content, attachments) {
  const node = document.createElement("div");
  node.className = "msg " + (role === "user" ? "msgUser" : "msgFabian");
  const avatar = document.createElement("div");
  avatar.className = "msgAvatar";
  avatar.textContent =
    role === "user" ? "Ty" : assistantName().charAt(0).toUpperCase();
  const body = document.createElement("div");
  body.className = "msgBody";
  const name = document.createElement("div");
  name.className = "msgName";
  name.textContent = role === "user" ? "Ty" : assistantName();
  const text = document.createElement("div");
  if (role === "user") {
    text.className = "msgText msgBubble";
    text.textContent = content;
  } else {
    text.className = "msgText";
    text.textContent = content;
  }
  body.appendChild(name);
  body.appendChild(text);
  if (attachments && attachments.length) {
    const row = document.createElement("div");
    row.className = "msgAttach";
    for (const att of attachments) {
      row.appendChild(createAttachChip(att.name, null));
    }
    body.appendChild(row);
  }
  node.appendChild(avatar);
  node.appendChild(body);
  return { node, text };
}

function finalizeAssistant(textEl, full) {
  textEl.className = "msgText md";
  textEl.innerHTML = renderMarkdown(full);
}

function renderMessages() {
  const conversation = getActiveConversation(state);
  elements.messages.innerHTML = "";
  if (!conversation || conversation.messages.length === 0) {
    elements.chatEmpty.style.display = "";
    elements.chatTitle.textContent = "Nowa rozmowa";
    return;
  }
  elements.chatEmpty.style.display = "none";
  elements.chatTitle.textContent = conversation.title;
  for (const message of conversation.messages) {
    const { node, text } = buildMessageNode(
      message.role,
      message.content,
      message.attachments
    );
    if (message.role === "assistant") finalizeAssistant(text, message.content);
    elements.messages.appendChild(node);
  }
  forceScroll();
}

function renderAll() {
  renderSidebar();
  renderMessages();
}

async function streamFabian(apiMessages, attachments, onDelta) {
  const body = { messages: apiMessages };
  if (keyLooksValid(settings.apiKey)) body.apiKey = settings.apiKey;
  const baseUrl = validBaseUrl(settings.baseUrl);
  if (baseUrl) body.baseUrl = baseUrl;
  if (settings.name.trim() || settings.personality.trim()) {
    body.persona = {
      name: settings.name.trim(),
      personality: settings.personality.trim()
    };
  }
  if (attachments.length) body.attachments = attachments;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok && contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.");
  }
  if (!response.ok || !response.body) {
    throw new Error("Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      let json;
      try {
        json = JSON.parse(payload);
      } catch {
        continue;
      }
      if (json.error) throw new Error(json.error);
      if (json.delta) {
        full += json.delta;
        onDelta(full);
      }
    }
  }
  return full;
}

function showError(textEl, node, onRetry) {
  node.classList.remove("msgFabian");
  node.classList.add("msgError");
  const name = node.querySelector(".msgName");
  if (name) name.textContent = "Błąd";
  textEl.className = "msgText";
  textEl.textContent = "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "retryBtn";
  retry.textContent = "Spróbuj ponownie";
  retry.addEventListener("click", onRetry);
  node.querySelector(".msgBody").appendChild(retry);
}

function createPlaceholder() {
  const { node, text } = buildMessageNode("assistant", "");
  const dots = document.createElement("span");
  dots.className = "loadingDots";
  dots.innerHTML = "<i></i><i></i><i></i>";
  dots.setAttribute("aria-label", "Fabian pisze");
  text.appendChild(dots);
  elements.messages.appendChild(node);
  updateScroll();
  return [text, node];
}

async function requestAssistant(conversation, textEl, node, attachments) {
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  const apiMessages = conversation.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));
  try {
    const full = await streamFabian(apiMessages, safeAttachments, (delta) => {
      textEl.textContent = delta;
      updateScroll();
    });
    if (!full.trim()) throw new Error("empty");
    addMessage(state, conversation.id, "assistant", full);
    saveChats(state);
    finalizeAssistant(textEl, full);
    updateScroll();
  } catch {
    showError(textEl, node, () => {
      node.remove();
      requestAssistant(conversation, ...createPlaceholder(), safeAttachments);
      updateScroll();
    });
  } finally {
    sending = false;
    if (elements.sendBtn) elements.sendBtn.disabled = false;
  }
}

function updateCounter() {
  if (!elements.composerInput || !elements.charCounter) return;
  const length = elements.composerInput.value.length;
  elements.charCounter.textContent = length + "/" + maxLength;
  elements.charCounter.classList.toggle("warn", length > maxLength - 15);
}

function handleSend() {
  const content = elements.composerInput.value.trim();
  if (!content || sending || content.length > maxLength) return;

  let conversation = getActiveConversation(state);
  if (!conversation) {
    conversation = createConversation(state, content.slice(0, 48));
  }

  const userMessage = addMessage(state, conversation.id, "user", content);
  if (pendingAttachments.length) {
    userMessage.attachments = pendingAttachments.map((att) => ({ name: att.name }));
  }
  saveChats(state);
  elements.composerInput.value = "";
  elements.composerInput.style.height = "auto";
  updateCounter();
  elements.chatEmpty.style.display = "none";
  elements.chatTitle.textContent = conversation.title;

  const sentAttachments = pendingAttachments.slice(0, 5);
  pendingAttachments = [];
  renderAttachRow();

  const userNode = buildMessageNode(
    "user",
    content,
    sentAttachments.map((att) => ({ name: att.name }))
  ).node;
  elements.messages.appendChild(userNode);
  const [textEl, node] = createPlaceholder();

  sending = true;
  if (elements.sendBtn) elements.sendBtn.disabled = true;
  renderSidebar();
  requestAssistant(conversation, textEl, node, sentAttachments);
}

elements.composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSend();
});

elements.composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
});

if (elements.attachBtn && elements.fileInput) {
  elements.attachBtn.addEventListener("click", () => elements.fileInput.click());

  elements.fileInput.addEventListener("change", async () => {
  const files = Array.from(elements.fileInput.files || []).slice(
    0,
    Math.max(0, 5 - pendingAttachments.length)
  );
  for (const file of files) {
    if (file.size > 100 * 1024) continue;
    try {
      const text = await file.text();
      pendingAttachments.push({ name: file.name, content: text });
    } catch {
      /* pliku nie dało się odczytać */
    }
  }
  elements.fileInput.value = "";
  renderAttachRow();
  });
}

if (elements.composerInput) {
elements.composerInput.addEventListener("input", () => {
  elements.composerInput.style.height = "auto";
  elements.composerInput.style.height = Math.min(elements.composerInput.scrollHeight, 140) + "px";
  updateCounter();
  });
}

if (elements.chatScroll) {
elements.chatScroll.addEventListener("scroll", syncPinned);
}

elements.scrollPill.addEventListener("click", forceScroll);

elements.newChatBtn.addEventListener("click", () => {
  createConversation(state, "Nowa rozmowa");
  saveChats(state);
  renderAll();
  closeSidebar();
  elements.composerInput.focus();
});

elements.sideToggle.addEventListener("click", () => {
  elements.sidebar.classList.toggle("open");
  elements.overlay.classList.toggle("open");
});

elements.overlay.addEventListener("click", closeSidebar);

elements.sideList.addEventListener("click", (event) => {
  const menuBtn = event.target.closest(".sideMenuBtn");
  const item = event.target.closest(".sideItem");
  if (menuBtn && item) {
    event.stopPropagation();
    menuTargetId = item.dataset.id;
    const rect = menuBtn.getBoundingClientRect();
    menu.style.top = rect.bottom + 6 + "px";
    menu.style.left = Math.min(rect.left, window.innerWidth - 170) + "px";
    menu.classList.add("open");
    return;
  }
  if (item) {
    setActiveConversation(state, item.dataset.id);
    saveChats(state);
    renderAll();
    closeSidebar();
  }
});

menu.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action || !menuTargetId) return;
  if (action === "rename") {
    const conversation = state.conversations.find((c) => c.id === menuTargetId);
    const next = window.prompt("Nowa nazwa rozmowy:", conversation?.title || "");
    if (next !== null) {
      renameConversation(state, menuTargetId, next);
      saveChats(state);
      renderAll();
    }
  }
  if (action === "delete") {
    if (window.confirm("Usunąć tę rozmowę? Tej operacji nie można cofnąć.")) {
      deleteConversation(state, menuTargetId);
      saveChats(state);
      renderAll();
    }
  }
  closeMenu();
});

function openSettings() {
  elements.settingsApiKey.value = settings.apiKey;
  elements.settingsBaseUrl.value = settings.baseUrl;
  elements.settingsName.value = settings.name;
  elements.settingsPersonality.value =
    settings.personality || defaultPersonality;
  elements.settingsOverlay.hidden = false;
}

function closeSettingsModal() {
  elements.settingsOverlay.hidden = true;
}

elements.settingsBtn.addEventListener("click", openSettings);
elements.settingsClose.addEventListener("click", closeSettingsModal);
elements.settingsOverlay.addEventListener("click", (event) => {
  if (event.target === elements.settingsOverlay) closeSettingsModal();
});
elements.settingsSave.addEventListener("click", () => {
  settings = {
    apiKey: elements.settingsApiKey.value.trim(),
    baseUrl: elements.settingsBaseUrl.value.trim(),
    name: elements.settingsName.value.trim().slice(0, 30),
    personality: elements.settingsPersonality.value.trim().slice(0, 2000)
  };
  if (!keyLooksValid(settings.apiKey)) settings.apiKey = "";
  settings.baseUrl = validBaseUrl(settings.baseUrl);
  if (
    defaultPersonality &&
    settings.personality.trim() === defaultPersonality.trim()
  ) {
    settings.personality = "";
  }
  persistSettings();
  closeSettingsModal();
  updateIdentity();
  updateIndicators();
});
elements.settingsClear.addEventListener("click", () => {
  settings = { apiKey: "", baseUrl: "", name: "", personality: "" };
  persistSettings();
  elements.settingsApiKey.value = "";
  elements.settingsBaseUrl.value = "";
  elements.settingsName.value = "";
  elements.settingsPersonality.value = "";
  updateIdentity();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".chatMenu") && !event.target.closest(".sideMenuBtn")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeSidebar();
    closeSettingsModal();
  }
});

function updateIdentity() {
  if (elements.emptyHeading) {
    elements.emptyHeading.textContent = "Cześć, jestem " + assistantName() + ".";
  }
  renderAll();
}

renderAttachRow();
renderAll();
updateCounter();
updateIdentity();
updateIndicators();
