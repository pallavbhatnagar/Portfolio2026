/* Scroll drift on images, the same in every browser. The CSS version
   (style.css: wk-drift, cs-drift-cover, cs-drift-full, cs-drift-crop on
   animation-timeline: view()) is switched off with .js-drift: it followed
   the image frame (overflow: hidden makes it its own scroll box), which
   never scrolls, so it stood still. This moves them with the page instead:
     - Work card images: -4% to 4% while the card crosses the screen, at 110%.
     - Case study cover: 0 to 8% as it leaves through the top, at 106%.
     - Case study images: -3% to 3% (cropped ones -5% to 5% at 170%), at 108%.
   Reduced motion or Calm: no drift, the same framing held still. */
(() => {
  const items = [];
  const add = (sel, kind) => document.querySelectorAll(sel).forEach((el) => items.push({ el, kind }));
  add(".wk-media img, .wk-media video", "card");
  add(".cs-cover-media img, .cs-cover-media video", "cover");
  add(".cs-crop img", "crop");
  if (!items.length) return;
  const root = document.documentElement;
  root.classList.add("js-drift");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => reduce.matches || root.dataset.motion === "calm";
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const frame = (it, p) => {
    const cropped = it.kind === "crop" && it.el.closest(".cs-crop").classList.contains("is-crop");
    if (it.kind === "card") return `translateY(${-4 + 8 * p}%) scale(1.1)`;
    if (it.kind === "cover") return `translateY(${8 * p}%) scale(1.06)`;
    return cropped ? `translateY(${-5 + 10 * p}%) scale(1.7)` : `translateY(${-3 + 6 * p}%) scale(1.08)`;
  };
  let queued = false;
  const draw = () => {
    queued = false;
    const vh = innerHeight, hold = still();
    for (const it of items) {
      const r = (it.kind === "cover" ? it.el.closest(".cs-cover-media") || it.el : it.el).getBoundingClientRect();
      if (!r.height) continue;
      let p;
      if (hold) p = it.kind === "cover" ? 0 : 0.5;
      else if (it.kind === "cover") p = clamp((-r.top / r.height + 0.2) / 1.2); // exit -20% to exit 100%
      else p = clamp((vh - r.top) / (vh + r.height)); // cover
      if (!hold && (r.bottom < -50 || r.top > vh + 50)) continue;
      it.el.style.transform = frame(it, p);
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
  addEventListener("scroll", queue, { passive: true });
  const shell = document.getElementById("shellScroll");
  if (shell) shell.addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  if (reduce.addEventListener) reduce.addEventListener("change", queue);
  new MutationObserver(queue).observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  queue();
})();
