// ══════════════════════════════════════
// PROPERTIES714 — ADMIN PANEL
// ══════════════════════════════════════


// ══════════════════════════════════════
// ADMIN STATE
// ══════════════════════════════════════

let ADMIN_USER = null;
let USERS = [];
let PROPERTIES = [];
let ANALYSIS = [];


// ══════════════════════════════════════
// ADMIN LOGIN CHECK
// ══════════════════════════════════════

async function checkAdmin() {

  const { data } = await SB.auth.getUser();

  if (!data?.user) return;

  ADMIN_USER = data.user;

  loadAdminStats();
  loadAdminUsers();
  loadAdminDeals();
}


// ══════════════════════════════════════
// LOAD ADMIN STATS
// ══════════════════════════════════════

async function loadAdminStats() {

  try {

    const { data: users } = await SB
      .from("user_profiles")
      .select("*");

    const { data: properties } = await SB
      .from("properties")
      .select("*");

    const { data: analysis } = await SB
      .from("deal_analysis")
      .select("*");

    USERS = users || [];
    PROPERTIES = properties || [];
    ANALYSIS = analysis || [];

    const statUsers = document.getElementById("stat-users");
    const statProps = document.getElementById("stat-properties");
    const statAnalysis = document.getElementById("stat-analysis");

    if (statUsers) statUsers.textContent = USERS.length;
    if (statProps) statProps.textContent = PROPERTIES.length;
    if (statAnalysis) statAnalysis.textContent = ANALYSIS.length;

  } catch(e) {
    console.warn("Admin stats error:", e);
  }

}


// ══════════════════════════════════════
// LOAD USERS
// ══════════════════════════════════════

async function loadAdminUsers() {

  try {

    const { data, error } = await SB
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending:false });

    if (error) return;

    USERS = data || [];

    renderUsers();

  } catch(e) {
    console.warn("Admin users error:", e);
  }

}


function renderUsers() {

  const table = document.getElementById("users-table");

  if (!table) return;

  table.innerHTML = USERS.map(u => `
  
    <tr>
      <td>${u.email || ""}</td>
      <td>${u.full_name || "-"}</td>
      <td>${u.role || "investor"}</td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
    </tr>
  
  `).join("");

}


// ══════════════════════════════════════
// LOAD DEALS
// ══════════════════════════════════════

async function loadAdminDeals() {

  try {

    const { data, error } = await SB
      .from("properties")
      .select("*")
      .order("created_at", { ascending:false })
      .limit(50);

    if (error) return;

    PROPERTIES = data || [];

    renderDeals();

  } catch(e) {
    console.warn("Admin deals error:", e);
  }

}


function renderDeals() {

  const table = document.getElementById("deals-table");

  if (!table) return;

  table.innerHTML = PROPERTIES.map(p => `
  
    <tr>
      <td>${p.address || ""}</td>
      <td>${p.city || "-"}</td>
      <td>$${(p.asking_price || 0).toLocaleString()}</td>
      <td>${p.strategy_candidate || "-"}</td>
      <td>${new Date(p.created_at).toLocaleDateString()}</td>
    </tr>
  
  `).join("");

}


// ══════════════════════════════════════
// DELETE PROPERTY
// ══════════════════════════════════════

async function deleteProperty(id) {

  if (!confirm("Delete property?")) return;

  await SB
    .from("properties")
    .delete()
    .eq("id", id);

  loadAdminDeals();

}


// ══════════════════════════════════════
// SIGN OUT
// ══════════════════════════════════════

async function adminLogout() {

  await SB.auth.signOut();

  window.location.href = "/";

}


// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {

  if (typeof SB !== "undefined") {
    checkAdmin();
  }

});
