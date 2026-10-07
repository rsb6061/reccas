import {getCorpus, slugify, verifyKeyOk, FRANCHISE_YEAR} from "./consensus.js";

// People whose own stated recommendations Reccas tracks. These are kept apart from the
// independent-source count: a person's pick is shown beside it, never added to it.
const MIN_PICKS_TO_INDEX = 5;
const TTL_MS = 60000;
let cache = {at: 0, people: null};

async function ensurePeople(env) {
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS people (slug TEXT PRIMARY KEY,name TEXT NOT NULL,kind TEXT,known_for TEXT,updated_on TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS person_picks (id INTEGER PRIMARY KEY AUTOINCREMENT,person_slug TEXT NOT NULL,brand TEXT NOT NULL,name TEXT NOT NULL,product_key TEXT NOT NULL,matched_product_key TEXT,label TEXT,url TEXT NOT NULL,source TEXT NOT NULL,author TEXT,published_at TEXT,modified_at TEXT,sponsored INTEGER NOT NULL DEFAULT 0,validated INTEGER NOT NULL DEFAULT 0,model TEXT,extracted_on TEXT NOT NULL,UNIQUE(person_slug,url,product_key))"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_person_picks_product ON person_picks(matched_product_key)")
  ]);
}

export async function savePersonPicks(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  let b = {};
  try { b = await request.json(); } catch (_) {}
  const day = String(b.day || ""), slug = slugify(b.personSlug), url = String(b.url || "").slice(0, 1000), rows = Array.isArray(b.rows) ? b.rows.slice(0, 60) : [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !slug || !url || !b.personName) return Response.json({error: "Bad request"}, {status: 400});
  await ensurePeople(env);
  const d = function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : null; };
  const stmts = [env.DB.prepare("INSERT INTO people (slug,name,kind,known_for,updated_on) VALUES (?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name,kind=excluded.kind,known_for=excluded.known_for,updated_on=excluded.updated_on").bind(slug, String(b.personName).slice(0, 120), String(b.kind || "").slice(0, 60) || null, String(b.knownFor || "").slice(0, 240) || null, day)];
  // An empty marker row records that the article was read even when it named nothing usable.
  stmts.push(env.DB.prepare("INSERT INTO person_picks (person_slug,brand,name,product_key,label,url,source,sponsored,validated,extracted_on) VALUES (?,?,?,?,?,?,?,1,0,?) ON CONFLICT(person_slug,url,product_key) DO UPDATE SET extracted_on=excluded.extracted_on").bind(slug, "-", "-", "_read", null, url, String(b.source || "").slice(0, 120), day));
  rows.filter(function (r) { return r && r.brand && r.name && r.productKey; }).forEach(function (r) {
    stmts.push(env.DB.prepare("INSERT INTO person_picks (person_slug,brand,name,product_key,matched_product_key,label,url,source,author,published_at,modified_at,sponsored,validated,model,extracted_on) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(person_slug,url,product_key) DO UPDATE SET matched_product_key=excluded.matched_product_key,label=excluded.label,author=excluded.author,published_at=excluded.published_at,modified_at=excluded.modified_at,sponsored=excluded.sponsored,validated=excluded.validated,model=excluded.model,extracted_on=excluded.extracted_on").bind(slug, String(r.brand).slice(0, 80), String(r.name).slice(0, 160), String(r.productKey).slice(0, 300), r.matchedProductKey ? String(r.matchedProductKey).slice(0, 300) : null, String(r.label || "").slice(0, 160) || null, url, String(b.source || "").slice(0, 120), b.author ? String(b.author).slice(0, 160) : null, d(b.publishedAt), d(b.modifiedAt), r.sponsored ? 1 : 0, r.validated ? 1 : 0, String(b.model || "").slice(0, 40) || null, day));
  });
  for (let i = 0; i < stmts.length; i += 40) await env.DB.batch(stmts.slice(i, i + 40));
  cache = {at: 0, people: null};
  return Response.json({ok: true, saved: stmts.length - 2});
}
export async function peopleStatus(request, env) {
  if (!verifyKeyOk(request, env)) return Response.json({error: "Not authorized"}, {status: 401});
  await ensurePeople(env);
  const rows = (await env.DB.prepare("SELECT person_slug,url,MAX(extracted_on) extracted_on FROM person_picks GROUP BY person_slug,url").all()).results || [];
  return Response.json({runs: rows});
}

