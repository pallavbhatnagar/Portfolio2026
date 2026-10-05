/* =========================================================
   Pixel dog (About page). A small golden retriever, drawn here pixel by
   pixel, who now and then runs in above one of the sections and does a
   few things: sniffs about, sits and wags, turns to look at you, play
   bows, hops, or lies down for a nap. Then he runs off again. Click or tap
   him for a hop, a bark and a heart (or to wake him up).

   - The drawing: each pose is built from a few simple shapes (body, head,
     ears, legs, tail) on a 40 x 28 grid, then outlined and shaded, so all
     poses match. Colours are in PAL.
   - Where he goes: the gap above any section on screen (never on its
     text) or above the footer; sometimes he peeks over the top of the Now
     card or the "Where I start" card instead. He visits every 16 to 32
     seconds, and if you scroll away he leaves until his next visit.
   - Reduced motion: he doesn't move; he sits above the last section and
     still shows a heart when clicked.
   - Decorative: hidden from screen readers.
   To remove him, delete his script tag from about.html.
   ========================================================= */
(() => {
  const host = document.querySelector("main.ab");
  if (!host || !document.createElement("canvas").getContext) return;

  const W = 40, H = 28;
  const OX = 2, OY = 2; // room on every side, so tails and ears never clip
  const PAL = {
    k: "#4a230b", // outline
    o: "#e5a955", // coat
    l: "#f2c97f", // coat, lit
    s: "#c4863b", // coat, shade
    d: "#99591f", // deep shade (far legs, ears)
    c: "#f7d9a0", // muzzle
    e: "#2b1305", // eyes and nose
    t: "#e0707f", // tongue
    w: "#fff4dc"  // eye shine
  };
  const deg = Math.PI / 180;

  // ---------- shapes ----------
  const ell = (cx, cy, rx, ry, rot = 0) => {
    const c = Math.cos(-rot), s = Math.sin(-rot);
    return (x, y) => {
      const dx = x - cx, dy = y - cy;
      const u = dx * c - dy * s, v = dx * s + dy * c;
      return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
    };
  };
  const seg = (x1, y1, x2, y2, r) => (x, y) => {
    const vx = x2 - x1, vy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy)));
    const px = x1 + t * vx - x, py = y1 + t * vy - y;
    return px * px + py * py <= r * r;
  };
  const rotP = (x, y, ox, oy, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c];
  };
  // A feathery tail in two pieces, from base (bx, by), lifted by `lift` deg.
  const tail = (bx, by, lift, dx1 = -3.4, dy1 = -2.4, dx2 = -5.6, dy2 = -5.4) => {
    const a = lift * deg;
    const p1 = rotP(bx + dx1, by + dy1, bx, by, a), p2 = rotP(bx + dx2, by + dy2, bx, by, a);
    return [[seg(bx, by, p1[0], p1[1], 2.1), "tail", "o"], [seg(p1[0], p1[1], p2[0], p2[1], 1.75), "tail", "o"]];
  };

  // ---------- the side-view head (shared by most poses) ----------
  // Placed by an offset (hx, hy) from its standing spot and a tilt (ha).
  function sideHead(p, by) {
    const hx = p.hx || 0, hy = p.hy || 0, ha = (p.ha || 0) * deg;
    const hox = 25 + hx, hoy = 12 + by + hy;
    const hp = (x, y) => rotP(x + hx, y + hy + by, hox, hoy, ha);
    const [hcx, hcy] = hp(26.2, 8.8), [scx, scy] = hp(30.4, 10.7), [ecx, ecy] = hp(24.4, 10.4);
    const parts = [
      [ell(hcx, hcy, 4.4, 4.1, ha), "head", "o"],
      [ell(scx, scy, 2.9, 1.9, ha + 8 * deg), "head", "o"],
      [ell(ecx, ecy, 1.9, 3.5, ha + 18 * deg), "ear", "s"]
    ];
    const face = (put) => {
      const [ex, ey] = hp(27.2, 8.2);
      if (p.sleep) { put(ex - 1, ey, "k"); put(ex, ey, "k"); }
      else { put(ex, ey, "e"); put(ex, ey - 1, "e"); if (!p.sniff) put(ex - 1, ey - 1, "w"); }
      const [nx, ny] = hp(32.8, 9.6);
      put(nx, ny, "e"); put(nx + 1, ny, "e"); put(nx, ny + 1, "e");
      const [mx, my] = hp(30.4, 12.2);
      put(mx, my, "d"); put(mx + 1, my, "d");
      if (p.tongue) { put(mx, my + 1, "t"); put(mx + 1, my + 1, "t"); put(mx + 1, my + 2, "t"); }
    };
    return { parts, face, neck: [hcx - 1, hcy + 1.5] };
  }

  // ---------- poses ----------
  // Standing, walking, running and jumping: legs = [farBack, farFront,
  // nearBack, nearFront] feet as [x, y]; the tops follow the body.
  function stand(p) {
    const by = p.by || 0;
    const head = sideHead(p, by);
    const L = p.legs || [[10.2, 22.9], [21.2, 22.9], [8.6, 22.9], [23.2, 22.9]];
    const tops = [[11, 16.5 + by], [20.6, 16.5 + by], [9.2, 16.5 + by], [22.6, 16.5 + by]];
    const leg = (i, r) => seg(tops[i][0], tops[i][1], L[i][0], L[i][1], r);
    return {
      parts: [
        ...tail(7.4, 13 + by, p.tail || 0),
        [leg(0, 1.2), "far", "s"],
        [leg(1, 1.2), "far", "s"],
        [ell(15, 15.2 + by, 8.6, 4.4, -3 * deg), "body", "o"],
        [ell(9.6, 15.8 + by, 3.1, 3.3), "body", "o"],
        [ell(21.4, 15.4 + by, 4.2, 4.3), "body", "o"],
        [seg(21.5, 13.5 + by, head.neck[0], head.neck[1], 3.1), "body", "o"],
        [leg(2, 1.35), "body", "o"],
        [leg(3, 1.35), "body", "o"],
        ...head.parts
      ],
      face: head.face
    };
  }

  // Sitting, side on: haunch on the ground, chest up, head high.
  function sit(p) {
    const head = sideHead({ ...p, hx: -3.4, hy: -2.8 }, 0);
    return {
      parts: [
        ...tail(9, 22.2, p.tail || 0, -3.6, 0.4, -6.2, -1.2),
        [seg(19.4, 14, 19.8, 22.9, 1.2), "far", "s"],
        [seg(11, 20, 19, 11, 4.4), "body", "o"],
        [ell(11.4, 19.4, 4.8, 3.9), "body", "o"],
        [ell(14.2, 22.4, 3, 1.15), "body", "o"],
        [seg(head.neck[0] - 2, head.neck[1] + 4, head.neck[0], head.neck[1], 3), "body", "o"],
        [seg(21, 14.5, 21.4, 22.9, 1.35), "body", "o"],
        ...head.parts
      ],
      face: head.face
    };
  }

  // Play bow: chest and forearms down, rear and tail up.
  function bow(p) {
    const head = sideHead({ ...p, hx: 2.2, hy: 6.2, ha: -6 }, 0);
    return {
      parts: [
        ...tail(8, 12.2, p.tail || 40),
        [seg(10.4, 15, 10.2, 22.9, 1.2), "far", "s"],
        [seg(21, 20.4, 27, 22.4, 1.2), "far", "s"],
        [ell(15.4, 16.2, 8.4, 4.1, 16 * deg), "body", "o"],
        [ell(10, 14.2, 3.1, 3.3), "body", "o"],
        [ell(21.6, 19.2, 3.6, 3.4), "body", "o"],
        [seg(8.8, 15, 8.4, 22.9, 1.35), "body", "o"],
        [seg(22, 21, 28.4, 22.7, 1.35), "body", "o"],
        ...head.parts
      ],
      face: head.face
    };
  }

  // Lying down asleep, chin on his paws.
  function nap(p) {
    const head = sideHead({ ...p, hx: 1.2, hy: 9, ha: 6, sleep: true }, 0);
    const b = p.breath || 0;
    return {
      parts: [
        ...tail(8.2, 21.4, -8, -3.6, 1, -6.8, 0.6),
        [seg(21, 21.2, 27.6, 22.2, 1.2), "far", "s"],
        [ell(16.6, 19.6 - b / 2, 9.4, 3.6 + b), "body", "o"],
        [ell(10.4, 19.2 - b / 2, 3.6, 3.6 + b / 2), "body", "o"],
        [seg(22.4, 22, 29, 22.8, 1.35), "body", "o"],
        ...head.parts
      ],
      face: head.face
    };
  }

  // Sitting, facing you (like a portrait): two ears, two front paws.
  function front(p) {
    const parts = [
      ...tail(24.2, 21, p.tail || 0, 3.4, -2.4, 4.6, -5.8),
      [ell(18, 19.6, 5.8, 4.8), "body", "o"],
      [ell(13.2, 22, 3.2, 1.9), "body", "o"],
      [ell(22.8, 22, 3.2, 1.9), "body", "o"],
      [seg(16, 18, 16, 23.1, 1.45), "body", "o"],
      [seg(20, 18, 20, 23.1, 1.45), "body", "o"],
      [ell(18, 10.4, 6.4, 5.7), "head", "o"],
      [ell(18, 13.3, 3, 2.1), "head", "c"],
      [ell(11.4, 12.2, 2.2, 4.2, 14 * deg), "ear", "s"],
      [ell(24.6, 12.2, 2.2, 4.2, -14 * deg), "ear", "s"]
    ];
    const face = (put) => {
      if (p.blink) { put(15, 10.6, "k"); put(16, 10.6, "k"); put(20, 10.6, "k"); put(21, 10.6, "k"); }
      else {
        put(15.6, 10, "e"); put(15.6, 11, "e"); put(20.4, 10, "e"); put(20.4, 11, "e");
        put(15.6, 9.8, "w"); put(20.4, 9.8, "w");
        put(15.6, 10.6, "e"); put(20.4, 10.6, "e");
      }
      put(17.4, 12.4, "e"); put(18.4, 12.4, "e"); put(17.9, 13.4, "e");
      put(16.6, 14.6, "d"); put(19.2, 14.6, "d");
      if (p.tongue) { put(17.6, 15.2, "t"); put(18.4, 15.2, "t"); put(18, 16.1, "t"); }
      put(15.6, 23, "d"); put(19.6, 23, "d"); // toes
    };
    return { parts, face };
  }

  // ---------- turn shapes into pixels ----------
  function render(fig) {
    const grid = [];
    for (let y = 0; y < H; y++) {
      grid.push([]);
      for (let x = 0; x < W; x++) {
        let hit = null;
        const sx = x - OX + 0.5, sy = y - OY + 0.5;
        for (const part of fig.parts) if (part[0](sx, sy)) hit = part;
        grid[y].push(hit);
      }
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : grid[y][x]);
    const px = grid.map((row, y) => row.map((g, x) => {
      // Outline: an empty pixel touching the dog.
      if (!g) return [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some(Boolean) ? "k" : null;
      const up = at(x, y - 1), down = at(x, y + 1);
      if (g[1] === "ear") {
        const edge = [at(x - 1, y), at(x + 1, y), down].some((q) => q && q[1] !== "ear");
        return edge ? "k" : (!down ? "d" : "s");
      }
      if (g[1] === "far") return !down || down[1] !== "far" ? "d" : "s";
      if (g[2] === "c") return "c";
      if (!up || (up[1] !== g[1] && g[1] !== "body")) return "l";
      if (!down) return "s";
      return g[2];
    }));
    const put = (x, y, c) => {
      x = Math.round(x + OX - 0.5); y = Math.round(y + OY - 0.5);
      if (y >= 0 && y < H && x >= 0 && x < W) px[y][x] = c;
    };
    fig.face(put);
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    px.forEach((row, y) => row.forEach((c, x) => { if (c) { g.fillStyle = PAL[c]; g.fillRect(x, y, 1, 1); } }));
    return cv;
  }

  const POSES = {
    idle: [stand({ tail: 4 }), stand({ tail: 26, tongue: true })],
    run: [
      stand({ by: 0.6, tail: -6, tongue: true, legs: [[6.4, 22.6], [25.6, 22.4], [4.6, 22], [27.6, 21.8]] }),
      stand({ tail: 2, tongue: true }),
      stand({ by: -0.6, tail: 8, tongue: true, legs: [[14.2, 21.8], [17.6, 22.2], [12.6, 22], [19.6, 21.8]] }),
      stand({ tail: 2, tongue: true })
    ],
    crouch: [stand({ by: 1.8, hy: 0.6, tail: 10, legs: [[10.6, 22.9], [21, 22.9], [9.2, 22.9], [23, 22.9]] })],
    air: [stand({ by: -0.6, ha: -10, tail: 30, tongue: true, legs: [[7, 20.6], [26, 19.6], [5.4, 20], [27.8, 19]] })],
    sniff: [
      stand({ sniff: true, hx: 1.6, hy: 4.8, ha: 34, tail: 12, legs: [[9.2, 22.9], [22.2, 22.9], [9.6, 22.9], [22.6, 22.9]] }),
      stand({ sniff: true, hx: 1.6, hy: 5.2, ha: 36, tail: 18, legs: [[11.2, 22.9], [20.4, 22.9], [7.8, 22.9], [24, 22.9]] })
    ],
    sit: [sit({ tail: 0 }), sit({ tail: 14, tongue: true })],
    bow: [bow({ tail: 34, tongue: true }), bow({ tail: 52, tongue: true })],
    nap: [nap({ breath: 0 }), nap({ breath: 0.5 })],
    front: [front({ tail: 0, tongue: true }), front({ tail: 16, tongue: true }), front({ tail: 8, blink: true })]
  };
  const SPRITES = {};
  for (const [name, list] of Object.entries(POSES)) SPRITES[name] = list.map(render);
  window.__pixelDog = { SPRITES, W, H }; // used by the preview sheet only

  // ---------- on the page ----------
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = document.createElement("div");
  el.className = "pxdog";
  el.setAttribute("aria-hidden", "true");
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  el.appendChild(cv);
  host.appendChild(el);
  const g = cv.getContext("2d");
  const draw = (img) => { g.clearRect(0, 0, W, H); g.drawImage(img, 0, 0); };

  const bubble = (cls, ms) => {
    const b = document.createElement("span");
    b.className = cls;
    if (cls === "pxdog-z") b.textContent = "z";
    el.appendChild(b);
    setTimeout(() => b.remove(), ms);
  };
  // Click or tap: a little bark (assets/audio/sound-effects) and a heart.
  const bark = new Audio("/assets/audio/sound-effects/baby_puppy.mp3");
  bark.preload = "none";
  const heart = () => {
    bubble("pxdog-heart", 1100);
    bark.currentTime = 0;
    bark.play().catch(() => {});
  };

  // Where he can stand: the gap above each section (never on its text),
  // and the space above the footer at the end of the page.
  const perches = () => {
    const list = Array.from(host.querySelectorAll(":scope > section")).filter((s) => !s.classList.contains("ab-hero"));
    const foot = document.querySelector(".site-footer");
    if (foot) list.push(foot);
    return list;
  };
  // Cards he can peek over: his head pops up from behind their top edge.
  const peeks = () => Array.from(document.querySelectorAll(".now-card, .im-wide"));
  const hostBox = () => host.getBoundingClientRect();
  const size = () => el.getBoundingClientRect();
  const span = (s) => {
    const hb = hostBox(), sb = s.getBoundingClientRect(), d = size();
    return { left: Math.max(sb.left, hb.left) - hb.left, right: Math.min(sb.right, hb.right) - hb.left - d.width };
  };
  const perchY = (s) => s.getBoundingClientRect().top - hostBox().top - size().height + 2;
  const onScreen = (s, lo, hi) => { const t = s.getBoundingClientRect().top; return t > innerHeight * lo && t < innerHeight * hi; };

  let x = 0, y = 0, face = 1, jumpY = 0, perch = null;
  const place = () => { el.style.transform = `translate(${x}px, ${y - jumpY}px) scaleX(${face})`; };

  if (reduce) {
    // Reduced motion: he sits still above the last section, re-measured
    // whenever the page settles or resizes (fonts and images move it).
    const lastSection = Array.from(host.querySelectorAll(":scope > section")).pop();
    if (!lastSection) return;
    el.classList.add("is-on");
    draw(SPRITES.front[0]);
    const settle = () => { const s = span(lastSection); x = s.right - 8; y = perchY(lastSection); place(); };
    settle();
    window.addEventListener("load", settle);
    window.addEventListener("resize", settle);
    if ("ResizeObserver" in window) new ResizeObserver(settle).observe(host);
    el.addEventListener("click", heart);
    return;
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // Things to do while standing above a section, in a random order.
  const things = () => [
    [{ sniffBy: rand(30, 70) }, { idle: rand(900, 1600) }],
    [{ pose: "sit", ms: rand(1400, 2000), every: 260 }],
    [{ pose: "front", ms: rand(1300, 1900), every: 300 }],
    [{ pose: "bow", ms: 1200, every: 160 }, { hop: true }],
    [{ pose: "nap", ms: rand(2400, 3200), every: 700, z: true }, { pose: "front", ms: 700, every: 300 }],
    [{ hop: true }, { idle: 800 }],
    [{ trot: rand(-160, 160) }, { idle: rand(600, 1000) }]
  ].sort(() => Math.random() - 0.5).slice(0, 1).flat();

  // One visit (about 4 to 6 seconds): run in above a section on screen, do one thing,
  // then run off the nearer edge.
  let steps = [], step = null, t0 = 0, last = 0, frameI = 0, frameT = 0, busy = false, lostFor = 0;
  function plan() {
    if (document.hidden) return later(3000);
    // Now and then, peek over a card instead of running in.
    const cards = peeks().filter((s) => onScreen(s, 0.15, 0.85));
    if (cards.length && Math.random() < 0.35) {
      el.classList.add("is-on");
      perch = pick(cards);
      const { left, right } = span(perch);
      x = rand(left + 16, Math.max(left + 16, right - 16));
      face = Math.random() < 0.5 ? 1 : -1;
      el.style.clipPath = "inset(0 0 100% 0)";
      steps = [{ peek: true, ms: rand(1800, 2600) }, { end: true }];
      step = null; busy = true; lostFor = 0;
      requestAnimationFrame(tick);
      return;
    }
    const ok = perches().filter((s) => onScreen(s, 0.1, 0.92));
    if (!ok.length) return later(1200);
    el.classList.add("is-on"); // measured while shown, so his size is real
    perch = pick(ok);
    const { left, right } = span(perch), d = size();
    const fromLeft = Math.random() < 0.5;
    x = fromLeft ? left - d.width - 30 : right + d.width + 30;
    y = perchY(perch);
    face = fromLeft ? 1 : -1;
    steps = [{ run: rand(left + (right - left) * 0.15, left + (right - left) * 0.85) }, { idle: rand(400, 700) }, ...things()];
    steps.push({ runOff: true }, { end: true });
    step = null; busy = true; lostFor = 0;
    place();
    requestAnimationFrame(tick);
  }
  let timer = 0;
  const later = (ms) => { clearTimeout(timer); timer = setTimeout(plan, ms); };
  const stop = (again) => { busy = false; el.classList.remove("is-on"); el.style.clipPath = ""; jumpY = 0; later(again); };

  // Fill in a step's target from where he is now.
  function begin(s) {
    const { left, right } = span(perch), d = size();
    const clamp = (v) => Math.max(left, Math.min(right, v));
    if (s.sniffBy) s.sniff = clamp(x + face * s.sniffBy);
    if (s.trot !== undefined) s.run = clamp(x + s.trot);
    if (s.runOff) {
      const goRight = x - left > right - x;
      s.run = goRight ? right + d.width + 40 : left - d.width - 40;
    }
    return true;
  }

  function tick(now) {
    if (!busy) return;
    if (!step) {
      step = steps.shift();
      t0 = now; last = now; frameI = 0; frameT = 0;
      begin(step);
    }
    const dt = Math.min(64, now - last); last = now;
    const age = now - t0;
    frameT += dt;
    if (!step.peek) y = perchY(perch); // follows the page if it shifts
    // Scrolled away from him? Leave, and come back near the reader soon.
    const pt = perch.getBoundingClientRect().top;
    lostFor = pt < -innerHeight * 0.15 || pt > innerHeight * 1.1 ? lostFor + dt : 0;
    if (lostFor > 700) return stop(rand(16000, 32000));

    if (step.run !== undefined || step.sniff !== undefined) {
      const running = step.run !== undefined;
      const target = running ? step.run : step.sniff;
      const dir = Math.sign(target - x) || face;
      face = dir;
      const pose = running ? SPRITES.run : SPRITES.sniff;
      if (frameT >= (running ? 80 : 260)) { frameT = 0; frameI = (frameI + 1) % pose.length; }
      draw(pose[frameI]);
      x += dir * (running ? 0.17 : 0.035) * dt;
      if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) { x = target; step = null; }
    } else if (step.idle !== undefined || step.pose) {
      const pose = SPRITES[step.pose || "idle"];
      if (frameT >= (step.every || 220)) {
        frameT = 0; frameI = (frameI + 1) % pose.length;
        if (step.z && frameI === 0) bubble("pxdog-z", 1600);
      }
      draw(pose[frameI]);
      if (age >= (step.ms || step.idle)) step = null;
    } else if (step.hop) {
      if (age < 140) { draw(SPRITES.crouch[0]); jumpY = 0; }
      else if (age < 660) { draw(SPRITES.air[0]); jumpY = Math.sin(((age - 140) / 520) * Math.PI) * 26; }
      else if (age < 780) { draw(SPRITES.crouch[0]); jumpY = 0; }
      else step = null;
    } else if (step.peek) {
      // Rise from behind the card (only what is above its edge shows),
      // look at you and wag, then sink back. Strong ease-out both ways.
      const d = size(), top = perch.getBoundingClientRect().top - hostBox().top;
      const show = d.height * 0.62, up = 380, down = 320;
      const out = (t) => 1 - Math.pow(1 - t, 3);
      let k = 1;
      if (age < up) k = out(age / up);
      else if (age > up + step.ms) k = 1 - out(Math.min(1, (age - up - step.ms) / down));
      if (frameT >= 300) { frameT = 0; frameI = (frameI + 1) % SPRITES.front.length; }
      draw(SPRITES.front[frameI]);
      y = top - show * k;
      el.style.clipPath = `inset(0 0 ${Math.max(0, d.height - show * k)}px 0)`;
      if (age >= up + step.ms + down) step = null;
    } else if (step.end) {
      return stop(rand(16000, 32000));
    }
    place();
    requestAnimationFrame(tick);
  }

  // Click or tap: a hop, a bark and a heart. Asleep, he wakes and looks at you.
  el.addEventListener("click", () => {
    heart();
    if (!step || step.hop || step.peek) return;
    if (step.pose === "nap") { step = { pose: "front", ms: 1400, every: 300 }; t0 = performance.now(); frameI = 0; return; }
    steps.unshift({ hop: true }, step);
    step = null;
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !busy) later(2000); });

  later(4500);
})();
