import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const params = new URLSearchParams(event.queryStringParameters);
    const key = params.get("key");
    if (!key) return { statusCode: 400, body: JSON.stringify({ valid: false }) };

    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/${key}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });

    if (!res.ok) return { statusCode: 400, body: JSON.stringify({ valid: false }) };

    const data = await res.json();
    const { expiresAt } = JSON.parse(data.result);

    if (Date.now() > expiresAt) {
      return { statusCode: 400, body: JSON.stringify({ valid: false }) };
    }

    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  } catch (err) {
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
