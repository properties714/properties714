//  COMPARABLES
// ══════════════════════════════════════
let compN = 0;
function addComp(addr='', price=0, sqft=0, beds=0) {
  compN++;
  const d = document.createElement('div');
  d.id = 'cr-'+compN;
  d.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:center;margin-bottom:8px';
  d.innerHTML = `
    <input class="form-input" placeholder="Dirección comp" value="${addr}" style="font-size:12px;padding:8px 10px">
    <input class="form-input" type="number" placeholder="Vendido $" value="${price||''}" style="font-size:12px;padding:8px 10px">
    <input class="form-input" type="number" placeholder="SqFt" value="${sqft||''}" style="font-size:12px;padding:8px 10px">
    <input class="form-input" type="number" placeholder="Cuartos" value="${beds||''}" style="font-size:12px;padding:8px 10px">
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px">×</button>`;
  document.getElementById('comp-rows').appendChild(d);
}
function getComps() {
  return [...document.querySelectorAll('#comp-rows > div')].map(r => {
    const ins = r.querySelectorAll('input');
    return { address: ins[0].value, sold_price: parseFloat(ins[1].value)||0, sqft: parseInt(ins[2].value)||0, beds: parseInt(ins[3].value)||0 };
  }).filter(c => c.sold_price > 0);
}

// ── Exit Strategy Toggle ──
const SELECTED_EXITS = new Set(['fix_flip','wholesale','rental']);
function toggleExit(id) {
  const card = document.getElementById('exit-'+id);
  if (SELECTED_EXITS.has(id)) {
    if (SELECTED_EXITS.size <= 1) return; // keep at least 1
    SELECTED_EXITS.delete(id);
    card.classList.remove('selected');
  } else {
    SELECTED_EXITS.add(id);
    card.classList.add('selected');
  }
  document.getElementById('exit-warning').style.display = SELECTED_EXITS.size === 0 ? 'block' : 'none';
}

