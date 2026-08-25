(() => {
  'use strict';

  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';

  function currentRole() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null')?.profile?.role || '';
    } catch {
      return '';
    }
  }

  function hideOwnerRecurringSettings() {
    if (currentRole() !== 'owner') return;

    // Proprietário não precisa ver controles nem resumo de itens recorrentes.
    const recurringLine = document.getElementById('summaryRecurringExpensesLine');
    if (recurringLine) {
      recurringLine.hidden = true;
      recurringLine.style.setProperty('display', 'none', 'important');
      recurringLine.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('h1,h2,h3,strong,small,span,p,dt,div').forEach((element) => {
      const text = (element.textContent || '').trim().toLowerCase();
      const isRecurringCard = text === 'comissão recorrente' || text === 'taxa de limpeza recorrente';
      const isRecurringExpenseSummary = text === 'despesas recorrentes cadastradas';
      if (!isRecurringCard && !isRecurringExpenseSummary) return;

      let target;
      if (isRecurringExpenseSummary) {
        target = element.closest('p,div,section,article,.panel,.card,[class*="card"]') || element;
      } else {
        target = element.closest('article,section,.panel,.card,[class*="card"]') || element.parentElement;
      }
      if (target) {
        target.hidden = true;
        target.style.setProperty('display', 'none', 'important');
        target.setAttribute('aria-hidden', 'true');
      }
    });

    const legacy = document.getElementById('recurringReservationDefaults');
    if (legacy) {
      legacy.hidden = true;
      legacy.style.setProperty('display', 'none', 'important');
    }
  }

  function setManagementVisibility(screen) {
    const showManagement = screen === 'home';
    const propertySettings = document.getElementById('propertySettings');
    const userSection = document.getElementById('stayUserSection');
    const logoutButton = document.getElementById('stayControlLogoutButton');

    if (propertySettings) propertySettings.style.display = showManagement ? '' : 'none';
    if (userSection) userSection.style.display = showManagement ? '' : 'none';
    if (logoutButton) logoutButton.style.display = showManagement ? 'block' : 'none';
    hideOwnerRecurringSettings();
  }

  function activate(screen) {
    setManagementVisibility(screen);
    hideOwnerRecurringSettings();
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function install() {
    if (document.body.dataset.stayScreenNavigation === '1') {
      hideOwnerRecurringSettings();
      return true;
    }
    const buttons = [...document.querySelectorAll('[data-screen]')];
    if (!buttons.length) return false;
    document.body.dataset.stayScreenNavigation = '1';

    buttons.forEach((button) => {
      button.addEventListener('click', () => activate(button.dataset.screen), { capture: false });
    });

    const active = document.querySelector('[data-screen].active')?.dataset.screen || 'home';
    setManagementVisibility(active);
    hideOwnerRecurringSettings();

    const observer = new MutationObserver(() => {
      const current = document.querySelector('[data-screen].active')?.dataset.screen || 'home';
      setManagementVisibility(current);
      hideOwnerRecurringSettings();
    });
    buttons.forEach((button) => observer.observe(button, { attributes: true, attributeFilter: ['class', 'aria-current'] }));

    const bodyObserver = new MutationObserver(() => hideOwnerRecurringSettings());
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    const logoutObserver = new MutationObserver(() => {
      const current = document.querySelector('[data-screen].active')?.dataset.screen || 'home';
      setManagementVisibility(current);
      hideOwnerRecurringSettings();
    });
    logoutObserver.observe(document.body, { childList: true, subtree: true });
    return true;
  }

  function boot() {
    const timer = setInterval(() => {
      hideOwnerRecurringSettings();
      if (install()) clearInterval(timer);
    }, 150);
    setTimeout(() => clearInterval(timer), 15000);
    setTimeout(hideOwnerRecurringSettings, 500);
    setTimeout(hideOwnerRecurringSettings, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();