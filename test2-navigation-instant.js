(()=>{'use strict';
const PRIMARY={home:'home',reservations:'reservations',calendar:'calendar',expenses:'expenses',reports:'reports'};
const EXTRA={properties:'t2ProfessionalProperties',extras:'t2Operations',contracts:'t2Contracts',integrations:'t2Integrations',owners:'t2ProfessionalOwners',admins:'t2ProfessionalAdmins',plans:'t2ProfessionalPlans',courtesy:'t2CourtesyPanel',logs:'t2Audit',publicity:'t2Banners',settings:'t2ProfessionalSettings',analytics:'t2Analytics'};
const VALID=new Set([...Object.keys(PRIMARY),...Object.keys(EXTRA),'support']);
function banner(){const b=document.querySelector('.scenic-banner');if(b){b.hidden=false;b.style.display='block';b.style.visibility='visible';b.style.opacity='1'}}
function hideAll(){document.querySelectorAll('.app-screen').forEach(x=>{x.hidden=true;x.style.display='none'});const suite=document.getElementById('t2Suite');if(suite){suite.hidden=false;suite.querySelectorAll(':scope > section').forEach(x=>{x.hidden=true;x.style.display='none'})}const ps=document.getElementById('propertySettings');if(ps){ps.hidden=true;ps.style.display='none'}const support=document.getElementById('t2RouteSupport');if(support){support.hidden=true;support.style.display='none'}}
function active(key){document.querySelectorAll('.t2-pro-menu button[data-route],.t2-pro-mobilebar button[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===key))}
function show(key){if(!VALID.has(key))return false;hideAll();banner();let target=null;if(PRIMARY[key]){target=document.querySelector(`.app-screen[data-screen-panel="${PRIMARY[key]}"]`)}else if(EXTRA[key]){target=document.getElementById(EXTRA[key]);const suite=document.getElementById('t2Suite');if(suite)suite.hidden=false}else if(key==='support'){target=document.getElementById('t2RouteSupport')}
if(!target&&key==='properties')target=document.getElementById('propertySettings');
if(!target)return false;target.hidden=false;target.style.display='';active(key);history.replaceState(null,'',`#${key==='home'?'home':key}`);window.scrollTo(0,0);return true}
function intercept(e){const b=e.target.closest?.('.t2-pro-menu button[data-route],.t2-pro-mobilebar button[data-route]');if(!b)return;const key=b.dataset.route;if(key==='logout'||!VALID.has(key))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();show(key)}
document.addEventListener('click',intercept,true);
window.addEventListener('pageshow',()=>{const h=(location.hash||'#home').slice(1);if(VALID.has(h))requestAnimationFrame(()=>show(h))});
window.Test2InstantNavigation={show};
})();