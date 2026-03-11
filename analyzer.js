try {

  const res = await fetch(API_ANALYZE, {

    method:'POST',

    headers:{ 'Content-Type':'application/json' },

    body: JSON.stringify({

      address: addr,
      city,
      state: 'GA',
      zip,

      asking_price: purchase,
      rehab_cost: rehab,

      closing_costs: closing,
      holding_costs: holding,
      agent_fees: agent,

      estimated_rent: rent,

      comparables: comps,

      exit_strategies: [...SELECTED_EXITS],

      zillow_url: document.getElementById('f-zillow').value.trim(),

      user_id: CURRENT_USER?.id || null

    })

  });

  if (!res.ok) throw new Error('AI analyze error ' + res.status);

  result = await res.json();

} catch(e) {

  console.warn('AI analyze failed, using local calc:', e);

  result = localCalc(
    purchase,
    rehab,
    closing,
    holding,
    agent,
    rent,
    comps,
    [...SELECTED_EXITS]
  );
}
