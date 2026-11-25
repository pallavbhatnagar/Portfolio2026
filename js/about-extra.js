/* About extras: the local time in the intro, the career path that follows
   the pointer, and snapshots that lean toward it. Styles in
   css/about-extra.css. */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  // ---------- A heading's typed last word ----------
  // "Outside the brief" types through a few words (its data-words): the
  // word is deleted letter by letter, as if backspaced, and the next is
  // typed in, a little unevenly like a hand, with a thin caret that blinks
  // while it waits and holds solid while typing. Screen readers hear the
  // first word once. It types only while the heading is in view and the tab
  // is in front; with motion reduced or in Calm it rests on the first word,
  // without the caret.
  const rot = document.querySelector(".ab-rot");
  if (rot) {
    const WORDS = (rot.dataset.words || "").split(" ").filter(Boolean);
    const word = rot.querySelector(".ab-rot-word");
    const caret = document.createElement("span");
    caret.className = "ab-caret";
    caret.setAttribute("aria-hidden", "true");
    rot.append(caret);
    let at = 0, timer = 0, seen = false, busy = false;
    const later = (fn, ms) => { timer = setTimeout(fn, ms); };
    const still = () => reduce.matches || !seen || document.hidden;
    const hold = () => { busy = false; rot.classList.remove("is-typing"); later(next, 2400); };
    const typeIn = (target, n) => {
      if (still()) { word.textContent = target; return hold(); }
      word.textContent = target.slice(0, n);
      if (n >= target.length) return hold();
      later(() => typeIn(target, n + 1), 70 + Math.random() * 60);
    };
    const erase = (target) => {
      if (still()) { word.textContent = target; return hold(); }
      const t = word.textContent;
      if (!t.length) return later(() => typeIn(target, 1), 160);
      word.textContent = t.slice(0, -1);
      later(() => erase(target), 42);
    };
    function next() {
      if (still()) { timer = 0; return; } // picked up again when it is back in view
      busy = true;
      rot.classList.add("is-typing");
      at = (at + 1) % WORDS.length;
      erase(WORDS[at]);
    }
    const wake = () => { if (!timer && !busy && !still()) later(next, 1200); };
    // Back to the first word, and still.
    const rest = () => { clearTimeout(timer); timer = 0; busy = false; at = 0; word.textContent = WORDS[0]; rot.classList.remove("is-typing"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { seen = en.isIntersecting; wake(); }).observe(rot);
    else { seen = true; wake(); }
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", () => { if (reduce.matches) rest(); else wake(); });
  }

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
    // Open to work (the dot stays lit). No clock.
    text.textContent = "Open to new opportunities";
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

/* Phones: the photo strip keeps the height of its tallest opened photo, so
   opening or closing a photo's line never moves the page below it. */
(() => {
  const pile = document.querySelector(".ab-pile");
  if (!pile) return;
  const narrow = matchMedia("(max-width: 640px)");
  const fit = () => {
    pile.style.minHeight = "";
    if (!narrow.matches) return;
    const snaps = Array.from(pile.querySelectorAll(".ab-snap"));
    const was = snaps.filter((s) => s.classList.contains("is-open"));
    pile.classList.add("is-measuring");
    snaps.forEach((s) => s.classList.add("is-open"));
    const h = pile.getBoundingClientRect().height;
    snaps.forEach((s) => { if (!was.includes(s)) s.classList.remove("is-open"); });
    pile.classList.remove("is-measuring");
    pile.style.minHeight = Math.ceil(h) + "px";
  };
  const later = () => requestAnimationFrame(() => requestAnimationFrame(fit));
  if (document.readyState === "complete") later(); else addEventListener("load", later);
  if (document.fonts?.ready) document.fonts.ready.then(later);
  narrow.addEventListener?.("change", later);
  let t = 0; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 150); });
})();

/* Phones: the same hint as under Home's figures, a small down arrow, here
   on the right of "At a glance". It shows only while the page is at the top
   and fades away once you scroll; a tap glides down to the section. */
(() => {
  const glance = document.querySelector(".ab-glance");
  const h = glance && glance.querySelector(".ab-h2");
  if (!h) return;
  const a = document.createElement("a");
  a.className = "ab-down";
  a.href = "#glance";
  a.setAttribute("aria-label", "At a glance, this way");
  a.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';
  glance.classList.add("has-down");
  (glance.querySelector(".ab-sig") || h).append(a);
  const root = document.documentElement;
  let queued = false;
  const set = () => { queued = false; root.classList.toggle("ab-top", window.scrollY < 24); };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(set); } }, { passive: true });
  set();
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "calm";
    glance.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  });
})();

/* At a glance, the voice note (css/about-extra.css, .vn): builds the
   waveform bars, plays or pauses the clip, fills the bars as it plays and
   lets a click on the wave jump to that point. The audio loads only on the
   first play. */
(() => {
  const vn = document.querySelector(".vn");
  if (!vn) return;
  const btn = vn.querySelector(".vn-play"), wave = vn.querySelector(".vn-wave"), audio = vn.querySelector(".vn-audio");
  const N = 36;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  wave.innerHTML = Array.from({ length: N }, (_, i) => {
    const env = 0.45 + 0.55 * Math.sin(Math.PI * (i + 0.5) / N); // louder in the middle
    return `<i style="--h:${Math.max(0.18, env * (0.35 + rnd() * 0.65)).toFixed(2)}"></i>`;
  }).join("");
  const bars = Array.from(wave.children);
  let raf = 0;
  const paint = () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    const lit = Math.round(p * N);
    bars.forEach((b, i) => b.classList.toggle("is-on", i < lit));
    if (!audio.paused) raf = requestAnimationFrame(paint);
  };
  const sync = () => {
    const playing = !audio.paused && !audio.ended;
    vn.classList.toggle("is-playing", playing);
    btn.setAttribute("aria-label", playing ? "Pause voice note" : "Play voice note");
    cancelAnimationFrame(raf); paint();
  };
  btn.addEventListener("click", () => { if (audio.paused || audio.ended) audio.play().catch(() => {}); else audio.pause(); });
  wave.addEventListener("click", (e) => {
    const r = wave.getBoundingClientRect();
    const go = () => { audio.currentTime = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width)) * audio.duration; paint(); };
    if (audio.duration) go(); else { audio.addEventListener("loadedmetadata", go, { once: true }); audio.load(); }
  });
  ["play", "pause", "ended", "seeked"].forEach((ev) => audio.addEventListener(ev, sync));
  audio.addEventListener("ended", () => { audio.currentTime = 0; paint(); });
})();
