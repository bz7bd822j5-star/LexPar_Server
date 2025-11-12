// =========================================================
// 🔄 LEXPAR DATA INTEGRATOR v2 — LIAISON TOTALE
// Objectif : synchroniser les fichiers BOVP + ParisData
// Auteur : Nono & Christophe
// Date : 2025-11-12
// =========================================================

import fs from "fs";
import path from "path";

// --- Dossiers sources ---
const SOURCE_PARISDATA = path.resolve("../LexPar_API_ParisData/data");
const SOURCE_BOVP_PP = path.resolve("../LexPar_BOVP_Extraction/data");
const SOURCE_BOVP_VILLE = path.resolve("../LexPar_BOVP_Ville_V1/data");

// --- Dossier de destination (serveur central) ---
const DEST_DIR = path.resolve("./data");
const LOG_FILE = path.join(DEST_DIR, "sync_log.json");

// --- Fichiers à copier pour chaque source ---
const FILES = {
  PARISDATA: [
    "paris_terrasses_clean.json",
    "paris_travaux_clean.json",
    "parisdata_clean.json",
    "parisdata_full.json",
  ],
  BOVP_PP: ["arretes_cache.json"],
  BOVP_VILLE: ["arretes_ville_cache.json"],
};

// =========================================================
// 🧩 FONCTION DE SYNCHRONISATION GÉNÉRIQUE
// =========================================================
function copyFilesFrom(sourceDir, fileList, label, log) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`⚠️  Dossier source introuvable pour ${label}: ${sourceDir}`);
    return;
  }

  for (const file of fileList) {
    const src = path.join(sourceDir, file);
    const dest = path.join(DEST_DIR, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      const stats = fs.statSync(src);
      log.files.push({
        source: label,
        file,
        sizeKo: (stats.size / 1024).toFixed(1),
      });
      console.log(`✅ [${label}] ${file} copié (${(stats.size / 1024).toFixed(1)} Ko)`);
    } else {
      console.warn(`❌ [${label}] Fichier manquant : ${file}`);
    }
  }
}

// =========================================================
// 🚀 LANCEUR PRINCIPAL
// =========================================================
export async function syncAllDataSources() {
  console.log("📦 Démarrage de la synchronisation complète...");

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR);
  }

  const log = {
    date: new Date().toLocaleString(),
    files: [],
  };

  // --- Synchronisation ---
  copyFilesFrom(SOURCE_PARISDATA, FILES.PARISDATA, "ParisData", log);
  copyFilesFrom(SOURCE_BOVP_PP, FILES.BOVP_PP, "BOVP_PP", log);
  copyFilesFrom(SOURCE_BOVP_VILLE, FILES.BOVP_VILLE, "BOVP_VILLE", log);

  // --- Sauvegarde du journal ---
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), "utf8");

  console.log("🗓️  Journal de synchro mis à jour :", LOG_FILE);
  console.log(`✅ ${log.files.length} fichiers synchronisés avec succès.`);

  return { ok: true, message: "Synchronisation complète terminée ✅", log };
}

// --- Lancement manuel si exécuté directement ---
if (process.argv[1].includes("dataIntegrator.js")) {
  syncAllDataSources();
}