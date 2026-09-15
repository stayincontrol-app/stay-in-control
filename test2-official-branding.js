(() => {
  'use strict';
  const replace = (value) => String(value || '')
    .replace(/SYSTEM CONTROL TEST 2\.0/gi, 'STAY IN CONTROL')
    .replace(/System Control Test 2\.0/gi, 'Stay in Control')
    .replace(/\bTEST 2\.0\b/gi, 'PRINCIPAL');
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
    apply();
    new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.nodeValue = replace(node.nodeValue);
          else if (node.nodeType === Node.ELEMENT_NODE) apply(node);
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
