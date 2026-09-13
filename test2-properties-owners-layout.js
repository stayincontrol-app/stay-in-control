(()=>{'use strict';
function apply(){
 const root=document.getElementById('t2UnifiedProperties');
 if(!root)return;
 const old=document.getElementById('stayUserSection');
 if(old){old.hidden=false;old.style.removeProperty('display');}
 const owners=document.getElementById('t2ProfessionalOwners');
 if(owners){
   owners.hidden=false;
   owners.style.removeProperty('display');
   if(old&&old.parentNode===root&&owners.parentNode===root&&owners.previousElementSibling!==old){
     root.insertBefore(owners,old.nextSibling);
   }
 }
}
function boot(){apply();window.addEventListener('stay:unified-navigation',()=>requestAnimationFrame(apply));window.addEventListener('stay:owners-live-ready',()=>requestAnimationFrame(apply));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();