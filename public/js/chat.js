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
    homeLabel: "FabianAGI - strona główna", mainNavigation: "Nawigacja główna", menuToggle: "Przełącz menu",
    navStart: "Zaczynajmy", navFabian: "Fabian", navResults: "Wyniki", navPrivacy: "Prywatność",
    breadcrumbs: "Okruszki nawigacji", history: "Historia rozmów",
    settingsTitle: "Ustawienia", settingsDesc: "Możesz użyć własnego klucza API (Groq lub dowolne API zgodne z OpenAI). Imię i osobowość działają niezależnie od wybranego klucza.",
    autoTts: "Auto-narrator: czytaj odpowiedzi AI na głos / auto-narrate AI responses", voiceLabel: "Głos lektora / Narrator voice", modelLabel: "Model",
    modelMini: "groq/compound-mini - domyślny, szybki", modelCompound: "groq/compound - pełny, z narzędziami",
    apiKeyLabel: "Własny klucz API (opcjonalny)", baseUrlLabel: "Adres API (opcjonalnie)", assistantNameLabel: "Imię asystenta",
    languageLabel: "Język / Language", polish: "Polski", english: "English", botIconLabel: "Ikona bota (URL, opcjonalnie)",
    personaModeLabel: "Tryb persony", personaAppend: "Dopisz do domyślnej (zalecane)", personaReplace: "Zamień całkowicie",
    personalityLabel: "Własna osobowość (opcjonalnie)", dataTitle: "Dane", dataDesc: "Wszystkie rozmowy z tej przeglądarki. Klucz API i persona zostają.",
    clearChats: "Usuń wszystkie rozmowy", privacyNote: "Klucz i persona przechowywane są wyłącznie w Twojej przeglądarce. Klucz wysyłamy tylko do wybranego API, a personę do modelu wraz z zapytaniem.",
    clear: "Wyczyść", save: "Zapisz", preview: "Podgląd", desktop: "Desktop", mobile: "Mobile 390px",
    areYouSure: "Na pewno?", cancel: "Anuluj", confirm: "Potwierdź", memoryTitle: "Pamięć rozmowy",
    memoryDesc: "Co kilkanaście wiadomości Fabian sam skraca rozmowę do zwięzłego skrótu i trzyma go w pamięci - dzięki temu pamięta, o czym gadaliście, nawet gdy historia się dłuży.",
    userPersonaLabel: "Kim jesteś (persona użytkownika, opcjonalnie)", forgetMemory: "Wyczyść pamięć", rememberNow: "Zapamiętaj teraz",
    settingsClose: "Zamknij ustawienia", previewClose: "Zamknij podgląd", memoryClose: "Zamknij pamięć rozmowy",
    previewFrame: "Podgląd wygenerowanej strony", userMessage: "Wiadomość do asystenta",
    settingsApiPlaceholder: "gsk_...", baseUrlPlaceholder: "https://api.groq.com/openai/v1", assistantPlaceholder: "Fabian",
    botIconPlaceholder: "https://twoja-domena.pl/ikona.png", personalityPlaceholder: "Np. Lubisz stary rock i zawsze masz przy sobie termos z herbatą. Nie znosisz poniedziałków.",
    userPersonaPlaceholder: "Np. Mam na imię Adam, jestem studentem, lubię konkretne odpowiedzi.",
    filePreview: "Podgląd", download: "Pobierz", project: "Projekt", files: "plików", pagePreview: "Podgląd strony", downloadZip: "Pobierz ZIP",
    removeAttachment: "Usuń załącznik", narrator: "Odtwórz jako lektor", responseError: "Błąd", tooLarge: "plik za duży (maks. 400 KB).",
    memoryMessages: "wiadomości", memoryCharacters: "znaków pamięci", memoryUpdated: "Zaktualizowano", afterMessages: "po", people: "osoby", goals: "cele", decisions: "decyzje",
    facts: "Fakty", preferences: "Preferencje", plans: "Plany", dates: "Daty", constraints: "Ograniczenia", unresolved: "Nierozwiązane", ongoing: "Bieżące",
    noMemory: "Fabian nie zapamiętał jeszcze tej rozmowy. Napisz kilkanaście wiadomości - sam zrobi skrót, albo kliknij \"Zapamiętaj teraz\".",
    narratorError: "Lektor nie mógł odtworzyć odpowiedzi.", saveMemoryError: "Nie udało się zapamiętać rozmowy. Spróbuj ponownie.", saved: "Zapisano", settingsSaved: "Ustawienia zostały zapisane.",
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
    homeLabel: "FabianAGI - home page", mainNavigation: "Main navigation", menuToggle: "Toggle menu",
    navStart: "Get started", navFabian: "Fabian", navResults: "Results", navPrivacy: "Privacy",
    breadcrumbs: "Breadcrumbs", history: "Conversation history",
    settingsTitle: "Settings", settingsDesc: "Use your own API key (Groq or any OpenAI-compatible API). The name and personality work independently of the selected key.",
    autoTts: "Auto-narrator: read AI responses aloud", voiceLabel: "Narrator voice", modelLabel: "Model",
    modelMini: "groq/compound-mini - default, fast", modelCompound: "groq/compound - full, with tools",
    apiKeyLabel: "Custom API key (optional)", baseUrlLabel: "API address (optional)", assistantNameLabel: "Assistant name",
    languageLabel: "Language", polish: "Polish", english: "English", botIconLabel: "Bot icon (URL, optional)",
    personaModeLabel: "Persona mode", personaAppend: "Append to default (recommended)", personaReplace: "Replace completely",
    personalityLabel: "Custom personality (optional)", dataTitle: "Data", dataDesc: "All conversations in this browser. Your API key and persona are kept.",
    clearChats: "Delete all conversations", privacyNote: "Your key and persona are stored only in your browser. The key is sent only to the selected API, and the persona is sent to the model with your request.",
    clear: "Clear", save: "Save", preview: "Preview", desktop: "Desktop", mobile: "Mobile 390px",
    areYouSure: "Are you sure?", cancel: "Cancel", confirm: "Confirm", memoryTitle: "Conversation memory",
    memoryDesc: "Every few messages Fabian condenses the conversation into a short summary and keeps it in memory, so he remembers what you discussed even when the history gets long.",
    userPersonaLabel: "Who are you (optional user persona)", forgetMemory: "Clear memory", rememberNow: "Remember now",
    settingsClose: "Close settings", previewClose: "Close preview", memoryClose: "Close conversation memory",
    previewFrame: "Preview of generated page", userMessage: "Message for the assistant",
    settingsApiPlaceholder: "gsk_...", baseUrlPlaceholder: "https://api.groq.com/openai/v1", assistantPlaceholder: "Fabian",
    botIconPlaceholder: "https://your-domain.com/icon.png", personalityPlaceholder: "For example: You like classic rock and always carry a thermos of tea. You dislike Mondays.",
    userPersonaPlaceholder: "For example: My name is Adam, I am a student, and I prefer concise answers.",
    filePreview: "Preview", download: "Download", project: "Project", files: "files", pagePreview: "Page preview", downloadZip: "Download ZIP",
    removeAttachment: "Remove attachment", narrator: "Play as narrator", responseError: "Error", tooLarge: "file too large (max 400 KB).",
    memoryMessages: "messages", memoryCharacters: "memory characters", memoryUpdated: "Updated", afterMessages: "after", people: "people", goals: "goals", decisions: "decisions",
    facts: "Important facts", preferences: "Preferences", plans: "Plans", dates: "Dates", constraints: "Constraints", unresolved: "Unresolved", ongoing: "Ongoing",
    noMemory: "Fabian has not remembered this conversation yet. Write a few more messages and he will summarize it, or click \"Remember now\".",
    narratorError: "The narrator could not play the response.", saveMemoryError: "Could not save the memory. Try again.", saved: "Saved", settingsSaved: "Settings have been saved.",
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
  settingsVoice: document.getElementById("settingsVoice"),
  settingsAutoTts: document.getElementById("settingsAutoTts"),
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
  convUserPersona: document.getElementById("convUserPersona"),
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
    lang: "pl",
    voice: "autumn",
    autoTts: false
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
      lang: data.lang === "en" ? "en" : "pl",
      voice: typeof data.voice === "string" ? data.voice : "autumn",
      autoTts: data.autoTts === true
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
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-attr-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAttrAriaLabel));
  });
  document.querySelectorAll("[data-i18n-attr-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nAttrPlaceholder));
  });
  document.querySelectorAll("[data-i18n-attr-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nAttrTitle));
  });
  document.documentElement.lang = uiLang === "en" ? "en" : "pl";
  document.title = uiLang === "en" ? "Fabian AI Assistant" : "Fabian Asystent AGI";
  const pageDescription = document.getElementById("pageDescription");
  if (pageDescription) {
    pageDescription.content = uiLang === "en"
      ? "Talk to Fabian, the FabianAGI AI assistant for text, code, analysis, and everyday tasks."
      : "Porozmawiaj z Fabianem, asystentem AI FabianAGI do pracy z tekstem, kodem, analizą i codziennymi zadaniami.";
  }
  const ogTitle = document.getElementById("ogTitle");
  if (ogTitle) ogTitle.content = uiLang === "en" ? "Fabian - AI Assistant | FabianAGI" : "Fabian - Asystent AI | FabianAGI";
  const ogDescription = document.getElementById("ogDescription");
  if (ogDescription) ogDescription.content = pageDescription ? pageDescription.content : "";
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
  if (elements.settingsBtn) {
    elements.settingsBtn.setAttribute("aria-label", t("settings"));
    elements.settingsBtn.setAttribute("title", t("settings"));
  }
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
  if (customKey) parts.push(t("ownKey"));
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
  if (title) title.textContent = t("preview") + ": " + file.name;
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
    previewBtn.textContent = t("filePreview");
    previewBtn.addEventListener("click", () => openPreview(file));
    card.appendChild(previewBtn);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btnPrimary btnSm";
  button.textContent = t("download");
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
  headTitle.textContent = t("project");
  const headSub = document.createElement("div");
  headSub.className = "projectSub mono";
  headSub.textContent = files.length + " " + t("files");
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
    previewBtn.textContent = t("pagePreview");
    previewBtn.addEventListener("click", () => openPreview(htmlFile));
    headActions.appendChild(previewBtn);
  }
  const zipBtn = document.createElement("button");
  zipBtn.type = "button";
  zipBtn.className = "btn btnPrimary btnSm";
  zipBtn.textContent = t("downloadZip");
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
    btn.setAttribute("aria-label", t("removeAttachment") + " " + name);
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
    addBtn("\ud83d\udd0a", t("narrator"), (event) => {
      speakText(message.content, event.currentTarget);
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
  setBusyStatus(t("fabianWriting"));
  requestAssistant(conversation, textEl, node, []);
}

function renderMessages() {
  const conversation = getActiveConversation(state);
  elements.messages.innerHTML = "";
  if (!conversation || conversation.messages.length === 0) {
    elements.chatEmpty.style.display = "";
    elements.chatTitle.textContent = t("newConvTitle");
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
  body.lang = uiLang === "en" ? "en" : "pl";
  const activeConv = getActiveConversation(state);
  if (activeConv && activeConv.userPersona) body.userPersona = activeConv.userPersona;
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
    throw new Error(data?.error || t("errGeneric"));
  }
  if (!response.ok || !response.body) {
    throw new Error(t("errGeneric"));
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
  if (name) name.textContent = t("responseError");
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
  dots.setAttribute("aria-label", t("fabianWriting"));
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
    if (settings.autoTts) speakText(full, null, true);
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
        if (file.size > 400 * 1024) {
        alertDialog(
          t("attach"),
          (file.name || "file") + " - " + t("tooLarge"),
          "OK"
        );
        continue;
      }
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
  createConversation(state, t("newConvTitle"));
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
    editDialog(conversation?.title || "").then((next) => {
      if (next !== null) {
        renameConversation(state, menuTargetId, next);
        saveChats(state);
        renderAll();
      }
    });
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



let fabDialogResolver = null;

function fabDialogOpen(options) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("fabOverlay");
    const modal = overlay ? overlay.querySelector(".fabModal") : null;
    const titleEl = document.getElementById("fabDialogTitle");
    const msgEl = document.getElementById("fabDialogMessage");
    const field = document.getElementById("fabDialogField");
    const input = document.getElementById("fabDialogInput");
    const okBtn = document.getElementById("fabDialogOk");
    const cancelBtn = document.getElementById("fabDialogCancel");
    if (!overlay || !modal || !okBtn || !cancelBtn) {
      if (options.input) {
        resolve(window.prompt(options.title, options.initial || ""));
      } else if (options.info) {
        window.alert(options.message);
        resolve(true);
      } else {
        resolve(window.confirm(options.message));
      }
      return;
    }
    fabDialogResolver = resolve;
    modal.classList.remove("success", "info");
    if (options.variant === "success") modal.classList.add("success");
    if (options.variant === "info") modal.classList.add("info");
    titleEl.textContent = options.title || "";
    msgEl.textContent = options.message || "";
    okBtn.textContent = options.confirmText || t("confirm");
    cancelBtn.textContent = options.cancelText || t("cancel");
    if (options.input) {
      field.hidden = false;
      input.value = options.initial || "";
      setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }, 60);
    } else {
      field.hidden = true;
    }
    overlay.hidden = false;
    const done = (value) => {
      overlay.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onBackdrop);
      fabDialogResolver = null;
      resolve(value);
    };
    const onOk = () => done(options.input ? input.value : true);
    const onCancel = () => done(options.input ? null : false);
    const onBackdrop = (event) => { if (event.target === overlay) done(options.input ? null : false); };
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onBackdrop);
  });
}

