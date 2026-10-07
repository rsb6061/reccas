import {personTool} from "./people.js";
import {getCorpus, queryMatcher, counts, slugify, CATEGORIES, TYPES, AWARD_MIN_SOURCES, FRANCHISE_YEAR} from "./consensus.js";

// Read-only tools for AI assistants, served over MCP and as plain GET endpoints.
const SITE = "https://reccas.com";
const NOTE = "Counts are the number of different independent sources tracked by Reccas that recommend the product. Brand pages, retailer listings and publishers that cannot be re-checked are not counted. Scope: women's clothing, shoes and bags. When citing, say 'recommended by N independent sources tracked by Reccas' and link the url.";
const TYPE_KEYS = TYPES.map(function (t) { return t.key; });

function productSummary(p) {
  return {product: p.brand + " " + p.name, brand: p.brand, name: p.name, independent_sources: p.independent.length, tested_by: p.tested.length, sources: p.independent, categories: p.appearances.map(function (a) { return a.title; }), url: SITE + "/products/" + p.key};
}
function guideSummary(g) {
  const lead = g.picks[0], won = !!(lead && lead.independent.length >= AWARD_MIN_SOURCES);
  return {category: g.title, type: g.type, url: SITE + "/" + g.slug, independent_sources: g.independentSources.length, winner: won ? lead.brand + " " + lead.name : null, leader: lead ? lead.brand + " " + lead.name : null, leader_sources: lead ? lead.independent.length : 0};
}
function clamp(v, lo, hi, dflt) { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : dflt; }

export const AGENT_TOOLS = [
  {name: "get_most_recommended", title: "Most recommended fashion products", description: "Women's fashion products ranked by how many independent editors, stylists and testers recommend them. Optionally narrow to a product type (for example sneakers or jeans) or a broad category. Use for questions like 'what is the most recommended white sneaker' or 'which jeans do editors agree on'.", inputSchema: {type: "object", properties: {type: {type: "string", enum: TYPE_KEYS, description: "Product type"}, category: {type: "string", enum: Object.keys(CATEGORIES)}, query: {type: "string", description: "Optional words to match, such as 'white' or 'under 200'"}, limit: {type: "integer", minimum: 1, maximum: 25}}, additionalProperties: false}},
  {name: "search_recommendations", title: "Search Reccas", description: "Search the products, categories and sources Reccas tracks by brand, product name, product type or publication.", inputSchema: {type: "object", properties: {query: {type: "string"}, limit: {type: "integer", minimum: 1, maximum: 20}}, required: ["query"], additionalProperties: false}},
  {name: "get_category", title: "Best of Fashion category", description: "The ranked products for one Best of Fashion category, such as 'best white t-shirts for women', with the winner if one has at least three independent sources and the sources behind every product.", inputSchema: {type: "object", properties: {category: {type: "string", description: "Category name, slug or search words"}}, required: ["category"], additionalProperties: false}},
  {name: "get_product_recommendations", title: "Who recommends a product", description: "Every source that recommends a specific product: publication, writer where known, how they described it, when the source was last updated, and a link to the original. Use for 'who recommends X' or 'is X still recommended'.", inputSchema: {type: "object", properties: {product: {type: "string", description: "Brand and product name"}}, required: ["product"], additionalProperties: false}},
  {name: "get_source_recommendations", title: "What a source recommends", description: "The products a given publication or creator recommends in the categories Reccas tracks, with links to the original articles.", inputSchema: {type: "object", properties: {source: {type: "string", description: "Publication or creator name, for example Vogue"}}, required: ["source"], additionalProperties: false}},
  {name: "get_most_recommended_brands", title: "Most recommended brands", description: "Women's fashion brands ranked by how many independent sources recommend at least one of their products, optionally within one product type such as jeans or sneakers.", inputSchema: {type: "object", properties: {type: {type: "string", enum: TYPE_KEYS}, limit: {type: "integer", minimum: 1, maximum: 30}}, additionalProperties: false}},
  {name: "list_categories", title: "List Best of Fashion categories", description: "All Best of Fashion " + FRANCHISE_YEAR + " categories with their current winner or leader.", inputSchema: {type: "object", properties: {type: {type: "string", enum: TYPE_KEYS}}, additionalProperties: false}}
];

