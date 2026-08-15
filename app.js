(() => {
  'use strict';

  const moneyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const elements = {};
  const elementIds = [
    'appStatus', 'propertyName', 'subtitle', 'monthLabel', 'periodCount',
    'nightCount', 'nightRange', 'grossTotal', 'netTotal', 'reservations',
    'summaryGross', 'summaryCleaning', 'summaryCommission', 'summaryNet',
    'ruleCleaning', 'ruleCommission',
  ];

  function getElements() {
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Elemento obrigatório não encontrado: #${id}`);
      elements[id] = element;
    });
  }

  function formatMoney(value) {
    return moneyFormatter.format(Number.isFinite(value) ? value : 0);
  }

  function parseDate(value, fieldName) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`${fieldName} deve usar o formato AAAA-MM-DD.`);
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year
      || date.getUTCMonth() !== month - 1
      || date.getUTCDate() !== day
    ) {
      throw new Error(`${fieldName} contém uma data inválida.`);
    }
    return date;
  }

  function formatDate(value) {
    const date = parseDate(value, 'Data');
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  }

  function countNights(checkIn, checkOut) {
    const start = parseDate(checkIn, 'Check-in');
    const end = parseDate(checkOut, 'Check-out');
    const total = (end.getTime() - start.getTime()) / 86400000;
    if (!Number.isInteger(total) || total <= 0) {
      throw new Error('O check-out deve ocorrer depois do check-in.');
    }
    return total;
  }

  function requireText(value, fieldName) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${fieldName} não foi informado.`);
    }
    return value.trim();
  }

  function requireNonNegativeNumber(value, fieldName) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new Error(`${fieldName} deve ser um número maior ou igual a zero.`);
    }
    return value;
  }

  function validateDashboard(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('O arquivo de dados não contém um objeto válido.');
    }

    const commissionRate = requireNonNegativeNumber(data.commissionRate, 'Comissão');
    if (commissionRate > 1) throw new Error('A comissão deve estar entre 0 e 1.');
    if (!Array.isArray(data.reservations)) throw new Error('A lista de reservas é inválida.');

    return {
      property: requireText(data.property, 'Propriedade'),
      city: requireText(data.city, 'Cidade'),
      month: requireText(data.month, 'Mês'),
      cleaningFee: requireNonNegativeNumber(data.cleaningFee, 'Taxa de limpeza'),
      commissionRate,
      reservations: data.reservations,
    };
  }

  function normalizeReservation(reservation, index, dashboard) {
    if (!reservation || typeof reservation !== 'object' || Array.isArray(reservation)) {
      throw new Error(`Reserva ${index + 1} é inválida.`);
    }

    const gross = requireNonNegativeNumber(reservation.gross, `Valor bruto da reserva ${index + 1}`);
    const checkIn = requireText(reservation.checkIn, `Check-in da reserva ${index + 1}`);
    const checkOut = requireText(reservation.checkOut, `Check-out da reserva ${index + 1}`);
    const nights = countNights(checkIn, checkOut);
    const cleaning = gross > 0 ? dashboard.cleaningFee : 0;
    const commissionBase = Math.max(0, gross - cleaning);
    const commission = commissionBase * dashboard.commissionRate;

    return {
      guest: typeof reservation.guest === 'string' ? reservation.guest.trim() : '',
      checkIn,
      checkOut,
      status: typeof reservation.status === 'string' && reservation.status.trim()
        ? reservation.status.trim()
        : 'estimado',
      nights,
      gross,
      cleaning,
      commission,
      net: commissionBase - commission,
    };
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function statusClass(status) {
    return status
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function breakdownItem(label, value, className = '') {
    const item = createElement('div');
    item.append(createElement('small', '', label));
    item.append(createElement('b', className, value));
    return item;
  }

  function renderReservation(reservation, commissionRate) {
    const article = createElement('article', 'booking');
    const top = createElement('div', 'bookingtop');
    const heading = createElement('div');

    if (reservation.guest) heading.append(createElement('span', 'guest', reservation.guest));
    heading.append(createElement(
      'b',
      '',
      `${formatDate(reservation.checkIn)} → ${formatDate(reservation.checkOut)}`,
    ));
    heading.append(createElement(
      'p',
      '',
      `${reservation.nights} ${reservation.nights === 1 ? 'noite' : 'noites'}`,
    ));

    const badge = createElement(
      'span',
      `status status-${statusClass(reservation.status)}`,
      reservation.status,
    );
    top.append(heading, badge);

    const breakdown = createElement('div', 'breakdown');
    breakdown.append(
      breakdownItem('Valor bruto', formatMoney(reservation.gross)),
      breakdownItem('Limpeza', `− ${formatMoney(reservation.cleaning)}`),
      breakdownItem(`Comissão ${Math.round(commissionRate * 100)}%`, `− ${formatMoney(reservation.commission)}`),
      breakdownItem('Seu repasse', formatMoney(reservation.net), 'green'),
    );
    article.append(top, breakdown);
    return article;
  }

  function render(data) {
    const warnings = [];
    const reservations = [];
    data.reservations.forEach((reservation, index) => {
      try {
        reservations.push(normalizeReservation(reservation, index, data));
      } catch (error) {
        warnings.push(error.message);
      }
    });

    const totals = reservations.reduce((result, reservation) => ({
      nights: result.nights + reservation.nights,
      gross: result.gross + reservation.gross,
      cleaning: result.cleaning + reservation.cleaning,
      commission: result.commission + reservation.commission,
      net: result.net + reservation.net,
    }), { nights: 0, gross: 0, cleaning: 0, commission: 0, net: 0 });

    elements.propertyName.textContent = data.property;
    elements.subtitle.textContent = `Painel do Proprietário • ${data.city}`;
    elements.monthLabel.textContent = data.month;
    elements.periodCount.textContent = String(reservations.length);
    elements.nightCount.textContent = String(totals.nights);
    elements.nightRange.textContent = reservations.length === 1
      ? `${formatDate(reservations[0].checkIn)} → ${formatDate(reservations[0].checkOut)}`
      : `${reservations.length} ${reservations.length === 1 ? 'período' : 'períodos'}`;
    elements.grossTotal.textContent = formatMoney(totals.gross);
    elements.netTotal.textContent = formatMoney(totals.net);
    elements.summaryGross.textContent = formatMoney(totals.gross);
    elements.summaryCleaning.textContent = formatMoney(totals.cleaning);
    elements.summaryCommission.textContent = formatMoney(totals.commission);
    elements.summaryNet.textContent = formatMoney(totals.net);
    elements.ruleCleaning.textContent = formatMoney(data.cleaningFee);
    elements.ruleCommission.textContent = `${Math.round(data.commissionRate * 100)}%`;

    const fragment = document.createDocumentFragment();
    reservations.forEach((reservation) => {
      fragment.append(renderReservation(reservation, data.commissionRate));
    });
    elements.reservations.replaceChildren(fragment);

    if (warnings.length) {
      elements.appStatus.className = 'app-status warning';
      elements.appStatus.textContent = `${warnings.length} reserva(s) inválida(s) não foram exibidas: ${warnings.join(' ')}`;
      elements.appStatus.hidden = false;
    } else {
      elements.appStatus.hidden = true;
    }
  }

  function showError(error) {
    elements.appStatus.className = 'app-status error';
    elements.appStatus.textContent = `Não foi possível carregar o painel. ${error.message}`;
    elements.appStatus.hidden = false;
  }

  async function initialize() {
    try {
      getElements();
      const response = await fetch(`./data.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`O servidor respondeu com o status ${response.status}.`);
      const dashboard = validateDashboard(await response.json());
      render(dashboard);
    } catch (error) {
      if (elements.appStatus) showError(error instanceof Error ? error : new Error('Erro inesperado.'));
      else console.error(error);
    }
  }

  initialize();
})();