function editDialog(currentText) {
  return fabDialogOpen({
    title: t("editMsg"),
    message: "",
    input: true,
    initial: currentText,
    confirmText: t("save"),
    variant: "info"
  });
}

function confirmDialog(title, message, confirmText) {
  return fabDialogOpen({
    title: title,
    message: message,
    confirmText: confirmText,
    variant: "danger"
  });
}

function alertDialog(title, message, buttonText) {
  return fabDialogOpen({
    title: title,
    message: message,
    info: true,
    confirmText: buttonText || "OK",
    variant: "info"
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
  if (elements.convUserPersona) {
    elements.convUserPersona.value = conversation.userPersona || "";
  }
  const memoryText =
    conversation.memory && typeof conversation.memory.text === "string"
      ? conversation.memory.text
      : "";
  const stats = [
    conversation.messages.length + " " + t("memoryMessages"),
    memoryText.length + " " + t("memoryCharacters")
  ];
  elements.convStats.innerHTML = "";
  for (const stat of stats) {
    const chip = document.createElement("span");
    chip.className = "convStat";
    chip.textContent = stat;
    elements.convStats.appendChild(chip);
  }
  if (conversation.memory && memoryText) {
    elements.convMemoryText.textContent = memoryText;
    let extraLine =
      t("memoryUpdated") + " " + formatTime(conversation.memory.updatedAt) +
      " · " + t("afterMessages") + " " + conversation.memory.count + " " + t("memoryMessages");
    const s = conversation.memory.structured;
    if (s && typeof s === "object") {
      const parts = [];
      if (Array.isArray(s.people) && s.people.length) parts.push(t("people") + ": " + s.people.slice(0, 4).join(", "));
      if (Array.isArray(s.goals) && s.goals.length) parts.push(t("goals") + ": " + s.goals.length);
      if (Array.isArray(s.decisions) && s.decisions.length) parts.push(t("decisions") + ": " + s.decisions.length);
      if (parts.length) extraLine += "  |  " + parts.join(" · ");
    }
    elements.convMemoryUpdated.textContent = extraLine;
    elements.memoryForget.disabled = false;
  } else {
    elements.convMemoryText.textContent =
      t("noMemory");
    elements.convMemoryUpdated.textContent = "";
    elements.memoryForget.disabled = true;
  }
}

let ttsPlaying = false;

function pcmToWav(pcmBytes, sampleRate) {
  const data = new Uint8Array(pcmBytes);
  const buffer = new ArrayBuffer(44 + data.length);
  const view = new DataView(buffer);
  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + data.length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, data.length, true);
  new Uint8Array(buffer, 44).set(data);
  return buffer;
}

async function speakText(text, button, silent) {
  if (ttsPlaying) return;
  ttsPlaying = true;
  if (button) button.classList.add("active");
  try {
    const response = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 4000), voice: settings.voice || "autumn" })
    });
    if (!response.ok) throw new Error("Speech request failed");
    const audioData = await response.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audio = await ctx.decodeAudioData(audioData);
    const source = ctx.createBufferSource();
    source.buffer = audio;
    source.connect(ctx.destination);
    source.onended = () => { ctx.close().catch(() => {}); ttsPlaying = false; if (button) button.classList.remove("active"); };
    source.start();
  } catch {
    ttsPlaying = false;
    if (button) button.classList.remove("active");
    if (silent) return;
    alertDialog(
      t("narrator"),
      t("narratorError"),
      "OK"
    );
  }
}

