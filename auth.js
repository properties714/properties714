// ══════════════════════════════════════
//  AUTH SCREENS
// ══════════════════════════════════════

function showScreen(name){

  const auth = document.getElementById('auth-screen');
  const pending = document.getElementById('pending-screen');
  const app = document.getElementById('main-app');

  if(auth) auth.style.display = name === 'auth' ? 'flex' : 'none';
  if(pending) pending.style.display = name === 'pending' ? 'flex' : 'none';
  if(app) app.style.display = name === 'app' ? 'block' : 'none';
}


// ══════════════════════════════════════
// PASSWORD RESET
// ══════════════════════════════════════

function showResetPasswordModal(){

  const overlay = document.getElementById('reset-password-overlay');
  if(!overlay) return;

  overlay.style.display = 'flex';

  const auth = document.getElementById('auth-screen');
  if(auth) auth.style.display = 'none';
}


async function doResetPassword(){

  const p1 = document.getElementById('reset-pass1').value;
  const p2 = document.getElementById('reset-pass2').value;

  const err = document.getElementById('reset-error');
  const suc = document.getElementById('reset-success');
  const btn = document.getElementById('reset-btn');

  err.style.display='none';

  if(!p1 || !p2){
    err.textContent='Please fill both fields.';
    err.style.display='block';
    return;
  }

  if(p1!==p2){
    err.textContent='Passwords do not match.';
    err.style.display='block';
    return;
  }

  if(p1.length<6){
    err.textContent='Minimum 6 characters.';
    err.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Updating...';

  const {data,error} =
    await SB.auth.updateUser({password:p1});

  btn.disabled=false;
  btn.textContent='Update Password →';

  if(error){

    err.textContent=error.message;
    err.style.display='block';

  }else{

    suc.style.display='block';
    btn.style.display='none';

    setTimeout(()=>{

      history.replaceState(null,'',window.location.pathname);

      const overlay =
        document.getElementById('reset-password-overlay');

      if(overlay) overlay.style.display='none';

      if(data?.user)
        handleUser(data.user);
      else
        showScreen('auth');

    },2000);
  }
}


// ══════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════

function showForgotPassword(){

  document.getElementById('form-login').style.display='none';
  document.getElementById('form-register').style.display='none';
  document.getElementById('form-forgot').style.display='block';

  document.getElementById('forgot-error').style.display='none';
  document.getElementById('forgot-success').style.display='none';
}


async function doForgotPassword(){

  const email =
    document.getElementById('forgot-email').value.trim();

  const err =
    document.getElementById('forgot-error');

  const suc =
    document.getElementById('forgot-success');

  const btn =
    document.getElementById('forgot-btn');

  err.style.display='none';
  suc.style.display='none';

  if(!email){
    err.textContent='Please enter your email.';
    err.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Sending...';

  const {error} =
    await SB.auth.resetPasswordForEmail(email,{
      redirectTo:window.location.origin+window.location.pathname
    });

  btn.disabled=false;
  btn.textContent='Send Reset Link →';

  if(error){
    err.textContent=error.message;
    err.style.display='block';
  }else{
    suc.style.display='block';
    btn.style.display='none';
  }
}


// ══════════════════════════════════════
// LOGIN / REGISTER
// ══════════════════════════════════════

function switchAuthTab(tab){

  document.getElementById('tab-login')
    .classList.toggle('active',tab==='login');

  document.getElementById('tab-register')
    .classList.toggle('active',tab==='register');

  document.getElementById('form-login').style.display =
    tab==='login'?'flex':'none';

  document.getElementById('form-register').style.display =
    tab==='register'?'flex':'none';
}


// LOGIN

async function doLogin(){

  const email =
    document.getElementById('login-email').value.trim();

  const pass =
    document.getElementById('login-pass').value;

  const err =
    document.getElementById('login-error');

  const btn =
    document.getElementById('login-btn');

  err.style.display='none';

  if(!email||!pass){
    err.textContent='Enter email and password.';
    err.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Signing in...';

  const {data,error} =
    await SB.auth.signInWithPassword({
      email,
      password:pass
    });

  btn.disabled=false;
  btn.textContent='Sign In →';

  if(error){
    err.textContent=error.message;
    err.style.display='block';
    return;
  }

  await handleUser(data.user);
}


// REGISTER

async function doRegister(){

  const name =
    document.getElementById('reg-name').value.trim();

  const email =
    document.getElementById('reg-email').value.trim();

  const pass =
    document.getElementById('reg-pass').value;

  const err =
    document.getElementById('reg-error');

  const suc =
    document.getElementById('reg-success');

  const btn =
    document.getElementById('reg-btn');

  err.style.display='none';
  suc.style.display='none';

  if(!name||!email||!pass){
    err.textContent='All fields required.';
    err.style.display='block';
    return;
  }

  if(pass.length<6){
    err.textContent='Password must be at least 6 characters.';
    err.style.display='block';
    return;
  }

  btn.disabled=true;
  btn.textContent='Sending request...';

  const {data,error} =
    await SB.auth.signUp({
      email,
      password:pass,
      options:{data:{full_name:name}}
    });

  btn.disabled=false;
  btn.textContent='Request Access →';

  if(error){
    err.textContent=error.message;
    err.style.display='block';
    return;
  }

  suc.style.display='block';

  if(data.session)
    await handleUser(data.user);
}


// ══════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════

async function doLogout(){

  await SB.auth.signOut();

  CURRENT_USER=null;
  CURRENT_PROFILE=null;

  DB.properties=[];
  DB.analysis=[];
  DB.contacts=[];

  showScreen('auth');
}


// ══════════════════════════════════════
// USER ROUTING (FIXED)
// ══════════════════════════════════════

async function handleUser(user){

  if(!user){
    showScreen('auth');
    return;
  }

  CURRENT_USER=user;

  let {data:profile,error} =
    await SB.from('user_profiles')
      .select('*')
      .eq('id',user.id)
      .maybeSingle();


  // CREATE PROFILE IF NOT EXISTS

  if(!profile){

    const {data:newProfile,error:insertError} =
      await SB.from('user_profiles')
        .insert({
          id:user.id,
          email:user.email,
          full_name:user.user_metadata?.full_name||'',
          role:'investor',
          approval_status:'pending',
          subscription_status:'inactive'
        })
        .select()
        .single();

    if(insertError){
      console.error(insertError);
      showScreen('auth');
      return;
    }

    profile=newProfile;
  }

  CURRENT_PROFILE=profile;


  // PENDING

  if(profile.approval_status==='pending'){

    const email =
      document.getElementById('pending-email-show');

    if(email) email.textContent=user.email;

    showScreen('pending');
    return;
  }


  // REJECTED

  if(profile.approval_status==='rejected'){

    await SB.auth.signOut();

    const err =
      document.getElementById('login-error');

    if(err){
      err.textContent='Your access request was not approved.';
      err.style.display='block';
    }

    showScreen('auth');
    return;
  }


  // APPROVED

  if(profile.approval_status==='approved'){

    // Admin always gets in regardless of subscription
    if(profile.role==='admin'){
      enterApp(user,profile);
      return;
    }

    const sub=
      profile.subscription_status||'inactive';

    if(sub==='active'||sub==='trial'){
      enterApp(user,profile);
      return;
    }

    showScreen('auth');

    const err =
      document.getElementById('login-error');

    if(err){
      err.textContent='Account approved but subscription inactive.';
      err.style.display='block';
    }
  }
}


// ══════════════════════════════════════
// ENTER APP
// ══════════════════════════════════════

function enterApp(user,profile){

  CURRENT_USER=user;
  CURRENT_PROFILE=profile;

  showScreen('app');

  const initials =
    (profile?.full_name||user.email||'U')
      .substring(0,2)
      .toUpperCase();

  const avatar =
    document.getElementById('user-avatar-initials');

  const email =
    document.getElementById('user-email-display');

  if(avatar) avatar.textContent=initials;
  if(email) email.textContent=user.email;

  loadUserData();
  renderDashboard();
}


// ══════════════════════════════════════
// SESSION CHECK
// ══════════════════════════════════════

SB.auth.getSession().then(({data:{session}})=>{

  if(session)
    handleUser(session.user);
  else
    showScreen('auth');

});


SB.auth.onAuthStateChange((_event,session)=>{

  if(_event==='PASSWORD_RECOVERY'){
    showResetPasswordModal();
    return;
  }

  if(_event==='SIGNED_IN'&&session&&!CURRENT_USER)
    handleUser(session.user);

  if(_event==='SIGNED_OUT'){

    CURRENT_USER=null;
    CURRENT_PROFILE=null;

    showScreen('auth');
  }
});


// ══════════════════════════════════════
// RESET TOKEN DETECTION
// ══════════════════════════════════════

(function(){

  const hash=window.location.hash;

  if(hash&&hash.includes('type=recovery')){

    window._resetMode=true;

    const auth=
      document.getElementById('auth-screen');

    if(auth) auth.style.display='none';
  }

  if(hash==='#')
    history.replaceState(null,'',window.location.pathname);

})();
