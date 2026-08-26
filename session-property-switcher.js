(() => {
  'use strict';

  if (!globalThis.__stayExpenseCategoryValidationCompat) {
    const originalIncludes = Array.prototype.includes;
    const extraExpenseCategories = new Set([
      'Luz', 'Internet', 'Aluguel de garagem', 'Aluguel de garage',
      'Prestação do imóvel', 'Limpeza', 'Prestação do carro',
      'Prestação da moto', 'Aluguel', 'Sistema'
    ]);
    Array.prototype.includes = function(searchElement, fromIndex) {
      const legacyExpenseCategoryArray = Array.isArray(this)
        && this.length === 7
        && originalIncludes.call(this, 'Manutenção/Reparo')
        && originalIncludes.call(this, 'Compra para o apartamento')
        && originalIncludes.call(this, 'Outro');
      if (legacyExpenseCategoryArray && extraExpenseCategories.has(searchElement)) return true;
      return originalIncludes.call(this, searchElement, fromIndex);
    };
    globalThis.__stayExpenseCategoryValidationCompat = true;
  }

  const PROPERTIES_KEY = 'ap207-dashboard-properties-v1';
  const SELECTED_PROPERTY_KEY = 'stay-control-selected-property-v1';
  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';
  const SUPABASE_AUTH_KEY = 'sb-cwtpeabebkoveachrclo-auth-token';
  const INACTIVITY_MS = 5 * 60 * 1000;
  const WARNING_MS = 10 * 1000;
  const LAST_ACTIVITY_KEY = 'stay-control-last-activity-v1';

  let inactivityTimer = null;
  let warningTimer = null;
  let countdownTimer = null;

  function isAuthenticated() { return document.body.classList.contains('ap207-authenticated'); }
  function setLastActivity() { localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now())); }
  function getLastActivity() {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    const value = Number(raw);
    return raw && Number.isFinite(value) ? value : null;
  }
  function elapsedSinceActivity() {
    const last = getLastActivity();
    return last == null ? 0 : Math.max(0, Date.now() - last);
  }

  function reorderStoredProperties() {
    const selectedId = localStorage.getItem(SELECTED_PROPERTY_KEY);
    if (!selectedId) return;
    try {
      const parsed = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || 'null');
      if (!parsed?.properties || !Array.isArray(parsed.properties)) return;
      const index = parsed.properties.findIndex((item) => item?.id === selectedId);
      if (index <= 0) return;
      const [selected] = parsed.properties.splice(index, 1);
      parsed.properties.unshift(selected);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(parsed));
    } catch {}
  }

  async function signOut() {
    hideWarning();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    inactivityTimer = warningTimer = null;
    try {
      if (globalThis.AP207Supabase?.auth?.signOut) await globalThis.AP207Supabase.auth.signOut();
    } catch {}
    localStorage.removeItem(AUTH_CACHE_KEY);
    localStorage.removeItem(SUPABASE_AUTH_KEY);
    localStorage.removeItem(SELECTED_PROPERTY_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-cwtpeabebkoveachrclo-')) localStorage.removeItem(key);
    }
    location.reload();
  }

  function loadScriptOnce(src, dataName) {
    if (document.querySelector(`script[${dataName}]`)) return true;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(dataName, 'true');
    document.head.append(script);
    return true;
  }

  function loadUserManager() { return loadScriptOnce('./user-manager.js', 'data-stay-user-manager'); }
  function loadReportView() { return loadScriptOnce('./report-view.js', 'data-stay-report-view'); }
  function loadScreenNavigation() { return loadScriptOnce('./screen-navigation.js', 'data-stay-screen-navigation'); }
  function loadSelectedPropertyContext() { return loadScriptOnce('./selected-property-context.js', 'data-stay-selected-property-context'); }

  function ensurePropertyLoader() {
    let loader = document.getElementById('stayPropertyLoader');
    if (loader) return loader;
    loader = document.createElement('div');
    loader.id = 'stayPropertyLoader';
    loader.hidden = true;
    loader.innerHTML = '<div class="stay-property-loader-card"><span class="stay-property-spinner"></span><strong>Atualizando propriedade…</strong></div>';
    const style = document.createElement('style');
    style.textContent = '#stayPropertyLoader[hidden]{display:none!important}#stayPropertyLoader{position:fixed;inset:0;z-index:999998;display:grid;place-items:center;background:rgba(248,250,252,.72);backdrop-filter:blur(2px)}.stay-property-loader-card{display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:16px;background:#fff;box-shadow:0 12px 40px rgba(15,23,42,.18);color:#0f172a}.stay-property-spinner{width:22px;height:22px;border:3px solid #dbeafe;border-top-color:#2563eb;border-radius:50%;animation:staySpin .7s linear infinite}@keyframes staySpin{to{transform:rotate(360deg)}}';
    document.head.append(style);
    document.body.append(loader);
    return loader;
  }

  function showPropertyLoader() { ensurePropertyLoader().hidden = false; }
  function hidePropertyLoader() { const loader = document.getElementById('stayPropertyLoader'); if (loader) loader.hidden = true; }

  function installPropertySwitching() {
    const selector = document.getElementById('propertySelector');
    if (!selector || selector.dataset.stayControlSwitching === '1') return false;
    selector.dataset.stayControlSwitching = '1';
    selector.addEventListener('change', () => {
      const id = selector.value;
      if (!id) return;
      showPropertyLoader();
      localStorage.setItem(SELECTED_PROPERTY_KEY, id);
      try {
        const parsed = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || 'null');
        if (parsed?.properties && Array.isArray(parsed.properties)) {
          const index = parsed.properties.findIndex((item) => item?.id === id);
          if (index > 0) {
            const [selected] = parsed.properties.splice(index, 1);
            parsed.properties.unshift(selected);
            localStorage.setItem(PROPERTIES_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
      window.dispatchEvent(new CustomEvent('stay:property-selection-changed', { detail: { propertyId: id } }));
      setTimeout(hidePropertyLoader, 420);
    });
    return true;
  }

  function installLogout() {
    if (document.getElementById('stayControlLogoutButton')) return true;
    const unitTitle = document.getElementById('propertyName');
    if (!unitTitle || !unitTitle.parentElement) return false;
    const button = document.createElement('button');
    button.id = 'stayControlLogoutButton';
    button.type = 'button';
    button.className = 'button';
    button.textContent = 'Sair';
    button.style.display = 'block';
    button.style.width = 'min(72%, 310px)';
    button.style.margin = '10px 0 6px';
    button.style.padding = '10px 14px';
    button.style.minHeight = '42px';
    button.style.borderRadius = '12px';
    button.style.background = '#dc2626';
    button.style.borderColor = '#dc2626';
    button.style.color = '#ffffff';
    button.style.fontSize = '0.92rem';
    button.style.fontWeight = '700';
    button.addEventListener('click', () => {
      if (!window.confirm('Deseja sair do Stay in Control?')) return;
      signOut();
    });
    unitTitle.insertAdjacentElement('afterend', button);
    return true;
  }

  const DEDUCTION_IDS = [
    'summaryCleaning', 'summaryCommission', 'summaryExpenses',
    'reportSummaryCleaning', 'reportSummaryCommission', 'reportOtherExpenses',
    'expensesTotal'
  ];

  function markOutgoingValues() {
    DEDUCTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      const value = element.textContent.trim();
      if (!value || value.startsWith('−') || value.startsWith('-')) return;
      element.textContent = `− ${value}`;
    });
  }

  function installOutgoingValueObserver() {
    if (document.body.dataset.stayOutgoingObserver === '1') return true;
    document.body.dataset.stayOutgoingObserver = '1';
    markOutgoingValues();
    const observer = new MutationObserver(() => markOutgoingValues());
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return true;
  }

  function styleEditPropertyButton() {
    const button = document.getElementById('editPropertyButton');
    if (!button) return false;
    button.style.background = '#2563eb';
    button.style.borderColor = '#2563eb';
    button.style.color = '#ffffff';
    button.style.fontWeight = '700';
    return true;
  }

  function ensureWarningModal() {
    let modal = document.getElementById('stayControlIdleModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'stayControlIdleModal';
    modal.hidden = true;
    modal.innerHTML = `<div class="stay-control-idle-backdrop"></div><div class="stay-control-idle-card" role="dialog" aria-modal="true" aria-labelledby="stayControlIdleTitle"><h2 id="stayControlIdleTitle">Sua sessão vai encerrar</h2><p>Por segurança, você será desconectado por inatividade.</p><strong id="stayControlIdleCountdown">10</strong><span>segundos</span><button id="stayControlContinueSession" type="button">Continuar sessão</button></div>`;
    const style = document.createElement('style');
    style.textContent = `#stayControlIdleModal[hidden]{display:none!important}#stayControlIdleModal{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:20px}.stay-control-idle-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.62);backdrop-filter:blur(3px)}.stay-control-idle-card{position:relative;width:min(100%,420px);background:#fff;border-radius:24px;padding:28px;text-align:center;box-shadow:0 24px 70px rgba(15,23,42,.28);color:#0f172a}.stay-control-idle-card h2{font-size:1.45rem;margin:0 0 10px}.stay-control-idle-card p{color:#64748b;margin:0 0 18px;line-height:1.5}#stayControlIdleCountdown{display:block;font-size:3.2rem;line-height:1;color:#dc2626;margin-bottom:2px}.stay-control-idle-card span{display:block;color:#64748b;margin-bottom:20px}#stayControlContinueSession{width:100%;min-height:54px;border:0;border-radius:14px;background:#2563eb;color:#fff;font-size:1rem;font-weight:800;padding:14px 18px}`;
    document.head.append(style);
    document.body.append(modal);
    document.getElementById('stayControlContinueSession').addEventListener('click', () => resetInactivityTimer(true));
    return modal;
  }

  function hideWarning() {
    const modal = document.getElementById('stayControlIdleModal');
    if (modal) modal.hidden = true;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
  }

  function showWarning(remainingMs = WARNING_MS) {
    if (!isAuthenticated()) return;
    const modal = ensureWarningModal();
    const updateCountdown = () => {
      const remaining = INACTIVITY_MS - elapsedSinceActivity();
      const secondsLeft = Math.max(0, Math.ceil(remaining / 1000));
      const display = document.getElementById('stayControlIdleCountdown');
      if (display) display.textContent = String(secondsLeft);
      if (remaining <= 0) signOut();
    };
    document.getElementById('stayControlIdleCountdown').textContent = String(Math.max(1, Math.ceil(remainingMs / 1000)));
    modal.hidden = false;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(updateCountdown, 250);
  }

  function scheduleFromElapsed() {
    if (!isAuthenticated()) return;
    hideWarning();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    const elapsed = elapsedSinceActivity();
    const remaining = INACTIVITY_MS - elapsed;
    if (remaining <= 0) return void signOut();
    if (remaining <= WARNING_MS) {
      showWarning(remaining);
      inactivityTimer = setTimeout(signOut, remaining);
      return;
    }
    warningTimer = setTimeout(() => showWarning(WARNING_MS), remaining - WARNING_MS);
    inactivityTimer = setTimeout(signOut, remaining);
  }

  function resetInactivityTimer(recordActivity = true) {
    if (!isAuthenticated()) return;
    if (recordActivity) setLastActivity();
    scheduleFromElapsed();
  }

  function installInactivityTracking() {
    if (document.body.dataset.stayControlIdleTracking === '1') return true;
    if (!isAuthenticated()) return false;
    document.body.dataset.stayControlIdleTracking = '1';
    ensureWarningModal();
    if (getLastActivity() == null) setLastActivity();
    ['pointerdown','touchstart','keydown','scroll'].forEach((eventName) => window.addEventListener(eventName, () => resetInactivityTimer(true), { passive: true }));
    document.addEventListener('visibilitychange', () => {
      if (!isAuthenticated()) return;
      if (document.hidden) {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (warningTimer) clearTimeout(warningTimer);
        hideWarning();
      } else {
        scheduleFromElapsed();
      }
    });
    window.addEventListener('pageshow', scheduleFromElapsed);
    window.addEventListener('focus', scheduleFromElapsed);
    scheduleFromElapsed();
    return true;
  }

  reorderStoredProperties();
  loadUserManager();
  loadReportView();
  loadScreenNavigation();
  loadSelectedPropertyContext();

  function boot() {
    const timer = setInterval(() => {
      const a = installPropertySwitching();
      const b = installLogout();
      const c = styleEditPropertyButton();
      const d = installInactivityTracking();
      const e = installOutgoingValueObserver();
      if (a && b && c && d && e) clearInterval(timer);
    }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();