// ===========================================================
// LexPar IA v2 — BOVP Préfecture de Police (Extraction paginée v4)
// Auteur : Nono & Christophe
// ===========================================================

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// === Constantes & helpers ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "bovp_prefecture.json");
const BASE_URL = "https://bovp.apps.paris.fr/";
const SEARCH_URL = `${BASE_URL}index.php?lvl=search_segment&id=73&page=`;

const HTTP = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
  validateStatus: s => s >= 200 && s < 400,
});

// Pause courte
const wait = (ms = 700) => new Promise(r => setTimeout(r, ms));

// Nettoyage du texte
const clean = (t = "") => t.replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();

// ===========================================================
// 1️⃣ Parse une page BOVP HTML
// ===========================================================
function parseBovpHtml(html) {
  const $ = cheerio.load(html);
  const results = [];

  $("a[href*='notice_display']").each((_, el) => {
    const titre = clean($(el).text());
    const lien = new URL($(el).attr("href"), BASE_URL).href;
    if (titre && lien) results.push({ titre, lien });
  });

  return results;
}

// ===========================================================
// 2️⃣ Fonction principale — utilisée par serveur ET CLI
// ===========================================================
export async function fetchBOVP_PP({ pages = 5 } = {}) {
  console.log("ℹ️  🚀 Démarrage du moteur BOVP PP v4 (pagination AJAX)");
  await fs.mkdir(DATA_DIR, { recursive: true });

  const all = [];
  for (let p = 1; p <= pages; p++) {
    const url = `${SEARCH_URL}${p}`;
    console.log(`ℹ️  📄 Téléchargement page ${p}/${pages} → ${url}`);

    try {
      const { data: html } = await HTTP.get(url);
      const items = parseBovpHtml(html);
      console.log(`ℹ️     ↳ ${items.length} arrêtés détectés sur cette page.`);
      all.push(...items);
      await wait();
    } catch (err) {
      console.warn(`⚠️  Page ${p} ignorée :`, err.message);
    }
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(all, null, 2), "utf8");
  console.log(`✅ 💾 ${all.length} arrêtés PP sauvegardés → ${path.relative(process.cwd(), OUT_FILE)}`);

  return { ok: true, count: all.length, file: OUT_FILE };
}

// ===========================================================
// 3️⃣ Mode exécution directe (CLI)
// ===========================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchBOVP_PP({ pages: Number(process.env.PAGES || 5) }).catch(err => {
    console.error("❌ Erreur BOVP PP:", err.message || err);
    process.exit(1);
  });
}