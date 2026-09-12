(()=>{'use strict';
if(window.__T2_NAV_HEALTH__)return;window.__T2_NAV_HEALTH__=true;
const ROUTES=new Set(['home','properties','reservations','calendar','expenses','reports','contracts','admins','plans','publicity','logs','settings','analytics']);
const ALIAS={owners:'properties',extras:'expenses',integrations:'contracts',support:'settings'};
const EXTRA_TARGET={properties:'t2UnifiedProperties',expenses:'t2UnifiedFinancial',contracts:'t2UnifiedContracts',settings:'t2UnifiedSettings',admins:'t2ProfessionalAdmins',plans:'t2ProfessionalPlans',publicity:'t2Banners',logs:'t2Audit',analytics:'t2Analytics'};
const PRIMARY={home:'home',reservations:'reservations',calendar:'calendar',reports:'reports'};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],$=id=>document.getElementById(id);
function normalize(r){return ALIAS[r]||r}
function markActive(route){const k=normalize(route);qa('.t2-pro-menu button[data-route],.t2-pro-mobilebar button[data-route]').forEach(b=>b.classList.toggle('active',normalize(b.dataset.route)===k));document.body.dataset.t2Route=k}
function ensureUnifiedRuntime(){if(window.Test2Unified?.show)return; if(document.querySelector('script[data-t2-nav-runtime]'))return;const s=document.createElement('script');s.src='./test2-unified-runtime.js?v=20260912-navfix';s.async=false;s.dataset.t2NavRuntime='1';document.body.append(s)}
function showFallback(route){const k=normalize(route);if(PRIMARY[k]){const b=q(`.app-nav [data-screen="${PRIMARY[k]}"]`);if(b){b.click();markActive(k);return true}}
const target=$(EXTRA_TARGET[k]);if(!target)return false;
const roots=[...qa('.app-screen'),...qa('#t2Suite > section'),...qa('main.container > section.panel')];roots.forEach(n=>{if(n!==target&&!n.contains(target)){n.hidden=true;n.style.display='none'}});
let p=target;while(p&&p!==document.body){p.hidden=false;p.style.removeProperty('display');p=p.parentElement}
target.hidden=false;target.style.removeProperty('display');
const banner=q('.scenic-banner');if(banner){banner.hidden=false;banner.style.setProperty('display','block','important')}
markActive(k);history.replaceState(null,'',`#${k}`);window.scrollTo({top:0,left:0,behavior:'auto'});window.dispatchEvent(new CustomEvent('stay:unified-navigation',{detail:{route:k}}));return true}
function go(route,attempt=0){const k=normalize(route);try{if(window.Test2Unified?.show?.(k,true)){markActive(k);return true}}catch(e){console.error('Unified navigation failed',e)}
if(attempt===0)ensureUnifiedRuntime();if(attempt<20){setTimeout(()=>go(k,attempt+1),75);return true}return showFallback(k)}
function onClick(e){const b=e.target.closest?.('.t2-pro-menu button[data-route],.t2-pro-mobilebar button[data-route]');if(!b)return;const raw=b.dataset.route,k=normalize(raw);if(raw==='logout'||raw==='more'||!ROUTES.has(k))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();go(k,0)}
function boot(){ensureUnifiedRuntime();document.addEventListener('click',onClick,true);const initial=normalize((location.hash||'#home').slice(1));markActive(ROUTES.has(initial)?initial:'home');setTimeout(()=>{const k=normalize((location.hash||'#home').slice(1));if(ROUTES.has(k))markActive(k)},800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();