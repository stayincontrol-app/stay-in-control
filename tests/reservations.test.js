'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countNights, calculateFinancials, calculateTotals, normalizeReservation, removeReservation, upsertReservation, validateDashboard,
} = require('../app.js');

const defaults = { cleaningFee: 135, commissionRate: 0.15 };

test('calcula noites entre check-in e check-out', () => assert.equal(countNights('2026-08-10', '2026-08-13'), 3));
test('rejeita check-out anterior ou igual', () => assert.throws(() => countNights('2026-08-13', '2026-08-13'), /depois/));
test('calcula comissão sobre bruto menos limpeza e repasse líquido', () => {
  assert.deepEqual(calculateFinancials(582, 135, 15), { gross: 582, cleaning: 135, commissionRate: 15, commission: 67.05, net: 379.95 });
});
test('rejeita valores negativos e limpeza acima do bruto', () => {
  assert.throws(() => calculateFinancials(-1, 0, 15), /maior ou igual/);
  assert.throws(() => calculateFinancials(100, -1, 15), /maior ou igual/);
  assert.throws(() => calculateFinancials(100, 0, -1), /maior ou igual/);
  assert.throws(() => calculateFinancials(100, 0, 101), /entre 0% e 100%/);
  assert.throws(() => calculateFinancials(100, 101, 15), /não pode superar/);
});
test('preserva os dados existentes aplicando padrões do painel', () => {
  const item = normalizeReservation({ guest: 'Darlan', checkIn: '2026-08-10', checkOut: '2026-08-13', status: 'estimado', gross: 582 }, 0, defaults);
  assert.equal(item.platform, 'Airbnb'); assert.equal(item.cleaning, 135); assert.equal(item.commissionRate, 15); assert.equal(item.net, 379.95);
  assert.equal(item.status, 'Estimada');
});

test('cria uma reserva sem alterar as existentes', () => {
  const existing = [{ id: 'sample' }];
  const created = { id: 'manual', guest: 'Ana' };
  assert.deepEqual(upsertReservation(existing, created), [existing[0], created]);
  assert.deepEqual(existing, [{ id: 'sample' }]);
});

test('edita uma reserva existente mantendo sua posição', () => {
  const result = upsertReservation([{ id: 'sample', guest: 'Antes' }], { id: 'sample', guest: 'Depois' });
  assert.deepEqual(result, [{ id: 'sample', guest: 'Depois' }]);
});

test('exclui somente a reserva selecionada', () => {
  assert.deepEqual(removeReservation([{ id: 'a' }, { id: 'b' }], 'a'), [{ id: 'b' }]);
});

test('exclui reservas canceladas dos totais financeiros e de noites', () => {
  const active = { status: 'Confirmada', nights: 3, gross: 500, cleaning: 100, commission: 60, net: 340 };
  const cancelled = { status: 'Cancelada', nights: 5, gross: 900, cleaning: 100, commission: 120, net: 680 };
  assert.deepEqual(calculateTotals([active, cancelled]), { nights: 3, gross: 500, cleaning: 100, commission: 60, net: 340 });
});
test('valida a configuração original do dashboard', () => {
  const data = validateDashboard({ property: 'AP207', city: 'Curitiba', month: 'Agosto 2026', cleaningFee: 135, commissionRate: 0.15, reservations: [] });
  assert.equal(data.property, 'AP207');
});
