const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function unifiedRows() {
  const source = read("test2-i18n-unified.js");
  const literal = source.match(/const R=(\[[\s\S]*?\]);\s*const idx=/)?.[1];
  assert.ok(literal, "catálogo unificado não encontrado");
  return vm.runInNewContext(literal);
}

test("carrega os catálogos completos antes da camada dinâmica unificada", () => {
  const loader = read("test2.js");
  const base = loader.indexOf("i18n-base-catalog");
  const safe = loader.indexOf("i18n-safe-catalog");
  const extras = loader.indexOf("i18n-extras-catalog");
  const unified = loader.indexOf("i18n-unified");
  assert.ok(base > -1 && safe > base && extras > safe && unified > extras);
});

test("cada texto unificado tem tradução nos dez idiomas suportados", () => {
  const rows = unifiedRows();
  assert.ok(rows.length >= 100, "catálogo crítico ficou pequeno demais");
  rows.forEach((row) => {
    assert.equal(row.length, 10, `linha incompleta: ${row[0]}`);
    row.forEach((value) => assert.ok(String(value).trim(), `tradução vazia: ${row[0]}`));
  });
});

test("cobre as telas e ações críticas que antes permaneciam em português", () => {
  const pt = new Set(unifiedRows().map((row) => row[0]));
  [
    "Planos & Pagamentos",
    "Administradores",
    "Administradores com cobrança",
    "Salvar preço",
    "Receita mensal",
    "Compartilhar relatório",
    "Imprimir / Salvar PDF",
    "Nova receita",
    "Convidar usuário",
    "Reenviar acesso",
    "Como a limpeza foi cobrada?",
    "Cobrada separadamente",
    "Comissão sobre a estadia (%)",
  ].forEach((label) => assert.ok(pt.has(label), `sem tradução: ${label}`));
});

test("atualiza textos dinâmicos, atributos e conteúdo inserido depois da navegação", () => {
  const source = read("test2-i18n-unified.js");
  assert.match(source, /Receita mensal\|Monthly revenue/);
  assert.match(source, /Total mensal\|Monthly total/);
  assert.match(source, /placeholder','aria-label','title/);
  assert.match(source, /new MutationObserver/);
  assert.match(source, /stay:navigation/);
  assert.match(source, /stay:language-change/);
});
