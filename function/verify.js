export async function handler(event, context) {
  try {
    const params = event.queryStringParameters;
    const key = params.key;

    if (!key) return { statusCode: 400, body: JSON.stringify({ valid: false }) };

    globalThis.keys = globalThis.keys || {};
    const data = globalThis.keys[key];
    if (!data) return { statusCode: 400, body: JSON.stringify({ valid: false }) };

    if (Date.now() > data.expiresAt) {
      return { statusCode: 400, body: JSON.stringify({ valid: false }) };
    }

    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  } catch (err) {
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
