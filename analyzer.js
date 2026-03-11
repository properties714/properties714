// ══════════════════════════════════════
//  COMPARABLES
// ══════════════════════════════════════

let compN = 0;

function addComp(addr = ‘’, price = 0, sqft = 0, beds = 0) {
compN++;
const d = document.createElement(‘div’);
d.id = ‘cr-’ + compN;
d.style.cssText = ‘display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:center;margin-bottom:8px’;
d.innerHTML = ` <input class="form-input" placeholder="Comp address" value="${addr}" style="font-size:12px;padding:8px 10px"> <input class="form-input" type="number" placeholder="Sold $" value="${price || ''}" style="font-size:12px;padding:8px 10px"> <input class="form-input" type="number" placeholder="SqFt" value="${sqft || ''}" style="font-size:12px;padding:8px 10px"> <input class="form-input" type="number" placeholder="Beds" value="${beds || ''}" style="font-size:12px;padding:8px 10px"> <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px">×</button>`;
const compRows = document.getElementById(‘comp-rows’);
if (compRows) compRows.appendChild(d);
}

function getComps() {
return […document.querySelectorAll(’#comp-rows > div’)].map(r => {
const ins = r.querySelectorAll(‘input’);
return { address: ins[0].value, sold_price: parseFloat(ins[1].value) || 0, sqft: parseInt(ins[2].value) || 0, beds: parseInt(ins[3].value) || 0 };
}).filter(c => c.sold_price > 0);
}

// ══════════════════════════════════════
// EXIT STRATEGY TOGGLE
// ══════════════════════════════════════

const SELECTED_EXITS = new Set([‘fix_flip’, ‘wholesale’, ‘rental’]);

function toggleExit(id) {
const card = document.getElementById(‘exit-’ + id);
if (SELECTED_EXITS.has(id)) {
if (SELECTED_EXITS.size <= 1) return;
SELECTED_EXITS.delete(id);
if (card) card.classList.remove(‘selected’);
} else {
SELECTED_EXITS.add(id);
if (card) card.classList.add(‘selected’);
}
const warn = document.getElementById(‘exit-warning’);
if (warn) warn.style.display = SELECTED_EXITS.size === 0 ? ‘block’ : ‘none’;
}

// ══════════════════════════════════════
// ZILLOW URL PARSER
// ══════════════════════════════════════

