import { randomUUID } from "crypto";

export async function handler(event, context) {
  try {
    const key = randomUUID();
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h

    // Ici on stocke en mémoire simple (pas Redis)
    // Pour un vrai stockage, tu peux utiliser Upstash ou un fichier JSON
    globalThis.keys = globalThis.keys || {};
    globalThis.keys[key] = { expiresAt };

    return {
      statusCode: 200,
      body: JSON.stringify({ key, expiresAt }),
    };
  } catch (err) {
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