export async function loadPeople(env) {
  const now = Date.now();
  if (cache.people && now - cache.at < TTL_MS) return cache.people;
  const people = new Map();
  try {
    ((await env.DB.prepare("SELECT slug,name,kind,known_for FROM people").all()).results || []).forEach(function (p) { people.set(p.slug, {slug: p.slug, name: p.name, kind: p.kind || "", knownFor: p.known_for || "", picks: []}); });
    const rows = (await env.DB.prepare("SELECT person_slug,brand,name,product_key,matched_product_key,label,url,source,published_at,modified_at FROM person_picks WHERE validated=1 AND sponsored=0 AND product_key<>'_read' ORDER BY extracted_on DESC").all()).results || [];
    rows.forEach(function (r) {
      const p = people.get(r.person_slug);
      if (!p) return;
      const id = r.matched_product_key || r.product_key;
      if (p.picks.some(function (x) { return (x.matched || x.key) === id; })) return;
      p.picks.push({brand: r.brand, name: r.name, key: r.product_key, matched: r.matched_product_key || null, label: r.label || "", url: r.url, source: r.source, date: r.modified_at || r.published_at || null});
    });
  } catch (_) {}
  cache = {at: now, people: people};
  return people;
}
export async function peopleForProduct(env, productKey) {
  const people = await loadPeople(env), out = [];
  people.forEach(function (p) { p.picks.forEach(function (x) { if (x.matched === productKey) out.push({slug: p.slug, name: p.name, label: x.label, url: x.url, source: x.source}); }); });
  return out;
}
export async function peopleSitemap(env) {
  const people = await loadPeople(env), day = new Date().toISOString().slice(0, 10), list = Array.from(people.values()).filter(function (p) { return p.picks.length >= MIN_PICKS_TO_INDEX; });
  return (list.length >= 3 ? [{p: "/people", last: day}] : []).concat(list.map(function (p) { return {p: "/people/" + p.slug, last: day}; }));
}
export async function personTool(env, query) {
  const people = await loadPeople(env), corpus = await getCorpus(env), q = slugify(query);
  const person = people.get(q) || Array.from(people.values()).find(function (p) { return slugify(p.name).indexOf(q) >= 0 || q.indexOf(slugify(p.name)) >= 0; });
  if (!person) return {error: "Reccas does not track a person matching that.", people: Array.from(people.values()).filter(function (p) { return p.picks.length; }).map(function (p) { return p.name; })};
  return {
    person: person.name, described_as: person.knownFor, url: "https://reccas.com/people/" + person.slug,
    recommendations: person.picks.map(function (x) { const prod = x.matched ? corpus.products.get(x.matched) : null; return {product: x.brand + " " + x.name, in_their_words: x.label, stated_in: x.source, original: x.url, also_recommended_by_independent_sources: prod ? prod.independent.length : 0, url: prod ? "https://reccas.com/products/" + prod.key : null}; }),
    note: "These are " + person.name + "'s own stated recommendations, each linked to where they were stated. Reccas is not affiliated with " + person.name + ". Products from brands they own or are paid to promote are excluded, and a person's pick is never added to a product's independent-source count."
  };
}

