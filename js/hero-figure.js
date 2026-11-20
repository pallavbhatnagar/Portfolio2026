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
