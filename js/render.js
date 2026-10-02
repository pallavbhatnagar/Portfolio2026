/* =========================================================
   Builds the pages' repeated content from the data files:
   - project cards on the Home page (#projStack) and the Works page
     (.wk-list[data-render]) from js/projects.js
   - your email, footer social icons and resume link from js/content.js
   Loaded after the data files and before script.js, so the site's motion,
   scroll stacking, filter and password locks see the finished cards.
   There's nothing to edit here: change the data files instead.
   ========================================================= */
(() => {
  const projects = window.CASE_STUDIES || [];
  const site = window.SITE || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const lockIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';
  const lockBadge = `<span class="shot-lock" title="Password protected">${lockIcon}<span class="sr-only">Password protected</span></span>`;
  const arrowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const link = (p) => `/work/${encodeURIComponent(p.slug)}`;
  const thumb = (p) => p.thumbnail || p.image;
  const thumbAlt = (p) => p.thumbAlt || p.alt || p.name;
  const isExploration = (p) => String(p.kind).toLowerCase() === "exploration";

  // ---------- Home: the featured projects, in their home.order ----------
  const stack = document.getElementById("projStack");
  if (stack) {
    const featured = projects.filter((p) => p.home).sort((a, b) => (a.home.order || 0) - (b.home.order || 0));
    stack.insertAdjacentHTML("beforeend", featured.map((p, i) => `
    <article class="project" data-theme="${esc(p.tint)}" style="--n:${i}"${p.locked ? " data-locked" : ""}>
      <div class="project-copy">
        <p class="project-tag">${esc(p.category)}</p>
        <h3 class="project-title">${esc(p.name)}</h3>
        <p class="project-desc">${esc(p.home.text)}</p>
        <dl class="metrics">
          ${(p.home.metrics || []).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("\n          ")}
        </dl>
        <a class="project-link" href="${link(p)}" aria-label="Read the ${esc(p.name)} case study${p.locked ? " (password protected)" : ""}">Read case study <span aria-hidden="true">${arrowIcon}</span></a>
      </div>
      <div class="project-panel"><div class="project-shot">${p.locked ? lockBadge : ""}<img src="${esc(thumb(p))}" alt="${esc(thumbAlt(p))}" loading="lazy"></div></div>
    </article>`).join("\n"));
  }

  // ---------- Works: every project, in the order of projects.js ----------
  const list = document.querySelector(".wk-list[data-render]");
  if (list) {
    list.insertAdjacentHTML("beforeend", projects.filter((p) => p.works).map((p, i) => {
      const explore = isExploration(p);
      const label = `Read the ${p.name} ${explore ? "exploration" : "case study"}${p.locked ? " (password protected)" : ""}`;
      return `
    <li class="wk-item" data-cat="${explore ? "explore" : "case"}"${p.locked ? " data-locked" : ""} style="--i:${i}">
      <a class="wk-card" href="${link(p)}" aria-label="${esc(label)}" style="--tint: var(--${esc(p.tint)}-bg); --tint-ink: var(--${esc(p.tint)}-ink)">
        <div class="wk-copy">
          <div class="wk-top"><span class="wk-cat">${esc(p.category)}</span><span class="wk-year">${esc(p.year)}</span></div>
          <h2 class="wk-name">${esc(p.name)}</h2>
          <p class="wk-what">${esc(p.works.text)}</p>
          <p class="wk-meta">${(p.works.meta || []).map((m) => `<span>${esc(m)}</span>`).join("")}</p>
        </div>
        <div class="wk-visual"><div class="wk-marks"><span class="wk-badge">${esc(p.kind)}</span>${p.locked ? lockBadge : ""}</div><div class="wk-media"><img src="${esc(thumb(p))}" alt="${esc(thumbAlt(p))}" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}></div></div>
      </a>
    </li>`;
    }).join(""));
  }

  // ---------- Your details (js/content.js) ----------
  if (site.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = `mailto:${site.email}`;
      if (a.textContent.includes("@")) a.textContent = site.email;
    });
    document.querySelectorAll("[data-copy]").forEach((b) => { if (b.dataset.copy.includes("@")) b.dataset.copy = site.email; });
  }
  if (site.resume) document.querySelectorAll("[data-site-resume]").forEach((a) => { a.href = site.resume; });
  // Footer social icons: one link per entry in content.js, each showing its
  // icon file.
  const socials = Array.isArray(site.socials) ? site.socials : [];
  document.querySelectorAll("[data-site-socials]").forEach((nav) => {
    nav.innerHTML = socials.map((s) => `<a href="${esc(s.url || "#")}" target="_blank" rel="noopener" aria-label="${esc(s.name)} (opens in a new tab)"><img src="${esc(s.icon)}" alt="" width="16" height="16"></a>`).join("");
  });
})();
