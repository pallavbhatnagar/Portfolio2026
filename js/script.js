(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 0) The AI colours (Bloom: blue into hot pink) as one shared SVG
  //    gradient, so the AI sparkle icons can use it (CSS: fill url(#ai-spark)).
  if (!document.getElementById("ai-spark")) {
    document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs><linearGradient id="ai-spark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3965fa"/><stop offset="0.4" stop-color="#8a62e0"/><stop offset="0.7" stop-color="#c454c4"/><stop offset="1" stop-color="#f2369a"/></linearGradient></defs></svg>');
  }

  // 0b) Preloader (CSS .preloader): on the first page of a visit, "Hello"
  //     in a few languages, a little slower than a flicker, then the panel
  //     lifts away. A click or any key skips to the end. The head script
  //     decides whether it runs (html.is-preloading). As it starts to lift
  //     the page hears "preloader:leaving" (the hero starts drawing then),
  //     and once it's gone, "preloader:done".
  if (document.documentElement.classList.contains("is-preloading")) {
    const html = document.documentElement;
    try { sessionStorage.setItem("preloaded", "1"); } catch (e) { /* private mode */ }
    const words = ["Hello", "नमस्ते", "Bonjour", "Hola", "Ciao", "こんにちは", "Olá", "Hallå", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ"];
    const pl = document.createElement("div");
    pl.className = "preloader";
    pl.setAttribute("aria-hidden", "true");
    pl.innerHTML = '<p class="pl-word"></p><div class="pl-curve"></div>';
    document.body.appendChild(pl);
    html.classList.add("pl-ready");
    const word = pl.querySelector(".pl-word");
    let i = 0, timer = 0, done = false;
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
    const show = () => {
      // Each word eases in (a short fade and focus); "Hello" holds a moment,
      // the rest pass at an easy pace, the last one lingers.
      word.classList.remove("is-on");
      word.textContent = words[i];
      void word.offsetWidth;
      word.classList.add("is-on");
      const hold = i === 0 ? 1400 : i === words.length - 1 ? 900 : 360;
      i += 1;
      timer = setTimeout(i < words.length ? show : finish, hold);
    };
    requestAnimationFrame(show);
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

  // 3) Hero desire path. The line draws (CSS) while the dot follows it (SVG
  //    motion) once, then rests at Done; it replays when scrolled back to.
  //    Reduced motion: the finished line, no dot travel, no replay.
  const trail = document.querySelector(".trail");
  const trailSvg = document.querySelector(".trail-svg");
  if (trail && trailSvg) {
    // On phones the drawing shrinks, so the dot and nodes get larger radii
    // (style.css does the same with the CSS r property, which some Safari
    // versions ignore; setting the attribute works in every browser).
    const smallMq = window.matchMedia("(max-width: 640px)");
    const sizeTrail = () => {
      const small = smallMq.matches;
      trailSvg.querySelectorAll(".trail-dot").forEach((c) => c.setAttribute("r", small ? "16" : "7"));
      trailSvg.querySelectorAll(".trail-node").forEach((c) => c.setAttribute("r", small ? "12" : "6"));
    };
    sizeTrail();
    if (smallMq.addEventListener) smallMq.addEventListener("change", sizeTrail);
    if (reduce.matches) {
      trailSvg.querySelectorAll("animateMotion").forEach((m) => m.remove());
      const dot = trailSvg.querySelector(".trail-dot");
      dot.setAttribute("cx", "990");
      dot.setAttribute("cy", "100");
    } else {
      // It plays once when the page opens, then rests on the finished
      // drawing (at Done). It plays again only when the visitor comes back
      // to it: scrolls away and back, or returns to the page with Back.
      // The dot's SVG motion keeps the browser redrawing while its clock
      // runs, so the clock is paused as soon as each run is done.
      const runTime = 5400;
      let restTimer = 0, away = false;
      const rest = () => { clearTimeout(restTimer); restTimer = setTimeout(() => trailSvg.pauseAnimations(), Math.max(0, runTime - trailSvg.getCurrentTime() * 1000)); };
      const replay = () => {
        trail.classList.remove("is-run", "is-paused");
        void trail.offsetWidth;
        trail.classList.add("is-run");
        trailSvg.setCurrentTime(0);
        trailSvg.unpauseAnimations();
        rest();
      };
      document.addEventListener("preloader:leaving", () => replay());
      // The first run starts with the page, or, on a visit that opens with
      // the loader, held at its very first frame (nothing drawn yet) and
      // started the moment the loader begins to lift.
      if (document.documentElement.classList.contains("is-preloading")) {
        trail.classList.add("is-paused");
        trailSvg.pauseAnimations();
        trailSvg.setCurrentTime(0);
      } else {
        rest();
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([en]) => {
          if (!en.isIntersecting) {
            // Gone from the screen: stop where it is; it starts over on return.
            away = true;
            clearTimeout(restTimer);
            trailSvg.pauseAnimations();
            trail.classList.add("is-paused");
          } else if (away && en.intersectionRatio >= 0.35) {
            away = false;
            replay();
          }
        }, { threshold: [0, 0.35] }).observe(trail);
      }
      addEventListener("pageshow", (e) => { if (e.persisted) replay(); });
    }
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
      window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
    });
  }

  // 9) Testimonial strip: hovering, focusing or tapping a portrait opens it.
  //    Only one panel is open at a time; the others are read as collapsed.
  const strip = document.querySelector(".tstrip");
  const panels9 = strip ? Array.from(strip.querySelectorAll(".tpanel")) : [];
  if (panels9.length) {
    const vPanel = strip.querySelector(".tpanel--video");
    const vid = vPanel?.querySelector("video");
    let userPaused = false;
    let stripSeen = false; // the video loads and plays only once the strip is on screen
    // Plays muted; the visitor turns the sound on with the mute button.
    const playVideo = () => {
      if (!vid || !stripSeen || userPaused || reduce.matches) return;
      if (vid.preload === "none") { vid.preload = "auto"; vid.load(); }
      vid.play().catch(() => {});
    };
    const open = (panel) => {
      panels9.forEach((p) => {
        const on = p === panel;
        p.classList.toggle("is-active", on);
        p.querySelector(".tbody")?.setAttribute("aria-hidden", String(!on));
      });
      if (vid) {
        if (panel === vPanel) playVideo();
        else vid.pause();
      }
    };
    if (vid && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        stripSeen = entry.isIntersecting;
        if (stripSeen && vPanel.classList.contains("is-active")) playVideo();
        else if (!stripSeen) vid.pause();
      }, { threshold: 0.5 }).observe(vPanel);
    }
    // The panel marked data-default (the video) is the resting state: it is
    // open on load and reopens when the pointer leaves the strip.
    const restPanel = strip.querySelector(".tpanel[data-default]") || panels9[0];
    strip.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") open(restPanel); });

    // Video controls: play or pause, mute or unmute.
    if (vid) {
      const playBtn = vPanel.querySelector(".tplay");
      const muteBtn = vPanel.querySelector(".tmute");
      const syncMute = () => {
        muteBtn.setAttribute("aria-pressed", String(vid.muted));
        muteBtn.setAttribute("aria-label", vid.muted ? "Unmute" : "Mute");
      };
      // Turning the sound on starts the video from the beginning the first
      // time (so the whole testimonial is heard), and plays it if paused.
      let heard = false;
      const soundOn = () => {
        vid.muted = false;
        if (!heard) { heard = true; vid.currentTime = 0; }
        if (vid.paused) { userPaused = false; vid.play().catch(() => {}); }
      };
      muteBtn.addEventListener("click", (e) => { e.stopPropagation(); if (vid.muted) soundOn(); else vid.muted = true; });
      // Clicking the silent video itself turns the sound on too.
      vid.addEventListener("click", () => { if (vPanel.classList.contains("is-active") && vid.muted) soundOn(); });
      vid.addEventListener("volumechange", syncMute);
      syncMute();
      const syncPlay = () => {
        const playing = !vid.paused && !vid.ended;
        vPanel.classList.toggle("is-playing", playing);
        playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      };
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userPaused = !vid.paused;
        if (vid.paused) vid.play().catch(() => {}); else vid.pause();
      });
      vid.addEventListener("play", syncPlay);
      vid.addEventListener("pause", syncPlay);
      vid.addEventListener("ended", syncPlay);
      syncPlay();
    }
    panels9.forEach((p) => {
      p.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") open(p); });
      p.addEventListener("focus", () => open(p));
      p.addEventListener("click", () => open(p));
    });
    open(restPanel);
  }

  // 10) Entrances: add .is-in once each block is meaningfully on screen.
  //     (CSS hides these blocks only when scripts run, via the .js class.)
  //     Custom fonts (Manrope) can reflow the page slightly after this first
  //     runs, which would shift elements the observer already judged "not on
  //     screen yet" and leave them stuck hidden; once fonts settle, any block
  //     still waiting is re-checked against final layout.
  const revealSelector = ".ab-r, .ab-facts, .im-grid, .off-grid, .wk-list, .tstrip, .proj-head";
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
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

  // 11g) Ambient music (assets/audio/ambient/). Off by default; the speaker
  //      in the nav fades it in and out. Once it's on, it keeps playing from
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
    const VOL = 0.35;
    const KEY = "ambient";
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
      tip.style.setProperty("--tip-bg", cs.getPropertyValue("--ink-tag").trim());
      tip.style.setProperty("--tip-ink", cs.getPropertyValue("--card").trim());
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
        tabs[k].setAttribute("aria-selected", String(on));
        tabs[k].tabIndex = on ? 0 : -1;
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

    tabs.forEach((tab, k) => {
      tab.addEventListener("click", () => { if (k !== current) open(k); });
      tab.addEventListener("keydown", (e) => {
        const last = tabs.length - 1;
        let next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = current === last ? 0 : current + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = current === 0 ? last : current - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = last;
        if (next !== null) { e.preventDefault(); open(next, true); }
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
  //      serves the full locked pages instead of the placeholders in work/.
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

  // 15c) About playlist card: the waveform's played part (lime) stops at a
  //      random point on each visit, as if the playlist were already under
  //      way somewhere (between about a sixth and five-sixths of the way).
  const waveBars = document.querySelectorAll(".om-wave i");
  if (waveBars.length) {
    const n = waveBars.length;
    const upTo = Math.round(n * (0.15 + Math.random() * 0.7));
    waveBars.forEach((bar, i) => bar.classList.toggle("is-played", i < upTo));
  }

  // 15a) About: the looping animations (the career path's pulsing ring, the
  //      playlist card's vinyl and waveform, the book shelf) pause while
  //      their section is off screen, so they cost nothing while you read
  //      elsewhere. CSS: .is-offscreen.
  const loops = document.querySelectorAll(".ab-path, .off-music, .off-books");
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
    [0, 1].forEach((set) => order.forEach((i) => frag.appendChild(all[set * half + i])));
    shelf.appendChild(frag);
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

  // 15) About carousel: an endless loop. Each slide gets data-o (its offset
  //     from the centre, -4..4); CSS turns that into size and position.
  //     Every 2s the next slide glides in. Keeps running under the mouse;
  //     pauses for keyboard focus, when the tab or carousel is off screen, and
  //     never auto-plays for reduced motion.
  const car = document.querySelector(".ab-carousel");
  if (car) {
    const slides = Array.from(car.querySelectorAll(".ab-slide"));
    const n = slides.length;
    let cur = 0;
    let timer = null;
    let inView = true;
    const render = () => {
      slides.forEach((s, i) => {
        let o = (((i - cur) % n) + n) % n;
        if (o > n / 2) o -= n;
        o = Math.max(-4, Math.min(4, o));
        s.dataset.o = String(o);
        s.setAttribute("aria-hidden", String(Math.abs(o) > 3));
        s.setAttribute("aria-current", String(o === 0));
      });
    };
    const go = (to) => { cur = ((to % n) + n) % n; render(); };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
      if (reduce.matches || timer || !inView || document.hidden) return;
      timer = setInterval(() => go(cur + 1), 2000);
    };
    slides.forEach((s, i) => s.addEventListener("click", () => { go(i); stop(); start(); }));
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });
    car.addEventListener("focusin", () => { if (car.matches(":focus-visible")) stop(); });
    car.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; inView ? start() : stop(); }, { threshold: 0.2 }).observe(car);
    }
    render();
    start();
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

  // 18) About, music. The dark card is a facade for the SoundCloud playlist in
  //     data-sc-src (an api.soundcloud.com playlist/track/user URL, or a
  //     soundcloud.com profile URL). Pressing play swaps in the real embed with
  //     the visual player, then loads SoundCloud's Widget API so the card
  //     reacts: the disc spins, the waveform and equaliser move, and the
  //     "now playing" line shows the current track. Nothing third-party loads
  //     before the click.
  const omPlayer = document.querySelector(".om-player");
  const omPlay = document.querySelector(".om-play");
  const omCard = document.querySelector(".off-music");
  const omNow = document.querySelector(".om-now-text");
  if (omPlayer && omPlay && omCard) {
    const loadWidgetApi = () => new Promise((resolve, reject) => {
      if (window.SC && window.SC.Widget) return resolve();
      const s = document.createElement("script");
      s.src = "https://w.soundcloud.com/player/api.js";
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
    omPlay.addEventListener("click", () => {
      const src = (omPlayer.dataset.scSrc || "").trim();
      const params = new URLSearchParams({
        url: src, auto_play: "true", hide_related: "true", show_comments: "false",
        show_user: "false", show_reposts: "false", show_playcount: "false", visual: "true", color: "#b6e37b",
      });
      const frame = document.createElement("iframe");
      frame.src = `https://w.soundcloud.com/player/?${params.toString()}`;
      frame.title = "SoundCloud player";
      frame.allow = "autoplay";
      frame.setAttribute("scrolling", "no");
      frame.height = window.innerWidth < 1024 ? "560" : "450";
      omPlayer.replaceChildren(frame);
      if (omNow) omNow.textContent = "Loading the playlist…";
      loadWidgetApi().then(() => {
        const widget = window.SC.Widget(frame);
        const setTitle = () => widget.getCurrentSound((sound) => {
          if (sound && omNow) omNow.textContent = `Now playing: ${sound.title}`;
        });
        widget.bind(window.SC.Widget.Events.READY, setTitle);
        widget.bind(window.SC.Widget.Events.PLAY, () => { omCard.classList.add("is-playing"); setTitle(); });
        widget.bind(window.SC.Widget.Events.PAUSE, () => { omCard.classList.remove("is-playing"); if (omNow) omNow.textContent = "Paused"; });
        widget.bind(window.SC.Widget.Events.FINISH, () => omCard.classList.remove("is-playing"));
      }).catch(() => { if (omNow) omNow.textContent = "Playing on SoundCloud"; });
    });
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
    { co: "Akash", role: "Senior UX designer", years: "2023 – now", tint: "mint" },
    { co: "Wave", role: "Product designer", years: "2020 – 2023", tint: "lilac" },
    { co: "Pixelcraft", role: "UI designer", years: "2018 – 2020", tint: "rose" },
    { co: "Studio Nine", role: "Design intern", years: "2017", tint: "sky" }
  ];

  const projectCardHtml = (p, solo) => `<a class="ag-card${solo ? " ag-card-one" : ""}" href="/work/${p.id}" style="--tint: var(--${p.tint}-bg); --tint-ink: var(--${p.tint}-ink)">`
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
    const addAskTyping = () => {
      const turn = document.createElement("div");
      turn.className = "ag-turn from-agent ag-typing";
      turn.innerHTML = '<span class="ag-who">Guide</span><div class="ag-content" aria-hidden="true"><i></i><i></i><i></i></div>';
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
      const typing = addAskTyping();
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
    themeToggle.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") === "dark";
      if (dark) { root.removeAttribute("data-theme"); } else { root.setAttribute("data-theme", "dark"); }
      try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) { /* private mode */ }
      syncToggle();
    });
  }
})();




