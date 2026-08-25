(() => {
  'use strict';
  const AUTH_CACHE_KEY='ap207-auth-profile-v1';
  function currentRole(){try{return JSON.parse(localStorage.getItem(AUTH_CACHE_KEY)||'null')?.profile?.role||''}catch{return''}}
  function hide(el){if(!el)return;el.hidden=true;el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true')}
  function hideOwnerRecurringSettings(){
    if(currentRole()!=='owner')return;
    hide(document.getElementById('summaryRecurringExpensesLine'));
    hide(document.getElementById('recurringReservationDefaults'));
    const exact=[
      'comissão recorrente','taxa de limpeza recorrente','despesas recorrentes cadastradas',
      'ative, desative ou exclua as recorrências já cadastradas.',
      'nenhuma despesa recorrente cadastrada para esta unidade.'
    ];
    document.querySelectorAll('h1,h2,h3,h4,strong,small,span,p,dt,dd,div').forEach(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      if(!exact.includes(text))return;
      if(text==='comissão recorrente'||text==='taxa de limpeza recorrente'){
        hide(el.closest('article,section,.panel,.card,[class*="card"]')||el.parentElement);
      }else hide(el);
    });
  }
  function setManagementVisibility(screen){
    const showManagement=screen==='home';
    const propertySettings=document.getElementById('propertySettings');
    const userSection=document.getElementById('stayUserSection');
    const logoutButton=document.getElementById('stayControlLogoutButton');
    if(propertySettings)propertySettings.style.display=showManagement?'':'none';
    if(userSection)userSection.style.display=showManagement?'':'none';
    if(logoutButton)logoutButton.style.display=showManagement?'block':'none';
    hideOwnerRecurringSettings();
  }
  function activate(screen){setManagementVisibility(screen);hideOwnerRecurringSettings();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}))}
  function install(){
    if(document.body.dataset.stayScreenNavigation==='1'){hideOwnerRecurringSettings();return true}
    const buttons=[...document.querySelectorAll('[data-screen]')];if(!buttons.length)return false;
    document.body.dataset.stayScreenNavigation='1';
    buttons.forEach(button=>button.addEventListener('click',()=>activate(button.dataset.screen),{capture:false}));
    const active=document.querySelector('[data-screen].active')?.dataset.screen||'home';setManagementVisibility(active);
    const observer=new MutationObserver(()=>{const current=document.querySelector('[data-screen].active')?.dataset.screen||'home';setManagementVisibility(current)});
    buttons.forEach(button=>observer.observe(button,{attributes:true,attributeFilter:['class','aria-current']}));
    new MutationObserver(()=>hideOwnerRecurringSettings()).observe(document.body,{childList:true,subtree:true});
    return true;
  }
  function boot(){const timer=setInterval(()=>{hideOwnerRecurringSettings();if(install())clearInterval(timer)},150);setTimeout(()=>clearInterval(timer),15000);setTimeout(hideOwnerRecurringSettings,500);setTimeout(hideOwnerRecurringSettings,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();