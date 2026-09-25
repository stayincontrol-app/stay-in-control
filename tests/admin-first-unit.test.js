"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadAccessibleProperties } = require("../app.js");

test("carrega a unidade de um administrador em outro navegador mesmo com nome vazio", async () => {
  const values = new Map();
  global.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  global.AP207Supabase = {
    from: () => ({
      select: () => ({
        is: async () => ({ data: [{
          id: "property-1790290924782", owner_name: "Flavio",
          name: null, unit: "206", city: "Curitiba", state: null,
          address: null, commission_rate: 0, administrator_id: "flavio-id",
          owner_id: null,
        }], error: null }),
      }),
    }),
  };
  try {
    const result = await loadAccessibleProperties([]);
    assert.equal(result[0].name, "206");
    assert.equal(result[0].unit, "206");
    assert.equal(result[0].administratorId, "flavio-id");
    assert.equal(JSON.parse(values.get("ap207-dashboard-properties-v1")).properties[0].id, result[0].id);
  } finally {
    delete global.localStorage;
    delete global.AP207Supabase;
  }
});
