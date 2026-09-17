const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function unifiedRows() {
  const source = read("test2-i18n-unified.js");
  const literal = source.match(/const R=(\[[\s\S]*?\]);\s*const external=/)?.[1];
  assert.ok(literal, "catálogo unificado não encontrado");
  return vm.runInNewContext(literal);
}

test("carrega um catálogo de dados e apenas um tradutor dinâmico", () => {
  const loader = read("test2.js");
  const catalog = loader.indexOf("i18n-catalog");
  const unified = loader.indexOf("i18n-unified");
  assert.ok(catalog > -1 && unified > catalog);
  assert.doesNotMatch(loader, /i18n-base-catalog|i18n-safe-catalog|i18n-extras-catalog/);
  assert.equal((read("test2-i18n-unified.js").match(/new MutationObserver/g) || []).length, 1);
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

test("a tela de acesso traduz os dez idiomas sem fallback indevido para inglês", () => {
  const login = read("test2-login.html");
  ["pt-BR", "en", "es", "fr", "de", "it", "pt-PT", "zh-CN", "ja", "ko"].forEach(
    (language) => assert.match(login, new RegExp(`(?:"${language}"|${language}):\\s*\\{`)),
  );
  assert.match(login, /return txt\[lang\.value\] \|\| txt\.en/);
  assert.match(login, /languageLabel\.textContent = x\.language/);
  assert.match(login, /passwordLabel\.textContent = x\.password/);
  assert.match(login, /first\.innerHTML = x\.first/);
  assert.match(login, /settings\.language = lang\.value/);
});

test("o catálogo consolidado cobre o dashboard que o usuário vê", () => {
  const source = read("test2-i18n-catalog.js");
  const literal = source.match(/window\.StayI18nCatalog=(\{[\s\S]*\});\}\)\(\);/)?.[1];
  assert.ok(literal, "catálogo consolidado ausente");
  const catalog = vm.runInNewContext(`(${literal})`);
  const unified = new Set(unifiedRows().map((row) => row[0]));
  assert.deepEqual(Array.from(catalog.languages), [
    "pt-BR", "en", "es", "fr", "de", "it", "pt-PT", "zh-CN", "ja", "ko",
  ]);
  [
    "Receita bruta",
    "Despesas",
    "Comissão",
    "Repasse líquido",
    "Compartilhar",
    "Gerar relatório",
    "Nova propriedade",
    "Nova reserva",
  ].forEach((label) => {
    const row = catalog.entries[label];
    assert.ok(row || unified.has(label), `texto ausente: ${label}`);
    if (row)
      catalog.languages.forEach((language) => assert.ok(row[language], `${label} sem ${language}`));
  });
});

test("login é idempotente e confirma a sessão antes de abrir o painel", () => {
  const login = read("test2-login.html");
  assert.match(login, /if \(submitting\) return/);
  assert.match(login, /submit\.disabled = true/);
  assert.match(login, /client\.auth\.getSession\(\)/);
  assert.match(login, /attempt < 2/);
});

test("logout usa uma única ação sem clicar recursivamente no próprio botão", () => {
  const runtime = read("test2-unified-runtime.js");
  const shell = read("test2-pro-shell.js");
  assert.match(runtime, /if\(r==='logout'\)/);
  assert.match(runtime, /clearSession\(\)/);
  assert.match(runtime, /signOut\?\.\(\{scope:'local'\}\)/);
  assert.match(runtime, /location\.replace\('\.\/test2-login\.html'\)/);
  assert.doesNotMatch(shell, /find\(x=>\/\^\(sair\|logout/);
});

test("produção força celulares e computadores a baixar os runtimes corrigidos", () => {
  assert.match(read("index.html"), /test2\.js\?v=20260917-auth-stable/);
  const loader = read("test2.js");
  assert.match(loader, /test2-pro-shell\.js\?v=20260916-session-i18n/);
  assert.match(loader, /test2-unified-runtime\.js\?v=20260916-session-i18n/);
});
