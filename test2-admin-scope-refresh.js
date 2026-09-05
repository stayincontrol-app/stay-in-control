(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
function profile(){try{return JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile||{}}catch{return{}}}
function isAdmin(){return profile().role==='admin'}
function installCss(){if(document.getElementById('t2AdminScopeRefreshCss'))return;const s=document.createElement('style');s.id='t2AdminScopeRefreshCss';s.textContent=`
#t2AdminScopeRefresh{margin-top:14px;display:flex;justify-content:flex-end}
#t2AdminScopeRefresh button{min-height:46px;padding:10px 18px;border:0;border-radius:11px;background:#5b4cf0;color:#fff;font:inherit;font-weight:900;cursor:pointer}
#t2AdminScopeRefresh button:disabled{opacity:.65;cursor:wait}
@media(max-width:720px){#t2AdminScopeRefresh{display:block}#t2AdminScopeRefresh button{width:100%;min-height:54px;font-size:17px}}
`;document.head.append(s)}
function copyImmediate(){
  document.querySelectorAll('[data-copy]').forEach(x=>{const y=document.getElementById(x.dataset.copy);if(y)x.textContent=y.textContent});
  const row=document.querySelector('.t2-pro-tablewrap tbody tr');
  if(row){const cells=row.children;const values=[
    document.getElementById('propertyName')?.textContent||'—',
    (document.getElementById('ownerName')?.textContent||'—').replace(/^Proprietário:\s*/i,''),
    document.getElementById('periodCount')?.textContent||'0',
    document.getElementById('nightCount')?.textContent||'0',
    document.getElementById('grossTotal')?.textContent||'R$ 0,00',
    document.getElementById('summaryExpenses')?.textContent||'R$ 0,00',
    document.getElementById('summaryCommission')?.textContent||'R$ 0,00',
    document.getElementById('netTotal')?.textContent||'R$ 0,00'
  ];
  values.forEach((v,i)=>{if(cells[i])cells[i].textContent=v});}
}
function refresh(){
  const unit=document.getElementById('homeUnit'),month=document.getElementById('homeMonth'),year=document.getElementById('homeYear');
  if(unit)unit.dispatchEvent(new Event('change',{bubbles:true}));
  else if(month)month.dispatchEvent(new Event('change',{bubbles:true}));
  else if(year)year.dispatchEvent(new Event('change',{bubbles:true}));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{copyImmediate();window.dispatchEvent(new CustomEvent('stay:admin-overview-refreshed'))}));
}
function install(){if(!isAdmin())return false;const box=document.getElementById('homeScopePanel');if(!box)return false;installCss();if(document.getElementById('t2AdminScopeRefresh'))return true;const wrap=document.createElement('div');wrap.id='t2AdminScopeRefresh';const b=document.createElement('button');b.type='button';b.textContent='Atualizar visão geral';b.onclick=()=>{b.disabled=true;b.textContent='Atualizando…';refresh();setTimeout(()=>{b.disabled=false;b.textContent='Atualizar visão geral'},260)};wrap.append(b);box.append(wrap);return true}
function boot(){if(install())return;let n=0;const t=setInterval(()=>{if(install()||++n>40)clearInterval(t)},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
