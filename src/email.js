import {getCorpus, slugify, parsePrice} from "./consensus.js";

const FROM = {name: "Reccas", email: "hello@reccas.com"};
const SITE = "https://reccas.com";
const MAX_PER_ADDRESS_PER_DAY = 4;
const MAX_PER_HOUR = 80;
const MAX_ALERTS_PER_RUN = 40;
const MIN_DROP = 0.05;

function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[m]; });
}
function dollars(n) { const v = Number(n); return Number.isFinite(v) ? "$" + v.toFixed(v % 1 ? 2 : 0) : ""; }

async function ensureEmailTables(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS email_log (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL,kind TEXT NOT NULL,ref TEXT,ok INTEGER NOT NULL,error TEXT,created_at TEXT NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_email_log_email ON email_log(email,created_at)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS email_unsubscribes (email TEXT PRIMARY KEY,created_at TEXT NOT NULL)")
  ]);
}

export async function unsubscribeToken(env, email) {
  if (!env.JWT_SECRET) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(env.JWT_SECRET)), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("unsubscribe:" + String(email).toLowerCase())));
  return Array.from(sig).slice(0, 16).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
async function unsubscribeUrl(env, email) {
  const t = await unsubscribeToken(env, email);
  return t ? SITE + "/unsubscribe?e=" + encodeURIComponent(email) + "&t=" + t : null;
}

function layout(bodyHtml, unsubUrl) {
  return "<div style=\"font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#1b153c;line-height:1.55\"><div style=\"font-size:22px;margin-bottom:18px\">Reccas</div>" + bodyHtml + "<p style=\"font-family:Arial,sans-serif;font-size:12px;color:#6e6882;margin-top:28px;border-top:1px solid #d9d3ef;padding-top:14px\">You are getting this because this address was entered at reccas.com. " + (unsubUrl ? "<a href=\"" + escHtml(unsubUrl) + "\" style=\"color:#6e6882\">Unsubscribe</a>." : "Reply to this email to be removed.") + "</p></div>";
}

// Returns {ok, error}. Never throws: a failed email must not fail the signup that triggered it.
export async function sendEmail(env, msg) {
  const now = new Date(), to = String(msg.to || "").trim().toLowerCase();
  let ok = false, error = null;
  try {
    await ensureEmailTables(env);
    if (!env.EMAIL) error = "EMAIL binding missing";
    else if (await env.DB.prepare("SELECT email FROM email_unsubscribes WHERE email=? LIMIT 1").bind(to).first()) error = "unsubscribed";
    else {
      const dayAgo = new Date(now.getTime() - 86400000).toISOString(), hourAgo = new Date(now.getTime() - 3600000).toISOString();
      const perAddress = await env.DB.prepare("SELECT COUNT(*) n FROM email_log WHERE email=? AND ok=1 AND created_at>?").bind(to, dayAgo).first();
      const perHour = await env.DB.prepare("SELECT COUNT(*) n FROM email_log WHERE ok=1 AND created_at>?").bind(hourAgo).first();
      if (perAddress && perAddress.n >= MAX_PER_ADDRESS_PER_DAY) error = "address daily limit";
      else if (perHour && perHour.n >= MAX_PER_HOUR) error = "hourly limit";
      else {
        const unsub = await unsubscribeUrl(env, to);
        await env.EMAIL.send({from: FROM, to: to, replyTo: FROM.email, subject: String(msg.subject), html: layout(msg.html, unsub), text: String(msg.text || "") + (unsub ? "\n\nUnsubscribe: " + unsub : "")});
        ok = true;
      }
    }
  } catch (e) {
    error = String(e && e.message || e).slice(0, 400);
  }
  try { await env.DB.prepare("INSERT INTO email_log (email,kind,ref,ok,error,created_at) VALUES (?,?,?,?,?,?)").bind(to, String(msg.kind || "other"), msg.ref || null, ok ? 1 : 0, error, now.toISOString()).run(); } catch (_) {}
  return {ok: ok, error: error};
}

