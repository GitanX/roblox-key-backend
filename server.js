import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const keys = {};
const cooldowns = {}; // { ip: timestamp }

app.get("/generate", (req, res) => {
  const ip = req.ip; // identifiant utilisateur
  const now = Date.now();

  // Vérifie si l’utilisateur est en cooldown
  if (cooldowns[ip] && now - cooldowns[ip] < 5 * 60 * 1000) {
    const remaining = Math.ceil((5 * 60 * 1000 - (now - cooldowns[ip])) / 1000);
    return res.status(429).json({
      error: "Cooldown actif",
      wait: remaining
    });
  }

  // Génère une nouvelle clé
  const key = randomUUID();
  const expiresAt = now + 12 * 60 * 60 * 1000;
  keys[key] = { expiresAt };

  // Met à jour le cooldown
  cooldowns[ip] = now;

  res.json({ key, expiresAt });
});

app.get("/verify", (req, res) => {
  const { key } = req.query;
  if (!key || !keys[key]) return res.json({ valid: false });
  if (Date.now() > keys[key].expiresAt) return res.json({ valid: false });
  res.json({ valid: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
