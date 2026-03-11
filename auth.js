// ══════════════════════════════════════
//  AUTH SCREENS
// ══════════════════════════════════════

function showScreen(name) {
  document.getElementById('auth-screen').style.display    = name==='auth'    ? 'flex' : 'none';
  document.getElementById('pending-screen').style.display = name==='pending' ? 'flex' : 'none';
  document.getElementById('main-app').style.display       = name==='app'     ? 'block': 'none';
}

// ══════════════════════════════════════
//  PASSWORD RESET
// ══════════════════════════════════════

function showResetPasswordModal() {
  const overlay = document.getElementById('reset-password-overlay');
  overlay.style.display = 'flex';
  document.getElementById('auth-screen').style.display = 'none';
}

async function doResetPassword() {

  const p1  = document.getElementById('reset-pass1').value;
  const p2  = document.getElementById('reset-pass2').value;
  const err = document.getElementById('reset-error');
  const suc = document.getElementById('reset-success');
  const btn = document.getElementById('reset-btn');

  err.style.display = 'none';

  if (!p1 || !p2) {
    err.textContent = 'Please fill both fields.';
    err.style.display = 'block';
    return;
  }

  if (p1 !== p2) {
    err.textContent = 'Passwords do not match.';
    err.style.display = 'block';
    return;
  }

  if (p1.length < 6) {
    err.textContent = 'Minimum 6 characters.';
    err.style.display = 'block';
    return;
  }

  btn.textContent = 'Updating...';
  btn.disabled = true;

  const { data, error } = await SB.auth.updateUser({ password: p1 });

  btn.textContent = 'Update Password →';
  btn.disabled = false;

  if (error) {
    err.textContent = error.message;
    err.style.display = 'block';
  } else {

    suc.style.display = 'block';
    btn.style.display = 'none';

    setTimeout(() => {

      history.replaceState(null, '', window.location.pathname);
      document.getElementById('reset-password-overlay').style.display = 'none';

      if (data?.user) handleUser(data.user);
      else showScreen('auth');

    }, 2000);
  }
}

// ══════════════════════════════════════
//  FORGOT PASSWORD
// ══════════════════════════════════════

function showForgotPassword() {

  document.getElementById('form-login').style.display = 'none';
  document.getElementById('form-register').style.display = 'none';
  document.getElementById('form-forgot').style.display = 'block';

  document.getElementById('forgot-error').style.display = 'none';
  document.getElementById('forgot-success').style.display = 'none';

  const loginEmail = document.getElementById('login-email').value;

  if (loginEmail)
    document.getElementById('forgot-email').value = loginEmail;
}

async function doForgotPassword() {

  const email = document.getElementById('forgot-email').value.trim();
  const errEl = document.getElementById('forgot-error');
  const sucEl = document.getElementById('forgot-success');
  const btn   = document.getElementById('forgot-btn');

  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!email) {
    errEl.textContent = 'Please enter your email.';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const { error } = await SB.auth.resetPasswordForEmail(email,{
    redirectTo: window.location.origin + window.location.pathname
  });

  btn.textContent = 'Send Reset Link →';
  btn.disabled = false;

  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = 'block';
  } else {
    sucEl.style.display = 'block';
    btn.style.display = 'none';
  }
}

// ══════════════════════════════════════
//  LOGIN / REGISTER
// ══════════════════════════════════════

function switchAuthTab(tab) {

  document.getElementById('tab-login').classList.toggle('active', tab==='login');
  document.getElementById('tab-register').classList.toggle('active', tab==='register');

  document.getElementById('form-login').style.display    = tab==='login'    ? 'flex':'none';
  document.getElementById('form-register').style.display = tab==='register' ? 'flex':'none';
}

