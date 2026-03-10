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

// ══════════════════════════════════════
//  ZILLOW MARKET SEARCH
// ══════════════════════════════════════
async function searchZillow() {
  const zip    = document.getElementById('zs-zip').value.trim();
  const city   = document.getElementById('zs-city').value.trim();
  const maxp   = document.getElementById('zs-maxprice').value;
  const count  = parseInt(document.getElementById('zs-count').value)||10;
  const btn    = document.getElementById('zs-btn');
  const status = document.getElementById('zs-status');
  const loading= document.getElementById('zs-loading');
  const results= document.getElementById('zs-results');

  if (!zip && !city) {
    status.style.display='block'; status.style.color='var(--amber)';
    status.textContent='⚠ Ingresa un ZIP code o ciudad para buscar'; return;
  }

  // Build Zillow search URL
  let searchUrl = '';
  if (zip) {
    searchUrl = `https://www.zillow.com/homes/for_sale/${zip}_rb/`;
  } else {
    const citySlug = city.toLowerCase().replace(/\s+/g,'-');
    searchUrl = `https://www.zillow.com/homes/${citySlug}-ga_rb/`;
  }

  btn.disabled = true; btn.textContent = '⏳ Buscando...';
  status.style.display='none';
  loading.style.display='block';
  results.style.display='none';

  try {
    // Route through n8n to avoid CORS (n8n calls Apify server-side)
    const res = await fetch(N8N_SEARCH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search_url: searchUrl,
        max_items:  count,
        max_price:  maxp ? parseInt(maxp) : null,
        zip, city,
        user_id: CURRENT_USER?.id || null
      })
    });

    if (!res.ok) throw new Error('n8n error ' + res.status);
    const data = await res.json();

    loading.style.display='none';
    btn.disabled=false; btn.textContent='🔍 Buscar';

    // n8n returns { listings: [...] } or raw array
    let items = Array.isArray(data) ? data : (data.listings || data.results || []);
    if (maxp) items = items.filter(p => (p.price||p.unformattedPrice||0) <= parseInt(maxp));

    if (!items.length) {
      status.style.display='block'; status.style.color='var(--amber)';
      status.textContent=`⚠ No se encontraron propiedades en ${zip||city}. Intenta con otro ZIP.`;
      return;
    }

    renderZillowResults(items, zip||city);

  } catch(e) {
    loading.style.display='none';
    btn.disabled=false; btn.textContent='🔍 Buscar';
    status.style.display='block'; status.style.color='var(--red)';
    status.textContent='❌ Error. Verifica que el workflow de n8n esté activo (gpai-search-listings).';
    console.error('Zillow search error:', e);
  }
}

function renderZillowResults(items, location) {
  const results = document.getElementById('zs-results');
  const grid    = document.getElementById('zs-grid');
  const label   = document.getElementById('zs-count-label');

  label.textContent = `${items.length} propiedades encontradas en ${location}`;
  results.style.display='block';

  grid.innerHTML = items.map(p => {
    const price    = p.price || p.listPrice || p.unformattedPrice || 0;
    const addr     = p.address?.streetAddress || p.streetAddress || p.address || 'Sin dirección';
    const cityStr  = `${p.address?.city||p.city||''}, ${p.address?.state||p.state||'GA'} ${p.address?.zipcode||p.zipcode||''}`;
    const beds     = p.bedrooms || p.beds || '?';
    const baths    = p.bathrooms || p.baths || '?';
    const sqft     = p.livingArea || p.sqft || null;
    const zest     = p.zestimate || null;
    const imgUrl   = p.imgSrc || p.photos?.[0] || null;
    const zpid     = p.zpid || '';
    const zillowUrl= zpid ? `https://www.zillow.com/homes/${zpid}_zpid/` : `https://www.zillow.com/homes/for_sale/${addr.replace(/\s/g,'-')}/`;
    const status   = p.statusType || p.homeStatus || 'FOR SALE';

    const priceStr = price ? '$' + parseInt(price).toLocaleString() : 'Precio N/D';
    const zestStr  = zest  ? `Zestimate: $${parseInt(zest).toLocaleString()}` : '';

    return `
    <div class="zl-card">
      <div class="zl-img">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${addr}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="zl-img-fallback" style="display:none">🏠</span>`
          : `<span class="zl-img-fallback">🏠</span>`
        }
        <span class="zl-status-badge">${status.replace('_',' ')}</span>
        <span class="zl-price-badge">${priceStr}</span>
      </div>
      <div class="zl-body">
        <div class="zl-addr" title="${addr}">${addr}</div>
        <div class="zl-city">${cityStr}</div>
        <div class="zl-specs">
          <span class="zl-spec">🛏 <strong>${beds}</strong> beds</span>
          <span class="zl-spec">🚿 <strong>${baths}</strong> baths</span>
          ${sqft ? `<span class="zl-spec">📐 <strong>${parseInt(sqft).toLocaleString()}</strong> sqft</span>` : ''}
        </div>
        ${zestStr ? `<div class="zl-zestimate">🔵 ${zestStr}</div>` : ''}
        <div class="zl-actions">
          <button class="zl-btn-analyze" onclick="preloadAnalyzer('${addr.replace(/'/g,"\\'")}','${cityStr.split(',')[0]}','${p.address?.zipcode||p.zipcode||''}',${price},'${zillowUrl}')">
            ⚡ Analizar Deal
          </button>
          <a class="zl-btn-zillow" href="${zillowUrl}" target="_blank">🔗</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function preloadAnalyzer(addr, city, zip, price, zillowUrl) {
  // Pre-fill the analyzer form and navigate to it
  nav('analyzer', document.querySelector('[onclick*=analyzer]'));
  setTimeout(() => {
    if (addr) document.getElementById('f-addr').value = addr;
    if (city) document.getElementById('f-city').value = city;
    if (zip)  document.getElementById('f-zip').value  = zip;
    if (price) document.getElementById('f-ask').value = price;
    if (zillowUrl) document.getElementById('f-zillow').value = zillowUrl;
    // Scroll to form
    document.getElementById('f-addr').scrollIntoView({ behavior:'smooth', block:'center' });
  }, 200);
}
