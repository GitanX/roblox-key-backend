import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ valid: false });

    const data = await kv.get(key);
    if (!data) return res.status(400).json({ valid: false });

    const { expiresAt } = data;

    if (Date.now() > expiresAt) return res.status(400).json({ valid: false });

    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
