(()=>{'use strict';
let lastStableHeight=0;
function protectList(){
  const list=document.getElementById('recurringExpenseList');
  if(!list||list.dataset.stayScrollProtected==='2')return false;
  list.dataset.stayScrollProtected='2';
  list.style.alignContent='start';
  const rememberHeight=()=>{
    if(list.childElementCount>0){
      const h=Math.ceil(list.getBoundingClientRect().height);
      if(h>0)lastStableHeight=h;
    }
  };
  rememberHeight();
  const mo=new MutationObserver(()=>{
    if(list.childElementCount===0){
      if(lastStableHeight>0)list.style.minHeight=lastStableHeight+'px';
      return;
    }
    requestAnimationFrame(()=>{
      list.style.minHeight='';
      list.style.alignContent='start';
      rememberHeight();
    });
  });
  mo.observe(list,{childList:true,subtree:true});
  window.addEventListener('resize',()=>requestAnimationFrame(rememberHeight),{passive:true});
  return true;
}
function boot(){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(protectList()||tries>120)clearInterval(timer);
  },250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();