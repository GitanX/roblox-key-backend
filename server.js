import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Express pour récupérer la vraie IP
app.set('trust proxy', true);

app.use(cors());
app.use(express.json()); // IMPORTANT: pour lire les body POST
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

// CHANGÉ: GET -> POST pour supporter sessionId
app.post("/generate", (req, res) => {
  const { sessionId } = req.body;
  const identifier = sessionId || getClientIP(req);
  
  console.log("📝 Génération demandée par:", identifier);
  
  const now = Date.now();
  
  // Vérifier le cooldown
  if (cooldowns[identifier] && now - cooldowns[identifier] < 5 * 60 * 1000) {
    const remaining = Math.ceil((5 * 60 * 1000 - (now - cooldowns[identifier])) / 1000);
    console.log("⏳ Cooldown actif - Reste:", remaining, "secondes");
    return res.status(429).json({
      error: "Cooldown actif",
      wait: remaining
    });
  }
  
  // Générer la clé
  const key = randomUUID();
  const expiresAt = now + 12 * 60 * 60 * 1000; // 12 heures
  
  keys[key] = { 
    expiresAt,
    createdAt: now,
    identifier: identifier
  };
  
  cooldowns[identifier] = now;
  
  console.log("✅ Clé générée:", key);
  console.log("⏰ Expire le:", new Date(expiresAt).toLocaleString());
  console.log("📊 Total clés actives:", Object.keys(keys).length);
  
  res.json({ key, expiresAt });
});

// Vérification de clé (pour Roblox)
app.get("/verify", (req, res) => {
  const { key } = req.query;
  
  console.log("🔍 Vérification de clé:", key ? key.substring(0, 8) + "..." : "aucune");
  
  if (!key) {
    console.log("❌ Aucune clé fournie");
    return res.json({ valid: false, reason: "No key provided" });
  }
  
  if (!keys[key]) {
    console.log("❌ Clé inconnue");
    return res.json({ valid: false, reason: "Key not found" });
  }
  
  const now = Date.now();
  if (now > keys[key].expiresAt) {
    console.log("❌ Clé expirée");
    delete keys[key]; // Nettoyer
    return res.json({ valid: false, reason: "Key expired" });
  }
  
  const timeRemaining = Math.floor((keys[key].expiresAt - now) / 1000 / 60); // minutes
  console.log("✅ Clé valide - Reste:", timeRemaining, "minutes");
  
  res.json({ 
    valid: true,
    expiresAt: keys[key].expiresAt,
    timeRemaining: timeRemaining
  });
});

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  
  // Nettoyer les cooldowns expirés
  let cooldownsCleaned = 0;
  Object.keys(cooldowns).forEach(id => {
    if (now - cooldowns[id] > 5 * 60 * 1000) {
      delete cooldowns[id];
      cooldownsCleaned++;
    }
  });
  
  // Nettoyer les clés expirées
  let keysCleaned = 0;
  Object.keys(keys).forEach(key => {
    if (now > keys[key].expiresAt) {
      delete keys[key];
      keysCleaned++;
    }
  });
  
  if (cooldownsCleaned > 0 || keysCleaned > 0) {
    console.log(`🧹 Nettoyage: ${keysCleaned} clés, ${cooldownsCleaned} cooldowns supprimés`);
  }
}, 10 * 60 * 1000);

// Endpoint de debug (optionnel)
app.get("/debug", (req, res) => {
  const now = Date.now();
  res.json({
    status: "online",
    totalKeys: Object.keys(keys).length,
    totalCooldowns: Object.keys(cooldowns).length,
    keys: Object.keys(keys).map(k => ({
      key: k.substring(0, 8) + "...",
      expiresIn: Math.floor((keys[k].expiresAt - now) / 1000 / 60) + " min",
      createdAt: new Date(keys[k].createdAt).toLocaleTimeString()
    })),
    serverTime: new Date().toLocaleString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⏰ Démarré le: ${new Date().toLocaleString()}`);
});
