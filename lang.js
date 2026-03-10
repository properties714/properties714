// ══════════════════════════════════════
//  LANG.JS — Properties714 i18n
//  Español / English toggle
// ══════════════════════════════════════

let CURRENT_LANG = localStorage.getItem('p714_lang') || 'en';

const TRANSLATIONS = {
  en: {
    // Header
    system_online:       'System Online',
    sign_out:            'Sign Out',
    // Nav groups
    nav_overview:        'Overview',
    nav_analysis:        'Analysis',
    nav_network:         'Network',
    nav_tools:           'Tools',
    // Nav items
    nav_dashboard:       'Dashboard',
    nav_pipeline:        'Pipeline',
    nav_analyzer:        'Deal Analyzer',
    nav_repairs:         'Repair Calc',
    nav_properties:      'Properties',
    nav_crm:             'CRM',
    nav_lenders:         'Lenders',
    nav_listings:        'Listings',
    nav_scripts:         'Scripts',
    nav_docs:            'Documents',
    nav_settings:        'Settings',
    // Dashboard
    pg_dashboard_title:  'Investment Dashboard',
    pg_dashboard_sub:    'Properties714 · Real-time overview',
    btn_analyze_deal:    '⚡ Analyze Deal',
    btn_add_property:    '+ Add Property',
    stat_properties:     'Properties',
    stat_in_db:          'In database',
    stat_avg_score:      'Avg Score',
    stat_deal_quality:   'Deal quality',
    stat_total_profit:   'Total Profit Est.',
    stat_all_deals:      'All deals',
    stat_good_deals:     'Good Deals',
    stat_score_70:       'Score ≥ 70',
    section_recent_deals:'Recent Deals',
    section_strategy_mix:'Strategy Mix',
    // Zillow search
    zs_title:            '🏘 Zillow Market Search',
    zs_sub:              'Live listings in real time',
    zs_zip_label:        'ZIP Code',
    zs_city_label:       'City (optional)',
    zs_maxprice_label:   'Max Price',
    zs_count_label:      'Results',
    zs_btn:              '🔍 Search',
    zs_no_limit:         'No limit',
    zs_searching:        'Searching Zillow — this takes ~30 seconds...',
    zs_source:           'Data from Zillow via Apify',
    zs_analyze_btn:      '⚡ Analyze Deal',
    // Pipeline
    pg_pipeline_title:   'Deal Pipeline',
    pg_pipeline_sub:     'Track every property through your process',
    // Analyzer
    pg_analyzer_title:   'Deal Analyzer',
    pg_analyzer_sub:     'AI-powered · Saves to Supabase automatically',
    section_property_info:'Property Info',
    lbl_address:         'Address',
    lbl_city:            'City',
    lbl_zip:             'ZIP',
    // Financial sections
    fin_acquisition:     'Acquisition',
    fin_holding:         'Holding Costs',
    fin_selling:         'Selling Costs',
    fin_rental:          'Rent / Cashflow',
    fin_financing:       'Financing',
    // Financial labels
    lbl_asking_price:    'Asking Price',
    lbl_rehab:           'Rehab Estimate',
    lbl_closing:         'Closing Costs',
    lbl_closing_note:    '(title, escrow...)',
    lbl_inspection:      'Inspection Fee',
    lbl_months:          'Holding Months',
    lbl_hold_per_mo:     'Holding / month',
    lbl_hold_note:       '(utilities, insurance...)',
    lbl_tax:             'Property Tax / year',
    lbl_hoa:             'HOA / month',
    lbl_hoa_note:        '(if applicable)',
    holding_total_label: 'Estimated Holding Total',
    lbl_agent:           'Agent Fees',
    lbl_agent_note:      '(% of ARV)',
    lbl_staging:         'Staging / Marketing',
    lbl_rent:            'Est. Monthly Rent',
    lbl_vacancy:         'Vacancy',
    lbl_mgmt:            'Mgmt Fee',
    lbl_insurance:       'Insurance / month',
    lbl_down:            'Down Payment',
    lbl_rate:            'Interest Rate',
    lbl_term:            'Loan Term',
    lbl_points:          'Hard Money Points',
    // Months options
    months_3: '3 months', months_4: '4 months', months_5: '5 months',
    months_6: '6 months', months_8: '8 months', months_12: '12 months',
    // Term options
    term_15: '15 years', term_20: '20 years', term_30: '30 years',
    // Zillow card
    zillow_card_title:   'Zillow Link',
    zillow_card_note:    '(optional — auto-fills comps)',
    zillow_load_btn:     '→ Load',
    // Comparables
    comps_title:         'Comparables',
    comps_note:          '(for ARV)',
    btn_add_comp:        '+ Add Comparable',
    // Exit strategies
    exits_title:         'Exit Strategies',
    exits_note:          'Select the ones you want to analyze',
    exit_fix_flip:       'Fix & Flip',
    exit_fix_flip_desc:  'Buy, renovate and sell',
    exit_wholesale:      'Wholesale',
    exit_wholesale_desc: 'Assign the contract',
    exit_rental:         'Rental',
    exit_rental_desc:    'Monthly cashflow',
    exit_brrrr:          'BRRRR',
    exit_brrrr_desc:     'Buy Rehab Rent Refi Repeat',
    exit_airbnb:         'Airbnb',
    exit_airbnb_desc:    'Short-term rental',
    exit_subto:          'Subject-To',
    exit_subto_desc:     'Take over mortgage',
    exit_sf:             'Seller Finance',
    exit_sf_desc:        'Seller finances the deal',
    btn_analizar:        '⚡ Analyze Deal',
    // Results
    result_ready_title:  'Ready to analyze',
    result_ready_sub:    'Fill in the form and click Analyze',
    result_loading:      'Analyzing with AI · Calculating strategies...',
    // Repairs
    pg_repairs_title:    'Repair Calculator',
    pg_repairs_sub:      'Room-by-room rehab estimator',
    repairs_select_room: 'Select a room above',
    // Settings
    pg_settings_title:   'Account Settings',
    pg_settings_sub:     'Manage your account',
  },

  es: {
    // Header
    system_online:       'Sistema Activo',
    sign_out:            'Cerrar Sesión',
    // Nav groups
    nav_overview:        'General',
    nav_analysis:        'Análisis',
    nav_network:         'Red',
    nav_tools:           'Herramientas',
    // Nav items
    nav_dashboard:       'Dashboard',
    nav_pipeline:        'Pipeline',
    nav_analyzer:        'Analizador',
    nav_repairs:         'Calc. Reparaciones',
    nav_properties:      'Propiedades',
    nav_crm:             'CRM',
    nav_lenders:         'Prestamistas',
    nav_listings:        'Listings',
    nav_scripts:         'Scripts',
    nav_docs:            'Documentos',
    nav_settings:        'Configuración',
    // Dashboard
    pg_dashboard_title:  'Dashboard de Inversión',
    pg_dashboard_sub:    'Properties714 · Resumen en tiempo real',
    btn_analyze_deal:    '⚡ Analizar Trato',
    btn_add_property:    '+ Agregar Propiedad',
    stat_properties:     'Propiedades',
    stat_in_db:          'En base de datos',
    stat_avg_score:      'Score Promedio',
    stat_deal_quality:   'Calidad del trato',
    stat_total_profit:   'Ganancia Total Est.',
    stat_all_deals:      'Todos los tratos',
    stat_good_deals:     'Buenos Tratos',
    stat_score_70:       'Score ≥ 70',
    section_recent_deals:'Tratos Recientes',
    section_strategy_mix:'Mezcla de Estrategias',
    // Zillow search
    zs_title:            '🏘 Búsqueda Zillow',
    zs_sub:              'Propiedades en venta en tiempo real',
    zs_zip_label:        'Código ZIP',
    zs_city_label:       'Ciudad (opcional)',
    zs_maxprice_label:   'Precio Máx',
    zs_count_label:      'Resultados',
    zs_btn:              '🔍 Buscar',
    zs_no_limit:         'Sin límite',
    zs_searching:        'Buscando en Zillow — esto toma ~30 segundos...',
    zs_source:           'Datos de Zillow via Apify',
    zs_analyze_btn:      '⚡ Analizar Trato',
    // Pipeline
    pg_pipeline_title:   'Pipeline de Tratos',
    pg_pipeline_sub:     'Rastrea cada propiedad en tu proceso',
    // Analyzer
    pg_analyzer_title:   'Analizador de Tratos',
    pg_analyzer_sub:     'Impulsado por IA · Guarda en Supabase automáticamente',
    section_property_info:'Info de Propiedad',
    lbl_address:         'Dirección',
    lbl_city:            'Ciudad',
    lbl_zip:             'ZIP',
    // Financial sections
    fin_acquisition:     'Adquisición',
    fin_holding:         'Costos de Holding',
    fin_selling:         'Costos de Venta',
    fin_rental:          'Renta / Flujo de Caja',
    fin_financing:       'Financiamiento',
    // Financial labels
    lbl_asking_price:    'Precio de Venta',
    lbl_rehab:           'Rehab Estimado',
    lbl_closing:         'Closing Costs',
    lbl_closing_note:    '(título, escrow...)',
    lbl_inspection:      'Inspección',
    lbl_months:          'Meses de Holding',
    lbl_hold_per_mo:     'Holding / mes',
    lbl_hold_note:       '(servicios, seguro...)',
    lbl_tax:             'Impuesto / año',
    lbl_hoa:             'HOA / mes',
    lbl_hoa_note:        '(si aplica)',
    holding_total_label: 'Holding Total Estimado',
    lbl_agent:           'Comisión Agente',
    lbl_agent_note:      '(% del ARV)',
    lbl_staging:         'Staging / Marketing',
    lbl_rent:            'Renta Mensual Est.',
    lbl_vacancy:         'Vacancia',
    lbl_mgmt:            'Fee de Gestión',
    lbl_insurance:       'Seguro / mes',
    lbl_down:            'Enganche',
    lbl_rate:            'Tasa de Interés',
    lbl_term:            'Plazo del Préstamo',
    lbl_points:          'Puntos Hard Money',
    // Months options
    months_3: '3 meses', months_4: '4 meses', months_5: '5 meses',
    months_6: '6 meses', months_8: '8 meses', months_12: '12 meses',
    // Term options
    term_15: '15 años', term_20: '20 años', term_30: '30 años',
    // Zillow card
    zillow_card_title:   'Link de Zillow',
    zillow_card_note:    '(opcional — auto-rellena comps)',
    zillow_load_btn:     '→ Cargar',
    // Comparables
    comps_title:         'Comparables',
    comps_note:          '(para ARV)',
    btn_add_comp:        '+ Agregar Comparable',
    // Exit strategies
    exits_title:         'Estrategias de Salida',
    exits_note:          'Selecciona las que quieres analizar',
    exit_fix_flip:       'Fix & Flip',
    exit_fix_flip_desc:  'Compra, renueva y vende',
    exit_wholesale:      'Wholesale',
    exit_wholesale_desc: 'Asigna el contrato',
    exit_rental:         'Renta',
    exit_rental_desc:    'Flujo mensual',
    exit_brrrr:          'BRRRR',
    exit_brrrr_desc:     'Buy Rehab Rent Refi Repeat',
    exit_airbnb:         'Airbnb',
    exit_airbnb_desc:    'Renta corto plazo',
    exit_subto:          'Subject-To',
    exit_subto_desc:     'Toma la hipoteca',
    exit_sf:             'Seller Finance',
    exit_sf_desc:        'Vendedor financia',
    btn_analizar:        '⚡ Analizar Trato',
    // Results
    result_ready_title:  'Listo para analizar',
    result_ready_sub:    'Llena el formulario y haz clic en Analizar',
    result_loading:      'Analizando con IA · Calculando estrategias...',
    // Repairs
    pg_repairs_title:    'Calculadora de Reparaciones',
    pg_repairs_sub:      'Estimado cuarto por cuarto',
    repairs_select_room: 'Selecciona un cuarto arriba',
    // Settings
    pg_settings_title:   'Configuración de Cuenta',
    pg_settings_sub:     'Gestiona tu cuenta',
  }
};

