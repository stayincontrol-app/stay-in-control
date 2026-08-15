(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined') module.exports = api;
  root.AP207Access = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const ROLES = Object.freeze({ SUPER_ADMIN: 'super_admin', ADMIN: 'admin', OWNER: 'owner' });
  const PERMISSIONS = Object.freeze({
    [ROLES.SUPER_ADMIN]: ['*'],
    [ROLES.ADMIN]: ['reservation:create', 'reservation:update', 'reservation:delete', 'expense:create', 'expense:update', 'expense:delete', 'property:update', 'calendar:read', 'report:read', 'report:generate'],
    [ROLES.OWNER]: ['dashboard:read', 'reservation:read', 'calendar:read', 'expense:read', 'report:read', 'report:generate'],
  });

  function isActive(user) { return Boolean(user && user.active !== false); }
  function hasPermission(user, permission) {
    if (!isActive(user) || !PERMISSIONS[user.role]) return false;
    return PERMISSIONS[user.role].includes('*') || PERMISSIONS[user.role].includes(permission);
  }
  function assertPermission(user, permission) {
    if (!hasPermission(user, permission)) throw new Error('Acesso negado para esta operação.');
    return true;
  }
  function visibleProperties(user, properties) {
    if (!isActive(user)) return [];
    if (user.role === ROLES.SUPER_ADMIN) return [...properties];
    const field = user.role === ROLES.ADMIN ? 'administratorId' : 'ownerId';
    return properties.filter((property) => property[field] === user.id);
  }
  function assertPropertyAccess(user, property) {
    if (!property || !visibleProperties(user, [property]).length) throw new Error('Acesso negado a esta propriedade.');
    return true;
  }
  function authorize(user, property, permission) {
    assertPermission(user, permission); assertPropertyAccess(user, property); return true;
  }
  function perform(user, property, permission, operation) {
    authorize(user, property, permission); return operation();
  }

  return { ROLES, PERMISSIONS, isActive, hasPermission, assertPermission, visibleProperties, assertPropertyAccess, authorize, perform };
});
