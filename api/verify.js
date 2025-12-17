import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { key, hwid } = req.body;

  const data = await kv.get(key);
  if (!data) {
    return res.json({ status: "invalid" });
  }

  if (Date.now() > data.expires) {
    return res.json({ status: "expired" });
  }

  if (data.hwid && data.hwid !== hwid) {
    return res.json({ status: "hwid_mismatch" });
  }

  if (!data.hwid) {
    data.hwid = hwid;
    await kv.set(key, data);
  }

  res.json({ status: "valid" });
}
