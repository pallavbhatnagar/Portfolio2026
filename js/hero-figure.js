/* The Home hero figure (css/hero-figure.css): places the blue blueprint
   window once, open and still. No animation. */
(() => {
  const fig = document.querySelector(".hx-fig");
  if (!fig) return;
  const svg = fig.querySelector("svg");
  const [, , VW, VH] = svg.getAttribute("viewBox").split(" ").map(Number);
  const W = VW * 0.46, H = VH * 0.5, x = VW * 0.5 - W / 2, y = VH * 0.5 - H / 2;
  fig.querySelectorAll(".hx-win-rect, .hx-win-edge").forEach((r) => { r.setAttribute("x", x.toFixed(1)); r.setAttribute("y", y.toFixed(1)); r.setAttribute("width", W.toFixed(1)); r.setAttribute("height", H.toFixed(1)); });
})();

/* Tablets (641-1024px): the blueprint sits under the end of the headline
   the way it does on desktop, its top level with the second line and that
   line running about two thirds of the way across it. Measured, since the
   headline's width changes with the screen. */
(() => {
  const fig = document.querySelector(".hx-fig");
  const line = document.querySelectorAll(".hc-title .hc-line")[1];
  const win = fig && fig.querySelector(".hx-win-edge");
  if (!fig || !line || !win) return;
  const tablet = matchMedia("(min-width: 641px) and (max-width: 1024px)");
  const textRect = () => { const n = [...line.childNodes].filter((x) => !(x.nodeType === 1 && x.classList.contains("hs"))); if (!n.length) return null; const r = document.createRange(); r.setStartBefore(n[0]); r.setEndAfter(n[n.length - 1]); return r.getBoundingClientRect(); };
  const place = () => {
    fig.style.translate = "";
    if (!tablet.matches) return;
    const t = textRect(), w = win.getBoundingClientRect();
    if (!t || !w.width) return;
    let dx = (t.right - 0.5 * w.width) - w.left, dy = (t.top - 7) - w.top;
    fig.style.translate = `${Math.round(dx)}px ${Math.round(dy)}px`;
    // A second pass corrects for anything the first move shifted.
    const w2 = win.getBoundingClientRect(), t2 = textRect();
    dx += (t2.right - 0.5 * w2.width) - w2.left; dy += (t2.top - 7) - w2.top;
    fig.style.translate = `${Math.round(dx)}px ${Math.round(dy)}px`;
  };
  const later = () => requestAnimationFrame(() => requestAnimationFrame(place));
  if (document.readyState === "complete") later(); else addEventListener("load", later);
  document.fonts?.ready.then(later);
  tablet.addEventListener?.("change", later);
  let t = 0; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(place, 120); });
})();
