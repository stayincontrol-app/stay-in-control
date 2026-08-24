(()=>{'use strict';
const form=document.getElementById('expenseForm'),date=document.getElementById('expenseDate'),header=document.getElementById('propertySelector');if(!form||!header)return;
const SCOPE='stay-home-scope-v1';
function scopeProperty(){try{const s=JSON.parse(localStorage.getItem(SCOPE)||'{}');return s.property&&s.property!=='all'?String(s.property):''}catch{return''}}
function selectedProperty(){return scopeProperty()||header.value||''}
function sync(){const id=selectedProperty();if(id&&id!==header.value&&[...header.options].some(o=>o.value===id)){header.value=id;header.dispatchEvent(new Event('change',{bubbles:true}))}}
/* A nova despesa pertence sempre à propriedade/unidade escolhida na Visão geral do Home.
   Não mostrar nem exigir seletores duplicados de proprietário/propriedade no formulário. */
['expenseOwner','expenseProperty'].forEach(id=>{const e=document.getElementById(id);if(e)e.closest('.field')?.remove()});
if(date){date.disabled=false;date.readOnly=false;date.required=true}
form.addEventListener('submit',()=>sync(),true);
window.addEventListener('stay:scope-change',sync);
setTimeout(sync,0);
})();