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

  if (!data?.user) {
    window.location.href = "/";
    return;
  }

  ADMIN_USER = data.user;

  loadAdminStats();
  loadAdminUsers();
  loadAdminDeals();
}


// ══════════════════════════════════════
// LOAD ADMIN STATS
// ══════════════════════════════════════

async function loadAdminStats() {

  const { data: users } = await SB
    .from("profiles")
    .select("*");

  const { data: properties } = await SB
    .from("properties")
    .select("*");

  const { data: analysis } = await SB
    .from("analysis")
    .select("*");

  USERS = users || [];
  PROPERTIES = properties || [];
  ANALYSIS = analysis || [];

  document.getElementById("stat-users").textContent = USERS.length;
  document.getElementById("stat-properties").textContent = PROPERTIES.length;
  document.getElementById("stat-analysis").textContent = ANALYSIS.length;

}


// ══════════════════════════════════════
// LOAD USERS
// ══════════════════════════════════════

async function loadAdminUsers() {

  const { data, error } = await SB
    .from("profiles")
    .select("*")
    .order("created_at", { ascending:false });

  if (error) return;

  USERS = data;

  renderUsers();

}


function renderUsers() {

  const table = document.getElementById("users-table");

  if (!table) return;

  table.innerHTML = USERS.map(u => `
  
    <tr>
      <td>${u.email || ""}</td>
      <td>${u.full_name || "-"}</td>
      <td>${u.plan || "free"}</td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
    </tr>
  
  `).join("");

}


// ══════════════════════════════════════
// LOAD DEALS
// ══════════════════════════════════════

async function loadAdminDeals() {

  const { data, error } = await SB
    .from("properties")
    .select("*")
    .order("created_at", { ascending:false })
    .limit(50);

  if (error) return;

  PROPERTIES = data;

  renderDeals();

}


function renderDeals() {

  const table = document.getElementById("deals-table");

  if (!table) return;

  table.innerHTML = PROPERTIES.map(p => `
  
    <tr>
      <td>${p.address}</td>
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
  checkAdmin();
});
