// ══════════════════════════════════════
//  REPAIR CALCULATOR
// ══════════════════════════════════════

const ROOMS = [
  { id:'kitchen', icon:'🍳', name:'Kitchen', items:[
    {n:'Cabinets (full replace)',c:8000},{n:'Cabinet refinish/paint',c:1800},
    {n:'Countertops (granite)',c:3500},{n:'Countertops (laminate)',c:1200},
    {n:'Appliances (full set)',c:4000},{n:'Refrigerator only',c:1200},
    {n:'Stove/Range',c:800},{n:'Dishwasher',c:600},{n:'Microwave',c:250},
    {n:'Sink & faucet',c:600},{n:'Plumbing fixtures',c:1200},
    {n:'Flooring (tile)',c:2000},{n:'Flooring (LVP)',c:1500},
    {n:'Paint',c:800},{n:'Backsplash',c:600},{n:'Lighting fixtures',c:400},
    {n:'Garbage disposal',c:250},{n:'Exhaust fan',c:200}
  ]},

  { id:'bathroom1', icon:'🚿', name:'Bathroom 1', items:[
    {n:'Vanity & sink',c:1500},{n:'Toilet',c:600},{n:'Shower/tub combo',c:3000},
    {n:'Walk-in shower',c:4500},{n:'Bathtub only',c:1800},
    {n:'Tile flooring',c:1200},{n:'Shower tile',c:2000},
    {n:'Fixtures (faucets)',c:800},{n:'Towel bars & hardware',c:300},
    {n:'Paint',c:400},{n:'Mirror',c:200},{n:'Exhaust fan',c:250},
    {n:'Light fixture',c:300},{n:'Caulking & grout',c:350}
  ]},

  { id:'bathroom2', icon:'🛁', name:'Bathroom 2', items:[
    {n:'Vanity & sink',c:1500},{n:'Toilet',c:600},{n:'Shower/tub combo',c:3000},
    {n:'Walk-in shower',c:4500},{n:'Bathtub only',c:1800},
    {n:'Tile flooring',c:1200},{n:'Shower tile',c:2000},
    {n:'Fixtures (faucets)',c:800},{n:'Towel bars & hardware',c:300},
    {n:'Paint',c:400},{n:'Mirror',c:200},{n:'Exhaust fan',c:250},
    {n:'Light fixture',c:300},{n:'Caulking & grout',c:350}
  ]},

  { id:'halfbath', icon:'🪥', name:'Half Bath', items:[
    {n:'Vanity & sink',c:900},{n:'Toilet',c:600},{n:'Tile flooring',c:700},
    {n:'Fixtures',c:400},{n:'Paint',c:250},{n:'Mirror',c:150},{n:'Light fixture',c:200}
  ]},

  { id:'master', icon:'🛏', name:'Master Bedroom', items:[
    {n:'Flooring (hardwood)',c:2500},{n:'Flooring (carpet)',c:1200},{n:'Flooring (LVP)',c:1800},
    {n:'Paint',c:600},{n:'Closet (walk-in build-out)',c:2500},{n:'Closet (standard)',c:800},
    {n:'Lighting',c:400},{n:'Ceiling fan',c:350},{n:'Trim & baseboards',c:500},
    {n:'Windows (per window)',c:600},{n:'Doors (interior)',c:300}
  ]},

  { id:'bedroom2', icon:'🛏', name:'Bedroom 2', items:[
    {n:'Flooring (hardwood)',c:1800},{n:'Flooring (carpet)',c:900},{n:'Flooring (LVP)',c:1400},
    {n:'Paint',c:500},{n:'Closet',c:700},{n:'Lighting / ceiling fan',c:350},
    {n:'Trim & baseboards',c:400},{n:'Windows (per window)',c:600},{n:'Door',c:300}
  ]},

  { id:'bedroom3', icon:'🛏', name:'Bedroom 3', items:[
    {n:'Flooring (hardwood)',c:1800},{n:'Flooring (carpet)',c:900},{n:'Flooring (LVP)',c:1400},
    {n:'Paint',c:500},{n:'Closet',c:700},{n:'Lighting / ceiling fan',c:350},
    {n:'Trim & baseboards',c:400},{n:'Windows (per window)',c:600},{n:'Door',c:300}
  ]},

  { id:'bedroom4', icon:'🛏', name:'Bedroom 4', items:[
    {n:'Flooring (hardwood)',c:1800},{n:'Flooring (carpet)',c:900},{n:'Flooring (LVP)',c:1400},
    {n:'Paint',c:500},{n:'Closet',c:700},{n:'Lighting / ceiling fan',c:350},
    {n:'Trim & baseboards',c:400},{n:'Windows (per window)',c:600},{n:'Door',c:300}
  ]},

  { id:'living', icon:'🛋', name:'Living Room', items:[
    {n:'Flooring (hardwood)',c:3500},{n:'Flooring (LVP)',c:2500},{n:'Flooring (carpet)',c:1800},
    {n:'Paint',c:800},{n:'Trim & baseboards',c:600},{n:'Crown molding',c:1200},
    {n:'Lighting fixtures',c:500},{n:'Ceiling fan',c:350},{n:'Windows',c:1200},
    {n:'Fireplace (refurbish)',c:2000},{n:'Fireplace (new)',c:5000}
  ]},

  { id:'dining', icon:'🍽️', name:'Dining Room', items:[
    {n:'Flooring (hardwood)',c:2500},{n:'Flooring (LVP)',c:1800},
    {n:'Paint',c:600},{n:'Light fixture / chandelier',c:800},
    {n:'Trim & baseboards',c:500},{n:'Windows',c:1200}
  ]},

  { id:'laundry', icon:'🧺', name:'Laundry Room', items:[
    {n:'Washer hookup',c:400},{n:'Dryer hookup / vent',c:350},
    {n:'Washer & dryer (new)',c:1400},{n:'Cabinets',c:1200},
    {n:'Flooring (tile)',c:800},{n:'Utility sink',c:500},{n:'Paint',c:300}
  ]},

  { id:'garage', icon:'🚗', name:'Garage', items:[
    {n:'Garage door (new)',c:1800},{n:'Garage door opener',c:450},
    {n:'Epoxy floor coat',c:1200},{n:'Drywall & paint',c:1500},
    {n:'Electrical outlets',c:400},{n:'Insulation',c:800},{n:'Side door',c:500}
  ]},

  { id:'exterior', icon:'🏠', name:'Exterior', items:[
    {n:'Roof (full replace)',c:12000},{n:'Roof (repair patches)',c:2500},
    {n:'Gutters (full)',c:2000},{n:'Paint / siding',c:4000},
    {n:'Vinyl siding',c:8000},{n:'Brick repoint',c:3000},
    {n:'Landscaping (basic)',c:1500},{n:'Landscaping (full)',c:4000},
    {n:'Driveway (asphalt)',c:3000},{n:'Driveway (concrete)',c:5000},
    {n:'Walkway/path',c:1200},{n:'Fence (wood)',c:3500},{n:'Fence (chain link)',c:1800},
    {n:'Front door',c:1200},{n:'Back door',c:800},{n:'Windows (per window)',c:600},
    {n:'Deck/porch (new)',c:8000},{n:'Deck repair',c:2000},
    {n:'Foundation repair',c:6000},{n:'Grading/drainage',c:2500}
  ]},

  { id:'systems', icon:'⚙️', name:'Mechanical Systems', items:[
    {n:'HVAC (full system)',c:8000},{n:'HVAC (unit only)',c:4500},{n:'AC only',c:3500},
    {n:'Furnace only',c:2800},{n:'Ductwork',c:3500},{n:'Mini-split (per unit)',c:2200},
    {n:'Electrical panel (200A)',c:4000},{n:'Rewire (full)',c:12000},
    {n:'Outlets & switches',c:1500},{n:'Smoke/CO detectors',c:400},
    {n:'Plumbing (full repipe)',c:8000},{n:'Plumbing (partial)',c:3000},
    {n:'Water heater (tank)',c:1200},{n:'Water heater (tankless)',c:2200},
    {n:'Sewer line repair',c:4000},{n:'Insulation (attic)',c:2500},
    {n:'Insulation (walls)',c:4000},{n:'Vapor barrier',c:1500}
  ]},

  { id:'permits', icon:'📋', name:'Permits & Misc', items:[
    {n:'Building permits',c:1500},{n:'Inspection fees',c:500},
    {n:'Dumpster (2 loads)',c:800},{n:'Cleaning (full house)',c:600},
    {n:'Pest inspection',c:200},{n:'Termite treatment',c:800},
    {n:'Mold remediation',c:3500},{n:'Lead paint remediation',c:4000},
    {n:'Asbestos removal',c:5000},{n:'Carpet removal',c:500},
    {n:'Popcorn ceiling removal',c:1500},{n:'Stair railing',c:800},
    {n:'Interior doors (all)',c:2500},{n:'Hardware (all)',c:600},
    {n:'Staging (basic)',c:1500}
  ]},
];

