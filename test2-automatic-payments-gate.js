(() => {
  'use strict';
  const AUTH = 'ap207-auth-profile-v1';
  let enabled = false;
  let checked = false;
  let checking = false;
  const profile = () => { try { return JSON.parse(localStorage.getItem(AUTH) || '{}').profile || {}; } catch { return {}; } };

  async function verifyAccess() {
    if (checking) return;
    checking = true;
    enabled = false;
    checked = false;
    try {
      const p = profile(), client = window.AP207Supabase;
      if (p.role === 'admin' && client?.auth && client?.from) {
        const { data: session, error: sessionError } = await client.auth.getUser();
        if (sessionError || String(session?.user?.id || '') !== String(p.id || '')) throw new Error('Sessão inválida');
        const { data, error } = await client.from('commercial_access')
          .select('automatic_payments_enabled,blocked')
          .eq('administrator_id', session.user.id).maybeSingle();
        if (error) throw error;
        enabled = data?.automatic_payments_enabled === true && data?.blocked === false;
      }
    } catch { enabled = false; }
    finally { checked = true; checking = false; paint(); }
  }

  function contact(parent) {
    let box = parent.querySelector('[data-automatic-access-note]');
    if (!box) {
      box = document.createElement('p');
      box.dataset.automaticAccessNote = '1';
      parent.append(box);
    }
    const p = profile();
    const state = p.role + ':' + String(checked) + ':' + String(enabled);
    if (box.dataset.state === state) return;
    box.dataset.state = state;
    box.replaceChildren();
    if (p.role === 'admin' && !enabled) {
      box.append(document.createTextNode('Pagamentos automáticos aguardam liberação do Super Administrador. '));
      const link = document.createElement('a');
      link.href = 'https://wa.me/15612756810?text=' + encodeURIComponent('Olá, gostaria de solicitar a liberação dos pagamentos automáticos no Stay in Control.');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Solicitar liberação';
      box.append(link);
    } else if (p.role === 'admin') {
      box.textContent = 'Acesso liberado. A cobrança bancária só ficará disponível após a conexão segura com o Asaas.';
    } else if (p.role === 'super_admin') {
      box.textContent = 'Somente o Super Administrador libera o acesso por administrador em Planos & Pagamentos. A integração bancária ainda precisa ser conectada.';
    }
  }

  function paint() {
    const p = profile();
    const bankReady = false; // Não existe backend de cobrança Asaas neste teste.
    const box = document.getElementById('t2ContractPayments');
    if (box) {
      const mode = box.querySelector('#t2PaymentMode');
      if (mode) {
        const option = mode.querySelector('option[value="asaas"]');
        if (option) option.disabled = !checked || !enabled || !bankReady;
        if (mode.value === 'asaas' && (!enabled || !bankReady)) mode.value = 'manual';
        contact(box.querySelector('.t2-contract-pay-head') || box);
      }
    }
    const form = document.getElementById('ltForm');
    if (form && ['admin', 'super_admin'].includes(p.role)) {
      const mode = form.elements.namedItem('paymentMode');
      const option = mode?.querySelector('option[value="automatic"]');
      if (option) option.disabled = !checked || !enabled || !bankReady;
      if (mode?.value === 'automatic' && (!enabled || !bankReady)) mode.value = 'manual';
      contact(form);
    }
  }

  function boot() {
    verifyAccess();
    let timer;
    new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(paint, 100); })
      .observe(document.body, { childList: true, subtree: true });
    window.addEventListener('stay:unified-navigation', verifyAccess);
    window.addEventListener('stay:commercial-changed', verifyAccess);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
