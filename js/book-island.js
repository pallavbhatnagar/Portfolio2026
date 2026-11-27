/* "Book a call" as an island (css/book-island.css), with its own booking
   interface on Cal.com's public API (no server, no keys):
     1. pick a meeting (the event types on the Cal.com account),
     2. pick a day and a time (open slots, shown in the visitor's own time
        zone),
     3. name, email and a note, then Confirm, which books it on Cal.com
        (Cal.com sends the invites and the video link),
     4. a done screen.
   The island grows out of the button and shrinks back into it. Esc, the
   close button or the backdrop close it; focus moves in and back.
   Cmd/Ctrl-click still opens Cal.com in a new tab, and every step keeps an
   "Open in Cal.com" way out. Reduced motion or Calm: it fades in place. */
(() => {
  const links = Array.from(document.querySelectorAll('a.btn[href^="https://cal.com/"]'));
  if (!links.length) return;
  const root = document.documentElement;
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "calm";
  const base = links[0].href.split("?")[0];
  const USER = base.split("/").filter(Boolean).pop();
  const API = "https://api.cal.com/v2";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const icon = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  const wrap = document.createElement("div");
  wrap.className = "bi";
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="bi-backdrop" data-close></div>
    <div class="bi-island" role="dialog" aria-modal="true" aria-labelledby="bi-title">
      <div class="bi-bar">
        <button class="bi-back" type="button" aria-label="Back" hidden>${icon.back}</button>
        <span class="bi-dot" aria-hidden="true"></span>
        <p class="bi-title" id="bi-title">Book a call with Pallav</p>
        <a class="bi-out" href="${base}" target="_blank" rel="noopener">Open in Cal.com<span class="sr-only"> (opens in a new tab)</span></a>
        <button class="bi-close" type="button" aria-label="Close" data-close>${icon.close}</button>
      </div>
      <div class="bi-body"><div class="bi-view" aria-live="polite"></div></div>
    </div>`;
  document.body.appendChild(wrap);
  const island = wrap.querySelector(".bi-island"), view = wrap.querySelector(".bi-view"), backBtn = wrap.querySelector(".bi-back");
  let from = null;

  // ---------- data ----------
  const state = { types: null, type: null, month: null, slots: {}, day: null, time: null };
  const get = (url, ver) => fetch(url, { headers: { "cal-api-version": ver } }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const loadTypes = () => state.types ? Promise.resolve(state.types)
    : get(`${API}/event-types?username=${encodeURIComponent(USER)}`, "2024-06-14").then((j) => (state.types = (j.data || []).filter((t) => !t.hidden).sort((a, b) => a.lengthInMinutes - b.lengthInMinutes)));
  const loadSlots = (first) => {
    const start = new Date(first.getFullYear(), first.getMonth(), 1), end = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const today = new Date(); const from = start < today ? today : start;
    return get(`${API}/slots?username=${encodeURIComponent(USER)}&eventTypeSlug=${encodeURIComponent(state.type.slug)}&start=${ymd(from)}&end=${ymd(end)}&timeZone=${encodeURIComponent(tz)}`, "2024-09-04")
      .then((j) => { const out = {}; Object.entries(j.data || {}).forEach(([d, list]) => { out[d] = list.map((s) => s.start); }); return out; });
  };

  // ---------- views ----------
  const show = (html, step) => {
    view.innerHTML = html;
    view.dataset.step = step;
    backBtn.hidden = step === "type" || step === "done";
    if (!still()) { view.classList.remove("is-in"); void view.offsetWidth; view.classList.add("is-in"); }
  };
  const fail = (msg) => show(`<div class="bi-msg"><p><b>${esc(msg)}</b></p><p>You can still book on Cal.com.</p><a class="bi-cta" href="${base}" target="_blank" rel="noopener">Open in Cal.com</a></div>`, "error");
  const loading = () => show('<div class="bi-loading" aria-label="Loading"><i></i><i></i><i></i></div>', state.type ? "slots" : "type");

  const viewTypes = () => {
    loading();
    loadTypes().then((types) => {
      show(`<div class="bi-intro"><h2 class="bi-h">Pick a conversation</h2><p class="bi-sub">Times are shown in your time zone (${esc(tz.replace(/_/g, " "))}).</p></div>
        <ul class="bi-types">${types.map((t, i) => `<li><button class="bi-type" type="button" data-i="${i}">
          <span class="bi-type-len">${t.lengthInMinutes}<small>min</small></span>
          <span class="bi-type-text"><b>${esc(t.title)}</b><span>${esc(t.description || "")}</span></span>
          <span class="bi-type-go" aria-hidden="true">${icon.back}</span></button></li>`).join("")}</ul>`, "type");
    }).catch(() => fail("Couldn't load the meeting types."));
  };

  const viewSlots = () => {
    const t = state.type, m = state.month;
    loading();
    loadSlots(m).then((slots) => {
      state.slots = slots;
      const first = new Date(m.getFullYear(), m.getMonth(), 1), days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // weeks start on Monday
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const avail = Object.keys(slots).filter((d) => slots[d].length);
      if (!state.day || !slots[state.day]) state.day = avail[0] || null;
      const monthName = m.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const thisMonth = new Date(); const canPrev = m.getFullYear() > thisMonth.getFullYear() || m.getMonth() > thisMonth.getMonth();
      let cells = "";
      for (let i = 0; i < lead; i++) cells += '<span class="bi-cell is-blank"></span>';
      for (let d = 1; d <= days; d++) {
        const date = new Date(m.getFullYear(), m.getMonth(), d), key = ymd(date), has = slots[key] && slots[key].length;
        cells += `<button class="bi-cell${has ? " has" : ""}${key === state.day ? " is-on" : ""}${date.getTime() === today.getTime() ? " is-today" : ""}" type="button" data-day="${key}" ${has ? "" : "disabled"} aria-pressed="${key === state.day}" aria-label="${date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}${has ? "" : ", no times"}">${d}</button>`;
      }
      const times = state.day ? slots[state.day].map((s) => `<button class="bi-time" type="button" data-t="${s}">${new Date(s).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</button>`).join("") : "";
      const dayLabel = state.day ? new Date(state.day + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "";
      show(`<div class="bi-pick">
        <div class="bi-side"><p class="bi-kicker">${esc(t.title)}</p><p class="bi-meta">${icon.clock}${t.lengthInMinutes} min</p><p class="bi-meta">${icon.video}Video call (link in the invite)</p><p class="bi-desc">${esc(t.description || "")}</p></div>
        <div class="bi-cal"><div class="bi-cal-head"><b>${esc(monthName)}</b><span><button class="bi-nav" type="button" data-m="-1" aria-label="Previous month" ${canPrev ? "" : "disabled"}>${icon.back}</button><button class="bi-nav is-next" type="button" data-m="1" aria-label="Next month">${icon.back}</button></span></div>
          <div class="bi-week" aria-hidden="true">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => `<span>${w}</span>`).join("")}</div>
          <div class="bi-grid">${cells}</div>${avail.length ? "" : '<p class="bi-none">No open times this month. Try the next one.</p>'}</div>
        <div class="bi-times">${state.day ? `<p class="bi-day">${esc(dayLabel)}</p><div class="bi-time-list">${times}</div>` : ""}</div>
      </div>`, "slots");
    }).catch(() => fail("Couldn't load the open times."));
  };

  const viewForm = () => {
    const t = state.type, when = new Date(state.time);
    show(`<form class="bi-form" novalidate>
      <div class="bi-summary"><p class="bi-kicker">${esc(t.title)}, ${t.lengthInMinutes} min</p><p class="bi-when">${esc(when.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }))}, ${esc(when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }))}</p><p class="bi-sub">${esc(tz.replace(/_/g, " "))}</p></div>
      <label class="bi-field"><span>Your name</span><input name="name" autocomplete="name" required></label>
      <label class="bi-field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="bi-field"><span>What would you like to talk about? <i>Optional</i></span><textarea name="notes" rows="2"></textarea></label>
      <p class="bi-error" role="alert"></p>
      <button class="bi-cta" type="submit">Confirm booking</button>
    </form>`, "form");
    view.querySelector("input[name=name]").focus({ preventScroll: true });
  };

  const viewDone = (b) => {
    const when = new Date(state.time);
    show(`<div class="bi-msg is-done"><span class="bi-tick" aria-hidden="true">${icon.check}</span><h2 class="bi-h">You're booked.</h2>
      <p>${esc(state.type.title)}, ${esc(when.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }))} at ${esc(when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }))}.</p>
      <p class="bi-sub">An invite with the video link is on its way to ${esc(b.email)}.</p>
      <button class="bi-cta" type="button" data-close>Done</button></div>`, "done");
  };

  // ---------- actions ----------
  view.addEventListener("click", (e) => {
    const typeBtn = e.target.closest(".bi-type");
    if (typeBtn) { state.type = state.types[+typeBtn.dataset.i]; state.month = new Date(); state.month.setDate(1); state.day = null; viewSlots(); return; }
    const nav = e.target.closest(".bi-nav");
    if (nav) { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + +nav.dataset.m, 1); state.day = null; viewSlots(); return; }
    const cell = e.target.closest(".bi-cell.has");
    if (cell) { state.day = cell.dataset.day; viewSlots(); return; }
    const time = e.target.closest(".bi-time");
    if (time) { state.time = time.dataset.t; viewForm(); }
  });
  view.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, err = f.querySelector(".bi-error"), btn = f.querySelector(".bi-cta");
    const name = f.name.value.trim(), email = f.email.value.trim(), notes = f.notes.value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Add your name and a valid email."; return; }
    err.textContent = ""; btn.disabled = true; btn.textContent = "Booking…";
    fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "cal-api-version": "2024-08-13" },
      body: JSON.stringify({ start: new Date(state.time).toISOString(), eventTypeId: state.type.id, attendee: { name, email, timeZone: tz, language: "en" }, ...(notes ? { bookingFieldsResponses: { notes } } : {}) })
    }).then((r) => r.json().then((j) => ({ ok: r.ok, j }))).then(({ ok, j }) => {
      if (!ok || j.status === "error") throw new Error((j.error && j.error.message) || "failed");
      viewDone({ email });
    }).catch(() => { btn.disabled = false; btn.textContent = "Confirm booking"; err.innerHTML = `That time couldn't be booked. Pick another, or <a href="${base}" target="_blank" rel="noopener">book on Cal.com</a>.`; });
  });
  backBtn.addEventListener("click", () => {
    const step = view.dataset.step;
    if (step === "form") viewSlots(); else if (step === "slots" || step === "error") { state.type = null; viewTypes(); }
  });

  // ---------- the island ----------
  const target = () => { const w = Math.min(700, innerWidth - 32), h = Math.min(456, innerHeight - 48); return { x: (innerWidth - w) / 2, y: (innerHeight - h) / 2, w, h }; };
  const place = (r, radius) => { Object.assign(island.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`, borderRadius: radius }); };
  const open = (btn) => {
    from = btn; const b = btn.getBoundingClientRect();
    wrap.hidden = false; wrap.classList.remove("is-open", "is-closing");
    island.classList.add("no-anim"); place({ x: b.left, y: b.top, w: b.width, h: b.height }, `${b.height / 2}px`);
    void island.offsetWidth; island.classList.remove("no-anim");
    requestAnimationFrame(() => { wrap.classList.add("is-open"); place(target(), "1.75rem"); });
    state.type = null; viewTypes();
    root.classList.add("bi-locked");
    setTimeout(() => wrap.querySelector(".bi-close").focus({ preventScroll: true }), still() ? 0 : 450);
  };
  const close = () => {
    if (wrap.hidden) return;
    wrap.classList.remove("is-open"); wrap.classList.add("is-closing");
    const b = from && from.getBoundingClientRect();
    if (b && b.width && !still()) place({ x: b.left, y: b.top, w: b.width, h: b.height }, `${b.height / 2}px`);
    const done = () => { wrap.hidden = true; wrap.classList.remove("is-closing"); root.classList.remove("bi-locked"); if (from) from.focus({ preventScroll: true }); };
    if (still()) done(); else setTimeout(done, 440);
  };
  links.forEach((a) => a.addEventListener("click", (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); open(a); }));
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
  addEventListener("keydown", (e) => {
    if (wrap.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") {
      const f = Array.from(island.querySelectorAll("a[href], button:not([disabled]):not([hidden]), input, textarea")).filter((x) => x.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener("resize", () => { if (!wrap.hidden && wrap.classList.contains("is-open")) place(target(), "1.75rem"); });
})();
