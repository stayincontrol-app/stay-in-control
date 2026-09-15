"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

test("formulário de reserva oferece os três tratamentos de limpeza", () => {
  const html = read("index.html");
  for (const mode of ["included", "separate", "none"])
    assert.match(html, new RegExp(`name="cleaningMode" value="${mode}"`));
  assert.match(html, /Comissão sobre a estadia/);
  assert.match(html, /nunca entra no cálculo da comissão/);
});

test("opções de limpeza se adaptam a telas menores", () => {
  assert.match(read("style.css"), /\.cleaning-mode-options/);
  assert.match(read("style.css"), /@media\(max-width:800px\)\{\.cleaning-mode-options\{grid-template-columns:1fr\}\}/);
});

test("cadastros iCal persistem tratamento e valor da limpeza", () => {
  const form = read("test2-ical-form-ui.js");
  const guard = read("test2-ical-property-guard.js");
  const manager = read("ical-manager.js");
  for (const source of [form, manager]) {
    assert.match(source, /CleaningMode/);
    assert.match(source, /CleaningFee/);
  }
  assert.match(guard, /cleaningMode/);
  assert.match(guard, /cleaningFee/);
});

test("todos os relatórios financeiros respeitam o modo da limpeza", () => {
  for (const name of [
    "consolidated-reports.js",
    "all-months-reports.js",
    "all-months-unit-report.js",
    "test2-monthly-report-correctness.js",
    "test2-report-financial-bridge.js",
    "test2-report-consistency.js",
    "test2-super-dashboard-v2.js",
    "home-scope-overview.js",
  ])
    assert.match(read(name), /cleaningMode/, `${name} deve usar cleaningMode`);
});

test("proprietário não recebe formulário de iCal", () => {
  assert.match(
    read("test2-ical-form-ui.js"),
    /\['super_admin','admin'\]\.includes\(p\.role\)/,
  );
  assert.match(read("ical-manager.js"), /\["admin", "super_admin"\]\.includes/);
});
