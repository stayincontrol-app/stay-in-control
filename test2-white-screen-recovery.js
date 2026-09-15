(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
let recovering=false,lastGood=0;
function authed(){try{const p=JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile;return !!(p&&p.active!==false)}catch{return false}}
function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return !el.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)!==0&&r.width>1&&r.height>1}
function shellVisible(){return visible(document.querySelector('.t2-pro-sidebar'))||visible(document.querySelector('.t2-pro-mobilebar'))}
function contentVisible(){const main=document.querySelector('main,.t2-pro-main');if(!main)return false;const candidates=[...main.querySelectorAll('.app-screen,#t2Suite > section,.t2-unified-group,#t2SuperDashboardV2')];return candidates.some(visible)}
function recoverCurrentRoute(){if(!authed()||recovering)return;recovering=true;try{
  document.body.classList.add('ap207-authenticated','test2');
  const main=document.querySelector('main,.t2-pro-main');if(main){main.hidden=false;main.style.removeProperty('display');main.style.removeProperty('visibility');main.style.removeProperty('opacity')}
  const suite=document.getElementById('t2Suite');if(suite){suite.hidden=false;suite.style.removeProperty('display')}
  const requested=(document.body.dataset.t2Route||(location.hash||'#home').slice(1)||'home');
  const fallback=document.querySelector(`.app-screen[data-screen-panel="${requested}"]`)||document.querySelector('.app-screen[data-screen-panel="home"]');
  if(window.Test2Unified?.show){window.Test2Unified.show(requested,false)}else if(fallback){fallback.hidden=false;fallback.classList.remove('t2-hidden');fallback.style.removeProperty('display');fallback.style.removeProperty('visibility');fallback.style.removeProperty('opacity')}
  const banner=document.querySelector('.scenic-banner');if(banner){banner.hidden=false;banner.style.setProperty('display','block','important');banner.style.setProperty('visibility','visible','important');banner.style.setProperty('opacity','1','important')}
  window.dispatchEvent(new CustomEvent('stay:blank-screen-recovered'));
}finally{requestAnimationFrame(()=>{recovering=false;lastGood=Date.now()})}}
function check(){if(!authed())return;if(contentVisible()){lastGood=Date.now();return}if(Date.now()-lastGood<250)return;recoverCurrentRoute()}
function boot(){lastGood=Date.now();requestAnimationFrame(check);setTimeout(check,120);setTimeout(check,350);setTimeout(check,800);window.addEventListener('pageshow',()=>{lastGood=0;requestAnimationFrame(check)});window.addEventListener('focus',()=>setTimeout(check,60));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(check,60)});['stay:unified-navigation','stay:navigation','stay:scope-change'].forEach(e=>window.addEventListener(e,()=>setTimeout(check,80)));const obs=new MutationObserver(()=>{if(!recovering)queueMicrotask(check)});obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style']});setInterval(check,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
