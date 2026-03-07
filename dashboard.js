//  DASHBOARD & PIPELINE
// ══════════════════════════════════════
function updateStats() {
  document.getElementById('s-props').textContent = DB.properties.length;
  if (DB.analysis.length) {
    const avg = Math.round(DB.analysis.reduce((s,a)=>s+a.deal_score,0)/DB.analysis.length);
    const profit = DB.analysis.reduce((s,a)=>s+(a.estimated_profit||0),0);
    const good = DB.analysis.filter(a=>a.deal_score>=70).length;
    document.getElementById('s-score').textContent = avg;
    document.getElementById('s-profit').textContent = '$'+Math.round(profit).toLocaleString();
    document.getElementById('s-good').textContent = good;
  }
}

function renderDashboard() {
  updateStats();
  const recent = document.getElementById('db-recent');
  if (!DB.properties.length) {
    recent.innerHTML='<div class="empty" style="padding:30px"><div class="empty-icon">📋</div><h3>No deals yet</h3></div>';
    document.getElementById('db-strats').innerHTML='<div class="empty" style="padding:30px"><div class="empty-icon">📊</div><h3>No data</h3></div>';
    return;
  }
  const sorted = [...DB.properties].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5);
  recent.innerHTML = sorted.map(p=>{
    const a = DB.analysis.find(x=>x.property_id===p.id);
    const rec = a?a.recommendation:'Pending';
    const bc = rec==='GOOD DEAL'?'badge-green':rec==='MARGINAL DEAL'?'badge-amber':rec==='REJECT'?'badge-red':'badge-muted';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div><div style="font-size:13px;font-weight:600">${p.address}</div><div style="font-size:11px;color:var(--muted)">$${(p.asking_price||0).toLocaleString()} · ${p.strategy_candidate||'—'}</div></div>
      <span class="badge ${bc}">${rec}</span>
    </div>`;
  }).join('');
  const dist={fix_flip:0,rental:0,wholesale:0};
  DB.properties.forEach(p=>{if(p.strategy_candidate)dist[p.strategy_candidate]=(dist[p.strategy_candidate]||0)+1;});
  const total = DB.properties.length||1;
  document.getElementById('db-strats').innerHTML = Object.entries(dist).map(([k,v])=>`
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><span>${k.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</span><span style="font-family:'JetBrains Mono',monospace">${v}</span></div>
      <div class="score-bar"><div class="score-fill" style="width:${Math.round(v/total*100)}%;background:var(--gold)"></div></div>
    </div>`).join('');
}

function renderPipeline() {
  const stages=[{id:'new',label:'New'},{id:'analyzing',label:'Analyzing'},{id:'offer_sent',label:'Offer Sent'},{id:'under_contract',label:'Under Contract'},{id:'closed',label:'Closed'},{id:'dead',label:'Dead'}];
  document.getElementById('kanban-board').innerHTML = stages.map(st=>{
    const props = DB.properties.filter(p=>p.status===st.id);
    return `<div class="kanban-col">
      <div class="kanban-hd">${st.label}<span class="kanban-count">${props.length}</span></div>
      ${props.length ? props.map(p=>{
        const a=DB.analysis.find(x=>x.property_id===p.id);
        const score=a?a.deal_score:null;
        const sc=score>=70?'var(--green)':score>=45?'var(--amber)':'var(--red)';
        return `<div class="kanban-card">
          <div class="kc-addr">${p.address}</div>
          <div class="kc-price">$${(p.asking_price||0).toLocaleString()}</div>
          ${score!==null?`<div style="margin-top:8px"><div class="score-wrap"><div class="score-bar"><div class="score-fill" style="width:${score}%;background:${sc}"></div></div><span class="score-num">${score}</span></div></div>`:''}
        </div>`;
      }).join('') : `<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">Empty</div>`}
    </div>`;
  }).join('');
}

function renderProperties() {
  document.getElementById('props-sub').textContent = DB.properties.length+' properties';
  const tbody = document.getElementById('props-table');
  if (!DB.properties.length) {
    tbody.innerHTML='<tr><td colspan="8"><div class="empty"><div class="empty-icon">🏠</div><h3>No properties</h3><p>Analyze your first deal</p></div></td></tr>';
    return;
  }
  const sc=(s)=>s>=70?'var(--green)':s>=45?'var(--amber)':'var(--red)';
  const rb=(r)=>r==='GOOD DEAL'?'badge-green':r==='MARGINAL DEAL'?'badge-amber':'badge-red';
  tbody.innerHTML = DB.properties.map(p=>{
    const a=DB.analysis.find(x=>x.property_id===p.id);
    const score=a?a.deal_score:'—';
    const rec=a?a.recommendation:'—';
    const arv=a?'$'+a.arv.toLocaleString():'—';
    return `<tr>
      <td style="font-weight:600">${p.address}<br><span style="font-size:11px;color:var(--muted)">${p.city||''} ${p.zip||''}</span></td>
      <td style="font-family:'JetBrains Mono',monospace">$${(p.asking_price||0).toLocaleString()}</td>
      <td style="font-family:'JetBrains Mono',monospace">${arv}</td>
      <td><span class="badge badge-muted">${p.strategy_candidate||'—'}</span></td>
      <td>${a?`<div class="score-wrap"><div class="score-bar"><div class="score-fill" style="width:${score}%;background:${sc(score)}"></div></div><span class="score-num">${score}</span></div>`:'—'}</td>
      <td>${rec!=='—'?`<span class="badge ${rb(rec)}">${rec}</span>`:'—'}</td>
      <td><span class="badge badge-muted">${p.status}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="delProp(${p.id})">Remove</button></td>
    </tr>`;
  }).join('');
}

function delProp(id) {
  if(!confirm('Remove this property?'))return;
  DB.properties=DB.properties.filter(p=>p.id!==id);
  DB.analysis=DB.analysis.filter(a=>a.property_id!==id);
  renderProperties(); updateStats();
}

// ── INIT ──
renderScripts();
renderDocs();
</script>
