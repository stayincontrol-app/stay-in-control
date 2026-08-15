'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { countNights, calculateFinancials, normalizeReservation, validateDashboard } = require('../app.js');

const defaults = { cleaningFee: 135, commissionRate: 0.15 };

test('calcula noites entre check-in e check-out', () => assert.equal(countNights('2026-08-10', '2026-08-13'), 3));
test('rejeita check-out anterior ou igual', () => assert.throws(() => countNights('2026-08-13', '2026-08-13'), /depois/));
test('calcula comissão sobre bruto menos limpeza e repasse', () => {
  assert.deepEqual(calculateFinancials(582, 135, 15), { gross: 582, cleaning: 135, commissionRate: 15, commission: 67.05, net: 379.95 });
});
test('rejeita valores negativos e limpeza acima do bruto', () => {
  assert.throws(() => calculateFinancials(-1, 0, 15), /maior ou igual/);
  assert.throws(() => calculateFinancials(100, 101, 15), /não pode superar/);
});
test('preserva os dados existentes aplicando padrões do painel', () => {
  const item = normalizeReservation({ guest: 'Darlan', checkIn: '2026-08-10', checkOut: '2026-08-13', status: 'estimado', gross: 582 }, 0, defaults);
  assert.equal(item.platform, 'Airbnb'); assert.equal(item.cleaning, 135); assert.equal(item.commissionRate, 15); assert.equal(item.net, 379.95);
});
test('valida a configuração original do dashboard', () => {
  const data = validateDashboard({ property: 'AP207', city: 'Curitiba', month: 'Agosto 2026', cleaningFee: 135, commissionRate: 0.15, reservations: [] });
  assert.equal(data.property, 'AP207');
});
