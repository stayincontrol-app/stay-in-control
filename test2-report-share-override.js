(() => {
  'use strict';
  function install() {
    const report = document.getElementById('monthlyReport');
    const button = document.getElementById('t2PrintReport');
    if (!report || !button || button.dataset.shareOverride === '1') return false;
    button.dataset.shareOverride = '1';
    button.classList.remove('t2-hidden-action');
    button.style.removeProperty('display');
    button.textContent = '↗ Compartilhar';
    button.title = 'Compartilhar relatório';
    button.onclick = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const title = document.getElementById('t2MetaTitle')?.textContent?.trim() || 'Relatório financeiro';
      const text = (report.innerText || title).replace(/\n{3,}/g, '\n\n').trim();
      if (window.Test2Share?.open) {
        window.Test2Share.open(title, text, report);
        return;
      }
      window.dispatchEvent(new CustomEvent('stay:approved-share', {detail:{title,text,element:report}}));
    };
    return true;
  }
  const timer = setInterval(() => { if (install()) clearInterval(timer); }, 250);
  setTimeout(() => clearInterval(timer), 15000);
})();
