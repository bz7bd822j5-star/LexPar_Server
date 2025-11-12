import { API_BASE } from "../config.js";

// =====================================================
// 📦 CHARGEMENT DES DONNÉES
// =====================================================
const container = document.getElementById("cardsContainer");
const statusLabel = document.getElementById("statusLabel");
const updateStatus = document.getElementById("updateStatus");
const searchInput = document.getElementById("searchInput");
const updateButton = document.getElementById("updateButton");
const filterButtons = document.querySelectorAll(".filters button[data-filter]");

let allData = [];

// =====================================================
// 🚀 Chargement des données depuis le serveur
// =====================================================
async function fetchAllData() {
  try {
    statusLabel.textContent = "⏳ Chargement des données...";
    const response = await fetch(`${API_BASE}/api/recherche_all`);
    if (!response.ok) throw new Error("Erreur de chargement");
    const data = await response.json();
    allData = data.results || [];
    renderCards(allData);
    statusLabel.textContent = `✅ Données actualisées (${allData.length} entrées)`;
  } catch (err) {
    statusLabel.textContent = "⚠️ Erreur de chargement des données";
    console.error("Erreur fetchAllData:", err);
  }
}

// =====================================================
// 🧩 Rendu des cartes
// =====================================================
function renderCards(data) {
  container.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "data-card";
    card.innerHTML = `
      <h3>${item.titre || item.enseigne || "Sans titre"}</h3>
      <p><b>📍 Adresse :</b> ${item.adresse || "Non précisée"}</p>
      <p><b>📅 Date :</b> ${item.date_publication || item.periode || "N/A"}</p>
      <p><b>🏷️ Source :</b> ${item.source || "Inconnue"}</p>
    `;
    container.appendChild(card);
  });
}

// =====================================================
// 🔎 Recherche + Filtres
// =====================================================
function applyFilters() {
  const term = searchInput.value.toLowerCase();
  const activeFilter = document.querySelector(".filters button.active").dataset.filter;

  const filtered = allData.filter((item) => {
    const matchesSearch =
      item.titre?.toLowerCase().includes(term) ||
      item.adresse?.toLowerCase().includes(term) ||
      item.source?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "travaux" && item.type?.toLowerCase().includes("travaux")) ||
      (activeFilter === "terrasses" && item.type?.toLowerCase().includes("terrasse")) ||
      (activeFilter === "bovp_pp" && item.source?.includes("Préfecture")) ||
      (activeFilter === "bovp_ville" && item.source?.includes("Ville de Paris"));

    return matchesSearch && matchesFilter;
  });

  renderCards(filtered);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

// =====================================================
// 🔄 Bouton de mise à jour (appelle /api/update)
// =====================================================
updateButton.addEventListener("click", async () => {
  try {
    statusLabel.textContent = "🔄 Mise à jour en cours...";
    const res = await fetch(`${API_BASE}/api/update`);
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    const data = await res.json();
    statusLabel.textContent = data.message || "✅ Données actualisées";
    await loadUpdateStatus();
    await fetchAllData();
  } catch (err) {
    statusLabel.textContent = "⚠️ Erreur mise à jour";
    console.error("Erreur forceUpdate:", err);
  }
});

// =====================================================
// 📊 Bloc d’état des mises à jour (depuis last_update.json)
// =====================================================
async function loadUpdateStatus() {
  try {
    const res = await fetch(`${API_BASE}/data/last_update.json`);
    if (!res.ok) throw new Error("Fichier last_update.json introuvable");
    const data = await res.json();

    const sources = [...new Set(data.sources)].join(", ");
    const date = data.date || "Non renseignée";
    const total = data.totalFiles || 0;

    updateStatus.innerHTML = `
      <div class="update-card">
        <h3>📊 État de la dernière mise à jour</h3>
        <p><b>📅 Date :</b> ${date}</p>
        <p><b>📦 Sources synchronisées :</b> ${sources}</p>
        <p><b>📂 Fichiers mis à jour :</b> ${total}</p>
      </div>
    `;
  } catch (error) {
    updateStatus.innerHTML = `
      <div class="update-card error">
        <h3>⚠️ Erreur</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// =====================================================
// 🏁 INITIALISATION
// =====================================================
fetchAllData();
loadUpdateStatus();