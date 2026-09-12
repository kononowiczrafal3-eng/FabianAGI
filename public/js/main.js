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
