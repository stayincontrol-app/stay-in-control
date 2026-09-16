(() => {
  'use strict';
  const replace = (value) => String(value || '')
    .replace(/SYSTEM CONTROL TEST 2\.0/gi, 'STAY IN CONTROL')
    .replace(/System Control Test 2\.0/gi, 'Stay in Control')
    .replace(/^SYSTEM CONTROL$/gi, 'STAY IN CONTROL')
    .replace(/^TEST 2\.0$/gi, 'PRINCIPAL')
    .replace(/\s*[•·-]?\s*AMBIENTE DE TESTE/gi, '')
    .replace(/\bTEST 2\.0\b/gi, 'PRINCIPAL');
  function installResponsiveGuard() {
    if (document.getElementById('stayOfficialResponsiveGuard')) return;
    const style = document.createElement('style');
    style.id = 'stayOfficialResponsiveGuard';
    style.textContent = `
      @media (max-width: 720px) {
        html, body { max-width: 100%; overflow-x: hidden !important; }
        .t2v2-head-actions { width: 100%; max-width: 100%; flex-wrap: wrap; overflow: visible; }
        .t2v2-head-actions > select,
        .t2v2-head-actions > button { flex: 1 1 100%; width: 100%; max-width: 100%; box-sizing: border-box; }
        #consolidatedReports,
        #consolidatedReports .report-toolbar,
        #consolidatedReports .report-filters,
        #consolidatedReports .stay-general-actions,
        #consolidatedReports select,
        #consolidatedReports button { min-width: 0; max-width: 100%; box-sizing: border-box; }
        #consolidatedReports .report-filters,
        #consolidatedReports .stay-general-actions,
        #consolidatedReports select,
        #consolidatedReports .stay-general-actions > button { width: 100%; }
      }
    `;
    document.head.append(style);
  }
  function apply(root = document.body) {
    document.title = 'Stay in Control';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const next = replace(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    document.querySelectorAll('[aria-label],[title]').forEach((element) => {
      for (const name of ['aria-label', 'title']) {
        const current = element.getAttribute(name);
        if (current) element.setAttribute(name, replace(current));
      }
    });
  }
  function boot() {
    installResponsiveGuard();
    apply();
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') {
          record.target.nodeValue = replace(record.target.nodeValue);
          continue;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.nodeValue = replace(node.nodeValue);
          else if (node.nodeType === Node.ELEMENT_NODE) apply(node);
        });
      }
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
