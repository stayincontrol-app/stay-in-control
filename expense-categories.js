(()=>{'use strict';
const EXTRA=['Internet','Luz','Limpeza','Aluguel de garagem'];
function apply(){const select=document.getElementById('expenseCategory');if(!select)return;const existing=new Set([...select.options].map(o=>o.textContent.trim().toLowerCase()));EXTRA.forEach(name=>{if(existing.has(name.toLowerCase()))return;const option=document.createElement('option');option.value=name;option.textContent=name;select.appendChild(option);existing.add(name.toLowerCase())})}
function boot(){apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();