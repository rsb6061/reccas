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
