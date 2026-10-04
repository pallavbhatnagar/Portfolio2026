(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1) Nav bar: an IntersectionObserver watches a 1px sentinel at the top of
  //    the page (no scroll listener) and flags the header once scrolled.
  const header = document.querySelector(".site-header");
  const sentinel = document.querySelector(".scroll-sentinel");
  if (header && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      header.dataset.scrolled = String(!entry.isIntersecting);
    }).observe(sentinel);
  }

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
  //    motion), then the whole thing replays every few seconds. Reduced
  //    motion: the finished line, no dot travel, no replay.
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
      const cycle = 11000; // ~5.3s of motion, then a rest
      const replay = () => {
        if (document.hidden) return;
        trail.classList.remove("is-run");
        void trail.offsetWidth;
        trail.classList.add("is-run");
        trailSvg.setCurrentTime(0);
        trailSvg.unpauseAnimations();
      };
      setInterval(replay, cycle);
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
    const open = (panel) => {
      panels9.forEach((p) => {
        const on = p === panel;
        p.classList.toggle("is-active", on);
        p.querySelector(".tbody")?.setAttribute("aria-hidden", String(!on));
      });
      if (vid) {
        if (panel === vPanel && !userPaused && !reduce.matches) vid.play().catch(() => {});
        else vid.pause();
      }
    };
    // The panel marked data-default (the video) is the resting state: it is
    // open on load and reopens when the pointer leaves the strip.
    const restPanel = strip.querySelector(".tpanel[data-default]") || panels9[0];
    strip.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") open(restPanel); });

    // Video controls: play or pause, mute, volume.
    if (vid) {
      const playBtn = vPanel.querySelector(".tplay");
      const muteBtn = vPanel.querySelector(".tmute");
      const range = vPanel.querySelector(".tvol-range");
      const syncPlay = () => {
        const playing = !vid.paused && !vid.ended;
        vPanel.classList.toggle("is-playing", playing);
        playBtn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      };
      const syncMute = () => {
        muteBtn.setAttribute("aria-pressed", String(vid.muted));
        muteBtn.setAttribute("aria-label", vid.muted ? "Unmute" : "Mute");
      };
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userPaused = !vid.paused;
        if (vid.paused) vid.play().catch(() => {}); else vid.pause();
      });
      muteBtn.addEventListener("click", (e) => { e.stopPropagation(); vid.muted = !vid.muted; });
      range.addEventListener("input", () => { vid.volume = Number(range.value); vid.muted = vid.volume === 0; });
      vid.volume = Number(range.value);
      vid.addEventListener("play", syncPlay);
      vid.addEventListener("pause", syncPlay);
      vid.addEventListener("ended", syncPlay);
      vid.addEventListener("volumechange", () => { syncMute(); if (!vid.muted) range.value = String(vid.volume); });
      syncPlay();
      syncMute();
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
  const revealSelector = ".ab-r, .ab-facts, .im-grid, .off-grid, .wk-list, .tstrip, .value-list, .xp-list, .proj-head";
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
    const render = () => {
      ticking = false;
      if (!active || !pinned) {
        if (head) head.style.transform = "";
        headShift = 0;
        return;
      }
      const firstStick = parseFloat(getComputedStyle(cards[0]).top) || 0;
      const overshoot = Math.max(0, firstStick - cards[0].getBoundingClientRect().top);
      const natural = head.getBoundingClientRect().top - headShift;
      headShift = overshoot > 0 ? Math.min(0, headTop - overshoot - natural) : 0;
      head.style.transform = headShift ? `translateY(${headShift.toFixed(2)}px)` : "";
    };
    const requestRender = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    };
    const refresh = () => { measure(); render(); };

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
      if (!value) { setError("Enter the password to continue."); lockInput.focus(); return; }
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ password: value })
        });
        if (res.status === 401) {
          setError("That password didn't work. Check it and try again.");
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

  // 12b) Experience: when a row opens (hover, focus or tap) its metric numbers
  //      count up from zero. Throttled so a passing pointer doesn't replay it;
  //      skipped for reduced motion (the final numbers are already in place).
  if (!reduce.matches) {
    const runs = new WeakMap();
    const countRow = (row) => {
      const now = performance.now();
      if (now - (runs.get(row) || 0) < 1600) return;
      runs.set(row, now);
      row.querySelectorAll(".xm-v").forEach((el, i) => {
        const to = parseFloat(el.dataset.to);
        if (Number.isNaN(to)) return;
        const pre = el.dataset.pre || "";
        const suf = el.dataset.suf || "";
        const delay = 220 + i * 100;
        const dur = 900;
        const t0 = now + delay;
        el.textContent = `${pre}0${suf}`;
        const tick = (t) => {
          const k = Math.min(1, Math.max(0, (t - t0) / dur));
          const e = 1 - Math.pow(1 - k, 3);
          el.textContent = `${pre}${Math.round(to * e)}${suf}`;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    document.querySelectorAll(".xp-row").forEach((row) => {
      row.addEventListener("pointerenter", () => countRow(row));
      row.addEventListener("focus", () => countRow(row));
      row.addEventListener("click", () => countRow(row));
    });
  }

  // 14) About page: the four numbers count up once when they scroll into view.
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

  // 15) About carousel: an endless loop. Each slide gets data-o (its offset
  //     from the centre, -4..4); CSS turns that into size and position.
  //     Every 2.8s the next slide glides in. Pauses on hover/focus, when the
  //     tab or carousel is off screen, and never auto-plays for reduced motion.
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
      timer = setInterval(() => go(cur + 1), 2800);
    };
    slides.forEach((s, i) => s.addEventListener("click", () => { go(i); stop(); start(); }));
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });
    car.addEventListener("pointerenter", stop);
    car.addEventListener("pointerleave", start);
    car.addEventListener("focusin", stop);
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
        show_user: "false", show_reposts: "false", show_playcount: "false", visual: "true", color: "#9be7b8",
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

  // 21) Ask AI data: shared between the full-page voice chat (agent.html)
  //     and the in-page nav panel on every other page, so a project, work-
  //     history or contact answer renders the exact same real content —
  //     never a redirect — wherever someone asks. Swap match() for a live
  //     model later and every consumer keeps working unchanged.
  // Project cards come from js/projects.js (the Home page's featured
  // projects, in the same order), and the contact email from js/content.js.
  const SITE_EMAIL = (window.SITE && window.SITE.email) || "hello@example.com";
  const PROJECTS = (window.CASE_STUDIES || [])
    .filter((p) => p.home)
    .sort((a, b) => (a.home.order || 0) - (b.home.order || 0))
    .map((p, i) => {
      // The card's first metric.
      const [label, value] = (p.home.metrics && p.home.metrics[0]) || ["", ""];
      return {
        id: p.slug, name: p.name, tag: `${p.category} · ${p.year}`, glyph: `g${(i % 4) + 1}`, tint: p.tint,
        desc: p.home.text,
        metric: value,
        metricLabel: label
      };
    });
  const EXTRA_KEYWORDS = {
    ledgerly: ["finance app", "budgeting"],
    wayfarer: ["telehealth", "clinic"],
    parcelo: ["logistics", "dispatch"],
    lumen: ["edtech", "course", "e-learning"]
  };
  const EXPERIENCE = [
    { co: "Akash", role: "Senior UX Designer", years: "2023 — Now", tint: "mint" },
    { co: "Sellium", role: "Product Designer", years: "2021 — 2023", tint: "lilac" },
    { co: "Findrs", role: "UX Designer", years: "2020 — 2021", tint: "rose" },
    { co: "Metalend", role: "UX Designer", years: "2019 — 2020", tint: "sky" },
    { co: "Klutch", role: "Junior Designer", years: "2018 — 2019", tint: "sand" },
  ];

  const projectCardHtml = (p, solo) => `<a class="ag-card${solo ? " ag-card-one" : ""}" href="/work/${p.id}" style="--tint: var(--${p.tint}-bg); --tint-ink: var(--${p.tint}-ink)">`
    + `<div class="ag-card-top"><span class="ag-glyph glyph ${p.glyph}"></span><b>${p.name}</b></div>`
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
      show_comments: "false", show_user: "false", show_reposts: "false", show_playcount: "false", visual: "true", color: "#9be7b8",
    });
    return `<iframe class="ag-embed" src="https://w.soundcloud.com/player/?${params.toString()}" title="Avasa on SoundCloud" width="100%" height="166" style="border:0;border-radius:0.4375rem;display:block" allow="autoplay"></iframe>`;
  };

  const topics = [
    { k: ["hello", "hi there", " hi ", "hey", "who are you", "about you", "who is pallav", "yourself"],
      text: "I'm a scripted guide to Pallav's portfolio, not Pallav himself. He's a UX builder with eight years of shipping research-led products, from early-stage startups to platforms used by millions. Ask about a project, how he works, or how to reach him." },
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
      text: "Eight years across five product teams:", render: renderExperience },
    { k: ["freelance", "hire", "available", "open to work", "full-time", "contract"],
      text: "Open to full-time roles and selected freelance projects — he usually replies within two days.", render: renderContactCard },
    { k: ["contact", "email", "reach", "get in touch", "talk to"],
      text: "Here's the best way in:", render: renderContactCard },
    { k: ["music", "avasa", "soundcloud", "compose", "song", "track"],
      text: "He composes electronic music as Avasa — cinematic, textured, built for late-night focus:", render: renderMusicCard },
    { k: ["book", "reading", "comic"],
      text: "Currently reading The Design of Everyday Things, and a regular comics reader.", render: renderBooksCard },
    { k: ["outside work", "hobby", "hobbies", "free time", "off the clock"],
      text: "Music, comics and books, mostly:", render: () => renderMusicCard() + renderBooksCard() },
  ];
  const fallback = { text: "I don't have a scripted answer for that one yet. Try a question about a project, how Pallav works, or reach him directly:", render: renderContactCard };

  const stripHtml = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent || ""; };
  const match = (text) => {
    const q = ` ${text.toLowerCase()} `;
    return topics.find((topic) => topic.k.some((k) => q.includes(k))) || fallback;
  };

  // 22) Ask AI, full page (agent.html): voice-first chat. Recognition and
  //     speech both run on the browser's own, free Web Speech API — no key,
  //     no server, nothing leaves the device.
  const agentLog = document.getElementById("agentLog");
  const agentForm = document.getElementById("agentForm");
  if (agentLog && agentForm) {
    const agentScroll = document.getElementById("agentScroll");
    const agentInput = document.getElementById("agentInput");
    const agentSuggest = document.getElementById("agentSuggest");
    const agentSend = agentForm.querySelector(".ag-send");
    const agentMic = document.getElementById("agentMic");
    const agentStatus = document.getElementById("agentStatus");
    const agentMute = document.getElementById("agentMute");
    const scrollLog = () => { if (agentScroll) agentScroll.scrollTop = agentScroll.scrollHeight; };

    // --- Speaking: the built-in speech synthesiser reads the short reply
    //     aloud, unless muted — rich cards render visually but aren't read
    //     out word for word. Cancelling any reply already in progress means
    //     a fast tap through the suggestion chips never queues up voices.
    const synth = window.speechSynthesis;
    let muted = false;
    let recognizing = false;
    const setStatus = (text) => { agentStatus.textContent = text; };
    const speak = (html, onDone) => {
      if (!synth || muted) { if (onDone) onDone(); return; }
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(stripHtml(html));
      utter.rate = 1;
      utter.onstart = () => setStatus("Speaking…");
      utter.onend = () => { setStatus(recognizing ? "Listening…" : "Tap to ask"); if (onDone) onDone(); };
      utter.onerror = () => { setStatus(recognizing ? "Listening…" : "Tap to ask"); if (onDone) onDone(); };
      synth.speak(utter);
    };
    if (agentMute) {
      if (!synth) {
        agentMute.hidden = true;
      } else {
        agentMute.addEventListener("click", () => {
          muted = !muted;
          agentMute.setAttribute("aria-pressed", String(muted));
          agentMute.setAttribute("aria-label", muted ? "Unmute spoken replies" : "Mute spoken replies");
          if (muted) synth.cancel();
        });
      }
    }
    const addMessage = (role, content) => {
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
      agentLog.appendChild(turn);
      scrollLog();
      return turn;
    };
    const addTyping = () => {
      const turn = document.createElement("div");
      turn.className = "ag-turn from-agent ag-typing";
      turn.innerHTML = '<span class="ag-who">Guide</span><div class="ag-content" aria-hidden="true"><i></i><i></i><i></i></div>';
      agentLog.appendChild(turn);
      scrollLog();
      return turn;
    };

    // --- Voice mode: a full-screen takeover with one orb that stands in for
    //     the mic. It reuses the same recognition object and the same
    //     match()/render() pipeline as the thread, so opening or closing it
    //     never loses anything — the thread underneath is always the record.
    const agentVoice = document.getElementById("agentVoice");
    const agentVoiceClose = document.getElementById("agentVoiceClose");
    const agentOrbCore = document.getElementById("agentOrbCore");
    const agentVoiceStatus = document.getElementById("agentVoiceStatus");
    const agentVoiceCaption = document.getElementById("agentVoiceCaption");
    const agentVoiceAnswer = document.getElementById("agentVoiceAnswer");
    const agentVoiceAgain = document.getElementById("agentVoiceAgain");
    let voiceOpen = false;

    const setVoiceState = (state) => {
      if (!agentVoice) return;
      agentVoice.dataset.state = state;
      if (state === "listening") {
        agentVoiceStatus.textContent = "Listening…";
        agentVoiceCaption.textContent = "";
        agentVoiceAnswer.innerHTML = "";
        agentVoiceAgain.hidden = true;
      } else if (state === "thinking") {
        agentVoiceStatus.textContent = "Thinking…";
        agentVoiceCaption.textContent = "";
      } else if (state === "speaking") {
        agentVoiceStatus.textContent = "Speaking…";
      } else if (state === "done") {
        agentVoiceStatus.textContent = "Tap to ask another";
        agentVoiceAgain.hidden = false;
      }
    };
    const renderVoiceAnswer = (reply) => {
      if (!agentVoiceAnswer) return;
      const extra = reply.render ? reply.render() : "";
      agentVoiceAnswer.innerHTML = `<p>${reply.text}</p>${extra}`;
    };

    // Mic level: the orb's core scales with real input while listening, via
    // an AnalyserNode on a getUserMedia stream kept open only for the
    // duration of that one listen. Skipped entirely under reduced motion —
    // there's nothing to smooth into if the orb never moves.
    let micStream = null, audioCtx = null, analyser = null, levelRaf = null;
    const startLevel = () => {
      if (reduce.matches || !agentOrbCore || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!recognizing) { stream.getTracks().forEach((t) => t.stop()); return; }
        micStream = stream;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        audioCtx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
          if (agentVoice.dataset.state === "listening") agentOrbCore.style.transform = `scale(${(1 + avg * 0.5).toFixed(3)})`;
          levelRaf = requestAnimationFrame(tick);
        };
        tick();
      }).catch(() => { /* rings alone still show listening state */ });
    };
    const stopLevel = () => {
      if (levelRaf) cancelAnimationFrame(levelRaf);
      levelRaf = null;
      if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
      if (audioCtx) { audioCtx.close(); audioCtx = null; }
      analyser = null;
      if (agentOrbCore) agentOrbCore.style.transform = "";
    };

    const openVoice = () => {
      if (!agentVoice || voiceOpen) return;
      voiceOpen = true;
      agentVoice.hidden = false;
      requestAnimationFrame(() => agentVoice.classList.add("is-open"));
      setVoiceState("listening");
    };
    const closeVoice = () => {
      if (!agentVoice || !voiceOpen) return;
      voiceOpen = false;
      agentVoice.classList.remove("is-open");
      if (recognizing && recognition) recognition.stop();
      if (synth) synth.cancel();
      const finish = () => { agentVoice.hidden = true; };
      if (reduce.matches) finish();
      else agentVoice.addEventListener("transitionend", finish, { once: true });
    };
    if (agentVoiceClose) agentVoiceClose.addEventListener("click", closeVoice);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && voiceOpen) closeVoice(); });
    if (agentVoiceAgain) {
      agentVoiceAgain.addEventListener("click", () => {
        if (!recognition || busy) return;
        if (synth) synth.cancel();
        setVoiceState("listening");
        try { recognition.start(); } catch (err) { /* already running */ }
      });
    }

    let busy = false;
    const ask = (text, viaVoice) => {
      const clean = text.trim();
      if (!clean || busy) return;
      busy = true;
      agentSend.disabled = true;
      if (agentMic) agentMic.disabled = true;
      addMessage("user", clean);
      agentInput.value = "";
      const typing = addTyping();
      if (voiceOpen) setVoiceState("thinking");
      const delay = reduce.matches ? 100 : 650 + Math.random() * 500;
      setTimeout(() => {
        typing.remove();
        const reply = (typeof window.pageAnswer === "function" && window.pageAnswer(clean)) || match(clean);
        addMessage("agent", reply);
        agentSend.disabled = false;
        if (agentMic) agentMic.disabled = !SR;
        busy = false;
        if (voiceOpen) { setVoiceState("speaking"); renderVoiceAnswer(reply); }
        speak(reply.text, () => { if (voiceOpen) setVoiceState("done"); });
        if (!viaVoice) agentInput.focus();
      }, delay);
    };

    agentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      ask(agentInput.value, false);
    });
    if (agentSuggest) {
      agentSuggest.addEventListener("click", (e) => {
        const chip = e.target.closest(".wk-chip");
        if (chip) ask(chip.dataset.q || chip.textContent, false);
      });
    }

    // --- Listening: one utterance at a time (continuous: false), with the
    //     interim words shown live in the status line so it's clear the mic
    //     heard you. Ends the turn on the first final result.
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (agentMic) {
      if (!SR) {
        agentMic.disabled = true;
        agentMic.setAttribute("aria-label", "Voice input isn't supported in this browser");
        setStatus("Voice isn’t supported here — type below");
      } else {
        recognition = new SR();
        recognition.lang = navigator.language || "en-US";
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
          recognizing = true;
          agentMic.setAttribute("aria-pressed", "true");
          setStatus("Listening…");
          if (voiceOpen) setVoiceState("listening");
          startLevel();
        };
        recognition.onresult = (e) => {
          let finalText = "";
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) finalText += t;
            else interim += t;
          }
          if (finalText) {
            recognition.stop();
            ask(finalText, true);
          } else if (interim) {
            setStatus(interim);
            if (voiceOpen) agentVoiceCaption.textContent = interim;
          }
        };
        recognition.onerror = (e) => {
          recognizing = false;
          agentMic.setAttribute("aria-pressed", "false");
          stopLevel();
          let msg = "Tap to ask";
          if (e.error === "not-allowed" || e.error === "service-not-allowed") {
            msg = "Microphone access is blocked — type below";
          } else if (e.error === "no-speech") {
            msg = "Didn’t catch that — tap to try again";
          }
          setStatus(msg);
          if (voiceOpen) agentVoiceStatus.textContent = msg;
        };
        recognition.onend = () => {
          recognizing = false;
          agentMic.setAttribute("aria-pressed", "false");
          stopLevel();
          if (agentStatus.textContent === "Listening…") setStatus("Tap to ask");
        };

        agentMic.addEventListener("click", () => {
          if (busy) return;
          if (recognizing) { recognition.stop(); return; }
          if (synth) synth.cancel();
          openVoice();
          try { recognition.start(); } catch (err) { /* already running */ }
        });
      }
    }

  }

  // 23) Ask AI panel: on every page except agent.html, the nav's "Ask AI"
  //     button opens an in-page side panel instead of navigating away —
  //     text only, no mic, reusing the exact same topics/render pipeline as
  //     the full-page chat above. Opening it also pulls the whole page back
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

    let askBusy = false;
    const askAsk = (text) => {
      const clean = text.trim();
      if (!clean || askBusy) return;
      askBusy = true;
      askSend.disabled = true;
      addAskMessage("user", clean);
      askInput.value = "";
      const typing = addAskTyping();
      const delay = reduce.matches ? 100 : 500 + Math.random() * 400;
      setTimeout(() => {
        typing.remove();
        const reply = (typeof window.pageAnswer === "function" && window.pageAnswer(clean)) || match(clean);
        addAskMessage("agent", reply);
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
    const openAsk = () => {
      if (askOpen) return;
      askOpen = true;
      const hold = holdInPlace(askTrigger);
      askPanel.hidden = false;
      askPanel.inert = false;
      document.body.classList.add("ask-open");
      hold();
      void askPanel.offsetWidth;
      askPanel.classList.add("is-open");
      askTriggers.forEach((t) => t.setAttribute("aria-expanded", "true"));
      if (reduce.matches) askInput.focus();
      else askPanel.addEventListener("transitionend", () => askInput.focus(), { once: true });
    };
    // Closing sound: plays however the panel closes (close button, the AI
    // button again, or Escape).
    const closeSound = new Audio("/assets/audio/sound-effects/chat-close.mp3");
    const closeAsk = () => {
      if (!askOpen) return;
      askOpen = false;
      closeSound.currentTime = 0;
      closeSound.play().catch(() => {});
      const hold = holdInPlace(askTrigger);
      askPanel.classList.remove("is-open");
      askPanel.inert = true;
      document.body.classList.remove("ask-open");
      hold();
      askTriggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
      const finish = () => { askPanel.hidden = true; };
      if (reduce.matches) finish();
      else askPanel.addEventListener("transitionend", finish, { once: true });
      askTrigger.focus({ preventScroll: true });
    };
    askTriggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
    const askSound = new Audio("/assets/audio/sound-effects/chat-open.wav");
    askTriggers.forEach((t) => {
      t.addEventListener("click", () => {
        askTrigger = t; // focus returns here when the panel closes
        if (askOpen) { closeAsk(); return; } // closeAsk plays the closing sound
        askSound.currentTime = 0;
        askSound.play().catch(() => {});
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
  //      from tangled to straight in one smooth ease-in-out (2.4s), and each
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
        jobs.forEach((li, i) => setTimeout(() => lit(li), 140 * i));
        setTimeout(finish, 140 * jobs.length + 700);
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
      const dur = 2400, t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / dur), p = ease(t);
        line.style.strokeDashoffset = String(1 - p);
        at.forEach((f, i) => {
          if (p >= f - 0.003) { lit(nodes[i]); lit(jobs[i]); if (i === nodes.length - 1) lit(ring); }
        });
        if (t < 1) requestAnimationFrame(frame);
        else { lit(next); setTimeout(finish, 900); }
      };
      requestAnimationFrame(frame);
    };
    const pathIo = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { pathIo.disconnect(); run(); }
    }, { threshold: 0.4 });
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




