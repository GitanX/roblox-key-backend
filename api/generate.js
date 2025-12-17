import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export default async function handler(req, res) {
  const { hwid } = req.query;
  if (!hwid) return res.status(400).json({ error: "HWID required" });

  const key = randomUUID();
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;

  await kv.set(key, { hwid, expiresAt });

  res.status(200).json({ key, expiresAt });
}
