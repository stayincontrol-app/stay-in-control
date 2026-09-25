'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(require.resolve('../shared-state.js'), 'utf8');

function browser(records, user, propertyIds, role = 'admin') {
  class Storage {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(index) { return [...this.data.keys()][index] || null; }
    getItem(key) { return this.data.get(key) ?? null; }
    setItem(key, value) { this.data.set(String(key), String(value)); }
    removeItem(key) { this.data.delete(String(key)); }
  }
  const localStorage = new Storage();
  localStorage.setItem('ap207-auth-profile-v1', JSON.stringify({profile:{id:user,role,active:true},propertyIds}));
  const client = {from(table) {
    assert.equal(table, 'shared_records');
    return {
      select() { return Promise.resolve({data:[...records.values()].filter(x => role === 'super_admin' || propertyIds.includes(x.property_id)),error:null}); },
      async upsert(row) { records.set([row.collection,row.property_id,row.id].join(':'),row); return {error:null}; },
    };
  }};
  const document = {
    body:{classList:{contains:()=>true},append(){}},
    visibilityState:'visible',
    getElementById:()=>null,
    createElement:()=>({setAttribute(){},style:{},hidden:false}),
    addEventListener(){},
  };
  const window = {AP207Supabase:client,addEventListener(){}};
  const context = vm.createContext({window,document,Storage,localStorage,location:{reload(){}},setTimeout,Date,console});
  vm.runInContext(code,context);
  return {window,localStorage};
}

test('records persist by property across browsers and remain visible to super administrator',async()=>{
  const records = new Map();
  const first=browser(records,'admin-a',['unit-206']);
  await first.window.StaySharedState.ready;
  first.localStorage.setItem('system-control-test2-suite-v1',JSON.stringify({contracts:[{id:'contract-1',propertyId:'unit-206',tenant:'Ana'}]}));
  await first.window.StaySharedState.flush();
  const second=browser(records,'admin-b',['unit-206']);
  await second.window.StaySharedState.ready;
  assert.equal(JSON.parse(second.localStorage.getItem('system-control-test2-suite-v1')).contracts[0].tenant,'Ana');
  const superAdmin=browser(records,'super',[],'super_admin');
  await superAdmin.window.StaySharedState.ready;
  assert.equal(JSON.parse(superAdmin.localStorage.getItem('system-control-test2-suite-v1')).contracts.length,1);
  const other=browser(records,'admin-c',['unit-207']);
  await other.window.StaySharedState.ready;
  assert.equal(JSON.parse(other.localStorage.getItem('system-control-test2-suite-v1')).contracts.length,0);
});

test('expense changes and deletions remain consistent across devices', async()=>{
  const records = new Map();
  const first=browser(records,'admin-a',['unit-206']);
  await first.window.StaySharedState.ready;
  const key='ap207-dashboard-expenses-v1:unit-206';
  first.localStorage.setItem(key,JSON.stringify({version:1,expenses:[{id:'expense-1',date:'2026-09-25',value:50}]}));
  await first.window.StaySharedState.flush();
  const phone=browser(records,'admin-a',['unit-206']);
  await phone.window.StaySharedState.ready;
  assert.equal(JSON.parse(phone.localStorage.getItem(key)).expenses[0].value,50);
  first.localStorage.setItem(key,JSON.stringify({version:1,expenses:[]}));
  await first.window.StaySharedState.flush();
  const laptop=browser(records,'admin-a',['unit-206']);
  await laptop.window.StaySharedState.ready;
  assert.equal(JSON.parse(laptop.localStorage.getItem(key)).expenses.length,0);
});

test('two administrators can add distinct records without overwriting each other', async()=>{
  const records=new Map();
  const a=browser(records,'admin-a',['unit-206']);
  const b=browser(records,'admin-b',['unit-206']);
  await Promise.all([a.window.StaySharedState.ready,b.window.StaySharedState.ready]);
  const key='system-control-test2-suite-v1';
  a.localStorage.setItem(key,JSON.stringify({extraRevenue:[{id:'a',propertyId:'unit-206',value:10}]}));
  b.localStorage.setItem(key,JSON.stringify({extraRevenue:[{id:'b',propertyId:'unit-206',value:20}]}));
  await Promise.all([a.window.StaySharedState.flush(),b.window.StaySharedState.flush()]);
  const laptop=browser(records,'super',[],'super_admin');
  await laptop.window.StaySharedState.ready;
  const values=JSON.parse(laptop.localStorage.getItem(key)).extraRevenue.map(x=>x.value).sort();
  assert.deepEqual(values,[10,20]);
});
