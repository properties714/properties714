//  NAVIGATION
// ══════════════════════════════════════
function nav(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');
  if (id === 'dashboard') renderDashboard();
  if (id === 'pipeline') renderPipeline();
  if (id === 'properties') renderProperties();
  if (id === 'crm') renderCRM('all');
  if (id === 'lenders') renderLenders();
  if (id === 'listings') renderListings();
  if (id === 'scripts') renderScripts();
  if (id === 'docs') renderDocs();
  if (id === 'repairs') initRepairs();
  if (id === 'admin') loadAdminUsers();
}

// ══════════════════════════════════════
//  MODALS
// ══════════════════════════════════════
function openContactModal(){ document.getElementById('modal-contact').classList.add('open'); }
function openLenderModal(){ document.getElementById('modal-lender').classList.add('open'); }
function openListingModal(){ document.getElementById('modal-listing').classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// ══════════════════════════════════════