export function createPeople(h) {
  const page = h.page, esc = h.esc;
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  const disclaimer = function (name) { return "Reccas is not affiliated with " + esc(name) + ", who has not endorsed this page. It lists only recommendations " + esc(name) + " stated publicly, each linked to where it was stated. Products from brands they own or are paid to promote are left out, and nothing is listed merely because they were photographed wearing it."; };

  async function index(env) {
    const people = Array.from((await loadPeople(env)).values()).filter(function (p) { return p.picks.length; }).sort(function (a, b) { return b.picks.length - a.picks.length; });
    const cards = people.map(function (p) { return "<a class='guideTile' href='/people/" + esc(p.slug) + "'><div class='eyebrow'>" + esc(p.kind || "Person") + "</div><h3>" + esc(p.name) + "</h3><p>" + esc(p.knownFor) + "</p><strong>" + plural(p.picks.length, "recommendation") + " →</strong></a>"; }).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>People</span><h1>What the people with taste recommend</h1><p>Stylists, newsletter writers and personalities whose own fashion recommendations Reccas tracks, each linked to where they said it. A person’s pick is shown beside a product’s independent-source count and is never added to it.</p></section><section class='section'>" + (cards ? "<div class='guideGrid'>" + cards + "</div>" : "<p class='muted'>No recommendations recorded yet.</p>") + "</section><section class='editMethod'><span class='eyebrow'>How this works</span><h2>Their words, with the receipt.</h2><p>Reccas records only what a person recommends in their own words in an interview, article or newsletter. It leaves out anything from a brand they own or are paid to promote, and anything they were only photographed wearing. Nobody listed here is affiliated with Reccas or has endorsed it. <a class='plainLink' href='/methodology'>Methodology</a>.</p></section></main>";
    return page("/people", "What Stylists, Writers and Personalities Recommend", body, "The fashion products that stylists, newsletter writers and personalities recommend in their own words, each linked to where they said it.", 200, people.length >= 3 ? null : "noindex, follow", {kind: "collection", breadcrumb: "People"});
  }

  async function person(env, slug) {
    const p = (await loadPeople(env)).get(slug);
    if (!p || !p.picks.length) return null;
    const corpus = await getCorpus(env);
    let overlap = 0;
    const rows = p.picks.map(function (x) {
      const prod = x.matched ? corpus.products.get(x.matched) : null, n = prod ? prod.independent.length : 0;
      if (n) overlap++;
      return "<tr><td>" + (prod ? "<a class='plainLink' href='/products/" + esc(prod.key) + "'>" + esc(prod.brand + " " + prod.name) + "</a>" : esc(x.brand + " " + x.name)) + "</td><td>" + esc(x.label) + "</td><td><a class='plainLink' href='" + esc(x.url) + "' target='_blank' rel='noreferrer'>" + esc(x.source) + " ↗</a>" + (x.date ? "<div class='rankMeta'>" + esc(x.date) + "</div>" : "") + "</td><td>" + (n ? plural(n, "independent source") : "<span class='rankMeta'>Not in a Reccas category yet</span>") + "</td></tr>";
    }).join("");
    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>" + esc(p.kind || "Person") + "</span><h1>What " + esc(p.name) + " recommends</h1><p>" + esc(p.knownFor ? p.knownFor + ". " : "") + plural(p.picks.length, "fashion product") + " " + esc(p.name) + " has recommended in their own words" + (overlap ? ", " + overlap + " of which independent editors also recommend" : "") + ".</p><p class='footNote' style='margin-top:14px'>" + disclaimer(p.name) + "</p></section><section class='section'><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Product</th><th>What they said</th><th>Where they said it</th><th>Editors agree?</th></tr></thead><tbody>" + rows + "</tbody></table></div><p style='margin-top:20px'><a class='plainLink' href='/people'>Everyone Reccas tracks →</a></p></section></main>";
    return page("/people/" + slug, "What " + p.name + " Recommends: " + p.picks.length + " Fashion Picks (" + FRANCHISE_YEAR + ")", body, "The fashion products " + p.name + " has recommended in their own words, each linked to where they said it, and which ones independent editors also recommend.", 200, p.picks.length >= MIN_PICKS_TO_INDEX ? null : "noindex, follow", {kind: "collection", breadcrumb: p.name});
  }

  return {index: index, person: person};
}
