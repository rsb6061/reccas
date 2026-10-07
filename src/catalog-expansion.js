export const CATALOG_EXPANSION_VERSION = "targeted-fashion-v1-2026-10-07";

const TARGETS = [
  ["women loafers","flat",["loafer"]],
  ["women leather loafers","flat",["loafer"]],
  ["women comfortable loafers","flat",["loafer"]],
  ["women ballet flats","flat",["ballet","flat"]],
  ["women walking flats","flat",["flat","mary jane","loafer"]],
  ["women white sneakers","shoe",["sneaker","trainer"]],
  ["women walking sneakers","shoe",["sneaker","walking","trainer"]],
  ["women travel sneakers","shoe",["sneaker","trainer"]],
  ["women ankle boots","boot",["ankle","boot","chelsea"]],
  ["women knee high boots","boot",["knee","tall boot","boot"]],
  ["women slingback heels","heel",["slingback","pump","heel"]],
  ["women block heels","heel",["heel","pump","sandal"]],
  ["women kitten heels","heel",["kitten","slingback","pump","heel"]],
  ["women crossbody bags","bag",["crossbody","sling"]],
  ["women small crossbody bags","bag",["crossbody","sling"]],
  ["women work tote bags","bag",["tote","work bag"]],
  ["women leather tote bags","bag",["tote"]],
  ["women travel tote bags","bag",["tote","travel bag"]],
  ["women shoulder bags","bag",["shoulder","hobo"]],
  ["women everyday handbags","bag",["bag","handbag","shoulder","tote"]],
  ["women wide leg jeans","jean",["jean","denim"]],
  ["women high rise jeans","jean",["jean","denim"]],
  ["women straight leg jeans","jean",["jean","denim"]],
  ["women petite jeans","jean",["jean","denim"]],
  ["women curvy jeans","jean",["jean","denim"]],
  ["women tall jeans","jean",["jean","denim"]],
  ["women work pants","pant",["pant","trouser"]],
  ["women wide leg trousers","pant",["pant","trouser"]],
  ["women black trousers","pant",["pant","trouser"]],
  ["women travel pants","pant",["pant","trouser","jogger"]],
  ["women wrinkle resistant pants","pant",["pant","trouser"]],
  ["women cashmere sweaters","knit",["cashmere","sweater","cardigan"]],
  ["women merino wool sweaters","knit",["merino","sweater","cardigan","knit"]],
  ["women cardigans","knit",["cardigan"]],
  ["women white t shirts","top",["shirt","tee","t-shirt"]],
  ["women button down shirts","top",["shirt","button"]],
  ["women work blouses","top",["blouse","shirt","top"]],
  ["women trench coats","coat",["trench"]],
  ["women wool coats","coat",["coat"]],
  ["women blazers","jacket",["blazer"]],
  ["women packable jackets","jacket",["jacket","puffer","shell"]],
  ["women puffer jackets","jacket",["puffer","jacket"]],
  ["women wedding guest dresses","dress",["dress","gown"]],
  ["women cocktail dresses","dress",["dress","gown"]],
  ["women midi dresses","dress",["dress"]],
  ["women work dresses","dress",["dress"]],
  ["women little black dresses","dress",["dress"]],
  ["women midi skirts","skirt",["skirt"]],
  ["women slip skirts","skirt",["skirt"]],
  ["women black leggings","activewear",["legging","tight"]],
  ["women everyday bras","intimates",["bra","bralette"]],
  ["women t shirt bras","intimates",["bra"]],
  ["women underwear","intimates",["brief","thong","underwear","panty","panties"]],
  ["women seamless underwear","intimates",["brief","thong","underwear","panty","panties"]]
];

