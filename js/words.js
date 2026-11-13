/* Home's first-screen fade with "Explore more" (below), and words that
   light up, dim to full ink.
   data-words="load": the hero description; CSS brightens its words one after
   another once the hero has arrived (.hc.is-in).
   data-words="scroll": the projects description; once it is well into view
   its words brighten one after another, and stay lit.
   With motion reduced or in Calm, every word is simply lit. */
(() => {
  // Home, at the very top: a gradient of the page colour rises from the
  // bottom of the screen over the start of the projects, with "Explore
  // more" on it (a link down to them). Once you scroll, both fade out
  // slowly; back at the top, they return.
  if (document.getElementById("projects")) {
    const fade = document.createElement("div");
    fade.className = "home-fade";
    fade.setAttribute("aria-hidden", "true");
    const more = document.createElement("a");
    more.className = "explore-more";
    more.href = "#projects";
    more.innerHTML = 'Explore more<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5 8 10.5 12 6.5"/></svg>';
    document.body.append(fade, more);
    // A click scrolls to the point where the projects heading settles in its
    // pinned spot under the nav (its sticky top), not just to the section.
    more.addEventListener("click", (e) => {
      const head = document.querySelector(".proj-head");
      if (!head) return;
      e.preventDefault();
      const pinAt = parseFloat(getComputedStyle(head).top) || parseFloat(getComputedStyle(document.querySelector(".projects")).getPropertyValue("--head-top")) * 16 || 124;
      const y = head.getBoundingClientRect().top + window.scrollY - pinAt;
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "calm";
      window.scrollTo({ top: Math.max(0, y), behavior: still ? "auto" : "smooth" });
    });
    const root = document.documentElement;
    let ticking = false;
    const set = () => { ticking = false; root.classList.toggle("home-top", window.scrollY < 24); };
    set();
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(set); } }, { passive: true });
  }
  const els = document.querySelectorAll("[data-words]");
  if (!els.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const calm = () => document.documentElement.getAttribute("data-motion") === "calm";
  const scrolled = [];
  els.forEach((p) => {
    // Split text nodes into word spans, leaving any inner markup alone.
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w";
            w.style.setProperty("--i", i++);
            w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(p);
    p.classList.add("wl");
    if (p.dataset.words === "scroll") scrolled.push({ p, words: [...p.querySelectorAll(".w")] });
  });
  if (!scrolled.length) return;
  // Once the line is well into view, its words light up one after another
  // and stay lit, so it is never left half-dim wherever the scrolling stops.
  const lightUp = (p) => p.classList.add("is-lit");
  if (!("IntersectionObserver" in window) || reduce.matches || calm()) { scrolled.forEach(({ p }) => lightUp(p)); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { lightUp(e.target); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -18% 0px" });
  scrolled.forEach(({ p }) => io.observe(p));
})();
