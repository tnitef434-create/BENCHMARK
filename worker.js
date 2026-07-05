import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const environment = env.PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";
  const apiKey = env.PADDLE_API_KEY;
  const clientToken = env.PADDLE_CLIENT_TOKEN;
  const priceId = env.PADDLE_PRICE_ID;
  const webhookSecret = env.PADDLE_WEBHOOK_SECRET;
  const signingSecret = env.ENTITLEMENT_SECRET;

  const paymentReady = Boolean(apiKey && clientToken && priceId && signingSecret);

  // GET /api/hard-mode/config
  if (url.pathname === "/api/hard-mode/config" && request.method === "GET") {
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

  // POST /api/hard-mode/verify
  if (url.pathname === "/api/hard-mode/verify" && request.method === "POST") {
    if (!paymentReady) {
      return new Response(JSON.stringify({ error: "Paddle payments are not configured on this server." }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    let body;
    try {
      body = await request.json();
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

  // POST /api/hard-mode/entitlement
  if (url.pathname === "/api/hard-mode/entitlement" && request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = body?.token;
    if (!signingSecret || typeof token !== "string" || !token.includes(".")) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const [payload, signature] = token.split(".");
      const expected = crypto.createHmac("sha256", signingSecret).update(payload).digest();
      let supplied;
      try {
        supplied = Buffer.from(signature, "base64url");
      } catch {
        return new Response(JSON.stringify({ valid: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
        return new Response(JSON.stringify({ valid: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      const data = JSON.parse(Buffer.from(payload, "base64url").toString());
      const valid = data.product === "hard_mode";

      return new Response(JSON.stringify({ valid }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // POST /api/paddle/webhook
  if (url.pathname === "/api/paddle/webhook" && request.method === "POST") {
    if (!apiKey || !webhookSecret) {
      return new Response("Paddle webhook is not configured", { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature") || "";

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

  return new Response("Not Found", { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  }
};
