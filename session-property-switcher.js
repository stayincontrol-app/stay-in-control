(() => {
  'use strict';

  const PROPERTIES_KEY = 'ap207-dashboard-properties-v1';
  const SELECTED_PROPERTY_KEY = 'stay-control-selected-property-v1';
  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';
  const SUPABASE_AUTH_KEY = 'sb-cwtpeabebkoveachrclo-auth-token';
  const INACTIVITY_MS = 60 * 1000;
  const WARNING_MS = 10 * 1000;

  let inactivityTimer = null;
  let warningTimer = null;
  let countdownTimer = null;
  let secondsLeft = 10;

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

  function signOut() {
    localStorage.removeItem(AUTH_CACHE_KEY);
    localStorage.removeItem(SUPABASE_AUTH_KEY);
    localStorage.removeItem(SELECTED_PROPERTY_KEY);
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-cwtpeabebkoveachrclo-')) localStorage.removeItem(key);
    }
    location.reload();
  }

  function installPropertySwitching() {
    const selector = document.getElementById('propertySelector');
    if (!selector || selector.dataset.stayControlSwitching === '1') return false;
    selector.dataset.stayControlSwitching = '1';
    selector.addEventListener('change', () => {
      const id = selector.value;
      if (!id) return;
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
      location.reload();
    });
    return true;
  }

  function installLogout() {
    if (document.getElementById('stayControlLogoutButton')) return true;
    const controls = document.querySelector('.header-controls');
    if (!controls) return false;

    const button = document.createElement('button');
    button.id = 'stayControlLogoutButton';
    button.type = 'button';
    button.className = 'button';
    button.textContent = 'Sair / Desconectar';
    button.style.gridColumn = '1 / -1';
    button.style.width = '100%';
    button.style.background = '#dc2626';
    button.style.borderColor = '#dc2626';
    button.style.color = '#ffffff';
    button.style.fontWeight = '700';
    button.addEventListener('click', () => {
      if (!window.confirm('Deseja sair do Stay in Control?')) return;
      signOut();
    });
    controls.append(button);
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
    modal.innerHTML = `
      <div class="stay-control-idle-backdrop"></div>
      <div class="stay-control-idle-card" role="dialog" aria-modal="true" aria-labelledby="stayControlIdleTitle">
        <h2 id="stayControlIdleTitle">Sua sessão vai encerrar</h2>
        <p>Por segurança, você será desconectado por inatividade.</p>
        <strong id="stayControlIdleCountdown">10</strong>
        <span>segundos</span>
        <button id="stayControlContinueSession" type="button">Continuar sessão</button>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      #stayControlIdleModal[hidden]{display:none!important}
      #stayControlIdleModal{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:20px}
      .stay-control-idle-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.62);backdrop-filter:blur(3px)}
      .stay-control-idle-card{position:relative;width:min(100%,420px);background:#fff;border-radius:24px;padding:28px;text-align:center;box-shadow:0 24px 70px rgba(15,23,42,.28);color:#0f172a}
      .stay-control-idle-card h2{font-size:1.45rem;margin:0 0 10px}
      .stay-control-idle-card p{color:#64748b;margin:0 0 18px;line-height:1.5}
      #stayControlIdleCountdown{display:block;font-size:3.2rem;line-height:1;color:#dc2626;margin-bottom:2px}
      .stay-control-idle-card span{display:block;color:#64748b;margin-bottom:20px}
      #stayControlContinueSession{width:100%;min-height:54px;border:0;border-radius:14px;background:#2563eb;color:#fff;font-size:1rem;font-weight:800;padding:14px 18px}
    `;
    document.head.append(style);
    document.body.append(modal);

    document.getElementById('stayControlContinueSession').addEventListener('click', () => {
      hideWarning();
      resetInactivityTimer();
    });
    return modal;
  }

  function hideWarning() {
    const modal = document.getElementById('stayControlIdleModal');
    if (modal) modal.hidden = true;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
  }

  function showWarning() {
    if (!document.body.classList.contains('ap207-authenticated')) return;
    const modal = ensureWarningModal();
    secondsLeft = 10;
    document.getElementById('stayControlIdleCountdown').textContent = String(secondsLeft);
    modal.hidden = false;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      secondsLeft -= 1;
      const display = document.getElementById('stayControlIdleCountdown');
      if (display) display.textContent = String(Math.max(secondsLeft, 0));
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        signOut();
      }
    }, 1000);
  }

  function resetInactivityTimer() {
    if (!document.body.classList.contains('ap207-authenticated')) return;
    hideWarning();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    warningTimer = setTimeout(showWarning, INACTIVITY_MS - WARNING_MS);
    inactivityTimer = setTimeout(signOut, INACTIVITY_MS);
  }

  function installInactivityTracking() {
    if (document.body.dataset.stayControlIdleTracking === '1') return true;
    if (!document.body.classList.contains('ap207-authenticated')) return false;
    document.body.dataset.stayControlIdleTracking = '1';
    ensureWarningModal();
    ['pointerdown','touchstart','keydown','scroll'].forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
    return true;
  }

  reorderStoredProperties();

  function boot() {
    const timer = setInterval(() => {
      const a = installPropertySwitching();
      const b = installLogout();
      const c = styleEditPropertyButton();
      const d = installInactivityTracking();
      if (a && b && c && d) clearInterval(timer);
    }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
