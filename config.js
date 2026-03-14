// ══════════════════════════════════════
//  PROPERTIES714 — CONFIG v2
// ══════════════════════════════════════

// ── Supabase ──
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── OpenAI (GPT-4o directo) ──
const OPENAI_KEY    = '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';
const OPENAI_MODEL  = 'gpt-4o';
const OPENAI_URL    = 'https://api.openai.com/v1/chat/completions';

// ── Apify (Zillow via server proxy en n8n) ──
const APIFY_TOKEN   = 'apify_api_D4l6yd2A05N9HfC9ehyUOXZJznh7002SUDb5';
const N8N_SEARCH    = 'https://n8n.properties714.com/webhook/gpai-search-listings';
const N8N_ADMIN     = 'https://n8n.properties714.com/webhook/gpai-admin-users';

// ── GPT-4o caller ──
async function askGPT(systemPrompt, userPrompt, maxTokens = 2500) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

// ── Supabase Client ──
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Global State ──
let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ── Legacy stubs ──
const APP_CONFIG    = { version:'2.0.0', name:'Properties714', currency:'USD', locale:'en-US' };
const APP_CACHE     = { properties:[], analysis:[], comparables:[], contacts:[], lenders:[], listings:[] };
const STRIPE_CONFIG = { publishableKey:'', plans:{} };
const API_BASE      = SUPABASE_URL;
const API           = { analyzeDeal: OPENAI_URL, searchListings: N8N_SEARCH, admin: N8N_ADMIN };

// ══════════════════════════════════════
