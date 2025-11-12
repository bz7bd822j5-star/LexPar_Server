/********************************************************************
 * ROUTE : /api/status
 * Objectif : Vérifie les fichiers data/ existants (asynchrone)
 * Auteur : Chris & Nono 🚓
 ********************************************************************/
import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

/**
 * GET /api/status
 * Retourne la liste des fichiers du dossier /data
 * avec taille (Ko), date, et type de source.
 */
router.get("/", async (req, res) => {
  try {
    // Lecture asynchrone du contenu du dossier /data
    const files = await fs.readdir(DATA_DIR);

    // Construction de la liste
    const list = await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(DATA_DIR, file);
        const stats = await fs.stat(fullPath);

        // Détermination de la source
        const source =
          file.includes("bovp") ? "BOVP PP" :
          file.includes("paris") ? "Paris Data" :
          "Autre";

        return {
          file,
          source,
          sizeKo: Math.round(stats.size / 1024),
          updatedAt: new Date(stats.mtime).toLocaleString("fr-FR"),
        };
      })
    );

    // Tri par nom de fichier
    list.sort((a, b) => a.file.localeCompare(b.file));

    // ✅ Réponse JSON
    res.json({
      ok: true,
      total: list.length,
      files: list,
    });
  } catch (err) {
    console.error("❌ Erreur /api/status :", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;