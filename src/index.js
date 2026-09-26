import bcrypt from "bcryptjs";
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
.editVisual img{display:block;width:100%;height:100%;max-height:410px;object-fit:contain;padding:22px}
.editRank{position:absolute;top:14px;left:14px;font-weight:700}
.editCopy{padding:28px 30px;display:flex;flex-direction:column}
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
.footer{border-top:1px solid var(--lavender);padding:48px 24px;background:rgba(255,255,255,.55);color:#514b65;font-size:13px}
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
  .editCopy{padding:22px 20px}
  .drawer{width:100vw}
  .footer-inner{grid-template-columns:1fr}
  .footer-links{justify-content:flex-start}
}
`;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function money(v){var n=Number(v);return Number.isFinite(n)?"$"+n.toFixed(n%1?2:0):""}
function cookieMap(request){var out={};var h=request.headers.get("cookie")||"";h.split(";").forEach(function(x){var i=x.indexOf("=");if(i>0)out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim())});return out}
function randHex(bytes){var a=new Uint8Array(bytes);crypto.getRandomValues(a);return Array.from(a).map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
function b64url(bytes){var s="";bytes.forEach(function(b){s+=String.fromCharCode(b)});return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sha256(s){return new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))}
function page(path,title,body,desc,status,robots){
  var description=desc||"Reccas is an AI wardrobe manager.",url="https://reccas.com"+path,fullTitle=/\|\s*Reccas\s*$/i.test(String(title))?String(title):String(title)+" | Reccas";
  var schema=JSON.stringify([{"@context":"https://schema.org","@type":"Organization","@id":"https://reccas.com/#organization",name:"Reccas",url:"https://reccas.com/",description:"Reccas is an AI wardrobe manager that learns what you own, what fits, and what you like."},{"@context":"https://schema.org","@type":"WebSite","@id":"https://reccas.com/#website",name:"Reccas",url:"https://reccas.com/",publisher:{"@id":"https://reccas.com/#organization"}}]).replace(/</g,"\\u003c");
  var icon="https://assets.floot.app/192bde5b-09cd-42c2-840f-8e3f274de8eb/78e7f481-c1fc-4841-8d9e-fcdeda5f4a34.png";
  var head="<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>"+esc(fullTitle)+"</title><meta name='description' content='"+esc(description)+"'><meta name='robots' content='"+esc(robots||"index, follow")+"'><link rel='canonical' href='"+esc(url)+"'><link rel='manifest' href='/manifest.json'><link rel='icon' href='"+icon+"'><meta property='og:site_name' content='Reccas'><meta property='og:type' content='website'><meta property='og:title' content='"+esc(fullTitle)+"'><meta property='og:description' content='"+esc(description)+"'><meta property='og:url' content='"+esc(url)+"'><meta name='twitter:card' content='summary'><script type='application/ld+json'>"+schema+"</script><style>"+css+"</style></head><body>";
  var nav="<header><div class='nav'><a class='brand' href='/'>Reccas</a><nav class='navlinks'><a href='/guides'>Outfit &amp; wardrobe guides</a><a href='/wardrobe'>My wardrobe</a><a href='/about'>About</a></nav><a class='btn alt' href='/wardrobe'>Ask Reccas</a></div></header>";
  var foot="<footer class='footer'><div class='footer-inner'><div><div class='footer-brand'>Reccas</div><div>Editorial wardrobe guidance, useful shopping recommendations, and outfits built around what you already own.</div></div><nav class='footer-links'><a href='/guides'>Guides</a><a href='/wardrobe'>Wardrobe</a><a href='/about'>How it works</a><a href='/privacy'>Privacy</a><a href='/llms.txt'>llms.txt</a></nav></div></footer></body></html>";
  return new Response(head+nav+body+foot,{status:status||200,headers:{"content-type":"text/html; charset=utf-8","cache-control":status===404?"no-store":"public, max-age=120","x-content-type-options":"nosniff","referrer-policy":"strict-origin-when-cross-origin"}});
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
  if(!email||!email.includes("@")||password.length<8||!displayName)return Response.json({message:"Enter a name, valid email, and password of at least 8 characters."},{status:400});
  if(await env.DB.prepare("SELECT id FROM users WHERE lower(email)=? LIMIT 1").bind(email).first())return Response.json({message:"Email already in use"},{status:409});
  var slug=await uniqueSlug(env,displayName),now=new Date().toISOString(),hash=await pbkdf2Hash(password);
  await env.DB.prepare("INSERT INTO users(email,display_name,avatar_url,role,created_at,updated_at,bio,reputation_score,username_slug) VALUES(?,?,?,?,?,?,?,?,?)").bind(email,displayName,null,"user",now,now,null,0,slug).run();
  var user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first();
  await env.DB.prepare("INSERT INTO user_passwords(user_id,password_hash) VALUES(?,?)").bind(user.id,hash).run();
  var sid=await createSession(env,user.id);
  return new Response(JSON.stringify({user:{id:user.id,email:user.email,displayName:user.display_name,usernameSlug:user.username_slug,avatarUrl:user.avatar_url,bio:user.bio,reputationScore:user.reputation_score}}),{status:201,headers:{"content-type":"application/json","cache-control":"no-store","set-cookie":sessionCookie(sid)}});
}
async function home(env){
  var reqs=await all(env.DB,"SELECT slug,title,description,event_type FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%' ORDER BY COALESCE(last_activity_at,created_at) DESC LIMIT 12");
  var cards=reqs.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><span class='eyebrow'>"+esc(String(r.event_type||"style").replaceAll("_"," "))+"</span><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"").slice(0,145))+"</p><strong>View outfits →</strong></a>"}).join("");
  return page("/","AI Wardrobe Manager","<main class='wrap'><section class='hero'><span class='eyebrow'>AI wardrobe manager</span><h1>Your wardrobe, managed.</h1><p>Know what to wear, what to buy, and what to skip. Reccas learns your closet, fit, taste and budget over time.</p><form class='ask' action='/wardrobe'><input name='prompt' placeholder='What should I wear to a fall winery lunch?'><button class='btn'>Ask Reccas</button></form></section><section class='section'><div class='eyebrow'>Explore</div><h2>Popular style guides</h2><div class='grid'><a class='card' href='/what-to-wear-by-temperature'><h3>What to wear by temperature</h3><p>Real outfit formulas for changing weather.</p></a><a class='card' href='/capsule-wardrobes'><h3>Capsule wardrobes</h3><p>Seasonal outfits built around versatile pieces.</p></a><a class='card' href='/wedding-guest-dresses-by-color'><h3>Wedding guest dressing</h3><p>Color, season and dress-code guides.</p></a></div></section><section class='section'><div class='eyebrow'>Browse</div><h2>Outfit ideas for right now</h2><div class='grid'>"+cards+"</div></section></main>","Build outfits from your closet first, then shop only when something fills a real gap.");
}
async function guides(env){
  var reqs=await all(env.DB,"SELECT slug,title,description,event_type FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%' ORDER BY title");
  var edits=await all(env.DB,"SELECT slug,json FROM sourced_shopping_edits ORDER BY slug"),bySlug=new Map();
  reqs.forEach(function(r){bySlug.set(String(r.slug),{slug:r.slug,title:r.title,description:r.description||"",kind:"request"})});
  edits.forEach(function(x){try{var e=JSON.parse(x.json);if(!bySlug.has(String(x.slug)))bySlug.set(String(x.slug),{slug:x.slug,title:e.title||x.slug,description:e.description||e.deck||"",kind:"sourced"})}catch(_){}});
  var allGuides=Array.from(bySlug.values()).sort(function(a,b){return String(a.title).localeCompare(String(b.title))});
  var roundupPills=Object.keys(STATIC_COLLECTIONS).map(function(path){var v=STATIC_COLLECTIONS[path];return "<a class='guidePill' href='"+path+"'>"+esc(v[0])+" <span>→</span></a>"}).join("");
  var tiles=allGuides.map(function(r){return "<a class='guideTile' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"Curated outfits and shoppable picks from Reccas."))+"</p><strong>View guide →</strong></a>"}).join("");
  return page("/guides","Outfit & Wardrobe Guides","<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas style guides</span><h1>Outfit & Wardrobe Guides</h1><p>Outfit ideas, product guides, sourced shopping recommendations, travel, capsules and everyday dressing — all in one place.</p></section><section class='section'><span class='eyebrow'>Browse roundups</span><div class='guideRoundups'>"+roundupPills+"</div></section><section class='section'><h2>All guides</h2><p class='guideCount'>"+allGuides.length+" current guides</p><div class='guideGrid'>"+tiles+"</div></section></main>","Outfit, wardrobe and shopping guides from Reccas.");
}
async function collection(env,path){
  var meta=STATIC_COLLECTIONS[path],where="";
  if(path.indexOf("temperature")>=0)where=" AND (title LIKE '%degree%' OR slug LIKE '%degree%')";
  else if(path.indexOf("capsule")>=0)where=" AND (title LIKE '%capsule%' OR slug LIKE '%capsule%')";
  else if(path.indexOf("wedding")>=0)where=" AND (title LIKE '%wedding%' OR event_type='wedding')";
  else if(path.indexOf("travel")>=0)where=" AND (title LIKE '%travel%' OR title LIKE '%Paris%' OR title LIKE '%trip%' OR event_type='vacation')";
  var reqs=await all(env.DB,"SELECT slug,title,description FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%'"+where+" ORDER BY title LIMIT 120");
  var cards=reqs.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"").slice(0,150))+"</p><strong>View guide →</strong></a>"}).join("");
  return page(path,meta[0],"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide collection</span><h1>"+esc(meta[0])+"</h1><p>"+esc(meta[1])+"</p></section><div class='grid'>"+cards+"</div></main>",meta[1]);
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
  return page("/"+(kind==="event"?"events/":"tags/")+slug,title,"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide hub</span><h1>"+esc(title)+"</h1><p>"+esc(desc)+"</p></section><div class='grid'>"+rows.map(function(r){return "<a class='card' href='/"+esc(r.slug)+"'><h3>"+esc(r.title)+"</h3><p>"+esc(String(r.description||"").slice(0,150))+"</p><strong>View outfits →</strong></a>"}).join("")+"</div></main>",desc);
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
    return page("/"+slug,r.title,"<main class='wrap'><section class='hero'><span class='eyebrow'>"+esc(String(r.event_type||"style guide").replaceAll("_"," "))+"</span><h1>"+esc(r.title)+"</h1><p>"+esc(r.intro_text||r.description||"")+"</p></section><section class='section'><h2>Outfit ideas</h2><div class='outfits'>"+outfitHtml.join("")+"</div></section></main>"+drawer+tracking,r.description||r.intro_text||r.title);
  }
  var recRows=await all(env.DB,"SELECT rr.id recommendation_id,rr.comment,rr.upvotes,rr.created_at,p.id product_id,p.title,p.image_url,p.price,p.canonical_category,b.name brand_name,(SELECT po.affiliate_url FROM product_offers po WHERE po.product_id=p.id AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL ORDER BY po.commission_rate DESC LIMIT 1) affiliate_url FROM recommendations rr JOIN products p ON p.id=rr.product_id LEFT JOIN brands b ON b.id=p.brand_id WHERE rr.request_id=? AND p.is_product_page_live=1 ORDER BY rr.upvotes DESC,rr.created_at DESC LIMIT 80",r.id);
  var seen=new Set(),picks=[];recRows.forEach(function(x){if(x.affiliate_url&&!seen.has(x.product_id)){seen.add(x.product_id);picks.push(x)}});picks=picks.slice(0,12);
  var productHtml=picks.map(function(x){var tracked="/_api/out?requestId="+encodeURIComponent(r.id)+"&recommendationId="+encodeURIComponent(x.recommendation_id)+"&productId="+encodeURIComponent(x.product_id)+"&to="+encodeURIComponent(x.affiliate_url),note=String(x.comment||"").trim();return "<article class='shopcard'>"+(x.image_url?"<img src='"+esc(x.image_url)+"' alt='"+esc(x.title||"Product")+"' loading='lazy'>":"<div style='aspect-ratio:4/5;background:#f7f5f1'></div>")+"<div class='productBrand'>"+esc(x.brand_name||x.canonical_category||"Reccas pick")+"</div><h3>"+esc(x.title||"Product")+"</h3><p class='muted'>"+money(x.price)+"</p>"+(note?"<p class='productNote'>"+esc(note.slice(0,180))+"</p>":"<div style='flex:1'></div>")+"<a class='btn' href='"+tracked+"' target='_blank' rel='sponsored noreferrer'>Shop</a></article>"}).join("");
  var viewTrack="<script>(function(){try{var k='reccas_session_id',s=localStorage.getItem(k);if(!s){s=crypto.randomUUID();localStorage.setItem(k,s)}navigator.sendBeacon('/_api/requests/view',new Blob([JSON.stringify({requestId:"+JSON.stringify(String(r.id))+",sessionId:s,referrer:document.referrer||null})],{type:'application/json'}))}catch(_){}})();</script>";
  return page("/"+slug,r.title,"<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas guide</span><h1>"+esc(r.title)+"</h1><p>"+esc(r.intro_text||r.description||"")+"</p></section><section class='section'><h2>Recommended picks</h2><div class='shopgrid'>"+productHtml+"</div></section></main>"+viewTrack,r.description||r.intro_text||r.title);
}
async function sourced(env,slug){
  var row=await env.DB.prepare("SELECT json FROM sourced_shopping_edits WHERE slug=? LIMIT 1").bind(slug).first();if(!row)return null;
  var e=JSON.parse(row.json),totalSources=e.picks.reduce(function(n,x){return n+(x.evidence||[]).length},0),cards=e.picks.map(function(x){
    var track="/_api/out?edit="+encodeURIComponent(slug)+"&to="+encodeURIComponent(x.shopUrl);
    var ev=(x.evidence||[]).map(function(z){return "<a class='editSource' href='"+esc(z.url)+"' target='_blank' rel='noreferrer'><strong>"+esc(z.source)+"</strong> · "+esc(z.label)+" ↗</a>"}).join("");
    var img="/_api/edit-image?slug="+encodeURIComponent(slug)+"&rank="+encodeURIComponent(x.rank);
    return "<article class='editPick'><div class='editVisual'><span class='editRank'>#"+esc(x.rank)+"</span><img src='"+img+"' alt='"+esc(x.brand+" "+x.name)+"' loading='"+(x.rank===1?"eager":"lazy")+"'></div><div class='editCopy'><div class='editTop'><div><p class='editBrand'>"+esc(x.brand)+"</p><h2>"+esc(x.name)+"</h2></div><span class='editPrice'>"+esc(x.price)+"</span></div><div class='editLive'>Still shoppable · "+esc((x.evidence||[]).length)+" recommendation source"+((x.evidence||[]).length===1?"":"s")+"</div><p class='editSummary'>"+esc(x.summary)+"</p><div class='editSources'>"+ev+"</div><p class='editNote'><strong>Worth knowing:</strong> "+esc(x.fitNote)+"</p><div class='editActions'><a class='btn' href='"+track+"' target='_blank' rel='sponsored noreferrer'>Shop "+esc(x.price)+"</a></div></div></article>";
  }).join("");
  var metrics="<div class='editMetrics'><span><strong>"+esc(e.picks.length)+"</strong> live picks</span><span><strong>"+esc(totalSources)+"</strong> sourced mentions</span><span><strong>"+esc(e.checkedLabel||"Sep 2026")+"</strong> last checked</span></div>";
  var intro="<section class='editIntro'><div><span class='eyebrow'>Why this is different</span><h2>Consensus, with receipts.</h2></div><p>Every recommendation links back to the writer or publication that made it. Reccas looks for attributable picks, then checks the product against the actual shopping constraint.</p></section>";
  var method="<section class='editMethod'><span class='eyebrow'>How Reccas built this guide</span><h2>What counts as a recommendation?</h2><p>"+esc(e.freshnessCopy||"The product must still have a live shopping route and satisfy the stated category, price, or use-case constraint when Reccas checks it.")+" Reccas may earn a commission from some shopping links.</p></section>";
  return page("/"+slug,e.seoTitle||e.title,"<main class='wrap'><section class='hero editHero'><span class='eyebrow'>Reccas guide</span><h1>"+esc(e.title)+"</h1><p>"+esc(e.deck||e.description)+"</p>"+metrics+"</section>"+intro+"<section class='editList'>"+cards+"</section>"+method+"</main>",e.description||e.title);
}
async function editImage(request,env){
  var u=new URL(request.url),slug=u.searchParams.get("slug"),rank=Number(u.searchParams.get("rank"));if(!slug||!rank)return new Response("Bad image request",{status:400});
  var row=await env.DB.prepare("SELECT json FROM sourced_shopping_edits WHERE slug=? LIMIT 1").bind(slug).first();if(!row)return new Response("Not found",{status:404});
  var e;try{e=JSON.parse(row.json)}catch(_){return new Response("Not found",{status:404})}
  var pick=(e.picks||[]).find(function(x){return Number(x.rank)===rank});if(!pick||!pick.imageUrl||!/^https:\/\//i.test(pick.imageUrl))return new Response("Not found",{status:404});
  try{
    var src=new URL(pick.imageUrl),up=await fetch(src.toString(),{redirect:"follow",headers:{"user-agent":"Mozilla/5.0 (compatible; ReccasImage/1.0)","accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8","referer":src.origin+"/"}});
    if(!up.ok)throw new Error("upstream "+up.status);
    var ct=up.headers.get("content-type")||"";if(ct.indexOf("image/")!==0)throw new Error("not image");
    return new Response(up.body,{headers:{"content-type":ct,"cache-control":"public, max-age=86400, stale-while-revalidate=604800","x-content-type-options":"nosniff"}});
  }catch(_){
    var svg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'><rect width='800' height='800' fill='%23f4f1ec'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' fill='%2377717b' font-family='Arial,sans-serif' font-size='28'>"+esc(pick.brand)+"</text><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='%23272733' font-family='Arial,sans-serif' font-size='34' font-weight='600'>"+esc(pick.name)+"</text></svg>";
    return new Response(svg,{headers:{"content-type":"image/svg+xml; charset=utf-8","cache-control":"public, max-age=300"}});
  }
}
async function staticPage(path){
  if(path==="/about")return page(path,"About Reccas","<main class='wrap'><section class='hero'><span class='eyebrow'>About Reccas</span><h1>Shopping is not the default answer.</h1><p>Reccas is an AI wardrobe manager. It starts with what you own, learns your fit and taste, and recommends something new only when it fills a real gap.</p></section></main>","About Reccas.");
  if(path==="/press")return page(path,"Brand & Press Kit","<main class='wrap'><section class='hero'><span class='eyebrow'>Brand & press kit</span><h1>Describe Reccas consistently.</h1><p>Reccas is an AI wardrobe manager that helps you decide what to wear, what to buy, what to skip, and what to watch.</p></section></main>","Reccas brand and press kit.");
  if(path==="/developers")return page(path,"Developers","<main class='wrap'><section class='hero'><span class='eyebrow'>Developer access</span><h1>Reccas for AI assistants.</h1><p>Connect assistants to Reccas outfit and fashion data through public machine-readable interfaces.</p></section></main>","Developer access for Reccas.");
  if(path==="/privacy")return page(path,"Privacy","<main class='wrap'><section class='hero'><span class='eyebrow'>Privacy</span><h1>Privacy at Reccas.</h1><p>Reccas stores account and wardrobe information needed to provide closet-aware recommendations. Authentication cookies are HTTP-only and secure.</p></section></main>","Reccas privacy information.");
  return null;
}
async function sitemap(env){
  var reqs=await all(env.DB,"SELECT id,slug,COALESCE(last_activity_at,created_at) lastmod FROM requests WHERE slug IS NOT NULL AND slug NOT LIKE 'archived--%' ORDER BY slug");
  var tags=await all(env.DB,"SELECT t.slug,MAX(r.last_activity_at) lastmod,COUNT(*) n FROM tags t JOIN request_tags rt ON rt.tag_id=t.id JOIN requests r ON r.id=rt.request_id AND r.status='open' WHERE t.is_indexable=1 GROUP BY t.id,t.slug HAVING COUNT(*)>=3");
  var events=await all(env.DB,"SELECT event_type,MAX(last_activity_at) lastmod FROM requests WHERE event_type IS NOT NULL GROUP BY event_type");
  var staticPaths=["/","/about","/press","/developers","/privacy","/guides","/what-to-wear-by-temperature","/capsule-wardrobes","/wedding-guest-dresses-by-color","/travel-packing-guides","/outfit-formulas","/best-ballet-flats-under-250"];
  var editRows=await all(env.DB,"SELECT slug FROM sourced_shopping_edits ORDER BY slug");editRows.forEach(function(x){staticPaths.push("/"+x.slug)});
  var set=new Set(staticPaths),entries=[];
  staticPaths.forEach(function(p){if(set.has(p)){entries.push({p:p,last:"2026-09-21"});set.delete(p)}});
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
  if(!env.AUTH0_DOMAIN||!env.AUTH0_CLIENT_ID)return new Response("Google login is not configured",{status:503});
  var state=randHex(32),verifier=b64url(crypto.getRandomValues(new Uint8Array(32))),redirect="https://reccas.com/_api/auth/oauth_callback",now=new Date(),exp=new Date(now.getTime()+600000);
  await env.DB.prepare("DELETE FROM oauth_states WHERE expires_at<?").bind(now.toISOString()).run();
  await env.DB.prepare("INSERT INTO oauth_states(state,code_verifier,provider,redirect_url,created_at,expires_at) VALUES(?,?,?,?,?,?)").bind(state,verifier,"auth0",redirect,now.toISOString(),exp.toISOString()).run();
  var p=new URLSearchParams({response_type:"code",client_id:env.AUTH0_CLIENT_ID,redirect_uri:redirect,scope:"openid email profile",state:state,connection:"google-oauth2"});
  var domain=String(env.AUTH0_DOMAIN).replace(/^https?:\/\//,"").replace(/\/$/,"");
  return new Response("Redirecting...",{status:302,headers:{Location:"https://"+domain+"/authorize?"+p.toString(),"Cache-Control":"no-store","Set-Cookie":OAUTH_STATE_COOKIE+"="+state+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600"}});
}
async function uniqueSlug(env,name){
  var base=String(name||"user").toLowerCase().replace(/\$/g,"").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"user",s=base,i=2;
  while(await env.DB.prepare("SELECT id FROM users WHERE username_slug=? LIMIT 1").bind(s).first()){s=base+"-"+i;i++}return s;
}
async function oauthCallback(request,env){
  var u=new URL(request.url),code=u.searchParams.get("code"),state=u.searchParams.get("state"),err=u.searchParams.get("error"),cookies=cookieMap(request);
  if(err||!code||!state||cookies[OAUTH_STATE_COOKIE]!==state)return page("/login","Login failed","<main class='wrap'><div class='auth'><h1>Login failed</h1><p>Please try again.</p><a class='btn' href='/login'>Back to login</a></div></main>","Login failed",400,"noindex, follow");
  var st=await env.DB.prepare("SELECT * FROM oauth_states WHERE state=? LIMIT 1").bind(state).first();if(!st||Date.parse(String(st.expires_at))<Date.now())return new Response("OAuth state expired",{status:400});
  if(!env.AUTH0_DOMAIN||!env.AUTH0_CLIENT_ID||!env.AUTH0_CLIENT_SECRET)return new Response("Google login is not configured",{status:503});
  var domain=String(env.AUTH0_DOMAIN).replace(/^https?:\/\//,"").replace(/\/$/,"");
  var tr=await fetch("https://"+domain+"/oauth/token",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({grant_type:"authorization_code",code:code,client_id:env.AUTH0_CLIENT_ID,client_secret:env.AUTH0_CLIENT_SECRET,redirect_uri:st.redirect_url})});
  if(!tr.ok)return new Response("OAuth token exchange failed",{status:502});var tok=await tr.json();
  var ir=await fetch("https://"+domain+"/userinfo",{headers:{Authorization:(tok.token_type||"Bearer")+" "+tok.access_token}});if(!ir.ok)return new Response("OAuth user lookup failed",{status:502});var info=await ir.json();
  var email=String(info.email||"").toLowerCase(),name=String(info.name||email.split("@")[0]||"Reccas user");if(!email)return new Response("OAuth email missing",{status:400});
  var user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first(),now=new Date().toISOString();
  if(!user){var slug=await uniqueSlug(env,name);await env.DB.prepare("INSERT INTO users(email,display_name,avatar_url,role,created_at,updated_at,bio,reputation_score,username_slug) VALUES(?,?,?,?,?,?,?,?,?)").bind(email,name,info.picture||null,"user",now,now,null,0,slug).run();user=await env.DB.prepare("SELECT * FROM users WHERE lower(email)=? LIMIT 1").bind(email).first()}
  var acct=await env.DB.prepare("SELECT id FROM oauth_accounts WHERE user_id=? AND provider='auth0' LIMIT 1").bind(user.id).first();
  if(acct)await env.DB.prepare("UPDATE oauth_accounts SET provider_user_id=?,provider_email=?,updated_at=? WHERE id=?").bind(String(info.sub||info.id||email),email,now,acct.id).run();
  else await env.DB.prepare("INSERT INTO oauth_accounts(user_id,provider,provider_user_id,provider_email,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(user.id,"auth0",String(info.sub||info.id||email),email,now,now).run();
  var sid=randHex(32),expires=new Date(Date.now()+604800000).toISOString();await env.DB.prepare("INSERT INTO sessions(id,user_id,created_at,last_accessed,expires_at) VALUES(?,?,?,?,?)").bind(sid,user.id,now,now,expires).run();
  await env.DB.prepare("DELETE FROM oauth_states WHERE state=?").bind(state).run();
  return new Response("Redirecting...",{status:302,headers:{Location:"/wardrobe","Cache-Control":"no-store","Set-Cookie":sessionCookie(sid)}});
}
async function authSession(request,env){
  var who=await sessionUser(request,env);if(!who)return Response.json({error:"Not authenticated"},{status:401,headers:{"Cache-Control":"no-store"}});
  return Response.json({user:who.user},{headers:{"Cache-Control":"no-store"}});
}
async function logout(request,env){
  var sid=cookieMap(request)[COOKIE];if(sid)await env.DB.prepare("DELETE FROM sessions WHERE id=?").bind(sid).run();
  return new Response(null,{status:204,headers:{"Set-Cookie":COOKIE+"=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0","Cache-Control":"no-store"}});
}
function loginPage(path){
  var signup=path==="/signup",action=signup?"/_api/auth/register_with_password":"/_api/auth/login_with_password";
  var fields=(signup?"<input class='field' name='displayName' required placeholder='Your name'>":"")+"<input class='field' type='email' name='email' required autocomplete='email' placeholder='Email'><input class='field' type='password' name='password' required minlength='8' autocomplete='"+(signup?"new-password":"current-password")+"' placeholder='Password'>";
  var switcher=signup?"Already have an account? <a href='/login'><strong>Log in</strong></a>":"New to Reccas? <a href='/signup'><strong>Create an account</strong></a>";
  var google="<a class='btn alt' style='width:100%;margin-bottom:12px' href='/_api/auth/oauth_authorize'>Continue with Google</a><div class='muted' style='text-align:center;margin:2px 0 12px'>or</div>";
  var script="<script>document.getElementById('authForm').addEventListener('submit',async function(e){e.preventDefault();var f=new FormData(e.currentTarget),o=Object.fromEntries(f.entries()),m=document.getElementById('msg');m.textContent='';var r=await fetch('"+action+"',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)});var j={};try{j=await r.json()}catch(_){}if(r.ok){location.href='/wardrobe'}else{m.textContent=j.message||'Could not continue'}});</script>";
  return page(path,signup?"Create your Reccas account":"Log in to Reccas","<main class='wrap'><div class='auth'><span class='eyebrow'>Reccas account</span><h1>"+(signup?"Build a wardrobe Reccas can remember.":"Return to your wardrobe.")+"</h1><p class='muted'>Your closet, fit, taste and saved decisions stay attached to your account.</p>"+google+"<form id='authForm' class='stack'>"+fields+"<button class='btn' type='submit'>"+(signup?"Create account":"Log in")+"</button><div id='msg' class='muted'></div></form><p class='muted' style='margin-top:18px'>"+switcher+"</p></div></main>"+script,"Reccas account",200,"noindex, follow");
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
        for(var j=0;j<items.length;j++){var it=items[j];if(!it.message_id||!it.title||Number(it.confidence||0)<0.55)continue;var src=m
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
function styleGuide(){return {brand:"Reccas",canonicalUrl:"https://reccas.com/",summary:"Reccas is an AI wardrobe manager and closet-aware personal stylist that helps people decide what to wear, what to buy, what to skip, and what to watch.",principles:["Use what the user already owns before recommending a redundant purchase.","Prefer a few complete, explainable outfits over generic recommendation overload.","Fit, price, wardrobe overlap, versatility, occasion, season, and style should influence recommendations.","A useful recommendation can be to skip a purchase or wait for a better price."],publicGuides:[{title:"Fall capsule wardrobe",url:"https://reccas.com/fall-capsule-wardrobe"},{title:"Summer capsule wardrobe",url:"https://reccas.com/summer-capsule-wardrobe"},{title:"What to wear in Paris in fall",url:"https://reccas.com/what-to-wear-in-paris-fall"},{title:"Casual date-night outfit ideas",url:"https://reccas.com/date-night-outfit-ideas-casual"},{title:"Best little black dresses",url:"https://reccas.com/best-little-black-dresses"}]}}
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
  var common={name:"Reccas",canonical_url:"https://reccas.com/",description:"Reccas is an AI wardrobe manager and closet-aware personal stylist. It learns what you own, what fits, what you like, and your budget to help decide what to wear, what to buy, what to skip, and what to watch."};
  if(path==="/ai.json")return Response.json(Object.assign({},common,{type:"AI wardrobe manager",capabilities:["persistent wardrobe memory","closet-aware outfit recommendations","style and fit preferences","buy, skip, watch, and own product decisions","shoppable outfit discovery","public MCP tools for AI assistants","public REST/OpenAPI fashion search"],public_resources:{about:"https://reccas.com/about",press:"https://reccas.com/press",developers:"https://reccas.com/developers",sitemap:"https://reccas.com/sitemap.xml",llms:"https://reccas.com/llms.txt",llms_full:"https://reccas.com/llms-full.txt",openapi:"https://reccas.com/openapi.json",mcp_server:"https://reccas.com/_api/mcp",privacy:"https://reccas.com/privacy"}}));
  if(path==="/directory-kit.json")return Response.json({name:"Reccas",url:"https://reccas.com/",submission_email:"hello@reccas.com",founded:2026,pricing_model:"freemium",canonical_sentence:"Reccas is an AI wardrobe manager that helps you decide what to wear, what to buy, what to skip, and what to watch.",tagline:"An AI wardrobe manager that remembers your closet.",categories:["Artificial Intelligence","Fashion","Shopping","Personal Productivity","Lifestyle"],developers:"https://reccas.com/developers"});
  if(path==="/manifest.json")return Response.json({name:"Reccas",short_name:"Reccas",description:"Your wardrobe, managed.",start_url:"/",display:"standalone",background_color:"#fcfbf8",theme_color:"#fcfbf8",icons:[{src:"https://assets.floot.app/192bde5b-09cd-42c2-840f-8e3f274de8eb/78e7f481-c1fc-4841-8d9e-fcdeda5f4a34.png",sizes:"192x192",type:"image/png"}]});
  if(path==="/openapi.json")return Response.json({openapi:"3.1.0",info:{title:"Reccas Agent API",version:"1.0.0",description:"Public read-only fashion and outfit intelligence from Reccas."},servers:[{url:"https://reccas.com"}],"x-mcp-server":"https://reccas.com/_api/mcp",paths:{"/_api/agent/search-outfits":{get:{operationId:"searchOutfits",summary:"Search complete Reccas outfits"}},"/_api/agent/find-products":{get:{operationId:"findProducts",summary:"Search the Reccas fashion catalog"}},"/_api/agent/style-guide":{get:{operationId:"getStyleGuide",summary:"Get Reccas styling principles and public guide links"}}}});
  var short="# Reccas\nURL: https://reccas.com/\nDescription: Reccas is an AI wardrobe manager and closet-aware personal stylist.\n\n## Public AI interfaces\n- MCP: https://reccas.com/_api/mcp\n- Search outfits: https://reccas.com/_api/agent/search-outfits\n- Find products: https://reccas.com/_api/agent/find-products\n- Style guide: https://reccas.com/_api/agent/style-guide\n- OpenAPI: https://reccas.com/openapi.json\n- Sitemap: https://reccas.com/sitemap.xml\n\n## Principles\n- Use what the user already owns before recommending redundant purchases.\n- Prefer complete, explainable outfits.\n- A useful answer can be to skip a purchase.";
  if(path==="/llms.txt")return new Response(short,{headers:{"content-type":"text/plain; charset=utf-8"}});
  if(path==="/llms-full.txt")return new Response(short+"\n\n## Public content\n- About: https://reccas.com/about\n- Press: https://reccas.com/press\n- Guides: https://reccas.com/guides\n\nPrivate wardrobe data is not exposed by public agent tools.",{headers:{"content-type":"text/plain; charset=utf-8"}});
  if(path==="/brand-kit.txt")return new Response("Reccas\nCanonical sentence: Reccas is an AI wardrobe manager that helps you decide what to wear, what to buy, what to skip, and what to watch.\nTagline: An AI wardrobe manager that remembers your closet.\n",{headers:{"content-type":"text/plain; charset=utf-8"}});
  return null;
}
export default {async fetch(request,env){
  var u=new URL(request.url),path=u.pathname.replace(/\/+$/,"")||"/";
  if(path==="/health")return Response.json({ok:true,service:"reccas",db:"d1",auth:{password:true,google:!!(env.AUTH0_DOMAIN&&env.AUTH0_CLIENT_ID)}});
  if(path==="/robots.txt")return new Response("User-agent: *\\nAllow: /\\nDisallow: /login\\nDisallow: /signup\\nDisallow: /wardrobe\\nDisallow: /_api/\\nSitemap: https://reccas.com/sitemap.xml\\n",{headers:{"content-type":"text/plain"}});
  if(path==="/sitemap.xml"||path==="/_api/sitemap")return sitemap(env);
  var machine=machineResource(path);if(machine)return machine;
  if(path==="/_api/agent/find-products"&&request.method==="GET")return Response.json({products:await agentProducts(env,u)},{headers:{"Cache-Control":"public, max-age=300"}});
  if(path==="/_api/agent/search-outfits"&&request.method==="GET")return Response.json({outfits:await agentOutfits(env,u)},{headers:{"Cache-Control":"public, max-age=300"}});
  if(path==="/_api/agent/style-guide"&&request.method==="GET")return Response.json(styleGuide(),{headers:{"Cache-Control":"public, max-age=3600"}});
  if(path==="/_api/mcp"&&request.method==="POST")return mcp(request,env);
  if(path==="/_api/out")return out(request,env);
  if(path==="/_api/edit-image"&&request.method==="GET")return editImage(request,env);
  if(path==="/_api/auth/login_with_password"&&request.method==="POST")return loginPassword(request,env);
  if(path==="/_api/auth/register_with_password"&&request.method==="POST")return registerPassword(request,env);
  if(path==="/_api/auth/oauth_authorize")return oauthAuthorize(request,env);
  if(path==="/_api/auth/oauth_callback")return oauthCallback(request,env);
  if(path==="/_api/auth/session")return authSession(request,env);
  if(path==="/_api/auth/logout"&&request.method==="POST")return logout(request,env);
  if(path==="/_api/wardrobe/dashboard")return apiDashboard(request,env);
  if(path==="/_api/wardrobe/item"&&request.method==="POST")return addWardrobeItem(request,env);
  if(path==="/_api/wardrobe/profile"&&request.method==="POST")return wardrobeProfile(request,env);
  if(path==="/_api/wardrobe/signal"&&request.method==="POST")return wardrobeSignal(request,env);
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
  if(path==="/shopping-edits")return Response.redirect("https://reccas.com/guides",301);
  if(path==="/login"||path==="/signup")return loginPage(path);
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