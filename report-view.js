(() => {
  'use strict';

  function ensureStyles() {
    if (document.getElementById('stayReportFocusStyles')) return;
    const style = document.createElement('style');
    style.id = 'stayReportFocusStyles';
    style.textContent = `
      body.stay-report-focus > nav,
      body.stay-report-focus .page-header,
      body.stay-report-focus #appStatus,
      body.stay-report-focus #propertySettings,
      body.stay-report-focus #stayUserSection,
      body.stay-report-focus #stayControlLogoutButton,
      body.stay-report-focus [data-screen],
      body.stay-report-focus .screen:not([data-screen-name="reports"]),
      body.stay-report-focus #reportControls,
      body.stay-report-focus #viewReportButton,
      body.stay-report-focus #generateReportButton { display:none !important; }
      body.stay-report-focus { background:#f4f7fb; }
      body.stay-report-focus main { padding-top:18px !important; }
      body.stay-report-focus #monthlyReport { display:block !important; margin-top:0 !important; }
      .stay-report-focus-header { display:flex; align-items:center; gap:12px; margin:0 0 16px; }
      .stay-report-back { border:0; border-radius:14px; background:#2563eb; color:#fff; font-weight:800; padding:13px 18px; min-height:48px; }
      .stay-report-focus-title { margin:0; font-size:1.35rem; color:#0f172a; }
    `;
    document.head.append(style);
  }

  function enterFocus(report) {
    ensureStyles();
    document.body.classList.add('stay-report-focus');
    let header = document.getElementById('stayReportFocusHeader');
    if (!header) {
      header = document.createElement('div');
      header.id = 'stayReportFocusHeader';
      header.className = 'stay-report-focus-header';
      header.innerHTML = '<button type="button" class="stay-report-back">← Voltar</button><h2 class="stay-report-focus-title">Relatório mensal</h2>';
      report.insertAdjacentElement('beforebegin', header);
      header.querySelector('.stay-report-back').addEventListener('click', exitFocus);
    }
    header.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitFocus() {
    document.body.classList.remove('stay-report-focus');
    const header = document.getElementById('stayReportFocusHeader');
    if (header) header.hidden = true;
    const reportsTab = document.querySelector('[data-screen="reports"]');
    if (reportsTab) reportsTab.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

    view.addEventListener('click', () => enterFocus(report));
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