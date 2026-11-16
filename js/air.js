/* Ask Resilinc case study (works/askresilinc.html) only.
   - Tabs ([data-air-tabs]): click, or arrow keys / Home / End to move.
     The vertical one (the key findings explorer) also follows the arrow
     keys up and down.
   - The response library ([data-air-lib]): filter chips by rule family.
   - Sections are <details> rows; a link that points inside a closed one
     (a citation, a "ways in" link, the chapter list) opens it first, so
     the jump lands on the right place. */
(() => {
  const root = document.querySelector('.cs[data-slug="askresilinc"]');
  if (!root) return;

  // ---------- Tabs ----------
  root.querySelectorAll("[data-air-tabs]").forEach((box) => {
    const list = box.querySelector('[role="tablist"]');
    const btns = Array.from(list.querySelectorAll('[role="tab"]'));
    const vertical = list.getAttribute("aria-orientation") === "vertical";
    const select = (k, focus) => {
      btns.forEach((b, i) => {
        const on = i === k;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(b.getAttribute("aria-controls"));
        if (panel) { panel.hidden = !on; if (on) { panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in"); } }
      });
      if (focus) btns[k].focus();
      // Keep the chosen tab in view inside a sideways-scrolling tab row,
      // without moving the page.
      const b = btns[k];
      if (list.scrollWidth > list.clientWidth + 1) {
        const left = b.offsetLeft - list.offsetLeft - 8;
        if (left < list.scrollLeft || b.offsetLeft - list.offsetLeft + b.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollTo({ left, behavior: "smooth" });
      }
      if (box.airRestart) box.airRestart();
    };
    box.airSelect = select;
    box.airIndex = () => btns.findIndex((b) => b.getAttribute("aria-selected") === "true");
    btns.forEach((b, i) => b.addEventListener("click", () => select(i, false)));
    list.addEventListener("keydown", (e) => {
      const k = btns.indexOf(document.activeElement);
      if (k < 0) return;
      const next = vertical ? ["ArrowDown", "ArrowRight"] : ["ArrowRight", "ArrowDown"];
      const prev = vertical ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft", "ArrowUp"];
      let to = -1;
      if (next.includes(e.key)) to = (k + 1) % btns.length;
      else if (prev.includes(e.key)) to = (k - 1 + btns.length) % btns.length;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = btns.length - 1;
      if (to < 0) return;
      e.preventDefault();
      select(to, true);
    });
  });

  // ---------- Key findings: one by one, with a progress line ----------
  // The active finding's line fills over a few seconds, then the next one
  // takes over. It runs only while the explorer is on screen, holds while
  // the pointer is over it or focus is inside it (CSS pauses the line), and
  // doesn't run at all with motion reduced or in Calm.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.querySelectorAll(".air-explorer[data-air-tabs]").forEach((box) => {
    const btns = Array.from(box.querySelectorAll('[role="tab"]'));
    btns.forEach((b) => { const bar = document.createElement("span"); bar.className = "air-tab-bar"; bar.setAttribute("aria-hidden", "true"); bar.appendChild(document.createElement("i")); b.appendChild(bar); });
    let seen = false;
    const sync = () => box.classList.toggle("is-running", seen && !reduce.matches);
    box.airRestart = () => { box.classList.remove("is-running"); void box.offsetWidth; sync(); };
    box.classList.add("is-auto");
    box.addEventListener("animationend", (e) => {
      if (!e.target.closest(".air-tab-bar") || e.animationName !== "air-run") return;
      box.airSelect((box.airIndex() + 1) % btns.length, false);
    });
    reduce.addEventListener("change", sync);
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.4 }).observe(box);
  });

  // ---------- Response library filters ----------
  root.querySelectorAll("[data-air-lib]").forEach((lib) => {
    const chips = Array.from(lib.querySelectorAll("[data-air-filter]"));
    const pairs = Array.from(lib.querySelectorAll(".air-pair"));
    const none = lib.querySelector(".air-lib-none");
    chips.forEach((c) => c.addEventListener("click", () => {
      const f = c.dataset.airFilter;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      let shown = 0;
      pairs.forEach((p) => {
        const on = !f || (p.dataset.fam || "").split(" ").includes(f);
        p.hidden = !on;
        if (on) { shown++; p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); }
      });
      if (none) none.hidden = shown > 0;
    }));
  });

  // ---------- Open a closed section before jumping into it ----------
  const openFor = (id) => {
    const el = id && document.getElementById(id);
    if (!el) return null;
    let d = el.closest("details");
    while (d) { d.open = true; d = d.parentElement && d.parentElement.closest("details"); }
    if (el.tagName === "DETAILS") el.open = true;
    return el;
  };
  // Runs before case.js's own in-page jump handler (capture), which then
  // leaves the jump to this one.
  document.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const wasClosed = !!(document.getElementById(id) && document.getElementById(id).closest("details:not([open])"));
    const el = openFor(id);
    if (!el) return;
    // Opening changes the layout (and glides open over about half a
    // second), so jump straight there, then settle once it has opened.
    e.preventDefault();
    history.replaceState(history.state, "", "#" + id);
    const go = () => el.scrollIntoView({ block: "start" });
    requestAnimationFrame(go);
    if (wasClosed) setTimeout(go, 520);
  }, true);
  if (location.hash) {
    const el = openFor(decodeURIComponent(location.hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }
})();