function norm(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function compact(v){return norm(v).replace(/\s+/g,"")}
function domainOnly(v){
  try{
    var s=String(v||"").trim();if(!s)return"";
    if(s.indexOf("://")<0)s="https://"+s;
    return new URL(s).hostname.replace(/^www\./,"").toLowerCase();
  }catch(_){return""}
}
function imageOf(p){
  var xs=p&&p.images||[];
  for(var i=0;i<xs.length;i++){var x=xs[i],u=typeof x==="string"?x:(x&&x.url||x&&x.src);if(u)return u}
  return null;
}
function brandOf(p){return p&&p.brands&&p.brands[0]&&p.brands[0].name||""}
function colorOf(p){
  var xs=p&&p.colors||[];
  if(xs.length){var x=xs[0];return typeof x==="string"?x:(x&&x.name||x&&x.label||null)}
  return p&&p.color||null;
}
function titleFits(title,terms){
  var t=norm(title);
  return terms.some(function(x){return t.indexOf(norm(x))>=0});
}
function safeIdent(v){return '"' + String(v).replace(/"/g,'""') + '"'}
async function tableInfo(env,table){
  try{return (await env.DB.prepare("PRAGMA table_info("+safeIdent(table)+")").all()).results||[]}catch(_){return[]}
}
function usableMap(info,map){
  var names=new Set(info.map(function(x){return x.name})),out={};
  Object.keys(map).forEach(function(k){if(names.has(k)&&map[k]!==undefined)out[k]=map[k]});
  var missing=info.filter(function(x){
    return Number(x.notnull)===1&&!x.pk&&(x.dflt_value===null||x.dflt_value===undefined)&&!Object.prototype.hasOwnProperty.call(out,x.name);
  }).map(function(x){return x.name});
  return {row:out,missing:missing};
}
async function insertDynamic(env,table,info,map){
  var u=usableMap(info,map);if(u.missing.length)return{ok:false,missing:u.missing};
  var cols=Object.keys(u.row);if(!cols.length)return{ok:false,missing:["no writable columns"]};
  var sql="INSERT INTO "+safeIdent(table)+" ("+cols.map(safeIdent).join(",")+") VALUES ("+cols.map(function(){return"?"}).join(",")+")";
  var st=env.DB.prepare(sql),vals=cols.map(function(k){return u.row[k]});
  st=st.bind.apply(st,vals);
  var r=await st.run();return{ok:true,id:r&&r.meta&&r.meta.last_row_id!=null?r.meta.last_row_id:null};
}
async function updateDynamic(env,table,info,map,whereSql,whereArgs){
  var names=new Set(info.map(function(x){return x.name})),row={};
  Object.keys(map).forEach(function(k){if(names.has(k)&&map[k]!==undefined)row[k]=map[k]});
  var cols=Object.keys(row);if(!cols.length)return;
  var sql="UPDATE "+safeIdent(table)+" SET "+cols.map(function(k){return safeIdent(k)+"=?"}).join(",")+" WHERE "+whereSql;
  var args=cols.map(function(k){return row[k]}).concat(whereArgs||[]);
  var st=env.DB.prepare(sql);st=st.bind.apply(st,args);await st.run();
}
function bestOfficialOffer(product,brand){
  var official=domainOnly(brand.website),offers=(product&&product.offers||[]).filter(function(o){
    if(!o||!o.url||Number(o.max_commission_rate||0)<=0)return false;
    var d=domainOnly(o.domain||o.url||"");
    return official&&d&&(d===official||d.endsWith("."+official)||official.endsWith("."+d));
  });
  offers.sort(function(a,b){
    var ar=Number(a.max_commission_rate||0),br=Number(b.max_commission_rate||0);
    if(br!==ar)return br-ar;
    var ap=a.price&&Number(a.price.price),bp=b.price&&Number(b.price.price);
    return (isFinite(ap)?ap:1e12)-(isFinite(bp)?bp:1e12);
  });
  return offers[0]||null;
}
async function ensureState(env){
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS catalog_expansion_runs (version TEXT PRIMARY KEY,next_index INTEGER NOT NULL DEFAULT 0,added INTEGER NOT NULL DEFAULT 0,updated INTEGER NOT NULL DEFAULT 0,skipped INTEGER NOT NULL DEFAULT 0,errors INTEGER NOT NULL DEFAULT 0,last_error TEXT,updated_at TEXT NOT NULL,completed_at TEXT)").run();
  var row=await env.DB.prepare("SELECT * FROM catalog_expansion_runs WHERE version=? LIMIT 1").bind(CATALOG_EXPANSION_VERSION).first();
  if(!row){
    var now=new Date().toISOString();
    await env.DB.prepare("INSERT INTO catalog_expansion_runs(version,next_index,added,updated,skipped,errors,last_error,updated_at,completed_at) VALUES(?,0,0,0,0,0,NULL,?,NULL)").bind(CATALOG_EXPANSION_VERSION,now).run();
    row=await env.DB.prepare("SELECT * FROM catalog_expansion_runs WHERE version=? LIMIT 1").bind(CATALOG_EXPANSION_VERSION).first();
  }
  return row;
}
async function knownBrands(env){
  var rows=(await env.DB.prepare("SELECT id,name,website FROM brands WHERE is_active=1 AND website IS NOT NULL").all()).results||[],m=new Map();
  rows.forEach(function(x){m.set(compact(x.name),x)});
  return m;
}
async function upsertOne(env,product,target,brands,info){
  var gender=String(product&&product.gender||"").toLowerCase();
  if(gender&&gender!=="female"&&gender!=="women"&&gender!=="woman"&&gender!=="unisex")return"skipped";
  var title=String(product&&product.title||"").trim();if(!title||!titleFits(title,target[2]))return"skipped";
  var bn=brandOf(product),brand=brands.get(compact(bn));if(!brand)return"skipped";
  var offer=bestOfficialOffer(product,brand);if(!offer)return"skipped";
  var img=imageOf(product);if(!img)return"skipped";
  var price=offer.price&&offer.price.price!=null?Number(offer.price.price):null;
  var now=new Date().toISOString(),canonical=product.url||product.canonical_url||product.product_url||offer.url;
  var existing=await env.DB.prepare("SELECT id FROM products WHERE brand_id=? AND lower(title)=lower(?) LIMIT 1").bind(brand.id,title).first();
  var productMap={
    brand_id:brand.id,title:title,price:isFinite(price)?price:null,image_url:img,canonical_url:canonical,
    primary_color:colorOf(product),canonical_category:target[1],is_product_page_live:1,created_at:now,updated_at:now,
    source:"channel3",source_product_id:product.id||null,external_id:product.id||null,channel3_id:product.id||null
  };
  var productId=existing&&existing.id,kind="updated";
  if(productId){
    delete productMap.created_at;
    await updateDynamic(env,"products",info.products,productMap,"id=?",[productId]);
  }else{
    var ins=await insertDynamic(env,"products",info.products,productMap);
    if(!ins.ok||ins.id==null)return"skipped";
    productId=ins.id;kind="added";
  }
  var existingOffer=await env.DB.prepare("SELECT id FROM product_offers WHERE product_id=? AND source='channel3' ORDER BY id LIMIT 1").bind(productId).first();
  var offerMap={
    product_id:productId,source:"channel3",affiliate_url:offer.url,commission_rate:Number(offer.max_commission_rate||0),
    price:isFinite(price)?price:null,domain:domainOnly(offer.domain||""),merchant:bn,created_at:now,updated_at:now,
    source_product_id:product.id||null,external_product_id:product.id||null,offer_id:offer.id||null,source_offer_id:offer.id||null
  };
  if(existingOffer&&existingOffer.id){
    delete offerMap.created_at;
    await updateDynamic(env,"product_offers",info.offers,offerMap,"id=?",[existingOffer.id]);
  }else{
    var oi=await insertDynamic(env,"product_offers",info.offers,offerMap);
    if(!oi.ok){
      if(kind==="added")try{await env.DB.prepare("DELETE FROM products WHERE id=?").bind(productId).run()}catch(_){}
      return"skipped";
    }
  }
  return kind;
}
async function searchChannel3(env,q){
  if(!env.CHANNEL3_API_KEY)throw new Error("CHANNEL3_API_KEY missing");
  var r=await fetch("https://api.trychannel3.com/v1/search",{method:"POST",headers:{"x-api-key":env.CHANNEL3_API_KEY,"content-type":"application/json"},body:JSON.stringify({query:q,limit:20})});
  if(!r.ok)throw new Error("Channel3 search "+r.status+" for "+q);
  var j=await r.json();return Array.isArray(j.products)?j.products:[];
}

export async function catalogExpansionStatus(env){
  var run=await ensureState(env),counts={};
  try{
    var a=await env.DB.prepare("SELECT COUNT(*) n FROM products WHERE is_product_page_live=1").first();
    var b=await env.DB.prepare("SELECT COUNT(DISTINCT p.id) n FROM products p JOIN product_offers po ON po.product_id=p.id WHERE p.is_product_page_live=1 AND po.source='channel3' AND po.commission_rate>0 AND po.affiliate_url IS NOT NULL").first();
    counts={liveProducts:Number(a&&a.n||0),monetizableProducts:Number(b&&b.n||0)};
  }catch(_){}
  return {version:CATALOG_EXPANSION_VERSION,totalTargets:TARGETS.length,nextIndex:Number(run.next_index||0),complete:!!run.completed_at,added:Number(run.added||0),updated:Number(run.updated||0),skipped:Number(run.skipped||0),errors:Number(run.errors||0),lastError:run.last_error||null,updatedAt:run.updated_at,completedAt:run.completed_at||null,catalog:counts};
}

export async function catalogExpansionTick(env,batchSize){
  var run=await ensureState(env),start=Number(run.next_index||0);
  if(run.completed_at||start>=TARGETS.length)return catalogExpansionStatus(env);
  var brands=await knownBrands(env);
  var info={products:await tableInfo(env,"products"),offers:await tableInfo(env,"product_offers")};
  if(!info.products.length||!info.offers.length)throw new Error("Catalog schema unavailable");
  var end=Math.min(TARGETS.length,start+Math.max(1,Math.min(Number(batchSize||4),8)));
  var added=0,updated=0,skipped=0,errors=0,lastError=null;
  for(var i=start;i<end;i++){
    var target=TARGETS[i];
    try{
      var products=await searchChannel3(env,target[0]);
      for(var j=0;j<products.length;j++){
        try{
          var result=await upsertOne(env,products[j],target,brands,info);
          if(result==="added")added++;else if(result==="updated")updated++;else skipped++;
        }catch(e){errors++;lastError=String(e&&e.message||e).slice(0,500)}
      }
    }catch(e){errors++;lastError=String(e&&e.message||e).slice(0,500)}
  }
  var next=end,now=new Date().toISOString(),done=next>=TARGETS.length?now:null;
  await env.DB.prepare("UPDATE catalog_expansion_runs SET next_index=?,added=added+?,updated=updated+?,skipped=skipped+?,errors=errors+?,last_error=?,updated_at=?,completed_at=COALESCE(completed_at,?) WHERE version=?")
    .bind(next,added,updated,skipped,errors,lastError,now,done,CATALOG_EXPANSION_VERSION).run();
  return catalogExpansionStatus(env);
}
