// ══════════════════════════════════════
//  PROPERTIES714 — CONFIG v2
// ══════════════════════════════════════

// ── Supabase ──
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── OpenAI GPT-4o ──
const OPENAI_KEY   = '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';
const OPENAI_MODEL = 'gpt-4o';
const OPENAI_URL   = 'https://api.openai.com/v1/chat/completions';

// ── GPT-4o helper ──
async function askGPT(systemPrompt, userPrompt, maxTokens = 2500) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: OPENAI_MODEL, temperature: 0.2, max_tokens: maxTokens,
      messages: [{ role:'system', content: systemPrompt }, { role:'user', content: userPrompt }]
    })
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

// ── Supabase clients ──
const { createClient } = supabase;
const SB      = createClient(SUPABASE_URL, SUPABASE_ANON);          // normal (RLS activo)

// ── Global State ──
let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ── Legacy stubs (no romper otros archivos) ──
const APP_CONFIG    = { version:'2.0.0', name:'Properties714', currency:'USD', locale:'en-US' };
const APP_CACHE     = { properties:[], analysis:[], comparables:[], contacts:[], lenders:[], listings:[] };
const STRIPE_CONFIG = { publishableKey:'', plans:{} };
const API_BASE      = SUPABASE_URL;
const API           = { analyzeDeal: OPENAI_URL };

// ══════════════════════════════════════
