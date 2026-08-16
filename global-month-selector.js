(()=>{'use strict';
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function dispatch(el){if(!el)return;el.dispatchEvent(new Event('change',{bubbles:true}));}
function currentFromLabel(){const label=document.getElementById('monthLabel');const txt=(label?.textContent||'').trim();const m=MONTHS.findIndex(x=>txt.toLowerCase().includes(x.toLowerCase()));const y=(txt.match(/20\d{2}/)||[])[0];const now=new Date();return{month:m>=0?m+1:now.getMonth()+1,year:y?Number(y):now.getFullYear()};}
function filterVisibleCards(month,year){
 const panel=document.querySelector('[data-screen-panel="reservations"]');if(panel&&!panel.hidden){panel.querySelectorAll('#reservations .booking').forEach(card=>{const text=card.textContent||'';const dates=[...text.matchAll(/(\d{2})\/(\d{2})\/(20\d{2})/g)];if(!dates.length){card.style.display='';return;}const d=dates[0];card.style.display=(Number(d[2])===month&&Number(d[3])===year)?'':'none';});}
 const exp=document.querySelector('[data-screen-panel="expenses"]');if(exp&&!exp.hidden){exp.querySelectorAll('#expenses .expense-item,#expenses .booking').forEach(card=>{const text=card.textContent||'';const d=text.match(/(\d{2})\/(\d{2})\/(20\d{2})/);if(!d){card.style.display='';return;}card.style.display=(Number(d[2])===month&&Number(d[3])===year)?'':'none';});}
}
function sync(month,year){
 localStorage.setItem('stay-control-selected-period',JSON.stringify({month,year}));
 const cm=document.getElementById('calendarMonth'),cy=document.getElementById('calendarYear');if(cm){cm.value=String(month);dispatch(cm);}if(cy){cy.value=String(year);dispatch(cy);}
 const rm=document.getElementById('reportMonth'),ry=document.getElementById('reportYear');if(rm){rm.value=String(month);dispatch(rm);}if(ry){ry.value=String(year);dispatch(ry);}
 const label=document.getElementById('monthLabel');if(label)label.textContent=`${MONTHS[month-1]} ${year}`;
 filterVisibleCards(month,year);
}
function restoreHomeAllData(){
 const home=document.querySelector('[data-screen-panel="home"]');if(!home||home.hidden)return;
 document.querySelectorAll('#reservations .booking,#expenses .expense-item,#expenses .booking').forEach(card=>card.style.display='');
 if(typeof window.renderAll==='function'){try{window.renderAll();}catch(e){}}
 window.dispatchEvent(new CustomEvent('staycontrol:home-show-all'));
}
function updateVisibility(){const wrap=document.querySelector('.global-period-selector');if(!wrap)return;const home=document.querySelector('[data-screen-panel="home"]');const homeVisible=home&&!home.hidden;wrap.style.display=homeVisible?'none':'';if(homeVisible)setTimeout(restoreHomeAllData,0);}
function inject(){
 if(document.getElementById('globalMonthSelector'))return;
 const header=document.querySelector('.header-controls');const label=document.getElementById('monthLabel');if(!header||!label)return;
 label.style.display='none';
 const wrap=document.createElement('div');wrap.className='global-period-selector';wrap.innerHTML=`<label for="globalMonthSelector">Selecionar mês</label><div class="global-period-row"><select id="globalMonthSelector" aria-label="Selecionar mês">${MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select><select id="globalYearSelector" aria-label="Selecionar ano"></select></div>`;
 label.insertAdjacentElement('afterend',wrap);
 const ms=wrap.querySelector('#globalMonthSelector'),ys=wrap.querySelector('#globalYearSelector');const now=new Date();for(let y=now.getFullYear()-3;y<=now.getFullYear()+3;y++){const o=document.createElement('option');o.value=o.textContent=String(y);ys.append(o);}
 let initial=currentFromLabel();try{const s=JSON.parse(localStorage.getItem('stay-control-selected-period')||'null');if(s?.month&&s?.year)initial=s;}catch{}
 ms.value=String(initial.month);if(![...ys.options].some(o=>Number(o.value)===Number(initial.year))){const o=document.createElement('option');o.value=o.textContent=String(initial.year);ys.append(o);}ys.value=String(initial.year);
 const go=()=>sync(Number(ms.value),Number(ys.value));ms.addEventListener('change',go);ys.addEventListener('change',go);
 document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(updateVisibility,0)));
 const screenObserver=new MutationObserver(updateVisibility);document.querySelectorAll('[data-screen-panel]').forEach(panel=>screenObserver.observe(panel,{attributes:true,attributeFilter:['hidden']}));
 updateVisibility();
}
const css=document.createElement('style');css.textContent=`.global-period-selector{width:100%;margin-top:8px}.global-period-selector>label{display:block;font-weight:700;color:#5f6b82;margin:0 0 7px}.global-period-row{display:grid;grid-template-columns:1fr 112px;gap:10px}.global-period-row select{width:100%;min-height:52px;border:1px solid #d7dde7;border-radius:16px;padding:0 16px;background:rgba(255,255,255,.94);font:inherit;color:#172033}.global-period-row select:focus{outline:3px solid rgba(59,130,246,.22);border-color:#60a5fa}@media(max-width:520px){.global-period-row{grid-template-columns:1fr 105px}.global-period-row select{min-height:50px;font-size:1rem}}`;document.head.append(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,900));else setTimeout(inject,900);
})();