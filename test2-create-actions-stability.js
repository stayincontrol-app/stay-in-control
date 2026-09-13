(()=>{'use strict';
function openOwner(){try{if(window.Test2OwnerModalV2?.open){window.Test2OwnerModalV2.open();return true}if(window.Test2OpenOwnerForm){window.Test2OpenOwnerForm();return true}}catch{}return false}
function onClick(e){const b=e.target.closest?.('[data-t2uc-action="new-owner"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(!openOwner()){let n=0;const t=setInterval(()=>{n++;if(openOwner()||n>=20)clearInterval(t)},100)}}
function boot(){document.addEventListener('click',onClick,true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();})();