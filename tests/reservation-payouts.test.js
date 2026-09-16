"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const loaderSource = fs.readFileSync(path.join(root, "test2.js"), "utf8");
const payoutSource = fs.readFileSync(path.join(root, "test2-reservation-payouts.js"), "utf8");

test("cada cartão expõe o identificador estável da reserva", () => {
  assert.match(appSource, /article\.dataset\.reservationId = reservation\.id/);
});

test("o fluxo de repasse de reservas é carregado somente na área de reservas", () => {
  assert.match(loaderSource, /test2-reservation-payouts\.js/);
  assert.match(payoutSource, /document\.getElementById\("reservations"\)/);
  assert.doesNotMatch(payoutSource, /t2Contracts|contractId|contract_id/);
});

test("proprietário possui consulta sem controles de edição", () => {
  assert.match(payoutSource, /disabled = !manager/);
  assert.match(payoutSource, /manager \? '<input name="platformProof"/);
  assert.match(payoutSource, /\$\{manager \? `<div class="t2-rp-footer">/);
});

test("os dois comprovantes permanecem separados", () => {
  assert.match(payoutSource, /platform_receipt_path/);
  assert.match(payoutSource, /payout_receipt_path/);
  assert.match(payoutSource, /"platform"/);
  assert.match(payoutSource, /"owner"/);
});

test("layout adapta os cartões para tablet e celular", () => {
  assert.match(payoutSource, /@media\(max-width:800px\)/);
  assert.match(payoutSource, /@media\(max-width:480px\)/);
});
