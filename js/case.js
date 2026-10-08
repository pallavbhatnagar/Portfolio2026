/* Case study pages (work/<project>.html). Each page's content is written in
   its own HTML; this script only adds the behaviour:
   - the password gate for locked projects (<main data-locked>); the
     password dialog itself is shared with the rest of the site (script.js
     block 11c)
   - outcome numbers count up once when they come into view
   - the chapter list at the top left highlights the chapter you're reading
   - answers for the "Talk to my Work" chat about this project, read from
     this page's content
   Loaded before script.js. */
(() => {
  const root = document.getElementById("case");
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const text = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");
  const name = text(root.querySelector(".cs-title"));
  const slug = root.dataset.slug || "";

  // ---------- Password gate ----------
  // A locked project's page in this repository is only a placeholder (hero
  // and password card); after the password, the Cloudflare Worker serves the
  // full page, which has no data-locked. So data-locked means "show the gate".
  // The tab's "unlocked" note is cleared too: reaching the placeholder means
  // the unlock has expired.
  if (root.hasAttribute("data-locked")) {
    document.body.classList.add("cs-gated");
    try { sessionStorage.removeItem("caseStudiesUnlocked"); } catch (e) { /* private mode */ }
  }

  // ---------- Back ----------
  // Back works exactly like the browser's Back button: it returns to the
  // previous page, with its scroll position (and the Works filter) as they
  // were. Only when there is no previous page (the case study opened in a
  // new tab) does the link open /works instead. Opening it in a new tab
  // (Ctrl/Cmd-click, middle click) is left to the browser.
  const smartBack = (link) => link.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (history.length > 1) { e.preventDefault(); history.back(); }
  });

  document.querySelectorAll("[data-back]").forEach(smartBack);

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
  // Numbers like "25+", "4M", "2B+" count up the same way: split each into
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
  const sections = links.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
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
  // are answered from this page's text; anything else falls through.
  const list = (items) => `<ul class="cs-ai-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  const titled = (selector) => Array.from(root.querySelectorAll(selector)).map((el) =>
    `<strong>${esc(text(el.querySelector("h3")))}.</strong> ${esc(text(el.querySelector("p")))}`);
  const outcomes = () => Array.from(root.querySelectorAll(".cs-out, .cs-stat")).map((o) =>
    `<strong>${esc(text(o.querySelector(".cs-num, .cs-stat-num")))}</strong> ${esc(text(o.querySelector(".cs-out-label")))}`);
  const chapterText = (id) => text(root.querySelector(`#${id} .cs-lead`) || root.querySelector(`#${id} > p`));
  const contextBlock = (heading) => {
    const h = Array.from(root.querySelectorAll(".cs-ctx-h")).find((x) => text(x) === heading);
    return h ? text(h.parentElement.querySelector("p")) : "";
  };
  const tools = () => Array.from(root.querySelectorAll(".cs-tools li")).map((li) => text(li.lastChild));

  // Flows: rows of screens that scroll sideways. The buttons move one frame
  // at a time; the count and the buttons' disabled state follow the scroll.
  root.querySelectorAll(".cs-flow").forEach((flow) => {
    const track = flow.querySelector(".cs-flow-track");
    const frames = Array.from(track.children);
    const count = flow.querySelector(".cs-flow-count");
    const [prev, next] = flow.querySelectorAll(".cs-flow-btn");
    const step = () => (frames[1] ? frames[1].offsetLeft - frames[0].offsetLeft : track.clientWidth);
    const sync = () => {
      const i = Math.round(track.scrollLeft / step());
      if (count) count.textContent = `${Math.min(frames.length, i + 1)} of ${frames.length}`;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    [prev, next].forEach((b) => b.addEventListener("click", () => track.scrollBy({ left: Number(b.dataset.dir) * step() })));
    track.addEventListener("scroll", sync, { passive: true });
    // Re-check when the row changes size: on resize, as images load, and when
    // a locked page is unlocked (the row is hidden until then).
    if ("ResizeObserver" in window) new ResizeObserver(sync).observe(track);
    else window.addEventListener("resize", sync);
    sync();
  });

  // Vimeo films: a still image with a play button. The button appears only
  // if Vimeo says the film can be embedded (public, or allowed on this
  // domain); clicking swaps the still for Vimeo's player, already playing.
  root.querySelectorAll("[data-vimeo]").forEach((box) => {
    const id = box.dataset.vimeo;
    const title = box.dataset.vimeoTitle || "Video";
    const btn = box.querySelector(".cs-play");
    if (!btn || !window.fetch) return;
    btn.setAttribute("aria-label", `Play video: ${title}`);
    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent("https://vimeo.com/" + id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((info) => { if (info) btn.hidden = false; })
      .catch(() => {});
    btn.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.className = "cs-play-frame";
      frame.src = `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0&api=1`;
      frame.title = title;
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      box.classList.add("is-playing");
      box.appendChild(frame);
      btn.remove();
      frame.focus();
      // It starts playing right away, so the ambient music steps aside now
      // (script.js); the player's own pause and play events follow.
      document.dispatchEvent(new CustomEvent("ambient:media", { detail: { id: frame, playing: true } }));
    });
  });

  window.pageAnswer = (q) => {
    const t = q.toLowerCase();
    const lower = name.toLowerCase();
    const aboutThis = (lower && t.includes(lower)) || (slug && t.includes(slug)) || /\b(this|the) (project|case study|work)\b/.test(t);
    const topics = [
      [/problem|challenge|issue|wrong|why/, () => {
        const p = chapterText("problem");
        if (!p) return null;
        const quote = text(root.querySelector("#problem .cs-quote p"));
        return { text: esc(p) + (quote ? ` <em>${esc(quote)}</em>` : "") };
      }],
      [/learn|research|insight|found|discover/, () => {
        const items = titled("#research .cs-insight");
        return items.length ? { text: "What stood out from the research:", render: () => list(items) } : null;
      }],
      [/process|approach|steps|how did|method/, () => {
        const items = titled(".cs-step");
        return items.length ? { text: `The work ran in ${items.length} steps:`, render: () => list(items) } : null;
      }],
      [/decision|solution|design|chang|built|feature/, () => {
        const items = titled(".cs-decision");
        return items.length ? { text: "The key decisions:", render: () => list(items) } : null;
      }],
      [/result|impact|outcome|number|metric|work(ed)? out|success/, () => {
        const items = outcomes();
        return { text: esc(chapterText("results")), render: items.length ? () => list(items) : undefined };
      }],
      [/tool|software|figma|stack|app(s)? did you use/, () => {
        const ts = tools();
        return { text: ts.length ? `On ${esc(name)}, Pallav worked in ${esc(ts.slice(0, -1).join(", "))}${ts.length > 1 ? " and " : ""}${esc(ts[ts.length - 1])}.` : `The tools for ${esc(name)} aren't listed yet.` };
      }],
      [/role|team|who|timeline|long|platform/, () => {
        const role = contextBlock("My role");
        const when = contextBlock("Timeline and platform");
        return role ? { text: `${esc(role)}${when ? ` (${esc(when)})` : ""}` } : null;
      }],
      [/reflect|differently|next time|looking back|improve/, () => {
        const r = chapterText("reflection");
        return r ? { text: esc(r) } : null;
      }]
    ];
    // Ignore the project's own name when looking for a topic ("Lumen Learn"
    // shouldn't read as a question about what was learned).
    const bare = lower ? t.split(lower).join(" ") : t;
    const hit = topics.find(([re]) => re.test(bare));
    if (!hit && !aboutThis) return null;
    if (document.body.classList.contains("cs-gated")) {
      return { text: `The ${esc(name)} case study is password protected. Unlock it on this page, or email ${esc((window.SITE && window.SITE.email) || "bhatnagarpallav@outlook.com")} and Pallav will share it.` };
    }
    const answer = hit && hit[1]();
    if (answer) return answer;
    const items = outcomes();
    return { text: `${esc(name)}: ${esc(text(root.querySelector(".cs-headline")))} ${esc(chapterText("overview"))}`, render: items.length ? () => list(items) : undefined };
  };
})();
