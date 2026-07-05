# Paddle setup

## Sandbox

1. Create a Paddle Billing sandbox account.
2. Create a product named `BENCHMARK — Hard Mode`.
3. Add a one-time EUR 2.99 price. Set prices to include tax if the customer-facing total must remain exactly €2.99.
4. Under **Developer tools → Authentication**, create:
   - an API key with `transaction.read` permission;
   - a client-side token.
5. Under **Developer tools → Notifications**, add this destination:

   `https://YOUR-DOMAIN/api/paddle/webhook`

   Subscribe it to `transaction.completed` and copy its endpoint secret.
6. Copy `.env.example` to `.env` and fill in the sandbox API key, client token, `pri_` price ID and notification secret.
7. Generate `ENTITLEMENT_SECRET` locally:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

8. Add `localhost` as an approved sandbox checkout domain, then run `npm.cmd start`.

## Production

1. Complete Paddle account and website approval.
2. Recreate the product and EUR 2.99 one-time price in the live catalog; sandbox IDs do not carry over.
3. Create live API/client credentials and a live notification destination.
4. Set `PADDLE_ENVIRONMENT=production` and replace all sandbox values in the deployed host's secret environment settings.
5. Set the approved default payment link to a page on the published domain that loads Paddle.js.

Never commit `.env` or expose the API key, webhook secret, or entitlement secret in browser code. The client-side token is intentionally public and has limited permissions.
