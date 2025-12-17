import { randomUUID } from "crypto";
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const key = randomUUID();
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h

    // Exemple: stockage via Upstash Redis REST API
    await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value: JSON.stringify({ expiresAt }),
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ key, expiresAt }),
    };
  } catch (err) {
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
