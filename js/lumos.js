/* Lumos: a hidden nod to Harry Potter. Type "lumos" anywhere (not in a text
   field), or send it to the Ask box, and night falls over the page: the
   pointer becomes a wand whose light shows whatever it rests on. "nox", Esc
   or the Nox button puts it out. It stays lit from page to page until then.

   How the light is made to feel real:
   - Falloff: the dark eases in the way light falls off (bright core, long
     soft edge), not a hard ring.
   - Inertia: the wand tip sits on the pointer; the pool of light it throws
     follows on a spring, a beat behind.
   - Flicker: radius and warmth breathe on a few unrelated slow waves plus a
     little noise, like a live flame rather than a pulse.
   - Dust: motes drift across the page, seen only where the light falls.
   - Sparks: shed from the tip as it moves (more when it moves fast), with
     gravity, drag and a twinkle; a burst and a ring when it's cast.
   - Nox: the light gutters (two dips), closes into the tip and leaves a
     curl of smoke.
   It is off with motion reduced or in Calm (and goes out if Calm is
   switched on while it is lit), and on touch screens (phones, tablets,
   iPads), which have no keyboard to cast it with. */
(() => {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) { try { sessionStorage.removeItem("lumos"); } catch (e) {} return; }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const KEY = "lumos";
  const store = { get: () => { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }, set: (v) => { try { v ? sessionStorage.setItem(KEY, "1") : sessionStorage.removeItem(KEY); } catch (e) {} } };

  const css = document.createElement("style");
  css.textContent = `
.lumos-night { position: fixed; inset: 0; z-index: 9990; pointer-events: none; opacity: 0; transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  --x: 50vw; --y: 45vh; --r: 170px; --g: 0.22;
  background: radial-gradient(circle var(--r) at var(--x) var(--y), rgba(5, 7, 18, 0) 0%, rgba(5, 7, 18, 0.02) 25%, rgba(5, 7, 18, 0.12) 45%, rgba(5, 7, 18, 0.32) 60%, rgba(5, 7, 18, 0.6) 75%, rgba(5, 7, 18, 0.82) 88%, rgba(5, 7, 18, 0.94) 100%); }
.lumos-night::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle calc(var(--r) * 0.85) at var(--x) var(--y), rgba(255, 212, 140, var(--g)), rgba(255, 212, 140, 0) 70%); mix-blend-mode: soft-light; }
.lumos-night.is-on { opacity: 1; }
.lumos-fx { position: fixed; inset: 0; z-index: 9991; width: 100vw; height: 100vh; pointer-events: none; }
.lumos-say { position: fixed; left: 50%; bottom: max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem)); z-index: 9992; display: flex; align-items: center; gap: 0.875rem; padding: 0.375rem 0.375rem 0.375rem 0.875rem; border: 1px solid var(--hairline); border-radius: 0.75rem; background: var(--bg); color: var(--ink-soft); box-shadow: 0 0.5rem 1.5rem -0.75rem rgba(0, 0, 0, 0.45); font: 400 0.8125rem/1.3 var(--font), sans-serif; white-space: nowrap; translate: -50% 0.5rem; opacity: 0; pointer-events: none; transition: opacity 0.25s cubic-bezier(0.23, 1, 0.32, 1), translate 0.25s cubic-bezier(0.23, 1, 0.32, 1); }
.lumos-say.is-on { opacity: 1; translate: -50% 0; pointer-events: auto; }
.lumos-say b { margin-right: 0.375rem; font-weight: 600; color: var(--ink); }
.lumos-say kbd { display: inline-block; min-width: 1.25rem; padding: 0.0625rem 0.3125rem; border: 1px solid var(--hairline); border-bottom-width: 2px; border-radius: 0.3125rem; font: 500 0.75rem/1.3 var(--font), sans-serif; color: var(--ink); text-align: center; }
.lumos-say .ls-touch { display: none; }
@media (hover: none), (pointer: coarse) { .lumos-say .ls-keys { display: none; } .lumos-say .ls-touch { display: inline; } }
.lumos-say button { padding: 0.375rem 0.75rem; border: 0; border-radius: 0.5rem; background: var(--ink); color: var(--bg); font: 500 0.8125rem/1.2 var(--font), sans-serif; cursor: pointer; transition: transform 0.16s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.16s ease; }
@media (hover: hover) and (pointer: fine) { .lumos-say button:hover { opacity: 0.88; } }
.lumos-say button:active { transform: scale(0.97); }
.lumos-say button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
html.is-lumos, html.is-lumos * { cursor: none !important; }
html.is-lumos .lumos-say, html.is-lumos .lumos-say * { cursor: pointer !important; }
@media (hover: none), (pointer: coarse) { html.is-lumos, html.is-lumos * { cursor: auto !important; } }
@media (prefers-reduced-motion: reduce) { .lumos-night { transition: opacity 0.2s ease; } .lumos-say { transition: opacity 0.2s ease; translate: -50% 0; } }
/* Page morphs (View Transitions, e.g. the works list/grid switch) lift what
   moves into a layer above the page. Named here too, the night and the
   light stay on top of it and keep running instead of blinking off. */
html.is-lumos .lumos-night { view-transition-name: lumos-night; }
html.is-lumos .lumos-fx { view-transition-name: lumos-fx; }
html.is-lumos .lumos-say:not(.lumos-nudge) { view-transition-name: lumos-say; } /* names must be unique */
::view-transition-group(lumos-night), ::view-transition-group(lumos-fx), ::view-transition-group(lumos-say), ::view-transition-new(lumos-night), ::view-transition-new(lumos-fx), ::view-transition-new(lumos-say) { animation: none; }
::view-transition-old(lumos-night), ::view-transition-old(lumos-fx), ::view-transition-old(lumos-say) { display: none; }
@media (forced-colors: active) { .lumos-night, .lumos-fx { display: none; } }
@media print { .lumos-night, .lumos-fx, .lumos-say { display: none; } }`;
  document.head.appendChild(css);

  const night = document.createElement("div");
  night.className = "lumos-night";
  night.setAttribute("aria-hidden", "true");
  const fx = document.createElement("canvas");
  fx.className = "lumos-fx";
  fx.setAttribute("aria-hidden", "true");
  const ctx = fx.getContext("2d");
  const say = document.createElement("div");
  say.className = "lumos-say";
  say.setAttribute("role", "status");
  say.innerHTML = `<span><b>Lumos</b><span class="ls-keys">Type <kbd>nox</kbd> or press <kbd>Esc</kbd> to end</span><span class="ls-touch">Your light follows your finger</span></span><button type="button">Nox</button>`;
  document.body.append(night, fx, say);

  // ---- State ----
  let on = false, running = false, raf = 0, last = 0, t = 0;
  const ptr = { x: innerWidth / 2, y: innerHeight * 0.42, vx: 0, vy: 0 }; // the wand tip
  const lt = { x: ptr.x, y: ptr.y, vx: 0, vy: 0 };                        // the pool of light
  const rad = { v: 0, vel: 0, to: 0 };                                     // its radius, on a spring
  let flash = 0, ring = -1, gutter = 0;
  const sparks = [], smoke = [], motes = [];
  const R = () => (innerWidth <= 640 ? 125 : 175);
  const calm = () => reduce.matches;

  let dpr = 1;
  const size = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    fx.width = Math.round(innerWidth * dpr); fx.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();

  const rand = (a, b) => a + Math.random() * (b - a);
  const seedMotes = () => {
    motes.length = 0;
    const n = Math.round((innerWidth * innerHeight) / 9000);
    for (let i = 0; i < n; i++) motes.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), vx: rand(-0.08, 0.08), vy: rand(-0.06, 0.04), s: rand(0.5, 1.6), ph: rand(0, 6.28) });
  };

  const spark = (x, y, speed, inherit) => {
    if (sparks.length > 600) return;
    const a = rand(0, Math.PI * 2), v = speed * rand(0.35, 1);
    sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v + (inherit ? ptr.vx * 0.12 : 0), vy: Math.sin(a) * v - rand(0, 0.6) + (inherit ? ptr.vy * 0.12 : 0), life: 0, max: rand(38, 95), s: rand(0.9, 2.4), hue: rand(36, 50), ph: rand(0, 6.28) });
  };

  // A flame-like flicker: slow unrelated waves plus a little smoothed noise.
  let noise = 0;
  const flicker = () => {
    noise += (Math.random() - 0.5) * 0.05; noise *= 0.92;
    return 1 + 0.022 * Math.sin(t * 6.1) + 0.016 * Math.sin(t * 11.7 + 1.3) + 0.01 * Math.sin(t * 23.3 + 0.7) + noise;
  };

  const frame = (now) => {
    raf = 0;
    const dt = Math.min(2.5, last ? (now - last) / 16.667 : 1); // in 60fps frames
    last = now; t += dt / 60;
    const still = calm();

    // The light follows the tip on a spring (a beat behind); Calm: at once.
    if (still) { lt.x = ptr.x; lt.y = ptr.y; }
    else {
      const k = 0.09, d = 0.62;
      lt.vx = (lt.vx + (ptr.x - lt.x) * k * dt) * Math.pow(d, dt); lt.vy = (lt.vy + (ptr.y - lt.y) * k * dt) * Math.pow(d, dt);
      lt.x += lt.vx * dt; lt.y += lt.vy * dt;
    }
    // The radius springs to its target, overshooting a touch when cast.
    if (still) rad.v = rad.to;
    else { rad.vel = (rad.vel + (rad.to - rad.v) * 0.06 * dt) * Math.pow(0.84, dt); rad.v += rad.vel * dt; }
    const fl = still ? 1 : flicker();
    let r = Math.max(0, rad.v * fl);
    if (gutter > 0) { r *= 1 - 0.35 * Math.max(0, Math.sin(gutter * 0.45)); gutter -= dt; }
    night.style.setProperty("--x", lt.x.toFixed(1) + "px");
    night.style.setProperty("--y", lt.y.toFixed(1) + "px");
    night.style.setProperty("--r", r.toFixed(1) + "px");
    night.style.setProperty("--g", (0.2 + (fl - 1) * 2.2).toFixed(3));

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!still) {
      // Dust: seen only where the light falls.
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        m.vx += (Math.random() - 0.5) * 0.004 * dt; m.vy += (Math.random() - 0.5) * 0.004 * dt;
        m.vx *= 0.995; m.vy *= 0.995; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < -5) m.x = innerWidth + 5; else if (m.x > innerWidth + 5) m.x = -5;
        if (m.y < -5) m.y = innerHeight + 5; else if (m.y > innerHeight + 5) m.y = -5;
        const dd = Math.hypot(m.x - lt.x, m.y - lt.y);
        if (dd > r * 0.9) continue;
        const a = (1 - dd / (r * 0.9)) * 0.55 * (0.6 + 0.4 * Math.sin(t * 2 + m.ph));
        ctx.fillStyle = `rgba(255, 238, 205, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.s, 0, 6.283); ctx.fill();
      }
      // Sparks shed from the tip: a trickle at rest, more as it moves.
      if (on) {
        const speed = Math.hypot(ptr.vx, ptr.vy);
        let n = 0.2 * dt + Math.min(2.6, speed * 0.04) * dt;
        while (n > 0) { if (Math.random() < n) spark(ptr.x + rand(-2, 2), ptr.y + rand(-2, 2), rand(0.4, 1.6), true); n -= 1; }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.px = s.x; s.py = s.y;
        s.vy += 0.035 * dt; s.vx *= Math.pow(0.965, dt); s.vy *= Math.pow(0.965, dt);
        s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt;
        if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        const k = 1 - s.life / s.max, tw = 0.55 + 0.45 * Math.sin(s.life * 0.7 + s.ph);
        const a = k * tw;
        // A gold streak drawn over the page (so it shows on the lit, pale
        // page too), with a white-hot head and a glow added on top.
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `hsla(${s.hue}, 100%, ${50 + 18 * k}%, ${(a * 0.95).toFixed(3)})`;
        ctx.lineWidth = s.s; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(s.px - s.vx * 1.8, s.py - s.vy * 1.8); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = `hsla(${s.hue + 8}, 100%, 88%, ${(a * 0.9).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.6, 0, 6.283); ctx.fill();
        ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${(a * 0.2).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 3.6, 0, 6.283); ctx.fill();
      }
      // The cast: a flash from the tip and a ring that rolls out.
      if (flash > 0) {
        const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, R() * (1.9 - flash));
        g.addColorStop(0, `rgba(255, 250, 235, ${(flash * 0.95).toFixed(3)})`);
        g.addColorStop(0.35, `rgba(255, 225, 160, ${(flash * 0.4).toFixed(3)})`);
        g.addColorStop(1, "rgba(255, 210, 140, 0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, R() * (1.9 - flash), 0, 6.283); ctx.fill();
        flash = Math.max(0, flash - 0.045 * dt);
      }
      if (ring >= 0) {
        const k = ring, e = 1 - Math.pow(1 - k, 3);
        ctx.strokeStyle = `rgba(255, 232, 185, ${((1 - k) * 0.55).toFixed(3)})`;
        ctx.lineWidth = 2 * (1 - k) + 0.5;
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, R() * 0.2 + R() * 2.2 * e, 0, 6.283); ctx.stroke();
        ring += 0.022 * dt; if (ring >= 1) ring = -1;
      }
      // Smoke after Nox: soft grey puffs that rise, spread and thin out.
      ctx.globalCompositeOperation = "source-over";
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.vx += Math.sin(t * 2 + p.ph) * 0.01 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= Math.pow(0.99, dt);
        p.r += 0.35 * dt; p.life += dt;
        if (p.life >= p.max) { smoke.splice(i, 1); continue; }
        const a = Math.sin((p.life / p.max) * Math.PI) * 0.16;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(205, 205, 215, ${a.toFixed(3)})`); g.addColorStop(1, "rgba(205, 205, 215, 0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    // The wand tip: a small white-hot point with a warm halo.
    if (on || rad.v > 1) {
      ctx.globalCompositeOperation = "lighter";
      const hr = (on ? 16 : 10) * fl;
      const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, hr);
      g.addColorStop(0, "rgba(255, 252, 240, 1)"); g.addColorStop(0.18, "rgba(255, 240, 200, 0.9)");
      g.addColorStop(0.45, "rgba(255, 205, 130, 0.35)"); g.addColorStop(1, "rgba(255, 190, 110, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, hr, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ptr.vx *= 0.8; ptr.vy *= 0.8; // the pointer's speed settles between moves

    const busy = on || rad.v > 0.5 || sparks.length || smoke.length || flash > 0 || ring >= 0;
    if (busy && !document.hidden) raf = requestAnimationFrame(frame);
    else { running = false; last = 0; if (!on) ctx.clearRect(0, 0, innerWidth, innerHeight); }
  };
  const run = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", () => { if (!document.hidden && (on || sparks.length)) run(); });

  // ---- Casting ----
  // The spell's sound. Fetched only once someone starts to spell it, or is
  // shown how, so most visits never download it.
  const SOUND = "lumos.mp3";
  const ready = () => { if (window.siteSfx) window.siteSfx.load(SOUND); };
  // Played the moment it is cast. If it isn't decoded yet (a very quick
  // typist on a slow line), it plays the moment it is, but only if that is
  // still close enough to the cast to feel like one event.
  const chime = () => {
    const s = window.siteSfx;
    if (!s) return;
    if (s.ready(SOUND)) { s.play(SOUND); return; }
    const t = performance.now();
    s.load(SOUND).then((v) => { if (v && on && performance.now() - t < 600) s.play(SOUND); });
  };
  // Fetched and decoded once the page has settled, so it is ready long
  // before anyone finishes typing the word.
  addEventListener("load", () => (window.requestIdleCallback || setTimeout)(ready, { timeout: 3000 }), { once: true });
  if (document.readyState === "complete") (window.requestIdleCallback || setTimeout)(ready, { timeout: 3000 });
  const light = (cast) => {
    if (on || calm()) return; // no spell with motion reduced or in Calm
    on = true; store.set(true);
    hideNudge();
    document.documentElement.classList.add("is-lumos");
    night.classList.add("is-on"); say.classList.add("is-on");
    if (!motes.length) seedMotes();
    lt.x = ptr.x; lt.y = ptr.y; lt.vx = lt.vy = 0;
    night.style.setProperty("--x", lt.x + "px"); night.style.setProperty("--y", lt.y + "px"); // in place from the first frame
    rad.to = R();
    if (cast) chime();
    if (cast && !calm()) {
      rad.v = 0; rad.vel = 9; // springs open past its size, then settles
      flash = 1; ring = 0;
      for (let i = 0; i < 32; i++) spark(ptr.x, ptr.y, rand(2.5, 7.5), false);
    } else { rad.v = rad.to; rad.vel = 0; }
    run();
  };
  const putOut = () => {
    if (!on) return;
    on = false; store.set(false);
    say.classList.remove("is-on");
    rad.to = 0;
    if (!calm()) {
      gutter = 26; // two dips before it goes
      for (let i = 0; i < 9; i++) smoke.push({ x: ptr.x + rand(-4, 4), y: ptr.y + rand(-4, 2), vx: rand(-0.15, 0.15), vy: rand(-0.9, -0.45), r: rand(4, 9), life: -i * 2, max: rand(45, 65), ph: rand(0, 6.28) });
    }
    setTimeout(() => {
      if (on) return;
      night.classList.remove("is-on");
      document.documentElement.classList.remove("is-lumos");
    }, calm() ? 0 : 380);
    run();
  };
  say.querySelector("button").addEventListener("click", putOut);

  // The spell: the last letters typed, outside any text field.
  let typed = "";
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && on) { putOut(); return; }
    const tg = e.target;
    if (e.metaKey || e.ctrlKey || e.altKey || (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)))) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed.endsWith("lu")) ready();
    if (typed.endsWith("lumos")) { typed = ""; light(true); }
    else if (typed.endsWith("nox")) { typed = ""; putOut(); }
  });

  // Or said to the Ask box (the way in on phones): "lumos" or "nox" sent there
  // casts it instead of asking, and the chat steps aside to show the page.
  document.addEventListener("submit", (e) => {
    const form = e.target, field = form && form.querySelector("textarea, input[type='text']");
    const word = field ? field.value.trim().toLowerCase().replace(/[!.]+$/, "") : "";
    if ((word !== "lumos" && word !== "nox") || calm()) return; // in Calm the chat just answers
    e.preventDefault(); e.stopImmediatePropagation();
    field.value = "";
    const close = document.getElementById("askPanelClose") || document.querySelector(".ask-panel-close");
    if (close) close.click();
    if (word === "lumos") light(true); else putOut();
  }, true);

  document.addEventListener("input", (e) => { const v = e.target && e.target.value; if (typeof v === "string" && /^\s*lu/i.test(v)) ready(); });

  const follow = (e) => {
    if (on) { ptr.vx = e.clientX - ptr.x; ptr.vy = e.clientY - ptr.y; }
    ptr.x = e.clientX; ptr.y = e.clientY;
    if (on) run();
  };
  addEventListener("pointermove", follow, { passive: true });
  addEventListener("pointerdown", follow, { passive: true });
  addEventListener("resize", () => { size(); if (on) { seedMotes(); rad.to = R(); run(); } });

  // ---- Telling people it's there ----
  // The first time someone switches to the dark theme: a one-off nudge.
  const HINT = "lumos-hinted";
  const hinted = () => { try { return localStorage.getItem(HINT); } catch (e) { return "1"; } };
  const nudge = document.createElement("div");
  nudge.className = "lumos-say lumos-nudge";
  nudge.setAttribute("role", "status");
  nudge.innerHTML = `<span><b>It's dark in here.</b>Try typing <kbd>lumos</kbd></span><button type="button">Lumos</button>`;
  document.body.appendChild(nudge);
  let nudgeTimer = 0;
  const hideNudge = () => { clearTimeout(nudgeTimer); nudge.classList.remove("is-on"); };
  nudge.querySelector("button").addEventListener("click", () => { hideNudge(); light(true); });
  new MutationObserver(() => {
    if (document.documentElement.getAttribute("data-theme") !== "dark") { hideNudge(); return; }
    if (on || calm() || hinted()) return;
    try { localStorage.setItem(HINT, "1"); } catch (e) {}
    nudge.classList.add("is-on");
    ready();
    nudgeTimer = setTimeout(hideNudge, 6000);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  // And one for anyone reading the console.
  try { console.log("%cPsst: Try typing lumos", "font: 600 13px/1.4 system-ui, sans-serif; color: #e0a63c;"); } catch (e) {}

  // Lit from page to page: the pointer's spot is kept as the page is left,
  // so on the next page the light starts where the mouse already is, rather
  // than in the middle until the mouse moves.
  addEventListener("pagehide", () => { if (on) { try { sessionStorage.setItem(KEY + "-at", Math.round(ptr.x) + "," + Math.round(ptr.y)); } catch (e) {} } });
  // Calm switched on (or motion reduced) while it is lit: it goes out at once.
  reduce.addEventListener("change", () => { if (calm()) { putOut(); hideNudge(); } });
  if (store.get() && calm()) store.set(false);
  if (store.get()) {
    try {
      const at = (sessionStorage.getItem(KEY + "-at") || "").split(",").map(Number);
      if (at.length === 2 && at.every(isFinite)) { ptr.x = Math.min(at[0], innerWidth); ptr.y = Math.min(at[1], innerHeight); }
    } catch (e) {}
    // Already night on the last page: no fade in, so the page never flashes lit.
    night.style.transition = "none";
    light(false);
    requestAnimationFrame(() => requestAnimationFrame(() => { night.style.transition = ""; }));
  }
})();
