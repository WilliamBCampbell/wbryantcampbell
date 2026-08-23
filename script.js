const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-nav]");
const orbit = document.querySelector("[data-orbit]");
const orbitWord = document.querySelector("[data-orbit-word]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

const trackPatterns = [
  [0.46, 0.46, 0.46, 0.46, 0.46],
  [0.19, 0.27, 0.46, 0.27, 0.19],
  [0.27, 0.46, 0.19, 0.46, 0.27],
];
let activeTrackPattern = 0;
const orbitWords = ["Useful", "Fun", "Creative", "Helpful", "Crazy", "Inspired", "Interesting"];
let activeOrbitWord = 0;
let flashTimer;
let radiusAnimationFrame;

function setOrbitTracks({ animate = false } = {}) {
  const particles = orbit.querySelectorAll(".mana");
  const orbitSize = orbit.getBoundingClientRect().width;
  const particleSize = particles[0].getBoundingClientRect().width;
  const availableRadius = (orbitSize - particleSize) / 2;
  const targetRadii = Array.from(particles, (_, index) =>
    availableRadius * (trackPatterns[activeTrackPattern][index] / 0.46)
  );

  window.cancelAnimationFrame(radiusAnimationFrame);

  if (!animate || reducedMotion) {
    particles.forEach((particle, index) => particle.style.setProperty("--radius", `${targetRadii[index]}px`));
    return;
  }

  const startingRadii = Array.from(particles, (particle) => {
    const currentRadius = Number.parseFloat(particle.style.getPropertyValue("--radius"));
    return Number.isFinite(currentRadius) ? currentRadius : availableRadius;
  });
  const startedAt = performance.now();
  const duration = 720;

  function moveToNextTrack(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    particles.forEach((particle, index) => {
      const radius = startingRadii[index] + (targetRadii[index] - startingRadii[index]) * easedProgress;
      particle.style.setProperty("--radius", `${radius}px`);
    });

    if (progress < 1) radiusAnimationFrame = window.requestAnimationFrame(moveToNextTrack);
  }

  radiusAnimationFrame = window.requestAnimationFrame(moveToNextTrack);
}

function changeOrbitTracks() {
  startOrbit();
  activeTrackPattern = (activeTrackPattern + 1) % trackPatterns.length;
  activeOrbitWord = (activeOrbitWord + 1) % orbitWords.length;
  setOrbitTracks({ animate: true });
  changeOrbitWord();
  orbit.classList.add("track-flash");
  orbit.setAttribute("aria-label", `Interactive five-color orbit. Track pattern ${activeTrackPattern + 1} of ${trackPatterns.length}. Hover to set the colors in motion. Click to change their tracks.`);
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => orbit.classList.remove("track-flash"), 720);
}

function changeOrbitWord() {
  orbitWord.textContent = orbitWords[activeOrbitWord];
  if (reducedMotion) return;

  orbitWord.animate(
    [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 360, easing: "cubic-bezier(.22,.8,.3,1)" }
  );
}

function startOrbit() {
  orbit.classList.add("orbiting");
}

setOrbitTracks();
window.addEventListener("resize", setOrbitTracks);
orbit.addEventListener("pointerenter", startOrbit, { once: true });
orbit.addEventListener("focus", startOrbit, { once: true });
orbit.addEventListener("click", changeOrbitTracks);
orbit.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    changeOrbitTracks();
  }
});

const revealElements = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
}
