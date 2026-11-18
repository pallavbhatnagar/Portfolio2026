/* Work page: "In numbers" (css/works-stats.css). Three cards with a clipped
   corner, a pixel-dot mark, a number that rolls up like an odometer, a line
   of context, and a small isometric line drawing of what it counts:
   five years as a staircase, forty-plus shipped as a stack of plates,
   two hundred-plus sessions as a dial. The drawings are built here as SVG
   and use the theme's colours. It plays once, when the band scrolls into
   view; Calm and reduced motion show it finished. */
(() => {
  const band = document.querySelector(".ws");
  if (!band) return;
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "calm";

  // ---------- The number ----------
  band.querySelectorAll(".ws-num[data-n]").forEach((el) => {
    const n = el.dataset.n, suf = el.dataset.suf || "";
    el.setAttribute("aria-label", n + suf);
    el.innerHTML = [...n].map((d, c) => `<span class="ws-col" aria-hidden="true" style="--to:${+d + 10};--c:${c}"><span class="ws-sz">${d}</span><span class="ws-strip">${"01234567890123456789".split("").map((x) => `<span>${x}</span>`).join("")}</span></span>`).join("") + `<span class="ws-suf" aria-hidden="true">${suf}</span>`;
  });

  // ---------- Pixel-dot marks (a 4x4 grid, a different pattern each) ----------
  const PX = ["0001001101111111", "1011010110100101", "0001001001001000"];
  band.querySelectorAll(".ws-px").forEach((el) => {
    const pat = PX[+el.dataset.px] || PX[0];
    el.innerHTML = [...pat].map((b) => `<i${b === "1" ? ' class="on"' : ""}></i>`).join("");
  });

  // ---------- Isometric drawings ----------
  const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
  const P = (o, x, y, z) => [o.x + (x - y) * C30 * o.s, o.y + (x + y) * S30 * o.s - z * o.s];
  const pts = (a) => a.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  // A box: its top, left (front) and right faces.
  const box = (o, x, y, z, w, d, h, cls = "", i = 0) => {
    const top = [P(o, x, y, z + h), P(o, x + w, y, z + h), P(o, x + w, y + d, z + h), P(o, x, y + d, z + h)];
    const left = [P(o, x, y + d, z), P(o, x + w, y + d, z), P(o, x + w, y + d, z + h), P(o, x, y + d, z + h)];
    const right = [P(o, x + w, y, z), P(o, x + w, y + d, z), P(o, x + w, y + d, z + h), P(o, x + w, y, z + h)];
    return `<g class="ws-box ${cls}" style="--i:${i}"><polygon class="f-l" points="${pts(left)}"/><polygon class="f-r" points="${pts(right)}"/><polygon class="f-t" points="${pts(top)}"/></g>`;
  };
  const label = (o, x, y, z, text, cls = "") => { const [px, py] = P(o, x, y, z); return `<text class="ws-lbl ${cls}" x="${px.toFixed(1)}" y="${py.toFixed(1)}" transform="rotate(-30 ${px.toFixed(1)} ${py.toFixed(1)}) skewX(30)">${text}</text>`; };
  const guide = (o, a, b) => { const [x1, y1] = P(o, ...a), [x2, y2] = P(o, ...b); return `<line class="ws-guide" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; };

  const SCENES = {
    // Five years: a staircase of five steps, the last one marked "Now".
    steps: () => {
      const o = { x: 86, y: 59, s: 22 };
      let g = guide(o, [0, 0, 0], [0, 0, 4.2]) + guide(o, [0, 1.4, 0], [5.6, 1.4, 0]) + guide(o, [5, 0, 0], [5, 0, 4.2]);
      for (let i = 0; i < 5; i++) g += box(o, i, 0, 0, 1, 1.4, 0.75 * (i + 1), i === 4 ? "is-key" : "", i);
      g += label(o, 0.12, 1.25, 0.75, "2021") + label(o, 4.12, 1.25, 3.75, "Now", "is-key");
      return g;
    },
    // Forty-plus shipped: a stack of plates, each one released, the top one live.
    stack: () => {
      const o = { x: 120, y: 89, s: 15 };
      let g = guide(o, [0, 0, 0], [0, 0, 5.6]) + guide(o, [3.2, 3.2, 0], [3.2, 3.2, 5.6]);
      for (let i = 0; i < 5; i++) g += box(o, 0, 0, i * 1.05, 3.2, 3.2, 0.42, i === 4 ? "is-key" : "", i);
      g += label(o, 0.25, 2.95, 4.62, "Shipped", "is-key");
      return g;
    },
    // Two hundred-plus sessions: a flat dial seen at an angle, its ring
    // filling, the count in the middle.
    dial: () => {
      const cx = 120, cy = 82, rx = 96, ry = 48;
      const arc = (r1, r2, a0, a1) => { const p = (a, rr, k) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * k]; const [x0, y0] = p(a0, r1, ry / rx), [x1, y1] = p(a1, r1, ry / rx), [x2, y2] = p(a1, r2, ry / rx), [x3, y3] = p(a0, r2, ry / rx); const lg = a1 - a0 > Math.PI ? 1 : 0; return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r1} ${(r1 * ry / rx).toFixed(1)} 0 ${lg} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${r2} ${(r2 * ry / rx).toFixed(1)} 0 ${lg} 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z`; };
      return `<ellipse class="ws-plate" cx="${cx}" cy="${cy + 9}" rx="${rx}" ry="${ry}"/><ellipse class="ws-face" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`
        + `<path class="ws-ring" d="${arc(rx - 4, rx - 18, Math.PI * 0.75, Math.PI * 2.25)}"/>`
        + `<path class="ws-ring-on" d="${arc(rx - 4, rx - 18, Math.PI * 0.75, Math.PI * 1.95)}"/>`
        + `<ellipse class="ws-face" cx="${cx}" cy="${cy}" rx="${rx - 26}" ry="${ry - 13}"/>`
        + `<text class="ws-lbl is-key" x="${cx}" y="${cy - 4}" text-anchor="middle">Sessions</text><text class="ws-big" x="${cx}" y="${cy + 14}" text-anchor="middle">200+</text>`;
    },
  };
  band.querySelectorAll(".ws-art[data-scene]").forEach((el) => {
    const f = SCENES[el.dataset.scene];
    if (f) el.innerHTML = `<svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet">${f()}</svg>`;
  });

  const go = () => band.classList.add("is-on");
  if (calm() || !("IntersectionObserver" in window)) { band.classList.add("is-on", "is-still"); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.3 });
  io.observe(band);
})();
