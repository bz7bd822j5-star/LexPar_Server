/********************************************************************
 * ROUTE AUTO-UPDATE (ParisData + BOVP) POUR RENDER
 * URL : /api/autoupdate?key=LEXPAR_ADMIN
 ********************************************************************/

import express from "express";
import { runAutoUpdate } from "../services/autoUpdater.js";

const router = express.Router();

// 🔑 Clé d'accès admin (à mettre en variable d'environnement ensuite)
const ADMIN_KEY = "LEXPAR_ADMIN";

/**
 * GET /api/autoupdate?key=LEXPAR_ADMIN
 * Force la mise à jour complète (PP + Ville + ParisData)
 */
router.get("/", async (req, res) => {
  try {
    const key = req.query.key;

    if (!key || key !== ADMIN_KEY) {
      return res.status(401).json({
        ok: false,
        error: "Clé d'accès invalide",
      });
    }

    console.log("🔄 Mise à jour automatique déclenchée (admin)…");

    const result = await runAutoUpdate();

    return res.json({
      ok: true,
      message: "Mise à jour automatique terminée",
      result,
    });

  } catch (err) {
    console.error("❌ Erreur autoupdate :", err.message);
    return res.status(500).json({
      ok: false,
      error: "Erreur interne pendant la mise à jour",
      details: err.message,
    });
  }
});

export default router;