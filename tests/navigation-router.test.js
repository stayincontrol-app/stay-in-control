const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("carrega somente o roteador unificado do menu", () => {
  const loader = read("test2.js");
  assert.match(loader, /test2-unified-runtime\.js/);
  assert.doesNotMatch(loader, /test2-direct-route-fix\.js/);
  assert.doesNotMatch(
    read("test2-white-screen-recovery.js"),
    /test2-navigation-health\.js/,
  );
});

test("recuperação visual preserva a rota ativa", () => {
  const recovery = read("test2-white-screen-recovery.js");
  assert.match(recovery, /show\(requested,\s*false\)/);
  assert.doesNotMatch(recovery, /show\(["']home["'],\s*false\)/);
});

test("menu não instala manipuladores de rota concorrentes", () => {
  const shell = read("test2-pro-shell.js");
  assert.doesNotMatch(shell, /b\.onclick=\(\)=>route\(routeKey\)/);
  assert.doesNotMatch(shell, /b\.onclick=\(\)=>route\(k\)/);
});

test("roteador unificado cobre todas as telas obrigatórias", () => {
  const router = read("test2-unified-runtime.js");
  for (const route of [
    "home",
    "reservations",
    "calendar",
    "reports",
    "admins",
    "plans",
  ]) {
    assert.match(router, new RegExp(`${route}:`));
  }
});
