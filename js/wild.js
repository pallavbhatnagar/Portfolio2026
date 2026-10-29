/* Home extras: Designer's eye (a blueprint view with a layout grid,
   outlines and an inspector), the playable "messy" in the hero, and light
   on the project cards. Styles in css/wild.css. */
(() => {
  const html = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  // ---------- Designer's eye ----------
  // The grid sits exactly over the page's content column (measured from the
  // Selected work header, the same width as every section), so its outer
  // edges and its middle gutter meet the content's edges and each project
  // card's split: 12 columns with 16px gutters on wide screens, 8 on
  // tablets, 4 on phones. The inspector names what the pointer is on: its
  // tag, its type and its size.
  const KEY = "designers-eye";
  const grid = document.createElement("div");
  grid.className = "bp-grid";
  grid.setAttribute("aria-hidden", "true");
  const box = document.createElement("div");
  box.className = "bp-box";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = '<span class="bp-label"></span>';
  const label = box.firstChild;
  const btn = document.createElement("button");
  btn.className = "bp-toggle";
  btn.type = "button";
  btn.setAttribute("aria-pressed", "false");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity=".55"/></svg>';
  btn.setAttribute("aria-label", "Designer's eye: show the layout grid and inspect the page");
  btn.title = "Designer's eye";
  document.body.append(grid, box, btn);

  // Full width, 12 columns in all (4 on phones): the content takes the
  // middle ones and each side margin the same number, so the content's
  // edges land on column lines and the two margins read as equal. The split
  // is the one where the margin columns come out closest in width to the
  // content's (at 1440px: 3, 6, 3). A red measure on each margin gives its
  // width and count.
  const layoutGrid = () => {
    const ref = document.querySelector(".proj-head") || document.querySelector("main") || document.body;
    const r = ref.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const total = vw <= 640 ? 4 : 12;
    const g = vw <= 640 ? 12 : 16;
    const margin = r.left;
    let k = 0, best = Infinity;
    for (let m = 0; m * 2 < total; m++) {
      const c = total - 2 * m;
      const cw = (r.width - (c - 1) * g) / c, mw = m ? margin / m - g : 0;
      if (m && mw < 8) break;
      const diff = m ? Math.abs(cw - mw) : (margin > g ? Infinity : 0);
      if (diff < best) { best = diff; k = m; }
    }
    const n = total - 2 * k;
    const pitch = (r.width + g) / n; // one content column plus its gutter
    const cols = [];
    // Margin columns: k of them, each followed by a gutter, so the last
    // gutter meets the content's edge.
    const mw = k ? margin / k - g : 0;
    for (let i = 0; i < k; i++) cols.push([i * (mw + g), mw, "is-margin"]);
    for (let i = 0; i < n; i++) cols.push([r.left + i * pitch, pitch - g, ""]);
    for (let i = 0; i < k; i++) cols.push([r.right + g + i * (mw + g), mw, "is-margin"]);
    const side = (x, w) => `<i class="bp-measure" style="left:${x}px;width:${w}px"><b>${Math.round(margin)}px${k ? `, ${k} column${k > 1 ? "s" : ""}` : ""}</b></i>`;
    grid.innerHTML = cols.map(([x, w, c]) => `<span class="${c}" style="left:${x.toFixed(2)}px;width:${w.toFixed(2)}px"></span>`).join("")
      + (margin > 4 ? side(0, margin) + side(r.right, vw - r.right) : "");
  };

  const PICK = "h1, h2, h3, h4, p, a, button, img, li, figure, label, input, .project, .project-panel, .hc-sign, .hc-ask, .value-panel, .tq-card, .next-ch";
  const describe = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const tag = el.classList.contains("project") ? "card" : el.tagName.toLowerCase();
    const font = cs.fontFamily.split(",")[0].replace(/["']/g, "");
    const size = `${Math.round(parseFloat(cs.fontSize))} / ${cs.lineHeight === "normal" ? "auto" : Math.round(parseFloat(cs.lineHeight))}`;
    const typed = /^(h\d|p|a|button|li|label)$/.test(tag);
    return { r, parts: [tag, typed ? `${font} ${size}` : "", `${Math.round(r.width)} × ${Math.round(r.height)}`].filter(Boolean) };
  };
  let current = null;
  const inspect = (el) => {
    if (!el || el === current) return;
    current = el;
    const { r, parts } = describe(el);
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;
    label.innerHTML = parts.map((p) => `<span>${p}</span>`).join("");
    label.classList.toggle("is-below", r.top < 40);
    box.classList.add("is-on");
  };
  const onMove = (e) => {
    const el = e.target.closest && e.target.closest(PICK);
    if (!el || el.closest(".bp-toggle, .dsp, .ask-panel, .site-header")) { box.classList.remove("is-on"); current = null; return; }
    inspect(el);
  };
  const onScroll = () => { if (current) { const c = current; current = null; inspect(c); } };

  const setEye = (on) => {
    html.classList.toggle("bp-on", on);
    btn.setAttribute("aria-pressed", String(on));
    if (on) {
      layoutGrid();
      document.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    } else {
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      box.classList.remove("is-on");
      current = null;
    }
  };
  btn.addEventListener("click", () => setEye(!html.classList.contains("bp-on")));
  document.addEventListener("keydown", (e) => {
    if ((e.key !== "g" && e.key !== "G") || document.documentElement.clientWidth <= 1024 || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea, [contenteditable]")) return;
    setEye(!html.classList.contains("bp-on"));
  });
  window.addEventListener("resize", () => { if (html.classList.contains("bp-on")) layoutGrid(); });
  // Every visit starts with it off (it used to be remembered; clear that).
  try { localStorage.removeItem(KEY); } catch (e) { /* private mode */ }

  // ---------- "messy", playable ----------
  // Each visit to the word picks fresh positions for the letters, so it
  // never scatters the same way twice.
  const mess = document.querySelector(".hc-mess");
  if (mess) {
    const letters = () => Array.from(mess.querySelectorAll(".ch"));
    let busy = false, settleTimer = 0;
    const scatter = () => {
      if (busy || reduce.matches || !document.querySelector(".hc.mess-go")) return;
      busy = true;
      clearTimeout(settleTimer);
      letters().forEach((c) => {
        c.style.setProperty("--x", ((Math.random() * 2 - 1) * 12).toFixed(1));
        c.style.setProperty("--y", ((Math.random() * 2 - 1) * 28).toFixed(1));
        c.style.setProperty("--r", ((Math.random() * 2 - 1) * 38).toFixed(1));
      });
      mess.classList.remove("is-settle");
      mess.classList.add("is-scatter");
    };
    const settle = () => {
      if (!busy) return;
      mess.classList.remove("is-scatter");
      mess.classList.add("is-settle");
      settleTimer = setTimeout(() => { mess.classList.remove("is-settle"); busy = false; }, 1400);
    };
    mess.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") scatter(); });
    mess.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") setTimeout(settle, 180); });
    mess.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") { scatter(); setTimeout(settle, 650); } });
  }

  // ---------- Light on the project cards ----------
  const cards = Array.from(document.querySelectorAll(".proj-stack .project"));
  const wire = (card) => {
    const img = card.querySelector(".project-shot img");
    let raf = 0, last = null;
    const paint = () => {
      raf = 0;
      if (!last) return;
      const r = card.getBoundingClientRect();
      const x = (last.clientX - r.left) / r.width, y = (last.clientY - r.top) / r.height;
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      if (img) img.style.transform = `scale(1.04) translate(${((0.5 - x) * 10).toFixed(1)}px, ${((0.5 - y) * 8).toFixed(1)}px)`;
    };
    card.addEventListener("pointermove", (e) => {
      if (!fine.matches || reduce.matches) return;
      last = e;
      card.classList.add("is-lit");
      if (!raf) raf = requestAnimationFrame(paint);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-lit");
      last = null;
      if (img) img.style.transform = "";
    });
  };
  // The cards are drawn by render.js; wait for them if they're not in yet.
  if (cards.length) cards.forEach(wire);
  else {
    const stack = document.getElementById("projStack");
    if (stack) new MutationObserver((_, mo) => { const c = stack.querySelectorAll(".project"); if (c.length) { mo.disconnect(); c.forEach(wire); } }).observe(stack, { childList: true });
  }
})();
