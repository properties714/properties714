// ══════════════════════════════════════
//  CRM PAGE BUILDER
// ══════════════════════════════════════

function buildCRMPage() {
const page = document.getElementById(‘page-crm’);
if (!page || document.getElementById(‘crm-list’)) return;
page.innerHTML = ` <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px"> <div> <h1 style="font-size:22px;font-weight:800" data-t="nav_crm">CRM</h1> <p style="color:var(--muted);font-size:13px;margin-top:4px">Buyers, sellers, lenders and agents</p> </div> <button class="btn btn-gold" onclick="openContactModal()">+ Add Contact</button> </div> <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap"> ${['all','buyer','seller','lender','agent','contractor'].map((t,i)=>`<button class="btn crm-tab ${i===0?'active':''}" style="padding:7px 16px;font-size:12px;background:${i===0?'rgba(245,200,66,0.12)':'rgba(255,255,255,0.05)'};border:1px solid ${i===0?'rgba(245,200,66,0.4)':'var(--border)'};" onclick="filterCRM('${t}',this)">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')} </div> <div class="card"><div id="crm-list"></div></div>`;
}

function buildLendersPage() {
const page = document.getElementById(‘page-lenders’);
if (!page || document.getElementById(‘lenders-grid’)) return;
page.innerHTML = ` <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"> <div><h1 style="font-size:22px;font-weight:800">Lenders</h1><p style="color:var(--muted);font-size:13px;margin-top:4px">Private and hard money lenders</p></div> <button class="btn btn-gold" onclick="openLenderModal()">+ Add Lender</button> </div> <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px" id="lenders-grid"></div>`;
}

function buildListingsPage() {
const page = document.getElementById(‘page-listings’);
if (!page || document.getElementById(‘listings-grid’)) return;
page.innerHTML = ` <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"> <div><h1 style="font-size:22px;font-weight:800">Listings</h1><p style="color:var(--muted);font-size:13px;margin-top:4px">Deals for your buyer network</p></div> <button class="btn btn-gold" onclick="openListingModal()">+ Add Listing</button> </div> <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px" id="listings-grid"></div>`;
}

function buildScriptsPage() {
const page = document.getElementById(‘page-scripts’);
if (!page || document.getElementById(‘scripts-list’)) return;
page.innerHTML = ` <div style="margin-bottom:24px"><h1 style="font-size:22px;font-weight:800">Scripts</h1><p style="color:var(--muted);font-size:13px;margin-top:4px">Cold call and outreach scripts</p></div> <div id="scripts-list"></div>`;
}

function buildDocsPage() {
const page = document.getElementById(‘page-docs’);
if (!page || document.getElementById(‘docs-grid’)) return;
page.innerHTML = ` <div style="margin-bottom:24px"><h1 style="font-size:22px;font-weight:800">Documents</h1><p style="color:var(--muted);font-size:13px;margin-top:4px">Templates and contracts</p></div> <div style="display:grid;gap:14px" id="docs-grid"></div>`;
}

// ══════════════════════════════════════
//  CRM — CONTACTS
// ══════════════════════════════════════

async function saveContact() {

const name = document.getElementById(‘cm-name’).value.trim();
if (!name) return;

const contact = {
id: DB.nid.co++,
name,
type: document.getElementById(‘cm-type’).value,
phone: document.getElementById(‘cm-phone’).value,
email: document.getElementById(‘cm-email’).value,
notes: document.getElementById(‘cm-notes’).value,
created_at: new Date()
};

// Save to Supabase
try {

```
const { data, error } = await SB
  .from('contacts')
  .insert([contact])
  .select()
  .single();

if (!error && data) {
  contact.id = data.id;
}
```

} catch(e) {
console.error(‘Supabase contact save error’, e);
}

DB.contacts.push(contact);

closeModal(‘modal-contact’);

[‘cm-name’,‘cm-phone’,‘cm-email’,‘cm-notes’]
.forEach(id => document.getElementById(id).value=’’);

renderCRM(‘all’);
}

function filterCRM(type, el) {

document.querySelectorAll(’.crm-tab’)
.forEach(t => t.classList.remove(‘active’));

if(el) el.classList.add(‘active’);

renderCRM(type);
}

function renderCRM(filter) {
buildCRMPage();

const list = document.getElementById(‘crm-list’);

const contacts =
filter === ‘all’
? DB.contacts
: DB.contacts.filter(c => c.type === filter);

if (!contacts.length) {

```
list.innerHTML =
'<div class="empty"><div class="empty-icon">👥</div><h3>No contacts</h3><p>Add buyers, sellers and lenders</p></div>';

return;
```

}

const typeColors = {
buyer:‘badge-green’,
seller:‘badge-amber’,
lender:‘badge-blue’,
agent:‘badge-muted’
};

const typeEmojis = {
buyer:‘💵’,
seller:‘🏠’,
lender:‘💰’,
agent:‘🤝’
};

list.innerHTML = contacts.map(c => `

```
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
```

`).join(’’);
}

// ══════════════════════════════════════
//  LENDERS
// ══════════════════════════════════════

