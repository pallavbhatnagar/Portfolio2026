/* About extras: the local time in the intro, the career path that follows
   the pointer, and snapshots that lean toward it. Styles in
   css/about-extra.css. */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  // ---------- Local time ----------
  // The time where I am (India), and what I'm probably doing at that hour.
  const lede = document.querySelector(".ab-lede");
  if (lede && window.Intl) {
    // The chip is in the page (so its space is kept from the first paint);
    // older copies of the page get one made here.
    let line = document.querySelector(".ab-now-time");
    if (!line) {
      line = document.createElement("p");
      line.className = "ab-now-time";
      line.innerHTML = '<span class="ab-now-dot" aria-hidden="true"></span><span class="ab-now-text"></span>';
      lede.after(line);
    }
    const text = line.querySelector(".ab-now-text");
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    // The time there, and open to work (so the dot always stays lit).
    const tick = () => { text.innerHTML = `<b>${fmt.format(new Date())}</b> in New Delhi, Available for work`; };
    tick();
    setInterval(tick, 30000);
  }

  // ---------- Career path ----------
  // The bold trace runs along the same curve as the line, from the start
  // to the chosen job's dot (found by walking the curve to that dot's x).
  const path = document.querySelector(".ab-path");
  const main = path && path.querySelector(".pl-main");
  if (path && main && main.getTotalLength) {
    const svg = main.ownerSVGElement;
    const trace = main.cloneNode();
    trace.setAttribute("class", "pl-trace");
    trace.removeAttribute("pathLength");
    main.after(trace);
    const total = trace.getTotalLength();
    const nodes = Array.from(svg.querySelectorAll(".pl-node"));
    const jobs = Array.from(path.querySelectorAll(".path-grid li"));
    // The curve loops back on itself in its first stretch, but never reaches
    // a later dot's x before arriving at that dot, so the first point along
    // it at that x is the dot.
    // Measured once, in a single walk along the curve, on the first hover
    // (walking it on load held the whole page up for a moment).
    let stops = null;
    const measure = () => {
      const xs = nodes.map((n) => Number(n.getAttribute("cx")));
      stops = xs.map((x) => (x <= 10 ? 0 : total));
      const step = total / 600;
      for (let l = 0, left = xs.filter((x) => x > 10).length; l <= total && left; l += step) {
        const px = trace.getPointAtLength(l).x;
        xs.forEach((x, k) => { if (x > 10 && stops[k] === total && px >= x - 0.5) { stops[k] = l; left--; } });
      }
    };
    const show = (i) => {
      if (!stops) measure();
      path.classList.toggle("is-tracing", i >= 0);
      trace.style.setProperty("--len", i >= 0 ? `${stops[i] + 0.01}` : "0");
      nodes.forEach((n, k) => n.classList.toggle("is-focus", k === i));
      jobs.forEach((j, k) => j.classList.toggle("is-focus", k === i));
    };
    jobs.forEach((j, i) => {
      j.addEventListener("pointerenter", () => show(i));
      j.addEventListener("pointerleave", () => show(-1));
    });
  }

  // ---------- Snapshots lean in ----------
  // Once a photo has landed (its drop-in animation is let go of, so its
  // transform is free), photos within reach of the pointer drift toward it.
  const pile = document.querySelector(".ab-pile");
  const wide = window.matchMedia("(min-width: 1024px)");
  if (pile) {
    const snaps = () => Array.from(pile.querySelectorAll(".ab-snap:not(.is-copy):not(.is-spare)"));
    pile.addEventListener("animationend", (e) => {
      const s = e.target.closest(".ab-snap");
      if (s && e.animationName === "ab-drop") { s.style.animation = "none"; s.classList.add("is-landed"); }
    });
    // Already landed before this ran (or no drop at all).
    setTimeout(() => snaps().forEach((s) => { if (!s.classList.contains("is-landed")) { s.style.animation = "none"; s.classList.add("is-landed"); } }), 2500);
    let raf = 0, last = null;
    const REACH = 260, PULL = 9;
    const paint = () => {
      raf = 0;
      snaps().forEach((s) => {
        if (!s.classList.contains("is-landed")) return;
        if (!last) { s.style.transform = ""; s.classList.remove("is-near"); return; }
        const r = s.getBoundingClientRect();
        const dx = last.x - (r.left + r.width / 2), dy = last.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d > REACH || s.matches(":hover")) { s.style.transform = ""; s.classList.remove("is-near"); return; }
        const k = (1 - d / REACH) * PULL / Math.max(d, 1);
        s.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k - (1 - d / REACH) * 4).toFixed(1)}px)`;
        s.classList.add("is-near");
      });
    };
    document.addEventListener("pointermove", (e) => {
      if (!wide.matches || !fine.matches || reduce.matches) return;
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { last = null; if (!raf) raf = requestAnimationFrame(paint); });
    window.addEventListener("scroll", () => { if (last && !raf) raf = requestAnimationFrame(paint); }, { passive: true });
  }
})();
