(()=>{'use strict';
const PRIMARY={home:'home',reservations:'reservations',calendar:'calendar',expenses:'expenses',reports:'reports'};
function setHash(route){try{history.replaceState(null,'',`${location.pathname}${location.search}#${route}`)}catch{}}
function showPrimary(screen){
  const panels=[...document.querySelectorAll('[data-screen-panel]')];
  if(!panels.length)return false;
  panels.forEach(p=>{p.hidden=p.getAttribute('data-screen-panel')!==screen});
  document.querySelectorAll('.app-nav [data-screen]').forEach(b=>b.classList.toggle('active',b.getAttribute('data-screen')===screen));
  document.querySelectorAll('.t2-pro-menu button[data-route],.t2-pro-mobilebar button[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===screen));
  const status=document.getElementById('appStatus');if(status&&/carregando|loading/i.test(status.textContent||''))status.hidden=true;
  setHash(screen==='home'?'home':screen);
  try{window.scrollTo({top:0,behavior:'auto'})}catch{}
  return true;
}
function clickExtra(name,hash){const b=document.querySelector(`#t2ExtraNav [data-t2="${name}"]`);if(!b)return false;try{b.click();setHash(hash||name);return true}catch{return false}}
function showProperties(){showPrimary('home');const p=document.getElementById('propertySettings');if(p){p.hidden=false;setHash('properties');try{p.scrollIntoView({block:'start',behavior:'auto'})}catch{}return true}return false}
function route(key){
  if(PRIMARY[key])return showPrimary(PRIMARY[key]);
  if(key==='properties')return showProperties();
  if(key==='contracts')return clickExtra('contracts','contracts');
  if(key==='integrations')return clickExtra('integrations','integrations');
  if(key==='publicity')return clickExtra('banners','publicity');
  if(key==='logs')return clickExtra('audit','logs');
  if(key==='extras')return clickExtra('operations','extras');
  if(key==='settings'){showPrimary('home');setHash('settings');setTimeout(()=>document.querySelector('.header-controls')?.scrollIntoView({block:'start',behavior:'auto'}),20);return true}
  if(key==='support'){document.querySelector('.t2-support')?.click();return true}
  if(key==='logout'){const b=[...document.querySelectorAll('button')].find(x=>/^(sair|logout|log out|salir|déconnexion|abmelden|esci|退出|ログアウト|로그아웃)$/i.test((x.textContent||'').trim()));if(b){b.click();return true}}
  return false;
}
function css(){if(document.getElementById('t2DesktopNavRecoveryCss'))return;const s=document.createElement('style');s.id='t2DesktopNavRecoveryCss';s.textContent='.t2-pro-sidebar,.t2-pro-menu,.t2-pro-menu button{pointer-events:auto!important}.t2-pro-sidebar{z-index:2147482000!important}.t2-pro-menu button{position:relative!important;z-index:2!important;cursor:pointer!important}';document.head.append(s)}
function install(){css();if(document.documentElement.dataset.t2DesktopNavRecoveryV2)return;document.documentElement.dataset.t2DesktopNavRecoveryV2='1';document.addEventListener('click',e=>{const b=e.target.closest?.('.t2-pro-menu button[data-route]');if(!b)return;const key=b.dataset.route;if(!key)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();route(key)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();