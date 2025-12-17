import { kv } from "@vercel/kv";

function randomKey() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default async function handler(req, res) {
  const key = "KEY-" + randomKey();
  const expires = Date.now() + 12 * 60 * 60 * 1000; // 12 heures

  await kv.set(key, {
    expires,
    hwid: null,
  });

  res.json({ key, expires });
}
