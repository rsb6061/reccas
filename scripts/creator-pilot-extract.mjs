// Runs after creator-pilot-discover.mjs; results go to the isolated Cloudflare D1 pilot tables.
// Does not alter Best of Fashion consensus counts.
import {readFileSync,writeFileSync} from "node:fs";
import {fetchPage,mentions,visibleText} from "./verify-sources.mjs";
import {articleText,api,slugify} from "./extract-recommendations.mjs";

const SITE=process.env.RECCAS_SITE||"https://reccas.com";
const LIMIT=Number(process.env.LIMIT||80);
const MAX_PER_SOURCE=Number(process.env.MAX_PER_SOURCE||2);
const today=new Date().toISOString().slice(0,10);
const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
const CATEGORIES=new Set(["coats","knitwear","denim","boots","bags","dresses","shoes","tailoring"]);
const report=JSON.parse(readFileSync("reports/creator-pilot.json","utf8"));
if(!process.env.VERIFY_KEY)throw Error("VERIFY_KEY must be supplied by the rotating credentials step");
const stats={attempted:0,eligible:0,blocked:0,skipped_recent:0,undated:0,failed:0,verified_mentions:0,sponsored:0,nonfashion:0};
const allUrls=new Set();
let recent=new Set();
const check=await api("/_api/admin/creator-pilot/status",{method:"GET"});
if(!check.ok)throw Error("Creator pilot route unavailable / unauthorized: "+check.status);
recent=new Set((check.body.runs||[]).filter(x=>x.checked_on>=new Date(Date.now()-21*86400000).toISOString().slice(0,10)).map(x=>x.url));
const norm=(v)=>String(v||"").toLowerCase().replace(/&amp;/g,"and").replace(/[^a-z0-9]+/g," ").trim();
function strongMention(text,brand,name) {
  if(!mentions(text,brand,name))return false;
  const plain=norm(text),b=norm(brand),n=norm(name),bits=n.split(" ").filter(x=>x.length>2&&!["the","for","and","women","womens","with","from"].includes(x));
  if(!b||!bits.length)return false;
  for(let idx=plain.indexOf(b);idx>=0;idx=plain.indexOf(b,idx+b.length)){
    const local=plain.slice(Math.max(0,idx-170),idx+450);
    if(bits.filter(t=>local.includes(t)).length>=Math.max(1,Math.ceil(bits.length*0.75)))return true;
  }
  return false;
}
function robotsDenied(robots,path){
  if(!robots)return false;
  const groups=robots.split(/\r?\n/);let matched=false,blocked=[];
  for(let raw of groups){
    raw=raw.split("#")[0].trim();const m=raw.match(/^(user-agent|disallow):\s*(.*)$/i);if(!m)continue;
    if(m[1].toLowerCase()==="user-agent"){matched=m[2]==="*"||/ReccasResearchBot/i.test(m[2]);continue}
    if(matched&&m[2])blocked.push(m[2]);
  }
  return blocked.some(x=>x==="/"||path.startsWith(x));
}
const sorted=(report.sources||[]).filter(s=>s.status==="recent_candidate"&&!s.ingest_blocked).sort((a,b)=>a.name.localeCompare(b.name));
// Sample one article per distinct site before second articles from any site.
const todo=[];
outer: for(let round=0;round<MAX_PER_SOURCE;round++)for(const source of sorted){
  const art=source.articles[round];
  if(!art)continue;
  if(allUrls.has(art.url))continue;allUrls.add(art.url);
  if(recent.has(art.url)){stats.skipped_recent++;continue}
  todo.push({source,article:art});
  if(todo.length>=LIMIT)break outer;
}
const robotsCache=new Map();
for(const {source,article} of todo) {
  stats.attempted++;
  const pageUrl=new URL(article.url),site=new URL(source.site);
  if(pageUrl.hostname.replace(/^www\./,"")!==site.hostname.replace(/^www\./,"")){stats.blocked++;continue}
  const feedDate=String(article.date||"").slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(feedDate)||feedDate<cutoff||feedDate>today){stats.undated++;continue}
  if(!robotsCache.has(site.origin)){
    let robots="";try{const r=await fetch(site.origin+"/robots.txt",{signal:AbortSignal.timeout(9000)});if(r.ok)robots=await r.text()}catch{}
    robotsCache.set(site.origin,robots);
  }
  if(robotsDenied(robotsCache.get(site.origin),pageUrl.pathname)){stats.blocked++;continue}
  const page=await fetchPage(article.url);
  if(page.status!=="ok"){stats.blocked++;console.log("blocked "+source.name+": "+article.url);continue}
  const published=page.meta.publishedAt||feedDate;
  if(published<cutoff||published>today){stats.undated++;continue}
  const text=articleText(page.html);
  if(text.length<500){stats.blocked++;continue}
  const ex=await api("/_api/admin/extract",{method:"POST",body:JSON.stringify({creator:true,url:article.url,source:source.name,text})});
  if(!ex.ok){stats.failed++;console.log("extract_failed "+source.name+": "+ex.status+" "+String(ex.body.error||""));continue}
  const products=[],seen=new Set();
  for(const p of ex.body.products||[]){
    const cat=String(p.category||"").toLowerCase(),key=slugify(p.brand+" "+p.name);
    if(!CATEGORIES.has(cat)){stats.nonfashion++;continue}
    if(!key||seen.has(key))continue;seen.add(key);
    const sponsored=p.sponsored===true||(source.own_brands||[]).some(x=>slugify(x)===slugify(p.brand));
    const validated=strongMention(text,p.brand,p.name);
    if(sponsored)stats.sponsored++;
    if(validated&&!sponsored)stats.verified_mentions++;
    products.push({brand:p.brand,name:p.name,category:cat,retailer:p.retailer||"",label:p.label||"",basis:p.basis||"listed",validated,sponsored});
  }
  const saved=await api("/_api/admin/creator-pilot/ingest",{method:"POST",body:JSON.stringify({sourceName:source.name,site:source.site,style:source.style,url:article.url,title:article.title,publishedAt:published,model:ex.body.model,products})});
  if(!saved.ok){stats.failed++;console.log("save_failed "+source.name+": "+saved.status+" "+String(saved.body.error||""));continue}
  stats.eligible++;
  console.log(source.name+": "+products.filter(p=>p.validated&&!p.sponsored).length+" verified picks / "+article.url);
}
const r=await fetch(SITE+"/_api/creator-pilot/summary");
let live=null;try{live=await r.json()}catch{}
writeFileSync("reports/creator-pilot-ingest.json",JSON.stringify({run_at:new Date().toISOString(),stats,live},null,2)+"\n");
console.log("PILOT_INGEST "+JSON.stringify(stats));
console.log("PILOT_LIVE "+JSON.stringify(live));
