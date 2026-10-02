/* Case study page (case-study.html). Renders one project from
   window.CASE_STUDIES (js/projects.js), chosen by ?p=slug, then runs the
   page's motion:
   - a fixed chapter list at the top left (the chapter you're reading is
     highlighted), a Back button above the heading, and an "Ask AI about this
     project" button that opens the Talk to my Work chat and answers from
     this page's content
   - outcome numbers count up once when they come into view
   - locked projects show a password gate until unlocked (the dialog itself
     is shared with the rest of the site, script.js block 11c)
   Loaded before script.js so the shared reveal and lock code see the
   rendered content. */
(() => {
  const data = window.CASE_STUDIES || [];
  const root = document.getElementById("case");
  if (!root || !data.length) return;

  const params = new URLSearchParams(location.search);
  const index = Math.max(0, data.findIndex((p) => p.slug === params.get("p")));
  const p = data[index];
  const next = data[(index + 1) % data.length];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Each project keeps its colour for surfaces; the accent (lines, numbers,
  // markers) is the site's ink.
  // Each project keeps its colour for surfaces; the accent (lines, numbers,
  // markers) is the site's ink.
  const tint = (t) => `--tint: var(--${t}-bg); --tint-panel: var(--${t}-panel); --tint-ink: var(--ink)`;
  const lockIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';
  const arrow = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8.5 7H17v8.5"/></svg>';

  document.title = `${p.name} | Pallav Bhatnagar`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `${p.name}: ${p.headline}`);

  let unlocked = false;
  try { unlocked = sessionStorage.getItem("caseStudiesUnlocked") === "1"; } catch (e) { /* private mode */ }
  const gated = p.locked && !unlocked;

  // A project with a detailed `story` lists its own chapters; the others use
  // the standard seven.
  const chapters = p.story ? p.story.map((c) => [c.id, c.nav]) : [
    ["overview", "Overview"], ["problem", "Problem"], ["research", "Research"],
    ["process", "Process"], ["solution", "Solution"], ["results", "Results"], ["reflection", "Reflection"]
  ];

  const sparkle = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 1.6c.7 0 1.2.5 1.4 1.2 1.1 4.4 3.6 6.9 8 8 .7.2 1.2.7 1.2 1.2s-.5 1-1.2 1.2c-4.4 1.1-6.9 3.6-8 8-.2.7-.7 1.2-1.4 1.2s-1.2-.5-1.4-1.2c-1.1-4.4-3.6-6.9-8-8C1.9 13 1.4 12.5 1.4 12s.5-1 1.2-1.2c4.4-1.1 6.9-3.6 8-8 .2-.7.7-1.2 1.4-1.2z"/></svg>';
  const backIcon = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const askButton = (cls) => `<button class="${cls}" type="button" data-ask-trigger data-ask="Tell me about ${esc(p.name)}." aria-haspopup="dialog" aria-controls="askPanel" aria-label="Ask AI about ${esc(p.name)}"><span class="cs-ask-ic">${sparkle}</span>Ask AI about this project</button>`;

  const outcome = (o) => `
    <div class="cs-out">
      <p class="cs-num" data-to="${o.to}" data-prefix="${esc(o.prefix || "")}" data-suffix="${esc(o.suffix || "")}">${esc(o.prefix || "")}${o.to}${esc(o.suffix || "")}</p>
      <p class="cs-out-label">${esc(o.label)}</p>
    </div>`;

  // A decision image: its own detail image (or the cover). With a `focus`
  // it shows as a zoomed crop at that point; without one, in full.
  const decisionImage = (d) => `<div class="cs-crop${d.focus ? " is-crop" : ""}"><img src="${esc(d.image || p.image)}" alt="" loading="lazy"${d.focus ? ` style="object-position: ${esc(d.focus)}; transform-origin: ${esc(d.focus)}"` : ""}></div>`;

  // ---------- Detailed story (optional, per project) ----------
  // p.story is a list of chapters: { id, nav, title, lead, blocks }. Each
  // block has a type and draws one kind of content with the page's existing
  // type sizes: text, subhead, cards, rows, personas, principles, matrix,
  // decisions, compare, stats, quote.
  // --t on each tag and --q on each quadrant drive the staggered entrances.
  const tags = (list, cls = "cs-tags") => list && list.length ? `<ul class="${cls}">${list.map((t, k) => `<li style="--t:${k}">${esc(t)}</li>`).join("")}</ul>` : "";
  const bullets = (list) => list && list.length ? `<ul class="cs-bullets">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const blocks = {
    text: (b) => `<p class="ab-r">${esc(b.text)}</p>`,
    subhead: (b) => `<h3 class="cs-sub ab-r">${esc(b.title)}</h3>${b.text ? `<p class="ab-r">${esc(b.text)}</p>` : ""}`,
    cards: (b) => `<div class="cs-insights cs-cards" style="--cols:${b.cols || 3}">${b.items.map((it, i) => `<article class="cs-insight ab-r" style="--i:${i}"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>${tags(it.tags)}</article>`).join("")}</div>`,
    rows: (b) => `<div class="cs-rows">${b.items.map((it, i) => `<div class="cs-row ab-r" style="--i:${i}"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`).join("")}</div>`,
    personas: (b) => `<div class="cs-personas">${b.items.map((it, i) => `
      <article class="cs-persona ab-r" style="--i:${i}">
        <p class="cs-persona-kind">${esc(it.kind)}</p>
        <h3>${esc(it.name)}</h3>
        <p class="cs-persona-line">${esc(it.line)}</p>
        <p class="cs-persona-h">Needs</p>${bullets(it.needs)}
        <p class="cs-persona-h">Gets in the way</p>${bullets(it.pains)}
      </article>`).join("")}</div>`,
    principles: (b) => `<div class="cs-principles">${b.items.map((it, i) => `<article class="cs-principle ab-r" style="--i:${i}"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>${bullets(it.points)}</article>`).join("")}</div>`,
    matrix: (b) => `
      <figure class="cs-matrix ab-r">
        <div class="cs-matrix-grid">
          ${b.quadrants.map((q, k) => `<div class="cs-quad${q.key ? " is-key" : ""}" style="--q:${k}"><p class="cs-quad-label">${esc(q.label)}</p>${tags(q.items, "cs-quad-items")}</div>`).join("")}
        </div>
        <figcaption><span>${esc(b.x)}</span><span>${esc(b.y)}</span></figcaption>
      </figure>`,
    decisions: (b) => `<div class="cs-decisions">${b.items.map((d) => `
      <article class="cs-decision ab-r">
        ${decisionImage(d)}
        <div class="cs-decision-copy"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p>${tags(d.impact, "cs-tags cs-impact")}</div>
      </article>`).join("")}</div>`,
    compare: (b) => `<div class="cs-compare">${[b.before, b.after].map((side, i) => `<div class="cs-side-card ab-r${i ? " is-after" : ""}" style="--i:${i}"><p class="cs-side-label">${esc(side.title)}</p>${bullets(side.points)}</div>`).join("")}</div>`,
    stats: (b) => `<div class="cs-stats">${b.items.map((s, i) => `<div class="cs-stat ab-r" style="--i:${i}"><p class="cs-stat-num" data-value="${esc(s.value)}">${esc(s.value)}</p><p class="cs-out-label">${esc(s.label)}</p></div>`).join("")}</div>${b.note ? `<p class="cs-note ab-r">${esc(b.note)}</p>` : ""}`,
    quote: (b) => `<blockquote class="cs-quote ab-r"><p>&ldquo;${esc(b.text)}&rdquo;</p><cite>${esc(b.who)}</cite></blockquote>`
  };
  const story = (list) => list.map((c) => `
    <section class="cs-ch" id="${esc(c.id)}">
      <h2 class="ab-r">${esc(c.title)}</h2>
      ${c.lead ? `<p class="cs-lead ab-r">${esc(c.lead)}</p>` : ""}
      ${(c.blocks || []).map((b) => (blocks[b.type] ? blocks[b.type](b) : "")).join("")}
    </section>`).join("");

  // ---------- Team, role, timeline and tools (under the heading) ----------
  // Teammates show as initials in the site's pastel tints (three, then +N);
  // solo work shows just Pallav. Tools show as a letter tile in the tool's
  // own colour, with its name.
  const avatarTints = ["mint", "lilac", "rose", "sky", "sand"];
  const toolColours = {
    Figma: "#f24e1e", FigJam: "#9747ff", Maze: "#1d1d1f", Dovetail: "#6c47ff", Notion: "#1d1d1f",
    Miro: "#ffd02f", Lookback: "#2c2c54", Jira: "#0052cc", Hotjar: "#ff3c00", Amplitude: "#1e61f0",
    Linear: "#5e6ad2", "Google Analytics": "#e37400", ProtoPie: "#ff5a5f", Framer: "#0055ff", Webflow: "#4353ff",
    "Adobe XD": "#470137", Sketch: "#f7b500", "Microsoft Teams": "#5059c9", Excel: "#1d6f42"
  };
  const darkText = { Miro: true, Sketch: true };
  const toolLetter = { "Adobe XD": "Xd", "Microsoft Teams": "T", Excel: "X", "Google Analytics": "G" };
  const context = () => {
    const team = p.team || { members: [], text: p.meta.team };
    const people = team.members.length ? team.members : [{ initials: "PB", name: "Pallav Bhatnagar" }];
    const shown = people.slice(0, 3);
    const more = people.length - shown.length;
    const avatars = shown.map((m, i) => {
      const t = avatarTints[i % avatarTints.length];
      return `<li title="${esc(m.name)}" style="--a-bg: var(--${t}-bg); --a-ink: var(--${t}-ink)"><span aria-hidden="true">${esc(m.initials)}</span><span class="sr-only">${esc(m.name)}</span></li>`;
    }).join("") + (more > 0 ? `<li class="cs-avatar-more" title="${more} more"><span aria-hidden="true">+${more}</span><span class="sr-only">and ${more} more</span></li>` : "");
    const role = p.role || { text: "", focus: [] };
    const roleText = esc(role.text).replace("{role}", `<strong>${esc(p.meta.role)}</strong>`);
    const tools = (p.tools || []).map((t) => `<li><span class="cs-tool-ic" aria-hidden="true" style="--tool: ${toolColours[t] || "var(--ink)"}${darkText[t] ? "; --tool-ink: #1d1d1f" : ""}">${esc(toolLetter[t] || t.charAt(0))}</span>${esc(t)}</li>`).join("");
    return `
      <section class="cs-context cs-in" style="--d:3" aria-label="Team, role and tools">
        <div class="cs-ctx-col">
          <div class="cs-ctx-block">
            <h2 class="cs-ctx-h">The team</h2>
            <ul class="cs-avatars">${avatars}</ul>
            <p>${esc(team.text)}</p>
          </div>
          ${tools ? `<div class="cs-ctx-block"><h2 class="cs-ctx-h">Tools used</h2><ul class="cs-tools">${tools}</ul></div>` : ""}
        </div>
        <div class="cs-ctx-col">
          <div class="cs-ctx-block">
            <h2 class="cs-ctx-h">My role</h2>
            <p>${roleText}</p>
            ${role.focus.length ? `<ul class="cs-focus">${role.focus.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="cs-ctx-block">
            <h2 class="cs-ctx-h">Timeline and platform</h2>
            <p><strong>${esc(p.meta.timeline)}</strong> on ${esc(p.meta.platform)}</p>
          </div>
        </div>
      </section>`;
  };

  root.setAttribute("style", tint(p.tint));
  root.innerHTML = `
    <nav class="cs-side" aria-label="Case study">
      <a class="cs-back-btn" href="works" aria-label="Back to all work">${backIcon}</a>
      <ol class="cs-toc">
        ${chapters.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("")}
      </ol>
    </nav>

    <header class="cs-hero">
      <a class="cs-back-btn cs-back-hero cs-in" style="--d:0" href="works" aria-label="Back to all work">${backIcon}</a>
      <div class="cs-hero-row">
        <div class="cs-hero-text">
          <p class="cs-kicker cs-in" style="--d:0"><span>${esc(p.category)}</span></p>
          <h1 class="cs-title cs-in" style="--d:1">${esc(p.name)}</h1>
          <p class="cs-headline cs-in" style="--d:2">${esc(p.headline)}</p>
        </div>
        <div class="cs-in" style="--d:2">${askButton("cs-ask")}</div>
      </div>
      ${context()}
    </header>

    <section class="cs-gate" aria-labelledby="cs-gate-title">
      <span class="cs-gate-ic">${lockIcon}</span>
      <h2 id="cs-gate-title">This case study is password protected</h2>
      <p>The work is under a confidentiality agreement. Enter the password to read it, or email me and I'll share it.</p>
      <button class="btn btn-primary" type="button" data-lock-open>Enter password</button>
    </section>

    <div class="cs-locked-content">
      <figure class="cs-cover">
        <span class="cs-cover-tag">${esc(p.kind)}</span>
        <div class="cs-cover-media"><img src="${esc(p.image)}" alt="${esc(p.alt)}" fetchpriority="high"></div>
      </figure>

      <section class="cs-outcomes ab-r" aria-label="Outcomes">
        ${p.outcomes.map(outcome).join("")}
      </section>

      <div class="cs-body">
        <div class="cs-content">
          ${p.story ? story(p.story) : `
          <section class="cs-ch" id="overview">
            <h2 class="ab-r">Overview</h2>
            <p class="cs-lead ab-r">${esc(p.overview)}</p>
          </section>

          <section class="cs-ch" id="problem">
            <h2 class="ab-r">The problem</h2>
            <p class="ab-r">${esc(p.problem)}</p>
            ${p.quote ? `<blockquote class="cs-quote ab-r"><p>&ldquo;${esc(p.quote.text)}&rdquo;</p><cite>${esc(p.quote.who)}</cite></blockquote>` : ""}
          </section>

          <section class="cs-ch" id="research">
            <h2 class="ab-r">What we learned</h2>
            <div class="cs-insights">
              ${p.insights.map((it, i) => `<article class="cs-insight ab-r" style="--i:${i}"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`).join("")}
            </div>
          </section>

          <section class="cs-ch" id="process">
            <h2 class="ab-r">Process</h2>
            <ol class="cs-steps">
              ${p.process.map((s, i) => `<li class="cs-step ab-r" style="--i:${i}"><span class="cs-step-n">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(s.phase)}</h3><p>${esc(s.text)}</p></div></li>`).join("")}
            </ol>
          </section>

          <section class="cs-ch" id="solution">
            <h2 class="ab-r">Key decisions</h2>
            <div class="cs-decisions">
              ${p.decisions.map((d) => `
                <article class="cs-decision ab-r">
                  ${decisionImage(d)}
                  <div class="cs-decision-copy"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div>
                </article>`).join("")}
            </div>
          </section>

          <section class="cs-ch" id="results">
            <h2 class="ab-r">Results</h2>
            <p class="cs-lead ab-r">${esc(p.results)}</p>
            ${p.testimonial ? `<figure class="cs-testimonial ab-r">
              <blockquote><p>&ldquo;${esc(p.testimonial.text)}&rdquo;</p></blockquote>
              <figcaption><strong>${esc(p.testimonial.who)}</strong>${esc(p.testimonial.role)}</figcaption>
            </figure>` : ""}
          </section>

          <section class="cs-ch" id="reflection">
            <h2 class="ab-r">Looking back</h2>
            <p class="ab-r">${esc(p.reflection)}</p>
          </section>`}
        </div>
      </div>
    </div>

    <a class="cs-next" href="case-study?p=${esc(next.slug)}" style="${tint(next.tint)}"${next.locked ? " data-locked" : ""} aria-label="Next project: ${esc(next.name)}${next.locked ? " (password protected)" : ""}">
      <span class="cs-next-label">Next project</span>
      <span class="cs-next-name">${esc(next.name)}${next.locked ? `<span class="cs-next-lock" title="Password protected">${lockIcon}</span>` : ""}</span>
      <span class="cs-next-arrow">${arrow}</span>
    </a>`;

  if (gated) document.body.classList.add("cs-gated");

  // ---------- Outcome numbers count up once in view ----------
  const countUp = (el) => {
    const to = Number(el.dataset.to);
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const show = (v) => { el.textContent = `${pre}${v}${suf}`; };
    if (reduce.matches) { show(to); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1100);
      show(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    show(0);
    requestAnimationFrame(step);
    setTimeout(() => show(to), 1300);
  };
  // Story numbers ("25+", "4M", "2B+") count up the same way: split each into
  // prefix, number and suffix. Values without a number are left as they are.
  root.querySelectorAll(".cs-stat-num[data-value]").forEach((el) => {
    const m = el.dataset.value.match(/^([^\d]*)(\d+)(.*)$/);
    if (!m) return;
    el.dataset.prefix = m[1];
    el.dataset.to = m[2];
    el.dataset.suffix = m[3];
  });
  const nums = Array.from(root.querySelectorAll(".cs-num, .cs-stat-num[data-to]"));
  if ("IntersectionObserver" in window) {
    const numIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); numIo.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach((n) => numIo.observe(n));
  }

  // ---------- Chapter list: highlight the chapter you're reading ----------
  const links = Array.from(root.querySelectorAll(".cs-toc a"));
  const shell = document.getElementById("shellScroll");
  const sections = chapters.map(([id]) => document.getElementById(id));
  let ticking = false;
  const render = () => {
    ticking = false;
    const mark = window.innerHeight * 0.45;
    let active = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < mark) active = i; });
    // Short last chapters never reach the mark, so the page bottom selects the last one.
    const doc = document.documentElement;
    const atBottom = (shell && shell.scrollHeight > shell.clientHeight + 1)
      ? shell.scrollTop + shell.clientHeight >= shell.scrollHeight - 2
      : window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    if (atBottom && window.scrollY + (shell ? shell.scrollTop : 0) > 0) active = sections.length - 1;
    links.forEach((a, i) => {
      const on = i === Math.max(0, active);
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  render();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  // With the chat panel open, the page scrolls inside #shellScroll instead.
  if (shell) shell.addEventListener("scroll", request, { passive: true });

  // ---------- Answers for the "Talk to my Work" chat about this project ----------
  // script.js asks window.pageAnswer(question) before its general answers.
  // Questions about this project (by name, "this project", or a topic word)
  // are answered from this page's content; anything else falls through.
  const para = (s) => esc(s);
  const list = (items) => `<ul class="cs-ai-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  window.pageAnswer = (q) => {
    const t = q.toLowerCase();
    const aboutThis = t.includes(p.name.toLowerCase()) || t.includes(p.slug) || /\b(this|the) (project|case study|work)\b/.test(t);
    const topics = [
      [/problem|challenge|issue|wrong|why/, () => ({ text: para(p.problem) + (p.quote ? ` <em>&ldquo;${para(p.quote.text)}&rdquo;</em>` : "") })],
      [/learn|research|insight|found|discover/, () => ({ text: "Three things stood out from the research:", render: () => list(p.insights.map((i) => `<strong>${para(i.title)}.</strong> ${para(i.text)}`)) })],
      [/process|approach|steps|how did|method/, () => ({ text: "The work ran in five steps:", render: () => list(p.process.map((s) => `<strong>${para(s.phase)}.</strong> ${para(s.text)}`)) })],
      [/decision|solution|design|chang|built|feature/, () => ({ text: "The key decisions:", render: () => list(p.decisions.map((d) => `<strong>${para(d.title)}.</strong> ${para(d.text)}`)) })],
      [/result|impact|outcome|number|metric|work(ed)? out|success/, () => ({ text: para(p.results), render: () => list(p.outcomes.map((o) => `<strong>${esc(o.prefix || "")}${o.to}${esc(o.suffix || "")}</strong> ${para(o.label)}`)) })],
      [/tool|software|figma|stack|app(s)? did you use/, () => ({ text: p.tools && p.tools.length ? `On ${para(p.name)}, Pallav worked in ${para(p.tools.slice(0, -1).join(", "))}${p.tools.length > 1 ? " and " : ""}${para(p.tools[p.tools.length - 1])}.` : `The tools for ${para(p.name)} aren't listed yet.` })],
      [/role|team|who|timeline|long|platform/, () => ({ text: `Pallav was the ${para(p.meta.role.toLowerCase())} on ${para(p.name)}: ${para(p.meta.timeline)}, working with ${para(p.meta.team)}, on ${para(p.meta.platform)}.` })],
      [/reflect|differently|next time|looking back|improve/, () => ({ text: para(p.reflection) })]
    ];
    // Ignore the project's own name when looking for a topic ("Lumen Learn"
    // shouldn't read as a question about what was learned).
    const bare = t.split(p.name.toLowerCase()).join(" ");
    const hit = topics.find(([re]) => re.test(bare));
    if (!hit && !aboutThis) return null;
    if (document.body.classList.contains("cs-gated")) {
      return { text: `The ${para(p.name)} case study is password protected. Unlock it on this page, or email ${esc((window.SITE && window.SITE.email) || "hello@example.com")} and Pallav will share it.` };
    }
    if (hit) return hit[1]();
    return { text: `${para(p.name)}: ${para(p.headline)} ${para(p.overview)}`, render: () => list(p.outcomes.map((o) => `<strong>${esc(o.prefix || "")}${o.to}${esc(o.suffix || "")}</strong> ${para(o.label)}`)) };
  };

  // ---------- Unlocking from the gate ----------
  document.addEventListener("case-unlocked", () => {
    document.body.classList.remove("cs-gated");
    render();
  });
})();
