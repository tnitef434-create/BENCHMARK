import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

export async function onRequestPost(context) {
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

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const transactionId = body?.transactionId;
  if (typeof transactionId !== "string" || !/^txn_[a-z\d]{26}$/.test(transactionId)) {
    return new Response(JSON.stringify({ error: "Invalid Paddle transaction." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const paddle = new Paddle(apiKey, {
    environment: environment === "sandbox" ? Environment.sandbox : Environment.production
  });

  try {
    const transaction = await paddle.transactions.get(transactionId);
    
    const hasPrice = transaction.items?.some(item => item.price?.id === priceId && item.quantity === 1);
    const isValid = ["paid", "completed"].includes(transaction.status) && hasPrice && transaction.customData?.entitlement === "hard_mode";

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Hard Mode payment has not been completed." }), {
        status: 402,
        headers: { "Content-Type": "application/json" }
      });
    }

    const payload = Buffer.from(JSON.stringify({ product: "hard_mode", transactionId, issuedAt: Date.now() })).toString("base64url");
    const signature = crypto.createHmac("sha256", signingSecret).update(payload).digest("base64url");
    const token = `${payload}.${signature}`;

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Paddle verification error:", error.message);
    return new Response(JSON.stringify({ error: "Could not verify this Paddle purchase." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
