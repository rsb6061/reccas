import {STATIC_EDITS} from "./static-edits.js";
import {EXTRA_STATIC_EDITS, DERIVED_GUIDES} from "./recommendation-batch.js";

export const FRANCHISE_YEAR = 2026;
export const FRANCHISE_PATH = "/recommendations";
export const AWARD_MIN_SOURCES = 3;
export const TRACKING_STARTED = "2026-10-07";
const VERIFY_WINDOW_DAYS = 60;
const PROMOTE_MIN_SOURCES = 3;
const BRAND_MIN_SOURCES = 3;
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
  "best-quiet-luxury-crossbody-bags": "best-designer-crossbody-bags",
  "best-flats-for-work": "best-work-flats-for-women",
  "best-crossbody-bags-for-everyday": "best-crossbody-bags",
  "best-sneakers-for-walking-all-day": "best-walking-sneakers-for-women",
  "best-jeans-for-short-women": "best-jeans-for-petites",
  "best-pants-for-travel": "best-travel-pants-for-women"
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

// Product types drive the header menu. Order matters: the first matching type wins.
export const TYPES = [
  {key: "sneakers", label: "Sneakers", test: /\b(sneaker|sneakers|travel shoes)\b/},
  {key: "boots", label: "Boots", test: /\b(boot|boots)\b/},
  {key: "flats-loafers", label: "Flats & loafers", test: /\b(flat|flats|loafer|loafers|ballet)\b/},
  {key: "bags", label: "Bags", test: /\b(bag|bags|tote|totes|crossbody)\b/},
  {key: "coats-blazers", label: "Coats & blazers", test: /\b(coat|coats|trench|blazer|blazers|jacket|jackets)\b/},
  {key: "sweaters", label: "Sweaters", test: /\b(sweater|sweaters|cardigan|cardigans|cashmere)\b/},
  {key: "jeans", label: "Jeans", test: /\b(jean|jeans|denim)\b/},
  {key: "trousers", label: "Trousers", test: /\b(trouser|trousers|pant|pants)\b/},
  {key: "dresses", label: "Dresses", test: /\b(dress|dresses|shapewear)\b/},
  {key: "tees-shirts", label: "Tees & shirts", test: /\b(t-shirt|t-shirts|tee|tees|shirt|shirts|button-down)\b/}
];
const TYPE_MENU_ORDER = ["tees-shirts", "sweaters", "jeans", "trousers", "dresses", "coats-blazers", "flats-loafers", "sneakers", "boots", "bags"];
export function guideType(r) {
  const t = (" " + String((r && r.title) || "") + " " + String((r && r.slug) || "").replace(/-/g, " ") + " ").toLowerCase();
  for (const type of TYPES) if (type.test.test(t)) return type.key;
  return null;
}
function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[m]; });
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
// The one definition of "counts": independent, still listed in the source, and re-checkable.
export function counts(ev) { return !!(ev && ev.independent && !ev.disputed && !ev.blocked); }
function independentNames(evidence) {
  const names = [];
  evidence.forEach(function (ev) { if (counts(ev) && names.indexOf(ev.source) < 0) names.push(ev.source); });
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
  Object.keys(EXTRA_STATIC_EDITS).forEach(function (slug) {
    if (!bySlug.has(slug)) bySlug.set(slug, {edit: JSON.parse(JSON.stringify(EXTRA_STATIC_EDITS[slug])), isStatic: true});
  });
  Object.keys(DERIVED_GUIDES).forEach(function (slug) {
    if (bySlug.has(slug)) return;
    const cfg = DERIVED_GUIDES[slug], picks = [], seen = new Set();
    (cfg.sourceSlugs || []).forEach(function (sourceSlug) {
      const source = bySlug.get(GUIDE_REDIRECTS[sourceSlug] || sourceSlug) || bySlug.get(sourceSlug);
      if (!source || !source.edit || !Array.isArray(source.edit.picks)) return;
      source.edit.picks.forEach(function (raw) {
        const hay = (String(raw.brand || "") + " " + String(raw.name || "")).toLowerCase();
        if (Array.isArray(cfg.include) && cfg.include.length && !cfg.include.some(function (needle) { return hay.indexOf(String(needle).toLowerCase()) >= 0; })) return;
        const key = slugify(String(raw.brand || "") + " " + String(raw.name || ""));
        if (!key || seen.has(key)) return;
        seen.add(key);
        picks.push(JSON.parse(JSON.stringify(raw)));
      });
    });
    if (!picks.length) return;
    bySlug.set(slug, {edit: Object.assign({}, cfg, {picks: picks.slice(0, Number(cfg.maxPicks || 3))}), isStatic: true});
  });
  return bySlug;
}

// Review decisions and source metadata live in the database and are laid over the guide data.
// "disputed" stays visible but is not counted; "removed" is dropped entirely.
function applyOverlay(productKey, evidence, overlay) {
  if (!overlay || !overlay.size) return evidence;
  const cutoff = new Date(Date.now() - VERIFY_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
  return evidence.filter(function (ev) {
    const o = overlay.get(mentionKey(productKey, ev));
    if (!o) return true;
    if (o.status === "removed") return false;
    if (o.status === "disputed") { ev.disputed = true; ev.reviewedAt = o.reviewed_at ? String(o.reviewed_at).slice(0, 10) : null; }
    // A publisher that blocks automated readers cannot be re-checked, so its recommendation is shown but not counted.
    if (o.check_status === "blocked" && !(o.verified_on && o.verified_on >= cutoff) && o.status !== "confirmed") ev.blocked = true;
    if (o.author && !ev.author) ev.author = o.author;
    if (!ev.date && (o.modified_at || o.published_at)) { ev.date = o.modified_at || o.published_at; ev.dateKind = o.modified_at ? "updated" : "published"; }
    return true;
  });
}
// Recommendations read out of already-cited articles and accepted by rule (see scripts/extract-recommendations.mjs).
async function loadExtras(env) {
  const out = new Map();
  try {
    const rows = (await env.DB.prepare("SELECT matched_product_key,source,label,url,author,published_at,modified_at FROM mention_candidates WHERE status='accepted' AND matched_product_key IS NOT NULL").all()).results || [];
    rows.forEach(function (r) {
      if (!out.has(r.matched_product_key)) out.set(r.matched_product_key, []);
      out.get(r.matched_product_key).push({source: r.source, label: r.label || "Recommended in this article", url: r.url, author: r.author || null, date: r.modified_at || r.published_at || null});
    });
  } catch (_) {}
  out.promoted = new Map();
  out.brandRows = [];
  try {
    const rows = (await env.DB.prepare("SELECT c.brand,c.name,c.product_key,c.source,c.label,c.url,c.author,c.published_at,c.modified_at,c.price,c.status,COALESCE(c.guide_slug,(SELECT o.guide_slug FROM mention_observations o WHERE o.url=c.url AND o.guide_slug IS NOT NULL LIMIT 1)) guide FROM mention_candidates c WHERE c.validated=1 AND c.status IN ('accepted','new_product')").all()).results || [];
    const clusters = new Map();
    rows.forEach(function (r) {
      const guide = r.guide ? (GUIDE_REDIRECTS[r.guide] || r.guide) : null;
      out.brandRows.push({brand: r.brand, source: r.source, url: r.url, guide: guide});
      if (r.status !== "new_product" || !guide) return;
      const bucket = guide + "|" + compact(r.brand);
      if (!clusters.has(bucket)) clusters.set(bucket, []);
      const list = clusters.get(bucket);
      let c = list.find(function (x) { return x.key === r.product_key || sameProductName(x.name, r.name); });
      if (!c) { c = {guide: guide, brand: r.brand, name: r.name, key: r.product_key, names: {}, evidence: [], prices: []}; list.push(c); }
      c.names[r.name] = (c.names[r.name] || 0) + 1;
      c.evidence.push({source: r.source, label: r.label || "Recommended in this article", url: r.url, author: r.author || null, date: r.modified_at || r.published_at || null});
      if (r.price != null && Number(r.price) > 0) c.prices.push(Number(r.price));
    });
    clusters.forEach(function (list) {
      list.forEach(function (c) {
        const independent = [];
        c.evidence.forEach(function (ev) { const n = sourceName(ev.source); if (isIndependent(ev, {brand: c.brand}) && independent.indexOf(n) < 0) independent.push(n); });
        if (independent.length < PROMOTE_MIN_SOURCES) return;
        const cap = (c.guide.match(/under-(\d+)/) || [])[1], price = c.prices.length ? Math.min.apply(null, c.prices) : null;
        if (cap && (price == null || price > Number(cap))) return;
        c.name = Object.keys(c.names).sort(function (a, b) { return c.names[b] - c.names[a] || a.length - b.length; })[0];
        if (!out.promoted.has(c.guide)) out.promoted.set(c.guide, []);
        out.promoted.get(c.guide).push({brand: c.brand, name: c.name, evidence: c.evidence, fallbackPrice: price, summary: "Added by rule: " + independent.length + " independent sources name it in their guides to this category.", _promoted: true});
      });
    });
  } catch (_) {}
  return out;
}
const NAME_FILLER = new Set(["the", "for", "women", "womens", "and", "with", "in", "of"]);
function nameTokens(v) { return slugify(v).split("-").filter(function (t) { return t.length > 1 && !NAME_FILLER.has(t); }); }
// Two names are the same product when one's distinctive words all appear in the other.
// "Clean Cut T-Shirt" and "Clean Cut Regular T-Shirt" match; "Lianna Super Bit Weejuns" and "Whitney Superlug Weejuns" do not.
function sameProductName(a, b) {
  const x = nameTokens(a), y = nameTokens(b), small = x.length <= y.length ? x : y, big = x.length <= y.length ? y : x;
  return small.length >= 2 && small.every(function (t) { return big.indexOf(t) >= 0; });
}
async function loadOverlay(env) {
  const out = new Map();
  try {
    const rows = (await env.DB.prepare("SELECT mention_key,status,reviewed_at,author,published_at,modified_at FROM mention_observations WHERE status IS NOT NULL OR author IS NOT NULL OR published_at IS NOT NULL OR modified_at IS NOT NULL").all()).results || [];
    rows.forEach(function (r) { out.set(r.mention_key, r); });
  } catch (_) {}
  try {
    const checks = (await env.DB.prepare("SELECT mention_key,status,verified_on FROM mention_checks").all()).results || [];
    checks.forEach(function (c) { const o = out.get(c.mention_key) || {mention_key: c.mention_key}; o.check_status = c.status; o.verified_on = c.verified_on; out.set(c.mention_key, o); });
  } catch (_) {}
  return out;
}

function buildCorpus(edits, overlay, extras) {
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
        const extracted = extras && !byKey.has(key) ? extras.get(key) || [] : [];
        const evidence = applyOverlay(key, normalizeEvidence(Object.assign({}, raw, {evidence: (raw.evidence || []).concat(extracted)})), overlay);
        if (!byKey.has(key)) {
          byKey.set(key, Object.assign({}, raw, {key: key, evidence: evidence, _static: member.isStatic, _order: order++}));
        } else {
          const have = byKey.get(key), ids = new Set(have.evidence.map(function (ev) { return ev.sourceSlug + "|" + ev.url; }));
          evidence.forEach(function (ev) { if (!ids.has(ev.sourceSlug + "|" + ev.url)) have.evidence.push(ev); });
        }
      });
    });
    ((extras && extras.promoted && extras.promoted.get(canonical)) || []).forEach(function (raw) {
      const key = slugify(raw.brand + " " + raw.name);
      if (!key || byKey.has(key)) return;
      if (Array.from(byKey.values()).some(function (p) { return compact(p.brand) === compact(raw.brand) && sameProductName(p.name, raw.name); })) return;
      byKey.set(key, Object.assign({}, raw, {key: key, evidence: applyOverlay(key, normalizeEvidence(raw), overlay), _static: true, _order: order++}));
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
    guide.type = guideType(guide);
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
      if (!counts(ev)) return;
      if (!sources.has(ev.sourceSlug)) sources.set(ev.sourceSlug, {slug: ev.sourceSlug, name: ev.source, mentions: [], productKeys: []});
      const src = sources.get(ev.sourceSlug);
      src.mentions.push({productKey: prod.key, brand: prod.brand, name: prod.name, label: ev.label, url: ev.url, guideSlug: ev.guideSlug});
      if (src.productKeys.indexOf(prod.key) < 0) src.productKeys.push(prod.key);
    });
  });
  const brands = new Map();
  function addBrand(brand, source, type) {
    const id = compact(brand);
    if (!id || !source) return;
    if (!brands.has(id)) brands.set(id, {id: id, names: {}, sources: [], byType: {}});
    const b = brands.get(id);
    b.names[brand] = (b.names[brand] || 0) + 1;
    if (b.sources.indexOf(source) < 0) b.sources.push(source);
    if (type) { if (!b.byType[type]) b.byType[type] = []; if (b.byType[type].indexOf(source) < 0) b.byType[type].push(source); }
  }
  guides.forEach(function (g) { g.picks.forEach(function (p) { p.evidence.forEach(function (ev) { if (counts(ev)) addBrand(p.brand, ev.source, g.type); }); }); });
  ((extras && extras.brandRows) || []).forEach(function (r) {
    if (!isIndependent({source: r.source, url: r.url, label: ""}, {brand: r.brand})) return;
    const g = r.guide ? guides.get(r.guide) : null;
    addBrand(r.brand, sourceName(r.source), g ? g.type : null);
  });
  const brandList = Array.from(brands.values()).map(function (b) { b.name = Object.keys(b.names).sort(function (x, y) { return b.names[y] - b.names[x]; })[0]; return b; }).sort(function (a, b) { return b.sources.length - a.sources.length || a.name.localeCompare(b.name); });
  const guideList = Array.from(guides.values()).sort(function (a, b) { return b.independentSources.length - a.independentSources.length || a.title.localeCompare(b.title); });
  const productList = Array.from(products.values()).sort(function (a, b) { return b.independent.length - a.independent.length || b.appearances.length - a.appearances.length || (a.brand + a.name).localeCompare(b.brand + b.name); });
  const sourceList = Array.from(sources.values()).sort(function (a, b) { return b.productKeys.length - a.productKeys.length || a.name.localeCompare(b.name); });
  let mentions = 0;
  productList.forEach(function (p) { p.evidence.forEach(function (ev) { if (counts(ev)) mentions++; }); });
  const perCategory = {clothing: 0, shoes: 0, bags: 0, accessories: 0};
  guideList.forEach(function (g) { perCategory[g.category]++; });
  const types = TYPE_MENU_ORDER.map(function (key) {
    const def = TYPES.find(function (t) { return t.key === key; });
    return {key: key, label: def.label, guides: guideList.filter(function (g) { return g.type === key; })};
  }).filter(function (t) { return t.guides.length; });
  const untyped = guideList.filter(function (g) { return !g.type; });
  if (untyped.length) types.push({key: "more", label: "More", guides: untyped});
  return {guides: guides, products: products, sources: sources, guideList: guideList, productList: productList, sourceList: sourceList, stats: {guides: guideList.length, products: productList.length, sources: sourceList.length, mentions: mentions}, categoryCounts: perCategory, types: types, brandList: brandList};
}

