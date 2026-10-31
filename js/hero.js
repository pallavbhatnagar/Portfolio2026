/* Hero (centred): one entrance after the loading screen ("complicated"
   arrives scattered and snaps straight), and the chat box turning through
   example questions as hints. Clicking the box only opens or closes the
   Talk to my Work chat (script.js); it never asks anything itself. */
(() => {
  const hc = document.querySelector(".hc");
  if (!hc) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Split the scattered word ("complicated") into letters, each a little out of place.
  const mess = hc.querySelector(".hc-mess");
  if (mess) {
    const word = mess.textContent;
    mess.innerHTML = `<span class="sr-only">${word}</span>` + Array.from(word).map((c, i) => {
      const r = (Math.random() * 2 - 1) * 34;
      const y = (Math.random() * 2 - 1) * 26;
      const x = (Math.random() * 2 - 1) * 10;
      return `<span class="ch" aria-hidden="true" style="--i:${i};--r:${r.toFixed(1)};--x:${x.toFixed(1)};--y:${y.toFixed(1)}">${c}</span>`;
    }).join("");
  }

  // The words rise as the hello screen starts to lift; the scattered word
  // waits until it has fully gone (.mess-go), so its letters snap straight
  // where you can see them. Without the hello screen, both go together.
  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
  const enter = () => raf2(() => hc.classList.add("is-in"));
  const straighten = () => raf2(() => hc.classList.add("mess-go"));
  // A visiting cursor (below) tidies "messy" itself, once a visit, at
  // every size; otherwise (Calm, or a later page in the visit) it
  // straightens on its own as before.
  let seen = false;
  try { seen = sessionStorage.getItem("hero-cursor") === "1"; } catch (e) { /* private mode */ }
  const visit = !reduce.matches && !seen && !!mess;
  const afterIntro = (fn) => {
    if (document.documentElement.classList.contains("is-preloading")) document.addEventListener("preloader:done", fn, { once: true });
    else fn();
  };
  if (document.documentElement.classList.contains("is-preloading")) {
    hc.style.setProperty("--mess-delay", "150ms");
    document.addEventListener("preloader:leaving", enter, { once: true });
  } else enter();
  if (visit) afterIntro(() => setTimeout(cursorVisit, 700));
  else afterIntro(straighten);

  // ---------- The visiting cursor ----------
  // A design-tool cursor ("Pallav") glides in, selects the scattered
  // "messy", hits Tidy up (the letters snap into line, the selection
  // tightening round them), and leaves a comment on the Ask box, fading
  // away as it does; then the comment fades too.
  // Decorative; scrolling the hero away sends it off at once.
  function cursorVisit() {
    try { sessionStorage.setItem("hero-cursor", "1"); } catch (e) { /* private mode */ }
    const layer = document.createElement("div");
    layer.className = "hcur";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<div class="hcur-sel"><i></i><i></i><i></i><i></i><span class="hcur-size"></span></div>'
      + '<div class="hcur-bar"><svg viewBox="0 0 16 16"><circle cx="3.5" cy="3.5" r="1.6"/><circle cx="8" cy="3.5" r="1.6"/><circle cx="12.5" cy="3.5" r="1.6"/><circle cx="3.5" cy="8" r="1.6"/><circle cx="8" cy="8" r="1.6"/><circle cx="12.5" cy="8" r="1.6"/><circle cx="3.5" cy="12.5" r="1.6"/><circle cx="8" cy="12.5" r="1.6"/><circle cx="12.5" cy="12.5" r="1.6"/></svg>Tidy up</div>'
      + '<div class="hcur-pin"><span class="hcur-av">P</span><span class="hcur-note">Ask me anything here.</span></div>'
      + '<div class="hcur-cur"><svg viewBox="0 0 22 22"><path d="M3.2 2.4c-.5-.2-1 .3-.8.8l5.6 16c.2.6 1 .6 1.2 0l2.3-6.4 6.4-2.3c.6-.2.6-1 0-1.2z"/></svg><span>Pallav</span></div>';
    hc.appendChild(layer);
    const sel = layer.querySelector(".hcur-sel"), size = layer.querySelector(".hcur-size"), bar = layer.querySelector(".hcur-bar");
    const pin = layer.querySelector(".hcur-pin"), cur = layer.querySelector(".hcur-cur");
    let gone = false, raf = 0, at = null, timer = 0;
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
    const box = (el) => { const a = el.getBoundingClientRect(), b = hc.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
    // The box round the letters as they are drawn: each letter's ink (its
    // glyph, measured from the font) through its own tilt and offset, so it
    // hugs the word scattered or straight. Falls back to the letters' boxes
    // where a browser can't measure glyphs.
    const chars = Array.from(mess.querySelectorAll(".ch"));
    const ink = document.createElement("canvas").getContext("2d");
    const glyph = (c) => {
      const cs = getComputedStyle(c);
      ink.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ink.measureText(c.textContent);
      if (m.fontBoundingBoxAscent === undefined || m.actualBoundingBoxAscent === undefined) return null;
      const w = c.offsetWidth, h = c.offsetHeight, base = (h - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
      // Relative to the letter's centre.
      return { x0: -m.actualBoundingBoxLeft - w / 2, x1: m.actualBoundingBoxRight - w / 2, y0: base - m.actualBoundingBoxAscent - h / 2, y1: base + m.actualBoundingBoxDescent - h / 2 };
    };
    const glyphs = chars.map(glyph);
    const wordBox = () => {
      const b = hc.getBoundingClientRect();
      let l = Infinity, t = Infinity, R = -Infinity, B = -Infinity;
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect(), g = glyphs[i];
        if (!g) { l = Math.min(l, r.left); t = Math.min(t, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); return; }
        const tf = getComputedStyle(c).transform, m = new DOMMatrix(tf === "none" ? undefined : tf);
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        [[g.x0, g.y0], [g.x1, g.y0], [g.x0, g.y1], [g.x1, g.y1]].forEach(([x, y]) => {
          const X = cx + m.a * x + m.c * y, Y = cy + m.b * x + m.d * y;
          l = Math.min(l, X); t = Math.min(t, Y); R = Math.max(R, X); B = Math.max(B, Y);
        });
      });
      const pad = 4;
      return { x: l - b.left - pad, y: t - b.top - pad, w: R - l + pad * 2, h: B - t + pad * 2 };
    };
    const fitSel = () => {
      const r = wordBox();
      Object.assign(sel.style, { transform: `translate(${r.x}px, ${r.y}px)`, width: `${r.w}px`, height: `${r.h}px` });
      size.textContent = `${Math.round(r.w)} × ${Math.round(r.h)}`;
      return r;
    };
    // The cursor glides on a gentle arc, easing in and out, like a hand.
    const glide = (x, y, ms) => new Promise((r) => {
      cancelAnimationFrame(raf);
      const from = at || [x, y]; at = [x, y];
      const put = (px, py) => { cur.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`; };
      if (!ms) { put(x, y); return r(); }
      const dx = x - from[0], dy = y - from[1], d = Math.hypot(dx, dy) || 1, bend = Math.min(d * 0.16, 70);
      const mx = (from[0] + x) / 2 - (dy / d) * bend, my = (from[1] + y) / 2 + (dx / d) * bend, t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, Math.max(0, now - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, u = 1 - e;
        put(u * u * from[0] + 2 * u * e * mx + e * e * x, u * u * from[1] + 2 * u * e * my + e * e * y);
        if (k < 1 && !gone) raf = requestAnimationFrame(step); else r();
      };
      raf = requestAnimationFrame(step);
    });
    const press = async () => { cur.classList.add("is-down"); await wait(130); cur.classList.remove("is-down"); };
    let safety = 0;
    const leave = () => {
      if (gone) return;
      gone = true; clearTimeout(timer); clearTimeout(safety); cancelAnimationFrame(raf);
      straighten();
      layer.classList.add("is-gone");
      setTimeout(() => layer.remove(), 400);
    };
    const onScroll = () => { if (hc.getBoundingClientRect().bottom < hc.offsetHeight * 0.55) leave(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    const shell = document.getElementById("shellScroll");
    if (shell) shell.addEventListener("scroll", onScroll, { passive: true });
    safety = setTimeout(leave, 16000);

    (async () => {
      const w0 = wordBox();
      // In from the right, to the scattered word, and a click on it.
      await glide(hc.clientWidth + 30, w0.y - 70, 0);
      layer.classList.add("is-on");
      await glide(w0.x + w0.w * 0.5, w0.y + w0.h * 0.88, 750); if (gone) return;
      await press(); if (gone) return;
      fitSel(); sel.classList.add("is-on");
      await wait(300); if (gone) return;
      // The toolbar above the selection, then Tidy up.
      const r = fitSel();
      const barX = Math.max(bar.offsetWidth / 2 + 8, Math.min(hc.clientWidth - bar.offsetWidth / 2 - 8, r.x + r.w / 2));
      bar.style.transform = `translate(${barX.toFixed(1)}px, ${(r.y - 12).toFixed(1)}px) translate(-50%, -100%)`;
      bar.classList.add("is-on");
      await wait(260); if (gone) return;
      const bb = box(bar);
      await glide(bb.x + bb.w * 0.62, bb.y + bb.h * 0.55, 420); if (gone) return;
      await press(); if (gone) return;
      hc.style.setProperty("--mess-delay", "0ms");
      straighten();
      bar.classList.remove("is-on");
      // The selection tightens round the letters as they line up.
      const t0 = performance.now();
      const follow = () => { if (gone) return; fitSel(); if (performance.now() - t0 < 1900) requestAnimationFrame(follow); };
      follow();
      await glide(r.x + r.w + 34, r.y + r.h * 0.2, 480); // out of the way, to watch the letters line up
      await wait(1100); if (gone) return;
      sel.classList.remove("is-on");
      // A comment on the Ask box.
      const ask = hc.querySelector(".hc-ask");
      if (ask) {
        const a = box(ask), px = Math.max(8, Math.min(a.x + (a.w - pin.offsetWidth) / 2, hc.clientWidth - pin.offsetWidth - 8)), py = a.y - 4; // centred over the box, kept on screen
        await glide(px + 8, py + 6, 750); if (gone) return;
        await press(); if (gone) return;
        pin.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
        // The comment is left, and the cursor fades away on the spot.
        pin.classList.add("is-on"); cur.classList.add("is-gone");
        await wait(2600); if (gone) return;
        pin.classList.add("is-out"); // a plain, smooth fade
        await wait(650);
      }
      leave();
    })();
  }

  // Example questions turning in the box (hints only).
  const ask = hc.querySelector(".hc-ask");
  const qBox = hc.querySelector(".hc-q");
  // What hiring people actually ask (different from the chat's own
  // suggestions).
  const QS = ["What impact did your work have?", "Have you led design on a team?", "How do you work with engineers?", "When could you start?", "Psst: Type lumos"]; // the last one, a hint at the Lumos easter egg (lumos.js)
  if (!ask || !qBox || reduce.matches) return;
  let qi = 0;
  let cur = qBox.firstElementChild;
  cur.textContent = QS[0];
  setInterval(() => {
    if (document.hidden || ask.matches(":hover, :focus-visible")) return;
    qi = (qi + 1) % QS.length;
    const next = document.createElement("span");
    next.className = "is-next";
    next.textContent = QS[qi];
    qBox.append(next);
    void next.offsetWidth;
    cur.classList.add("is-out");
    next.classList.remove("is-next");
    const old = cur;
    setTimeout(() => old.remove(), 500);
    cur = next;
  }, 3000);
})();
