(() => {
  'use strict';

  const AUTH_KEY = 'ap207-auth-profile-v1';
  const PROPS_KEY = 'ap207-dashboard-properties-v1';
  const PREFERRED_KEY = 'ap207-preferred-property-v1';

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch { return fallback; }
  };

  const safeId = (value) => String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 50);

  async function defaultProperties() {
    try {
      const response = await fetch(`./data.json?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      return Array.isArray(data.properties) ? data.properties : [];
    } catch { return []; }
  }

  async function workingProperties() {
    const stored = read(PROPS_KEY, null);
    if (stored?.version === 1 && Array.isArray(stored.properties) && stored.properties.length) return stored.properties;
    return defaultProperties();
  }

  async function submitFixed(form, event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const error = document.getElementById('newPropertyError');
    const save = form.querySelector('button[type="submit"]');
    if (error) error.hidden = true;
    const oldText = save?.textContent || 'Salvar nova unidade';
    if (save) { save.disabled = true; save.textContent = 'Salvando…'; }

    try {
      const auth = read(AUTH_KEY, null);
      const profile = auth?.profile;
      if (!profile || !['super_admin', 'admin'].includes(profile.role)) throw new Error('Seu usuário não tem permissão para criar propriedades.');

      const name = document.getElementById('newPropertyTitle')?.value.trim() || '';
      const unit = document.getElementById('newPropertyUnit')?.value.trim() || '';
      const city = document.getElementById('newPropertyCity')?.value.trim() || '';
      const state = document.getElementById('newPropertyState')?.value.trim().toUpperCase() || '';
      const address = document.getElementById('newPropertyAddress')?.value.trim() || '';
      const ownerName = document.getElementById('newPropertyOwnerName')?.value.trim() || '';
      const commission = Number(document.getElementById('newPropertyCommission')?.value);
      if (!name || !unit || !city || !ownerName) throw new Error('Preencha proprietário, propriedade, unidade e cidade.');
      if (!Number.isFinite(commission) || commission < 0 || commission > 100) throw new Error('A comissão deve ficar entre 0% e 100%.');

      const properties = await workingProperties();
      const baseId = `property-${safeId(unit || name) || Date.now()}`;
      let id = baseId, counter = 2;
      while (properties.some(p => p.id === id)) id = `${baseId}-${counter++}`;

      const property = {
        id, ownerName, name, unit, city,
        state: state || '—',
        address: address || 'Não informado',
        commissionRate: commission / 100,
        administratorId: profile.role === 'admin' ? profile.id : 'unassigned-admin',
        ownerId: 'unassigned-owner'
      };

      // Critical fix: an administrator's new unit must also be written to
      // property_access in Supabase BEFORE the page reloads. Otherwise the next
      // authentication refresh removes the local unit from that administrator.
      if (profile.role === 'admin') {
        const client = window.AP207Supabase;
        if (!client) throw new Error('O serviço de acesso ainda está carregando. Aguarde alguns segundos e tente novamente.');
        const { error: accessError } = await client.from('property_access').insert({ user_id: profile.id, property_id: id });
        if (accessError && !String(accessError.message || '').toLowerCase().includes('duplicate')) throw accessError;
      }

      properties.push(property);
      localStorage.setItem(PROPS_KEY, JSON.stringify({ version: 1, properties }));
      localStorage.setItem(`ap207-dashboard-reservations-v1:${id}`, JSON.stringify({ version: 1, reservations: [] }));
      localStorage.setItem(`ap207-dashboard-expenses-v1:${id}`, JSON.stringify({ version: 1, expenses: [] }));
      localStorage.setItem(PREFERRED_KEY, id);

      if (profile.role === 'admin') {
        const ids = new Set(auth.propertyIds || []);
        ids.add(id);
        auth.propertyIds = [...ids];
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      }

      // Keep the authenticated Supabase session and reload directly into the
      // dashboard with the newly created unit selected.
      location.reload();
    } catch (err) {
      if (error) {
        error.textContent = err?.message || 'Não foi possível cadastrar a propriedade.';
        error.hidden = false;
      }
      if (save) { save.disabled = false; save.textContent = oldText; }
    }
  }

  function install() {
    const form = document.getElementById('newPropertyForm');
    if (!form || form.dataset.stayCreateFix === '1') return false;
    form.dataset.stayCreateFix = '1';
    form.addEventListener('submit', (event) => submitFixed(form, event), true);
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 160) clearInterval(timer);
  }, 250);
})();