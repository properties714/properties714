//  CRM
// ══════════════════════════════════════
async function saveContact() {
  const name = document.getElementById('cm-name').value.trim();
  if (!name) return;
  const contact = {
    id:DB.nid.co++, name,
    type: document.getElementById('cm-type').value,
    phone: document.getElementById('cm-phone').value,
    email: document.getElementById('cm-email').value,
    notes: document.getElementById('cm-notes').value,
    created_at: new Date()
  };
  // Save to Supabase
  const saved = await sbSaveContact(contact);
  if (saved) contact.id = saved.id;
  DB.contacts.push(contact);
  closeModal('modal-contact');
  ['cm-name','cm-phone','cm-email','cm-notes'].forEach(id=>document.getElementById(id).value='');
  renderCRM('all');
}

function filterCRM(type, el) {
  document.querySelectorAll('.crm-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderCRM(type);
}

function renderCRM(filter) {
  const list = document.getElementById('crm-list');
  const contacts = filter==='all' ? DB.contacts : DB.contacts.filter(c=>c.type===filter);
  if (!contacts.length) {
    list.innerHTML='<div class="empty"><div class="empty-icon">👥</div><h3>No contacts</h3><p>Add buyers, sellers and lenders</p></div>';
    return;
  }
  const typeColors = {buyer:'badge-green',seller:'badge-amber',lender:'badge-blue',agent:'badge-muted'};
  const typeEmojis = {buyer:'💵',seller:'🏠',lender:'💰',agent:'🤝'};
  list.innerHTML = contacts.map(c=>`
    <div class="contact-card">
      <div class="contact-avatar" style="background:var(--surface);border:1px solid var(--border)">${typeEmojis[c.type]||'👤'}</div>
      <div class="contact-info">
        <div class="contact-name">${c.name}</div>
        <div class="contact-detail">${c.phone||''} ${c.email?'· '+c.email:''}</div>
        ${c.notes?`<div style="font-size:11px;color:var(--muted);margin-top:4px">${c.notes}</div>`:''}
      </div>
      <span class="badge ${typeColors[c.type]||'badge-muted'}">${c.type}</span>
    </div>`).join('');
}

// ══════════════════════════════════════
//  LENDERS
// ══════════════════════════════════════
function saveLender() {
  const name = document.getElementById('lm-name').value.trim();
  if (!name) return;
  DB.lenders.push({
    id:DB.nid.l++, name,
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
    grid.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">💰</div><h3>No lenders yet</h3><p>Add private lenders to fund your deals</p></div>';
    return;
  }
  grid.innerHTML = DB.lenders.map(l=>`
    <div class="lender-card">
      <div class="lender-name">${l.name}</div>
      <div class="lender-meta">
        ${l.rate?`<span class="lender-tag">Rate: ${l.rate}%</span>`:''}
        ${l.max?`<span class="lender-tag">Max: $${parseInt(l.max).toLocaleString()}</span>`:''}
        ${l.types?l.types.split(',').map(t=>`<span class="lender-tag">${t.trim()}</span>`).join(''):''}
      </div>
      ${l.contact?`<div style="font-size:12px;color:var(--muted)">${l.contact}</div>`:''}
    </div>`).join('');
}

// ══════════════════════════════════════
//  LISTINGS
// ══════════════════════════════════════
function saveListing() {
  const addr = document.getElementById('lim-addr').value.trim();
  if (!addr) return;
  DB.listings.push({
    id:DB.nid.li++,
    address: addr,
    price: parseFloat(document.getElementById('lim-price').value)||0,
    arv: parseFloat(document.getElementById('lim-arv').value)||0,
    rehab: parseFloat(document.getElementById('lim-rehab').value)||0,
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
    grid.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏘</div><h3>No listings</h3><p>Publish deals to your buyer network</p></div>';
    return;
  }
  const stratBadge = {wholesale:'badge-gold',fix_flip:'badge-amber',rental:'badge-blue'};
  const icons = ['🏠','🏡','🏘','🏗','🏢'];
  grid.innerHTML = DB.listings.map((l,i)=>`
    <div class="listing-card">
      <div class="listing-img">
        ${icons[i%icons.length]}
        <span class="badge ${stratBadge[l.strategy]||'badge-muted'} listing-badge">${l.strategy.replace('_',' ')}</span>
      </div>
      <div class="listing-body">
        <div class="listing-addr">${l.address}</div>
        <div class="listing-price">$${l.price.toLocaleString()}</div>
        <div class="listing-meta">
          <span>ARV $${l.arv.toLocaleString()}</span>
          <span>Rehab $${l.rehab.toLocaleString()}</span>
        </div>
        ${l.description?`<div style="font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5">${l.description}</div>`:''}
      </div>
    </div>`).join('');
}

// ══════════════════════════════════════
//  SCRIPTS
// ══════════════════════════════════════
const SCRIPTS = [
  {
    title:'Cold Call — First Contact',
    tag:'badge-amber',
    tagText:'Cold Call',
    body:`"Hi, is this <span class="script-var">[Owner Name]</span>? My name is <span class="script-var">[Your Name]</span> with Properties714. I'm a local real estate investor in the area and I came across your property at <span class="script-var">[Address]</span>. I'm not an agent — I actually buy houses directly. I wanted to reach out personally to see if you'd ever consider an offer on the property?"

<br><br><em>[If they say yes or maybe:]</em><br><br>

"Great. I'm not here to waste your time. Can I ask — what would it take for the number to make sense for you? I can make a cash offer, close fast, and handle everything. When would be a good time for me to come take a look?"`,
  },
  {
    title:'Motivated Seller — Negotiation Script',
    tag:'badge-green',
    tagText:'Negotiation',
    body:`"I appreciate you sharing that with me. Based on what you've told me and what I'm seeing in the market, I can put together a cash offer. Now I want to be upfront with you — my offer is going to be lower than what you might get listing it on the market, but what I offer instead is: <strong>speed, certainty, and zero headaches.</strong>

<br><br>No agents, no repairs, no showings, no contingencies. You pick the closing date. Most of my sellers say that peace of mind is worth more than a few extra dollars.

<br><br>Based on the condition and the comps I've pulled, I'm at around <span class="script-var">[$OFFER PRICE]</span>. Does that work for your situation?"`,
  },
  {
    title:'Handling "I need to think about it"',
    tag:'badge-blue',
    tagText:'Objection',
    body:`"Of course, I completely understand. This is a big decision and I'd never want you to feel rushed.

<br><br>Can I ask — is there anything specific holding you back? Sometimes I can help solve a problem you might not realize I can handle — like liens, back taxes, tenant issues, or repairs. I've seen it all.

<br><br>If it's just a matter of the price, I'm open to hearing what would make it work for you. And if now just isn't the right time, that's totally fine too — I'd love to stay in touch. Can I follow up with you in a couple of weeks?"`,
  },
  {
    title:'Buyer Presentation — Wholesale Deal',
    tag:'badge-gold',
    tagText:'Buyer Call',
    body:`"Hey <span class="script-var">[Buyer Name]</span>, I've got a deal I think you're going to love. It's at <span class="script-var">[Address]</span> — <span class="script-var">[beds/baths]</span>, <span class="script-var">[sqft]</span> square feet.

<br><br>ARV is around <span class="script-var">[$ARV]</span>, rehab is probably <span class="script-var">[$REHAB]</span>, and I'm looking for <span class="script-var">[$ASKING]</span>. That leaves you around <span class="script-var">[$PROFIT]</span> in profit if you flip it — or it cash flows about <span class="script-var">[$CASHFLOW]</span>/month as a rental.

<br><br>I've got a couple other buyers looking at this. Are you in a position to move on it this week?"`,
  },
  {
    title:'Private Lender Pitch',
    tag:'badge-blue',
    tagText:'Lender',
    body:`"<span class="script-var">[Name]</span>, I work with private lenders who want better returns than what they're getting in the market — typically between 8–12% secured against real estate.

<br><br>Here's how it works: You lend against the property, you're on title, and you get paid first when we close or sell. Your money is secured by hard collateral the entire time.

<br><br>I have a deal right now at <span class="script-var">[Address]</span> — I need <span class="script-var">[$AMOUNT]</span> for about <span class="script-var">[X months]</span>. I'd offer you <span class="script-var">[X%]</span>. Would you like to see the numbers?"`,
  },
];

function renderScripts() {
  document.getElementById('scripts-list').innerHTML = SCRIPTS.map(s=>`
    <div class="script-card">
      <div class="script-header">
        <div class="script-title">${s.title}</div>
        <span class="badge ${s.tag}">${s.tagText}</span>
      </div>
      <div class="script-body">${s.body}</div>
    </div>`).join('');
}

// ══════════════════════════════════════
//  DOCUMENTS
// ══════════════════════════════════════
const DOCS = [
  { icon:'📋', title:'Purchase & Sale Agreement', desc:'Wholesale contract template', tag:'badge-green', tagText:'Legal' },
  { icon:'📝', title:'Assignment Contract', desc:'Assign your contract to a buyer', tag:'badge-gold', tagText:'Wholesale' },
  { icon:'💼', title:'Credibility Kit', desc:'Present yourself to sellers & lenders', tag:'badge-blue', tagText:'Marketing' },
  { icon:'📧', title:'Lender Outreach Email', desc:'Template to contact private lenders', tag:'badge-blue', tagText:'Email' },
  { icon:'📊', title:'Deal Package Template', desc:'Send to cash buyers with full analysis', tag:'badge-amber', tagText:'Buyer' },
  { icon:'🔍', title:'Due Diligence Checklist', desc:'Everything to verify before closing', tag:'badge-muted', tagText:'Checklist' },
];

function renderDocs() {
  document.getElementById('docs-grid').innerHTML = DOCS.map(d=>`
    <div class="card" style="display:flex;gap:14px;align-items:flex-start">
      <div style="font-size:28px;line-height:1">${d.icon}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="font-size:14px;font-weight:700">${d.title}</div>
          <span class="badge ${d.tag}">${d.tagText}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px">${d.desc}</div>
        <button class="btn btn-ghost btn-sm" onclick="alert('Connect your document storage (Google Drive) to enable downloads.')">Download Template</button>
      </div>
    </div>`).join('');
}

// ══════════════════════════════════════
