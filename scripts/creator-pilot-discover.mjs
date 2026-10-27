// Independent creator pilot: discovery / recent-post candidates only.
// No source is counted from this file until product evidence is verified separately.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const seed=JSON.parse(readFileSync(new URL("../data/creator-pilot-sources.json",import.meta.url),"utf8"));
const days=Number(process.env.DAYS||90),limit=Number(process.env.LIMIT||100);
const cutoff=Date.now()-days*86400000;
const signal=/coat|jacket|jean|denim|sweater|knit|boot|bag|loaf|flat|blazer|dress|shopping|edit|wardrobe|outfit|what.to.buy|favorite|things.i|fall.fashion|fall.style/i;
const strip=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&[^;]{1,10};/g," ").replace(/\s+/g," ").trim();
const norm=u=>{try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:null}catch{return null}};
const candidates=[];
async function fetchText(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{"user-agent":"ReccasResearchBot/1.0 (+https://reccas.com/about)","accept":"application/rss+xml,application/atom+xml,application/xml,text/xml,text/html"}});if(!r.ok)return null;const t=await r.text();return t.slice(0,400000)}catch{return null}}
function robotsDisallow(text,path){if(!text)return false;let relevant=false,deny=[];for(const raw of text.split(/\r?\n/)){const line=raw.split("#")[0].trim(),m=line.match(/^(user-agent|disallow|allow):\s*(.*)$/i);if(!m)continue;if(m[1].toLowerCase()==="user-agent"){relevant=m[2]==="*"||/ReccasResearchBot/i.test(m[2]);continue}if(relevant&&m[1].toLowerCase()==="disallow"&&m[2])deny.push(m[2])}return deny.some(d=>d==="/"||path.startsWith(d))}
function feedRows(xml,base){let parts=[...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(x=>x[1]);if(!parts.length)parts=[...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map(x=>x[1]);return parts.map(item=>{const v=tag=>(item.match(new RegExp("<"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+tag+">","i"))||[])[1]||"";const atom=(item.match(/<link[^>]*href=["']([^"']+)["']/i)||[])[1];const title=strip(v("title")),date=v("pubDate")||v("published")||v("updated")||v("dc:date");return {title,url:norm(atom||strip(v("link")))||null,date:(Number.isFinite(Date.parse(strip(date))) ? new Date(strip(date)).toISOString() : null)}}).filter(x=>x.url&&x.title).map(x=>({...x,url:new URL(x.url,base).href}))}
async function inspect(s){let base;try{base=new URL(s.site)}catch{return {...s,status:"invalid_url",articles:[]}}const robots=await fetchText(base.origin+"/robots.txt");if(robotsDisallow(robots,"/"))return {...s,status:"robots_disallowed",articles:[]};let rows=[],feed=null;for(const path of ["/feed/","/feed","/rss.xml","/atom.xml"]){if(robotsDisallow(robots,path))continue;const xml=await fetchText(base.origin+path);if(!xml||!/<(?:rss|feed|rdf:RDF)\b/i.test(xml))continue;feed=base.origin+path;try{rows=feedRows(xml,base.origin)}catch{}if(rows.length)break}
const dated=rows.map(r=>({...r,parsed:Date.parse(r.date)})).filter(r=>Number.isFinite(r.parsed)&&r.parsed>=cutoff&&r.parsed<=Date.now()+86400000);
const articles=dated.filter(r=>signal.test(r.title)).map(({title,url,date})=>({title,url,date})).slice(0,30);
return {...s,status:articles.length?"recent_candidate":feed?"no_recent_shopping_posts":"feed_not_found",feed,articles}}
let next=0;async function worker(){while(next<Math.min(seed.sources.length,limit)){let i=next++;candidates[i]=await inspect(seed.sources[i]);console.log(candidates[i].name+": "+candidates[i].status+" ("+candidates[i].articles.length+" posts)")}}
await Promise.all(Array.from({length:Math.min(4,limit)},worker));
const sources=candidates.filter(Boolean);
const summary={scanned:sources.length,recent_sources:sources.filter(x=>x.status==="recent_candidate").length,recent_post_candidates:sources.reduce((n,x)=>n+x.articles.length,0),verified_recommendations:0,window_days:days,run_at:new Date().toISOString()};
mkdirSync("reports",{recursive:true});writeFileSync("reports/creator-pilot.json",JSON.stringify({summary,sources},null,2)+"\n");
console.log(JSON.stringify(summary));