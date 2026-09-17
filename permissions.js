(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined") module.exports = api;
  root.AP207Access = api;
})(typeof globalThis !== "undefined" ? globalThis : this, (root) => {
  "use strict";

  const ROLES = Object.freeze({ SUPER_ADMIN: "super_admin", ADMIN: "admin", OWNER: "owner" });
  const PERMISSIONS = Object.freeze({
    [ROLES.SUPER_ADMIN]: ["*"],
    [ROLES.ADMIN]: ["reservation:create", "reservation:update", "reservation:delete", "expense:create", "expense:update", "expense:delete", "property:update", "calendar:read", "report:read", "report:generate"],
    [ROLES.OWNER]: ["dashboard:read", "reservation:read", "calendar:read", "expense:read", "report:read", "report:generate"],
  });
  const AUTH_CACHE_KEY = "ap207-auth-profile-v1";
  const LAST_ACTIVITY_KEY = "stay-control-last-activity-v1";
  const SUPABASE_URL = "https://cwtpeabebkoveachrclo.supabase.co";
  const SUPABASE_KEY = "sb_publishable_XJszvSVg7p7QF4jSdDeiGw_jOvtNlgR";
  const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.0";
  const AUTH_TIMEOUT_MS = 12000;
  let cachedAuth = readAuthCache();

  function readAuthCache() {
    if (typeof localStorage === "undefined") return null;
    try {
      const value = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || "null");
      return value?.profile && PERMISSIONS[value.profile.role] ? value : null;
    } catch { return null; }
  }
  function writeAuthCache(profile, propertyIds) {
    if (typeof localStorage === "undefined") return;
    const ids = Array.isArray(propertyIds) ? propertyIds : [];
    const normalized = { ...profile, propertyIds: ids, property_ids: ids };
    cachedAuth = { profile: normalized, propertyIds: ids };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cachedAuth));
  }
  function clearAuthCache() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(AUTH_CACHE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
    cachedAuth = null;
  }
  function markActivity() {
    if (typeof localStorage !== "undefined") localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }
  function effectiveUser(user) {
    if (!cachedAuth?.profile) return user;
    return { id: cachedAuth.profile.id, name: cachedAuth.profile.name || cachedAuth.profile.email || "Usuário", role: cachedAuth.profile.role, active: cachedAuth.profile.active !== false };
  }
  function isActive(user) {
    const effective = effectiveUser(user);
    return Boolean(effective && effective.active !== false);
  }
  function hasPermission(user, permission) {
    const effective = effectiveUser(user), allowed = PERMISSIONS[effective?.role];
    return Boolean(effective && effective.active !== false && allowed && (allowed.includes("*") || allowed.includes(permission)));
  }
  function assertPermission(user, permission) {
    if (!hasPermission(user, permission)) throw new Error("Acesso negado para esta operação.");
    return true;
  }
  function visibleProperties(user, properties) {
    const effective = effectiveUser(user);
    if (!effective || effective.active === false) return [];
    if (effective.role === ROLES.SUPER_ADMIN) return [...properties];
    if (cachedAuth?.profile) {
      const allowed = new Set(cachedAuth.propertyIds || []);
      return properties.filter((property) => allowed.has(property.id));
    }
    const field = effective.role === ROLES.ADMIN ? "administratorId" : "ownerId";
    return properties.filter((property) => property[field] === effective.id);
  }
  function assertPropertyAccess(user, property) {
    if (!property || !visibleProperties(user, [property]).length) throw new Error("Acesso negado a esta propriedade.");
    return true;
  }
  function authorize(user, property, permission) {
    assertPermission(user, permission);
    assertPropertyAccess(user, property);
    return true;
  }
  function perform(user, property, permission, operation) {
    authorize(user, property, permission);
    return operation();
  }
  function withTimeout(promise, milliseconds = AUTH_TIMEOUT_MS) {
    let timer;
    return Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error("AUTH_TIMEOUT");
          error.code = "AUTH_TIMEOUT";
          reject(error);
        }, milliseconds);
      }),
    ]).finally(() => clearTimeout(timer));
  }
  function injectAuthStyles() {
    if (typeof document === "undefined" || document.getElementById("ap207AuthStyles")) return;
    const style = document.createElement("style");
    style.id = "ap207AuthStyles";
    style.textContent = `body.ap207-auth-pending>main,body.ap207-auth-pending>nav{visibility:hidden!important}.ap207-auth-status{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:22px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.ap207-auth-status-card{width:min(100%,440px);background:#fff;border-radius:22px;padding:26px;box-shadow:0 18px 55px rgba(20,35,60,.16);color:#172033}.ap207-auth-status-card h1{margin:0 0 8px;font-size:24px}.ap207-auth-status-card p{color:#64748b;line-height:1.5}.ap207-auth-status-actions{display:grid;gap:10px;margin-top:18px}.ap207-auth-status button,.ap207-auth-status a{box-sizing:border-box;width:100%;border:0;border-radius:12px;padding:13px 16px;text-align:center;text-decoration:none;font:inherit;font-weight:800;cursor:pointer;background:#2563eb;color:#fff}.ap207-auth-status a{background:#eef2f7;color:#172033}body.ap207-authenticated label[for="userSelector"],body.ap207-authenticated #userSelector{display:none!important}`;
    document.head.append(style);
  }
  function loadSupabaseLibrary() {
    if (root.supabase?.createClient) return Promise.resolve(root.supabase);
    return withTimeout(new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-ap207-supabase]");
      if (existing) {
        existing.addEventListener("load", () => resolve(root.supabase), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = SUPABASE_CDN;
      script.defer = true;
      script.dataset.ap207Supabase = "true";
      script.onload = () => resolve(root.supabase);
      script.onerror = () => reject(new Error("SUPABASE_LIBRARY_UNAVAILABLE"));
      document.head.append(script);
    }));
  }
  async function loadAuthenticatedProfile(client, user) {
    const profileResult = await withTimeout(client.from("profiles").select("id,email,name,role,active").eq("id", user.id).single());
    if (profileResult.error) throw profileResult.error;
    const profile = profileResult.data;
    if (!profile?.active) {
      const error = new Error("ACCESS_DISABLED"); error.code = "ACCESS_DISABLED"; throw error;
    }
    if (!PERMISSIONS[profile.role]) {
      const error = new Error("INVALID_ROLE"); error.code = "INVALID_ROLE"; throw error;
    }
    let propertyIds = [];
    if (profile.role !== ROLES.SUPER_ADMIN) {
      const accessResult = await withTimeout(client.from("property_access").select("property_id").eq("user_id", user.id));
      if (accessResult.error) throw accessResult.error;
      propertyIds = (accessResult.data || []).map((row) => row.property_id);
    }
    return { profile, propertyIds };
  }
  function activateApplication() {
    document.getElementById("ap207AuthStatus")?.remove();
    document.body.classList.remove("ap207-auth-pending");
    document.body.classList.add("ap207-authenticated");
  }
  function showAuthFailure(error) {
    let status = document.getElementById("ap207AuthStatus");
    if (!status) {
      status = document.createElement("div");
      status.id = "ap207AuthStatus";
      status.className = "ap207-auth-status";
      document.body.append(status);
    }
    const detail = error?.code === "AUTH_TIMEOUT" ? "A verificação demorou mais que o esperado. Sua senha não precisa ser digitada novamente." : "A sessão não pôde ser confirmada com segurança.";
    status.innerHTML = `<section class="ap207-auth-status-card" role="alert"><h1>Não foi possível abrir o painel</h1><p>${detail}</p><div class="ap207-auth-status-actions"><button id="ap207RetrySession" type="button">Tentar novamente</button><a href="./test2-login.html">Voltar ao acesso</a></div></section>`;
    status.querySelector("#ap207RetrySession")?.addEventListener("click", () => location.reload());
  }
  async function bootstrapAuth() {
    if (typeof document === "undefined") return;
    injectAuthStyles();
    if (document.readyState === "loading") await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
    document.body.classList.add("ap207-auth-pending");
    try {
      const library = await loadSupabaseLibrary();
      if (!library?.createClient) throw new Error("SUPABASE_LIBRARY_UNAVAILABLE");
      const client = library.createClient(SUPABASE_URL, SUPABASE_KEY);
      root.AP207Supabase = client;
      const sessionResult = await withTimeout(client.auth.getSession());
      if (sessionResult.error) throw sessionResult.error;
      const session = sessionResult.data?.session;
      if (!session?.user) {
        clearAuthCache();
        location.replace("./test2-login.html");
        return;
      }
      const authenticated = await loadAuthenticatedProfile(client, session.user);
      writeAuthCache(authenticated.profile, authenticated.propertyIds);
      markActivity();
      activateApplication();
    } catch (error) {
      console.error("[auth] bootstrap failed", error?.code || error?.message);
      showAuthFailure(error);
    }
  }
  if (typeof document !== "undefined") {
    injectAuthStyles();
    void bootstrapAuth();
  }
  return { ROLES, PERMISSIONS, isActive, hasPermission, assertPermission, visibleProperties, assertPropertyAccess, authorize, perform };
});
