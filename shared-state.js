(() => {
  'use strict';
  const AUTH = 'ap207-auth-profile-v1';
  const SUITE = 'system-control-test2-suite-v1';
  const COLLECTIONS = ['contracts', 'contractPayments', 'ownerPayouts', 'extraRevenue', 'ical'];
  const ARRAYS = new Map([
    ['system-control-test2-contracts-v1', 'featuresContracts'],
    ['system-control-test2-extra-revenues-v1', 'featuresExtraRevenue'],
    ['system-control-test2-contract-payments-v1', 'contractPayments'],
    ['system-control-test2-extra-attachments-v1', 'extraAttachments'],
    ['stay-long-term-contracts-test-v2', 'contractDetails'],
    ['stay-reservation-guest-details-v1', 'guestDetails'],
  ]);
  const ICAL = 'stay-control-ical-connections-v1';
  const EXPENSE = 'ap207-dashboard-expenses-v1:';
  const ownSet = Storage.prototype.setItem;
  let hydrated = false;
  let pending = Promise.resolve();
  let remoteSnapshot = new Map();
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const auth = () => read(AUTH);
  const authorized = propertyId => {
    const a = auth(), p = a?.profile;
    if (!p || p.active === false || !propertyId) return false;
    return p.role === 'super_admin' || (a.propertyIds || p.propertyIds || p.property_ids || []).map(String).includes(String(propertyId));
  };
  const keyOf = (collection, propertyId, id) => `${collection}\u0000${propertyId}\u0000${id}`;
  const identity = (item, index) => String(item?.id ?? item?.url ?? item?.key ?? index);
  function entries(key, raw) {
    if (!raw) return [];
    const result = [];
    const add = (collection, propertyId, item, index) => {
      if (!item || typeof item !== 'object' || !authorized(propertyId)) return;
      const id = identity(item, index);
      result.push({ collection, property_id: String(propertyId), id, payload: item });
    };
    if (key.startsWith(EXPENSE)) {
      const propertyId = key.slice(EXPENSE.length);
      (raw.expenses || []).forEach((item, i) => add('expenses', propertyId, item, i));
    } else if (key === SUITE) {
      COLLECTIONS.forEach(collection => (raw[collection] || []).forEach((item, i) => add(collection, item?.propertyId, item, i)));
    } else if (ARRAYS.has(key)) {
      (Array.isArray(raw) ? raw : []).forEach((item, i) => add(ARRAYS.get(key), item?.propertyId || item?.property_id, item, i));
    } else if (key === ICAL) {
      Object.entries(raw).forEach(([propertyId, item]) => add('icalConnections', propertyId, { ...item, propertyId }, 0));
    }
    return result;
  }
  function tracked(key) {
    return key === SUITE || key === ICAL || key.startsWith(EXPENSE) || ARRAYS.has(key);
  }
  function sourceKeys() {
    const keys = [SUITE, ICAL, ...ARRAYS.keys()];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(EXPENSE)) keys.push(key);
    }
    return keys;
  }
  function notifyStatus(message, failed = false) {
    let el = document.getElementById('staySharedStatus');
    if (!el) {
      el = document.createElement('div'); el.id = 'staySharedStatus';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:10060;background:#fff;padding:10px 14px;border:1px solid #d0d5dd;border-radius:10px;box-shadow:0 5px 22px #0002;font:600 14px system-ui';
      document.body.append(el);
    }
    el.textContent = message;
    el.style.color = failed ? '#b42318' : '#344054';
    el.hidden = !message;
  }
  async function persist(changes) {
    const client = window.AP207Supabase, profile = auth()?.profile;
    if (!client?.from || !profile?.id) throw new Error('Sessão indisponível');
    for (const change of changes) {
      const { error } = await client.from('shared_records').upsert({
        ...change, created_by: profile.id, updated_at: new Date().toISOString(),
      }, { onConflict: 'collection,property_id,id' });
      if (error) throw error;
      remoteSnapshot.set(keyOf(change.collection, change.property_id, change.id), change);
    }
  }
  function schedule(oldEntries, newEntries) {
    const before = new Map(oldEntries.map(x => [keyOf(x.collection, x.property_id, x.id), x]));
    const after = new Map(newEntries.map(x => [keyOf(x.collection, x.property_id, x.id), x]));
    const changes = [];
    for (const [key, item] of after) {
      if (JSON.stringify(before.get(key)?.payload) !== JSON.stringify(item.payload)) changes.push({ ...item, deleted_at: null });
    }
    for (const [key, item] of before) if (!after.has(key)) changes.push({ ...item, deleted_at: new Date().toISOString() });
    if (!changes.length) return;
    notifyStatus('Salvando dados na conta…');
    pending = pending.catch(() => {}).then(() => persist(changes)).then(() => notifyStatus('')).catch(error => {
      console.error('Stay shared data sync', error);
      notifyStatus('Não foi possível salvar na conta. Mantenha esta tela aberta e tente novamente.', true);
      throw error;
    });
    pending.catch(() => {});
  }
  Storage.prototype.setItem = function (key, value) {
    const capture = hydrated && this === localStorage && tracked(String(key));
    const previous = capture ? entries(String(key), read(String(key))) : [];
    ownSet.call(this, key, value);
    if (capture) {
      let next = null; try { next = JSON.parse(value); } catch {}
      schedule(previous, entries(String(key), next));
    }
  };
  function applyRemote(rows) {
    const live = rows.filter(row => !row.deleted_at);
    const collections = new Map();
    for (const row of live) {
      if (!authorized(row.property_id)) continue;
      if (!collections.has(row.collection)) collections.set(row.collection, []);
      collections.get(row.collection).push(row.payload);
    }
    const suite = read(SUITE) || {};
    for (const collection of COLLECTIONS) {
      const local = (suite[collection] || []).filter(item => !authorized(item?.propertyId));
      suite[collection] = [...local, ...(collections.get(collection) || [])];
    }
    ownSet.call(localStorage, SUITE, JSON.stringify(suite));
    for (const [key, collection] of ARRAYS) {
      const local = (read(key) || []).filter(item => !authorized(item?.propertyId || item?.property_id));
      ownSet.call(localStorage, key, JSON.stringify([...local, ...(collections.get(collection) || [])]));
    }
    const ical = read(ICAL) || {};
    for (const propertyId of Object.keys(ical)) if (authorized(propertyId)) delete ical[propertyId];
    for (const item of collections.get('icalConnections') || []) ical[String(item.propertyId)] = item;
    ownSet.call(localStorage, ICAL, JSON.stringify(ical));
    const propertyIds = new Set(rows.filter(x => x.collection === 'expenses').map(x => x.property_id));
    const a = auth();
    for (const id of a?.propertyIds || []) propertyIds.add(String(id));
    for (const id of propertyIds) {
      if (!authorized(id)) continue;
      const items = rows.filter(x => x.collection === 'expenses' && x.property_id === id && !x.deleted_at).map(x => x.payload);
      ownSet.call(localStorage, EXPENSE + id, JSON.stringify({ version: 1, expenses: items }));
    }
  }
  async function hydrate() {
    for (let attempt = 0; attempt < 150 && !document.body.classList.contains('ap207-authenticated'); attempt++)
      await new Promise(resolve => setTimeout(resolve, 100));
    const client = window.AP207Supabase, p = auth()?.profile;
    if (!client?.from || !p?.id || !document.body.classList.contains('ap207-authenticated')) return;
    const { data, error } = await client.from('shared_records').select('collection,property_id,id,payload,deleted_at');
    if (error) throw error;
    const rows = data || [];
    remoteSnapshot = new Map(rows.map(x => [keyOf(x.collection, x.property_id, x.id), x]));
    const marker = `stay-shared-hydrated-v1:${p.id}`;
    if (!localStorage.getItem(marker) && ['super_admin', 'admin'].includes(p.role)) {
      const missing = sourceKeys().flatMap(key => entries(key, read(key))).filter(item => !remoteSnapshot.has(keyOf(item.collection, item.property_id, item.id)));
      if (missing.length) await persist(missing.map(item => ({ ...item, deleted_at: null })));
    }
    applyRemote([...remoteSnapshot.values()]);
    ownSet.call(localStorage, marker, String(Date.now()));
    hydrated = true;
  }
  const ready = hydrate().catch(error => {
    console.error('Stay shared data hydration', error);
    notifyStatus('Dados compartilhados indisponíveis. Tente recarregar a página.', true);
    throw error;
  });
  let lastRefresh = Date.now();
  async function refreshOnReturn() {
    if (!hydrated || document.visibilityState === 'hidden' || Date.now() - lastRefresh < 5000) return;
    lastRefresh = Date.now();
    try {
      await pending;
      const { data, error } = await window.AP207Supabase.from('shared_records')
        .select('collection,property_id,id,payload,deleted_at');
      if (error) throw error;
      const canonical = rows => JSON.stringify(rows.map(x => ({ collection:x.collection, property_id:x.property_id, id:x.id, payload:x.payload, deleted_at:x.deleted_at || null }))
        .sort((a,b) => keyOf(a.collection,a.property_id,a.id).localeCompare(keyOf(b.collection,b.property_id,b.id))));
      const current = canonical([...remoteSnapshot.values()]);
      const latest = canonical(data || []);
      if (current !== latest) location.reload();
    } catch (error) { console.warn('Stay shared data refresh', error); }
  }
  window.addEventListener('focus', refreshOnReturn);
  document.addEventListener('visibilitychange', refreshOnReturn);
  window.StaySharedState = { ready, flush: () => pending, hydrated: () => hydrated };
})();
