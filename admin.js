//  ADMIN — USER MANAGEMENT
// ══════════════════════════════════════
async function checkPendingCount() {
  const { data } = await SB.from('user_profiles')
    .select('id').eq('approval_status','pending');
  const count = data?.length || 0;
  document.getElementById('pending-dot').style.display = count > 0 ? 'inline-block' : 'none';
}

async function loadAdminUsers() {
  // Refresh profile from DB to get latest role
  if (CURRENT_USER) {
    const { data: freshProfile } = await SB.from('user_profiles').select('*').eq('id', CURRENT_USER.id).single();
    if (freshProfile) { CURRENT_PROFILE = freshProfile; }
  }
  if (!CURRENT_PROFILE || CURRENT_PROFILE.role !== 'admin') {
    document.getElementById('admin-pending-list').innerHTML = '<div style="padding:20px;color:var(--red);font-size:13px">⚠️ Tu cuenta no tiene rol de admin.</div>';
    return;
  }

  const pendingEl  = document.getElementById('admin-pending-list');
  const approvedEl = document.getElementById('admin-approved-list');
  pendingEl.innerHTML  = '<div style="padding:20px;color:var(--muted);font-size:13px">Loading...</div>';
  approvedEl.innerHTML = '<div style="padding:20px;color:var(--muted);font-size:13px">Loading...</div>';

  const { data: users, error } = await SB.from('user_profiles').select('*').order('created_at', {ascending:false});

  if (error) {
    pendingEl.innerHTML = `<div style="padding:20px;color:var(--red);font-size:13px">⚠️ Error: ${error.message}</div>`;
    return;
  }

  const allUsers = users || [];
  const pending  = allUsers.filter(u=>u.approval_status==='pending');
  const approved = allUsers.filter(u=>u.approval_status==='approved');
  const rejected = allUsers.filter(u=>u.approval_status==='rejected');

  document.getElementById('admin-total-count').textContent   = allUsers.length;
  document.getElementById('admin-pending-count').textContent = pending.length;
  document.getElementById('admin-approved-count').textContent= approved.length;
  document.getElementById('pending-dot').style.display = pending.length>0?'inline-block':'none';

  const statusBadge = (s) => {
    if (s==='approved') return '<span class="badge badge-green">Approved</span>';
    if (s==='pending')  return '<span class="badge badge-amber">Pending</span>';
    return '<span class="badge badge-red">Rejected</span>';
  };

  const userRow = (u, isCurrentUser) => `
    <div class="admin-user-row" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
      <div class="admin-avatar" style="width:40px;height:40px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">
        ${(u.full_name||'?').substring(0,2).toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px">${u.full_name||'Sin nombre'} ${isCurrentUser?'<span style="font-size:10px;color:var(--gold)">(tú)</span>':''}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">
          ${u.role==='admin'?'👑 Admin':'👤 Investor'} · Registrado ${new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        ${statusBadge(u.approval_status)}
        ${!isCurrentUser ? `
          ${u.approval_status!=='approved'?`<button class="btn-approve" style="padding:6px 12px;font-size:11px" onclick="adminApprove('${u.id}')">✓ Aprobar</button>`:''}
          ${u.approval_status==='approved'?`<button class="btn-reject" style="padding:6px 12px;font-size:11px" onclick="adminReject('${u.id}')">Revocar</button>`:''}
          ${u.approval_status==='pending'?`<button class="btn-reject" style="padding:6px 12px;font-size:11px" onclick="adminReject('${u.id}')">✕ Rechazar</button>`:''}
          <button onclick="adminDeleteUser('${u.id}','${(u.full_name||'este usuario').replace(/'/g,"\'")}${u.full_name}')" 
            style="padding:6px 10px;font-size:11px;background:var(--red-dim);border:1px solid var(--red);color:var(--red);border-radius:6px;cursor:pointer;font-family:inherit">
            🗑
          </button>
        ` : ''}
      </div>
    </div>`;

  // Pending section
  pendingEl.innerHTML = pending.length
    ? pending.map(u=>userRow(u, u.id===CURRENT_USER.id)).join('')
    : '<div class="empty" style="padding:20px"><p>No hay solicitudes pendientes</p></div>';

  // All users section
  approvedEl.innerHTML = allUsers.length
    ? allUsers.map(u=>userRow(u, u.id===CURRENT_USER.id)).join('')
    : '<div class="empty" style="padding:20px"><p>No hay usuarios</p></div>';
}

