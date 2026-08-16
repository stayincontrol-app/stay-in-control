(() => {
  'use strict';

  function setManagementVisibility(screen) {
    const showManagement = screen === 'home';
    const propertySettings = document.getElementById('propertySettings');
    const userSection = document.getElementById('stayUserSection');

    if (propertySettings) propertySettings.style.display = showManagement ? '' : 'none';
    if (userSection) userSection.style.display = showManagement ? '' : 'none';
  }

  function activate(screen) {
    setManagementVisibility(screen);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function install() {
    if (document.body.dataset.stayScreenNavigation === '1') return true;
    const buttons = [...document.querySelectorAll('[data-screen]')];
    if (!buttons.length) return false;
    document.body.dataset.stayScreenNavigation = '1';

    buttons.forEach((button) => {
      button.addEventListener('click', () => activate(button.dataset.screen), { capture: false });
    });

    const active = document.querySelector('[data-screen].active')?.dataset.screen || 'home';
    setManagementVisibility(active);

    const observer = new MutationObserver(() => {
      const current = document.querySelector('[data-screen].active')?.dataset.screen || 'home';
      setManagementVisibility(current);
    });
    buttons.forEach((button) => observer.observe(button, { attributes: true, attributeFilter: ['class', 'aria-current'] }));
    return true;
  }

  function boot() {
    const timer = setInterval(() => {
      if (install()) clearInterval(timer);
    }, 150);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();