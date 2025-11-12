// =====================================================
// 🚀 LEXPAR SERVER - ROUTE UPDATE
// Objectif : Forcer la mise à jour de toutes les sources
// (BOVP PP, BOVP Ville, Paris Data) + synchronisation
// Auteur : Nono & Christophe
// Date : 2025-11-12
// =====================================================

import express from "express";
import fs from "fs";
import path from "path";

// --- Services internes ---
import { syncAllDataSources } from "./dataIntegrator.js";

const router = express.Router();

// =====================================================
// 🔹 ROUTE : /api/update
// =====================================================
router.get("/", async (req, res) => {
  console.log("🔄 Requête de mise à jour reçue...");

  try {
    // --- Étape 1 : Nettoyage éventuel des anciens fichiers (optionnel)
    const dataDir = path.resolve("./data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    // --- Étape 2 : Synchronisation de toutes les sources
    const result = await syncAllDataSources();

    // --- Étape 3 : Log automatique
    const logPath = path.join(dataDir, "last_update.json");
    const summary = {
      date: new Date().toLocaleString(),
      totalFiles: result.log.files.length,
      sources: result.log.files.map(f => f.source),
    };
    fs.writeFileSync(logPath, JSON.stringify(summary, null, 2), "utf8");

    console.log("✅ Mise à jour complète réussie !");
    res.json({
      ok: true,
      message: "Mise à jour complète réussie ✅",
      updated: summary,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error.message);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

export default router;