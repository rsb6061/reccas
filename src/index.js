import bcrypt from "bcryptjs";
import {STATIC_EDITS} from "./static-edits.js";
const STATIC_COLLECTIONS = {
  "/what-to-wear-by-temperature":["What to Wear by Temperature","Practical outfit ideas organized by temperature and weather."],
  "/capsule-wardrobes":["Capsule Wardrobes","Seasonal capsules built around complete, repeatable outfits."],
  "/wedding-guest-dresses-by-color":["Wedding Guest Dresses by Color","Wedding guest dress ideas organized by color, season and dress code."],
  "/travel-packing-guides":["Travel Outfit & Packing Guides","Destination outfits and packing lists by city, season and trip length."],
  "/outfit-formulas":["Outfit Formulas","Repeatable outfit structures for easier everyday dressing."]
};
const EVENT_LABELS = {
  black_tie:"Black Tie", casual:"Casual", date_night:"Date Night", party:"Party",
  vacation:"Vacation", wedding:"Wedding", work_event:"Work Event"
};
const COOKIE="reccas_session";
const OAUTH_STATE_COOKIE="reccas_oauth_state";
const AUTH_RETURN_COOKIE="reccas_auth_return";
const FAVICON_B64="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";
const css=String.raw`
:root{
  --ink:#1b153c;
  --muted:#6e6882;
  --line:#d9d3ef;
  --blue:#4255ff;
  --cream:#f7f0e6;
  --paper:#fffdf9;
  --soft:#f0ecff;
  --green:#2f8c56;
  --lavender:#d8d2ff;
  --display:"Iowan Old Style","Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;
}
*{box-sizing:border-box}
html{background:var(--cream)}
body{margin:0;background:var(--cream);color:var(--ink);font-family:"Avenir Next","Helvetica Neue",Helvetica,Arial,ui-sans-serif,system-ui,sans-serif;line-height:1.5;letter-spacing:-.01em;-webkit-font-smoothing:antialiased}
body.drawer-open{overflow:hidden}
a{color:inherit;text-decoration:none}
header{position:sticky;top:0;z-index:20;padding:16px 0;background:rgba(247,240,230,.92);backdrop-filter:blur(12px)}
.nav{max-width:1180px;margin:auto;min-height:58px;padding:8px 10px 8px 18px;display:flex;align-items:center;gap:24px;background:rgba(255,255,255,.72);border:1px solid var(--lavender);border-radius:999px;box-shadow:0 8px 24px rgba(41,32,89,.06);backdrop-filter:blur(10px)}
.brand{font-size:20px;font-weight:550;letter-spacing:-.03em;white-space:nowrap}
.navlinks{margin-left:auto;display:flex;align-items:center;gap:4px;font-size:14px}
.navlinks a{padding:9px 12px;border-radius:999px;color:#514b65}
.navlinks a:hover,.navlinks a:focus{background:#efeaff;color:var(--ink)}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 20px;border:1px solid var(--blue);border-radius:999px;background:var(--blue);color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 5px 14px rgba(66,85,255,.16);transition:transform .14s ease,box-shadow .14s ease,background .14s ease}
.btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(66,85,255,.23)}
.btn.alt{background:rgba(255,255,255,.78);color:var(--ink);border-color:var(--lavender);box-shadow:none}
.wrap{max-width:1180px;margin:auto;padding:12px 24px 84px}
.hero{padding:56px 0 34px;max-width:930px}
.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:var(--blue);font-weight:750;margin-bottom:8px}
.hero h1,h1,h2,h3,.drawerTitle,.card h3,.shopcard h3,.guideTile h3,.editCopy h2,.editIntro h2,.editMethod h2,.auth h1,.drawerTotal strong{font-family:var(--display);color:var(--ink);font-weight:400}
.hero h1{font-size:clamp(44px,6vw,56px);line-height:.96;letter-spacing:-.04em;margin:0 0 14px}
.hero p{font-size:17px;line-height:1.55;color:#615b74;max-width:800px;margin:0}
h2{font-size:34px;line-height:1.02;letter-spacing:-.03em}
h3{font-size:23px;line-height:1.1;letter-spacing:-.025em}
.muted{color:var(--muted)}
.ask{display:flex;gap:8px;max-width:800px;margin-top:24px;padding:7px;border:1px solid var(--lavender);border-radius:999px;background:rgba(255,255,255,.76);box-shadow:0 8px 24px rgba(41,32,89,.045)}
.ask input,.field{width:100%;min-height:48px;border:1px solid var(--lavender);border-radius:16px;padding:12px 14px;background:rgba(255,255,255,.88);color:var(--ink);font:inherit;outline:none}
.ask input{border:0;border-radius:999px;background:transparent;padding-left:16px}
.ask input:focus,.field:focus{border-color:#aa98ef;box-shadow:0 0 0 3px rgba(66,85,255,.09)}
.grid,.guideGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(290px,100%),1fr));gap:18px}
.card,.guideTile,.shopcard,.editPick,.auth,.metric,.tablewrap{border:1px solid var(--lavender);border-radius:26px;background:rgba(255,255,255,.82);box-shadow:0 10px 28px rgba(41,32,89,.055)}
.grid>.card:nth-child(4n+1),.guideGrid>.guideTile:nth-child(4n+1){background:linear-gradient(145deg,#f8fbff 0%,#edf4ff 100%);border-color:#d9e0ff}
.grid>.card:nth-child(4n+2),.guideGrid>.guideTile:nth-child(4n+2){background:linear-gradient(145deg,#f8fdf9 0%,#e9f8ef 100%);border-color:#d0eadb}
.grid>.card:nth-child(4n+3),.guideGrid>.guideTile:nth-child(4n+3){background:linear-gradient(145deg,#fdfbff 0%,#eeeaff 100%);border-color:#ddd6ff}
.grid>.card:nth-child(4n+4),.guideGrid>.guideTile:nth-child(4n+4){background:linear-gradient(145deg,#fffaf6 0%,#ffefe4 100%);border-color:#f1d8c8}
.card{padding:24px;min-height:150px;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.card:hover,.guideTile:hover,.outfit:hover,.shopcard:hover{transform:translateY(-3px);border-color:#aa98ef;box-shadow:0 16px 36px rgba(41,32,89,.095)}
.card h3{font-size:23px;margin:8px 0 10px}
.card p{color:#625c75;font-size:15px;line-height:1.55;margin:0 0 10px}
.section{margin-top:44px}
.section h2{margin-bottom:18px}
.outfits{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(290px,100%),1fr));gap:18px}
.outfit{background:rgba(255,255,255,.82);border:1px solid var(--lavender);border-radius:26px;overflow:hidden;cursor:pointer;box-shadow:0 10px 28px rgba(41,32,89,.05);transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.imgs{display:grid;grid-template-columns:1fr 1fr;aspect-ratio:1/1;background:#efeaff}
.imgs img{width:100%;height:100%;object-fit:cover}
.outfit .copy{padding:20px}
.outfit h3{margin:0 0 7px;font-family:var(--display);font-size:23px;font-weight:400}
.outfitFormula{font-size:13px;color:var(--muted);margin:0 0 10px;line-height:1.45}
.outfitMeta{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:13px;padding-top:12px;border-top:1px solid #e7e1f5;font-size:13px;color:var(--muted)}
.viewCue{font-weight:600;color:var(--blue)}
.pill,.guidePill,.editMetrics span,.editSource,.editRank{display:inline-flex;align-items:center;gap:5px;border:1px solid #ddd6ff;border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.72);color:#514b65;font-size:12px;line-height:1.2;text-decoration:none}
.guideRoundups{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
.guidePill{padding:8px 12px;font-size:13px;font-weight:600}
.guidePill:hover{background:#efeaff;border-color:#aa98ef}
.guidePill span{color:#77708b}
.guideTile{padding:24px;min-height:220px;display:flex;flex-direction:column;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.guideTile h3{font-size:25px;line-height:1.08;margin:0 0 10px}
.guideTile p{font-size:15px;line-height:1.55;color:#625c75;margin:0 0 18px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.guideTile strong{margin-top:auto;color:var(--blue);font-size:14px}
.guideCount{font-size:13px;color:var(--muted);margin:-8px 0 18px}
.shopgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:18px}
.shopcard{padding:16px;display:flex;flex-direction:column;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.shopcard img{width:100%;aspect-ratio:4/5;object-fit:contain;background:#f3efff;border-radius:18px;padding:12px}
.shopcard h3{font-size:21px;margin:10px 0 5px}
.shopcard .btn{margin-top:auto;align-self:flex-start}
.productBrand,.editBrand{text-transform:uppercase;letter-spacing:.08em;font-size:10px;color:var(--blue);font-weight:750;margin-top:12px}
.productNote,.editNote{font-size:13px;line-height:1.5;color:var(--muted)}
.empty,.notice{border:1px solid var(--lavender);border-radius:20px;padding:18px 20px;background:rgba(255,255,255,.78);color:var(--muted)}
.list{display:grid;gap:0}
.row{padding:16px 0;border-bottom:1px solid #e7e1f5;display:flex;justify-content:space-between;gap:12px}
.drawerOverlay{position:fixed;inset:0;background:rgba(27,21,60,.24);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:30}
.drawerOverlay.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;width:min(520px,100vw);height:100vh;background:var(--cream);border-left:1px solid var(--lavender);box-shadow:-18px 0 50px rgba(27,21,60,.14);transform:translateX(102%);transition:transform .22s ease;z-index:31;display:flex;flex-direction:column}
.drawer.open{transform:translateX(0)}
.drawerHead{padding:20px 22px 17px;border-bottom:1px solid var(--lavender);display:flex;align-items:flex-start;justify-content:space-between;gap:18px;background:rgba(255,255,255,.82)}
.drawerTitle{font-size:30px;line-height:1.06;margin:0}
.drawerClose{border:0;background:transparent;color:var(--muted);font-size:28px;cursor:pointer}
.drawerBody{overflow:auto;padding:20px 22px 28px;flex:1}
.drawerDescription{color:var(--muted);line-height:1.55}
.drawerItem{display:grid;grid-template-columns:66px minmax(0,1fr) auto;gap:13px;align-items:center;padding:13px 0;border-top:1px solid #e7e1f5}
.drawerItem img{width:66px;height:82px;object-fit:contain;background:#efeaff;border-radius:14px}
.drawerFoot{padding:16px 22px 20px;border-top:1px solid var(--lavender);background:rgba(255,255,255,.82)}
.editMetrics{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
.editIntro{display:grid;grid-template-columns:.8fr 1.2fr;gap:42px;padding:30px 0;border-top:1px solid var(--lavender);border-bottom:1px solid var(--lavender);margin:10px 0 28px}
.editIntro h2{font-size:34px;margin:4px 0}
.editIntro p{margin:0;color:#625c75;line-height:1.65}
.editList{display:grid;gap:22px}
.editPick{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);overflow:hidden}
.editVisual{position:relative;background:#efeaff;min-height:340px;display:flex;align-items:center;justify-content:center}
.editVisual img{display:block;width:100%;height:100%;max-height:410px;object-fit:contain;padding:22px}.editVisualFallback{display:flex;align-items:center;justify-content:center;width:100%;min-height:340px;padding:28px;text-align:center;font-family:var(--display);font-size:28px;color:var(--muted)}
.editRank{position:absolute;top:14px;left:14px;font-weight:700}
.watchControl{position:absolute;top:20px;right:20px;z-index:3;width:118px;display:flex;flex-direction:column;align-items:center;gap:5px}
.watchBtn{width:32px;height:32px;border:0;background:transparent;padding:1px;display:grid;place-items:center;color:var(--ink);cursor:pointer;transition:transform .16s ease,color .16s ease}
.watchBtn:hover{transform:translateY(-1px)}
.watchBtn svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round;transition:fill .16s ease,transform .16s ease}
.watchBtn.active svg{fill:currentColor}
.watchLabel{border:0;background:transparent;padding:0;color:var(--muted);font-size:11px;line-height:1.2;text-align:center;cursor:pointer}
.watchControl:hover .watchLabel{color:var(--ink)}
.watchModalOverlay{position:fixed;inset:0;background:rgba(27,21,60,.28);backdrop-filter:blur(3px);z-index:70;display:none;align-items:center;justify-content:center;padding:20px}
.watchModalOverlay.open{display:flex}
.watchModal{width:min(430px,100%);background:var(--cream);border:1px solid var(--lavender);border-radius:26px;padding:26px;box-shadow:0 30px 80px rgba(27,21,60,.22);position:relative}
.watchModal h2{font-size:32px;margin:4px 0 10px}
.watchModalClose{position:absolute;top:13px;right:13px;border:0;background:transparent;font-size:26px;color:var(--muted);cursor:pointer}
.watchModalActions{display:grid;gap:10px;margin-top:20px}
.watchToast{position:fixed;right:20px;bottom:20px;z-index:80;background:var(--ink);color:#fff;border-radius:999px;padding:11px 15px;font-size:13px;box-shadow:0 12px 34px rgba(27,21,60,.2);opacity:0;transform:translateY(8px);pointer-events:none;transition:.18s}
.watchToast.show{opacity:1;transform:translateY(0)}
.editCopy{position:relative;padding:28px 142px 28px 30px;display:flex;flex-direction:column}
.editTop{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.editCopy h2{font-size:34px;line-height:1.02;margin:0}
.editPrice{font-size:15px;white-space:nowrap;color:#514b65}
.editLive{font-size:12px;color:var(--green);margin-top:12px}
.editSummary{font-size:15px;line-height:1.6;color:#514b65;margin:20px 0 14px}
.editSources{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 16px}
.editActions{margin-top:auto;display:flex;align-items:center;gap:12px}
.editMethod{margin-top:36px;padding:28px;border:1px solid var(--lavender);background:rgba(255,255,255,.7);border-radius:24px}
.editMethod h2{font-size:30px;margin:4px 0 8px}
.auth{max-width:520px;margin:48px auto;padding:28px}
.auth h1{font-size:42px;margin:0 0 10px}
.stack{display:grid;gap:12px}
.wardrobe-head{display:flex;align-items:end;justify-content:space-between;gap:20px}
.closet{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.closet .card{min-height:0}
.closet img{width:100%;aspect-ratio:4/5;object-fit:cover;background:#efeaff;border-radius:18px;margin-bottom:10px}
.breadcrumbs{max-width:1180px;margin:0 auto;padding:0 24px 4px;display:flex;gap:8px;align-items:center;color:var(--muted);font-size:12px}.breadcrumbs a{color:var(--blue);font-weight:600}.breadcrumbs span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.footer{border-top:1px solid var(--lavender);padding:48px 24px;background:rgba(255,255,255,.55);color:#514b65;font-size:13px}
.footer-inner{max-width:1180px;margin:auto;display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:start}
.footer-brand{font-family:var(--display);font-size:28px;color:var(--ink);letter-spacing:-.03em;margin-bottom:8px}
.footer-links{display:flex;justify-content:flex-end;gap:16px;flex-wrap:wrap}
.footer-links a:hover{color:var(--blue)}
@media(max-width:760px){
  header{padding:10px 12px}
  .nav{min-height:54px;padding:7px 8px 7px 14px;gap:10px}
  .navlinks{display:none}
  .brand{font-size:18px}
  .btn{min-height:40px;padding:9px 14px}
  .wrap{padding-left:18px;padding-right:18px}
  .hero{padding-top:36px}
  .hero h1{font-size:42px}
  .ask{display:block;border-radius:22px}
  .ask .btn{width:100%;margin-top:8px}
  .wardrobe-head{display:block}
  .editIntro,.editPick{grid-template-columns:1fr}
  .editIntro{gap:10px}
  .editCopy{padding:22px 132px 22px 20px}
  .watchControl{top:16px;right:14px;width:108px}
  .drawer{width:100vw}
  .footer-inner{grid-template-columns:1fr}
  .footer-links{justify-content:flex-start}
}
`;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function money(v){var n=Number(v);return Number.isFinite(n)?"$"+n.toFixed(n%1?2:0):""}
function cookieMap(request){var out={};var h=request.headers.get("cookie")||"";h.split(";").forEach(function(x){var i=x.indexOf("=");if(i>0)out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim())});return out}
function safeReturnTo(v){var x=String(v||"/").trim();if(!x.startsWith("/")||x.startsWith("//")||x.indexOf("\\")>=0)return"/";return x.slice(0,800)}
function randHex(bytes){var a=new Uint8Array(bytes);crypto.getRandomValues(a);return Array.from(a).map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
function b64url(bytes){var s="";bytes.forEach(function(b){s+=String.fromCharCode(b)});return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sha256(s){return new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))}
function metaDescription(v){var x=String(v||"").replace(/\s+/g," ").trim();if(!x)return"Reccas is an AI wardrobe manager and closet-aware personal stylist for deciding what to wear, what to buy, what to skip, and what to watch.";if(x.length<=165)return x;var y=x.slice(0,162),i=y.lastIndexOf(" ");return (i>120?y.slice(0,i):y)+"…"}
function guideMetaDescription(r){var raw=String(r.intro_text||r.description||"").replace(/\s+/g," ").trim(),awkward=/\?|^(looking for|attending|building|need |i need|i'm |i am |going to|heading to|what are|trying to)/i.test(raw);if(raw&&!awkward&&raw.length>=75)return metaDescription(raw);var title=String(r.title||"this outfit guide"),event=String(r.event_type||"style").replaceAll("_"," ");if(event==="wedding")return metaDescription("Explore "+title.toLowerCase()+" with complete wedding guest outfit ideas, dresses, shoes and accessories, plus closet-first styling guidance from Reccas.");if(event==="vacation")return metaDescription("Plan "+title.toLowerCase()+" with complete travel outfits, packing-friendly pieces and closet-first styling guidance from Reccas.");if(event==="work event")return metaDescription("Explore "+title.toLowerCase()+" with polished work outfit ideas, complete looks and closet-first styling guidance from Reccas.");return metaDescription("Explore "+title.toLowerCase()+" with complete outfit ideas, shoppable pieces and closet-first styling guidance from Reccas.");}
function page(path,title,body,desc,status,robots,extra){
  extra=extra||{};
  var description=metaDescription(desc),url="https://reccas.com"+path,fullTitle=/\|\s*Reccas\s*$/i.test(String(title))?String(title):String(title)+" | Reccas";
  var graph=[
    {"@type":"Organization","@id":"https://reccas.com/#organization",name:"Reccas",url:"https://reccas.com/",description:"Reccas is an AI wardrobe manager and closet-aware personal stylist that builds outfits from what you own and recommends what to buy, skip, save, or watch."},
    {"@type":"WebSite","@id":"https://reccas.com/#website",name:"Reccas",url:"https://reccas.com/",publisher:{"@id":"https://reccas.com/#organization"}}
  ];
  var type=extra.kind==="article"?"Article":extra.kind==="collection"?"CollectionPage":"WebPage";
  var main={"@type":type,"@id":url+"#page",url:url,name:String(title),description:description,isPartOf:{"@id":"https://reccas.com/#website"},about:{"@id":"https://reccas.com/#organization"}};
  if(extra.kind==="article"){main.headline=String(extra.headline||title);main.author={"@id":"https://reccas.com/#organization"};main.publisher={"@id":"https://reccas.com/#organization"};if(extra.published)main.datePublished=String(extra.published);if(extra.modified)main.dateModified=String(extra.modified);if(extra.image)main.image=[String(extra.image)]}
  graph.push(main);
  if(path!=="/"&&String(robots||"").indexOf("noindex")<0)graph.push({"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Reccas",item:"https://reccas.com/"},{"@type":"ListItem",position:2,name:String(extra.breadcrumb||title),item:url}]});
  if(Array.isArray(extra.schema))extra.schema.forEach(function(x){if(x)graph.push(x)});
  var schema=JSON.stringify({"@context":"https://schema.org","@graph":graph}).replace(/</g,"\\u003c");
  var icon="/favicon-r.png?v=20261007",robotText=robots||"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",ogType=extra.kind==="article"?"article":"website";
  var image=extra.image?String(extra.image):"";
  var head="<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>"+esc(fullTitle)+"</title><meta name='description' content='"+esc(description)+"'><meta name='robots' content='"+esc(robotText)+"'><meta name='googlebot' content='"+esc(robotText)+"'><meta name='application-name' content='Reccas'><meta name='theme-color' content='#f7f0e6'><link rel='canonical' href='"+esc(url)+"'><link rel='manifest' href='/manifest.json?v=20261007'><link rel='icon' type='image/png' sizes='128x128' href='"+icon+"'><link rel='shortcut icon' href='"+icon+"'><link rel='apple-touch-icon' href='"+icon+"'><meta property='og:site_name' content='Reccas'><meta property='og:type' content='"+ogType+"'><meta property='og:title' content='"+esc(fullTitle)+"'><meta property='og:description' content='"+esc(description)+"'><meta property='og:url' content='"+esc(url)+"'>"+(image?"<meta property='og:image' content='"+esc(image)+"'>":"")+"<meta name='twitter:card' content='"+(image?"summary_large_image":"summary")+"'><meta name='twitter:title' content='"+esc(fullTitle)+"'><meta name='twitter:description' content='"+esc(description)+"'>"+(image?"<meta name='twitter:image' content='"+esc(image)+"'>":"")+"<script type='application/ld+json'>"+schema+"</script><script type='text/javascript'>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','yu1hc4t3ym');</script><style>"+css+"</style></head><body>";
  var nav="<header><div class='nav'><a class='brand' href='/'>Reccas</a><nav class='navlinks'><a href='/recommendations'>Recommendations</a><a href='/guides'>Style guides</a><a href='/wardrobe'>Wardrobe</a><a href='/about'>About</a></nav><a class='btn alt' href='/recommendations'>What’s worth buying</a></div></header>";
  var crumb=path!=="/"&&String(robotText).indexOf("noindex")<0?"<div class='breadcrumbs'><a href='/'>Reccas</a><span>›</span><span>"+esc(extra.breadcrumb||title)+"</span></div>":"";
  var foot="<footer class='footer'><div class='footer-inner'><div><div class='footer-brand'>Reccas</div><div>Evidence-backed fashion recommendations: what editors and testers keep recommending, what is still available, and what is actually worth buying.</div></div><nav class='footer-links'><a href='/recommendations'>Recommendations</a><a href='/guides'>Style guides</a><a href='/wardrobe'>Wardrobe</a><a href='/about'>About</a><a href='/privacy'>Privacy</a><a href='/llms.txt'>llms.txt</a></nav></div></footer></body></html>";
  return new Response(head+nav+crumb+body+foot,{status:status||200,headers:{"content-type":"text/html; charset=utf-8","cache-control":status===404?"no-store":"public, max-age=120","x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin"}});
}
async function one(db,sql){var args=[].slice.call(arguments,2),stmt=db.prepare(sql);if(args.length)stmt=stmt.bind.apply(stmt,args);return (await stmt.first())||null}
async function all(db,sql){var args=[].slice.call(arguments,2);var stmt=db.prepare(sql);if(args.length)stmt=stmt.bind.apply(stmt,args);return (await stmt.all()).results||[]}
async function sessionUser(request,env){
  var sid=cookieMap(request)[COOKIE]; if(!sid)return null;
  var row=await env.DB.prepare("SELECT s.id session_id,s.expires_at,u.id,u.email,u.display_name,u.username_slug,u.avatar_url,u.bio,u.reputation_score FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? LIMIT 1").bind(sid).first();
  if(!row)return null;
  if(row.expires_at&&Date.parse(String(row.expires_at))<Date.now()){await env.DB.prepare("DELETE FROM sessions WHERE id=?").bind(sid).run();return null}
  await env.DB.prepare("UPDATE sessions SET last_accessed=? WHERE id=?").bind(new Date().toISOString(),sid).run();
  return {sessionId:sid,user:{id:row.id,email:row.email,displayName:row.display_name,usernameSlug:row.username_slug,avatarUrl:row.avatar_url,bio:row.bio,reputationScore:row.reputation_score}};
}
function sessionCookie(id){return COOKIE+"="+encodeURIComponent(id)+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800"}
async function pbkdf2Hash(password){
  var salt=crypto.getRandomValues(new Uint8Array(16)),iterations=210000;
  var key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  var bits=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:salt,iterations:iterations,hash:"SHA-256"},key,256));
  return "pbkdf2$"+iterations+"$"+b64url(salt)+"$"+b64url(bits);
}
function fromB64url(s){
  var x=String(s).replace(/-/g,"+").replace(/_/g,"/");while(x.length%4)x+="=";
  var raw=atob(x),out=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
}
async function pbkdf2Verify(password,stored){
  var p=String(stored||"").split("$");if(p.length!==4||p[0]!=="pbkdf2")return false;
  var iterations=Number(p[1]),salt=fromB64url(p[2]),expected=fromB64url(p[3]);
  var key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  var actual=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:salt,iterations:iterations,hash:"SHA-256"},key,expected.length*8));
  if(actual.length!==expected.length)return false;var diff=0;for(var i=0;i<actual.length;i++)diff|=actual[i]^expected[i];return diff===0;
}
async function createSession(env,userId){
  var sid=randHex(32),now=new Date().toISOString(),expires=new Date(Date.now()+604800000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(id,user_id,created_at,last_accessed,expires_at) VALUES(?,?,?,?,?)").bind(sid,userId,now,now,expires).run();
  return sid;
}
async function readAuthBody(request){
  var ct=request.headers.get("content-type")||"";
  if(ct.indexOf("application/json")>=0)return await request.json();
  var f=await request.formData();return Object.fromEntries(f.entries());
}
function arr(v){if(Array.isArray(v))return v;if(v==null||v==="")return[];try{var x=JSON.parse(v);return Array.isArray(x)?x:[]}catch(_){return[]}}
function norm(v){return String(v||"").trim().toLowerCase()}
function any(text,words){for(var i=0;i<words.length;i++)if(text.indexOf(words[i])>=0)return true;return false}
function wSlot(item){
  var text=norm(item.category)+" "+norm(item.title);
  if(any(text,["dress","jumpsuit","romper"]))return"dress";
  if(any(text,["coat","jacket","blazer","trench","cardigan","overshirt","vest"]))return"layer";
  if(any(text,["shoe","sneaker","loafer","heel","pump","sandal","boot","flat","mule","slipper"]))return"shoe";
  if(any(text,["bag","handbag","tote","clutch","purse","crossbody"]))return"bag";
  if(any(text,["pant","trouser","jean","denim","skirt","short","legging"]))return"bottom";
  if(any(text,["top","shirt","blouse","tee","t-shirt","sweater","knit","crewneck","tank","camisole","polo"]))return"top";
  return"other";
}
function wWarmth(item){
  if(item.warmth!=null)return Number(item.warmth);
  var text=norm(item.title)+" "+norm(item.material)+" "+norm(item.category);
  if(any(text,["puffer","parka","wool coat","cashmere","heavy","fleece"]))return 5;
  if(any(text,["coat","sweater","knit","boot","cardigan","wool"]))return 4;
  if(any(text,["jacket","blazer","jean","trouser","long sleeve"]))return 3;
  if(any(text,["sandal","tank","short","linen","silk","sleeveless"]))return 1;
  return 2;
}
function wFormality(item){
  if(item.formality!=null)return Number(item.formality);
  var text=norm(item.title)+" "+norm(item.category);
  if(any(text,["gown","tux","black tie","evening"]))return 5;
  if(any(text,["heel","pump","blazer","silk","satin","dress","trouser"]))return 4;
  if(any(text,["loafer","skirt","blouse","cardigan","knit"]))return 3;
  if(any(text,["jean","sneaker","tee","denim","short"]))return 2;
  return 3;
}
function wIntent(prompt){
  var p=String(prompt||"").toLowerCase(),m=p.match(/(-?\d{1,3})\s*(?:°|degrees?\s*f?|f\b)/i),temp=m?Number(m[1]):null,occasion="casual daytime";
  if(any(p,["work","office","meeting","conference"]))occasion="work";
  else if(any(p,["date","dinner","restaurant"]))occasion="dinner/date";
  else if(any(p,["travel","flight","airport","plane","train"]))occasion="travel";
  else if(any(p,["party","cocktail","wedding","event","birthday"]))occasion="party";
  var formal=occasion==="party"?4:(occasion==="work"||occasion==="dinner/date"?3.5:2.5);
  if(any(p,["casual","relaxed","easy","weekend"]))formal-=0.75;else if(any(p,["formal","polished","dressy","black tie","cocktail"]))formal+=0.5;
  var warmth=temp==null?2.5:(temp<=45?5:temp<=55?4:temp<=65?3:temp<=73?2:1);
  var um=p.match(/use my ([^,.!]+)/i);
  return{prompt:prompt,occasion:occasion,temperatureF:temp,targetFormality:formal,targetWarmth:warmth,wantsLayer:temp!=null?temp<=66:any(p,["cold","cool","chilly","fall","winter","layer"]),noHeels:any(p,["no heels","without heels","flat shoes","comfortable shoes","stiletto"]),mustInclude:um&&um[1]?um[1].trim():null};
}
function wScore(item,intent,profile,history){
  var brand=norm(item.brand),color=norm(item.color),material=norm(item.material),title=norm(item.title);
  if(profile.avoidBrands.some(function(v){return brand.indexOf(norm(v))>=0}))return-100;
  if(profile.avoidMaterials.some(function(v){v=norm(v);return material.indexOf(v)>=0||title.indexOf(v)>=0}))return-100;
  if(intent.noHeels&&any(title,["heel","pump","stiletto"]))return-100;
  var score=10+Math.max(-3,Math.min(4,Number(history||0)));
  if(profile.favoriteBrands.some(function(v){return brand.indexOf(norm(v))>=0}))score+=2;
  if(profile.preferredColors.some(function(v){return color.indexOf(norm(v))>=0}))score+=1.5;
  if(profile.preferredMaterials.some(function(v){return material.indexOf(norm(v))>=0}))score+=1;
  score-=Math.abs(wFormality(item)-intent.targetFormality)*1.2;score-=Math.abs(wWarmth(item)-intent.targetWarmth)*0.55;
  if(intent.occasion==="work"&&any(title,["blazer","trouser","loafer","shirt","blouse"]))score+=1.5;
  if(intent.occasion==="dinner/date"&&any(title,["dress","skirt","heel","loafer","silk","satin"]))score+=1;
  if(intent.occasion==="travel"&&any(title,["sneaker","knit","cardigan","jean","trouser"]))score+=1.5;
  return score;
}
function wReadiness(items){var s=new Set(items.map(wSlot).filter(function(x){return x!=="other"}));return{ready:items.length>=5&&s.size>=3,strong:items.length>=12&&s.size>=4,itemCount:items.length,categoryCount:s.size,slots:Array.from(s)}}
function wTargets(mod){var t=String(mod||"").toLowerCase();if(any(t,["shoe","heel","sneaker","loafer"]))return["shoe"];if(t.indexOf("except")>=0&&any(t,["jacket","coat","layer"]))return["layer"];if(any(t,["jacket","coat","layer","warmer"]))return["layer","top"];if(any(t,["bag","purse","clutch"]))return["bag"];if(any(t,["top","shirt","sweater"]))return["top"];if(any(t,["bottom","pant","trouser","skirt","jean"]))return["bottom"];if(any(t,["more casual","less dressy"]))return["top","dress","layer","shoe"];return[]}
function wGenerate(items,prompt,profile,lockedIds,history,formulaBoosts){
  var intent=wIntent(prompt),valid=items.filter(function(x){return wScore(x,intent,profile,history[x.id]||0)>-50});
  function ranked(slot){return valid.filter(function(x){return wSlot(x)===slot}).map(function(x){return{item:x,score:wScore(x,intent,profile,history[x.id]||0)}}).sort(function(a,b){return b.score-a.score}).slice(0,6)}
  var pools={top:ranked("top"),bottom:ranked("bottom"),dress:ranked("dress"),layer:ranked("layer"),shoe:ranked("shoe"),bag:ranked("bag")},locked=new Set(lockedIds||[]),c=[];
  function push(parts,formula){var present=parts.filter(Boolean);if(!present.length)return;if(locked.size&&Array.from(locked).some(function(id){return !present.some(function(p){return String(p.item.id)===String(id)})}))return;
    if(intent.mustInclude){var needle=intent.mustInclude.split(/\s+/).filter(function(w){return w.length>2}),joined=present.map(function(p){return(norm(p.item.title)+" "+norm(p.item.color)+" "+norm(p.item.brand))}).join(" ");if(needle.length&&!needle.every(function(w){return joined.indexOf(w)>=0}))return}
    var ids=new Set(present.map(function(p){return String(p.item.id)}));if(ids.size!==present.length)return;var slots=Array.from(new Set(present.map(function(p){return wSlot(p.item)}))).sort().join("+");
    c.push({items:present.map(function(p){return p.item}),score:present.reduce(function(s,p){return s+p.score},0)+(formulaBoosts[slots]||0)*0.35,formula:formula});
  }
  pools.top.slice(0,5).forEach(function(top){pools.bottom.slice(0,5).forEach(function(bottom){pools.shoe.slice(0,4).forEach(function(shoe){if(intent.wantsLayer&&pools.layer.length)pools.layer.slice(0,2).forEach(function(layer){push([top,bottom,shoe,layer,pools.bag[0]],"separates + layer")});else push([top,bottom,shoe,pools.bag[0]],"separates")})})});
  pools.dress.slice(0,6).forEach(function(dress){pools.shoe.slice(0,4).forEach(function(shoe){if(intent.wantsLayer&&pools.layer.length)pools.layer.slice(0,2).forEach(function(layer){push([dress,shoe,layer,pools.bag[0]],"dress + layer")});else push([dress,shoe,pools.bag[0]],"dress")})});
  c.sort(function(a,b){return b.score-a.score});var map=new Map();c.forEach(function(x){var k=x.items.map(function(i){return i.id}).sort().join("|");if(!map.has(k))map.set(k,x)});
  var top=Array.from(map.values()).slice(0,3).map(function(x,i){x.rank=i+1;x.explanation=(x.formula.indexOf("dress")===0?"A simple one-piece base":"A balanced separates formula")+(intent.wantsLayer?" with enough layering for the temperature":"")+". Built entirely from pieces you already own.";return x});
  var counts={};Object.keys(pools).forEach(function(k){counts[k]=pools[k].length});var gap=null;
  if(!top.length){if(!counts.shoe)gap="shoe";else if(intent.wantsLayer&&!counts.layer)gap="layer";else if(!counts.dress&&!(counts.top&&counts.bottom))gap=!counts.top?"top":(!counts.bottom?"bottom":"dress")}else if(intent.wantsLayer&&!counts.layer)gap="layer";
  var unlocked=gap==="shoe"?Math.max(counts.dress,counts.top*counts.bottom):gap==="layer"?Math.max(1,top.length||counts.dress+counts.top*counts.bottom):gap==="top"?Math.max(1,counts.bottom*counts.shoe):gap==="bottom"?Math.max(1,counts.top*counts.shoe):gap==="dress"?Math.max(1,counts.shoe):0;
  return{intent:intent,readiness:wReadiness(items),outfits:top,gap:gap?{slot:gap,outfitsUnlocked:unlocked,reason:gap==="layer"?"Your closet can make the outfit, but it needs a useful layer for this temperature.":"Your closet is one "+gap+" short of a complete outfit for this request."}:null};
}
function slotCats(s){return s==="top"?["top","knit"]:s==="bottom"?["pant","jean","skirt","short"]:s==="layer"?["jacket","coat","vest"]:s==="shoe"?["shoe","heel","flat","boot","sandal"]:s==="bag"?["bag","handbags"]:s==="dress"?["dress"]:[]}
async function wardrobeEngine(request,env,input){
  var who=await sessionUser(request,env);if(!who)throw new Error("Not authenticated");
  input=input||{};var prompt=String(input.prompt||"").trim();if(!prompt)throw new Error("Tell Reccas what you need an outfit for.");
  var profileRow=await env.DB.prepare("SELECT * FROM user_style_profiles WHERE user_id=? LIMIT 1").bind(who.user.id).first();
  var profile={preferredColors:arr(profileRow&&profileRow.preferred_colors),favoriteBrands:arr(profileRow&&profileRow.favorite_brands),avoidBrands:arr(profileRow&&profileRow.avoid_brands),preferredMaterials:arr(profileRow&&profileRow.preferred_materials),avoidMaterials:arr(profileRow&&profileRow.avoid_materials),styleWords:arr(profileRow&&profileRow.style_words),notes:profileRow&&profileRow.notes||null};
  var rows=await all(env.DB,"SELECT * FROM wardrobe_items WHERE user_id=? AND state='owned' ORDER BY created_at DESC LIMIT 120",who.user.id),closet=rows.map(function(r){return{id:String(r.id),title:r.title,brand:r.brand,category:r.category,color:r.color,material:r.material,warmth:r.warmth,formality:r.formality,silhouette:r.silhouette,imageUrl:r.image_url,productUrl:r.product_url}});
  for(var ci=0;ci<rows.length;ci++){var rr=rows[ci];if(rr.normalized_at)continue;var item=closet[ci],cat=item.category||(wSlot(item)==="other"?null:wSlot(item)),mat=item.material||(["cashmere","wool","linen","cotton","silk","polyester","denim","leather","suede","velvet"].find(function(m){return norm(item.title).indexOf(m)>=0})||null),warm=item.warmth==null?wWarmth(Object.assign({},item,{material:mat})):item.warmth,form=item.formality==null?wFormality(Object.assign({},item,{material:mat})):item.formality;await env.DB.prepare("UPDATE wardrobe_items SET category=?,material=?,warmth=?,formality=?,normalized_at=?,updated_at=? WHERE id=? AND user_id=?").bind(cat,mat,warm,form,new Date().toISOString(),new Date().toISOString(),rr.id,who.user.id).run();item.category=cat;item.material=mat;item.warmth=warm;item.formality=form}
  var effective=input.modification?prompt+". Modification: "+String(input.modification):prompt,locked=[];
  if(input.baseOutfitId&&input.modification){var base=await all(env.DB,"SELECT woi.wardrobe_item_id,woi.slot FROM wardrobe_outfit_items woi JOIN wardrobe_outfits wo ON wo.id=woi.outfit_id JOIN wardrobe_outfit_sessions ws ON ws.id=wo.session_id WHERE wo.id=? AND ws.user_id=? AND woi.wardrobe_item_id IS NOT NULL",Number(input.baseOutfitId),who.user.id),targets=new Set(wTargets(String(input.modification)));if(targets.size)locked=base.filter(function(x){return !targets.has(x.slot)}).map(function(x){return String(x.wardrobe_item_id)})}
  var fb=await all(env.DB,"SELECT woi.wardrobe_item_id,wf.outcome FROM wardrobe_outfit_feedback wf JOIN wardrobe_outfits wo ON wo.id=wf.outfit_id JOIN wardrobe_outfit_sessions ws ON ws.id=wo.session_id JOIN wardrobe_outfit_items woi ON woi.outfit_id=wo.id WHERE ws.user_id=? AND woi.wardrobe_item_id IS NOT NULL",who.user.id),history={};fb.forEach(function(x){var id=String(x.wardrobe_item_id);history[id]=(history[id]||0)+(x.outcome==="loved"?2:(x.outcome==="worked"?0.5:-1.5))});
  var et=/work|office|meeting|conference/i.test(effective)?"work_event":/date|dinner|restaurant/i.test(effective)?"date_night":/travel|flight|airport|vacation/i.test(effective)?"vacation":/party|cocktail|wedding|event/i.test(effective)?"party":"casual";
  var fr=await all(env.DB,"SELECT ogi.outfit_group_id group_id,p.canonical_category FROM outfit_group_items ogi JOIN outfit_groups og ON og.id=ogi.outfit_group_id JOIN requests r ON r.id=og.request_id JOIN products p ON p.id=ogi.product_id WHERE r.event_type=? LIMIT 1200",et),sg=new Map();fr.forEach(function(x){var s=wSlot({title:x.canonical_category||"",category:x.canonical_category});if(s==="other")return;var set=sg.get(x.group_id)||new Set();set.add(s);sg.set(x.group_id,set)});var boosts={};sg.forEach(function(set){var k=Array.from(set).sort().join("+");boosts[k]=(boosts[k]||0)+1});
  var generated=wGenerate(closet,profile.notes?effective+". Standing preferences: "+profile.notes:effective,profile,locked,history,boosts),now=new Date().toISOString();
  var sr=await env.DB.prepare("INSERT INTO wardrobe_outfit_sessions(user_id,prompt,occasion,temperature_f,style_direction,gap_category,gap_reason,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(who.user.id,effective,generated.intent.occasion,generated.intent.temperatureF,profile.styleWords.join(", ")||null,generated.gap&&generated.gap.slot||null,generated.gap&&generated.gap.reason||null,now).run(),sessionId=sr.meta.last_row_id,outfits=[];
  if(generated.readiness.ready){for(var oi=0;oi<generated.outfits.length;oi++){var c=generated.outfits[oi],or=await env.DB.prepare("INSERT INTO wardrobe_outfits(session_id,rank,score,explanation,gap_needed,gap_category,gap_reason,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(sessionId,c.rank,c.score,c.explanation,generated.gap?1:0,generated.gap&&generated.gap.slot||null,generated.gap&&generated.gap.reason||null,now).run(),outfitId=or.meta.last_row_id,outputItems=[];for(var ii=0;ii<c.items.length;ii++){var wi=c.items[ii],sl=wSlot(wi);await env.DB.prepare("INSERT INTO wardrobe_outfit_items(outfit_id,wardrobe_item_id,product_id,slot,is_gap_fill,created_at) VALUES(?,?,NULL,?,0,?)").bind(outfitId,Number(wi.id),sl,now).run();outputItems.push({wardrobeItemId:wi.id,title:wi.title,brand:wi.brand,category:wi.category,color:wi.color,imageUrl:wi.imageUrl,slot:sl})}outfits.push({id:String(outfitId),rank:c.rank,score:c.score,explanation:c.explanation,items:outputItems})}}
  var options=[];
  if(generated.readiness.ready&&generated.gap){var cats=slotCats(generated.gap.slot);if(cats.length){var ph=cats.map(function(){return"?"}).join(","),params=cats.slice(),sql="SELECT p.id,p.title,p.price,p.image_url,p.canonical_url,p.primary_color,p.canonical_category,b.name brand_name,po.affiliate_url,po.commission_rate FROM products p LEFT JOIN brands b ON b.id=p.brand_id JOIN product_offers po ON po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL WHERE p.canonical_category IN ("+ph+") AND p.image_url IS NOT NULL AND p.is_product_page_live=1";if(profileRow&&profileRow.budget_max!=null){sql+=" AND p.price<=?";params.push(Number(profileRow.budget_max))}sql+=" ORDER BY po.commission_rate DESC,p.updated_at DESC LIMIT 100";var st=env.DB.prepare(sql);st=st.bind.apply(st,params);var prods=(await st.all()).results||[],signals=await all(env.DB,"SELECT product_id,signal FROM user_product_signals WHERE user_id=?",who.user.id),sm={};signals.forEach(function(x){sm[x.product_id]=x.signal});var ranked=prods.filter(function(x){return sm[x.id]!=="skip"&&sm[x.id]!=="own"}).filter(function(x){return !profile.avoidBrands.some(function(v){return norm(x.brand_name).indexOf(norm(v))>=0})}).map(function(x){var sc=0;if(profile.preferredColors.some(function(v){return norm(x.primary_color).indexOf(norm(v))>=0}))sc+=3;if(profile.favoriteBrands.some(function(v){return norm(x.brand_name).indexOf(norm(v))>=0}))sc+=4;if(x.price!=null)sc+=1;return{x:x,score:sc,price:x.price==null?null:Number(x.price)}}).sort(function(a,b){return b.score-a.score||((a.price==null?1e9:a.price)-(b.price==null?1e9:b.price))});var best=ranked[0],cheap=ranked.filter(function(x){return x.price!=null}).slice().sort(function(a,b){return a.price-b.price})[0],inv=ranked.filter(function(x){return x.price!=null}).slice().sort(function(a,b){return b.price-a.price})[0],chosen=[best,cheap,inv].filter(Boolean).filter(function(x,i,a){return a.findIndex(function(y){return y.x.id===x.x.id})===i}).slice(0,3);options=chosen.map(function(z,i){return{productId:z.x.id,title:z.x.title||"Reccas find",brand:z.x.brand_name,price:z.price,imageUrl:z.x.image_url,url:z.x.affiliate_url,label:i===0?"Best fit":(z===cheap?"Best value":"Investment option"),reason:"Fills the "+generated.gap.slot+" gap without duplicating an item you already marked Own or Skip.",outfitsUnlocked:generated.gap.outfitsUnlocked}})}}
  var gap=generated.gap?Object.assign({},generated.gap,{options:options}):null,message=!generated.readiness.ready?"Add a little more closet context first: "+generated.readiness.itemCount+"/5 pieces across "+generated.readiness.categoryCount+"/3 useful categories.":outfits.length&&!gap?"You already have what you need. Reccas found complete outfits without recommending a purchase.":outfits.length&&gap?"You can wear what you own; one "+gap.slot+" would make the outfit stronger and unlock more combinations.":gap?"You are one "+gap.slot+" short of a complete outfit for this request.":"Reccas could not make a confident outfit from the current closet yet.";
  return{sessionId:String(sessionId),prompt:effective,occasion:generated.intent.occasion,temperatureF:generated.intent.temperatureF,readiness:generated.readiness,outfits:outfits,gap:gap,message:message};
}
async function loginPassword(request,env){
  var body=await readAuthBody(request),email=String(body.email||"").trim().toLowerCase(),password=String(body.password||"");
  if(!email||!password)return Response.json({message:"Email and password are required"},{status:400});
  var cutoff=new Date(Date.now()-15*60*1000).toISOString();
  var failed=await env.DB.prepare("SELECT COUNT(*) n FROM login_attempts WHERE lower(email)=? AND success=0 AND attempted_at>=?").bind(email,cutoff).first();
  if(Number(failed&&failed.n||0)>=5)return Response.json({message:"Too many failed login attempts. Try again later."},{status:429});
  var row=await env.DB.prepare("SELECT u.id,u.email,u.display_name,u.username_slug,u.avatar_url,u.bio,u.reputation_score,p.password_hash FROM users u JOIN user_passwords p ON p.user_id=u.id WHERE lower(u.email)=? LIMIT 1").bind(email).first();
  var valid=false;
  if(row&&String(row.password_hash||"").indexOf("pbkdf2$")===0)valid=await pbkdf2Verify(password,row.password_hash);
  else if(row&&String(row.password_hash||"").indexOf("$2")===0){
    try{valid=await bcrypt.compare(password,String(row.password_hash));if(valid){var migrated=await pbkdf2Hash(password);await env.DB.prepare("UPDATE user_passwords SET password_hash=? WHERE user_id=?").bind(migrated,row.id).run()}}catch(_){valid=false}
  }
  var now=new Date().toISOString();
  await env.DB.prepare("INSERT INTO login_attempts(email,attempted_at,success) VALUES(?,?,?)").bind(email,now,valid?1:0).run();
  if(!valid||!row)return Response.json({message:"Invalid email or password"},{status:401});
  await env.DB.prepare("DELETE FROM login_attempts WHERE lower(email)=? AND success=0").bind(email).run();
  var sid=await createSession(env,row.id);
  return new Response(JSON.stringify({user:{id:row.id,email:row.email,displayName:row.display_name,usernameSlug:row.username_slug,avatarUrl:row.avatar_url,bio:row.bio,reputationScore:row.reputation_score}}),{status:200,headers:{"content-type":"application/json","cache-control":"no-store","set-cookie":sessionCookie(sid)}});
}
async function registerPassword(request,env){
  var body=await readAuthBody(request),email=String(body.email||"").trim().toLowerCase(),password=String(body.password||""),displayName=String(body.displayName||"").trim();
  if(!email||!email.includes("@")||password.length<8)return Response.json({message:"Enter a valid email and password of at least 8 characters."},{status:400});
  if(!displayName){var local=(email.split("@")[0]||"Reccas user").replace(/[._+-]+/g," ").replace(/\s+/g," ").trim();displayName=local?local.replace(/\b\w/g,function(c){return c.toUpperCase()}):"Reccas user"}
  if(await env.DB.prepare("SELECT id FROM users WHERE lower(email)=? LIMIT 1").bind(email).first())return Response.json({message:"Email already in use"},{status:409});
  var slug=await uniqueSlug(env,displayName),now=new Date().toISOString(),hash=await pbkdf2Hash(password);
  await env.DB.prepare("INSERT INTO users(email,display_name,avatar_url,role,created_at,updated_at,bio,reputation_score,username_slug) VALUES(?,?,?,?,?,?,?,?,?)").bind(email,displayName,null,"user",now,now,null,0,slug).run();
  var user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first();
  await env.DB.prepare("INSERT INTO user_passwords(user_id,password_hash) VALUES(?,?)").bind(user.id,hash).run();
  var sid=await createSession(env,user.id);
  return new Response(JSON.stringify({user:{id:user.id,email:user.email,displayName:user.display_name,usernameSlug:user.username_slug,avatarUrl:user.avatar_url,bio:user.bio,reputationScore:user.reputation_score}}),{status:201,headers:{"content-type":"application/json","cache-control":"no-store","set-cookie":sessionCookie(sid)}});
}
async function recommendationIndex(env){
  var rows=await all(env.DB,"SELECT slug,json FROM sourced_shopping_edits ORDER BY slug"),bySlug=new Map();
  rows.forEach(function(x){try{var e=JSON.parse(x.json);bySlug.set(String(x.slug),{slug:String(x.slug),title:e.title||x.slug,description:e.description||e.deck||"",picks:Array.isArray(e.picks)?e.picks.length:0,sources:(e.picks||[]).reduce(function(n,p){return n+(p.evidence||[]).length},0),kind:"db"})}catch(_){}});
  Object.keys(STATIC_EDITS).forEach(function(slug){if(bySlug.has(slug))return;var e=STATIC_EDITS[slug];bySlug.set(slug,{slug:slug,title:e.title||slug,description:e.description||e.deck||"",picks:(e.picks||[]).length,sources:(e.picks||[]).reduce(function(n,p){return n+(p.evidence||[]).length},0),kind:"static"})});
  return Array.from(bySlug.values()).sort(function(a,b){return b.sources-a.sources||String(a.title).localeCompare(String(b.title))});
}
async function home(env){
  var recs=(await recommendationIndex(env)).slice(0,9);
  var cards=recs.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><span class='eyebrow'>"+esc(r.sources)+" sourced mention"+(r.sources===1?"":"s")+"</span><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"Evidence-backed fashion recommendation from Reccas.").slice(0,155))+"</p><strong>See what’s worth buying →</strong></a>"}).join("");
  var body="<main class='wrap'><section class='hero'><span class='eyebrow'>Evidence-backed fashion recommendations</span><h1>Fashion recommendations with receipts.</h1><p>Reccas finds the clothes fashion editors, testers and shoppers keep recommending, then checks what is still available and what is actually worth buying.</p><div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:24px'><a class='btn' href='/recommendations'>Browse recommendations</a><a class='btn alt' href='/guides'>Browse style guides</a></div></section><section class='section'><div class='eyebrow'>How Reccas works</div><h2>Less scrolling. Better evidence.</h2><div class='grid'><div class='card'><h3>Find repeated recommendations</h3><p>We look for products editors, testers and credible publications actually name—not whatever happens to be newest.</p></div><div class='card'><h3>Keep the receipts</h3><p>Every sourced recommendation links back to the publication or writer behind it, so you can inspect the evidence yourself.</p></div><div class='card'><h3>Check the shopping reality</h3><p>Price, availability, fit caveats and the exact use case matter. A famous product is not useful if it no longer satisfies the shopping question.</p></div></div></section><section class='section'><div class='eyebrow'>Start here</div><h2>Recommendations worth comparing</h2><div class='grid'>"+cards+"</div><p style='margin-top:20px'><a class='btn alt' href='/recommendations'>See all recommendations</a></p></section><section class='section'><div class='eyebrow'>Also on Reccas</div><h2>Outfit and wardrobe guides</h2><p class='muted'>Travel, weather, wedding guest, capsule and outfit guidance still lives in the guide library. The recommendation test is intentionally focused on individual products and categories.</p><p><a class='btn alt' href='/guides'>Browse style guides</a> <a class='btn alt' href='/wardrobe'>Open wardrobe</a></p></section></main>";
  return page("/","Fashion Recommendations With Receipts",body,"Reccas finds the clothes fashion editors and testers consistently recommend, then checks current availability, price, fit caveats and what is actually worth buying.",200,null,{schema:[{"@type":"WebApplication",name:"Reccas",url:"https://reccas.com/",applicationCategory:"ShoppingApplication",operatingSystem:"Web",description:"Evidence-backed fashion recommendation engine."}]});
}
async function recommendations(env){
  var recs=await recommendationIndex(env),cards=recs.map(function(r){return "<a class='guideTile' href='/"+esc(r.slug)+"'><div class='eyebrow'>"+esc(r.picks)+" picks · "+esc(r.sources)+" sourced mention"+(r.sources===1?"":"s")+"</div><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"Evidence-backed fashion recommendation from Reccas."))+"</p><strong>See the evidence →</strong></a>"}).join("");
  var body="<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas recommendations</span><h1>What’s actually worth buying.</h1><p>Focused product recommendations built from attributable editor and tester evidence, current shopping checks and explicit fit or use-case caveats.</p></section><section class='section'><h2>"+recs.length+" evidence-backed guides</h2><p class='guideCount'>Single item or category decisions only. No outfit-generator pages in this test set.</p><div class='guideGrid'>"+cards+"</div></section><section class='editMethod'><span class='eyebrow'>Publication rule</span><h2>Evidence before scale.</h2><p>Reccas publishes a recommendation guide when the shopping question is distinct, the products have attributable evidence, and the page can explain why each pick belongs. Thin permutations stay out of the recommendation index.</p></section></main>";
  return page("/recommendations","Fashion Recommendations With Receipts",body,"Browse evidence-backed fashion recommendations from Reccas, with attributable editor and tester sources, current shopping checks and clear fit caveats.",200,null,{kind:"collection",breadcrumb:"Recommendations"});
}
async function guides(env){
  var reqs=await all(env.DB,"SELECT slug,title,description,event_type FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%' ORDER BY title");
  var edits=await recommendationIndex(env),bySlug=new Map();
  reqs.forEach(function(r){bySlug.set(String(r.slug),{slug:r.slug,title:r.title,description:r.description||"",kind:"request"})});
  edits.forEach(function(e){bySlug.set(e.slug,{slug:e.slug,title:e.title,description:e.description,kind:"sourced"})});
  var allGuides=Array.from(bySlug.values()).sort(function(a,b){return String(a.title).localeCompare(String(b.title))});
  var recTiles=edits.slice(0,12).map(function(r){return "<a class='guideTile' href='/"+esc(r.slug)+"'><div class='eyebrow'>Evidence-backed</div><h3>"+esc(r.title)+"</h3><p>"+esc(r.description)+"</p><strong>See recommendation →</strong></a>"}).join("");
  var roundupPills=Object.keys(STATIC_COLLECTIONS).map(function(path){var v=STATIC_COLLECTIONS[path];return "<a class='guidePill' href='"+path+"'>"+esc(v[0])+" <span>→</span></a>"}).join("");
  var outfitTiles=allGuides.filter(function(r){return r.kind!=="sourced"}).map(function(r){return "<a class='guideTile' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"Outfit and style guidance from Reccas."))+"</p><strong>View guide →</strong></a>"}).join("");
  return page("/guides","Fashion Recommendations & Style Guides","<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guides</span><h1>Recommendations first. Outfit inspiration second.</h1><p>The recommendation library focuses on one product decision at a time. The broader guide library covers travel, weather, weddings, capsules and outfits.</p></section><section class='section'><div style='display:flex;justify-content:space-between;gap:20px;align-items:end;flex-wrap:wrap'><div><span class='eyebrow'>Evidence-backed recommendations</span><h2>What’s worth buying</h2></div><a class='btn alt' href='/recommendations'>View all "+edits.length+"</a></div><div class='guideGrid'>"+recTiles+"</div></section><section class='section'><span class='eyebrow'>Browse style-guide roundups</span><div class='guideRoundups'>"+roundupPills+"</div></section><section class='section'><h2>Outfit & wardrobe guides</h2><p class='guideCount'>"+allGuides.filter(function(r){return r.kind!=="sourced"}).length+" broader style guides</p><div class='guideGrid'>"+outfitTiles+"</div></section></main>","Reccas combines evidence-backed fashion recommendations with travel, weather, wedding guest, capsule and outfit guides.",200,null,{kind:"collection",breadcrumb:"Guides"});
}
async function collection(env,path){
  var meta=STATIC_COLLECTIONS[path],where="";
  if(path.indexOf("temperature")>=0)where=" AND (title LIKE '%degree%' OR slug LIKE '%degree%')";
  else if(path.indexOf("capsule")>=0)where=" AND (title LIKE '%capsule%' OR slug LIKE '%capsule%')";
  else if(path.indexOf("wedding")>=0)where=" AND (title LIKE '%wedding%' OR event_type='wedding')";
  else if(path.indexOf("travel")>=0)where=" AND (title LIKE '%travel%' OR title LIKE '%Paris%' OR title LIKE '%trip%' OR event_type='vacation')";
  var reqs=await all(env.DB,"SELECT slug,title,description FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%'"+where+" ORDER BY title LIMIT 120");
  var cards=reqs.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"").slice(0,150))+"</p><strong>View guide →</strong></a>"}).join("");
  return page(path,meta[0],"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide collection</span><h1>"+esc(meta[0])+"</h1><p>"+esc(meta[1])+"</p></section><div class='grid'>"+cards+"</div></main>",meta[1],200,null,{kind:"collection",breadcrumb:meta[0]});
}
async function hub(env,kind,slug){
  var rows=[],title="",desc="";
  if(kind==="event"){
    if(!EVENT_LABELS[slug])return null;
    title=EVENT_LABELS[slug]+" Outfit Ideas";desc="Complete outfit ideas for "+EVENT_LABELS[slug].toLowerCase()+" plans.";
    rows=await all(env.DB,"SELECT slug,title,description FROM requests WHERE event_type=? AND slug NOT LIKE 'archived--%' ORDER BY title",slug);
  }else{
    var tag=await env.DB.prepare("SELECT id,name FROM tags WHERE slug=? AND is_indexable=1 LIMIT 1").bind(slug).first();if(!tag)return null;
    title=tag.name;desc="Browse Reccas guides tagged "+String(tag.name).toLowerCase()+".";
    rows=await all(env.DB,"SELECT r.slug,r.title,r.description FROM requests r JOIN request_tags rt ON rt.request_id=r.id WHERE rt.tag_id=? AND r.status='open' ORDER BY r.title",tag.id);
    if(rows.length<3)return null;
  }
  return page("/"+(kind==="event"?"events/":"tags/")+slug,title,"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide hub</span><h1>"+esc(title)+"</h1><p>"+esc(desc)+"</p></section><div class='grid'>"+rows.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"").slice(0,150))+"</p><strong>View outfits →</strong></a>"}).join("")+"</div></main>",desc,200,null,{kind:"collection",breadcrumb:title});
}
async function requestPage(env,slug){
  var r=await env.DB.prepare("SELECT * FROM requests WHERE slug=? AND slug NOT LIKE 'archived--%' LIMIT 1").bind(slug).first();if(!r)return null;
  var outfits=await all(env.DB,"SELECT * FROM outfit_groups WHERE request_id=? ORDER BY rank,id LIMIT 6",r.id),outfitHtml=[];
  for(var oi=0;oi<outfits.length;oi++){
    var o=outfits[oi];
    var items=await all(env.DB,"SELECT ogi.id,ogi.rank_in_outfit,p.id product_id,p.title,p.image_url,p.price,p.canonical_category,b.name brand_name,(SELECT affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM outfit_group_items ogi JOIN products p ON p.id=ogi.product_id LEFT JOIN brands b ON b.id=p.brand_id WHERE ogi.outfit_group_id=? AND p.is_product_page_live=1 ORDER BY ogi.rank_in_outfit LIMIT 6",o.id);
    items=items.filter(function(x){return !!x.affiliate_url});
    if(!items.length)continue;
    var imgs=items.filter(function(x){return x.image_url}).slice(0,4).map(function(x){return "<img src='"+esc(x.image_url)+"' alt='"+esc(x.title)+"' loading='lazy'>"}).join("");
    var urls=items.map(function(x){return x.affiliate_url}).filter(Boolean),total=items.reduce(function(n,x){return n+(Number(x.price)||0)},0);
    var formula=items.map(function(x){return String(x.canonical_category||"piece").replaceAll("_"," ")}).slice(0,5).join(" + ");
    var detailItems=items.map(function(x){var dest=x.affiliate_url,tracked="/_api/out?requestId="+encodeURIComponent(r.id)+"&outfitId="+encodeURIComponent(o.id)+"&productId="+encodeURIComponent(x.product_id)+"&to="+encodeURIComponent(dest);return "<div class='drawerItem'>"+(x.image_url?"<img src='"+esc(x.image_url)+"' alt='"+esc(x.title||"Outfit item")+"'>":"<div></div>")+"<div><p class='drawerItemName'>"+esc(x.title||"Outfit item")+"</p><div class='drawerItemMeta'>"+esc(x.brand_name||"")+" "+money(x.price)+"</div></div><a class='btn alt drawerShop js-drawer-piece' data-product='"+esc(x.product_id)+"' data-destination='"+esc(dest)+"' href='"+tracked+"' target='_blank' rel='sponsored noreferrer'>Shop</a></div>"}).join("");
    var tpl="<template id='outfit-detail-"+esc(o.id)+"'><div class='drawerPayload' data-urls='"+esc(encodeURIComponent(JSON.stringify(urls)))+"' data-total='"+esc(total.toFixed(2))+"'><p class='drawerDescription'>"+esc(o.description||"")+"</p><div class='drawerItems'>"+detailItems+"</div></div></template>";
    outfitHtml.push("<article class='outfit js-outfit' role='button' tabindex='0' aria-label='View "+esc(o.name||"outfit idea")+"' data-request='"+esc(r.id)+"' data-outfit='"+esc(o.id)+"' data-template='outfit-detail-"+esc(o.id)+"' data-title='"+esc(o.name||"Outfit idea")+"'><div class='imgs'>"+imgs+"</div><div class='copy'><h3>"+esc(o.name||"Outfit idea")+"</h3>"+(formula?"<p class='outfitFormula'>"+esc(formula)+"</p>":"")+"<p class='muted'>"+esc(o.description||"")+"</p><div class='outfitMeta'><span>"+items.length+" pieces · "+money(total)+" total</span><span class='viewCue'>View outfit →</span></div></div></article>"+tpl);
  }
  if(outfitHtml.length){
    var drawer="<div class='drawerOverlay js-drawer-overlay'></div><aside class='drawer js-drawer' aria-hidden='true'><div class='drawerHead'><h2 class='drawerTitle js-drawer-title'>Outfit details</h2><button class='drawerClose js-drawer-close' type='button' aria-label='Close'>×</button></div><div class='drawerBody js-drawer-body'></div><div class='drawerFoot'><div class='drawerTotal'><span>Total</span><strong class='js-drawer-total'>$0</strong></div><button class='btn drawerShopAll js-shop-all' type='button'>Shop all</button></div></aside>";
    var tracking="<script>(function(){function sid(){try{var k='reccas_session_id',s=localStorage.getItem(k);if(!s){s=crypto.randomUUID();localStorage.setItem(k,s)}return s}catch(_){return null}}var sessionId=sid();try{navigator.sendBeacon('/_api/requests/view',new Blob([JSON.stringify({requestId:"+JSON.stringify(String(r.id))+",sessionId:sessionId,referrer:document.referrer||null})],{type:'application/json'}))}catch(_){}function beacon(body){try{navigator.sendBeacon('/_api/commerce/track',new Blob([JSON.stringify(body)],{type:'application/json'}))}catch(_){}}var drawer=document.querySelector('.js-drawer'),overlay=document.querySelector('.js-drawer-overlay'),body=document.querySelector('.js-drawer-body'),title=document.querySelector('.js-drawer-title'),total=document.querySelector('.js-drawer-total'),allBtn=document.querySelector('.js-shop-all'),closeBtn=document.querySelector('.js-drawer-close'),active=null,opened=new Set();function openCard(card,pushState){var tpl=document.getElementById(card.dataset.template||'');if(!tpl)return;active=card;body.innerHTML=tpl.innerHTML;var payload=body.querySelector('.drawerPayload');drawer.dataset.urls=payload?payload.dataset.urls||'%5B%5D':'%5B%5D';title.textContent=card.dataset.title||'Outfit details';total.textContent='$'+Number(payload&&payload.dataset.total||0).toFixed(2).replace(/\.00$/,'');drawer.classList.add('open');overlay.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');if(!opened.has(card.dataset.outfit)){opened.add(card.dataset.outfit);beacon({source:'outfit_open',requestId:card.dataset.request,outfitGroupId:Number(card.dataset.outfit),sessionId:sessionId})}if(pushState!==false){try{var u=new URL(location.href);u.searchParams.set('outfit',card.dataset.outfit);history.replaceState(null,'',u)}catch(_){}}}function closeDrawer(){drawer.classList.remove('open');overlay.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open');active=null;try{var u=new URL(location.href);u.searchParams.delete('outfit');history.replaceState(null,'',u)}catch(_){}}document.querySelectorAll('.js-outfit').forEach(function(card){card.addEventListener('click',function(){openCard(card,true)});card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(card,true)}})});body.addEventListener('click',function(e){var a=e.target.closest('.js-drawer-piece');if(!a||!active)return;var dest=a.dataset.destination;if(!dest)return;e.preventDefault();beacon({source:'outfit_piece',requestId:active.dataset.request,outfitGroupId:Number(active.dataset.outfit),productId:Number(a.dataset.product),destinationUrl:dest,sessionId:sessionId});window.open(dest,'_blank','noopener,noreferrer')});allBtn.addEventListener('click',function(){if(!active)return;beacon({source:'outfit_shop_all',requestId:active.dataset.request,outfitGroupId:Number(active.dataset.outfit),sessionId:sessionId});var urls=[];try{urls=JSON.parse(decodeURIComponent(drawer.dataset.urls||'%5B%5D'))}catch(_){}Array.from(new Set(urls)).forEach(function(u){window.open(u,'_blank','noopener,noreferrer')})});overlay.addEventListener('click',closeDrawer);closeBtn.addEventListener('click',closeDrawer);document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer()});try{var deep=new URL(location.href).searchParams.get('outfit'),card=deep&&Array.from(document.querySelectorAll('.js-outfit')).find(function(x){return x.dataset.outfit===deep});if(card)openCard(card,false)}catch(_){}})();</script>";
    return page("/"+slug,r.title,"<main class='wrap'><section class='hero'><span class='eyebrow'>"+esc(String(r.event_type||"style guide").replaceAll("_"," "))+"</span><h1>"+esc(r.title)+"</h1><p>"+esc(r.intro_text||r.description||"")+"</p></section><section class='section'><h2>Outfit ideas</h2><div class='outfits'>"+outfitHtml.join("")+"</div></section></main>"+drawer+tracking,guideMetaDescription(r),200,null,{kind:"article",headline:r.title,published:r.created_at,modified:r.last_activity_at||r.created_at,breadcrumb:r.title});
  }
  var recRows=await all(env.DB,"SELECT rr.id recommendation_id,rr.comment,rr.upvotes,rr.created_at,p.id product_id,p.title,p.image_url,p.price,p.canonical_category,b.name brand_name,(SELECT po.affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM recommendations rr JOIN products p ON p.id=rr.product_id LEFT JOIN brands b ON b.id=p.brand_id WHERE rr.request_id=? AND p.is_product_page_live=1 ORDER BY rr.upvotes DESC,rr.created_at DESC LIMIT 80",r.id);
  var seen=new Set(),picks=[];recRows.forEach(function(x){if(x.affiliate_url&&!seen.has(x.product_id)){seen.add(x.product_id);picks.push(x)}});picks=picks.slice(0,12);
  var productHtml=picks.map(function(x){var tracked="/_api/out?requestId="+encodeURIComponent(r.id)+"&recommendationId="+encodeURIComponent(x.recommendation_id)+"&productId="+encodeURIComponent(x.product_id)+"&to="+encodeURIComponent(x.affiliate_url),note=String(x.comment||"").trim();return "<article class='shopcard'>"+(x.image_url?"<img src='"+esc(x.image_url)+"' alt='"+esc(x.title||"Product")+"' loading='lazy'>":"<div style='aspect-ratio:4/5;background:#f7f5f1'></div>")+"<div class='productBrand'>"+esc(x.brand_name||x.canonical_category||"Reccas pick")+"</div><h3>"+esc(x.title||"Product")+"</h3><p class='muted'>"+money(x.price)+"</p>"+(note?"<p class='productNote'>"+esc(note.slice(0,180))+"</p>":"<div style='flex:1'></div>")+"<a class='btn' href='"+tracked+"' target='_blank' rel='sponsored noreferrer'>Shop</a></article>"}).join("");
  var viewTrack="<script>(function(){try{var k='reccas_session_id',s=localStorage.getItem(k);if(!s){s=crypto.randomUUID();localStorage.setItem(k,s)}navigator.sendBeacon('/_api/requests/view',new Blob([JSON.stringify({requestId:"+JSON.stringify(String(r.id))+",sessionId:s,referrer:document.referrer||null})],{type:'application/json'}))}catch(_){}})();</script>";
  return page("/"+slug,r.title,"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide</span><h1>"+esc(r.title)+"</h1><p>"+esc(r.intro_text||r.description||"")+"</p></section><section class='section'><h2>Recommended picks</h2><div class='shopgrid'>"+productHtml+"</div></section></main>"+viewTrack,guideMetaDescription(r),200,null,{kind:"article",headline:r.title,published:r.created_at,modified:r.last_activity_at||r.created_at,breadcrumb:r.title});
}
function catalogNeedle(v){
  var stop=new Set(["the","for","women","womens","woman","regular","classic","in","and","with","of"]);
  return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(function(x){return x.length>2&&!stop.has(x)}).slice(0,4);
}
function productMatchText(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}
function productTitleMatches(title,pick){
  var t=productMatchText(title),required=pick.requiredTitleTerms||[],any=pick.requiredAnyTerms||[],excluded=pick.excludeTitleTerms||[];
  if(required.some(function(term){return t.indexOf(productMatchText(term))<0}))return false;
  if(any.length&&!any.some(function(term){return t.indexOf(productMatchText(term))>=0}))return false;
  if(excluded.some(function(term){return t.indexOf(productMatchText(term))>=0}))return false;
  return true;
}
function channel3BrandName(pr){return pr&&pr.brands&&pr.brands[0]&&pr.brands[0].name||""}
function channel3Image(pr){
  var imgs=pr&&pr.images||[];
  for(var i=0;i<imgs.length;i++){var v=typeof imgs[i]==="string"?imgs[i]:(imgs[i]&&imgs[i].url||imgs[i]&&imgs[i].src);if(v)return v}
  return null;
}
function channel3BestOffer(pr,pick){
  var offers=(pr&&pr.offers||[]).filter(function(o){return o&&o.url}),preferred=String(pick&&pick.preferredDomain||"").toLowerCase().replace(/^www\./,"");
  function host(o){return domainOnly(String(o&&o.domain||o&&o.url||""))}
  function sort(list){return list.slice().sort(function(a,b){var ac=Number(a.max_commission_rate||0),bc=Number(b.max_commission_rate||0);if((bc>0)!=(ac>0))return bc>0?-1:1;if(bc!==ac)return bc-ac;var ap=a.price&&Number(a.price.price),bp=b.price&&Number(b.price.price);return (isFinite(ap)?ap:1e12)-(isFinite(bp)?bp:1e12)})}
  if(preferred){var official=offers.filter(function(o){var h=host(o);return h===preferred||h.endsWith("."+preferred)});if(official.length)return sort(official)[0]}
  if(pick&&pick.fallbackPrice!=null){var target=Number(pick.fallbackPrice),reasonable=offers.filter(function(o){var p=o.price&&Number(o.price.price);return isFinite(p)&&p>=target*.65&&p<=target*1.45});if(reasonable.length)return sort(reasonable)[0]}
  return sort(offers)[0]||null;
}
async function channel3StaticPick(env,pick){
  if(!env.CHANNEL3_API_KEY)return null;
  try{
    var q=String(pick.channel3Query||((pick.brand||"")+" "+(pick.name||""))).trim();
    if(!q)return null;
    var r=await fetch("https://api.trychannel3.com/v1/search",{method:"POST",headers:{"x-api-key":env.CHANNEL3_API_KEY,"content-type":"application/json"},body:JSON.stringify({query:q,limit:20})});
    if(!r.ok)return null;
    var d=await r.json(),ps=d.products||[],wantBrand=productMatchText(pick.brand),best=null,bestScore=-1;
    for(var i=0;i<ps.length;i++){
      var pr=ps[i],brand=productMatchText(channel3BrandName(pr)),title=String(pr.title||"");
      if(wantBrand&&brand&&brand!==wantBrand&&brand.indexOf(wantBrand)<0&&wantBrand.indexOf(brand)<0)continue;
      if(!productTitleMatches(title,pick))continue;
      var gender=String(pr.gender||"").toLowerCase();if(gender&&gender!=="female"&&gender!=="women"&&gender!=="unisex")continue;
      var cats=[pr.category&&pr.category.slug].concat((pr.category&&pr.category.path||[]).map(function(z){return z&&z.slug})).filter(Boolean).map(function(z){return String(z).toLowerCase()});
      if(cats.some(function(c){return c==="dresses"||c==="dress"}))continue;
      var score=0;if(brand===wantBrand)score+=20;else if(brand&&wantBrand)score+=10;
      var tn=productMatchText(title),need=catalogNeedle(pick.catalogQuery||pick.name);need.forEach(function(t){if(tn.indexOf(t)>=0)score+=3});
      if(channel3Image(pr))score+=2;if(channel3BestOffer(pr,pick))score+=2;
      if(score>bestScore){best=pr;bestScore=score}
    }
    if(!best)return null;
    var offer=pick.skipChannel3Offer?null:channel3BestOffer(best,pick),img=channel3Image(best),rate=offer?Number(offer.max_commission_rate||0):0,price=offer&&offer.price&&offer.price.price!=null?Number(offer.price.price):null;
    var exactImg=pick.preferStaticImage&&pick.imageUrl?pick.imageUrl:null;
    var out=Object.assign({},pick,{sourceProductId:best.id||null,productId:null,imageUrl:exactImg||img||pick.imageUrl||null,price:price==null?pick.fallbackPrice:price,shopUrl:offer&&offer.url||pick.canonicalUrl||null,_catalog:true,_channel3:!pick.skipChannel3Offer,_affiliate:!!(offer&&rate>0),_commissionRate:rate||0});
    return out;
  }catch(_){return null}
}
async function enrichStaticPick(env,pick){
  var viaChannel3=await channel3StaticPick(env,pick);if(viaChannel3)return viaChannel3;
  var x=Object.assign({},pick),tokens=catalogNeedle(x.catalogQuery||x.name),pattern="%"+tokens.join("%")+"%",brand="%"+String(x.brand||"").toLowerCase().replace(/[^a-z0-9]+/g,"%")+"%";
  if(tokens.length){
    var base="SELECT p.id,p.title,p.price,p.image_url,p.canonical_url,b.name brand_name,(SELECT po.affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.is_product_page_live=1 AND lower(p.title) LIKE ? AND lower(COALESCE(b.name,'')) LIKE ?";
    var row=null;try{row=await env.DB.prepare(base+" ORDER BY p.updated_at DESC LIMIT 8").bind(pattern,brand).all()}catch(_){}
    var candidates=row&&row.results||[],match=candidates.find(function(r){return productTitleMatches(r.title,x)});
    if(match){x.productId=match.id;x.price=match.price==null?x.fallbackPrice:Number(match.price);x.imageUrl=match.image_url||x.imageUrl;x.shopUrl=match.affiliate_url||match.canonical_url||x.canonicalUrl||null;x._catalog=true;x._channel3=false;x._affiliate=!!match.affiliate_url;return x}
  }
  x.price=x.price==null?x.fallbackPrice:x.price;x.shopUrl=x.shopUrl||x.canonicalUrl||null;x._catalog=!!x.shopUrl;x._channel3=false;x._affiliate=false;return x;
}
async function sourced(env,slug){
  var row=await env.DB.prepare("SELECT json FROM sourced_shopping_edits WHERE slug=? LIMIT 1").bind(slug).first(),isStatic=false,e;
  if(row){try{e=JSON.parse(row.json)}catch(_){return null}}
  else if(STATIC_EDITS[slug]){e=JSON.parse(JSON.stringify(STATIC_EDITS[slug]));isStatic=true}
  else return null;
  if(!Array.isArray(e.picks))e.picks=[];
  if(isStatic){
    var enriched=[];
    for(var pi=0;pi<e.picks.length;pi++)enriched.push(await enrichStaticPick(env,e.picks[pi]));
    e.picks=enriched;
  }
  var totalSources=e.picks.reduce(function(n,x){return n+(x.evidence||[]).length},0),multiSource=e.picks.filter(function(x){return (x.evidence||[]).length>=2}).length;
  var cards=e.picks.map(function(x){
    var evidence=x.evidence||[],fallback=evidence[0]&&evidence[0].url||null,dest=x.shopUrl||fallback,track=dest?"/_api/out?edit="+encodeURIComponent(slug)+"&to="+encodeURIComponent(dest):"#";
    var ev=evidence.map(function(z){return "<a class='editSource' href='"+esc(z.url)+"' target='_blank' rel='noreferrer'><strong>"+esc(z.source)+"</strong> · "+esc(z.label)+" ↗</a>"}).join("");
    var img="/recommendation-image?slug="+encodeURIComponent(slug)+"&rank="+encodeURIComponent(x.rank);
    var visual="<img src='"+esc(img)+"' alt='"+esc(x.brand+" "+x.name)+"' loading='"+(x.rank===1?"eager":"lazy")+"'>";
    var watchKey=x.sourceProductId?"channel3:"+String(x.sourceProductId):(x.productId?"product:"+String(x.productId):(x.canonicalUrl?"url:"+String(x.canonicalUrl):"name:"+String(x.brand||"")+"|"+String(x.name||"")));
    var watchPayload=encodeURIComponent(JSON.stringify({watchKey:watchKey,source:x._channel3?"channel3":"reccas",sourceProductId:x.sourceProductId||null,productId:x.productId||null,brand:x.brand||"",name:x.name||"",productUrl:dest||x.canonicalUrl||"",imageUrl:img||"",guideSlug:slug,price:x.price==null?null:Number(x.price),currency:"USD"}));
    var watchButton="<div class='watchControl'><button class='watchBtn js-price-watch' type='button' aria-label='Get alert when "+esc(x.brand+" "+x.name)+" goes on sale' aria-pressed='false' title='Get alert when it goes on sale' data-watch='"+watchPayload+"'><svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'></path></svg></button><button class='watchLabel js-price-watch' type='button' data-watch='"+watchPayload+"'>Get alert when it goes on sale</button></div>";
    var price=x.price==null||x.price===""?"":(typeof x.price==="number"?money(x.price):String(x.price));
    var shopAt=String(x.shopLabel||x.brand||"retailer").trim(),action=dest?"Shop at "+esc(shopAt)+(price?" · "+esc(price):""):"View source";
    var commerceNote=x._catalog&&!x._affiliate?"<span class='muted' style='font-size:12px'>No affiliate link available; this goes directly to the product.</span>":"";
    var rel=x._affiliate?"sponsored noreferrer":"noreferrer";
    var description=[x.summary,x.fitNote].filter(Boolean).join(" ");
    return "<article class='editPick' id='pick-"+esc(x.rank)+"'><div class='editVisual'><span class='editRank'>#"+esc(x.rank)+"</span>"+visual+"</div><div class='editCopy'>"+watchButton+"<div class='editTop'><div><p class='editBrand'>"+esc(x.brand)+"</p><h2>"+esc(x.name)+"</h2></div></div><p class='editSummary'>"+esc(description||"")+"</p><div class='editSources'>"+ev+"</div><div class='editActions'>"+(dest?"<a class='btn' href='"+track+"' target='_blank' rel='"+rel+"'>"+action+"</a>":"")+commerceNote+"</div></div></article>";
  }).join("");
  var metrics="<div class='editMetrics'><span><strong>"+esc(e.picks.length)+"</strong> focused picks</span><span><strong>"+esc(totalSources)+"</strong> sourced mentions</span><span><strong>"+esc(e.checkedLabel||"Sep 2026")+"</strong> last checked</span></div>";
  var headline=multiSource>=Math.ceil(e.picks.length/2)?"Consensus, with receipts.":"Editor-backed, with receipts.";
  var intro="<section class='editIntro'><div><span class='eyebrow'>Why this is different</span><h2>"+headline+"</h2></div><p>Every recommendation links back to the editor, tester or publication that made it. Reccas narrows the evidence to a small number of useful picks, then checks the actual shopping constraint and flags the caveats.</p></section>";
  var method="<section class='editMethod'><span class='eyebrow'>How Reccas built this guide</span><h2>What counts as a recommendation?</h2><p>"+esc(e.freshnessCopy||"The product must still satisfy the stated category, price, or use-case constraint when Reccas checks it.")+" Reccas may earn a commission from some shopping links.</p></section>";
  var first=e.picks&&e.picks[0],socialImage=first?"https://reccas.com/recommendation-image?slug="+encodeURIComponent(slug)+"&rank="+encodeURIComponent(first.rank):null;
  var listSchema={"@type":"ItemList",name:e.title,itemListElement:e.picks.map(function(x,i){return{"@type":"ListItem",position:i+1,name:String(x.brand+" "+x.name),url:"https://reccas.com/"+slug+"#pick-"+String(x.rank||i+1)}})};
  var watchUi="<div class='watchModalOverlay js-watch-modal' aria-hidden='true'><div class='watchModal' role='dialog' aria-modal='true' aria-labelledby='watchTitle'><button class='watchModalClose js-watch-close' type='button' aria-label='Close'>×</button><span class='eyebrow'>Sale alert</span><h2 id='watchTitle'>Get an alert when it goes on sale</h2><p class='muted'>Create a Reccas account to save <strong class='js-watch-name'>this item</strong> and track its price.</p><div class='watchModalActions'><a class='btn js-watch-google' href='#'>Continue with Google</a><button class='btn alt js-watch-email-toggle' type='button'>Create account with email</button><form class='stack js-watch-email-form' style='display:none;margin-top:2px'><input class='field' type='email' name='email' required autocomplete='email' placeholder='Email'><input class='field' type='password' name='password' required minlength='8' autocomplete='new-password' placeholder='Password'><button class='btn' type='submit'>Create account</button><div class='muted js-watch-email-msg' style='font-size:12px'></div></form></div><p class='muted' style='margin:14px 0 0;font-size:12px'>Already have an account? <a class='js-watch-login' href='#'><strong>Log in</strong></a></p></div></div><div class='watchToast js-watch-toast'>Price tracked</div>";
  var watchScript="<script>(function(){var slug="+JSON.stringify(slug)+",buttons=Array.from(document.querySelectorAll('.js-price-watch')),modal=document.querySelector('.js-watch-modal'),close=document.querySelector('.js-watch-close'),nameEl=document.querySelector('.js-watch-name'),google=document.querySelector('.js-watch-google'),emailToggle=document.querySelector('.js-watch-email-toggle'),emailForm=document.querySelector('.js-watch-email-form'),emailMsg=document.querySelector('.js-watch-email-msg'),login=document.querySelector('.js-watch-login'),toast=document.querySelector('.js-watch-toast'),authed=false,watched=new Set();function payload(btn){try{return JSON.parse(decodeURIComponent(btn.dataset.watch||''))}catch(_){return null}}function setState(btn,on){if(btn.classList.contains('watchBtn')){btn.classList.toggle('active',!!on);btn.setAttribute('aria-pressed',on?'true':'false');btn.title=on?'Watching for a sale':'Get alert when it goes on sale'}else if(btn.classList.contains('watchLabel')){btn.textContent=on?'Sale alert on':'Get alert when it goes on sale'}}function flash(t){toast.textContent=t||'Price tracked';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},1800)}function currentReturn(){return location.pathname+location.search}function openModal(p){try{localStorage.setItem('reccas_pending_watch',JSON.stringify(p))}catch(_){}nameEl.textContent=[p.brand,p.name].filter(Boolean).join(' ')||'this item';var rt=encodeURIComponent(currentReturn());google.href='/_api/auth/google_authorize?returnTo='+rt;login.href='/login?returnTo='+rt;if(emailForm){emailForm.style.display='none';emailForm.reset();if(emailMsg)emailMsg.textContent=''}modal.classList.add('open');modal.setAttribute('aria-hidden','false')}function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}async function save(p,on){var r=await fetch('/_api/price-watch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({},p,{action:on?'watch':'remove'}))});if(r.status===401){authed=false;openModal(p);return false}if(!r.ok)return false;if(on)watched.add(p.watchKey);else watched.delete(p.watchKey);buttons.forEach(function(b){var q=payload(b);if(q&&q.watchKey===p.watchKey)setState(b,on)});flash(on?'Price tracked':'Price watch removed');return true}async function init(){var r=await fetch('/_api/auth/session',{headers:{accept:'application/json'}});authed=r.ok;if(!authed)return;try{var wr=await fetch('/_api/price-watch?slug='+encodeURIComponent(slug));if(wr.ok){var d=await wr.json();(d.watches||[]).forEach(function(w){watched.add(w.watch_key)})}}catch(_){}buttons.forEach(function(b){var p=payload(b);if(p)setState(b,watched.has(p.watchKey))});try{var raw=localStorage.getItem('reccas_pending_watch');if(raw){var p=JSON.parse(raw);if(p&&p.guideSlug===slug){localStorage.removeItem('reccas_pending_watch');await save(p,true);closeModal()}}}catch(_){}}buttons.forEach(function(btn){btn.addEventListener('click',async function(e){e.preventDefault();e.stopPropagation();var p=payload(btn);if(!p)return;if(!authed){openModal(p);return}await save(p,!watched.has(p.watchKey))})});if(emailToggle)emailToggle.addEventListener('click',function(){if(!emailForm)return;emailForm.style.display=emailForm.style.display==='none'?'grid':'none';if(emailForm.style.display==='grid'){var input=emailForm.querySelector('input[name=email]');if(input)input.focus()}});if(emailForm)emailForm.addEventListener('submit',async function(e){e.preventDefault();if(emailMsg)emailMsg.textContent='Creating account…';var o=Object.fromEntries(new FormData(emailForm).entries()),r=await fetch('/_api/auth/register_with_password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}),j={};try{j=await r.json()}catch(_){}if(!r.ok){if(emailMsg)emailMsg.textContent=j.message||'Could not create account';return}authed=true;if(emailMsg)emailMsg.textContent='Account created';try{var raw=localStorage.getItem('reccas_pending_watch');if(raw){var p=JSON.parse(raw);localStorage.removeItem('reccas_pending_watch');await save(p,true)}}catch(_){}closeModal()});if(close)close.onclick=closeModal;if(modal)modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});init()})();</script>";
  return page("/"+slug,e.seoTitle||e.title,"<main class='wrap'><section class='hero editHero'><span class='eyebrow'>Reccas recommendation</span><h1>"+esc(e.title)+"</h1><p>"+esc(e.deck||e.description)+"</p>"+metrics+"</section>"+intro+"<section class='editList'>"+cards+"</section>"+method+"</main>"+watchUi+watchScript,e.description||e.deck||e.title,200,null,{kind:"article",headline:e.title,image:socialImage,breadcrumb:e.title,schema:[listSchema]});
}
async function editImage(request,env){
  var u=new URL(request.url),slug=u.searchParams.get("slug"),rank=Number(u.searchParams.get("rank"));if(!slug||!rank)return new Response("Bad image request",{status:400});
  var row=await env.DB.prepare("SELECT json FROM sourced_shopping_edits WHERE slug=? LIMIT 1").bind(slug).first(),e=null,isStatic=false;
  if(row){try{e=JSON.parse(row.json)}catch(_){}}
  else if(STATIC_EDITS[slug]){e=JSON.parse(JSON.stringify(STATIC_EDITS[slug]));isStatic=true}
  if(!e)return new Response("Not found",{status:404});
  var pick=(e.picks||[]).find(function(x){return Number(x.rank)===rank});if(!pick)return new Response("Not found",{status:404});
  if(isStatic)pick=await enrichStaticPick(env,pick);
  var srcUrl=pick.imageUrl;
  if(!srcUrl||!/^https:\/\//i.test(srcUrl)){
    var fallback="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><rect width='800' height='800' fill='%23f4f1ec'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' fill='%2377717b' font-family='Arial,sans-serif' font-size='28'>"+esc(pick.brand||"Reccas")+"</text><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='%23272733' font-family='Arial,sans-serif' font-size='34' font-weight='600'>"+esc(pick.name||"Recommendation")+"</text></svg>";
    return new Response(fallback,{headers:{"content-type":"image/svg+xml; charset=utf-8","cache-control":"public, max-age=300","x-robots-tag":"index, follow"}});
  }
  try{
    var src=new URL(srcUrl),headers={"user-agent":"Mozilla/5.0 (compatible; ReccasImage/1.0)","accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8","referer":src.origin+"/"};
    var up=await fetch(src.toString(),{redirect:"follow",headers:headers});
    if(!up.ok)throw new Error("upstream "+up.status);
    var ct=up.headers.get("content-type")||"";if(ct.indexOf("image/")!==0)throw new Error("not image");
    var h=new Headers({"content-type":ct,"cache-control":"public, max-age=86400, stale-while-revalidate=604800","x-content-type-options":"nosniff","x-robots-tag":"index, follow"});
    var len=up.headers.get("content-length");if(len)h.set("content-length",len);
    return new Response(up.body,{headers:h});
  }catch(_){
    var svg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><rect width='800' height='800' fill='%23f4f1ec'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' fill='%2377717b' font-family='Arial,sans-serif' font-size='28'>"+esc(pick.brand||"Reccas")+"</text><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='%23272733' font-family='Arial,sans-serif' font-size='34' font-weight='600'>"+esc(pick.name||"Recommendation")+"</text></svg>";
    return new Response(svg,{headers:{"content-type":"image/svg+xml; charset=utf-8","cache-control":"public, max-age=300","x-robots-tag":"index, follow"}});
  }
}
async function staticPage(path){
  if(path==="/about")return page(path,"About Reccas: Fashion Recommendations With Receipts","<main class='wrap'><section class='hero'><span class='eyebrow'>About Reccas</span><h1>Fashion recommendations with receipts.</h1><p>Reccas finds the clothes fashion editors, testers and credible publications keep recommending, preserves the source evidence, and checks whether each product is still worth buying for the exact shopping question.</p></section><section class='section'><h2>What Reccas does</h2><div class='grid'><div class='card'><h3>Find the evidence</h3><p>Instead of publishing giant generic lists, Reccas looks for attributable recommendations, hands-on tests and repeat editor favorites.</p></div><div class='card'><h3>Narrow the decision</h3><p>Each guide focuses on a specific category or use case and keeps the recommendation set small enough to actually compare.</p></div><div class='card'><h3>Check what still matters</h3><p>Availability, price, fit, materials and known caveats are part of the recommendation—not an afterthought.</p></div></div></section><section class='section'><h2>What about the wardrobe tools?</h2><p class='muted'>Reccas still includes closet and outfit tools for people who want personalization, but they are optional. You do not need to build a digital wardrobe to use the recommendation library.</p></section></main>","Reccas is an evidence-backed fashion recommendation engine that shows what editors and testers recommend, where the evidence came from, and what is still worth buying.");
  if(path==="/press")return page(path,"Reccas Brand & Press Kit","<main class='wrap'><section class='hero'><span class='eyebrow'>Brand & press kit</span><h1>Describe Reccas consistently.</h1><p>Reccas is an AI wardrobe manager that helps you decide what to wear, what to buy, what to skip, and what to watch.</p></section></main>","Reccas brand and press kit.");
  if(path==="/developers")return page(path,"Reccas API & MCP for AI Assistants","<main class='wrap'><section class='hero'><span class='eyebrow'>Developer access</span><h1>Reccas for AI assistants.</h1><p>Connect assistants to Reccas outfit and fashion data through public machine-readable interfaces.</p></section></main>","Developer access for Reccas.");
  if(path==="/privacy")return page(path,"Privacy","<main class='wrap'><section class='hero'><span class='eyebrow'>Privacy</span><h1>Privacy at Reccas.</h1><p>Reccas stores account and wardrobe information needed to provide closet-aware recommendations. Authentication cookies are HTTP-only and secure.</p></section></main>","Reccas privacy information.");
  return null;
}
async function sitemap(env){
  var reqs=await all(env.DB,"SELECT id,slug,COALESCE(last_activity_at,created_at) lastmod FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%' ORDER BY slug");
  var tags=await all(env.DB,"SELECT t.slug,MAX(r.last_activity_at) lastmod,COUNT(*) n FROM tags t JOIN request_tags rt ON rt.tag_id=t.id JOIN requests r ON r.id=rt.request_id AND r.status='open' WHERE t.is_indexable=1 GROUP BY t.id,t.slug HAVING COUNT(*)>=3");
  var events=await all(env.DB,"SELECT event_type,MAX(last_activity_at) lastmod FROM requests WHERE event_type IS NOT NULL GROUP BY event_type");
  var staticPaths=["/","/about","/press","/developers","/privacy","/guides","/recommendations","/what-to-wear-by-temperature","/capsule-wardrobes","/wedding-guest-dresses-by-color","/travel-packing-guides","/outfit-formulas","/best-ballet-flats-under-250"];
  var editRows=await all(env.DB,"SELECT slug FROM sourced_shopping_edits ORDER BY slug");editRows.forEach(function(x){staticPaths.push("/"+x.slug)});Object.keys(STATIC_EDITS).forEach(function(slug){staticPaths.push("/"+slug)});
  var set=new Set(staticPaths),entries=[];
  staticPaths.forEach(function(p){if(set.has(p)){entries.push({p:p,last:"2026-09-25"});set.delete(p)}});
  tags.forEach(function(x){entries.push({p:"/tags/"+x.slug,last:x.lastmod})});
  events.forEach(function(x){entries.push({p:"/events/"+x.event_type,last:x.lastmod})});
  reqs.forEach(function(x){var p="/"+x.slug;if(!entries.some(function(e){return e.p===p}))entries.push({p:p,last:x.lastmod})});
  var xml="<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>"+entries.map(function(e){return "<url><loc>https://reccas.com"+esc(e.p)+"</loc>"+(e.last?"<lastmod>"+esc(String(e.last).slice(0,10))+"</lastmod>":"")+"</url>"}).join("")+"</urlset>";
  return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public,max-age=3600"}});
}
async function out(request,env){
  var u=new URL(request.url),to=u.searchParams.get("to");if(!to||!/^https?:\/\//i.test(to))return new Response("Invalid destination",{status:400});
  var requestId=u.searchParams.get("requestId"),outfitId=u.searchParams.get("outfitId"),productId=u.searchParams.get("productId"),recommendationId=u.searchParams.get("recommendationId"),edit=u.searchParams.get("edit"),who=await sessionUser(request,env),now=new Date().toISOString();
  try{
    if(requestId&&outfitId&&productId){
      var outfit=await env.DB.prepare("SELECT name FROM outfit_groups WHERE id=? AND request_id=? LIMIT 1").bind(Number(outfitId),requestId).first();
      if(outfit)await env.DB.prepare("INSERT INTO commerce_clicks(source,recommendation_id,outfit_group_id,product_id,request_id,user_id,merchant,destination_url,referrer,clicked_at,session_id,outfit_name,outfit_product_ids) VALUES('outfit_piece',NULL,?,?,?,?,NULL,?,?,?,?,?,NULL)")
        .bind(Number(outfitId),Number(productId),requestId,who?who.user.id:null,to,request.headers.get("referer"),now,who?who.sessionId:null,outfit.name).run();
    }else if(requestId&&productId){
      await env.DB.prepare("INSERT INTO outbound_clicks(recommendation_id,user_id,clicked_at,destination_url,referrer,request_id) VALUES(?,?,?,?,?,?)").bind(recommendationId||null,who?who.user.id:null,now,to,request.headers.get("referer"),requestId).run();
    }else{
      await env.DB.prepare("INSERT INTO outbound_clicks(recommendation_id,user_id,clicked_at,destination_url,referrer,request_id) VALUES(NULL,?,?,?,?,?)").bind(who?who.user.id:null,now,to,request.headers.get("referer"),edit||null).run();
    }
  }catch(_){}
  return Response.redirect(to,302);
}
async function oauthAuthorize(request,env){
  if(!env.GOOGLE_CLIENT_ID)return new Response("Google login is not configured",{status:503});
  var u=new URL(request.url),returnTo=safeReturnTo(u.searchParams.get("returnTo")||"/"),state=randHex(32),redirect="https://reccas.com/_api/auth/google_callback",now=new Date(),exp=new Date(now.getTime()+600000);
  await env.DB.prepare("DELETE FROM oauth_states WHERE expires_at<?").bind(now.toISOString()).run();
  await env.DB.prepare("INSERT INTO oauth_states(state,code_verifier,provider,redirect_url,created_at,expires_at) VALUES(?,?,?,?,?,?)").bind(state,"","google",redirect,now.toISOString(),exp.toISOString()).run();
  var p=new URLSearchParams({
    client_id:String(env.GOOGLE_CLIENT_ID),
    redirect_uri:redirect,
    response_type:"code",
    scope:"openid email profile",
    state:state,
    access_type:"online",
    include_granted_scopes:"true",
    prompt:"select_account"
  });
  var headers=new Headers({"Cache-Control":"no-store"});
  headers.append("Location","https://accounts.google.com/o/oauth2/v2/auth?"+p.toString());
  headers.append("Set-Cookie",OAUTH_STATE_COOKIE+"="+state+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600");
  headers.append("Set-Cookie",AUTH_RETURN_COOKIE+"="+encodeURIComponent(returnTo)+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600");
  return new Response("Redirecting...",{status:302,headers:headers});
}
async function uniqueSlug(env,name){
  var base=String(name||"user").toLowerCase().replace(/\$/g,"").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"user",s=base,i=2;
  while(await env.DB.prepare("SELECT id FROM users WHERE username_slug=? LIMIT 1").bind(s).first()){s=base+"-"+i;i++}return s;
}
async function oauthCallback(request,env){
  var u=new URL(request.url),code=u.searchParams.get("code"),state=u.searchParams.get("state"),err=u.searchParams.get("error"),cookies=cookieMap(request);
  if(err||!code||!state||cookies[OAUTH_STATE_COOKIE]!==state)return page("/login","Login failed","<main class='wrap'><div class='auth'><h1>Login failed</h1><p>Please try again.</p><a class='btn' href='/login'>Back to login</a></div></main>","Login failed",400,"noindex, follow");
  var st=await env.DB.prepare("SELECT * FROM oauth_states WHERE state=? LIMIT 1").bind(state).first();
  if(!st||String(st.provider)!=="google"||Date.parse(String(st.expires_at))<Date.now())return new Response("OAuth state expired",{status:400});
  if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET)return new Response("Google login is not configured",{status:503});
  var body=new URLSearchParams({
    code:code,
    client_id:String(env.GOOGLE_CLIENT_ID),
    client_secret:String(env.GOOGLE_CLIENT_SECRET),
    redirect_uri:String(st.redirect_url),
    grant_type:"authorization_code"
  });
  var tr=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:body.toString()});
  if(!tr.ok){var terr="";try{terr=await tr.text()}catch(_){}return new Response("Google OAuth token exchange failed"+(terr?": "+terr.slice(0,300):""),{status:502})}
  var tok=await tr.json();
  var ir=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:"Bearer "+tok.access_token}});
  if(!ir.ok)return new Response("Google user lookup failed",{status:502});
  var info=await ir.json(),email=String(info.email||"").toLowerCase(),name=String(info.name||email.split("@")[0]||"Reccas user");
  if(!email||info.email_verified===false)return new Response("Verified Google email required",{status:400});
  var user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first(),now=new Date().toISOString();
  if(!user){
    var slug=await uniqueSlug(env,name);
    await env.DB.prepare("INSERT INTO users(email,display_name,avatar_url,role,created_at,updated_at,bio,reputation_score,username_slug) VALUES(?,?,?,?,?,?,?,?,?)").bind(email,name,info.picture||null,"user",now,now,null,0,slug).run();
    user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first()
  }else if(info.picture&&!user.avatar_url){
    await env.DB.prepare("UPDATE users SET avatar_url=?,updated_at=? WHERE id=?").bind(info.picture,now,user.id).run()
  }
  var acct=await env.DB.prepare("SELECT id FROM oauth_accounts WHERE user_id=? AND provider='google' LIMIT 1").bind(user.id).first();
  if(acct)await env.DB.prepare("UPDATE oauth_accounts SET provider_user_id=?,provider_email=?,updated_at=? WHERE id=?").bind(String(info.sub||email),email,now,acct.id).run();
  else await env.DB.prepare("INSERT INTO oauth_accounts(user_id,provider,provider_user_id,provider_email,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(user.id,"google",String(info.sub||email),email,now,now).run();
  var sid=await createSession(env,user.id);
  await env.DB.prepare("DELETE FROM oauth_states WHERE state=?").bind(state).run();
  var returnTo=safeReturnTo(cookies[AUTH_RETURN_COOKIE]||"/"),headers=new Headers({Location:returnTo,"Cache-Control":"no-store"});
  headers.append("Set-Cookie",sessionCookie(sid));
  headers.append("Set-Cookie",AUTH_RETURN_COOKIE+"=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  headers.append("Set-Cookie",OAUTH_STATE_COOKIE+"=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  return new Response("Redirecting...",{status:302,headers:headers});
}
async function authSession(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401,headers:{"Cache-Control":"no-store"}});
  return Response.json({user:who.user},{headers:{"Cache-Control":"no-store"}});
}
async function logout(request,env){
  var sid=cookieMap(request)[COOKIE];if(sid)await env.DB.prepare("DELETE FROM sessions WHERE id=?").bind(sid).run();
  return new Response(null,{status:204,headers:{"Set-Cookie":COOKIE+"=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0","Cache-Control":"no-store"}});
}
function loginPage(request,path){
  var signup=path==="/signup",u=new URL(request.url),returnTo=safeReturnTo(u.searchParams.get("returnTo")||"/wardrobe"),action=signup?"/_api/auth/register_with_password":"/_api/auth/login_with_password";
  var fields="<input class='field' type='email' name='email' required autocomplete='email' placeholder='Email'><input class='field' type='password' name='password' required minlength='8' autocomplete='"+(signup?"new-password":"current-password")+"' placeholder='Password'>";
  var switcher=signup?"Already have an account? <a href='/login?returnTo="+encodeURIComponent(returnTo)+"'><strong>Log in</strong></a>":"New to Reccas? <a href='/signup?returnTo="+encodeURIComponent(returnTo)+"'><strong>Create an account</strong></a>";
  var google="<a class='btn alt' style='width:100%;margin-bottom:12px' href='/_api/auth/google_authorize?returnTo="+encodeURIComponent(returnTo)+"'>Continue with Google</a><div class='muted' style='text-align:center;margin:2px 0 12px'>or</div>";
  var script="<script>document.getElementById('authForm').addEventListener('submit',async function(e){e.preventDefault();var f=new FormData(e.currentTarget),o=Object.fromEntries(f.entries()),m=document.getElementById('msg');m.textContent='';var r=await fetch('"+action+"',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)});var j={};try{j=await r.json()}catch(_){}if(r.ok){location.href="+JSON.stringify(returnTo)+"}else{m.textContent=j.message||'Could not continue'}});</script>";
  return page(path,signup?"Create your Reccas account":"Log in to Reccas","<main class='wrap'><div class='auth'><span class='eyebrow'>Reccas account</span><h1>"+(signup?"Save products and price watches.":"Welcome back.")+"</h1><p class='muted'>Keep recommendations, product watches and wardrobe decisions attached to your account.</p>"+google+"<form id='authForm' class='stack'>"+fields+"<button class='btn' type='submit'>"+(signup?"Create account":"Log in")+"</button><div id='msg' class='muted'></div></form><p class='muted' style='margin-top:18px'>"+switcher+"</p></div></main>"+script,"Reccas account",200,"noindex, follow");
}
async function wardrobePage(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.redirect("https://reccas.com/login",302);
  var items=await all(env.DB,"SELECT * FROM wardrobe_items WHERE user_id=? AND state='owned' ORDER BY created_at DESC LIMIT 200",who.user.id),profile=await env.DB.prepare("SELECT * FROM user_style_profiles WHERE user_id=? LIMIT 1").bind(who.user.id).first(),conn=await env.DB.prepare("SELECT * FROM email_connections WHERE user_id=? AND provider='google' LIMIT 1").bind(who.user.id).first(),u=new URL(request.url),prompt=u.searchParams.get("prompt")||"";
  var cards=items.map(function(x){return "<div class='card'>"+(x.image_url?"<img src='"+esc(x.image_url)+"' alt='"+esc(x.title)+"'>":"")+"<strong>"+esc(x.title)+"</strong><br><span class='muted'>"+esc([x.brand,x.category,x.color].filter(Boolean).join(" · "))+"</span></div>"}).join("");
  function csv(v){return esc(arr(v).join(", "))}
  var gmailStatus=conn&&conn.status==="connected"?"Connected"+(conn.email_address?" · "+esc(conn.email_address):""):"Not connected";
  var script="<script>(function(){async function j(url,opt){var r=await fetch(url,opt||{}),x={};try{x=await r.json()}catch(_){}if(!r.ok)throw new Error(x.error||x.message||'Request failed');return x}document.getElementById('profileForm').onsubmit=async function(e){e.preventDefault();var o=Object.fromEntries(new FormData(e.currentTarget).entries());['preferredColors','favoriteBrands','avoidBrands','preferredMaterials','avoidMaterials','styleWords'].forEach(function(k){o[k]=String(o[k]||'').split(',').map(function(x){return x.trim()}).filter(Boolean)});await j('/_api/wardrobe/profile',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)});document.getElementById('profileMsg').textContent='Saved'};document.getElementById('gmailConnect').onclick=async function(){var x=await j('/_api/integrations/nylas/state',{method:'POST'});window.open(x.authUrl,'nylas','width=620,height=760')};window.addEventListener('message',function(e){if(e.data&&e.data.type==='NYLAS_CONNECT_SUCCESS'){document.getElementById('gmailMsg').textContent='Gmail connected';loadImports()}});document.getElementById('gmailScan').onclick=async function(){var m=document.getElementById('gmailMsg');m.textContent='Scanning…';try{var x=await j('/_api/wardrobe/import-scan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({monthsBack:18})});m.textContent='Found '+x.candidatesFound+' items from '+x.messagesScanned+' emails';loadImports()}catch(e){m.textContent=e.message}};async function loadImports(){try{var x=await j('/_api/wardrobe/import-candidates'),el=document.getElementById('imports');el.innerHTML=x.candidates.length?x.candidates.map(function(c){return '<div class=\"row\"><span><strong>'+String(c.title).replace(/[<>]/g,'')+'</strong><br><small>'+String(c.merchant||'')+' · '+Math.round((c.confidence||0)*100)+'% confidence</small></span><span><button class=\"btn alt importBtn\" data-id=\"'+c.id+'\" data-d=\"owned\">Own</button> <button class=\"btn alt importBtn\" data-id=\"'+c.id+'\" data-d=\"skip\">Skip</button></span></div>'}).join(''):'<div class=\"empty\">No purchases waiting for review.</div>';el.querySelectorAll('.importBtn').forEach(function(b){b.onclick=async function(){await j('/_api/wardrobe/import-decision',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({candidateId:Number(b.dataset.id),decision:b.dataset.d})});loadImports()}})}catch(_){}}loadImports();document.getElementById('catalogForm').onsubmit=async function(e){e.preventDefault();var q=new FormData(e.currentTarget).get('query'),x=await j('/_api/wardrobe/product-search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q})}),el=document.getElementById('catalogResults');el.innerHTML=x.results.map(function(p){return '<div class=\"row\"><span><strong>'+String(p.title).replace(/[<>]/g,'')+'</strong><br><small>'+String(p.brand||'')+(p.price?' · $'+p.price:'')+'</small></span>'+(p.productId?'<span><button class=\"btn alt sig\" data-id=\"'+p.productId+'\" data-s=\"own\">Own</button> <button class=\"btn alt sig\" data-id=\"'+p.productId+'\" data-s=\"save\">Save</button> <button class=\"btn alt sig\" data-id=\"'+p.productId+'\" data-s=\"skip\">Skip</button></span>':'<a class=\"btn alt\" target=\"_blank\" href=\"'+p.productUrl+'\">View</a>')+'</div>'}).join('');el.querySelectorAll('.sig').forEach(function(b){b.onclick=async function(){await j('/_api/wardrobe/signal',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({productId:Number(b.dataset.id),signal:b.dataset.s})});b.textContent='Saved'}})};document.getElementById('photoInput').onchange=async function(){var f=this.files&&this.files[0];if(!f)return;var msg=document.getElementById('photoMsg');msg.textContent='Uploading…';try{var cfg=await j('/_api/wardrobe/photo-upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contentType:f.type,sizeBytes:f.size})}),fd=new FormData();fd.append('file',f);fd.append('upload_preset',cfg.uploadPreset);fd.append('public_id',cfg.storageKey);var ur=await fetch(cfg.uploadUrl,{method:'POST',body:fd}),up=await ur.json();if(!ur.ok)throw new Error('Upload failed');var a=await j('/_api/wardrobe/photo-analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({imageUrl:up.secure_url,storageKey:cfg.storageKey})});['title','brand','category','color','material'].forEach(function(k){var el=document.querySelector('#addItem [name='+k+']');if(el&&a[k])el.value=a[k]});document.querySelector('#addItem [name=imageUrl]').value=up.secure_url;msg.textContent='Recognized: '+a.title}catch(e){msg.textContent=e.message}}})();</script>";
  var body="<main class='wrap'><div class='wardrobe-head'><div><span class='eyebrow'>Your wardrobe</span><h1 style='font-family:Georgia,serif;font-size:48px;font-weight:500;margin:8px 0'>Welcome back, "+esc(who.user.displayName||"")+".</h1><p class='muted'>"+items.length+" closet items saved.</p></div><form method='post' action='/_api/auth/logout' onsubmit='fetch(this.action,{method:\"POST\"}).then(()=>location.href=\"/\");return false'><button class='btn alt'>Log out</button></form></div><section class='section'><h2>Ask Reccas</h2><form class='ask' method='post' action='/wardrobe/generate'><input name='prompt' value='"+esc(prompt)+"' placeholder='Dinner at 60°, no heels'><button class='btn'>Use what I own</button></form></section><section class='section'><h2>Your style profile</h2><form id='profileForm' class='stack'><div class='grid'><input class='field' name='topSize' placeholder='Top size' value='"+esc(profile&&profile.top_size||"")+"'><input class='field' name='bottomSize' placeholder='Bottom size' value='"+esc(profile&&profile.bottom_size||"")+"'><input class='field' name='dressSize' placeholder='Dress size' value='"+esc(profile&&profile.dress_size||"")+"'></div><div class='grid'><input class='field' type='number' name='budgetMin' placeholder='Min budget' value='"+esc(profile&&profile.budget_min||"")+"'><input class='field' type='number' name='budgetMax' placeholder='Max budget' value='"+esc(profile&&profile.budget_max||"")+"'><input class='field' name='shoeSize' placeholder='Shoe size' value='"+esc(profile&&profile.shoe_size||"")+"'></div><input class='field' name='preferredColors' placeholder='Preferred colors, comma separated' value='"+csv(profile&&profile.preferred_colors)+"'><input class='field' name='favoriteBrands' placeholder='Favorite brands' value='"+csv(profile&&profile.favorite_brands)+"'><input class='field' name='avoidBrands' placeholder='Brands to avoid' value='"+csv(profile&&profile.avoid_brands)+"'><input class='field' name='preferredMaterials' placeholder='Preferred materials' value='"+csv(profile&&profile.preferred_materials)+"'><input class='field' name='avoidMaterials' placeholder='Materials to avoid' value='"+csv(profile&&profile.avoid_materials)+"'><input class='field' name='styleWords' placeholder='Style words' value='"+csv(profile&&profile.style_words)+"'><textarea class='field' name='notes' placeholder='Standing preferences'>"+esc(profile&&profile.notes||"")+"</textarea><button class='btn' type='submit'>Save style profile</button><span id='profileMsg' class='muted'></span></form></section><section class='section'><h2>Import purchases from Gmail</h2><p class='muted'>"+gmailStatus+"</p><div style='display:flex;gap:10px;flex-wrap:wrap'><button id='gmailConnect' class='btn alt'>Connect Gmail</button><button id='gmailScan' class='btn'>Scan purchases</button></div><p id='gmailMsg' class='muted'></p><div id='imports'></div></section><section class='section'><h2>Add an item</h2><p><input id='photoInput' type='file' accept='image/*'><span id='photoMsg' class='muted'></span></p><form id='addItem' class='stack' method='post' action='/_api/wardrobe/item'><input class='field' name='title' required placeholder='Item name'><input class='field' name='brand' placeholder='Brand'><input class='field' name='category' placeholder='Category: top, bottom, dress, shoe...'><input class='field' name='color' placeholder='Color'><input class='field' name='material' placeholder='Material'><input class='field' name='imageUrl' placeholder='Image URL (optional)'><button class='btn'>Add to wardrobe</button></form></section><section class='section'><h2>Find something you own</h2><form id='catalogForm' class='ask'><input name='query' placeholder='Aritzia Effortless Pant'><button class='btn'>Search catalog</button></form><div id='catalogResults'></div></section><section class='section'><h2>Your closet</h2>"+(cards?"<div class='closet'>"+cards+"</div>":"<div class='empty'>Add at least a few pieces so Reccas can start building closet-first outfits.</div>")+"</section></main>"+script;
  return page("/wardrobe","Wardrobe",body,"Your Reccas wardrobe.","200","noindex, follow");
}
async function addWardrobeItem(request,env){
  var who=await sessionUser(request,env);if(!who)return new Response("Not authenticated",{status:401});
  var b=await readAuthBody(request),title=String(b.title||"").trim();if(!title)return new Response("Title required",{status:400});var now=new Date().toISOString(),category=String(b.category||"")||null,material=String(b.material||"")||null,item={title:title,category:category,material:material};
  await env.DB.prepare("INSERT INTO wardrobe_items(user_id,product_id,title,brand,category,color,size_label,image_url,product_url,purchase_price,state,source,created_at,updated_at,material,warmth,formality,silhouette,normalized_at,image_storage_key) VALUES(?,NULL,?,?,?,?,?,?,?,?,'owned','manual',?,?,?,?,?,NULL,?,NULL)").bind(who.user.id,title,String(b.brand||"")||null,category,String(b.color||"")||null,String(b.sizeLabel||"")||null,String(b.imageUrl||"")||null,String(b.productUrl||"")||null,b.purchasePrice==null||b.purchasePrice===""?null:Number(b.purchasePrice),now,now,material,wWarmth(item),wFormality(item),now).run();
  return Response.redirect("https://reccas.com/wardrobe",303);
}
async function generateWardrobe(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.redirect("https://reccas.com/login",302);
  var ct=request.headers.get("content-type")||"",input;
  if(ct.indexOf("application/json")>=0)input=await request.json();else{var f=await request.formData();input={prompt:String(f.get("prompt")||""),modification:String(f.get("modification")||"")||undefined,baseOutfitId:f.get("baseOutfitId")?Number(f.get("baseOutfitId")):undefined}}
  try{
    var result=await wardrobeEngine(request,env,input);
    if(ct.indexOf("application/json")>=0)return Response.json(result,{headers:{"Cache-Control":"no-store"}});
    var outfits=result.outfits.map(function(o){return "<article class='outfit'><div class='copy'><span class='eyebrow'>Outfit "+o.rank+"</span><h3>"+esc(o.explanation)+"</h3><div class='items'>"+o.items.map(function(x){return "<div class='item'>"+(x.imageUrl?"<img src='"+esc(x.imageUrl)+"' alt=''>":"")+"<span><strong>"+esc(x.title)+"</strong><br>"+esc([x.brand,x.color].filter(Boolean).join(" · "))+"</span></div>"}).join("")+"</div><div style='margin-top:14px;display:flex;gap:8px'><form method='post' action='/_api/wardrobe/outfits/feedback'><input type='hidden' name='outfitId' value='"+esc(o.id)+"'><input type='hidden' name='outcome' value='loved'><button class='btn alt'>Love it</button></form><form method='post' action='/_api/wardrobe/outfits/feedback'><input type='hidden' name='outfitId' value='"+esc(o.id)+"'><input type='hidden' name='outcome' value='not_for_me'><button class='btn alt'>Not for me</button></form></div></div></article>"}).join("");
    var gap=result.gap&&result.gap.options&&result.gap.options.length?"<section class='section'><h2>One useful gap</h2><p>"+esc(result.gap.reason)+"</p><div class='shopgrid'>"+result.gap.options.map(function(x){return "<article class='shopcard'>"+(x.imageUrl?"<img src='"+esc(x.imageUrl)+"' alt='"+esc(x.title)+"'>":"")+"<h3>"+esc(x.brand||"")+" "+esc(x.title)+"</h3><p class='muted'>"+esc(x.label)+" · "+money(x.price)+"</p><p>"+esc(x.reason)+"</p><a class='btn' href='/_api/out?to="+encodeURIComponent(x.url)+"' target='_blank' rel='sponsored noreferrer'>Shop</a></article>"}).join("")+"</div></section>":"";
    return page("/wardrobe","Wardrobe outfit","<main class='wrap'><section class='hero'><span class='eyebrow'>Closet-first outfit</span><h1>"+esc(result.prompt)+"</h1><p>"+esc(result.message)+"</p></section>"+(outfits?"<div class='outfits'>"+outfits+"</div>":"<div class='empty'>"+esc(result.message)+"</div>")+gap+"<p style='margin-top:24px'><a class='btn alt' href='/wardrobe'>Back to wardrobe</a></p></main>","Closet-first outfit from Reccas.",200,"noindex, follow");
  }catch(e){return page("/wardrobe","Wardrobe","<main class='wrap'><div class='empty'>"+esc(e instanceof Error?e.message:String(e))+"</div><p><a class='btn alt' href='/wardrobe'>Back</a></p></main>","Wardrobe error",400,"noindex, follow")}
}
async function apiDashboard(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});
  var items=await all(env.DB,"SELECT * FROM wardrobe_items WHERE user_id=? ORDER BY created_at DESC",who.user.id),profile=await env.DB.prepare("SELECT * FROM user_style_profiles WHERE user_id=? LIMIT 1").bind(who.user.id).first();
  var signals=await all(env.DB,"SELECT product_id,signal,target_price,updated_at FROM user_product_signals WHERE user_id=? ORDER BY updated_at DESC LIMIT 500",who.user.id);
  return Response.json({user:who.user,items:items,profile:profile,signals:signals},{headers:{"Cache-Control":"no-store"}});
}
async function wardrobeProfile(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});
  var b=await readAuthBody(request),now=new Date().toISOString(),fields=["topSize","bottomSize","dressSize","shoeSize","budgetMin","budgetMax","preferredColors","favoriteBrands","avoidBrands","preferredMaterials","avoidMaterials","styleWords","styleIcons","notes"],col={topSize:"top_size",bottomSize:"bottom_size",dressSize:"dress_size",shoeSize:"shoe_size",budgetMin:"budget_min",budgetMax:"budget_max",preferredColors:"preferred_colors",favoriteBrands:"favorite_brands",avoidBrands:"avoid_brands",preferredMaterials:"preferred_materials",avoidMaterials:"avoid_materials",styleWords:"style_words",styleIcons:"style_icons",notes:"notes"},vals={};
  fields.forEach(function(k){if(b[k]!==undefined){var x=b[k];if(k==="budgetMin"||k==="budgetMax")vals[col[k]]=x===""||x==null?null:Number(x);else if(["preferredColors","favoriteBrands","avoidBrands","preferredMaterials","avoidMaterials","styleWords","styleIcons"].indexOf(k)>=0)vals[col[k]]=JSON.stringify(Array.isArray(x)?x:String(x||"").split(",").map(function(y){return y.trim()}).filter(Boolean));else vals[col[k]]=x||null}});
  var keys=Object.keys(vals),existing=await env.DB.prepare("SELECT user_id FROM user_style_profiles WHERE user_id=?").bind(who.user.id).first();
  if(existing&&keys.length){var sql="UPDATE user_style_profiles SET "+keys.map(function(k){return k+"=?"}).join(",")+",onboarding_complete=1,updated_at=? WHERE user_id=?",params=keys.map(function(k){return vals[k]});params.push(now,who.user.id);var st=env.DB.prepare(sql);st=st.bind.apply(st,params);await st.run()}
  else if(!existing){var base={top_size:null,bottom_size:null,dress_size:null,shoe_size:null,budget_min:null,budget_max:null,preferred_colors:"[]",favorite_brands:"[]",avoid_brands:"[]",preferred_materials:"[]",avoid_materials:"[]",style_words:"[]",style_icons:"[]",notes:null};Object.keys(vals).forEach(function(k){base[k]=vals[k]});await env.DB.prepare("INSERT INTO user_style_profiles(user_id,top_size,bottom_size,dress_size,shoe_size,budget_min,budget_max,preferred_colors,favorite_brands,avoid_brands,preferred_materials,avoid_materials,style_words,style_icons,notes,onboarding_complete,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(who.user.id,base.top_size,base.bottom_size,base.dress_size,base.shoe_size,base.budget_min,base.budget_max,base.preferred_colors,base.favorite_brands,base.avoid_brands,base.preferred_materials,base.avoid_materials,base.style_words,base.style_icons,base.notes,1,now,now).run()}
  return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
async function ensurePriceWatches(env){
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS price_watches (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,watch_key TEXT NOT NULL,source TEXT,source_product_id TEXT,product_id INTEGER,brand TEXT,product_name TEXT,product_url TEXT,image_url TEXT,guide_slug TEXT,baseline_price REAL,last_price REAL,currency TEXT DEFAULT 'USD',status TEXT DEFAULT 'active',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(user_id,watch_key))").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_price_watches_user_status ON price_watches(user_id,status)").run();
}
async function priceWatch(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401,headers:{"Cache-Control":"no-store"}});
  await ensurePriceWatches(env);
  if(request.method==="GET"){
    var u=new URL(request.url),slug=String(u.searchParams.get("slug")||""),rows=slug?await all(env.DB,"SELECT watch_key,baseline_price,last_price,status FROM price_watches WHERE user_id=? AND guide_slug=? AND status='active'",who.user.id,slug):await all(env.DB,"SELECT watch_key,baseline_price,last_price,status FROM price_watches WHERE user_id=? AND status='active' ORDER BY updated_at DESC LIMIT 500",who.user.id);
    return Response.json({watches:rows},{headers:{"Cache-Control":"no-store"}});
  }
  if(request.method!=="POST")return Response.json({error:"Method not allowed"},{status:405});
  var b=await readAuthBody(request),action=String(b.action||"watch"),key=String(b.watchKey||"").trim();
  if(!key||key.length>500)return Response.json({error:"Invalid watch key"},{status:400});
  if(action==="remove"){
    await env.DB.prepare("UPDATE price_watches SET status='removed',updated_at=? WHERE user_id=? AND watch_key=?").bind(new Date().toISOString(),who.user.id,key).run();
    return Response.json({ok:true,watched:false},{headers:{"Cache-Control":"no-store"}});
  }
  var price=b.price==null||b.price===""?null:Number(b.price);if(price!=null&&!Number.isFinite(price))price=null;
  var now=new Date().toISOString();
  await env.DB.prepare("INSERT INTO price_watches(user_id,watch_key,source,source_product_id,product_id,brand,product_name,product_url,image_url,guide_slug,baseline_price,last_price,currency,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'active',?,?) ON CONFLICT(user_id,watch_key) DO UPDATE SET source=excluded.source,source_product_id=excluded.source_product_id,product_id=excluded.product_id,brand=excluded.brand,product_name=excluded.product_name,product_url=excluded.product_url,image_url=excluded.image_url,guide_slug=excluded.guide_slug,last_price=excluded.last_price,status='active',updated_at=excluded.updated_at").bind(who.user.id,key,String(b.source||"reccas").slice(0,50),b.sourceProductId==null?null:String(b.sourceProductId).slice(0,200),b.productId==null?null:Number(b.productId),String(b.brand||"").slice(0,200),String(b.name||"").slice(0,300),String(b.productUrl||"").slice(0,2000),String(b.imageUrl||"").slice(0,2000),String(b.guideSlug||"").slice(0,300),price,price,String(b.currency||"USD").slice(0,10),now,now).run();
  return Response.json({ok:true,watched:true},{headers:{"Cache-Control":"no-store"}});
}
async function wardrobeSignal(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),pid=Number(b.productId),signal=String(b.signal||""),allowed=["own","skip","save","watch"];if(!pid||allowed.indexOf(signal)<0)return Response.json({error:"Invalid product signal"},{status:400});var target=signal==="watch"&&b.targetPrice!=null&&b.targetPrice!==""?Number(b.targetPrice):null,now=new Date().toISOString();
  await env.DB.prepare("INSERT INTO user_product_signals(user_id,product_id,signal,target_price,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET signal=excluded.signal,target_price=excluded.target_price,updated_at=excluded.updated_at").bind(who.user.id,pid,signal,target,now,now).run();
  if(signal==="own"){var p=await env.DB.prepare("SELECT p.*,b.name brand_name FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id=? LIMIT 1").bind(pid).first();if(p){var ex=await env.DB.prepare("SELECT id FROM wardrobe_items WHERE user_id=? AND product_id=? LIMIT 1").bind(who.user.id,pid).first();if(!ex)await env.DB.prepare("INSERT INTO wardrobe_items(user_id,product_id,title,brand,category,color,size_label,image_url,product_url,purchase_price,state,source,created_at,updated_at,material,warmth,formality,silhouette,normalized_at,image_storage_key) VALUES(?,?,?,?,?,?,NULL,?,?,?,'owned','reccas',?,?,NULL,NULL,NULL,NULL,NULL,NULL)").bind(who.user.id,pid,p.title||"Wardrobe item",p.brand_name||null,p.canonical_category||null,p.primary_color||null,p.image_url||null,p.canonical_url||null,p.price==null?null:Number(p.price),now,now).run()}}
  return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
