/* ==========================================
   AMINUR PORTFOLIO — SCROLL MOTION SYSTEM
   ========================================== */

const root = document.documentElement;
const progress = document.querySelector(".scroll-progress");
const cursorGlow = document.querySelector(".cursor-glow");
const orbLeft = document.querySelector(".orb-left");
const orbRight = document.querySelector(".orb-right");

let ticking = false;

function updateScrollMotion() {
  const scrollY = window.scrollY;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progressValue = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));

  if (progress) progress.style.width = progressValue + "%";

  /* Global scroll progress variable */
  root.style.setProperty("--scroll", scrollY + "px");

  /* Slow ambient parallax */
  if (orbLeft) orbLeft.style.transform = `translate3d(0, ${scrollY * 0.10}px, 0)`;
  if (orbRight) orbRight.style.transform = `translate3d(0, ${scrollY * -0.07}px, 0)`;

  /* Section-level scroll-linked motion */
  document.querySelectorAll(".scroll-section").forEach(section => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const center = rect.top + rect.height / 2;
    const distance = (center - vh / 2) / vh;
    const clamped = Math.max(-1, Math.min(1, distance));

    section.style.setProperty("--section-shift", `${clamped * -18}px`);
    section.style.setProperty("--section-rotate", `${clamped * -0.45}deg`);
  });

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollMotion);
    ticking = true;
  }
}, { passive: true });

window.addEventListener("resize", updateScrollMotion);
updateScrollMotion();

/* ------------------------------------------
   Reveal observer with staggered children
   ------------------------------------------ */
const revealTargets = document.querySelectorAll(
  ".scroll-section, .skill-card, .credential, .contact-card, .edu-card, .empty-card, .timeline article, .project-card, .project-card"
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("in-view");

    const children = entry.target.querySelectorAll(
  ".skill-card, .credential, .contact-card, .edu-card, .empty-card, .timeline article, .project-card, .tool-cloud span"
);

    children.forEach((child, index) => {
      child.style.setProperty("--delay", `${Math.min(index * 80, 520)}ms`);
      child.classList.add("stagger-in");
    });

    revealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.05,
  rootMargin: "0px 0px 0px 0px"
});

revealTargets.forEach(el => revealObserver.observe(el));

/* ------------------------------------------
   Tool pills: reveal individually on scroll
   ------------------------------------------ */
const toolObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    document.querySelectorAll(".tool-cloud span").forEach((item, index) => {
      item.style.setProperty("--delay", `${index * 45}ms`);
      item.classList.add("tool-visible");
    });

    toolObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

const toolCloud = document.querySelector(".tool-cloud");
if (toolCloud) toolObserver.observe(toolCloud);

/* ------------------------------------------
   Smooth 3D hover — desktop only
   ------------------------------------------ */
if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll(".skill-card, .credential, .contact-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.transform =
        `perspective(900px) translateY(-7px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  /* Cursor spotlight */
  if (cursorGlow) {
    window.addEventListener("pointermove", e => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
      cursorGlow.classList.add("active");
    });

    window.addEventListener("pointerleave", () => {
      cursorGlow.classList.remove("active");
    });
  }
}

/* ------------------------------------------
   Active nav item while scrolling
   ------------------------------------------ */
const navLinks = [...document.querySelectorAll(".nav nav a")];
const observedSections = [...document.querySelectorAll("main section[id]")];

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    navLinks.forEach(link => link.classList.remove("active"));
    const active = navLinks.find(link => link.getAttribute("href") === "#" + entry.target.id);
    if (active) active.classList.add("active");
  });
}, {
  threshold: 0.35,
  rootMargin: "-15% 0px -55% 0px"
});

observedSections.forEach(section => navObserver.observe(section));

/* ------------------------------------------
   Respect reduced-motion preferences
   ------------------------------------------ */
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".scroll-section, .skill-card, .credential, .contact-card, .edu-card, .empty-card, .timeline article, .project-card, .tool-cloud span")
    .forEach(el => el.classList.add("in-view", "stagger-in", "tool-visible"));
}
