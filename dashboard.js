// ══════════════════════════════════════
// DASHBOARD & PIPELINE
// ══════════════════════════════════════

function updateStats() {
if (!window.DB) return;
const props    = DB.properties || [];
const analysis = DB.analysis   || [];

const sProps  = document.getElementById(‘s-props’);
const sScore  = document.getElementById(‘s-score’);
const sProfit = document.getElementById(‘s-profit’);
const sGood   = document.getElementById(‘s-good’);

if (sProps) sProps.textContent = props.length;

if (analysis.length) {
const avg    = Math.round(analysis.reduce((s, a) => s + (a.deal_score || 0), 0) / analysis.length);
const profit = analysis.reduce((s, a) => s + (a.estimated_profit || 0), 0);
const good   = analysis.filter(a => (a.deal_score || 0) >= 70).length;
if (sScore)  sScore.textContent  = avg;
if (sProfit) sProfit.textContent = ‘$’ + Math.round(profit).toLocaleString();
if (sGood)   sGood.textContent   = good;
} else {
if (sScore)  sScore.textContent  = ‘—’;
if (sProfit) sProfit.textContent = ‘$0’;
if (sGood)   sGood.textContent   = ‘0’;
}
}

function renderDashboard() {
if (!window.DB) return;
updateStats();

const page = document.getElementById(‘page-dashboard’);
if (!page) return;

// Build dashboard HTML if not yet built
if (!document.getElementById(‘db-recent’)) {
page.innerHTML = `
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
<div>
<h1 style="font-size:22px;font-weight:800" data-t="pg_dashboard_title">Investment Dashboard</h1>
<p style="color:var(--muted);font-size:13px;margin-top:4px" data-t="pg_dashboard_sub">Properties714 · Real-time overview</p>
</div>
<button class="btn btn-gold" onclick="nav('analyzer',null)">⚡ Analyze Deal</button>
</div>

```
  <!-- Stats -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px" id="stats-grid">
    <div class="card">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px" data-t="stat_properties">Properties</div>
      <div style="font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace" id="s-props">0</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px" data-t="stat_in_db">In database</div>
    </div>
    <div class="card">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px" data-t="stat_avg_score">Avg Score</div>
      <div style="font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace" id="s-score">—</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px" data-t="stat_deal_quality">Deal quality</div>
    </div>
    <div class="card">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px" data-t="stat_total_profit">Total Profit Est.</div>
      <div style="font-size:28px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--green)" id="s-profit">$0</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px" data-t="stat_all_deals">All deals</div>
    </div>
    <div class="card">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px" data-t="stat_good_deals">Good Deals</div>
      <div style="font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold)" id="s-good">0</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px" data-t="stat_score_70">Score ≥ 70</div>
    </div>
  </div>

  <!-- Recent + Strategy Mix -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;flex-wrap:wrap">
    <div class="card">
      <div style="font-size:14px;font-weight:700;margin-bottom:16px" data-t="section_recent_deals">Recent Deals</div>
      <div id="db-recent"></div>
    </div>
    <div class="card">
      <div style="font-size:14px;font-weight:700;margin-bottom:16px" data-t="section_strategy_mix">Strategy Mix</div>
      <div id="db-strats"></div>
    </div>
  </div>`;
```

}

const recent = document.getElementById(‘db-recent’);
const strat  = document.getElementById(‘db-strats’);

if (!DB.properties.length) {
if (recent) recent.innerHTML = ‘<div style="padding:30px;text-align:center;color:var(--muted)"><div style="font-size:32px;margin-bottom:8px">📋</div><p>No deals yet — analyze your first property!</p></div>’;
if (strat)  strat.innerHTML  = ‘<div style="padding:30px;text-align:center;color:var(--muted)"><div style="font-size:32px;margin-bottom:8px">📊</div><p>No data yet</p></div>’;
return;
}

const sorted = […DB.properties].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5);

if (recent) {
recent.innerHTML = sorted.map(p => {
const a   = DB.analysis.find(x => x.property_id === p.id);
const rec = a ? a.recommendation : ‘Pending’;
const bc  = rec === ‘GOOD DEAL’ ? ‘badge-green’ : rec === ‘MARGINAL DEAL’ ? ‘badge-amber’ : rec === ‘REJECT’ ? ‘badge-red’ : ‘badge-muted’;
return ` <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"> <div> <div style="font-size:13px;font-weight:600">${p.address || ''}</div> <div style="font-size:11px;color:var(--muted)">$${(p.asking_price || 0).toLocaleString()} · ${p.strategy_candidate || '—'}</div> </div> <span class="badge ${bc}">${rec}</span> </div>`;
}).join(’’);
}