async function wardrobeFeedback(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),oid=Number(b.outfitId),outcome=String(b.outcome||""),allowed=["loved","worked","not_for_me"];if(!oid||allowed.indexOf(outcome)<0)return Response.json({error:"Invalid feedback"},{status:400});
  var owned=await env.DB.prepare("SELECT wo.id FROM wardrobe_outfits wo JOIN wardrobe_outfit_sessions ws ON ws.id=wo.session_id WHERE wo.id=? AND ws.user_id=? LIMIT 1").bind(oid,who.user.id).first();if(!owned)return Response.json({error:"Outfit not found"},{status:404});var now=new Date().toISOString();
  await env.DB.prepare("INSERT INTO wardrobe_outfit_feedback(outfit_id,user_id,outcome,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(outfit_id) DO UPDATE SET outcome=excluded.outcome,updated_at=excluded.updated_at").bind(oid,who.user.id,outcome,now,now).run();
  if((request.headers.get("content-type")||"").indexOf("application/json")<0)return Response.redirect("https://reccas.com/wardrobe",303);return Response.json({ok:true});
}
async function wardrobeProductSearch(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),q=String(b.query||"").trim();if(!q)return Response.json({results:[]});var pat="%"+q.replace(/[%_]/g,"")+"%";
  var rows=await all(env.DB,"SELECT p.id,p.title,p.canonical_category,p.primary_color,p.image_url,p.canonical_url,p.price,b.name brand_name,(SELECT affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.is_product_page_live=1 AND p.image_url IS NOT NULL AND (lower(p.title) LIKE lower(?) OR lower(b.name) LIKE lower(?)) ORDER BY p.updated_at DESC LIMIT 12",pat,pat);
  var results=rows.map(function(x){return{productId:x.id,source:"reccas",title:x.title||"Wardrobe item",brand:x.brand_name||undefined,category:x.canonical_category||undefined,color:x.primary_color||undefined,imageUrl:x.image_url||undefined,productUrl:x.affiliate_url||x.canonical_url,price:x.price==null?undefined:Number(x.price)}});return Response.json({results:results},{headers:{"Cache-Control":"no-store"}});
}
async function commerceTrack(request,env){
  var b;try{b=await request.json()}catch(_){return new Response("Invalid JSON payload",{status:400})}var source=String(b.source||"");if(["outfit_open","outfit_piece","outfit_shop_all"].indexOf(source)<0)return new Response("Invalid request body schema",{status:400});var requestId=String(b.requestId||""),outfitId=Number(b.outfitGroupId),productId=Number(b.productId||0);if(!requestId||!outfitId)return new Response("Invalid request body schema",{status:400});
  var outfit=await env.DB.prepare("SELECT id,name FROM outfit_groups WHERE id=? AND request_id=? LIMIT 1").bind(outfitId,requestId).first();if(!outfit)return new Response("Outfit not found",{status:404});var items=await all(env.DB,"SELECT product_id FROM outfit_group_items WHERE outfit_group_id=?",outfitId),ids=items.map(function(x){return Number(x.product_id)});if(source==="outfit_piece"&&ids.indexOf(productId)<0)return new Response("Outfit item not found",{status:404});var who=await sessionUser(request,env),now=new Date().toISOString();
  if(source==="outfit_shop_all"){var since=new Date(Date.now()-2000).toISOString(),dup;if(b.sessionId)dup=await env.DB.prepare("SELECT id FROM commerce_clicks WHERE source='outfit_shop_all' AND request_id=? AND outfit_group_id=? AND clicked_at>=? AND session_id=? LIMIT 1").bind(requestId,outfitId,since,String(b.sessionId)).first();else if(who)dup=await env.DB.prepare("SELECT id FROM commerce_clicks WHERE source='outfit_shop_all' AND request_id=? AND outfit_group_id=? AND clicked_at>=? AND user_id=? LIMIT 1").bind(requestId,outfitId,since,who.user.id).first();if(dup)return new Response(null,{status:204})}
  await env.DB.prepare("INSERT INTO commerce_clicks(source,recommendation_id,outfit_group_id,product_id,request_id,user_id,merchant,destination_url,referrer,clicked_at,session_id,outfit_name,outfit_product_ids) VALUES(?,NULL,?,?,?,?,?,?,?,?,?,?,?)").bind(source,outfitId,source==="outfit_piece"?productId:null,requestId,who?who.user.id:null,source==="outfit_piece"?(b.merchant||null):null,source==="outfit_piece"?(b.destinationUrl||null):null,request.headers.get("referer")||null,now,b.sessionId||null,outfit.name,JSON.stringify(ids)).run();return new Response(null,{status:204});
}
async function requestView(request,env){
  try{var b=await request.json(),requestId=String(b.requestId||""),sessionId=b.sessionId?String(b.sessionId):null;if(!requestId)return Response.json({tracked:false});var who=await sessionUser(request,env),now=new Date(),cut=new Date(now.getTime()-3600000).toISOString();if(sessionId){var prior=await env.DB.prepare("SELECT id FROM request_views WHERE request_id=? AND session_id=? AND viewed_at>? LIMIT 1").bind(requestId,sessionId,cut).first();if(prior)return Response.json({tracked:false})}await env.DB.prepare("INSERT INTO request_views(request_id,user_id,session_id,viewed_at,referrer) VALUES(?,?,?,?,?)").bind(requestId,who?who.user.id:null,sessionId,now.toISOString(),b.referrer||null).run();return Response.json({tracked:true})}catch(_){return Response.json({tracked:false})}
}
function nylasAuthUrl(clientId,state){var p=new URLSearchParams({client_id:clientId,redirect_uri:"https://reccas.com/_api/integrations/nylas/callback",response_type:"code",provider:"google",state:state,access_type:"online",scope:"https://www.googleapis.com/auth/gmail.readonly"});return"https://api.us.nylas.com/v3/connect/auth?"+p.toString()}
async function nylasConfig(request,env){if(!env.NYLAS_CLIENT_ID)return Response.json({error:"Nylas is not configured"},{status:503});return Response.json({clientId:env.NYLAS_CLIENT_ID,redirectUri:"https://reccas.com/_api/integrations/nylas/callback"})}
async function nylasState(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});if(!env.NYLAS_CLIENT_ID)return Response.json({error:"Nylas is not configured"},{status:503});var state=randHex(32),now=new Date().toISOString(),exp=new Date(Date.now()+600000).toISOString();
  await env.DB.prepare("DELETE FROM nylas_auth_states WHERE user_id=?").bind(who.user.id).run();await env.DB.prepare("INSERT INTO nylas_auth_states(state,user_id,provider,redirect_uri,expires_at,created_at) VALUES(?,?,?,?,?,?)").bind(state,who.user.id,"google","https://reccas.com/_api/integrations/nylas/callback",exp,now).run();
  return Response.json({state:state,authUrl:nylasAuthUrl(env.NYLAS_CLIENT_ID,state)},{headers:{"Cache-Control":"no-store"}});
}
function popupHtml(script,msg,status){return new Response("<!doctype html><html><head><meta charset='utf-8'><title>Reccas</title></head><body style='font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0'><p>"+msg+"</p><script>"+script+"</script></body></html>",{status:status||200,headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}})}
async function nylasCallback(request,env){
  var u=new URL(request.url),state=u.searchParams.get("state"),code=u.searchParams.get("code"),err=u.searchParams.get("error");if(err)return popupHtml("window.opener&&window.opener.postMessage({type:'NYLAS_CONNECT_ERROR',error:'cancelled'},'*');setTimeout(function(){window.close()},300)","Gmail connection was cancelled.");
  if(!state||!code)return popupHtml("","Missing Gmail authorization details.",400);var st=await env.DB.prepare("SELECT * FROM nylas_auth_states WHERE state=? AND provider='google' LIMIT 1").bind(state).first();if(!st||Date.parse(String(st.expires_at))<Date.now())return popupHtml("","This Gmail connection attempt expired.",400);if(!env.NYLAS_CLIENT_ID||!env.NYLAS_API_KEY)return popupHtml("","Gmail connection is unavailable.",500);
  var tr=await fetch("https://api.us.nylas.com/v3/connect/token",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({client_id:env.NYLAS_CLIENT_ID,client_secret:env.NYLAS_API_KEY,redirect_uri:"https://reccas.com/_api/integrations/nylas/callback",code:code,grant_type:"authorization_code"})}),raw=await tr.text();if(!tr.ok){await env.DB.prepare("DELETE FROM nylas_auth_states WHERE state=?").bind(state).run();return popupHtml("window.opener&&window.opener.postMessage({type:'NYLAS_CONNECT_ERROR'},'*')","Could not finish Gmail connection.",400)}
  var tok=JSON.parse(raw),grant=tok.grant_id;if(!grant)return popupHtml("","Nylas returned an invalid Gmail grant.",400);var now=new Date().toISOString(),ex=await env.DB.prepare("SELECT id FROM email_connections WHERE user_id=? AND provider='google' LIMIT 1").bind(st.user_id).first();
  if(ex)await env.DB.prepare("UPDATE email_connections SET grant_id=?,email_address=?,status='connected',updated_at=? WHERE id=?").bind(grant,tok.email||null,now,ex.id).run();else await env.DB.prepare("INSERT INTO email_connections(user_id,provider,grant_id,email_address,status,connected_at,last_scanned_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(st.user_id,"google",grant,tok.email||null,"connected",now,null,now,now).run();
  await env.DB.prepare("DELETE FROM nylas_auth_states WHERE state=?").bind(state).run();return popupHtml("if(window.opener){window.opener.postMessage({type:'NYLAS_CONNECT_SUCCESS'},'*');setTimeout(function(){window.close()},250)}else{window.location.replace('/wardrobe?gmail=connected')}","Gmail connected. Returning to Reccas…");
}
async function nylasRegister(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),state=String(b.state||""),grantId=String(b.grantId||"");if(!state||!grantId)return Response.json({error:"Missing Gmail connection details"},{status:400});var st=await env.DB.prepare("SELECT * FROM nylas_auth_states WHERE state=? AND user_id=? AND provider='google' LIMIT 1").bind(state,who.user.id).first();if(!st||Date.parse(String(st.expires_at))<Date.now())return Response.json({error:"This Gmail connection attempt expired"},{status:400});
  var gr=await fetch("https://api.us.nylas.com/v3/grants/"+encodeURIComponent(grantId),{headers:{Authorization:"Bearer "+env.NYLAS_API_KEY,Accept:"application/json"}});if(!gr.ok)return Response.json({error:"Could not verify Gmail connection"},{status:400});var gp=await gr.json(),g=gp.data||{},now=new Date().toISOString(),ex=await env.DB.prepare("SELECT id FROM email_connections WHERE user_id=? AND provider='google' LIMIT 1").bind(who.user.id).first();if(ex)await env.DB.prepare("UPDATE email_connections SET grant_id=?,email_address=?,status='connected',updated_at=? WHERE id=?").bind(grantId,g.email||null,now,ex.id).run();else await env.DB.prepare("INSERT INTO email_connections(user_id,provider,grant_id,email_address,status,connected_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)").bind(who.user.id,"google",grantId,g.email||null,"connected",now,now,now).run();await env.DB.prepare("DELETE FROM nylas_auth_states WHERE state=?").bind(state).run();return Response.json({ok:true});
}
function textOnly(raw){return String(raw||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim().slice(0,12000)}
function linksOnly(raw){var s=String(raw||""),re=/href=["'](https?:\/\/[^"']+)["']/gi,out=[],m;while((m=re.exec(s))&&out.length<20){if(out.indexOf(m[1])<0)out.push(m[1])}return out}
function receiptFallback(messages){var out=[];messages.forEach(function(m){var body=String(m.body||m.snippet||""),links=linksOnly(body).filter(function(x){return /\/(products?|p|shop)\//i.test(x)&&!/unsubscribe|privacy|account|login|tracking|facebook|instagram|tiktok/i.test(x)});links.slice(0,6).forEach(function(link){try{var u=new URL(link),parts=u.pathname.split("/").filter(Boolean),slug=decodeURIComponent(parts[parts.length-1]||"").replace(/\.(html?|aspx?)$/i,"").replace(/[-_]+/g," ").trim();if(slug.length<3)return;out.push({message_id:m.id,merchant:m.from&&m.from[0]&&(m.from[0].name||String(m.from[0].email||"").split("@")[1]&&String(m.from[0].email||"").split("@")[1].split(".")[0])||null,title:slug.replace(/\b\w/g,function(c){return c.toUpperCase()}).slice(0,200),category:null,color:null,size:null,price:null,product_url:link,order_number:null,event:/return|refund/i.test(String(m.subject||"")+" "+textOnly(body).slice(0,1200))?"return":"purchase",confidence:0.62})}catch(_){}})});return out}
async function receiptAi(messages,env){
  if(!env.OPENAI_API_KEY)return receiptFallback(messages);var payload=messages.map(function(m){return{message_id:m.id,subject:m.subject||"",sender:m.from&&m.from[0]||null,received_at:m.date||null,text:textOnly(m.body||m.snippet).slice(0,8000),links:linksOnly(m.body).slice(0,12)}}),sys="Extract only apparel, shoes, bags and wearable accessories actually purchased or returned from retail order emails. Ignore marketing, wishlists, home goods, beauty, food and unrelated receipts. Return JSON {items:[]}. Each item: message_id, merchant, title, category, color, size, price (number or null), product_url (only a provided product link), order_number, event (purchase|return), confidence (0-1). Never invent attributes.";
  for(var mi=0;mi<2;mi++){var model=mi===0?"gpt-4o-mini":"gpt-5-mini";try{var r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+env.OPENAI_API_KEY},body:JSON.stringify({model:model,response_format:{type:"json_object"},messages:[{role:"system",content:sys},{role:"user",content:JSON.stringify(payload)}]})});if(!r.ok){if(r.status===429||r.status>=500)continue;break}var d=await r.json(),x=JSON.parse(d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content||'{"items":[]}');if(Array.isArray(x.items))return x.items}catch(_){}}return receiptFallback(messages)
}
async function fullNylasMessage(grant,id,env){var r=await fetch("https://api.us.nylas.com/v3/grants/"+encodeURIComponent(grant)+"/messages/"+encodeURIComponent(id),{headers:{Authorization:"Bearer "+env.NYLAS_API_KEY,Accept:"application/json"}});if(!r.ok)return null;var x=await r.json();return x.data||null}
function cleanUrl(v){try{var u=new URL(v);return u.hostname.replace(/^www\./,"").toLowerCase()+u.pathname.replace(/\/$/,"")}catch(_){return null}}
async function importScan(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),months=Math.max(1,Math.min(Number(b.monthsBack||((b.yearsBack||0)*12)||18),60)),conn=await env.DB.prepare("SELECT * FROM email_connections WHERE user_id=? AND provider='google' AND status='connected' LIMIT 1").bind(who.user.id).first();if(!conn)return Response.json({error:"Reconnect Gmail before scanning for wardrobe purchases."},{status:400});if(!env.NYLAS_API_KEY)return Response.json({error:"Nylas is not configured."},{status:503});var now=new Date().toISOString(),rr=await env.DB.prepare("INSERT INTO wardrobe_import_runs(user_id,connection_id,status,messages_scanned,candidates_found,error_text,started_at,completed_at) VALUES(?,?,'running',0,0,NULL,?,NULL)").bind(who.user.id,conn.id,now).run(),runId=rr.meta.last_row_id;
  try{var after=new Date();after.setMonth(after.getMonth()-months);var q='after:'+Math.floor(after.getTime()/1000)+' (subject:(order OR receipt OR confirmation OR shipped OR delivered OR return OR refund) OR "thank you for your order")',cursor=null,pages=0,scanned=0,found=0,seen=await all(env.DB,"SELECT id,merchant,title,product_url,order_number,order_date,status FROM wardrobe_import_candidates WHERE user_id=? ORDER BY created_at DESC LIMIT 500",who.user.id),seenKeys=new Set(seen.map(function(x){return cleanUrl(x.product_url)||norm(x.merchant)+"|"+norm(x.title)+"|"+String(x.order_number||"")})),owned=await all(env.DB,"SELECT id,title,brand,product_url,state FROM wardrobe_items WHERE user_id=? AND source='email_import' LIMIT 500",who.user.id);
    outer:while(pages<3){var ps=new URLSearchParams({search_query_native:q,limit:"50"});if(cursor)ps.set("page_token",cursor);var lr=await fetch("https://api.us.nylas.com/v3/grants/"+encodeURIComponent(conn.grant_id)+"/messages?"+ps.toString(),{headers:{Authorization:"Bearer "+env.NYLAS_API_KEY,Accept:"application/json"}});if(lr.status===401||lr.status===403){await env.DB.prepare("UPDATE email_connections SET status='revoked',updated_at=? WHERE id=?").bind(new Date().toISOString(),conn.id).run();throw new Error("Your Gmail connection expired. Reconnect Gmail to continue.")}if(!lr.ok)throw new Error("Gmail scan failed: "+lr.status);var lp=await lr.json(),summ=Array.isArray(lp.data)?lp.data:[];cursor=lp.next_cursor||null;pages++;
      for(var i=0;i<summ.length;i+=20){var chunk=await Promise.all(summ.slice(i,i+20).map(function(m){return fullNylasMessage(conn.grant_id,m.id,env)})),msgs=chunk.filter(Boolean);scanned+=msgs.length;if(!msgs.length)continue;var items=await receiptAi(msgs,env);
        for(var j=0;j<items.length;j++){var it=items[j];if(!it.message_id||!it.title||Number(it.confidence||0)<0.55)continue;var src=msgs.find(function(m){return m.id===it.message_id}),orderDate=src&&src.date?new Date(src.date*1000).toISOString():null,key=cleanUrl(it.product_url)||norm(it.merchant)+"|"+norm(it.title)+"|"+String(it.order_number||"");
          if(it.event==="return"){var match=seen.find(function(x){return cleanUrl(x.product_url)&&cleanUrl(x.product_url)===cleanUrl(it.product_url)||norm(x.title)===norm(it.title)&&norm(x.merchant)===norm(it.merchant)});if(match)await env.DB.prepare("UPDATE wardrobe_import_candidates SET status='returned',updated_at=? WHERE id=?").bind(new Date().toISOString(),match.id).run();else if(!seenKeys.has(key))await env.DB.prepare("INSERT INTO wardrobe_import_candidates(user_id,connection_id,source_message_id,source_subject,merchant,title,category,color,size_label,price,image_url,product_url,order_number,order_date,confidence,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,NULL,?,?,?,?, 'returned',?,?)").bind(who.user.id,conn.id,it.message_id,src&&src.subject||null,it.merchant||null,String(it.title).slice(0,300),it.category||null,it.color||null,it.size||null,it.price==null?null:Number(it.price),it.product_url||null,it.order_number||null,orderDate,Math.max(0,Math.min(1,Number(it.confidence||0))),new Date().toISOString(),new Date().toISOString()).run();for(var oi=0;oi<owned.length;oi++){var o=owned[oi];if((cleanUrl(o.product_url)&&cleanUrl(o.product_url)===cleanUrl(it.product_url))||(norm(o.title)===norm(it.title)&&norm(o.brand)===norm(it.merchant)))await env.DB.prepare("UPDATE wardrobe_items SET state='returned',updated_at=? WHERE id=? AND user_id=?").bind(new Date().toISOString(),o.id,who.user.id).run()}continue}
          if(seenKeys.has(key))continue;await env.DB.prepare("INSERT INTO wardrobe_import_candidates(user_id,connection_id,source_message_id,source_subject,merchant,title,category,color,size_label,price,image_url,product_url,order_number,order_date,confidence,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,NULL,?,?,?,?, 'pending',?,?)").bind(who.user.id,conn.id,it.message_id,src&&src.subject||null,it.merchant||null,String(it.title).slice(0,300),it.category||null,it.color||null,it.size||null,it.price==null?null:Number(it.price),it.product_url||null,it.order_number||null,orderDate,Math.max(0,Math.min(1,Number(it.confidence||0))),new Date().toISOString(),new Date().toISOString()).run();seenKeys.add(key);found++;if(found>=30)break outer}
      }if(!cursor)break}
    await env.DB.prepare("UPDATE email_connections SET last_scanned_at=?,status='connected',updated_at=? WHERE id=?").bind(new Date().toISOString(),new Date().toISOString(),conn.id).run();await env.DB.prepare("UPDATE wardrobe_import_runs SET status='complete',messages_scanned=?,candidates_found=?,completed_at=? WHERE id=?").bind(scanned,found,new Date().toISOString(),runId).run();return Response.json({messagesScanned:scanned,candidatesFound:found,monthsBack:months,hasMore:Boolean(cursor)||found>=30});
  }catch(e){await env.DB.prepare("UPDATE wardrobe_import_runs SET status='error',error_text=?,completed_at=? WHERE id=?").bind(e instanceof Error?e.message:String(e),new Date().toISOString(),runId).run();return Response.json({error:e instanceof Error?e.message:String(e)},{status:400})}
}
async function importCandidates(request,env){var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var rows=await all(env.DB,"SELECT * FROM wardrobe_import_candidates WHERE user_id=? AND status='pending' ORDER BY confidence DESC,order_date DESC LIMIT 120",who.user.id),ret=await env.DB.prepare("SELECT COUNT(*) n FROM wardrobe_import_candidates WHERE user_id=? AND status='returned'").bind(who.user.id).first();return Response.json({candidates:rows.map(function(x){return{id:String(x.id),merchant:x.merchant,title:x.title,category:x.category,color:x.color,sizeLabel:x.size_label,price:x.price==null?null:Number(x.price),productUrl:x.product_url,orderDate:x.order_date,status:x.status,confidence:Number(x.confidence||0)}}),returnedCount:Number(ret&&ret.n||0)})}
async function importDecision(request,env,bulk){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),decision=String(b.decision||"");if(["owned","skip","returned"].indexOf(decision)<0)return Response.json({error:"Invalid decision"},{status:400});var ids=bulk?(Array.isArray(b.candidateIds)?b.candidateIds.map(Number):[]):[Number(b.candidateId)];ids=ids.filter(Boolean);if(!ids.length)return Response.json({error:"No import items selected"},{status:400});var updated=0,now=new Date().toISOString();
  for(var i=0;i<ids.length;i++){var c=await env.DB.prepare("SELECT * FROM wardrobe_import_candidates WHERE id=? AND user_id=? AND status='pending' LIMIT 1").bind(ids[i],who.user.id).first();if(!c)continue;if(decision==="owned")await env.DB.prepare("INSERT INTO wardrobe_items(user_id,product_id,title,brand,category,color,size_label,image_url,product_url,purchase_price,state,source,created_at,updated_at,material,warmth,formality,silhouette,normalized_at,image_storage_key) VALUES(?,NULL,?,?,?,?,?,?,?,?, 'owned','email_import',?,?,NULL,NULL,NULL,NULL,NULL,NULL)").bind(who.user.id,c.title,c.merchant,c.category,c.color,c.size_label,c.image_url,c.product_url,c.price,now,now).run();await env.DB.prepare("UPDATE wardrobe_import_candidates SET status=?,updated_at=? WHERE id=? AND user_id=?").bind(decision,now,c.id,who.user.id).run();updated++}
  return Response.json(bulk?{ok:true,updated:updated}:{ok:true});
}
async function photoUpload(request,env){var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),type=String(b.contentType||"image/jpeg");if(!/^image\/(jpeg|png|webp|heic|heif)$/i.test(type))return Response.json({error:"Unsupported image type"},{status:400});var key="reccas/wardrobe/"+who.user.id+"/"+Date.now()+"-"+randHex(8);return Response.json({storageKey:key,uploadUrl:"https://api.cloudinary.com/v1_1/dtydquprl/image/upload",uploadPreset:"reccas",cloudName:"dtydquprl",previewUrl:null})}
async function photoAnalyze(request,env){var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),image=String(b.imageUrl||b.previewUrl||"");if(!image||image.indexOf("https://res.cloudinary.com/dtydquprl/")!==0)return Response.json({error:"Upload the wardrobe photo first."},{status:400});if(!env.OPENAI_API_KEY)return Response.json({error:"Photo recognition is not configured."},{status:503});var r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",Authorization:"Bearer "+env.OPENAI_API_KEY},body:JSON.stringify({model:"gpt-5-mini",reasoning_effort:"low",response_format:{type:"json_object"},messages:[{role:"system",content:"Identify the primary wearable item. Return JSON only: {title,brand,category,color,material,confidence}. category one of top,bottom,dress,layer,shoe,bag,other. Do not invent brand/material."},{role:"user",content:[{type:"text",text:"Identify this clothing item for my digital wardrobe."},{type:"image_url",image_url:{url:image}}]}]})});if(!r.ok)return Response.json({error:"Photo recognition failed: "+r.status},{status:400});var d=await r.json(),x=JSON.parse(d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content||"{}");return Response.json({storageKey:b.storageKey||null,previewUrl:image,title:String(x.title||"Wardrobe item").slice(0,200),brand:x.brand||undefined,category:x.category||undefined,color:x.color||undefined,material:x.material||undefined,confidence:typeof x.confidence==="number"?Math.max(0,Math.min(1,x.confidence)):0.6})}
function domainOnly(v){try{return new URL(v.indexOf("://")>=0?v:"https://"+v).hostname.replace(/^www\./,"").toLowerCase()}catch(_){return""}}
async function wardrobeProductSearchFull(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401});var b=await readAuthBody(request),q=String(b.query||"").trim();if(!q)return Response.json({results:[]});var localResp=await wardrobeProductSearch(new Request(request.url,{method:"POST",headers:{"content-type":"application/json","cookie":request.headers.get("cookie")||""},body:JSON.stringify({query:q})}),env),local=await localResp.json(),results=local.results||[];
  if(results.length<8&&env.CHANNEL3_API_KEY){try{var brands=await all(env.DB,"SELECT name,website FROM brands WHERE is_active=1 AND website IS NOT NULL"),bm={};brands.forEach(function(x){bm[norm(x.name).replace(/[^a-z0-9]+/g,"")]=x});var cr=await fetch("https://api.trychannel3.com/v1/search",{method:"POST",headers:{"x-api-key":env.CHANNEL3_API_KEY,"content-type":"application/json"},body:JSON.stringify({query:q,limit:20})});if(cr.ok){var cp=await cr.json(),ps=cp.products||[];for(var i=0;i<ps.length&&results.length<12;i++){var pr=ps[i],brand=pr.brands&&pr.brands[0]&&pr.brands[0].name,known=brand&&bm[norm(brand).replace(/[^a-z0-9]+/g,"")];if(!known||!known.website||String(pr.gender||"").toLowerCase()!=="female")continue;var cats=[pr.category&&pr.category.slug].concat((pr.category&&pr.category.path||[]).map(function(z){return z.slug})).filter(Boolean).map(function(z){return String(z).toLowerCase()});if(cats.indexOf("clothing")<0||cats.indexOf("clothing-accessories")>=0)continue;var official=domainOnly(known.website),offers=(pr.offers||[]).filter(function(o){return o.url&&domainOnly(o.domain||o.url)===official&&Number(o.max_commission_rate||0)>0&&(o.price&&Number(o.price.price||0)>=30)}).sort(function(a,b){return Number(b.max_commission_rate||0)-Number(a.max_commission_rate||0)});if(!offers.length)continue;var img=pr.images&&pr.images[0];img=typeof img==="string"?img:(img&&img.url);if(!img)continue;if(results.some(function(x){return norm(x.title)===norm(pr.title)&&norm(x.brand)===norm(brand)}))continue;results.push({productId:null,sourceProductId:pr.id,source:"channel3",title:pr.title,brand:brand,imageUrl:img,productUrl:offers[0].url,price:offers[0].price&&offers[0].price.price})}}}catch(_){}}
  return Response.json({results:results},{headers:{"Cache-Control":"no-store"}});
}
function pct(n,d){return d>0?Math.round((n/d)*1000)/10:0}
async function adminConversionData(request,env){
  var who=await sessionUser(request,env);if(!who)return{error:"Not authenticated",status:401};var role=await env.DB.prepare("SELECT role FROM users WHERE id=? LIMIT 1").bind(who.user.id).first();if(!role||role.role!=="admin")return{error:"Admin access required",status:403};
  var u=new URL(request.url),days=Math.max(1,Math.min(Number(u.searchParams.get("days")||30),365)),cut=new Date(Date.now()-days*86400000).toISOString(),views=await all(env.DB,"SELECT id,request_id,session_id,viewed_at FROM request_views WHERE viewed_at>=?",cut),events=await all(env.DB,"SELECT id,source,request_id,outfit_group_id,outfit_name,outfit_product_ids,product_id,merchant,session_id,clicked_at FROM commerce_clicks WHERE clicked_at>=? AND source IN ('outfit_open','outfit_piece','outfit_shop_all')",cut),reqs=await all(env.DB,"SELECT id,title,slug FROM requests"),rm={};reqs.forEach(function(x){rm[x.id]=x});
  var productIds=new Set();events.forEach(function(e){if(e.product_id!=null)productIds.add(Number(e.product_id));arr(e.outfit_product_ids).forEach(function(id){productIds.add(Number(id))})});var products=[];if(productIds.size){var ids=Array.from(productIds),ph=ids.map(function(){return"?"}).join(","),st=env.DB.prepare("SELECT p.id,p.title,p.domain,b.name brand_name FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE p.id IN ("+ph+")");st=st.bind.apply(st,ids);products=(await st.all()).results||[]}var pm={};products.forEach(function(x){pm[x.id]=x});
  function sk(s,f){return s||f}var viewS=new Set(),openS=new Set(),pieceS=new Set(),shopS=new Set();views.forEach(function(x){viewS.add(sk(x.session_id,"v:"+x.id))});events.forEach(function(e){var k=sk(e.session_id,"e:"+e.id);if(e.source==="outfit_open")openS.add(k);if(e.source==="outfit_piece")pieceS.add(k);if(e.source==="outfit_shop_all")shopS.add(k)});
  var gm={};function eg(id){if(!gm[id])gm[id]={views:0,opens:0,pieceClicks:0,shopAllClicks:0,vs:new Set(),os:new Set(),ps:new Set(),ss:new Set()};return gm[id]}
  views.forEach(function(x){var g=eg(x.request_id),k=sk(x.session_id,"v:"+x.id);g.views++;g.vs.add(k)});events.forEach(function(e){var g=eg(e.request_id),k=sk(e.session_id,"e:"+e.id);if(e.source==="outfit_open"){g.opens++;g.os.add(k)}if(e.source==="outfit_piece"){g.pieceClicks++;g.ps.add(k)}if(e.source==="outfit_shop_all"){g.shopAllClicks++;g.ss.add(k)}});
  var guides=Object.keys(gm).filter(function(id){return rm[id]}).map(function(id){var g=gm[id],m=rm[id];return{requestId:id,slug:m.slug,title:m.title,views:g.views,opens:g.opens,pieceClicks:g.pieceClicks,shopAllClicks:g.shopAllClicks,openRate:pct(g.os.size,g.vs.size),pieceCtr:pct(g.ps.size,g.os.size),shopAllCtr:pct(g.ss.size,g.os.size)}}).sort(function(a,b){return(b.pieceClicks+b.shopAllClicks)-(a.pieceClicks+a.shopAllClicks)||b.opens-a.opens||b.views-a.views});
  var om={};events.forEach(function(e){if(e.outfit_group_id==null)return;var k=e.request_id+":"+e.outfit_group_id;if(!om[k])om[k]={outfitGroupId:Number(e.outfit_group_id),requestId:e.request_id,outfitName:e.outfit_name||("Outfit "+e.outfit_group_id),opens:0,pieceClicks:0,shopAllClicks:0,os:new Set(),ps:new Set(),ss:new Set()};var o=om[k],s=sk(e.session_id,"e:"+e.id);if(e.source==="outfit_open"){o.opens++;o.os.add(s)}if(e.source==="outfit_piece"){o.pieceClicks++;o.ps.add(s)}if(e.source==="outfit_shop_all"){o.shopAllClicks++;o.ss.add(s)}});
  var outfits=Object.keys(om).filter(function(k){return rm[om[k].requestId]}).map(function(k){var o=om[k],m=rm[o.requestId];return{outfitGroupId:o.outfitGroupId,requestId:o.requestId,guideTitle:m.title,guideSlug:m.slug,outfitName:o.outfitName,opens:o.opens,pieceClicks:o.pieceClicks,shopAllClicks:o.shopAllClicks,pieceCtr:pct(o.ps.size,o.os.size),shopAllCtr:pct(o.ss.size,o.os.size)}}).sort(function(a,b){return(b.pieceClicks+b.shopAllClicks)-(a.pieceClicks+a.shopAllClicks)||b.opens-a.opens});
  var pe={},pc={};events.forEach(function(e){var s=sk(e.session_id,"e:"+e.id);if(e.source==="outfit_open")arr(e.outfit_product_ids).forEach(function(id){id=Number(id);if(!pe[id])pe[id]=new Set();pe[id].add(s)});else if(e.source==="outfit_piece"&&e.product_id!=null){var id=Number(e.product_id);if(!pc[id])pc[id]=new Set();pc[id].add(s)}});var allp=new Set(Object.keys(pe).concat(Object.keys(pc)).map(Number)),productRows=Array.from(allp).map(function(id){var m=pm[id]||{},ex=pe[id]?pe[id].size:0,cl=pc[id]?pc[id].size:0;return{productId:id,title:m.title||("Product "+id),brand:m.brand_name||m.domain||"Unknown",exposedOpens:ex,pieceClicks:cl,ctr:pct(cl,ex)}}).sort(function(a,b){return b.pieceClicks-a.pieceClicks||b.ctr-a.ctr||b.exposedOpens-a.exposedOpens});
  var be={},bc={};events.forEach(function(e){var s=sk(e.session_id,"e:"+e.id);if(e.source==="outfit_open"){var bs=new Set(arr(e.outfit_product_ids).map(function(id){var m=pm[Number(id)]||{};return m.brand_name||m.domain||null}).filter(Boolean));bs.forEach(function(b){if(!be[b])be[b]=new Set();be[b].add(s)})}else if(e.source==="outfit_piece"&&e.product_id!=null){var m=pm[Number(e.product_id)]||{},b=m.brand_name||m.domain||e.merchant||"Unknown";if(!bc[b])bc[b]=new Set();bc[b].add(s)}});var brands=Array.from(new Set(Object.keys(be).concat(Object.keys(bc)))).map(function(b){var ex=be[b]?be[b].size:0,cl=bc[b]?bc[b].size:0;return{brand:b,exposedOpens:ex,pieceClicks:cl,ctr:pct(cl,ex)}}).sort(function(a,b){return b.pieceClicks-a.pieceClicks||b.ctr-a.ctr||b.exposedOpens-a.exposedOpens});
  return{status:200,data:{days:days,summary:{guideViews:views.length,outfitOpens:events.filter(function(e){return e.source==="outfit_open"}).length,pieceClicks:events.filter(function(e){return e.source==="outfit_piece"}).length,shopAllClicks:events.filter(function(e){return e.source==="outfit_shop_all"}).length,openRate:pct(openS.size,viewS.size),pieceCtr:pct(pieceS.size,openS.size),shopAllCtr:pct(shopS.size,openS.size)},guides:guides,outfits:outfits,products:productRows.slice(0,100),brands:brands.slice(0,100)}}
}
async function adminConversionApi(request,env){var x=await adminConversionData(request,env);return x.error?Response.json({error:x.error},{status:x.status}):Response.json(x.data,{headers:{"Cache-Control":"no-store"}})}
async function adminConversionPage(request,env){
  var x=await adminConversionData(request,env);if(x.error){if(x.status===401)return Response.redirect("https://reccas.com/login",302);return page("/admin/conversion","Admin","<main class='wrap'><div class='empty'>"+esc(x.error)+"</div></main>","Admin",x.status,"noindex, nofollow")}var d=x.data;
  function rowsGuide(){return d.guides.slice(0,100).map(function(g){return"<tr><td><a href='/"+esc(g.slug)+"' target='_blank'>"+esc(g.title)+"</a></td><td>"+g.views+"</td><td>"+g.opens+"</td><td>"+g.openRate+"%</td><td>"+g.pieceClicks+"</td><td>"+g.pieceCtr+"%</td><td>"+g.shopAllClicks+"</td><td>"+g.shopAllCtr+"%</td></tr>"}).join("")||"<tr><td colspan='8'>No activity yet.</td></tr>"}
  function rowsProd(){return d.products.slice(0,50).map(function(p){return"<tr><td>"+esc(p.title)+"</td><td>"+esc(p.brand)+"</td><td>"+p.exposedOpens+"</td><td>"+p.pieceClicks+"</td><td>"+p.ctr+"%</td></tr>"}).join("")||"<tr><td colspan='5'>No product click data yet.</td></tr>"}
  function rowsBrand(){return d.brands.slice(0,50).map(function(b){return"<tr><td>"+esc(b.brand)+"</td><td>"+b.exposedOpens+"</td><td>"+b.pieceClicks+"</td><td>"+b.ctr+"%</td></tr>"}).join("")||"<tr><td colspan='4'>No brand click data yet.</td></tr>"}
  var css="<style>.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric{background:white;border:1px solid #ddd8d1;border-radius:8px;padding:18px}.metric strong{display:block;font:500 34px Georgia,serif;margin-top:6px}.tablewrap{overflow:auto;background:white;border:1px solid #ddd8d1;border-radius:8px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:11px 12px;border-bottom:1px solid #eee9e3;white-space:nowrap}th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#716a73}@media(max-width:760px){.metrics{grid-template-columns:1fr 1fr}}</style>";
  var controls="<p><a class='btn alt' href='/admin/conversion?days=7'>7d</a> <a class='btn alt' href='/admin/conversion?days=30'>30d</a> <a class='btn alt' href='/admin/conversion?days=90'>90d</a> <a class='btn alt' href='/admin/conversion?days=365'>1y</a></p>";
  var body="<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas · Commerce</span><h1>Conversion dashboard</h1><p>Guide views → outfit opens → individual Shop clicks → Shop All clicks.</p>"+controls+"</section><div class='metrics'><div class='metric'>Guide views<strong>"+d.summary.guideViews+"</strong><span class='muted'>Baseline</span></div><div class='metric'>Outfit opens<strong>"+d.summary.outfitOpens+"</strong><span class='muted'>"+d.summary.openRate+"% of view sessions</span></div><div class='metric'>Shop clicks<strong>"+d.summary.pieceClicks+"</strong><span class='muted'>"+d.summary.pieceCtr+"% of open sessions</span></div><div class='metric'>Shop All<strong>"+d.summary.shopAllClicks+"</strong><span class='muted'>"+d.summary.shopAllCtr+"% of open sessions</span></div></div><section class='section'><h2>Guides</h2><div class='tablewrap'><table><thead><tr><th>Guide</th><th>Views</th><th>Opens</th><th>Open rate</th><th>Shop</th><th>Shop CTR</th><th>Shop All</th><th>Shop All CTR</th></tr></thead><tbody>"+rowsGuide()+"</tbody></table></div></section><section class='section'><h2>Products</h2><div class='tablewrap'><table><thead><tr><th>Product</th><th>Brand</th><th>Exposed opens</th><th>Clicks</th><th>CTR</th></tr></thead><tbody>"+rowsProd()+"</tbody></table></div></section><section class='section'><h2>Brands</h2><div class='tablewrap'><table><thead><tr><th>Brand</th><th>Exposed opens</th><th>Clicks</th><th>CTR</th></tr></thead><tbody>"+rowsBrand()+"</tbody></table></div></section></main>"+css;
  return page("/admin/conversion","Conversion Dashboard",body,"Reccas conversion dashboard.",200,"noindex, nofollow");
}
function listVal(v){if(Array.isArray(v))return v;if(!v)return[];try{var x=JSON.parse(v);return Array.isArray(x)?x:[]}catch(_){return[]}}
async function agentProducts(env,u){
  var limit=Math.min(Math.max(Number(u.searchParams.get("limit")||8),1),20),where=["p.is_product_page_live=1"],params=[];
  var q=(u.searchParams.get("query")||"").trim(),cat=(u.searchParams.get("category")||"").trim(),color=(u.searchParams.get("color")||"").trim(),max=u.searchParams.get("maxPrice");
  if(q){where.push("(lower(p.title) LIKE lower(?) OR lower(b.name) LIKE lower(?) OR lower(p.canonical_category) LIKE lower(?) OR lower(p.primary_color) LIKE lower(?))");for(var i=0;i<4;i++)params.push("%"+q+"%")}
  if(cat){where.push("lower(p.canonical_category) LIKE lower(?)");params.push("%"+cat+"%")}
  if(color){where.push("lower(p.primary_color) LIKE lower(?)");params.push("%"+color+"%")}
  if(max&&!isNaN(Number(max))){where.push("p.price<=?");params.push(Number(max))}
  params.push(limit);
  var sql="SELECT p.id,p.title,p.price,p.image_url,p.canonical_url,p.canonical_category,p.primary_color,p.seasons,p.occasion_tags,b.name brand_name,(SELECT po.affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM products p LEFT JOIN brands b ON b.id=p.brand_id WHERE "+where.join(" AND ")+" ORDER BY p.updated_at DESC LIMIT ?";
  var stmt=env.DB.prepare(sql);if(params.length)stmt=stmt.bind.apply(stmt,params);var rows=(await stmt.all()).results||[];
  return rows.map(function(r){return {id:r.id,title:r.title,brand:r.brand_name||null,category:r.canonical_category||null,color:r.primary_color||null,price:r.price==null?null:Number(r.price),imageUrl:r.image_url||null,url:r.affiliate_url||r.canonical_url,seasons:listVal(r.seasons),occasions:listVal(r.occasion_tags)}});
}
async function agentOutfits(env,u){
  var limit=Math.min(Math.max(Number(u.searchParams.get("limit")||5),1),10),where=[],params=[],occasion=(u.searchParams.get("occasion")||"").trim(),q=(u.searchParams.get("query")||"").trim(),max=u.searchParams.get("maxBudget");
  if(occasion){where.push("r.event_type=?");params.push(occasion)}
  if(q){where.push("(lower(og.name) LIKE lower(?) OR lower(og.description) LIKE lower(?) OR lower(r.title) LIKE lower(?) OR lower(r.description) LIKE lower(?))");for(var i=0;i<4;i++)params.push("%"+q+"%")}
  params.push(Math.max(limit*5,20));
  var sql="SELECT og.id,og.name,og.description,og.style_tags,og.rank,r.event_type,r.title request_title,r.slug request_slug FROM outfit_groups og JOIN requests r ON r.id=og.request_id"+(where.length?" WHERE "+where.join(" AND "):"")+" ORDER BY og.rank ASC LIMIT ?";
  var stmt=env.DB.prepare(sql);if(params.length)stmt=stmt.bind.apply(stmt,params);var groups=(await stmt.all()).results||[],out=[];
  for(var gi=0;gi<groups.length;gi++){
    var g=groups[gi],items=await all(env.DB,"SELECT p.id,p.title,p.price,p.image_url,p.canonical_url,p.canonical_category,p.primary_color,p.seasons,p.occasion_tags,b.name brand_name,(SELECT po.affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM outfit_group_items ogi JOIN products p ON p.id=ogi.product_id LEFT JOIN brands b ON b.id=p.brand_id WHERE ogi.outfit_group_id=? AND p.is_product_page_live=1 ORDER BY ogi.rank_in_outfit",g.id);
    var mapped=items.map(function(r){return{id:r.id,title:r.title,brand:r.brand_name||null,category:r.canonical_category||null,color:r.primary_color||null,price:r.price==null?null:Number(r.price),imageUrl:r.image_url||null,url:r.affiliate_url||r.canonical_url,seasons:listVal(r.seasons),occasions:listVal(r.occasion_tags)}}),total=mapped.reduce(function(s,x){return s+(x.price||0)},0);
    if(mapped.length&&(!max||total<=Number(max)))out.push({id:g.id,name:g.name,description:g.description||null,styleTags:listVal(g.style_tags),occasion:g.event_type,sourceTitle:g.request_title,sourceUrl:"https://reccas.com/"+g.request_slug,totalPrice:total,items:mapped});
    if(out.length>=limit)break;
  }
  return out;
}
function styleGuide(){return {brand:"Reccas",canonicalUrl:"https://reccas.com/",summary:"Reccas is an evidence-backed fashion recommendation engine. It finds the clothes editors and testers keep recommending, preserves the source evidence, and checks what is still worth buying.",principles:["Prefer attributable editor and tester evidence over generic product-list aggregation.","Keep recommendation sets focused and explain why each product belongs.","Check current price, availability, fit caveats and the exact shopping constraint.","Treat wardrobe personalization as an optional layer rather than a prerequisite for useful recommendations."],publicGuides:[{title:"Fall capsule wardrobe",url:"https://reccas.com/fall-capsule-wardrobe"},{title:"Summer capsule wardrobe",url:"https://reccas.com/summer-capsule-wardrobe"},{title:"What to wear in Paris in fall",url:"https://reccas.com/what-to-wear-in-paris-fall"},{title:"Casual date-night outfit ideas",url:"https://reccas.com/date-night-outfit-ideas-casual"},{title:"Best little black dresses",url:"https://reccas.com/best-little-black-dresses"}]}}
const mcpTools=[
 {name:"search_outfits",title:"Search Reccas outfits",description:"Find complete public Reccas outfits for an occasion, style idea, or budget.",inputSchema:{type:"object",properties:{query:{type:"string"},occasion:{type:"string",enum:["wedding","vacation","date_night","party","work_event","casual","black_tie"]},maxBudget:{type:"number"},limit:{type:"integer",minimum:1,maximum:10}},additionalProperties:false}},
 {name:"find_products",title:"Find Reccas products",description:"Search the Reccas fashion catalog by product, brand, category, color, or maximum price.",inputSchema:{type:"object",properties:{query:{type:"string"},category:{type:"string"},color:{type:"string"},maxPrice:{type:"number"},limit:{type:"integer",minimum:1,maximum:20}},additionalProperties:false}},
 {name:"get_style_guide",title:"Get Reccas styling guidance",description:"Return Reccas styling principles, brand definition, and public wardrobe guides.",inputSchema:{type:"object",properties:{},additionalProperties:false}}
];
function rpc(id,result){return Response.json({jsonrpc:"2.0",id:id==null?null:id,result:result},{headers:{"Cache-Control":"no-store"}})}
function rpcErr(id,code,message,status){return new Response(JSON.stringify({jsonrpc:"2.0",id:id==null?null:id,error:{code:code,message:message}}),{status:status||200,headers:{"content-type":"application/json","Cache-Control":"no-store"}})}
async function mcp(request,env){
  var b;try{b=await request.json()}catch(_){return rpcErr(null,-32700,"Parse error",400)}
  if(!b||b.jsonrpc!=="2.0"||typeof b.method!=="string")return rpcErr(b&&b.id,-32600,"Invalid Request",400);
  if(b.method==="initialize")return rpc(b.id,{protocolVersion:"2025-11-25",capabilities:{tools:{listChanged:false}},serverInfo:{name:"reccas",version:"1.0.0"}});
  if(b.method==="ping")return rpc(b.id,{});
  if(b.method==="notifications/initialized"||b.method==="notifications/cancelled")return new Response(null,{status:202});
  if(b.method==="tools/list")return rpc(b.id,{tools:mcpTools});
  if(b.method==="tools/call"){
    var name=String(b.params&&b.params.name||""),a=b.params&&b.params.arguments||{},fake=new URL("https://reccas.com/");
    Object.keys(a).forEach(function(k){if(a[k]!=null)fake.searchParams.set(k,String(a[k]))});
    try{var result=name==="search_outfits"?{outfits:await agentOutfits(env,fake)}:name==="find_products"?{products:await agentProducts(env,fake)}:name==="get_style_guide"?styleGuide():null;if(result==null)return rpcErr(b.id,-32602,"Unknown tool");return rpc(b.id,{content:[{type:"text",text:JSON.stringify(result)}]})}catch(e){return rpc(b.id,{content:[{type:"text",text:e instanceof Error?e.message:String(e)}],isError:true})}
  }
  return rpcErr(b.id,-32601,"Method not found: "+b.method);
}
function machineResource(path){
  var common={name:"Reccas",canonical_url:"https://reccas.com/",description:"Reccas is an evidence-backed fashion recommendation engine. It finds the clothes fashion editors and testers keep recommending, preserves the source evidence, and checks current availability, price, fit caveats and whether each product still answers the shopping question."};
  if(path==="/ai.json")return Response.json(Object.assign({},common,{type:"Fashion recommendation engine",capabilities:["evidence-backed fashion recommendations","attributable editor and tester sources","current product and shopping checks","fit and use-case caveats","persistent wardrobe memory","closet-aware outfit recommendations","public MCP tools for AI assistants","public REST/OpenAPI fashion search"],public_resources:{about:"https://reccas.com/about",press:"https://reccas.com/press",developers:"https://reccas.com/developers",sitemap:"https://reccas.com/sitemap.xml",llms:"https://reccas.com/llms.txt",llms_full:"https://reccas.com/llms-full.txt",openapi:"https://reccas.com/openapi.json",mcp_server:"https://reccas.com/_api/mcp",privacy:"https://reccas.com/privacy"}}));
  if(path==="/directory-kit.json")return Response.json({name:"Reccas",url:"https://reccas.com/",submission_email:"hello@reccas.com",founded:2026,pricing_model:"freemium",canonical_sentence:"Reccas finds the clothes fashion editors and testers keep recommending, then checks what is still available and worth buying.",tagline:"Fashion recommendations with receipts.",categories:["Artificial Intelligence","Fashion","Shopping","Personal Productivity","Lifestyle"],developers:"https://reccas.com/developers"});
  if(path==="/manifest.json")return Response.json({name:"Reccas",short_name:"Reccas",description:"Fashion recommendations with receipts.",start_url:"/",display:"standalone",background_color:"#fcfbf8",theme_color:"#fcfbf8",icons:[{src:"/favicon-r.png?v=20261007",sizes:"128x128",type:"image/png"}]});
  if(path==="/openapi.json")return Response.json({openapi:"3.1.0",info:{title:"Reccas Agent API",version:"1.0.0",description:"Public read-only fashion and outfit intelligence from Reccas."},servers:[{url:"https://reccas.com"}],"x-mcp-server":"https://reccas.com/_api/mcp",paths:{"/_api/agent/search-outfits":{get:{operationId:"searchOutfits",summary:"Search complete Reccas outfits"}},"/_api/agent/find-products":{get:{operationId:"findProducts",summary:"Search the Reccas fashion catalog"}},"/_api/agent/style-guide":{get:{operationId:"getStyleGuide",summary:"Get Reccas styling principles and public guide links"}}}});
  var short="# Reccas\nURL: https://reccas.com/\nCanonical description: Reccas is an evidence-backed fashion recommendation engine. It finds the clothes fashion editors and testers keep recommending, preserves the source evidence, and checks current availability, price, fit caveats and whether each product still answers the shopping question.\n\n## Core topics\n- Evidence-backed fashion product recommendations\n- Fashion editor and tester consensus with source provenance\n- Best-in-category and use-case shopping guides\n- AI wardrobe management and closet-aware personal styling\n- What-to-wear and outfit guides\n- Capsule wardrobes and packing lists\n- Wedding guest, work, date-night and travel outfits\n- Weather and temperature dressing\n- Sourced fashion shopping recommendations with attributable evidence\n\n## Editorial approach\nReccas prioritizes complete outfits, wardrobe overlap, fit, price, versatility, occasion and season. Sourced shopping edits link to the publications or writers that recommended each product and may contain affiliate links.\n\n## Key public pages\n- Home: https://reccas.com/\n- Recommendations: https://reccas.com/recommendations\n- Guides: https://reccas.com/guides\n- About: https://reccas.com/about\n- Developers: https://reccas.com/developers\n\n## Public AI interfaces\n- MCP: https://reccas.com/_api/mcp\n- Search outfits: https://reccas.com/_api/agent/search-outfits\n- Find products: https://reccas.com/_api/agent/find-products\n- Style guide: https://reccas.com/_api/agent/style-guide\n- OpenAPI: https://reccas.com/openapi.json\n- Sitemap: https://reccas.com/sitemap.xml\n\n## Principles\n- Use what the user already owns before recommending redundant purchases.\n- Prefer complete, explainable outfits.\n- A useful answer can be to skip a purchase.";
  if(path==="/llms.txt")return new Response(short,{headers:{"content-type":"text/plain; charset=utf-8"}});
  if(path==="/llms-full.txt")return new Response(short+"\n\n## Public content\n- About: https://reccas.com/about\n- Press: https://reccas.com/press\n- Guides: https://reccas.com/guides\n\nPrivate wardrobe data is not exposed by public agent tools.",{headers:{"content-type":"text/plain; charset=utf-8"}});
  if(path==="/brand-kit.txt")return new Response("Reccas\nCanonical sentence: Reccas finds the clothes fashion editors and testers keep recommending, then checks what is still available and worth buying.\nTagline: Fashion recommendations with receipts.\n",{headers:{"content-type":"text/plain; charset=utf-8"}});
  return null;
}
function faviconResponse(){var raw=atob(FAVICON_B64),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Response(bytes,{headers:{"content-type":"image/png","cache-control":"public, max-age=86400","x-content-type-options":"nosniff"}})}
export default {async fetch(request,env){
  var u=new URL(request.url),path=u.pathname.replace(/\/+$/,"")||"/";
  if(path==="/favicon-r.png"||path==="/favicon.png"||path==="/favicon.ico")return faviconResponse();
  if(path==="/health")return Response.json({ok:true,service:"reccas",db:"d1",auth:{password:true,google:!!(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)}});
  if(path==="/robots.txt")return new Response("User-agent: *\\nAllow: /\\nAllow: /_api/edit-image\\nDisallow: /login\\nDisallow: /signup\\nDisallow: /wardrobe\\nDisallow: /admin/\\nDisallow: /_api/\\n\\nUser-agent: OAI-SearchBot\\nAllow: /\\nAllow: /_api/edit-image\\nDisallow: /login\\nDisallow: /signup\\nDisallow: /wardrobe\\nDisallow: /admin/\\nDisallow: /_api/\\n\\nUser-agent: GPTBot\\nAllow: /\\nAllow: /_api/edit-image\\nDisallow: /login\\nDisallow: /signup\\nDisallow: /wardrobe\\nDisallow: /admin/\\nDisallow: /_api/\\n\\nUser-agent: ChatGPT-User\\nAllow: /\\nDisallow: /login\\nDisallow: /signup\\nDisallow: /wardrobe\\nDisallow: /admin/\\n\\nSitemap: https://reccas.com/sitemap.xml\\n",{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}});
  if(path==="/sitemap.xml"||path==="/_api/sitemap")return sitemap(env);
  var machine=machineResource(path);if(machine)return machine;
  if(path==="/_api/agent/find-products"&&request.method==="GET")return Response.json({products:await agentProducts(env,u)},{headers:{"Cache-Control":"public, max-age=300"}});
  if(path==="/_api/agent/search-outfits"&&request.method==="GET")return Response.json({outfits:await agentOutfits(env,u)},{headers:{"Cache-Control":"public, max-age=300"}});
  if(path==="/_api/agent/style-guide"&&request.method==="GET")return Response.json(styleGuide(),{headers:{"Cache-Control":"public, max-age=3600"}});
  if(path==="/_api/mcp"&&request.method==="POST")return mcp(request,env);
  if(path==="/_api/out")return out(request,env);
  if((path==="/recommendation-image"||path==="/_api/edit-image")&&request.method==="GET")return editImage(request,env);
  if(path==="/_api/auth/login_with_password"&&request.method==="POST")return loginPassword(request,env);
  if(path==="/_api/auth/register_with_password"&&request.method==="POST")return registerPassword(request,env);
  if(path==="/_api/auth/google_authorize"||path==="/_api/auth/oauth_authorize")return oauthAuthorize(request,env);
  if(path==="/_api/auth/google_callback"||path==="/_api/auth/oauth_callback")return oauthCallback(request,env);
  if(path==="/_api/auth/session")return authSession(request,env);
  if(path==="/_api/auth/logout"&&request.method==="POST")return logout(request,env);
  if(path==="/_api/wardrobe/dashboard")return apiDashboard(request,env);
  if(path==="/_api/wardrobe/item"&&request.method==="POST")return addWardrobeItem(request,env);
  if(path==="/_api/wardrobe/profile"&&request.method==="POST")return wardrobeProfile(request,env);
  if(path==="/_api/wardrobe/signal"&&request.method==="POST")return wardrobeSignal(request,env);
  if(path==="/_api/price-watch"&&(request.method==="GET"||request.method==="POST"))return priceWatch(request,env);
  if(path==="/_api/wardrobe/outfits/feedback"&&request.method==="POST")return wardrobeFeedback(request,env);
  if(path==="/_api/wardrobe/outfits/generate"&&request.method==="POST")return generateWardrobe(request,env);
  if(path==="/_api/wardrobe/product-search"&&request.method==="POST")return wardrobeProductSearchFull(request,env);
  if(path==="/_api/wardrobe/photo-upload"&&request.method==="POST")return photoUpload(request,env);
  if(path==="/_api/wardrobe/photo-analyze"&&request.method==="POST")return photoAnalyze(request,env);
  if(path==="/_api/wardrobe/import-candidates"&&request.method==="GET")return importCandidates(request,env);
  if(path==="/_api/wardrobe/import-decision"&&request.method==="POST")return importDecision(request,env,false);
  if(path==="/_api/wardrobe/import-bulk"&&request.method==="POST")return importDecision(request,env,true);
  if(path==="/_api/wardrobe/import-scan"&&request.method==="POST")return importScan(request,env);
  if(path==="/_api/integrations/nylas/config"&&request.method==="GET")return nylasConfig(request,env);
  if(path==="/_api/integrations/nylas/state"&&request.method==="POST")return nylasState(request,env);
  if(path==="/_api/integrations/nylas/register"&&request.method==="POST")return nylasRegister(request,env);
  if(path==="/_api/integrations/nylas/callback"&&request.method==="GET")return nylasCallback(request,env);
  if(path==="/_api/commerce/track"&&request.method==="POST")return commerceTrack(request,env);
  if(path==="/_api/requests/view"&&request.method==="POST")return requestView(request,env);
  if(path==="/_api/admin/conversion"&&request.method==="GET")return adminConversionApi(request,env);
  if(path==="/wardrobe/generate"&&request.method==="POST")return generateWardrobe(request,env);
  if(path==="/")return home(env);
  if(path==="/guides")return guides(env);
  if(path==="/recommendations")return recommendations(env);
  if(path==="/shopping-edits")return Response.redirect("https://reccas.com/recommendations",301);
  if(path.indexOf("/r/")===0&&path.length>3)return Response.redirect("https://reccas.com/"+path.slice(3),301);
  if(path==="/login"||path==="/signup")return loginPage(request,path);
  if(path==="/wardrobe")return wardrobePage(request,env);
  if(path==="/admin/conversion")return adminConversionPage(request,env);
  if(STATIC_COLLECTIONS[path])return collection(env,path);
  var sp=await staticPage(path);if(sp)return sp;
  if(path.indexOf("/events/")===0){var ep=await hub(env,"event",path.slice(8));if(ep)return ep}
  if(path.indexOf("/tags/")===0){var tp=await hub(env,"tag",path.slice(6));if(tp)return tp}
  var slug=path.slice(1),se=await sourced(env,slug);if(se)return se;
  var rp=await requestPage(env,slug);if(rp)return rp;
  var red=await env.DB.prepare("SELECT to_slug FROM slug_redirects WHERE from_slug=? LIMIT 1").bind(slug).first();if(red&&red.to_slug)return Response.redirect("https://reccas.com/"+red.to_slug,301);
  return page(path,"Not found","<main class='wrap'><section class='hero'><h1>Page not found</h1><p><a href='/guides'>Browse Reccas guides →</a></p></section></main>","Page not found",404,"noindex, follow");
}}