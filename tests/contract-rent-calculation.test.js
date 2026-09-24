const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const suite = fs.readFileSync(path.join(__dirname, '..', 'test2-suite.js'), 'utf8');
const payments = fs.readFileSync(path.join(__dirname, '..', 'test2-contract-payments.js'), 'utf8');
const chargedSource = suite.match(/function chargedRent\(x\)\{.*?\}(?=function renderContracts)/)?.[0];
const expectedSource = payments.match(/function expectedFor\(c,reference\)\{.*?\}(?=function contractMatchesProperty)/)?.[0];

test('o desconto e a caução parcelada geram o valor correto de cada mês', () => {
  assert.ok(chargedSource && expectedSource, 'cálculo compartilhado pelos contratos e pagamentos');
  const context = vm.createContext({});
  vm.runInContext(`${chargedSource};${expectedSource};`, context);
  const contract = {
    rent: 1800, rentDiscount: 300, deposit: 1800,
    depositMode: 'rent', depositInstallments: 12, start: '2026-10-01'
  };
  assert.equal(context.chargedRent(contract), 1500);
  assert.equal(context.expectedFor(contract, '2026-10'), 1650);
  assert.equal(context.expectedFor(contract, '2027-09'), 1650);
  assert.equal(context.expectedFor(contract, '2027-10'), 1500);
});
