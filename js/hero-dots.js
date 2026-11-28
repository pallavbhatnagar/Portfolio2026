/* Home hero: the dot grid answers the pointer. A soft circle of the same
   dots lights up in the AI colours (blue, violet, pink) and trails the
   pointer with a little lag; it fades out when the pointer leaves the hero.
   Mouse and trackpad only, on screens wider than 1024px; off with reduced
   motion and in Calm. The circle's place is kept in two custom
   properties on the lit layer only, so nothing else restyles per frame. */
(() => {
  const hero = document.querySelector(".hc");
  const lit = hero && hero.querySelector(".hc-dots-lit");
  if (!lit) return;
  // Touch-only devices never get the effect: drop the layer and stop here.
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) { lit.remove(); return; }
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const off = () => !fine.matches || reduce.matches || document.documentElement.dataset.motion === "calm" || innerWidth <= 1024;

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, placed = false;
  const tick = () => {
    // Exponential follow: quick to start, settling softly.
    x += (tx - x) * 0.16; y += (ty - y) * 0.16;
    lit.style.setProperty("--mx", `${x.toFixed(1)}px`);
    lit.style.setProperty("--my", `${y.toFixed(1)}px`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || off()) { lit.classList.remove("is-on"); return; }
    const r = lit.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!placed) { x = tx; y = ty; placed = true; }
    lit.classList.add("is-on");
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { lit.classList.remove("is-on"); placed = false; });
})();
