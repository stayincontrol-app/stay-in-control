const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("carrega as ações oficiais sem adicionar outro roteador", () => {
  const loader = read("test2.js");
  assert.match(loader, /test2-unified-invite-user\.js/);
  assert.match(loader, /test2-attachment-ui\.js/);
  assert.doesNotMatch(loader, /test2-direct-route-fix\.js/);
  assert.doesNotMatch(loader, /test2-navigation-health\.js/);
});

test("novo administrador usa o mesmo convite de usuário", () => {
  const dashboard = read("test2-admins-dashboard.js");
  const invite = read("test2-unified-invite-user.js");
  assert.match(dashboard, /Test2UnifiedInviteUser\?\.open\?\.\("admin"\)/);
  assert.doesNotMatch(
    dashboard,
    /Cadastro de administrador ainda não carregou/,
  );
  assert.match(invite, /CPF \+ senha \(Brasil\)/);
  assert.match(invite, /propertyIds/);
});

test("nova receita abre no controlador da página financeira", () => {
  const page = read("test2-unified-page-content.js");
  assert.match(page, /function openIncome\(\)/);
  assert.match(page, /run: openIncome/);
  assert.match(page, /t2ExtraReceipt/);
  assert.match(page, /#t2UnifiedFinancial #newExpenseButton/);
});

test("contrato oferece anexo em PDF, Word, imagem ou foto", () => {
  const attachment = read("test2-attachment-ui.js");
  assert.match(attachment, /Anexar contrato/);
  assert.match(attachment, /\.pdf,\.doc,\.docx/);
  assert.match(attachment, /Fotografar contrato/);
});

test("painel aceita mais de um administrador por unidade", () => {
  const scope = read("home-scope-overview.js");
  const dashboard = read("test2-super-dashboard-v2.js");
  const data = JSON.parse(read("data.json"));
  const property = data.properties.find((item) => item.id === "property-ap207");
  assert.match(scope, /property_access/);
  assert.match(scope, /administratorNames/);
  assert.match(dashboard, /function adminNames\(p\)/);
  assert.deepEqual(property.administratorNames, ["Juliana", "Zico"]);
  assert.equal(property.ownerName, "Marcelo Estevão");
});