async function adminDeleteUser(userId, name) {
  if (!confirm(`¿Eliminar la cuenta de "${name}"? Esta acción no se puede deshacer.`)) return;
  const { error } = await SB.from('user_profiles').delete().eq('id', userId);
  if (error) { alert('Error al eliminar: '+error.message); return; }
  loadAdminUsers();
}

async function adminApprove(userId) {
  const { error } = await SB.from('user_profiles').update({
    approval_status:'approved', approved_at:new Date().toISOString()
  }).eq('id', userId);
  if (!error) loadAdminUsers();
}

async function adminReject(userId) {
  if (!confirm('Reject this user? They will not be able to access the platform.')) return;
  const { error } = await SB.from('user_profiles').update({
    approval_status:'rejected'
  }).eq('id', userId);
  if (!error) loadAdminUsers();
}

// ══════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════
async function saveProfileName() {
  const name = document.getElementById('set-name').value.trim();
  const msg = document.getElementById('settings-profile-msg');
  if (!name) return;
  const { error } = await SB.from('user_profiles').update({ full_name: name }).eq('id', CURRENT_USER.id);
  if (error) { msg.style.color='var(--red)'; msg.textContent='Error saving.'; }
  else {
    CURRENT_PROFILE.full_name = name;
    const initials = name.substring(0,2).toUpperCase();
    document.getElementById('user-avatar-initials').textContent = initials;
    document.getElementById('settings-avatar').textContent = initials;
    document.getElementById('settings-name-display').textContent = name;
    msg.style.color='var(--green)'; msg.textContent='✓ Name updated.';
  }
  msg.style.display='block';
  setTimeout(()=>msg.style.display='none', 3000);
}

async function changeEmail() {
  const email = document.getElementById('set-email').value.trim();
  const msg   = document.getElementById('settings-email-msg');
  if (!email) return;
  const { error } = await SB.auth.updateUser({ email });
  if (error) { msg.style.color='var(--red)'; msg.textContent=error.message; }
  else { msg.style.color='var(--green)'; msg.textContent='✓ Confirmation sent. Check your new email inbox.'; }
  msg.style.display='block';
  document.getElementById('set-email').value='';
}

async function changePassword() {
  const p1  = document.getElementById('set-pass').value;
  const p2  = document.getElementById('set-pass2').value;
  const msg = document.getElementById('settings-pass-msg');
  if (!p1||!p2) return;
  if (p1 !== p2) { msg.style.color='var(--red)'; msg.textContent='Passwords do not match.'; msg.style.display='block'; return; }
  if (p1.length < 6) { msg.style.color='var(--red)'; msg.textContent='Minimum 6 characters.'; msg.style.display='block'; return; }
  const { error } = await SB.auth.updateUser({ password: p1 });
  if (error) { msg.style.color='var(--red)'; msg.textContent=error.message; }
  else { msg.style.color='var(--green)'; msg.textContent='✓ Password updated successfully.'; }
  msg.style.display='block';
  document.getElementById('set-pass').value='';
  document.getElementById('set-pass2').value='';
  setTimeout(()=>msg.style.display='none', 4000);
}

async function deleteAccount() {
  const conf1 = confirm('Are you sure you want to delete your account? This is permanent.');
  if (!conf1) return;
  const conf2 = confirm('Last chance — all your properties, analysis, and contacts will be deleted forever.');
  if (!conf2) return;
  // Delete profile (cascades to all user data via FK)
  await SB.from('user_profiles').delete().eq('id', CURRENT_USER.id);
  await SB.auth.signOut();
  alert('Your account has been deleted.');
  location.reload();
}

// ══════════════════════════════════════
