(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||f}catch{return f}};
function role(){return read(AUTH,{})?.profile?.role||'owner'}
function moveOverviewToTop(){const home=document.querySelector('[data-screen-panel="home"]'),panel=document.getElementById('homeScopePanel');if(!home||!panel)return;const heading=home.querySelector('.screen-heading');if(heading&&heading.nextElementSibling!==panel)heading.insertAdjacentElement('afterend',panel)}
function removePlanCard(){document.querySelectorAll('.t2-pro-plan,.t2-plan-card,[data-plan-card]').forEach(x=>x.remove());document.querySelectorAll('.t2-pro-sidebar *').forEach(x=>{const t=(x.textContent||'').trim().toLowerCase();if((t.includes('seu plano')||t.includes('your plan')||t.includes('tu plan'))&&x.querySelector('button,a')){const card=x.closest('.t2-pro-plan,.t2-plan-card,section,div');if(card&&card!==document.querySelector('.t2-pro-sidebar'))card.remove()}})}
function dedupeRecurring(){const summary=document.querySelector('.summary-list');if(!summary)return;const rows=[...summary.querySelectorAll('.line')].filter(x=>/despesas recorrentes/i.test(x.querySelector('dt')?.textContent||''));rows.slice(1).forEach(x=>x.remove())}
function fixIncomeButton(){const b=document.querySelector('[data-t2uc-action="new-income"]');if(!b||b.dataset.safeIncome==='1')return;b.dataset.safeIncome='1';b.addEventListener('click',()=>{setTimeout(()=>{if(document.getElementById('t2UnifiedIncomeDialog'))return;const form=document.getElementById('t2ExtraRevenueForm');if(!form)return;window.dispatchEvent(new CustomEvent('stay:safe-income-retry'));},40)})}
function apply(){moveOverviewToTop();removePlanCard();dedupeRecurring();fixIncomeButton()}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
function boot(){apply();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});window.addEventListener('stay:unified-navigation',()=>setTimeout(apply,30));setTimeout(apply,400);setTimeout(apply,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();