(()=>{'use strict';
const NEW_PROPERTY=/^\s*\+?\s*(nova propriedade|new property|nueva propiedad|nouvelle propriété|neues objekt|nuova proprietà|新增房产|新しい物件|새 숙소)\s*$/i;
function openModal(){if(window.Test2PropertyModalV2?.open){const ok=window.Test2PropertyModalV2.open();if(ok!==false)return true}let tries=0;const t=setInterval(()=>{tries++;if(window.Test2PropertyModalV2?.open){const ok=window.Test2PropertyModalV2.open();if(ok!==false)clearInterval(t)}if(tries>=30)clearInterval(t)},100);return true}
function isNewPropertyTarget(target){const el=target?.closest?.('button,a');if(!el)return false;if(el.dataset?.t2ucAction==='new-property'||el.id==='newPropertyButton')return true;return NEW_PROPERTY.test((el.textContent||'').trim())}
function capture(e){if(!isNewPropertyTarget(e.target))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openModal()}
function hideLegacyForm(){const f=document.getElementById('newPropertyForm');if(f){f.hidden=true;f.style.setProperty('display','none','important')}}
function boot(){document.addEventListener('click',capture,true);document.addEventListener('pointerup',e=>{if(isNewPropertyTarget(e.target))e.preventDefault()},true);hideLegacyForm();window.addEventListener('stay:unified-navigation',hideLegacyForm);const o=new MutationObserver(hideLegacyForm);o.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();