import {STATIC_EDITS} from "./static-edits.js";

export const FRANCHISE_YEAR = 2026;
export const FRANCHISE_PATH = "/recommendations";
export const AWARD_MIN_SOURCES = 3;
export const TRACKING_STARTED = "2026-10-07";
const INDEXABLE_PRODUCT_MIN_SOURCES = 2;
const INDEXABLE_SOURCE_MIN_PRODUCTS = 3;
const MERGED_GUIDE_MAX_PICKS = 8;
const CORPUS_TTL_MS = 60000;

// Near-duplicate guides fold into one canonical guide; the old URLs 301 there.
export const GUIDE_REDIRECTS = {
  "best-crossbody-bags-for-women": "best-crossbody-bags",
  "best-leather-crossbody-bags-for-women": "best-crossbody-bags",
  "best-crossbody-bags-for-moms": "best-crossbody-bags",
  "best-everyday-crossbody-bags": "best-crossbody-bags",
  "best-crossbody-bags-for-travel-anti-theft": "best-crossbody-bags-for-travel",
  "best-luxury-crossbody-bags": "best-designer-crossbody-bags",
  "best-quiet-luxury-crossbody-bags": "best-designer-crossbody-bags"
};
const GUIDE_OVERRIDES = {
  "best-crossbody-bags": {
    title: "The best crossbody bags for women",
    seoTitle: "Best Crossbody Bags for Women, by Editor Consensus",
    description: "Everyday, leather and hands-free crossbody bags ranked by how many independent fashion and travel sources recommend each one.",
    deck: "One list instead of five overlapping ones: everyday, leather and hands-free crossbody bags, ranked by independent recommendations."
  },
  "best-crossbody-bags-for-travel": {
    title: "Best crossbody bags for travel",
    seoTitle: "Best Crossbody Bags for Travel, Including Anti-Theft Picks",
    description: "Travel crossbody bags, including anti-theft styles with locking zippers and slash-resistant straps, ranked by independent recommendations.",
    deck: "Travel crossbody bags and anti-theft styles in one list, ranked by how many independent sources recommend each one."
  },
  "best-designer-crossbody-bags": {
    title: "The best designer and luxury crossbody bags",
    seoTitle: "Best Designer & Luxury Crossbody Bags, by Editor Consensus",
    description: "Designer, quiet-luxury and luxury crossbody bags ranked by how many independent fashion sources recommend each one.",
    deck: "Contemporary designer through true luxury in one list, ranked by independent recommendations rather than price."
  }
};

export const CATEGORIES = {
  clothing: {label: "Clothing", description: "T-shirts, dresses, trousers, jeans, sweaters, blazers, coats and other wardrobe staples."},
  shoes: {label: "Shoes", description: "Loafers, flats, sneakers, boots, heels, sandals and other footwear."},
  bags: {label: "Bags", description: "Totes, crossbody bags, shoulder bags, clutches and everyday carry."},
  accessories: {label: "Accessories", description: "Belts, sunglasses, scarves, hats and other finishing pieces."}
};
export function guideCategory(r) {
  const t = (" " + String((r && r.title) || "") + " " + String((r && r.slug) || "") + " ").toLowerCase();
  if (/\b(shoe|shoes|sneaker|sneakers|loafer|loafers|flat|flats|boot|boots|heel|heels|sandal|sandals|mule|mules|pump|pumps|ballet)\b/.test(t)) return "shoes";
  if (/\b(bag|bags|tote|totes|crossbody|clutch|clutches|purse|purses|backpack|backpacks|handbag|handbags|shoulder bag)\b/.test(t)) return "bags";
  if (/\b(accessor|belt|belts|sunglass|sunglasses|scarf|scarves|hat|hats|jewelry|jewellery|watch|watches|sock|socks)\b/.test(t)) return "accessories";
  return "clothing";
}

const SOURCE_ALIASES = {"shop today": "TODAY", "today": "TODAY"};
const RETAILER_SOURCES = new Set(["nordstrom", "amazon", "zappos", "shopbop", "revolve", "netaporter", "saksfifthavenue", "bloomingdales", "macys"]);

