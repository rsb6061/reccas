# Reccas

Reccas is the production source repository for https://reccas.com.

## Production architecture

GitHub is the source of truth. Cloudflare Workers deploy the application and serve the public site and APIs. Cloudflare D1 stores application data.

Floot is not part of the runtime or deployment architecture.

## Guardrails

- Preserve existing public URLs and canonical metadata.
- Preserve D1 data and schema unless a migration is explicitly required.
- Preserve Auth0/session behavior and affiliate/conversion tracking.
- Preserve the existing Reccas favicon and brand identity while the UI follows the SecretNests design system.
