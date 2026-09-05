(()=>{'use strict';
const nativeSetInterval=window.setInterval.bind(window),nativeClearInterval=window.clearInterval.bind(window),nativeSetTimeout=window.setTimeout.bind(window),nativeClearTimeout=window.clearTimeout.bind(window);
window.setInterval=function(fn,delay,...args){
  try{
    const src=typeof fn==='function'?Function.prototype.toString.call(fn):'',ms=Number(delay);
    if(ms===1800&&src.includes('lang()')&&src.includes('sync()'))return nativeSetInterval(()=>{},2147483647);
    if(ms===300&&src.includes('ap207-authenticated')&&src.includes('properties()')){
      queueMicrotask(()=>{try{fn(...args)}catch(e){console.error(e)}});
      return nativeSetInterval(fn,60,...args);
    }
    if(ms===120&&src.includes('newPropertyButton')){
      queueMicrotask(()=>{try{fn(...args)}catch(e){console.error(e)}});
      return nativeSetInterval(fn,40,...args);
    }
  }catch{}
  return nativeSetInterval(fn,delay,...args);
};
window.setTimeout=function(fn,delay,...args){
  try{
    const src=typeof fn==='function'?Function.prototype.toString.call(fn):'',ms=Number(delay);
    if((ms===120&&src.includes('newPropertyOwnerName'))||(ms===900&&src.includes('location.reload')))return nativeSetTimeout(fn,0,...args);
  }catch{}
  return nativeSetTimeout(fn,delay,...args);
};
window.clearInterval=function(id){return nativeClearInterval(id)};
window.clearTimeout=function(id){return nativeClearTimeout(id)};
function syncShell(){document.querySelectorAll('[data-copy]').forEach(el=>{const source=document.getElementById(el.dataset.copy||'');if(source&&el.textContent!==source.textContent)el.textContent=source.textContent});const month=document.querySelector('.t2-pro-period .month'),source=document.getElementById('monthLabel');if(month&&source&&month.textContent!==source.textContent)month.textContent=source.textContent}
['stay:scope-change','stay:language-change','stay:navigation'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(syncShell)));
document.addEventListener('change',e=>{if(e.target?.matches('#homeAdmin,#homeOwner,#homeUnit,#homeMonth,#homeYear,#t2AppLanguage,#t2V2Language'))requestAnimationFrame(syncShell)});
window.addEventListener('pageshow',()=>requestAnimationFrame(syncShell));
})();