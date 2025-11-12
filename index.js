/********************************************************************
 * SERVEUR PRINCIPAL LexPar IA v2
 * Objectif : gérer les routes ParisData + BOVP PP + Dashboard
 * Auteur : Chris & Nono 🚓
 ********************************************************************/

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// === 🔹 Import des routes ===
import updateRoutes from "./routes/update.js";
import statusRoutes from "./routes/status.js";
import rechercheAllRoute from "./routes/recherche_all.js";

// === 🔹 Initialisation du serveur Express ===
const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === 🔹 Middlewares ===
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === 🔹 FRONTEND (Dashboard) ===
app.use(express.static(path.join(__dirname, "public")));

// === 🔹 ROUTES BACKEND ===
app.use("/api/update", updateRoutes);
app.use("/api/recherche_all", rechercheAllRoute);
app.use("/api/status", statusRoutes);

// === 🔹 LANCEMENT DU SERVEUR ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur LexPar IA v2 en ligne sur http://localhost:${PORT}`);
  console.log(`✅ Routes disponibles : /api/update /api/recherche_all /api/status`);
});