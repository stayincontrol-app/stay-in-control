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

async function syncLiveProperties(){
 const client=window.AP207Supabase,root=document.getElementById('t2ProfessionalProperties');if(!client||!root)return false;
 try{
  const auth=(()=>{try{return JSON.parse(localStorage.getItem('ap207-auth-profile-v1')||'{}')}catch{return{}}})(),p=auth.profile||{},role=String(p.role||'');
  let q=client.from('properties').select('id,name,unit,owner_name,owner_id,administrator_id,city,state,country,deleted_at').is('deleted_at',null);
  if(role==='admin')q=q.eq('administrator_id',p.id);
  else if(role==='owner')return false;
  const {data,error}=await q;if(error)throw error;const rows=data||[];
  const storeKey='ap207-dashboard-properties-v1',stored=(()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'{}')}catch{return{}}})(),local=Array.isArray(stored.properties)?stored.properties:[],map=new Map(local.map(x=>[String(x.id),x]));
  rows.forEach(x=>map.set(String(x.id),{...(map.get(String(x.id))||{}),id:x.id,name:x.name||'',unit:x.unit||'',ownerName:x.owner_name||'',ownerId:x.owner_id||'unassigned-owner',administratorId:x.administrator_id||'unassigned-admin',city:x.city||'',state:x.state||'',country:x.country||'',active:true}));
  const liveIds=new Set(rows.map(x=>String(x.id))),merged=[...map.values()].filter(x=>role==='super_admin'?liveIds.has(String(x.id)):liveIds.has(String(x.id)));
  localStorage.setItem(storeKey,JSON.stringify({version:1,properties:merged}));
  let table=root.querySelector('table.t2pm-table');if(!table)return true;let body=table.querySelector('tbody');if(!body)return true;
  body.innerHTML='';rows.forEach(x=>{const tr=document.createElement('tr'),label=x.unit||x.name||x.id;tr.innerHTML='<td></td><td></td><td></td><td></td><td></td>';tr.children[0].textContent=label;tr.children[1].textContent=x.owner_name||'—';tr.children[2].textContent=[x.city,x.state].filter(Boolean).join(' • ')||'—';tr.children[3].textContent='Ativa';const b=document.createElement('button');b.type='button';b.className='button button-secondary';b.textContent='Abrir';b.onclick=()=>{localStorage.setItem('system-control-test2-preferred-property-v1',String(x.id));localStorage.setItem('stay-control-selected-property-v1',String(x.id));location.reload()};tr.children[4].append(b);body.append(tr)});
  const cards=root.querySelectorAll('.t2pm-stat strong,.t2pm-stat b');if(cards[0])cards[0].textContent=String(rows.length);if(cards[1])cards[1].textContent=String(rows.length);if(cards[2])cards[2].textContent=String(new Set(rows.map(x=>String(x.city||'').trim()).filter(Boolean)).size);
  return true;
 }catch(e){console.warn('live properties sync',e);return false}
}
function bootLive(){let n=0;const t=setInterval(async()=>{if(await syncLiveProperties()||++n>30)clearInterval(t)},200);window.addEventListener('stay:properties-changed',()=>setTimeout(syncLiveProperties,0));window.addEventListener('stay:unified-navigation',()=>setTimeout(syncLiveProperties,0));window.addEventListener('pageshow',()=>setTimeout(syncLiveProperties,0));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootLive,{once:true});else bootLive();
