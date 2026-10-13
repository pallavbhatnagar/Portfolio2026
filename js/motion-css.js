/* Display settings, "Calm" motion: makes the site's CSS treat Calm exactly as
   it treats a device that asks for reduced motion (and "Lively" as one that
   doesn't). The stylesheets keep plain reduced-motion media queries; this
   copies every reduced-motion rule so it also applies when <html> has
   data-motion="calm", and keeps every full-motion rule from applying then.
   It runs right after the stylesheets load, before the page is drawn, and
   once is enough: switching later only changes the attribute. */
(function () {
  var CALM = '[data-motion="calm"]';
  var NOT_CALM = ':not([data-motion="calm"])';

  // Split a selector list on top-level commas (not those inside :is() etc).
  function parts(list) {
    var out = [], depth = 0, cur = "";
    for (var i = 0; i < list.length; i++) {
      var ch = list[i];
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  // Add the condition on <html> to a selector without changing its weight
  // (:where() counts for nothing): on the selector's own html or :root, or
  // on the element it styles ("inside an html that ..."), before any
  // ::pseudo-element.
  function scope(selector, cond) {
    return parts(selector).map(function (s) {
      var m = s.match(/^(html|:root)(?![\w-])/);
      if (m) return m[1] + ":where(" + cond + ")" + s.slice(m[1].length);
      var p = s.search(/::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|-webkit-[\w-]+|-moz-[\w-]+)(\([^)]*\))?$/);
      var base = p >= 0 ? s.slice(0, p) : s, pe = p >= 0 ? s.slice(p) : "";
      return base + ":where(html" + cond + " *)" + pe;
    }).join(", ");
  }
  function styleText(rule, cond) {
    if (rule.type === 1) return scope(rule.selectorText, cond) + " { " + rule.style.cssText + " }";
    if (rule.cssRules) {
      var inner = [];
      for (var i = 0; i < rule.cssRules.length; i++) inner.push(styleText(rule.cssRules[i], cond));
      var head = rule.cssText.slice(0, rule.cssText.indexOf("{"));
      return head + "{ " + inner.join(" ") + " }";
    }
    return rule.cssText; // keyframes and the like stay as they are
  }
  function walk(owner) {
    var rules = owner.cssRules;
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.type !== 4) { if (r.cssRules && r.type !== 7) walk(r); continue; } // 4: @media, 7: @keyframes
      var media = r.media.mediaText;
      if (/prefers-reduced-motion:\s*no-preference/.test(media)) {
        // Full motion: never while Calm is on.
        for (var j = 0; j < r.cssRules.length; j++) {
          var sr = r.cssRules[j];
          if (sr.type === 1) sr.selectorText = scope(sr.selectorText, NOT_CALM);
        }
      } else if (/prefers-reduced-motion:\s*reduce/.test(media)) {
        // Reduced motion: also whenever Calm is on, whatever the device says.
        var copyMedia = media.replace(/\(\s*prefers-reduced-motion:\s*reduce\s*\)/g, "all");
        var inner = [];
        for (var k = 0; k < r.cssRules.length; k++) inner.push(styleText(r.cssRules[k], CALM));
        try { owner.insertRule("@media " + copyMedia + " { " + inner.join(" ") + " }", i + 1); i++; } catch (e) { /* skip a rule the browser can't re-read */ }
      } else {
        walk(r);
      }
    }
  }
  for (var s = 0; s < document.styleSheets.length; s++) {
    try { walk(document.styleSheets[s]); } catch (e) { /* another site's stylesheet */ }
  }
})();