if (strat) {
const dist  = {};
DB.properties.forEach(p => { if (p.strategy_candidate) dist[p.strategy_candidate] = (dist[p.strategy_candidate] || 0) + 1; });
const total = DB.properties.length || 1;
strat.innerHTML = Object.entries(dist).map(([k, v]) => ` <div style="margin-bottom:14px"> <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"> <span>${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span> <span style="font-family:'JetBrains Mono',monospace">${v}</span> </div> <div style="height:6px;background:var(--surface2);border-radius:3px"> <div style="height:6px;border-radius:3px;background:var(--gold);width:${Math.round(v / total * 100)}%"></div> </div> </div>`).join(’’);
}

// Re-apply translations if lang system active
if (typeof applyLang === ‘function’) applyLang(window.CURRENT_LANG || ‘en’);
}

// ══════════════════════════════════════
// PIPELINE
// ══════════════════════════════════════

function renderPipeline() {
const page = document.getElementById(‘page-pipeline’);
if (!page) return;

if (!document.getElementById(‘kanban-board’)) {
page.innerHTML = ` <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"> <div> <h1 style="font-size:22px;font-weight:800" data-t="pg_pipeline_title">Deal Pipeline</h1> <p style="color:var(--muted);font-size:13px;margin-top:4px" data-t="pg_pipeline_sub">Track every property through your process</p> </div> <button class="btn btn-gold" onclick="nav('analyzer',null)">⚡ Analyze Deal</button> </div> <div id="kanban-board" style="display:flex;gap:16px;overflow-x:auto;padding-bottom:16px"></div> <style> .kanban-col { min-width:200px;flex-shrink:0 } .kanban-hd { font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px;display:flex;justify-content:space-between;align-items:center } .kanban-count { background:var(--surface2);border-radius:20px;padding:2px 8px;font-size:11px } .kanban-card { background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px } .kc-addr { font-size:13px;font-weight:600;margin-bottom:4px } .kc-price { font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace } .score-wrap { display:flex;align-items:center;gap:8px } .score-bar { flex:1;height:5px;background:var(--surface2);border-radius:3px;overflow:hidden } .score-fill { height:5px;border-radius:3px;transition:width .3s } .score-num { font-size:11px;font-family:'JetBrains Mono',monospace;min-width:24px;text-align:right } </style>`;
}

const board  = document.getElementById(‘kanban-board’);
if (!board) return;

const stages = [
{ id: ‘new’, label: ‘New’ }, { id: ‘analyzing’, label: ‘Analyzing’ },
{ id: ‘offer_sent’, label: ‘Offer Sent’ }, { id: ‘under_contract’, label: ‘Under Contract’ },
{ id: ‘closed’, label: ‘Closed’ }, { id: ‘dead’, label: ‘Dead’ }
];

board.innerHTML = stages.map(st => {
const props = DB.properties.filter(p => p.status === st.id);
return `<div class="kanban-col"> <div class="kanban-hd">${st.label}<span class="kanban-count">${props.length}</span></div> ${props.length ? props.map(p => { const a     = DB.analysis.find(x => x.property_id === p.id); const score = a ? a.deal_score : null; const sc    = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)'; return`
<div class="kanban-card">
<div class="kc-addr">${p.address || ‘’}</div>
<div class="kc-price">$${(p.asking_price || 0).toLocaleString()}</div>
${score !== null ? `<div style="margin-top:8px"><div class="score-wrap"><div class="score-bar"><div class="score-fill" style="width:${score}%;background:${sc}"></div></div><span class="score-num">${score}</span></div></div>` : ‘’}
</div>`; }).join('') : `<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">Empty</div>`} </div>`;
}).join(’’);
}

// ══════════════════════════════════════
// PROPERTIES TABLE
// ══════════════════════════════════════