const repairState = {};
let activeRoom = null;



function initRepairs(){

  const sel = document.getElementById('room-selector');

  sel.innerHTML = ROOMS.map(r => {

    const total = Object.values(repairState[r.id] || {})
      .reduce((s,c)=>s+c,0);

    return `
    <div class="room-card ${activeRoom===r.id?'active':''}"
    onclick="selectRoom('${r.id}')">

      <div class="room-icon">${r.icon}</div>

      <div class="room-name">${r.name}</div>

      <div class="room-cost">
        ${total>0 ? '$'+total.toLocaleString() : '—'}
      </div>

    </div>`;
  }).join('');

  updateRepairTotal();
}



function selectRoom(rid){

  activeRoom = rid;

  const room = ROOMS.find(r=>r.id===rid);

  if (!repairState[rid]) repairState[rid] = {};

  document.getElementById('active-room-title').textContent =
    room.icon + ' ' + room.name + ' — Repair Items';

  document.getElementById('repair-total-bar').style.display = 'flex';

  document.getElementById('repair-items-list').innerHTML =
    room.items.map(item => {

      const checked = repairState[rid][item.n] !== undefined;

      const cost = repairState[rid][item.n] || item.c;

      return `
      <div class="repair-item">

        <div class="repair-check ${checked?'checked':''}"
        onclick="toggleRepair('${rid}','${item.n}',${item.c})">
        </div>

        <div class="repair-name">${item.n}</div>

        <input
          class="form-input repair-cost-input"
          type="number"
          value="${cost}"
          onchange="updateRepairCost('${rid}','${item.n}',this.value)"
          style="font-size:12px;padding:7px 10px;text-align:right">

      </div>
      `;
    }).join('');

  initRepairs();
}



