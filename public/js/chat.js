import {
  addMessage,
  createConversation,
  deleteConversation,
  getActiveConversation,
  loadChats,
  renameConversation,
  saveChats,
  clearAllChats,
  setActiveConversation
} from "/js/storage.js?v=1.6.1";

const uiStrings = {
  pl: {
    emptyHeading: "Cześć, jestem {name}.",
    emptySub: "Pytaj o cokolwiek.",
    placeholder: "Napisz wiadomość…",
    composerHint: "Enter - wyślij, Shift + Enter - nowa linia",
    sideEmpty: "Brak rozmów. Zacznij nową.",
    newChat: "Nowa rozmowa",
    send: "Wyślij wiadomość",
    attach: "Załącz plik",
    settings: "Ustawienia",
    showConvs: "Pokaż rozmowy",
    fabianWriting: "Fabian pisze…",
    loadingFiles: "Wczytywanie plików…",
    compacting: "Zapamiętuję rozmowę…",
    retry: "Spróbuj ponownie",
    errGeneric: "Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.",
    menuMemory: "Pamięć rozmowy",
    menuRename: "Zmień nazwę",
    menuDelete: "Usuń rozmowę",
    promptRename: "Nowa nazwa rozmowy:",
    convDeleted: "Usunięto tę rozmowę?",
    convDeleteMsg: "Tej operacji nie można cofnąć.",
    del: "Usuń",
    backToPoint: "Wrócić do tego punktu?",
    backToPointMsg: "Wszystkie nowsze wiadomości zostaną trwale usunięte.",
    back: "Wróć",
    editMsg: "Edytuj wiadomość",
    delMsg: "Usuń wiadomość",
    genAgain: "Wygeneruj odpowiedź ponownie",
    pruneWarn: "Historia przycięta - limit pamięci przeglądarki",
    newConvTitle: "Nowa rozmowa",
    ownKey: "Własny klucz API aktywny",
    persona: "Persona"
  },
  en: {
    emptyHeading: "Hi, I am {name}.",
    emptySub: "Ask me anything.",
    placeholder: "Type a message…",
    composerHint: "Enter - send, Shift + Enter - new line",
    sideEmpty: "No conversations. Start a new one.",
    newChat: "New chat",
    send: "Send message",
    attach: "Attach file",
    settings: "Settings",
    showConvs: "Show conversations",
    fabianWriting: "Fabian is typing…",
    loadingFiles: "Loading files…",
    compacting: "Memorizing the conversation…",
    retry: "Try again",
    errGeneric: "Could not get a response. Please try again.",
    menuMemory: "Conversation memory",
    menuRename: "Rename",
    menuDelete: "Delete conversation",
    promptRename: "New conversation name:",
    convDeleted: "Delete conversation?",
    convDeleteMsg: "This cannot be undone.",
    del: "Delete",
    backToPoint: "Go back to this point?",
    backToPointMsg: "All newer messages will be permanently deleted.",
    back: "Go back",
    editMsg: "Edit message",
    delMsg: "Delete message",
    genAgain: "Regenerate response",
    pruneWarn: "History trimmed - browser storage limit",
    newConvTitle: "New conversation",
    ownKey: "Custom API key active",
    persona: "Persona"
  }
};

const state = loadChats();
let sending = false;
let pendingAttachments = [];
const maxLength = 10000;
const fileThreshold = 500;
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
  settingsLang: document.getElementById("settingsLang"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsOverlay: document.getElementById("settingsOverlay"),
  settingsClose: document.getElementById("settingsClose"),
  settingsSave: document.getElementById("settingsSave"),
  settingsClear: document.getElementById("settingsClear"),
  settingsApiKey: document.getElementById("settingsApiKey"),
  settingsBaseUrl: document.getElementById("settingsBaseUrl"),
  settingsName: document.getElementById("settingsName"),
  settingsPersonality: document.getElementById("settingsPersonality"),
  settingsPersonaMode: document.getElementById("settingsPersonaMode"),
  emptyHeading: document.getElementById("emptyHeading"),
  composerHint: document.getElementById("composerHint"),
  chatStatus: document.getElementById("chatStatus"),
  settingsModel: document.getElementById("settingsModel"),
  settingsBotIcon: document.getElementById("settingsBotIcon"),
  memoryClear: document.getElementById("memoryClear"),
  memoryOverlay: document.getElementById("memoryOverlay"),
  memoryModalClose: document.getElementById("memoryModalClose"),
  memoryForget: document.getElementById("memoryForget"),
  memoryRefresh: document.getElementById("memoryRefresh"),
  convStats: document.getElementById("convStats"),
  convMemoryText: document.getElementById("convMemoryText"),
  convMemoryUpdated: document.getElementById("convMemoryUpdated")
};

