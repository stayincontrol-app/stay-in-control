(() => {
  'use strict';

  const PROPERTIES_KEY = 'ap207-dashboard-properties-v1';
  const SELECTED_PROPERTY_KEY = 'stay-control-selected-property-v1';
  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';
  const SUPABASE_AUTH_KEY = 'sb-cwtpeabebkoveachrclo-auth-token';

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
    button.className = 'button button-secondary';
    button.textContent = 'Sair / Desconectar';
    button.style.gridColumn = '1 / -1';
    button.style.width = '100%';
    button.addEventListener('click', () => {
      if (!window.confirm('Deseja sair do Stay in Control?')) return;
      localStorage.removeItem(AUTH_CACHE_KEY);
      localStorage.removeItem(SUPABASE_AUTH_KEY);
      localStorage.removeItem(SELECTED_PROPERTY_KEY);
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-cwtpeabebkoveachrclo-')) localStorage.removeItem(key);
      }
      location.reload();
    });
    controls.append(button);
    return true;
  }

  reorderStoredProperties();

  function boot() {
    const timer = setInterval(() => {
      const a = installPropertySwitching();
      const b = installLogout();
      if (a && b) clearInterval(timer);
    }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
