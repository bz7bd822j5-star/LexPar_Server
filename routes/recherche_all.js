// =====================================================
// 📡 ROUTE RECHERCHE_ALL.JS - LexPar IA v2
// Objectif : fusionner toutes les sources (BOVP PP + BOVP Ville + Travaux + Terrasses)
// =====================================================

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const DATA_DIR = "./data";

// =====================================================
// 1️⃣ Fonction utilitaire - Chargement JSON sécurisé
// =====================================================
function loadJSON(file) {
  try {
    const fullPath = path.join(DATA_DIR, file);
    if (!fs.existsSync(fullPath)) return [];
    const content = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Erreur lors du chargement de ${file} :`, err.message);
    return [];
  }
}

// =====================================================
// 2️⃣ Route principale : /api/recherche_all
// =====================================================
router.get("/", (req, res) => {
  console.log("📡 Fusion de toutes les données pour le Dashboard...");

  // --- Chargement des fichiers locaux ---
  const bovpPP = loadJSON("bovp_prefecture.json");      // Préfecture de Police
  const bovpVille = loadJSON("bovp_ville.json");        // Ville de Paris
  const travaux = loadJSON("paris_travaux_clean.json"); // Travaux perturbants
  const terrasses = loadJSON("paris_terrasses_clean.json"); // Terrasses / étalages

  // --- Vérification rapide des volumes ---
  console.log(`   📘 BOVP PP : ${bovpPP.length}`);
  console.log(`   🏛️ BOVP Ville : ${bovpVille.length}`);
  console.log(`   🏗️ Travaux : ${travaux.length}`);
  console.log(`   ☕ Terrasses : ${terrasses.length}`);

  // --- Fusion complète ---
  const fusion = [
    ...bovpPP.map(x => ({ ...x, source: "BOVP - Préfecture de Police" })),
    ...bovpVille.map(x => ({ ...x, source: "BOVP - Ville de Paris" })),
    ...travaux.map(x => ({ ...x, source: "ParisData - Travaux" })),
    ...terrasses.map(x => ({ ...x, source: "ParisData - Terrasses" })),
  ];

  // --- Résumé console ---
  console.log(`✅ Fusion réussie : ${fusion.length} éléments envoyés`);

  // --- Réponse au client ---
  res.json({
    ok: true,
    count: fusion.length,
    results: fusion
  });
});

export default router;