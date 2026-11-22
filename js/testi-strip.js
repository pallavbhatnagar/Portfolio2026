/* Testimonials strip (css/testi-strip.css), wide screens. Pointing at a
   portrait, focusing it or tapping it opens it; only one is open at a
   time. The video panel is the resting state: open on load, reopened when
   the pointer leaves the strip. Its clip loads and plays (muted) only
   while it is open and on screen; motion reduced or Calm keeps it paused. */
(() => {
  const strip = document.querySelector(".tstrip");
  if (!strip) return;
  const panels = Array.from(strip.querySelectorAll(".tpanel"));
  if (!panels.length) return;
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "calm";
  const vPanel = strip.querySelector(".tpanel--video");
  const vid = vPanel && vPanel.querySelector("video");
  let userPaused = false, seen = false;
  const playVideo = () => {
    if (!vid || !seen || userPaused || still() || getComputedStyle(strip).display === "none") return;
    if (vid.preload === "none") { vid.preload = "auto"; vid.load(); }
    vid.play().catch(() => {});
  };
  const open = (panel) => {
    panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle("is-active", on);
      p.querySelector(".tbody")?.setAttribute("aria-hidden", String(!on));
    });
    if (vid) { if (panel === vPanel) playVideo(); else vid.pause(); }
  };
  if (vid && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      seen = en.isIntersecting;
      if (seen && vPanel.classList.contains("is-active")) playVideo(); else if (!seen) vid.pause();
    }, { threshold: 0.5 }).observe(vPanel);
  }
  const rest = strip.querySelector(".tpanel[data-default]") || panels[0];
  strip.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") open(rest); });
  if (vid) {
    const playBtn = vPanel.querySelector(".tplay"), muteBtn = vPanel.querySelector(".tmute");
    const syncMute = () => { if (!muteBtn) return; muteBtn.setAttribute("aria-pressed", String(vid.muted)); muteBtn.setAttribute("aria-label", vid.muted ? "Unmute" : "Mute"); };
    let heard = false;
    const soundOn = () => { vid.muted = false; if (!heard) { heard = true; vid.currentTime = 0; } if (vid.paused) { userPaused = false; vid.play().catch(() => {}); } };
    muteBtn?.addEventListener("click", (e) => { e.stopPropagation(); if (vid.muted) soundOn(); else vid.muted = true; });
    vid.addEventListener("click", () => { if (vPanel.classList.contains("is-active") && vid.muted) soundOn(); });
    vid.addEventListener("volumechange", syncMute); syncMute();
    const syncPlay = () => { const playing = !vid.paused && !vid.ended; vPanel.classList.toggle("is-playing", playing); playBtn?.setAttribute("aria-label", playing ? "Pause video" : "Play video"); };
    playBtn?.addEventListener("click", (e) => { e.stopPropagation(); userPaused = !vid.paused; if (vid.paused) vid.play().catch(() => {}); else vid.pause(); });
    ["play", "pause", "ended"].forEach((ev) => vid.addEventListener(ev, syncPlay)); syncPlay();
  }
  panels.forEach((p) => {
    p.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") open(p); });
    p.addEventListener("focus", () => open(p));
    p.addEventListener("click", () => open(p));
  });
  open(rest);
  // Entrance: reveal once on screen (the CSS hides the panels until then).
  if ("IntersectionObserver" in window) new IntersectionObserver(([en], o) => { if (en.isIntersecting) { strip.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.2 }).observe(strip);
  else strip.classList.add("is-in");
})();

/* Phones: dots under the testimonial row. They follow the carousel (which
   moves its track with a transform, script.js) and a tap on one steps the
   carousel there with its own arrows, so it eases the same way. */
(() => {
  const view = document.querySelector(".tq-view");
  const track = view && view.querySelector(".tq-track");
  if (!track) return;
  const cards = () => Array.from(track.children).filter((c) => getComputedStyle(c).display !== "none");
  const dots = document.createElement("div");
  dots.className = "tq-dots";
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Choose a testimonial");
  view.after(dots);
  const at = () => {
    const vx = view.getBoundingClientRect().left + parseFloat(getComputedStyle(view).paddingLeft || 0);
    let best = 0, bestD = Infinity;
    cards().sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).forEach((c, i) => { const d = Math.abs(c.getBoundingClientRect().left - vx); if (d < bestD) { bestD = d; best = i; } });
    return best;
  };
  const build = () => {
    const n = cards().length;
    if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, (_, i) => `<button class="tq-dot" type="button" aria-label="Testimonial ${i + 1} of ${n}"></button>`).join("");
    const cur = at();
    Array.from(dots.children).forEach((d, i) => d.setAttribute("aria-current", String(i === cur)));
  };
  dots.addEventListener("click", (e) => {
    const b = e.target.closest(".tq-dot"); if (!b) return;
    const to = Array.from(dots.children).indexOf(b), from = at();
    const arrow = document.querySelector(`.tq-arrow[data-dir="${to > from ? 1 : -1}"]`);
    for (let i = 0; i < Math.abs(to - from); i++) arrow?.click();
  });
  let queued = false;
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; build(); }); } };
  new MutationObserver(queue).observe(track, { attributes: true, attributeFilter: ["style"] });
  addEventListener("resize", queue);
  build();
})();
