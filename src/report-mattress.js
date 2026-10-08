import {MATTRESS_REPORT as R} from "./mattress-report-data.js";

// A standalone report: who recommends the "best mattresses", who pays them, and what is missing.
// Every claim about a company links to the source it rests on. Published at its own address and in
// the sitemap, but deliberately not linked from the menu, guides or categories. Test scores and stated
// specifications are NapLab's, cited and linked per mattress.
const INDEXABLE = true;
const PATH = "/reports/mattress-guides";
const SOURCES = {
  threeZ: "https://bedtimesmagazine.com/2023/03/3z-brands-acquires-leesa-sleep/",
  nolah: "https://bedtimesmagazine.com/2023/02/3z-brands-acquires-nolah-sleep/",
  resident: "https://www.retaildive.com/news/ashley-home-acquires-nectar-mattress-owner-resident/709587/",
  somnigroup: "https://somnigroup.com/",
  npr: "https://www.npr.org/2017/10/20/559113253/reporter-pulls-blanket-off-cozy-ties-between-mattress-companies-and-reviewers",
  nectarAffiliates: "https://www.nectarsleep.com/l/affiliates",
  brooklyn: "https://brooklynbedding.com/collections/mattresses",
  saatva: "https://comvest.com/comvest-credit-partners-leads-dividend-recapitalization-of-saatva/",
  amerisleep: "https://naplab.com/faqs/who-owns-amerisleep/",
  somnigroupInvestors: "https://s204.q4cdn.com/436357164/files/content_files/2026-08-06-August-2026-SGI-Investor-Presentation.pdf",
  casper: "https://bedtimesmagazine.com/2024/10/carpenter-co-acquires-casper-sleep/",
  sleepJunkie: "https://www.sleepjunkie.com/best-places-to-buy-a-mattress/",
  wear: "https://naplab.com/tools/mattress-durability-testing/"
};
const OWNER_NOTES = {
  "3Z Brands": {text: "3Z Brands, owned by the investment firm Cerberus", href: SOURCES.threeZ},
  "Resident Home": {text: "Resident Home, bought by the furniture company Ashley", href: SOURCES.resident},
  "Somnigroup": {text: "Somnigroup, formerly Tempur Sealy, which also owns Mattress Firm", href: SOURCES.somnigroup}
};
const ABSENT = ["Stearns & Foster", "Serta", "Kirkland Signature", "IKEA", "Casper"];
const RARE = ["Sealy", "Tempur-Pedic", "Beautyrest", "Sleep Number", "Purple"];
// Owners ranked in the report, with the kind of ownership and the source it rests on.
const OWNER_RANK = [
  {name: "3Z Brands", brands: "Helix, Bear, Nolah, Leesa, Brooklyn Bedding (including its Titan and Plank lines), Birch", owner: "3Z Brands", kind: "Private equity", note: "Owned by the investment firm Cerberus", href: SOURCES.threeZ},
  {name: "Saatva", brands: "Saatva", brand: "Saatva", kind: "Privately held", note: "A lender’s 2022 announcement describes a financing arranged by Saatva’s management and the private equity firm TZP Group", href: SOURCES.saatva},
  {name: "Resident Home", brands: "DreamCloud, Nectar, Awara, Siena", owner: "Resident Home", kind: "Privately held parent", note: "Bought by Ashley, a furniture company", href: SOURCES.resident},
  {name: "Amerisleep", brands: "Amerisleep", brand: "Amerisleep", kind: "Privately held", note: "Owned by its founders, according to NapLab", href: SOURCES.amerisleep},
  {name: "Somnigroup", brands: "Sealy, Tempur-Pedic", owner: "Somnigroup", kind: "Publicly traded", note: "Listed on the New York Stock Exchange; also owns Mattress Firm", href: SOURCES.somnigroupInvestors}
];

