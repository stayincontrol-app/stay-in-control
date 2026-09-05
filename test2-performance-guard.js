(()=>{'use strict';
const nativeSetInterval=window.setInterval.bind(window);
const nativeClearInterval=window.clearInterval.bind(window);
window.setInterval=function(fn,delay,...args){
  try{
    const src=typeof fn==='function'?Function.prototype.toString.call(fn):'';
    if(Number(delay)===1800&&src.includes('lang()')&&src.includes('sync()')){
      return nativeSetInterval(()=>{},2147483647);
    }
  }catch{}
  return nativeSetInterval(fn,delay,...args);
};
window.clearInterval=function(id){return nativeClearInterval(id)};
function syncShell(){
  document.querySelectorAll('[data-copy]').forEach(el=>{
    const source=document.getElementById(el.dataset.copy||'');
    if(source&&el.textContent!==source.textContent)el.textContent=source.textContent;
  });
  const month=document.querySelector('.t2-pro-period .month');
  const source=document.getElementById('monthLabel');
  if(month&&source&&month.textContent!==source.textContent)month.textContent=source.textContent;
}
['stay:scope-change','stay:language-change','stay:navigation'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(syncShell)));
document.addEventListener('change',e=>{if(e.target?.matches('#homeAdmin,#homeOwner,#homeUnit,#homeMonth,#homeYear,#t2AppLanguage,#t2V2Language'))requestAnimationFrame(syncShell)});
window.addEventListener('pageshow',()=>requestAnimationFrame(syncShell));
})();