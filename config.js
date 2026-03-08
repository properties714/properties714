// ══════════════════════════════════════
//  CONFIG — REPLACE WITH YOUR VALUES
// ══════════════════════════════════════
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';
const N8N_ANALYZE  = 'https://n8n.properties714.com/webhook/gpai-analyze-deal';
const N8N_GET_DEAL = 'https://n8n.properties714.com/webhook/gpai-get-deal';
const N8N_PIPELINE = 'https://n8n.properties714.com/webhook/gpai-pipeline';
const N8N = N8N_ANALYZE; // backward compat
const N8N_SEARCH   = 'https://n8n.properties714.com/webhook/gpai-search-listings';
const APIFY_TOKEN  = 'apify_api_D4l6yd2A05N9HfC9ehyUOXZJznh7002SUDb5';

// ── Init Supabase ──
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);

let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ══════════════════════════════════════
