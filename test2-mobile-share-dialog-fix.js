(()=>{'use strict';
function installCss(){if(document.getElementById('t2MobileShareDialogFixCss'))return;const s=document.createElement('style');s.id='t2MobileShareDialogFixCss';s.textContent=`@media(max-width:600px){
.stay-share-modal{align-items:flex-start!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;padding:max(8px,env(safe-area-inset-top)) 8px calc(86px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important}
.stay-share-dialog{width:100%!important;max-width:100%!important;max-height:calc(100dvh - 104px - env(safe-area-inset-bottom))!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;border-radius:16px!important;padding:12px!important;box-sizing:border-box!important;position:relative!important}
.stay-share-head{position:sticky!important;top:0!important;z-index:20!important;background:#fff!important;margin:0 0 10px!important;padding:4px 0 10px!important;border-bottom:1px solid #eef2f7!important}
.stay-share-head h3{font-size:18px!important;line-height:1.2!important}
.stay-share-close{display:grid!important;place-items:center!important;flex:0 0 44px!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;font-size:26px!important;line-height:1!important;position:relative!important;z-index:21!important;cursor:pointer!important;touch-action:manipulation!important}
.stay-res-card{padding:13px!important;border-radius:14px!important}
.stay-res-title{font-size:20px!important;margin:9px 0 12px!important}
.stay-res-grid,.stay-res-money{gap:7px!important}
.stay-res-item{padding:9px!important;border-radius:10px!important}
.stay-res-item small{font-size:13px!important;margin-bottom:3px!important}
.stay-res-item strong{font-size:15px!important;line-height:1.25!important}
.stay-res-item.money strong{font-size:16px!important}
.stay-res-foot{font-size:11px!important;margin-top:10px!important;padding-top:9px!important}
.stay-share-actions{grid-template-columns:1fr!important;gap:7px!important;margin-top:10px!important;padding-bottom:4px!important}
.stay-share-actions button{min-height:44px!important;padding:10px!important;touch-action:manipulation!important}
.stay-share-note{font-size:11px!important;margin:7px 2px 2px!important;padding-bottom:max(4px,env(safe-area-inset-bottom))!important}
}
`;document.head.append(s)}
function resetModal(modal){if(!matchMedia('(max-width:600px)').matches||!modal)return;requestAnimationFrame(()=>{modal.scrollTop=0;const d=modal.querySelector('.stay-share-dialog');if(d)d.scrollTop=0})}
function boot(){installCss();document.querySelectorAll('.stay-share-modal').forEach(resetModal);new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('.stay-share-modal'))resetModal(n);n.querySelectorAll?.('.stay-share-modal').forEach(resetModal)}}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();