let corpusCache = {at: 0, corpus: null};
let navTypeItems = TYPE_MENU_ORDER.map(function (key) { return {label: TYPES.find(function (t) { return t.key === key; }).label, href: "/recommendations#" + key}; });
export async function getCorpus(env) {
  const now = Date.now();
  if (corpusCache.corpus && now - corpusCache.at < CORPUS_TTL_MS) return corpusCache.corpus;
  const corpus = buildCorpus(await loadEdits(env), await loadOverlay(env), await loadExtras(env));
  corpusCache = {at: now, corpus: corpus};
  navTypeItems = corpus.types.filter(function (t) { return t.key !== "more"; }).map(function (t) { return {label: t.label, href: t.guides.length === 1 ? "/" + t.guides[0].slug : "/recommendations#" + t.key}; });
  return corpus;
}
const SEARCH_ICON = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'><circle cx='11' cy='11' r='6.5'></circle><path d='M16 16l4.5 4.5'></path></svg>";
const HEART_ICON = "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'></path></svg>";
export function siteHeader() {
  const menu = navTypeItems.map(function (t) { return "<a href='" + escHtml(t.href) + "'>" + escHtml(t.label) + "</a>"; }).join("");
  return "<header><div class='nav'><a class='brand' href='/'>Reccas</a><nav class='navlinks'><div class='navDrop'><a href='/recommendations'>Best of Fashion " + FRANCHISE_YEAR + "</a><div class='navMenu navMenuWide'>" + menu + "</div></div></nav><div class='navRight'><form class='navSearch js-search' action='/search' method='get' role='search'><button class='navIcon js-search-toggle' type='button' aria-label='Search' aria-expanded='false'>" + SEARCH_ICON + "</button><input type='search' name='q' placeholder='Search products, brands, sources' aria-label='Search products, brands and sources' maxlength='80'></form><a class='btn alt navTop' href='/most-recommended'>Most recommended</a><a class='btn alt navAlerts' href='/alerts' aria-label='Sale alerts'>" + HEART_ICON + "<span>Sale alerts</span></a></div></div></header><script>(function(){var f=document.querySelector('.js-search');if(!f)return;var b=f.querySelector('.js-search-toggle'),i=f.querySelector('input');function set(o){f.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');if(o)i.focus()}b.addEventListener('click',function(){if(!f.classList.contains('open')){set(true);return}if(i.value.trim())f.submit();else set(false)});i.addEventListener('keydown',function(e){if(e.key==='Escape'){set(false);b.focus()}});document.addEventListener('click',function(e){if(!f.contains(e.target)&&!i.value.trim())set(false)})})();</script>";
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

const CREATOR_SOURCES = new Set(["kendi-everyday", "terilyn-adams", "the-mom-edit", "notes-from-europe", "the-atlas-heart", "outfitnotes", "youlookfab", "canvelle"]);
let modelReady = false;
export function resetCorpusCache() { corpusCache = {at: 0, corpus: null}; }
export async function ensureObservationTables(env) {
  if (modelReady) return;
  await ensureBaseTables(env);
  const cols = ((await env.DB.prepare("PRAGMA table_info(mention_observations)").all()).results || []).map(function (c) { return c.name; });
  for (const col of ["author TEXT", "published_at TEXT", "modified_at TEXT", "status TEXT", "status_note TEXT", "reviewed_at TEXT"]) {
    if (cols.indexOf(col.split(" ")[0]) < 0) await env.DB.prepare("ALTER TABLE mention_observations ADD COLUMN " + col).run();
  }
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS rec_products (product_key TEXT PRIMARY KEY,brand TEXT NOT NULL,name TEXT NOT NULL,category TEXT,type TEXT,independent_sources INTEGER NOT NULL DEFAULT 0,guides INTEGER NOT NULL DEFAULT 0,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS rec_sources (source_slug TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT NOT NULL,weight REAL NOT NULL DEFAULT 1,products INTEGER NOT NULL DEFAULT 0,mentions INTEGER NOT NULL DEFAULT 0,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL)")
  ]);
  modelReady = true;
}
async function ensureBaseTables(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS mention_observations (mention_key TEXT PRIMARY KEY,product_key TEXT NOT NULL,guide_slug TEXT,source TEXT NOT NULL,source_slug TEXT NOT NULL,url TEXT,label TEXT,independent INTEGER NOT NULL DEFAULT 1,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_mention_observations_product ON mention_observations(product_key)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS price_observations (product_key TEXT NOT NULL,observed_on TEXT NOT NULL,price REAL NOT NULL,currency TEXT DEFAULT 'USD',merchant TEXT,PRIMARY KEY(product_key,observed_on))")
  ]);
}
function mentionKey(productKey, ev) { return productKey + "|" + ev.sourceSlug + "|" + ev.url; }

