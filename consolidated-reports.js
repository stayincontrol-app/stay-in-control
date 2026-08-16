(() => {
'use strict';
const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const RES='ap207-dashboard-reservations-v1', EXP='ap207-dashboard-expenses-v1', PROPS='ap207-dashboard-properties-v1', AUTH='ap207-auth-profile-v1';
function read(k,fallback){try{return JSON.parse(localStorage.getItem(k)||'null')||fallback}catch{return fallback}}
function currentProfile(){return read(AUTH,{profile:{role:'super_admin',name:'Super Administrador'}}).profile||{role:'super_admin'};}
function properties(){const p=read(PROPS,null);if(p?.properties)return p.properties;return [];}
function records(key,id,field){const p=read(`${key}:${id}`,null);return Array.isArray(p?.[field])?p[field]:[];}
function calcProperty(p,year,month){
  const prefix=`${year}-${String(month).padStart(2,'0')}`;
  const rs=records(RES,p.id,'reservations').filter(r=>r.status!=='Cancelada'&&String(r.checkIn||'').startsWith(prefix));
  const es=records(EXP,p.id,'expenses').filter(e=>String(e.date||'').startsWith(prefix));
  let gross=0,cleaning=0,commission=0,net=0,nights=0;
  rs.forEach(r=>{const g=Number(r.gross)||0,c=Number(r.cleaningFee??r.cleaning)||0,rate=Number(r.commissionRate)||0,com=(g-c)*rate/100;gross+=g;cleaning+=c;commission+=com;net+=g-c-com;try{nights+=(new Date(r.checkOut)-new Date(r.checkIn))/86400000}catch{}});
  const expenses=es.reduce((s,e)=>s+(Number(e.value)||0),0);
  return{p,reservations:rs.length,nights,gross,cleaning,commission,expenses,payout:net-expenses};
}
function allowed(props,profile){if(profile.role==='super_admin')return props;const cached=read(AUTH,{propertyIds:[]});const ids=new Set(cached.propertyIds||[]);return props.filter(p=>ids.has(p.id));}
function ownerKey(p){return String(p.ownerName||'Sem proprietário').trim().toLowerCase();}
function totals(rows){const keys=['reservations','nights','gross','cleaning','commission','expenses','payout'];return keys.reduce((o,k)=>(o[k]=rows.reduce((s,r)=>s+(Number(r[k])||0),0),o),{});}
function expense(v){return v?`− ${money.format(v)}`:money.format(0);}
function groupOwners(rows){const map=new Map();rows.forEach(r=>{const k=ownerKey(r.p);if(!map.has(k))map.set(k,{name:r.p.ownerName||'Sem proprietário',rows:[]});map.get(k).rows.push(r);});return[...map.values()].map(g=>({...g,total:totals(g.rows)}));}
function inject(){
  const reports=document.querySelector('[data-screen-panel="reports"]');
  if(!reports||document.getElementById('consolidatedReports'))return;
  const section=document.createElement('section');section.id='consolidatedReports';section.className='panel monthly-report consolidated-report no-print';
  section.innerHTML=`<div class="report-toolbar"><div><p class="eyebrow">Visão consolidada</p><h2 id="consolidatedTitle">Relatório geral</h2><p id="consolidatedHelp">Os valores sempre acompanham a propriedade, o proprietário e o período selecionados.</p></div><div class="report-filters"><div class="field"><label for="consolidatedScope">Visualizar</label><select id="consolidatedScope"></select></div><button class="button button-primary" id="refreshConsolidated" type="button">Atualizar</button></div></div><div class="report-metrics"><div><small>Propriedades</small><strong id="cProperties">0</strong></div><div><small>Reservas</small><strong id="cReservations">0</strong></div><div><small>Valor bruto</small><strong id="cGross">R$ 0,00</strong></div><div><small>Comissão da administração</small><strong id="cCommission">R$ 0,00</strong></div><div><small>Despesas</small><strong id="cExpenses">R$ 0,00</strong></div><div><small>Saldo líquido dos proprietários</small><strong id="cPayout">R$ 0,00</strong></div></div><div id="ownerTotals"></div><div id="consolidatedRows" class="consolidated-rows"></div><section id="stayRevenue" hidden><h3>Stay in Control</h3><p class="admin-intro">Relatório de mensalidades do sistema. Os valores aparecerão automaticamente quando ativarmos os planos e pagamentos.</p><div class="report-metrics"><div><small>Mensalidades recebidas</small><strong>R$ 0,00</strong></div><div><small>Contas em teste grátis</small><strong>0</strong></div><div><small>Cortesias</small><strong>0</strong></div><div><small>Pagamentos pendentes</small><strong>0</strong></div></div></section>`;
  reports.prepend(section);setup(section);
}
function setup(section){
  const profile=currentProfile(),props=allowed(properties(),profile),scope=section.querySelector('#consolidatedScope');
  const ownerNames=[...new Map(props.map(p=>[ownerKey(p),p.ownerName||'Sem proprietário'])).entries()];
  scope.innerHTML='<option value="all">Todas as propriedades</option>'+ownerNames.map(([k,n])=>`<option value="owner:${encodeURIComponent(k)}">${n} — todas as unidades</option>`).join('')+props.map(p=>`<option value="property:${p.id}">${p.ownerName||'Proprietário'} — ${p.name||p.unit||'Unidade'}</option>`).join('');
  if(profile.role==='owner')section.querySelector('#consolidatedTitle').textContent='Relatório das minhas propriedades';
  else if(profile.role==='admin')section.querySelector('#consolidatedTitle').textContent='Relatório geral da administradora';
  else{section.querySelector('#consolidatedTitle').textContent='Relatório geral — Super Administrador';section.querySelector('#stayRevenue').hidden=false;}
  const render=()=>{
    const now=new Date(),month=Number(document.getElementById('reportMonth')?.value)||now.getMonth()+1,year=Number(document.getElementById('reportYear')?.value)||now.getFullYear();
    const allRows=props.map(p=>calcProperty(p,year,month));
    let rows=allRows;
    if(scope.value.startsWith('property:')){const id=scope.value.slice(9);rows=allRows.filter(r=>r.p.id===id);}
    else if(scope.value.startsWith('owner:')){const k=decodeURIComponent(scope.value.slice(6));rows=allRows.filter(r=>ownerKey(r.p)===k);}
    const total=totals(rows);
    section.querySelector('#cProperties').textContent=rows.length;
    section.querySelector('#cReservations').textContent=total.reservations;
    section.querySelector('#cGross').textContent=money.format(total.gross);
    section.querySelector('#cCommission').textContent=money.format(total.commission);
    section.querySelector('#cExpenses').textContent=expense(total.expenses);
    section.querySelector('#cPayout').textContent=money.format(total.payout);
    const groups=groupOwners(rows);
    section.querySelector('#ownerTotals').innerHTML=groups.map(g=>`<article class="panel" style="margin:18px 0;padding:18px"><p class="eyebrow">Total do proprietário</p><h3 style="margin:4px 0 14px">${g.name}</h3><div class="report-metrics"><div><small>Unidades</small><strong>${g.rows.length}</strong></div><div><small>Reservas</small><strong>${g.total.reservations}</strong></div><div><small>Valor bruto</small><strong>${money.format(g.total.gross)}</strong></div><div><small>Comissão</small><strong>${money.format(g.total.commission)}</strong></div><div><small>Despesas</small><strong>${expense(g.total.expenses)}</strong></div><div><small>Saldo líquido</small><strong>${money.format(g.total.payout)}</strong></div></div></article>`).join('');
    section.querySelector('#consolidatedRows').innerHTML=rows.map(r=>`<article class="consolidated-row"><div><small>Proprietário</small><strong>${r.p.ownerName||'—'}</strong></div><div><small>Unidade</small><strong>${r.p.name||r.p.unit||'—'}</strong></div><div><small>Reservas</small><strong>${r.reservations}</strong></div><div><small>Bruto</small><strong>${money.format(r.gross)}</strong></div><div><small>Limpeza</small><strong>${r.cleaning?`− ${money.format(r.cleaning)}`:money.format(0)}</strong></div><div><small>Comissão</small><strong>${r.commission?`− ${money.format(r.commission)}`:money.format(0)}</strong></div><div><small>Despesas</small><strong>${expense(r.expenses)}</strong></div><div><small>Saldo líquido</small><strong>${money.format(r.payout)}</strong></div></article>`).join('')||'<p>Nenhuma propriedade disponível neste perfil.</p>';
  };
  scope.addEventListener('change',render);section.querySelector('#refreshConsolidated').addEventListener('click',render);document.getElementById('reportMonth')?.addEventListener('change',render);document.getElementById('reportYear')?.addEventListener('change',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,300));else setTimeout(inject,300);
})();