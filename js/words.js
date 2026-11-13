/* Words that light up, dim to full ink.
   data-words="load": the hero description; CSS brightens its words one after
   another once the hero has arrived (.hc.is-in).
   data-words="scroll": the projects description; once it is well into view
   its words brighten one after another, and stay lit.
   With motion reduced or in Calm, every word is simply lit. */
(() => {
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
