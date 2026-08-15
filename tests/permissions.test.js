'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROLES, hasPermission, visibleProperties, perform } = require('../permissions.js');
const { validateDashboard, normalizeReservation } = require('../app.js');
const sourceData = require('../data.json');

const superAdmin = { id: 'super', role: ROLES.SUPER_ADMIN, active: true };
const administrator = { id: 'admin-1', role: ROLES.ADMIN, active: true };
const owner = { id: 'owner-1', role: ROLES.OWNER, active: true };
const properties = [
  { id: 'a', administratorId: 'admin-1', ownerId: 'owner-1' },
  { id: 'b', administratorId: 'admin-2', ownerId: 'owner-2' },
];

test('proprietário não pode editar nem excluir reserva', () => {
  assert.equal(hasPermission(owner, 'reservation:update'), false);
  assert.throws(() => perform(owner, properties[0], 'reservation:update', () => 'editou'), /Acesso negado/);
  assert.throws(() => perform(owner, properties[0], 'reservation:delete', () => 'excluiu'), /Acesso negado/);
});

test('proprietário não pode criar despesa', () => {
  assert.throws(() => perform(owner, properties[0], 'expense:create', () => 'criou'), /Acesso negado/);
});

test('administrador pode editar dados das propriedades atribuídas', () => {
  assert.equal(perform(administrator, properties[0], 'reservation:update', () => 'editou'), 'editou');
  assert.equal(perform(administrator, properties[0], 'property:update', () => 'editou'), 'editou');
  assert.throws(() => perform(administrator, properties[1], 'property:update', () => 'editou'), /propriedade/);
});

test('super administrador pode editar tudo e acessar todas as propriedades', () => {
  assert.equal(perform(superAdmin, properties[1], 'expense:update', () => 'editou'), 'editou');
  assert.deepEqual(visibleProperties(superAdmin, properties), properties);
});

test('cada proprietário visualiza somente suas propriedades', () => {
  assert.deepEqual(visibleProperties(owner, properties).map(({ id }) => id), ['a']);
  assert.deepEqual(visibleProperties({ ...owner, id: 'owner-2' }, properties).map(({ id }) => id), ['b']);
});

test('usuário inativo não possui permissões nem propriedades', () => {
  const inactive = { ...superAdmin, active: false };
  assert.equal(hasPermission(inactive, 'property:update'), false);
  assert.deepEqual(visibleProperties(inactive, properties), []);
});

test('dados atuais do AP207 continuam válidos e preservam os cálculos', () => {
  const dashboard = validateDashboard(sourceData);
  assert.equal(dashboard.properties[0].name, 'AP207');
  assert.equal(dashboard.properties[0].city, 'Curitiba');
  const reservation = normalizeReservation(dashboard.reservations[0], 0, dashboard);
  assert.equal(reservation.guest, 'Darlan');
  assert.equal(reservation.net, 379.95);
});
