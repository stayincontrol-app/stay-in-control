(()=>{'use strict';
const INVITES='stay-control-invitations-v1';
const readInvites=()=>{try{return JSON.parse(localStorage.getItem(INVITES)||'[]')||[]}catch{return[]}};
function admins(){return readInvites().filter(x=>x.role==='admin')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function refreshPropertyAdminSelector(){const select=document.getElementById('peAdmin');if(!select)return;const oldLabel=select.options[select.selectedIndex]?.textContent||'';const list=admins();select.innerHTML='<option value="">Selecione o administrador</option>'+list.map((u,i)=>`<option value="${i}">${esc(u.name||u.email||'Administrador')}</option>`).join('');const match=[...select.options].find(o=>o.textContent===oldLabel);if(match)select.value=match.value;const prop=document.getElementById('peProperty');const fields=document.getElementById('peFields');if(prop){prop.innerHTML=select.value?'<option value="">Selecione a propriedade/unidade</option>':'<option value="">Selecione primeiro o administrador</option>'}if(fields)fields.hidden=true}
function refreshUserCards(email,newRole){document.querySelectorAll('#stayInviteList .stay-user-row').forEach(row=>{const text=row.textContent||'';if(!email||!text.toLowerCase().includes(String(email).toLowerCase()))return;const strong=row.querySelector('strong');if(strong){const name=(strong.textContent||'').split(' — ')[0];strong.textContent=`${name} — ${newRole==='admin'?'Administrador':'Proprietário'}`}})}
function sync(e){const d=e?.detail||{};refreshPropertyAdminSelector();if(d.email&&d.newRole&&d.newRole!=='deleted')refreshUserCards(d.email,d.newRole)}
window.addEventListener('stay:user-role-changed',sync);
window.addEventListener('storage',e=>{if(e.key===INVITES)sync({detail:{}})});
})();