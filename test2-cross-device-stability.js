(()=>{'use strict';
const STYLE='t2CrossDeviceStabilityCss';
function installCss(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
html,body{max-width:100%;overflow-x:hidden}
.test2.ap207-authenticated main.container{width:100%!important;max-width:100%!important;min-width:0!important}
.test2.ap207-authenticated .app-screen,.test2.ap207-authenticated .panel,.test2.ap207-authenticated .property-settings,.test2.ap207-authenticated .monthly-report{min-width:0!important;max-width:100%!important}
.test2.ap207-authenticated .scenic-banner{display:block!important;position:relative!important;width:100%!important;height:clamp(240px,30vw,410px)!important;min-height:240px!important;max-height:410px!important;margin:0 0 18px!important;border-radius:18px!important;overflow:hidden!important;background:#e8eef5!important}
.test2.ap207-authenticated .scenic-banner> *:not(#t2New25Overlay){visibility:hidden!important}
.test2.ap207-authenticated #t2New25Overlay{visibility:visible!important;display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:2147481200!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important;border-radius:inherit!important}
#t2SponsorMirrorBanner,#t2RealBannerOverlay,#t2DeepBanner27Overlay,.t2-scenic-ad-overlay{display:none!important}
.test2.ap207-authenticated .reservation-form,.test2.ap207-authenticated form{max-width:100%!important}
.test2.ap207-authenticated button,.test2.ap207-authenticated input,.test2.ap207-authenticated select,.test2.ap207-authenticated textarea{max-width:100%}
.test2.ap207-authenticated .t2v2-layout,.test2.ap207-authenticated .t2v2-content,.test2.ap207-authenticated .t2v2-table-scroll{min-width:0!important;max-width:100%!important}
@media(min-width:721px) and (max-width:1180px){.test2.ap207-authenticated main.container{padding-left:225px!important;padding-right:20px!important}.t2-pro-sidebar{width:205px!important}.test2.ap207-authenticated .scenic-banner{height:clamp(230px,27vw,330px)!important}}
@media(max-width:720px){.test2.ap207-authenticated main.container{padding:16px 12px 96px!important}.test2.ap207-authenticated .scenic-banner{height:240px!important;min-height:240px!important;border-radius:16px!important}}
`;
document.head.append(s)}
function cleanLegacyBanner(){const h=document.querySelector('.scenic-banner');if(!h)return;const live=document.getElementById('t2New25Overlay');if(live&&live.parentElement!==h)h.append(live);document.getElementById('t2SponsorMirrorBanner')?.remove()}
function normalize(){installCss();cleanLegacyBanner();document.querySelectorAll('.t2-pro-brand strong').forEach(x=>x.textContent='Stay in Control');document.querySelectorAll('.t2-pro-brand small').forEach(x=>x.textContent='')}
function boot(){normalize();const mo=new MutationObserver(()=>requestAnimationFrame(normalize));mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',normalize,{passive:true});window.addEventListener('orientationchange',normalize,{passive:true});window.addEventListener('pageshow',normalize);window.addEventListener('stay:unified-navigation',()=>requestAnimationFrame(normalize));document.addEventListener('visibilitychange',()=>{if(!document.hidden)normalize()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();