export async function confirmSignup(env, info) {
  if (info.kind === "price_alert") {
    const w = info.watch || {}, label = [w.brand, w.name].filter(Boolean).join(" ") || "this product";
    const corpus = await getCorpus(env), prod = corpus.products.get(slugify(String(w.brand || "") + " " + String(w.name || "")));
    const tracked = !!(prod && prod.pick && prod.pick._static), link = prod ? SITE + "/products/" + prod.key : SITE + "/recommendations";
    const how = tracked
      ? "Reccas checks its live price once a day and will email you if it falls at least 5% below today’s price."
      : "Reccas does not have an automatic daily price check for this product yet. Your request is saved, and you will get an email once it is covered and the price falls.";
    return sendEmail(env, {
      to: info.email, kind: "price_alert_confirm", ref: String(w.watchKey || ""),
      subject: "Sale alert on: " + label,
      html: "<p style=\"font-size:18px\">You are watching <a href=\"" + escHtml(link) + "\" style=\"color:#4255ff\">" + escHtml(label) + "</a>" + (parsePrice(w.price) != null ? " at " + escHtml(dollars(parsePrice(w.price))) : "") + ".</p><p>" + escHtml(how) + "</p>",
      text: "You are watching " + label + ". " + how + "\n" + link
    });
  }
  return sendEmail(env, {
    to: info.email, kind: "list_confirm", ref: "newsletter",
    subject: "You are on the Reccas list",
    html: "<p style=\"font-size:18px\">You are on the Reccas list.</p><p>Reccas tracks what fashion editors, stylists, creators and testers recommend and counts where independent sources agree. You will hear from us when a widely recommended product goes on sale, and when Best of Fashion changes: new winners, products gaining support and ones that have been dropped. It will be occasional.</p><p><a href=\"" + SITE + "/recommendations\" style=\"color:#4255ff\">See Best of Fashion</a></p>",
    text: "You are on the Reccas list. You will hear from us when a widely recommended product goes on sale, and when Best of Fashion changes.\n" + SITE + "/recommendations"
  });
}

// Runs after the daily price sync. Only products with a live catalog price can trigger an alert.
export async function sendPriceDropAlerts(env) {
  const today = new Date().toISOString().slice(0, 10), corpus = await getCorpus(env);
  let prices = [];
  try { prices = (await env.DB.prepare("SELECT product_key,price FROM price_observations WHERE observed_on=?").bind(today).all()).results || []; } catch (_) { return 0; }
  const live = new Map(prices.map(function (p) { return [p.product_key, Number(p.price)]; }));
  if (!live.size) return 0;
  let watchers = [];
  try { watchers = watchers.concat((await env.DB.prepare("SELECT email,watch_key,brand,product_name,baseline_price FROM price_alert_emails WHERE status='active'").all()).results || []); } catch (_) {}
  try { watchers = watchers.concat((await env.DB.prepare("SELECT u.email email,w.watch_key,w.brand,w.product_name,w.baseline_price FROM price_watches w JOIN users u ON u.id=w.user_id WHERE w.status='active' AND u.email IS NOT NULL").all()).results || []); } catch (_) {}
  let sent = 0;
  const seen = new Set();
  for (const w of watchers) {
    if (sent >= MAX_ALERTS_PER_RUN) break;
    const key = slugify(String(w.brand || "") + " " + String(w.product_name || "")), now = live.get(key), base = Number(w.baseline_price);
    if (!key || now == null || !Number.isFinite(base) || base <= 0 || now > base * (1 - MIN_DROP)) continue;
    const ref = key + "@" + now, dedupe = String(w.email).toLowerCase() + "|" + ref;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    let already = null;
    try { already = await env.DB.prepare("SELECT id FROM email_log WHERE email=? AND kind='price_drop' AND ref=? AND ok=1 LIMIT 1").bind(String(w.email).toLowerCase(), ref).first(); } catch (_) {}
    if (already) continue;
    const prod = corpus.products.get(key), label = [w.brand, w.product_name].filter(Boolean).join(" "), link = SITE + "/products/" + key, pct = Math.round((1 - now / base) * 100);
    const r = await sendEmail(env, {
      to: w.email, kind: "price_drop", ref: ref,
      subject: label + " is now " + dollars(now) + " (was " + dollars(base) + ")",
      html: "<p style=\"font-size:18px\">" + escHtml(label) + " dropped to <strong>" + escHtml(dollars(now)) + "</strong>, down " + pct + "% from " + escHtml(dollars(base)) + " when you set your alert.</p>" + (prod ? "<p>" + prod.independent.length + " independent sources tracked by Reccas recommend it.</p>" : "") + "<p><a href=\"" + escHtml(link) + "\" style=\"color:#4255ff\">See the price and who recommends it</a></p><p style=\"font-size:13px;color:#6e6882\">Prices change quickly; check the retailer before you buy. Reccas may earn a commission from some shopping links.</p>",
      text: label + " dropped to " + dollars(now) + ", down " + pct + "% from " + dollars(base) + ".\n" + link
    });
    if (r.ok) sent++;
  }
  return sent;
}

