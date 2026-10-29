(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 0) The AI colours (Bloom: blue into hot pink) on every AI sparkle icon.
  //    Each icon gets its own copy of the gradient inside its own <svg>:
  //    Safari doesn't reliably paint a gradient borrowed from another <svg>,
  //    and fell back to plain blue. The stop colours follow the theme (CSS).
  document.querySelectorAll(".nav-ai-ic, .cs-ask-ic svg").forEach((icon, i) => {
    const path = icon.querySelector("path");
    if (!path || icon.querySelector("linearGradient")) return;
    const id = `ai-spark-${i}`;
    icon.insertAdjacentHTML("afterbegin", `<defs><linearGradient class="ai-spark" id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3965fa"/><stop offset="0.4" stop-color="#8a62e0"/><stop offset="0.7" stop-color="#c454c4"/><stop offset="1" stop-color="#f2369a"/></linearGradient></defs>`);
    path.setAttribute("fill", `url(#${id})`);
    path.classList.add("ai-spark-fill");
  });

  // 0b) Preloader (CSS .preloader): on the first page of a visit, a cursor
  //     designs the hello (a text box, "Hello" in a few languages, snapped
  //     to centre), then the panel lifts away. A click or any key skips to the end. The head script
  //     decides whether it runs (html.is-preloading). As it starts to lift
  //     the page hears "preloader:leaving" (the hero starts drawing then),
  //     and once it's gone, "preloader:done".
  if (document.documentElement.classList.contains("is-preloading")) {
    const html = document.documentElement;
    try { sessionStorage.setItem("preloaded", "1"); } catch (e) { /* private mode */ }
    const words = ["Hello", "नमस्ते", "Bonjour", "Hola", "Ciao", "こんにちは", "Olá", "Hallå", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "Hello"]; // round the world and back to hello
    const pl = document.createElement("div");
    pl.className = "preloader";
    pl.setAttribute("aria-hidden", "true");
    pl.innerHTML = '<div class="pc-guide pc-gv"></div><div class="pc-guide pc-gh"></div>'
      + '<div class="pc-box"><p class="pl-word is-on pc-word"></p><i class="pc-h"></i><i class="pc-h"></i><i class="pc-h"></i><i class="pc-h"></i><span class="pc-size"></span></div>'
      + '<p class="pl-word is-on pc-word pc-measure" aria-hidden="true"></p>'
      + '<div class="pc-cursor"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M1.2 1.2v15.6l4.3-4.1 2.9 6.3 2.6-1.2-2.8-6.2h6.1z"/></svg><span class="pc-tag">Pallav</span></div>'
      + '<div class="pl-curve"></div>';
    document.body.appendChild(pl);
    html.classList.add("pl-ready");
    // The hello is designed in front of you: a cursor drags out a text box,
    // types "Hello", resizes the box as the word goes through a few
    // languages, nudges it to dead centre (the guides flash) and clicks,
    // and the panel lifts. Positions are worked out from the window size.
    const box = pl.querySelector(".pc-box"), word = pl.querySelector(".pc-box .pc-word");
    const measurer = pl.querySelector(".pc-measure"), size = pl.querySelector(".pc-size");
    const cursor = pl.querySelector(".pc-cursor");
    let timer = 0, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      pl.classList.add("is-leaving");
      html.classList.remove("is-preloading");
      document.dispatchEvent(new CustomEvent("preloader:leaving"));
      setTimeout(() => {
        pl.remove();
        html.classList.remove("pl-ready");
        document.dispatchEvent(new CustomEvent("preloader:done"));
      }, 1200);
    };
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
    const place = (el, x, y, ms) => { el.style.transition = (ms ? `transform ${ms}ms ${EASE}, ` : "") + "opacity 0.3s ease"; el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; };
    const frame = (x, y, w, h, ms) => {
      box.style.transition = (ms ? `transform ${ms}ms ${EASE}, width ${ms}ms ${EASE}, height ${ms}ms ${EASE}, ` : "") + "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.25s ease";
      box.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      box.style.width = `${w.toFixed(1)}px`; box.style.height = `${h.toFixed(1)}px`;
    };
    // The size label follows the box while it changes.
    const track = (ms) => { const end = performance.now() + ms + 40; const tick = () => { size.textContent = `${Math.round(box.offsetWidth)} × ${Math.round(box.offsetHeight)}`; if (performance.now() < end && !done) requestAnimationFrame(tick); }; tick(); };
    const fit = (w) => { measurer.textContent = w; const pad = measurer.offsetHeight * 0.22; return [measurer.offsetWidth + pad * 2, measurer.offsetHeight + pad * 0.6]; };
    const run = async () => {
      const W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2;
      const off = [Math.min(130, W * 0.09), Math.min(80, H * 0.08)];
      let [bw, bh] = fit(words[0]);
      let bx = cx + off[0] - bw / 2, by = cy + off[1] - bh / 2;
      place(cursor, W * 0.82, H * 1.04, 0);
      await wait(120);
      pl.classList.add("pc-go");
      place(cursor, bx, by, 520); await wait(560); if (done) return;
      // Drag out the box.
      frame(bx, by, 0, 0, 0); box.classList.add("is-on"); void box.offsetWidth;
      frame(bx, by, bw, bh, 460); place(cursor, bx + bw, by + bh, 460); track(460);
      await wait(490); if (done) return;
      place(cursor, bx + bw + 22, by + bh + 16, 300);
      // Type "Hello".
      box.classList.add("is-typing");
      for (let k = 1; k <= words[0].length; k++) { word.textContent = words[0].slice(0, k); await wait(75); if (done) return; }
      await wait(380); box.classList.remove("is-typing"); if (done) return;
      // Through the languages: the box resizes around each word, from its centre.
      for (let n = 1; n < words.length; n++) {
        const [w, h] = fit(words[n]); const mx = bx + bw / 2, my = by + bh / 2;
        bw = w; bh = h; bx = mx - bw / 2; by = my - bh / 2;
        word.textContent = words[n];
        frame(bx, by, bw, bh, 200); place(cursor, bx + bw + 22, by + bh + 16, 200); track(200);
        await wait(n === words.length - 1 ? 380 : 240); if (done) return;
      }
      // Grab it and nudge it to dead centre; the guides flash as it snaps.
      place(cursor, bx + bw * 0.62, by + bh * 0.6, 380); await wait(440); if (done) return;
      const tx = cx - bw / 2, ty = cy - bh / 2;
      cursor.classList.add("is-down"); box.classList.add("is-grabbed");
      await wait(160); if (done) return;
      frame(tx, ty, bw, bh, 650); place(cursor, tx + bw * 0.62, ty + bh * 0.6, 650);
      await wait(470); pl.classList.add("is-snap"); await wait(260); if (done) return;
      // Let go: the cursor leaves the word to itself, then the guides go,
      // the box is deselected, a beat on the clean word, and away.
      cursor.classList.remove("is-down"); box.classList.remove("is-grabbed");
      cursor.classList.add("is-gone");
      await wait(650); if (done) return;
      pl.classList.remove("is-snap"); box.classList.add("is-done");
      await wait(690); finish();
    };
    requestAnimationFrame(() => { run(); });
    pl.addEventListener("pointerdown", finish);
    addEventListener("keydown", finish, { once: true });
  }

  // 1) Nav bar: an IntersectionObserver watches a 1px sentinel at the top of
  //    the page (no scroll listener) and flags the header once scrolled.
  const header = document.querySelector(".site-header");
  const sentinel = document.querySelector(".scroll-sentinel");
  if (header && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      header.dataset.scrolled = String(!entry.isIntersecting);
    }).observe(sentinel);
  }

  // 1a) Sound effects (assets/audio/sound-effects/), used by the chat
  //     panel. Played through Web Audio, decoded ahead of time, so they start
  //     the instant they're asked for, and the silent lead-in and tail that
  //     MP3 files carry are skipped. play(name, volume) plays at the file's
  //     own volume unless a lower one (0 to 1) is given, and returns how
  //     long the sound lasts, in ms.
  const sfx = (() => {
    const base = "/assets/audio/sound-effects/";
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null;
    const loads = {};
    const getCtx = () => { if (!ctx && AC) ctx = new AC(); return ctx; };
    const load = (name) => {
      if (!AC) return Promise.resolve(null);
      if (!loads[name]) {
        loads[name] = fetch(base + name)
          .then((r) => r.arrayBuffer())
          .then((data) => new Promise((ok, fail) => {
            // Callback form for older Safari; newer browsers also return a
            // promise, which would report a failed decode a second time.
            const p = getCtx().decodeAudioData(data, ok, fail);
            if (p && p.catch) p.catch(() => {});
          }))
          .then((buf) => {
            // Where the sound actually starts and ends.
            const d = buf.getChannelData(0);
            let s = 0, e = d.length - 1;
            while (s < e && Math.abs(d[s]) < 0.01) s++;
            while (e > s && Math.abs(d[e]) < 0.01) e--;
            const sr = buf.sampleRate;
            return { buf, start: Math.max(0, s / sr - 0.005), dur: (e - s) / sr + 0.01 };
          })
          .catch(() => null);
        loads[name].then((v) => { loads[name].ready = v; });
      }
      return loads[name];
    };
    const play = (name, volume = 1) => {
      const c = getCtx();
      const clip = loads[name] && loads[name].ready;
      if (c && clip) {
        if (c.state === "suspended") c.resume();
        const src = c.createBufferSource();
        src.buffer = clip.buf;
        const gain = c.createGain();
        gain.gain.value = volume;
        src.connect(gain).connect(c.destination);
        src.start(0, clip.start, clip.dur);
        return clip.dur * 1000;
      }
      // Not decoded yet (or no Web Audio): the plain way.
      const a = new Audio(base + name);
      a.volume = volume;
      a.play().catch(() => {});
      load(name);
      return 200;
    };
    return { load, play };
  })();
  window.siteSfx = sfx; // shared with pixel-dog.js (the dog's bark)

  // 2) Sleek auto-hide scrollbars: a thin, near-invisible thumb that fades
  //    in only while a container is actively scrolling (CSS has no
  //    "is-scrolling" state, so a scroll listener toggles the class and a
  //    short idle timer clears it), then fades back out at rest.
  const bindAutoHideScrollbar = (target, classTarget) => {
    if (!target) return;
    const el = classTarget || target;
    let hideTimer;
    target.addEventListener("scroll", () => {
      el.classList.add("is-scrolling");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => el.classList.remove("is-scrolling"), 900);
    }, { passive: true });
  };
  bindAutoHideScrollbar(window, document.documentElement);
  bindAutoHideScrollbar(document.getElementById("askPanelScroll"));

  // 2b) .shell-scroll (the ask-open panel's nested, bounded scroller) uses a
  //     JS-driven thumb instead of a styled native scrollbar: a real
  //     ::-webkit-scrollbar on a nested overflow:auto container turned out
  //     to be unreliable across browsers (some fall back to an unstyled,
  //     full-width native bar), where a plain absolutely-positioned div
  //     sidesteps the whole problem.
  const shellScroll = document.getElementById("shellScroll");
  const shellScrollbar = document.getElementById("shellScrollbar");
  const shellScrollbarThumb = document.getElementById("shellScrollbarThumb");
  // True only while the page scrolls inside .shell-scroll (chat open side by
  // side). On tablets the chat is a drawer and the window keeps scrolling.
  const inShellScroll = () => !!shellScroll && document.body.classList.contains("ask-open")
    && getComputedStyle(shellScroll).position === "absolute";
  if (shellScroll && shellScrollbar && shellScrollbarThumb) {
    let hideTimer;
    const updateThumb = () => {
      const trackH = shellScrollbar.clientHeight;
      const contentH = shellScroll.scrollHeight;
      const viewH = shellScroll.clientHeight;
      if (contentH <= viewH) { shellScrollbarThumb.style.height = "0px"; return; }
      const thumbH = Math.max((viewH / contentH) * trackH, 24);
      const maxThumbTop = trackH - thumbH;
      const scrollRatio = shellScroll.scrollTop / (contentH - viewH);
      shellScrollbarThumb.style.height = `${thumbH}px`;
      shellScrollbarThumb.style.top = `${scrollRatio * maxThumbTop}px`;
    };
    shellScroll.addEventListener("scroll", () => {
      updateThumb();
      shellScrollbar.classList.add("is-scrolling");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => shellScrollbar.classList.remove("is-scrolling"), 900);
    }, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(updateThumb).observe(shellScroll);
    updateThumb();

    // It works like a real scrollbar: drag the thumb, or press the track to
    // jump there. Pointer capture keeps the drag going outside the bar.
    let drag = null;
    const range = () => {
      const trackH = shellScrollbar.clientHeight, thumbH = shellScrollbarThumb.offsetHeight;
      return { trackH, thumbH, scrollMax: shellScroll.scrollHeight - shellScroll.clientHeight };
    };
    shellScrollbar.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const r = range();
      if (r.scrollMax <= 0) return;
      if (e.target !== shellScrollbarThumb) {
        // Press on the track: centre the thumb there, then keep dragging.
        const y = e.clientY - shellScrollbar.getBoundingClientRect().top - r.thumbH / 2;
        shellScroll.scrollTop = Math.max(0, Math.min(1, y / (r.trackH - r.thumbH))) * r.scrollMax;
      }
      drag = { y: e.clientY, top: shellScroll.scrollTop };
      shellScrollbar.setPointerCapture(e.pointerId);
      shellScrollbar.classList.add("is-dragging");
    });
    shellScrollbar.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const r = range();
      shellScroll.scrollTop = drag.top + (e.clientY - drag.y) * (r.scrollMax / Math.max(1, r.trackH - r.thumbH));
    });
    const endDrag = () => { drag = null; shellScrollbar.classList.remove("is-dragging"); };
    shellScrollbar.addEventListener("pointerup", endDrag);
    shellScrollbar.addEventListener("pointercancel", endDrag);
  }

  // 2c) Reveal the scrollbar thumb on hover near the right edge too, not
  // only while actively scrolling (mouse users only — touch has no hover).
  if (canHover) {
    const EDGE = 20;
    let hoverEl = null;
    window.addEventListener("mousemove", (e) => {
      const shellOpen = inShellScroll();
      const target = shellOpen ? shellScrollbar : document.documentElement;
      if (!target) return;
      const rightEdge = shellOpen && shellScroll ? shellScroll.getBoundingClientRect().right : window.innerWidth;
      const hovering = e.clientX >= rightEdge - EDGE;
      if (hovering) {
        if (hoverEl && hoverEl !== target) hoverEl.classList.remove("edge-hover");
        target.classList.add("edge-hover");
        hoverEl = target;
      } else if (hoverEl) {
        hoverEl.classList.remove("edge-hover");
        hoverEl = null;
      }
    }, { passive: true });
  }

  // 6) Back-to-top button appears only while the footer is on screen
  //    the end of the page (start of the footer reveal) is on screen.
  const toTop = document.querySelector(".to-top");
  const pageEnd = document.querySelector(".page-end");
  if (toTop && pageEnd && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      toTop.dataset.show = String(entry.isIntersecting);
    }).observe(pageEnd);
  }

  // 7) Back-to-top: scroll the window itself (the #top anchor is the fixed
  //    header, which never moves, so a plain link would do nothing).
  if (toTop) {
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      // With the chat open beside it, the page scrolls inside .shell-scroll.
      const scroller = inShellScroll() ? shellScroll : window;
      scroller.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
    });
  }

  // 9) Testimonials: a row of cards, clipped at the text column. It moves
  //    with the arrows (greyed out at either end), the keyboard arrows, or a
  //    drag or swipe that carries its speed and settles on the nearest card.
  const tqView = document.querySelector(".tq-view");
  const tqTrack = tqView && tqView.querySelector(".tq-track");
  if (tqTrack) {
    const cards = Array.from(tqTrack.children);
    cards.forEach((card, i) => card.style.setProperty("--i", i));
    const arrows = Array.from(document.querySelectorAll(".tq-arrow"));
    let x = 0;           // how far the row has moved, in px
    let target = 0;      // where the current glide ends
    let stepPx = 0;
    let maxX = 0;
    const measure = () => {
      const c = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(tqTrack).columnGap) || 0;
      stepPx = c + gap;
      maxX = Math.max(0, tqTrack.scrollWidth - tqView.clientWidth);
    };
    const clamp = (v) => Math.min(maxX, Math.max(0, v));
    const snap = (v) => clamp(Math.round(v / stepPx) * stepPx);
    const render = () => {
      tqTrack.style.transform = "translate3d(" + -x + "px, 0, 0)";
      const at = drag && drag.on ? x : target;
      arrows.forEach((b) => { b.disabled = b.dataset.dir === "-1" ? at <= 1 : at >= maxX - 1; });
    };
    // Re-measure whenever the cards change size (resizes, and the first real
    // layout: the section skips layout until it is near the screen).
    const remeasure = () => {
      const old = stepPx;
      measure();
      if (!stepPx) return;
      if (old && old !== stepPx) { x = (x / old) * stepPx; target = (target / old) * stepPx; }
      x = clamp(x); target = clamp(target);
      render();
    };
    let drag = null;
    if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(tqView);
    else window.addEventListener("resize", remeasure);
    remeasure();

    let raf = 0;
    const glideTo = (to) => {
      cancelAnimationFrame(raf);
      target = clamp(to);
      to = target;
      if (reduce.matches) { x = to; render(); return; }
      const from = x;
      const t0 = performance.now();
      const dur = 520;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        x = from + (to - from) * (1 - Math.pow(1 - t, 4));
        render();
        if (t < 1) raf = requestAnimationFrame(tick); else raf = 0;
      };
      raf = requestAnimationFrame(tick);
    };
    const go = (dir) => {
      const from = raf ? target : x;
      // Card by card; the last stop lines the final card up with the right edge.
      const i = from / stepPx;
      const next = dir > 0 ? Math.floor(i + 1.01) : Math.ceil(i - 1.01);
      glideTo(next * stepPx);
    };
    document.querySelectorAll(".tq-arrow").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.dir))));
    tqView.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    // Drag and swipe. Horizontal movement takes over after a few pixels;
    // a mostly vertical touch is left to scroll the page. Past either end
    // the row gives a little, with growing resistance, and springs back.
    let justDragged = false;
    tqView.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button")) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: x, on: false, hist: [[e.clientX, e.timeStamp]] };
    });
    tqView.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.on = true;
        drag.from = x + dx; // start from where the row is, without a jump
        cancelAnimationFrame(raf); raf = 0;
        tqView.setPointerCapture(e.pointerId);
        tqView.classList.add("is-dragging");
      }
      const raw = drag.from - dx;
      const over = raw < 0 ? raw : raw > maxX ? raw - maxX : 0;
      const give = (over * 0.55 * 300) / (300 + 0.55 * Math.abs(over));
      x = over ? (over < 0 ? give : maxX + give) : raw;
      render();
      drag.hist.push([e.clientX, e.timeStamp]);
      if (drag.hist.length > 5) drag.hist.shift();
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.on) return;
      tqView.classList.remove("is-dragging");
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      // Speed over the last few moves (px per ms), carried into the glide.
      const a = d.hist[0];
      const b = d.hist[d.hist.length - 1];
      const v = b[1] > a[1] ? (b[0] - a[0]) / (b[1] - a[1]) : 0;
      const projected = x - v * 180;
      glideTo(projected >= maxX - stepPx / 2 ? maxX : snap(projected));
    };
    tqView.addEventListener("pointerup", endDrag);
    tqView.addEventListener("pointercancel", endDrag);
    tqView.addEventListener("click", (e) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);

    // The video card plays silently while on screen. The sound button turns
    // the sound on (from the start, the first time).
    const vCards = cards.filter((c) => c.classList.contains("tq-card--video"));
    const vids = vCards.map((c) => c.querySelector("video"));
    vCards.forEach((vCard, idx) => {
      const vid = vids[idx];
      const playBtn = vCard.querySelector(".tplay");
      const muteBtn = vCard.querySelector(".tmute");
      if (!vid || !playBtn || !muteBtn) return;
      let userPaused = false;
      let seen = false;
      let heard = false;
      const play = () => {
        if (!seen || userPaused || reduce.matches) return;
        if (vid.preload === "none") { vid.preload = "auto"; vid.load(); }
        vid.play().catch(() => {});
      };
      // "Seen" means in view in the carousel and the carousel on screen, so
      // the film neither loads nor plays until you scroll down to it.
      if ("IntersectionObserver" in window) {
        let inRow = false, onPage = false;
        const update = () => {
          seen = inRow && onPage;
          if (seen) play(); else vid.pause();
        };
        new IntersectionObserver(([en]) => { inRow = en.isIntersecting; update(); }, { root: tqView, threshold: 0.5 }).observe(vCard);
        new IntersectionObserver(([en]) => { onPage = en.isIntersecting; update(); }, { threshold: 0.25 }).observe(vCard);
      }
      const syncMute = () => {
        muteBtn.setAttribute("aria-pressed", String(vid.muted));
        muteBtn.setAttribute("aria-label", vid.muted ? "Unmute" : "Mute");
      };
      const syncPlay = () => {
        const playing = !vid.paused && !vid.ended;
        vCard.classList.toggle("is-playing", playing);
        playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      };
      muteBtn.addEventListener("click", () => {
        if (!vid.muted) { vid.muted = true; return; }
        vids.forEach((o) => { if (o !== vid) o.muted = true; });
        vid.muted = false;
        if (!heard) { heard = true; vid.currentTime = 0; }
        if (vid.paused) { userPaused = false; seen = true; play(); }
      });
      playBtn.addEventListener("click", () => {
        userPaused = !vid.paused;
        if (vid.paused) { seen = true; play(); } else vid.pause();
      });
      vid.addEventListener("volumechange", syncMute);
      ["play", "pause", "ended"].forEach((ev) => vid.addEventListener(ev, syncPlay));
      syncMute();
      syncPlay();
    });
  }

  // 10) Entrances: add .is-in once each block is meaningfully on screen.
  //     (CSS hides these blocks only when scripts run, via the .js class.)
  //     Custom fonts (Manrope) can reflow the page slightly after this first
  //     runs, which would shift elements the observer already judged "not on
  //     screen yet" and leave them stuck hidden; once fonts settle, any block
  //     still waiting is re-checked against final layout.
  const revealSelector = ".ab-r, .ab-facts, .im-grid, .off-grid, .ab-life, .wk-list, .tq-view, .proj-head";
  if ("IntersectionObserver" in window) {
    // In as soon as its top edge is a little way into the window. (It used
    // to wait for a fifth of the block to show, which a tall block, like
    // Outside the brief on a phone, reached far too late.)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    const observeUnrevealed = () => {
      document.querySelectorAll(revealSelector).forEach((el) => {
        if (!el.classList.contains("is-in")) io.observe(el);
      });
    };
    observeUnrevealed();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(observeUnrevealed);
    window.addEventListener("load", observeUnrevealed, { once: true });
  } else {
    document.querySelectorAll(revealSelector).forEach((el) => el.classList.add("is-in"));
  }

  // 11) Projects stack (home page). The cards stack by CSS alone: each one is
  //     sticky a strip lower than the one before (see .proj-stack in the CSS).
  //     This block gives the cards equal heights and handles the heading:
  //     the heading pins under the nav whenever it, every card's strip and a
  //     whole card fit in the window together, and the cards then pin just
  //     below it (--stack-top). The heading's own sticky range ends later
  //     than the cards', so once the pile starts leaving it is translated by
  //     the same amount; heading and pile leave together, then the page
  //     carries on. getBoundingClientRect is relative to the viewport, so
  //     this works whether the window or #shellScroll (Ask AI panel open) is
  //     the thing scrolling.
  const projStack = document.getElementById("projStack");
  if (projStack) {
    const section = projStack.closest(".projects");
    const head = section ? section.querySelector(".proj-head") : null;
    const cards = Array.from(projStack.querySelectorAll(".project"));
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const footer = document.querySelector(".site-footer");
    let active = false;
    let pinned = false;
    let headTop = 0;
    let headShift = 0;
    let ticking = false;

    const measure = () => {
      cards.forEach((c) => { c.style.minHeight = ""; });
      const tallest = Math.max(...cards.map((c) => c.offsetHeight));
      cards.forEach((c) => { c.style.minHeight = `${tallest}px`; });
      const rootFs = parseFloat(getComputedStyle(document.documentElement).fontSize);

      // Try pinning the heading; keep it only if the heading, every card's
      // strip and one whole card all fit on screen together.
      pinned = false;
      if (head && section) {
        head.style.transform = "";
        headShift = 0;
        section.classList.add("proj-pinned");
        const hs = getComputedStyle(head);
        headTop = parseFloat(hs.top) || 0;
        const stackTop = headTop + head.offsetHeight + (parseFloat(hs.marginBottom) || 0);
        section.style.setProperty("--stack-top", `${stackTop}px`);
        const lastTop = parseFloat(getComputedStyle(cards[cards.length - 1]).top) || stackTop;
        const fits = !reduceMq.matches && hs.position === "sticky" && lastTop + tallest + rootFs <= window.innerHeight;
        if (fits) {
          pinned = true;
        } else {
          section.classList.remove("proj-pinned");
          section.style.removeProperty("--stack-top");
        }
      }
      active = !reduceMq.matches && getComputedStyle(cards[0]).position === "sticky";

      // Very tall windows can run out of page before the last card lands on
      // the pile. Then add just enough room under the footer for it to land,
      // so the page ends with the whole pile in view; normally this stays 0.
      if (footer) {
        footer.style.paddingBottom = "";
        if (!active) return;
        const inShell = inShellScroll();
        const scroller = inShell ? shellScroll : document.scrollingElement;
        const viewTop = inShell ? shellScroll.getBoundingClientRect().top : 0;
        const viewH = inShell ? shellScroll.clientHeight : window.innerHeight;
        const last = cards[cards.length - 1];
        const ls = getComputedStyle(last);
        const lastNatural = projStack.getBoundingClientRect().bottom - viewTop + scroller.scrollTop
          - (parseFloat(getComputedStyle(projStack).paddingBottom) || 0)
          - (parseFloat(ls.marginBottom) || 0) - last.offsetHeight;
        const need = lastNatural - (parseFloat(ls.top) || 0);
        const room = Math.ceil(need - (scroller.scrollHeight - viewH));
        if (room > 0) footer.style.paddingBottom = `${room}px`;
      }
    };

    // The cards stack by CSS alone. The only scroll work is the heading: the
    // first card is the last to let go of its sticky point, so once it starts
    // rising the pile is leaving; the heading keeps the same distance above
    // it. Measured without our own shift so it never compounds.
    // Where the first card sticks, read once per measure() rather than on
    // every scroll frame.
    let firstStick = 0;
    const render = () => {
      ticking = false;
      if (!active || !pinned) {
        if (head) head.style.transform = "";
        headShift = 0;
        return;
      }
      const overshoot = Math.max(0, firstStick - cards[0].getBoundingClientRect().top);
      const natural = head.getBoundingClientRect().top - headShift;
      headShift = overshoot > 0 ? Math.min(0, headTop - overshoot - natural) : 0;
      head.style.transform = headShift ? `translateY(${headShift.toFixed(2)}px)` : "";
    };
    // Scroll work only while the projects section is on screen (or near it).
    let near = true;
    const requestRender = () => {
      if (near && !ticking) { ticking = true; requestAnimationFrame(render); }
    };
    const refresh = () => { measure(); firstStick = parseFloat(getComputedStyle(cards[0]).top) || 0; render(); };
    if (section && "IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { near = en.isIntersecting; if (near) requestRender(); }, { rootMargin: "200px 0px" }).observe(section);
    }

    refresh();
    window.addEventListener("scroll", requestRender, { passive: true });
    if (shellScroll) shellScroll.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if (reduceMq.addEventListener) reduceMq.addEventListener("change", refresh);
    // The heading re-wraps when the Ask AI panel narrows the page; its height
    // decides where the cards pin, so re-measure when it changes size.
    if (head && "ResizeObserver" in window) {
      let lastH = 0;
      new ResizeObserver(() => {
        if (head.offsetHeight !== lastH) { lastH = head.offsetHeight; refresh(); }
      }).observe(head);
    }
  }

  // 11h) Bottom edge: content softens into a blur where the screen ends
  //      (CSS .edge-blur). Hidden once the footer is in view, so the end of
  //      the page is always crisp.
  if (!document.querySelector(".edge-blur")) {
    const edge = document.createElement("div");
    edge.className = "edge-blur";
    edge.setAttribute("aria-hidden", "true");
    edge.innerHTML = "<i></i>";
    document.body.appendChild(edge);
    const foot = document.querySelector(".site-footer");
    if (foot && "IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => edge.classList.toggle("is-off", en.isIntersecting)).observe(foot);
    }
  }

  // 11g) Ambient music (assets/audio/ambient/). Off by default; its button
  //      (an equaliser) lives in the display settings panel and fades it in
  //      and out. Once it's on, it keeps playing from
  //      the same spot as you move between pages in this tab, until muted.
  //      A browser may hold sound on a new page until you interact with it;
  //      then it resumes on your next click, tap or key. If the file isn't
  //      there, the button stays hidden.
  const soundBtn = document.querySelector(".sound-toggle");
  if (soundBtn) {
    // The icon: a five-bar equaliser (CSS .snd-eq), each bar with its own
    // rhythm, length and starting point so the dance never looks looped.
    const bars = [["eq-a", 1.1, -0.3], ["eq-b", 0.8, -0.9], ["eq-c", 1.3, -0.1], ["eq-a", 0.9, -0.6], ["eq-b", 1.2, -0.4]];
    soundBtn.innerHTML = '<span class="snd-eq" aria-hidden="true">' + bars.map(([k, d, dl]) => `<span class="eq-bar" style="--eq:${k};--d:${d}s;--dl:${dl}s"><i></i></span>`).join("") + "</span>";
    const src = (window.SITE && window.SITE.ambient) || "/assets/audio/ambient/ambient.mp3";
    const KEY = "ambient";
    // The level the music plays at: 0.35 unless the visitor has set their
    // own with the slider in the display settings panel (remembered).
    let VOL = 0.35;
    try { const v = parseFloat(localStorage.getItem("ambient-vol")); if (v >= 0 && v <= 1) VOL = v; } catch (e) { /* private mode */ }
    const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
    let audio = null, fadeRaf = 0, on = false;
    const setUi = (playing) => {
      on = playing;
      soundBtn.setAttribute("aria-pressed", String(playing));
      const label = playing ? "Mute ambient music" : "Play ambient music";
      soundBtn.setAttribute("aria-label", label);
      soundBtn.title = label;
    };
    // iPhone and iPad Safari ignore a page's volume setting (only the
    // hardware buttons change it), so there the level goes through Web Audio
    // instead; everywhere else it's the player's own volume.
    let gain = null, actx = null;
    const getVol = () => (gain ? gain.gain.value : audio.volume);
    const setVol = (v) => { v = Math.min(1, Math.max(0, v)); if (gain) gain.gain.value = v; else audio.volume = v; };
    // Fades move evenly in loudness, not in raw volume (a straight volume
    // ramp sounds like it jumps at one end), with a soft start and end.
    const fade = (to, ms, done) => {
      cancelAnimationFrame(fadeRaf);
      const a = Math.sqrt(getVol()), b = Math.sqrt(to), t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        const e = k * k * (3 - 2 * k);
        const amp = a + (b - a) * e;
        setVol(amp * amp);
        if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
      };
      fadeRaf = requestAnimationFrame(step);
    };
    const ensure = () => {
      if (audio) return audio;
      // Already started by the page's head script (carrying on from the last
      // page): take it over as it is.
      if (window.__ambient) {
        audio = window.__ambient;
        window.__ambTaken = true;
        addEventListener("pagehide", () => { if (on) { store.set(KEY + "-at", String(audio.currentTime)); store.set(KEY + "-left", String(Date.now())); } });
        return audio;
      }
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (audio.volume !== 0 && AC) {
        try {
          actx = new AC();
          gain = actx.createGain();
          gain.gain.value = 0;
          actx.createMediaElementSource(audio).connect(gain).connect(actx.destination);
        } catch (e) { gain = null; }
      }
      // Pick up where the music would be by now: the saved spot plus the
      // time the page change took, so it carries on rather than restarting.
      const at = parseFloat(store.get(KEY + "-at"));
      const left = parseFloat(store.get(KEY + "-left"));
      if (at > 0) audio.addEventListener("loadedmetadata", () => {
        const gap = left > 0 ? (Date.now() - left) / 1000 : 0;
        audio.currentTime = (at + gap) % (audio.duration || at + gap + 1);
      }, { once: true });
      addEventListener("pagehide", () => { if (on) { store.set(KEY + "-at", String(audio.currentTime)); store.set(KEY + "-left", String(Date.now())); } });
      return audio;
    };
    // A first play fades in slowly; carrying on from the last page fades in
    // a little quicker. "want" is what the visitor last asked for, so a
    // quick second click (muting while the track is still starting) wins.
    let want = false;
    const play = (resuming) => {
      want = true;
      ensure();
      if (actx && actx.state === "suspended") actx.resume().catch(() => {});
      return audio.play().then(() => {
        if (!want) { audio.pause(); return false; }
        setUi(true); soundBtn.classList.remove("is-held"); store.set(KEY, "on");
        fade(VOL, resuming ? 200 : 1800);
        return true;
      }, () => false);
    };
    const stop = () => { want = false; setUi(false); store.set(KEY, "off"); store.set(KEY + "-at", "0"); if (audio) fade(0, 1000, () => { if (!want) audio.pause(); }); };
    // The button answers the moment it's clicked; the music follows as soon
    // as the track can play. "On" is remembered at once, so leaving the page
    // while it's still starting doesn't lose it.
    soundBtn.addEventListener("click", () => {
      if (on) { stop(); return; }
      store.set(KEY, "on");
      setUi(true);
      play(false).then((ok) => { if (!ok && want) { want = false; setUi(false); } });
    });
    // Start loading the track when the pointer comes near the button (or it
    // gets keyboard focus), so it's usually ready by the time it's clicked.
    const warm = () => { if (!audio) ensure(); };
    soundBtn.addEventListener("pointerenter", warm, { once: true });
    soundBtn.addEventListener("focus", warm, { once: true });
    // A browser may refuse to start sound on a freshly loaded page until the
    // visitor interacts with it. Then the button shows it's waiting, and the
    // music picks up at the first click, tap or key press anywhere (scrolling
    // doesn't count as an interaction in browsers).
    const hold = () => {
      setUi(false);
      soundBtn.classList.add("is-held");
      soundBtn.setAttribute("aria-label", "Resume ambient music");
      soundBtn.title = "Resume ambient music";
      const resume = (e) => {
        if (store.get(KEY) !== "on" || on) return;
        if (e.target.closest && e.target.closest(".sound-toggle")) return;
        play(true).then((ok) => { if (ok) off(); });
      };
      const types = ["pointerdown", "click", "keydown", "touchend"];
      const off = () => types.forEach((t) => removeEventListener(t, resume, true));
      types.forEach((t) => addEventListener(t, resume, true));
    };
    if (store.get(KEY) === "on") {
      // It was playing on the last page: start straight away (the track is
      // known to exist), without waiting for anything else.
      soundBtn.hidden = false;
      // Try now; if the browser holds it, try once more as the page settles
      // (it sometimes allows it a moment later), then wait for a click.
      play(true).then((ok) => {
        if (ok) return;
        setTimeout(() => { if (!on) play(true).then((ok2) => { if (!ok2) hold(); }); }, 250);
      });
    } else {
      // Show the button only if there's a track to play.
      fetch(src, { method: "HEAD" }).then((r) => { if (r.ok) soundBtn.hidden = false; }).catch(() => {});
    }
    // Coming back with the Back button (page restored from memory).
    addEventListener("pageshow", (e) => {
      if (!e.persisted || store.get(KEY) !== "on") return;
      if (!audio || audio.paused) play(true).then((ok) => { if (!ok) hold(); });
      else if (on) fade(VOL, 200); // back from memory
    });

    // Step aside for other sound. While a video (or the SoundCloud player)
    // plays with sound, the music fades out; when it's paused, ends or is
    // muted, the music fades back in. Only if the music was on, and the
    // visitor didn't change it in between.
    const loud = new Set();
    let stepped = false;
    const quiet = () => {
      if (!loud.size || !on) return;
      stepped = true;
      setUi(false);
      soundBtn.setAttribute("aria-label", "Ambient music paused while media plays");
      soundBtn.title = "Ambient music paused while media plays";
      fade(0, 700, () => { if (!on) audio.pause(); });
    };
    // Wait a moment before coming back, so a quick pause-and-play (or a
    // player hiccup) doesn't make the music flicker in and out.
    let backTimer = 0;
    const back = () => {
      clearTimeout(backTimer);
      backTimer = setTimeout(() => {
        if (loud.size || !stepped) return;
        stepped = false;
        if (store.get(KEY) === "on" && !on) play(false);
      }, 700);
    };
    soundBtn.addEventListener("click", () => { stepped = false; }, true);
    // The display settings panel's volume slider sets the level here.
    window.__ambientVolume = (v) => {
      VOL = Math.min(1, Math.max(0, v));
      try { localStorage.setItem("ambient-vol", String(VOL)); } catch (e) { /* private mode */ }
      if (on && audio) { cancelAnimationFrame(fadeRaf); setVol(VOL); }
      return VOL;
    };
    window.__ambientVolumeNow = () => VOL;
    const mark = (id, playing) => {
      if (playing) { loud.add(id); quiet(); } else if (loud.delete(id)) back();
    };
    // Other parts of the site report their players with this event.
    document.addEventListener("ambient:media", (e) => mark(e.detail.id, e.detail.playing));
    // Videos and audio on the page (media events don't bubble, so listen in
    // the capture phase). The music's own player isn't in the page.
    const check = (e) => {
      const m = e.target;
      if (!(m instanceof HTMLMediaElement)) return;
      mark(m, !m.paused && !m.ended && !m.muted && m.volume > 0);
    };
    ["play", "playing", "pause", "ended", "volumechange", "emptied"].forEach((t) => document.addEventListener(t, check, true));
    // Embedded players (Vimeo films, SoundCloud) say what they're doing by
    // message. Ask each one for its play and pause events once it's ready.
    const embed = (src) => (src || "").startsWith("https://player.vimeo.com/") ? "vimeo" : (src || "").startsWith("https://w.soundcloud.com/") ? "sc" : "";
    const frameOf = (win) => [...document.querySelectorAll("iframe")].find((f) => f.contentWindow === win);
    const listen = (f) => {
      const kind = embed(f.src);
      if (!kind || !f.contentWindow) return;
      const origin = new URL(f.src).origin;
      const evs = kind === "vimeo" ? ["play", "pause", "ended", "volumechange"] : ["play", "pause", "finish"];
      // Vimeo takes the message as an object, SoundCloud as JSON text.
      evs.forEach((v) => {
        const msg = { method: "addEventListener", value: v };
        f.contentWindow.postMessage(kind === "vimeo" ? msg : JSON.stringify(msg), origin);
      });
    };
    addEventListener("message", (e) => {
      if (e.origin !== "https://player.vimeo.com" && e.origin !== "https://w.soundcloud.com") return;
      const f = frameOf(e.source);
      if (!f) return;
      let d = e.data;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch (err) { return; } }
      if (!d || typeof d !== "object") return;
      const ev = d.event || d.method;
      if (ev === "ready") listen(f);
      else if (ev === "play" || ev === "playing") mark(f, true);
      else if (ev === "pause" || ev === "ended" || ev === "finish" || ev === "error") mark(f, false);
      else if (ev === "volumechange" && d.data && typeof d.data.volume === "number") mark(f, d.data.volume > 0);
    });
    // A film that's removed (or a chat answer that's cleared) stops counting.
    new MutationObserver(() => loud.forEach((x) => { if (x.isConnected === false) { loud.delete(x); back(); } }))
      .observe(document.body, { childList: true, subtree: true });
  }

  // 11d) Home project cards: with a mouse, a tooltip follows the pointer
  //      over a card and says where a click goes ("Read case study", or
  //      "Unlock case study" for a locked one). It takes the card's own
  //      colours (its dark tag colour as the fill, its tint as the text), so
  //      they flip with the theme. Pops in with a short scale and fade.
  const tipStack = document.getElementById("projStack");
  if (tipStack && canHover) {
    const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';
    const lock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    const tip = document.createElement("div");
    tip.className = "proj-tip";
    tip.setAttribute("aria-hidden", "true");
    tip.innerHTML = '<span class="proj-tip-in"></span>';
    document.body.appendChild(tip);
    const inner = tip.firstChild;
    let raf = 0, px = 0, py = 0, current = null;
    const move = () => { raf = 0; tip.style.transform = `translate(${px + 14}px, ${py + 18}px)`; };
    const show = (card) => {
      if (current === card) return;
      if (!current) { cancelAnimationFrame(raf); move(); }
      current = card;
      const cs = getComputedStyle(card);
      // A sticker in the card's own colours: its deeper tint, its ink.
      tip.style.setProperty("--tip-bg", `color-mix(in srgb, ${cs.getPropertyValue("--ink-tag").trim()} 18%, ${cs.getPropertyValue("--card").trim()})`);
      tip.style.setProperty("--tip-ink", cs.getPropertyValue("--ink-tag").trim());
      inner.innerHTML = card.hasAttribute("data-locked") ? `${lock}Unlock case study` : `Read case study${arrow}`;
      tip.classList.add("is-on");
    };
    const hide = () => { current = null; tip.classList.remove("is-on"); };
    tipStack.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const card = e.target.closest(".project");
      if (!card) { hide(); return; }
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(move);
      show(card);
    });
    tipStack.addEventListener("pointerleave", hide);
    window.addEventListener("scroll", () => {
      // The pile moves under a still pointer: re-check which card is there.
      if (!current) return;
      const el = document.elementFromPoint(px, py);
      const card = el && el.closest("#projStack .project");
      if (card) show(card); else hide();
    }, { passive: true });
  }

  // 11b) What I bring: a list of skills and one detail card. The list is a
  //      set of tabs; picking a skill shows its panel in the card (the panel
  //      rises in) and counts its result number up. The list moves on by
  //      itself: the thin line under the active skill is its timer (a CSS
  //      animation, so it can pause mid-way), and it pauses while the list has
  //      keyboard focus or is off screen (never on hover). Arrow keys, Home and End move between skills.
  const vx = document.querySelector(".vx");
  if (vx) {
    const items = Array.from(vx.querySelectorAll(".vx-item"));
    const tabs = items.map((it) => it.querySelector(".vx-trigger"));
    const panels = Array.from(vx.querySelectorAll(".vx-panel"));
    const card = vx.querySelector(".vx-card");
    let liveTimer = 0;
    const reduceV = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let countRun = 0;
    let started = false;
    let inView = false;
    let focused = false;

    const countUp = (el) => {
      const run = ++countRun;
      const to = Number(el.dataset.to);
      const suffix = el.dataset.suffix || "";
      const sign = el.dataset.to.startsWith("+") ? "+" : "";
      const show = (v) => { el.textContent = `${v > 0 ? sign : ""}${v === 0 ? 0 : v}${suffix}`; };
      if (reduceV.matches) { show(to); return; }
      const t0 = performance.now();
      const step = (now) => {
        if (run !== countRun) { show(to); return; }
        const p = Math.min(1, (now - t0) / 900);
        show(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // If frames stall (background tab), never leave the number mid-count.
      setTimeout(() => { if (run === countRun) show(to); }, 1000);
    };

    const open = (i, moveFocus) => {
      current = i;
      items.forEach((it, k) => {
        const on = k === i;
        it.classList.toggle("is-active", on);
        tabs[k].setAttribute("aria-pressed", String(on));
        panels[k].classList.toggle("is-on", on);
        if (on) panels[k].removeAttribute("aria-hidden"); else panels[k].setAttribute("aria-hidden", "true");
      });
      const num = panels[i].querySelector(".value-num[data-to]");
      if (num) countUp(num);
      if (moveFocus) tabs[i].focus();
    };

    const syncPause = () => {
      vx.classList.toggle("is-paused", !inView || focused);
    };

    // Each option is a plain button in the Tab order. Reaching one shows its
    // card: Tab and Shift+Tab (or the arrow keys) move between them, a click
    // works too, and focus stays on the option. The card isn't a Tab stop;
    // screen readers hear which option is chosen and the card's new content.
    const choose = (k) => {
      if (k === current) return;
      // Announce the new card only when someone chose it (not on the timer).
      card.setAttribute("aria-live", "polite");
      open(k);
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => card.removeAttribute("aria-live"), 1500);
    };
    tabs.forEach((tab, k) => {
      tab.addEventListener("click", () => choose(k));
      tab.addEventListener("focus", () => choose(k));
      tab.addEventListener("keydown", (e) => {
        const last = tabs.length - 1;
        let next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = k === last ? 0 : k + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = k === 0 ? last : k - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = last;
        if (next !== null) { e.preventDefault(); tabs[next].focus(); }
      });
    });
    items.forEach((it, k) => {
      it.querySelector(".vx-bar i").addEventListener("animationend", () => {
        if (k === current) open((current + 1) % items.length);
      });
    });
    // Pause for keyboard focus only. A mouse or touch click also focuses the
    // tab, and that focus lingers after the pointer leaves; counting it would
    // freeze the timer until the visitor clicked somewhere else on the page.
    // Keyboard focus is the kind that shows a focus ring (:focus-visible).
    // Focus that arrives right after a pointer press is treated as pointer
    // focus too, whatever the browser's own heuristics say.
    let lastPointerDown = -Infinity;
    const isKeyboardFocus = (el) => {
      if (performance.now() - lastPointerDown < 500) return false;
      try { return el.matches(":focus-visible"); } catch (err) { return false; }
    };
    // A pointer press inside the section also ends any keyboard pause. Capture phase: runs before focus moves.
    vx.addEventListener("pointerdown", () => {
      lastPointerDown = performance.now();
      if (focused) { focused = false; syncPause(); }
    }, true);
    vx.addEventListener("focusin", (e) => {
      focused = isKeyboardFocus(e.target);
      syncPause();
    });
    vx.addEventListener("focusout", (e) => {
      if (!vx.contains(e.relatedTarget)) { focused = false; syncPause(); }
    });

    if (!reduceV.matches && "IntersectionObserver" in window) {
      syncPause();
      new IntersectionObserver((entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView && !started) {
          started = true;
          vx.classList.add("is-playing");
          const num = panels[current].querySelector(".value-num[data-to]");
          if (num) countUp(num);
        }
        syncPause();
      }, { threshold: 0.35 }).observe(vx);
    }
  }
  // 11c) Locked case studies (Home cards, Works cards and "Next project").
  //      A locked link opens the password dialog instead of navigating; the
  //      lock card on a locked case study's page opens it too.
  //      The password is checked by the Cloudflare Worker (portfolio-auth) at
  //      /api/unlock, against the PORTFOLIO_PASSWORD secret; it is never in
  //      this site. A right password makes the Worker set a signed cookie
  //      (ends when the browser closes, 2 hours at most), and the Worker then
  //      serves the full locked pages instead of the placeholders in works/.
  //      To change the password: Cloudflare -> Workers & Pages ->
  //      portfolio-auth -> Settings -> Variables and secrets.
  const lockDialog = document.getElementById("lockDialog");
  if (lockDialog && typeof lockDialog.showModal === "function") {
    const lockForm = document.getElementById("lockForm");
    const lockInput = document.getElementById("lockInput");
    const lockError = document.getElementById("lockError");
    const submitBtn = lockForm.querySelector("button[type=submit]");
    // A note for this tab only, so locked links can skip the dialog once
    // unlocked. The real check is the Worker's cookie; if that has expired,
    // the page shows its lock card again (and case.js clears this note).
    const unlockedKey = "caseStudiesUnlocked";
    let pendingHref = "";

    const isUnlocked = () => {
      try { return sessionStorage.getItem(unlockedKey) === "1"; } catch (e) { return false; }
    };
    const setError = (msg) => {
      lockError.textContent = msg;
      lockInput.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    const shake = () => {
      lockInput.classList.remove("is-wrong");
      void lockInput.offsetWidth;
      lockInput.classList.add("is-wrong");
      lockInput.select();
    };

    const askForPassword = (href) => {
      pendingHref = href;
      lockInput.value = "";
      setError("");
      lockDialog.showModal();
      lockInput.focus();
    };
    // Locked links: home cards, Works cards, and the case study's "Next project".
    document.querySelectorAll(".project[data-locked] .project-link, .wk-item[data-locked] .wk-card, .cs-next[data-locked]").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (isUnlocked()) return;
        e.preventDefault();
        askForPassword(link.getAttribute("href"));
      });
    });
    // The lock card on a locked case study: unlock, then reload this page.
    document.querySelectorAll("[data-lock-open]").forEach((btn) => {
      btn.addEventListener("click", () => askForPassword(""));
    });

    document.getElementById("lockCancel").addEventListener("click", () => lockDialog.close());
    // Click on the dimmed backdrop (outside the form) closes it too.
    lockDialog.addEventListener("click", (e) => { if (e.target === lockDialog) lockDialog.close(); });

    lockForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const value = lockInput.value;
      if (!value) { setError("Enter the password to continue."); shake(); lockInput.focus(); return; }
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ password: value })
        });
        if (res.status === 401) {
          // Clear first, so a repeat of the same message is read out again.
          setError("");
          requestAnimationFrame(() => setError("That password didn't work. Check it and try again."));
          shake();
          return;
        }
        if (!res.ok) throw new Error("status " + res.status);
        try { sessionStorage.setItem(unlockedKey, "1"); } catch (err) { /* private mode */ }
        lockDialog.close();
        // Go to the locked case study, or reload this one so the Worker sends
        // the full page.
        if (pendingHref) window.location.href = pendingHref;
        else window.location.reload();
      } catch (err) {
        setError("Couldn't check the password just now. Try again in a moment.");
        shake();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
    lockInput.addEventListener("input", () => { if (lockError.textContent) setError(""); });
  }

  // 12) Copy email: copies the address, swaps the icon to a check and shows a
  //     short "Copied" note for a moment. Falls back to a hidden textarea.
  const copyBtn = document.querySelector(".copy-mail");
  const copyNote = document.querySelector(".copy-note");
  if (copyBtn) {
    let timer;
    const done = (ok) => {
      copyBtn.classList.toggle("is-copied", ok);
      if (copyNote) { copyNote.textContent = ok ? "Copied" : "Press Ctrl+C to copy"; copyNote.classList.add("is-on"); }
      clearTimeout(timer);
      timer = setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        copyNote?.classList.remove("is-on");
      }, 1800);
    };
    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        done(true);
      } catch (err) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove();
        done(ok);
      }
    });
  }

  // 14) About page: the three numbers count up once when they scroll into view.
  const abStats = document.querySelector(".ab-stats");
  if (abStats && !reduce.matches && "IntersectionObserver" in window) {
    const nums = abStats.querySelectorAll(".ab-num");
    nums.forEach((el) => { el.textContent = `0${el.dataset.suf || ""}`; });
    const io2 = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io2.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1100);
        const e = 1 - Math.pow(1 - k, 3);
        nums.forEach((el) => { el.textContent = `${Math.round(parseFloat(el.dataset.to) * e)}${el.dataset.suf || ""}`; });
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io2.observe(abStats);
  }

  // 14b) About "Now": stamp it with the current month, so it never reads stale.
  document.querySelectorAll("[data-now-month]").forEach((t) => {
    const d = new Date();
    t.textContent = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    t.setAttribute("datetime", `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  });

  // 15d) Works intro: who's reading? Pick a role and the big sentence
  //      describes the work in that reader's terms, with the two case studies
  //      to start with (in their project tints). The choice is kept for the
  //      visit. Everything said here is already true elsewhere on the site.
  const rdRoles = document.getElementById("rdRoles");
  const rdLines = document.getElementById("rdLines");
  const rdStart = document.getElementById("rdStart");
  if (rdRoles && rdLines && rdStart) {
    // Each line answers the question that reader is really asking:
    // recruiter, "is he senior and available?"; design lead, "will he hold
    // the bar?"; product manager, "will he move a number, quickly?";
    // engineer, "will his handoff hurt?"; founder, "can he take this from
    // zero on his own?". Every claim is stated elsewhere on the site.
    const READERS = [
      ["anyone", "For anyone", "I make complicated products feel obvious, and I stay with them until they ship.", ["wave", "wealthbasket"]],
      ["recruiters", "Recruiters", "Senior product designer, eight years in. Open to senior roles, remote or in New Delhi, and ready to start in about 30 days.", ["wave", "wealthbasket"]],
      ["leads", "Design leads", "Evidence before anyone opens Figma, rough work shared early, and a bar on detail that holds all the way to launch.", ["lumen", "wave"]],
      ["pms", "Product managers", "A one-page brief we both sign, clickable prototypes in the first couple of weeks, and a clear way to know it worked.", ["parcelo", "wayfarer"]],
      ["engineers", "Engineers", "Every state drawn, edge cases caught in a code prototype first, and someone who can read your pull request and suggest the CSS fix.", ["wave", "jda"]],
      ["founders", "Founders", "Bring the idea and the deadline. I'll talk to your users, design what matters first and put something real in front of people fast.", ["wealthbasket", "lumen"]]
    ];
    const projects = window.CASE_STUDIES || [];
    const lockIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    const chip = (slug, i) => {
      const p = projects.find((x) => x.slug === slug);
      if (!p) return "";
      const label = p.locked ? `${p.name} (password protected)` : p.name;
      return `<a class="rd-chip" href="/works/${p.slug}" style="--c-bg: var(--${p.tint}-bg); --c-ink: var(--${p.tint}-ink); --i: ${i}" aria-label="${label}">${p.locked ? lockIc : ""}${p.name}</a>`;
    };
    const words = (text) => text.split(" ").map((w, i) => `<span class="rd-w" style="--i: ${i}">${w}</span>`).join(" ");
    rdRoles.innerHTML = READERS.map(([key, label]) => `<button class="rd-role" type="button" data-role="${key}" data-label="${label}" aria-pressed="false">${label}</button>`).join("");
    rdLines.innerHTML = READERS.map(([key, , text]) => `<p class="rd-line" data-role="${key}">${words(text)}</p>`).join("");
    // The sentences share one spot, as tall as the longest of them, so the
    // page below never moves when the reader changes; each sits centred in it.
    const rdTrig = document.getElementById("rdTrig");
    const rdTrigTxt = rdTrig ? rdTrig.querySelector(".rd-trig-txt") : null;
    // Each sentence gets the width that sets it on exactly three lines
    // (the narrowest that still does), so all six read as the same shape.
    // Where even the full width needs more (narrow phones), it uses it all.
    function threeLines(l) {
      const lh = parseFloat(getComputedStyle(l).lineHeight);
      const full = rdLines.clientWidth;
      const lines = () => Math.round(l.offsetHeight / lh);
      l.style.maxWidth = `${full}px`;
      if (lines() > 3) return;
      let lo = 120, hi = full;
      while (hi - lo > 2) {
        const mid = (lo + hi) / 2;
        l.style.maxWidth = `${mid}px`;
        if (lines() <= 3) hi = mid; else lo = mid;
      }
      l.style.maxWidth = `${Math.ceil(hi) + 1}px`;
    }
    function fitLines() {
      rdLines.querySelectorAll(".rd-line").forEach(threeLines);
      const tallest = Math.max(...Array.from(rdLines.querySelectorAll(".rd-line"), (l) => l.offsetHeight));
      if (tallest > 0) rdLines.style.height = `${tallest}px`;
    }
    window.addEventListener("resize", () => fitLines());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitLines());
    const show = (key, animate) => {
      const r = READERS.find((x) => x[0] === key) || READERS[0];
      rdRoles.querySelectorAll(".rd-role").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.role === r[0])));
      rdLines.querySelectorAll(".rd-line").forEach((l) => {
        const on = l.dataset.role === r[0];
        l.classList.toggle("is-on", on);
        l.setAttribute("aria-hidden", String(!on));
        l.classList.remove("is-in");
        if (on && animate) { void l.offsetWidth; l.classList.add("is-in"); }
      });
      rdStart.innerHTML = '<span class="rd-start-label">Start with</span> ' + r[3].map(chip).join(" ");
      rdStart.classList.remove("is-in");
      if (animate) { void rdStart.offsetWidth; rdStart.classList.add("is-in"); }
      try { sessionStorage.setItem("reader", r[0]); } catch (e) { /* private mode */ }
      placeRole(animate);
      fitLines();
      if (rdTrigTxt) rdTrigTxt.textContent = r[1].replace(/^For /, "").toLowerCase();
    };

    // Phones: the roles become one row you swipe sideways (CSS). An ink
    // underline slides to the chosen role, which glides to the middle of
    // the row; the edges fade only where there are more roles to see.
    const rdInd = document.createElement("span");
    rdInd.className = "rd-ind";
    rdInd.setAttribute("aria-hidden", "true");
    rdRoles.append(rdInd);
    const phone = window.matchMedia("(max-width: 640px)");
    const fadeEdges = () => {
      const max = rdRoles.scrollWidth - rdRoles.clientWidth;
      rdRoles.classList.toggle("is-more-l", rdRoles.scrollLeft > 2);
      rdRoles.classList.toggle("is-more-r", rdRoles.scrollLeft < max - 2);
    };
    // Wider screens: the underline sits just under the chosen role (the
    // roles can wrap onto two rows, so it moves down as well as across).
    function placeRole(animate) {
      const b = rdRoles.querySelector('.rd-role[aria-pressed="true"]');
      if (!b) return;
      rdInd.style.width = `${b.offsetWidth}px`;
      // Phones: an underline on the swipeable row. Wider screens: a pill
      // that sits behind the chosen role (CSS gives it its look).
      rdInd.style.height = phone.matches ? "" : `${b.offsetHeight}px`;
      rdInd.style.transform = phone.matches ? `translateX(${b.offsetLeft}px)` : `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
      if (!phone.matches) return;
      rdRoles.scrollTo({ left: b.offsetLeft - (rdRoles.clientWidth - b.offsetWidth) / 2, behavior: animate && !reduce.matches ? "smooth" : "auto" });
      fadeEdges();
    }
    rdRoles.addEventListener("scroll", fadeEdges, { passive: true });

    // A cue that the row slides: once per visit, it peeks a little to the
    // left when it first comes into view.
    let hinted = false;
    try { hinted = sessionStorage.getItem("rdHint") === "1"; } catch (e) { /* private mode */ }
    if (!hinted && !reduce.matches && "IntersectionObserver" in window) {
      const hintIo = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || !phone.matches) return;
        hintIo.disconnect();
        if (!rdRoles.classList.contains("is-more-r")) return;
        try { sessionStorage.setItem("rdHint", "1"); } catch (e) { /* private mode */ }
        const from = rdRoles.scrollLeft;
        setTimeout(() => {
          rdRoles.scrollTo({ left: from + 56, behavior: "smooth" });
          setTimeout(() => rdRoles.scrollTo({ left: from, behavior: "smooth" }), 650);
        }, 900);
      }, { threshold: 1 });
      // Not while the loading screen is still up.
      if (document.documentElement.classList.contains("is-preloading")) document.addEventListener("preloader:done", () => hintIo.observe(rdRoles), { once: true });
      else hintIo.observe(rdRoles);
    }
    const replace = () => placeRole(false);
    if (phone.addEventListener) phone.addEventListener("change", replace);
    window.addEventListener("resize", replace);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { replace(); requestAnimationFrame(() => rdRoles.classList.add("is-ready")); });
    else rdRoles.classList.add("is-ready");

    let saved = "anyone";
    try { saved = sessionStorage.getItem("reader") || "anyone"; } catch (e) { /* private mode */ }
    show(saved, false);
    // The reader picker: the last word of "The work, explained for …" opens
    // the list; choosing, Escape or a click elsewhere closes it.
    if (rdTrig) {
      const roleBtns = () => Array.from(rdRoles.querySelectorAll(".rd-role"));
      const openMenu = () => {
        rdRoles.hidden = false;
        rdTrig.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => rdRoles.classList.add("is-open"));
        (rdRoles.querySelector('.rd-role[aria-pressed="true"]') || roleBtns()[0]).focus();
      };
      const closeMenu = (focus) => {
        if (rdRoles.hidden) return;
        rdTrig.setAttribute("aria-expanded", "false");
        rdRoles.classList.remove("is-open");
        rdRoles.hidden = true;
        if (focus) rdTrig.focus();
      };
      rdTrig.addEventListener("click", () => (rdRoles.hidden ? openMenu() : closeMenu(false)));
      rdRoles.addEventListener("click", (e) => { if (e.target.closest(".rd-role")) closeMenu(true); });
      rdRoles.addEventListener("keydown", (e) => {
        const list = roleBtns();
        const i = list.indexOf(document.activeElement);
        if (e.key === "Escape") { e.preventDefault(); closeMenu(true); }
        else if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
        else if (e.key === "Tab") closeMenu(false);
      });
      document.addEventListener("pointerdown", (e) => { if (!e.target.closest(".rd-pick-at")) closeMenu(false); });
    }
    rdRoles.addEventListener("click", (e) => {
      const b = e.target.closest(".rd-role");
      if (b && b.getAttribute("aria-pressed") !== "true") show(b.dataset.role, true);
    });

    // Swipe the sentence sideways for the next or previous reader (touch).
    // It follows the finger a little, with growing resistance, and a quick
    // flick counts as much as a long drag.
    const step = (dir) => {
      const i = READERS.findIndex((x) => x[0] === rdRoles.querySelector('.rd-role[aria-pressed="true"]').dataset.role);
      const next = READERS[i + dir];
      if (next) show(next[0], true);
      return !!next;
    };
    let sw = null;
    const settle = () => {
      rdLines.style.transition = "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)";
      rdLines.style.transform = "";
    };
    rdLines.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" || sw) return;
      sw = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0 };
      rdLines.style.transition = "none";
    });
    rdLines.addEventListener("pointermove", (e) => {
      if (!sw || e.pointerId !== sw.id) return;
      sw.dx = e.clientX - sw.x;
      if (!reduce.matches) {
        const w = rdLines.clientWidth;
        const pull = (sw.dx * w * 0.35) / (w + 0.35 * Math.abs(sw.dx));
        rdLines.style.transform = `translateX(${pull}px)`;
      }
    });
    const endSwipe = (e) => {
      if (!sw || e.pointerId !== sw.id) return;
      const { dx } = sw;
      const v = Math.abs(dx) / Math.max(1, performance.now() - sw.t);
      const dy = Math.abs(e.clientY - sw.y);
      sw = null;
      settle();
      if (e.type === "pointerup" && Math.abs(dx) > dy * 1.5 && (Math.abs(dx) > 56 || (Math.abs(dx) > 20 && v > 0.3))) step(dx < 0 ? 1 : -1);
    };
    rdLines.addEventListener("pointerup", endSwipe);
    rdLines.addEventListener("pointercancel", endSwipe);
  }

  // 15a) About: the looping animations (the career path's pulsing ring, the
  //      music card, the book shelf) pause while their section is off
  //      screen, so they cost nothing while you read elsewhere. CSS:
  //      .is-offscreen.
  const loops = document.querySelectorAll(".ab-path, .off-music, .off-books, .ab-life");
  if (loops.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle("is-offscreen", !en.isIntersecting));
    }, { rootMargin: "100px 0px" });
    loops.forEach((el) => io.observe(el));
  }

  // 15b) About books: a random order on every visit, and "Right now"
  //      changes every two weeks. Each two-week
  //      period since 5 Jan 2026 picks a book from the shelf (stepping by 7
  //      through the list, so it jumps around and every book comes up before
  //      any repeats), and everyone sees the same one. The pick gets the
  //      "Reading" tag on the shelf.
  const shelf = document.querySelector(".bm-track");
  // The shelf is in a random order on every visit. It holds the books twice
  // (the second set loops the scroll), so both sets get the same order.
  if (shelf) {
    const all = Array.from(shelf.querySelectorAll(".bcv[data-book]"));
    const half = all.length / 2;
    const order = Array.from({ length: half }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [order[i], order[k]] = [order[k], order[i]];
    }
    const frag = document.createDocumentFragment();
    [0, 1].forEach((set) => order.forEach((i) => { if (set) all[set * half + i].classList.add("is-loop"); frag.appendChild(all[set * half + i]); }));
    shelf.appendChild(frag);
    // Books are not all one height: each gets its own size (the same in
    // both sets, so the loop stays seamless).
    const SIZES = [1, 0.92, 0.97, 0.89, 0.95];
    all.forEach((b) => b.style.setProperty("--s", String(SIZES[Number(b.dataset.book) % SIZES.length])));
  }
  const readingEl = document.querySelector("[data-reading]");
  if (shelf && readingEl) {
    const covers = Array.from(shelf.querySelectorAll(".bcv[data-book]"));
    const n = covers.length / 2;
    const period = Math.floor((Date.now() - Date.UTC(2026, 0, 5)) / (14 * 864e5));
    const pick = (((period * 7 + 3) % n) + n) % n;
    covers.forEach((cv) => {
      const on = Number(cv.dataset.book) === pick;
      cv.classList.toggle("is-reading", on);
      const tag = cv.querySelector(".bcv-tag");
      if (on && !tag) cv.insertAdjacentHTML("beforeend", '<span class="bcv-tag">Reading</span>');
      if (!on && tag) tag.remove();
    });
    const title = covers.find((cv) => Number(cv.dataset.book) === pick)?.querySelector(".bcv-t")?.textContent;
    if (title) readingEl.textContent = title + ".";
  }

  // Stickers (.hs) on headings: the heading gets .is-in the first time it
  //    is on screen, so its sticker pops on then (CSS).
  const stickerHosts = Array.from(new Set(Array.from(document.querySelectorAll(".hs")).map((el) => el.closest("h1, h2")).filter(Boolean)));
  if (stickerHosts.length && "IntersectionObserver" in window) {
    const stickIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); stickIo.unobserve(en.target); } });
    }, { threshold: 0.6 });
    stickerHosts.forEach((el) => stickIo.observe(el));
  } else stickerHosts.forEach((el) => el.classList.add("is-in"));

  // About, "On this page": shows once the opening spread has scrolled away,
  // and highlights the section you're reading (as on the case studies).
  const abSide = document.querySelector(".ab-side");
  if (abSide) {
    const hero = document.querySelector(".ab-hero");
    const links = Array.from(abSide.querySelectorAll(".cs-toc a"));
    const secs = links.map((l) => document.getElementById(l.getAttribute("href").slice(1)));
    const shell = document.getElementById("shellScroll");
    let ticking = false;
    const render = () => {
      ticking = false;
      const mark = window.innerHeight * 0.45;
      abSide.classList.toggle("is-shown", !hero || hero.getBoundingClientRect().bottom < mark);
      let active = -1;
      secs.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top < mark) active = i; });
      // Short last sections never reach the mark, so the page bottom selects the last one.
      const doc = document.documentElement;
      const atBottom = (shell && shell.scrollHeight > shell.clientHeight + 1)
        ? shell.scrollTop + shell.clientHeight >= shell.scrollHeight - 2
        : window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
      if (atBottom && active >= 0) active = secs.length - 1;
      links.forEach((l, i) => {
        const on = i === Math.max(0, active);
        l.classList.toggle("is-active", on);
        if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
      });
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
    render();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    if (shell) shell.addEventListener("scroll", request, { passive: true });
  }

  // "Life, lately" on About: an endless row that runs slowly on its own and
  // can be dragged or swiped either way; a fling carries on and eases back
  // to the slow run. The pictures are listed twice, so wrapping the position
  // by the width of one set never shows a seam. Hovering slows it, it stops
  // off screen, and with reduced motion it only moves when dragged. The left
  // and right arrow keys move it by one picture.
  const lfRow = document.querySelector(".lf-row");
  const lfTrack = lfRow && lfRow.querySelector(".lf-track");
  if (lfTrack) {
    const section = lfRow.closest(".ab-life");
    // A new order on every visit; the hidden second set follows the same
    // order, so the loop still has no seam.
    {
      const cards = Array.from(lfTrack.children);
      const half = cards.length / 2;
      const order = Array.from({ length: half }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const frag = document.createDocumentFragment();
      [0, 1].forEach((set) => order.forEach((i) => frag.appendChild(cards[set * half + i])));
      lfTrack.appendChild(frag);
    }
    // The videos in the strip play silently, each only while its card is on
    // screen (the strip moves, so they start and stop as cards pass), and
    // load only then. Reduced motion (or Calm) leaves them on their still.
    const lfVideos = Array.from(lfTrack.querySelectorAll("video[data-life-video]"));
    if (lfVideos.length && "IntersectionObserver" in window) {
      const lfSeen = new Set();
      const lfSync = (vid) => {
        if (lfSeen.has(vid) && !reduce.matches) { vid.muted = true; vid.play().catch(() => {}); }
        else if (!vid.paused) vid.pause();
      };
      const lfIo = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) lfSeen.add(en.target); else lfSeen.delete(en.target); lfSync(en.target); });
      }, { rootMargin: "0px 160px" });
      lfVideos.forEach((vid) => lfIo.observe(vid));
      if (reduce.addEventListener) reduce.addEventListener("change", () => lfVideos.forEach(lfSync));
    }
    const BASE = 0.045;         // px per ms, the slow run
    let x = 0;                  // distance moved to the left, in px
    let v = reduce.matches ? 0 : BASE; // current speed
    let setW = 0;
    let hover = false;
    let drag = null;
    let last = 0;
    const measure = () => {
      const cards = lfTrack.children;
      const half = cards[cards.length / 2];
      setW = half ? half.offsetLeft - cards[0].offsetLeft : lfTrack.scrollWidth / 2;
    };
    const wrap = () => { if (setW) x = ((x % setW) + setW) % setW; };
    const draw = () => { lfTrack.style.transform = "translate3d(" + -x + "px, 0, 0)"; };
    const frame = (now) => {
      const dt = Math.min(48, now - (last || now));
      last = now;
      if (!drag && !(section && section.classList.contains("is-offscreen"))) {
        const want = reduce.matches ? 0 : hover ? BASE * 0.35 : BASE;
        // Calm (reduced motion): no movement at all. Otherwise ease back to
        // the slow run.
        if (reduce.matches) v = 0;
        else v += (want - v) * Math.min(1, dt / 420);
        x += v * dt;
        wrap();
        draw();
      }
      requestAnimationFrame(frame);
    };
    measure();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(lfTrack);
    requestAnimationFrame(frame);
    lfRow.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
    lfRow.addEventListener("pointerleave", () => { hover = false; });

    let justDragged = false;
    lfRow.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: x, on: false, hist: [[e.clientX, e.timeStamp]] };
    });
    lfRow.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // a vertical swipe scrolls the page
        drag.on = true;
        drag.from = x + dx;
        lfRow.setPointerCapture(e.pointerId);
        lfRow.classList.add("is-dragging");
      }
      x = drag.from - dx;
      wrap();
      draw();
      drag.hist.push([e.clientX, e.timeStamp]);
      if (drag.hist.length > 5) drag.hist.shift();
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.on) return;
      lfRow.classList.remove("is-dragging");
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      const a = d.hist[0];
      const b = d.hist[d.hist.length - 1];
      const fling = b[1] > a[1] ? -(b[0] - a[0]) / (b[1] - a[1]) : 0;
      v = reduce.matches ? 0 : Math.max(-3, Math.min(3, fling)); // carries on, then eases back
      last = 0;
    };
    lfRow.addEventListener("pointerup", endDrag);
    lfRow.addEventListener("pointercancel", endDrag);
    lfRow.addEventListener("click", (e) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
    lfRow.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const card = lfTrack.children[1];
      const step = card ? card.offsetLeft - lfTrack.children[0].offsetLeft : 240;
      x += e.key === "ArrowRight" ? step : -step;
      wrap();
      draw();
    });
  }

  // Names you can hear: "Pallav" in the About title and "Pallav Bhatnagar"
  // above the Home title. Clicking one plays its recording (data-say), from
  // the start each time. It loads when the pointer comes near or the name
  // gets focus, so it's ready by the click. It plays even with "Quiet
  // sounds" on, since it only ever plays when someone asks for it.
  document.querySelectorAll("button.say[data-say]").forEach((sayBtn) => {
    let say = null;
    const ready = () => {
      if (!say) { say = new Audio(sayBtn.dataset.say); say.preload = "auto"; }
      return say;
    };
    sayBtn.addEventListener("pointerenter", ready, { once: true });
    sayBtn.addEventListener("focus", ready, { once: true });
    sayBtn.addEventListener("click", () => {
      const a = ready();
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    });
  });

  // 15) About hero, "the table": the snapshots drop onto the table one
  //     after another once the page shows (after the loader). CSS does the
  //     motion; reduced motion shows them already in place.
  const table = document.querySelector(".ab-table");
  if (table) {
    const drop = () => requestAnimationFrame(() => requestAnimationFrame(() => table.classList.add("is-in")));
    if (document.documentElement.classList.contains("is-preloading")) document.addEventListener("preloader:leaving", drop, { once: true });
    else drop();

    // Tablets and phones: the snapshots run as an endless strip that drifts
    // on its own and can be pulled along by hand (it keeps the flick's
    // speed, then eases back to the drift). A copy of the set follows the
    // set, so the loop never shows a seam. Pauses off screen and while the
    // tab is hidden; reduced motion: no drift, still draggable.
    const pile = table.querySelector(".ab-pile");
    const narrow = window.matchMedia("(max-width: 1023px)");
    if (pile) {
      // A new arrangement on every visit: the snapshots swap places at
      // random (the spots stay clear of the words), each a little off its
      // spot and turned its own way; the strip on phones gets the new order.
      const snaps = Array.from(pile.querySelectorAll(".ab-snap"));
      for (let i = snaps.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [snaps[i], snaps[j]] = [snaps[j], snaps[i]]; }
      // Real photos always make the table: a photo that lands among the
      // spares (see below) swaps with a drawn card that's on the table.
      const SHOWN = 8;
      const isPhoto = (el) => !!el.querySelector(".ab-snap-pic img");
      for (let i = SHOWN; i < snaps.length; i++) {
        if (!isPhoto(snaps[i])) continue;
        const drawn = snaps.slice(0, SHOWN).map((el, k) => (isPhoto(el) ? -1 : k)).filter((k) => k >= 0);
        if (!drawn.length) break;
        const j = drawn[Math.floor(Math.random() * drawn.length)];
        [snaps[i], snaps[j]] = [snaps[j], snaps[i]];
      }
      const jitter = (n) => (Math.random() * 2 - 1) * n;
      snaps.forEach((el, i) => {
        el.dataset.jy = jitter(1).toFixed(3);
        el.style.setProperty("--r", ((i % 2 ? 1 : -1) * (3 + Math.random() * 6)).toFixed(1));
        el.style.setProperty("--i", String(i));
        // Eight fit around the words on the table; any more show only in
        // the strip on phones.
        el.classList.toggle("is-spare", i >= SHOWN);
        pile.append(el);
      });
      // On the table (tablets and desktops) the snapshots hug the words: two
      // staggered columns on each side, sized to the room there, a small gap
      // from the text, a little vertical jitter. Recomputed on resize.
      const copyEl = table.querySelector(".ab-table-copy");
      const hug = () => {
        if (narrow.matches || !copyEl) return;
        const pr = pile.getBoundingClientRect();
        const cr = copyEl.getBoundingClientRect();
        const H = pr.height;
        const side = cr.left - pr.left;
        const gap = 28;
        const w = Math.max(70, Math.min(148, (side - gap) / 1.94));
        const h = w * 1.24;
        pile.style.setProperty("--w", `${w}px`);
        const innerL = cr.left - pr.left - gap - w;
        const innerR = cr.right - pr.left + gap;
        const step = w * 0.94;
        // [x, y as a share of the free height] for the 8 spots.
        const free = Math.max(0, H - h);
        const spotsXY = [
          [innerL - step, 0.02], [innerL, 0.3], [innerL - step, 0.62], [innerL, 0.94],
          [innerR + step, 0.04], [innerR, 0.32], [innerR + step, 0.64], [innerR, 0.94],
        ];
        Array.from(pile.querySelectorAll(".ab-snap:not(.is-copy):not(.is-spare)")).forEach((el, i) => {
          const [x, f] = spotsXY[i % spotsXY.length];
          const y = Math.max(0, Math.min(free, free * f + Number(el.dataset.jy || 0) * h * 0.12));
          el.style.left = `${Math.round(Math.max(w * 0.12, Math.min(pr.width - w * 1.12, x)))}px`;
          el.style.top = `${Math.round(y)}px`;
        });
      };
      // Touch screens on the spread (iPad landscape): a tap straightens a
      // snapshot, brings it to the top and opens its line, as hovering does
      // with a mouse; tapping it again, or anywhere else, closes it.
      let tapAt = null;
      pile.addEventListener("pointerdown", (e) => {
        tapAt = e.pointerType === "mouse" || narrow.matches ? null : [e.clientX, e.clientY];
      });
      pile.addEventListener("pointerup", (e) => {
        if (!tapAt || narrow.matches) return;
        const moved = Math.hypot(e.clientX - tapAt[0], e.clientY - tapAt[1]) > 10;
        tapAt = null;
        const el = e.target.closest(".ab-snap");
        if (moved || !el) return;
        const wasOpen = el.classList.contains("is-open");
        pile.querySelectorAll(".ab-snap.is-open").forEach((x) => x.classList.remove("is-open"));
        if (!wasOpen) el.classList.add("is-open");
      });
      document.addEventListener("pointerdown", (e) => {
        if (narrow.matches || e.pointerType === "mouse" || e.target.closest(".ab-pile .ab-snap")) return;
        pile.querySelectorAll(".ab-snap.is-open").forEach((x) => x.classList.remove("is-open"));
      });
      const track = document.createElement("div");
      track.className = "ab-track";
      Array.from(pile.children).forEach((el) => track.append(el));
      Array.from(track.children).forEach((el) => {
        const copy = el.cloneNode(true);
        copy.classList.add("is-copy");
        copy.setAttribute("aria-hidden", "true");
        track.append(copy);
      });
      pile.append(track);
      const DRIFT = 0.03; // px per ms
      let pos = 0, vel = -DRIFT, last = 0, raf = 0, setW = 0, drag = null, inView = true, held = false;
      // A tap on a snapshot straightens it and opens its line, and the strip
      // stops; a second tap closes it and the strip runs on.
      const closeOpen = () => { track.querySelectorAll(".ab-snap.is-open").forEach((x) => x.classList.remove("is-open")); held = false; };
      const tapSnap = (el) => {
        if (!el || el.classList.contains("is-open")) { closeOpen(); return; }
        closeOpen();
        el.classList.add("is-open");
        held = true;
      };
      const measure = () => { setW = track.scrollWidth / 2; };
      const wrap = () => { if (setW) { pos %= setW; if (pos > 0) pos -= setW; } };
      const frame = (now) => {
        const dt = Math.min(48, now - (last || now));
        last = now;
        if (!drag) {
          const target = reduce.matches || held ? 0 : -DRIFT;
          if (reduce.matches) vel = 0; // Calm: no movement at all
          else vel += (target - vel) * Math.min(1, dt / 600);
          pos += vel * dt;
          wrap();
          track.style.transform = `translate3d(${pos}px, 0, 0)`;
        }
        raf = requestAnimationFrame(frame);
      };
      const run = () => { if (!raf && narrow.matches && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
      const halt = () => { cancelAnimationFrame(raf); raf = 0; };
      const reset = () => { halt(); closeOpen(); track.style.transform = ""; pos = 0; if (narrow.matches) { measure(); run(); } };
      track.addEventListener("pointerdown", (e) => {
        if (!narrow.matches || drag) return;
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, p: pos, t: performance.now(), lx: e.clientX, on: false };
      });
      track.addEventListener("pointermove", (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        if (!drag.on) {
          if (Math.abs(e.clientY - drag.y) > Math.abs(dx)) { drag = null; return; }
          if (Math.abs(dx) < 6) return;
          drag.on = true;
          closeOpen();
          track.setPointerCapture(e.pointerId);
        }
        const now = performance.now();
        vel = (e.clientX - drag.lx) / Math.max(1, now - drag.t);
        drag.t = now; drag.lx = e.clientX;
        pos = drag.p + dx;
        wrap();
        if (pos !== drag.p + dx) drag.p = pos - dx;
        track.style.transform = `translate3d(${pos}px, 0, 0)`;
      });
      const end = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const tapped = !drag.on && e.type === "pointerup";
        drag = null;
        if (tapped) { vel = 0; tapSnap(e.target.closest(".ab-snap")); }
        else if (!held) vel = vel || -DRIFT;
      };
      track.addEventListener("pointerup", end);
      track.addEventListener("pointercancel", end);
      document.addEventListener("visibilitychange", () => (document.hidden ? halt() : run()));
      if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; inView ? run() : halt(); }).observe(pile);
      narrow.addEventListener("change", () => { reset(); if (!narrow.matches) hug(); else pile.querySelectorAll(".ab-snap").forEach((el) => { el.style.left = ""; el.style.top = ""; }); });
      window.addEventListener("resize", () => { if (narrow.matches) measure(); else hug(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); hug(); });
      reset();
      hug();
    }
  }

  // 15b) About "Where I've been" on phones: the jobs are cards you swipe
  //      sideways; the dots under them show which one is in view and jump
  //      to a card when tapped.
  const pathGrid = document.querySelector(".path-grid");
  if (pathGrid) {
    const jobs = Array.from(pathGrid.children);
    const dots = document.createElement("div");
    dots.className = "path-dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = jobs.map(() => "<i></i>").join("");
    pathGrid.after(dots);
    const marks = Array.from(dots.children);
    marks.forEach((m, i) => m.addEventListener("click", () => pathGrid.scrollTo({ left: jobs[i].offsetLeft - pathGrid.offsetLeft - parseFloat(getComputedStyle(pathGrid).paddingLeft), behavior: reduce.matches ? "auto" : "smooth" })));
    const mark = () => {
      const mid = pathGrid.scrollLeft + pathGrid.clientWidth / 2;
      let best = 0, bestD = Infinity;
      jobs.forEach((j, i) => { const d = Math.abs(j.offsetLeft - pathGrid.offsetLeft + j.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
      marks.forEach((m, i) => m.classList.toggle("is-on", i === best));
    };
    pathGrid.addEventListener("scroll", mark, { passive: true });
    // Keyboard: while the row scrolls sideways (phones) it takes focus, so
    // the arrow keys can move it; where it doesn't scroll, no extra stop.
    const reach = () => {
      if (pathGrid.scrollWidth > pathGrid.clientWidth + 1) {
        pathGrid.tabIndex = 0;
        pathGrid.setAttribute("aria-label", "Where I've been: swipe, or use the arrow keys to move through the jobs");
      } else {
        pathGrid.removeAttribute("tabindex");
        pathGrid.removeAttribute("aria-label");
      }
    };
    window.addEventListener("resize", () => { mark(); reach(); });
    mark();
    reach();
  }

  // 17) About story: a reading highlight that moves line by line. Words are
  //     grouped into their rendered lines; a reading line sits 60% down the
  //     screen and each line darkens as it passes it (a little left to right
  //     within the line), so the whole text lights up one line at a time.
  //     Runs only while the story is on screen; skipped for reduced motion.
  const storyPs = Array.from(document.querySelectorAll(".ab-story-body p"));
  if (storyPs.length && !reduce.matches) {
    const paras = storyPs.map((p) => {
      const words = p.textContent.trim().split(/\s+/);
      p.textContent = "";
      const spans = words.map((w, i) => {
        const el = document.createElement("span");
        el.className = "w";
        el.textContent = w;
        el.style.setProperty("--k", "0");
        p.appendChild(el);
        if (i < words.length - 1) p.appendChild(document.createTextNode(" "));
        return el;
      });
      return { p, spans, lines: [], lh: 24 };
    });
    const layout = () => {
      paras.forEach((g) => {
        g.lh = parseFloat(getComputedStyle(g.p).lineHeight) || 24;
        const byTop = new Map();
        g.spans.forEach((el) => {
          const key = Math.round(el.offsetTop / 4);
          if (!byTop.has(key)) byTop.set(key, []);
          byTop.get(key).push(el);
        });
        g.lines = Array.from(byTop.values()).map((els) => ({ els, last: -1 }));
      });
    };
    let ticking2 = false;
    let live = true;
    const paint = () => {
      ticking2 = false;
      if (!live) return;
      const readY = window.innerHeight * 0.6;
      paras.forEach((g) => {
        g.lines.forEach((line) => {
          const top = line.els[0].getBoundingClientRect().top;
          const k = Math.min(1, Math.max(0, (readY - top) / g.lh));
          if (Math.abs(k - line.last) < 0.01) return;
          line.last = k;
          const m = line.els.length;
          line.els.forEach((el, j) => {
            const kw = Math.min(1, Math.max(0, k * 1.7 - (j / m) * 0.7));
            el.style.setProperty("--k", kw.toFixed(2));
          });
        });
      });
    };
    const request2 = () => { if (!ticking2) { ticking2 = true; requestAnimationFrame(paint); } };
    const relayout = () => { layout(); paras.forEach((g) => g.lines.forEach((l) => { l.last = -1; })); request2(); };
    window.addEventListener("scroll", request2, { passive: true });
    window.addEventListener("resize", relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    const storySec = document.querySelector(".ab-story");
    if (storySec && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { live = entry.isIntersecting; if (live) request2(); }, { rootMargin: "20% 0px" }).observe(storySec);
    }
    layout();
    paint();
  }

  // 18) About, music: the sound video. Like the Home testimonial video, it
  //     plays silently on a loop while on screen (never on its own for
  //     reduced motion), with play / pause and sound buttons in the corner.
  //     Turning the sound on the first time starts it from the beginning;
  //     clicking the silent video turns the sound on too. Without the file,
  //     a placeholder shows instead.
  const omVid = document.querySelector(".om-vid");
  if (omVid) {
    const box = omVid.closest(".om-video");
    const playBtn = box.querySelector(".tplay");
    const muteBtn = box.querySelector(".tmute");
    const src = omVid.querySelector("source");
    (src || omVid).addEventListener("error", () => box.classList.add("is-empty"));
    let seen = false, userPaused = false, heard = false;
    const start = () => {
      if (!seen || userPaused || reduce.matches) return;
      if (omVid.preload === "none") { omVid.preload = "auto"; omVid.load(); }
      omVid.play().catch(() => {});
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { seen = en.isIntersecting; seen ? start() : omVid.pause(); }, { threshold: 0.5 }).observe(omVid);
    }
    const syncMute = () => {
      muteBtn.setAttribute("aria-pressed", String(omVid.muted));
      muteBtn.setAttribute("aria-label", omVid.muted ? "Unmute" : "Mute");
    };
    const soundOn = () => {
      omVid.muted = false;
      if (!heard) { heard = true; omVid.currentTime = 0; }
      if (omVid.paused) { userPaused = false; if (omVid.preload === "none") { omVid.preload = "auto"; omVid.load(); } omVid.play().catch(() => {}); }
    };
    muteBtn.addEventListener("click", () => { if (omVid.muted) soundOn(); else omVid.muted = true; });
    omVid.addEventListener("click", () => { if (omVid.muted) soundOn(); });
    omVid.addEventListener("volumechange", syncMute);
    syncMute();
    const syncPlay = () => {
      const playing = !omVid.paused && !omVid.ended;
      box.classList.toggle("is-playing", playing);
      playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
    };
    playBtn.addEventListener("click", () => {
      // While it plays silently, the first press means "let me hear it".
      if (omVid.muted && !heard) { soundOn(); return; }
      userPaused = !omVid.paused;
      if (omVid.paused) { if (omVid.preload === "none") { omVid.preload = "auto"; omVid.load(); } omVid.play().catch(() => {}); } else omVid.pause();
    });
    omVid.addEventListener("play", syncPlay);
    omVid.addEventListener("pause", syncPlay);
    syncPlay();

    // More than one video (.om-list): the arrows, a sideways swipe on the
    // video, or the arrow keys move to the next or previous one, wrapping
    // round. The arrows sit in the controls (previous, play, next, sound).
    // The new one picks up where the card was: playing (silently, or with
    // sound if it was on) or paused. The caption ("1 / 3", title) follows.
    const items = Array.from(box.querySelectorAll(".om-list li"));
    if (items.length > 1) {
      const screen = box.querySelector(".om-screen");
      const tag = box.querySelector(".om-vid-tag");
      const prev = box.querySelector(".om-prev");
      const next = box.querySelector(".om-next");
      box.classList.add("has-list");
      prev.hidden = false; next.hidden = false;
      let at = 0;
      // The caption: "2 / 3" above the title and credit.
      const showTag = () => { tag.innerHTML = `<span class="om-count">${at + 1} / ${items.length}</span>` + items[at].innerHTML; };
      showTag();
      const go = (step) => {
        at = (at + step + items.length) % items.length;
        const it = items[at];
        const wasPlaying = !omVid.paused;
        box.classList.remove("is-empty");
        omVid.poster = it.dataset.poster || "";
        omVid.setAttribute("aria-label", it.dataset.label || "");
        if (src) src.src = it.dataset.src; else omVid.src = it.dataset.src;
        omVid.preload = "auto";
        omVid.load();
        showTag();
        if (wasPlaying || (!omVid.muted && !userPaused)) omVid.play().catch(() => {});
        syncPlay();
      };
      prev.addEventListener("click", () => go(-1));
      next.addEventListener("click", () => go(1));
      screen.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      });
      // Swipe: a mostly sideways drag of 40px or more on a touch screen.
      let sx = 0, sy = 0, tracking = false, swiped = false;
      screen.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" || e.target.closest("button")) return;
        tracking = true; swiped = false; sx = e.clientX; sy = e.clientY;
      });
      screen.addEventListener("pointerup", (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; go(dx < 0 ? 1 : -1); }
      });
      // The tap that ends a swipe is not a "turn the sound on" tap.
      omVid.addEventListener("click", (e) => { if (swiped) { swiped = false; e.stopImmediatePropagation(); } }, true);
      screen.addEventListener("pointercancel", () => { tracking = false; });
    }
  }

  // 20) Works page.
  //     a) Filter: a segmented control (All / Case studies / Explorations).
  //        The dark thumb slides to the chosen option. Cards that no longer
  //        match fade out, the cards that stay glide to their new places
  //        (FLIP: measure, change, then animate from the old spot), and newly
  //        shown cards rise in. A second click mid-animation takes over.
  //     b) Reveal: each card reveals once as it scrolls into view (CSS does
  //        the motion; this only adds .is-shown).
  const wkList = document.querySelector(".wk-list");
  const wkItems = wkList ? Array.from(wkList.querySelectorAll(".wk-item")) : [];
  if (wkList && wkItems.length) {
    const filterEl = document.querySelector(".wk-filter");
    const segs = filterEl ? Array.from(filterEl.querySelectorAll(".wk-seg")) : [];
    const thumb = filterEl ? filterEl.querySelector(".wk-filter-thumb") : null;
    const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
    const EASE_IO = "cubic-bezier(0.77, 0, 0.175, 1)";

    // Counts next to each option.
    if (filterEl) {
      filterEl.querySelectorAll("[data-count]").forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(key === "all" ? wkItems.length : wkItems.filter((it) => it.dataset.cat === key).length);
      });
    }

    // The chosen filter lives in the address (/works?filter=case), so going
    // back to Works from a case study, a refresh or a shared link shows the
    // same view. Restored here before anything is drawn, with no animation.
    const startKey = new URLSearchParams(location.search).get("filter");
    const startSeg = segs.find((b) => b.dataset.filter === startKey);
    if (startSeg && startKey !== "all") {
      segs.forEach((b) => b.setAttribute("aria-pressed", String(b === startSeg)));
      wkItems.forEach((it) => { it.hidden = it.dataset.cat !== startKey; });
    }

    const placeThumb = () => {
      const on = segs.find((b) => b.getAttribute("aria-pressed") === "true");
      if (!on || !thumb) return;
      thumb.style.width = `${on.offsetWidth}px`;
      thumb.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    if (filterEl && thumb) {
      placeThumb();
      requestAnimationFrame(() => filterEl.classList.add("is-ready"));
      window.addEventListener("resize", placeThumb);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);
    }

    let filterRun = 0;
    const applyFilter = async (key) => {
      const run = ++filterRun;
      const matches = (it) => key === "all" || it.dataset.cat === key;
      wkItems.forEach((it) => it.getAnimations().forEach((an) => an.cancel()));
      const leaving = wkItems.filter((it) => !it.hidden && !matches(it));
      const staying = wkItems.filter((it) => !it.hidden && matches(it));
      const entering = wkItems.filter((it) => it.hidden && matches(it));

      if (reduce.matches || typeof Element.prototype.animate !== "function") {
        wkItems.forEach((it) => { it.hidden = !matches(it); });
        return;
      }
      if (leaving.length) {
        const fades = Promise.all(leaving.map((it) => it.animate(
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }],
          { duration: 200, easing: EASE_OUT, fill: "forwards" }
        ).finished.catch(() => {})));
        // Never wait longer than the fade itself, even if an animation stalls.
        await Promise.race([fades, new Promise((r) => setTimeout(r, 260))]);
        if (run !== filterRun) return;
      }
      const before = new Map(staying.map((it) => [it, it.getBoundingClientRect().top]));
      leaving.forEach((it) => { it.hidden = true; it.getAnimations().forEach((an) => an.cancel()); });
      entering.forEach((it) => { it.hidden = false; });
      staying.forEach((it) => {
        const dy = before.get(it) - it.getBoundingClientRect().top;
        if (Math.abs(dy) > 1) {
          it.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 450, easing: EASE_IO });
        }
      });
      entering.forEach((it, k) => {
        it.animate(
          [{ opacity: 0, transform: "translateY(0.875rem)" }, { opacity: 1, transform: "none" }],
          { duration: 450, delay: 120 + k * 60, easing: EASE_OUT, fill: "backwards" }
        );
      });
    };

    segs.forEach((seg) => {
      seg.addEventListener("click", () => {
        if (seg.getAttribute("aria-pressed") === "true") return;
        segs.forEach((b) => b.setAttribute("aria-pressed", String(b === seg)));
        placeThumb();
        applyFilter(seg.dataset.filter);
        const key = seg.dataset.filter;
        try { history.replaceState(history.state, "", key === "all" ? location.pathname + location.hash : `?filter=${encodeURIComponent(key)}${location.hash}`); } catch (e) { /* file:// or sandboxed */ }
      });
    });

    // b) Reveal once on entering the view.
    if ("IntersectionObserver" in window && !reduce.matches) {
      const revealIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-shown");
            revealIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      wkItems.forEach((it) => revealIo.observe(it));
    } else {
      wkItems.forEach((it) => it.classList.add("is-shown"));
    }
  }

  // 21) Chat answers for the "Talk to my Work" panel (block 23): scripted
  //     topics, each a short reply plus an optional rich card (projects,
  //     work history, contact, music, books). A case study answers its own
  //     questions first (window.pageAnswer in case.js). Swap match() for a
  //     live model later and the panel keeps working unchanged.
  // Project cards come from js/projects.js (the Home page's featured
  // projects, in the same order), and the contact email from js/content.js.
  const SITE_EMAIL = (window.SITE && window.SITE.email) || "bhatnagarpallav@outlook.com";
  const PROJECTS = (window.CASE_STUDIES || [])
    .filter((p) => p.home)
    .sort((a, b) => (a.home.order || 0) - (b.home.order || 0))
    .map((p) => {
      // The card's first metric.
      const [label, value] = (p.home.metrics && p.home.metrics[0]) || ["", ""];
      return {
        id: p.slug, name: p.name, tint: p.tint,
        desc: p.home.text,
        metric: value,
        metricLabel: label
      };
    });
  const EXTRA_KEYWORDS = {
    wealthbasket: ["paytm", "paytm money", "investing", "portfolio", "sip", "stocks"],
    wayfarer: ["telehealth", "clinic"],
    parcelo: ["logistics", "dispatch"],
    lumen: ["edtech", "course", "e-learning"]
  };
  // Work history, newest first. Keep it in step with "Where I've been" on
  // the About page.
  const EXPERIENCE = [
    { co: "Resilinc", role: "Senior UX designer", years: "2023 – now", tint: "mint" },
    { co: "Wave", role: "Product designer", years: "2020 – 2023", tint: "lilac" },
    { co: "Pixelcraft", role: "UI designer", years: "2018 – 2020", tint: "rose" },
    { co: "Studio Nine", role: "Design intern", years: "2017", tint: "sky" }
  ];

  const projectCardHtml = (p, solo) => `<a class="ag-card${solo ? " ag-card-one" : ""}" href="/works/${p.id}" style="--tint: var(--${p.tint}-bg); --tint-ink: var(--${p.tint}-ink)">`
    + `<div class="ag-card-top"><b>${p.name}</b></div>`
    + `<p>${p.desc}</p>`
    + `<span class="ag-card-metric"><b>${p.metric}</b>${p.metricLabel}</span></a>`;
  const renderProjectsGrid = () => `<div class="ag-cards">${PROJECTS.map((p) => projectCardHtml(p, false)).join("")}</div>`;
  const renderProjectCard = (id) => {
    const p = PROJECTS.find((x) => x.id === id);
    return p ? `<div class="ag-cards">${projectCardHtml(p, true)}</div>` : "";
  };
  const renderExperience = () => `<div class="ag-xp">${EXPERIENCE.map((e) => `<div class="ag-xp-row"><span class="ag-xp-dot" style="background:var(--${e.tint}-ink)"></span><b>${e.co}</b><span>${e.role}</span><em>${e.years}</em></div>`).join("")}</div>`;
  const renderContactCard = () => `<div class="ag-info"><span><b><a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a></b><span>Usually replies within two days</span></span></div>`;
  const renderBooksCard = () => '<div class="ag-info"><span><b>The Design of Everyday Things</b><span>Currently reading — also into Saga, Watchmen and Sandman</span></span></div>';
  const renderMusicCard = () => {
    const params = new URLSearchParams({
      url: "https://api.soundcloud.com/playlists/1589234278", auto_play: "false", hide_related: "true",
      show_comments: "false", show_user: "false", show_reposts: "false", show_playcount: "false", visual: "true", color: "#b6e37b",
    });
    return `<iframe class="ag-embed" src="https://w.soundcloud.com/player/?${params.toString()}" title="Sketches and scores on SoundCloud" width="100%" height="166" style="border:0;border-radius:0.4375rem;display:block" allow="autoplay"></iframe>`;
  };

  const topics = [
    { k: ["shipped", "projects", "portfolio", "what have you built", "case stud", "worked on"],
      text: "Four recent ones — tap a card to open the full case study.", render: renderProjectsGrid },
    // One answer per featured project, from js/projects.js. Extra words
    // people might use for a project go in EXTRA_KEYWORDS.
    ...PROJECTS.map((p) => ({
      k: [p.id, p.name.toLowerCase(), ...(EXTRA_KEYWORDS[p.id] || [])],
      text: `${p.name}: ${p.desc}`,
      render: () => renderProjectCard(p.id)
    })),
    { k: ["how do you work", "process", "approach", "sketch", "method"],
      text: 'He sketches on paper before opening Figma, says "I don’t know yet" out loud rather than guessing, and keeps a running list of small interface details worth stealing from. Short version: research first, prototype fast, measure what shipped.' },
    { k: ["worked", "experience", "companies", "career", "history", "resume", "cv"],
      text: "Eight years across four teams, from a design internship to senior UX:", render: renderExperience },
    { k: ["freelance", "hire", "available", "open to work", "full-time", "contract"],
      text: "Open to full-time roles and selected freelance projects — he usually replies within two days.", render: renderContactCard },
    { k: ["contact", "email", "reach", "get in touch", "talk to"],
      text: "Here's the best way in:", render: renderContactCard },
    { k: ["music", "soundcloud", "compose", "song", "track", "film score"],
      text: "Away from the desk he composes for films as a hobby, and experiments with sound: synths, strings and found noises.", render: renderMusicCard },
    { k: ["book", "reading", "comic"],
      text: "Currently reading The Design of Everyday Things, and a regular comics reader.", render: renderBooksCard },
    { k: ["outside work", "hobby", "hobbies", "free time", "off the clock"],
      text: "Film scores, comics and books, mostly:", render: () => renderMusicCard() + renderBooksCard() },
    // Greetings and "who are you" last, so a specific topic wins ("tell me
    // about your music" is about music, not about you).
    { k: ["hello", "hi there", " hi ", "hey", "who are you", "about you", "who is pallav", "yourself"],
      text: "I'm a scripted guide to Pallav's portfolio, not Pallav himself. He's a UX builder with eight years of shipping research-led products, from early-stage startups to platforms used by millions. Ask about a project, how he works, or how to reach him." },
  ];
  const fallback = { text: "I don't have a scripted answer for that one yet. Try a question about a project, how Pallav works, or reach him directly:", render: renderContactCard };

  const match = (text) => {
    const q = ` ${text.toLowerCase()} `;
    return topics.find((topic) => topic.k.some((k) => q.includes(k))) || fallback;
  };

  // 23) Ask AI panel ("Talk to my Work"): a side panel on Home, About and
  //     the case studies, answering from the topics above. Opening it on a
  //     desktop also pulls the whole page back
  //     into a rounded card and slides it left (a class on <body>, picked
  //     up by .site-shell in CSS), so the panel reads as part of the same
  //     surface rather than a dialog stacked on top of it.
  //     Any button with data-ask-trigger also opens it (the case study page has
  //     two); with data-ask="…" it asks that question as the panel opens, if
  //     the conversation is still empty. A page can answer its own questions
  //     first by setting window.pageAnswer(question) (the case study does).
  const askTriggers = Array.from(document.querySelectorAll("#askAiTrigger, [data-ask-trigger]"));
  let askTrigger = askTriggers[0] || null;
  const askPanel = document.getElementById("askPanel");
  if (askTrigger && askPanel) {
    const askClose = document.getElementById("askPanelClose");
    const askThread = document.getElementById("askPanelThread");
    const askSuggest = document.getElementById("askPanelSuggest");
    const askForm = document.getElementById("askPanelForm");
    const askInput = document.getElementById("askPanelInput");
    const askSend = askForm.querySelector(".ask-panel-send");
    const askScroll = document.getElementById("askPanelScroll");
    const scrollAsk = () => { if (askScroll) askScroll.scrollTop = askScroll.scrollHeight; };

    const addAskMessage = (role, content) => {
      const turn = document.createElement("div");
      turn.className = `ag-turn from-${role}`;
      if (role === "agent") {
        const who = document.createElement("span");
        who.className = "ag-who";
        who.textContent = "Guide";
        turn.appendChild(who);
        const body = document.createElement("div");
        body.className = "ag-content";
        const text = typeof content === "string" ? content : content.text;
        const extra = typeof content === "object" && content.render ? content.render() : "";
        body.innerHTML = `<p>${text}</p>${extra}`;
        turn.appendChild(body);
        streamReply(body);
      } else {
        const bubble = document.createElement("div");
        bubble.className = "ag-bubble";
        bubble.textContent = content;
        turn.appendChild(bubble);
      }
      askThread.appendChild(turn);
      scrollAsk();
      return turn;
    };
    // Thinking: the AI spark (its own copy of the Bloom gradient, as in 0)
    // beside a short line that fits the question (CSS .ag-think-*).
    const THINK_LINES = [ // first match wins, so the specific questions come first
      [/worked|experience|career|years?|job|role|compan|resume|cv|where have you/i, "Checking the timeline"],
      [/how do you|process|approach|research|workflow|method/i, "Walking through the process"],
      [/contact|email|hire|available|reach|call|rate|salary/i, "Finding the best way to reach me"],
      [/music|film|book|comic|hobby|travel|life|outside/i, "Looking outside the brief"],
      [/case stud|project|work|portfolio|ship|built|wave|wealth|parcelo|wayfarer|lumen|jda/i, "Opening the case studies"],
    ];
    let thinkN = 0;
    const thinkSpark = () => {
      const id = `ag-think-grad-${thinkN++}`;
      return `<svg class="ag-think-spark" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient class="ai-spark" id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3965fa"/><stop offset="0.4" stop-color="#8a62e0"/><stop offset="0.7" stop-color="#c454c4"/><stop offset="1" stop-color="#f2369a"/></linearGradient></defs><path fill="url(#${id})" d="M12 1.6c.7 0 1.2.5 1.4 1.2 1.1 4.4 3.6 6.9 8 8 .7.2 1.2.7 1.2 1.2s-.5 1-1.2 1.2c-4.4 1.1-6.9 3.6-8 8-.2.7-.7 1.2-1.4 1.2s-1.2-.5-1.4-1.2c-1.1-4.4-3.6-6.9-8-8C1.9 13 1.4 12.5 1.4 12s.5-1 1.2-1.2c4.4-1.1 6.9-3.6 8-8 .2-.7.7-1.2 1.4-1.2z"/></svg>`;
    };
    // Answering: the reply's words arrive one after another (about 0.6s in
    // all, never slower than 28ms a word), then any cards follow. Only text
    // is split, so links keep working. Reduced motion (or Calm): at once.
    function streamReply(body) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const p = body.querySelector("p");
      if (!p) return;
      const texts = [];
      const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) texts.push(walk.currentNode);
      const count = texts.reduce((s, t) => s + (t.textContent.match(/\S+/g) || []).length, 0);
      const step = Math.min(28, 600 / Math.max(1, count));
      let i = 0;
      texts.forEach((t) => {
        const frag = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.className = "ag-w";
          w.style.animationDelay = `${Math.round(i++ * step)}ms`;
          w.textContent = part;
          frag.appendChild(w);
        });
        t.replaceWith(frag);
      });
      Array.from(body.children).filter((el) => el !== p).forEach((el, k) => {
        el.classList.add("ag-after");
        el.style.animationDelay = `${Math.round(i * step + 60 + k * 60)}ms`;
      });
    }
    const addAskTyping = (question) => {
      const turn = document.createElement("div");
      turn.className = "ag-turn from-agent ag-typing";
      const line = (THINK_LINES.find(([re]) => re.test(question || "")) || [null, "Thinking"])[1];
      turn.innerHTML = `<span class="ag-who">Guide</span><div class="ag-content" aria-hidden="true">${thinkSpark()}<span class="ag-think-label">${line}</span></div>`;
      askThread.appendChild(turn);
      scrollAsk();
      return turn;
    };

    // The AI glow (CSS .ask-glow): a soft halo of colour glows around the
    // chat box while the chat opens and while an answer is being written,
    // then fades. It stays at least a moment, so a quick answer still reads
    // as a glow, not a flicker.
    const askGlow = document.createElement("div");
    askGlow.className = "ask-glow";
    askGlow.setAttribute("aria-hidden", "true");
    askGlow.innerHTML = "<i></i>";
    askForm.prepend(askGlow);
    let glowTimer = 0, glowSince = 0;
    const glowOn = () => {
      clearTimeout(glowTimer);
      if (!askGlow.classList.contains("is-on")) glowSince = performance.now();
      askGlow.classList.add("is-on");
    };
    const glowOff = (atLeast) => {
      clearTimeout(glowTimer);
      const wait = Math.max(0, (atLeast || 0) - (performance.now() - glowSince));
      glowTimer = setTimeout(() => askGlow.classList.remove("is-on"), wait);
    };

    let askBusy = false;
    const askAsk = (text) => {
      const clean = text.trim();
      if (!clean || askBusy) return;
      askBusy = true;
      askSend.disabled = true;
      addAskMessage("user", clean);
      askInput.value = "";
      const typing = addAskTyping(clean);
      glowOn();
      const delay = reduce.matches ? 100 : 500 + Math.random() * 400;
      setTimeout(() => {
        typing.remove();
        const reply = (typeof window.pageAnswer === "function" && window.pageAnswer(clean)) || match(clean);
        addAskMessage("agent", reply);
        glowOff(1100);
        askSend.disabled = false;
        askBusy = false;
        askInput.focus();
      }, delay);
    };

    const autosizeAsk = () => {
      askInput.style.height = "auto";
      askInput.style.height = `${askInput.scrollHeight}px`;
      askSend.disabled = !askInput.value.trim();
    };
    askInput.addEventListener("input", autosizeAsk);
    askInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        // requestSubmit arrived in Safari 16; older Safari gets the same submit event.
        if (askForm.requestSubmit) askForm.requestSubmit();
        else askForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
    askForm.addEventListener("submit", (e) => { e.preventDefault(); askAsk(askInput.value); autosizeAsk(); });
    if (askSuggest) {
      askSuggest.addEventListener("click", (e) => {
        const chip = e.target.closest(".wk-chip");
        if (chip) askAsk(chip.dataset.q || chip.textContent);
      });
    }

    let askOpen = false;
    askPanel.inert = true;
    // Side by side, opening or closing moves the page into (or out of) its
    // own scroller and narrows or widens it, which would jump it to the top.
    // This keeps the pressed button at the same height on screen while the
    // panel slides. Call it before the change, then call what it returns.
    const holdInPlace = (el) => {
      if (!el || !el.isConnected) return () => {};
      const top = el.getBoundingClientRect().top;
      return () => {
        const until = performance.now() + 650;
        const step = () => {
          const scroller = inShellScroll() ? shellScroll : document.scrollingElement;
          const delta = el.getBoundingClientRect().top - top;
          if (Math.abs(delta) > 0.5) {
            scroller.style.scrollBehavior = "auto";
            scroller.scrollTop += delta;
            scroller.style.scrollBehavior = "";
          }
          if (performance.now() < until) requestAnimationFrame(step);
        };
        step();
      };
    };
    // Tablets and phones: the chat covers the page (a drawer, or full
    // screen), so the page behind is pinned where it is: <body> is fixed at
    // the current scroll offset and put back exactly on close. This is the
    // dependable way to stop the page scrolling behind a panel on iPad and
    // iPhone Safari, where overflow: hidden on the page doesn't hold it.
    const coverMq = window.matchMedia("(max-width: 1299px)");
    let pinnedY = null;
    const pinPage = () => {
      if (!coverMq.matches || pinnedY !== null) return;
      pinnedY = window.scrollY;
      const s = document.body.style;
      s.position = "fixed";
      s.top = `-${pinnedY}px`;
      s.left = "0";
      s.right = "0";
      s.width = "100%";
    };
    const unpinPage = () => {
      if (pinnedY === null) return;
      const y = pinnedY;
      pinnedY = null;
      const s = document.body.style;
      s.position = s.top = s.left = s.right = s.width = "";
      const root = document.documentElement;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      root.style.scrollBehavior = "";
    };
    const openAsk = () => {
      if (askOpen) return;
      askOpen = true;
      // Side by side (desktop), the page keeps the pressed button in place;
      // covered (tablet, phone), the page is pinned instead.
      const hold = coverMq.matches ? () => {} : holdInPlace(askTrigger);
      pinPage();
      askPanel.hidden = false;
      askPanel.inert = false;
      document.body.classList.add("ask-open");
      // A frame after the panel appears, so the glow fades in rather than
      // starting at full strength (a hidden panel has nothing to fade from).
      requestAnimationFrame(() => requestAnimationFrame(() => { if (askOpen) { glowOn(); glowOff(1400); } }));
      hold();
      void askPanel.offsetWidth;
      askPanel.classList.add("is-open");
      askTriggers.forEach((t) => t.setAttribute("aria-expanded", "true"));
      if (reduce.matches) askInput.focus();
      else askPanel.addEventListener("transitionend", () => askInput.focus(), { once: true });
    };
    // One sound, on opening only (sound-effects/apple_intelligence.mp3);
    // closing is silent.
    sfx.load("apple_intelligence.mp3");
    const closeAsk = () => {
      if (!askOpen) return;
      askOpen = false;
      const hold = pinnedY !== null ? () => {} : holdInPlace(askTrigger);
      askPanel.classList.remove("is-open");
      askPanel.inert = true;
      document.body.classList.remove("ask-open");
      glowOff(0);
      unpinPage();
      hold();
      askTriggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
      const finish = () => { askPanel.hidden = true; };
      if (reduce.matches) finish();
      else askPanel.addEventListener("transitionend", finish, { once: true });
      askTrigger.focus({ preventScroll: true });
    };
    askTriggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
    askTriggers.forEach((t) => {
      t.addEventListener("click", () => {
        askTrigger = t; // focus returns here when the panel closes
        if (askOpen) { closeAsk(); return; }
        sfx.play("apple_intelligence.mp3");
        openAsk();
        if (t.dataset.ask && !askThread.children.length) askAsk(t.dataset.ask);
      });
    });
    if (askClose) askClose.addEventListener("click", closeAsk);
    // Tablets: the chat is a drawer over a dimmed page (the dim layer is
    // #appRow's ::after, so a tap on it lands on #appRow itself). Tap to close.
    const appRow = document.getElementById("appRow");
    if (appRow) appRow.addEventListener("click", (e) => { if (e.target === appRow && askOpen) closeAsk(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && askOpen) closeAsk(); });
  }

  // 23a) About: "Where I've been". When it scrolls into view, the line draws
  //      from tangled to straight in one smooth ease-in-out (1.1s), and each
  //      stop and its job appear the moment the line reaches them; then the
  //      "now" ring starts to pulse. On phones (no line) the jobs appear one
  //      after another. With reduced motion or no scripts, all is shown.
  const abPath = document.querySelector(".ab-path");
  if (abPath && !reduce.matches && "IntersectionObserver" in window) {
    const svg = abPath.querySelector(".path-line");
    const line = abPath.querySelector(".pl-main");
    const nodes = Array.from(abPath.querySelectorAll(".pl-node"));
    const ring = abPath.querySelector(".pl-ring");
    const next = abPath.querySelector(".pl-next");
    const jobs = Array.from(abPath.querySelectorAll(".path-grid li"));
    const lit = (el) => { if (el) el.classList.add("is-lit"); };
    const finish = () => {
      abPath.classList.add("is-done");
      abPath.classList.remove("is-armed");
      if (line) line.style.strokeDashoffset = "";
    };
    abPath.classList.add("is-armed");
    const run = () => {
      // Calm (or reduced motion) chosen since the page loaded: show it all.
      if (reduce.matches) { [...nodes, ring, next, ...jobs].forEach(lit); finish(); return; }
      if (!svg || !line || getComputedStyle(svg).display === "none") {
        jobs.forEach((li, i) => setTimeout(() => lit(li), 90 * i));
        setTimeout(finish, 90 * jobs.length + 500);
        return;
      }
      // How far along the line (0 to 1) each stop sits: the first sample at
      // or past its x, walking the line in order (the tangle doubles back,
      // so x alone isn't enough).
      const total = line.getTotalLength();
      const samples = [];
      for (let i = 0; i <= 400; i++) samples.push(line.getPointAtLength((total * i) / 400).x);
      const at = nodes.map((n) => {
        const cx = Number(n.getAttribute("cx"));
        const i = samples.findIndex((sx) => sx >= cx - 0.5);
        return i < 0 ? 1 : i / 400;
      });
      const dur = 1100, t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / dur), p = ease(t);
        line.style.strokeDashoffset = String(1 - p);
        at.forEach((f, i) => {
          if (p >= f - 0.003) { lit(nodes[i]); lit(jobs[i]); if (i === nodes.length - 1) lit(ring); }
        });
        if (t < 1) requestAnimationFrame(frame);
        else { lit(next); setTimeout(finish, 500); }
      };
      requestAnimationFrame(frame);
    };
    const pathIo = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { pathIo.disconnect(); run(); }
    }, { threshold: 0.25 });
    pathIo.observe(abPath);
  }

  // 23c) About: "Questions people ask". One answer open at a time; each
  //      one slides open and shut (height and opacity: 280ms open, 200ms
  //      closed, strong ease-out), and a quick second click reverses it
  //      from where it is. Instant with reduced motion. Without scripts the
  //      answers still open and close on their own.
  const faqItems = Array.from(document.querySelectorAll(".faq-list details"));
  const faqSlide = (d, open) => {
    const body = d.querySelector(".faq-a");
    if (!body || reduce.matches || !body.animate) {
      d.open = open; d.classList.remove("is-closing"); return;
    }
    const fromH = d.open ? body.getBoundingClientRect().height : 0;
    const fromO = d.open ? getComputedStyle(body).opacity : "0";
    if (d._slide) d._slide.cancel();
    d.open = true;
    d.classList.toggle("is-closing", !open);
    const toH = open ? body.scrollHeight : 0;
    const anim = body.animate(
      [{ height: fromH + "px", opacity: fromO }, { height: toH + "px", opacity: open ? 1 : 0 }],
      { duration: open ? 280 : 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
    d._slide = anim;
    anim.onfinish = () => {
      d._slide = null;
      if (!open) { d.open = false; d.classList.remove("is-closing"); }
    };
  };
  faqItems.forEach((d) => {
    d.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      const opening = !d.open || d.classList.contains("is-closing");
      if (opening) faqItems.forEach((o) => { if (o !== d && o.open && !o.classList.contains("is-closing")) faqSlide(o, false); });
      faqSlide(d, opening);
    });
  });

  // 24) Theme toggle: flips data-theme on <html> between light and dark and
  //     remembers the choice. The initial theme is decided by an inline
  //     script in <head> (stored preference, else the OS setting) before
  //     first paint, so this only has to handle the click from here on.
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    const root = document.documentElement;
    const syncToggle = () => {
      const dark = root.getAttribute("data-theme") === "dark";
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    };
    syncToggle();
    const setDark = (d) => { if (d) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme"); };
    const announce = () => document.dispatchEvent(new Event("theme:change"));
    themeToggle.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") === "dark";
      setDark(!dark);
      try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) { /* private mode */ }
      syncToggle();
      announce();
    });
    // The display settings panel can also pick light, dark, or "match my
    // device" (auto: nothing saved, and it follows the device as it changes).
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    window.__setTheme = (mode) => {
      try { if (mode === "auto") localStorage.removeItem("theme"); else localStorage.setItem("theme", mode); } catch (e) { /* private mode */ }
      setDark(mode === "auto" ? darkMq.matches : mode === "dark");
      syncToggle();
    };
    darkMq.addEventListener("change", () => {
      let saved = null;
      try { saved = localStorage.getItem("theme"); } catch (e) { /* private mode */ }
      if (!saved) { setDark(darkMq.matches); syncToggle(); announce(); }
    });
  }

  // 24b) Theme fade: switching light and dark crossfades the whole page to
  //      the new theme in 0.3s (CSS: ::view-transition-new(root)). View
  //      Transitions snapshot the page and the switch above runs unchanged
  //      inside it. Reduced motion or Calm, checked at the moment of the
  //      click, or a browser without View Transitions: the theme switches
  //      at once.
  if (themeToggle && typeof document.startViewTransition === "function") {
    const root = document.documentElement;
    const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = (change) => {
      if (still()) { change(); return; }
      root.classList.add("theme-fading");
      document.startViewTransition(change).finished.finally(() => root.classList.remove("theme-fading"));
    };
    // Catch the toggle's click first, then let its own handler run inside the transition.
    let passing = false;
    document.addEventListener("click", (e) => {
      const btn = e.target.closest && e.target.closest(".theme-toggle");
      if (!btn || passing || still()) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      fade(() => { passing = true; btn.click(); passing = false; });
    }, true);
    const setTheme = window.__setTheme;
    window.__setTheme = (mode) => {
      const after = mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : null;
      if (root.getAttribute("data-theme") === after) { setTheme(mode); return; }
      fade(() => setTheme(mode));
    };
  }

  // Display settings, "Make it comfortable": the accessibility figure in
  // the nav opens a compact panel. Three one-line choices (text size,
  // motion, click sounds), six toggles in a grid with one shared line explaining
  // whichever is pointed at or focused, and the background music. Choices
  // are attributes on <html> (the head script applies saved ones before the
  // page paints) and are saved in localStorage under "display". Motion
  // starts from the device's own setting. Click sounds are off until
  // chosen.
  const ctrls = document.querySelector(".nav-ctrls");
  if (ctrls) {
    const html = document.documentElement;
    const KEY = "display";
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
    const save = (o) => { try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } };
    let prefs = load();
    delete prefs.quiet; // the old "Quiet sounds" option, since replaced
    try { if (localStorage.getItem("saber") === "1") prefs.saber = 1; localStorage.removeItem("saber"); } catch (e) { /* private mode */ }
    // Tablets (touch screens 641px and wider) start at the middle text size;
    // everything else at the smallest. Only a different choice is saved.
    const textDefault = window.matchMedia("(min-width: 641px) and (hover: none) and (pointer: coarse)").matches ? 1 : 0;
    const textNow = () => (prefs.text != null ? prefs.text : textDefault);
    const deviceCalm = () => { const m = html.getAttribute("data-motion"); html.removeAttribute("data-motion"); const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches; if (m) html.setAttribute("data-motion", m); return r; };
    const ic = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
    const TOGGLES = [
      ["read", "Easier reading", "More room between lines, letters and words.", ic('<path d="M4 6h16M4 12h11M4 18h14"/>')],
      ["contrast", "More contrast", "Darker text and firmer edges on cards.", ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>')],
      ["links", "Underline links", "Every link underlined, so links never hide in the text.", ic('<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.8.8M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.8-.8"/><path d="M4 21.5h16"/>')],
      ["focus", "Bold focus", "Press Tab to move around; a thick, bright outline shows where you are.", ic('<rect x="7" y="7" width="10" height="10" rx="2"/><rect x="3" y="3" width="18" height="18" rx="4.5" stroke-width="2.6"/>')],
      ["plain", "Hide stickers", "Hides the stickers, doodles and the dog. Just the words and the work.", ic('<path d="M14.5 3.5H6A2.5 2.5 0 0 0 3.5 6v12A2.5 2.5 0 0 0 6 20.5h12a2.5 2.5 0 0 0 2.5-2.5V9.5z"/><path d="M14.5 3.5v4a2 2 0 0 0 2 2h4M4 4l16 16"/>')],
      ["saber", "Lightsaber", "A red lightsaber for the reading progress. Lively motion only.", ic('<g stroke-width="1.6"><path d="M4.3 9.7V8.3C4.3 4.4 7.6 1.3 12 1.3s7.7 3.1 7.7 7v1.4l3.1 10.4c.2.6-.2 1.1-.8 1.2-3.2.8-6.6 1.2-10 1.2s-6.8-.4-10-1.2c-.6-.1-1-.6-.8-1.2z"/><path d="M12 1.3v8.4"/><path d="M2.5 21.3L5.8 12c.6-1.6 2-2.6 3.7-2.6.9 0 1.7.2 2.5.7.8-.5 1.6-.7 2.5-.7 1.7 0 3.1 1 3.7 2.6l3.3 9.3"/><path d="M7.3 13.6c.3-1.1 1.2-1.8 2.3-1.8h.6c.6 0 1 .4 1 1v.2c0 .6-.4 1-1 1H8c-.5 0-.8-.2-.7-.4zM16.7 13.6c-.3-1.1-1.2-1.8-2.3-1.8h-.6c-.6 0-1 .4-1 1v.2c0 .6.4 1 1 1H16c.5 0 .8-.2.7-.4z" fill="currentColor" stroke-width="1"/><path d="M12 15.2l-3.6 4.4h7.2z"/><path d="M8.4 19.6l3.6 2.6 3.6-2.6M5.8 16.4l2.4 3.4M18.2 16.4l-2.4 3.4"/></g>')],

    ];
    // On touch screens there's nothing to point with, so the prompt says tap.
    const HINT = window.matchMedia("(hover: none)").matches ? "Tap an option to see what it does." : "Point at an option to see what it does.";
    const figure = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><g class="dsp-fig"><circle cx="12" cy="7.1" r="1.55" fill="currentColor" stroke="none"/><path d="M7.4 8.6 12 11l4.6-2.4M12 11v3.2M12 14.2l-2.4 4M12 14.2l2.4 4"/></g></svg>';
    const btn = document.createElement("button");
    btn.className = "dsp-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Display settings");
    btn.setAttribute("title", "Display settings");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "dsp");
    btn.innerHTML = figure;
    ctrls.insertBefore(btn, ctrls.querySelector(".theme-toggle"));

    // A row: a label, then a small segmented choice (radio buttons).
    const seg = (name, label, hint, opts) => `
      <div class="dsp-line" role="radiogroup" aria-label="${label}" data-hint="${hint}">
        <span class="dsp-line-label" aria-hidden="true">${label}</span>
        <div class="dsp-seg">${opts.map(([v, inner, aria]) => `<label class="dsp-opt" title="${aria}"><input type="radio" name="${name}" value="${v}" aria-label="${aria}">${inner}</label>`).join("")}</div>
      </div>`;
    const panel = document.createElement("div");
    panel.className = "dsp";
    panel.id = "dsp";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", "dsp-title");
    panel.innerHTML = `
      <div class="dsp-head">
        <div class="dsp-head-text">
          <h2 class="dsp-title" id="dsp-title">Make it comfortable</h2>
          <p class="dsp-sub">Change how this site looks and moves.</p>
        </div>
        <button class="dsp-reset" type="button" hidden>Reset</button>
        <button class="dsp-close" type="button" aria-label="Close">${ic('<path d="M6 6l12 12M18 6L6 18"/>', ' stroke-width="2"')}</button>
      </div>
      <div class="dsp-lines">
        ${seg("dsp-text", "Text size", "Makes every word on the site bigger, the panel too.", [["0", '<span class="dsp-a dsp-a0">A</span>', "Default text size"], ["1", '<span class="dsp-a dsp-a1">A</span>', "Large text"], ["2", '<span class="dsp-a dsp-a2">A</span>', "Larger text"]])}
        ${seg("dsp-motion", "Motion", "", [["lively", ic('<path class="dsp-spark dsp-spark-a" d="M10 6.5l1.5 4.6 4.6 1.5-4.6 1.5L10 18.7l-1.5-4.6-4.6-1.5 4.6-1.5z"/><path class="dsp-spark dsp-spark-b" d="M18 3l.7 2.1 2.1.7-2.1.7L18 8.6l-.7-2.1-2.1-.7 2.1-.7z"/>') + "<span>Lively</span>", "Lively motion"], ["calm", ic('<ellipse cx="12" cy="18.2" rx="7.2" ry="2.6"/><ellipse cx="12" cy="12.7" rx="5" ry="2.3"/><ellipse cx="12" cy="7.9" rx="3" ry="1.8"/>') + "<span>Calm</span>", "Calm motion"]])}
        ${seg("dsp-clicks", "Click sounds", "A soft click whenever you press something on the site.", [["off", "<span>Off</span>", "Click sounds off"], ["on", "<span>On</span>", "Click sounds on"]])}
      </div>
      <div class="dsp-chips">
        ${TOGGLES.map(([k, name, hint, icon]) => `<button class="dsp-chip" type="button" aria-pressed="false" data-key="${k}" data-hint="${hint}" aria-describedby="dsp-d-${k}">${icon}<span>${name}</span><span class="sr-only" id="dsp-d-${k}">${hint}</span></button>`).join("")}
      </div>
      <p class="dsp-hint" aria-hidden="true">${HINT}</p>
      <div class="dsp-music" hidden data-hint="A quiet track for reading the work.">
        <div class="dsp-music-slot"></div>
        <div class="dsp-music-text"><span class="dsp-music-name">Background music</span><span class="dsp-music-state" aria-live="polite"></span></div>
        <input class="dsp-vol-range" type="range" min="0" max="100" step="5" aria-label="Music volume">
      </div>`;
    document.body.appendChild(panel);

    // The shared hint line: what the option under the pointer (or with
    // focus) does; back to the prompt when nothing is.
    const hintEl = panel.querySelector(".dsp-hint");
    const motionHint = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? (prefs.motion ? "Calm: carousels, pop-ins and videos stay still until you press them." : "Your device asks for less motion, so the site keeps still.")
      : "Lively: carousels drift, stickers pop in and videos play on their own.");
    // Pointing at Lively or Calm itself describes that choice.
    const MOTION_HINTS = { lively: "Lively: carousels drift, stickers pop in and videos play on their own.", calm: "Calm is reduced motion: carousels, pop-ins and videos keep still." };
    const hintFor = (el) => {
      const opt = el && el.closest(".dsp-opt");
      const motionInput = opt && opt.querySelector('input[name="dsp-motion"]');
      if (motionInput) return MOTION_HINTS[motionInput.value];
      const host = el && el.closest("[data-hint]");
      if (!host) return HINT;
      if (host.dataset.key === "saber" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "Needs Lively motion: Calm hides the reading progress.";
      return host.querySelector('input[name="dsp-motion"]') ? motionHint() : host.dataset.hint;
    };
    // The line shows the prompt whenever nothing is being pointed at,
    // focused with the keyboard or just tapped. Pointing shows an option's
    // line while the pointer is on it; a tap shows it for a few seconds;
    // keyboard focus shows it while the option has focus.
    let hintTimer = 0;
    let lastTouch = false;
    const showHint = (el) => { clearTimeout(hintTimer); hintEl.textContent = hintFor(el); };
    const kbFocus = () => { const a = document.activeElement; if (!a || !panel.contains(a)) return null; try { return a.matches(":focus-visible") ? a : null; } catch (x) { return null; } };
    const restHint = (ms) => { clearTimeout(hintTimer); hintTimer = setTimeout(() => { hintEl.textContent = hintFor(kbFocus()); }, ms); };
    panel.addEventListener("pointerover", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") showHint(e.target); });
    panel.addEventListener("pointerdown", (e) => {
      lastTouch = e.pointerType === "touch";
      if (lastTouch) { showHint(e.target); if (!e.target.closest("[data-hint]")) restHint(0); else restHint(3000); }
    });
    panel.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") restHint(120); });
    panel.addEventListener("focusin", () => { const a = kbFocus(); if (a) showHint(a); });
    panel.addEventListener("focusout", () => { if (!lastTouch) restHint(0); });

    // Background music: the music button moves into the panel as a round
    // play button, with a line saying what it's doing and a volume slider.
    const music = panel.querySelector(".dsp-music");
    const sndBtn = document.querySelector(".sound-toggle");
    if (sndBtn) {
      panel.querySelector(".dsp-music-slot").appendChild(sndBtn);
      const state = panel.querySelector(".dsp-music-state");
      const range = panel.querySelector(".dsp-vol-range");
      const syncMusic = () => {
        music.hidden = sndBtn.hidden;
        const playing = sndBtn.getAttribute("aria-pressed") === "true";
        const label = sndBtn.getAttribute("aria-label") || "";
        state.textContent = playing ? "Playing, across pages"
          : /media plays/.test(label) ? "Paused while a video plays"
          : sndBtn.classList.contains("is-held") ? "Tap anywhere to carry on"
          : "Click to play";
        btn.classList.toggle("is-music", playing);
      };
      // The whole row plays (or pauses) the music, not just the round button;
      // the volume slider keeps to itself.
      music.addEventListener("click", (e) => {
        if (e.target.closest(".sound-toggle, .dsp-vol-range")) return;
        sndBtn.click();
      });
      new MutationObserver(syncMusic).observe(sndBtn, { attributes: true, attributeFilter: ["aria-pressed", "aria-label", "class", "hidden"] });
      syncMusic();
      const fill = () => range.style.setProperty("--v", range.value + "%");
      if (window.__ambientVolumeNow) range.value = String(Math.round(window.__ambientVolumeNow() * 100));
      fill();
      range.addEventListener("input", () => { fill(); if (window.__ambientVolume) window.__ambientVolume(Number(range.value) / 100); });
    }

    const PRESSABLE = "a[href], button, [role='button'], summary, label, input[type='checkbox'], input[type='radio'], .project, .wk-card, .tq-card, .bcv, .ab-snap";
    // (Not on the names you can hear: their recording plays instead. On
    // desktop widths, not on the About book covers, the hero polaroids or
    // the Home testimonial cards either: there they only react to the
    // pointer; phones keep the tap. Buttons and links inside them, like a
    // video's play and sound buttons, still click.)
    const wideMq = window.matchMedia("(min-width: 641px)");
    const silent = (el) => {
      if (el.closest(".say")) return true;
      const hit = el.closest(PRESSABLE);
      return wideMq.matches && !!hit && hit.matches(".bcv, .ab-snap, .tq-card");
    };
    const clickSound = (e) => { if (prefs.clicks && window.siteSfx && !(e && e.target.closest && silent(e.target))) window.siteSfx.play("click.mp3", 0.5); };
    // Mouse and pen: on press, so it lands with the click. Touch: on the tap
    // itself, because iPhone and iPad Safari only allow sound to start from a
    // completed tap. Keyboard presses (Enter, Space) arrive as clicks too.
    let lastPointer = "mouse";
    document.addEventListener("pointerdown", (e) => {
      lastPointer = e.pointerType;
      if (e.pointerType !== "touch" && e.button === 0 && e.target.closest && e.target.closest(PRESSABLE)) clickSound(e);
    }, true);
    document.addEventListener("click", (e) => {
      const keyboard = e.detail === 0;
      if ((keyboard || lastPointer === "touch") && e.target.closest && e.target.closest(PRESSABLE)) clickSound(e);
    }, true);
    if (prefs.clicks && window.siteSfx) window.siteSfx.load("click.mp3");
    document.addEventListener("click", (e) => {
      if (!prefs.clicks || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // same page
      e.preventDefault();
      setTimeout(() => { location.href = url.href; }, 130);
    });
    const resetBtn = panel.querySelector(".dsp-reset");
    const apply = () => {
      if (textNow()) html.setAttribute("data-text", String(textNow())); else html.removeAttribute("data-text");
      TOGGLES.forEach(([k]) => { if (prefs[k]) html.setAttribute("data-" + k, ""); else html.removeAttribute("data-" + k); });
      const before = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefs.motion) html.setAttribute("data-motion", prefs.motion); else html.removeAttribute("data-motion");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches !== before) (window.__motionHooks || []).forEach((f) => f());
      // Reflect the state in the panel.
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.querySelectorAll('input[name="dsp-text"]').forEach((r) => { r.checked = r.value === String(textNow()); });
      panel.querySelectorAll('input[name="dsp-motion"]').forEach((r) => { r.checked = r.value === (calm ? "calm" : "lively"); });
      panel.querySelectorAll('input[name="dsp-clicks"]').forEach((r) => { r.checked = r.value === (prefs.clicks ? "on" : "off"); });
      panel.querySelectorAll(".dsp-chip").forEach((c) => c.setAttribute("aria-pressed", String(!!prefs[c.dataset.key])));
      // The lightsaber is the reading line, which Calm hides: off limits then.
      const saberChip = panel.querySelector('.dsp-chip[data-key="saber"]');
      if (saberChip) { if (calm) saberChip.setAttribute("aria-disabled", "true"); else saberChip.removeAttribute("aria-disabled"); }
      const custom = Object.keys(prefs).length > 0;
      btn.classList.toggle("is-custom", custom);
      resetBtn.hidden = !custom;
      save(prefs);
    };
    panel.addEventListener("change", (e) => {
      const t = e.target;
      if (t.name === "dsp-text") { if (Number(t.value) === textDefault) delete prefs.text; else prefs.text = Number(t.value); }
      else if (t.name === "dsp-motion") {
        // Only remember a choice that differs from what the device asks for.
        if ((t.value === "calm") === deviceCalm()) delete prefs.motion; else prefs.motion = t.value;
      } else if (t.name === "dsp-clicks") {
        if (t.value === "on") { prefs.clicks = 1; if (window.siteSfx) window.siteSfx.load("click.mp3"); } else delete prefs.clicks;
      }
      apply();
      // The motion line changes with the choice; a tap's line still fades back.
      if (t.name === "dsp-motion") { showHint(t); if (lastTouch) restHint(3000); }
    });
    panel.querySelectorAll(".dsp-chip").forEach((c) => c.addEventListener("click", () => {
      const k = c.dataset.key;
      if (c.getAttribute("aria-disabled") === "true") { showHint(c); return; }
      if (prefs[k]) delete prefs[k]; else prefs[k] = 1;
      apply();
    }));
    resetBtn.addEventListener("click", () => {
      prefs = {};
      apply();
      panel.querySelector('input[name="dsp-text"]:checked').focus();
    });

    // Open under the button (a sheet from the bottom on phones); close with
    // Escape, the close button, or a click outside. Focus goes in and back.
    const place = () => {
      const r = btn.getBoundingClientRect();
      panel.style.top = Math.round(r.bottom + 12) + "px";
      panel.style.right = Math.max(8, Math.round(window.innerWidth - r.right - 10)) + "px";
      panel.style.left = "auto";
    };
    const open = () => {
      apply();
      showHint(null);
      panel.hidden = false;
      place();
      panel.classList.remove("is-opening"); void panel.offsetWidth; panel.classList.add("is-opening");
      btn.setAttribute("aria-expanded", "true");
      panel.querySelector('input[name="dsp-text"]:checked').focus({ preventScroll: true });
    };
    const close = (back) => {
      if (panel.hidden) return;
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (back) btn.focus({ preventScroll: true });
    };
    btn.addEventListener("click", () => (panel.hidden ? open() : close(true)));
    panel.querySelector(".dsp-close").addEventListener("click", () => close(true));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { e.preventDefault(); close(true); } });
    // A click or tap outside closes it. On touch, only a tap does: a swipe
    // above the sheet just scrolls the page, and the sheet stays open.
    let outsideAt = null;
    document.addEventListener("pointerdown", (e) => {
      if (panel.hidden || panel.contains(e.target) || btn.contains(e.target)) { outsideAt = null; return; }
      if (e.pointerType === "touch") outsideAt = [e.clientX, e.clientY];
      else close(false);
    });
    document.addEventListener("pointerup", (e) => {
      if (!outsideAt) return;
      const moved = Math.hypot(e.clientX - outsideAt[0], e.clientY - outsideAt[1]);
      outsideAt = null;
      if (moved < 10) close(false);
    });
    document.addEventListener("pointercancel", () => { outsideAt = null; });
    window.addEventListener("resize", () => { if (!panel.hidden) place(); });
    let touchY = 0;
    panel.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener("touchmove", (e) => {
      if (e.target.closest(".dsp-vol-range")) return; // the volume slider drags sideways
      const dy = e.touches[0].clientY - touchY;
      const canScroll = panel.scrollHeight > panel.clientHeight + 1;
      const atTop = panel.scrollTop <= 0, atEnd = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
      if (!canScroll || (dy > 0 && atTop) || (dy < 0 && atEnd)) e.preventDefault();
    }, { passive: false });
    panel.addEventListener("wheel", (e) => {
      const canScroll = panel.scrollHeight > panel.clientHeight + 1;
      if (!canScroll) e.preventDefault();
    }, { passive: false });
    apply();
  }

  // 25c) Home's closing chapter: the "Now at" badge drifts against the
  //      scroll as the section passes, a gentle parallax. Calm: still.
  const nextBadge = document.querySelector("[data-next-badge]");
  if (nextBadge) {
    let nbQueued = false;
    const nbDraw = () => {
      nbQueued = false;
      if (reduce.matches) { nextBadge.style.translate = ""; return; }
      const r = nextBadge.parentElement.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const off = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      nextBadge.style.translate = `${(off * -18).toFixed(1)}px ${(off * 46).toFixed(1)}px`;
    };
    const nbQueue = () => { if (!nbQueued) { nbQueued = true; requestAnimationFrame(nbDraw); } };
    window.addEventListener("scroll", nbQueue, { passive: true });
    window.addEventListener("resize", nbQueue);
    nbDraw();
  }

  // 26) Scroll line and hero depth (Home, Works, About and the case studies).
  //     A thin line along the top of the window fills as you read down the
  //     page. Leaving the top of Home, the hero stickers float up at their
  //     own speeds and turn; on About (1024px and up) the snapshots rise a
  //     touch faster than the page. The hero words stay put. Reduced motion
  //     (or Calm): no line, and the hero holds still.
  if (document.querySelector(".hero.hc, .wk-hero, .ab-table, main.cs")) {
    const line = document.createElement("div");
    line.className = "scroll-line";
    line.setAttribute("aria-hidden", "true");
    // A lightsaber (Vader's: D-ring, black grip bands, the clamp with its
    // control box, a flared emitter): the hilt waits at the left edge and
    // the blade fills out of its emitter as you read down the page.
    line.innerHTML = `<svg class="sb-hilt" viewBox="0 0 96 16"><defs><linearGradient id="sbChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".28" stop-color="#dfe3e7"/><stop offset=".55" stop-color="#8b9299"/><stop offset=".78" stop-color="#c9ced3"/><stop offset="1" stop-color="#565c63"/></linearGradient><linearGradient id="sbSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa0a7"/><stop offset=".5" stop-color="#4a4f55"/><stop offset="1" stop-color="#23262a"/></linearGradient><linearGradient id="sbBlack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55595f"/><stop offset=".35" stop-color="#1c1e21"/><stop offset="1" stop-color="#08090a"/></linearGradient></defs><circle cx="2.4" cy="8" r="1.9" fill="none" stroke="#7d838a" stroke-width=".9"/><g stroke="rgba(0,0,0,.35)" stroke-width=".35"><rect x="3.8" y="3.6" width="7" height="8.8" rx="1" fill="url(#sbChrome)"/><rect x="10.8" y="4.1" width="29" height="7.8" fill="url(#sbChrome)"/><g fill="url(#sbBlack)"><rect x="12.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="16.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="20.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="24.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="28.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="32.6" y="3.4" width="2.3" height="9.2" rx=".5"/><rect x="36.6" y="3.4" width="2.3" height="9.2" rx=".5"/></g><rect x="39.8" y="3.3" width="18" height="9.4" rx=".6" fill="url(#sbChrome)"/><rect x="43" y="1" width="11.6" height="3.4" rx=".7" fill="url(#sbBlack)"/><rect x="45" y="12.6" width="8" height="1.6" rx=".5" fill="url(#sbSteel)"/><rect x="57.8" y="5" width="3" height="6" fill="url(#sbSteel)"/><path d="M60.8 4.2h3l1-1.4h15.4l2.6 -.8v12l-2.6-.8H64.8l-1-1.4h-3z" fill="url(#sbChrome)"/><rect x="82.6" y="2.6" width="1.8" height="10.8" rx=".4" fill="url(#sbBlack)"/></g><rect x="44.6" y="1.8" width="2.6" height="1.6" rx=".4" fill="#e0453a"/><circle cx="49.6" cy="2.6" r=".75" fill="#d7dade"/><circle cx="52.4" cy="2.6" r=".75" fill="#d7dade"/><path d="M41.8 3.6v8.8M55.8 3.6v8.8" stroke="rgba(0,0,0,.28)" stroke-width=".45"/><path d="M66.5 3.4v9.2M69.5 3.4v9.2M77.5 3.2v9.6" stroke="rgba(0,0,0,.35)" stroke-width=".5"/><path d="M64.8 3.6h15.4" stroke="rgba(255,255,255,.75)" stroke-width=".45"/><path d="M5.8 3.8v8.4M8.6 3.8v8.4" stroke="rgba(0,0,0,.28)" stroke-width=".5"/></svg><span class="sb-track"><span class="sb-blade"></span></span>`;
    const blade = line.querySelector(".sb-blade");
    // The ignition sound is fetched early (when the settings button is
    // reached, or once the page settles if the saber is already on), so it
    // plays the moment the saber lights instead of after a download.
    const SABER = "lightsaber.mp3";
    const ignite_ = () => { sfx.load(SABER).then(() => { if (line.classList.contains("is-saber")) sfx.play(SABER, 0.6); }); };
    const dspBtn = document.querySelector(".dsp-toggle");
    if (dspBtn) ["pointerenter", "pointerdown", "focus"].forEach((ev) => dspBtn.addEventListener(ev, () => sfx.load(SABER), { once: true }));
    if (document.documentElement.hasAttribute("data-saber")) (window.requestIdleCallback || setTimeout)(() => sfx.load(SABER));
    // Pressing the hilt plays it again.
    line.querySelector(".sb-hilt").addEventListener("click", ignite_);
    // A plain line by default; "Lightsaber" in the display settings lights
    // the saber (html[data-saber]), with its ignition sound
    // (sound-effects/lightsaber.mp3) as it lights, not on page load.
    const syncSaber = (ignite) => {
      const on = document.documentElement.hasAttribute("data-saber");
      if (on === line.classList.contains("is-saber")) return;
      line.classList.toggle("is-saber", on);
      if (on && ignite) ignite_();
    };
    syncSaber(false);
    // (Redrawn on a switch: the stub is longer with the saber on.)
    new MutationObserver(() => { syncSaber(true); queue(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-saber"] });
    document.body.appendChild(line);
    // The saber's light on the page: a red wash under the lit part of the
    // blade that the content scrolls through. Its own layer on <body>, so
    // its blend reaches the page (inside the line it would only blend with
    // the line). Only with the saber on; it rests and wakes with the line.
    const spill = document.createElement("div");
    spill.className = "sb-spill";
    spill.setAttribute("aria-hidden", "true");
    document.body.appendChild(spill);
    const heroStickers = Array.from(document.querySelectorAll(".hero.hc .hs"));
    const pile = document.querySelector(".ab-pile");
    const wideDepth = window.matchMedia("(min-width: 1024px)");
    const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
    let queued = false;
    // Where the page is scrolled to, wherever it scrolls: in its own frame
    // while the chat sits beside it, at the pinned offset while the chat
    // covers it, otherwise the window. Reading the window alone, opening
    // the chat sent the line back to nothing and jolted the stickers.
    const readScroll = () => {
      const vh = window.innerHeight;
      if (inShellScroll()) return { y: shellScroll.scrollTop, max: shellScroll.scrollHeight - shellScroll.clientHeight };
      if (document.body.style.position === "fixed") return { y: -parseFloat(document.body.style.top) || 0, max: document.body.scrollHeight - vh };
      return { y: window.scrollY, max: document.documentElement.scrollHeight - vh };
    };
    const draw = () => {
      queued = false;
      const vh = window.innerHeight;
      const { y, max } = readScroll();
      const still = reduce.matches;
      line.hidden = still;
      const fill = clampN(max > 0 ? y / max : 0, 0, 1);
      // With the saber on, the blade is never quite empty: a short lit stub
      // out of the emitter (longer on phones, where the screen's rounded
      // corner sits close by). The plain line starts empty.
      const stub = line.classList.contains("is-saber") ? 24 + (window.innerWidth <= 640 ? 12 : 0) : 0;
      const shown = Math.max(fill, Math.min(1, stub / (blade.offsetWidth || 1)));
      blade.style.transform = `translateX(${((shown - 1) * 100).toFixed(2)}%)`;
      blade.style.setProperty("--sb-power", fill.toFixed(3)); // the dark theme's bloom grows with the blade
      const lit = line.classList.contains("is-saber") && !still;
      spill.hidden = !lit;
      if (lit) {
        const lr = line.getBoundingClientRect(), br = blade.getBoundingClientRect();
        spill.style.transform = `scaleX(${clampN((br.right - lr.left) / (lr.width || 1), 0, 1).toFixed(4)})`;
        spill.style.setProperty("--sb-p", (0.25 + fill * 0.75).toFixed(3));
      }
      line.classList.toggle("is-lit", fill > 0.002);
      if (y > vh * 1.4 && !still) return; // the hero is long gone
      heroStickers.forEach((el, i) => {
        const depth = 0.5 + (i % 3) * 0.25, turn = (i % 2 ? 1 : -1) * (0.06 + (i % 3) * 0.03);
        el.style.translate = still ? "" : `0 ${(-y * depth).toFixed(1)}px`;
        el.style.rotate = still ? "" : `calc(var(--hr, 0deg) + ${(y * turn).toFixed(2)}deg)`; // on top of its own tilt
      });
      if (pile) {
        const on = !still && wideDepth.matches;
        pile.querySelectorAll(".ab-snap:not(.is-spare):not(.is-copy)").forEach((el, i) => {
          el.style.translate = on ? `0 ${(-y * (0.05 + ((i * 37) % 5) * 0.03)).toFixed(1)}px` : "";
        });
      }
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    // It shows while the page moves and fades away a moment after it stops,
    // except at the very top of the page, where it always stays.
    let idleTimer = 0;
    const wake = () => {
      line.classList.remove("is-idle");
      spill.classList.remove("is-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { if (readScroll().y > 4) { line.classList.add("is-idle"); spill.classList.add("is-idle"); } }, 1500);
    };
    const onScroll = () => { queue(); wake(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (shellScroll) shellScroll.addEventListener("scroll", onScroll, { passive: true });
    wake();
    window.addEventListener("resize", queue);
    if (reduce.addEventListener) reduce.addEventListener("change", queue);
    draw();
  }
})();
