(()=>{'use strict';
const AUTH='ap207-auth-profile-v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function profile(){try{return JSON.parse(localStorage.getItem(AUTH)||'{}')?.profile||{}}catch{return{}}}
function canManage(){return ['super_admin','admin'].includes(String(profile().role||'').toLowerCase().replace(/[\s-]+/g,'_'))}
async function load(){const panel=document.getElementById('t2ProfessionalOwners');if(!panel||!canManage())return false;const client=window.AP207Supabase;if(!client)return false;let table=panel.querySelector('table.t2pm-table');if(!table)return false;
let owners=[],props=[],access=[];
try{
 const pr=await client.from('profiles').select('id,email,name,role,active').eq('role','owner'); if(pr.error)throw pr.error; owners=pr.data||[];
 const pp=await client.from('properties').select('id,name,unit,owner_name,owner_id,deleted_at').is('deleted_at',null); if(pp.error)throw pp.error; props=pp.data||[];
 const pa=await client.from('property_access').select('user_id,property_id'); if(!pa.error)access=pa.data||[];
}catch(err){console.warn('owners-live',err);return false}
const rows=[];
owners.forEach(o=>{const ids=new Set(access.filter(a=>String(a.user_id)===String(o.id)).map(a=>String(a.property_id)));props.filter(p=>String(p.owner_id||'')===String(o.id)).forEach(p=>ids.add(String(p.id)));const linked=props.filter(p=>ids.has(String(p.id)));rows.push({name:o.name||'—',email:o.email||'—',role:'Proprietário',status:o.active===false?'Bloqueado':'Ativo',properties:linked.map(p=>p.unit||p.name||p.id),hasAccess:true});});
const knownNames=new Set(rows.map(r=>String(r.name||'').trim().toLowerCase()).filter(Boolean));props.filter(p=>!p.owner_id&&String(p.owner_name||'').trim()).forEach(p=>{const key=String(p.owner_name).trim().toLowerCase();let r=rows.find(x=>!x.hasAccess&&String(x.name).trim().toLowerCase()===key);if(!r&&!knownNames.has(key)){r={name:p.owner_name,email:'—',role:'Proprietário',status:'Sem acesso criado',properties:[],hasAccess:false};rows.push(r)}if(r&&!r.properties.includes(p.unit||p.name||p.id))r.properties.push(p.unit||p.name||p.id);});
table.innerHTML='<thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Status</th><th>Propriedades</th><th>Ações</th></tr></thead><tbody></tbody>';const body=table.querySelector('tbody');
if(!rows.length){body.innerHTML='<tr><td colspan="6">Nenhum proprietário cadastrado ainda.</td></tr>';return true}
rows.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).forEach(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.role)}</td><td><span class="t2pm-badge ${r.hasAccess?'ok':''}">${esc(r.status)}</span></td><td>${r.properties.length?esc(r.properties.join(', ')):'—'}</td><td>${r.hasAccess?'<button type="button" class="button button-secondary" data-owner-edit>Gerenciar</button>':'<button type="button" class="button button-primary" data-owner-create>Criar acesso</button>'}</td>`;const create=tr.querySelector('[data-owner-create]');if(create)create.onclick=()=>window.Test2OwnerModalV2?.open?.();const edit=tr.querySelector('[data-owner-edit]');if(edit)edit.onclick=()=>window.Test2OwnerModalV2?.open?.();body.append(tr)});return true}
function runSoon(){let n=0;const t=setInterval(async()=>{n++;if(await load()||n>=20)clearInterval(t)},150)}
function boot(){runSoon();window.addEventListener('stay:management-ready',runSoon);window.addEventListener('stay:roles-changed',runSoon);window.addEventListener('stay:properties-changed',runSoon);window.addEventListener('stay:unified-navigation',()=>setTimeout(runSoon,0));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();