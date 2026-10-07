# Reccas project notes

GitHub + Cloudflare are canonical. Do not reintroduce Floot as a runtime or deployment dependency.

## Production
- Domain: reccas.com
- Worker: reccas
- Runtime: Cloudflare Workers
- D1 binding: DB
- D1 database id: f06da302-549f-4059-a8bd-39956188c1d8
- Deploy source: rsb6061/reccas, main branch

## Product invariants
- Preserve existing public URLs, redirects, canonicals and structured data.
- Preserve affiliate routing and conversion tracking.
- Preserve wardrobe/auth behavior and existing D1 data.
- Keep the existing Reccas favicon.
- SecretNests is the canonical visual design reference: cream canvas, indigo/lavender accents, pill navigation, editorial serif display type, rounded pastel cards.

## Workflow
Changes go ChatGPT -> GitHub -> Cloudflare. Floot is legacy migration source only and must not be used for ongoing code or deployments.

## Deployment
Pushes to `main` deploy through `.github/workflows/deploy.yml` (wrangler, GitHub Actions). Builds use `npm ci`, so any dependency change must update `package-lock.json`.

## Recommendation counting
- `src/consensus.js` owns the corpus, counting rules and the Best of Fashion, product, source and methodology pages.
- A product's count is its number of distinct independent sources. Brand pages, retailer listings and customer reviews are references and are never counted.
- A category has a winner only at 3 or more independent sources. Best of Fashion lives at the timeless URL `/recommendations`.
- Near-duplicate guides are merged through `GUIDE_REDIRECTS`; legacy outfit and packing pages stay reachable but are noindexed and out of the sitemap.
- A daily cron logs when each recommendation was first and last seen (`mention_observations`) and live catalog prices (`price_observations`).
