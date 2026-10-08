// Private test: reads a handful of articles on one product question and reports how much they agree.
// Saves nothing and changes nothing on the site.
import {readFileSync} from "node:fs";
import {fetchPage, mentions} from "./verify-sources.mjs";
import {articleText, api, slugify} from "./extract-recommendations.mjs";

const GENERIC = new Set(["the", "of", "and", "di", "del", "in", "for", "with", "balsamic", "vinegar", "aceto", "balsamico", "modena", "igp", "pgi", "dop", "extra", "virgin", "olive", "oil", "evoo", "organic", "original", "premium", "italian", "aged", "mattress", "mattresses", "bed"]);
const ONLY = String(process.env.TOPIC || "").trim().toLowerCase();
const compact = (v) => slugify(v).replace(/-/g, "");
const distinct = (v) => slugify(v).split("-").filter((t) => t.length > 1 && !GENERIC.has(t));
function same(a, b) {
  if (compact(a.brand) !== compact(b.brand)) return false;
  const x = distinct(a.name), y = distinct(b.name);
  if (!x.length || !y.length) return true;
  return x.length === y.length && x.every((t) => y.includes(t));
}

// The guide's own words about how it is paid, if it says.
function disclosure(text) {
  const m = String(text).replace(/\s+/g, " ").match(/[^.!?]{0,160}\b(earn|receive|get)s?\b[^.!?]{0,80}\b(commission|compensation|referral fee)[^.!?]{0,120}[.!?]|[^.!?]{0,120}\baffiliate (link|commission|partner)s?[^.!?]{0,120}[.!?]/i);
  return m ? m[0].trim().slice(0, 300) : null;
}
async function main() {
  const tests = JSON.parse(readFileSync(new URL("../data/consensus-tests.json", import.meta.url), "utf8"));
  for (let attempt = 1; attempt <= 8; attempt++) {
    const r = await api("/_api/admin/extraction-status", {method: "GET"});
    if (r.ok) break;
    await new Promise((done) => setTimeout(done, 10000));
  }
  for (const topic of Object.keys(tests)) {
    if (topic.startsWith("_") || (ONLY && topic.toLowerCase() !== ONLY)) continue;
    const products = [], brands = new Map(), full = [];
    let read = 0, blocked = 0, tested = 0, named = 0;
    console.log(`\n===== ${topic.toUpperCase()} =====`);
    for (const article of tests[topic]) {
      const page = await fetchPage(article.url);
      if (page.status !== "ok") { blocked++; console.log(`  blocked: ${article.source} (${page.detail || ""})`); continue; }
      const ex = await api("/_api/admin/extract", {method: "POST", body: JSON.stringify({url: article.url, source: article.source, text: articleText(page.html), topic})});
      if (!ex.ok) { blocked++; console.log(`  failed: ${article.source} (${ex.body.error || ex.status})`); continue; }
      read++;
      const kept = ex.body.products.filter((p) => mentions(page.text, p.brand, p.name));
      named += kept.length;
      tested += kept.filter((p) => p.basis === "tested").length;
      console.log(`  read: ${article.source} — ${kept.length} products (${ex.body.products.length - kept.length} dropped as unverifiable)`);
      full.push({source: article.source, url: article.url, disclosure: disclosure(page.text), author: page.meta.author, modified: page.meta.modifiedAt || page.meta.publishedAt, products: kept.map((p) => ({brand: p.brand, name: p.name, label: p.label, price: p.price}))});
      const seenHere = new Set(), brandsHere = new Set();
      for (const p of kept) {
        let c = products.find((x) => same(x, p));
        if (!c) { c = {brand: p.brand, name: p.name, sources: []}; products.push(c); }
        if (!seenHere.has(c)) { seenHere.add(c); c.sources.push(article.source); }
        const b = compact(p.brand);
        if (!brandsHere.has(b)) { brandsHere.add(b); if (!brands.has(b)) brands.set(b, {name: p.brand, sources: []}); brands.get(b).sources.push(article.source); }
      }
    }
    products.sort((a, b) => b.sources.length - a.sources.length);
    const brandList = Array.from(brands.values()).sort((a, b) => b.sources.length - a.sources.length);
    const at = (n) => products.filter((p) => p.sources.length >= n).length;
    console.log(`SUMMARY ${topic}: ${read} articles read, ${blocked} blocked, ${named} product mentions (${tested} tested), ${products.length} distinct products; named by 2+: ${at(2)}, by 3+: ${at(3)}, by 4+: ${at(4)}`);
    console.log("TOP PRODUCTS:");
    products.slice(0, 12).forEach((p) => console.log(`  ${p.sources.length}  ${p.brand} — ${p.name}  [${p.sources.join("; ")}]`));
    console.log("FULLJSON " + JSON.stringify(full));
    console.log("TOP BRANDS:");
    brandList.slice(0, 12).forEach((b) => console.log(`  ${b.sources.length}  ${b.name}  [${b.sources.join("; ")}]`));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