// ── Zillow URL Parser ──
function parseZillowUrl() {
  const url = document.getElementById('f-zillow').value.trim();
  const status = document.getElementById('zillow-status');
  if (!url) return;
  if (!url.includes('zillow.com')) {
    status.style.display='block'; status.style.color='var(--amber)';
    status.textContent='⚠ Pega un link de Zillow (zillow.com/homedetails/...)'; return;
  }
  // Extract address from Zillow URL
  // Format: zillow.com/homedetails/123-Main-St-Atlanta-GA-30309/12345_zpid/
  const match = url.match(/homedetails\/([^/]+)\//) || url.match(/homes\/([^/]+)\//);
  if (match) {
    const parts = match[1].replace(/-/g,' ').split(/\s+/);
    // Find where state starts (2-letter caps)
    const stateIdx = parts.findIndex(p => /^[A-Z]{2}$/.test(p));
    let addr = '', city = '', zip = '';
    if (stateIdx >= 2) {
      // Last part before state is city, before that is street
      zip = parts[stateIdx+1]||'';
      city = parts[stateIdx-1]||'';
      addr = parts.slice(0, stateIdx-1).join(' ');
    } else {
      addr = parts.slice(0, Math.ceil(parts.length/2)).join(' ');
      city = parts.slice(Math.ceil(parts.length/2)).join(' ');
    }
    if (addr) {
      document.getElementById('f-addr').value = addr;
      if (city) document.getElementById('f-city').value = city;
      if (zip && /^\d{5}$/.test(zip)) document.getElementById('f-zip').value = zip;
      status.style.display='block'; status.style.color='var(--green)';
      status.textContent='✓ Dirección extraída — el precio se cargará al analizar via Zillow';
      // Show zillow badge on asking price
      const badge = document.getElementById('ask-zillow-badge');
      if (badge) badge.style.display='inline';
    }
  } else {
    status.style.display='block'; status.style.color='var(--muted)';
    status.textContent='Link válido. Agrega comps manualmente o escribe la dirección.';
  }
}

// ══════════════════════════════════════
//  LOCAL CALC — 7 EXIT STRATEGIES
// ══════════════════════════════════════
function localCalc(purchase, rehab, closing, holding, agentInput, rent, comps, exits) {
  const selectedExits = exits || ['fix_flip','wholesale','rental'];

  // ── ARV ──
  const arv = comps.length
    ? Math.round(comps.reduce((s,c)=>s+c.sold_price,0)/comps.length)
    : Math.round(purchase * 1.45);

  // ── Agent fees: if <20 treat as %, else as $ ──
  const agent = agentInput < 20 ? Math.round(arv * (agentInput/100)) : agentInput;

  // ── Base numbers ──
  const totalCosts    = closing + holding + agent;
  const totalInvest   = purchase + rehab + totalCosts;
  const equity        = arv - totalInvest;

  // ── Monthly rent ──
  const monthlyRent   = rent || Math.round(arv * 0.008);

  // ── 1. FIX & FLIP ──
  const ffProfit = arv - totalInvest;
  const ffROI    = totalInvest > 0 ? (ffProfit / totalInvest) * 100 : 0;
  const ffARV70  = arv * 0.70;

  // ── 2. WHOLESALE ──
  const mao            = (arv * 0.70) - rehab;
  const assignmentFee  = Math.max(5000, Math.round((mao - purchase) * 0.3));
  const wsNetToSeller  = mao - assignmentFee;

  // ── 3. RENTAL (Long-term) ──
  const propTax   = Math.round((purchase * 0.012) / 12);
  const insurance = 120;
  const vacancy   = Math.round(monthlyRent * 0.05);
  const mgmt      = Math.round(monthlyRent * 0.08);
  const maint     = Math.round(monthlyRent * 0.10);
  const mortgageEst = Math.round((purchase * 0.80 * 0.007));  // ~7% 30yr est
  const opExp     = propTax + insurance + vacancy + mgmt + maint;
  const cashflow  = monthlyRent - opExp - mortgageEst;
  const capRate   = purchase > 0 ? ((monthlyRent - opExp) * 12 / purchase) * 100 : 0;
  const downpay   = purchase * 0.20 + closing;
  const cocReturn = downpay > 0 ? ((cashflow * 12) / downpay) * 100 : 0;
  const grossYield= purchase > 0 ? (monthlyRent * 12 / purchase) * 100 : 0;
  const noi       = (monthlyRent - opExp) * 12;

  // ── 4. BRRRR ──
  const brrrrRefinance   = Math.round(arv * 0.75);        // 75% LTV refi
  const brrrrCashOut     = brrrrRefinance - purchase;
  const brrrrNewMortgage = Math.round(brrrrRefinance * 0.007);
  const brrrrCashflow    = monthlyRent - opExp - brrrrNewMortgage;
  const brrrrCashLeft    = Math.max(0, totalInvest - brrrrRefinance);
  const brrrrEquity      = arv - brrrrRefinance;

  // ── 5. AIRBNB (Short-term rental) ──
  const airbnbNightly    = Math.round(monthlyRent / 15);   // est. nightly rate
  const airbnbOccupancy  = 0.68;                           // 68% occupancy GA avg
  const airbnbGross      = Math.round(airbnbNightly * 30 * airbnbOccupancy);
  const airbnbPlatformFee= Math.round(airbnbGross * 0.03);
  const airbnbCleaning   = Math.round(airbnbGross * 0.12);
  const airbnbSupplies   = 200;
  const airbnbMgmt       = Math.round(airbnbGross * 0.20); // mgmt co
  const airbnbExpenses   = propTax + insurance + airbnbPlatformFee + airbnbCleaning + airbnbSupplies;
  const airbnbCashflow   = airbnbGross - airbnbExpenses - mortgageEst;
  const airbnbCoC        = downpay > 0 ? ((airbnbCashflow * 12) / downpay) * 100 : 0;
  const airbnbMultiplier = monthlyRent > 0 ? (airbnbGross / monthlyRent).toFixed(1) : '—';

  // ── 6. SUBJECT-TO ──
  const subtoAssumedLoan = Math.round(purchase * 0.85);    // est remaining balance
  const subtoEquity      = arv - subtoAssumedLoan;
  const subtoCashAtClose = purchase - subtoAssumedLoan;    // cash needed
  const subtoExistRate   = 3.5;                            // est existing rate
  const subtoMortgage    = Math.round(subtoAssumedLoan * (subtoExistRate/100/12) /
    (1 - Math.pow(1 + subtoExistRate/100/12, -360)));
  const subtoCashflow    = monthlyRent - opExp - subtoMortgage;

  // ── 7. SELLER FINANCE ──
  const sfDownpay     = Math.round(purchase * 0.10);       // 10% down
  const sfLoanAmt     = purchase - sfDownpay;
  const sfRate        = 0.08;                              // 8% seller finance
  const sfPayment     = Math.round(sfLoanAmt * (sfRate/12) /
    (1 - Math.pow(1 + sfRate/12, -360)));
  const sfCashflow    = monthlyRent - opExp - sfPayment;
  const sfSpread      = sfPayment - Math.round(sfLoanAmt * 0.004); // vs market
  const sfCoC         = sfDownpay > 0 ? ((sfCashflow * 12) / sfDownpay) * 100 : 0;

  // ── Deal Score ──
  let score = 50;
  if (ffProfit > 50000) score += 20; else if (ffProfit > 25000) score += 10; else if (ffProfit < 0) score -= 25;
  if (ffROI > 25) score += 15; else if (ffROI > 15) score += 8; else if (ffROI < 5) score -= 20;
  if (capRate > 8) score += 10; else if (capRate > 5) score += 5;
  if (cashflow > 500) score += 8; else if (cashflow < 0) score -= 10;
  if (comps.length >= 3) score += 5;
  if (arv > 0 && (rehab / arv) > 0.50) score -= 15;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let rec = 'REJECT';
  if (score >= 70 && ffProfit > 25000) rec = 'GOOD DEAL';
  else if (score >= 45) rec = 'MARGINAL DEAL';

  // Best strategy suggestion
  let best = 'fix_flip';
  const scores7 = { fix_flip: ffROI, rental: capRate*2, brrrr: capRate*2.5, airbnb: airbnbCoC, wholesale: assignmentFee/1000, subject_to: subtoCashflow/100, seller_finance: sfCoC };
  best = Object.entries(scores7).filter(([k])=>selectedExits.includes(k)).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'fix_flip';

  const aiHints = [];
  if (ffProfit < 0) aiHints.push('Precio de compra muy alto para flip');
  if (capRate > 8) aiHints.push('Excelente cap rate para renta');
  if (brrrrCashOut > 20000) aiHints.push(`BRRRR permite recuperar $${brrrrCashOut.toLocaleString()} al refinanciar`);
  if (airbnbGross > monthlyRent * 1.5) aiHints.push(`Airbnb generaría ${airbnbMultiplier}x más que renta tradicional`);
  if (assignmentFee > 15000) aiHints.push(`Wholesale con fee de $${assignmentFee.toLocaleString()} sin necesidad de rehab`);
  if (subtoCashflow > 300) aiHints.push('Subject-To viable: mantiene tasa existente');

  return {
    status: 'local', property_id: Date.now(),
    analysis: { arv, purchase_price:purchase, rehab_cost:rehab, total_investment:totalInvest,
      estimated_profit:ffProfit, roi:ffROI, deal_score:score, recommendation:rec, best_strategy:best },
    strategies: {
      fix_flip:      { profit:Math.round(ffProfit), roi:parseFloat(ffROI.toFixed(1)), arv, total_invest:totalInvest, arv_70pct:Math.round(ffARV70) },
      wholesale:     { mao:Math.round(mao), assignment_fee:Math.round(assignmentFee), net_to_seller:Math.round(wsNetToSeller) },
      rental:        { monthly_rent:Math.round(monthlyRent), monthly_cashflow:Math.round(cashflow), cap_rate:parseFloat(capRate.toFixed(1)), cash_on_cash:parseFloat(cocReturn.toFixed(1)), gross_yield:parseFloat(grossYield.toFixed(1)), noi:Math.round(noi), expenses:Math.round(opExp) },
      brrrr:         { refinance_amount:brrrrRefinance, cash_out:Math.round(brrrrCashOut), new_mortgage:brrrrNewMortgage, cashflow:Math.round(brrrrCashflow), equity_remaining:Math.round(brrrrEquity), cash_left_in:Math.round(brrrrCashLeft) },
      airbnb:        { nightly_rate:airbnbNightly, occupancy_pct:Math.round(airbnbOccupancy*100), gross_monthly:airbnbGross, cashflow:Math.round(airbnbCashflow), coc:parseFloat(airbnbCoC.toFixed(1)), vs_rental_mult:airbnbMultiplier },
      subject_to:    { assumed_loan:subtoAssumedLoan, cash_at_close:Math.round(subtoCashAtClose), est_rate:subtoExistRate, monthly_cashflow:Math.round(subtoCashflow), equity:Math.round(subtoEquity) },
      seller_finance:{ down_payment:sfDownpay, loan_amount:sfLoanAmt, rate_pct:sfRate*100, monthly_payment:sfPayment, cashflow:Math.round(sfCashflow), coc:parseFloat(sfCoC.toFixed(1)) }
    },
    ai_advisor: aiHints.length ? aiHints.join(' · ') : 'Análisis local completo. Activa n8n para análisis IA con datos de mercado reales.',
    comps_used: comps.length
  };
}

// ══════════════════════════════════════
//  DEAL ANALYZER
// ══════════════════════════════════════
async function analyzeDeal() {
  const addr = document.getElementById('f-addr').value.trim();
  if (!addr) { alert('Enter a property address'); return; }
  const purchase = parseFloat(document.getElementById('f-ask').value)||0;
  const rehab = parseFloat(document.getElementById('f-rehab').value)||0;
  const closing = parseFloat(document.getElementById('f-close').value)||8000;
  const holding = parseFloat(document.getElementById('f-hold').value)||6000;
  const agentRaw = parseFloat(document.getElementById('f-agent').value)||3.0;
  const rent = parseFloat(document.getElementById('f-rent').value)||0;
  const agent = agentRaw < 20 ? Math.round((purchase||200000) * (agentRaw/100)) : agentRaw;
  const city = document.getElementById('f-city').value.trim();
  const zip = document.getElementById('f-zip').value.trim();
  const comps = getComps();

  document.getElementById('result-placeholder').style.display='none';
  document.getElementById('result-loading').style.display='flex';
  document.getElementById('result-output').style.display='none';

  let result;
  try {
    const res = await fetch(N8N_ANALYZE, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ address:addr, city, state:'GA', zip, asking_price:purchase, estimated_rehab:rehab, closing_costs:closing, holding_cost:holding, agent_fees:agent, estimated_rent:rent, comparables:comps, exit_strategies:[...SELECTED_EXITS], zillow_url: document.getElementById('f-zillow').value.trim(), user_id: CURRENT_USER?.id || null })
    });
    if (!res.ok) throw new Error('n8n '+res.status);
    result = await res.json();
  } catch(e) {
    result = localCalc(purchase,rehab,closing,holding,agent,rent,comps,[...SELECTED_EXITS]);
  }

  const a = result.analysis||{};
  const strats = result.strategies||{};
  const ff  = strats.fix_flip    || {};
  const ws  = strats.wholesale   || {};
  const ltr = strats.rental      || {};
  const br  = strats.brrrr       || {};
  const str = strats.airbnb      || {};
  const sub = strats.subject_to  || {};
  const sf  = strats.seller_finance || {};
  const isLocal = result.status==='local';
  const rec = a.recommendation||'REJECT';
  const score = a.deal_score||0;
  const recIcon  = rec==='GOOD DEAL'?'✅':rec==='MARGINAL DEAL'?'⚠️':'❌';
  const recColor = rec==='GOOD DEAL'?'var(--green)':rec==='MARGINAL DEAL'?'var(--amber)':'var(--red)';
  const scoreColor = score>=70?'var(--green)':score>=45?'var(--amber)':'var(--red)';
  const savedBadge = isLocal
    ? `<span class="badge badge-amber">⚠ Modo local</span>`
    : `<span class="badge badge-green">✓ Guardado en Supabase</span>`;

  // Save to Supabase
  let savedPropId = null;
  const propPayload = { address:addr, city, zip, asking_price:purchase, estimated_rehab:rehab, strategy_candidate:a.best_strategy||[...SELECTED_EXITS][0] };
  const sbProp = await sbSaveProperty(propPayload);
  if (sbProp) {
    savedPropId = sbProp.id;
    await sbSaveAnalysis({
      property_id: sbProp.id,
      arv: a.arv||0, purchase_price: purchase, rehab_cost: rehab,
      closing_costs: closing, holding_cost: holding, agent_fees: agent,
      total_investment: a.total_investment||0,
      estimated_profit: a.estimated_profit||0,
      roi: a.roi||0, deal_score: score,
      recommendation: rec, ai_advisor: result.ai_advisor||''
    });
  }

  // Save to local cache
  const pid = savedPropId || result.property_id||DB.nid.p++;
  DB.properties.push({ id:pid, address:addr, city, zip, asking_price:purchase, estimated_arv:a.arv||0, estimated_rehab:rehab, strategy_candidate:a.best_strategy||'fix_flip', status:'analyzing', created_at:new Date() });
  DB.analysis.push({ id:DB.nid.a++, property_id:pid, arv:a.arv||0, total_investment:a.total_investment||0, estimated_profit:a.estimated_profit||0, roi:a.roi||0, deal_score:score, recommendation:rec, created_at:new Date() });
  comps.forEach(c => DB.comparables.push({ id:DB.nid.c++, property_id:pid, ...c }));

  document.getElementById('result-loading').style.display='none';
  document.getElementById('result-output').style.display='block';

  // Build selected exit panels
  const exits = [...SELECTED_EXITS];
  const allCosts = closing + holding + agent;
  const totalInv = purchase + rehab + allCosts;

  // Calculations per strategy
  const calcExit = (id) => {
    const arv = a.arv || 0;
    const r = rent || Math.round(arv * 0.008);
    switch(id) {
      case 'fix_flip': {
        const profit = Math.round(ff.profit || (arv - totalInv));
        const roi = totalInv > 0 ? ((profit/totalInv)*100) : 0;
        const verdict = profit > 30000 && roi > 15 ? 'good' : profit > 10000 ? 'marginal' : 'bad';
        return { label:'Fix & Flip', icon:'🔨', verdict, rows:[
          {l:'ARV Estimado', v:'$'+arv.toLocaleString(), hi: arv > 0},
          {l:'Precio Compra', v:'$'+purchase.toLocaleString()},
          {l:'Rehabilitación', v:'$'+rehab.toLocaleString()},
          {l:'Costos adicionales', v:'$'+allCosts.toLocaleString()},
          {l:'Inversión Total', v:'$'+totalInv.toLocaleString()},
          {l:'GANANCIA EST.', v:'$'+profit.toLocaleString(), big:true, color: profit>0?'var(--green)':'var(--red)'},
          {l:'ROI', v:parseFloat(roi).toFixed(1)+'%', big:true, color: roi>15?'var(--green)':'var(--amber)'},
        ], verdictText: profit>30000?'✅ Buen Flip': profit>10000?'⚠ Marginal':'❌ No recomendado'};
      }
      case 'wholesale': {
        const mao = Math.round(ws.mao || ((arv*0.70)-rehab));
        const fee = Math.round(ws.assignment_fee || Math.max(0, mao*0.07));
        const spread = purchase > 0 ? mao - purchase : 0;
        const verdict = fee > 10000 ? 'good' : fee > 3000 ? 'marginal' : 'bad';
        return { label:'Wholesale', icon:'⚡', verdict, rows:[
          {l:'ARV Estimado', v:'$'+arv.toLocaleString()},
          {l:'Precio Pedido', v:'$'+purchase.toLocaleString()},
          {l:'MAO (70% ARV - Rehab)', v:'$'+mao.toLocaleString()},
          {l:'Diferencia (spread)', v:'$'+spread.toLocaleString(), color: spread>0?'var(--green)':'var(--red)'},
          {l:'ASSIGNMENT FEE EST.', v:'$'+fee.toLocaleString(), big:true, color: fee>0?'var(--green)':'var(--red)'},
          {l:'Tiempo estimado', v:'2-4 semanas'},
        ], verdictText: fee>10000?'✅ Buena asignación': fee>3000?'⚠ Fee pequeño':'❌ Poco spread'};
      }
      case 'rental': {
        const exp = (purchase*0.012/12)+120+(r*0.05)+(r*0.08)+(r*0.10);
        const cf = Math.round(r - exp);
        const cap = totalInv > 0 ? ((cf*12)/totalInv)*100 : 0;
        const coc = totalInv > 0 ? ((cf*12)/(totalInv*0.25))*100 : 0;
        const annualCF = cf * 12;
        const verdict = cf > 300 && cap > 6 ? 'good' : cf > 0 ? 'marginal' : 'bad';
        return { label:'Rental', icon:'🏘', verdict, rows:[
          {l:'Renta Estimada/mes', v:'$'+r.toLocaleString()},
          {l:'Gastos/mes (PITI+vacantes)', v:'$'+Math.round(exp).toLocaleString()},
          {l:'FLUJO NETO/mes', v:'$'+cf.toLocaleString(), big:true, color: cf>0?'var(--green)':'var(--red)'},
          {l:'Flujo Anual', v:'$'+annualCF.toLocaleString(), color: annualCF>0?'var(--green)':'var(--red)'},
          {l:'Cap Rate', v:cap.toFixed(1)+'%', color: cap>6?'var(--green)':'var(--amber)'},
          {l:'Cash-on-Cash', v:coc.toFixed(1)+'%', color: coc>8?'var(--green)':'var(--amber)'},
        ], verdictText: cf>300?'✅ Buen flujo': cf>0?'⚠ Flujo ajustado':'❌ Flujo negativo'};
      }
      case 'brrrr': {
        const r2 = rent || Math.round(arv * 0.008);
        const refiVal = Math.round(arv * 0.75);
        const cashLeft = Math.round(totalInv - refiVal);
        const cf2 = Math.round(r2 - ((refiVal*0.065/12)+120+(r2*0.13)));
        const verdict = cashLeft < 10000 && cf2 > 0 ? 'good' : cf2 > 0 ? 'marginal' : 'bad';
        return { label:'BRRRR', icon:'🔄', verdict, rows:[
          {l:'Inversión Total', v:'$'+totalInv.toLocaleString()},
          {l:'ARV Estimado', v:'$'+arv.toLocaleString()},
          {l:'Refi al 75% ARV', v:'$'+refiVal.toLocaleString()},
          {l:'Capital en deal', v:'$'+cashLeft.toLocaleString(), color: cashLeft<5000?'var(--green)':cashLeft<20000?'var(--amber)':'var(--red)'},
          {l:'Renta/mes', v:'$'+r2.toLocaleString()},
          {l:'FLUJO POST-REFI/mes', v:'$'+cf2.toLocaleString(), big:true, color: cf2>0?'var(--green)':'var(--red)'},
        ], verdictText: cashLeft<5000&&cf2>0?'✅ Casi sin dinero en deal': cf2>0?'⚠ Revisa los números':'❌ No funciona el refi'};
      }
      case 'airbnb': {
        const nightlyRate = Math.round((rent||1500) * 0.055);
        const occupancy = 0.72;
        const grossAirbnb = Math.round(nightlyRate * 30 * occupancy);
        const expAirbnb = Math.round(grossAirbnb * 0.45);
        const cfAirbnb = grossAirbnb - expAirbnb;
        const capAirbnb = totalInv > 0 ? ((cfAirbnb*12)/totalInv)*100 : 0;
        const verdict = cfAirbnb > 1000 && capAirbnb > 8 ? 'good' : cfAirbnb > 400 ? 'marginal' : 'bad';
        return { label:'Airbnb / STR', icon:'🏖', verdict, rows:[
          {l:'Tarifa/noche est.', v:'$'+nightlyRate.toLocaleString()},
          {l:'Ocupación estimada', v:'72%'},
          {l:'Ingreso Bruto/mes', v:'$'+grossAirbnb.toLocaleString()},
          {l:'Gastos (45%)', v:'$'+expAirbnb.toLocaleString()},
          {l:'FLUJO NETO/mes', v:'$'+cfAirbnb.toLocaleString(), big:true, color: cfAirbnb>0?'var(--green)':'var(--red)'},
          {l:'Cap Rate STR', v:capAirbnb.toFixed(1)+'%', color: capAirbnb>8?'var(--green)':'var(--amber)'},
        ], verdictText: cfAirbnb>1000?'✅ Excelente STR': cfAirbnb>400?'⚠ Mercado a revisar':'❌ STR no viable'};
      }
      case 'subject_to': {
        const assumedMortgage = Math.round(purchase * 0.85);
        const equity = purchase - assumedMortgage;
        const r3 = rent || Math.round(arv * 0.008);
        const existingPayment = Math.round(assumedMortgage * 0.007);
        const cf3 = Math.round(r3 - existingPayment - (r3*0.18));
        const verdict = cf3 > 400 && equity < purchase*0.3 ? 'good' : cf3 > 0 ? 'marginal' : 'bad';
        return { label:'Subject-To', icon:'📋', verdict, rows:[
          {l:'Precio Pedido', v:'$'+purchase.toLocaleString()},
          {l:'Hipoteca asumida (est.)', v:'$'+assumedMortgage.toLocaleString()},
          {l:'Equity requerida', v:'$'+equity.toLocaleString()},
          {l:'Pago hipoteca/mes', v:'$'+existingPayment.toLocaleString()},
          {l:'Renta/mes', v:'$'+r3.toLocaleString()},
          {l:'FLUJO NETO/mes', v:'$'+cf3.toLocaleString(), big:true, color: cf3>0?'var(--green)':'var(--red)'},
        ], verdictText: cf3>400?'✅ Buena Subject-To': cf3>0?'⚠ Revisa condiciones':'❌ No viable'};
      }
      case 'seller_finance': {
        const sfDown    = Math.round(purchase * 0.10);
        const sfLoan    = purchase - sfDown;
        const sfRate    = 0.08;
        const sfPmt     = Math.round(sfLoan * (sfRate/12) / (1 - Math.pow(1+sfRate/12,-360)));
        const r4        = rent || Math.round(arv * 0.008);
        const exp4      = Math.round((purchase*0.012/12)+120+(r4*0.13));
        const cf4       = r4 - sfPmt - exp4;
        const coc4      = sfDown>0?((cf4*12)/sfDown)*100:0;
        const verdict   = cf4>300&&coc4>8?'good':cf4>0?'marginal':'bad';
        return { label:'Seller Finance', icon:'🤝', verdict, rows:[
          {l:'Down Payment (10%)',    v:'$'+sfDown.toLocaleString()},
          {l:'Monto Financiado',      v:'$'+sfLoan.toLocaleString()},
          {l:'Tasa Pactada',          v:'8%'},
          {l:'Pago Mensual',          v:'$'+sfPmt.toLocaleString()},
          {l:'Renta/mes',             v:'$'+r4.toLocaleString()},
          {l:'FLUJO NETO/mes',        v:'$'+cf4.toLocaleString(), big:true, color:cf4>0?'var(--green)':'var(--red)'},
          {l:'Cash-on-Cash',          v:coc4.toFixed(1)+'%', color:coc4>8?'var(--green)':'var(--amber)'},
        ], verdictText: cf4>300?'✅ Buena estructura':'⚠ Negocia términos'};
      }
      default: return null;
    }
  };

  const panelHTML = (ex) => {
    const d = calcExit(ex);
    if (!d) return '';
    const vcls = d.verdict;
    return `
    <div class="exit-result-card">
      <div class="exit-result-title">
        ${d.icon} ${d.label}
        <div class="verdict-bar ${vcls}" style="margin:0;padding:5px 12px;font-size:11px">${d.verdictText}</div>
      </div>
      <div>
        ${d.rows.map(row=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:${row.big?'10px':'7px'} 0;border-bottom:1px solid var(--border)">
            <span style="font-size:${row.big?'12':'11'}px;color:var(--muted);${row.big?'font-weight:600':''};">${row.l}</span>
            <strong style="font-family:'JetBrains Mono',monospace;font-size:${row.big?'16':'13'}px;color:${row.color||'var(--text)'};">${row.v}</strong>
          </div>`).join('')}
      </div>
    </div>`;
  };

  // Tabs
  const tabsHTML = exits.map((ex,i) => {
    const d = calcExit(ex);
    if (!d) return '';
    const vcol = d.verdict==='good'?'var(--green)':d.verdict==='marginal'?'var(--amber)':'var(--red)';
    return `<button class="strat-tab ${i===0?'active':''}" onclick="switchStratTab('${ex}',this)" style="${i===0?'':''}">
      ${d.icon} ${d.label} <span style="color:${vcol};font-size:10px;margin-left:4px">●</span>
    </button>`;
  }).join('');

  const panelsHTML = exits.map((ex,i) =>
    `<div class="strat-panel ${i===0?'active':''}" id="spanel-${ex}">${panelHTML(ex)}</div>`
  ).join('');

  document.getElementById('result-output').innerHTML = `
    <div class="deal-result">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
        <div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(232,230,224,0.35);margin-bottom:6px">${addr}</div>
          <div class="deal-rec" style="color:${recColor}">${recIcon} ${rec}</div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            ${savedBadge}
            <span style="font-size:11px;color:var(--muted)">${result.comps_used||0} comps · ${exits.length} estrategias</span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(232,230,224,0.35);margin-bottom:4px">DEAL SCORE</div>
          <div class="deal-score-big" style="color:${scoreColor}">${score}</div>
        </div>
      </div>
      <!-- Key metrics bar -->
      <div class="deal-metrics" style="margin-bottom:16px">
        <div class="deal-metric"><div class="dm-label">ARV</div><div class="dm-val">$${(a.arv||0).toLocaleString()}</div></div>
        <div class="deal-metric"><div class="dm-label">Inversión Total</div><div class="dm-val">$${(a.total_investment||totalInv).toLocaleString()}</div></div>
        <div class="deal-metric"><div class="dm-label">Ganancia Est.</div><div class="dm-val" style="color:${(a.estimated_profit||0)>0?'var(--green)':'var(--red)'}">$${Math.round(a.estimated_profit||0).toLocaleString()}</div></div>
        <div class="deal-metric"><div class="dm-label">ROI</div><div class="dm-val" style="color:${(a.roi||0)>15?'var(--green)':'var(--red)'}">${parseFloat(a.roi||0).toFixed(1)}%</div></div>
      </div>
      <!-- AI Advisor -->
      <div class="deal-ai" style="margin-bottom:16px"><strong>🤖 AI Advisor:</strong> ${result.ai_advisor||'Análisis completado.'}</div>
      <!-- Strategy Tabs -->
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Análisis por Estrategia</div>
      <div class="strat-tabs">${tabsHTML}</div>
      <div id="strat-panels-container">${panelsHTML}</div>
    </div>`;
  updateStats();
}

function switchStratTab(id, btn) {
  document.querySelectorAll('.strat-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.strat-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('spanel-'+id);
  if (panel) panel.classList.add('active');
}

// ══════════════════════════════════════
