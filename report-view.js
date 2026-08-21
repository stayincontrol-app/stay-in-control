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
      .stay-general-actions{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:10px}
      .stay-general-view{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important;font-weight:800}
      .stay-general-share{background:#fff!important;border:1px solid #d7dee8!important;color:#172033!important;font-weight:800;white-space:nowrap}
      #stayGeneralReportOverlay[hidden]{display:none!important}
      #stayGeneralReportOverlay{position:fixed;inset:0;z-index:999999;background:#f4f7fb;overflow:auto;padding:18px}
      .stay-general-overlay-inner{width:min(100%,980px);margin:0 auto}
      .stay-general-overlay-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;position:sticky;top:0;z-index:2;background:rgba(244,247,251,.96);padding:8px 0}
      .stay-general-overlay-header h2{margin:0;flex:1 1 180px;color:#0f172a}
      .stay-general-overlay-body{display:grid;gap:14px}
      .stay-general-overlay-body .report-toolbar,.stay-general-overlay-body .general-report-note,.stay-general-overlay-body #stayRevenue{display:none!important}
      @media(max-width:600px){.stay-general-actions{grid-template-columns:1fr}.stay-general-share{width:100%}}
      @media print {
        #stayReportFocusHeader { display:none !important; }
        body.stay-report-focus { background:#fff !important; }
        #stayGeneralReportOverlay .stay-general-overlay-header{display:none!important}
        #stayGeneralReportOverlay{position:static;padding:0;background:#fff}
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

  function downloadReport(report) {
    const period = document.getElementById('reportPeriod')?.textContent?.trim().replace(/\s+/g,'-') || 'relatorio';
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório Stay in Control</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:24px;color:#172033;background:#fff}section{max-width:900px;margin:auto}button,select{display:none!important}</style></head><body><section>${report.outerHTML}</section></body></html>`;
    const blob = new Blob([html], { type:'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stay-in-Control-${period}.html`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function enterFocus(report) {
    ensureStyles();
    document.body.classList.add('stay-report-focus');
    let header = document.getElementById('stayReportFocusHeader');
    if (!header) {
      header = document.createElement('div');
      header.id = 'stayReportFocusHeader';
      header.className = 'stay-report-focus-header';
      header.innerHTML = '<button type="button" class="stay-report-back">← Voltar</button><h2 class="stay-report-focus-title">Relatório mensal</h2><button type="button" class="stay-report-action" id="stayReportShare">Compartilhar</button><button type="button" class="stay-report-action" id="stayReportDownload">Baixar</button><button type="button" class="stay-report-action" id="stayReportPrint">Imprimir</button>';
      report.insertAdjacentElement('beforebegin', header);
      header.querySelector('.stay-report-back').addEventListener('click', exitFocus);
      header.querySelector('#stayReportShare').addEventListener('click', () => shareReport(report));
      header.querySelector('#stayReportDownload').addEventListener('click', () => downloadReport(report));
      header.querySelector('#stayReportPrint').addEventListener('click', () => window.print());
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
    if (!document.getElementById('viewReportButton')) {
      const view = document.createElement('button');
      view.id = 'viewReportButton'; view.type = 'button'; view.className = 'button button-secondary';
      view.textContent = 'Visualizar relatório'; view.hidden = true;
      view.style.background = '#2563eb'; view.style.borderColor = '#2563eb'; view.style.color = '#ffffff'; view.style.fontWeight = '700';
      generate.insertAdjacentElement('afterend', view);

      generate.addEventListener('click', () => setTimeout(() => {
        generate.textContent = 'Atualizar relatório';
        view.hidden = false;
        const status = document.getElementById('appStatus');
        if (status) { status.className='app-status success'; status.textContent='Relatório atualizado com os dados selecionados.'; status.hidden=false; }
      }, 0));

      view.addEventListener('click', () => enterFocus(report));
    }
    return true;
  }

  function currentRole() {
    try { return JSON.parse(localStorage.getItem('ap207-auth-profile-v1') || 'null')?.profile?.role || ''; }
    catch { return ''; }
  }

  function generalShareText(section) {
    const clone = section.cloneNode(true);
    clone.querySelector('.report-toolbar')?.remove();
    clone.querySelector('.general-report-note')?.remove();
    clone.querySelector('#stayRevenue')?.remove();
    return reportText(clone);
  }

  async function shareGeneralReport(section) {
    const month = section.querySelector('#consolidatedMonth')?.selectedOptions?.[0]?.textContent || '';
    const year = section.querySelector('#consolidatedYear')?.value || '';
    const text = generalShareText(section);
    if (navigator.share) {
      try { await navigator.share({ title:`Relatório geral Stay in Control — ${month} ${year}`.trim(), text }); return; }
      catch (e) { if (e?.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); alert('Relatório geral copiado. Agora você pode colar e compartilhar.'); }
    catch { alert('O compartilhamento não está disponível neste navegador.'); }
  }

  function openGeneralReport(section) {
    ensureStyles();
    let overlay = document.getElementById('stayGeneralReportOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'stayGeneralReportOverlay';
      overlay.innerHTML = '<div class="stay-general-overlay-inner"><div class="stay-general-overlay-header"><button type="button" class="stay-report-back" id="stayGeneralBack">← Voltar</button><h2>Relatório geral</h2><button type="button" class="stay-report-action" id="stayGeneralShareTop">↗ Compartilhar</button></div><div class="stay-general-overlay-body" id="stayGeneralOverlayBody"></div></div>';
      document.body.append(overlay);
      overlay.querySelector('#stayGeneralBack').addEventListener('click', () => { overlay.hidden = true; document.body.style.overflow = ''; });
      overlay.querySelector('#stayGeneralShareTop').addEventListener('click', () => shareGeneralReport(section));
    }
    const clone = section.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.querySelector('.report-toolbar')?.remove();
    clone.querySelector('.general-report-note')?.remove();
    clone.querySelector('#stayRevenue')?.remove();
    const body = overlay.querySelector('#stayGeneralOverlayBody');
    body.replaceChildren(clone);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
  }

  function installGeneralReportActions() {
    if (currentRole() !== 'super_admin') return true;
    const section = document.getElementById('consolidatedReports');
    const refresh = document.getElementById('refreshConsolidated');
    if (!section || !refresh) return false;
    if (document.getElementById('stayGeneralView')) return true;
    ensureStyles();
    const wrap = document.createElement('div');
    wrap.className = 'stay-general-actions';
    const view = document.createElement('button');
    view.id = 'stayGeneralView';
    view.type = 'button';
    view.className = 'button stay-general-view';
    view.textContent = 'Visualizar relatório';
    const share = document.createElement('button');
    share.id = 'stayGeneralShare';
    share.type = 'button';
    share.className = 'button stay-general-share';
    share.textContent = '↗ Compartilhar';
    wrap.append(view, share);
    refresh.insertAdjacentElement('afterend', wrap);
    view.addEventListener('click', () => openGeneralReport(section));
    share.addEventListener('click', () => shareGeneralReport(section));
    return true;
  }

  function boot() {
    const timer = setInterval(() => {
      const monthlyReady = install();
      const generalReady = installGeneralReportActions();
      if (monthlyReady && generalReady) clearInterval(timer);
    }, 200);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();