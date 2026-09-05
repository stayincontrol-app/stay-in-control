(()=>{'use strict';
/* Mobile stability guard: never leave an authenticated administrator on a blank canvas
   while the professional shell is being composed. No polling and no DOM observers. */
const AUTH='ap207-auth-profile-v1';
function profile(){try{return JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile||{}}catch{return{}}}
function css(){if(document.getElementById('t2AdminMobileStabilityCss'))return;const s=document.createElement('style');s.id='t2AdminMobileStabilityCss';s.textContent=`
@media(max-width:720px){
 body.test2.ap207-authenticated>.container{visibility:visible!important;opacity:1!important}
 body.test2.ap207-authenticated>.app-nav{visibility:visible!important}
 body.test2.ap207-authenticated:before{display:none!important;content:none!important}
 body.test2.ap207-authenticated main.container{min-height:100vh!important}
 body.test2.ap207-authenticated .t2-pro-mobilebar{transform:translateZ(0);backface-visibility:hidden}
}
`;document.head.append(s)}
function recover(){css();if(profile().role!=='admin'||!matchMedia('(max-width:720px)').matches)return;const main=document.querySelector('main.container');if(main){main.style.removeProperty('visibility');main.style.removeProperty('opacity')}const shell=document.querySelector('.t2-pro-mobilebar');if(shell)document.body.classList.add('t2-mobile-shell-stable')}
function boot(){recover();requestAnimationFrame(recover);setTimeout(recover,250);window.addEventListener('pageshow',recover);document.addEventListener('visibilitychange',()=>{if(!document.hidden)recover()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();