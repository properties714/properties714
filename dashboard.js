// ══════════════════════════════════════
// DASHBOARD & PIPELINE
// ══════════════════════════════════════

function updateStats(){

  if(!window.DB) return;

  const props = DB.properties || [];
  const analysis = DB.analysis || [];

  const sProps  = document.getElementById('s-props');
  const sScore  = document.getElementById('s-score');
  const sProfit = document.getElementById('s-profit');
  const sGood   = document.getElementById('s-good');

  if(sProps) sProps.textContent = props.length;

  if(analysis.length){

    const avg = Math.round(
      analysis.reduce((s,a)=>s+(a.deal_score||0),0) / analysis.length
    );

    const profit = analysis.reduce(
      (s,a)=>s+(a.estimated_profit||0),0
    );

    const good = analysis.filter(a=>a.deal_score>=70).length;

    if(sScore)  sScore.textContent  = avg;
    if(sProfit) sProfit.textContent = '$'+Math.round(profit).toLocaleString();
    if(sGood)   sGood.textContent   = good;
  }
}


function renderDashboard(){

  if(!window.DB) return;

  updateStats();

  const recent = document.getElementById('db-recent');
  const strat  = document.getElementById('db-strats');

  if(!recent || !strat) return;

  if(!DB.properties.length){

    recent.innerHTML =
      '<div class="empty" style="padding:30px"><div class="empty-icon">📋</div><h3>No deals yet</h3></div>';

    strat.innerHTML =
      '<div class="empty" style="padding:30px"><div class="empty-icon">📊</div><h3>No data</h3></div>';

    return;
  }

  const sorted = [...DB.properties]
    .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))
    .slice(0,5);

  recent.innerHTML = sorted.map(p=>{

    const a = DB.analysis.find(x=>x.property_id===p.id);

    const rec = a ? a.recommendation : 'Pending';

    const bc =
      rec==='GOOD DEAL' ? 'badge-green' :
      rec==='MARGINAL DEAL' ? 'badge-amber' :
      rec==='REJECT' ? 'badge-red' :
      'badge-muted';

    return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:13px;font-weight:600">${p.address||''}</div>
        <div style="font-size:11px;color:var(--muted)">
          $${(p.asking_price||0).toLocaleString()} · ${p.strategy_candidate||'—'}
        </div>
      </div>
      <span class="badge ${bc}">${rec}</span>
    </div>
    `;
  }).join('');

  const dist = {fix_flip:0,rental:0,wholesale:0};

  DB.properties.forEach(p=>{
    if(p.strategy_candidate){
      dist[p.strategy_candidate] =
        (dist[p.strategy_candidate]||0)+1;
    }
  });

  const total = DB.properties.length || 1;

  strat.innerHTML =
  Object.entries(dist).map(([k,v])=>`

    <div style="margin-bottom:14px">

      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span>${k.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
        <span style="font-family:'JetBrains Mono',monospace">${v}</span>
      </div>

      <div class="score-bar">
        <div class="score-fill"
        style="width:${Math.round(v/total*100)}%;background:var(--gold)">
        </div>
      </div>

    </div>
  `).join('');
}



// ══════════════════════════════════════
// PIPELINE
// ══════════════════════════════════════

function renderPipeline(){

  const board = document.getElementById('kanban-board');
  if(!board) return;

  const stages=[
    {id:'new',label:'New'},
    {id:'analyzing',label:'Analyzing'},
    {id:'offer_sent',label:'Offer Sent'},
    {id:'under_contract',label:'Under Contract'},
    {id:'closed',label:'Closed'},
    {id:'dead',label:'Dead'}
  ];

  board.innerHTML =
  stages.map(st=>{

    const props = DB.properties.filter(p=>p.status===st.id);

    return `
    <div class="kanban-col">

      <div class="kanban-hd">
        ${st.label}
        <span class="kanban-count">${props.length}</span>
      </div>

      ${
        props.length
        ? props.map(p=>{

            const a = DB.analysis.find(x=>x.property_id===p.id);
            const score = a ? a.deal_score : null;

            const sc =
              score>=70 ? 'var(--green)' :
              score>=45 ? 'var(--amber)' :
              'var(--red)';

            return `
            <div class="kanban-card">

              <div class="kc-addr">${p.address||''}</div>

              <div class="kc-price">
                $${(p.asking_price||0).toLocaleString()}
              </div>

              ${
                score!==null
                ? `
                <div style="margin-top:8px">
                  <div class="score-wrap">
                    <div class="score-bar">
                      <div class="score-fill"
                      style="width:${score}%;background:${sc}">
                      </div>
                    </div>
                    <span class="score-num">${score}</span>
                  </div>
                </div>
                `
                : ''
              }

            </div>
            `;
        }).join('')
        : `<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px">Empty</div>`
      }

    </div>
    `;

  }).join('');
}



// ══════════════════════════════════════
// PROPERTIES TABLE
// ══════════════════════════════════════

function renderProperties(){

  const sub = document.getElementById('props-sub');
  const tbody = document.getElementById('props-table');

  if(!tbody) return;

  if(sub) sub.textContent = DB.properties.length+' properties';

  if(!DB.properties.length){

    tbody.innerHTML=
    '<tr><td colspan="8"><div class="empty"><div class="empty-icon">🏠</div><h3>No properties</h3><p>Analyze your first deal</p></div></td></tr>';

    return;
  }

  const sc=(s)=>s>=70?'var(--green)':s>=45?'var(--amber)':'var(--red)';

  const rb=(r)=>r==='GOOD DEAL'?'badge-green':
                r==='MARGINAL DEAL'?'badge-amber':
                'badge-red';

  tbody.innerHTML = DB.properties.map(p=>{

    const a = DB.analysis.find(x=>x.property_id===p.id);

    const score = a ? a.deal_score : '—';
    const rec   = a ? a.recommendation : '—';
    const arv   = a ? '$'+a.arv.toLocaleString() : '—';

    return `
    <tr>

      <td style="font-weight:600">
        ${p.address}
        <br>
        <span style="font-size:11px;color:var(--muted)">
          ${p.city||''} ${p.zip||''}
        </span>
      </td>

      <td style="font-family:'JetBrains Mono',monospace">
        $${(p.asking_price||0).toLocaleString()}
      </td>

      <td style="font-family:'JetBrains Mono',monospace">
        ${arv}
      </td>

      <td>
        <span class="badge badge-muted">
          ${p.strategy_candidate||'—'}
        </span>
      </td>

      <td>
        ${
          a
          ? `
          <div class="score-wrap">
            <div class="score-bar">
              <div class="score-fill"
              style="width:${score}%;background:${sc(score)}">
              </div>
            </div>
            <span class="score-num">${score}</span>
          </div>
          `
          : '—'
        }
      </td>

      <td>
        ${
          rec!=='—'
          ? `<span class="badge ${rb(rec)}">${rec}</span>`
          : '—'
        }
      </td>

      <td>
        <span class="badge badge-muted">${p.status||''}</span>
      </td>

      <td>
        <button class="btn btn-danger btn-sm" onclick="delProp(${p.id})">
          Remove
        </button>
      </td>

    </tr>
    `;

  }).join('');
}



// ══════════════════════════════════════
// DELETE PROPERTY
// ══════════════════════════════════════

function delProp(id){

  if(!confirm('Remove this property?')) return;

  DB.properties = DB.properties.filter(p=>p.id!==id);
  DB.analysis   = DB.analysis.filter(a=>a.property_id!==id);

  renderProperties();
  updateStats();
}



// ══════════════════════════════════════
// ZILLOW MARKET SEARCH
// ══════════════════════════════════════

async function searchZillow(){

  const zip   = document.getElementById('zs-zip')?.value.trim();
  const city  = document.getElementById('zs-city')?.value.trim();
  const maxp  = document.getElementById('zs-maxprice')?.value;
  const count = parseInt(document.getElementById('zs-count')?.value)||10;

  const btn    = document.getElementById('zs-btn');
  const status = document.getElementById('zs-status');
  const loading= document.getElementById('zs-loading');

  if(!zip && !city){

    if(status){
      status.style.display='block';
      status.style.color='var(--amber)';
      status.textContent='⚠ Enter ZIP or City';
    }

    return;
  }

  if(btn){
    btn.disabled=true;
    btn.textContent='⏳ Searching...';
  }

  if(loading) loading.style.display='block';

  try{

    const res = await fetch(API_SEARCH,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        zip,
        city,
        max_price:maxp,
        max_items:count
      })
    });

    const data = await res.json();

    if(typeof renderZillowResults === 'function'){
      renderZillowResults(data.listings || data);
    }

  }catch(e){

    if(status){
      status.style.display='block';
      status.style.color='var(--red)';
      status.textContent='❌ Search error';
    }

    console.error(e);

  }finally{

    if(btn){
      btn.disabled=false;
      btn.textContent='🔍 Search';
    }

    if(loading) loading.style.display='none';
  }

}
