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

  const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => hc.classList.add("is-in")));
  if (document.documentElement.classList.contains("is-preloading")) document.addEventListener("preloader:leaving", enter, { once: true });
  else enter();

  // Example questions turning in the box (hints only).
  const ask = hc.querySelector(".hc-ask");
  const qBox = hc.querySelector(".hc-q");
  const QS = ["What have you shipped?", "How do you work?", "Where have you worked?", "How can I reach you?"];
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