function saveLender() {

const name = document.getElementById(‘lm-name’).value.trim();
if (!name) return;

DB.lenders.push({

```
id: DB.nid.l++,

name,

rate: document.getElementById('lm-rate').value,

max: document.getElementById('lm-max').value,

types: document.getElementById('lm-types').value,

contact: document.getElementById('lm-contact').value
```

});

closeModal(‘modal-lender’);

renderLenders();
}

function renderLenders() {
buildLendersPage();

const grid = document.getElementById(‘lenders-grid’);

if (!DB.lenders.length) {

```
grid.innerHTML =
'<div class="empty" style="grid-column:1/-1"><div class="empty-icon">💰</div><h3>No lenders yet</h3><p>Add private lenders to fund your deals</p></div>';

return;
```

}

grid.innerHTML = DB.lenders.map(l => `

```
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
```

`).join(’’);
}

// ══════════════════════════════════════
//  LISTINGS
// ══════════════════════════════════════

function saveListing() {

const addr = document.getElementById(‘lim-addr’).value.trim();
if (!addr) return;

DB.listings.push({

```
id: DB.nid.li++,

address: addr,

price: parseFloat(document.getElementById('lim-price').value) || 0,

arv: parseFloat(document.getElementById('lim-arv').value) || 0,

rehab: parseFloat(document.getElementById('lim-rehab').value) || 0,

strategy: document.getElementById('lim-strat').value,

description: document.getElementById('lim-desc').value,

created_at: new Date()
```

});

closeModal(‘modal-listing’);

renderListings();
}

function renderListings() {
buildListingsPage();

const grid = document.getElementById(‘listings-grid’);

if (!DB.listings.length) {

```
grid.innerHTML =
'<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏘</div><h3>No listings</h3><p>Publish deals to your buyer network</p></div>';

return;
```

}

const stratBadge = {
wholesale:‘badge-gold’,
fix_flip:‘badge-amber’,
rental:‘badge-blue’
};

const icons = [‘🏠’,‘🏡’,‘🏘’,‘🏗’,‘🏢’];

grid.innerHTML = DB.listings.map((l,i)=>`

```
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
```

`).join(’’);
}

// ══════════════════════════════════════
//  SCRIPTS
// ══════════════════════════════════════

function renderScripts() {
buildScriptsPage();

document.getElementById(‘scripts-list’).innerHTML =
SCRIPTS.map(s=>`

```
<div class="script-card">

  <div class="script-header">

    <div class="script-title">${s.title}</div>

    <span class="badge ${s.tag}">
      ${s.tagText}
    </span>

  </div>

  <div class="script-body">${s.body}</div>

</div>
```

`).join(’’);
}

// ══════════════════════════════════════
//  DOCUMENTS
// ══════════════════════════════════════

function renderDocs() {
buildDocsPage();

document.getElementById(‘docs-grid’).innerHTML =
DOCS.map(d=>`

```
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
```

`).join(’’);
}

// ══════════════════════════════════════
// SCRIPTS & DOCS DATA
// ══════════════════════════════════════

const SCRIPTS = [
{ title:‘Motivated Seller Cold Call’, tag:‘badge-green’, tagText:‘Outbound’, body:‘Hi, my name is [Name] and I buy houses in [City]. I'm calling because I noticed your property at [Address] and wanted to see if you'd be open to a cash offer. Do you have a moment to talk?’ },
{ title:‘Wholesale Buyer Script’, tag:‘badge-blue’, tagText:‘Buyer’, body:‘Hey [Name], I have a property under contract in [Neighborhood] that I think would be perfect for your portfolio. It's a [beds/baths], asking [Price], ARV is around [ARV]. Can we hop on a quick call?’ },
{ title:‘Follow-Up Script’, tag:‘badge-amber’, tagText:‘Follow-Up’, body:‘Hi [Name], I wanted to follow up on the property we discussed at [Address]. Are you still considering selling? I'm still interested and can close quickly with cash.’ },
{ title:‘Lender Introduction’, tag:‘badge-gold’, tagText:‘Funding’, body:‘Hi [Name], I'm a real estate investor in [City] focusing on fix & flip and rental properties. I'm looking for a private lender to fund deals — typically [Price Range], 6-12 month terms. Would you be open to a conversation?’ }
];

const DOCS = [
{ icon:‘📄’, title:‘Purchase Agreement’, desc:‘Standard real estate purchase contract template’, tag:‘badge-green’, tagText:‘Essential’ },
{ icon:‘📋’, title:‘Assignment of Contract’, desc:‘Wholesale assignment agreement for sub-to transactions’, tag:‘badge-amber’, tagText:‘Wholesale’ },
{ icon:‘🔑’, title:‘Lease Agreement’, desc:‘Residential lease for rental properties’, tag:‘badge-blue’, tagText:‘Rental’ },
{ icon:‘🏗’, title:‘Contractor Bid Sheet’, desc:‘Get standardized bids from your contractors’, tag:‘badge-muted’, tagText:‘Rehab’ },
{ icon:‘💰’, title:‘Private Money Loan Agreement’, desc:‘Template for hard/private money lending terms’, tag:‘badge-gold’, tagText:‘Funding’ },
{ icon:‘📊’, title:‘Deal Analysis Spreadsheet’, desc:‘Complete underwriting template for all strategies’, tag:‘badge-green’, tagText:‘Analysis’ }
];
