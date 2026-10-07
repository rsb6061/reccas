// Reads the articles and newsletters where tracked people state their own recommendations.
// Kept only if the brand and product name are found in the text; anything from a brand the
// person owns or is paid to promote is marked and never shown.
import {readFileSync} from "node:fs";
import {fetchPage, mentions} from "./verify-sources.mjs";
import {articleText, api, slugify, matchProduct} from "./extract-recommendations.mjs";

const SITE = process.env.RECCAS_SITE || "https://reccas.com";
const REFRESH_DAYS = 30;
const compact = (v) => slugify(v).replace(/-/g, "");

async function main() {
  if (!process.env.VERIFY_KEY) throw new Error("VERIFY_KEY is not set");
  const registry = JSON.parse(readFileSync(new URL("../data/people-sources.json", import.meta.url), "utf8"));
  const known = (await (await fetch(SITE + "/_api/mentions.json")).json()).products;
  let runs = [];
  for (let attempt = 1; attempt <= 8; attempt++) {
    const r = await api("/_api/admin/people-status", {method: "GET"});
    if (r.ok) { runs = r.body.runs || []; break; }
    await new Promise((done) => setTimeout(done, 10000));
  }
  const cutoff = new Date(Date.now() - REFRESH_DAYS * 86400000).toISOString().slice(0, 10), fresh = new Set(runs.filter((r) => r.extracted_on > cutoff).map((r) => r.person_slug + "|" + r.url));
  const today = new Date().toISOString().slice(0, 10), total = {articles: 0, blocked: 0, failed: 0, kept: 0, sponsored: 0, unvalidated: 0};
  for (const personSlug of Object.keys(registry)) {
    if (personSlug.startsWith("_")) continue;
    const person = registry[personSlug], own = (person.own_brands || []).map(compact);
    for (const article of person.articles) {
      if (fresh.has(personSlug + "|" + article.url)) continue;
      const page = await fetchPage(article.url);
      if (page.status !== "ok") { total.blocked++; console.log(`  blocked ${person.name}: ${article.source}`); continue; }
      const ex = await api("/_api/admin/extract", {method: "POST", body: JSON.stringify({url: article.url, source: article.source, text: articleText(page.html), person: person.name, ownBrands: person.own_brands || []})});
      if (!ex.ok) { total.failed++; console.log(`  failed ${person.name}: ${ex.body.error || ex.status}`); continue; }
      total.articles++;
      const rows = [], seen = new Set();
      for (const p of ex.body.products) {
        const productKey = slugify(p.brand + " " + p.name);
        if (!productKey || seen.has(productKey)) continue;
        seen.add(productKey);
        const validated = mentions(page.text, p.brand, p.name), sponsored = p.sponsored === true || own.includes(compact(p.brand));
        if (!validated) total.unvalidated++; else if (sponsored) total.sponsored++; else total.kept++;
        rows.push({brand: p.brand, name: p.name, productKey, matchedProductKey: matchProduct(p.brand, p.name, known), label: p.label, sponsored, validated});
      }
      const saved = await api("/_api/admin/person-picks", {method: "POST", body: JSON.stringify({day: today, personSlug, personName: person.name, kind: person.kind, knownFor: person.known_for, url: article.url, source: article.source, model: ex.body.model, author: page.meta.author, publishedAt: page.meta.publishedAt, modifiedAt: page.meta.modifiedAt, rows})});
      console.log(`  ${person.name} / ${article.source}: ${rows.filter((r) => r.validated && !r.sponsored).length} kept, ${rows.filter((r) => r.sponsored).length} own-brand or paid, ${rows.filter((r) => r.matchedProductKey).length} already tracked${saved.ok ? "" : " (SAVE FAILED " + saved.status + ")"}`);
    }
  }
  console.log("Totals:", JSON.stringify(total));
}
main().catch((e) => { console.error(e); process.exit(1); });
