/*******************************************************************************************
 * PARIS DATA PARSER — LexPar IA v2
 * ------------------------------------------------------
 * Objectif : Nettoyer et reformater les datasets ParisData (Travaux + Terrasses)
 *******************************************************************************************/
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(filename) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Erreur lecture fichier : ${filename}`, err.message);
    return null;
  }
}

function parseTravaux(data) {
  if (!data || !data.results) return [];
  return data.results.map((item) => ({
    source: "ParisData",
    type: "Travaux perturbants",
    titre: item.objet || "Travaux",
    description: item.description || "Aucune description disponible.",
    adresse: item["Voie(s)"] || "Adresse non précisée",
    impact: item["Impact sur la circulation"] || "Non précisé",
    perturbation: item["Niveau de perturbation"] || "N/A",
    statut: item["Statut"] || "En cours",
    maitre_ouvrage: item["Maître d’ouvrage"] || "Non indiqué",
  }));
}

function parseTerrasses(data) {
  if (!data || !data.results) return [];
  return data.results.map((item) => ({
    source: "ParisData",
    type: "Terrasse ou étalage",
    enseigne: item["Nom de l'enseigne"] || "Non précisée",
    typologie: item["Typologie"] || "Non précisée",
    adresse: item["Numéro et voie"] || "Adresse non précisée",
    arrondissement: item["Arrondissement"] || "Non précisé",
    siret: item["SIRET"] || "Non communiqué",
    periode: item["Période d'installation"] || "N/A",
    surface: `${item["Longueur"] || "?"} x ${item["Largeur"] || "?"}`,
    lien: item["Lien affichette"] || "Aucun lien disponible",
    statut: "Autorisé",
  }));
}

export async function parseAllParisData() {
  console.log("🧠 Démarrage du parseur Paris Data — LexPar IA v2...");

  const rawTravaux = readJSON("paris_travaux_raw.json");
  const rawTerrasses = readJSON("paris_terrasses_raw.json");

  const cleanTravaux = parseTravaux(rawTravaux);
  const cleanTerrasses = parseTerrasses(rawTerrasses);

  fs.writeFileSync(
    path.join(DATA_DIR, "paris_travaux_clean.json"),
    JSON.stringify(cleanTravaux, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "paris_terrasses_clean.json"),
    JSON.stringify(cleanTerrasses, null, 2)
  );

  console.log(`✅ Travaux nettoyés : ${cleanTravaux.length}`);
  console.log(`✅ Terrasses nettoyées : ${cleanTerrasses.length}`);
  console.log("🏁 Parse terminé !");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  parseAllParisData();
}