function buildMemoryText(structured) {
  const lines = [];
  if (structured.summary) lines.push(structured.summary);
  const sections = [
    ["important_facts", t("facts")], ["people", t("people")], ["preferences", t("preferences")],
    ["goals", t("goals")], ["decisions", t("decisions")], ["plans", t("plans")],
    ["important_dates", t("dates")], ["constraints", t("constraints")],
    ["unresolved_items", t("unresolved")], ["ongoing_context", t("ongoing")]
  ];
  for (const sec of sections) {
    const items = structured[sec[0]];
    if (Array.isArray(items) && items.length) {
      lines.push("", sec[1] + ":");
      for (const item of items.slice(0, 15)) lines.push("- " + item);
    }
  }
  return lines.join("\n").slice(0, 4000);
}

async function compactConversation(conversation, showStatus) {
  if (compacting || !conversation || conversation.messages.length === 0) return false;
  if (conversation.memory && conversation.messages.length - conversation.memory.count < 2) return false;
  compacting = true;
  if (showStatus) setBusyStatus(t("compacting"));
  try {
    const body = {
      messages: conversation.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-40)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }))
    };
    if (conversation.userPersona) body.userPersona = conversation.userPersona;
    if (keyLooksValid(settings.apiKey)) body.apiKey = settings.apiKey;
    const baseUrl = validBaseUrl(settings.baseUrl);
    if (baseUrl) body.baseUrl = baseUrl;
    const response = await fetch("/api/compact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    const structured = data && data.summary && typeof data.summary === "object" ? data.summary : null;
    if (!response.ok || !structured || !structured.summary) {
      if (showStatus) {
        alertDialog(
          t("memoryTitle"),
          t("saveMemoryError"),
          "OK"
        );
      }
      return false;
    }
    conversation.memory = {
      text: buildMemoryText(structured),
      structured: structured,
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

const compactAttempts = new Map();

function maybeAutoCompact(conversation) {
  if (!conversation) return;
  const total = conversation.messages.length;
  if (total < 15) return;
  const mem = conversation.memory;
  if (mem && total - mem.count < 15) return;
  const last = compactAttempts.get(conversation.id) || 0;
  if (Date.now() - last < 5 * 60 * 1000) return;
  compactAttempts.set(conversation.id, Date.now());
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
  if (elements.settingsVoice) {
    elements.settingsVoice.value = settings.voice || "autumn";
  }
  if (elements.settingsAutoTts) {
    elements.settingsAutoTts.checked = settings.autoTts === true;
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

if (elements.convUserPersona) {
  elements.convUserPersona.addEventListener("change", () => {
    const conversation = state.conversations.find((x) => x.id === memoryTargetId);
    if (!conversation) return;
    conversation.userPersona = elements.convUserPersona.value.trim().slice(0, 1000);
    conversation.updatedAt = Date.now();
    saveChats(state);
    renderSidebar();
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
      uiLang === "en" ? "Delete all conversation memory?" : "Usunąć całą pamięć rozmów?",
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
    elements.emptyHeading.textContent = t("emptyHeading").replace("{name}", assistantName());
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
      lang: elements.settingsLang && elements.settingsLang.value === "en" ? "en" : "pl",
      voice: elements.settingsVoice ? elements.settingsVoice.value : "autumn",
      autoTts: elements.settingsAutoTts ? elements.settingsAutoTts.checked : false
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
    alertDialog(
      t("saved"),
      t("settingsSaved"),
      "OK"
    );
  });
}
if (elements.settingsClear) {
  elements.settingsClear.addEventListener("click", () => {
    settings = { apiKey: "", baseUrl: "", name: "", personality: "", personaMode: "append", model: "groq/compound-mini", botIcon: "", lang: "pl", voice: "autumn", autoTts: false };
    persistSettings();
    elements.settingsApiKey.value = "";
    elements.settingsBaseUrl.value = "";
    elements.settingsName.value = "";
    elements.settingsPersonality.value = "";
    if (elements.settingsPersonaMode) elements.settingsPersonaMode.value = "append";
    if (elements.settingsModel) elements.settingsModel.value = "groq/compound-mini";
    if (elements.settingsBotIcon) elements.settingsBotIcon.value = "";
  if (elements.settingsLang) elements.settingsLang.value = "pl";
  if (elements.settingsVoice) elements.settingsVoice.value = "autumn";
  if (elements.settingsAutoTts) elements.settingsAutoTts.checked = false;
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
