const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const OFFICIAL = 'https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app';

test('todos os fluxos de acesso usam a versão principal oficial', () => {
  for (const file of [
    'password-recovery.js',
    'test2-email-resend-restore.js',
    'test2-login.html',
    'invite.html',
    'test2-unified-invite-user.js',
    'test2-admins-dashboard.js',
    'test2-cpf-admin-invite.js',
    'test2-cpf-owner-invite.js',
    'test2-owner-modal-v2.js',
    'test2-users-access-v2.js',
    'test2-pro-management.js',
  ]) assert.match(read(file), new RegExp(OFFICIAL.replaceAll('.', '\\.')));
});

test('endereços antigos não permanecem em HTML ou JavaScript', () => {
  const files = fs.readdirSync(root).filter((file) => /\.(?:html|js)$/.test(file));
  const source = files.map(read).join('\n');
  assert.doesNotMatch(source, /raw\.githack\.com/);
  assert.doesNotMatch(source, /ap207-dashboard\.vercel\.app/);
  assert.doesNotMatch(source, /git-system-c-253bf0/);
});

test('interface oficial não se apresenta mais como versão de teste', () => {
  assert.match(read('index.html'), /<title>Stay in Control<\/title>/);
  assert.match(read('test2.js'), /const NAME = "Stay in Control"/);
  assert.match(read('test2.js'), /badge\.textContent = "PRINCIPAL"/);
});

test('telas de acesso possuem regras responsivas para celular e computador', () => {
  const login = read('test2-login.html');
  assert.match(login, /@media \(min-width: 900px\)/);
  assert.match(login, /@media \(max-width: 899px\)/);
  assert.match(login, /@media \(max-width: 640px\)/);
  assert.match(login, /width: min\(100%, 570px\)/);
});
