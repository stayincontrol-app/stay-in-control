(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(AUTH)||'null')}catch{return null}};
const role=()=>read()?.profile?.role||'';
async function serverEmails(){
  if(role()!=='admin'||!window.AP207Supabase)return null;
  try{
    const {data,error}=await window.AP207Supabase.functions.invoke('list-users',{body:{}});
    if(error||!data?.ok)return null;
    return new Set((data.users||[]).map(u=>String(u.email||'').trim().toLowerCase()).filter(Boolean));
  }catch{return null}
}
function emailFromRow(row){
  const small=row.querySelector('small');
  const text=(small?.textContent||'').trim();
  return text.split('•')[0].trim().toLowerCase();
}
async function apply(){
  if(role()!=='admin')return;
  const list=document.getElementById('stayInviteList');
  if(!list)return;
  const allowed=await serverEmails();
  if(!allowed)return;
  let visible=0;
  [...list.querySelectorAll('.stay-user-row')].forEach(row=>{
    const email=emailFromRow(row);
    const show=!!email&&allowed.has(email);
    row.style.display=show?'':'none';
    if(show)visible++;
  });
  let empty=list.querySelector('.stay-admin-empty');
  if(!visible){
    if(!empty){empty=document.createElement('small');empty.className='stay-admin-empty';list.append(empty)}
    empty.textContent='Nenhum acesso enviado por você ainda.';
    empty.style.display='block';
  }else if(empty){empty.style.display='none'}
}
function boot(){
  if(role()!=='admin')return;
  let pending=false;
  const run=()=>{if(pending)return;pending=true;setTimeout(async()=>{pending=false;await apply()},120)};
  const timer=setInterval(()=>{if(document.getElementById('stayInviteList')){clearInterval(timer);run();new MutationObserver(run).observe(document.getElementById('stayInviteList'),{childList:true,subtree:true})}},250);
  setTimeout(()=>clearInterval(timer),15000);
  window.addEventListener('stay:user-access-updated',run);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();