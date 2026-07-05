# BENCHMARK

A browser-based AI company strategy game spanning January 2024 through December 2027.

Install dependencies and run the payment-enabled server:

```powershell
npm.cmd install
Copy-Item .env.example .env
# Add your Paddle sandbox credentials, price ID and a long random ENTITLEMENT_SECRET to .env
npm.cmd start
```

Then visit `http://127.0.0.1:4173`.

Progress is saved automatically in the browser.

Hard Mode is a one-time €2.99 Paddle Checkout purchase. Create a one-time **BENCHMARK — Hard Mode** product and EUR 2.99 price in Paddle, then add its `pri_` price ID to `.env`. Configure a `transaction.completed` notification destination pointing to `https://YOUR-DOMAIN/api/paddle/webhook`. API and webhook secrets are read only by `server.mjs` and must never be added to `app.js` or committed.

See `PADDLE_SETUP.md` for the sandbox and production dashboard checklist.
