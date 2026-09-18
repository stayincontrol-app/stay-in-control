(()=>{'use strict';
const STYLE_ID='t2BannerDisplayFixCss',OVERLAY_ID='t2SponsorMirrorBanner';
function css(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.scenic-banner{position:relative!important;overflow:hidden!important;background:#e9eef5!important}
.scenic-banner::before,.scenic-banner::after{display:none!important;content:none!important}
.scenic-banner .t2-scenic-ad-overlay,#t2RealBannerOverlay,#t2DeepBanner27Overlay{display:none!important}
#${OVERLAY_ID}{position:absolute!important;inset:0!important;z-index:2147481000!important;background:#fff center center/contain no-repeat!important;opacity:1!important;display:block!important;border-radius:inherit!important;pointer-events:none!important}
#${OVERLAY_ID}.is-contain{background-size:contain!important;background-position:center center!important;background-repeat:no-repeat!important;background-color:#fff!important}
`;document.head.append(s)}
function host(){const h=document.querySelector('.scenic-banner');if(!h)return null;let o=document.getElementById(OVERLAY_ID);if(!o){o=document.createElement('div');o.id=OVERLAY_ID;h.append(o)}else if(o.parentElement!==h)h.append(o);return o}
function sponsorImage(){const link=document.querySelector('#t2FloatingSponsor .t2-float-link');if(!link)return'';const inline=link.style.backgroundImage;if(inline&&inline!=='none')return inline;const computed=getComputedStyle(link).backgroundImage;return computed&&computed!=='none'?computed:''}
function mirror(){const o=host();if(!o)return;const bg=sponsorImage();if(bg){o.style.setProperty('background-image',bg,'important');o.classList.add('is-contain')} }
let obs=null,timer=null;
function watch(){const s=document.getElementById('t2FloatingSponsor');if(!s)return false;if(obs)obs.disconnect();obs=new MutationObserver(()=>requestAnimationFrame(mirror));obs.observe(s,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});mirror();return true}
function boot(){css();mirror();let tries=0;timer=setInterval(()=>{tries++;if(watch()||tries>40)clearInterval(timer)},250);window.addEventListener('t2-banners-updated',()=>setTimeout(mirror,0));window.addEventListener('stay:navigation',()=>requestAnimationFrame(mirror));window.addEventListener('stay:unified-navigation',()=>requestAnimationFrame(mirror));window.addEventListener('pageshow',()=>setTimeout(mirror,0));document.addEventListener('visibilitychange',()=>{if(!document.hidden)mirror()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
