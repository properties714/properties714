// ══════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════

function nav(id, el) {

document.querySelectorAll(’.page’).forEach(p => p.classList.remove(‘active’));
document.querySelectorAll(’.nav-item’).forEach(n => n.classList.remove(‘active’));

const page = document.getElementById(‘page-’ + id);
if (page) page.classList.add(‘active’);
if (el)   el.classList.add(‘active’);

// Init page modules safely
const safe = (fn) => { try { if (typeof fn === ‘function’) fn(); } catch(e) { console.warn(‘Nav init error:’, e); } };

if (id === ‘dashboard’)  safe(renderDashboard);
if (id === ‘pipeline’)   safe(renderPipeline);
if (id === ‘properties’) safe(renderProperties);
if (id === ‘crm’)        safe(() => renderCRM(‘all’));
if (id === ‘lenders’)    safe(renderLenders);
if (id === ‘listings’)   safe(renderListings);
if (id === ‘scripts’)    safe(renderScripts);
if (id === ‘docs’)       safe(renderDocs);
if (id === ‘repairs’)    safe(initRepairs);
if (id === ‘analyzer’)   safe(initAnalyzer);
if (id === ‘settings’)   safe(renderSettings);
if (id === ‘admin’)      safe(loadAdminUsers);
}

// ══════════════════════════════════════
//  MODALS
// ══════════════════════════════════════

function openContactModal() {
const m = document.getElementById(‘modal-contact’);
if (m) m.classList.add(‘open’);
}

function openLenderModal() {
const m = document.getElementById(‘modal-lender’);
if (m) m.classList.add(‘open’);
}

function openListingModal() {
const m = document.getElementById(‘modal-listing’);
if (m) m.classList.add(‘open’);
}

function closeModal(id) {
const modal = document.getElementById(id);
if (modal) modal.classList.remove(‘open’);
}

// ══════════════════════════════════════
//  SETTINGS PAGE
// ══════════════════════════════════════

function renderSettings() {
const page = document.getElementById(‘page-settings’);
if (!page) return;
const p = CURRENT_PROFILE || {};
const u = CURRENT_USER || {};
page.innerHTML = ` <div style="max-width:600px"> <h1 style="font-size:22px;font-weight:800;margin-bottom:6px">Account Settings</h1> <p style="color:var(--muted);font-size:13px;margin-bottom:28px">Manage your Properties714 account</p> <div class="card" style="margin-bottom:16px"> <div style="font-size:13px;font-weight:700;margin-bottom:16px">👤 Profile</div> <div style="display:grid;gap:10px;font-size:13px"> <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted)">Email</span><span>${u.email || '—'}</span></div> <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted)">Name</span><span>${p.full_name || '—'}</span></div> <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted)">Role</span><span class="badge badge-gold">${p.role || 'investor'}</span></div> <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted)">Status</span><span class="badge badge-green">${p.approval_status || '—'}</span></div> <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="color:var(--muted)">Subscription</span><span class="badge badge-green">${p.subscription_status || '—'}</span></div> </div> </div> <div class="card"> <div style="font-size:13px;font-weight:700;margin-bottom:16px">🔐 Security</div> <button class="btn btn-gold" onclick="sendPasswordReset()">Send Password Reset Email</button> </div> </div>`;
}

async function sendPasswordReset() {
if (!CURRENT_USER?.email) return;
const { error } = await SB.auth.resetPasswordForEmail(CURRENT_USER.email, { redirectTo: window.location.origin + window.location.pathname });
if (error) alert(’Error: ’ + error.message);
else alert(’✓ Password reset email sent to ’ + CURRENT_USER.email);
}

// ══════════════════════════════════════
//  ANALYZER INIT
// ══════════════════════════════════════

