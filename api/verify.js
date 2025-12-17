import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { key, hwid } = req.query;
  if (!key || !hwid) return res.status(400).json({ valid: false });

  const data = await kv.get(key);
  if (!data) return res.status(400).json({ valid: false });

  const { hwid: storedHwid, expiresAt } = data;

  if (storedHwid !== hwid) return res.status(400).json({ valid: false });
  if (Date.now() > expiresAt) return res.status(400).json({ valid: false });

  res.status(200).json({ valid: true });
}
