// ══════════════════════════════════════
//  ADMIN.JS — Properties714
//  Main app admin panel
// ══════════════════════════════════════

async function loadAdminUsers() {
  const page = document.getElementById('page-admin');
  if (!page) return;

  if (CURRENT_PROFILE?.role !== 'admin') {
    page.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">⛔ Admin access required.</div>';
    return;
  }

  page.innerHTML = `
    <div style="max-width:700px">
      <h1 style="font-size:22px;font-weight:800;margin-bottom:6px">Admin Panel</h1>
      <p style="color:var(--muted);font-size:13px;margin-bottom:24px">User management & approvals</p>

      <div class="card" style="margin-bottom:20px;border:1px solid rgba(245,200,66,0.3);background:rgba(245,200,66,0.06)">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:32px">🛡</div>
          <div style="flex:1">
            <div style="font-weight:700;margin-bottom:4px">Admin Dashboard completo</div>
            <div style="font-size:12px;color:var(--muted)">Para ver todos los usuarios, aprobar/rechazar y gestión avanzada usa el panel dedicado.</div>
          </div>
          <a href="https://adminzeus-adminproperties714.wutpdd.easypanel.host" target="_blank"
            class="btn btn-gold" style="text-decoration:none;white-space:nowrap">
            Abrir Admin ↗
          </a>
        </div>
      </div>

      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:16px">👤 Tu cuenta</div>
        <div style="display:grid;gap:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="color:var(--muted)">Email</span><span>${CURRENT_USER?.email || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="color:var(--muted)">Rol</span><span class="badge badge-gold">Admin</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0">
            <span style="color:var(--muted)">ID</span>
            <span style="font-family:monospace;font-size:11px;color:var(--muted)">${CURRENT_USER?.id || '—'}</span>
          </div>
        </div>
      </div>
    </div>`;
}
