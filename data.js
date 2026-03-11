// ══════════════════════════════════════
// GLOBAL DATA STORE
// ══════════════════════════════════════

window.DB = {
  properties: [],
  analysis: [],
  contacts: []
};


// ══════════════════════════════════════
// LOAD USER DATA
// ══════════════════════════════════════

async function loadUserData() {

  if (!CURRENT_USER) return;

  try {

    // ── Load pipeline data from Supabase Edge Function ──
    const pipelineRes = await fetch(API_PIPELINE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: CURRENT_USER.id
      })
    });

    if (!pipelineRes.ok) {
      throw new Error('pipeline API failed');
    }

    const pdata = await pipelineRes.json();

    if (pdata && pdata.all_properties) {

      DB.properties = pdata.all_properties.map(p => ({
        ...p,
        asking_price: parseFloat(p.asking_price) || 0
      }));

      DB.analysis = pdata.all_properties
        .filter(p => p.deal_score != null)
        .map(p => ({
          property_id: p.id,
          arv: p.estimated_arv,
          total_investment: p.total_investment,
          estimated_profit: p.estimated_profit,
          roi: p.roi,
          deal_score: p.deal_score,
          recommendation: p.recommendation
        }));
    }

  } catch (e) {

    console.warn('Pipeline API failed, fallback to direct Supabase:', e);

    // ── Fallback: load directly from Supabase ──

    try {

      const [propsRes, analysisRes, contactsRes] = await Promise.all([

        SB.from('properties')
          .select('*')
          .eq('user_id', CURRENT_USER.id)
          .order('created_at', { ascending: false }),

        SB.from('deal_analysis')
          .select('*')
          .eq('user_id', CURRENT_USER.id),

        SB.from('contacts')
          .select('*')
          .eq('user_id', CURRENT_USER.id)

      ]);

      if (propsRes.data) {

        DB.properties = propsRes.data.map(p => ({
          ...p,
          asking_price: p.asking_price || 0
        }));

      }

      if (analysisRes.data) {

        DB.analysis = analysisRes.data;

      }

      if (contactsRes.data) {

        DB.contacts = contactsRes.data.map(c => ({
          ...c,
          name: c.full_name || ''
        }));

      }

    } catch (e2) {

      console.warn('Supabase fallback failed:', e2);

    }
  }


  // ── Always load contacts from Supabase ──

  try {

    const { data } = await SB
      .from('contacts')
      .select('*')
      .eq('user_id', CURRENT_USER.id);

    if (data) {

      DB.contacts = data.map(c => ({
        ...c,
        name: c.name || ''
      }));

    }

  } catch (e) {
    console.warn('Contacts load failed:', e);
  }


  // ── Update UI ──

  if (typeof updateStats === 'function') {
    updateStats();
  }

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

}
