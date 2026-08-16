(() => {
  'use strict';

  function install() {
    const generate = document.getElementById('generateReportButton');
    const report = document.getElementById('monthlyReport');
    if (!generate || !report || document.getElementById('viewReportButton')) return false;

    const view = document.createElement('button');
    view.id = 'viewReportButton';
    view.type = 'button';
    view.className = 'button button-secondary';
    view.textContent = 'Visualizar relatório';
    view.hidden = true;
    view.style.background = '#2563eb';
    view.style.borderColor = '#2563eb';
    view.style.color = '#ffffff';
    view.style.fontWeight = '700';

    generate.insertAdjacentElement('afterend', view);

    // Intercepta o clique antes do manipulador antigo que abria a impressão direto.
    document.addEventListener('click', (event) => {
      if (event.target !== generate) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      view.hidden = false;
      const status = document.getElementById('appStatus');
      if (status) {
        status.className = 'app-status success';
        status.textContent = 'Relatório gerado. Toque em “Visualizar relatório” para conferir.';
        status.hidden = false;
      }
    }, true);

    view.addEventListener('click', () => {
      report.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return true;
  }

  function boot() {
    const timer = setInterval(() => {
      if (install()) clearInterval(timer);
    }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();