const menu = document.createElement("div");
menu.className = "chatMenu";
menu.innerHTML =
  '<button type="button" data-action="memory">Pamięć rozmowy</button>' +
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
  const fallback = {
    apiKey: "",
    baseUrl: "",
    name: "",
    personality: "",
    personaMode: "append",
    model: "groq/compound-mini",
    botIcon: "",
    lang: "pl"
  };
  try {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return fallback;
    return {
      apiKey: asCleanString(data.apiKey),
      baseUrl: asCleanString(data.baseUrl),
      name: asCleanString(data.name),
      personality: asCleanString(data.personality),
      personaMode: data.personaMode === "replace" ? "replace" : "append",
      model: typeof data.model === "string" ? data.model : "groq/compound-mini",
      botIcon: asCleanString(data.botIcon),
      lang: data.lang === "en" ? "en" : "pl"
    };
  } catch {
    return fallback;
  }
}


let settings = loadSettings();
if (!settings.lang) {
  try {
    const siteLang = localStorage.getItem("fabian_lang");
    if (siteLang === "en" || siteLang === "pl") settings.lang = siteLang;
  } catch (e) {}
}
let uiLang = settings.lang === "en" ? "en" : "pl";

function t(key) {
  return (uiStrings[uiLang] && uiStrings[uiLang][key]) || uiStrings.pl[key] || key;
}

function applyUiLang() {
  if (elements.composerInput) elements.composerInput.placeholder = t("placeholder");
  if (elements.composerHint) elements.composerHint.textContent = t("composerHint");
  if (elements.emptyHeading) elements.emptyHeading.textContent = t("emptyHeading").replace("{name}", assistantName());
  const emptySub = document.getElementById("emptySub");
  if (emptySub) emptySub.textContent = t("emptySub");
  if (elements.sendBtn) elements.sendBtn.setAttribute("aria-label", t("send"));
  if (elements.attachBtn) {
    elements.attachBtn.setAttribute("aria-label", t("attach"));
    elements.attachBtn.setAttribute("title", t("attach"));
  }
  if (elements.settingsBtn) elements.settingsBtn.setAttribute("aria-label", t("settings"));
  if (elements.sideToggle) elements.sideToggle.setAttribute("aria-label", t("showConvs"));
  const newChatLabel = document.getElementById("newChatLabel");
  if (newChatLabel) newChatLabel.textContent = t("newChat");
  menu.innerHTML =
    '<button type="button" data-action="memory">' + t("menuMemory") + "</button>" +
    '<button type="button" data-action="rename">' + t("menuRename") + "</button>" +
    '<button type="button" data-action="delete" class="menuDanger">' + t("menuDelete") + "</button>";
  updateIndicators();
}
let defaultPersonality = "";
let compacting = false;
let memoryTargetId = null;

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

function setBusyStatus(text) {
  if (!elements.chatStatus) return;
  elements.chatStatus.textContent = text;
  elements.chatStatus.className = "chatStatus busy";
  elements.chatStatus.hidden = false;
}

function clearBusyStatus() {
  if (!elements.chatStatus) return;
  if (elements.chatStatus.classList.contains("warn")) return;
  elements.chatStatus.hidden = true;
}

function setWarnStatus(text) {
  if (!elements.chatStatus) return;
  elements.chatStatus.textContent = text;
  elements.chatStatus.className = "chatStatus warn";
  elements.chatStatus.hidden = false;
}

