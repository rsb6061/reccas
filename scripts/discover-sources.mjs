// Finds each publication's own guide for a category by using that publication's site search,
// and adds what it finds to data/category-sources.json. Publications are an explicit allowlist:
// the open web is full of machine-written "best of" pages that should never be counted.
import {readFileSync, writeFileSync} from "node:fs";

const FILE = new URL("../data/category-sources.json", import.meta.url);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const PUBLISHERS = [
  {source: "Vogue", origin: "https://www.vogue.com", search: (q) => "https://www.vogue.com/search?q=" + q},
  {source: "Glamour", origin: "https://www.glamour.com", search: (q) => "https://www.glamour.com/search?q=" + q},
  {source: "Harper's Bazaar", origin: "https://www.harpersbazaar.com", search: (q) => "https://www.harpersbazaar.com/search/?q=" + q},
  {source: "ELLE", origin: "https://www.elle.com", search: (q) => "https://www.elle.com/search/?q=" + q},
  {source: "Cosmopolitan", origin: "https://www.cosmopolitan.com", search: (q) => "https://www.cosmopolitan.com/search/?q=" + q}
];
const FILLER = new Set(["best", "for", "women", "under", "the", "to", "with", "and"]);
const VARIANTS = {"t-shirts": ["t-shirt", "tee", "tshirt"], trousers: ["trouser", "pants"], sneakers: ["sneaker", "trainer"], sweaters: ["sweater", "knit"], coats: ["coat"], jeans: ["jean", "denim"], flats: ["flat"], loafers: ["loafer"], blazers: ["blazer"], "straight-leg": ["straight"], trench: ["trench"]};
const REJECT = /outfit|celebrit|how-to|wear-with|sale|deal|amazon|prime-day|black-friday|\bmens?\b|for-men|kids|trend|replaced|sandal/;

function needs(guide) {
  const slug = guide.replace(/^best-/, "").replace(/-for-women$/, "").replace(/-under-\d+$/, "").replace("t-shirts", "t_shirts").replace("straight-leg", "straight_leg");
  return slug.split("-").map((t) => t.replace("_", "-")).filter((t) => !FILLER.has(t) && !/^\d+$/.test(t)).map((t) => VARIANTS[t] || [t.replace(/s$/, "")]);
}
function query(guide) { return encodeURIComponent(guide.replace(/-under-\d+$/, "").replace(/-/g, " ")).replace(/%20/g, "+"); }

async function candidates(pub, guide) {
  let html = "";
  try {
    const r = await fetch(pub.search(query(guide)), {headers: {"user-agent": UA, accept: "text/html"}, signal: AbortSignal.timeout(20000)});
    if (!r.ok) return [];
    html = await r.text();
  } catch (_) { return []; }
  const want = needs(guide), found = new Set();
  for (const m of html.matchAll(/href="(\/[a-z0-9\-\/]+)"/gi)) {
    const path = m[1].toLowerCase();
    if (!/best/.test(path) || REJECT.test(path)) continue;
    if (!/\/(article|gallery|story|fashion|style-beauty|shopping)\//.test(path)) continue;
    if (want.every((vs) => vs.some((v) => path.includes(v)))) found.add(pub.origin + m[1].replace(/\/$/, "") + (pub.origin.includes("harpersbazaar") || pub.origin.includes("elle.com") || pub.origin.includes("cosmopolitan") ? "/" : ""));
  }
  return Array.from(found).slice(0, 2);
}

const registry = JSON.parse(readFileSync(FILE, "utf8"));
let added = 0;
for (const guide of Object.keys(registry)) {
  if (guide.startsWith("_")) continue;
  const have = new Set(registry[guide].map((a) => a.url.replace(/\/$/, "")));
  for (const pub of PUBLISHERS) {
    for (const url of await candidates(pub, guide)) {
      if (have.has(url.replace(/\/$/, ""))) continue;
      registry[guide].push({source: pub.source, url});
      have.add(url.replace(/\/$/, ""));
      added++;
      console.log(`+ ${guide}: ${pub.source} ${url}`);
    }
  }
}
writeFileSync(FILE, JSON.stringify(registry, null, 2) + "\n");
console.log(`Added ${added} articles.`);
