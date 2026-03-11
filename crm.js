// ══════════════════════════════════════
//  CRM — CONTACTS
// ══════════════════════════════════════

async function saveContact() {

  const name = document.getElementById('cm-name').value.trim();
  if (!name) return;

  const contact = {
    id: DB.nid.co++,
    name,
    type: document.getElementById('cm-type').value,
    phone: document.getElementById('cm-phone').value,
    email: document.getElementById('cm-email').value,
    notes: document.getElementById('cm-notes').value,
    created_at: new Date()
  };

  // Save to Supabase
  try {

    const { data, error } = await SB
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (!error && data) {
      contact.id = data.id;
    }

  } catch(e) {
    console.error('Supabase contact save error', e);
  }

  DB.contacts.push(contact);

  closeModal('modal-contact');

  ['cm-name','cm-phone','cm-email','cm-notes']
    .forEach(id => document.getElementById(id).value='');

  renderCRM('all');
}


function filterCRM(type, el) {

  document.querySelectorAll('.crm-tab')
    .forEach(t => t.classList.remove('active'));

  if(el) el.classList.add('active');

  renderCRM(type);
}


function renderCRM(filter) {

  const list = document.getElementById('crm-list');

  const contacts =
    filter === 'all'
      ? DB.contacts
      : DB.contacts.filter(c => c.type === filter);

  if (!contacts.length) {

    list.innerHTML =
    '<div class="empty"><div class="empty-icon">👥</div><h3>No contacts</h3><p>Add buyers, sellers and lenders</p></div>';

    return;
  }

  const typeColors = {
    buyer:'badge-green',
    seller:'badge-amber',
    lender:'badge-blue',
    agent:'badge-muted'
  };

  const typeEmojis = {
    buyer:'💵',
    seller:'🏠',
    lender:'💰',
    agent:'🤝'
  };

  list.innerHTML = contacts.map(c => `

    <div class="contact-card">

      <div class="contact-avatar"
      style="background:var(--surface);border:1px solid var(--border)">
        ${typeEmojis[c.type] || '👤'}
      </div>

      <div class="contact-info">

        <div class="contact-name">${c.name}</div>

        <div class="contact-detail">
          ${c.phone || ''} ${c.email ? '· '+c.email : ''}
        </div>

        ${c.notes
          ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">${c.notes}</div>`
          : ''
        }

      </div>

      <span class="badge ${typeColors[c.type] || 'badge-muted'}">
        ${c.type}
      </span>

    </div>

  `).join('');
}



// ══════════════════════════════════════
//  LENDERS
// ══════════════════════════════════════

function saveLender() {

  const name = document.getElementById('lm-name').value.trim();
  if (!name) return;

  DB.lenders.push({

    id: DB.nid.l++,

    name,

    rate: document.getElementById('lm-rate').value,

    max: document.getElementById('lm-max').value,

    types: document.getElementById('lm-types').value,

    contact: document.getElementById('lm-contact').value

  });

  closeModal('modal-lender');

  renderLenders();
}


function renderLenders() {

  const grid = document.getElementById('lenders-grid');

  if (!DB.lenders.length) {

    grid.innerHTML =
    '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">💰</div><h3>No lenders yet</h3><p>Add private lenders to fund your deals</p></div>';

    return;
  }

  grid.innerHTML = DB.lenders.map(l => `

    <div class="lender-card">

      <div class="lender-name">${l.name}</div>

      <div class="lender-meta">

        ${l.rate
          ? `<span class="lender-tag">Rate: ${l.rate}%</span>`
          : ''
        }

        ${l.max
          ? `<span class="lender-tag">Max: $${parseInt(l.max).toLocaleString()}</span>`
          : ''
        }

        ${l.types
          ? l.types.split(',').map(t =>
            `<span class="lender-tag">${t.trim()}</span>`
          ).join('')
          : ''
        }

      </div>

      ${l.contact
        ? `<div style="font-size:12px;color:var(--muted)">${l.contact}</div>`
        : ''
      }

    </div>

  `).join('');
}



// ══════════════════════════════════════
//  LISTINGS
// ══════════════════════════════════════

function saveListing() {

  const addr = document.getElementById('lim-addr').value.trim();
  if (!addr) return;

  DB.listings.push({

    id: DB.nid.li++,

    address: addr,

    price: parseFloat(document.getElementById('lim-price').value) || 0,

    arv: parseFloat(document.getElementById('lim-arv').value) || 0,

    rehab: parseFloat(document.getElementById('lim-rehab').value) || 0,

    strategy: document.getElementById('lim-strat').value,

    description: document.getElementById('lim-desc').value,

    created_at: new Date()

  });

  closeModal('modal-listing');

  renderListings();
}


function renderListings() {

  const grid = document.getElementById('listings-grid');

  if (!DB.listings.length) {

    grid.innerHTML =
    '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏘</div><h3>No listings</h3><p>Publish deals to your buyer network</p></div>';

    return;
  }

  const stratBadge = {
    wholesale:'badge-gold',
    fix_flip:'badge-amber',
    rental:'badge-blue'
  };

  const icons = ['🏠','🏡','🏘','🏗','🏢'];

  grid.innerHTML = DB.listings.map((l,i)=>`

    <div class="listing-card">

      <div class="listing-img">

        ${icons[i % icons.length]}

        <span class="badge ${stratBadge[l.strategy] || 'badge-muted'} listing-badge">
          ${l.strategy.replace('_',' ')}
        </span>

      </div>

      <div class="listing-body">

        <div class="listing-addr">${l.address}</div>

        <div class="listing-price">
          $${l.price.toLocaleString()}
        </div>

        <div class="listing-meta">

          <span>ARV $${l.arv.toLocaleString()}</span>

          <span>Rehab $${l.rehab.toLocaleString()}</span>

        </div>

        ${l.description
          ? `<div style="font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5">${l.description}</div>`
          : ''
        }

      </div>

    </div>

  `).join('');
}



// ══════════════════════════════════════
//  SCRIPTS
// ══════════════════════════════════════

function renderScripts() {

  document.getElementById('scripts-list').innerHTML =
  SCRIPTS.map(s=>`

    <div class="script-card">

      <div class="script-header">

        <div class="script-title">${s.title}</div>

        <span class="badge ${s.tag}">
          ${s.tagText}
        </span>

      </div>

      <div class="script-body">${s.body}</div>

    </div>

  `).join('');
}



// ══════════════════════════════════════
//  DOCUMENTS
// ══════════════════════════════════════

function renderDocs() {

  document.getElementById('docs-grid').innerHTML =
  DOCS.map(d=>`

    <div class="card" style="display:flex;gap:14px;align-items:flex-start">

      <div style="font-size:28px;line-height:1">${d.icon}</div>

      <div style="flex:1">

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">

          <div style="font-size:14px;font-weight:700">${d.title}</div>

          <span class="badge ${d.tag}">
            ${d.tagText}
          </span>

        </div>

        <div style="font-size:12px;color:var(--muted);margin-bottom:12px">
          ${d.desc}
        </div>

        <button class="btn btn-ghost btn-sm"
        onclick="alert('Connect Google Drive to enable downloads')">
          Download Template
        </button>

      </div>

    </div>

  `).join('');
}