function renderProperties() {
const page = document.getElementById(‘page-properties’);
if (!page) return;

if (!document.getElementById(‘props-table’)) {
page.innerHTML = ` <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"> <div> <h1 style="font-size:22px;font-weight:800">Properties</h1> <p id="props-sub" style="color:var(--muted);font-size:13px;margin-top:4px">0 properties</p> </div> <button class="btn btn-gold" onclick="nav('analyzer',null)">⚡ Analyze Deal</button> </div> <div class="card" style="overflow-x:auto"> <table style="width:100%;border-collapse:collapse;font-size:13px"> <thead> <tr style="border-bottom:1px solid var(--border)"> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">ADDRESS</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">PRICE</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">ARV</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">STRATEGY</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">SCORE</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">REC.</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600">STATUS</th> <th style="text-align:left;padding:10px 12px;font-size:11px;color:var(--muted);font-weight:600"></th> </tr> </thead> <tbody id="props-table"></tbody> </table> </div>`;
}

const sub   = document.getElementById(‘props-sub’);
const tbody = document.getElementById(‘props-table’);
if (!tbody) return;
if (sub) sub.textContent = DB.properties.length + ’ properties’;

if (!DB.properties.length) {
tbody.innerHTML = ‘<tr><td colspan="8" style="padding:40px;text-align:center;color:var(--muted)">No properties yet. Analyze your first deal!</td></tr>’;
return;
}

const sc = s => s >= 70 ? ‘var(–green)’ : s >= 45 ? ‘var(–amber)’ : ‘var(–red)’;
const rb = r => r === ‘GOOD DEAL’ ? ‘badge-green’ : r === ‘MARGINAL DEAL’ ? ‘badge-amber’ : ‘badge-red’;

tbody.innerHTML = DB.properties.map(p => {
const a     = DB.analysis.find(x => x.property_id === p.id);
const score = a ? a.deal_score : null;
const rec   = a ? a.recommendation : ‘—’;
const arv   = a ? ‘$’ + (a.arv || 0).toLocaleString() : ‘—’;
return `<tr style="border-bottom:1px solid var(--border)"> <td style="padding:10px 12px;font-weight:600">${p.address || ''}<br><span style="font-size:11px;color:var(--muted);font-weight:400">${p.city || ''} ${p.zip || ''}</span></td> <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace">$${(p.asking_price || 0).toLocaleString()}</td> <td style="padding:10px 12px;font-family:'JetBrains Mono',monospace">${arv}</td> <td style="padding:10px 12px"><span class="badge badge-muted">${(p.strategy_candidate || '—').replace(/_/g, ' ')}</span></td> <td style="padding:10px 12px">${score !== null ?`<div style="display:flex;align-items:center;gap:6px"><div style="width:60px;height:5px;background:var(--surface2);border-radius:3px"><div style="height:5px;border-radius:3px;background:${sc(score)};width:${score}%"></div></div><span style="font-size:12px;font-family:'JetBrains Mono',monospace">${score}</span></div>`: '—'}</td> <td style="padding:10px 12px">${rec !== '—' ?`<span class="badge ${rb(rec)}">${rec}</span>` : '—'}</td> <td style="padding:10px 12px"><span class="badge badge-muted">${p.status || ''}</span></td> <td style="padding:10px 12px"><button style="background:rgba(255,92,92,0.12);border:1px solid rgba(255,92,92,0.35);color:#ff5c5c;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700" onclick="delProp('${p.id}')">Remove</button></td> </tr>`;
}).join(’’);
}

function delProp(id) {
if (!confirm(‘Remove this property?’)) return;
DB.properties = DB.properties.filter(p => String(p.id) !== String(id));
DB.analysis   = DB.analysis.filter(a => String(a.property_id) !== String(id));
renderProperties();
updateStats();
}

// ══════════════════════════════════════
// ZILLOW MARKET SEARCH
// ══════════════════════════════════════

async function searchZillow() {
const zip    = document.getElementById(‘zs-zip’)?.value.trim();
const city   = document.getElementById(‘zs-city’)?.value.trim();
const maxp   = document.getElementById(‘zs-maxprice’)?.value;
const count  = parseInt(document.getElementById(‘zs-count’)?.value) || 10;
const btn    = document.getElementById(‘zs-btn’);
const status = document.getElementById(‘zs-status’);
const loading = document.getElementById(‘zs-loading’);

if (!zip && !city) {
if (status) { status.style.display = ‘block’; status.style.color = ‘var(–amber)’; status.textContent = ‘⚠ Enter ZIP or City’; }
return;
}

if (btn) { btn.disabled = true; btn.textContent = ‘⏳ Searching…’; }
if (loading) loading.style.display = ‘block’;

try {
const res = await fetch(API.searchListings, {
method: ‘POST’, headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({ zip, city, max_price: maxp, max_items: count })
});
const data = await res.json();
if (typeof renderZillowResults === ‘function’) renderZillowResults(data.listings || data);
} catch (e) {
if (status) { status.style.display = ‘block’; status.style.color = ‘var(–red)’; status.textContent = ‘❌ Search unavailable — Edge Function not deployed’; }
console.error(e);
} finally {
if (btn) { btn.disabled = false; btn.textContent = ‘🔍 Search’; }
if (loading) loading.style.display = ‘none’;
}
}
