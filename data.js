// ══════════════════════════════════════
// GLOBAL DATA STORE
// ══════════════════════════════════════

window.DB = {
properties:  [],
analysis:    [],
contacts:    [],
lenders:     [],
listings:    [],
comparables: [],
nid: { p: 1, a: 1, c: 1, co: 1, l: 1, li: 1 }
};

// ══════════════════════════════════════
// SUPABASE HELPERS
// ══════════════════════════════════════

async function sbSaveProperty(payload) {
if (!CURRENT_USER) return null;
try {
const { data, error } = await SB
.from(‘properties’)
.insert([{ …payload, user_id: CURRENT_USER.id }])
.select().single();
if (error) { console.warn(‘sbSaveProperty:’, error.message); return null; }
return data;
} catch (e) { console.warn(‘sbSaveProperty:’, e); return null; }
}

async function sbSaveAnalysis(payload) {
if (!CURRENT_USER) return null;
try {
const { data, error } = await SB
.from(‘deal_analysis’)
.insert([{ …payload, user_id: CURRENT_USER.id }])
.select().single();
if (error) { console.warn(‘sbSaveAnalysis:’, error.message); return null; }
return data;
} catch (e) { console.warn(‘sbSaveAnalysis:’, e); return null; }
}

// ══════════════════════════════════════
// LOAD USER DATA
// ══════════════════════════════════════

async function loadUserData() {

if (!CURRENT_USER) return;

// ── Try Edge Function first, fallback to direct Supabase ──
try {
const res = await fetch(API.pipeline, {
method: ‘POST’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({ user_id: CURRENT_USER.id })
});
if (!res.ok) throw new Error(‘Edge function ’ + res.status);
const pdata = await res.json();
if (pdata && pdata.all_properties) {
DB.properties = pdata.all_properties.map(p => ({ …p, asking_price: parseFloat(p.asking_price) || 0 }));
DB.analysis   = pdata.all_properties.filter(p => p.deal_score != null).map(p => ({
property_id: p.id, arv: p.estimated_arv, total_investment: p.total_investment,
estimated_profit: p.estimated_profit, roi: p.roi, deal_score: p.deal_score, recommendation: p.recommendation
}));
}
} catch (e) {
console.warn(‘Pipeline Edge Function not available, using Supabase direct:’, e.message);
try {
const [propsRes, analysisRes] = await Promise.all([
SB.from(‘properties’).select(’*’).eq(‘user_id’, CURRENT_USER.id).order(‘created_at’, { ascending: false }),
SB.from(‘deal_analysis’).select(’*’).eq(‘user_id’, CURRENT_USER.id)
]);
if (propsRes.data)   DB.properties = propsRes.data.map(p => ({ …p, asking_price: p.asking_price || 0 }));
if (analysisRes.data) DB.analysis  = analysisRes.data;
} catch (e2) { console.warn(‘Supabase direct load failed:’, e2); }
}

// ── Always load contacts ──
try {
const { data } = await SB.from(‘contacts’).select(’*’).eq(‘user_id’, CURRENT_USER.id);
if (data) DB.contacts = data.map(c => ({ …c, name: c.name || c.full_name || ‘’ }));
} catch (e) { console.warn(‘Contacts load failed:’, e); }

// ── Update UI ──
if (typeof updateStats    === ‘function’) updateStats();
if (typeof renderDashboard === ‘function’) renderDashboard();
}
