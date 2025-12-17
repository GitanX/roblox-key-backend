import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT : Configure Express pour récupérer la vraie IP
app.set('trust proxy', true);

app.use(cors());
app.use(express.static("public"));

const keys = {};
const cooldowns = {};

// Fonction pour obtenir la vraie IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.ip;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/generate", (req, res) => {
  const ip = getClientIP(req);
  console.log("IP détectée:", ip); // Pour debug
  
  const now = Date.now();
  
  if (cooldowns[ip] && now - cooldowns[ip] < 5 * 60 * 1000) {
    const remaining = Math.ceil((5 * 60 * 1000 - (now - cooldowns[ip])) / 1000);
    return res.status(429).json({
      error: "Cooldown actif",
      wait: remaining
    });
  }
  
  const key = randomUUID();
  const expiresAt = now + 12 * 60 * 60 * 1000;
  keys[key] = { expiresAt };
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
