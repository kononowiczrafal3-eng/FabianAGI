const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".resultFill").forEach((fill) => {
  requestAnimationFrame(() => {
    fill.style.width = fill.style.getPropertyValue("--w");
  });
});

const heroTagline = document.getElementById("heroTagline");
if (
  heroTagline &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const phrases = [
    "Konwersacja z Fabianem..",
    "Używanie Magii Świętego Starego Lichenia od 1122",
    "Rozmowy, których nie ogarnie nawet ksiądz proboszcz",
    "Zacięcia, pytania i konkret - po ludzku",
    "Jedna bazylika, jeden Fabian, zero litości",
    "Siła Świętego Starego Lichenia w twojej kieszeni"
  ];
  let phraseIndex = 0;
  setInterval(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    const next = phrases[phraseIndex];
    heroTagline.classList.add("is-swapping");
    setTimeout(() => {
      heroTagline.textContent = next;
    }, 380);
    setTimeout(() => {
      heroTagline.classList.remove("is-swapping");
    }, 950);
  }, 4200);
}


(function () {
  const PAIRS = {
    "/": "/en/", "/index.html": "/en/",
    "/wyniki": "/en/results", "/wyniki/": "/en/results",
    "/prywatnosc": "/privacy", "/prywatnosc/": "/privacy",
    "/regulamin": "/terms", "/regulamin/": "/terms",
    "/en/": "/", "/en/results": "/wyniki", "/en/results/": "/wyniki",
    "/privacy": "/prywatnosc", "/privacy/": "/prywatnosc",
    "/terms": "/regulamin", "/terms/": "/regulamin"
  };
  const path = window.location.pathname;
  const isFabian = path === "/fabian" || path === "/fabian/";

  function getLang() {
    try {
      const saved = localStorage.getItem("fabian_lang");
      if (saved === "pl" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("pl") === 0 ? "pl" : "en";
  }
  function setLang(lang) {
    try { localStorage.setItem("fabian_lang", lang); } catch (e) {}
  }

  function build() {
    const lang = getLang();
    const wrap = document.createElement("div");
    wrap.className = "langDrop";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "langDropToggle";
    toggle.id = "langDropToggle";
    const trigger = document.createElement("label");
    trigger.className = "langDropTrigger";
    trigger.setAttribute("for", "langDropToggle");
    trigger.textContent = (lang === "pl" ? "Polski" : "English") + "  ·  " + lang.toUpperCase();
    const list = document.createElement("ul");
    list.className = "langDropList";
    [["pl", "Polski"], ["en", "English"]].forEach(function (pair) {
      const li = document.createElement("li");
      li.className = "langDropItem";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = pair[1];
      if (pair[0] === lang) btn.classList.add("active");
      btn.addEventListener("click", function () {
        setLang(pair[0]);
        toggle.checked = false;
        if (isFabian) {
          window.dispatchEvent(new CustomEvent("fabian-set-lang", { detail: pair[0] }));
          trigger.textContent = pair[1] + "  ·  " + pair[0].toUpperCase();
          list.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
        } else {
          const target = PAIRS[path] || "/en/";
          window.location.href = target;
        }
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    wrap.appendChild(toggle);
    wrap.appendChild(trigger);
    wrap.appendChild(list);
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
