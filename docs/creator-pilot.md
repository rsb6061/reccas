# Independent fashion creator pilot

**Target:** 100 active independent source sites, 90-day eligible shopping edits.

This branch initializes 40 *discovery candidates*, not verified sources.
Run the weekly GitHub Action **Creator source discovery pilot** to obtain a timestamped JSON artifact. Feed dates and article titles are discovery signals, not proof of recommendations.

## Promotion gates
1. Confirm the publication is independent and identify its controlling publisher. Consolidate mirrors, syndicated content and creator/agency networks into one independence group.
2. Confirm articles published in the preceding 90 days; reject undated, outdated, blocked, sponsored and purely visual outfit posts.
3. Verify access is permitted under the source's applicable terms and robots directives. Do not bypass access controls.
4. Use the existing /_api/admin/extract service for candidate brand/product names, but verify each against the article text and (where possible) linked exact product detail before accepting. Record author, URL, published date, category, retailer, and evidence.
5. Count each independent creator only once per exact product; an equivalent product family and brand trend must be separate metrics. Do not merge products based only on similar names.
6. Publish a directory only with verified sources and a category guide only when independent evidence is sufficient. Use noindex on sparse or unreviewed guides. Link original sources. Do not mirror creator photographs or long-form copy.
7. Measure GSC impressions/clicks by landing page and outbound source referrals using Reccas's existing tracking, after release.

## Important
This workflow does **not** write to production D1 or alter rankings. A recent RSS title is not a recommendation. The current extraction system already supports validated mention candidates, but wiring the new creator source ingest safely into live rankings requires a separate reviewed release. No 100-source completion, published directory or overlap finding is claimed.
