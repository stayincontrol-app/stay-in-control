(()=>{'use strict';
const STYLE_ID='t2BannerDisplayFixCss';
function css(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.scenic-banner{position:relative!important;overflow:hidden!important;background:#e9eef5!important}
.scenic-banner::before,.scenic-banner::after{display:none!important;content:none!important}
.scenic-banner .t2-scenic-ad-overlay,#t2RealBannerOverlay,#t2DeepBanner27Overlay,#t2SponsorMirrorBanner{display:none!important}
#t2New25Overlay{position:absolute!important;inset:0!important;z-index:2147481200!important;display:block!important;visibility:visible!important;background-position:center center!important;background-size:cover!important;background-repeat:no-repeat!important;border-radius:inherit!important}
`;document.head.append(s)}
function cleanup(){document.getElementById('t2SponsorMirrorBanner')?.remove()}
function boot(){css();cleanup();const mo=new MutationObserver(()=>cleanup());mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('stay:unified-navigation',()=>requestAnimationFrame(cleanup));window.addEventListener('pageshow',cleanup);document.addEventListener('visibilitychange',()=>{if(!document.hidden)cleanup()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();