import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { hwid } = req.query;
  if (!hwid) return res.status(400).json({ error: "HWID required" });

  const key = randomUUID();
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h

  await redis.set(key, JSON.stringify({ hwid, expiresAt }));

  res.status(200).json({ key, expiresAt });
}
