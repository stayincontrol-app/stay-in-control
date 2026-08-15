(() => {
  'use strict';

  const STORAGE_KEY = 'ap207-dashboard-reservations-v1';
  const EXPENSES_STORAGE_KEY = 'ap207-dashboard-expenses-v1';
  const PROPERTIES_STORAGE_KEY = 'ap207-dashboard-properties-v1';
  const EXPENSE_CATEGORIES = ['Manutenção/Reparo', 'Compra para o apartamento', 'Reposição', 'Condomínio', 'Material', 'Serviço', 'Outro'];
  const PLATFORMS = ['Airbnb', 'Booking.com', 'Vrbo', 'Direto', 'Outro'];
  const STATUSES = ['Confirmada', 'Estimada', 'Pendente', 'Cancelada'];
  const LEGACY_PLATFORMS = { Direta: 'Direto', Outra: 'Outro' };
  const LEGACY_STATUSES = {
    confirmado: 'Confirmada', estimado: 'Estimada', pendente: 'Pendente', cancelado: 'Cancelada',
    'em andamento': 'Confirmada', 'concluído': 'Confirmada',
  };
  const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const elements = {};
  let dashboard;
  let users = [];
  let properties = [];
  let currentUser;
  let currentProperty;
  const access = globalThis.AP207Access || (typeof require !== 'undefined' ? require('./permissions.js') : null);

  const elementIds = [
    'appStatus', 'propertyName', 'subtitle', 'monthLabel', 'periodCount', 'nightCount',
    'nightRange', 'grossTotal', 'netTotal', 'reservations', 'summaryGross',
    'summaryCleaning', 'summaryCommission', 'summaryNetBeforeExpenses', 'summaryExpenses', 'summaryNet', 'ruleCleaning',
    'ruleCommission', 'newReservationButton', 'adminSection', 'reservationForm',
    'reservationId', 'guest', 'platform', 'status', 'checkIn', 'checkOut', 'gross',
    'cleaningFee', 'commissionRate', 'calculatedNights', 'calculatedCommission',
    'calculatedNet', 'formError', 'saveReservationButton', 'cancelEditButton', 'expensesSection',
    'newExpenseButton', 'expensesTotal', 'expenses', 'expenseForm', 'expenseId', 'expenseDate',
    'expenseCategory', 'expenseDescription', 'expenseValue', 'expenseFormError', 'saveExpenseButton', 'cancelExpenseButton',
    'reportMonth', 'reportYear', 'generateReportButton', 'reportPeriod', 'reportReservationsCount',
    'reportOccupiedNights', 'reportAvailableDays', 'reportOccupancyRate', 'reportGross', 'reportAverageDailyRate',
    'reportCleaning', 'reportCommission', 'reportSummaryGross', 'reportSummaryCleaning', 'reportSummaryCommission',
    'reportBeforeExpenses', 'reportOtherExpenses', 'reportFinalPayout', 'reportReservations', 'reportExpenses',
    'nextCheckIn', 'nextCheckInGuest', 'nextCheckOut', 'nextCheckOutGuest', 'calendarMonth', 'calendarYear',
    'previousMonth', 'nextMonth', 'calendarGrid', 'calendarDetails', 'ownerName', 'userSelector', 'propertySelector',
    'propertySettings', 'editPropertyButton', 'propertyForm', 'propertyOwnerName', 'propertyTitle', 'propertyUnit',
    'propertyCity', 'propertyState', 'propertyAddress', 'propertyCommission', 'cancelPropertyButton',
  ];

  function getElements() {
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Elemento obrigatório não encontrado: #${id}`);
      elements[id] = element;
    });
  }

  function roundMoney(value) { return Math.round((value + Number.EPSILON) * 100) / 100; }
  function formatMoney(value) { return moneyFormatter.format(Number.isFinite(value) ? value : 0); }

  function parseDate(value, fieldName) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`${fieldName} deve usar o formato AAAA-MM-DD.`);
    }
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error(`${fieldName} contém uma data inválida.`);
    }
    return date;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parseDate(value, 'Data'));
  }

  function countNights(checkIn, checkOut) {
    const total = (parseDate(checkOut, 'Check-out') - parseDate(checkIn, 'Check-in')) / 86400000;
    if (!Number.isInteger(total) || total <= 0) throw new Error('O check-out deve ocorrer depois do check-in.');
    return total;
  }

  function requireText(value, fieldName) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${fieldName} não foi informado.`);
    return value.trim();
  }

  function requireNonNegativeNumber(value, fieldName) {
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number) || number < 0) throw new Error(`${fieldName} deve ser maior ou igual a zero.`);
    return number;
  }

  function calculateFinancials(grossValue, cleaningValue, commissionPercentage) {
    const gross = requireNonNegativeNumber(grossValue, 'Valor bruto');
    const cleaning = requireNonNegativeNumber(cleaningValue, 'Taxa de limpeza');
    const rate = requireNonNegativeNumber(commissionPercentage, 'Comissão');
    if (rate > 100) throw new Error('A comissão deve estar entre 0% e 100%.');
    if (cleaning > gross) throw new Error('A taxa de limpeza não pode superar o valor bruto.');
    const commissionBase = gross - cleaning;
    const commission = roundMoney(commissionBase * (rate / 100));
    return { gross, cleaning, commissionRate: rate, commission, net: roundMoney(commissionBase - commission) };
  }

  function calculateTotals(reservations) {
    return reservations.filter((item) => item.status !== 'Cancelada').reduce((total, item) => ({
      nights: total.nights + item.nights, gross: total.gross + item.gross, cleaning: total.cleaning + item.cleaning,
      commission: total.commission + item.commission, net: total.net + item.net,
    }), { nights: 0, gross: 0, cleaning: 0, commission: 0, net: 0 });
  }

  function upsertReservation(reservations, reservation) {
    const index = reservations.findIndex((item) => item.id === reservation.id);
    return index < 0 ? [...reservations, reservation] : reservations.map((item, itemIndex) => itemIndex === index ? reservation : item);
  }

  function removeReservation(reservations, id) { return reservations.filter((item) => item.id !== id); }

  function normalizeExpense(expense, index = 0) {
    if (!expense || typeof expense !== 'object' || Array.isArray(expense)) throw new Error(`Despesa ${index + 1} é inválida.`);
    const date = requireText(expense.date, 'Data'); parseDate(date, 'Data');
    const category = requireText(expense.category, 'Categoria');
    if (!EXPENSE_CATEGORIES.includes(category)) throw new Error('Categoria da despesa é inválida.');
    return { id: typeof expense.id === 'string' && expense.id ? expense.id : createId(), date, category,
      description: requireText(expense.description, 'Descrição'), value: roundMoney(requireNonNegativeNumber(expense.value, 'Valor')) };
  }

  function upsertExpense(expenses, expense) {
    const index = expenses.findIndex((item) => item.id === expense.id);
    return index < 0 ? [...expenses, expense] : expenses.map((item, itemIndex) => itemIndex === index ? expense : item);
  }
  function removeExpense(expenses, id) { return expenses.filter((item) => item.id !== id); }
  function calculateExpensesTotal(expenses) { return roundMoney(expenses.reduce((total, expense) => total + requireNonNegativeNumber(expense.value, 'Valor'), 0)); }
  function calculateFinalPayout(netPayout, expensesTotal) { return roundMoney(Number(netPayout) - Number(expensesTotal)); }

  function getCalendarDays(reservations, yearValue, monthValue) {
    const year = Number(yearValue); const month = Number(monthValue);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
      const active = reservations.filter((item) => item.status !== 'Cancelada' && date >= item.checkIn && date <= item.checkOut);
      return {
        date, day: index + 1,
        reservations: active,
        occupied: active.some((item) => date >= item.checkIn && date < item.checkOut),
        checkIn: active.some((item) => item.checkIn === date), checkOut: active.some((item) => item.checkOut === date),
      };
    });
  }

  function getNextStay(reservations, dateField, today = new Date().toISOString().slice(0, 10)) {
    return reservations.filter((item) => item.status !== 'Cancelada' && item[dateField] >= today)
      .sort((a, b) => a[dateField].localeCompare(b[dateField]))[0] || null;
  }

  function isInMonth(dateValue, year, month) {
    const date = parseDate(dateValue, 'Data');
    return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
  }

  function nightsInMonth(checkIn, checkOut, year, month) {
    const start = parseDate(checkIn, 'Check-in');
    const end = parseDate(checkOut, 'Check-out');
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    return Math.max(0, (Math.min(end, monthEnd) - Math.max(start, monthStart)) / 86400000);
  }

  function calculateMonthlyReport(reservations, expenses, yearValue, monthValue) {
    const year = Number(yearValue); const month = Number(monthValue);
    if (!Number.isInteger(year) || year < 2000 || year > 9999) throw new Error('Ano do relatório é inválido.');
    if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('Mês do relatório é inválido.');
    const selectedReservations = reservations.filter((item) => item.status !== 'Cancelada' && isInMonth(item.checkIn, year, month));
    const selectedExpenses = expenses.filter((item) => isInMonth(item.date, year, month));
    const totals = calculateTotals(selectedReservations);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const occupiedNights = Math.min(daysInMonth, selectedReservations.reduce((sum, item) => sum + nightsInMonth(item.checkIn, item.checkOut, year, month), 0));
    const expensesTotal = calculateExpensesTotal(selectedExpenses);
    return {
      year, month, daysInMonth, reservations: selectedReservations, expenses: selectedExpenses,
      reservationCount: selectedReservations.length, occupiedNights, availableDays: daysInMonth - occupiedNights,
      occupancyRate: roundMoney((occupiedNights / daysInMonth) * 100), averageDailyRate: occupiedNights ? roundMoney(totals.gross / occupiedNights) : 0,
      ...totals, expensesTotal, finalPayout: calculateFinalPayout(totals.net, expensesTotal),
    };
  }

  function validateDashboard(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('O arquivo de dados não contém um objeto válido.');
    const commissionRate = requireNonNegativeNumber(data.commissionRate, 'Comissão padrão');
    if (commissionRate > 1) throw new Error('A comissão padrão deve estar entre 0 e 1.');
    if (!Array.isArray(data.reservations)) throw new Error('A lista de reservas é inválida.');
    const legacyProperty = { id: 'property-ap207', ownerName: 'Proprietário AP207', name: data.property, unit: data.property,
      city: data.city, state: 'PR', address: 'Endereço a atualizar', commissionRate, administratorId: 'user-gestor', ownerId: 'user-owner' };
    const validatedProperties = (data.properties || [legacyProperty]).map(validateProperty);
    const validatedUsers = data.users || [{ id: 'user-super-admin', name: 'Super Administrador', role: 'super_admin', active: true }];
    return {
      property: requireText(data.property, 'Propriedade'), city: requireText(data.city, 'Cidade'),
      month: requireText(data.month, 'Mês'), cleaningFee: requireNonNegativeNumber(data.cleaningFee, 'Taxa de limpeza padrão'),
      commissionRate, reservations: data.reservations, users: validatedUsers, properties: validatedProperties,
      currentUserId: data.currentUserId || validatedUsers[0].id,
    };
  }

  function validateProperty(property) {
    if (!property || typeof property !== 'object') throw new Error('Propriedade inválida.');
    const rate = requireNonNegativeNumber(property.commissionRate, 'Comissão administrativa');
    if (rate > 1) throw new Error('A comissão administrativa deve estar entre 0 e 1.');
    return { id: requireText(property.id, 'ID da propriedade'), ownerName: requireText(property.ownerName, 'Nome do proprietário'),
      name: requireText(property.name, 'Nome da propriedade'), unit: requireText(property.unit, 'Unidade'), city: requireText(property.city, 'Cidade'),
      state: requireText(property.state, 'Estado'), address: requireText(property.address, 'Endereço'), commissionRate: rate,
      administratorId: requireText(property.administratorId, 'Administrador responsável'), ownerId: requireText(property.ownerId, 'Proprietário vinculado') };
  }

  function requireAccess(permission) { return access.authorize(currentUser, currentProperty, permission); }

  function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `res-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeReservation(reservation, index, defaults) {
    if (!reservation || typeof reservation !== 'object' || Array.isArray(reservation)) throw new Error(`Reserva ${index + 1} é inválida.`);
    const guest = requireText(reservation.guest, `Nome do hóspede da reserva ${index + 1}`);
    const checkIn = requireText(reservation.checkIn, `Check-in da reserva ${index + 1}`);
    const checkOut = requireText(reservation.checkOut, `Check-out da reserva ${index + 1}`);
    const nights = countNights(checkIn, checkOut);
    const platform = LEGACY_PLATFORMS[reservation.platform] || reservation.platform || 'Airbnb';
    const status = LEGACY_STATUSES[reservation.status] || reservation.status || 'Estimada';
    if (!PLATFORMS.includes(platform)) throw new Error(`Plataforma da reserva ${index + 1} é inválida.`);
    if (!STATUSES.includes(status)) throw new Error(`Status da reserva ${index + 1} é inválido.`);
    const cleaningFee = reservation.cleaningFee ?? (Number(reservation.gross) > 0 ? defaults.cleaningFee : 0);
    const commissionRate = reservation.commissionRate ?? defaults.commissionRate * 100;
    return {
      id: typeof reservation.id === 'string' && reservation.id ? reservation.id : createId(),
      guest, platform, checkIn, checkOut, status, nights,
      ...calculateFinancials(reservation.gross, cleaningFee, commissionRate),
    };
  }

  function storageAvailable() {
    try {
      const testKey = `${STORAGE_KEY}-test`;
      localStorage.setItem(testKey, '1'); localStorage.removeItem(testKey); return true;
    } catch { return false; }
  }

  function saveReservations() {
    if (!storageAvailable()) throw new Error('O armazenamento local não está disponível neste navegador.');
    const records = dashboard.reservations.map(({ id, guest, platform, checkIn, checkOut, status, gross, cleaning, commissionRate }) => ({
      id, guest, platform, checkIn, checkOut, status, gross, cleaningFee: cleaning, commissionRate,
    }));
    localStorage.setItem(`${STORAGE_KEY}:${currentProperty.id}`, JSON.stringify({ version: 1, reservations: records }));
  }

  function loadStoredReservations(defaults) {
    if (!storageAvailable()) return defaults;
    const scopedKey = `${STORAGE_KEY}:${currentProperty.id}`;
    const stored = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.version !== 1 || !Array.isArray(parsed.reservations)) throw new Error();
      return parsed.reservations;
    } catch {
      localStorage.removeItem(scopedKey);
      return defaults;
    }
  }

  function saveExpenses() {
    if (!storageAvailable()) throw new Error('O armazenamento local não está disponível neste navegador.');
    localStorage.setItem(`${EXPENSES_STORAGE_KEY}:${currentProperty.id}`, JSON.stringify({ version: 1, expenses: dashboard.expenses }));
  }

  function loadStoredExpenses() {
    if (!storageAvailable()) return [];
    const scopedKey = `${EXPENSES_STORAGE_KEY}:${currentProperty.id}`; const stored = localStorage.getItem(scopedKey) || localStorage.getItem(EXPENSES_STORAGE_KEY); if (!stored) return [];
    try { const parsed = JSON.parse(stored); if (parsed?.version !== 1 || !Array.isArray(parsed.expenses)) throw new Error(); return parsed.expenses; }
    catch { localStorage.removeItem(scopedKey); return []; }
  }

  function saveProperties() {
    if (!storageAvailable()) throw new Error('O armazenamento local não está disponível neste navegador.');
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify({ version: 1, properties }));
  }

  function loadStoredProperties(defaults) {
    if (!storageAvailable()) return defaults;
    const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY); if (!stored) return defaults;
    try { const parsed = JSON.parse(stored); if (parsed?.version !== 1 || !Array.isArray(parsed.properties)) throw new Error(); return parsed.properties.map(validateProperty); }
    catch { localStorage.removeItem(PROPERTIES_STORAGE_KEY); return defaults; }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function statusClass(status) {
    return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function breakdownItem(label, value, className = '') {
    const item = createElement('div'); item.append(createElement('small', '', label)); item.append(createElement('b', className, value)); return item;
  }

  function renderReservation(reservation) {
    const article = createElement('article', 'booking');
    const top = createElement('div', 'bookingtop');
    const heading = createElement('div');
    heading.append(createElement('span', 'guest', `${reservation.guest} • ${reservation.platform}`));
    heading.append(createElement('b', '', `${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)}`));
    heading.append(createElement('p', '', `${reservation.nights} ${reservation.nights === 1 ? 'noite' : 'noites'}`));
    top.append(heading, createElement('span', `status status-${statusClass(reservation.status)}`, reservation.status));
    const breakdown = createElement('div', 'breakdown');
    breakdown.append(
      breakdownItem('Valor bruto', formatMoney(reservation.gross)), breakdownItem('Limpeza', `− ${formatMoney(reservation.cleaning)}`),
      breakdownItem(`Comissão ${reservation.commissionRate}%`, `− ${formatMoney(reservation.commission)}`), breakdownItem('Seu repasse', formatMoney(reservation.net), 'green'),
    );
    const actions = createElement('div', 'booking-actions');
    const edit = createElement('button', 'button button-secondary', 'Editar'); edit.type = 'button'; edit.dataset.action = 'edit'; edit.dataset.id = reservation.id;
    const remove = createElement('button', 'button button-danger', 'Excluir'); remove.type = 'button'; remove.dataset.action = 'delete'; remove.dataset.id = reservation.id;
    if (access.hasPermission(currentUser, 'reservation:update')) actions.append(edit);
    if (access.hasPermission(currentUser, 'reservation:delete')) actions.append(remove);
    if (actions.children.length) article.append(top, breakdown, actions); else article.append(top, breakdown);
    return article;
  }

  function renderExpense(expense) {
    const article = createElement('article', 'expense-item');
    const date = createElement('p'); date.append(createElement('small', '', 'Data'), createElement('b', '', formatDate(expense.date)));
    const category = createElement('p'); category.append(createElement('small', '', 'Categoria'), createElement('span', '', expense.category));
    const description = createElement('p'); description.append(createElement('small', '', 'Descrição'), createElement('span', '', expense.description));
    const value = createElement('p', 'expense-value', formatMoney(expense.value));
    const actions = createElement('div', 'expense-actions');
    const edit = createElement('button', 'button button-secondary', 'Editar'); edit.type = 'button'; edit.dataset.action = 'edit'; edit.dataset.id = expense.id;
    const remove = createElement('button', 'button button-danger', 'Excluir'); remove.type = 'button'; remove.dataset.action = 'delete'; remove.dataset.id = expense.id;
    if (access.hasPermission(currentUser, 'expense:update')) actions.append(edit);
    if (access.hasPermission(currentUser, 'expense:delete')) actions.append(remove);
    article.append(date, category, description, value); if (actions.children.length) article.append(actions); return article;
  }

  function reportListItem(columns) {
    const article = createElement('article', 'report-list-item');
    columns.forEach(([label, value, emphasis]) => {
      const item = createElement('p'); item.append(createElement('small', '', label), createElement(emphasis ? 'b' : 'span', '', value)); article.append(item);
    });
    return article;
  }

  function renderMonthlyReport() {
    const report = calculateMonthlyReport(dashboard.reservations, dashboard.expenses, elements.reportYear.value, elements.reportMonth.value);
    elements.reportPeriod.textContent = `${MONTH_NAMES[report.month - 1]} de ${report.year}`;
    elements.reportReservationsCount.textContent = String(report.reservationCount);
    elements.reportOccupiedNights.textContent = String(report.occupiedNights);
    elements.reportAvailableDays.textContent = String(report.availableDays);
    elements.reportOccupancyRate.textContent = `${report.occupancyRate.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
    elements.reportGross.textContent = formatMoney(report.gross); elements.reportAverageDailyRate.textContent = formatMoney(report.averageDailyRate);
    elements.reportCleaning.textContent = formatMoney(report.cleaning); elements.reportCommission.textContent = formatMoney(report.commission);
    elements.reportSummaryGross.textContent = formatMoney(report.gross); elements.reportSummaryCleaning.textContent = formatMoney(report.cleaning);
    elements.reportSummaryCommission.textContent = formatMoney(report.commission); elements.reportBeforeExpenses.textContent = formatMoney(report.net);
    elements.reportOtherExpenses.textContent = formatMoney(report.expensesTotal); elements.reportFinalPayout.textContent = formatMoney(report.finalPayout);
    elements.reportFinalPayout.classList.toggle('negative', report.finalPayout < 0);
    const reservations = document.createDocumentFragment();
    report.reservations.forEach((item) => reservations.append(reportListItem([
      ['Hóspede', item.guest, true], ['Plataforma', item.platform], ['Período', `${formatDate(item.checkIn)} a ${formatDate(item.checkOut)}`],
      ['Noites', String(nightsInMonth(item.checkIn, item.checkOut, report.year, report.month))], ['Valor bruto', formatMoney(item.gross), true],
    ])));
    elements.reportReservations.replaceChildren(reservations);
    const expenses = document.createDocumentFragment();
    report.expenses.forEach((item) => expenses.append(reportListItem([
      ['Data', formatDate(item.date), true], ['Categoria', item.category], ['Descrição', item.description], ['Valor', formatMoney(item.value), true],
    ])));
    elements.reportExpenses.replaceChildren(expenses);
  }

  function renderCalendarDetails(day) {
    const relevant = day.reservations;
    if (!relevant.length) { elements.calendarDetails.innerHTML = '<p>Dia livre, sem reservas.</p>'; return; }
    const fragment = document.createDocumentFragment();
    relevant.forEach((item) => fragment.append(reportListItem([
      ['Hóspede', item.guest, true], ['Plataforma', item.platform], ['Check-in', formatDate(item.checkIn)],
      ['Check-out', formatDate(item.checkOut)], ['Noites', String(item.nights)], ['Status', item.status, true],
    ])));
    elements.calendarDetails.replaceChildren(fragment);
  }

  function renderCalendar() {
    const year = Number(elements.calendarYear.value); const month = Number(elements.calendarMonth.value);
    const days = getCalendarDays(dashboard.reservations, year, month); const fragment = document.createDocumentFragment();
    const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    for (let index = 0; index < offset; index += 1) fragment.append(createElement('span', 'calendar-day empty'));
    days.forEach((day) => {
      const button = createElement('button', `calendar-day${day.occupied ? ' is-reserved' : ''}${day.checkIn ? ' is-checkin' : ''}${day.checkOut ? ' is-checkout' : ''}`, String(day.day));
      button.type = 'button'; button.dataset.date = day.date; button.setAttribute('role', 'gridcell');
      const labels = [day.occupied ? 'reservado' : 'livre', day.checkIn ? 'check-in' : '', day.checkOut ? 'check-out' : ''].filter(Boolean);
      button.setAttribute('aria-label', `${formatDate(day.date)}: ${labels.join(', ')}`); button.addEventListener('click', () => renderCalendarDetails(day)); fragment.append(button);
    });
    elements.calendarGrid.replaceChildren(fragment);
    elements.calendarDetails.innerHTML = '<p>Toque em um dia reservado para ver os detalhes.</p>';
  }

  function prepareCalendarFilters() {
    MONTH_NAMES.forEach((name, index) => { const option = createElement('option', '', name); option.value = String(index + 1); elements.calendarMonth.append(option); });
    [...elements.reportYear.options].forEach((source) => { const option = createElement('option', '', source.textContent); option.value = source.value; elements.calendarYear.append(option); });
    elements.calendarMonth.value = elements.reportMonth.value; elements.calendarYear.value = elements.reportYear.value;
  }

  function changeCalendarMonth(delta) {
    const date = new Date(Date.UTC(Number(elements.calendarYear.value), Number(elements.calendarMonth.value) - 1 + delta, 1));
    const year = String(date.getUTCFullYear());
    if (![...elements.calendarYear.options].some((option) => option.value === year)) { const option = createElement('option', '', year); option.value = year; elements.calendarYear.append(option); }
    elements.calendarYear.value = year; elements.calendarMonth.value = String(date.getUTCMonth() + 1); renderCalendar();
  }

  function showScreen(name, updateHash = true) {
    document.querySelectorAll('[data-screen-panel]').forEach((panel) => { panel.hidden = panel.dataset.screenPanel !== name; });
    document.querySelectorAll('[data-screen]').forEach((button) => { const active = button.dataset.screen === name; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
    if (updateHash) history.replaceState(null, '', `#${name}`); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prepareReportFilters() {
    MONTH_NAMES.forEach((name, index) => { const option = createElement('option', '', name); option.value = String(index + 1); elements.reportMonth.append(option); });
    const datedYears = [...dashboard.reservations.map((item) => Number(item.checkIn.slice(0, 4))), ...dashboard.expenses.map((item) => Number(item.date.slice(0, 4)))];
    const currentYear = new Date().getFullYear(); const years = [...new Set([currentYear - 1, currentYear, currentYear + 1, ...datedYears])].sort((a, b) => b - a);
    years.forEach((year) => { const option = createElement('option', '', String(year)); option.value = String(year); elements.reportYear.append(option); });
    const match = dashboard.month.match(/([A-Za-zÀ-ÿ]+)\s+(\d{4})/); const defaultMonth = match ? MONTH_NAMES.findIndex((name) => name.toLowerCase() === match[1].toLowerCase()) + 1 : new Date().getMonth() + 1;
    elements.reportMonth.value = String(defaultMonth || new Date().getMonth() + 1); elements.reportYear.value = match?.[2] || String(currentYear);
  }

  function render() {
    const totals = calculateTotals(dashboard.reservations);
    const expensesTotal = calculateExpensesTotal(dashboard.expenses);
    const finalPayout = calculateFinalPayout(totals.net, expensesTotal);
    elements.ownerName.textContent = `Proprietário: ${currentProperty.ownerName}`;
    elements.propertyName.textContent = `Unidade: ${currentProperty.name} / ${currentProperty.unit}`;
    elements.subtitle.textContent = `${currentProperty.city} • ${currentProperty.state}`;
    elements.newReservationButton.hidden = !access.hasPermission(currentUser, 'reservation:create');
    elements.adminSection.hidden = !access.hasPermission(currentUser, 'reservation:create');
    elements.newExpenseButton.hidden = !access.hasPermission(currentUser, 'expense:create');
    elements.propertySettings.hidden = !access.hasPermission(currentUser, 'property:update');
    elements.monthLabel.textContent = dashboard.month;
    elements.periodCount.textContent = String(dashboard.reservations.length);
    elements.nightCount.textContent = String(totals.nights);
    elements.nightRange.textContent = `${dashboard.reservations.length} ${dashboard.reservations.length === 1 ? 'período' : 'períodos'}`;
    elements.grossTotal.textContent = formatMoney(totals.gross); elements.netTotal.textContent = formatMoney(finalPayout);
    elements.summaryGross.textContent = formatMoney(totals.gross); elements.summaryCleaning.textContent = formatMoney(totals.cleaning);
    elements.summaryCommission.textContent = formatMoney(totals.commission); elements.summaryNetBeforeExpenses.textContent = formatMoney(totals.net);
    elements.summaryExpenses.textContent = formatMoney(expensesTotal); elements.summaryNet.textContent = formatMoney(finalPayout);
    elements.expensesTotal.textContent = formatMoney(expensesTotal);
    elements.netTotal.classList.toggle('negative', finalPayout < 0); elements.summaryNet.classList.toggle('negative', finalPayout < 0);
    elements.ruleCleaning.textContent = formatMoney(dashboard.cleaningFee); elements.ruleCommission.textContent = `${dashboard.commissionRate * 100}%`;
    const nextIn = getNextStay(dashboard.reservations, 'checkIn'); const nextOut = getNextStay(dashboard.reservations, 'checkOut');
    elements.nextCheckIn.textContent = nextIn ? formatDate(nextIn.checkIn) : '—'; elements.nextCheckInGuest.textContent = nextIn ? `${nextIn.guest} • ${nextIn.platform}` : 'Nenhum agendado';
    elements.nextCheckOut.textContent = nextOut ? formatDate(nextOut.checkOut) : '—'; elements.nextCheckOutGuest.textContent = nextOut ? `${nextOut.guest} • ${nextOut.platform}` : 'Nenhum agendado';
    const fragment = document.createDocumentFragment(); dashboard.reservations.forEach((item) => fragment.append(renderReservation(item)));
    elements.reservations.replaceChildren(fragment);
    const expenseFragment = document.createDocumentFragment(); dashboard.expenses.forEach((item) => expenseFragment.append(renderExpense(item)));
    elements.expenses.replaceChildren(expenseFragment);
    renderMonthlyReport();
    renderCalendar();
  }

  function resetExpenseForm(hide = true) {
    elements.expenseForm.reset(); elements.expenseId.value = ''; elements.saveExpenseButton.textContent = 'Salvar despesa';
    elements.expenseFormError.hidden = true; elements.expenseForm.hidden = hide;
  }
  function openExpenseForm() { resetExpenseForm(false); elements.expenseDate.focus({ preventScroll: true }); }
  function readExpenseForm() {
    if (!elements.expenseForm.reportValidity()) throw new Error('Preencha corretamente todos os campos obrigatórios.');
    return normalizeExpense({ id: elements.expenseId.value || createId(), date: elements.expenseDate.value,
      category: elements.expenseCategory.value, description: elements.expenseDescription.value, value: elements.expenseValue.value });
  }
  function submitExpense(event) {
    event.preventDefault(); elements.expenseFormError.hidden = true;
    try { const expense = readExpenseForm(); const editing = dashboard.expenses.some((item) => item.id === expense.id);
      requireAccess(editing ? 'expense:update' : 'expense:create');
      dashboard.expenses = upsertExpense(dashboard.expenses, expense); saveExpenses(); render(); resetExpenseForm(); announce(editing ? 'Despesa atualizada com sucesso.' : 'Despesa cadastrada com sucesso.');
    } catch (error) { elements.expenseFormError.textContent = error.message; elements.expenseFormError.hidden = false; }
  }
  function editExpense(id) {
    requireAccess('expense:update');
    const item = dashboard.expenses.find((expense) => expense.id === id); if (!item) return;
    elements.expenseForm.hidden = false; elements.expenseId.value = item.id; elements.expenseDate.value = item.date;
    elements.expenseCategory.value = item.category; elements.expenseDescription.value = item.description; elements.expenseValue.value = item.value;
    elements.saveExpenseButton.textContent = 'Atualizar despesa'; elements.expenseFormError.hidden = true; elements.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function deleteExpense(id) {
    requireAccess('expense:delete');
    const item = dashboard.expenses.find((expense) => expense.id === id);
    if (!item || !window.confirm(`Excluir a despesa “${item.description}”? Esta ação não pode ser desfeita.`)) return;
    dashboard.expenses = removeExpense(dashboard.expenses, id); saveExpenses(); render(); if (elements.expenseId.value === id) resetExpenseForm(); announce('Despesa excluída com sucesso.');
  }

  function updatePreview() {
    elements.formError.hidden = true;
    try {
      elements.calculatedNights.textContent = String(elements.checkIn.value && elements.checkOut.value ? countNights(elements.checkIn.value, elements.checkOut.value) : 0);
      const valuesReady = elements.gross.value !== '' && elements.cleaningFee.value !== '' && elements.commissionRate.value !== '';
      const result = valuesReady ? calculateFinancials(elements.gross.value, elements.cleaningFee.value, elements.commissionRate.value) : { commission: 0, net: 0 };
      elements.calculatedCommission.textContent = formatMoney(result.commission); elements.calculatedNet.textContent = formatMoney(result.net);
    } catch (error) {
      elements.calculatedNights.textContent = '—'; elements.calculatedCommission.textContent = '—'; elements.calculatedNet.textContent = '—';
    }
  }

  function resetForm() {
    elements.reservationForm.reset(); elements.reservationId.value = '';
    elements.cleaningFee.value = String(dashboard.cleaningFee); elements.commissionRate.value = String(dashboard.commissionRate * 100);
    elements.saveReservationButton.textContent = 'Salvar reserva'; elements.cancelEditButton.hidden = true; elements.formError.hidden = true; updatePreview();
  }

  function readForm() {
    if (!elements.reservationForm.reportValidity()) throw new Error('Preencha corretamente todos os campos obrigatórios.');
    return normalizeReservation({
      id: elements.reservationId.value || createId(), guest: elements.guest.value, platform: elements.platform.value,
      status: elements.status.value, checkIn: elements.checkIn.value, checkOut: elements.checkOut.value,
      gross: elements.gross.value, cleaningFee: elements.cleaningFee.value, commissionRate: elements.commissionRate.value,
    }, 0, dashboard);
  }

  function showFormError(error) { elements.formError.textContent = error.message; elements.formError.hidden = false; }
  function announce(message) { elements.appStatus.className = 'app-status success'; elements.appStatus.textContent = message; elements.appStatus.hidden = false; }

  function submitReservation(event) {
    event.preventDefault();
    try {
      const reservation = readForm();
      const index = dashboard.reservations.findIndex((item) => item.id === reservation.id);
      requireAccess(index >= 0 ? 'reservation:update' : 'reservation:create');
      dashboard.reservations = upsertReservation(dashboard.reservations, reservation);
      saveReservations(); render(); resetForm(); announce(index >= 0 ? 'Reserva atualizada com sucesso.' : 'Reserva cadastrada com sucesso.');
    } catch (error) { showFormError(error instanceof Error ? error : new Error('Não foi possível salvar a reserva.')); }
  }

  function editReservation(id) {
    requireAccess('reservation:update');
    const item = dashboard.reservations.find((reservation) => reservation.id === id); if (!item) return;
    elements.reservationId.value = item.id; elements.guest.value = item.guest; elements.platform.value = item.platform;
    elements.status.value = item.status; elements.checkIn.value = item.checkIn; elements.checkOut.value = item.checkOut;
    elements.gross.value = item.gross; elements.cleaningFee.value = item.cleaning; elements.commissionRate.value = item.commissionRate;
    elements.saveReservationButton.textContent = 'Atualizar reserva'; elements.cancelEditButton.hidden = false; updatePreview();
    elements.adminSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); elements.guest.focus({ preventScroll: true });
  }

  function deleteReservation(id) {
    requireAccess('reservation:delete');
    const item = dashboard.reservations.find((reservation) => reservation.id === id);
    if (!item || !window.confirm(`Excluir a reserva de ${item.guest}? Esta ação não pode ser desfeita.`)) return;
    dashboard.reservations = removeReservation(dashboard.reservations, id);
    saveReservations(); render(); if (elements.reservationId.value === id) resetForm(); announce('Reserva excluída com sucesso.');
  }

  function fillPropertyForm() {
    elements.propertyOwnerName.value = currentProperty.ownerName; elements.propertyTitle.value = currentProperty.name;
    elements.propertyUnit.value = currentProperty.unit; elements.propertyCity.value = currentProperty.city;
    elements.propertyState.value = currentProperty.state; elements.propertyAddress.value = currentProperty.address;
    elements.propertyCommission.value = String(currentProperty.commissionRate * 100);
  }

  function editProperty() {
    requireAccess('property:update'); fillPropertyForm(); elements.propertyForm.hidden = false;
  }

  function submitProperty(event) {
    event.preventDefault();
    try {
      requireAccess('property:update');
      const updated = validateProperty({ ...currentProperty, ownerName: elements.propertyOwnerName.value, name: elements.propertyTitle.value,
        unit: elements.propertyUnit.value, city: elements.propertyCity.value, state: elements.propertyState.value.toUpperCase(), address: elements.propertyAddress.value,
        commissionRate: Number(elements.propertyCommission.value) / 100 });
      properties = properties.map((item) => item.id === updated.id ? updated : item); currentProperty = updated;
      dashboard.property = updated.name; dashboard.city = updated.city; dashboard.commissionRate = updated.commissionRate;
      saveProperties(); elements.propertyForm.hidden = true; render(); preparePropertySelector(); announce('Propriedade atualizada com sucesso.');
    } catch (error) { announce(error.message); }
  }

  function preparePropertySelector() {
    const allowed = access.visibleProperties(currentUser, properties);
    if (!allowed.some((item) => item.id === currentProperty?.id)) currentProperty = allowed[0];
    elements.propertySelector.replaceChildren(...allowed.map((item) => { const option = createElement('option', '', `${item.name} • ${item.city}`); option.value = item.id; return option; }));
    if (currentProperty) elements.propertySelector.value = currentProperty.id;
  }

  function prepareUserSelector() {
    elements.userSelector.replaceChildren(...users.filter(access.isActive).map((user) => {
      const labels = { super_admin: 'Super administrador', admin: 'Administrador / Gestor', owner: 'Proprietário' };
      const option = createElement('option', '', `${user.name} — ${labels[user.role]}`); option.value = user.id; return option;
    }));
    elements.userSelector.value = currentUser.id;
  }

  function changeUser() {
    currentUser = users.find((user) => user.id === elements.userSelector.value);
    preparePropertySelector();
    if (!currentProperty) { showError(new Error('Este usuário não possui propriedades atribuídas.')); return; }
    resetForm(); resetExpenseForm(); render(); announce(`Perfil de demonstração: ${currentUser.name}.`);
  }

  function bindEvents() {
    document.querySelectorAll('[data-screen]').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.screen)));
    elements.reservationForm.addEventListener('submit', submitReservation);
    elements.reservationForm.addEventListener('input', updatePreview);
    elements.cancelEditButton.addEventListener('click', resetForm);
    elements.newReservationButton.addEventListener('click', () => { resetForm(); elements.adminSection.scrollIntoView({ behavior: 'smooth' }); elements.guest.focus({ preventScroll: true }); });
    elements.reservations.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]'); if (!button) return;
      if (button.dataset.action === 'edit') editReservation(button.dataset.id); else deleteReservation(button.dataset.id);
    });
    elements.newExpenseButton.addEventListener('click', openExpenseForm);
    elements.expenseForm.addEventListener('submit', submitExpense);
    elements.cancelExpenseButton.addEventListener('click', () => resetExpenseForm());
    elements.expenses.addEventListener('click', (event) => { const button = event.target.closest('button[data-action]'); if (!button) return;
      if (button.dataset.action === 'edit') editExpense(button.dataset.id); else deleteExpense(button.dataset.id); });
    elements.reportMonth.addEventListener('change', renderMonthlyReport); elements.reportYear.addEventListener('change', renderMonthlyReport);
    elements.generateReportButton.addEventListener('click', () => { renderMonthlyReport(); document.body.classList.add('printing-report'); window.print(); });
    window.addEventListener('afterprint', () => document.body.classList.remove('printing-report'));
    elements.calendarMonth.addEventListener('change', renderCalendar); elements.calendarYear.addEventListener('change', renderCalendar);
    elements.previousMonth.addEventListener('click', () => changeCalendarMonth(-1)); elements.nextMonth.addEventListener('click', () => changeCalendarMonth(1));
    elements.userSelector.addEventListener('change', changeUser);
    elements.propertySelector.addEventListener('change', () => { currentProperty = access.visibleProperties(currentUser, properties).find((item) => item.id === elements.propertySelector.value); render(); });
    elements.editPropertyButton.addEventListener('click', editProperty); elements.propertyForm.addEventListener('submit', submitProperty);
    elements.cancelPropertyButton.addEventListener('click', () => { elements.propertyForm.hidden = true; });
  }

  function showError(error) { elements.appStatus.className = 'app-status error'; elements.appStatus.textContent = `Não foi possível carregar o painel. ${error.message}`; elements.appStatus.hidden = false; }

  async function initialize() {
    try {
      getElements();
      const response = await fetch(`./data.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`O servidor respondeu com o status ${response.status}.`);
      dashboard = validateDashboard(await response.json());
      users = dashboard.users; properties = loadStoredProperties(dashboard.properties);
      currentUser = users.find((user) => user.id === dashboard.currentUserId && access.isActive(user)) || users.find(access.isActive);
      if (!currentUser) throw new Error('Não existe usuário ativo para acessar o sistema.');
      currentProperty = access.visibleProperties(currentUser, properties)[0];
      if (!currentProperty) throw new Error('O usuário não possui propriedades atribuídas.');
      dashboard.property = currentProperty.name; dashboard.city = currentProperty.city; dashboard.commissionRate = currentProperty.commissionRate;
      const source = loadStoredReservations(dashboard.reservations);
      dashboard.reservations = source.map((item, index) => normalizeReservation(item, index, dashboard));
      dashboard.expenses = loadStoredExpenses().map(normalizeExpense);
      prepareUserSelector(); preparePropertySelector(); prepareReportFilters(); prepareCalendarFilters(); bindEvents(); render(); resetForm(); resetExpenseForm();
      showScreen(['home', 'reservations', 'calendar', 'expenses', 'reports'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home', false); elements.appStatus.hidden = true;
    } catch (error) { if (elements.appStatus) showError(error instanceof Error ? error : new Error('Erro inesperado.')); else console.error(error); }
  }

  if (typeof module !== 'undefined') module.exports = {
    countNights, calculateFinancials, calculateTotals, normalizeReservation, removeReservation, upsertReservation, validateDashboard,
    normalizeExpense, upsertExpense, removeExpense, calculateExpensesTotal, calculateFinalPayout,
    isInMonth, nightsInMonth, calculateMonthlyReport, getCalendarDays, getNextStay, validateProperty,
  };
  if (typeof document !== 'undefined') initialize();
})();
