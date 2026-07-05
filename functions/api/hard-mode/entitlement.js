import crypto from "node:crypto";
import { Buffer } from "node:buffer";

export async function onRequestPost(context) {
  const env = context.env;
  const signingSecret = env.ENTITLEMENT_SECRET;

  let body;
  try {
    body = await context.request.json();
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