function updateIndicators() {
  if (!elements.settingsBtn || !elements.composerHint) return;
  const customKey = keyLooksValid(settings.apiKey) ? settings.apiKey : "";
  elements.settingsBtn.classList.toggle("hasCustom", Boolean(customKey));
  const parts = [];
  if (customKey) parts.push("Własny klucz API aktywny");
  const name = settings.name.trim();
  if (name) parts.push(t("persona") + ": " + name);
  elements.composerHint.textContent = parts.length
    ? parts.join(" · ")
    : t("composerHint");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildZipBlob(files) {
  const encoder = new TextEncoder();
  const now = new Date();
  const time =
    ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const day =
    (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    chunks.push(new Uint8Array(local.buffer), nameBytes, data);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(12, time, true);
    cd.setUint16(14, day, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, data.length, true);
    cd.setUint32(24, data.length, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint32(42, offset, true);
    central.push({ header: new Uint8Array(cd.buffer), nameBytes });
    offset += 30 + nameBytes.length + data.length;
  }
  let cdSize = 0;
  for (const entry of central) {
    chunks.push(entry.header, entry.nameBytes);
    cdSize += 46 + entry.nameBytes.length;
  }
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, central.length, true);
  eocd.setUint16(10, central.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, offset, true);
  return new Blob([...chunks, new Uint8Array(eocd.buffer)], { type: "application/zip" });
}

let hljsRequested = false;

function ensureHljs() {
  if (window.hljs || hljsRequested) return;
  hljsRequested = true;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
  document.head.appendChild(css);
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
  script.onload = () => {
    document
      .querySelectorAll(".md pre.mdCode code")
      .forEach((code) => {
        try {
          window.hljs.highlightElement(code);
        } catch {
          /* jezyk nierozpoznany */
        }
      });
  };
  document.head.appendChild(script);
}

function extractFileBlocks(text) {
  const files = [];
  const cleaned = text
    .replace(/```file[ \t]+([^\n`]+)\n([\s\S]*?)```/g, (match, name, content) => {
      files.push({ name: name.trim(), content: content.replace(/\n$/, "") });
      return "";
    })
    .trim();
  return { cleaned, files };
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadFile(file) {
  downloadBlob(
    new Blob([file.content], { type: "application/octet-stream" }),
    file.name || "plik.txt"
  );
}

let previewCurrentFile = null;

function setPreviewMode(mode) {
  const frame = document.getElementById("previewFrame");
  const desktopBtn = document.getElementById("previewDesktop");
  const mobileBtn = document.getElementById("previewMobile");
  if (!frame) return;
  frame.classList.toggle("mobile", mode === "mobile");
  if (desktopBtn) desktopBtn.classList.toggle("active", mode !== "mobile");
  if (mobileBtn) mobileBtn.classList.toggle("active", mode === "mobile");
}

function openPreview(file) {
  const overlay = document.getElementById("previewOverlay");
  const frame = document.getElementById("previewFrame");
  const title = document.getElementById("previewTitle");
  if (!overlay || !frame) return;
  previewCurrentFile = file;
  if (title) title.textContent = "Podgląd: " + file.name;
  frame.srcdoc = file.content;
  setPreviewMode("desktop");
  overlay.hidden = false;
}

function createFileCard(file) {
  const card = document.createElement("div");
  card.className = "fileCard";
  const name = document.createElement("span");
  name.className = "fileCardName";
  name.textContent = file.name || "plik.txt";
  name.title = file.name || "";
  const size = document.createElement("span");
  size.className = "fileCardSize mono";
  size.textContent = (new Blob([file.content]).size / 1024).toFixed(1) + " KB";
  const isHtml = /\.(html?|htm)$/i.test(file.name || "");
  if (isHtml) {
    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.className = "btn btnSecondary btnSm";
    previewBtn.textContent = "Podgląd";
    previewBtn.addEventListener("click", () => openPreview(file));
    card.appendChild(previewBtn);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btnPrimary btnSm";
  button.textContent = "Pobierz";
  button.addEventListener("click", () => downloadFile(file));
  card.appendChild(name);
  card.appendChild(size);
  card.appendChild(button);
  return card;
}

function createProjectCard(files) {
  const card = document.createElement("div");
  card.className = "projectCard";

  const head = document.createElement("div");
  head.className = "projectHead";
  const headInfo = document.createElement("div");
  const headTitle = document.createElement("div");
  headTitle.className = "projectTitle";
  headTitle.textContent = "Projekt";
  const headSub = document.createElement("div");
  headSub.className = "projectSub mono";
  headSub.textContent = files.length + " plików";
  headInfo.appendChild(headTitle);
  headInfo.appendChild(headSub);
  const htmlFile =
    files.find((f) => /(^|\/)index\.html?$/i.test(f.name || "")) ||
    files.find((f) => /\.html?$/i.test(f.name || ""));
  const headActions = document.createElement("div");
  headActions.className = "projectHeadActions";
  if (htmlFile) {
    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.className = "btn btnSecondary btnSm";
    previewBtn.textContent = "Podgląd strony";
    previewBtn.addEventListener("click", () => openPreview(htmlFile));
    headActions.appendChild(previewBtn);
  }
  const zipBtn = document.createElement("button");
  zipBtn.type = "button";
  zipBtn.className = "btn btnPrimary btnSm";
  zipBtn.textContent = "Pobierz ZIP";
  zipBtn.addEventListener("click", () => {
    downloadBlob(buildZipBlob(files), "fabian-projekt.zip");
  });
  headActions.appendChild(zipBtn);
  head.appendChild(headInfo);
  head.appendChild(headActions);
  card.appendChild(head);

  const tree = document.createElement("div");
  tree.className = "projectTree";
  for (const file of files) {
    tree.appendChild(createFileCard(file));
  }
  card.appendChild(tree);
  return card;
}

function formatInline(value) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`\n]+)`/g, '<code class="mdInline">$1</code>');
  text = text.replace(/__([^_]+)__/g, "<u>$1</u>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
    if (!/^https?:\/\//i.test(url)) return label;
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + "</a>";
  });
  return text;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function isSeparatorRow(line) {
  const t = line.trim();
  if (!t.includes("|")) return false;
  return /^[|\s:\-]+$/.test(t);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
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

  let i = 0;
  let guard = 0;
  const guardMax = lines.length + 50;
  while (i < lines.length) {
    guard += 1;
    if (guard > guardMax) break;
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      flushParagraph();
      closeList();
      if (inCode) {
        html += "</code></pre>";
      } else {
        const lang = line
          .trim()
          .slice(3)
          .trim()
          .split(/\s+/)[0];
        html += '<pre class="mdCode"><code' +
          (lang ? ' class="language-' + escapeHtml(lang) + '"' : "") +
          ">";
      }
      inCode = !inCode;
      i += 1;
      continue;
    }
    if (inCode) {
      html += escapeHtml(line) + "\n";
      i += 1;
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html += "<hr>";
      i += 1;
      continue;
    }
    if (trimmed.startsWith("-# ")) {
      flushParagraph();
      closeList();
      html += '<div class="mdSub">' + formatInline(trimmed.slice(3)) + "</div>";
      i += 1;
      continue;
    }
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      closeList();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quote.push(lines[i].trim().slice(2));
        i += 1;
      }
      html += "<blockquote>" + quote.map(formatInline).join("<br>") + "</blockquote>";
      continue;
    }
    if (trimmed.includes("|") && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      flushParagraph();
      closeList();
      const header = splitTableRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      html += "<table><thead><tr>" + header.map((h) => "<th>" + formatInline(h) + "</th>").join("") + "</tr></thead><tbody>";
      for (const row of rows) {
        html += "<tr>" + header.map((_, idx) => "<td>" + formatInline(row[idx] || "") + "</td>").join("") + "</tr>";
      }
      html += "</tbody></table>";
      continue;
    }
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length + 1;
      html += "<h" + level + ">" + formatInline(heading[2]) + "</h" + level + ">";
      i += 1;
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
      i += 1;
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
      i += 1;
      continue;
    }
    closeList();
    paragraph.push(trimmed);
    i += 1;
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

let lastScrollAt = 0;

function updateScroll() {
  if (!pinnedToBottom || !elements.chatScroll) return;
  const now = Date.now();
  if (now - lastScrollAt < 90) return;
  lastScrollAt = now;
  elements.chatScroll.scrollTop = elements.chatScroll.scrollHeight;
}

function scrollNow() {
  if (!elements.chatScroll) return;
  lastScrollAt = Date.now();
  elements.chatScroll.scrollTop = elements.chatScroll.scrollHeight;
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
    empty.textContent = t("sideEmpty");
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

function fillBotAvatar(avatarEl) {
  const letter = (assistantName().charAt(0) || "F").toUpperCase();
  avatarEl.textContent = letter;
  const url = settings.botIcon.trim();
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.addEventListener("error", () => img.remove());
    avatarEl.appendChild(img);
  }
}

function buildMessageNode(role, content, attachments) {
  const node = document.createElement("div");
  node.className = "msg " + (role === "user" ? "msgUser" : "msgFabian");
  const avatar = document.createElement("div");
  avatar.className = "msgAvatar";
  if (role === "user") {
    avatar.textContent = "Ty";
  } else {
    fillBotAvatar(avatar);
  }
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

const mdCache = new Map();
const fileCache = new Map();

function renderMarkdownCached(source) {
  if (mdCache.has(source)) return mdCache.get(source);
  const html = renderMarkdown(source);
  if (mdCache.size > 60) mdCache.clear();
  mdCache.set(source, html);
  return html;
}

function extractFileBlocksCached(text) {
  if (fileCache.has(text)) return fileCache.get(text);
  const parsed = extractFileBlocks(text);
  if (fileCache.size > 60) fileCache.clear();
  fileCache.set(text, parsed);
  return parsed;
}

function typewriterReveal(el, maxDuration) {
  const duration = maxDuration || 900;
  return new Promise((resolve) => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof NodeFilter === "undefined"
    ) {
      resolve();
      return;
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const targets = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim()) targets.push({ node: node, full: node.textContent });
    }
    const total = targets.reduce((sum, t) => sum + t.full.length, 0);
    if (!total || total > 4000) {
      resolve();
      return;
    }
    for (const t of targets) t.node.textContent = "";
    el.classList.add("typing");
    const charsPerTick = Math.max(3, Math.ceil(total / (duration / 16)));
    const timer = setInterval(() => {
      let budget = charsPerTick;
      while (budget > 0 && targets.length) {
        const t = targets[0];
        const take = Math.min(budget, t.full.length - t.node.textContent.length);
        t.node.textContent = t.full.slice(0, t.node.textContent.length + take);
        budget -= take;
        if (t.node.textContent.length >= t.full.length) targets.shift();
      }
      updateScroll();
      if (!targets.length) {
        clearInterval(timer);
        el.classList.remove("typing");
        resolve();
      }
    }, 16);
  });
}

function finalizeAssistant(textEl, full, animate) {
  let parsed;
  let html;
  try {
    parsed = extractFileBlocksCached(full);
    html = renderMarkdownCached(parsed.cleaned || full);
  } catch {
    parsed = { files: [] };
    html = "<p>" + escapeHtml(full).replace(/\n/g, "<br>") + "</p>";
  }
  textEl.className = "msgText md";
  textEl.innerHTML = html;
  const reveal = animate ? typewriterReveal(textEl) : Promise.resolve();
  if (parsed.files.length) {
    const wrap = document.createElement("div");
    wrap.className = "msgFiles";
    if (parsed.files.length === 1) {
      wrap.appendChild(createFileCard(parsed.files[0]));
    } else {
      wrap.appendChild(createProjectCard(parsed.files));
    }
    textEl.parentElement.appendChild(wrap);
  }
  return reveal.then(() => {
    ensureHljs();
    const blocks = textEl.querySelectorAll("pre.mdCode");
    let highlighted = 0;
    for (const pre of blocks) {
      if (highlighted >= 6) break;
      const code = pre.querySelector("code");
      if (window.hljs && code && code.textContent.length <= 15000) {
        try {
          window.hljs.highlightElement(code);
          highlighted += 1;
        } catch {
          /* jezyk nierozpoznany - zostaje zwykly tekst */
        }
      }
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "codeCopyBtn mono";
      copyBtn.textContent = "kopiuj";
      copyBtn.addEventListener("click", () => {
        const target = code || pre;
        navigator.clipboard.writeText(target.textContent).then(() => {
          copyBtn.textContent = "skopiowano";
          setTimeout(() => {
            copyBtn.textContent = "kopiuj";
          }, 1500);
        });
      });
      pre.appendChild(copyBtn);
    }
  });
}

function attachMessageActions(node, conversation, index) {
  const message = conversation.messages[index];
  if (!message) return;
  const actions = document.createElement("div");
  actions.className = "msgActions";
  const addBtn = (label, title, fn, danger) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "msgActionBtn" + (danger ? " danger" : "");
    btn.textContent = label;
    btn.title = title;
    btn.setAttribute("aria-label", title);
    btn.addEventListener("click", fn);
    actions.appendChild(btn);
  };
  if (message.role === "assistant") {
    addBtn("\u21bb", t("genAgain"), () => {
      regenerateFrom(conversation, index);
    });
  }
  if (message.role === "user") {
    addBtn("\u21a9", t("backToPointMsg"), () => {
      confirmDialog(t("backToPoint"), t("backToPointMsg"), t("back")).then((yes) => {
        if (!yes) return;
        conversation.messages = conversation.messages.slice(0, index + 1);
        conversation.updatedAt = Date.now();
        saveChats(state);
        renderAll();
      });
    });
  }
  addBtn("\u270e", t("editMsg"), () => {
    const next = window.prompt(t("editMsg") + ":", message.content);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed.length > 12000) return;
    message.content = trimmed;
    conversation.updatedAt = Date.now();
    saveChats(state);
    renderAll();
  });
  addBtn("\u00d7", t("delMsg"), () => {
    conversation.messages.splice(index, 1);
    conversation.updatedAt = Date.now();
    saveChats(state);
    renderAll();
  }, true);
  const body = node.querySelector(".msgBody");
  if (body) body.appendChild(actions);
}

function regenerateFrom(conversation, assistantIndex) {
  const target = conversation.messages[assistantIndex];
  if (!target || target.role !== "assistant") return;
  conversation.messages = conversation.messages.slice(0, assistantIndex);
  conversation.updatedAt = Date.now();
  saveChats(state);
  renderSidebar();
  elements.chatEmpty.style.display = "none";
  const [textEl, node] = createPlaceholder();
  sending = true;
  if (elements.sendBtn) elements.sendBtn.disabled = true;
  setBusyStatus("Fabian pisze\u2026");
  requestAssistant(conversation, textEl, node, []);
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
  conversation.messages.forEach((message, index) => {
    const { node, text } = buildMessageNode(
      message.role,
      message.content,
      message.attachments
    );
    if (message.role === "assistant") finalizeAssistant(text, message.content);
    attachMessageActions(node, conversation, index);
    elements.messages.appendChild(node);
  });
  forceScroll();
}

function renderAll() {
  renderSidebar();
  renderMessages();
}

async function streamFabian(apiMessages, attachments, memory, onDelta) {
  const body = { messages: apiMessages };
  if (memory) body.memory = memory;
  if (keyLooksValid(settings.apiKey)) body.apiKey = settings.apiKey;
  const baseUrl = validBaseUrl(settings.baseUrl);
  if (baseUrl) body.baseUrl = baseUrl;
  if (settings.model && settings.model !== "groq/compound-mini") body.model = settings.model;
  if (settings.name.trim() || settings.personality.trim()) {
    body.persona = {
      name: settings.name.trim(),
      personality: settings.personality.trim(),
      mode: settings.personaMode === "replace" ? "replace" : "append"
    };
  }
  if (attachments.length) body.attachments = attachments;

  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 90000);
  let response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(fetchTimeout);
  }

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
  textEl.textContent = t("errGeneric");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "retryBtn";
  retry.textContent = t("retry");
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
  const memoryText =
    conversation.memory && conversation.memory.text ? conversation.memory.text : null;
  let attempts = 0;
  try {
    let full = "";
    for (;;) {
      try {
        full = await streamFabian(apiMessages, safeAttachments, memoryText, (delta) => {
          textEl.textContent = delta;
          updateScroll();
        });
        break;
      } catch (error) {
        attempts += 1;
        if (attempts >= 2) throw error;
      }
    }
    if (!full.trim()) throw new Error("empty");
    addMessage(state, conversation.id, "assistant", full);
    saveChats(state);
    await finalizeAssistant(textEl, full, true);
    scrollNow();
    maybeAutoCompact(conversation);
  } catch {
    showError(textEl, node, () => {
      node.remove();
      requestAssistant(conversation, ...createPlaceholder(), safeAttachments);
      updateScroll();
    });
  } finally {
    sending = false;
    if (elements.sendBtn) elements.sendBtn.disabled = false;
    clearBusyStatus();
  }
}

function updateCounter() {
  if (!elements.composerInput || !elements.charCounter) return;
  const length = elements.composerInput.value.length;
  elements.charCounter.textContent = length + "/" + maxLength;
  elements.charCounter.classList.toggle("warn", length > fileThreshold);
}

function handleSend() {
  const content = elements.composerInput.value.trim();
  if (!content || sending || content.length > maxLength) return;

  let conversation = getActiveConversation(state);
  if (!conversation) {
    conversation = createConversation(state, content.slice(0, 48));
  }

  const sentAttachments = pendingAttachments.slice(0, 5);
  let messageContent = content;
  if (content.length > fileThreshold) {
    sentAttachments.push({ name: "wiadomosc.txt", content });
    messageContent = content.slice(0, 280) + "…";
  }
  pendingAttachments = [];
  renderAttachRow();

  const userMessage = addMessage(state, conversation.id, "user", messageContent);
  if (sentAttachments.length) {
    userMessage.attachments = sentAttachments.map((att) => ({ name: att.name }));
  }
  if (saveChats(state) === "pruned") {
    setWarnStatus(t("pruneWarn"));
  }
  elements.composerInput.value = "";
  elements.composerInput.style.height = "auto";
  updateCounter();
  elements.chatEmpty.style.display = "none";
  elements.chatTitle.textContent = conversation.title;

  const userNode = buildMessageNode(
    "user",
    messageContent,
    sentAttachments.map((att) => ({ name: att.name }))
  ).node;
  elements.messages.appendChild(userNode);
  const [textEl, node] = createPlaceholder();

  sending = true;
  if (elements.sendBtn) elements.sendBtn.disabled = true;
  setBusyStatus(t("fabianWriting"));
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

async function handleFiles(fileList) {
  const files = Array.from(fileList || []).slice(
    0,
    Math.max(0, 5 - pendingAttachments.length)
  );
  if (files.length) setBusyStatus(t("loadingFiles"));
  for (const file of files) {
    try {
      if (file.name.toLowerCase().endsWith(".zip")) {
        if (file.size > 400 * 1024) continue;
        const buffer = await file.arrayBuffer();
        pendingAttachments.push({ name: file.name, zip: bufferToBase64(buffer) });
      } else {
        if (file.size > 100 * 1024) continue;
        const text = await file.text();
        pendingAttachments.push({ name: file.name, content: text });
      }
    } catch {
      /* pliku nie dało się odczytać */
    }
  }
  renderAttachRow();
  clearBusyStatus();
}

if (elements.attachBtn && elements.fileInput) {
  elements.attachBtn.addEventListener("click", () => elements.fileInput.click());
  elements.fileInput.addEventListener("change", () => {
    handleFiles(elements.fileInput.files);
    elements.fileInput.value = "";
  });
}

if (elements.chatScroll) {
  const chatMainEl = elements.chatScroll.closest(".chatMain");
  elements.chatScroll.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (chatMainEl) chatMainEl.classList.add("drag-active");
  });
  elements.chatScroll.addEventListener("dragleave", () => {
    if (chatMainEl) chatMainEl.classList.remove("drag-active");
  });
  elements.chatScroll.addEventListener("drop", (event) => {
    event.preventDefault();
    if (chatMainEl) chatMainEl.classList.remove("drag-active");
    if (event.dataTransfer && event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  });
}

const previewOverlayEl = document.getElementById("previewOverlay");
const previewCloseEl = document.getElementById("previewClose");
if (previewCloseEl) {
  previewCloseEl.addEventListener("click", () => {
    if (previewOverlayEl) previewOverlayEl.hidden = true;
  });
}
const previewDesktopEl = document.getElementById("previewDesktop");
if (previewDesktopEl) {
  previewDesktopEl.addEventListener("click", () => setPreviewMode("desktop"));
}
const previewMobileEl = document.getElementById("previewMobile");
if (previewMobileEl) {
  previewMobileEl.addEventListener("click", () => setPreviewMode("mobile"));
}
if (previewOverlayEl) {
  previewOverlayEl.addEventListener("click", (event) => {
    if (event.target === previewOverlayEl) previewOverlayEl.hidden = true;
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
  if (action === "memory") {
    setActiveConversation(state, menuTargetId);
    saveChats(state);
    renderAll();
    openMemoryModal(menuTargetId);
  }
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
    confirmDialog(t("convDeleted"), t("convDeleteMsg"), t("del")).then(
      (yes) => {
        if (!yes) return;
        deleteConversation(state, menuTargetId);
        saveChats(state);
        renderAll();
      }
    );
  }
  closeMenu();
});

function confirmDialog(title, message, confirmText) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirmOverlay");
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const okBtn = document.getElementById("confirmOk");
    const cancelBtn = document.getElementById("confirmCancel");
    if (!overlay || !okBtn || !cancelBtn) {
      resolve(window.confirm(message));
      return;
    }
    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText || "Potwierdź";
    overlay.hidden = false;
    const done = (result) => {
      overlay.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onBackdrop);
      resolve(result);
    };
    const onOk = () => done(true);
    const onCancel = () => done(false);
    const onBackdrop = (event) => {
      if (event.target === overlay) done(false);
    };
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onBackdrop);
  });
}

function editDialog(currentText) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("editOverlay");
    const area = document.getElementById("editTextarea");
    const okBtn = document.getElementById("editOk");
    const cancelBtn = document.getElementById("editCancel");
    if (!overlay || !area || !okBtn || !cancelBtn) {
      resolve(window.prompt(t("editMsg") + ":", currentText));
      return;
    }
    area.value = currentText;
    overlay.hidden = false;
    setTimeout(() => {
      area.focus();
      area.setSelectionRange(area.value.length, area.value.length);
    }, 60);
    const done = (result) => {
      overlay.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onBackdrop);
      resolve(result);
    };
    const onOk = () => done(area.value);
    const onCancel = () => done(null);
    const onBackdrop = (event) => {
      if (event.target === overlay) done(null);
    };
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onBackdrop);
  });
}

function openMemoryModal(conversationId) {
  const conversation = state.conversations.find((x) => x.id === conversationId);
  if (!conversation) return;
  memoryTargetId = conversationId;
  renderMemoryModal(conversation);
  elements.memoryOverlay.hidden = false;
}

function closeMemoryModal() {
  elements.memoryOverlay.hidden = true;
  memoryTargetId = null;
}

function renderMemoryModal(conversation) {
  if (!elements.convStats) return;
  const stats = [
    conversation.messages.length + " wiadomości",
    (conversation.memory ? conversation.memory.text.length : 0) + " znaków pamięci"
  ];
  elements.convStats.innerHTML = "";
  for (const stat of stats) {
    const chip = document.createElement("span");
    chip.className = "convStat";
    chip.textContent = stat;
    elements.convStats.appendChild(chip);
  }
  if (conversation.memory && conversation.memory.text) {
    elements.convMemoryText.textContent = conversation.memory.text;
    elements.convMemoryUpdated.textContent =
      "Zaktualizowano " + formatTime(conversation.memory.updatedAt) +
      " · po " + conversation.memory.count + " wiadomościach";
    elements.memoryForget.disabled = false;
  } else {
    elements.convMemoryText.textContent =
      "Fabian nie zapamiętał jeszcze tej rozmowy. Napisz kilkanaście wiadomości - sam zrobi skrót, albo kliknij \"Zapamiętaj teraz\".";
    elements.convMemoryUpdated.textContent = "";
    elements.memoryForget.disabled = true;
  }
}

async function compactConversation(conversation, showStatus) {
  if (compacting || !conversation || conversation.messages.length === 0) return false;
  compacting = true;
  if (showStatus) setBusyStatus(t("compacting"));
  try {
    const body = {
      messages: conversation.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-60)
        .map((m) => ({ role: m.role, content: m.content }))
    };
    if (keyLooksValid(settings.apiKey)) body.apiKey = settings.apiKey;
    const baseUrl = validBaseUrl(settings.baseUrl);
    if (baseUrl) body.baseUrl = baseUrl;
    const response = await fetch("/api/compact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || typeof data.summary !== "string" || !data.summary.trim()) {
      return false;
    }
    conversation.memory = {
      text: data.summary.trim().slice(0, 4000),
      count: conversation.messages.length,
      updatedAt: Date.now()
    };
    conversation.updatedAt = Date.now();
    saveChats(state);
    renderSidebar();
    return true;
  } catch {
    return false;
  } finally {
    compacting = false;
    if (showStatus) clearBusyStatus();
  }
}

function maybeAutoCompact(conversation) {
  if (!conversation) return;
  const total = conversation.messages.length;
  if (total < 15) return;
  const mem = conversation.memory;
  if (mem && total - mem.count < 15) return;
  compactConversation(conversation, false);
}

function openSettings() {
  elements.settingsApiKey.value = settings.apiKey;
  elements.settingsBaseUrl.value = settings.baseUrl;
  elements.settingsName.value = settings.name;
  elements.settingsPersonality.value =
    settings.personality || defaultPersonality;
  if (elements.settingsPersonaMode) {
    elements.settingsPersonaMode.value =
      settings.personaMode === "replace" ? "replace" : "append";
  }
  if (elements.settingsModel) {
    elements.settingsModel.value = settings.model || "groq/compound-mini";
  }
  if (elements.settingsBotIcon) {
    elements.settingsBotIcon.value = settings.botIcon;
  }
  if (elements.settingsLang) {
    elements.settingsLang.value = uiLang;
  }
  elements.settingsOverlay.hidden = false;
}

function closeSettingsModal() {
  elements.settingsOverlay.hidden = true;
}

if (elements.chatStatus) {
  elements.chatStatus.addEventListener("click", () => {
    if (elements.chatStatus.classList.contains("warn")) {
      elements.chatStatus.hidden = true;
    }
  });
}

if (elements.memoryModalClose) {
  elements.memoryModalClose.addEventListener("click", closeMemoryModal);
}
if (elements.memoryOverlay) {
  elements.memoryOverlay.addEventListener("click", (event) => {
    if (event.target === elements.memoryOverlay) closeMemoryModal();
  });
}
if (elements.memoryForget) {
  elements.memoryForget.addEventListener("click", () => {
    const conversation = state.conversations.find((x) => x.id === memoryTargetId);
    if (!conversation) return;
    delete conversation.memory;
    saveChats(state);
    renderMemoryModal(conversation);
  });
}
if (elements.memoryRefresh) {
  elements.memoryRefresh.addEventListener("click", async () => {
    const conversation = state.conversations.find((x) => x.id === memoryTargetId);
    if (!conversation) return;
    elements.memoryRefresh.disabled = true;
    await compactConversation(conversation, true);
    elements.memoryRefresh.disabled = false;
    renderMemoryModal(conversation);
  });
}

if (elements.memoryClear) {
  elements.memoryClear.addEventListener("click", () => {
    confirmDialog(
      t("convDeleted").replace("rozmowę", "całą pamięć"),
      t("convDeleteMsg"),
      t("del")
    ).then((yes) => {
      if (!yes) return;
      clearAllChats();
      window.location.reload();
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeSidebar();
    closeSettingsModal();
    closeMemoryModal();
    const previewEl = document.getElementById("previewOverlay");
    if (previewEl) previewEl.hidden = true;
  }
});

function updateIdentity() {
  if (elements.emptyHeading) {
    elements.emptyHeading.textContent = "Cześć, jestem " + assistantName() + ".";
  }
  const emptyAvatar = document.querySelector(".emptyAvatar");
  if (emptyAvatar) fillBotAvatar(emptyAvatar);
  renderAll();
}

if (elements.settingsBtn) {
  elements.settingsBtn.addEventListener("click", openSettings);
}
if (elements.settingsClose) {
  elements.settingsClose.addEventListener("click", closeSettingsModal);
}
if (elements.settingsOverlay) {
  elements.settingsOverlay.addEventListener("click", (event) => {
    if (event.target === elements.settingsOverlay) closeSettingsModal();
  });
}
if (elements.settingsSave) {
  elements.settingsSave.addEventListener("click", () => {
    settings = {
      apiKey: elements.settingsApiKey.value.trim(),
      baseUrl: elements.settingsBaseUrl.value.trim(),
      name: elements.settingsName.value.trim().slice(0, 30),
      personality: elements.settingsPersonality.value.trim().slice(0, 5000),
      personaMode:
        elements.settingsPersonaMode &&
        elements.settingsPersonaMode.value === "replace"
          ? "replace"
          : "append",
      model: elements.settingsModel ? elements.settingsModel.value : "groq/compound-mini",
      botIcon: elements.settingsBotIcon ? validBaseUrl(elements.settingsBotIcon.value) : "",
      lang: elements.settingsLang && elements.settingsLang.value === "en" ? "en" : "pl"
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
    uiLang = settings.lang;
    applyUiLang();
    closeSettingsModal();
    updateIdentity();
  });
}
if (elements.settingsClear) {
  elements.settingsClear.addEventListener("click", () => {
    settings = { apiKey: "", baseUrl: "", name: "", personality: "", personaMode: "append", model: "groq/compound-mini", botIcon: "", lang: "pl" };
    persistSettings();
    elements.settingsApiKey.value = "";
    elements.settingsBaseUrl.value = "";
    elements.settingsName.value = "";
    elements.settingsPersonality.value = "";
    if (elements.settingsPersonaMode) elements.settingsPersonaMode.value = "append";
    if (elements.settingsModel) elements.settingsModel.value = "groq/compound-mini";
    if (elements.settingsBotIcon) elements.settingsBotIcon.value = "";
  if (elements.settingsLang) elements.settingsLang.value = "pl";
    updateIdentity();
  });
}

renderAttachRow();
window.addEventListener("fabian-set-lang", (event) => {
  const next = event.detail === "en" ? "en" : "pl";
  settings.lang = next;
  try { localStorage.setItem("fabian_lang", next); } catch (e) {}
  persistSettings();
  uiLang = next;
  applyUiLang();
  updateIdentity();
});

window.addEventListener("fabian-toggle-lang", () => {
  settings.lang = uiLang === "pl" ? "en" : "pl";
  persistSettings();
  uiLang = settings.lang;
  applyUiLang();
  updateIdentity();
});

renderAll();
updateCounter();
updateIdentity();
applyUiLang();