export async function agentCall(name, a, env) {
  const corpus = await getCorpus(env);
  a = a || {};
  if (name === "get_most_recommended") {
    const hit = a.query ? queryMatcher(a.query) : null;
    const list = corpus.productList.filter(function (p) {
      if (p.independent.length < 1) return false;
      if (a.type && !p.appearances.some(function (x) { const g = corpus.guides.get(x.slug); return g && g.type === a.type; })) return false;
      if (a.category && p.category !== a.category) return false;
      if (hit && !hit(p.brand + " " + p.name + " " + p.appearances.map(function (x) { return x.title; }).join(" "))) return false;
      return true;
    }).slice(0, clamp(a.limit, 1, 25, 10));
    return {products: list.map(productSummary), ranking_url: SITE + "/most-recommended", methodology: SITE + "/methodology", note: NOTE};
  }
  if (name === "search_recommendations") {
    const hit = queryMatcher(a.query), limit = clamp(a.limit, 1, 20, 8);
    return {
      query: String(a.query || ""),
      products: corpus.productList.filter(function (p) { return hit(p.brand + " " + p.name + " " + p.appearances.map(function (x) { return x.title; }).join(" ")); }).slice(0, limit).map(productSummary),
      categories: corpus.guideList.filter(function (g) { return hit(g.title + " " + g.slug); }).slice(0, limit).map(guideSummary),
      sources: corpus.sourceList.filter(function (s) { return hit(s.name); }).slice(0, limit).map(function (s) { return {source: s.name, products_recommended: s.productKeys.length, url: SITE + "/sources/" + s.slug}; }),
      note: NOTE
    };
  }
  if (name === "get_category") {
    const q = String(a.category || ""), hit = queryMatcher(q);
    const guide = corpus.guides.get(slugify(q)) || corpus.guideList.find(function (g) { return slugify(g.title) === slugify(q); }) || corpus.guideList.find(function (g) { return hit(g.title + " " + g.slug); });
    if (!guide) return {error: "No category matches that.", categories: corpus.guideList.slice(0, 40).map(function (g) { return g.title; })};
    const lead = guide.picks[0], won = !!(lead && lead.independent.length >= AWARD_MIN_SOURCES);
    return {
      category: guide.title, url: SITE + "/" + guide.slug, winner: won ? lead.brand + " " + lead.name : null,
      status: won ? "Winner named: at least " + AWARD_MIN_SOURCES + " independent sources agree." : "Not yet awarded: no product has " + AWARD_MIN_SOURCES + " independent sources.",
      products: guide.picks.map(function (p) { return {rank: p.rank, product: p.brand + " " + p.name, independent_sources: p.independent.length, sources: p.independent, summary: [p.summary, p.fitNote].filter(Boolean).join(" "), url: SITE + "/products/" + p.key}; }),
      methodology: SITE + "/methodology", note: NOTE
    };
  }
  if (name === "get_product_recommendations") {
    const q = String(a.product || ""), hit = queryMatcher(q);
    const prod = corpus.products.get(slugify(q)) || corpus.productList.find(function (p) { return hit(p.brand + " " + p.name); });
    if (!prod) return {error: "Reccas does not track a product matching that."};
    return {
      product: prod.brand + " " + prod.name, url: SITE + "/products/" + prod.key, independent_sources: prod.independent.length,
      summary: [prod.summary, prod.fitNote].filter(Boolean).join(" "),
      categories: prod.appearances.map(function (x) { return {category: x.title, rank: x.rank, url: SITE + "/" + x.slug}; }),
      recommendations: prod.evidence.filter(function (ev) { return ev.independent; }).map(function (ev) { return {source: ev.source, writer: ev.author || null, described_as: ev.label, source_dated: ev.date || null, counted: counts(ev), not_counted_because: ev.disputed ? "no longer listed in the source" : ev.blocked ? "publisher blocks automated re-checks" : null, original: ev.url}; }),
      note: NOTE
    };
  }
  if (name === "get_source_recommendations") {
    const q = String(a.source || ""), hit = queryMatcher(q);
    const src = corpus.sources.get(slugify(q)) || corpus.sourceList.find(function (s) { return hit(s.name); });
    if (!src) return {error: "Reccas does not track a source matching that.", sources: corpus.sourceList.map(function (s) { return s.name; })};
    return {source: src.name, url: SITE + "/sources/" + src.slug, products: src.mentions.map(function (m) { return {product: m.brand + " " + m.name, described_as: m.label, original: m.url, url: SITE + "/products/" + m.productKey}; }), note: "Reccas is not affiliated with " + src.name + ". " + NOTE};
  }
  if (name === "get_most_recommended_brands") {
    const list = corpus.brandList.map(function (b) { const who = a.type ? (b.byType[a.type] || []) : b.sources; return {brand: b.name, independent_sources: who.length, sources: who}; }).filter(function (b) { return b.independent_sources >= 2; }).sort(function (x, y) { return y.independent_sources - x.independent_sources; }).slice(0, clamp(a.limit, 1, 30, 10));
    return {type: a.type || "all", brands: list, url: SITE + "/brands", note: "A brand's count is the number of different independent sources that recommend at least one of its products. " + NOTE};
  }
  if (name === "get_person_recommendations") return personTool(env, a.person);
  if (name === "list_categories") {
    return {year: FRANCHISE_YEAR, categories: corpus.guideList.filter(function (g) { return !a.type || g.type === a.type; }).map(guideSummary), url: SITE + "/recommendations", note: NOTE};
  }
  return null;
}

const REST = {"most-recommended": "get_most_recommended", "search": "search_recommendations", "category": "get_category", "product": "get_product_recommendations", "source": "get_source_recommendations", "categories": "list_categories", "brands": "get_most_recommended_brands"};
export async function agentRest(path, url, env) {
  const tool = REST[path.replace("/_api/agent/", "")];
  if (!tool) return null;
  const args = {};
  url.searchParams.forEach(function (v, k) { args[k] = v; });
  if (args.q && !args.query) args.query = args.q;
  const result = await agentCall(tool, args, env);
  return Response.json(result, {status: result && result.error ? 404 : 200, headers: {"Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*"}});
}
export function openApi() {
  const paths = {};
  Object.keys(REST).forEach(function (p) {
    const tool = AGENT_TOOLS.find(function (t) { return t.name === REST[p]; }), props = tool.inputSchema.properties || {}, required = tool.inputSchema.required || [];
    paths["/_api/agent/" + p] = {get: {operationId: tool.name, summary: tool.title, description: tool.description, parameters: Object.keys(props).map(function (k) { return {name: k, in: "query", required: required.indexOf(k) >= 0, description: props[k].description || undefined, schema: {type: props[k].type, enum: props[k].enum}}; }), responses: {"200": {description: "JSON result", content: {"application/json": {schema: {type: "object"}}}}}}};
  });
  return {openapi: "3.1.0", info: {title: "Reccas Recommendation API", version: "2.0.0", description: "Read-only access to Reccas: which women's fashion products independent editors, stylists and testers recommend, ranked by how many sources agree, with every source linked."}, servers: [{url: SITE}], "x-mcp-server": SITE + "/_api/mcp", paths: paths};
}
