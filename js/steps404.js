/* 404: footsteps that have lost their way. A pair of feet walks in from the
   side, wanders about the empty page, stops to look around and sets off
   again, keeping clear of the words. Point at a button and they head
   over to it. Old prints fade; the pair you stand on stays.
   Reduced motion and Calm: a short trail that stops by the buttons. */
(() => {
  const svg = document.getElementById("nfSteps");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => reduce.matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  el("path", { id: "nfFoot", d: "M9 0C9 3.3 4.6 3.9 1.2 3.4C-1.1 3-1.1-3 1.2-3.4C4.6-3.9 9-3.3 9 0ZM-4.2 0C-4.2 2.5-6.5 3-8.3 2.6C-9.8 2.1-9.8-2.1-8.3-2.6C-6.5-3-4.2-2.5-4.2 0Z" }, el("defs", {}, svg));
  const prints = el("g", {}, svg);

  // Where the words are, padded, so the wandering stays out of them.
  const keepOut = () => {
    const r = document.querySelector(".nf").querySelector(".nf-box").getBoundingClientRect();
    return { l: r.left - 36, t: r.top - 36, r: r.right + 36, b: r.bottom + 36 };
  };
  const inside = (p, k) => p[0] > k.l && p[0] < k.r && p[1] > k.t && p[1] < k.b;
  // The feet keep to the ground: never higher than the foot of the hut.
  const floor = () => { const h = document.querySelector(".nf-hut"); return h ? h.getBoundingClientRect().bottom + 16 : 40; };
  // When the words span the whole width (phones), there is no way round
  // them, so the feet stay below them.
  const spot = () => {
    const k = keepOut(), m = 40, wide = k.l < m && k.r > innerWidth - m, top = Math.max(m + 30, floor());
    for (let i = 0; i < 40; i++) {
      const p = [rand(m, innerWidth - m), rand(top, innerHeight - m)];
      if (inside(p, k)) continue;
      if (wide && p[1] < k.b) continue;
      return p;
    }
    return [rand(m, innerWidth - m), innerHeight - m];
  };
  // A path that bends once, rounded off; it goes round the words, not through.
  const chaikin = (pts) => {
    for (let n = 0; n < 3; n++) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
      out.push(pts[pts.length - 1]); pts = out;
    }
    return pts;
  };
  const pathTo = (from, to) => {
    const k = keepOut(), mid = [(from[0] + to[0]) / 2 + rand(-60, 60), Math.max(floor(), (from[1] + to[1]) / 2 + rand(-60, 60))];
    const pts = [from, mid, to];
    // Crossing the words? Go round below them instead.
    const route = chaikin(pts);
    if (!route.some((p) => inside(p, k))) return route;
    // Straight down from where they are, across below the words, and up.
    const y = Math.min(k.b + 20, innerHeight - 24);
    return chaikin([from, [from[0], y], [to[0], y], to]);
  };

  // ---- Walking ----
  const w = { path: null, segs: [], len: 0, d: 0, next: 0, side: 1, speed: 70, live: [], wait: 0, pos: [-30, innerHeight * 0.6], done: null };
  const setPath = (pts, speed, done) => {
    w.live.forEach((f) => (f.keep = false)); // the pair stood on starts to fade
    w.path = pts; w.d = 0; w.next = 8; w.speed = speed; w.done = done; w.wait = 0; w.segs = []; w.len = 0;
    for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); w.segs.push(L); w.len += L; }
  };
  const at = (d) => {
    let i = 0;
    while (i < w.segs.length - 1 && d > w.segs[i]) { d -= w.segs[i]; i++; }
    const a = w.path[i], b = w.path[i + 1], t = w.segs[i] ? Math.min(1, d / w.segs[i]) : 1;
    return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  };
  const pool = [];
  const print = (p, ang, side, keep) => {
    const x = p[0] - Math.sin(ang) * 6 * side, y = p[1] + Math.cos(ang) * 6 * side;
    const u = pool.pop() || el("use", { href: "#nfFoot" });
    u.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 180 / Math.PI + side * 6).toFixed(1)})`);
    u.style.opacity = "0";
    prints.appendChild(u);
    const f = { u, age: 0, keep };
    w.live.push(f);
    return f;
  };
  const stand = () => {
    w.live.forEach((f) => (f.keep = false));
    const e = at(w.len);
    print(e.p, e.ang, 1, true); print(e.p, e.ang, -1, true);
  };
  const HOLD = 1.8, FADE = 1.8;
  const tick = (dt) => {
    if (w.path && w.d < w.len) {
      w.d = Math.min(w.len, w.d + w.speed * dt);
      while (w.next <= w.d && w.next < w.len - 8) { const a = at(w.next); print(a.p, a.ang, w.side, false); w.side = -w.side; w.next += 26; }
      w.pos = at(w.d).p;
      if (w.d >= w.len) { stand(); const fn = w.done; w.done = null; if (fn) fn(); }
    } else if (w.wait > 0 && (w.wait -= dt) <= 0) wander();
    for (let i = w.live.length - 1; i >= 0; i--) {
      const f = w.live[i];
      if (!f.keep) f.age += dt; else f.age = Math.min(f.age + dt, 0.2);
      const o = f.age < 0.2 ? f.age / 0.2 : Math.max(0, 1 - (f.age - HOLD) / FADE);
      f.u.style.opacity = o.toFixed(3);
      if (o <= 0 && f.age > HOLD) { f.u.remove(); pool.push(f.u); w.live.splice(i, 1); }
    }
  };
  let seeking = null;
  const wander = () => {
    if (seeking) return;
    setPath(pathTo(w.pos, spot()), rand(58, 78), () => { w.wait = rand(0.7, 2.2); });
  };
  // Pointing at a button: the feet head over to stand just below it.
  document.querySelectorAll(".nf-actions a").forEach((a) => {
    const seek = () => {
      if (still()) return;
      seeking = a;
      const r = a.getBoundingClientRect();
      setPath(pathTo(w.pos, [r.left + r.width / 2 + rand(-14, 14), r.bottom + 30]), 150, null);
    };
    const leave = () => { if (seeking !== a) return; seeking = null; w.wait = 0.6; if (w.d >= w.len) w.path = null; };
    a.addEventListener("pointerenter", seek); a.addEventListener("focus", seek);
    a.addEventListener("pointerleave", leave); a.addEventListener("blur", leave);
  });

  // ---- The loop ----
  let raf = 0, last = 0;
  const frame = (t) => { const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t; tick(dt); raf = requestAnimationFrame(frame); };
  const run = () => { if (!raf && !still() && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : run()));

  // Still: a short trail from the left that stops below the buttons.
  const pose = () => {
    w.live.forEach((f) => { f.u.remove(); pool.push(f.u); }); w.live = [];
    const r = document.querySelector(".nf-actions").getBoundingClientRect(), end = [r.left + r.width / 2, r.bottom + 34];
    setPath(chaikin([[end[0] - 220, end[1] + 60], [end[0] - 110, end[1] + 10], end]), 1, null);
    for (let d = 8, s = 1; d < w.len - 8; d += 26, s = -s) { const a = at(d); print(a.p, a.ang, s, false).u.style.opacity = (0.15 + 0.7 * d / w.len).toFixed(2); }
    const e = at(w.len);
    print(e.p, e.ang, 1, true).u.style.opacity = "1"; print(e.p, e.ang, -1, true).u.style.opacity = "1";
    w.pos = e.p; w.d = w.len;
  };

  const start = () => {
    if (still()) { stop(); pose(); return; }
    // In from the left edge, towards the left third.
    // At the height of a clear spot, so the way in never crosses the words.
    const first = spot();
    w.pos = [-24, first[1]];
    setPath(pathTo(w.pos, [Math.max(first[0], 60), first[1] + rand(-30, 30)]), 70, () => { w.wait = rand(0.8, 1.6); });
    w.d = 0;
    setTimeout(run, 500);
  };
  start();
  reduce.addEventListener("change", start);
  let rs = 0;
  addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(() => { if (still()) pose(); else { w.pos = [Math.min(w.pos[0], innerWidth - 40), Math.min(w.pos[1], innerHeight - 40)]; seeking = null; wander(); } }, 150); });
})();
