(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
function role(){try{return JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile?.role||'owner'}catch{return'owner'}}
function anchor(home){const top=home.querySelector('.t2-pro-topbar');if(top)return top.nextElementSibling;const banner=[...home.children].find(x=>x.classList?.contains('scenic-banner'));return banner?banner.nextElementSibling:home.firstElementChild}
function putAfterBanner(home,node){if(!node)return;const a=anchor(home);if(node.parentNode!==home||node!==a)home.insertBefore(node,a);node.hidden=false;node.style.display=''}
function place(){const r=role();if(!['admin','super_admin'].includes(r))return;const home=document.querySelector('.app-screen[data-screen-panel="home"]');if(!home)return;if(r==='admin')putAfterBanner(home,document.getElementById('homeScopePanel'));if(r==='super_admin')putAfterBanner(home,document.getElementById('t2SuperDashboardV2'));document.body.classList.add('t2-overview-positioned')}
function boot(){place();window.addEventListener('stay:navigation',e=>{if(e.detail?.route==='home')requestAnimationFrame(place)});window.addEventListener('stay:scope-change',()=>requestAnimationFrame(place));window.addEventListener('stay:screens-organized',()=>requestAnimationFrame(place));const home=document.querySelector('.app-screen[data-screen-panel="home"]');if(home){let tries=0;const o=new MutationObserver(()=>{place();if(++tries>40||((role()==='admin'&&document.getElementById('homeScopePanel'))||(role()==='super_admin'&&document.getElementById('t2SuperDashboardV2'))))o.disconnect()});o.observe(home,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
