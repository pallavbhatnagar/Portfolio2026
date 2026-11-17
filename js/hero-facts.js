/* Home hero: the three facts as rolling counters. Digits roll like an
   odometer, the letters of "UX" roll through the alphabet, and each sticker
   springs in once its number lands. Phones get an endless ticker strip of
   the same facts instead. Built from the facts in index.html (.hc-facts),
   which stay as the fallback without scripts. Calm and reduced motion show
   the final values at once. Styles: css/hero-facts.css. */
(() => {
  const view = document.querySelector(".hc-facts-view");
  if (!view) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const calm = () => reduce.matches || document.documentElement.dataset.motion === "calm";
  const src = [...view.querySelectorAll(".hc-facts:not(.hc-facts-copy) .hc-fact")];
  const STK = [["#c3cff9", "#1b1b39", -6], ["#cfe7b0", "#215452", 7], ["#fbd0e4", "#7a1f4f", -8]];
  // The facts, with the number split out where there is one.
  const F = src.map((li, i) => ({
    icon: li.querySelector(".hc-fact-ic").innerHTML,
    title: li.querySelector("b").textContent.trim(),
    sub: li.querySelector(".hc-fact-txt span").textContent.trim(),
    bg: STK[i][0], ink: STK[i][1], tilt: STK[i][2], i,
  }));
  const BIG = [{ n: 10, pre: "", suf: "+", unit: "Projects" }, { n: 5, pre: "", suf: "+", unit: "Years in UX" }, { n: null, word: "UX", unit: "Certified" }];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sticker = (f, cls = "") => `<span class="fl-stk ${cls}" style="--bg:${f.bg};--ink:${f.ink};--tilt:${f.tilt}deg" aria-hidden="true">${f.icon}</span>`;

  const V = {
    // Counters, refined: digits roll like an odometer, the letters of "UX"
    // roll through the alphabet, and each sticker springs on once its
    // number lands. Phones get the ticker strip instead.
    counters: () => {
      const DIG = "0123456789", ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let c = 0;
      const col = (set, ch, loop) => { const to = set.indexOf(ch) + (loop ? set.length : 0); const strip = (loop ? set + set : set); return `<span class="od-c" style="--to:${to};--c:${c++}"><span class="od-sz">${ch}</span><span class="od-strip">${[...strip].map((x, k) => `<span${k === to ? ' class="t"' : ""}>${x}</span>`).join("")}</span></span>`; };
      const od = (str) => { c = 0; return [...str].map((ch) => /[0-9]/.test(ch) ? col(DIG, ch, true) : /[A-Z]/.test(ch) ? col(ABC, ch, false) : `<span class="od-s">${ch}</span>`).join(""); };
      const NUM = ["10+", "5+", "UX"], UNIT = ["Projects", "Years in UX", "Certified"], SUB = [F[0].sub, "Of contribution and learning", F[2].sub];
      const run = F.map((f) => `<li>${sticker(f, "is-sm")}<b>${esc(f.title)}</b><span>${esc(f.sub)}</span></li><li class="fl-star" aria-hidden="true">✦</li>`).join("");
      return `<div class="fl fl-cx">
        <ul class="fl-counters">${F.map((f, i) => `<li style="--i:${i}">
          <span class="fl-num"><span class="sr-only">${NUM[i]}</span><span class="od" aria-hidden="true">${od(NUM[i])}</span>${sticker(f, "is-pop")}</span>
          <span class="fl-txt"><b>${esc(UNIT[i])}</b><span>${esc(SUB[i])}</span></span></li>`).join("")}</ul>
        <div class="fl-ticker"><ul class="fl-run">${run}</ul><ul class="fl-run" aria-hidden="true">${run}</ul></div>
      </div>`;
    },
  };

  const countUp = (root) => root.querySelectorAll(".fl-d[data-to]").forEach((el, k) => {
    const to = +el.dataset.to, suf = el.dataset.suf || "";
    if (calm()) return;
    const t0 = performance.now() + k * 120;
    const step = (t) => { const p = Math.max(0, Math.min(1, (t - t0) / 1100)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); };
    el.textContent = "0" + suf; requestAnimationFrame(step);
  });

  const roll = (root) => {
    const items = [...root.querySelectorAll(".fl-counters > li")];
    if (calm()) { items.forEach((li) => li.classList.add("is-rolled", "no-anim")); root.querySelectorAll(".od-c").forEach((c) => c.classList.add("is-landed")); return; }
    // Wait for the hero to finish rising in (hero.js adds .is-in to .hc;
    // the facts fade up about a second later), so the roll is seen.
    const start = () => setTimeout(() => items.forEach((li) => li.classList.add("is-rolled")), 1150);
    // Once a column lands, the characters around it fade away.
    root.querySelectorAll(".od-strip").forEach((s) => s.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") s.parentElement.classList.add("is-landed"); }));
    const hc = document.querySelector(".hc");
    if (!hc || hc.classList.contains("is-in")) requestAnimationFrame(() => requestAnimationFrame(start));
    else { const mo = new MutationObserver(() => { if (hc.classList.contains("is-in")) { mo.disconnect(); start(); } }); mo.observe(hc, { attributes: true, attributeFilter: ["class"] }); }
  };
  const host = document.createElement("div");
  host.className = "fl-host";
  view.after(host);
  document.documentElement.classList.add("has-hero-facts");
  host.innerHTML = V.counters();
  requestAnimationFrame(() => { host.firstElementChild.classList.add("is-in"); roll(host); });
})();
