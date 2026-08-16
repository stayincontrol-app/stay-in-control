(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined') module.exports = api;
  root.AP207Access = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, (root) => {
  'use strict';

  const ROLES = Object.freeze({ SUPER_ADMIN: 'super_admin', ADMIN: 'admin', OWNER: 'owner' });
  const PERMISSIONS = Object.freeze({
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.ADMIN]: ['reservation:create', 'reservation:update', 'reservation:delete', 'expense:create', 'expense:update', 'expense:delete', 'property:update', 'calendar:read', 'report:read', 'report:generate'],
    [ROLES.OWNER]: ['dashboard:read', 'reservation:read', 'calendar:read', 'expense:read', 'report:read', 'report:generate'],
  });

  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';
  const LAST_ACTIVITY_KEY = 'stay-control-last-activity-v1';
  const INACTIVITY_MS = 60 * 1000;
  const SUPABASE_URL = 'https://cwtpeabebkoveachrclo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XJszvSVg7p7QF4jSdDeiGw_jOvtNlgR';
  let cachedAuth = readAuthCache();

  function readAuthCache() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null');
      if (!parsed || !parsed.profile || !PERMISSIONS[parsed.profile.role]) return null;
      return parsed;
    } catch { return null; }
  }

  function writeAuthCache(profile, propertyIds) {
    if (typeof localStorage === 'undefined') return;
    const value = { profile, propertyIds: Array.isArray(propertyIds) ? propertyIds : [] };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(value));
    cachedAuth = value;
  }

  function clearAuthCache() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(AUTH_CACHE_KEY);
    cachedAuth = null;
  }

  function markActivity() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }

  function sessionExpiredByInactivity() {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return false;
    const last = Number(raw);
    return Number.isFinite(last) && Date.now() - last >= INACTIVITY_MS;
  }

  function effectiveUser(user) {
    if (!cachedAuth?.profile) return user;
    return { id: cachedAuth.profile.id, name: cachedAuth.profile.name || cachedAuth.profile.email || 'Usuário', role: cachedAuth.profile.role, active: cachedAuth.profile.active !== false };
  }
  function isActive(user) { const effective = effectiveUser(user); return Boolean(effective && effective.active !== false); }
  function hasPermission(user, permission) { const effective = effectiveUser(user); if (!effective || effective.active === false || !PERMISSIONS[effective.role]) return false; return PERMISSIONS[effective.role].includes('*') || PERMISSIONS[effective.role].includes(permission); }
  function assertPermission(user, permission) { if (!hasPermission(user, permission)) throw new Error('Acesso negado para esta operação.'); return true; }
  function visibleProperties(user, properties) { const effective = effectiveUser(user); if (!effective || effective.active === false) return []; if (effective.role === ROLES.SUPER_ADMIN) return [...properties]; if (cachedAuth?.profile) { const allowed = new Set(cachedAuth.propertyIds || []); return properties.filter((property) => allowed.has(property.id)); } const field = effective.role === ROLES.ADMIN ? 'administratorId' : 'ownerId'; return properties.filter((property) => property[field] === effective.id); }
  function assertPropertyAccess(user, property) { if (!property || !visibleProperties(user, [property]).length) throw new Error('Acesso negado a esta propriedade.'); return true; }
  function authorize(user, property, permission) { assertPermission(user, permission); assertPropertyAccess(user, property); return true; }
  function perform(user, property, permission, operation) { authorize(user, property, permission); return operation(); }

  function injectAuthStyles() {
    if (typeof document === 'undefined' || document.getElementById('ap207AuthStyles')) return;
    const style = document.createElement('style');
    style.id = 'ap207AuthStyles';
    style.textContent = `body.ap207-auth-pending > main, body.ap207-auth-pending > nav { visibility: hidden !important; }.ap207-auth-overlay { position: fixed; inset: 0; z-index: 99999; display: grid; place-items: center; padding: 22px; background: #f4f7fb; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }.ap207-auth-card { width: min(100%, 430px); background: white; border-radius: 22px; padding: 26px; box-shadow: 0 18px 55px rgba(20,35,60,.16); }.ap207-auth-card h1 { margin: 0 0 5px; font-size: 28px; }.ap207-auth-card p { color: #64748b; line-height: 1.45; }.ap207-auth-card label { display:block; margin: 15px 0 6px; font-size: 13px; font-weight: 700; color:#334155; }.ap207-auth-card input { width:100%; box-sizing:border-box; padding:13px 14px; border:1px solid #d7dee8; border-radius:12px; font-size:16px; }.ap207-auth-actions { display:grid; gap:10px; margin-top:18px; }.ap207-auth-button { border:0; border-radius:12px; padding:13px 16px; font-size:15px; font-weight:800; cursor:pointer; background:#111827; color:white; }.ap207-auth-button.secondary { background:#eef2f7; color:#172033; }.ap207-auth-message { min-height:22px; margin-top:12px; color:#b42318 !important; font-size:14px; }.ap207-auth-note { margin-top:16px !important; font-size:12px; }body.ap207-authenticated label[for="userSelector"], body.ap207-authenticated #userSelector { display:none !important; }`;
    document.head.append(style);
    document.body?.classList.add('ap207-auth-pending');
  }

  function loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {
      if (root.supabase?.createClient) return resolve(root.supabase);
      const existing = document.querySelector('script[data-ap207-supabase]');
      if (existing) { existing.addEventListener('load', () => resolve(root.supabase), { once: true }); existing.addEventListener('error', reject, { once: true }); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; script.defer = true; script.dataset.ap207Supabase = 'true';
      script.onload = () => resolve(root.supabase); script.onerror = () => reject(new Error('Não foi possível carregar o serviço de login.')); document.head.append(script);
    });
  }

  function createAuthOverlay() {
    let overlay = document.getElementById('ap207AuthOverlay'); if (overlay) return overlay;
    overlay = document.createElement('div'); overlay.id = 'ap207AuthOverlay'; overlay.className = 'ap207-auth-overlay';
    overlay.innerHTML = `<section class="ap207-auth-card" aria-labelledby="ap207LoginTitle"><p style="margin:0 0 4px;font-weight:800;color:#2563eb">Stay in Control 1.0</p><h1 id="ap207LoginTitle">Acessar painel</h1><p>Entre com seu e-mail e senha. Cada usuário verá somente o que sua permissão autorizar.</p><form id="ap207LoginForm"><label for="ap207Email">E-mail</label><input id="ap207Email" type="email" autocomplete="email" required><label for="ap207Password">Senha</label><input id="ap207Password" type="password" autocomplete="current-password" minlength="6" required><div class="ap207-auth-actions"><button class="ap207-auth-button" type="submit">Entrar</button><button class="ap207-auth-button secondary" id="ap207CreateAccount" type="button">Criar minha conta</button></div></form><p id="ap207AuthMessage" class="ap207-auth-message" role="alert"></p><p class="ap207-auth-note">O primeiro cadastro deste sistema será criado como Super Administrador. Os próximos cadastros entram como Proprietário até serem vinculados pelo administrador.</p></section>`;
    document.body.append(overlay); return overlay;
  }

  async function loadAuthenticatedProfile(client, user) {
    const { data: profile, error: profileError } = await client.from('profiles').select('id,email,name,role,active').eq('id', user.id).single();
    if (profileError) throw profileError; if (!profile.active) throw new Error('Este usuário está desativado.');
    let propertyIds = [];
    if (profile.role !== ROLES.SUPER_ADMIN) { const { data: accessRows, error: accessError } = await client.from('property_access').select('property_id').eq('user_id', user.id); if (accessError) throw accessError; propertyIds = (accessRows || []).map((row) => row.property_id); }
    return { profile, propertyIds };
  }

  async function bootstrapAuth() {
    if (typeof document === 'undefined') return;
    injectAuthStyles();
    if (document.readyState === 'loading') await new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    document.body.classList.add('ap207-auth-pending');
    const overlay = createAuthOverlay(); const message = overlay.querySelector('#ap207AuthMessage');
    try {
      const library = await loadSupabaseLibrary(); const client = library.createClient(SUPABASE_URL, SUPABASE_KEY); root.AP207Supabase = client;
      const { data: { session } } = await client.auth.getSession();

      if (session?.user && sessionExpiredByInactivity()) {
        await client.auth.signOut();
        clearAuthCache();
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        message.textContent = 'Sua sessão foi encerrada por inatividade. Entre novamente.';
        overlay.hidden = false;
      } else if (session?.user) {
        const authData = await loadAuthenticatedProfile(client, session.user); const changed = JSON.stringify(cachedAuth) !== JSON.stringify(authData); writeAuthCache(authData.profile, authData.propertyIds);
        if (!localStorage.getItem(LAST_ACTIVITY_KEY)) markActivity();
        if (changed) { location.reload(); return; }
        overlay.remove(); document.body.classList.remove('ap207-auth-pending'); document.body.classList.add('ap207-authenticated'); return;
      } else {
        clearAuthCache(); localStorage.removeItem(LAST_ACTIVITY_KEY); overlay.hidden = false;
      }

      overlay.querySelector('#ap207LoginForm').addEventListener('submit', async (event) => {
        event.preventDefault(); message.textContent = 'Entrando…';
        const email = overlay.querySelector('#ap207Email').value.trim(); const password = overlay.querySelector('#ap207Password').value;
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) { message.textContent = 'E-mail ou senha inválidos.'; return; }
        try { const authData = await loadAuthenticatedProfile(client, data.user); writeAuthCache(authData.profile, authData.propertyIds); markActivity(); location.reload(); }
        catch (profileError) { message.textContent = profileError.message || 'Não foi possível carregar as permissões.'; }
      });

      overlay.querySelector('#ap207CreateAccount').addEventListener('click', async () => {
        const email = overlay.querySelector('#ap207Email').value.trim(); const password = overlay.querySelector('#ap207Password').value;
        if (!email || password.length < 6) { message.textContent = 'Informe um e-mail válido e uma senha com pelo menos 6 caracteres.'; return; }
        message.textContent = 'Criando conta…';
        const { data, error } = await client.auth.signUp({ email, password, options: { data: { name: email.split('@')[0] } } });
        if (error) { message.textContent = error.message; return; }
        if (data.session && data.user) { const authData = await loadAuthenticatedProfile(client, data.user); writeAuthCache(authData.profile, authData.propertyIds); markActivity(); location.reload(); return; }
        message.textContent = 'Conta criada. Verifique seu e-mail para confirmar o cadastro e depois entre novamente.';
      });
    } catch (error) { message.textContent = error?.message || 'Não foi possível iniciar o login.'; clearAuthCache(); }
  }

  if (typeof document !== 'undefined') { injectAuthStyles(); bootstrapAuth(); }
  return { ROLES, PERMISSIONS, isActive, hasPermission, assertPermission, visibleProperties, assertPropertyAccess, authorize, perform };
});