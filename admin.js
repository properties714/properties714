// ══════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════

let ADMIN_USERS = [];
let ADMIN_PROPS = [];

// ══════════════════════════════════════
// LOAD ADMIN USERS (called from nav)
// ══════════════════════════════════════

async function loadAdminUsers() {
const page = document.getElementById(‘page-admin’);
if (!page) return;

// Only admins can see this
if (CURRENT_PROFILE?.role !== ‘admin’) {
page.innerHTML = ‘<div style="padding:40px;text-align:center;color:var(--muted)">⛔ Admin access required.</div>’;
return;
}

page.innerHTML = `
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
<div>
<h1 style="font-size:22px;font-weight:800">Admin Panel</h1>
<p style="color:var(--muted);font-size:13px;margin-top:4px">Manage users and approvals</p>
</div>
<div style="display:flex;gap:12px">
<div class="card" style="padding:14px 20px;text-align:center;min-width:80px">
<div style="font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace" id="admin-count-users">…</div>
<div style="font-size:11px;color:var(--muted);margin-top:2px">Users</div>
</div>
<div class="card" style="padding:14px 20px;text-align:center;min-width:80px">
<div style="font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace" id="admin-count-pending">…</div>
<div style="font-size:11px;color:var(--muted);margin-top:2px">Pending</div>
</div>
<div class="card" style="padding:14px 20px;text-align:center;min-width:80px">
<div style="font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace" id="admin-count-props">…</div>
<div style="font-size:11px;color:var(--muted);margin-top:2px">Properties</div>
</div>
</div>
</div>

```
<div class="card" style="margin-bottom:24px">
  <div style="font-size:14px;font-weight:700;margin-bottom:16px">👥 Users</div>
  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13px" id="admin-users-table">
      <thead>
        <tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">EMAIL</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">NAME</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">ROLE</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">STATUS</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">SUBSCRIPTION</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:var(--muted);font-weight:600">ACTIONS</th>
        </tr>
      </thead>
      <tbody id="admin-users-tbody">
        <tr><td colspan="6" style="padding:20px;text-align:center;color:var(--muted)">Loading...</td></tr>
      </tbody>
    </table>
  </div>
</div>
```

`;

await refreshAdminData();
}

async function refreshAdminData() {
try {
const { data: users } = await SB.from(‘user_profiles’).select(’*’).order(‘created_at’, { ascending: false });
const { data: props }  = await SB.from(‘properties’).select(‘id’).limit(500);

```
ADMIN_USERS = users || [];
ADMIN_PROPS = props || [];

const pending = ADMIN_USERS.filter(u => u.approval_status === 'pending').length;

const cu = document.getElementById('admin-count-users');
const cp = document.getElementById('admin-count-pending');
const cr = document.getElementById('admin-count-props');
if (cu) cu.textContent = ADMIN_USERS.length;
if (cp) cp.textContent = pending;
if (cr) cr.textContent = ADMIN_PROPS.length;

renderAdminUsers();
```

} catch (e) {
console.error(‘Admin data load error:’, e);
}
}

function renderAdminUsers() {
const tbody = document.getElementById(‘admin-users-tbody’);
if (!tbody) return;

if (!ADMIN_USERS.length) {
tbody.innerHTML = ‘<tr><td colspan="6" style="padding:20px;text-align:center;color:var(--muted)">No users found.</td></tr>’;
return;
}

const statusBadge = (s) => {
const map = { approved: ‘badge-green’, pending: ‘badge-amber’, rejected: ‘badge-red’ };
return `<span class="badge ${map[s] || 'badge-muted'}">${s || 'unknown'}</span>`;
};

const subBadge = (s) => {
const map = { active: ‘badge-green’, trial: ‘badge-blue’, inactive: ‘badge-red’ };
return `<span class="badge ${map[s] || 'badge-muted'}">${s || 'inactive'}</span>`;
};

tbody.innerHTML = ADMIN_USERS.map(u => `<tr style="border-bottom:1px solid var(--border)"> <td style="padding:10px 12px;font-size:12px">${u.email || '—'}</td> <td style="padding:10px 12px;font-size:12px">${u.full_name || '—'}</td> <td style="padding:10px 12px"><span class="badge badge-muted">${u.role || 'investor'}</span></td> <td style="padding:10px 12px">${statusBadge(u.approval_status)}</td> <td style="padding:10px 12px">${subBadge(u.subscription_status)}</td> <td style="padding:10px 12px"> <div style="display:flex;gap:6px;flex-wrap:wrap"> ${u.approval_status !== 'approved' ?`<button class="btn" style="padding:4px 10px;font-size:11px;background:rgba(34,232,136,0.15);border:1px solid rgba(34,232,136,0.35);color:#22e888" onclick="adminApprove('${u.id}')">✓ Approve</button>`: ''} ${u.subscription_status !== 'active' ?`<button class="btn" style="padding:4px 10px;font-size:11px;background:rgba(91,141,238,0.15);border:1px solid rgba(91,141,238,0.35);color:#5b8dee" onclick="adminActivateSub('${u.id}')">⚡ Activate</button>`: ''} ${u.approval_status !== 'rejected' ?`<button class="btn" style="padding:4px 10px;font-size:11px;background:rgba(255,92,92,0.12);border:1px solid rgba(255,92,92,0.35);color:#ff5c5c" onclick="adminReject('${u.id}')">✕ Reject</button>`: ''} </div> </td> </tr>`).join(’’);
}

// ══════════════════════════════════════
// ADMIN ACTIONS
// ══════════════════════════════════════

async function adminApprove(userId) {
const { error } = await SB.from(‘user_profiles’).update({ approval_status: ‘approved’, subscription_status: ‘active’ }).eq(‘id’, userId);
if (error) { alert(’Error: ’ + error.message); return; }
await refreshAdminData();
}

async function adminActivateSub(userId) {
const { error } = await SB.from(‘user_profiles’).update({ subscription_status: ‘active’ }).eq(‘id’, userId);
if (error) { alert(’Error: ’ + error.message); return; }
await refreshAdminData();
}

async function adminReject(userId) {
if (!confirm(‘Reject this user?’)) return;
const { error } = await SB.from(‘user_profiles’).update({ approval_status: ‘rejected’ }).eq(‘id’, userId);
if (error) { alert(’Error: ’ + error.message); return; }
await refreshAdminData();
}
