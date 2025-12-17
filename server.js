import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // autorise les appels depuis n'importe quelle origine
app.use(express.static("public")); // sert ton HTML/CSS/JS

const keys = {};

app.get("/generate", (req, res) => {
  const key = randomUUID();
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h
  keys[key] = { expiresAt };
  res.json({ key, expiresAt });
});

app.get("/verify", (req, res) => {
  const { key } = req.query;
  if (!key || !keys[key]) return res.json({ valid: false });
  if (Date.now() > keys[key].expiresAt) return res.json({ valid: false });
  res.json({ valid: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