function initAnalyzer() {
const page = document.getElementById(‘page-analyzer’);
if (!page || page.innerHTML.trim()) return; // already rendered

page.innerHTML = `
<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">

```
  <!-- LEFT: Form -->
  <div style="flex:1;min-width:320px;max-width:480px">
    <h1 style="font-size:22px;font-weight:800;margin-bottom:6px" data-t="pg_analyzer_title">Deal Analyzer</h1>
    <p style="color:var(--muted);font-size:13px;margin-bottom:24px" data-t="pg_analyzer_sub">Calculates all 7 exit strategies locally</p>

    <!-- Address -->
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px">Property Info</div>
      <div style="display:grid;gap:10px">
        <div>
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Address *</label>
          <input id="f-addr" class="form-input" placeholder="123 Main St NE, Atlanta">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">City</label>
            <input id="f-city" class="form-input" placeholder="Atlanta">
          </div>
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">ZIP</label>
            <input id="f-zip" class="form-input" placeholder="30309">
          </div>
        </div>
      </div>
    </div>

    <!-- Zillow -->
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px">Zillow Link <span style="font-size:10px;color:var(--muted);font-weight:400">(optional)</span></div>
      <div style="display:flex;gap:8px">
        <input id="f-zillow" class="form-input" placeholder="https://zillow.com/homedetails/...">
        <button class="btn btn-gold" onclick="parseZillowUrl()" style="white-space:nowrap;padding:10px 14px;font-size:12px">→ Load</button>
      </div>
      <div id="zillow-status" style="display:none;font-size:12px;margin-top:8px"></div>
    </div>

    <!-- Numbers -->
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px">Financial Details</div>
      <div style="display:grid;gap:10px">
        <div>
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Asking Price ($)</label>
          <input id="f-ask" class="form-input" type="number" placeholder="150000">
        </div>
        <div>
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Rehab Estimate ($)</label>
          <input id="f-rehab" class="form-input" type="number" placeholder="35000">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Closing Costs ($)</label>
            <input id="f-close" class="form-input" type="number" placeholder="8000" value="8000">
          </div>
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Holding Costs ($)</label>
            <input id="f-hold" class="form-input" type="number" placeholder="6000" value="6000">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Agent Fee (%)</label>
            <input id="f-agent" class="form-input" type="number" placeholder="3" value="3">
          </div>
          <div>
            <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Est. Monthly Rent ($)</label>
            <input id="f-rent" class="form-input" type="number" placeholder="1400">
          </div>
        </div>
      </div>
    </div>

    <!-- Comps -->
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Comparables <span style="font-size:10px;font-weight:400">(for ARV)</span></div>
        <button class="btn btn-gold" onclick="addComp()" style="padding:5px 12px;font-size:11px">+ Add Comp</button>
      </div>
      <div id="comp-rows" style="min-height:10px"></div>
      <div style="font-size:11px;color:var(--muted);margin-top:8px">No comps? ARV estimated at 1.45x purchase price.</div>
    </div>

    <!-- Exit Strategies -->
    <div class="card" style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px">Exit Strategies</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          {id:'fix_flip', icon:'🔨', label:'Fix & Flip', desc:'Buy, renovate, sell'},
          {id:'wholesale', icon:'⚡', label:'Wholesale', desc:'Assign the contract'},
          {id:'rental', icon:'🏘', label:'Rental', desc:'Monthly cashflow'},
          {id:'brrrr', icon:'🔄', label:'BRRRR', desc:'Refinance & repeat'},
          {id:'airbnb', icon:'🏖', label:'Airbnb / STR', desc:'Short-term rental'},
          {id:'subject_to', icon:'📋', label:'Subject-To', desc:'Take over mortgage'},
          {id:'seller_finance', icon:'🤝', label:'Seller Finance', desc:'Seller finances deal'}
        ].map(e => `
          <div id="exit-${e.id}" class="exit-card${['fix_flip','wholesale','rental'].includes(e.id)?' selected':''}" onclick="toggleExit('${e.id}')" style="padding:10px;border-radius:10px;cursor:pointer;border:1px solid ${['fix_flip','wholesale','rental'].includes(e.id)?'rgba(245,200,66,0.5)':'var(--border)'};background:${['fix_flip','wholesale','rental'].includes(e.id)?'rgba(245,200,66,0.08)':'transparent'}">
            <div style="font-size:16px">${e.icon}</div>
            <div style="font-size:12px;font-weight:700;margin-top:4px">${e.label}</div>
            <div style="font-size:10px;color:var(--muted)">${e.desc}</div>
          </div>`).join('')}
      </div>
      <div id="exit-warning" style="display:none;font-size:12px;color:var(--amber);margin-top:8px">⚠ Select at least one strategy.</div>
    </div>

    <!-- Analyze Button -->
    <button class="btn btn-gold" onclick="analyzeDeal()" style="width:100%;justify-content:center;padding:14px;font-size:15px">
      ⚡ Analyze Deal
    </button>
  </div>

  <!-- RIGHT: Results -->
  <div style="flex:1;min-width:300px;position:sticky;top:80px">
    <div id="result-placeholder" style="text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:16px">📊</div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:8px">Ready to analyze</h3>
      <p style="font-size:13px">Fill in the form and click Analyze Deal</p>
    </div>
    <div id="result-loading" style="display:none;text-align:center;padding:60px 20px;flex-direction:column;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <div style="font-size:13px;color:var(--muted)">Calculating strategies…</div>
    </div>
    <div id="result-output" style="display:none"></div>
  </div>
</div>

<style>
  @keyframes spin { to { transform: rotate(360deg); } }
  .exit-card.selected { border-color: rgba(245,200,66,0.5) !important; background: rgba(245,200,66,0.08) !important; }
  .strat-tabs { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px }
  .strat-tab { padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif }
  .strat-tab.active { background:var(--gold-dim);border-color:var(--gold);color:var(--text) }
  .strat-panel { display:none }
  .strat-panel.active { display:block }
  .exit-result-card { padding:16px;border:1px solid var(--border);border-radius:12px;margin-bottom:12px }
  .exit-result-title { display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-size:15px;font-weight:700 }
  .verdict-bar { display:inline-flex;align-items:center;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px }
  .verdict-bar.good { background:rgba(34,232,136,0.15);color:#22e888;border:1px solid rgba(34,232,136,0.3) }
  .verdict-bar.marginal { background:rgba(255,170,51,0.15);color:#ffaa33;border:1px solid rgba(255,170,51,0.3) }
  .verdict-bar.bad { background:rgba(255,92,92,0.15);color:#ff5c5c;border:1px solid rgba(255,92,92,0.3) }
  .deal-result { background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:20px }
  .deal-rec { font-size:20px;font-weight:800 }
  .deal-score-big { font-size:36px;font-weight:900;font-family:'JetBrains Mono',monospace }
  .deal-metrics { display:grid;grid-template-columns:repeat(2,1fr);gap:10px }
  .deal-metric { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px }
  .dm-label { font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px }
  .dm-val { font-size:15px;font-weight:700;font-family:'JetBrains Mono',monospace }
  .deal-ai { background:rgba(91,141,238,0.08);border:1px solid rgba(91,141,238,0.2);border-radius:10px;padding:12px;font-size:12px;color:var(--muted);line-height:1.6 }
</style>`;
```

}

// ══════════════════════════════════════
//  INITIAL PAGE LOAD
// ══════════════════════════════════════

document.addEventListener(‘DOMContentLoaded’, () => {
// Dashboard loads after login via enterApp()
});
