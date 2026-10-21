/* Hero (centred): one entrance after the loading screen ("complicated"
   arrives scattered and snaps straight), and the chat box turning through
   example questions as hints. Clicking the box only opens or closes the
   Talk to my Work chat (script.js); it never asks anything itself. */
(() => {
  const hc = document.querySelector(".hc");
  if (!hc) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Split the scattered word ("complicated") into letters, each a little out of place.
  const mess = hc.querySelector(".hc-mess");
  if (mess) {
    const word = mess.textContent;
    mess.innerHTML = `<span class="sr-only">${word}</span>` + Array.from(word).map((c, i) => {
      const r = (Math.random() * 2 - 1) * 34;
      const y = (Math.random() * 2 - 1) * 26;
      const x = (Math.random() * 2 - 1) * 10;
      return `<span class="ch" aria-hidden="true" style="--i:${i};--r:${r.toFixed(1)};--x:${x.toFixed(1)};--y:${y.toFixed(1)}">${c}</span>`;
    }).join("");
  }

  // The words rise as the hello screen starts to lift; the scattered word
  // waits until it has fully gone (.mess-go), so its letters snap straight
  // where you can see them. Without the hello screen, both go together.
  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
  const enter = () => raf2(() => hc.classList.add("is-in"));
  const straighten = () => raf2(() => hc.classList.add("mess-go"));
  if (document.documentElement.classList.contains("is-preloading")) {
    hc.style.setProperty("--mess-delay", "150ms");
    document.addEventListener("preloader:leaving", enter, { once: true });
    document.addEventListener("preloader:done", straighten, { once: true });
  } else { enter(); straighten(); }

  // Example questions turning in the box (hints only).
  const ask = hc.querySelector(".hc-ask");
  const qBox = hc.querySelector(".hc-q");
  // What hiring people actually ask (different from the chat's own
  // suggestions).
  const QS = ["What impact did your work have?", "Have you led design on a team?", "How do you work with engineers?", "When could you start?"];
  if (!ask || !qBox || reduce.matches) return;
  let qi = 0;
  let cur = qBox.firstElementChild;
  cur.textContent = QS[0];
  setInterval(() => {
    if (document.hidden || ask.matches(":hover, :focus-visible")) return;
    qi = (qi + 1) % QS.length;
    const next = document.createElement("span");
    next.className = "is-next";
    next.textContent = QS[qi];
    qBox.append(next);
    void next.offsetWidth;
    cur.classList.add("is-out");
    next.classList.remove("is-next");
    const old = cur;
    setTimeout(() => old.remove(), 500);
    cur = next;
  }, 3000);
})();