export function slugify(v) {
  return String(v || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/\+/g, " plus ").replace(/['’.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function compact(v) { return slugify(v).replace(/-/g, ""); }
function host(v) { try { return new URL(String(v)).hostname.replace(/^www\./, "").toLowerCase(); } catch (_) { return ""; } }
function sourceName(v) { const n = String(v || "").trim(); return SOURCE_ALIASES[n.toLowerCase()] || n; }
export function parsePrice(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const m = String(v).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

// A brand's own page, a retailer listing or customer reviews are product
// references, not independent recommendations, and never count toward consensus.
function isIndependent(ev, pick) {
  const s = compact(ev.source), b = compact(pick.brand);
  if (!s) return false;
  if (b && (s.indexOf(b) >= 0 || b.indexOf(s) >= 0)) return false;
  if (RETAILER_SOURCES.has(s)) return false;
  if (/\b(product details|listing)\b/i.test(String(ev.label || ""))) return false;
  const eh = host(ev.url), sh = host(pick.shopUrl || pick.canonicalUrl);
  if (eh && sh && eh === sh) return false;
  if (eh && b && compact(eh.split(".")[0]) === b) return false;
  return true;
}

function normalizeEvidence(pick) {
  const seen = new Set(), out = [];
  (pick.evidence || []).forEach(function (ev) {
    if (!ev || !ev.source) return;
    const name = sourceName(ev.source), id = slugify(name) + "|" + String(ev.url || "");
    if (seen.has(id)) return;
    seen.add(id);
    out.push({source: name, sourceSlug: slugify(name), label: String(ev.label || ""), url: String(ev.url || ""), author: ev.author || null, date: ev.date || null, independent: isIndependent(ev, pick)});
  });
  return out;
}
function independentNames(evidence) {
  const names = [];
  evidence.forEach(function (ev) { if (ev.independent && names.indexOf(ev.source) < 0) names.push(ev.source); });
  return names;
}

async function loadEdits(env) {
  const bySlug = new Map();
  let rows = [];
  try { rows = (await env.DB.prepare("SELECT slug,json FROM sourced_shopping_edits ORDER BY slug").all()).results || []; } catch (_) {}
  rows.forEach(function (row) {
    try {
      const e = JSON.parse(row.json);
      if (e && Array.isArray(e.picks)) bySlug.set(String(row.slug), {edit: e, isStatic: false});
    } catch (_) {}
  });
  Object.keys(STATIC_EDITS).forEach(function (slug) {
    if (!bySlug.has(slug)) bySlug.set(slug, {edit: JSON.parse(JSON.stringify(STATIC_EDITS[slug])), isStatic: true});
  });
  return bySlug;
}

function buildCorpus(edits) {
  const guides = new Map(), products = new Map(), sources = new Map();
  const members = new Map();
  edits.forEach(function (_, slug) {
    const canonical = GUIDE_REDIRECTS[slug] || slug;
    if (!members.has(canonical)) members.set(canonical, []);
    if (slug === canonical) members.get(canonical).unshift(slug); else members.get(canonical).push(slug);
  });
  members.forEach(function (slugs, canonical) {
    const base = edits.get(canonical) || edits.get(slugs[0]);
    if (!base) return;
    const byKey = new Map();
    let order = 0;
    slugs.forEach(function (memberSlug) {
      const member = edits.get(memberSlug);
      if (!member) return;
      (member.edit.picks || []).forEach(function (raw) {
        const key = slugify(String(raw.brand || "") + " " + String(raw.name || ""));
        if (!key) return;
        const evidence = normalizeEvidence(raw);
        if (!byKey.has(key)) {
          byKey.set(key, Object.assign({}, raw, {key: key, evidence: evidence, _static: member.isStatic, _order: order++}));
        } else {
          const have = byKey.get(key), ids = new Set(have.evidence.map(function (ev) { return ev.sourceSlug + "|" + ev.url; }));
          evidence.forEach(function (ev) { if (!ids.has(ev.sourceSlug + "|" + ev.url)) have.evidence.push(ev); });
        }
      });
    });
    let picks = Array.from(byKey.values());
    picks.forEach(function (p) { p.independent = independentNames(p.evidence); });
    picks.sort(function (a, b) { return b.independent.length - a.independent.length || a._order - b._order; });
    if (slugs.length > 1) picks = picks.slice(0, MERGED_GUIDE_MAX_PICKS);
    picks.forEach(function (p, i) { p.rank = i + 1; });
    const guideSources = [];
    picks.forEach(function (p) { p.independent.forEach(function (n) { if (guideSources.indexOf(n) < 0) guideSources.push(n); }); });
    const override = GUIDE_OVERRIDES[canonical] || {};
    const e = base.edit;
    const guide = {
      slug: canonical,
      title: override.title || e.title || canonical,
      seoTitle: override.seoTitle || e.seoTitle || e.title || canonical,
      description: override.description || e.description || e.deck || "",
      deck: override.deck || e.deck || e.description || "",
      checkedLabel: String(e.checkedLabel || "Sep 2026").replace(/^checked\s+/i, ""),
      freshnessCopy: e.freshnessCopy || "",
      picks: picks,
      independentSources: guideSources,
      merged: slugs.filter(function (s) { return s !== canonical; })
    };
    guide.category = guideCategory(guide);
    guides.set(canonical, guide);

    picks.forEach(function (p) {
      if (!products.has(p.key)) products.set(p.key, {key: p.key, brand: p.brand, name: p.name, summary: p.summary || "", fitNote: p.fitNote || "", evidence: [], appearances: [], image: {slug: canonical, rank: p.rank}, pick: p, guideSlug: canonical});
      const prod = products.get(p.key), ids = new Set(prod.evidence.map(function (ev) { return ev.sourceSlug + "|" + ev.url; }));
      p.evidence.forEach(function (ev) { if (!ids.has(ev.sourceSlug + "|" + ev.url)) prod.evidence.push(Object.assign({guideSlug: canonical}, ev)); });
      prod.appearances.push({slug: canonical, title: guide.title, rank: p.rank, category: guide.category});
    });
  });
  products.forEach(function (prod) {
    prod.independent = independentNames(prod.evidence);
    prod.category = prod.appearances[0] ? prod.appearances[0].category : "clothing";
    prod.evidence.forEach(function (ev) {
      if (!ev.independent) return;
      if (!sources.has(ev.sourceSlug)) sources.set(ev.sourceSlug, {slug: ev.sourceSlug, name: ev.source, mentions: [], productKeys: []});
      const src = sources.get(ev.sourceSlug);
      src.mentions.push({productKey: prod.key, brand: prod.brand, name: prod.name, label: ev.label, url: ev.url, guideSlug: ev.guideSlug});
      if (src.productKeys.indexOf(prod.key) < 0) src.productKeys.push(prod.key);
    });
  });
  const guideList = Array.from(guides.values()).sort(function (a, b) { return b.independentSources.length - a.independentSources.length || a.title.localeCompare(b.title); });
  const productList = Array.from(products.values()).sort(function (a, b) { return b.independent.length - a.independent.length || b.appearances.length - a.appearances.length || (a.brand + a.name).localeCompare(b.brand + b.name); });
  const sourceList = Array.from(sources.values()).sort(function (a, b) { return b.productKeys.length - a.productKeys.length || a.name.localeCompare(b.name); });
  let mentions = 0;
  productList.forEach(function (p) { p.evidence.forEach(function (ev) { if (ev.independent) mentions++; }); });
  const counts = {clothing: 0, shoes: 0, bags: 0, accessories: 0};
  guideList.forEach(function (g) { counts[g.category]++; });
  return {guides: guides, products: products, sources: sources, guideList: guideList, productList: productList, sourceList: sourceList, stats: {guides: guideList.length, products: productList.length, sources: sourceList.length, mentions: mentions}, categoryCounts: counts};
}

let corpusCache = {at: 0, corpus: null};
let navCategoryKeys = ["clothing", "shoes", "bags"];
export async function getCorpus(env) {
  const now = Date.now();
  if (corpusCache.corpus && now - corpusCache.at < CORPUS_TTL_MS) return corpusCache.corpus;
  const corpus = buildCorpus(await loadEdits(env));
  corpusCache = {at: now, corpus: corpus};
  navCategoryKeys = Object.keys(CATEGORIES).filter(function (k) { return corpus.categoryCounts[k] > 0; });
  return corpus;
}
export function navCategories() {
  return navCategoryKeys.map(function (k) { return {key: k, label: CATEGORIES[k].label}; });
}
export async function getGuide(env, slug) {
  const corpus = await getCorpus(env);
  return corpus.guides.get(slug) || null;
}
// Kept for the legacy guide library and agent endpoints that list recommendation guides.
export async function guideIndex(env) {
  const corpus = await getCorpus(env);
  return corpus.guideList.map(function (g) { return {slug: g.slug, title: g.title, description: g.description, picks: g.picks.length, sources: g.independentSources.length, kind: "sourced"}; });
}

/* ---------- observation log: when Reccas first and last saw each mention ---------- */

async function ensureObservationTables(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS mention_observations (mention_key TEXT PRIMARY KEY,product_key TEXT NOT NULL,guide_slug TEXT,source TEXT NOT NULL,source_slug TEXT NOT NULL,url TEXT,label TEXT,independent INTEGER NOT NULL DEFAULT 1,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_mention_observations_product ON mention_observations(product_key)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS price_observations (product_key TEXT NOT NULL,observed_on TEXT NOT NULL,price REAL NOT NULL,currency TEXT DEFAULT 'USD',merchant TEXT,PRIMARY KEY(product_key,observed_on))")
  ]);
}
function mentionKey(productKey, ev) { return productKey + "|" + ev.sourceSlug + "|" + ev.url; }

export async function syncMentions(env) {
  const corpus = buildCorpus(await loadEdits(env)), today = new Date().toISOString().slice(0, 10);
  await ensureObservationTables(env);
  const stmts = [];
  corpus.productList.forEach(function (prod) {
    prod.evidence.forEach(function (ev) {
      stmts.push(env.DB.prepare("INSERT INTO mention_observations (mention_key,product_key,guide_slug,source,source_slug,url,label,independent,first_seen,last_seen) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(mention_key) DO UPDATE SET last_seen=excluded.last_seen,label=excluded.label,independent=excluded.independent").bind(mentionKey(prod.key, ev), prod.key, ev.guideSlug || null, ev.source, ev.sourceSlug, ev.url, ev.label, ev.independent ? 1 : 0, today, today));
    });
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  return {corpus: corpus, mentions: stmts.length, day: today};
}
// Only live catalog prices are logged; a price typed into a guide is not a price observation.
export async function syncPrices(env, corpus, enrichStaticPick) {
  const today = new Date().toISOString().slice(0, 10), stmts = [];
  for (const prod of corpus.productList) {
    if (!prod.pick._static) continue;
    try {
      const live = await enrichStaticPick(env, prod.pick), price = parsePrice(live && live.price);
      if (live && live._channel3 && price != null) stmts.push(env.DB.prepare("INSERT OR REPLACE INTO price_observations (product_key,observed_on,price,currency,merchant) VALUES (?,?,?,?,?)").bind(prod.key, today, price, "USD", host(live.shopUrl) || null));
    } catch (_) {}
  }
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  return stmts.length;
}
let lastMentionSyncDay = "";
export async function syncMentionsOncePerDay(env) {
  const today = new Date().toISOString().slice(0, 10);
  if (lastMentionSyncDay === today) return;
  lastMentionSyncDay = today;
  try {
    let latest = null;
    try { latest = await env.DB.prepare("SELECT MAX(last_seen) d FROM mention_observations").first(); } catch (_) {}
    if (latest && latest.d === today) return;
    await syncMentions(env);
  } catch (_) { lastMentionSyncDay = ""; }
}
export async function mentionsFeed(env) {
  const corpus = await getCorpus(env), mentions = [];
  corpus.productList.forEach(function (prod) {
    prod.evidence.forEach(function (ev) { mentions.push({key: mentionKey(prod.key, ev), productKey: prod.key, brand: prod.brand, name: prod.name, guideSlug: ev.guideSlug || null, source: ev.source, independent: ev.independent, label: ev.label, url: ev.url}); });
  });
  return Response.json({generated: new Date().toISOString(), stats: corpus.stats, mentions: mentions}, {headers: {"Cache-Control": "public, max-age=300"}});
}
async function mentionChecks(env, column, value) {
  const out = new Map();
  try {
    const rows = (await env.DB.prepare("SELECT mention_key,status,checked_on,verified_on FROM mention_checks WHERE " + column + "=?").bind(value).all()).results || [];
    rows.forEach(function (r) { out.set(r.mention_key, r); });
  } catch (_) {}
  return out;
}
function niceDate(iso) {
  const d = new Date(String(iso) + "T00:00:00Z");
  return isNaN(d) ? String(iso || "") : d.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric", timeZone: "UTC"});
}
async function productObservations(env, productKey) {
  const out = {mentions: new Map(), prices: []};
  try {
    const rows = (await env.DB.prepare("SELECT mention_key,first_seen,last_seen FROM mention_observations WHERE product_key=?").bind(productKey).all()).results || [];
    rows.forEach(function (r) { out.mentions.set(r.mention_key, r); });
    out.prices = (await env.DB.prepare("SELECT observed_on,price,merchant FROM price_observations WHERE product_key=? ORDER BY observed_on DESC LIMIT 60").bind(productKey).all()).results || [];
  } catch (_) {}
  return out;
}

/* ---------- email capture: newsletter and no-account sale alerts ---------- */

export async function subscribe(request, env, ctx, onNew) {
  const headers = {"Cache-Control": "no-store"};
  let b = {};
  try { b = await request.json(); } catch (_) {}
  const email = String(b.email || "").trim().toLowerCase(), kind = b.kind === "price_alert" ? "price_alert" : "newsletter";
  if (b.website) return Response.json({ok: true}, {headers: headers});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return Response.json({error: "Enter a valid email address."}, {status: 400, headers: headers});
  const page = String(b.page || "").slice(0, 300), now = new Date().toISOString();
  const pageSlug = page.replace(/^\/+/, "").slice(0, 200) || null;
  try {
    const existing = await env.DB.prepare("SELECT id FROM emails WHERE email=? AND source=? LIMIT 1").bind(email, kind).first();
    let isNew = !existing && kind === "newsletter";
    if (!existing) await env.DB.prepare("INSERT INTO emails (email,source_page,page_slug,source,created_at) VALUES (?,?,?,?,?)").bind(email, page || null, pageSlug, kind, now).run();
    if (kind === "price_alert") {
      const w = b.watch || {}, key = String(w.watchKey || "").trim().slice(0, 500);
      if (!key) return Response.json({error: "Missing product."}, {status: 400, headers: headers});
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS price_alert_emails (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL,watch_key TEXT NOT NULL,brand TEXT,product_name TEXT,product_url TEXT,guide_slug TEXT,baseline_price REAL,status TEXT DEFAULT 'active',created_at TEXT NOT NULL,UNIQUE(email,watch_key))").run();
      isNew = !(await env.DB.prepare("SELECT id FROM price_alert_emails WHERE email=? AND watch_key=? AND status='active' LIMIT 1").bind(email, key).first());
      await env.DB.prepare("INSERT INTO price_alert_emails (email,watch_key,brand,product_name,product_url,guide_slug,baseline_price,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(email,watch_key) DO UPDATE SET status='active'").bind(email, key, String(w.brand || "").slice(0, 200), String(w.name || "").slice(0, 300), String(w.productUrl || "").slice(0, 1000), String(w.guideSlug || "").slice(0, 200), parsePrice(w.price), now).run();
    }
    if (isNew && onNew && ctx) ctx.waitUntil(onNew(env, {email: email, kind: kind, watch: b.watch || null}));
  } catch (_) {
    return Response.json({error: "Could not save that right now. Please try again."}, {status: 500, headers: headers});
  }
  return Response.json({ok: true}, {headers: headers});
}

const AI_REFERRERS = {"chatgpt.com": "chatgpt", "chat.openai.com": "chatgpt", "perplexity.ai": "perplexity", "claude.ai": "claude", "gemini.google.com": "gemini", "copilot.microsoft.com": "copilot", "you.com": "you", "phind.com": "phind"};
export function aiReferrer(request) {
  const u = new URL(request.url), utm = String(u.searchParams.get("utm_source") || "").toLowerCase().replace(/^www\./, "");
  const ref = host(request.headers.get("referer") || "");
  return AI_REFERRERS[ref] || AI_REFERRERS[utm] || null;
}
export async function logAiReferral(env, source, path) {
  try {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS ai_referrals (id INTEGER PRIMARY KEY AUTOINCREMENT,source TEXT NOT NULL,path TEXT NOT NULL,observed_at TEXT NOT NULL)").run();
    await env.DB.prepare("INSERT INTO ai_referrals (source,path,observed_at) VALUES (?,?,?)").bind(source, String(path).slice(0, 300), new Date().toISOString()).run();
  } catch (_) {}
}

/* ---------- pages ---------- */

export const CONSENSUS_CSS = `
.statRow{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.statRow span{border:1px solid var(--lavender);border-radius:18px;background:rgba(255,255,255,.72);padding:12px 16px;font-size:13px;color:var(--muted)}
.statRow strong{display:block;font-family:var(--display);font-size:28px;font-weight:400;color:var(--ink);line-height:1.1}
.rankList{display:grid;gap:14px;margin-top:18px}
.rankRow{display:grid;grid-template-columns:44px 84px 1fr auto;gap:16px;align-items:center;border:1px solid var(--lavender);border-radius:22px;background:rgba(255,255,255,.82);padding:14px 18px;color:inherit;text-decoration:none}
.rankRow:hover{border-color:#aa98ef}
.rankNum{font-family:var(--display);font-size:26px;color:var(--muted);text-align:center}
.rankRow img{width:84px;height:84px;object-fit:cover;border-radius:14px;background:#f4f1ec}
.rankRow h3{font-size:21px;margin:2px 0 4px;line-height:1.15}
.rankMeta{font-size:12px;color:var(--muted);line-height:1.45}
.rankCount{text-align:right;font-size:12px;color:var(--muted);white-space:nowrap}
.rankCount strong{display:block;font-family:var(--display);font-size:30px;font-weight:400;color:var(--ink);line-height:1}
.awardLabel{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);font-weight:600}
.prose{max-width:760px}
.prose h2{font-size:30px;margin:38px 0 10px}
.prose p,.prose li{font-size:16px;line-height:1.65;color:#4d4763}
.prose ul{padding-left:20px}
.prose a,.plainLink{color:var(--blue);text-decoration:underline;text-underline-offset:2px}
.evidenceTable{width:100%;border-collapse:collapse;margin-top:14px;font-size:14px}
.evidenceTable th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;padding:8px 10px;border-bottom:1px solid var(--lavender)}
.evidenceTable td{padding:11px 10px;border-bottom:1px solid #ece7fb;vertical-align:top;line-height:1.45}
.productHero{display:grid;grid-template-columns:minmax(0,340px) 1fr;gap:34px;align-items:start}
.productHero img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:26px;border:1px solid var(--lavender);background:#f4f1ec}
.signup{border:1px solid var(--lavender);border-radius:26px;background:linear-gradient(145deg,#fdfbff 0%,#eeeaff 100%);padding:28px}
.signup form{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.signup .field{flex:1;min-width:220px}
.signupMsg{font-size:13px;color:var(--muted);margin-top:10px;min-height:18px}
.editSource.isReference{opacity:.72;border-style:dashed}
.editConsensus .editConsensusNote{font-size:12px;color:var(--muted)}
.editCopy h2 a{color:inherit;text-decoration:none}
.editCopy h2 a:hover{text-decoration:underline;text-underline-offset:3px}
.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
@media(max-width:720px){.rankRow{grid-template-columns:30px 60px 1fr;gap:12px}.rankRow img{width:60px;height:60px}.rankCount{grid-column:2/4;text-align:left}.rankCount strong{display:inline;font-size:20px;margin-right:5px}.productHero{grid-template-columns:1fr}}
`;

export function createPages(h) {
  const esc = h.esc, money = h.money, page = h.page;
  const today = function () { return new Date().toISOString().slice(0, 10); };

  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function imageUrl(ref) { return "/recommendation-image?slug=" + encodeURIComponent(ref.slug) + "&rank=" + encodeURIComponent(ref.rank); }
  function namesLine(names, max) {
    max = max || 4;
    return names.slice(0, max).map(esc).join(" · ") + (names.length > max ? " · +" + (names.length - max) + " more" : "");
  }
  function statRow(stats) {
    return "<div class='statRow'><span><strong>" + stats.mentions + "</strong>independent recommendations</span><span><strong>" + stats.products + "</strong>products matched</span><span><strong>" + stats.sources + "</strong>sources tracked</span><span><strong>" + stats.guides + "</strong>categories</span></div>";
  }
  function productRow(prod, position, label) {
    const n = prod.independent.length;
    return "<a class='rankRow' href='/products/" + esc(prod.key) + "'><div class='rankNum'>" + esc(position) + "</div><img src='" + esc(imageUrl(prod.image)) + "' alt='" + esc(prod.brand + " " + prod.name) + "' loading='lazy'><div>" + (label ? "<div class='awardLabel'>" + esc(label) + "</div>" : "") + "<h3>" + esc(prod.brand) + " " + esc(prod.name) + "</h3><div class='rankMeta'>" + namesLine(prod.independent, 5) + "</div></div><div class='rankCount'><strong>" + n + "</strong>independent " + (n === 1 ? "source" : "sources") + "</div></a>";
  }
  function guideTile(g) {
    const lead = g.picks[0];
    return "<a class='guideTile' href='/" + esc(g.slug) + "'><div class='eyebrow'>" + plural(g.picks.length, "pick") + " · " + plural(g.independentSources.length, "independent source") + "</div><h3>" + esc(g.title) + "</h3><p>" + esc(g.description || "Evidence-backed fashion recommendation from Reccas.") + "</p>" + (lead ? "<span class='rankMeta' style='margin-bottom:10px'>Leading: " + esc(lead.brand + " " + lead.name) + "</span>" : "") + "<strong>See the evidence →</strong></a>";
  }
  function categoryCards(corpus) {
    return Object.keys(CATEGORIES).filter(function (k) { return corpus.categoryCounts[k] > 0; }).map(function (k) {
      return "<a class='categoryCard' href='/recommendations/" + k + "'><strong>" + esc(CATEGORIES[k].label) + "</strong><span>" + plural(corpus.categoryCounts[k], "category guide") + "</span></a>";
    }).join("");
  }
  function signupBlock(pagePath, heading, copy) {
    return "<section class='section'><div class='signup'><span class='eyebrow'>The Reccas list</span><h2>" + esc(heading || "What fashion editors started and stopped recommending.") + "</h2><p class='muted'>" + esc(copy || "Leave your email and we will send the Best of Fashion updates: new winners, products gaining support and ones editors have dropped. No account needed.") + "</p><form class='js-signup' data-page='" + esc(pagePath) + "'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn' type='submit'>Join the list</button></form><div class='signupMsg js-signup-msg' role='status'></div></div></section><script>(function(){var f=document.querySelector('.js-signup'),m=document.querySelector('.js-signup-msg');if(!f)return;f.addEventListener('submit',async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(f).entries());m.textContent='Saving…';try{var r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'newsletter',page:f.dataset.page})}),j={};try{j=await r.json()}catch(_){}if(!r.ok){m.textContent=j.error||'Could not save that. Please try again.';return}f.reset();m.textContent='You are on the list.'}catch(_){m.textContent='Could not save that. Please try again.'}})})();</script>";
  }
  function awards(corpus) {
    const won = [], pending = [];
    corpus.guideList.forEach(function (g) {
      const lead = g.picks[0];
      if (!lead) return;
      (lead.independent.length >= AWARD_MIN_SOURCES ? won : pending).push({guide: g, lead: lead, product: corpus.products.get(lead.key)});
    });
    return {won: won, pending: pending};
  }

  async function home(env) {
    const corpus = await getCorpus(env), a = awards(corpus);
    const top = corpus.productList.filter(function (p) { return p.independent.length >= AWARD_MIN_SOURCES; }).slice(0, 6);
    const rows = top.map(function (p, i) { return productRow(p, i + 1); }).join("");
    const tiles = corpus.guideList.slice(0, 6).map(guideTile).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>The fashion products the most editors agree on.</h1><p>Reccas tracks what fashion editors, stylists, creators and testers recommend, matches every mention to an exact product, and shows where independent sources agree. Every count links back to the receipts.</p><div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:24px'><a class='btn' href='" + FRANCHISE_PATH + "'>See Best of Fashion " + FRANCHISE_YEAR + "</a><a class='btn alt' href='/methodology'>How we count</a></div>" + statRow(corpus.stats) + "</section>"
      + "<section class='section'><div class='eyebrow'>Most recommended right now</div><h2>Where independent sources agree</h2><p class='muted'>Products recommended by at least " + AWARD_MIN_SOURCES + " independent sources across everything Reccas tracks. A brand’s own page never counts.</p><div class='rankList'>" + rows + "</div><p style='margin-top:20px'><a class='btn alt' href='/most-recommended'>See the full ranking</a></p></section>"
      + "<section class='section'><div class='eyebrow'>Browse Best of Fashion</div><h2>" + a.won.length + " winners across " + corpus.stats.guides + " categories</h2><div class='categoryGrid'>" + categoryCards(corpus) + "</div><div class='guideGrid' style='margin-top:22px'>" + tiles + "</div><p style='margin-top:20px'><a class='btn alt' href='" + FRANCHISE_PATH + "'>See all " + corpus.stats.guides + " categories</a></p></section>"
      + "<section class='section'><div class='eyebrow'>How Reccas works</div><h2>Consensus, not a judging panel.</h2><div class='grid'><div class='card'><h3>Track the recommendations</h3><p>We record named product recommendations from fashion publications, editors, stylists, creators and testers, with a link to each one.</p></div><div class='card'><h3>Match the exact product</h3><p>The same item gets described a dozen ways. Reccas resolves each mention to one product so repeated recommendations count together.</p></div><div class='card'><h3>Count independent agreement</h3><p>Products are ranked by how many independent sources recommend them. Brand and retailer pages are shown as references and never counted.</p></div></div><p style='margin-top:20px'><a class='plainLink' href='/methodology'>Read the full methodology →</a></p></section>"
      + signupBlock("/") + "</main>";
    return page("/", "Best of Fashion " + FRANCHISE_YEAR + ": The Most Recommended Fashion Products", body, "Reccas tracks what fashion editors, stylists, creators and testers recommend, then ranks products by how many independent sources agree. Every count links to its sources.", 200, null, {schema: [{"@type": "WebApplication", name: "Reccas", url: "https://reccas.com/", applicationCategory: "ShoppingApplication", operatingSystem: "Web", description: "Fashion recommendation consensus tracker."}]});
  }

  async function recommendations(env) {
    const corpus = await getCorpus(env), a = awards(corpus);
    const sections = Object.keys(CATEGORIES).map(function (k) {
      const items = a.won.filter(function (w) { return w.guide.category === k; });
      if (!items.length) return "";
      return "<section class='section'><h2>" + esc(CATEGORIES[k].label) + "</h2><div class='rankList'>" + items.map(function (w) {
        const n = w.lead.independent.length;
        return "<div class='rankRow'><div class='rankNum'>★</div><a href='/products/" + esc(w.lead.key) + "'><img src='" + esc(imageUrl({slug: w.guide.slug, rank: w.lead.rank})) + "' alt='" + esc(w.lead.brand + " " + w.lead.name) + "' loading='lazy'></a><div><div class='awardLabel'>" + esc(w.guide.title) + "</div><h3><a href='/products/" + esc(w.lead.key) + "' style='color:inherit;text-decoration:none'>" + esc(w.lead.brand) + " " + esc(w.lead.name) + "</a></h3><div class='rankMeta'>" + namesLine(w.lead.independent, 5) + " · <a class='plainLink' href='/" + esc(w.guide.slug) + "'>see the full category</a></div></div><div class='rankCount'><strong>" + n + "</strong>independent sources</div></div>";
      }).join("") + "</div></section>";
    }).join("");
    const pending = a.pending.map(function (w) {
      return "<tr><td><a class='plainLink' href='/" + esc(w.guide.slug) + "'>" + esc(w.guide.title) + "</a></td><td>" + esc(w.lead.brand + " " + w.lead.name) + "</td><td>" + plural(w.lead.independent.length, "independent source") + "</td></tr>";
    }).join("");
    const listSchema = {"@type": "ItemList", name: "Best of Fashion " + FRANCHISE_YEAR, itemListElement: a.won.map(function (w, i) { return {"@type": "ListItem", position: i + 1, name: w.guide.title + ": " + w.lead.brand + " " + w.lead.name, url: "https://reccas.com/products/" + w.lead.key}; })};
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas · " + FRANCHISE_YEAR + " edition</span><h1>Best of Fashion " + FRANCHISE_YEAR + "</h1><p>The products that independent fashion editors, stylists, creators and testers agree on most. A product wins its category only when at least " + AWARD_MIN_SOURCES + " independent sources recommend it. There is no judging panel and no paid placement.</p><div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:24px'><a class='btn' href='/most-recommended'>Full ranking</a><a class='btn alt' href='/methodology'>Methodology</a></div>" + statRow(corpus.stats) + "</section>"
      + "<section class='section'><div class='eyebrow'>" + FRANCHISE_YEAR + " winners</div><h2 style='margin-bottom:0'>" + a.won.length + " categories with a clear winner</h2></section>" + sections
      + (pending ? "<section class='section'><div class='eyebrow'>Not yet awarded</div><h2>Categories still gathering evidence</h2><p class='muted'>The current leader in each of these has fewer than " + AWARD_MIN_SOURCES + " independent sources, so no winner is named yet.</p><div class='tablewrap' style='padding:6px 14px;margin-top:16px'><table class='evidenceTable'><thead><tr><th>Category</th><th>Current leader</th><th>Evidence</th></tr></thead><tbody>" + pending + "</tbody></table></div></section>" : "")
      + "<section class='section'><div class='eyebrow'>All categories</div><h2>Every category we track</h2><p class='muted'>" + corpus.stats.guides + " category guides, ordered by how many independent sources back each one.</p><div class='categoryGrid'>" + categoryCards(corpus) + "</div><div class='guideGrid' style='margin-top:22px'>" + corpus.guideList.map(guideTile).join("") + "</div></section>"
      + "<section class='editMethod'><span class='eyebrow'>How it works</span><h2>Counted, not judged.</h2><p>Best of Fashion is built from observed recommendations. Reccas counts each independent source once per product, ignores brand and retailer pages, and keeps every source link visible. <a class='plainLink' href='/methodology'>Read the methodology</a>.</p></section>"
      + signupBlock(FRANCHISE_PATH, "Get the " + FRANCHISE_YEAR + " changes as they happen.") + "</main>";
    return page(FRANCHISE_PATH, "Best of Fashion " + FRANCHISE_YEAR + ": Winners by Editor Consensus", body, "Best of Fashion " + FRANCHISE_YEAR + " by Reccas: the clothes, shoes and bags recommended by the most independent fashion editors, stylists, creators and testers, with every source linked.", 200, null, {kind: "collection", breadcrumb: "Best of Fashion", schema: [listSchema]});
  }

  async function categoryPage(env, category) {
    const meta = CATEGORIES[category];
    if (!meta) return null;
    const corpus = await getCorpus(env), guides = corpus.guideList.filter(function (g) { return g.category === category; });
    const empty = !guides.length;
    const list = empty ? "<p class='muted'>Reccas has not published a " + esc(meta.label.toLowerCase()) + " guide yet. A category is published only once it has attributable recommendations to count.</p>" : "<div class='guideGrid'>" + guides.map(guideTile).join("") + "</div>";
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>Best " + esc(meta.label) + "</h1><p>" + esc(meta.description) + " Guides are ordered by how many independent sources back them.</p></section><section class='section'><h2>" + plural(guides.length, "category guide") + "</h2>" + list + "</section></main>";
    return page("/recommendations/" + category, "Best " + meta.label + " " + FRANCHISE_YEAR + ": Most Recommended " + meta.label, body, "Best " + meta.label.toLowerCase() + " of " + FRANCHISE_YEAR + ", ranked by how many independent fashion editors, stylists, creators and testers recommend each product.", 200, empty ? "noindex, follow" : null, {kind: "collection", breadcrumb: "Best " + meta.label});
  }

  async function mostRecommended(env) {
    const corpus = await getCorpus(env), ranked = corpus.productList.filter(function (p) { return p.independent.length >= INDEXABLE_PRODUCT_MIN_SOURCES; });
    let position = 0, lastCount = null;
    const rows = ranked.map(function (p, i) {
      if (p.independent.length !== lastCount) { position = i + 1; lastCount = p.independent.length; }
      return productRow(p, position, p.appearances.length > 1 ? "In " + p.appearances.length + " categories" : (p.appearances[0] ? p.appearances[0].title : ""));
    }).join("");
    const listSchema = {"@type": "ItemList", name: "Most recommended fashion products " + FRANCHISE_YEAR, itemListElement: ranked.slice(0, 50).map(function (p, i) { return {"@type": "ListItem", position: i + 1, name: p.brand + " " + p.name, url: "https://reccas.com/products/" + p.key}; })};
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>The most recommended fashion products</h1><p>Every product Reccas tracks that at least " + INDEXABLE_PRODUCT_MIN_SOURCES + " independent sources recommend, ranked by the number of sources. Products with the same count share a position.</p>" + statRow(corpus.stats) + "</section><section class='section'><div class='rankList'>" + rows + "</div></section><section class='editMethod'><span class='eyebrow'>Reading this list</span><h2>A count of agreement, not a score.</h2><p>The number is how many different independent sources recommend the product across all Reccas categories. It says nothing about fit or taste, which is why each product page keeps the caveats. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    return page("/most-recommended", "Most Recommended Fashion Products of " + FRANCHISE_YEAR, body, "The fashion products recommended by the most independent editors, stylists, creators and testers in " + FRANCHISE_YEAR + ", ranked by number of sources with every source linked.", 200, null, {kind: "collection", breadcrumb: "Most recommended", schema: [listSchema]});
  }

  async function sourcesIndex(env) {
    const corpus = await getCorpus(env);
    const rows = corpus.sourceList.map(function (s) {
      return "<tr><td><a class='plainLink' href='/sources/" + esc(s.slug) + "'>" + esc(s.name) + "</a></td><td>" + plural(s.productKeys.length, "product") + "</td><td>" + plural(s.mentions.length, "recommendation") + "</td></tr>";
    }).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Sources</span><h1>Who Reccas tracks</h1><p>The " + corpus.stats.sources + " independent publications, editors, creators and testers whose product recommendations are counted in Best of Fashion " + FRANCHISE_YEAR + ". Brand and retailer pages are referenced on product pages but are not sources.</p></section><section class='section'><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Source</th><th>Products recommended</th><th>Recommendations recorded</th></tr></thead><tbody>" + rows + "</tbody></table></div></section></main>";
    return page("/sources", "Sources Tracked by Reccas", body, "The independent fashion publications, editors, creators and testers whose product recommendations Reccas counts, with how many products each has recommended.", 200, null, {kind: "collection", breadcrumb: "Sources"});
  }

  async function sourcePage(env, slug) {
    const corpus = await getCorpus(env), s = corpus.sources.get(slug);
    if (!s) return null;
    const rows = s.mentions.map(function (m) {
      const g = corpus.guides.get(m.guideSlug);
      return "<tr><td><a class='plainLink' href='/products/" + esc(m.productKey) + "'>" + esc(m.brand + " " + m.name) + "</a></td><td>" + esc(m.label) + "</td><td>" + (g ? "<a class='plainLink' href='/" + esc(g.slug) + "'>" + esc(g.title) + "</a>" : "") + "</td><td>" + (m.url ? "<a class='plainLink' href='" + esc(m.url) + "' target='_blank' rel='noreferrer'>Original ↗</a>" : "") + "</td></tr>";
    }).join("");
    const indexable = s.productKeys.length >= INDEXABLE_SOURCE_MIN_PRODUCTS;
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Source</span><h1>What " + esc(s.name) + " recommends</h1><p>" + plural(s.productKeys.length, "product") + " that " + esc(s.name) + " has recommended in the categories Reccas tracks, each linked to the original article. Reccas is not affiliated with " + esc(s.name) + ".</p></section><section class='section'><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Product</th><th>How they described it</th><th>Category</th><th>Receipt</th></tr></thead><tbody>" + rows + "</tbody></table></div><p style='margin-top:20px'><a class='plainLink' href='/sources'>All sources →</a></p></section></main>";
    return page("/sources/" + slug, "What " + s.name + " Recommends: " + s.productKeys.length + " Fashion Products", body, "The fashion products " + s.name + " has recommended in categories Reccas tracks, with a link to each original recommendation.", 200, indexable ? null : "noindex, follow", {kind: "collection", breadcrumb: s.name});
  }

  async function productPage(env, key) {
    const corpus = await getCorpus(env), prod = corpus.products.get(key);
    if (!prod) return null;
    let pick = prod.pick;
    if (pick._static) { try { pick = await h.enrichStaticPick(env, pick); } catch (_) {} }
    const obs = await productObservations(env, key), checks = await mentionChecks(env, "product_key", key);
    const n = prod.independent.length, price = parsePrice(pick.price), priceText = pick.price == null || pick.price === "" ? "" : (typeof pick.price === "number" ? money(pick.price) : String(pick.price));
    const dest = pick.shopUrl || pick.canonicalUrl || null, tracked = dest ? "/_api/out?edit=" + encodeURIComponent(prod.guideSlug) + "&to=" + encodeURIComponent(dest) : null;
    const shopAt = String(pick.shopLabel || pick.brand || "retailer").trim(), rel = pick._affiliate ? "sponsored noreferrer" : "noreferrer";
    const img = imageUrl(prod.image);
    function evidenceRows(list) {
      return list.map(function (ev) {
        const c = checks.get(mentionKey(key, ev)), verified = c && c.verified_on ? niceDate(c.verified_on) : "";
        const who = ev.independent ? "<a class='plainLink' href='/sources/" + esc(ev.sourceSlug) + "'>" + esc(ev.source) + "</a>" : esc(ev.source);
        return "<tr><td>" + who + (ev.author ? "<div class='rankMeta'>" + esc(ev.author) + "</div>" : "") + "</td><td>" + esc(ev.label) + "</td><td>" + esc(verified) + "</td><td>" + (ev.url ? "<a class='plainLink' href='" + esc(ev.url) + "' target='_blank' rel='noreferrer'>Original ↗</a>" : "") + "</td></tr>";
      }).join("");
    }
    const indep = prod.evidence.filter(function (ev) { return ev.independent; }), refs = prod.evidence.filter(function (ev) { return !ev.independent; });
    const appearances = prod.appearances.map(function (a) { return "<a class='guidePill' href='/" + esc(a.slug) + "#pick-" + esc(a.rank) + "'>#" + esc(a.rank) + " in " + esc(a.title) + " <span>→</span></a>"; }).join("");
    const priceHistory = obs.prices.length > 1 ? "<section class='section'><h2>Price history</h2><p class='muted'>Live catalog prices Reccas has recorded since " + esc(obs.prices[obs.prices.length - 1].observed_on) + ".</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Date</th><th>Price</th><th>Retailer</th></tr></thead><tbody>" + obs.prices.map(function (p) { return "<tr><td>" + esc(p.observed_on) + "</td><td>" + esc(money(p.price)) + "</td><td>" + esc(p.merchant || "") + "</td></tr>"; }).join("") + "</tbody></table></div></section>" : "";
    const watch = {watchKey: pick.sourceProductId ? "channel3:" + String(pick.sourceProductId) : "name:" + String(prod.brand || "") + "|" + String(prod.name || ""), brand: prod.brand, name: prod.name, productUrl: dest || "", guideSlug: prod.guideSlug, price: price};
    const alertBlock = "<div class='signup' style='margin-top:22px;padding:20px'><strong>Get an email if this goes on sale</strong><form class='js-alert' style='margin-top:10px'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn alt' type='submit'>Watch price</button></form><div class='signupMsg js-alert-msg' role='status'>No account needed.</div></div><script>(function(){var f=document.querySelector('.js-alert'),m=document.querySelector('.js-alert-msg'),w=" + JSON.stringify(watch).replace(/</g, "\\u003c") + ";if(!f)return;f.addEventListener('submit',async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(f).entries());m.textContent='Saving…';try{var r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'price_alert',page:location.pathname,watch:w})}),j={};try{j=await r.json()}catch(_){}if(!r.ok){m.textContent=j.error||'Could not save that. Please try again.';return}f.reset();m.textContent='Saved. You are on the sale-alert list for this product.'}catch(_){m.textContent='Could not save that. Please try again.'}})})();</script>";
    const consensusLine = n >= 1 ? "Recommended by " + plural(n, "independent source") + (prod.appearances.length > 1 ? " across " + prod.appearances.length + " categories" : "") : "No independent recommendations recorded yet";
    const body = "<main class='wrap'><section class='hero'><div class='productHero'><img src='" + esc(img) + "' alt='" + esc(prod.brand + " " + prod.name) + "'><div><span class='eyebrow'>" + esc(prod.brand) + "</span><h1 style='font-size:clamp(34px,5vw,54px)'>" + esc(prod.name) + "</h1><p><strong>" + esc(consensusLine) + ".</strong> " + esc([prod.summary, prod.fitNote].filter(Boolean).join(" ")) + "</p><div class='guideRoundups' style='margin-top:14px'>" + appearances + "</div><div class='editActions' style='margin-top:22px'>" + (tracked ? "<a class='btn' href='" + tracked + "' target='_blank' rel='" + rel + "'>Shop at " + esc(shopAt) + (priceText ? " · " + esc(priceText) : "") + "</a>" : "") + "</div>" + alertBlock + "</div></div></section>"
      + "<section class='section'><h2>Who recommends it</h2><p class='muted'>" + (n ? plural(n, "independent source") + ". Each row links to the original recommendation." : "Reccas has not recorded an independent recommendation for this product.") + " “Last verified” is the most recent date Reccas re-read the source and found the product still recommended there.</p>" + (indep.length ? "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Source</th><th>How they described it</th><th>Last verified</th><th>Receipt</th></tr></thead><tbody>" + evidenceRows(indep) + "</tbody></table></div>" : "") + "</section>"
      + (refs.length ? "<section class='section'><h2>Brand and retailer references</h2><p class='muted'>Used to confirm product details. These are not counted as recommendations.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Page</th><th>What it confirms</th><th>Last verified</th><th>Link</th></tr></thead><tbody>" + evidenceRows(refs) + "</tbody></table></div></section>" : "")
      + priceHistory
      + "<section class='editMethod'><span class='eyebrow'>How this is counted</span><h2>One source, one count.</h2><p>A source is counted once for this product however many of its articles mention it. Reccas may earn a commission from some shopping links, which has no effect on the count. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    const productSchema = {"@type": "Product", name: prod.brand + " " + prod.name, brand: {"@type": "Brand", name: prod.brand}, image: ["https://reccas.com" + img], description: prod.summary || (prod.brand + " " + prod.name)};
    if (price != null && dest) productSchema.offers = {"@type": "Offer", price: String(price), priceCurrency: "USD", url: dest};
    return page("/products/" + key, prod.brand + " " + prod.name + ": Who Recommends It", body, prod.brand + " " + prod.name + " is recommended by " + plural(n, "independent source") + (n ? " including " + prod.independent.slice(0, 3).join(", ") : "") + ". See every recommendation with a link to the original.", 200, n >= INDEXABLE_PRODUCT_MIN_SOURCES ? null : "noindex, follow", {kind: "article", headline: prod.brand + " " + prod.name, image: "https://reccas.com" + img, breadcrumb: prod.brand + " " + prod.name, modified: today(), schema: [productSchema]});
  }

  async function methodology(env) {
    const corpus = await getCorpus(env), s = corpus.stats, a = awards(corpus);
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Methodology</span><h1>How Best of Fashion is counted</h1><p>Best of Fashion is a count of who recommends what. This page sets out exactly what is counted, what is not, and where the data is still thin.</p></section><section class='section prose'>"
      + "<h2>What Reccas tracks</h2><p>Reccas records named product recommendations from fashion publications, editors, stylists, creators and product testers. Today the dataset holds " + s.mentions + " independent recommendations of " + s.products + " products from " + s.sources + " sources across " + s.guides + " categories. The full list of sources is on the <a href='/sources'>sources page</a>.</p>"
      + "<h2>What counts as a recommendation</h2><ul><li>It names a specific product, not a brand or a style.</li><li>It is attributable to a publication or a named person, and Reccas links to it.</li><li>It is independent of the company that makes or sells the product.</li><li>The product can be matched to an exact item that is still sold.</li></ul>"
      + "<h2>What does not count</h2><ul><li>A brand’s own product page or marketing.</li><li>A retailer’s product listing.</li><li>Customer reviews on a brand or retailer site.</li></ul><p>These appear on product pages as references, because they confirm product details, but they are never added to a product’s count.</p>"
      + "<h2>How products are ranked</h2><p>Each product’s count is the number of different independent sources that recommend it. A source is counted once per product, even if several of its articles mention it. Within a category, products are ordered by that count; when two products tie, the order is editorial. Commission rates and affiliate availability play no part in the order.</p>"
      + "<h2>How a category gets a winner</h2><p>A category has a Best of Fashion " + FRANCHISE_YEAR + " winner only when its leading product is recommended by at least " + AWARD_MIN_SOURCES + " independent sources. Right now " + a.won.length + " of " + s.guides + " categories meet that bar. The other " + a.pending.length + " are listed as not yet awarded on the <a href='" + FRANCHISE_PATH + "'>Best of Fashion page</a>.</p>"
      + "<h2>Shopping checks and money</h2><p>Reccas checks that each product is still sold and shows a current price where one is available. Some shopping links are affiliate links and Reccas may earn a commission. Where no affiliate link exists, the link goes straight to the product. Nobody can pay to be included or ranked.</p>"
      + "<h2>How recommendations are kept fresh</h2><p>Every week Reccas re-reads each source article and checks that it still names the product. Each guide shows the date its sources were last verified and how many were confirmed; each product page shows the date per source. Prices are checked daily where a live price is available. A recommendation that can no longer be found is reviewed by a person before anything changes.</p><h2>Known limits</h2><ul><li>The dataset is small. Counts of three or four sources reflect agreement among the sources Reccas has recorded, not the whole fashion press.</li><li>Reccas began logging recommendations on " + TRACKING_STARTED + ", so trends over time are not reported yet.</li><li>Some publishers block automated readers. A source Reccas could not re-read keeps its earlier verified date, or shows none.</li><li>Most recommendations do not yet carry the name of the individual writer or the date the source published it.</li><li>Agreement is not the same as fit. A widely recommended product can still be wrong for you, which is why each product keeps its fit notes and caveats.</li></ul>"
      + "<h2>Corrections</h2><p>If a recommendation is misattributed, a link is broken or a product is matched wrongly, email <a href='mailto:hello@reccas.com'>hello@reccas.com</a> and it will be fixed.</p></section></main>";
    return page("/methodology", "Methodology: How Best of Fashion Is Counted", body, "How Reccas counts fashion recommendations: what qualifies as an independent source, why brand pages are excluded, how products are ranked and where the data is thin.", 200, null, {kind: "article", headline: "How Best of Fashion is counted", breadcrumb: "Methodology", modified: today()});
  }

  async function guidePage(env, slug) {
    const guide = await getGuide(env, slug);
    if (!guide) return null;
    const picks = [];
    for (const p of guide.picks) picks.push(p._static ? await h.enrichStaticPick(env, p) : p);
    const total = guide.independentSources.length, checks = await mentionChecks(env, "guide_slug", slug);
    let lastVerified = "", confirmed = 0, checkable = 0;
    guide.picks.forEach(function (p) { p.evidence.forEach(function (ev) { if (!ev.independent) return; checkable++; const c = checks.get(mentionKey(p.key, ev)); if (c && c.verified_on) { confirmed++; if (c.verified_on > lastVerified) lastVerified = c.verified_on; } }); });
    const cards = picks.map(function (x) {
      const evidence = x.evidence || [], dest = x.shopUrl || x.canonicalUrl || (evidence[0] && evidence[0].url) || null, track = dest ? "/_api/out?edit=" + encodeURIComponent(slug) + "&to=" + encodeURIComponent(dest) : "#";
      const ev = evidence.map(function (z) { return "<a class='editSource" + (z.independent ? "" : " isReference") + "' href='" + esc(z.url) + "' target='_blank' rel='noreferrer'><strong>" + esc(z.source) + "</strong> · " + esc(z.independent ? z.label : "Brand or retailer page") + " ↗</a>"; }).join("");
      const img = imageUrl({slug: slug, rank: x.rank});
      const visual = "<img src='" + esc(img) + "' alt='" + esc(x.brand + " " + x.name) + "' loading='" + (x.rank === 1 ? "eager" : "lazy") + "'>";
      const watchKey = x.sourceProductId ? "channel3:" + String(x.sourceProductId) : (x.productId ? "product:" + String(x.productId) : (x.canonicalUrl ? "url:" + String(x.canonicalUrl) : "name:" + String(x.brand || "") + "|" + String(x.name || "")));
      const watchPayload = encodeURIComponent(JSON.stringify({watchKey: watchKey, source: x._channel3 ? "channel3" : "reccas", sourceProductId: x.sourceProductId || null, productId: x.productId || null, brand: x.brand || "", name: x.name || "", productUrl: dest || x.canonicalUrl || "", imageUrl: img || "", guideSlug: slug, price: x.price == null ? null : parsePrice(x.price), currency: "USD"}));
      const watchButton = "<div class='watchControl'><button class='watchBtn js-price-watch' type='button' aria-label='Get alert when " + esc(x.brand + " " + x.name) + " goes on sale' aria-pressed='false' title='Get alert when it goes on sale' data-watch='" + watchPayload + "'><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'></path></svg></button><button class='watchLabel js-price-watch' type='button' data-watch='" + watchPayload + "'>Get alert when it goes on sale</button></div>";
      const price = x.price == null || x.price === "" ? "" : (typeof x.price === "number" ? money(x.price) : String(x.price));
      const shopAt = String(x.shopLabel || x.brand || "retailer").trim(), action = dest ? "Shop at " + esc(shopAt) + (price ? " · " + esc(price) : "") : "View source";
      const commerceNote = x._catalog && !x._affiliate ? "<span class='muted' style='font-size:12px'>No affiliate link available; this goes directly to the product.</span>" : "";
      const rel = x._affiliate ? "sponsored noreferrer" : "noreferrer";
      const description = [x.summary, x.fitNote].filter(Boolean).join(" ");
      const n = x.independent.length;
      const consensus = "<div class='editConsensus'><strong>" + (n ? "Recommended by " + n + " of the " + total + " independent sources in this guide" : "No independent recommendation recorded yet") + "</strong>" + (n ? "<div class='editConsensusSources'>" + namesLine(x.independent, 5) + "</div>" : "") + "</div>";
      return "<article class='editPick' id='pick-" + esc(x.rank) + "'><div class='editVisual'><span class='editRank'>#" + esc(x.rank) + "</span>" + visual + "</div><div class='editCopy'>" + watchButton + "<div class='editTop'><div><p class='editBrand'>" + esc(x.brand) + "</p><h2><a href='/products/" + esc(x.key) + "'>" + esc(x.name) + "</a></h2></div></div>" + consensus + "<p class='editSummary'>" + esc(description || "") + "</p><div class='editSources'>" + ev + "</div><div class='editActions'>" + (dest ? "<a class='btn' href='" + track + "' target='_blank' rel='" + rel + "'>" + action + "</a>" : "") + "<a class='plainLink' style='font-size:13px' href='/products/" + esc(x.key) + "'>All recommendations for this product</a>" + commerceNote + "</div></div></article>";
    }).join("");
    const lead = picks[0], awarded = lead && lead.independent.length >= AWARD_MIN_SOURCES;
    const metrics = "<div class='editMetrics'><span><strong>" + esc(picks.length) + "</strong> ranked picks</span><span><strong>" + esc(total) + "</strong> independent sources</span>" + (lastVerified ? "<span><strong>" + esc(niceDate(lastVerified)) + "</strong> sources last verified · " + confirmed + " of " + checkable + " confirmed</span>" : "<span><strong>" + esc(guide.checkedLabel) + "</strong> last checked</span>") + "</div>";
    const intro = "<section class='editIntro'><div><span class='eyebrow'>" + (awarded ? "Best of Fashion " + FRANCHISE_YEAR + " winner" : "Not yet awarded") + "</span><h2>" + (awarded ? esc(lead.brand + " " + lead.name) : "Still gathering evidence.") + "</h2></div><p>" + (awarded ? esc(lead.brand + " " + lead.name) + " leads this category with " + lead.independent.length + " independent sources. " : "No product here has reached the " + AWARD_MIN_SOURCES + " independent sources needed to win the category. ") + "Picks are ranked by how many independent sources recommend them. Brand and retailer pages are shown with a dashed outline and are not counted. <a class='plainLink' href='/methodology'>How we count</a>.</p></section>";
    const method = "<section class='editMethod'><span class='eyebrow'>How Reccas built this guide</span><h2>What counts as a recommendation?</h2><p>" + esc(guide.freshnessCopy || "The product must still satisfy the stated category, price, or use-case constraint when Reccas checks it.") + " Reccas may earn a commission from some shopping links; that does not affect the ranking.</p></section>";
    const socialImage = lead ? "https://reccas.com" + imageUrl({slug: slug, rank: lead.rank}) : null;
    const listSchema = {"@type": "ItemList", name: guide.title, itemListElement: picks.map(function (x, i) { return {"@type": "ListItem", position: i + 1, name: String(x.brand + " " + x.name), url: "https://reccas.com/products/" + x.key}; })};
    const watchUi = "<div class='watchModalOverlay js-watch-modal' aria-hidden='true'><div class='watchModal' role='dialog' aria-modal='true' aria-labelledby='watchTitle'><button class='watchModalClose js-watch-close' type='button' aria-label='Close'>×</button><span class='eyebrow'>Sale alert</span><h2 id='watchTitle'>Get an email if it goes on sale</h2><p class='muted'>Enter your email to watch the price of <strong class='js-watch-name'>this item</strong>. No account needed.</p><div class='watchModalActions'><form class='stack js-watch-email-form'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn' type='submit'>Watch price</button><div class='muted js-watch-email-msg' style='font-size:12px' role='status'></div></form><a class='btn alt js-watch-google' href='#'>Or continue with Google</a></div><p class='muted' style='margin:14px 0 0;font-size:12px'>Already have an account? <a class='js-watch-login' href='#'><strong>Log in</strong></a></p></div></div><div class='watchToast js-watch-toast'>Price tracked</div>";
    const watchScript = "<script>(function(){var slug=" + JSON.stringify(slug) + ",buttons=Array.from(document.querySelectorAll('.js-price-watch')),modal=document.querySelector('.js-watch-modal'),close=document.querySelector('.js-watch-close'),nameEl=document.querySelector('.js-watch-name'),google=document.querySelector('.js-watch-google'),emailForm=document.querySelector('.js-watch-email-form'),emailMsg=document.querySelector('.js-watch-email-msg'),login=document.querySelector('.js-watch-login'),toast=document.querySelector('.js-watch-toast'),authed=false,watched=new Set(),pending=null;function emailKeys(){try{return JSON.parse(localStorage.getItem('reccas_email_watches')||'[]')}catch(_){return[]}}function rememberEmailKey(k){try{var a=emailKeys();if(a.indexOf(k)<0){a.push(k);localStorage.setItem('reccas_email_watches',JSON.stringify(a.slice(-200)))}}catch(_){}}function payload(btn){try{return JSON.parse(decodeURIComponent(btn.dataset.watch||''))}catch(_){return null}}function setState(btn,on){if(btn.classList.contains('watchBtn')){btn.classList.toggle('active',!!on);btn.setAttribute('aria-pressed',on?'true':'false');btn.title=on?'Watching for a sale':'Get alert when it goes on sale'}else if(btn.classList.contains('watchLabel')){btn.textContent=on?'Sale alert on':'Get alert when it goes on sale'}}function mark(key,on){buttons.forEach(function(b){var q=payload(b);if(q&&q.watchKey===key)setState(b,on)})}function flash(t){toast.textContent=t||'Price tracked';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},1800)}function currentReturn(){return location.pathname+location.search}function openModal(p){pending=p;try{localStorage.setItem('reccas_pending_watch',JSON.stringify(p))}catch(_){}nameEl.textContent=[p.brand,p.name].filter(Boolean).join(' ')||'this item';var rt=encodeURIComponent(currentReturn());google.href='/_api/auth/google_authorize?returnTo='+rt;login.href='/login?returnTo='+rt;if(emailMsg)emailMsg.textContent='';modal.classList.add('open');modal.setAttribute('aria-hidden','false');var input=emailForm&&emailForm.querySelector('input[name=email]');if(input)input.focus()}function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}async function save(p,on){var r=await fetch('/_api/price-watch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({},p,{action:on?'watch':'remove'}))});if(r.status===401){authed=false;openModal(p);return false}if(!r.ok)return false;if(on)watched.add(p.watchKey);else watched.delete(p.watchKey);mark(p.watchKey,on);flash(on?'Price tracked':'Price watch removed');return true}async function init(){emailKeys().forEach(function(k){watched.add(k);mark(k,true)});var r=await fetch('/_api/auth/session',{headers:{accept:'application/json'}});authed=r.ok;if(!authed)return;try{var wr=await fetch('/_api/price-watch?slug='+encodeURIComponent(slug));if(wr.ok){var d=await wr.json();(d.watches||[]).forEach(function(w){watched.add(w.watch_key)})}}catch(_){}buttons.forEach(function(b){var p=payload(b);if(p)setState(b,watched.has(p.watchKey))});try{var raw=localStorage.getItem('reccas_pending_watch');if(raw){var p=JSON.parse(raw);if(p&&p.guideSlug===slug){localStorage.removeItem('reccas_pending_watch');await save(p,true);closeModal()}}}catch(_){}}buttons.forEach(function(btn){btn.addEventListener('click',async function(e){e.preventDefault();e.stopPropagation();var p=payload(btn);if(!p)return;if(!authed){if(watched.has(p.watchKey)){flash('Sale alert already on');return}openModal(p);return}await save(p,!watched.has(p.watchKey))})});if(emailForm)emailForm.addEventListener('submit',async function(e){e.preventDefault();if(!pending)return;if(emailMsg)emailMsg.textContent='Saving…';var o=Object.fromEntries(new FormData(emailForm).entries()),j={},r;try{r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'price_alert',page:location.pathname,watch:pending})});try{j=await r.json()}catch(_){}}catch(_){r=null}if(!r||!r.ok){if(emailMsg)emailMsg.textContent=j.error||'Could not save that. Please try again.';return}try{localStorage.removeItem('reccas_pending_watch')}catch(_){}rememberEmailKey(pending.watchKey);watched.add(pending.watchKey);mark(pending.watchKey,true);closeModal();flash('Sale alert on')});if(close)close.onclick=closeModal;if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});init()})();</script>";
    return page("/" + slug, guide.seoTitle, "<main class='wrap'><section class='hero editHero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + " · " + esc(CATEGORIES[guide.category].label) + "</span><h1>" + esc(guide.title) + "</h1><p>" + esc(guide.deck || guide.description) + "</p>" + metrics + "</section>" + intro + "<section class='editList'>" + cards + "</section>" + method + "</main>" + watchUi + watchScript, guide.description || guide.deck || guide.title, 200, null, {kind: "article", headline: guide.title, image: socialImage, breadcrumb: guide.title, schema: [listSchema]});
  }

  async function sitemapEntries(env) {
    const corpus = await getCorpus(env), day = today(), out = [];
    ["/", FRANCHISE_PATH, "/most-recommended", "/sources", "/methodology", "/about", "/press", "/developers", "/privacy"].forEach(function (p) { out.push({p: p, last: day}); });
    Object.keys(CATEGORIES).forEach(function (k) { if (corpus.categoryCounts[k] > 0) out.push({p: "/recommendations/" + k, last: day}); });
    corpus.guideList.forEach(function (g) { out.push({p: "/" + g.slug, last: day}); });
    corpus.productList.forEach(function (p) { if (p.independent.length >= INDEXABLE_PRODUCT_MIN_SOURCES) out.push({p: "/products/" + p.key, last: day}); });
    corpus.sourceList.forEach(function (s) { if (s.productKeys.length >= INDEXABLE_SOURCE_MIN_PRODUCTS) out.push({p: "/sources/" + s.slug, last: day}); });
    return out;
  }

  return {home: home, recommendations: recommendations, categoryPage: categoryPage, mostRecommended: mostRecommended, sourcesIndex: sourcesIndex, sourcePage: sourcePage, productPage: productPage, methodology: methodology, guidePage: guidePage, sitemapEntries: sitemapEntries};
}
