const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const loader = fs.readFileSync("test2.js", "utf8");
const sharing = fs.readFileSync("test2-page-share.js", "utf8");
const dashboard = fs.readFileSync("test2-super-dashboard-v2.js", "utf8");

test("carrega o compartilhamento visual na versão principal", () => {
  assert.match(loader, /test2-page-share\.js\?v=20260918-share-fix/);
});

test("captura a página real com filtros, gráficos e tabela", () => {
  assert.match(sharing, /t2SuperDashboardV2 \.t2v2-content/);
  assert.match(sharing, /window\.html2canvas/);
  assert.match(sharing, /useCORS: true/);
  assert.match(sharing, /t2v2-donut/);
  assert.match(sharing, /image\/png/);
  assert.match(sharing, /\.booking,\.reservation-card/);
  assert.match(sharing, /#t2Analytics/);
});

test("oferece compartilhamento com arquivo, WhatsApp, e-mail e download", () => {
  assert.match(sharing, /navigator\.share\(\{ title, text, files: \[file\] \}\)/);
  assert.match(sharing, /web\.whatsapp\.com\/send/);
  assert.match(sharing, /mailto:\?subject=/);
  assert.match(sharing, /Baixar imagem/);
});

test("a tela principal mantém compartilhar e remove gerar relatório", () => {
  assert.doesNotMatch(dashboard, /id="t2V2Report"/);
  assert.doesNotMatch(dashboard, /data-go="reports"/);
  assert.match(sharing, /t2-overview-sharebar/);
});
