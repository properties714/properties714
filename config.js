// ══════════════════════════════════════
//  PROPERTIES714 — CONFIG
// ══════════════════════════════════════

const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── n8n Webhooks (all API calls go here) ──
const N8N_BASE      = 'https://n8n.properties714.com/webhook';
const N8N_ANALYZE   = `${N8N_BASE}/gpai-analyze-deal`;
const N8N_SEARCH    = `${N8N_BASE}/gpai-search-listings`;
const N8N_PIPELINE  = `${N8N_BASE}/gpai-pipeline`;
const N8N_GET_DEAL  = `${N8N_BASE}/gpai-get-deal`;
const N8N_ADMIN     = `${N8N_BASE}/gpai-admin-users`;
const N8N           = N8N_ANALYZE; // backward compat

// ── Apify ──
const APIFY_TOKEN = 'apify_api_D4l6yd2A05N9HfC9ehyUOXZJznh7002SUDb5';

// ── Supabase Client ──
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Global State ──
let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ══════════════════════════════════════
