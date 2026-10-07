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

  // One private screen of the numbers that show whether anyone is using the site.
  async function metricsPage(request, env) {
    const gate = await h.requireAdmin(request, env);
    if (gate) return gate.status === 401 ? Response.redirect("https://reccas.com/login?returnTo=%2Fadmin%2Fmetrics", 302) : page("/admin/metrics", "Admin access required", "<main class='wrap'><section class='hero'><h1>Admin access required</h1></section></main>", "Admin", 403, "noindex, nofollow");
    const now = Date.now(), wk = new Date(now - 7 * 86400000).toISOString(), prev = new Date(now - 14 * 86400000).toISOString();
    async function rows(sql) { try { const st = env.DB.prepare(sql), args = [].slice.call(arguments, 1); return ((args.length ? await st.bind.apply(st, args).all() : await st.all()).results) || []; } catch (_) { return []; } }
    async function pair(table, col, where) { const a = await rows("SELECT COUNT(*) n FROM " + table + " WHERE " + col + ">?" + (where ? " AND " + where : ""), wk), b = await rows("SELECT COUNT(*) n FROM " + table + " WHERE " + col + ">? AND " + col + "<=?" + (where ? " AND " + where : ""), prev, wk); return {now: a[0] ? a[0].n : 0, before: b[0] ? b[0].n : 0}; }
    const corpus = await getCorpus(env);
    const signups = await pair("emails", "created_at", "source IN ('newsletter','popup')"), alerts = await pair("price_alert_emails", "created_at"), ai = await pair("ai_referrals", "observed_at"), searches = await pair("search_queries", "created_at"), clicks = await pair("outbound_clicks", "clicked_at", "recommendation_id IS NOT NULL"), sent = await pair("email_log", "created_at", "ok=1");
    const aiBy = await rows("SELECT source,COUNT(*) n FROM ai_referrals WHERE observed_at>? GROUP BY source ORDER BY n DESC", wk);
    const topSearch = await rows("SELECT q,COUNT(*) n,MAX(products+guides+sources) found FROM search_queries WHERE created_at>? GROUP BY q ORDER BY n DESC LIMIT 15", wk);
    const topClicks = await rows("SELECT recommendation_id k,COUNT(*) n FROM outbound_clicks WHERE clicked_at>? AND recommendation_id IS NOT NULL GROUP BY recommendation_id ORDER BY n DESC LIMIT 10", wk);
    const checks = await rows("SELECT status,COUNT(*) n FROM mention_checks GROUP BY status");
    const priced = await rows("SELECT COUNT(DISTINCT product_key) n FROM price_observations WHERE observed_on>?", new Date(now - 2 * 86400000).toISOString().slice(0, 10));
    const tile = function (label, v) { return "<span><strong>" + v.now + "</strong>" + esc(label) + "<br><small>" + v.before + " the week before</small></span>"; };
    const table = function (head, list, fn) { return list.length ? "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr>" + head.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" + list.map(fn).join("") + "</tbody></table></div>" : "<p class='muted'>Nothing recorded yet.</p>"; };
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Admin</span><h1>This week in numbers</h1><p>The last 7 days against the 7 before. Shop clicks count only people: visits from crawlers are not recorded, and counting began when the filter was added on 2026-10-07.</p><div class='statRow'>" + tile("email signups", signups) + tile("sale alerts set", alerts) + tile("shop clicks by people", clicks) + tile("visits from AI assistants", ai) + tile("site searches", searches) + tile("emails sent", sent) + "</div></section>"
      + "<section class='section'><h2>Visits from AI assistants</h2>" + table(["Assistant", "Visits"], aiBy, function (r) { return "<tr><td>" + esc(r.source) + "</td><td>" + r.n + "</td></tr>"; }) + "</section>"
      + "<section class='section'><h2>What people searched for</h2>" + table(["Search", "Times", "Found anything"], topSearch, function (r) { return "<tr><td>" + esc(r.q) + "</td><td>" + r.n + "</td><td>" + (r.found ? "Yes" : "No") + "</td></tr>"; }) + "</section>"
      + "<section class='section'><h2>Most shopped products</h2>" + table(["Product", "Clicks"], topClicks, function (r) { const p = corpus.products.get(r.k); return "<tr><td>" + (p ? "<a class='plainLink' href='/products/" + esc(p.key) + "'>" + esc(p.brand + " " + p.name) + "</a>" : esc(r.k)) + "</td><td>" + r.n + "</td></tr>"; }) + "</section>"
      + "<section class='section'><h2>The dataset</h2><div class='statRow'><span><strong>" + corpus.stats.mentions + "</strong>counted recommendations</span><span><strong>" + corpus.stats.products + "</strong>products</span><span><strong>" + corpus.stats.sources + "</strong>sources</span><span><strong>" + corpus.stats.guides + "</strong>published categories</span><span><strong>" + (priced[0] ? priced[0].n : 0) + "</strong>products priced in the last 2 days</span><span><strong>" + (corpus.anchored || 0) + "</strong>products tied to a catalog record</span>" + checks.map(function (c) { return "<span><strong>" + c.n + "</strong>source checks: " + esc(c.status.replace("_", " ")) + "</span>"; }).join("") + "</div><p style='margin-top:20px'><a class='plainLink' href='/admin/review'>Recommendation review log →</a></p></section></main>";
    return page("/admin/metrics", "This week in numbers", body, "Admin metrics.", 200, "noindex, nofollow");
  }

  return {reviewPage: reviewPage, setStatus: setStatus, metricsPage: metricsPage};
}
