// ══════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════

function nav(id, el) {

  // Hide all pages
  document.querySelectorAll('.page')
    .forEach(p => p.classList.remove('active'));

  // Reset active nav item
  document.querySelectorAll('.nav-item')
    .forEach(n => n.classList.remove('active'));

  // Activate target page
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  // Activate clicked nav item
  if (el) el.classList.add('active');


  // Initialize modules depending on page
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

function openContactModal() {

  document.getElementById('modal-contact')
    .classList.add('open');

}


function openLenderModal() {

  document.getElementById('modal-lender')
    .classList.add('open');

}


function openListingModal() {

  document.getElementById('modal-listing')
    .classList.add('open');

}


function closeModal(id) {

  const modal = document.getElementById(id);

  if (modal) modal.classList.remove('open');

}



// ══════════════════════════════════════
//  INITIAL PAGE LOAD
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // Default page
  nav('dashboard', document.querySelector('.nav-item.active'));

});
