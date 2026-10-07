// Re-reads every source article Reccas cites and records whether it still names the product.
// Writes results to D1 (mention_checks). Nothing on the site changes when a mention is not found;
// those rows are a review queue.
import {writeFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const SITE = process.env.RECCAS_SITE || "https://reccas.com";
const DRY_RUN = process.env.DRY_RUN === "1";
const LIMIT = Number(process.env.LIMIT || 0);
const CONCURRENCY = 4;
const STOP = new Set(["the", "for", "women", "womens", "woman", "and", "with", "from", "bag", "bags", "shoe", "shoes", "dress", "pant", "pants", "jean", "jeans"]);

function norm(v) {
  return String(v || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&amp;/g, " and ").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(name) {
  const all = norm(name).split(" ").filter(Boolean), strong = all.filter((t) => t.length > 2 && !STOP.has(t));
  return strong.length ? strong : all;
}
// The product counts as present when the brand appears and most of the name's distinctive
// words appear close together.
export function mentions(pageText, brand, name) {
  const text = norm(pageText), b = norm(brand), want = tokens(name);
  if (!text || !want.length) return false;
  if (b && text.indexOf(b) < 0 && text.indexOf(b.replace(/ /g, "")) < 0) return false;
  const need = Math.max(1, Math.ceil(want.length * 0.7));
  for (const anchor of want) {
    let at = text.indexOf(anchor);
    while (at >= 0) {
      const win = text.slice(Math.max(0, at - 400), at + 400);
      if (want.filter((t) => win.indexOf(t) >= 0).length >= need) return true;
      at = text.indexOf(anchor, at + anchor.length);
    }
  }
  return false;
}
function visibleText(html) {
  return String(html).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}
async function fetchPage(url) {
  try {
    const r = await fetch(url, {redirect: "follow", signal: AbortSignal.timeout(20000), headers: {"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", accept: "text/html,application/xhtml+xml", "accept-language": "en-US,en;q=0.9"}});
    if (!r.ok) return {status: "blocked", detail: "HTTP " + r.status};
    const html = await r.text(), text = visibleText(html);
    // JSON-LD and inline data often carry the product list on script-rendered pages.
    if (text.length < 1500 && html.length < 20000) return {status: "blocked", detail: "empty page"};
    return {status: "ok", text: text + " " + html};
  } catch (e) {
    return {status: "blocked", detail: String(e && e.name || e).slice(0, 60)};
  }
}
const q = (v) => v == null ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'";

async function main() {
  const res = await fetch(SITE + "/_api/mentions.json", {headers: {accept: "application/json"}});
  if (!res.ok) throw new Error("Could not load mentions: HTTP " + res.status);
  const data = await res.json(), byUrl = new Map();
  for (const m of data.mentions) {
    if (!m.url) continue;
    if (!byUrl.has(m.url)) byUrl.set(m.url, []);
    byUrl.get(m.url).push(m);
  }
  let urls = Array.from(byUrl.keys());
  if (LIMIT) urls = urls.slice(0, LIMIT);
  const today = new Date().toISOString().slice(0, 10), rows = [], tally = {verified: 0, not_found: 0, blocked: 0};
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++], page = await fetchPage(url);
      for (const m of byUrl.get(url)) {
        const status = page.status !== "ok" ? "blocked" : (mentions(page.text, m.brand, m.name) ? "verified" : "not_found");
        tally[status]++;
        rows.push({m, status, detail: page.detail || null});
      }
    }
  }
  await Promise.all(Array.from({length: CONCURRENCY}, worker));
  const sql = ["CREATE TABLE IF NOT EXISTS mention_checks (mention_key TEXT PRIMARY KEY,product_key TEXT NOT NULL,guide_slug TEXT,source TEXT,url TEXT,status TEXT NOT NULL,detail TEXT,checked_on TEXT NOT NULL,verified_on TEXT);", "CREATE INDEX IF NOT EXISTS idx_mention_checks_guide ON mention_checks(guide_slug);", "CREATE INDEX IF NOT EXISTS idx_mention_checks_product ON mention_checks(product_key);"];
  for (const {m, status, detail} of rows) {
    const verified = status === "verified" ? q(today) : "NULL";
    sql.push(`INSERT INTO mention_checks (mention_key,product_key,guide_slug,source,url,status,detail,checked_on,verified_on) VALUES (${q(m.key)},${q(m.productKey)},${q(m.guideSlug)},${q(m.source)},${q(m.url)},${q(status)},${q(detail)},${q(today)},${verified}) ON CONFLICT(mention_key) DO UPDATE SET status=excluded.status,detail=excluded.detail,checked_on=excluded.checked_on,guide_slug=excluded.guide_slug,verified_on=COALESCE(excluded.verified_on,mention_checks.verified_on);`);
  }
  console.log(`Checked ${urls.length} source pages covering ${rows.length} mentions:`, JSON.stringify(tally));
  for (const r of rows.filter((x) => x.status !== "verified")) console.log(`  ${r.status.padEnd(9)} ${r.m.source} -> ${r.m.brand} ${r.m.name}${r.detail ? " (" + r.detail + ")" : ""}`);
  if (DRY_RUN) return;
  writeFileSync("mention-checks.sql", sql.join("\n"));
  execFileSync("npx", ["wrangler", "d1", "execute", "reccas", "--remote", "--yes", "--file", "mention-checks.sql"], {stdio: "inherit"});
}
if (import.meta.url === "file://" + process.argv[1]) main().catch((e) => { console.error(e); process.exit(1); });
