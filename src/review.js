import {getCorpus, ensureObservationTables, resetCorpusCache} from "./consensus.js";

const STATUSES = {disputed: "Not counted (under review)", confirmed: "Confirmed by hand", removed: "Removed", clear: "Cleared"};

// Admin-only review of recommendations the weekly source check could not find.
export function createReview(h) {
  const page = h.page, esc = h.esc;

  async function setStatus(request, env) {
    const gate = await h.requireAdmin(request, env);
    if (gate) return Response.json({error: gate.error}, {status: gate.status});
    let b = {};
    try { b = await request.json(); } catch (_) {}
    const key = String(b.mentionKey || "").slice(0, 1200), status = String(b.status || "");
    if (!key || !STATUSES[status]) return Response.json({error: "Bad request"}, {status: 400});
    await ensureObservationTables(env);
    const r = await env.DB.prepare("UPDATE mention_observations SET status=?,status_note=?,reviewed_at=? WHERE mention_key=?").bind(status === "clear" ? null : status, String(b.note || "").slice(0, 300) || "manual", new Date().toISOString(), key).run();
    resetCorpusCache();
    return Response.json({ok: true, changed: r.meta ? r.meta.changes : null}, {headers: {"Cache-Control": "no-store"}});
  }

  async function reviewPage(request, env) {
    const gate = await h.requireAdmin(request, env);
    if (gate) return gate.status === 401 ? Response.redirect("https://reccas.com/login?returnTo=%2Fadmin%2Freview", 302) : page("/admin/review", "Admin access required", "<main class='wrap'><section class='hero'><h1>Admin access required</h1></section></main>", "Admin", 403, "noindex, nofollow");
    await ensureObservationTables(env);
    const corpus = await getCorpus(env);
    let rows = [];
    try {
      rows = (await env.DB.prepare("SELECT o.mention_key,o.product_key,o.guide_slug,o.source,o.url,o.label,o.independent,o.status,o.status_note,o.author,o.modified_at,o.published_at,c.status check_status,c.checked_on,c.verified_on,c.detail FROM mention_observations o LEFT JOIN mention_checks c ON c.mention_key=o.mention_key WHERE o.status IS NOT NULL OR c.status='not_found' ORDER BY o.independent DESC,o.guide_slug,o.product_key").all()).results || [];
    } catch (_) {}
    let blocked = 0, verified = 0;
    try {
      const t = (await env.DB.prepare("SELECT status,COUNT(*) n FROM mention_checks GROUP BY status").all()).results || [];
      t.forEach(function (x) { if (x.status === "blocked") blocked = x.n; if (x.status === "verified") verified = x.n; });
    } catch (_) {}
    function row(r) {
      const prod = corpus.products.get(r.product_key), guide = corpus.guides.get(r.guide_slug), name = prod ? prod.brand + " " + prod.name : r.product_key;
      const state = (r.status ? STATUSES[r.status] || r.status : "Waiting for the second read") + (r.status_note ? " · " + r.status_note : "");
      const buttons = ["disputed", "confirmed", "removed", "clear"].filter(function (s) { return s !== (r.status || "clear"); }).map(function (s) { return "<button class='btn alt js-status' type='button' style='padding:7px 11px;font-size:12px' data-key='" + esc(r.mention_key) + "' data-status='" + s + "'>" + esc(s === "disputed" ? "Don’t count" : s === "confirmed" ? "It’s there, keep" : s === "removed" ? "Remove" : "Reset") + "</button>"; }).join(" ");
      return "<tr><td><strong>" + esc(r.source) + "</strong>" + (r.independent ? "" : "<div class='rankMeta'>brand or retailer page</div>") + "<div class='rankMeta'><a class='plainLink' href='" + esc(r.url) + "' target='_blank' rel='noreferrer'>Open the article ↗</a></div></td><td><a class='plainLink' href='/products/" + esc(r.product_key) + "'>" + esc(name) + "</a><div class='rankMeta'>" + esc(r.label || "") + (guide ? " · " + esc(guide.title) : "") + "</div></td><td>" + esc(state) + "<div class='rankMeta'>" + (r.check_status === "not_found" ? "Not found when checked " + esc(r.checked_on || "") : r.check_status ? esc(r.check_status) + " " + esc(r.checked_on || "") : "") + "</div></td><td style='white-space:nowrap'>" + buttons + "</td></tr>";
    }
    const pending = rows.filter(function (r) { return !r.status; }), decided = rows.filter(function (r) { return r.status; });
    const table = function (list) { return "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Source</th><th>Product Reccas says it recommends</th><th>State</th><th>Decision</th></tr></thead><tbody>" + list.map(row).join("") + "</tbody></table></div>"; };
    const script = "<script>(function(){document.querySelectorAll('.js-status').forEach(function(b){b.addEventListener('click',async function(){b.disabled=true;var r=await fetch('/_api/admin/mention-status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mentionKey:b.dataset.key,status:b.dataset.status})});if(r.ok)location.reload();else{b.disabled=false;alert('Could not save')}})})})();</script>";
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Admin</span><h1>Recommendation review</h1><p>A log of recommendations the weekly check could not find, and what was decided. Decisions are made automatically by rule; use the buttons only to override one. Anything you set by hand is never changed by the automation.</p><div class='statRow'><span><strong>" + pending.length + "</strong>waiting</span><span><strong>" + decided.length + "</strong>decided</span><span><strong>" + verified + "</strong>confirmed automatically</span><span><strong>" + blocked + "</strong>blocked by the publisher</span></div></section><section class='section'><h2>Waiting for the second read</h2>" + (pending.length ? table(pending) : "<p class='muted'>Nothing waiting.</p>") + "</section>" + (decided.length ? "<section class='section'><h2>Decided</h2>" + table(decided) + "</section>" : "") + "</main>" + script;
    return page("/admin/review", "Recommendation review", body, "Admin review.", 200, "noindex, nofollow");
  }

  return {reviewPage: reviewPage, setStatus: setStatus};
}
