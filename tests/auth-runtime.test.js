"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

test("login usa dependência fixa e nunca espera autenticação indefinidamente", () => {
  const login = read("test2-login.html");
  assert.match(login, /@supabase\/supabase-js@2\.105\.0/);
  assert.match(login, /function withTimeout\(/);
  assert.match(login, /client\.auth\.signInWithPassword/);
  assert.match(login, /error\?\.code === "AUTH_TIMEOUT"/);
  assert.match(login, /submitting = false/);
  assert.match(login, /submit\.disabled = false/);
});

test("painel valida uma sessão sem instalar outro formulário de login", () => {
  const permissions = read("permissions.js");
  assert.match(permissions, /client\.auth\.getSession\(\)/);
  assert.match(permissions, /await loadAuthenticatedProfile\(client, session\.user\)/);
  assert.match(permissions, /activateApplication\(\)/);
  assert.doesNotMatch(permissions, /refreshInBackground/);
  assert.doesNotMatch(permissions, /stay:auth-refreshed/);
  assert.doesNotMatch(permissions, /ap207LoginForm/);
  assert.doesNotMatch(permissions, /signInWithPassword/);
  assert.doesNotMatch(permissions, /resetPasswordForEmail/);
  assert.doesNotMatch(permissions, /signUp\(/);
});

test("somente um controle de inatividade e um botão de saída ficam ativos", () => {
  const html = read("index.html");
  const loader = read("test2.js");
  const switcher = read("session-property-switcher.js");
  assert.match(html, /permissions\.js\?v=20260917-auth-stable/);
  assert.match(html, /session-property-switcher\.js\?v=20260917-auth-stable/);
  assert.doesNotMatch(loader, /test2-inactivity-logout\.js/);
  assert.doesNotMatch(switcher, /stayControlLogoutButton/);
  assert.doesNotMatch(switcher, /function installLogout/);
  assert.match(switcher, /installInactivityTracking\(\)/);
});

test("patches de autenticação substituídos foram removidos", () => {
  [
    "test2-inactivity-logout.js",
    "test2-logout-guard.js",
    "test2-auth.js",
    "test2-core-live-session-guard.js",
    "test2-auth-error-guard.js",
    "test2-auth-service-error-guard.js",
    "test2-base-auth-error-guard.js",
  ].forEach((name) => assert.equal(fs.existsSync(path.join(root, name)), false, name));
});
