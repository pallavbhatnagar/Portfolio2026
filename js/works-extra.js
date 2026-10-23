/* Works extras: list or grid view. Styles in css/works-extra.css. */
(() => {
  const list = document.querySelector(".wk-list");
  if (!list) return;
  const items = Array.from(list.querySelectorAll(".wk-item"));
  if (!items.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- View switch ----------
  // Grid or list, remembered. Switching morphs every card from its old
  // place and shape to the new one (View Transitions); each card gets its
  // name only for the switch, so nothing else on the page joins in.
  const KEY = "works-view";
  const bar = document.querySelector(".wk-filter-bar");
  const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const view = document.createElement("div");
  view.className = "wk-view";
  view.setAttribute("role", "group");
  view.setAttribute("aria-label", "View");
  view.innerHTML = `<button type="button" data-view="list" aria-pressed="true" aria-label="List view" title="List view">${ic('<rect x="3.5" y="4.5" width="17" height="6" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/>')}</button><button type="button" data-view="grid" aria-pressed="false" aria-label="Grid view" title="Grid view">${ic('<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/>')}</button>`;
  if (bar) bar.appendChild(view);
  const buttons = Array.from(view.querySelectorAll("button"));
  const setView = (mode) => {
    list.classList.toggle("is-grid", mode === "grid");
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === mode)));
  };
  let saved = "list";
  try { saved = localStorage.getItem(KEY) === "grid" ? "grid" : "list"; } catch (e) { /* private mode */ }
  setView(saved);
  buttons.forEach((b) => b.addEventListener("click", () => {
    const mode = b.dataset.view;
    if (list.classList.contains("is-grid") === (mode === "grid")) return;
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode */ }
    if (reduce.matches || typeof document.startViewTransition !== "function") { setView(mode); return; }
    items.forEach((it, i) => { it.style.viewTransitionName = `wk-${i}`; it.style.viewTransitionClass = "wk-morph"; });
    document.startViewTransition(() => setView(mode)).finished.finally(() => {
      items.forEach((it) => { it.style.viewTransitionName = ""; it.style.viewTransitionClass = ""; });
    });
  }));
})();
