// ══════════════════════════════════════
//  PROPERTIES714 — CONFIG v2
// ══════════════════════════════════════

// ── Supabase ──
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── AI — routed via n8n proxy (key never exposed client-side) ──
const AI_PROXY_URL  = 'https://n8n.properties714.com/webhook/gpai-ai-proxy';
const N8N_SEARCH    = 'https://n8n.properties714.com/webhook/gpai-search-listings';
const N8N_ADMIN     = 'https://n8n.properties714.com/webhook/gpai-admin-users';

// ── GPT-4o caller — via n8n proxy ──
async function askGPT(systemPrompt, userPrompt, maxTokens = 2500) {
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt, maxTokens })
  });
  if (!res.ok) throw new Error(`AI proxy error ${res.status}`);
  const d = await res.json();
  return d.content || d.choices?.[0]?.message?.content || d.text;
}

// ── Supabase Client ──
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Global State ──
let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ── App Config ──
const APP_CONFIG    = { version:'2.0.0', name:'Properties714', currency:'USD', locale:'en-US' };
const APP_CACHE     = { properties:[], analysis:[], comparables:[], contacts:[], lenders:[], listings:[] };
const STRIPE_CONFIG = { publishableKey:'', plans:{} };
const API_BASE      = SUPABASE_URL;
const API           = { analyzeDeal: AI_PROXY_URL, searchListings: N8N_SEARCH, admin: N8N_ADMIN };

// ══════════════════════════════════════