function parseZillowUrl() {
const urlEl  = document.getElementById(‘f-zillow’);
const status = document.getElementById(‘zillow-status’);
if (!urlEl || !status) return;
const url = urlEl.value.trim();
if (!url) return;
if (!url.includes(‘zillow.com’)) {
status.style.display = ‘block’; status.style.color = ‘var(–amber)’;
status.textContent = ‘⚠ Paste a Zillow link (zillow.com/homedetails/…)’; return;
}
const match = url.match(/homedetails/([^/]+)//) || url.match(/homes/([^/]+)//);
if (match) {
const parts = match[1].replace(/-/g, ’ ‘).split(/\s+/);
const stateIdx = parts.findIndex(p => /^[A-Z]{2}$/.test(p));
let addr = ‘’, city = ‘’, zip = ‘’;
if (stateIdx >= 2) {
zip  = parts[stateIdx + 1] || ‘’;
city = parts[stateIdx - 1] || ‘’;
addr = parts.slice(0, stateIdx - 1).join(’ ‘);
} else {
addr = parts.slice(0, Math.ceil(parts.length / 2)).join(’ ‘);
city = parts.slice(Math.ceil(parts.length / 2)).join(’ ’);
}
if (addr) {
const fa = document.getElementById(‘f-addr’); if (fa) fa.value = addr;
const fc = document.getElementById(‘f-city’); if (fc && city) fc.value = city;
const fz = document.getElementById(‘f-zip’);  if (fz && /^\d{5}$/.test(zip)) fz.value = zip;
status.style.display = ‘block’; status.style.color = ‘var(–green)’;
status.textContent = ‘✓ Address extracted successfully’;
}
} else {
status.style.display = ‘block’; status.style.color = ‘var(–muted)’;
status.textContent = ‘Valid link. Add comps manually or type the address.’;
}
}

// ══════════════════════════════════════
// LOCAL CALCULATOR — 7 EXIT STRATEGIES
// (100% frontend, no external dependency)
// ══════════════════════════════════════

function localCalc(purchase, rehab, closing, holding, agentInput, rent, comps, exits) {
const selectedExits = exits || [‘fix_flip’, ‘wholesale’, ‘rental’];

const arv   = comps.length ? Math.round(comps.reduce((s, c) => s + c.sold_price, 0) / comps.length) : Math.round(purchase * 1.45);
const agent = agentInput < 20 ? Math.round(arv * (agentInput / 100)) : agentInput;
const totalCosts  = closing + holding + agent;
const totalInvest = purchase + rehab + totalCosts;
const monthlyRent = rent || Math.round(arv * 0.008);

// Fix & Flip
const ffProfit = arv - totalInvest;
const ffROI    = totalInvest > 0 ? (ffProfit / totalInvest) * 100 : 0;

// Wholesale
const mao           = (arv * 0.70) - rehab;
const assignmentFee = Math.max(5000, Math.round((mao - purchase) * 0.3));

// Rental
const propTax     = Math.round((purchase * 0.012) / 12);
const insurance   = 120;
const vacancy     = Math.round(monthlyRent * 0.05);
const mgmt        = Math.round(monthlyRent * 0.08);
const maint       = Math.round(monthlyRent * 0.10);
const mortgageEst = Math.round(purchase * 0.80 * 0.007);
const opExp       = propTax + insurance + vacancy + mgmt + maint;
const cashflow    = monthlyRent - opExp - mortgageEst;
const capRate     = purchase > 0 ? ((monthlyRent - opExp) * 12 / purchase) * 100 : 0;
const downpay     = purchase * 0.20 + closing;
const cocReturn   = downpay > 0 ? ((cashflow * 12) / downpay) * 100 : 0;

// BRRRR
const brrrrRefinance   = Math.round(arv * 0.75);
const brrrrCashOut     = brrrrRefinance - purchase;
const brrrrNewMortgage = Math.round(brrrrRefinance * 0.007);
const brrrrCashflow    = monthlyRent - opExp - brrrrNewMortgage;
const brrrrCashLeft    = Math.max(0, totalInvest - brrrrRefinance);

// Airbnb
const airbnbNightly   = Math.round(monthlyRent / 15);
const airbnbOccupancy = 0.68;
const airbnbGross     = Math.round(airbnbNightly * 30 * airbnbOccupancy);
const airbnbExpenses  = propTax + insurance + Math.round(airbnbGross * 0.03) + Math.round(airbnbGross * 0.12) + 200;
const airbnbCashflow  = airbnbGross - airbnbExpenses - mortgageEst;
const airbnbCoC       = downpay > 0 ? ((airbnbCashflow * 12) / downpay) * 100 : 0;
const airbnbMultiplier = monthlyRent > 0 ? (airbnbGross / monthlyRent).toFixed(1) : ‘—’;

// Subject-To
const subtoAssumedLoan = Math.round(purchase * 0.85);
const subtoCashAtClose = purchase - subtoAssumedLoan;
const subtoExistRate   = 3.5;
const subtoMortgage    = Math.round(subtoAssumedLoan * (subtoExistRate / 100 / 12) / (1 - Math.pow(1 + subtoExistRate / 100 / 12, -360)));
const subtoCashflow    = monthlyRent - opExp - subtoMortgage;

// Seller Finance
const sfDownpay  = Math.round(purchase * 0.10);
const sfLoanAmt  = purchase - sfDownpay;
const sfRate     = 0.08;
const sfPayment  = Math.round(sfLoanAmt * (sfRate / 12) / (1 - Math.pow(1 + sfRate / 12, -360)));
const sfCashflow = monthlyRent - opExp - sfPayment;
const sfCoC      = sfDownpay > 0 ? ((sfCashflow * 12) / sfDownpay) * 100 : 0;

// Deal Score
let score = 50;
if (ffProfit > 50000) score += 20; else if (ffProfit > 25000) score += 10; else if (ffProfit < 0) score -= 25;
if (ffROI > 25) score += 15; else if (ffROI > 15) score += 8; else if (ffROI < 5) score -= 20;
if (capRate > 8) score += 10; else if (capRate > 5) score += 5;
if (cashflow > 500) score += 8; else if (cashflow < 0) score -= 10;
if (comps.length >= 3) score += 5;
if (arv > 0 && (rehab / arv) > 0.50) score -= 15;
score = Math.max(0, Math.min(100, Math.round(score)));

let rec = ‘REJECT’;
if (score >= 70 && ffProfit > 25000) rec = ‘GOOD DEAL’;
else if (score >= 45) rec = ‘MARGINAL DEAL’;

const scores7 = { fix_flip: ffROI, rental: capRate * 2, brrrr: capRate * 2.5, airbnb: airbnbCoC, wholesale: assignmentFee / 1000, subject_to: subtoCashflow / 100, seller_finance: sfCoC };
const best = Object.entries(scores7).filter(([k]) => selectedExits.includes(k)).sort((a, b) => b[1] - a[1])[0]?.[0] || ‘fix_flip’;

const aiHints = [];
if (ffProfit < 0) aiHints.push(‘Purchase price is too high for a flip’);
if (capRate > 8) aiHints.push(‘Excellent cap rate for rental’);
if (brrrrCashOut > 20000) aiHints.push(`BRRRR lets you recover $${brrrrCashOut.toLocaleString()} on refi`);
if (airbnbGross > monthlyRent * 1.5) aiHints.push(`Airbnb would generate ${airbnbMultiplier}x vs traditional rent`);
if (assignmentFee > 15000) aiHints.push(`Wholesale fee of $${assignmentFee.toLocaleString()} with no rehab needed`);
if (subtoCashflow > 300) aiHints.push(‘Subject-To viable: keeps existing rate’);

return {
status: ‘local’, property_id: Date.now(),
analysis: { arv, purchase_price: purchase, rehab_cost: rehab, total_investment: totalInvest, estimated_profit: ffProfit, roi: ffROI, deal_score: score, recommendation: rec, best_strategy: best },
strategies: {
fix_flip:       { profit: Math.round(ffProfit), roi: parseFloat(ffROI.toFixed(1)), arv, total_invest: totalInvest, arv_70pct: Math.round(arv * 0.70) },
wholesale:      { mao: Math.round(mao), assignment_fee: Math.round(assignmentFee), net_to_seller: Math.round(mao - assignmentFee) },
rental:         { monthly_rent: Math.round(monthlyRent), monthly_cashflow: Math.round(cashflow), cap_rate: parseFloat(capRate.toFixed(1)), cash_on_cash: parseFloat(cocReturn.toFixed(1)), noi: Math.round((monthlyRent - opExp) * 12), expenses: Math.round(opExp) },
brrrr:          { refinance_amount: brrrrRefinance, cash_out: Math.round(brrrrCashOut), new_mortgage: brrrrNewMortgage, cashflow: Math.round(brrrrCashflow), cash_left_in: Math.round(brrrrCashLeft) },
airbnb:         { nightly_rate: airbnbNightly, occupancy_pct: Math.round(airbnbOccupancy * 100), gross_monthly: airbnbGross, cashflow: Math.round(airbnbCashflow), coc: parseFloat(airbnbCoC.toFixed(1)), vs_rental_mult: airbnbMultiplier },
subject_to:     { assumed_loan: subtoAssumedLoan, cash_at_close: Math.round(subtoCashAtClose), est_rate: subtoExistRate, monthly_cashflow: Math.round(subtoCashflow) },
seller_finance: { down_payment: sfDownpay, loan_amount: sfLoanAmt, rate_pct: sfRate * 100, monthly_payment: sfPayment, cashflow: Math.round(sfCashflow), coc: parseFloat(sfCoC.toFixed(1)) }
},
ai_advisor: aiHints.length ? aiHints.join(’ · ’) : ‘Analysis complete. Add 3+ comps for a more accurate ARV.’,
comps_used: comps.length
};
}

// ══════════════════════════════════════
//  DEAL ANALYZER — MAIN ENTRY
// ══════════════════════════════════════

async function analyzeDeal() {
const addrEl = document.getElementById(‘f-addr’);
if (!addrEl || !addrEl.value.trim()) { alert(‘Enter a property address’); return; }

const addr    = addrEl.value.trim();
const purchase = parseFloat(document.getElementById(‘f-ask’)?.value)   || 0;
const rehab    = parseFloat(document.getElementById(‘f-rehab’)?.value)  || 0;
const closing  = parseFloat(document.getElementById(‘f-close’)?.value)  || 8000;
const holding  = parseFloat(document.getElementById(‘f-hold’)?.value)   || 6000;
const agentRaw = parseFloat(document.getElementById(‘f-agent’)?.value)  || 3.0;
const rent     = parseFloat(document.getElementById(‘f-rent’)?.value)   || 0;
const city     = document.getElementById(‘f-city’)?.value.trim() || ‘’;
const zip      = document.getElementById(‘f-zip’)?.value.trim()  || ‘’;
const agent    = agentRaw < 20 ? Math.round((purchase || 200000) * (agentRaw / 100)) : agentRaw;
const comps    = getComps();

const ph = document.getElementById(‘result-placeholder’);
const ld = document.getElementById(‘result-loading’);
const op = document.getElementById(‘result-output’);
if (ph) ph.style.display = ‘none’;
if (ld) ld.style.display = ‘flex’;
if (op) op.style.display = ‘none’;

// ── Always use local calc (no n8n dependency) ──
const result = localCalc(purchase, rehab, closing, holding, agent, rent, comps, […SELECTED_EXITS]);

// ── Save to Supabase ──
let savedPropId = null;
const propPayload = { address: addr, city, zip, asking_price: purchase, estimated_rehab: rehab, strategy_candidate: result.analysis?.best_strategy || ‘fix_flip’, status: ‘analyzing’ };
const sbProp = await sbSaveProperty(propPayload);
if (sbProp) {
savedPropId = sbProp.id;
await sbSaveAnalysis({
property_id: sbProp.id,
arv: result.analysis?.arv || 0,
purchase_price: purchase, rehab_cost: rehab,
closing_costs: closing, holding_cost: holding, agent_fees: agent,
total_investment: result.analysis?.total_investment || 0,
estimated_profit: result.analysis?.estimated_profit || 0,
roi: result.analysis?.roi || 0,
deal_score: result.analysis?.deal_score || 0,
recommendation: result.analysis?.recommendation || ‘REJECT’,
ai_advisor: result.ai_advisor || ‘’
});
}

// ── Save to local cache ──
const a   = result.analysis || {};
const pid = savedPropId || (DB.nid.p++);
DB.properties.push({ id: pid, address: addr, city, zip, asking_price: purchase, estimated_arv: a.arv || 0, estimated_rehab: rehab, strategy_candidate: a.best_strategy || ‘fix_flip’, status: ‘analyzing’, created_at: new Date() });
DB.analysis.push({ id: DB.nid.a++, property_id: pid, arv: a.arv || 0, total_investment: a.total_investment || 0, estimated_profit: a.estimated_profit || 0, roi: a.roi || 0, deal_score: a.deal_score || 0, recommendation: a.recommendation || ‘REJECT’, created_at: new Date() });
comps.forEach(c => DB.comparables.push({ id: DB.nid.c++, property_id: pid, …c }));

if (ld) ld.style.display = ‘none’;
if (op) op.style.display = ‘block’;

renderAnalysisResult(result, addr, purchase, rehab, closing, holding, agent, rent, city, zip);
if (typeof updateStats === ‘function’) updateStats();
}

// ══════════════════════════════════════
// RENDER ANALYSIS RESULT
// ══════════════════════════════════════

function renderAnalysisResult(result, addr, purchase, rehab, closing, holding, agent, rent, city, zip) {
const op = document.getElementById(‘result-output’);
if (!op) return;

const a       = result.analysis || {};
const exits   = […SELECTED_EXITS];
const allCosts = closing + holding + agent;
const totalInv = purchase + rehab + allCosts;
const rec      = a.recommendation || ‘REJECT’;
const score    = a.deal_score || 0;
const recIcon  = rec === ‘GOOD DEAL’ ? ‘✅’ : rec === ‘MARGINAL DEAL’ ? ‘⚠️’ : ‘❌’;
const recColor = rec === ‘GOOD DEAL’ ? ‘var(–green)’ : rec === ‘MARGINAL DEAL’ ? ‘var(–amber)’ : ‘var(–red)’;
const scoreColor = score >= 70 ? ‘var(–green)’ : score >= 45 ? ‘var(–amber)’ : ‘var(–red)’;
const savedBadge = result.status === ‘local’
? `<span class="badge badge-amber">⚡ Calculated locally</span>`
: `<span class="badge badge-green">✓ Saved to Supabase</span>`;

const calcExit = (id) => {
const arv = a.arv || 0;
const r   = rent || Math.round(arv * 0.008);
const exp = (purchase * 0.012 / 12) + 120 + (r * 0.05) + (r * 0.08) + (r * 0.10);

```
switch (id) {
  case 'fix_flip': {
    const profit = Math.round(arv - totalInv);
    const roi    = totalInv > 0 ? ((profit / totalInv) * 100) : 0;
    return { label: 'Fix & Flip', icon: '🔨', verdict: profit > 30000 && roi > 15 ? 'good' : profit > 10000 ? 'marginal' : 'bad', verdictText: profit > 30000 ? '✅ Good Flip' : profit > 10000 ? '⚠ Marginal' : '❌ Not recommended', rows: [{ l: 'ARV Estimated', v: '$' + arv.toLocaleString() }, { l: 'Purchase Price', v: '$' + purchase.toLocaleString() }, { l: 'Rehab', v: '$' + rehab.toLocaleString() }, { l: 'Additional Costs', v: '$' + allCosts.toLocaleString() }, { l: 'Total Investment', v: '$' + totalInv.toLocaleString() }, { l: 'EST. PROFIT', v: '$' + profit.toLocaleString(), big: true, color: profit > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'ROI', v: roi.toFixed(1) + '%', big: true, color: roi > 15 ? 'var(--green)' : 'var(--amber)' }] };
  }
  case 'wholesale': {
    const mao = Math.round((arv * 0.70) - rehab);
    const fee = Math.round(Math.max(0, (mao - purchase) * 0.5));
    return { label: 'Wholesale', icon: '⚡', verdict: fee > 10000 ? 'good' : fee > 3000 ? 'marginal' : 'bad', verdictText: fee > 10000 ? '✅ Good assignment' : fee > 3000 ? '⚠ Small fee' : '❌ Low spread', rows: [{ l: 'ARV Estimated', v: '$' + arv.toLocaleString() }, { l: 'Asking Price', v: '$' + purchase.toLocaleString() }, { l: 'MAO (70% ARV - Rehab)', v: '$' + mao.toLocaleString() }, { l: 'Spread', v: '$' + (mao - purchase).toLocaleString(), color: (mao - purchase) > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'EST. ASSIGNMENT FEE', v: '$' + fee.toLocaleString(), big: true, color: fee > 0 ? 'var(--green)' : 'var(--red)' }] };
  }
  case 'rental': {
    const cf  = Math.round(r - exp);
    const cap = totalInv > 0 ? ((cf * 12) / totalInv) * 100 : 0;
    const coc = totalInv > 0 ? ((cf * 12) / (totalInv * 0.25)) * 100 : 0;
    return { label: 'Rental', icon: '🏘', verdict: cf > 300 && cap > 6 ? 'good' : cf > 0 ? 'marginal' : 'bad', verdictText: cf > 300 ? '✅ Good cashflow' : cf > 0 ? '⚠ Tight cashflow' : '❌ Negative cashflow', rows: [{ l: 'Est. Monthly Rent', v: '$' + r.toLocaleString() }, { l: 'Monthly Expenses', v: '$' + Math.round(exp).toLocaleString() }, { l: 'NET MONTHLY CASHFLOW', v: '$' + cf.toLocaleString(), big: true, color: cf > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'Annual Cashflow', v: '$' + (cf * 12).toLocaleString(), color: cf > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'Cap Rate', v: cap.toFixed(1) + '%', color: cap > 6 ? 'var(--green)' : 'var(--amber)' }, { l: 'Cash-on-Cash', v: coc.toFixed(1) + '%', color: coc > 8 ? 'var(--green)' : 'var(--amber)' }] };
  }
  case 'brrrr': {
    const refi = Math.round(arv * 0.75);
    const cashLeft = Math.round(totalInv - refi);
    const cf2 = Math.round(r - ((refi * 0.065 / 12) + 120 + (r * 0.13)));
    return { label: 'BRRRR', icon: '🔄', verdict: cashLeft < 10000 && cf2 > 0 ? 'good' : cf2 > 0 ? 'marginal' : 'bad', verdictText: cashLeft < 5000 && cf2 > 0 ? '✅ Almost no money left in deal' : cf2 > 0 ? '⚠ Review numbers' : '❌ Refi does not work', rows: [{ l: 'Total Investment', v: '$' + totalInv.toLocaleString() }, { l: 'ARV Estimated', v: '$' + arv.toLocaleString() }, { l: 'Refi at 75% ARV', v: '$' + refi.toLocaleString() }, { l: 'Capital left in deal', v: '$' + cashLeft.toLocaleString(), color: cashLeft < 5000 ? 'var(--green)' : cashLeft < 20000 ? 'var(--amber)' : 'var(--red)' }, { l: 'POST-REFI CASHFLOW/mo', v: '$' + cf2.toLocaleString(), big: true, color: cf2 > 0 ? 'var(--green)' : 'var(--red)' }] };
  }
  case 'airbnb': {
    const nightly = Math.round((rent || 1500) * 0.055);
    const gross   = Math.round(nightly * 30 * 0.72);
    const cfA     = gross - Math.round(gross * 0.45);
    const capA    = totalInv > 0 ? ((cfA * 12) / totalInv) * 100 : 0;
    return { label: 'Airbnb / STR', icon: '🏖', verdict: cfA > 1000 && capA > 8 ? 'good' : cfA > 400 ? 'marginal' : 'bad', verdictText: cfA > 1000 ? '✅ Excellent STR' : cfA > 400 ? '⚠ Check market' : '❌ STR not viable', rows: [{ l: 'Est. Nightly Rate', v: '$' + nightly.toLocaleString() }, { l: 'Estimated Occupancy', v: '72%' }, { l: 'Gross Monthly', v: '$' + gross.toLocaleString() }, { l: 'Expenses (45%)', v: '$' + Math.round(gross * 0.45).toLocaleString() }, { l: 'NET MONTHLY CASHFLOW', v: '$' + cfA.toLocaleString(), big: true, color: cfA > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'STR Cap Rate', v: capA.toFixed(1) + '%', color: capA > 8 ? 'var(--green)' : 'var(--amber)' }] };
  }
  case 'subject_to': {
    const assumed  = Math.round(purchase * 0.85);
    const exPmt    = Math.round(assumed * 0.007);
    const cf3      = Math.round(r - exPmt - (r * 0.18));
    return { label: 'Subject-To', icon: '📋', verdict: cf3 > 400 ? 'good' : cf3 > 0 ? 'marginal' : 'bad', verdictText: cf3 > 400 ? '✅ Good Subject-To' : cf3 > 0 ? '⚠ Check terms' : '❌ Not viable', rows: [{ l: 'Asking Price', v: '$' + purchase.toLocaleString() }, { l: 'Assumed Mortgage (est.)', v: '$' + assumed.toLocaleString() }, { l: 'Mortgage Payment/mo', v: '$' + exPmt.toLocaleString() }, { l: 'Monthly Rent', v: '$' + r.toLocaleString() }, { l: 'NET CASHFLOW/mo', v: '$' + cf3.toLocaleString(), big: true, color: cf3 > 0 ? 'var(--green)' : 'var(--red)' }] };
  }
  case 'seller_finance': {
    const sfDown = Math.round(purchase * 0.10);
    const sfLoan = purchase - sfDown;
    const sfPmt  = Math.round(sfLoan * (0.08 / 12) / (1 - Math.pow(1 + 0.08 / 12, -360)));
    const cf4    = r - sfPmt - Math.round((purchase * 0.012 / 12) + 120 + (r * 0.13));
    const coc4   = sfDown > 0 ? ((cf4 * 12) / sfDown) * 100 : 0;
    return { label: 'Seller Finance', icon: '🤝', verdict: cf4 > 300 && coc4 > 8 ? 'good' : cf4 > 0 ? 'marginal' : 'bad', verdictText: cf4 > 300 ? '✅ Good structure' : '⚠ Negotiate terms', rows: [{ l: 'Down Payment (10%)', v: '$' + sfDown.toLocaleString() }, { l: 'Financed Amount', v: '$' + sfLoan.toLocaleString() }, { l: 'Rate', v: '8%' }, { l: 'Monthly Payment', v: '$' + sfPmt.toLocaleString() }, { l: 'Monthly Rent', v: '$' + r.toLocaleString() }, { l: 'NET CASHFLOW/mo', v: '$' + cf4.toLocaleString(), big: true, color: cf4 > 0 ? 'var(--green)' : 'var(--red)' }, { l: 'Cash-on-Cash', v: coc4.toFixed(1) + '%', color: coc4 > 8 ? 'var(--green)' : 'var(--amber)' }] };
  }
  default: return null;
}
```

};

const panelHTML = (ex) => {
const d = calcExit(ex);
if (!d) return ‘’;
return `<div class="exit-result-card"> <div class="exit-result-title"> ${d.icon} ${d.label} <div class="verdict-bar ${d.verdict}" style="margin:0;padding:5px 12px;font-size:11px">${d.verdictText}</div> </div> <div> ${d.rows.map(row =>`
<div style="display:flex;justify-content:space-between;align-items:center;padding:${row.big ? '10px' : '7px'} 0;border-bottom:1px solid var(--border)">
<span style="font-size:${row.big ? '12' : '11'}px;color:var(--muted);${row.big ? 'font-weight:600' : ''}">${row.l}</span>
<strong style="font-family:'JetBrains Mono',monospace;font-size:${row.big ? '16' : '13'}px;color:${row.color || 'var(--text)'}">${row.v}</strong>
</div>`).join('')} </div> </div>`;
};

const tabsHTML   = exits.map((ex, i) => { const d = calcExit(ex); if (!d) return ‘’; const vcol = d.verdict === ‘good’ ? ‘var(–green)’ : d.verdict === ‘marginal’ ? ‘var(–amber)’ : ‘var(–red)’; return `<button class="strat-tab ${i === 0 ? 'active' : ''}" onclick="switchStratTab('${ex}',this)">${d.icon} ${d.label} <span style="color:${vcol};font-size:10px;margin-left:4px">●</span></button>`; }).join(’’);
const panelsHTML = exits.map((ex, i) => `<div class="strat-panel ${i === 0 ? 'active' : ''}" id="spanel-${ex}">${panelHTML(ex)}</div>`).join(’’);

op.innerHTML = ` <div class="deal-result"> <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(232,230,224,0.35);margin-bottom:6px">${addr}</div> <div class="deal-rec" style="color:${recColor}">${recIcon} ${rec}</div> <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${savedBadge}<span style="font-size:11px;color:var(--muted)">${result.comps_used || 0} comps · ${exits.length} strategies</span></div> </div> <div style="text-align:right"> <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(232,230,224,0.35);margin-bottom:4px">DEAL SCORE</div> <div class="deal-score-big" style="color:${scoreColor}">${score}</div> </div> </div> <div class="deal-metrics" style="margin-bottom:16px"> <div class="deal-metric"><div class="dm-label">ARV</div><div class="dm-val">$${(a.arv || 0).toLocaleString()}</div></div> <div class="deal-metric"><div class="dm-label">Total Investment</div><div class="dm-val">$${(a.total_investment || totalInv).toLocaleString()}</div></div> <div class="deal-metric"><div class="dm-label">Est. Profit</div><div class="dm-val" style="color:${(a.estimated_profit || 0) > 0 ? 'var(--green)' : 'var(--red)'}">$${Math.round(a.estimated_profit || 0).toLocaleString()}</div></div> <div class="deal-metric"><div class="dm-label">ROI</div><div class="dm-val" style="color:${(a.roi || 0) > 15 ? 'var(--green)' : 'var(--red)'}">${parseFloat(a.roi || 0).toFixed(1)}%</div></div> </div> <div class="deal-ai" style="margin-bottom:16px"><strong>🤖 AI Advisor:</strong> ${result.ai_advisor || 'Analysis complete.'}</div> <div style="font-size:11px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Strategy Analysis</div> <div class="strat-tabs">${tabsHTML}</div> <div id="strat-panels-container">${panelsHTML}</div> </div>`;
}

function switchStratTab(id, btn) {
document.querySelectorAll(’.strat-tab’).forEach(t => t.classList.remove(‘active’));
document.querySelectorAll(’.strat-panel’).forEach(p => p.classList.remove(‘active’));
if (btn) btn.classList.add(‘active’);
const panel = document.getElementById(‘spanel-’ + id);
if (panel) panel.classList.add(‘active’);
}