// List subscribers get at most one digest a week, and only when a tracked product recommended by
// two or more independent sources is at least 10% below the first price Reccas recorded for it.
export async function sendSaleDigest(env) {
  const today = new Date().toISOString().slice(0, 10), corpus = await getCorpus(env);
  let rows = [];
  try { rows = (await env.DB.prepare("SELECT p.product_key,p.price now,(SELECT f.price FROM price_observations f WHERE f.product_key=p.product_key ORDER BY f.observed_on ASC LIMIT 1) base FROM price_observations p WHERE p.observed_on=?").bind(today).all()).results || []; } catch (_) { return 0; }
  const drops = rows.map(function (r) { return {prod: corpus.products.get(r.product_key), now: Number(r.now), base: Number(r.base)}; })
    .filter(function (d) { return d.prod && d.prod.independent.length >= 2 && d.base > 0 && d.now <= d.base * 0.9; })
    .sort(function (a, b) { return a.now / a.base - b.now / b.base; }).slice(0, 6);
  if (!drops.length) return 0;
  let people = [];
  try { people = (await env.DB.prepare("SELECT DISTINCT lower(email) email FROM emails WHERE source IN ('newsletter','popup') AND email IS NOT NULL").all()).results || []; } catch (_) { return 0; }
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const items = drops.map(function (d) { const pct = Math.round((1 - d.now / d.base) * 100); return {label: d.prod.brand + " " + d.prod.name, link: SITE + "/products/" + d.prod.key, line: dollars(d.now) + ", down " + pct + "% from " + dollars(d.base), sources: d.prod.independent.length}; });
  let sent = 0;
  for (const person of people) {
    if (sent >= MAX_ALERTS_PER_RUN) break;
    let recent = null;
    try { recent = await env.DB.prepare("SELECT id FROM email_log WHERE email=? AND kind='sale_digest' AND ok=1 AND created_at>? LIMIT 1").bind(person.email, weekAgo).first(); } catch (_) {}
    if (recent) continue;
    const r = await sendEmail(env, {
      to: person.email, kind: "sale_digest", ref: today,
      subject: items.length === 1 ? items[0].label + " is on sale" : items.length + " widely recommended products are on sale",
      html: "<p style=\"font-size:18px\">On sale now among the products Reccas tracks:</p>" + items.map(function (i) { return "<p><a href=\"" + escHtml(i.link) + "\" style=\"color:#4255ff\">" + escHtml(i.label) + "</a><br>" + escHtml(i.line) + " · recommended by " + i.sources + " independent sources</p>"; }).join("") + "<p style=\"font-size:13px;color:#6e6882\">Prices change quickly; check the retailer before you buy. Reccas may earn a commission from some shopping links.</p>",
      text: items.map(function (i) { return i.label + ": " + i.line + "\n" + i.link; }).join("\n\n")
    });
    if (r.ok) sent++;
  }
  return sent;
}

export function createUnsubscribe(h) {
  const page = h.page, esc = h.esc;
  function view(title, body) {
    return page("/unsubscribe", title, "<main class='wrap'><section class='hero'><span class='eyebrow'>Email preferences</span><h1>" + esc(title) + "</h1>" + body + "</section></main>", "Manage Reccas email.", 200, "noindex, nofollow");
  }
  return async function unsubscribe(request, env) {
    const u = new URL(request.url), email = String(u.searchParams.get("e") || "").trim().toLowerCase(), token = String(u.searchParams.get("t") || "");
    const expected = email ? await unsubscribeToken(env, email) : null;
    if (!expected || token !== expected) return view("This link is not valid", "<p>Email <a class='plainLink' href='mailto:hello@reccas.com'>hello@reccas.com</a> and you will be removed.</p>");
    if (request.method !== "POST") return view("Unsubscribe from Reccas email?", "<p>" + esc(email) + " will stop receiving the Reccas list and all sale alerts.</p><form method='post' action='/unsubscribe?e=" + encodeURIComponent(email) + "&t=" + esc(token) + "' style='margin-top:20px'><button class='btn' type='submit'>Unsubscribe</button></form>");
    try {
      await ensureEmailTables(env);
      await env.DB.prepare("INSERT OR IGNORE INTO email_unsubscribes (email,created_at) VALUES (?,?)").bind(email, new Date().toISOString()).run();
      try { await env.DB.prepare("UPDATE price_alert_emails SET status='removed' WHERE email=?").bind(email).run(); } catch (_) {}
    } catch (_) {
      return view("Something went wrong", "<p>Email <a class='plainLink' href='mailto:hello@reccas.com'>hello@reccas.com</a> and you will be removed.</p>");
    }
    return view("You are unsubscribed", "<p>" + esc(email) + " will not receive any more email from Reccas.</p>");
  };
}
