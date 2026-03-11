// ══════════════════════════════════════
//  CONFIG — CORE APP SETTINGS
// ══════════════════════════════════════

// ── Supabase Project ──
const SUPABASE_URL  = 'https://euvbddxunitgiqduckwf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';

// ── Supabase Client ──
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Edge Function Endpoints ──
// These replace all previous n8n webhooks
const API_BASE = `${SUPABASE_URL}/functions/v1`;

const API_ANALYZE   = `${API_BASE}/analyze-deal`;
const API_SEARCH    = `${API_BASE}/search-listings`;
const API_PIPELINE  = `${API_BASE}/pipeline`;
const API_ADMIN     = `${API_BASE}/admin`;

// ── App State ──
let CURRENT_USER    = null;
let CURRENT_PROFILE = null;

// ══════════════════════════════════════