// ── Apply translations ──
function applyLang(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem('p714_lang', lang);
  const T = TRANSLATIONS[lang];

  // Update all data-t elements
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    if (T[key] !== undefined) el.textContent = T[key];
  });

  // Update select options that need translation
  const monthsSel = document.getElementById('f-months');
  if (monthsSel) {
    const monthKeys = ['months_3','months_4','months_5','months_6','months_8','months_12'];
    Array.from(monthsSel.options).forEach((opt, i) => {
      if (monthKeys[i]) opt.text = T[monthKeys[i]] || opt.text;
    });
  }
  const termSel = document.getElementById('f-term');
  if (termSel) {
    const termKeys = ['term_15','term_20','term_30'];
    Array.from(termSel.options).forEach((opt, i) => {
      if (termKeys[i]) opt.text = T[termKeys[i]] || opt.text;
    });
  }

  // Update stat labels in dashboard (dynamic elements)
  const statLabels = {
    's-props-label': 'stat_properties',
    's-props-note':  'stat_in_db',
    's-score-label': 'stat_avg_score',
    's-score-note':  'stat_deal_quality',
    's-profit-label':'stat_total_profit',
    's-profit-note': 'stat_all_deals',
    's-good-label':  'stat_good_deals',
    's-good-note':   'stat_score_70',
  };
  Object.entries(statLabels).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && T[key]) el.textContent = T[key];
  });

  // Update placeholder texts
  const placeholders = {
    'f-addr':   lang==='es' ? '123 Peachtree St NE, Atlanta' : '123 Peachtree St NE, Atlanta',
    'f-city':   lang==='es' ? 'Atlanta' : 'Atlanta',
  };

  // Update toggle button
  const flag  = document.getElementById('lang-flag');
  const label = document.getElementById('lang-label');
  if (flag && label) {
    flag.textContent  = lang === 'es' ? '🇺🇸' : '🇲🇽';
    label.textContent = lang === 'es' ? 'EN' : 'ES';
  }

  // Update result placeholder if visible
  const rph = document.getElementById('result-placeholder');
  if (rph && rph.style.display !== 'none') {
    const rTitle = rph.querySelector('h3');
    const rSub   = rph.querySelector('p');
    if (rTitle) rTitle.textContent = T.result_ready_title || 'Ready to analyze';
    if (rSub)   rSub.textContent   = T.result_ready_sub   || 'Fill in the form and click Analyze';
  }

  // Update loading text
  const loadEl = document.getElementById('result-loading');
  if (loadEl) {
    const txt = loadEl.querySelector('div:not(.dots)') || loadEl;
    // update via innerHTML safely
    loadEl.innerHTML = `<div class="loading-bar"><div class="dots"><span></span><span></span><span></span></div>${T.result_loading}</div>`;
  }
}

function toggleLang() {
  applyLang(CURRENT_LANG === 'en' ? 'es' : 'en');
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
  applyLang(CURRENT_LANG);
});
