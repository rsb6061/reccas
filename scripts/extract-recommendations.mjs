// Reads the articles Reccas already cites and records every product each one recommends.
// Results are applied by rule, not by hand:
//   - a product is kept only if its brand and name are found in the article text (guards against invention);
//   - if Reccas already tracks the product, the article becomes a source for it;
//   - a product Reccas does not track is stored and stays off the site.
// Blocked publishers are skipped. Each article is read at most once every 30 days.
import {fetchPage, mentions, visibleText} from "./verify-sources.mjs";

const SITE = process.env.RECCAS_SITE || "https://reccas.com";
const KEY = process.env.VERIFY_KEY;
const LIMIT = Number(process.env.LIMIT || 5);
const REFRESH_DAYS = 30;
const STOP = new Set(["the", "for", "women", "womens", "and", "with", "in", "of"]);

function slugify(v) {
  return String(v || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/\+/g, " plus ").replace(/['’.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const compact = (v) => slugify(v).replace(/-/g, "");
const tokens = (v) => slugify(v).split("-").filter((t) => t.length > 1 && !STOP.has(t));

// Same product only when the brand matches and one name's distinctive words all appear in the other.
// "Clean Cut T-Shirt" matches "Clean Cut Regular T-Shirt"; "Lianna Super Bit Weejuns" does not match "Whitney Superlug Weejuns".
export function matchProduct(brand, name, known) {
  const key = slugify(brand + " " + name), b = compact(brand), want = tokens(name);
  const exact = known.find((p) => p.key === key);
  if (exact) return exact.key;
  if (want.length < 2) return null;
  const hits = known.filter((p) => {
    if (compact(p.brand) !== b) return false;
    const have = tokens(p.name), small = want.length <= have.length ? want : have, big = want.length <= have.length ? have : want;
    return small.length >= 2 && small.every((t) => big.includes(t));
  });
  return hits.length === 1 ? hits[0].key : null;
}

function articleText(html) {
  const cleaned = String(html).replace(/<(script|style|svg|noscript|nav|footer|header|form|aside)[\s\S]*?<\/\1>/gi, " ");
  return visibleText(cleaned).replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 48000);
}
// A freshly rotated key can take a moment to reach every location, so an unauthorised answer is retried.
async function api(path, options) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(SITE + path, Object.assign({}, options, {headers: Object.assign({"x-verify-key": KEY, "content-type": "application/json"}, options && options.headers)}));
    let body = {};
    try { body = await r.json(); } catch (_) {}
    if (r.status !== 401 || attempt >= 6) return {ok: r.ok, status: r.status, body};
    await new Promise((done) => setTimeout(done, 8000));
  }
}
async function waitForKey() {
  for (let attempt = 1; attempt <= 8; attempt++) {
    const r = await api("/_api/admin/extraction-status", {method: "GET"});
    if (r.ok) return r.body.runs || [];
    await new Promise((done) => setTimeout(done, 10000));
  }
  throw new Error("The Worker did not accept the key");
}

async function main() {
  if (!KEY) throw new Error("VERIFY_KEY is not set");
  const feed = await (await fetch(SITE + "/_api/mentions.json")).json(), known = feed.products, byUrl = new Map();
  for (const m of feed.mentions) {
    if (!m.url || !m.independent) continue;
    if (!byUrl.has(m.url)) byUrl.set(m.url, []);
    byUrl.get(m.url).push(m);
  }
  const runs = await waitForKey(), cutoff = new Date(Date.now() - REFRESH_DAYS * 86400000).toISOString().slice(0, 10);
  const fresh = new Set(runs.filter((r) => r.extracted_on > cutoff).map((r) => r.url));
  const queue = Array.from(byUrl.keys()).filter((u) => !fresh.has(u)).slice(0, LIMIT);
  const today = new Date().toISOString().slice(0, 10), total = {articles: 0, blocked: 0, failed: 0, accepted: 0, newProduct: 0, unvalidated: 0, already: 0, missing: 0};
  console.log(`${byUrl.size} cited articles, ${fresh.size} read recently, reading ${queue.length} now.`);
  for (const url of queue) {
    const cited = byUrl.get(url), source = cited[0].source, page = await fetchPage(url);
    if (page.status !== "ok") { total.blocked++; continue; }
    const text = articleText(page.html);
    const ex = await api("/_api/admin/extract", {method: "POST", body: JSON.stringify({url, source, text})});
    if (!ex.ok) { total.failed++; console.log(`  failed ${source}: ${ex.body.error || ex.status}`); continue; }
    total.articles++;
    const rows = [], seen = new Set(), matchedKeys = new Set();
    for (const p of ex.body.products) {
      const productKey = slugify(p.brand + " " + p.name);
      if (!productKey || seen.has(productKey)) continue;
      seen.add(productKey);
      const validated = mentions(page.text, p.brand, p.name), matched = matchProduct(p.brand, p.name, known);
      if (matched) matchedKeys.add(matched);
      if (matched && cited.some((m) => m.productKey === matched)) { total.already++; continue; }
      const status = !validated ? "unvalidated" : matched ? "accepted" : "new_product";
      total[status === "accepted" ? "accepted" : status === "new_product" ? "newProduct" : "unvalidated"]++;
      rows.push({brand: p.brand, name: p.name, productKey, matchedProductKey: matched, label: p.label, basis: p.basis, validated, status});
    }
    const missing = cited.filter((m) => !matchedKeys.has(m.productKey)).map((m) => m.key);
    total.missing += missing.length;
    const saved = await api("/_api/admin/candidates", {method: "POST", body: JSON.stringify({day: today, url, source, model: ex.body.model, author: page.meta.author, publishedAt: page.meta.publishedAt, modifiedAt: page.meta.modifiedAt, rows, missing})});
    console.log(`  ${source}: ${ex.body.products.length} products read, ${rows.filter((r) => r.status === "accepted").length} new sources for tracked products, ${rows.filter((r) => r.status === "new_product").length} untracked${saved.ok ? "" : " (SAVE FAILED " + saved.status + ")"}`);
  }
  console.log("Totals:", JSON.stringify(total));
}
if (import.meta.url === "file://" + process.argv[1]) main().catch((e) => { console.error(e); process.exit(1); });
