/* About, Outside the brief: the first card (music) starts large, nearly
   filling the screen, and settles to its real size as you scroll it into
   place. Scale only (the "scale" property, so it never fights the card's
   own entrance transform), eased, driven by where the card sits in the
   window: full size once its top reaches 30% down. Corners round more as
   it shrinks. Reduced motion or Calm: the card is simply its real size. */
(() => {
  const card = document.querySelector(".off-music");
  if (!card) return;
  const root = document.documentElement, reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => reduce.matches || root.dataset.motion === "calm";
  const ease = (t) => t * t * (3 - 2 * t); // smooth in and out, so the shrink is spread across the scroll
  let queued = false;
  const paint = () => {
    queued = false;
    if (still()) { card.style.scale = ""; card.style.removeProperty("--ss"); return; }
    const vh = innerHeight, r = card.getBoundingClientRect();
    // Start once the card's top enters the window; done when it is 30% down.
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
    // Big enough to reach the window's edges, at most 1.35x.
    const big = Math.min(1.35, Math.max(1.06, innerWidth / Math.max(1, card.offsetWidth)));
    const s = big + (1 - big) * ease(t);
    card.style.scale = s.toFixed(4);
    card.style.setProperty("--ss", ease(t).toFixed(3));
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener("scroll", queue, { passive: true });
  const shell = document.getElementById("shellScroll"); if (shell) shell.addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  reduce.addEventListener("change", queue);
  new MutationObserver(queue).observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  paint();
})();
