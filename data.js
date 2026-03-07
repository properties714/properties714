//  LOAD USER DATA FROM SUPABASE
// ══════════════════════════════════════
async function loadUserData() {
  if (!CURRENT_USER) return;
  try {
    // Load pipeline data from n8n (includes properties + analysis + KPIs)
    const pipelineRes = await fetch(N8N_PIPELINE, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: CURRENT_USER.id }) });
    if (pipelineRes.ok) {
      const pdata = await pipelineRes.json();
      if (pdata.all_properties) DB.properties = pdata.all_properties.map(p=>({...p, asking_price:parseFloat(p.asking_price)||0}));
      if (pdata.all_properties) DB.analysis = pdata.all_properties.filter(p=>p.deal_score!=null).map(p=>({ property_id:p.id, arv:p.estimated_arv, total_investment:p.total_investment, estimated_profit:p.estimated_profit, roi:p.roi, deal_score:p.deal_score, recommendation:p.recommendation }));
    } else { throw new Error('n8n pipeline failed'); }
  } catch(e) {
    // Fallback: load directly from Supabase
    try {
      const [propsRes, analysisRes, contactsRes] = await Promise.all([
        SB.from('properties').select('*').eq('user_id', CURRENT_USER.id).order('created_at', {ascending:false}),
        SB.from('deal_analysis').select('*').eq('user_id', CURRENT_USER.id),
        SB.from('contacts').select('*').eq('user_id', CURRENT_USER.id)
      ]);
      if (propsRes.data)    DB.properties = propsRes.data.map(p=>({...p, asking_price:p.asking_price||0}));
      if (analysisRes.data) DB.analysis   = analysisRes.data;
      if (contactsRes.data) DB.contacts   = contactsRes.data.map(c=>({...c, name:c.full_name}));
    } catch(e2) { console.warn('Supabase load error:', e2); }
  }
  // Always load contacts from Supabase
  try {
    const { data } = await SB.from('contacts').select('*').eq('user_id', CURRENT_USER.id);
    if (data) DB.contacts = data.map(c=>({...c, name:c.name||''}));
  } catch(e) {}
  updateStats();
  renderDashboard();
}

// ══════════════════════════════════════
//  SAVE TO SUPABASE HELPERS
// ══════════════════════════════════════
async function sbSaveProperty(prop) {
  if (!CURRENT_USER) return null;
  const { data, error } = await SB.from('properties').insert({
    user_id: CURRENT_USER.id,
    address: prop.address, city: prop.city, state: 'GA', zip: prop.zip,
    asking_price: prop.asking_price, estimated_rehab: prop.estimated_rehab,
    strategy_candidate: prop.strategy_candidate, status: 'analyzing'
  }).select().single();
  if (error) { console.warn('Save property error:', error); return null; }
  return data;
}

async function sbSaveAnalysis(analysis) {
  if (!CURRENT_USER) return;
  const { error } = await SB.from('deal_analysis').insert({
    user_id: CURRENT_USER.id, ...analysis
  });
  if (error) console.warn('Save analysis error:', error);
}

async function sbSaveContact(contact) {
  if (!CURRENT_USER) return null;
  const { data, error } = await SB.from('contacts').insert({
    user_id: CURRENT_USER.id,
    full_name: contact.name, type: contact.type,
    phone: contact.phone, email: contact.email, notes: contact.notes
  }).select().single();
  if (error) { console.warn('Save contact error:', error); return null; }
  return data;
}

// ══════════════════════════════════════
//  IN-MEMORY STATE (cache)
// ══════════════════════════════════════
const DB = {
  properties: [], analysis: [], comparables: [], strategies: [],
  contacts: [], lenders: [], listings: [],
  nid: { p:1, a:1, c:1, s:1, co:1, l:1, li:1 }
};

// ══════════════════════════════════════
