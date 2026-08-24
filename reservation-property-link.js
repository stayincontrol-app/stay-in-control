(() => {
  'use strict';

  const form = document.getElementById('reservationForm');
  const guestField = document.getElementById('guest')?.closest('.field');
  const headerPropertySelector = document.getElementById('propertySelector');
  const userSelector = document.getElementById('userSelector');
  if (!form || !guestField || !headerPropertySelector) return;

  const STORAGE_KEY = 'ap207-dashboard-properties-v1';
  let properties = [];

  function getRole() {
    const text = userSelector?.selectedOptions?.[0]?.textContent || '';
    if (/Super administrador/i.test(text)) return 'super_admin';
    if (/Administrador|Gestor/i.test(text)) return 'admin';
    return 'owner';
  }

  function loadProperties() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored?.version === 1 && Array.isArray(stored.properties)) return stored.properties;
    } catch {}
    return [];
  }

  function createField(id, label) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const fieldLabel = document.createElement('label');
    fieldLabel.htmlFor = id;
    fieldLabel.textContent = label;
    const select = document.createElement('select');
    select.id = id;
    select.required = true;
    wrapper.append(fieldLabel, select);
    return { wrapper, select };
  }

  const owner = createField('reservationOwner', 'Nome do proprietário');
  const property = createField('reservationProperty', 'Propriedade / unidade');
  guestField.before(owner.wrapper, property.wrapper);

  function option(value, text) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = text;
    return item;
  }

  function currentPropertyFromHeader() {
    return properties.find((item) => item.id === headerPropertySelector.value);
  }

  function populateOwners(preferredOwnerId) {
    properties = loadProperties();
    const visiblePropertyIds = new Set([...headerPropertySelector.options].map((item) => item.value));
    const visible = properties.filter((item) => visiblePropertyIds.has(item.id));
    const unique = new Map();
    visible.forEach((item) => {
      const key = item.ownerId || item.ownerName;
      if (!unique.has(key)) unique.set(key, { id: key, name: item.ownerName });
    });
    owner.select.replaceChildren(option('', 'Selecione o proprietário'), ...[...unique.values()].map((item) => option(item.id, item.name)));
    const active = currentPropertyFromHeader();
    owner.select.value = preferredOwnerId || active?.ownerId || active?.ownerName || '';
    populateProperties(active?.id);
  }

  function populateProperties(preferredPropertyId) {
    const ownerId = owner.select.value;
    const visiblePropertyIds = new Set([...headerPropertySelector.options].map((item) => item.value));
    const linked = properties.filter((item) => visiblePropertyIds.has(item.id) && (item.ownerId === ownerId || item.ownerName === ownerId));
    property.select.replaceChildren(option('', 'Selecione a unidade'), ...linked.map((item) => option(item.id, `${item.unit} — ${item.name}`)));
    if (preferredPropertyId && linked.some((item) => item.id === preferredPropertyId)) property.select.value = preferredPropertyId;
    else if (linked.length === 1) property.select.value = linked[0].id;
  }

  function syncToSelectedProperty() {
    if (!property.select.value || property.select.value === headerPropertySelector.value) return;
    headerPropertySelector.value = property.select.value;
    headerPropertySelector.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function refreshVisibility() {
    const canManage = ['super_admin', 'admin'].includes(getRole());
    owner.wrapper.hidden = !canManage;
    property.wrapper.hidden = !canManage;
    owner.select.disabled = !canManage;
    property.select.disabled = !canManage;
    if (canManage) populateOwners();
  }

  owner.select.addEventListener('change', () => populateProperties());
  property.select.addEventListener('change', syncToSelectedProperty);
  headerPropertySelector.addEventListener('change', () => {
    const active = currentPropertyFromHeader();
    if (!active) return;
    owner.select.value = active.ownerId || active.ownerName;
    populateProperties(active.id);
  });
  userSelector?.addEventListener('change', () => setTimeout(refreshVisibility, 0));

  form.addEventListener('submit', (event) => {
    if (!['super_admin', 'admin'].includes(getRole())) return;
    if (!owner.select.value || !property.select.value) {
      event.preventDefault();
      event.stopImmediatePropagation();
      owner.select.reportValidity();
      property.select.reportValidity();
      return;
    }
    syncToSelectedProperty();
  }, true);

  fetch(`./data.json?reservationPropertyLink=${Date.now()}`, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => {
      if (!loadProperties().length && Array.isArray(data?.properties)) properties = data.properties;
      else properties = loadProperties();
      refreshVisibility();
    })
    .catch(() => refreshVisibility());
})();
