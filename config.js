// ══════════════════════════════════════
//  PROPERTIES714 — CONFIG v3
// ══════════════════════════════════════

// ── Supabase ──
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── Supabase Edge Functions ──
const EDGE_BASE    = `${SUPABASE_URL}/functions/v1`;
const AI_PROXY_URL = `${EDGE_BASE}/ai-proxy`;
const EDGE_SEARCH  = `${EDGE_BASE}/search-listings`;
const EDGE_ADMIN   = `${EDGE_BASE}/admin-api`;

// ── AI caller — Supabase Edge Function (requires auth) ──
async function askGPT(systemPrompt, userPrompt, maxTokens = 2500) {
  const { data: { session } } = await SB.auth.getSession();
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? SUPABASE_ANON}`
    },
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
const APP_CONFIG    = { version:'3.0.0', name:'Properties714', currency:'USD', locale:'en-US' };
const APP_CACHE     = { properties:[], analysis:[], comparables:[], contacts:[], lenders:[], listings:[] };
const STRIPE_CONFIG = { publishableKey:'', plans:{} };
const API_BASE      = SUPABASE_URL;
const API           = { analyzeDeal: AI_PROXY_URL, searchListings: EDGE_SEARCH, admin: EDGE_ADMIN };

// ══════════════════════════════════════