(() => {
  'use strict';

  const STORAGE_KEY = 'ap207-dashboard-properties-v1';
  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';

  function readAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null'); } catch { return null; }
  }

  function canManageProperties() {
    const role = readAuth()?.profile?.role;
    return role === 'super_admin' || role === 'admin';
  }

  function readStoredProperties() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return parsed?.version === 1 && Array.isArray(parsed.properties) ? parsed.properties : [];
    } catch { return []; }
  }

  async function readDefaultProperties() {
    try {
      const response = await fetch(`./data.json?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      return Array.isArray(data.properties) ? data.properties : [];
    } catch { return []; }
  }

  function safeId(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  }

  function ensureStyles() {
    if (document.getElementById('propertyManagerStyles')) return;
    const style = document.createElement('style');
    style.id = 'propertyManagerStyles';
    style.textContent = `
      .property-manager-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
      .property-create-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border,#dde3ea)}
      .property-create-form .field-wide{grid-column:1/-1}
      .property-create-note{grid-column:1/-1;margin:0;color:#64748b;font-size:.82rem;line-height:1.45}
      .property-create-error{grid-column:1/-1;color:#b42318;font-weight:700;margin:0}
      @media(max-width:700px){.property-create-form{grid-template-columns:1fr}.property-create-form .field-wide{grid-column:auto}.property-manager-actions{width:100%}.property-manager-actions .button{flex:1 1 150px}}
    `;
    document.head.append(style);
  }

  function field(label, id, options = {}) {
    const wrap = document.createElement('div');
    wrap.className = options.wide ? 'field field-wide' : 'field';
    const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label;
    const input = document.createElement('input'); input.id = id; input.name = id; input.required = options.required !== false;
    if (options.type) input.type = options.type;
    if (options.maxLength) input.maxLength = options.maxLength;
    if (options.min !== undefined) input.min = String(options.min);
    if (options.max !== undefined) input.max = String(options.max);
    if (options.step !== undefined) input.step = String(options.step);
    if (options.placeholder) input.placeholder = options.placeholder;
    wrap.append(lab, input); return wrap;
  }

  function install() {
    if (!canManageProperties()) return;
    const section = document.getElementById('propertySettings');
    if (!section || document.getElementById('newPropertyButton')) return;
    ensureStyles();

    const heading = section.querySelector('.panel-heading');
    const existingButton = document.getElementById('editPropertyButton');
    const actions = document.createElement('div'); actions.className = 'property-manager-actions';
    if (existingButton) { existingButton.remove(); actions.append(existingButton); }
    const add = document.createElement('button');
    add.id = 'newPropertyButton'; add.type = 'button'; add.className = 'button button-primary'; add.textContent = '+ Nova propriedade/unidade';
    actions.append(add); heading?.append(actions);

    const form = document.createElement('form');
    form.id = 'newPropertyForm'; form.className = 'property-create-form'; form.hidden = true;
    form.append(
      field('Nome do proprietário', 'newPropertyOwnerName', { placeholder: 'Pode ser alterado depois' }),
      field('Nome da propriedade/empreendimento', 'newPropertyTitle', { placeholder: 'Ex.: One House Curitiba' }),
      field('Apartamento/unidade', 'newPropertyUnit', { placeholder: 'Ex.: AP305' }),
      field('Cidade', 'newPropertyCity'),
      field('Estado', 'newPropertyState', { maxLength: 2, placeholder: 'PR' }),
      field('Comissão administrativa (%)', 'newPropertyCommission', { type: 'number', min: 0, max: 100, step: 0.01 }),
      field('Endereço', 'newPropertyAddress', { wide: true }),
    );
    const note = document.createElement('p'); note.className = 'property-create-note'; note.textContent = 'Nesta etapa, a unidade pode ser criada antes do convite do proprietário. Depois vamos vincular o e-mail do proprietário e o administrador responsável.';
    const error = document.createElement('p'); error.id = 'newPropertyError'; error.className = 'property-create-error'; error.hidden = true;
    const formActions = document.createElement('div'); formActions.className = 'form-actions field-wide';
    const save = document.createElement('button'); save.type = 'submit'; save.className = 'button button-primary'; save.textContent = 'Salvar nova unidade';
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'button button-secondary'; cancel.textContent = 'Cancelar';
    formActions.append(save, cancel); form.append(note, error, formActions); section.append(form);

    add.addEventListener('click', () => {
      form.hidden = false; error.hidden = true;
      document.getElementById('newPropertyCommission').value = '15';
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    cancel.addEventListener('click', () => { form.reset(); form.hidden = true; error.hidden = true; });

    form.addEventListener('submit', async (event) => {
      event.preventDefault(); error.hidden = true;
      try {
        const auth = readAuth();
        if (!auth?.profile || !['super_admin','admin'].includes(auth.profile.role)) throw new Error('Seu usuário não tem permissão para criar propriedades.');
        const name = document.getElementById('newPropertyTitle').value.trim();
        const unit = document.getElementById('newPropertyUnit').value.trim();
        const city = document.getElementById('newPropertyCity').value.trim();
        const state = document.getElementById('newPropertyState').value.trim().toUpperCase();
        const address = document.getElementById('newPropertyAddress').value.trim();
        const ownerName = document.getElementById('newPropertyOwnerName').value.trim();
        const commission = Number(document.getElementById('newPropertyCommission').value);
        if (!name || !unit || !city || !state || !address || !ownerName) throw new Error('Preencha todos os campos da nova propriedade.');
        if (!Number.isFinite(commission) || commission < 0 || commission > 100) throw new Error('A comissão deve ficar entre 0% e 100%.');
        let properties = readStoredProperties();
        if (!properties.length) properties = await readDefaultProperties();
        const baseId = `property-${safeId(unit || name) || Date.now()}`;
        let id = baseId; let counter = 2;
        while (properties.some((item) => item.id === id)) { id = `${baseId}-${counter}`; counter += 1; }
        const userId = auth.profile.id || 'unassigned-admin';
        const property = {
          id,
          ownerName,
          name,
          unit,
          city,
          state,
          address,
          commissionRate: commission / 100,
          administratorId: auth.profile.role === 'admin' ? userId : 'unassigned-admin',
          ownerId: 'unassigned-owner'
        };
        properties.push(property);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, properties }));
        if (auth.profile.role === 'admin') {
          const ids = new Set(auth.propertyIds || []); ids.add(id); auth.propertyIds = [...ids];
          localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(auth));
        }
        localStorage.setItem(`ap207-dashboard-reservations-v1:${id}`, JSON.stringify({ version: 1, reservations: [] }));
        localStorage.setItem(`ap207-dashboard-expenses-v1:${id}`, JSON.stringify({ version: 1, expenses: [] }));
        alert(`Unidade ${unit} cadastrada com sucesso.`);
        location.reload();
      } catch (err) {
        error.textContent = err?.message || 'Não foi possível cadastrar a propriedade.'; error.hidden = false;
      }
    });
  }

  function boot() {
    const timer = setInterval(() => {
      const authenticated = document.body.classList.contains('ap207-authenticated');
      if (authenticated && document.getElementById('propertySettings')) { clearInterval(timer); install(); }
    }, 250);
    setTimeout(() => clearInterval(timer), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
