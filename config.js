// ══════════════════════════════════════
//  CONFIG — CORE APP SETTINGS
// ══════════════════════════════════════


// ──────────────────────────────────────
//  SUPABASE
// ──────────────────────────────────────

const SUPABASE_URL =
'https://euvbddxunitgiqduckwf.supabase.co';

const SUPABASE_ANON =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmJkZHh1bml0Z2lxZHVja3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjMyMDQsImV4cCI6MjA4ODM5OTIwNH0.Fq3UwLA_VCPaoA7fShgT8nCk9xXw1sNENoZ_jZyz6Qs';


// ── Supabase Client
const { createClient } = supabase;
const SB = createClient(SUPABASE_URL, SUPABASE_ANON);


// ──────────────────────────────────────
//  EDGE FUNCTIONS
// ──────────────────────────────────────

const API_BASE = `${SUPABASE_URL}/functions/v1`;

const API = {

  analyzeDeal: `${API_BASE}/analyze-deal`,

  searchListings: `${API_BASE}/search-listings`,

  pipeline: `${API_BASE}/pipeline`,

  admin: `${API_BASE}/admin`,

  aiAdvisor: `${API_BASE}/ai-advisor`,

  zillowData: `${API_BASE}/zillow-data`

};


// ──────────────────────────────────────
//  STRIPE (SAAS PAYMENTS)
// ──────────────────────────────────────

const STRIPE_CONFIG = {

  publishableKey: "pk_live_REPLACE",

  plans: {

    starter: "price_starter",

    pro: "price_pro",

    enterprise: "price_enterprise"

  }

};


// ──────────────────────────────────────
//  OPENAI SETTINGS
// ──────────────────────────────────────

const AI_CONFIG = {

  model: "gpt-4o",

  temperature: 0.2,

  maxTokens: 1200

};


// ──────────────────────────────────────
//  MARKET DATA APIs
// ──────────────────────────────────────

const DATA_PROVIDERS = {

  zillow: true,

  rentEstimate: true,

  comps: true

};


// ──────────────────────────────────────
//  GLOBAL APP STATE
// ──────────────────────────────────────

let CURRENT_USER = null;

let CURRENT_PROFILE = null;


// ──────────────────────────────────────
//  APP CACHE
// ──────────────────────────────────────

const APP_CACHE = {

  properties: [],

  analysis: [],

  comparables: [],

  contacts: [],

  lenders: [],

  listings: []

};


// ──────────────────────────────────────
//  APP SETTINGS
// ──────────────────────────────────────

const APP_CONFIG = {

  version: "1.0.0",

  name: "Properties714",

  environment: "production",

  currency: "USD",

  locale: "en-US"

};


// ══════════════════════════════════════
