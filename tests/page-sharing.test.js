const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const loader = fs.readFileSync("test2.js", "utf8");
const sharing = fs.readFileSync("test2-page-share.js", "utf8");
const dashboard = fs.readFileSync("test2-super-dashboard-v2.js", "utf8");

test("carrega o compartilhamento visual na versão principal", () => {
  assert.match(loader, /test2-page-share\.js\?v=20260917-full-page/);
});

test("captura a página real com filtros, gráficos e tabela", () => {
  assert.match(sharing, /t2SuperDashboardV2 \.t2v2-content/);
  assert.match(sharing, /copyComputedStyles/);
  assert.match(sharing, /input,select,textarea,details/);
  assert.match(sharing, /t2v2-donut/);
  assert.match(sharing, /image\/png/);
});

test("oferece compartilhamento com arquivo, WhatsApp, e-mail e download", () => {
  assert.match(sharing, /navigator\.share\(\{ title, text, files: \[file\] \}\)/);
  assert.match(sharing, /web\.whatsapp\.com\/send/);
  assert.match(sharing, /mailto:\?subject=/);
  assert.match(sharing, /Baixar imagem/);
});

test("o botão do painel abre diretamente o cartão aprovado", () => {
  assert.match(dashboard, /window\.Test2Share\?\.open/);
  assert.match(dashboard, /"Visão geral"/);
  assert.match(dashboard, /stay:approved-share/);
});
