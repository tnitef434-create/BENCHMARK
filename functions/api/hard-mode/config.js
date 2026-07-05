export async function onRequestGet(context) {
  const env = context.env;
  const environment = env.PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const apiKey = env.PADDLE_API_KEY;
  const clientToken = env.PADDLE_CLIENT_TOKEN;
  const priceId = env.PADDLE_PRICE_ID;
  const signingSecret = env.ENTITLEMENT_SECRET;

  const paymentReady = Boolean(apiKey && clientToken && priceId && signingSecret);

  if (!paymentReady) {
    return new Response(JSON.stringify({ error: "Paddle payments are not configured on this server." }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ clientToken, priceId, environment }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
