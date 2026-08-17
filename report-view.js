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
      body.stay-report-focus [data-screen-panel="reports"] > *,
      body.stay-report-focus #monthlyReport .report-toolbar { display:none !important; }
      body.stay-report-focus { background:#f4f7fb; }
      body.stay-report-focus main { padding-top:18px !important; }
      body.stay-report-focus [data-screen-panel="reports"],
      body.stay-report-focus #monthlyReport,
      body.stay-report-focus #stayReportFocusHeader { display:block !important; }
      body.stay-report-focus #monthlyReport { margin-top:0 !important; }
      .stay-report-focus-header { align-items:center; gap:10px; margin:0 0 16px; flex-wrap:wrap; }
      body.stay-report-focus #stayReportFocusHeader { display:flex !important; }
      .stay-report-back,.stay-report-action { border:0; border-radius:14px; font-weight:800; padding:12px 15px; min-height:46px; }
      .stay-report-back { background:#2563eb; color:#fff; }
      .stay-report-action { background:#fff; color:#172033; border:1px solid #d7dee8; }
      .stay-report-focus-title { margin:0; font-size:1.35rem; color:#0f172a; flex:1 1 170px; }
      @media print {
        #stayReportFocusHeader { display:none !important; }
        body.stay-report-focus { background:#fff !important; }
      }
    `;
    document.head.append(style);
  }

  function reportText(report) {
    return (report?.innerText || 'Relatório Stay in Control').replace(/\n{3,}/g,'\n\n').trim();
  }

  async function shareReport(report) {
    const text = reportText(report);
    if (navigator.share) {
      try { await navigator.share({ title:'Relatório Stay in Control', text }); return; } catch (e) { if (e?.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); alert('Relatório copiado. Agora você pode colar e compartilhar.'); }
    catch { alert('O compartilhamento não está disponível neste navegador.'); }
  }

  function enterFocus(report) {
    ensureStyles();
    document.body.classList.add('stay-report-focus');
    let header = document.getElementById('stayReportFocusHeader');
    if (!header) {
      header = document.createElement('div');
      header.id = 'stayReportFocusHeader';
      header.className = 'stay-report-focus-header';
      header.innerHTML = '<button type="button" class="stay-report-back">← Voltar</button><h2 class="stay-report-focus-title">Relatório mensal</h2><button type="button" class="stay-report-action" id="stayReportShare">Compartilhar</button>';
      report.insertAdjacentElement('beforebegin', header);
      header.querySelector('.stay-report-back').addEventListener('click', exitFocus);
      header.querySelector('#stayReportShare').addEventListener('click', () => shareReport(report));
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

  function installPendingFilters() {
    ['reportMonth','reportYear','reportUnit'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.pendingOnly === 'true') return;
      el.dataset.pendingOnly = 'true';
      el.addEventListener('change', (event) => event.stopImmediatePropagation(), true);
    });
  }

  function install() {
    const generate = document.getElementById('generateReportButton');
    const report = document.getElementById('monthlyReport');
    if (!generate || !report) return false;
    installPendingFilters();
    if (document.getElementById('viewReportButton')) return true;

    const view = document.createElement('button');
    view.id = 'viewReportButton'; view.type = 'button'; view.className = 'button button-secondary';
    view.textContent = 'Visualizar relatório'; view.hidden = true;
    view.style.background = '#2563eb'; view.style.borderColor = '#2563eb'; view.style.color = '#ffffff'; view.style.fontWeight = '700';
    generate.insertAdjacentElement('afterend', view);

    generate.addEventListener('click', () => setTimeout(() => {
      view.hidden = false;
      const status = document.getElementById('appStatus');
      if (status) { status.className='app-status success'; status.textContent='Relatório atualizado. Toque em “Visualizar relatório” para conferir.'; status.hidden=false; }
    }, 0));

    view.addEventListener('click', () => enterFocus(report));
    return true;
  }

  function boot() {
    const timer = setInterval(() => { if (install()) clearInterval(timer); }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();