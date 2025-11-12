// =====================================================
// 🧠 LEXPAR SERVER - ROUTE RECHERCHE ALL (Render-compatible)
// Objectif : fusionner toutes les sources JSON (BOVP, Ville, ParisData)
// Auteur : Nono & Christophe
// Date : 2025-11-12
// =====================================================

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const DATA_PATHS = {
  bovpPP: path.resolve("data/arretes_cache.json"),
  bovpVille: path.resolve("data/bovp_ville.json"),
  parisData: path.resolve("data/parisdata_clean.json"),
  travaux: path.resolve("data/paris_travaux_clean.json"),
  terrasses: path.resolve("data/paris_terrasses_clean.json"),
};

// ==============================
// 🧩 FONCTION : Lecture sécurisée
// ==============================
function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Fichier manquant : ${filePath}`);
      return [];
    }
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Erreur lecture JSON ${filePath} :`, err.message);
    return [];
  }
}

// ==============================
// 📡 ROUTE PRINCIPALE
// ==============================
router.get("/", async (req, res) => {
  console.log("📡 Fusion de toutes les données pour le Dashboard...");

  const dataPP = safeReadJSON(DATA_PATHS.bovpPP);
  const dataVille = safeReadJSON(DATA_PATHS.bovpVille);
  const dataParis = safeReadJSON(DATA_PATHS.parisData);
  const dataTravaux = safeReadJSON(DATA_PATHS.travaux);
  const dataTerrasses = safeReadJSON(DATA_PATHS.terrasses);

  // 🧠 Fusion totale
  const allData = [
    ...dataPP,
    ...dataVille,
    ...dataParis,
    ...dataTravaux,
    ...dataTerrasses,
  ];

  console.log(`✅ Fusion réussie : ${allData.length} éléments envoyés`);
  res.json({ ok: true, count: allData.length, results: allData });
});

export default router;