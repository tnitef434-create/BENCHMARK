import { Environment, Paddle } from "@paddle/paddle-node-sdk";

export async function onRequestPost(context) {
  const env = context.env;
  const environment = env.PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const apiKey = env.PADDLE_API_KEY;
  const webhookSecret = env.PADDLE_WEBHOOK_SECRET;
  const priceId = env.PADDLE_PRICE_ID;

  if (!apiKey || !webhookSecret) {
    return new Response("Paddle webhook is not configured", { status: 503 });
  }

  const rawBody = await context.request.text();
  const signature = context.request.headers.get("paddle-signature") || "";

  const paddle = new Paddle(apiKey, {
    environment: environment === "sandbox" ? Environment.sandbox : Environment.production
  });

  try {
    const event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);

    if (event.eventType === "transaction.completed") {
      const transaction = event.data;
      const hasPrice = transaction.items?.some(item => item.price?.id === priceId && item.quantity === 1);
      const isHardMode = ["paid", "completed"].includes(transaction.status) && hasPrice && transaction.customData?.entitlement === "hard_mode";
      
      if (isHardMode) {
        console.log(`Verified Hard Mode purchase ${transaction.id}`);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return new Response("invalid signature", { status: 400 });
  }
}
