(() => {
  'use strict';
  const AUTH = 'ap207-auth-profile-v1';
  let enabled = false;
  let checked = false;
  let checking = false;
  let requestStatus = '';
  let pendingRequests = [];
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
        const { data: request, error: requestError } = await client.from('automatic_payment_requests')
          .select('status').eq('administrator_id', session.user.id).maybeSingle();
        if (requestError) throw requestError;
        requestStatus = request?.status || '';
      } else if (p.role === 'super_admin' && client?.auth && client?.from) {
        const { data: session, error: sessionError } = await client.auth.getUser();
        if (sessionError || String(session?.user?.id || '') !== String(p.id || '')) throw new Error('Sessão inválida');
        const { data: requests, error: requestError } = await client.from('automatic_payment_requests')
          .select('administrator_id,requested_at').eq('status', 'pending').order('requested_at');
        if (requestError) throw requestError;
        pendingRequests = requests || [];
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
    const state = p.role + ':' + String(checked) + ':' + String(enabled) + ':' + requestStatus;
    if (box.dataset.state === state) return;
    box.dataset.state = state;
    box.replaceChildren();
    if (p.role === 'admin' && !enabled) {
      box.append(document.createTextNode('Pagamentos automáticos aguardam liberação do Super Administrador. '));
      if (requestStatus !== 'pending' && requestStatus !== 'approved') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button button-secondary';
        button.textContent = 'Pedir liberação ao Super Administrador';
        button.onclick = async () => {
          button.disabled = true;
          try {
            const client = window.AP207Supabase;
            const { data: session, error: authError } = await client.auth.getUser();
            if (authError || String(session?.user?.id || '') !== String(p.id || '')) throw new Error('Entre novamente para solicitar.');
            const { error } = await client.from('automatic_payment_requests')
              .insert({ administrator_id: session.user.id });
            if (error && error.code !== '23505') throw error;
            requestStatus = 'pending';
            paint();
          } catch (error) { alert(error.message || 'Não foi possível enviar o pedido.'); }
          finally { button.disabled = false; }
        };
        box.append(button, document.createTextNode(' '));
      } else box.append(document.createTextNode(requestStatus === 'approved' ? 'O acesso anterior está desativado. Contate o Super Administrador. ' : 'Pedido enviado. '));
      const link = document.createElement('a');
      link.href = 'https://wa.me/15612756810?text=' + encodeURIComponent('Olá, gostaria de solicitar a liberação dos pagamentos automáticos no Stay in Control.');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Entrar em contato';
      box.append(link);
    } else if (p.role === 'admin') {
      box.textContent = 'Acesso liberado. A cobrança bancária só ficará disponível após a conexão segura com o Asaas.';
    } else if (p.role === 'super_admin') {
      box.textContent = 'Somente o Super Administrador libera o acesso por administrador em Planos & Pagamentos. A integração bancária ainda precisa ser conectada.';
    }
  }

  async function showRequests(parent) {
    const p = profile();
    if (p.role !== 'super_admin' || !checked || !parent) return;
    let panel = parent.querySelector('[data-auto-requests]');
    if (!panel) {
      panel = document.createElement('section');
      panel.dataset.autoRequests = '1';
      panel.className = 't2-contract-receipt';
      parent.append(panel);
    }
    const ids = pendingRequests.map(x => x.administrator_id).join(',');
    if (panel.dataset.ids === ids) return;
    panel.dataset.ids = ids;
    panel.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = 'Pedidos de liberação de pagamentos automáticos';
    panel.append(title);
    if (!pendingRequests.length) {
      panel.append(document.createTextNode('Nenhum pedido pendente. Liberações individuais também estão em Planos & Pagamentos.'));
      return;
    }
    const client = window.AP207Supabase;
    const { data: profiles } = await client.from('profiles').select('id,name,email').in('id', pendingRequests.map(x => x.administrator_id));
    for (const request of pendingRequests) {
      if (!panel.isConnected || panel.dataset.ids !== ids) return;
      const admin = profiles?.find(x => x.id === request.administrator_id);
      const row = document.createElement('div');
      row.className = 't2-contract-file-row';
      const name = document.createElement('span');
      name.textContent = admin?.name || admin?.email || request.administrator_id;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-primary';
      button.textContent = 'Liberar para este administrador';
      button.onclick = async () => {
        button.disabled = true;
        try {
          const { data: session, error: authError } = await client.auth.getUser();
          if (authError || String(session?.user?.id || '') !== String(profile().id || '')) throw new Error('Entre novamente como Super Administrador.');
          const { data: existing, error: readError } = await client.from('commercial_access')
            .select('administrator_id').eq('administrator_id', request.administrator_id).maybeSingle();
          if (readError) throw readError;
          if (!existing) throw new Error('Cadastre o plano desse administrador em Planos & Pagamentos antes de liberar.');
          const { data: updated, error: updateError } = await client.from('commercial_access')
            .update({ automatic_payments_enabled: true, updated_at: new Date().toISOString() })
            .eq('administrator_id', request.administrator_id).select('administrator_id').single();
          if (updateError || !updated) throw updateError || new Error('Não foi possível liberar o acesso.');
          const { error: requestError } = await client.from('automatic_payment_requests')
            .update({ status: 'approved', reviewed_at: new Date().toISOString() })
            .eq('administrator_id', request.administrator_id);
          if (requestError) throw requestError;
          pendingRequests = pendingRequests.filter(x => x.administrator_id !== request.administrator_id);
          panel.dataset.ids = '';
          showRequests(parent);
          window.dispatchEvent(new Event('stay:commercial-changed'));
        } catch (error) { alert(error.message || 'Não foi possível liberar.'); }
        finally { button.disabled = false; }
      };
      row.append(name, button);
      panel.append(row);
    }
  }

  function paint() {
    const p = profile();
    const box = document.getElementById('t2ContractPayments');
    if (box) {
      const mode = box.querySelector('#t2PaymentMode');
      if (mode) {
        const option = mode.querySelector('option[value="asaas"]');
        if (option) option.disabled = !checked || !enabled;
        if (mode.value === 'asaas' && !enabled) mode.value = 'manual';
        contact(box.querySelector('.t2-contract-pay-head') || box);
        showRequests(box.querySelector('.t2-contract-pay-head') || box);
      }
    }
    const form = document.getElementById('ltForm');
    if (form && ['admin', 'super_admin'].includes(p.role)) {
      const mode = form.elements.namedItem('paymentMode');
      const option = mode?.querySelector('option[value="automatic"]');
      if (option) option.disabled = !checked || !enabled;
      if (mode?.value === 'automatic' && !enabled) mode.value = 'manual';
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
