import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export default async function handler(req, res) {
  try {
    const key = randomUUID();
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h

    await kv.set(key, { expiresAt });

    return res.status(200).json({ key, expiresAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
