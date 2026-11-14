/* "Selected work, this way" (the foot of Home's first screen): scrolls to
   the point where the projects heading settles in its pinned spot under
   the nav (its sticky top), not just to the top of the section. Jumps
   there with motion reduced or in Calm. */
(() => {
  const btn = document.querySelector(".hc-down");
  if (!btn) return;
  // At the very top, the bottom blur steps aside (css/hero.css).
  const root = document.documentElement;
  let ticking = false;
  const set = () => { ticking = false; root.classList.toggle("home-top", window.scrollY < 24); };
  set();
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
  btn.addEventListener("click", (e) => {
    const head = document.querySelector(".proj-head");
    if (!head) return;
    e.preventDefault();
    const top = parseFloat(getComputedStyle(head).top);
    const pinAt = isNaN(top) ? 124 : top;
    const y = head.getBoundingClientRect().top + window.scrollY - pinAt;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "calm";
    window.scrollTo({ top: Math.max(0, y), behavior: still ? "auto" : "smooth" });
  });
})();
