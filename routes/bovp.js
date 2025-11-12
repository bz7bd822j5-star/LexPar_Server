// routes/bovp.js
// =====================================
// Route BOVP PP (Préfecture de Police)
// Lit le fichier data/bovp_prefecture.json
// et renvoie les arrêtés sous forme filtrable.
// =====================================

import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Définition des chemins absolus
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "bovp_prefecture.json");

/**
 * GET /api/bovp
 * Permet de récupérer les arrêtés de la Préfecture de Police
 * avec filtres optionnels : type, date, mot-clé, etc.
 */
router.get("/", async (req, res) => {
  try {
    // Lecture du fichier JSON
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw);

    // Paramètres de recherche (query string)
    const { q, type, date } = req.query;
    let results = data;

    // 🔍 Filtre par mot-clé (titre ou adresse)
    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(
        (a) =>
          a.titre.toLowerCase().includes(lower) ||
          a.adresse?.toLowerCase().includes(lower)
      );
    }

    // 🔍 Filtre par type (ex: stationnement / circulation)
    if (type) {
      results = results.filter(
        (a) => a.type && a.type.toLowerCase().includes(type.toLowerCase())
      );
    }

    // 🔍 Filtre par date de publication
    if (date) {
      results = results.filter((a) =>
        a.date_publication?.includes(date)
      );
    }

    // Limite simple (par défaut 100)
    const limit = parseInt(req.query.limit || "100", 10);
    results = results.slice(0, limit);

    // ✅ Réponse JSON
    res.json({
      ok: true,
      source: "BOVP PP",
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Erreur BOVP route:", err.message);
    res.status(500).json({
      ok: false,
      error: "Impossible de lire bovp_prefecture.json",
    });
  }
});

export default router;