function toggleRepair(rid,name,defaultCost){

  if(!repairState[rid]) repairState[rid] = {};

  if(repairState[rid][name] !== undefined){

    delete repairState[rid][name];

  }else{

    repairState[rid][name] = defaultCost;

  }

  selectRoom(rid);
}



function updateRepairCost(rid,name,val){

  if(repairState[rid] && repairState[rid][name] !== undefined){

    repairState[rid][name] = parseFloat(val) || 0;

    updateRepairTotal();

  }

}



function updateRepairTotal(){

  let grand = 0;

  Object.values(repairState)
    .forEach(room => {

      Object.values(room)
        .forEach(c => grand += c);

    });

  document.getElementById('repair-total-hd').textContent =
    '$'+grand.toLocaleString();

  document.getElementById('repair-grand-total').textContent =
    '$'+grand.toLocaleString();
}



function exportRepairs(){

  let txt = 'PROPERTIES714 — REPAIR ESTIMATE\n\n';

  let grand = 0;

  ROOMS.forEach(r => {

    const items = repairState[r.id] || {};

    if(Object.keys(items).length){

      const sub = Object.values(items)
        .reduce((s,c)=>s+c,0);

      grand += sub;

      txt += `${r.name.toUpperCase()}: $${sub.toLocaleString()}\n`;

      Object.entries(items)
        .forEach(([n,c])=>{
          txt += `  ${n}: $${c.toLocaleString()}\n`;
        });

      txt += '\n';

    }

  });

  txt += `GRAND TOTAL: $${grand.toLocaleString()}`;

  const blob = new Blob([txt],{type:'text/plain'});

  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);

  a.download = 'repair-estimate.txt';

  a.click();

}

// ══════════════════════════════════════