export function createMattressReport(h) {
  const page = h.page, esc = h.esc;
  const link = function (href, text) { return "<a class='plainLink' href='" + esc(href) + "' target='_blank' rel='noreferrer'>" + esc(text) + "</a>"; };
  const pct = function (n, d) { return Math.round((n / d) * 100); };

  return async function report() {
    const guides = R.guides.length, total = R.total, threeZ = R.ownerMentions["3Z Brands"] || 0, resident = R.ownerMentions["Resident Home"] || 0, somni = R.ownerMentions["Somnigroup"] || 0;
    const top = R.products.filter(function (p) { return p.guides.length >= 3; });
    const brandCount = function (name) { const b = R.brands.find(function (x) { return x.brand === name; }); return b ? b.guides.length : 0; };
    const ownerOf = function (name) { const b = R.brands.find(function (x) { return x.brand === name; }); return b && b.owner ? b.owner : null; };
    const topFiveShared = top.slice(0, 5).filter(function (p) { return ownerOf(p.brand) === "3Z Brands"; }).length;

    const productRows = top.map(function (p) {
      const owner = ownerOf(p.brand);
      return "<tr><td><strong>" + esc(p.brand) + "</strong> " + esc(p.name) + "</td><td>" + p.guides.length + " of " + guides + "</td><td>" + (owner ? esc(owner) : "<span class='rankMeta'>Not one of the groups below</span>") + "</td></tr>";
    }).join("");
    const guideRows = R.guides.map(function (g) {
      return "<tr><td>" + link(g.url, g.source) + (g.updated ? "<div class='rankMeta'>Updated " + esc(g.updated) + "</div>" : "") + "</td><td>Yes, stated on the page</td><td>" + g.picks + "</td><td>" + g.picks3z + " of " + g.picks + "</td></tr>";
    }).join("");
    const ownedRows = R.brands.filter(function (b) { return b.owner; }).map(function (b) {
      const o = OWNER_NOTES[b.owner];
      return "<tr><td><strong>" + esc(b.brand) + "</strong></td><td>" + (o ? link(o.href, o.text) : esc(b.owner)) + "</td><td>" + b.guides.length + " of " + guides + "</td></tr>";
    }).join("");
    const missingRows = ABSENT.concat(RARE).map(function (name) {
      const n = brandCount(name);
      return "<tr><td><strong>" + esc(name) + "</strong></td><td>" + (n ? n + " of " + guides : "None") + "</td></tr>";
    }).join("");
    const T = R.tests, P = R.specs, score = function (n) { return Number(n).toFixed(2); }, money = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
    const rankRows = OWNER_RANK.map(function (o) { return {o: o, n: o.owner ? (R.ownerMentions[o.owner] || 0) : (R.brandMentions[o.brand] || 0)}; }).sort(function (a, b) { return b.n - a.n; }).map(function (x) {
      return "<tr><td><strong>" + esc(x.o.name) + "</strong><div class='rankMeta'>" + esc(x.o.brands) + "</div></td><td>" + x.n + " of " + total + " (" + pct(x.n, total) + "%)</td><td>" + esc(x.o.kind) + "<div class='rankMeta'>" + link(x.o.href, x.o.note) + "</div></td></tr>";
    }).join("");
    const testTopRows = T.top.map(function (p) { return "<tr><td>" + link(p.url, p.name) + "</td><td>" + p.guides + " of " + T.otherGuides + "</td><td>" + score(p.score) + "</td></tr>"; }).join("");
    const testOwnerRows = T.owners.map(function (o) { return "<tr><td><strong>" + esc(o.owner.split(" (")[0]) + "</strong>" + (o.owner.indexOf(" (") > 0 ? "<div class='rankMeta'>" + esc(o.owner.slice(o.owner.indexOf(" (") + 2, -1)) + "</div>" : "") + "</td><td>" + o.tested + "</td><td>" + score(o.avg) + "</td><td>" + o.high + "</td><td>" + o.recs + "</td></tr>"; }).join("");
    const specRows = P.rows.map(function (p) { return "<tr><td>" + link(p.url, p.name) + "<div class='rankMeta'>" + esc(p.owner) + " · " + money(p.price) + "</div></td><td>" + p.guides + " of " + T.otherGuides + "</td><td>" + (p.foamStated ? p.foamStated + " of " + p.foamLayers + " layers" : "None of " + p.foamLayers) + "</td><td>" + (p.coils ? (p.coilStated ? "Yes" : "No") : "<span class='rankMeta'>No coils</span>") + "</td></tr>"; }).join("");
    const specOwnerRows = P.owners.map(function (o) { return "<tr><td><strong>" + esc(o.owner) + "</strong></td><td>" + o.stated + " of " + o.layers + "</td></tr>"; }).join("");
    const pairOnly = ["Amerisleep", "Zoma", "Vaya"].every(function (name) { const b = R.brands.find(function (x) { return x.brand === name; }); return b && b.guides.length === 2 && b.guides.indexOf("Sleep Junkie") >= 0 && b.guides.indexOf("eachnight") >= 0; });

    const STYLE = "<style>.findings{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:14px;max-width:820px;counter-reset:f}.findings li{counter-increment:f;border:1px solid var(--lavender);border-radius:18px;background:rgba(255,255,255,.72);padding:18px 20px 18px 64px;position:relative;font-size:16px;line-height:1.6;color:#4d4763}.findings li:before{content:counter(f);position:absolute;left:20px;top:14px;font-family:var(--display);font-size:32px;color:var(--muted)}.findings strong{display:block;font-size:19px;color:var(--ink);margin-bottom:4px}.evidence{border-top:1px solid var(--lavender);padding:18px 0;margin:0}.evidence summary{cursor:pointer;list-style:none}.evidence summary::-webkit-details-marker{display:none}.evTitle{display:block;font-family:var(--display);font-size:26px;color:var(--ink);margin-top:4px}.evTitle:after{content:' +';color:var(--muted)}.evidence[open] .evTitle:after{content:' –'}.evBody{margin-top:16px}</style>";
    const fold = function (eyebrow, title) { return "<details class='evidence'><summary><span class='eyebrow'>" + esc(eyebrow) + "</span><span class='evTitle'>" + esc(title) + "</span></summary><div class='evBody'>"; };
    const res = T.owners.find(function (o) { return o.owner.indexOf("Resident") === 0; }) || {}, som = T.owners.find(function (o) { return o.owner.indexOf("Somnigroup") === 0; }) || {}, costco = T.owners.find(function (o) { return o.owner.indexOf("Kirkland") === 0; }) || {};
    const silent = P.rows.filter(function (p) { return !p.foamStated && p.price >= 3000; }).sort(function (a, b) { return b.price - a.price; })[0];
    const findings = "<ol class='findings'>"
      + "<li><strong>One owner, nearly half the picks.</strong>The " + guides + " guides made " + total + " recommendations. " + threeZ + " went to mattresses from one company, 3Z Brands, which is owned by a private equity firm. Helix, Bear, Nolah, Leesa, Birch and Brooklyn Bedding look like competitors. They are not.</li>"
      + "<li><strong>Being good is not enough to get recommended.</strong>" + T.high.threeZ.count + " top-scoring mattresses from 3Z Brands collected " + T.high.threeZ.recs + " recommendations. " + T.high.small.count + " equally top-scoring mattresses from smaller brands collected " + T.high.small.recs + ".</li>"
      + "<li><strong>Nectar and DreamCloud are recommended beyond their test scores.</strong>Their owner’s brands collect " + res.recs + " recommendations, but only " + res.high + " of its " + res.tested + " tested mattresses scores in the top tier, and the reviews list no stated foam density for any of them. Nectar’s own " + link(SOURCES.nectarAffiliates, "affiliate page") + " describes its payouts as among the highest in the industry.</li>"
      + "<li><strong>The showroom brands are not hidden gems.</strong>Sealy, Tempur-Pedic and Stearns &amp; Foster average " + score(som.avg) + " in the same tests and the mattresses sold at Costco " + score(costco.avg) + ", against a midpoint of " + score(T.median) + "." + (silent ? " The review of a " + money(silent.price) + " " + esc(silent.name) + " lists no stated foam density for any layer." : "") + "</li>"
      + "<li><strong>Everyone is paid the same way.</strong>All " + guides + " guides say they earn a commission when you buy. Google’s AI summary and AI assistants repeat the same names, because they read the same " + guides + " guides.</li>"
      + "</ol>";
    const unmentioned = (T.unmentioned || []).map(function (p) { return link(p.url, p.name) + " (" + score(p.score) + ", " + money(p.price) + ")"; }).join(", ");
    const body = STYLE + "<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas report · " + esc(R.asOf) + "</span><h1>Nearly half of all “best mattress” recommendations go to one company</h1><p>Reccas read " + guides + " of the best-known “best mattress” guides, recorded every mattress they recommend, and checked the results against who owns the brands, who pays the guides, and how the mattresses score in lab tests.</p>"
      + "<div class='statRow'><span><strong>" + threeZ + " of " + total + "</strong>recommendations go to one owner’s brands</span><span><strong>" + T.high.threeZ.recs + " to " + T.high.small.recs + "</strong>recommendations for top-scoring mattresses: that owner against smaller brands</span><span><strong>" + guides + " of " + guides + "</strong>guides earn a commission when you buy</span></div></section>"
      + "<section class='section'><div class='eyebrow'>What Reccas found</div><h2>Five findings</h2>" + findings + "</section>"
      + "<section class='section prose'><h2>If you are buying a mattress</h2><ul>"
      + "<li><strong>The two consensus picks hold up.</strong> The Saatva Classic and the Helix Midnight Luxe, recommended by every guide, are also among the highest scores in the lab tests.</li>"
      + "<li><strong>Be sceptical of Nectar and DreamCloud recommendations.</strong> They are recommended far more often than their test scores explain.</li>"
      + (unmentioned ? "<li><strong>Look at what no guide mentions.</strong> These score in the top tier and appear in none of the " + guides + " guides: " + unmentioned + ".</li>" : "")
      + "<li><strong>Ask what is inside.</strong> If a maker will not state foam density and coil thickness, you cannot compare what you are paying for, whatever the price.</li>"
      + "<li><strong>Read “everyone recommends it” as one data point.</strong> Count the owners, not the brands.</li>"
      + "</ul><p>Test scores here are " + link(T.sourceUrl, "NapLab’s") + ", one reviewer that also earns commission; they measure a new mattress, not how it lasts. Reccas has tested nothing itself. The evidence for each finding is below.</p></section>"
      + "<section class='section'><div class='eyebrow'>The evidence</div><h2>Where each number comes from</h2><p class='muted'>Open any part to see the full tables and sources.</p>"


      + "" + fold("What the guides agree on", "The most recommended mattresses") + "<p class='muted'>" + R.distinct + " different mattresses were recommended across the " + guides + " guides. These are the ones at least three guides name.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Mattress</th><th>Guides recommending it</th><th>Brand owner</th></tr></thead><tbody>" + productRows + "</tbody></table></div></div></details>"

      + "" + fold("Follow the money", "How each guide is paid") + "<p class='muted'>“Earns a commission” is taken from each guide’s own statement on the page linked. The last column is how many of its picks come from 3Z Brands.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Guide</th><th>Says it earns a commission</th><th>Mattresses recommended</th><th>From one owner’s brands</th></tr></thead><tbody>" + guideRows + "</tbody></table></div>"
      + "<div class='prose'><p>The direct-to-consumer brands that dominate these lists run referral programmes. Nectar’s own " + link(SOURCES.nectarAffiliates, "affiliate page") + " describes its payouts as among the highest in the industry. This arrangement is not new: in 2017 " + link(SOURCES.npr, "NPR reported") + " on mattress reviewers being paid per mattress sold, with some earning more than a million dollars a year, and on lawsuits between a mattress company and review sites.</p></div></div></details>"

      + "" + fold("Who owns what", "Many brands, few owners") + "<p class='muted'>Ownership is taken from the trade and company sources linked in each row.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Owner</th><th>Guides recommending it</th></tr></thead><tbody>" + ownedRows + "</tbody></table></div>"
      + "<h3 style='margin-top:26px'>Ranked by owner</h3><p class='muted'>Share of the " + total + " recommendations recorded, and what kind of company the owner is.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Owner</th><th>Recommendations</th><th>Ownership</th></tr></thead><tbody>" + rankRows + "</tbody></table></div>"
      + "<div class='prose'><p>3Z Brands’ six brands account for " + pct(threeZ, total) + "% of every recommendation recorded. Resident Home’s brands account for a further " + pct(resident, total) + "%. Somnigroup, which makes Sealy, Tempur-Pedic and Stearns &amp; Foster and owns the Mattress Firm chain, accounts for " + pct(somni, total) + "%. Shared ownership does not mean the mattresses are the same, but a list of six “different” brands can be one company six times.</p>"
      + "<p>The 3Z Brands figure includes Titan and Plank, which are " + link(SOURCES.brooklyn, "sold by Brooklyn Bedding") + ". An earlier version of this page counted those two separately, which understated 3Z Brands’ share.</p>"
      + "<p>Private equity ownership does not explain the pattern on its own. Somnigroup is the largest company here and is publicly traded; its brands take " + somni + " of the " + total + " recommendations. Casper was owned by a private equity firm until it was " + link(SOURCES.casper, "sold to the foam maker Carpenter in 2024") + ", and no guide recommends it. The clearer divide is between brands sold mainly online and brands sold mainly in shops.</p>"
      + (pairOnly ? "<p>One pattern Reccas could not explain: three brands, Amerisleep, Zoma and Vaya, are recommended by only two of the " + guides + " guides, and they are the same two guides each time, Sleep Junkie and eachnight. Sleep Junkie’s own " + link(SOURCES.sleepJunkie, "disclosure") + " says the site carries Amerisleep advertising. Reccas has not established who owns Zoma or Vaya, or any connection to eachnight, and draws no further conclusion.</p>" : "") + "</div></div></details>"

      + "" + fold("The blind spot", "What the guides leave out") + "<p class='muted'>How many of the " + guides + " guides recommend anything from these brands.</p><div class='tablewrap' style='padding:6px 14px;max-width:560px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Guides recommending it</th></tr></thead><tbody>" + missingRows + "</tbody></table></div>"
      + "<div class='prose'><p>Reccas cannot tell you these mattresses are better; it has not tested any. What it can say is that a guide funded by referral fees has little reason to cover a mattress that earns it nothing, and a mattress bought in a showroom or a warehouse club usually falls into that group. Reccas could not confirm that Costco pays referral fees on products; the descriptions it found mention fees for new memberships only.</p></div></div></details>"

      + "" + fold("Checked against lab tests", "Do the tests back the guides?") + "<p class='muted'>" + link(T.sourceUrl, "NapLab") + " publishes a score out of 10 for every mattress it tests, including the brands the guides leave out. Reccas read the scores for " + T.tested + " mattresses on " + esc(T.readOn) + "; they run from " + score(T.min) + " to " + score(T.max) + ", and half are above " + score(T.median) + ". NapLab is itself one of the " + guides + " guides, so the counts in this section use the other " + T.otherGuides + ".</p>"
      + "<div class='tablewrap' style='padding:6px 14px;max-width:760px'><table class='evidenceTable'><thead><tr><th>Most recommended mattresses</th><th>Guides recommending it</th><th>NapLab score</th></tr></thead><tbody>" + testTopRows + "</tbody></table></div>"
      + "<div class='prose'><p><strong>Where the tests support the guides.</strong> The two mattresses every guide recommends are among the highest scores NapLab has given. Mattresses that at least one guide recommends average " + score(T.recommendedAvg) + "; the rest average " + score(T.notRecommendedAvg) + ". The brands the guides leave out also score lower:</p></div>"
      + "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Owner or seller</th><th>Mattresses tested</th><th>Average score</th><th>Scoring " + T.high.threshold.toFixed(1) + " or more</th><th>Recommendations from the " + T.otherGuides + " guides</th></tr></thead><tbody>" + testOwnerRows + "</tbody></table></div>"
      + "<div class='prose'><p><strong>Where they do not.</strong> A high score is not what gets a mattress recommended. NapLab gives " + T.high.threshold.toFixed(1) + " or more to " + T.high.count + " mattresses that it lists with a US price. The " + T.high.threeZ.count + " of those made by 3Z Brands collect " + T.high.threeZ.recs + " recommendations from the other guides. The " + T.high.small.count + " made by smaller independent brands, such as " + T.high.small.examples.slice(0, 4).map(esc).join(", ") + ", collect " + T.high.small.recs + ".</p>"
      + "<p>Resident Home shows the reverse. Its brands collect " + (T.owners.find(function (o) { return o.owner.indexOf("Resident") === 0; }) || {}).recs + " recommendations, but only " + (T.owners.find(function (o) { return o.owner.indexOf("Resident") === 0; }) || {}).high + " of its " + (T.owners.find(function (o) { return o.owner.indexOf("Resident") === 0; }) || {}).tested + " tested mattresses reaches " + T.high.threshold.toFixed(1) + ". And when a guide does pick from Somnigroup, it picks a low scorer: " + T.weak.map(function (w) { return link(w.url, w.name) + " (" + score(w.score) + ")"; }).join(" and ") + ".</p>"
      + "<p>This does not show that 3Z Brands makes better mattresses. NapLab earns a commission, has tested more mattresses from 3Z Brands than from any other owner, and its score is for a new mattress: it rewards cooling, bounce and trial terms, and does not include wear. NapLab’s separate " + link(SOURCES.wear, "ten-year wear simulation") + " covers only " + T.wearTested + " mattresses, too few to compare owners. Reccas matched " + T.matched + " of the " + T.mentions + " mattress recommendations to a NapLab review; a few matches are to the closest model.</p></div></div></details>"

      + "" + fold("What is inside", "Who says what is in the mattress") + "<p class='muted'>Foam density and coil thickness are the basic facts about how a mattress is built. NapLab’s reviews list each maker’s stated figure for every layer, or “not available”. This table shows how many layers have a stated figure. Prices are for a queen, as listed by NapLab.</p>"
      + "<div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Mattress</th><th>Guides recommending it</th><th>Foam density stated</th><th>Coil thickness stated</th></tr></thead><tbody>" + specRows + "</tbody></table></div>"
      + "<p class='muted' style='margin-top:22px'>Across every mattress NapLab has reviewed from each owner: layers with a stated figure.</p><div class='tablewrap' style='padding:6px 14px;max-width:560px'><table class='evidenceTable'><thead><tr><th>Owner or seller</th><th>Layers with a stated figure</th></tr></thead><tbody>" + specOwnerRows + "</tbody></table></div>"
      + "<div class='prose'><p>The brands the guides favour mostly say what is inside. The showroom brands do not, at any price, and neither do Nectar and DreamCloud. A blank here means NapLab’s review lists no figure from the maker; the maker may publish it somewhere Reccas has not looked. Stated density is a fact about construction, not a measure of how long a mattress lasts: in the small set of mattresses NapLab has wear-tested, denser foam did not reliably hold up better.</p></div></div></details>"

      + "</section><section class='section prose'><h2>The same answer, repeated</h2><p>Ask a search engine’s AI summary or an AI assistant for the best mattress and you are likely to get the same names, because those systems read the same guides. On " + esc(R.asOf) + " Google’s AI summary for “best mattresses” named the Helix Midnight Luxe as “best overall” and cited mattress review sites as its sources. The summary does not carry the commission notice the guides themselves display.</p>"
      + "<h2>What this does not show</h2><ul><li>It is " + guides + " guides on one day, not the whole market. Five more could not be read: " + R.notRead.map(function (x) { return esc(x.source) + " (" + esc(x.why) + ")"; }).join("; ") + ".</li><li>Earning a commission does not make a recommendation wrong. Several of these guides describe extensive hands-on testing.</li><li>The lists were read by software and each mattress was checked against the guide’s text, but a product can be misread or a guide can change after it was read.</li><li>The test scores and stated specifications come from one reviewer, NapLab, which earns commissions like the other guides. A second, independently funded lab would be a better check.</li><li>Consumer Reports, which is funded by subscribers and buys what it tests, is the obvious comparison and is not included because Reccas could not read its guide.</li></ul>"
      + "<h2>Questions worth asking any “best of” list</h2><ul><li>Does the site earn money when I buy what it recommends?</li><li>How many of the brands on the list share an owner?</li><li>Which well-known products are missing, and could that be because they do not pay?</li><li>Is there a source that buys what it tests and takes no commission?</li></ul>"
      + "<h2>About this report</h2><p>Reccas tracks what publications recommend and checks those recommendations. It earns commissions on some fashion shopping links elsewhere on this site. It earns nothing from any mattress, and this page contains no shopping links. If something here is wrong, email " + "<a class='plainLink' href='mailto:hello@reccas.com'>hello@reccas.com</a>" + " and it will be corrected.</p></section></main>";

    return page(PATH, "Nearly Half of “Best Mattress” Recommendations Go to One Company", body, "Reccas read " + guides + " “best mattress” guides. " + threeZ + " of " + total + " recommendations go to one private equity-owned company, all " + guides + " guides earn commission, and top-scoring mattresses from smaller brands are almost never named.", 200, INDEXABLE ? null : "noindex, nofollow", {kind: "article", headline: "Nearly half of all “best mattress” recommendations go to one company", breadcrumb: "Mattress guides report", published: R.asOf, modified: R.asOf});
  };
}
export const MATTRESS_REPORT_PATH = PATH;
export const MATTRESS_REPORT_INDEXABLE = INDEXABLE;
