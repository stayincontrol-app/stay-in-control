'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countNights, calculateFinancials, calculateTotals, normalizeReservation, removeReservation, upsertReservation, validateDashboard,
  normalizeExpense, upsertExpense, removeExpense, calculateExpensesTotal, calculateFinalPayout,
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

const expense = { id: 'expense-1', date: '2026-08-15', category: 'Material', description: 'Lâmpadas', value: 42.5 };

test('cria uma despesa sem alterar as existentes', () => {
  const existing = [expense];
  const created = normalizeExpense({ date: '2026-08-16', category: 'Serviço', description: 'Chaveiro', value: 80 });
  const result = upsertExpense(existing, created);
  assert.equal(result.length, 2); assert.equal(result[1].description, 'Chaveiro'); assert.deepEqual(existing, [expense]);
});

test('edita uma despesa existente mantendo sua posição', () => {
  const updated = { ...expense, description: 'Lâmpadas LED', value: 50 };
  assert.deepEqual(upsertExpense([expense], updated), [updated]);
});

test('exclui somente a despesa selecionada', () => {
  assert.deepEqual(removeExpense([expense, { ...expense, id: 'expense-2' }], 'expense-1'), [{ ...expense, id: 'expense-2' }]);
});

test('totaliza outras despesas com centavos', () => {
  assert.equal(calculateExpensesTotal([expense, { ...expense, id: 'expense-2', value: 10.25 }]), 52.75);
});

test('calcula repasse final e permite resultado negativo', () => {
  assert.equal(calculateFinalPayout(379.95, 52.75), 327.2);
  assert.equal(calculateFinalPayout(100, 125.5), -25.5);
});

test('rejeita despesa negativa e categoria inválida', () => {
  assert.throws(() => normalizeExpense({ ...expense, value: -1 }), /maior ou igual a zero/);
  assert.throws(() => normalizeExpense({ ...expense, category: 'Inválida' }), /Categoria/);
});
