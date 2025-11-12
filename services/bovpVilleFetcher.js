/********************************************************************
 * MODULE : BOVP Ville de Paris
 * OBJECTIF : Télécharger les arrêtés municipaux (Ville de Paris)
 * AUTEUR : Chris & Nono 🚀
 ********************************************************************/

/* ===========================================================
   1️⃣  IMPORTATION DES MODULES
   ----------------------------------------------------------- */
import axios from "axios";            // Pour télécharger les pages HTML
import fs from "fs";                 // Pour écrire le fichier JSON
import path from "path";             // Pour construire les chemins de fichiers
import { fileURLToPath } from "url"; // Pour localiser le script

/* ===========================================================
   2️⃣  CONFIGURATION DES CHEMINS DE SAUVEGARDE
   ----------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichier cible dans /data/
const DATA_PATH = path.join(__dirname, "..", "data", "bovp_ville.json");

/* ===========================================================
   3️⃣  FONCTION PRINCIPALE : fetchBovpVille()
   ----------------------------------------------------------- */
export async function fetchBovpVille() {
  console.log("🏙️  [BOVP Ville] Téléchargement des arrêtés municipaux...");

  // 🔗 URL de base pour les arrêtés municipaux
  const url = "https://bovp.apps.paris.fr/bovp/jsp/site/Portal.jsp?page=search&type=arrete_municipal";

  try {
    /* -------------------------------------------
       1️⃣ Téléchargement de la page principale
       ------------------------------------------- */
    const { data } = await axios.get(url);
    console.log("✅ Page HTML téléchargée depuis le BOVP Ville.");

    /* -------------------------------------------
       2️⃣ Extraction du contenu HTML (chaque arrêté)
       ------------------------------------------- */
    // Chaque arrêté est contenu dans un <li class="result-item">
    const regex = /<li class="result-item">([\s\S]*?)<\/li>/g;
    const matches = [...data.matchAll(regex)];

    console.log(`📋 ${matches.length} arrêtés détectés.`);

    /* -------------------------------------------
       3️⃣ Conversion du HTML brut en objets JSON
       ------------------------------------------- */
    const arretes = matches.map((m) => {
      const bloc = m[1];

      // Extraction du titre, de la date et du lien
      const titre = bloc.match(/<h3[^>]*>(.*?)<\/h3>/)?.[1]?.trim() || "Titre non trouvé";
      const date = bloc.match(/(\d{2}\/\d{2}\/\d{4})/)?.[1] || "Date inconnue";
      const lien = bloc.match(/href="([^"]+)"/)?.[1]
        ? `https://bovp.apps.paris.fr${bloc.match(/href="([^"]+)"/)[1]}`
        : "Lien indisponible";

      // Construction de l’objet final
      return {
        source: "BOVP Ville de Paris",
        titre,
        date,
        lien,
      };
    });

    /* -------------------------------------------
       4️⃣ Sauvegarde du résultat dans /data/
       ------------------------------------------- */
    fs.writeFileSync(DATA_PATH, JSON.stringify(arretes, null, 2), "utf8");

    console.log(`💾 ${arretes.length} arrêtés sauvegardés dans ${DATA_PATH}`);
    console.log("🏁 Téléchargement terminé avec succès !");
  } catch (error) {
    console.error("❌ [ERREUR BOVP Ville] Échec du téléchargement :", error.message);
  }
}

/* ===========================================================
   4️⃣  LANCEMENT LOCAL (TEST DIRECT DE CE MODULE)
   ----------------------------------------------------------- */
// Ce bloc permet de tester le script seul, depuis le terminal
if (process.argv[1].includes("bovpVilleFetcher.js")) {
  fetchBovpVille();
}