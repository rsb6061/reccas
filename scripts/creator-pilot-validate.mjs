import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
const data=JSON.parse(readFileSync(new URL("../data/creator-pilot-sources.json",import.meta.url),"utf8"));
assert.ok(data.target>=100,"Target must be at least 100");
assert.ok(Array.isArray(data.sources)&&data.sources.length>=100,"Need at least 100 distinct discovery candidates");
const seen=new Set(),names=new Set();
for(const s of data.sources){
  assert.ok(s.name&&s.style,"Missing source name/style");
  assert.equal(s.status,"candidate","Candidates must not be misrepresented as verified sources");
  const url=new URL(s.site);
  assert.equal(url.protocol,"https:","Use HTTPS site URLs");
  const domain=url.hostname.replace(/^www\./,"");
  assert.ok(!seen.has(domain),"Duplicate publisher domain: "+domain);seen.add(domain);
  assert.ok(!names.has(s.name),"Duplicate publisher name: "+s.name);names.add(s.name);
}
console.log("Valid creator pilot discovery pool: "+seen.size+" unverified candidates; target "+data.target);
