import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { key, hwid } = req.query;
  if (!key || !hwid) return res.status(400).json({ valid: false });

  const data = await redis.get(key);
  if (!data) return res.status(400).json({ valid: false });

  const { hwid: storedHwid, expiresAt } = JSON.parse(data);

  if (storedHwid !== hwid) return res.status(400).json({ valid: false });
  if (Date.now() > expiresAt) return res.status(400).json({ valid: false });

  res.status(200).json({ valid: true });
}
