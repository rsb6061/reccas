import {slugify,verifyKeyOk} from "./consensus.js";

const CATEGORIES = {
  coats: "Coats & jackets", knitwear: "Sweaters & knitwear",
  denim: "Jeans & denim", boots: "Boots", bags: "Handbags",
  dresses: "Dresses", shoes: "Shoes & flats", tailoring: "Blazers & tailoring"
};
const TODAY = () => new Date().toISOString().slice(0,10);
const CUTOFF = () => new Date(Date.now()-90*86400000).toISOString().slice(0,10);
let tableReady=false;
async function ensure(env) {
  if (tableReady) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS creator_pilot_articles (url TEXT PRIMARY KEY,source_slug TEXT NOT NULL,source_name TEXT NOT NULL,site TEXT NOT NULL,style TEXT,title TEXT NOT NULL,published_at TEXT NOT NULL,checked_on TEXT NOT NULL,status TEXT NOT NULL,model TEXT)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_creator_articles_source ON creator_pilot_articles(source_slug,published_at)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS creator_pilot_picks (url TEXT NOT NULL,source_slug TEXT NOT NULL,product_key TEXT NOT NULL,brand TEXT NOT NULL,name TEXT NOT NULL,category TEXT NOT NULL,retailer TEXT,label TEXT,basis TEXT,validated INTEGER NOT NULL DEFAULT 0,sponsored INTEGER NOT NULL DEFAULT 0,published_at TEXT NOT NULL,checked_on TEXT NOT NULL,PRIMARY KEY(url,product_key))"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_creator_picks_cat ON creator_pilot_picks(category,product_key,source_slug)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_creator_picks_brand ON creator_pilot_picks(category,brand,source_slug)")
  ]);
  tableReady=true;
}
const safe = (v,max=180) => String(v||"").trim().slice(0,max);
function validURL(v) {try { const u=new URL(v);return /^https?:$/.test(u.protocol)&&!!u.hostname&&!u.username&&!u.password?u:null; }catch{return null;} }
function sameHost(a,b) {const root=x=>x.hostname.toLowerCase().replace(/^www\./,"");return root(a)===root(b);}
function category(v) {return Object.hasOwn(CATEGORIES,String(v))?String(v):null;}
const DBROWS = (db,query,...args) => db.prepare(query).bind(...args).all().then(x=>x.results||[]);
const counted = "p.validated=1 AND p.sponsored=0 AND p.published_at>=?";
export async function saveCreatorArticle(request,env) {
  if (!verifyKeyOk(request,env)) return Response.json({error:"Not authorized"},{status:401});
  let b={};try{b=await request.json()}catch{return Response.json({error:"Invalid JSON"},{status:400})}
  const url=validURL(b.url),site=validURL(b.site),published=safe(b.publishedAt,10),
    sourceName=safe(b.sourceName,120),sourceSlug=slugify(sourceName),rows=Array.isArray(b.products)?b.products.slice(0,40):[];
  if (!url||!site||!sameHost(url,site)||!sourceSlug||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(published)||published<CUTOFF()||published>TODAY()) {
    return Response.json({error:"Source/date validation failed"},{status:400});
  }
  await ensure(env);
  const day=TODAY(),entries=[],seen=new Set();
  for (const row of rows) {
    const brand=safe(row.brand,80),name=safe(row.name,160),cat=category(row.category),key=slugify(brand+" "+name);
    if (!brand||!name||!cat||seen.has(key))continue;
    seen.add(key);
    entries.push({brand,name,cat,key,retailer:safe(row.retailer,80),label:safe(row.label,120),basis:safe(row.basis,30),validated:row.validated===true,sponsored:row.sponsored===true});
  }
  const stmts=[
    env.DB.prepare("INSERT INTO creator_pilot_articles(url,source_slug,source_name,site,style,title,published_at,checked_on,status,model) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET source_slug=excluded.source_slug,source_name=excluded.source_name,style=excluded.style,title=excluded.title,published_at=excluded.published_at,checked_on=excluded.checked_on,status=excluded.status,model=excluded.model")
      .bind(url.href,sourceSlug,sourceName,site.origin,safe(b.style,60),safe(b.title,220),published,day,entries.some(x=>x.validated&&!x.sponsored)?"evidenced":"no_verified_picks",safe(b.model,60)),
    env.DB.prepare("UPDATE creator_pilot_picks SET validated=0 WHERE url=?").bind(url.href)
  ];
  for(const x of entries) stmts.push(env.DB.prepare("INSERT INTO creator_pilot_picks(url,source_slug,product_key,brand,name,category,retailer,label,basis,validated,sponsored,published_at,checked_on) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(url,product_key) DO UPDATE SET source_slug=excluded.source_slug,brand=excluded.brand,name=excluded.name,category=excluded.category,retailer=excluded.retailer,label=excluded.label,basis=excluded.basis,validated=excluded.validated,sponsored=excluded.sponsored,published_at=excluded.published_at,checked_on=excluded.checked_on")
    .bind(url.href,sourceSlug,x.key,x.brand,x.name,x.cat,x.retailer||null,x.label||null,x.basis||null,x.validated?1:0,x.sponsored?1:0,published,day));
  for(let i=0;i<stmts.length;i+=30)await env.DB.batch(stmts.slice(i,i+30));
  return Response.json({ok:true,source:sourceSlug,product_candidates:entries.length,verified:entries.filter(x=>x.validated&&!x.sponsored).length});
}
export async function creatorPilotStatus(request,env) {
  if (!verifyKeyOk(request,env)) return Response.json({error:"Not authorized"},{status:401});
  await ensure(env);
  const rows=await DBROWS(env.DB,"SELECT url,checked_on,status FROM creator_pilot_articles ORDER BY checked_on DESC LIMIT 2000");
  return Response.json({runs:rows});
}
async function data(env) {
  await ensure(env);
  return DBROWS(env.DB,"SELECT p.url,p.source_slug,a.source_name,a.site,a.style,a.title,p.brand,p.name,p.product_key,p.category,p.retailer,p.label,p.basis,p.published_at FROM creator_pilot_picks p JOIN creator_pilot_articles a ON a.url=p.url WHERE "+counted+" ORDER BY p.published_at DESC",CUTOFF());
}
function models(rows) {
  const creators=new Map(),cats={};
  for(const cat of Object.keys(CATEGORIES))cats[cat]={brands:new Map(),products:new Map(),sources:new Set(),rows:[]};
  for(const r of rows) {
    if(!creators.has(r.source_slug))creators.set(r.source_slug,{name:r.source_name,slug:r.source_slug,site:r.site,style:r.style,urls:new Set(),picks:[]});
    const cr=creators.get(r.source_slug);cr.urls.add(r.url);cr.picks.push(r);
    const cat=cats[r.category];if(!cat)continue;cat.sources.add(r.source_slug);cat.rows.push(r);
    const brandKey=slugify(r.brand),prodKey=r.product_key;
    for(const [map,key,label] of [[cat.brands,brandKey,r.brand],[cat.products,prodKey,r.brand+" "+r.name]]) {
      if(!map.has(key))map.set(key,{key,label,sources:new Set(),rows:[]});
      const record=map.get(key);record.sources.add(r.source_slug);record.rows.push(r);
    }
  }
  return {creators,cats};
}
function sums(map) {return [...map.values()].map(x=>({...x,count:x.sources.size})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));}
export async function creatorPilotSummary(env) {
  const rows=await data(env),m=models(rows);
  const articleCount=new Set(rows.map(x=>x.url)).size,sourceCount=m.creators.size;
  const strongProducts=Object.values(m.cats).flatMap(x=>sums(x.products).filter(z=>z.count>=3));
  const repeatedBrands=Object.values(m.cats).flatMap(x=>sums(x.brands).filter(z=>z.count>=2));
  let outbound=0;
  try { const r=await env.DB.prepare("SELECT COUNT(*) n FROM outbound_clicks WHERE request_id LIKE 'creator-pilot:%'").first();outbound=Number(r&&r.n||0) }catch{}
  return {as_of:TODAY(),window_days:90,verified_sources:sourceCount,verified_articles:articleCount,verified_mentions:rows.length,strong_product_category_pairs:strongProducts.length,repeated_brand_category_pairs:repeatedBrands.length,outbound_source_clicks:outbound,source_independence:"distinct sites; ownership or paid relationships require additional review",search_console_impressions:"not connected to this endpoint",categories:Object.fromEntries(Object.entries(m.cats).map(([k,v])=>[k,{sources:v.sources.size,mentions:v.rows.length,brands_with_2_plus_sources:sums(v.brands).filter(x=>x.count>=2).length,products_with_3_plus_sources:sums(v.products).filter(x=>x.count>=3).length}]))};
}
function outlink(url,where){return "/_api/out?to="+encodeURIComponent(url)+"&amp;edit="+encodeURIComponent("creator-pilot:"+where);}
const intro="<p class='muted'>Only dated, explicitly stated product recommendations verified against a source article are included. Distinct sites are not necessarily independent ownership groups. Product and brand overlap are shown separately; sponsored picks are excluded. Reccas is not affiliated with these creators.</p>";
export async function creatorPilotSitemap(env) {
  const rows=await data(env),m=models(rows),out=[],today=TODAY();
  if (m.creators.size>=10) out.push({p:"/creators",last:today});
  for(const [slug,p] of m.creators){
    if(p.urls.size>=2&&new Set(p.picks.map(r=>r.product_key)).size>=5)out.push({p:"/creators/"+slug,last:today});
  }
  for(const [slug,c] of Object.entries(m.cats)){
    if(c.sources.size>=5&&sums(c.brands).some(x=>x.count>=3)&&sums(c.products).some(x=>x.count>=3))out.push({p:"/creator-edits/"+slug,last:today});
  }
  return out;
}
export function createCreatorPilot(h) {
  const {page,esc}=h;
  async function index(env){
    const rows=await data(env),m=models(rows),creators=[...m.creators.values()].sort((a,b)=>b.picks.length-a.picks.length),count=creators.length;
    const tiles=creators.map(p=>"<a class='guideTile' href='/creators/"+esc(p.slug)+"'><span class='eyebrow'>"+esc(p.style||"Fashion creator")+"</span><h3>"+esc(p.name)+"</h3><p>"+p.urls.size+" dated shopping edit"+(p.urls.size===1?"":"s")+" · "+p.picks.length+" verified product mentions</p><strong>See source evidence →</strong></a>").join("");
    const cards=Object.entries(CATEGORIES).map(([id,name])=>"<a class='guidePill' href='/creator-edits/"+id+"'>"+esc(name)+" →</a>").join("");
    const body="<main class='wrap'><section class='hero'><span class='eyebrow'>Creator recommendation evidence · 90 days</span><h1>Independent fashion voices Reccas reads</h1><p>"+count+" fashion sites with verified product mentions in the last 90 days. Candidate sources without evidence are not listed.</p>"+intro+"</section><section class='section'><h2>Browse shopping edits</h2><div class='guideRoundups'>"+cards+"</div></section><section class='section'><h2>Creators with verified recommendations</h2>"+(count?"<div class='guideGrid'>"+tiles+"</div>":"<p>No verified recent creator recommendations yet. Check back after the pilot run.</p>")+"</section></main>";
    return page("/creators","Fashion Creators and Their Verified Shopping Picks",body,"Fashion creators and recent product recommendations, with original source attribution and dated evidence.",200,count>=10?null:"noindex, follow",{kind:"collection",breadcrumb:"Fashion creators"});
  }
  async function source(env,slug){
    const rows=await data(env),m=models(rows),p=m.creators.get(slug);if(!p)return null;
    const unique=new Map();for(const r of p.picks)if(!unique.has(r.product_key))unique.set(r.product_key,r);
    const lines=[...unique.values()].map(r=>"<tr><td>"+esc(r.brand+" "+r.name)+"</td><td>"+esc(CATEGORIES[r.category])+"</td><td><a class='plainLink' href='"+outlink(r.url,"source-"+slug)+"' target='_blank' rel='noopener noreferrer nofollow'>Original article ↗</a></td></tr>").join("");
    const body="<main class='wrap'><section class='hero'><span class='eyebrow'>Fashion source</span><h1>"+esc(p.name)+"</h1><p>"+p.picks.length+" verified product mentions in "+p.urls.size+" recent original articles.</p>"+intro+"</section><section class='section'><div class='tablewrap'><table class='evidenceTable'><thead><tr><th>Product</th><th>Category</th><th>Evidence</th></tr></thead><tbody>"+lines+"</tbody></table></div></section></main>";
    return page("/creators/"+slug,p.name+" — Verified Fashion Recommendations",body,"Products explicitly recommended by "+p.name+" with links to the original dated articles.",200,p.urls.size>=2&&unique.size>=5?null:"noindex, follow",{kind:"collection",breadcrumb:p.name});
  }
  async function categoryPage(env,slug){
    if(!category(slug))return null;
    const rows=await data(env),m=models(rows),c=m.cats[slug],brands=sums(c.brands),products=sums(c.products),sources=c.sources.size;
    const panel=(title,items,min)=>"<section class='section'><h2>"+title+"</h2><div class='tablewrap'><table class='evidenceTable'><thead><tr><th>Name</th><th>Different creator sites</th><th>Original mentions</th></tr></thead><tbody>"+items.filter(x=>x.count>=min).slice(0,35).map(x=>"<tr><td><strong>"+esc(x.label)+"</strong></td><td>"+x.count+"</td><td>"+[...new Map(x.rows.map(r=>[r.source_slug,r])).values()].map(r=>"<a class='plainLink' href='"+outlink(r.url,slug)+"' target='_blank' rel='noopener noreferrer nofollow'>"+esc(r.source_name)+" ↗</a>").join(" · ")+"</td></tr>").join("")+"</tbody></table></div></section>";
    const body="<main class='wrap'><section class='hero'><span class='eyebrow'>Creator shopping edits · last 90 days</span><h1>"+esc(CATEGORIES[slug])+" fashion creators recommend</h1><p>"+sources+" distinct creator sites and "+c.rows.length+" verified mentions. A brand mention is not an endorsement of every product it sells.</p>"+intro+"</section>"+panel("Brands with repeat recommendations",brands,2)+panel("Exact products with three or more sources",products,3)+"</main>";
    const indexable=sources>=5&&brands.some(x=>x.count>=3)&&products.some(x=>x.count>=3);
    return page("/creator-edits/"+slug,CATEGORIES[slug]+" Recommended by Fashion Creators",body,"Brand and exact-product recommendations across fashion creators, sourced to original recent articles.",200,indexable?null:"noindex, follow",{kind:"collection",breadcrumb:CATEGORIES[slug]});
  }
  return {index,source,categoryPage};
}