export async function syncMentions(env) {
  await ensureObservationTables(env);
  const corpus = buildCorpus(await loadEdits(env), await loadOverlay(env), await loadExtras(env)), today = new Date().toISOString().slice(0, 10);
  const stmts = [];
  corpus.productList.forEach(function (prod) {
    prod.evidence.forEach(function (ev) {
      stmts.push(env.DB.prepare("INSERT INTO mention_observations (mention_key,product_key,guide_slug,source,source_slug,url,label,independent,first_seen,last_seen) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(mention_key) DO UPDATE SET last_seen=excluded.last_seen,label=excluded.label,independent=excluded.independent").bind(mentionKey(prod.key, ev), prod.key, ev.guideSlug || null, ev.source, ev.sourceSlug, ev.url, ev.label, ev.independent ? 1 : 0, today, today));
    });
  });
  corpus.productList.forEach(function (prod) {
    stmts.push(env.DB.prepare("INSERT INTO rec_products (product_key,brand,name,category,type,independent_sources,guides,first_seen,last_seen) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(product_key) DO UPDATE SET brand=excluded.brand,name=excluded.name,category=excluded.category,type=excluded.type,independent_sources=excluded.independent_sources,guides=excluded.guides,last_seen=excluded.last_seen").bind(prod.key, prod.brand, prod.name, prod.category, guideType({title: prod.appearances[0] ? prod.appearances[0].title : "", slug: prod.appearances[0] ? prod.appearances[0].slug : ""}), prod.independent.length, prod.appearances.length, today, today));
  });
  const seenSources = new Map();
  corpus.productList.forEach(function (prod) {
    prod.evidence.forEach(function (ev) {
      if (!seenSources.has(ev.sourceSlug)) seenSources.set(ev.sourceSlug, {name: ev.source, kind: ev.independent ? (CREATOR_SOURCES.has(ev.sourceSlug) ? "creator" : "publication") : "brand_or_retailer", products: new Set(), mentions: 0});
      const s = seenSources.get(ev.sourceSlug);
      s.products.add(prod.key); s.mentions++;
    });
  });
  seenSources.forEach(function (s, slug) {
    stmts.push(env.DB.prepare("INSERT INTO rec_sources (source_slug,name,kind,products,mentions,first_seen,last_seen) VALUES (?,?,?,?,?,?,?) ON CONFLICT(source_slug) DO UPDATE SET name=excluded.name,products=excluded.products,mentions=excluded.mentions,last_seen=excluded.last_seen").bind(slug, s.name, s.kind, s.products.size, s.mentions, today, today));
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  return {corpus: corpus, mentions: stmts.length, day: today};
}
// One row per product per day. Trending is the difference between two of these rows.
export async function snapshotProducts(env, corpus) {
  const today = new Date().toISOString().slice(0, 10), weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS product_daily (day TEXT NOT NULL,product_key TEXT NOT NULL,counted_sources INTEGER NOT NULL,all_sources INTEGER NOT NULL,guides INTEGER NOT NULL,clicks_7d INTEGER NOT NULL DEFAULT 0,alerts INTEGER NOT NULL DEFAULT 0,price REAL,PRIMARY KEY(day,product_key))").run();
  const clicks = new Map(), alerts = new Map(), prices = new Map();
  try { ((await env.DB.prepare("SELECT recommendation_id k,COUNT(*) n FROM outbound_clicks WHERE clicked_at>? AND recommendation_id IS NOT NULL GROUP BY recommendation_id").bind(weekAgo).all()).results || []).forEach(function (r) { clicks.set(r.k, r.n); }); } catch (_) {}
  try { ((await env.DB.prepare("SELECT brand,product_name,COUNT(*) n FROM price_alert_emails WHERE status='active' GROUP BY brand,product_name").all()).results || []).forEach(function (r) { alerts.set(slugify(String(r.brand || "") + " " + String(r.product_name || "")), r.n); }); } catch (_) {}
  try { ((await env.DB.prepare("SELECT product_key,price FROM price_observations WHERE observed_on=?").bind(today).all()).results || []).forEach(function (r) { prices.set(r.product_key, r.price); }); } catch (_) {}
  const stmts = corpus.productList.map(function (p) {
    const all = []; p.evidence.forEach(function (ev) { if (ev.independent && all.indexOf(ev.source) < 0) all.push(ev.source); });
    return env.DB.prepare("INSERT OR REPLACE INTO product_daily (day,product_key,counted_sources,all_sources,guides,clicks_7d,alerts,price) VALUES (?,?,?,?,?,?,?,?)").bind(today, p.key, p.independent.length, all.length, p.appearances.length, clicks.get(p.key) || 0, alerts.get(p.key) || 0, prices.has(p.key) ? prices.get(p.key) : null);
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  return stmts.length;
}
// Compares today's snapshot with the one closest to `days` ago. Empty until two snapshots exist.
export async function trendingData(env, days) {
  const out = {gaining: [], clicked: [], onSale: [], since: null, latest: null};
  try {
    const dayRows = (await env.DB.prepare("SELECT DISTINCT day FROM product_daily ORDER BY day DESC LIMIT 120").all()).results || [];
    if (dayRows.length < 2) return out;
    const latest = dayRows[0].day, target = new Date(Date.now() - (days || 7) * 86400000).toISOString().slice(0, 10);
    const earlier = (dayRows.find(function (d) { return d.day <= target; }) || dayRows[dayRows.length - 1]).day;
    if (earlier === latest) return out;
    out.since = earlier; out.latest = latest;
    const rows = (await env.DB.prepare("SELECT a.product_key,a.counted_sources now_sources,b.counted_sources then_sources,a.clicks_7d now_clicks,b.clicks_7d then_clicks,a.price now_price,b.price then_price FROM product_daily a JOIN product_daily b ON b.product_key=a.product_key AND b.day=? WHERE a.day=?").bind(earlier, latest).all()).results || [];
    const corpus = await getCorpus(env);
    rows.forEach(function (r) {
      const prod = corpus.products.get(r.product_key);
      if (!prod) return;
      if (r.now_sources > r.then_sources) out.gaining.push({prod: prod, from: r.then_sources, to: r.now_sources});
      if (r.now_clicks >= 5 && r.now_clicks > r.then_clicks) out.clicked.push({prod: prod, from: r.then_clicks, to: r.now_clicks});
      if (r.now_price != null && r.then_price != null && r.now_price <= r.then_price * 0.9) out.onSale.push({prod: prod, from: r.then_price, to: r.now_price});
    });
    out.gaining.sort(function (a, b) { return (b.to - b.from) - (a.to - a.from) || b.to - a.to; });
    out.clicked.sort(function (a, b) { return (b.to - b.from) - (a.to - a.from); });
    out.onSale.sort(function (a, b) { return a.to / a.from - b.to / b.from; });
  } catch (_) {}
  return out;
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
  const products = corpus.productList.map(function (p) { return {key: p.key, brand: p.brand, name: p.name}; });
  return Response.json({generated: new Date().toISOString(), stats: corpus.stats, products: products, mentions: mentions}, {headers: {"Cache-Control": "public, max-age=60"}});
}
function verifyKeyOk(request, env) {
  const expected = String(env.VERIFY_KEY || ""), given = String(request.headers.get("x-verify-key") || "");
  let diff = expected.length ^ given.length;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i % (given.length || 1));
  return expected.length >= 32 && diff === 0;
}
let candidateColumnsReady = false;
async function ensureCandidates(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS mention_candidates (id INTEGER PRIMARY KEY AUTOINCREMENT,url TEXT NOT NULL,source TEXT NOT NULL,source_slug TEXT NOT NULL,brand TEXT NOT NULL,name TEXT NOT NULL,product_key TEXT NOT NULL,matched_product_key TEXT,label TEXT,basis TEXT,author TEXT,published_at TEXT,modified_at TEXT,validated INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL,model TEXT,extracted_on TEXT NOT NULL,UNIQUE(url,product_key))"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_mention_candidates_status ON mention_candidates(status,matched_product_key)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS extraction_runs (url TEXT PRIMARY KEY,extracted_on TEXT NOT NULL,products INTEGER,model TEXT,missing TEXT)")
  ]);
  if (!candidateColumnsReady) {
    const cols = ((await env.DB.prepare("PRAGMA table_info(mention_candidates)").all()).results || []).map(function (c) { return c.name; });
    for (const col of ["guide_slug TEXT", "price REAL"]) if (cols.indexOf(col.split(" ")[0]) < 0) await env.DB.prepare("ALTER TABLE mention_candidates ADD COLUMN " + col).run();
    candidateColumnsReady = true;
  }
}
const EXTRACT_PROMPT = "You read a women's fashion article and list the specific products it recommends. Return JSON: {\"products\":[{\"brand\":\"\",\"name\":\"\",\"label\":\"\",\"basis\":\"\",\"price\":null}]}. Rules: include only products the article itself recommends to readers, each with a brand and a specific product or model name exactly as the article writes it. Leave out brands named without a product, products mentioned only for comparison or criticism, and anything from ads, navigation or related-article links. label is the article's own short descriptor for the product, such as 'Best overall', or an empty string. basis is one of tested, owned, editor_pick, listed. price is the US dollar price the article states for the product as a number, or null if it states none. Never invent a product. At most 40 products.";
export async function extractProducts(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  if (!env.OPENAI_API_KEY) return Response.json({error: "OPENAI_API_KEY missing"}, {status: 503});
  let b = {};
  try { b = await request.json(); } catch (_) {}
  const text = String(b.text || "").slice(0, 60000);
  if (text.length < 500) return Response.json({error: "Text too short"}, {status: 400});
  let lastError = "no model answered";
  for (const model of ["gpt-4o-mini", "gpt-5-mini"]) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {method: "POST", headers: {"content-type": "application/json", Authorization: "Bearer " + env.OPENAI_API_KEY}, body: JSON.stringify({model: model, response_format: {type: "json_object"}, messages: [{role: "system", content: EXTRACT_PROMPT}, {role: "user", content: "Article from " + String(b.source || "").slice(0, 80) + " (" + String(b.url || "").slice(0, 300) + "):\n\n" + text}]})});
      if (!r.ok) { lastError = model + " HTTP " + r.status; continue; }
      const d = await r.json(), parsed = JSON.parse(d.choices[0].message.content);
      const products = (Array.isArray(parsed.products) ? parsed.products : []).slice(0, 40).map(function (p) { return {brand: String(p.brand || "").trim().slice(0, 80), name: String(p.name || "").trim().slice(0, 160), label: String(p.label || "").trim().slice(0, 120), basis: ["tested", "owned", "editor_pick", "listed"].indexOf(p.basis) >= 0 ? p.basis : "listed", price: Number(p.price) > 0 && Number(p.price) < 100000 ? Number(p.price) : null}; }).filter(function (p) { return p.brand && p.name; });
      return Response.json({ok: true, model: model, products: products, usage: d.usage || null});
    } catch (e) { lastError = model + " " + String(e && e.message || e).slice(0, 120); }
  }
  return Response.json({error: lastError}, {status: 502});
}
export async function saveCandidates(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  let b = {};
  try { b = await request.json(); } catch (_) {}
  const day = String(b.day || ""), url = String(b.url || "").slice(0, 1000), rows = Array.isArray(b.rows) ? b.rows.slice(0, 60) : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !url) return Response.json({error: "Bad request"}, {status: 400});
  await ensureCandidates(env);
  const ok = ["accepted", "new_product", "unvalidated"], d = function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : null; };
  const stmts = rows.filter(function (r) { return r && r.brand && r.name && r.productKey && ok.indexOf(r.status) >= 0; }).map(function (r) {
    return env.DB.prepare("INSERT INTO mention_candidates (url,source,source_slug,brand,name,product_key,matched_product_key,label,basis,author,published_at,modified_at,validated,status,model,extracted_on,guide_slug,price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(url,product_key) DO UPDATE SET guide_slug=COALESCE(excluded.guide_slug,mention_candidates.guide_slug),price=COALESCE(excluded.price,mention_candidates.price),matched_product_key=excluded.matched_product_key,label=excluded.label,basis=excluded.basis,author=excluded.author,published_at=excluded.published_at,modified_at=excluded.modified_at,validated=excluded.validated,status=excluded.status,model=excluded.model,extracted_on=excluded.extracted_on").bind(url, String(b.source || "").slice(0, 120), slugify(b.source), String(r.brand).slice(0, 80), String(r.name).slice(0, 160), String(r.productKey).slice(0, 300), r.matchedProductKey ? String(r.matchedProductKey).slice(0, 300) : null, String(r.label || "").slice(0, 120) || null, r.basis || null, b.author ? String(b.author).slice(0, 160) : null, d(b.publishedAt), d(b.modifiedAt), r.validated ? 1 : 0, r.status, String(b.model || "").slice(0, 40) || null, day, b.guideSlug ? String(b.guideSlug).slice(0, 200) : null, Number(r.price) > 0 ? Number(r.price) : null);
  });
  stmts.push(env.DB.prepare("INSERT INTO extraction_runs (url,extracted_on,products,model,missing) VALUES (?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET extracted_on=excluded.extracted_on,products=excluded.products,model=excluded.model,missing=excluded.missing").bind(url, day, rows.length, String(b.model || "").slice(0, 40) || null, JSON.stringify((Array.isArray(b.missing) ? b.missing : []).slice(0, 40))));
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  resetCorpusCache();
  try { await applyReviewRules(env); } catch (_) {}
  return Response.json({ok: true, saved: stmts.length - 1});
}
export async function extractionStatus(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  await ensureCandidates(env);
  const runs = (await env.DB.prepare("SELECT url,extracted_on FROM extraction_runs").all()).results || [];
  return Response.json({runs: runs});
}
export async function saveMentionChecks(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  let b = {};
  try { b = await request.json(); } catch (_) {}
  const day = String(b.day || ""), rows = Array.isArray(b.rows) ? b.rows.slice(0, 500) : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return Response.json({error: "Bad day"}, {status: 400});
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS mention_checks (mention_key TEXT PRIMARY KEY,product_key TEXT NOT NULL,guide_slug TEXT,source TEXT,url TEXT,status TEXT NOT NULL,detail TEXT,checked_on TEXT NOT NULL,verified_on TEXT)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_mention_checks_guide ON mention_checks(guide_slug)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_mention_checks_product ON mention_checks(product_key)")
  ]);
  const stmts = rows.filter(function (r) { return r && r.key && r.productKey && ["verified", "not_found", "blocked"].indexOf(r.status) >= 0; }).map(function (r) {
    return env.DB.prepare("INSERT INTO mention_checks (mention_key,product_key,guide_slug,source,url,status,detail,checked_on,verified_on) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(mention_key) DO UPDATE SET status=excluded.status,detail=excluded.detail,checked_on=excluded.checked_on,guide_slug=excluded.guide_slug,verified_on=COALESCE(excluded.verified_on,mention_checks.verified_on)").bind(String(r.key).slice(0, 1200), String(r.productKey).slice(0, 300), r.guideSlug || null, r.source || null, r.url || null, r.status, r.detail || null, day, r.status === "verified" ? day : null);
  });
  await ensureObservationTables(env);
  rows.forEach(function (r) {
    if (!r || !r.key || !(r.author || r.publishedAt || r.modifiedAt)) return;
    stmts.push(env.DB.prepare("UPDATE mention_observations SET author=COALESCE(?,author),published_at=COALESCE(?,published_at),modified_at=COALESCE(?,modified_at) WHERE mention_key=?").bind(r.author ? String(r.author).slice(0, 160) : null, /^\d{4}-\d{2}-\d{2}$/.test(String(r.publishedAt || "")) ? r.publishedAt : null, /^\d{4}-\d{2}-\d{2}$/.test(String(r.modifiedAt || "")) ? r.modifiedAt : null, String(r.key).slice(0, 1200)));
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  resetCorpusCache();
  let decided = 0;
  try { decided = await applyReviewRules(env); } catch (_) {}
  return Response.json({ok: true, saved: stmts.length, decided: decided});
}
// Decisions made without a person. Automation only ever changes its own earlier decisions
// (notes starting "auto:"); anything set by hand on the admin screen is left alone.
export async function applyReviewRules(env) {
  await ensureObservationTables(env);
  await ensureCandidates(env);
  const rows = (await env.DB.prepare("SELECT o.mention_key,o.url,o.independent,o.status,o.status_note,c.status check_status FROM mention_observations o JOIN mention_checks c ON c.mention_key=o.mention_key").all()).results || [];
  const cutoff = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10), runs = new Map();
  ((await env.DB.prepare("SELECT url,extracted_on,missing FROM extraction_runs WHERE extracted_on>?").bind(cutoff).all()).results || []).forEach(function (r) { let missing = []; try { missing = JSON.parse(r.missing || "[]"); } catch (_) {} runs.set(r.url, new Set(missing)); });
  const now = new Date().toISOString(), stmts = [];
  function set(key, status, note) { stmts.push(env.DB.prepare("UPDATE mention_observations SET status=?,status_note=?,reviewed_at=? WHERE mention_key=?").bind(status, note, now, key)); }
  rows.forEach(function (r) {
    const automatic = !r.status || String(r.status_note || "").indexOf("auto:") === 0;
    if (!automatic) return;
    let want = r.status || null, note = r.status_note || null;
    if (r.check_status === "verified") { want = null; note = null; }
    else if (r.check_status === "not_found") {
      if (!r.independent) { want = "removed"; note = "auto: the brand or retailer page no longer shows the product"; }
      else if (runs.has(r.url)) {
        if (runs.get(r.url).has(r.mention_key)) { want = "disputed"; note = "auto: a second read did not find the product in the source"; }
        else { want = "confirmed"; note = "auto: a second read found the product in the source"; }
      }
    }
    if (want !== (r.status || null)) set(r.mention_key, want, note);
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  if (stmts.length) resetCorpusCache();
  return stmts.length;
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
.popCard{position:fixed;right:20px;bottom:20px;z-index:60;width:min(360px,calc(100vw - 24px));background:var(--cream);border:1px solid var(--lavender);border-radius:24px;padding:22px;box-shadow:0 24px 60px rgba(27,21,60,.2);opacity:0;transform:translateY(14px);transition:opacity .25s ease,transform .25s ease}
.popCard.open{opacity:1;transform:translateY(0)}
.popCard h3{font-size:24px;line-height:1.12;margin:6px 0 8px}
.popCard p{font-size:14px;line-height:1.5;margin:0 0 12px}
.popCard form{display:grid;gap:8px}
.popClose{position:absolute;top:10px;right:12px;border:0;background:transparent;font-size:24px;color:var(--muted);cursor:pointer}
@media(max-width:720px){.popCard{right:12px;left:12px;bottom:12px;width:auto}}
.navRight{display:flex;align-items:center;gap:8px;position:relative}
.navMenuWide{display:grid;grid-template-columns:1fr 1fr;min-width:330px}
.navSearch{display:flex;align-items:center}
.navIcon{width:40px;height:40px;border:0;border-radius:999px;background:transparent;color:#514b65;display:grid;place-items:center;cursor:pointer}
.navIcon:hover{background:#efeaff;color:var(--ink)}
.navSearch input{width:0;opacity:0;border:1px solid transparent;border-radius:999px;padding:0;font:inherit;font-size:14px;background:#fff;color:var(--ink);transition:width .2s ease,opacity .2s ease,padding .2s ease}
.navSearch.open input{width:250px;opacity:1;padding:9px 14px;border-color:var(--lavender)}
.navAlerts{display:inline-flex;align-items:center;gap:7px}
[id]{scroll-margin-top:110px}
.typeGroup{margin-top:34px}
.typeGroup h3{font-size:28px;margin:0 0 14px}
.searchForm{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;max-width:620px}
.searchForm .field{flex:1;min-width:220px}
@media(max-width:760px){.navRight{margin-left:auto;gap:4px;position:static}.nav{position:relative}.navAlerts span{display:none}.navAlerts{padding:9px 11px}.navSearch.open{position:absolute;left:8px;right:8px;top:8px;bottom:8px;background:#fff;border-radius:999px;z-index:5}.navSearch.open input{flex:1;width:auto}}
.footNote{font-size:12px;line-height:1.55;color:var(--muted);max-width:760px;margin:0}
.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
@media(max-width:720px){.rankRow{grid-template-columns:30px 60px 1fr;gap:12px}.rankRow img{width:60px;height:60px}.rankCount{grid-column:2/4;text-align:left}.rankCount strong{display:inline;font-size:20px;margin-right:5px}.productHero{grid-template-columns:1fr}}
`;

// A corner card, not an overlay: it never blocks the page, so it is safe for visitors arriving from search.
export function signupPopup(path) {
  if (/^\/(login|signup|wardrobe|unsubscribe|admin)/.test(String(path))) return "";
  return "<div class='popCard js-pop' role='dialog' aria-label='Sale alerts' hidden><button class='popClose js-pop-close' type='button' aria-label='Close'>×</button><span class='eyebrow'>Sale alerts</span><h3>Know when the most recommended pieces go on sale.</h3><p class='muted'>Reccas tracks prices on the products fashion editors agree on. Leave your email and we will tell you when one drops.</p><form class='js-pop-form'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn' type='submit'>Get sale alerts</button></form><div class='signupMsg js-pop-msg' role='status'></div></div><script>(function(){var c=document.querySelector('.js-pop');if(!c)return;var K='reccas_popup';function seen(){try{return !!localStorage.getItem(K)}catch(_){return true}}function mark(v){try{localStorage.setItem(K,v)}catch(_){}}if(seen())return;var shown=false;function show(){if(shown||seen())return;shown=true;c.hidden=false;requestAnimationFrame(function(){c.classList.add('open')})}function hide(v){mark(v);c.classList.remove('open');setTimeout(function(){c.hidden=true},250)}var t=setTimeout(show,12000);window.addEventListener('scroll',function(){var d=document.documentElement;if((window.scrollY+window.innerHeight)/d.scrollHeight>0.5){clearTimeout(t);show()}},{passive:true});c.querySelector('.js-pop-close').onclick=function(){hide('dismissed')};var f=c.querySelector('.js-pop-form'),m=c.querySelector('.js-pop-msg');f.addEventListener('submit',async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(f).entries());m.textContent='Saving…';try{var r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'newsletter',page:location.pathname+'#popup'})}),j={};try{j=await r.json()}catch(_){}if(!r.ok){m.textContent=j.error||'Could not save that. Please try again.';return}m.textContent='You are on the list.';mark('subscribed');setTimeout(function(){hide('subscribed')},1600)}catch(_){m.textContent='Could not save that. Please try again.'}})})();</script>";
}

const SYNONYMS = {tee: ["t-shirt"], tees: ["t-shirt"], tshirt: ["t-shirt"], tshirts: ["t-shirt"], trainer: ["sneaker"], trainers: ["sneaker"], pants: ["trouser", "pant"], trousers: ["trouser", "pant"], purse: ["bag"], handbag: ["bag"], jumper: ["sweater"], jumpers: ["sweater"], denim: ["jean"], pumps: ["heel", "flat"], coat: ["coat", "trench"], shirt: ["shirt", "button-down"]};
const QUERY_FILLER = new Set(["best", "the", "most", "recommended", "top", "for", "women", "womens", "a", "an", "of", "in", "good", "which", "what", "is", "are"]);
// Returns a test for whether a piece of text matches every meaningful word of a query, allowing plurals and synonyms.
export function queryMatcher(query) {
  let tokens = slugify(query).split("-").filter(Boolean);
  const meaningful = tokens.filter(function (t) { return !QUERY_FILLER.has(t); });
  if (meaningful.length) tokens = meaningful;
  const variants = tokens.map(function (tok) { return [tok, tok.replace(/(es|s)$/, "")].concat(SYNONYMS[tok] || []).filter(function (v) { return v.length > 1; }); }).filter(function (vs) { return vs.length > 0; });
  return function (text) { const t = slugify(text); return variants.length > 0 && variants.every(function (vs) { return vs.some(function (v) { return t.indexOf(v) >= 0; }); }); };
}

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
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>The women’s fashion products editors agree on most.</h1><p>Reccas tracks what fashion editors, stylists, creators and testers recommend in women’s clothing, shoes and bags, matches every mention to an exact product, and shows where independent sources agree. Every count links back to the receipts.</p><div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:24px'><a class='btn' href='" + FRANCHISE_PATH + "'>See Best of Fashion " + FRANCHISE_YEAR + "</a><a class='btn alt' href='/methodology'>How we count</a></div>" + statRow(corpus.stats) + "</section>"
      + "<section class='section'><div class='eyebrow'>Most recommended right now</div><h2>Where independent sources agree</h2><p class='muted'>Products recommended by at least " + AWARD_MIN_SOURCES + " independent sources across everything Reccas tracks. A brand’s own page never counts.</p><div class='rankList'>" + rows + "</div><p style='margin-top:20px'><a class='btn alt' href='/most-recommended'>See the full ranking</a></p></section>"
      + (await trendingHomeSection(env))
      + "<section class='section'><div class='eyebrow'>Browse Best of Fashion</div><h2>" + a.won.length + " winners across " + corpus.stats.guides + " categories</h2><div class='categoryGrid'>" + categoryCards(corpus) + "</div><div class='guideGrid' style='margin-top:22px'>" + tiles + "</div><p style='margin-top:20px'><a class='btn alt' href='" + FRANCHISE_PATH + "'>See all " + corpus.stats.guides + " categories</a></p></section>"
      + "<section class='section'><div class='eyebrow'>How Reccas works</div><h2>Consensus, not a judging panel.</h2><div class='grid'><div class='card'><h3>Track the recommendations</h3><p>We record named product recommendations from fashion publications, editors, stylists, creators and testers, with a link to each one.</p></div><div class='card'><h3>Match the exact product</h3><p>The same item gets described a dozen ways. Reccas resolves each mention to one product so repeated recommendations count together.</p></div><div class='card'><h3>Count independent agreement</h3><p>Products are ranked by how many independent sources recommend them. Brand and retailer pages are shown as references and never counted.</p></div></div><p style='margin-top:20px'><a class='plainLink' href='/methodology'>Read the full methodology →</a></p></section>"
      + signupBlock("/") + "</main>";
    return page("/", "Best of Fashion " + FRANCHISE_YEAR + ": Most Recommended Women’s Fashion", body, "Reccas tracks what fashion editors, stylists and testers recommend for women and ranks products by how many independent sources agree. Every source linked.", 200, null, {schema: [{"@type": "WebApplication", name: "Reccas", url: "https://reccas.com/", applicationCategory: "ShoppingApplication", operatingSystem: "Web", description: "Fashion recommendation consensus tracker."}]});
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
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas · " + FRANCHISE_YEAR + " edition</span><h1>Best of Fashion " + FRANCHISE_YEAR + "</h1><p>The women’s clothes, shoes and bags that independent fashion editors, stylists, creators and testers agree on most. A product wins its category only when at least " + AWARD_MIN_SOURCES + " independent sources recommend it. There is no judging panel and no paid placement.</p><div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:24px'><a class='btn' href='/most-recommended'>Full ranking</a><a class='btn alt' href='/methodology'>Methodology</a></div>" + statRow(corpus.stats) + "</section>"
      + "<section class='section'><div class='eyebrow'>" + FRANCHISE_YEAR + " winners</div><h2 style='margin-bottom:0'>" + a.won.length + " categories with a clear winner</h2></section>" + sections
      + (pending ? "<section class='section'><div class='eyebrow'>Not yet awarded</div><h2>Categories still gathering evidence</h2><p class='muted'>The current leader in each of these has fewer than " + AWARD_MIN_SOURCES + " independent sources, so no winner is named yet.</p><div class='tablewrap' style='padding:6px 14px;margin-top:16px'><table class='evidenceTable'><thead><tr><th>Category</th><th>Current leader</th><th>Evidence</th></tr></thead><tbody>" + pending + "</tbody></table></div></section>" : "")
      + "<section class='section'><div class='eyebrow'>All categories</div><h2>Every category we track</h2><p class='muted'>" + corpus.stats.guides + " category guides, ordered by how many independent sources back each one.</p><div class='categoryGrid'>" + categoryCards(corpus) + "</div>" + corpus.types.map(function (t) { return "<div class='typeGroup' id='" + esc(t.key) + "'><h3>" + esc(t.label) + "</h3><div class='guideGrid'>" + t.guides.map(guideTile).join("") + "</div></div>"; }).join("") + "</section>"
      + "<section class='editMethod'><span class='eyebrow'>How it works</span><h2>Counted, not judged.</h2><p>Best of Fashion is built from observed recommendations. Reccas counts each independent source once per product, ignores brand and retailer pages, and keeps every source link visible. <a class='plainLink' href='/methodology'>Read the methodology</a>.</p></section>"
      + signupBlock(FRANCHISE_PATH, "Get the " + FRANCHISE_YEAR + " changes as they happen.") + "</main>";
    return page(FRANCHISE_PATH, "Best of Fashion " + FRANCHISE_YEAR + ": Women’s Winners by Editor Consensus", body, "Best of Fashion " + FRANCHISE_YEAR + ": the women’s clothes, shoes and bags recommended by the most independent fashion editors and testers, with every source linked.", 200, null, {kind: "collection", breadcrumb: "Best of Fashion", schema: [listSchema]});
  }

  async function categoryPage(env, category) {
    const meta = CATEGORIES[category];
    if (!meta) return null;
    const corpus = await getCorpus(env), guides = corpus.guideList.filter(function (g) { return g.category === category; });
    const empty = !guides.length;
    const list = empty ? "<p class='muted'>Reccas has not published a " + esc(meta.label.toLowerCase()) + " guide yet. A category is published only once it has attributable recommendations to count.</p>" : "<div class='guideGrid'>" + guides.map(guideTile).join("") + "</div>";
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>Best women’s " + esc(meta.label.toLowerCase()) + "</h1><p>" + esc(meta.description) + " Guides are ordered by how many independent sources back them.</p></section><section class='section'><h2>" + plural(guides.length, "category guide") + "</h2>" + list + "</section></main>";
    return page("/recommendations/" + category, "Best Women’s " + meta.label + " " + FRANCHISE_YEAR + ", Ranked by Editor Consensus", body, "Best women’s " + meta.label.toLowerCase() + " of " + FRANCHISE_YEAR + ", ranked by how many independent fashion editors, stylists, creators and testers recommend each product.", 200, empty ? "noindex, follow" : null, {kind: "collection", breadcrumb: "Best " + meta.label});
  }

  async function mostRecommended(env) {
    const corpus = await getCorpus(env), ranked = corpus.productList.filter(function (p) { return p.independent.length >= INDEXABLE_PRODUCT_MIN_SOURCES; });
    let position = 0, lastCount = null;
    const rows = ranked.map(function (p, i) {
      if (p.independent.length !== lastCount) { position = i + 1; lastCount = p.independent.length; }
      return productRow(p, position, p.appearances.length > 1 ? "In " + p.appearances.length + " categories" : (p.appearances[0] ? p.appearances[0].title : ""));
    }).join("");
    const listSchema = {"@type": "ItemList", name: "Most recommended fashion products for women " + FRANCHISE_YEAR, itemListElement: ranked.slice(0, 50).map(function (p, i) { return {"@type": "ListItem", position: i + 1, name: p.brand + " " + p.name, url: "https://reccas.com/products/" + p.key}; })};
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>The most recommended fashion products for women</h1><p>Every women’s product Reccas tracks that at least " + INDEXABLE_PRODUCT_MIN_SOURCES + " independent sources recommend, ranked by the number of sources. Products with the same count share a position.</p>" + statRow(corpus.stats) + "</section><section class='section'><div class='rankList'>" + rows + "</div></section><section class='editMethod'><span class='eyebrow'>Reading this list</span><h2>A count of agreement, not a score.</h2><p>The number is how many different independent sources recommend the product across all Reccas categories. It says nothing about fit or taste, which is why each product page keeps the caveats. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    return page("/most-recommended", "Most Recommended Fashion Products for Women in " + FRANCHISE_YEAR, body, "The women’s fashion products recommended by the most independent editors, stylists and testers in " + FRANCHISE_YEAR + ", ranked by number of sources. Every source linked.", 200, null, {kind: "collection", breadcrumb: "Most recommended", schema: [listSchema]});
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

  function productDescription(prod) {
    const n = prod.independent.length, base = prod.brand + " " + prod.name + ": recommended by " + plural(n, "independent source");
    const withNames = n ? base + ", including " + prod.independent.slice(0, 2).join(" and ") + ". Every source linked." : base + ".";
    return withNames.length <= 160 ? withNames : base + ". Every source linked.";
  }

  async function productPage(env, key) {
    const corpus = await getCorpus(env), prod = corpus.products.get(key);
    if (!prod) return null;
    let pick = prod.pick;
    if (pick._static) { try { pick = await h.enrichStaticPick(env, pick); } catch (_) {} }
    const obs = await productObservations(env, key), checks = await mentionChecks(env, "product_key", key);
    const n = prod.independent.length, price = parsePrice(pick.price), priceText = pick.price == null || pick.price === "" ? "" : (typeof pick.price === "number" ? money(pick.price) : String(pick.price));
    const dest = pick.shopUrl || pick.canonicalUrl || null, tracked = dest ? "/_api/out?edit=" + encodeURIComponent(prod.guideSlug) + "&product=" + encodeURIComponent(prod.key) + "&to=" + encodeURIComponent(dest) : null;
    const shopAt = String(pick.shopLabel || pick.brand || "retailer").trim(), rel = pick._affiliate || pick.affiliate === true ? "sponsored noreferrer" : "noreferrer";
    const img = imageUrl(prod.image);
    function evidenceRows(list) {
      return list.map(function (ev) {
        const c = checks.get(mentionKey(key, ev)), verified = c && c.verified_on ? niceDate(c.verified_on) : "";
        const who = ev.independent ? "<a class='plainLink' href='/sources/" + esc(ev.sourceSlug) + "'>" + esc(ev.source) + "</a>" : esc(ev.source);
        return "<tr><td>" + who + (ev.author ? "<div class='rankMeta'>" + esc(ev.author) + "</div>" : "") + "</td><td>" + esc(ev.label) + (ev.disputed ? "<div class='rankMeta'>No longer listed in the source" + (ev.reviewedAt ? " as of " + esc(niceDate(ev.reviewedAt)) : "") + " · not counted</div>" : ev.blocked ? "<div class='rankMeta'>Publisher blocks automated checks · not counted</div>" : "") + "</td><td>" + esc(ev.date ? (ev.dateKind === "updated" ? "Updated " : "") + niceDate(ev.date) : "") + "</td><td>" + esc(verified) + "</td><td>" + (ev.url ? "<a class='plainLink' href='" + esc(ev.url) + "' target='_blank' rel='noreferrer'>Original ↗</a>" : "") + "</td></tr>";
      }).join("");
    }
    const indep = prod.evidence.filter(function (ev) { return ev.independent; }).sort(function (a, b) { return (counts(b) ? 1 : 0) - (counts(a) ? 1 : 0); }), refs = prod.evidence.filter(function (ev) { return !ev.independent; });
    const appearances = prod.appearances.map(function (a) { return "<a class='guidePill' href='/" + esc(a.slug) + "#pick-" + esc(a.rank) + "'>#" + esc(a.rank) + " in " + esc(a.title) + " <span>→</span></a>"; }).join("");
    const priceHistory = obs.prices.length > 1 ? "<section class='section'><h2>Price history</h2><p class='muted'>Live catalog prices Reccas has recorded since " + esc(obs.prices[obs.prices.length - 1].observed_on) + ".</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Date</th><th>Price</th><th>Retailer</th></tr></thead><tbody>" + obs.prices.map(function (p) { return "<tr><td>" + esc(p.observed_on) + "</td><td>" + esc(money(p.price)) + "</td><td>" + esc(p.merchant || "") + "</td></tr>"; }).join("") + "</tbody></table></div></section>" : "";
    const watch = {watchKey: pick.sourceProductId ? "channel3:" + String(pick.sourceProductId) : "name:" + String(prod.brand || "") + "|" + String(prod.name || ""), brand: prod.brand, name: prod.name, productUrl: dest || "", guideSlug: prod.guideSlug, price: price};
    const alertBlock = "<div class='signup' style='margin-top:22px;padding:20px'><strong>Get an email if this goes on sale</strong><form class='js-alert' style='margin-top:10px'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn alt' type='submit'>Watch price</button></form><div class='signupMsg js-alert-msg' role='status'>No account needed.</div></div><script>(function(){var f=document.querySelector('.js-alert'),m=document.querySelector('.js-alert-msg'),w=" + JSON.stringify(watch).replace(/</g, "\\u003c") + ";if(!f)return;f.addEventListener('submit',async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(f).entries());m.textContent='Saving…';try{var r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'price_alert',page:location.pathname,watch:w})}),j={};try{j=await r.json()}catch(_){}if(!r.ok){m.textContent=j.error||'Could not save that. Please try again.';return}f.reset();m.textContent='Saved. You are on the sale-alert list for this product.'}catch(_){m.textContent='Could not save that. Please try again.'}})})();</script>";
    const consensusLine = n >= 1 ? "Recommended by " + plural(n, "independent source") + (prod.appearances.length > 1 ? " across " + prod.appearances.length + " categories" : "") : "No independent recommendations recorded yet";
    const body = "<main class='wrap'><section class='hero'><div class='productHero'><img src='" + esc(img) + "' alt='" + esc(prod.brand + " " + prod.name) + "'><div><span class='eyebrow'>" + esc(prod.brand) + "</span><h1 style='font-size:clamp(34px,5vw,54px)'>" + esc(prod.name) + "</h1><p><strong>" + esc(consensusLine) + ".</strong> " + esc([prod.summary, prod.fitNote].filter(Boolean).join(" ")) + "</p><div class='guideRoundups' style='margin-top:14px'>" + appearances + "</div><div class='editActions' style='margin-top:22px'>" + (tracked ? "<a class='btn' href='" + tracked + "' target='_blank' rel='" + rel + "'>Shop at " + esc(shopAt) + (priceText ? " · " + esc(priceText) : "") + "</a>" : "") + "</div>" + alertBlock + "</div></div></section>"
      + "<section class='section'><h2>Who recommends it</h2><p class='muted'>" + (n ? plural(n, "independent source") + ". Each row links to the original recommendation." : "Reccas has not recorded an independent recommendation for this product.") + " “Last verified” is the most recent date Reccas re-read the source and found the product still recommended there.</p>" + (indep.length ? "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Source</th><th>How they described it</th><th>Source dated</th><th>Last verified</th><th>Receipt</th></tr></thead><tbody>" + evidenceRows(indep) + "</tbody></table></div>" : "") + "</section>"
      + (refs.length ? "<section class='section'><h2>Brand and retailer references</h2><p class='muted'>Used to confirm product details. These are not counted as recommendations.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Page</th><th>What it confirms</th><th>Source dated</th><th>Last verified</th><th>Link</th></tr></thead><tbody>" + evidenceRows(refs) + "</tbody></table></div></section>" : "")
      + priceHistory
      + "<section class='editMethod'><span class='eyebrow'>How this is counted</span><h2>One source, one count.</h2><p>A source is counted once for this product however many of its articles mention it. Reccas may earn a commission from some shopping links, which has no effect on the count. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    const productSchema = {"@type": "Product", name: prod.brand + " " + prod.name, brand: {"@type": "Brand", name: prod.brand}, image: ["https://reccas.com" + img], description: prod.summary || (prod.brand + " " + prod.name)};
    if (price != null && dest) productSchema.offers = {"@type": "Offer", price: String(price), priceCurrency: "USD", url: dest};
    return page("/products/" + key, prod.brand + " " + prod.name + ": Who Recommends It", body, productDescription(prod), 200, n >= INDEXABLE_PRODUCT_MIN_SOURCES ? null : "noindex, follow", {kind: "article", headline: prod.brand + " " + prod.name, image: "https://reccas.com" + img, breadcrumb: prod.brand + " " + prod.name, modified: today(), schema: [productSchema]});
  }

  async function methodology(env) {
    const corpus = await getCorpus(env), s = corpus.stats, a = awards(corpus);
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Methodology</span><h1>How Best of Fashion is counted</h1><p>Best of Fashion is a count of who recommends what. This page sets out exactly what is counted, what is not, and where the data is still thin.</p></section><section class='section prose'>"
      + "<h2>What Reccas tracks</h2><p>Reccas currently covers women’s clothing, shoes and bags. It records named product recommendations from fashion publications, editors, stylists, creators and product testers. Today the dataset holds " + s.mentions + " independent recommendations of " + s.products + " products from " + s.sources + " sources across " + s.guides + " categories. The full list of sources is on the <a href='/sources'>sources page</a>.</p>"
      + "<h2>What counts as a recommendation</h2><ul><li>It names a specific product, not a brand or a style.</li><li>It is attributable to a publication or a named person, and Reccas links to it.</li><li>It is independent of the company that makes or sells the product.</li><li>The product can be matched to an exact item that is still sold.</li></ul>"
      + "<h2>What does not count</h2><ul><li>A brand’s own product page or marketing.</li><li>A retailer’s product listing.</li><li>Customer reviews on a brand or retailer site.</li></ul><p>These appear on product pages as references, because they confirm product details, but they are never added to a product’s count.</p>"
      + "<h2>How products are ranked</h2><p>Each product’s count is the number of different independent sources that recommend it. A source is counted once per product, even if several of its articles mention it. Within a category, products are ordered by that count; when two products tie, the order is editorial. Commission rates and affiliate availability play no part in the order.</p>"
      + "<h2>How a product gets onto a list</h2><p>Reccas reads the guides that established publications publish for each category. A product is added to a category automatically once " + PROMOTE_MIN_SOURCES + " independent sources name it there. A product named by only one or two sources is recorded but not shown. In a price-capped category, a product is added only if an article states a price within the cap.</p><h2>How a category gets a winner</h2><p>A category has a Best of Fashion " + FRANCHISE_YEAR + " winner only when its leading product is recommended by at least " + AWARD_MIN_SOURCES + " independent sources. Right now " + a.won.length + " of " + s.guides + " categories meet that bar. The other " + a.pending.length + " are listed as not yet awarded on the <a href='" + FRANCHISE_PATH + "'>Best of Fashion page</a>.</p>"
      + "<h2>Shopping checks and money</h2><p>Reccas checks that each product is still sold and shows a current price where one is available. Some shopping links are affiliate links and Reccas may earn a commission. Where no affiliate link exists, the link goes straight to the product. Nobody can pay to be included or ranked.</p>"
      + "<h2>How recommendations are kept fresh</h2><p>Every week Reccas re-reads each source article and checks that it still names the product. Each guide shows the date its sources were last verified and how many were confirmed; each product page shows the date per source. Prices are checked daily where a live price is available. </p><ul><li>If the product is found, the recommendation counts.</li><li>If it is not found, the article is read a second time by an AI model. If that read finds the product under a slightly different name, the recommendation keeps counting. If it finds a different model or nothing, the recommendation stops counting that day and is shown as no longer listed, with the date.</li><li>A publisher that blocks automated readers cannot be re-checked, so its recommendations are shown but not counted.</li><li>A recommendation that stops counting is never deleted. The record of when it stopped is kept.</li><li>A category loses its winner automatically if its leader falls below " + AWARD_MIN_SOURCES + " counted sources.</li></ul><h2>Known limits</h2><ul><li>The dataset is small. Counts of three or four sources reflect agreement among the sources Reccas has recorded, not the whole fashion press.</li><li>Reccas began logging recommendations on " + TRACKING_STARTED + ", so trends over time are not reported yet.</li><li>Several large publishers block automated readers, so their recommendations are not counted. That makes the counts conservative.</li><li>Most recommendations do not yet carry the name of the individual writer or the date the source published it.</li><li>Agreement is not the same as fit. A widely recommended product can still be wrong for you, which is why each product keeps its fit notes and caveats.</li></ul>"
      + "<h2>Corrections</h2><p>If a recommendation is misattributed, a link is broken or a product is matched wrongly, email <a href='mailto:hello@reccas.com'>hello@reccas.com</a> and it will be fixed.</p></section></main>";
    return page("/methodology", "Methodology: How Best of Fashion Is Counted", body, "How Reccas counts fashion recommendations: what qualifies as an independent source, why brand pages are excluded, how products are ranked and where the data is thin.", 200, null, {kind: "article", headline: "How Best of Fashion is counted", breadcrumb: "Methodology", modified: today()});
  }

  async function guidePage(env, slug) {
    const guide = await getGuide(env, slug);
    if (!guide) return null;
    const picks = [];
    for (const p of guide.picks) picks.push(p._static ? await h.enrichStaticPick(env, p) : p);
    const total = guide.independentSources.length, checks = await mentionChecks(env, "guide_slug", slug);
    // Sources that block automated readers are left out of the ratio rather than counted as failures.
    let lastVerified = "", confirmed = 0, checkable = 0;
    guide.picks.forEach(function (p) { p.evidence.forEach(function (ev) { if (!counts(ev)) return; const c = checks.get(mentionKey(p.key, ev)); if (!c || c.status === "blocked") return; checkable++; if (c.status === "verified" && c.verified_on) { confirmed++; if (c.verified_on > lastVerified) lastVerified = c.verified_on; } }); });
    const cards = picks.map(function (x) {
      const evidence = x.evidence || [], dest = x.shopUrl || x.canonicalUrl || (evidence[0] && evidence[0].url) || null, track = dest ? "/_api/out?edit=" + encodeURIComponent(slug) + "&product=" + encodeURIComponent(x.key) + "&to=" + encodeURIComponent(dest) : "#";
      const ev = evidence.map(function (z) { return "<a class='editSource" + (counts(z) ? "" : " isReference") + "' href='" + esc(z.url) + "' target='_blank' rel='noreferrer'><strong>" + esc(z.source) + "</strong> · " + esc(z.disputed ? "No longer listed, not counted" : z.blocked ? "Can’t be re-checked, not counted" : (z.independent ? z.label : "Brand or retailer page")) + " ↗</a>"; }).join("");
      const img = imageUrl({slug: slug, rank: x.rank});
      const visual = "<img src='" + esc(img) + "' alt='" + esc(x.brand + " " + x.name) + "' loading='" + (x.rank === 1 ? "eager" : "lazy") + "'>";
      const watchKey = x.sourceProductId ? "channel3:" + String(x.sourceProductId) : (x.productId ? "product:" + String(x.productId) : (x.canonicalUrl ? "url:" + String(x.canonicalUrl) : "name:" + String(x.brand || "") + "|" + String(x.name || "")));
      const watchPayload = encodeURIComponent(JSON.stringify({watchKey: watchKey, source: x._channel3 ? "channel3" : "reccas", sourceProductId: x.sourceProductId || null, productId: x.productId || null, brand: x.brand || "", name: x.name || "", productUrl: dest || x.canonicalUrl || "", imageUrl: img || "", guideSlug: slug, price: x.price == null ? null : parsePrice(x.price), currency: "USD"}));
      const watchButton = "<div class='watchControl'><button class='watchBtn js-price-watch' type='button' aria-label='Get alert when " + esc(x.brand + " " + x.name) + " goes on sale' aria-pressed='false' title='Get alert when it goes on sale' data-watch='" + watchPayload + "'><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'></path></svg></button><button class='watchLabel js-price-watch' type='button' data-watch='" + watchPayload + "'>Get alert when it goes on sale</button></div>";
      const price = x.price == null || x.price === "" ? "" : (typeof x.price === "number" ? money(x.price) : String(x.price));
      const shopAt = String(x.shopLabel || x.brand || "retailer").trim(), action = dest ? "Shop at " + esc(shopAt) + (price ? " · " + esc(price) : "") : "View source";
      const commerceNote = x._catalog && !x._affiliate ? "<span class='muted' style='font-size:12px'>No affiliate link available; this goes directly to the product.</span>" : "";
      const rel = x._affiliate || x.affiliate === true ? "sponsored noreferrer" : "noreferrer";
      const description = [x.summary, x.fitNote].filter(Boolean).join(" ");
      const n = x.independent.length;
      const consensus = "<div class='editConsensus'><strong>" + (n ? "Recommended by " + n + " of the " + total + " independent sources in this guide" : "No independent recommendation recorded yet") + "</strong>" + (n ? "<div class='editConsensusSources'>" + namesLine(x.independent, 5) + "</div>" : "") + "</div>";
      return "<article class='editPick' id='pick-" + esc(x.rank) + "'><div class='editVisual'><span class='editRank'>#" + esc(x.rank) + "</span>" + visual + "</div><div class='editCopy'>" + watchButton + "<div class='editTop'><div><p class='editBrand'>" + esc(x.brand) + "</p><h2><a href='/products/" + esc(x.key) + "'>" + esc(x.name) + "</a></h2></div></div>" + consensus + "<p class='editSummary'>" + esc(description || "") + "</p><div class='editSources'>" + ev + "</div><div class='editActions'>" + (dest ? "<a class='btn' href='" + track + "' target='_blank' rel='" + rel + "'>" + action + "</a>" : "") + "<a class='plainLink' style='font-size:13px' href='/products/" + esc(x.key) + "'>All recommendations for this product</a>" + commerceNote + "</div></div></article>";
    }).join("");
    const lead = picks[0], awarded = lead && lead.independent.length >= AWARD_MIN_SOURCES;
    const metrics = "<div class='editMetrics'><span><strong>" + esc(picks.length) + "</strong> ranked picks</span><span><strong>" + esc(total) + "</strong> independent sources</span>" + (lastVerified ? "<span><strong>" + esc(niceDate(lastVerified)) + "</strong> sources last verified · " + confirmed + " of " + checkable + " readable sources confirmed</span>" : "<span><strong>" + esc(guide.checkedLabel) + "</strong> last checked</span>") + "</div>";
    const intro = "<section class='editIntro'><div><span class='eyebrow'>" + (awarded ? "Best of Fashion " + FRANCHISE_YEAR + " winner" : "Not yet awarded") + "</span><h2>" + (awarded ? esc(lead.brand + " " + lead.name) : "Still gathering evidence.") + "</h2></div><p>" + (awarded ? esc(lead.brand + " " + lead.name) + " leads this category with " + lead.independent.length + " independent sources. " : "No product here has reached the " + AWARD_MIN_SOURCES + " independent sources needed to win the category. ") + "Picks are ranked by how many independent sources recommend them, and a product joins this list automatically once " + PROMOTE_MIN_SOURCES + " independent sources name it. Sources shown with a dashed outline are not counted: brand and retailer pages, sources that no longer list the product, and publishers whose pages cannot be re-checked. <a class='plainLink' href='/methodology'>How we count</a>.</p></section>";
    const method = "<section class='editMethod'><span class='eyebrow'>How Reccas built this guide</span><h2>What counts as a recommendation?</h2><p>" + esc(guide.freshnessCopy || "The product must still satisfy the stated category, price, or use-case constraint when Reccas checks it.") + " Reccas may earn a commission from some shopping links; that does not affect the ranking.</p></section>";
    const socialImage = lead ? "https://reccas.com" + imageUrl({slug: slug, rank: lead.rank}) : null;
    const listSchema = {"@type": "ItemList", name: guide.title, itemListElement: picks.map(function (x, i) { return {"@type": "ListItem", position: i + 1, name: String(x.brand + " " + x.name), url: "https://reccas.com/products/" + x.key}; })};
    const watchUi = "<div class='watchModalOverlay js-watch-modal' aria-hidden='true'><div class='watchModal' role='dialog' aria-modal='true' aria-labelledby='watchTitle'><button class='watchModalClose js-watch-close' type='button' aria-label='Close'>×</button><span class='eyebrow'>Sale alert</span><h2 id='watchTitle'>Get an email if it goes on sale</h2><p class='muted'>Enter your email to watch the price of <strong class='js-watch-name'>this item</strong>. No account needed.</p><div class='watchModalActions'><form class='stack js-watch-email-form'><input class='hp' type='text' name='website' tabindex='-1' autocomplete='off' aria-hidden='true'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email address' aria-label='Email address'><button class='btn' type='submit'>Watch price</button><div class='muted js-watch-email-msg' style='font-size:12px' role='status'></div></form><a class='btn alt js-watch-google' href='#'>Or continue with Google</a></div><p class='muted' style='margin:14px 0 0;font-size:12px'>Already have an account? <a class='js-watch-login' href='#'><strong>Log in</strong></a></p></div></div><div class='watchToast js-watch-toast'>Price tracked</div>";
    const watchScript = "<script>(function(){var slug=" + JSON.stringify(slug) + ",buttons=Array.from(document.querySelectorAll('.js-price-watch')),modal=document.querySelector('.js-watch-modal'),close=document.querySelector('.js-watch-close'),nameEl=document.querySelector('.js-watch-name'),google=document.querySelector('.js-watch-google'),emailForm=document.querySelector('.js-watch-email-form'),emailMsg=document.querySelector('.js-watch-email-msg'),login=document.querySelector('.js-watch-login'),toast=document.querySelector('.js-watch-toast'),authed=false,watched=new Set(),pending=null;function emailKeys(){try{return JSON.parse(localStorage.getItem('reccas_email_watches')||'[]')}catch(_){return[]}}function rememberEmailKey(k){try{var a=emailKeys();if(a.indexOf(k)<0){a.push(k);localStorage.setItem('reccas_email_watches',JSON.stringify(a.slice(-200)))}}catch(_){}}function payload(btn){try{return JSON.parse(decodeURIComponent(btn.dataset.watch||''))}catch(_){return null}}function setState(btn,on){if(btn.classList.contains('watchBtn')){btn.classList.toggle('active',!!on);btn.setAttribute('aria-pressed',on?'true':'false');btn.title=on?'Watching for a sale':'Get alert when it goes on sale'}else if(btn.classList.contains('watchLabel')){btn.textContent=on?'Sale alert on':'Get alert when it goes on sale'}}function mark(key,on){buttons.forEach(function(b){var q=payload(b);if(q&&q.watchKey===key)setState(b,on)})}function flash(t){toast.textContent=t||'Price tracked';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},1800)}function currentReturn(){return location.pathname+location.search}function openModal(p){pending=p;try{localStorage.setItem('reccas_pending_watch',JSON.stringify(p))}catch(_){}nameEl.textContent=[p.brand,p.name].filter(Boolean).join(' ')||'this item';var rt=encodeURIComponent(currentReturn());google.href='/_api/auth/google_authorize?returnTo='+rt;login.href='/login?returnTo='+rt;if(emailMsg)emailMsg.textContent='';modal.classList.add('open');modal.setAttribute('aria-hidden','false');var input=emailForm&&emailForm.querySelector('input[name=email]');if(input)input.focus()}function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}async function save(p,on){var r=await fetch('/_api/price-watch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({},p,{action:on?'watch':'remove'}))});if(r.status===401){authed=false;openModal(p);return false}if(!r.ok)return false;if(on)watched.add(p.watchKey);else watched.delete(p.watchKey);mark(p.watchKey,on);flash(on?'Price tracked':'Price watch removed');return true}async function init(){emailKeys().forEach(function(k){watched.add(k);mark(k,true)});var r=await fetch('/_api/auth/session',{headers:{accept:'application/json'}});authed=r.ok;if(!authed)return;try{var wr=await fetch('/_api/price-watch?slug='+encodeURIComponent(slug));if(wr.ok){var d=await wr.json();(d.watches||[]).forEach(function(w){watched.add(w.watch_key)})}}catch(_){}buttons.forEach(function(b){var p=payload(b);if(p)setState(b,watched.has(p.watchKey))});try{var raw=localStorage.getItem('reccas_pending_watch');if(raw){var p=JSON.parse(raw);if(p&&p.guideSlug===slug){localStorage.removeItem('reccas_pending_watch');await save(p,true);closeModal()}}}catch(_){}}buttons.forEach(function(btn){btn.addEventListener('click',async function(e){e.preventDefault();e.stopPropagation();var p=payload(btn);if(!p)return;if(!authed){if(watched.has(p.watchKey)){flash('Sale alert already on');return}openModal(p);return}await save(p,!watched.has(p.watchKey))})});if(emailForm)emailForm.addEventListener('submit',async function(e){e.preventDefault();if(!pending)return;if(emailMsg)emailMsg.textContent='Saving…';var o=Object.fromEntries(new FormData(emailForm).entries()),j={},r;try{r=await fetch('/_api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:o.email,website:o.website,kind:'price_alert',page:location.pathname,watch:pending})});try{j=await r.json()}catch(_){}}catch(_){r=null}if(!r||!r.ok){if(emailMsg)emailMsg.textContent=j.error||'Could not save that. Please try again.';return}try{localStorage.removeItem('reccas_pending_watch')}catch(_){}rememberEmailKey(pending.watchKey);watched.add(pending.watchKey);mark(pending.watchKey,true);closeModal();flash('Sale alert on')});if(close)close.onclick=closeModal;if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});init()})();</script>";
    return page("/" + slug, guide.seoTitle, "<main class='wrap'><section class='hero editHero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + " · " + esc(CATEGORIES[guide.category].label) + "</span><h1>" + esc(guide.title) + "</h1><p>" + esc(guide.deck || guide.description) + "</p>" + metrics + "</section>" + intro + "<section class='editList'>" + cards + "</section>" + method + "</main>" + watchUi + watchScript, guide.description || guide.deck || guide.title, 200, null, {kind: "article", headline: guide.title, image: socialImage, breadcrumb: guide.title, schema: [listSchema]});
  }

  async function search(env, rawQuery, ctx) {
    const q = String(rawQuery || "").trim().slice(0, 80), tokens = slugify(q).split("-").filter(Boolean), corpus = await getCorpus(env);
    const hit = queryMatcher(q);
    let products = [], guides = [], sources = [];
    if (tokens.length) {
      products = corpus.productList.filter(function (p) { return hit(p.brand + " " + p.name + " " + p.appearances.map(function (a) { return a.title; }).join(" ")); }).slice(0, 24);
      guides = corpus.guideList.filter(function (g) { return hit(g.title + " " + g.slug); }).slice(0, 12);
      sources = corpus.sourceList.filter(function (s) { return hit(s.name); }).slice(0, 12);
      if (ctx) ctx.waitUntil((async function () { try { await env.DB.prepare("CREATE TABLE IF NOT EXISTS search_queries (id INTEGER PRIMARY KEY AUTOINCREMENT,q TEXT NOT NULL,products INTEGER,guides INTEGER,sources INTEGER,created_at TEXT NOT NULL)").run(); await env.DB.prepare("INSERT INTO search_queries (q,products,guides,sources,created_at) VALUES (?,?,?,?,?)").bind(q.toLowerCase(), products.length, guides.length, sources.length, new Date().toISOString()).run(); } catch (_) {} })());
    }
    const none = tokens.length && !products.length && !guides.length && !sources.length;
    const form = "<form class='searchForm' action='/search' method='get' role='search'><input class='field' type='search' name='q' value='" + esc(q) + "' placeholder='A product, brand or publication' aria-label='Search' maxlength='80'><button class='btn' type='submit'>Search</button></form>";
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Search</span><h1>" + (tokens.length ? "Results for “" + esc(q) + "”" : "Search Reccas") + "</h1><p>Search the " + corpus.stats.products + " products, " + corpus.stats.guides + " categories and " + corpus.stats.sources + " sources Reccas tracks.</p>" + form + "</section>"
      + (none ? "<section class='section'><p class='muted'>Nothing Reccas tracks matches that yet. Try a brand or a product type, or browse <a class='plainLink' href='/recommendations'>Best of Fashion</a>.</p></section>" : "")
      + (products.length ? "<section class='section'><h2>" + plural(products.length, "product") + "</h2><div class='rankList'>" + products.map(function (p) { return productRow(p, "·", p.appearances[0] ? p.appearances[0].title : ""); }).join("") + "</div></section>" : "")
      + (guides.length ? "<section class='section'><h2>" + plural(guides.length, "category", "categories") + "</h2><div class='guideGrid'>" + guides.map(guideTile).join("") + "</div></section>" : "")
      + (sources.length ? "<section class='section'><h2>" + plural(sources.length, "source") + "</h2><div class='guideRoundups'>" + sources.map(function (s) { return "<a class='guidePill' href='/sources/" + esc(s.slug) + "'>" + esc(s.name) + " · " + plural(s.productKeys.length, "product") + " <span>→</span></a>"; }).join("") + "</div></section>" : "")
      + (!tokens.length ? "<section class='section'><div class='eyebrow'>Popular</div><div class='rankList'>" + corpus.productList.slice(0, 6).map(function (p, i) { return productRow(p, i + 1); }).join("") + "</div></section>" : "") + "</main>";
    return page("/search", tokens.length ? "Search: " + q : "Search Reccas", body, "Search the fashion products, categories and sources Reccas tracks.", 200, "noindex, follow");
  }

  async function alerts(env) {
    const corpus = await getCorpus(env);
    let onSale = [], since = "";
    try {
      const rows = (await env.DB.prepare("SELECT product_key,observed_on,price FROM price_observations ORDER BY observed_on ASC").all()).results || [], first = new Map(), last = new Map();
      rows.forEach(function (r) { if (!first.has(r.product_key)) first.set(r.product_key, r); last.set(r.product_key, r); if (!since) since = r.observed_on; });
      last.forEach(function (now, key) { const base = first.get(key), prod = corpus.products.get(key); if (prod && base && Number(base.price) > 0 && Number(now.price) <= Number(base.price) * 0.9) onSale.push({prod: prod, now: Number(now.price), base: Number(base.price)}); });
      onSale.sort(function (a, b) { return a.now / a.base - b.now / b.base; });
    } catch (_) {}
    const tracked = corpus.productList.filter(function (p) { return p.pick._static; }).length;
    const saleRows = onSale.slice(0, 20).map(function (d) { return productRow(d.prod, "↓", money(d.now) + ", down " + Math.round((1 - d.now / d.base) * 100) + "% from " + money(d.base)); }).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Sale alerts</span><h1>Know when the most recommended pieces go on sale.</h1><p>Reccas checks live prices every day on the products fashion editors agree on. Join the list for a weekly note when one drops, or tap the heart on any product to watch that one.</p></section>"
      + signupBlock("/alerts", "Get sale alerts by email.", "At most one email a week, and only when a product recommended by two or more independent sources is at least 10% below the price Reccas first recorded. No account needed.")
      + "<section class='section'><div class='eyebrow'>On sale now</div><h2>" + (onSale.length ? plural(onSale.length, "tracked product") + " below its starting price" : "Nothing tracked is on sale today") + "</h2>" + (onSale.length ? "<div class='rankList'>" + saleRows + "</div>" : "<p class='muted'>" + (since ? "Reccas has recorded prices since " + esc(since) + " and none of the tracked products is 10% or more below its first recorded price." : "Daily price tracking has just started, so there is no price history to compare yet.") + " Live prices are currently checked on " + tracked + " of " + corpus.stats.products + " products.</p>") + "</section>"
      + "<section class='section'><div class='eyebrow'>How it works</div><div class='grid'><div class='card'><h3>Tap the heart</h3><p>On any guide or product page, tap the heart and leave your email. No account needed.</p></div><div class='card'><h3>Reccas checks daily</h3><p>Where a live price is available it is recorded every day, so a drop is measured against a real starting price.</p></div><div class='card'><h3>One clear email</h3><p>You hear when the product you are watching falls 5% or more. Every email has an unsubscribe link.</p></div></div></section>"
      + "<section class='section'><div class='eyebrow'>Start with these</div><h2>Most recommended products to watch</h2><div class='rankList'>" + corpus.productList.slice(0, 8).map(function (p, i) { return productRow(p, i + 1); }).join("") + "</div></section></main>";
    return page("/alerts", "Sale Alerts on the Most Recommended Fashion Products", body, "Get an email when the fashion products editors recommend most go on sale. Reccas checks live prices daily and measures drops against a recorded starting price.", 200, null, {kind: "collection", breadcrumb: "Sale alerts"});
  }

  function trendingRows(t) {
    return {
      gaining: t.gaining.slice(0, 8).map(function (g) { return productRow(g.prod, "↑", "Gained " + plural(g.to - g.from, "source") + " (" + g.from + " → " + g.to + ")"); }).join(""),
      clicked: t.clicked.slice(0, 8).map(function (g) { return productRow(g.prod, "↑", "Shopped " + g.to + " times this week, up from " + g.from); }).join(""),
      onSale: t.onSale.slice(0, 8).map(function (g) { return productRow(g.prod, "↓", money(g.to) + ", down " + Math.round((1 - g.to / g.from) * 100) + "% from " + money(g.from)); }).join("")
    };
  }
  async function trending(env) {
    const t = await trendingData(env, 7), rows = trendingRows(t), any = rows.gaining || rows.clicked || rows.onSale;
    const section = function (eyebrow, title, html, empty) { return "<section class='section'><div class='eyebrow'>" + eyebrow + "</div><h2>" + title + "</h2>" + (html ? "<div class='rankList'>" + html + "</div>" : "<p class='muted'>" + empty + "</p>") + "</section>"; };
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>What’s moving</span><h1>Trending in women’s fashion recommendations</h1><p>" + (t.since ? "Changes between " + esc(niceDate(t.since)) + " and " + esc(niceDate(t.latest)) + ", from Reccas’s daily record of who recommends what." : "Reccas records every product’s sources, price and shopper interest once a day. Trends appear here once there are two days to compare.") + "</p></section>"
      + section("Gaining support", "More independent sources than a week ago", rows.gaining, "No product has gained a source in this period.")
      + section("On sale", "Dropped 10% or more", rows.onSale, "No tracked product has dropped 10% or more in this period.")
      + section("Most shopped", "Rising shopper interest", rows.clicked, "Not enough shopping activity to compare yet.")
      + "</main>";
    return page("/trending", "Trending Fashion Recommendations This Week", body, "The women’s fashion products gaining independent recommendations, dropping in price or rising in shopper interest this week.", 200, any && h.trendingOn && h.trendingOn(env) ? null : "noindex, follow", {kind: "collection", breadcrumb: "Trending"});
  }
  async function trendingHomeSection(env) {
    if (!(h.trendingOn && h.trendingOn(env))) return "";
    const t = await trendingData(env, 7), rows = trendingRows(t);
    if (t.gaining.length + t.onSale.length < 4) return "";
    return "<section class='section'><div class='eyebrow'>What’s moving</div><h2>Trending this week</h2><div class='rankList'>" + t.gaining.slice(0, 4).map(function (g) { return productRow(g.prod, "↑", "Gained " + plural(g.to - g.from, "source")); }).join("") + t.onSale.slice(0, 2).map(function (g) { return productRow(g.prod, "↓", money(g.to) + ", down " + Math.round((1 - g.to / g.from) * 100) + "%"); }).join("") + "</div><p style='margin-top:20px'><a class='btn alt' href='/trending'>See everything that moved</a></p></section>";
  }

  async function brandsPage(env) {
    const corpus = await getCorpus(env), top = corpus.brandList.filter(function (b) { return b.sources.length >= BRAND_MIN_SOURCES; });
    const row = function (b, n, names) { return "<tr><td><strong>" + esc(b.name) + "</strong></td><td>" + n + "</td><td class='rankMeta'>" + namesLine(names, 6) + "</td></tr>"; };
    const typeSections = corpus.types.filter(function (t) { return t.key !== "more"; }).map(function (t) {
      const list = corpus.brandList.filter(function (b) { return (b.byType[t.key] || []).length >= 2; }).sort(function (a, b) { return b.byType[t.key].length - a.byType[t.key].length || a.name.localeCompare(b.name); }).slice(0, 8);
      if (list.length < 3) return "";
      return "<div class='typeGroup' id='" + esc(t.key) + "'><h3>" + esc(t.label) + "</h3><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Independent sources</th><th>Who</th></tr></thead><tbody>" + list.map(function (b) { return row(b, b.byType[t.key].length, b.byType[t.key]); }).join("") + "</tbody></table></div></div>";
    }).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Best of Fashion " + FRANCHISE_YEAR + "</span><h1>The most recommended women’s fashion brands</h1><p>Brands ranked by how many different independent sources recommend at least one of their products, across every article Reccas has read. A brand’s own pages and retailer listings are never counted.</p></section><section class='section'><h2>Overall</h2><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Independent sources</th><th>Who</th></tr></thead><tbody>" + top.slice(0, 40).map(function (b) { return row(b, b.sources.length, b.sources); }).join("") + "</tbody></table></div></section><section class='section'><h2>By product type</h2><p class='muted'>Counts here include only sources recommending the brand within that product type.</p>" + typeSections + "</section><section class='editMethod'><span class='eyebrow'>Reading this list</span><h2>Breadth of agreement, not a quality score.</h2><p>A high count means many independent publications each recommend something from the brand. It does not mean every product from the brand is recommended. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    return page("/brands", "Most Recommended Women’s Fashion Brands of " + FRANCHISE_YEAR, body, "The women’s fashion brands recommended by the most independent editors and testers in " + FRANCHISE_YEAR + ", overall and by product type, with the sources named.", 200, top.length >= 10 ? null : "noindex, follow", {kind: "collection", breadcrumb: "Most recommended brands"});
  }

  async function sitemapEntries(env) {
    const corpus = await getCorpus(env), day = today(), out = [];
    ["/", FRANCHISE_PATH, "/most-recommended", "/brands", "/alerts", "/sources", "/methodology", "/about", "/press", "/developers", "/privacy"].forEach(function (p) { out.push({p: p, last: day}); });
    Object.keys(CATEGORIES).forEach(function (k) { if (corpus.categoryCounts[k] > 0) out.push({p: "/recommendations/" + k, last: day}); });
    corpus.guideList.forEach(function (g) { out.push({p: "/" + g.slug, last: day}); });
    corpus.productList.forEach(function (p) { if (p.independent.length >= INDEXABLE_PRODUCT_MIN_SOURCES) out.push({p: "/products/" + p.key, last: day}); });
    corpus.sourceList.forEach(function (s) { if (s.productKeys.length >= INDEXABLE_SOURCE_MIN_PRODUCTS) out.push({p: "/sources/" + s.slug, last: day}); });
    return out;
  }

  return {home: home, recommendations: recommendations, categoryPage: categoryPage, mostRecommended: mostRecommended, sourcesIndex: sourcesIndex, sourcePage: sourcePage, productPage: productPage, methodology: methodology, guidePage: guidePage, search: search, alerts: alerts, trending: trending, brandsPage: brandsPage, sitemapEntries: sitemapEntries};
}