async function doLogin() {

  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');

  errEl.style.display='none';

  if (!email || !pass) {
    errEl.textContent='Enter email and password.';
    errEl.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Signing in...';

  const { data, error } =
    await SB.auth.signInWithPassword({ email, password: pass });

  btn.disabled=false;
  btn.textContent='Sign In →';

  if (error) {
    errEl.textContent=error.message;
    errEl.style.display='block';
    return;
  }

  await handleUser(data.user);
}

async function doRegister() {

  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;

  const errEl = document.getElementById('reg-error');
  const sucEl = document.getElementById('reg-success');
  const btn   = document.getElementById('reg-btn');

  errEl.style.display='none';
  sucEl.style.display='none';

  if (!name || !email || !pass) {
    errEl.textContent='All fields required.';
    errEl.style.display='block';
    return;
  }

  if (pass.length < 6) {
    errEl.textContent='Password must be at least 6 characters.';
    errEl.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Sending request...';

  const { data, error } = await SB.auth.signUp({
    email,
    password: pass,
    options: { data: { full_name: name } }
  });

  btn.disabled=false;
  btn.textContent='Request Access →';

  if (error) {
    errEl.textContent=error.message;
    errEl.style.display='block';
    return;
  }

  sucEl.style.display='block';

  if (data.session)
    await handleUser(data.user);
}

// ══════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════

async function doLogout() {

  await SB.auth.signOut();

  CURRENT_USER = null;
  CURRENT_PROFILE = null;

  DB.properties=[];
  DB.analysis=[];
  DB.contacts=[];

  showScreen('auth');
}

// ══════════════════════════════════════
//  USER ROUTING (APPROVAL + SUBSCRIPTION)
// ══════════════════════════════════════

async function handleUser(user) {

  CURRENT_USER = user;

  let { data: profile } =
    await SB.from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

  if (!profile) {

    await SB.from('user_profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      approval_status: 'pending',
      subscription_status: 'inactive'
    });

    const { data: fresh } =
      await SB.from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    profile = fresh;
  }

  CURRENT_PROFILE = profile;

  if (profile.approval_status === 'pending') {

    document.getElementById('pending-email-show').textContent = user.email;
    showScreen('pending');

    const poll = setInterval(async () => {

      const { data: p } =
        await SB.from('user_profiles')
          .select('approval_status')
          .eq('id', user.id)
          .single();

      if (p?.approval_status === 'approved') {

        clearInterval(poll);

        enterApp(user, { ...profile, ...p });
      }

    },20000);

    return;
  }

  if (profile.approval_status === 'rejected') {

    await SB.auth.signOut();

    const errEl = document.getElementById('login-error');

    errEl.textContent =
      'Your access request was not approved. Contact the administrator.';

    errEl.style.display='block';

    showScreen('auth');

    return;
  }

  // ── SaaS subscription check ──

  if (profile.approval_status === 'approved') {

    const sub = profile.subscription_status || 'inactive';

    if (sub === 'active' || sub === 'trial') {

      enterApp(user, profile);
      return;
    }

    showScreen('auth');

    const errEl = document.getElementById('login-error');

    errEl.textContent =
      'Your account is approved but no active subscription was found.';

    errEl.style.display = 'block';

    return;
  }
}

// ══════════════════════════════════════
//  ENTER APP
// ══════════════════════════════════════

function enterApp(user, profile) {

  CURRENT_USER = user;
  CURRENT_PROFILE = profile;

  showScreen('app');

  const initials =
    (profile?.full_name || user.email || 'U')
      .substring(0,2)
      .toUpperCase();

  document.getElementById('user-avatar-initials').textContent = initials;
  document.getElementById('user-email-display').textContent   = user.email;

  document.getElementById('settings-avatar').textContent      = initials;
  document.getElementById('settings-name-display').textContent = profile?.full_name || user.email;
  document.getElementById('settings-email-display').textContent = user.email;

  document.getElementById('set-name').value =
    profile?.full_name || '';

  const roleBadge =
    document.getElementById('settings-role-badge');

  roleBadge.innerHTML =
    profile?.role === 'admin'
      ? '<span class="badge badge-gold">Admin</span>'
      : '<span class="badge badge-muted">Investor</span>';

  if (profile?.role === 'admin') {

    document.getElementById('admin-nav-group').style.display = 'block';

    checkPendingCount();
  }

  loadUserData();
  renderDashboard();
  renderScripts();
  renderDocs();
}

// ══════════════════════════════════════
//  SESSION CHECK
// ══════════════════════════════════════

SB.auth.getSession().then(({ data: { session } }) => {

  if (session)
    handleUser(session.user);

  else
    showScreen('auth');
});

SB.auth.onAuthStateChange((_event, session) => {

  if (_event === 'PASSWORD_RECOVERY') {

    showResetPasswordModal();
    return;
  }

  if (_event === 'SIGNED_IN' && session && !CURRENT_USER)
    handleUser(session.user);

  if (_event === 'SIGNED_OUT') {

    CURRENT_USER = null;
    CURRENT_PROFILE = null;

    showScreen('auth');
  }
});

// ══════════════════════════════════════
//  RESET TOKEN DETECTION
// ══════════════════════════════════════

(function checkResetToken() {

  const hash = window.location.hash;

  if (hash && hash.includes('type=recovery')) {

    window._resetMode = true;

    document.getElementById('auth-screen').style.display = 'none';

  } else if (hash && hash.includes('error=access_denied')) {

    showScreen('auth');

    const errEl = document.getElementById('login-error');

    errEl.textContent =
      'Reset link expired. Please request a new one.';

    errEl.style.display = 'block';

    history.replaceState(null,'',window.location.pathname);

  } else if (hash === '#') {

    history.replaceState(null,'',window.location.pathname);
  }

})();
