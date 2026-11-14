/* "Selected work, this way" (the foot of Home's first screen): scrolls to
   the point where the projects heading settles in its pinned spot under
   the nav (its sticky top), not just to the top of the section. Jumps
   there with motion reduced or in Calm; otherwise a slow, eased glide. */
(() => {
  const btn = document.querySelector(".hc-down");
  if (!btn) return;
  // At the very top, the bottom blur steps aside (css/hero.css).
  const root = document.documentElement;
  let ticking = false;
  const set = () => { ticking = false; root.classList.toggle("home-top", window.scrollY < 24); };
  set();
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
  // The glide: its own eased scroll (about a second, slow at both ends)
  // rather than the browser's quick "smooth", aiming at where the heading
  // pins, re-measured every frame in case anything above settles. A wheel,
  // touch or key press hands control straight back.
  const target = () => {
    const head = document.querySelector(".proj-head");
    const top = parseFloat(getComputedStyle(head).top);
    return Math.max(0, head.getBoundingClientRect().top + window.scrollY - (isNaN(top) ? 124 : top));
  };
  let raf = 0;
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; root.style.scrollBehavior = ""; } };
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, (e) => { if (!btn.contains(e.target)) stop(); }, { passive: true }));
  btn.addEventListener("click", (e) => {
    if (!document.querySelector(".proj-head")) return;
    e.preventDefault();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-motion") === "calm";
    stop();
    if (still) { root.style.scrollBehavior = "auto"; window.scrollTo(0, target()); root.style.scrollBehavior = ""; return; }
    const from = window.scrollY, dist = target() - from;
    const dur = Math.min(1500, Math.max(1100, Math.abs(dist) * 1.1));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const t0 = performance.now();
    root.style.scrollBehavior = "auto"; // the page's CSS smooth-scroll would fight each step
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const to = target();
      window.scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(step); else { raf = 0; root.style.scrollBehavior = ""; }
    };
    raf = requestAnimationFrame(step);
  });
})();
