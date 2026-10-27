# Reccas independent fashion creator source pilot

## Architecture
- Existing production runtime remains **GitHub → Cloudflare Workers + D1**.
- `data/creator-pilot-sources.json` contains **108 unverified discovery candidates**. Neither the candidate count nor a matching RSS title is evidence of a recommendation.
- `scripts/creator-pilot-discover.mjs` checks public RSS/Atom feeds for shopping articles published in the prior 90 days and saves `reports/creator-pilot.json`.
- `scripts/creator-pilot-extract.mjs` reads those article URLs, checks source robots rules, validates publication date and plain-text mention evidence, calls existing Worker AI extract service with `creator:true`, and writes accepted rows to isolated D1 `creator_pilot_articles` and `creator_pilot_picks`. It never modifies main Best of Fashion rankings.
- `.github/workflows/creator-pilot.yml` runs weekly and on merge of pilot files to `main`; 80 eligible article fetches per default run, sampled one per site first. Run manually to increase the article limit. Source discovery covers all 108 candidates by default.
- Metadata records original article URL, source site, date, brand, exact product name, category, retailer when stated, sponsorship flag, verification status, model and scan date. It does not copy creator photos.

## Public pages and thresholds
- `/creators` is the directory of creators **with verified recent product evidence**, not a listing of all discovery candidates. `noindex` until at least 10 source websites.
- `/creators/<slug>` lists exact product mentions with outbound source citations, `noindex` until 2+ articles and 5+ unique picks.
- `/creator-edits/coats`, `/knitwear`, `/denim`, `/boots`, `/bags`, `/dresses`, `/shoes`, `/tailoring` compare brands supported by 2+ distinct sites and exact products backed by 3+ distinct sites. Indexable only with 5+ sites plus at least one 3-site brand and one 3-site exact product.
- Count at most **one vote per source site** for each product or brand within a category. Do not treat brand agreement as exact-product agreement.
- All pages link directly to the originating creator article through existing `/_api/out` click instrumentation (tracked under `creator-pilot:...`).

## Data quality limitations
- Distinct creator sites are not automatically independently owned. Do not claim ownership, payment relationships, or platform affiliations have been externally audited.
- RSS recency and article content validation are not proof of purchase, product quality or testing.
- Exact-product slug matches can collide, so review leading product agreement before treating it as meaningful intelligence.
- A basic disclosed affiliate link does not itself mean paid product placement; identified gifted, direct sponsorship or own-brand promotions are excluded when flagged.
- Robots directives and publisher terms must be respected. Content that is paywalled or blocked is skipped. No image copying.
- The automated extractor is a conservative first pass. Manual review is required before making claims about creator endorsement or ownership beyond explicit article evidence.

## Measurement
- `/_api/creator-pilot/summary` returns current 90-day verified source/article/mention counts, strong exact-product/category pairs, recurring brand/category pairs and `/_api/out` referral clicks.
- Search impressions/clicks require a Google Search Console connection; they are **not** inferred from server analytics.
- Indexing is gated by evidence. Do not publish SEO pages with zero source support merely to satisfy a publishing target.

## Validate
`node scripts/creator-pilot-validate.mjs`
`node --check src/creator-pilot.js`
`node --check scripts/creator-pilot-discover.mjs`
`node --check scripts/creator-pilot-extract.mjs`

## Remaining operational checkpoint
After merging the PR, verify both the Deploy Reccas and Creator source discovery and evidence pilot GitHub Actions complete successfully. Then inspect the uploaded `creator-pilot-research` artifact and `/_api/creator-pilot/summary`. Only count results explicitly returned by production, never expectations.
