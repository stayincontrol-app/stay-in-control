(()=>{'use strict';
/*
 * Test 2 support policy:
 * - the old ticket/chamado center is retired for every role;
 * - technical support stays on the WhatsApp entry already provided by test2.js;
 * - administrator desktop/laptop uses the full professional canvas, matching
 *   the width behavior of the Super Administrator experience.
 */
const AUTH='ap207-auth-profile-v1';
function profile(){try{return JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile||{}}catch{return{}}}
function removeLegacyTickets(){
  document.getElementById('supportCenter')?.remove();
  document.getElementById('supportUnreadBadge')?.remove();
  document.querySelectorAll('.support-center,.support-floating-badge').forEach(x=>x.remove());
}
function installCss(){
  if(document.getElementById('t2SupportPolicyCss'))return;
  const s=document.createElement('style');
  s.id='t2SupportPolicyCss';
  s.textContent=`
    #supportCenter,#supportUnreadBadge,.support-center,.support-floating-badge{display:none!important}
    @media(min-width:981px){
      body.t2-admin-full main.container{width:100%!important;max-width:none!important;margin:0!important;padding:24px 28px 110px 266px!important;box-sizing:border-box!important}
      body.t2-admin-full .scenic-banner{display:block!important;width:100%!important;max-width:none!important;height:255px!important;min-height:255px!important;max-height:255px!important;background-size:cover!important;background-position:center!important}
      body.t2-admin-full .app-screen,body.t2-admin-full #t2Suite,body.t2-admin-full #t2Suite>section,body.t2-admin-full .monthly-report,body.t2-admin-full .property-settings{width:100%!important;max-width:none!important}
    }
    @media(min-width:721px) and (max-width:980px){
      body.t2-admin-full main.container{width:100%!important;max-width:none!important;margin:0!important;padding:24px 24px 105px 225px!important;box-sizing:border-box!important}
      body.t2-admin-full .scenic-banner{display:block!important;width:100%!important;max-width:none!important;height:235px!important;min-height:235px!important;max-height:235px!important;background-size:cover!important;background-position:center!important}
      body.t2-admin-full .app-screen,body.t2-admin-full #t2Suite,body.t2-admin-full #t2Suite>section{width:100%!important;max-width:none!important}
    }
  `;
  document.head.append(s);
}
function applyRole(){
  const isAdmin=profile().role==='admin';
  document.body.classList.toggle('t2-admin-full',isAdmin);
  removeLegacyTickets();
}
function boot(){installCss();applyRole();window.addEventListener('pageshow',applyRole);window.addEventListener('stay:navigation',removeLegacyTickets)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
