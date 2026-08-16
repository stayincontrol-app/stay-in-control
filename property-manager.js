(() => {
  'use strict';

  const STORAGE_KEY = 'ap207-dashboard-properties-v1';
  const AUTH_CACHE_KEY = 'ap207-auth-profile-v1';
  const PREFERRED_PROPERTY_KEY = 'ap207-preferred-property-v1';

  function readAuth() { try { return JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null'); } catch { return null; } }
  function canManageProperties() { const role = readAuth()?.profile?.role; return role === 'super_admin' || role === 'admin'; }
  function readStoredProperties() { try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return parsed?.version === 1 && Array.isArray(parsed.properties) ? parsed.properties : []; } catch { return []; } }
  async function readDefaultProperties() { try { const response = await fetch(`./data.json?ts=${Date.now()}`, { cache: 'no-store' }); const data = await response.json(); return Array.isArray(data.properties) ? data.properties : []; } catch { return []; } }
  function safeId(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50); }
  function writeProperties(properties){ localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, properties })); }
  function currentPropertyId(){ return document.getElementById('propertySelector')?.value || localStorage.getItem(PREFERRED_PROPERTY_KEY) || ''; }

  function setPreferredProperty(id) {
    if (!id) return;
    localStorage.setItem(PREFERRED_PROPERTY_KEY, id);
    const properties = readStoredProperties();
    const index = properties.findIndex((item) => item.id === id);
    if (index > 0) { const selected = properties.splice(index, 1)[0]; properties.unshift(selected); writeProperties(properties); }
  }

  async function persistAdminAccess(userId, propertyId) {
    const client = window.AP207Supabase;
    if (!client) throw new Error('O serviço de acesso ainda está carregando. Aguarde alguns segundos e tente novamente.');
    const { error } = await client.from('property_access').upsert(
      { user_id: userId, property_id: propertyId },
      { onConflict: 'user_id,property_id', ignoreDuplicates: false }
    );
    if (error) throw new Error(error.message || 'Não foi possível vincular a nova unidade ao administrador.');
  }

  function ensureStyles() {
    if (document.getElementById('propertyManagerStyles')) return;
    const style = document.createElement('style'); style.id = 'propertyManagerStyles';
    style.textContent = `.property-manager-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.property-create-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border,#dde3ea)}.property-create-form .field-wide{grid-column:1/-1}.property-create-note{grid-column:1/-1;margin:0;color:#64748b;font-size:.82rem;line-height:1.45}.property-create-error{grid-column:1/-1;color:#b42318;font-weight:700;margin:0}.property-create-success{grid-column:1/-1;padding:14px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0}.property-create-success strong{display:block;margin-bottom:8px}.property-create-success .button{margin-top:10px}.button-danger{background:#dc2626!important;border-color:#dc2626!important;color:#fff!important}.button-danger-soft{background:#fff1f2!important;border:1px solid #fecdd3!important;color:#b42318!important}.property-manager-empty{margin:12px 0 0;padding:12px 14px;border-radius:12px;background:#eff6ff;color:#1e3a8a;font-weight:700}@media(max-width:700px){.property-create-form{grid-template-columns:1fr}.property-create-form .field-wide{grid-column:auto}.property-manager-actions{width:100%}.property-manager-actions .button{flex:1 1 150px}}`;
    document.head.append(style);
  }

  function field(label, id, options = {}) {
    const wrap = document.createElement('div'); wrap.className = options.wide ? 'field field-wide' : 'field';
    const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label;
    const input = document.createElement('input'); input.id = id; input.name = id; input.required = options.required !== false;
    if (options.type) input.type = options.type; if (options.maxLength) input.maxLength = options.maxLength; if (options.min !== undefined) input.min = String(options.min); if (options.max !== undefined) input.max = String(options.max); if (options.step !== undefined) input.step = String(options.step); if (options.placeholder) input.placeholder = options.placeholder;
    wrap.append(lab, input); return wrap;
  }

  function installPropertySwitcher() {
    const selector = document.getElementById('propertySelector'); if (!selector || selector.dataset.reloadSwitcher === 'true') return;
    selector.dataset.reloadSwitcher = 'true'; selector.addEventListener('change', () => { const id = selector.value; if (!id) return; setPreferredProperty(id); setTimeout(() => location.reload(), 40); });
  }

  async function getWorkingProperties(){ const stored=readStoredProperties(); return stored.length ? stored : await readDefaultProperties(); }

  async function removeOwnerFromCurrentUnit(){
    const id=currentPropertyId(); if(!id)return alert('Selecione uma unidade primeiro.');
    let properties=await getWorkingProperties(); const index=properties.findIndex(p=>p.id===id); if(index<0)return alert('Unidade não encontrada.');
    const p=properties[index]; const owner=p.ownerName||'proprietário';
    if(!confirm(`Remover ${owner} da unidade ${p.unit||p.name||''}?\n\nA unidade e as reservas serão mantidas. Apenas o vínculo com o proprietário será removido.`))return;
    properties[index]={...p,ownerName:'Sem proprietário',ownerId:'unassigned-owner'}; writeProperties(properties); location.reload();
  }

  async function deleteCurrentUnit(){
    const id=currentPropertyId(); if(!id)return alert('Selecione uma unidade primeiro.');
    let properties=await getWorkingProperties(); const target=properties.find(p=>p.id===id); if(!target)return alert('Unidade não encontrada.');
    const label=target.unit||target.name||'esta unidade';
    if(!confirm(`Excluir a unidade ${label}?\n\nIsso removerá a unidade deste painel e também os dados locais de reservas e despesas dela. Esta ação não pode ser desfeita.`))return;
    properties=properties.filter(p=>p.id!==id); writeProperties(properties);
    localStorage.removeItem(`ap207-dashboard-reservations-v1:${id}`); localStorage.removeItem(`ap207-dashboard-expenses-v1:${id}`);
    const auth=readAuth(); if(auth?.propertyIds){auth.propertyIds=auth.propertyIds.filter(pid=>pid!==id); localStorage.setItem(AUTH_CACHE_KEY,JSON.stringify(auth));}
    const next=properties[0]?.id||''; if(next)localStorage.setItem(PREFERRED_PROPERTY_KEY,next); else localStorage.removeItem(PREFERRED_PROPERTY_KEY); location.reload();
  }

  function install() {
    installPropertySwitcher(); if (!canManageProperties()) return;
    const section = document.getElementById('propertySettings'); if (!section || document.getElementById('newPropertyButton')) return; ensureStyles();
    section.hidden=false;
    const heading = section.querySelector('.panel-heading');
    const title=heading?.querySelector('h2'); if(title) title.textContent='Gerenciar propriedades e unidades';
    const existingButton = document.getElementById('editPropertyButton'); const actions = document.createElement('div'); actions.className = 'property-manager-actions';
    const hasCurrent=Boolean(currentPropertyId());
    if (existingButton) { existingButton.remove(); existingButton.hidden=!hasCurrent; actions.append(existingButton); }
    const add = document.createElement('button'); add.id = 'newPropertyButton'; add.type = 'button'; add.className = 'button button-primary'; add.textContent = '+ Nova propriedade/unidade'; actions.append(add);
    const removeOwner=document.createElement('button'); removeOwner.id='removeOwnerButton'; removeOwner.type='button'; removeOwner.className='button button-danger-soft'; removeOwner.textContent='Remover proprietário'; removeOwner.hidden=!hasCurrent; removeOwner.addEventListener('click',removeOwnerFromCurrentUnit); actions.append(removeOwner);
    const del=document.createElement('button'); del.id='deletePropertyButton'; del.type='button'; del.className='button button-danger'; del.textContent='Excluir unidade'; del.hidden=!hasCurrent; del.addEventListener('click',deleteCurrentUnit); actions.append(del);
    heading?.append(actions);
    if(!hasCurrent){const info=document.createElement('p');info.className='property-manager-empty';info.textContent='Você ainda não possui uma unidade atribuída. Use “+ Nova propriedade/unidade” para cadastrar a primeira.';heading?.insertAdjacentElement('afterend',info);}

    const form = document.createElement('form'); form.id = 'newPropertyForm'; form.className = 'property-create-form'; form.hidden = true;
    form.append(field('Nome do proprietário', 'newPropertyOwnerName', { placeholder: 'Pode ser alterado depois' }),field('Nome da propriedade/empreendimento', 'newPropertyTitle', { placeholder: 'Ex.: One House Curitiba' }),field('Apartamento/unidade', 'newPropertyUnit', { placeholder: 'Ex.: AP305' }),field('Cidade', 'newPropertyCity'),field('Estado (opcional)', 'newPropertyState', { required: false, maxLength: 2, placeholder: 'Ex.: PR' }),field('Comissão administrativa (%)', 'newPropertyCommission', { type: 'number', min: 0, max: 100, step: 0.01 }),field('Endereço (opcional)', 'newPropertyAddress', { required: false, wide: true, placeholder: 'Pode ser preenchido depois' }));
    const note = document.createElement('p'); note.className = 'property-create-note'; note.textContent = 'Estado e endereço são opcionais. A unidade pode ser criada antes do convite do proprietário; depois vamos vincular o e-mail do proprietário e o administrador responsável.';
    const error = document.createElement('p'); error.id = 'newPropertyError'; error.className = 'property-create-error'; error.hidden = true;
    const success = document.createElement('div'); success.id = 'newPropertySuccess'; success.className = 'property-create-success'; success.hidden = true;
    const formActions = document.createElement('div'); formActions.className = 'form-actions field-wide';
    const save = document.createElement('button'); save.type = 'submit'; save.className = 'button button-primary'; save.textContent = 'Salvar nova unidade';
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'button button-secondary'; cancel.textContent = 'Cancelar'; formActions.append(save, cancel); form.append(note, error, success, formActions); section.append(form);

    add.addEventListener('click', () => { form.hidden = false; error.hidden = true; success.hidden = true; formActions.hidden = false; document.getElementById('newPropertyCommission').value = '15'; form.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
    cancel.addEventListener('click', () => { form.reset(); form.hidden = true; error.hidden = true; success.hidden = true; });

    form.addEventListener('submit', async (event) => {
      event.preventDefault(); error.hidden = true; success.hidden = true; save.disabled = true; save.textContent = 'Salvando…';
      try {
        const auth = readAuth(); if (!auth?.profile || !['super_admin','admin'].includes(auth.profile.role)) throw new Error('Seu usuário não tem permissão para criar propriedades.');
        const name = document.getElementById('newPropertyTitle').value.trim(),unit = document.getElementById('newPropertyUnit').value.trim(),city = document.getElementById('newPropertyCity').value.trim(),stateInput = document.getElementById('newPropertyState').value.trim().toUpperCase(),addressInput = document.getElementById('newPropertyAddress').value.trim(),ownerName = document.getElementById('newPropertyOwnerName').value.trim(),commission = Number(document.getElementById('newPropertyCommission').value);
        if (!name || !unit || !city || !ownerName) throw new Error('Preencha proprietário, propriedade, unidade e cidade.'); if (!Number.isFinite(commission) || commission < 0 || commission > 100) throw new Error('A comissão deve ficar entre 0% e 100%.');
        let properties = await getWorkingProperties(); const baseId = `property-${safeId(unit || name) || Date.now()}`; let id = baseId, counter = 2; while (properties.some((item) => item.id === id)) { id = `${baseId}-${counter}`; counter += 1; }
        const userId = auth.profile.id || 'unassigned-admin';
        if (auth.profile.role === 'admin') await persistAdminAccess(userId, id);
        const property = {id,ownerName,name,unit,city,state: stateInput || '—',address: addressInput || 'Não informado',commissionRate: commission / 100,administratorId: auth.profile.role === 'admin' ? userId : 'unassigned-admin',ownerId: 'unassigned-owner'};
        properties.push(property); writeProperties(properties);
        if (auth.profile.role === 'admin') { const ids = new Set(auth.propertyIds || []); ids.add(id); auth.propertyIds = [...ids]; localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(auth)); }
        localStorage.setItem(`ap207-dashboard-reservations-v1:${id}`, JSON.stringify({ version: 1, reservations: [] })); localStorage.setItem(`ap207-dashboard-expenses-v1:${id}`, JSON.stringify({ version: 1, expenses: [] }));
        setPreferredProperty(id);
        success.innerHTML = `<strong>✅ Unidade criada com sucesso.</strong><span>${unit} • ${city}</span>`; success.hidden = false; formActions.hidden = true;
        setTimeout(() => location.reload(), 650);
      } catch (err) {
        error.textContent = err?.message || 'Não foi possível cadastrar a propriedade.'; error.hidden = false; save.disabled = false; save.textContent = 'Salvar nova unidade';
      }
    });
  }

  function boot() {
    const timer = setInterval(() => {
      if (!canManageProperties()) return;
      const section=document.getElementById('propertySettings');
      if(section){ clearInterval(timer); install(); }
    }, 250);
    setTimeout(() => clearInterval(timer), 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();