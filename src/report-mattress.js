import {MATTRESS_REPORT as R} from "./mattress-report-data.js";

// A standalone report: who recommends the "best mattresses", who pays them, and what is missing.
// Every claim about a company links to the source it rests on. Published at its own address and in
// the sitemap, but deliberately not linked from the menu, guides or categories.
const INDEXABLE = true;
const PATH = "/reports/mattress-guides";
const SOURCES = {
  threeZ: "https://bedtimesmagazine.com/2023/03/3z-brands-acquires-leesa-sleep/",
  nolah: "https://bedtimesmagazine.com/2023/02/3z-brands-acquires-nolah-sleep/",
  resident: "https://www.retaildive.com/news/ashley-home-acquires-nectar-mattress-owner-resident/709587/",
  somnigroup: "https://somnigroup.com/",
  npr: "https://www.npr.org/2017/10/20/559113253/reporter-pulls-blanket-off-cozy-ties-between-mattress-companies-and-reviewers",
  nectarAffiliates: "https://www.nectarsleep.com/l/affiliates"
};
const OWNER_NOTES = {
  "3Z Brands": {text: "3Z Brands, owned by the investment firm Cerberus", href: SOURCES.threeZ},
  "Resident Home": {text: "Resident Home, bought by the furniture company Ashley", href: SOURCES.resident},
  "Somnigroup": {text: "Somnigroup, formerly Tempur Sealy, which also owns Mattress Firm", href: SOURCES.somnigroup}
};
const ABSENT = ["Stearns & Foster", "Serta", "Kirkland Signature", "IKEA", "Casper"];
const RARE = ["Sealy", "Tempur-Pedic", "Beautyrest", "Sleep Number", "Purple"];

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
    const pairOnly = ["Amerisleep", "Zoma", "Vaya"].every(function (name) { const b = R.brands.find(function (x) { return x.brand === name; }); return b && b.guides.length === 2 && b.guides.indexOf("Sleep Junkie") >= 0 && b.guides.indexOf("eachnight") >= 0; });

    const body = "<main class='wrap'><section class='hero'><span class='eyebrow'>Reccas report · " + esc(R.asOf) + "</span><h1>Who recommends the “best mattresses”, and who pays them</h1><p>Reccas read " + guides + " of the best-known “best mattress” guides and recorded every mattress each one recommends. The guides agree to a remarkable degree. This page shows what they agree on, how each guide is paid, who owns the brands, and which mattresses none of them recommend.</p>"
      + "<div class='statRow'><span><strong>" + guides + " of " + guides + "</strong>guides say they earn a commission when you buy</span><span><strong>" + guides + " of " + guides + "</strong>recommend the same two mattresses</span><span><strong>" + pct(threeZ, total) + "%</strong>of all recommendations go to one owner’s brands</span><span><strong>0</strong>guides recommend Stearns &amp; Foster, Serta or Costco’s own brand</span></div></section>"

      + "<section class='section prose'><h2>The short version</h2><ul>"
      + "<li>Every guide Reccas could read states on the page that it may earn a commission when a reader buys through its links.</li>"
      + "<li>Two mattresses, the Helix Midnight Luxe and the Saatva Classic, are recommended by all " + guides + ".</li>"
      + "<li>Six of the most recommended brands (Helix, Birch, Brooklyn Bedding, Bear, Nolah and Leesa) belong to a single company, 3Z Brands. Its brands take " + threeZ + " of the " + total + " recommendations recorded, and " + topFiveShared + " of the five most recommended mattresses.</li>"
      + "<li>The mattresses most people see in shops are almost absent. Stearns &amp; Foster, Serta and Costco’s Kirkland Signature are not recommended by any guide. Sealy and Tempur-Pedic appear once each.</li>"
      + "</ul><p>None of this shows that the recommended mattresses are bad or that any guide is dishonest. It shows that these lists are drawn from a narrow set of brands, sold through links the guides earn a commission on, which is worth knowing before treating “everyone recommends it” as proof.</p></section>"

      + "<section class='section'><div class='eyebrow'>What the guides agree on</div><h2>The most recommended mattresses</h2><p class='muted'>" + R.distinct + " different mattresses were recommended across the " + guides + " guides. These are the ones at least three guides name.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Mattress</th><th>Guides recommending it</th><th>Brand owner</th></tr></thead><tbody>" + productRows + "</tbody></table></div></section>"

      + "<section class='section'><div class='eyebrow'>Follow the money</div><h2>How each guide is paid</h2><p class='muted'>“Earns a commission” is taken from each guide’s own statement on the page linked. The last column is how many of its picks come from 3Z Brands.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Guide</th><th>Says it earns a commission</th><th>Mattresses recommended</th><th>From one owner’s brands</th></tr></thead><tbody>" + guideRows + "</tbody></table></div>"
      + "<div class='prose'><p>The direct-to-consumer brands that dominate these lists run referral programmes. Nectar’s own " + link(SOURCES.nectarAffiliates, "affiliate page") + " describes its payouts as among the highest in the industry. This arrangement is not new: in 2017 " + link(SOURCES.npr, "NPR reported") + " on mattress reviewers being paid per mattress sold, with some earning more than a million dollars a year, and on lawsuits between a mattress company and review sites.</p></div></section>"

      + "<section class='section'><div class='eyebrow'>Who owns what</div><h2>Many brands, few owners</h2><p class='muted'>Ownership is taken from the trade and company sources linked in each row.</p><div class='tablewrap' style='padding:6px 14px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Owner</th><th>Guides recommending it</th></tr></thead><tbody>" + ownedRows + "</tbody></table></div>"
      + "<div class='prose'><p>3Z Brands’ six brands account for " + pct(threeZ, total) + "% of every recommendation recorded. Resident Home’s brands account for a further " + pct(resident, total) + "%. Somnigroup, which makes Sealy, Tempur-Pedic and Stearns &amp; Foster and owns the Mattress Firm chain, accounts for " + pct(somni, total) + "%. Shared ownership does not mean the mattresses are the same, but a list of six “different” brands can be one company six times.</p>"
      + (pairOnly ? "<p>One pattern Reccas could not explain: three brands, Amerisleep, Zoma and Vaya, are recommended by only two of the " + guides + " guides, and they are the same two guides each time, Sleep Junkie and eachnight. Reccas has not established the reason and draws no conclusion from it.</p>" : "") + "</div></section>"

      + "<section class='section'><div class='eyebrow'>The blind spot</div><h2>What the guides leave out</h2><p class='muted'>How many of the " + guides + " guides recommend anything from these brands.</p><div class='tablewrap' style='padding:6px 14px;max-width:560px'><table class='evidenceTable'><thead><tr><th>Brand</th><th>Guides recommending it</th></tr></thead><tbody>" + missingRows + "</tbody></table></div>"
      + "<div class='prose'><p>Reccas cannot tell you these mattresses are better; it has not tested any. What it can say is that a guide funded by referral fees has little reason to cover a mattress that earns it nothing, and a mattress bought in a showroom or a warehouse club usually falls into that group. Reccas could not confirm that Costco pays referral fees on products; the descriptions it found mention fees for new memberships only.</p></div></section>"

      + "<section class='section prose'><h2>The same answer, repeated</h2><p>Ask a search engine’s AI summary or an AI assistant for the best mattress and you are likely to get the same names, because those systems read the same guides. On " + esc(R.asOf) + " Google’s AI summary for “best mattresses” named the Helix Midnight Luxe as “best overall” and cited mattress review sites as its sources. The summary does not carry the commission notice the guides themselves display.</p>"
      + "<h2>What this does not show</h2><ul><li>It is " + guides + " guides on one day, not the whole market. Five more could not be read: " + R.notRead.map(function (x) { return esc(x.source) + " (" + esc(x.why) + ")"; }).join("; ") + ".</li><li>Earning a commission does not make a recommendation wrong. Several of these guides describe extensive hands-on testing.</li><li>The lists were read by software and each mattress was checked against the guide’s text, but a product can be misread or a guide can change after it was read.</li><li>Consumer Reports, which is funded by subscribers and buys what it tests, is the obvious comparison and is not included because Reccas could not read its guide.</li></ul>"
      + "<h2>Questions worth asking any “best of” list</h2><ul><li>Does the site earn money when I buy what it recommends?</li><li>How many of the brands on the list share an owner?</li><li>Which well-known products are missing, and could that be because they do not pay?</li><li>Is there a source that buys what it tests and takes no commission?</li></ul>"
      + "<h2>About this report</h2><p>Reccas tracks what publications recommend and checks those recommendations. It earns commissions on some fashion shopping links elsewhere on this site. It earns nothing from any mattress, and this page contains no shopping links. If something here is wrong, email " + "<a class='plainLink' href='mailto:hello@reccas.com'>hello@reccas.com</a>" + " and it will be corrected.</p></section></main>";

    return page(PATH, "Who Recommends the “Best Mattresses”, and Who Pays Them", body, "Reccas read " + guides + " “best mattress” guides. All earn commissions, all recommend the same two mattresses, and one company owns six of the most recommended brands.", 200, INDEXABLE ? null : "noindex, nofollow", {kind: "article", headline: "Who recommends the “best mattresses”, and who pays them", breadcrumb: "Mattress guides report", published: R.asOf, modified: R.asOf});
  };
}
export const MATTRESS_REPORT_PATH = PATH;
export const MATTRESS_REPORT_INDEXABLE = INDEXABLE;
