/*******************************************************************************************
 * PARIS DATA FETCHER — LexPar IA v2
 * ------------------------------------------------------
 * Objectif : Télécharger uniquement les datasets utiles (Travaux + Terrasses)
 * Date : 07/11/2025
 *******************************************************************************************/
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// Assure que le dossier /data existe
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/* ==========================================================
   (1) URLS DES DATASETS PARISDATA — circulation retirée
   ========================================================== */
const DATASETS = {
  travaux: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-perturbants/records?limit=100",
  terrasses: "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/terrasses-autorisations/records?limit=100",
};

/* ==========================================================
   (2) FONCTION GÉNÉRIQUE DE TÉLÉCHARGEMENT
   ========================================================== */
async function fetchDataset(name, url) {
  console.log(`📡 Téléchargement de ${name}...`);
  const filePath = path.join(DATA_DIR, `paris_${name}_raw.json`);

  try {
    const { data } = await axios.get(url);
    const count = data?.results?.length || 0;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ ${name} téléchargé (${count} enregistrements) → ${filePath}`);
    return { name, count, success: true };
  } catch (err) {
    console.error(`❌ Erreur lors du téléchargement de ${name} : ${err.message}`);
    fs.writeFileSync(filePath, "[]");
    return { name, count: 0, success: false };
  }
}

/* ==========================================================
   (3) FETCHER PRINCIPAL
   ========================================================== */
export async function fetchAllParisData() {
  console.log("🚀 Démarrage du téléchargeur Paris Data (mode offline LexPar)...");
  const results = [];

  for (const [key, url] of Object.entries(DATASETS)) {
    const res = await fetchDataset(key, url);
    results.push(res);
  }

  console.log("🏁 Téléchargement terminé !");
  return results;
}

/* ==========================================================
   (4) EXECUTION DIRECTE (mode test)
   ========================================================== */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchAllParisData();
}