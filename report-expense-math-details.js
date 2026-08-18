(()=>{'use strict';
function enhance(){
  const cards=[...document.querySelectorAll('.report-expense-math-card')];
  cards.forEach(card=>{
    const strong=card.querySelector('strong');
    if(!strong)return;
    const specCard=card.parentElement?.querySelector('.report-expense-spec');
    const rows=[...(specCard?.querySelectorAll('.report-expense-spec-line')||[])];
    const expenseItems=rows.map(r=>({name:(r.querySelector('span')?.childNodes?.[0]?.textContent||r.querySelector('span')?.textContent||'Despesa').trim(),value:(r.querySelector('b')?.textContent||'R$ 0,00').trim()})).filter(x=>x.name&&!x.name.toLowerCase().includes('nenhuma despesa'));
    const lines=[...strong.querySelectorAll('.financial-line')];
    const generic=lines.find(l=>(l.firstElementChild?.textContent||'').trim().toLowerCase()==='− despesas');
    if(!generic)return;
    if(generic.dataset.expenseDetails==='1')return;
    generic.dataset.expenseDetails='1';
    const totalExpensesText=(generic.querySelector('b')?.textContent||'− R$ 0,00').trim();
    generic.innerHTML='<span>− Despesas</span><b></b>';
    const valueHolder=generic.querySelector('b');
    valueHolder.textContent='';
    valueHolder.style.display='none';
    const frag=document.createDocumentFragment();
    expenseItems.forEach(item=>{
      const line=document.createElement('span');
      line.className='financial-line financial-expense-detail';
      line.innerHTML=`<span>− ${item.name}</span><b>${item.value.startsWith('−')?item.value:`− ${item.value}`}</b>`;
      frag.append(line);
    });
    const total=document.createElement('span');
    total.className='financial-line financial-expense-subtotal';
    total.innerHTML=`<span>Total de despesas</span><b>${totalExpensesText}</b>`;
    frag.append(total);
    generic.insertAdjacentElement('afterend',document.createElement('span'));
    const marker=generic.nextElementSibling;
    marker.replaceWith(frag);
  });
}
function styles(){if(document.getElementById('reportExpenseMathDetailStyles'))return;const s=document.createElement('style');s.id='reportExpenseMathDetailStyles';s.textContent=`.financial-expense-detail{padding-left:8px!important;font-size:.76rem!important}.financial-expense-detail span{color:#7c2d12}.financial-expense-detail b{color:#b42318}.financial-expense-subtotal{margin-top:4px;padding-top:5px;border-top:1px dashed #fed7aa;font-weight:800}`;document.head.append(s)}
function boot(){styles();enhance();const o=new MutationObserver(()=>enhance());o.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(enhance,80),true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();