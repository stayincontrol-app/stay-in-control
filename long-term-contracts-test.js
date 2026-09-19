(() => {
  "use strict";
  const KEY = "stay-long-term-contracts-test-v1";
  const brl = new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  function init(){
    const nav=document.querySelector(".app-nav"), main=document.querySelector("main.container"); if(!nav||!main||document.getElementById("ltContractScreen"))return;
    const b=document.createElement("button"); b.type="button"; b.className="nav-item"; b.dataset.screen="contracts"; b.innerHTML="<span>▤</span>Contratos"; nav.appendChild(b);
    const s=document.createElement("div"); s.className="app-screen"; s.dataset.screenPanel="contracts"; s.id="ltContractScreen"; s.hidden=true;
    s.innerHTML=`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Médio e longo prazo • TESTE</p><h2>Contratos e cobranças</h2></div><button class="button button-primary" id="ltNew" type="button">Novo contrato</button></div>
    <div id="ltList"></div><form id="ltForm" class="reservation-form" hidden>
    <div class="field field-wide"><h3>Inquilino</h3></div>
    <div class="field field-wide"><label>Nome completo</label><input name="tenant" required></div><div class="field"><label>CPF / Documento</label><input name="cpf" required></div><div class="field"><label>Telefone</label><input name="phone"></div>
    <div class="field field-wide"><label>Rua / Avenida</label><input name="street"></div><div class="field"><label>Número</label><input name="number"></div><div class="field"><label>Complemento</label><input name="complement"></div><div class="field"><label>Bairro</label><input name="district"></div><div class="field"><label>Cidade</label><input name="city"></div><div class="field"><label>Estado</label><input name="state"></div><div class="field"><label>CEP</label><input name="zip"></div><div class="field"><label>País</label><input name="country" value="Brasil"></div>
    <div class="field field-wide"><h3>Contrato e cobrança</h3></div><div class="field"><label>Início</label><input name="start" type="date" required></div><div class="field"><label>Término</label><input name="end" type="date"></div>
    <div class="field"><label>Aluguel mensal (R$)</label><input name="rent" type="number" min="0" step=".01" value="2000" required></div><div class="field"><label>Vencimento (dia)</label><input name="due" type="number" min="1" max="31" value="10"></div>
    <div class="field"><label>Comissão (%)</label><input name="commission" type="number" min="0" max="100" step=".01" value="15"></div><div class="field"><label>Caução (R$)</label><input name="deposit" type="number" min="0" step=".01"></div>
    <div class="field"><label>Multa por atraso (%)</label><input name="lateFee" type="number" min="0" step=".01" value="2"></div><div class="field"><label>Juros (%)</label><input name="interest" type="number" min="0" step=".01" value="1"></div>
    <div class="field field-wide"><label>Repasse ao proprietário</label><select name="payout"><option value="manual">Manual</option><option value="automatic">Automático</option></select></div>
    <div id="ltOwner" class="field field-wide" hidden><label>Proprietário para repasse automático</label><input name="owner" placeholder="Nome do proprietário"><small class="field-help">Teste: cadastro/ativação será feito por link. Nenhum dado bancário real é solicitado aqui.</small><button class="button button-secondary" id="ltInvite" type="button">Gerar link de cadastro (simulação)</button><output id="ltInviteStatus"></output></div>
    <div class="field field-wide"><label><input name="recurring" type="checkbox" checked> Gerar cobrança mensal recorrente (boleto/Pix)</label></div>
    <div class="field output-field"><span>Comissão</span><output id="ltCommission">R$ 0,00</output></div><div class="field output-field"><span>Repasse ao proprietário</span><output id="ltPayout">R$ 0,00</output></div>
    <div class="field field-wide"><h3>Documentos</h3><label>Contrato / recibo / comprovantes</label><input type="file" multiple disabled><small class="field-help">Anexos reais serão ligados ao armazenamento depois; nesta versão é somente visual.</small></div>
    <div class="form-actions field-wide"><button class="button button-primary" type="submit">Salvar contrato de teste</button><button class="button button-secondary" id="ltCancel" type="button">Cancelar</button></div></form></section>`;
    main.appendChild(s);
    const form=s.querySelector("#ltForm"), owner=s.querySelector("#ltOwner"), money=()=>{const rent=+form.rent.value||0,rate=+form.commission.value||0,comm=rent*rate/100;s.querySelector("#ltCommission").textContent=brl.format(comm);s.querySelector("#ltPayout").textContent=brl.format(rent-comm)};
    form.payout.addEventListener("change",()=>owner.hidden=form.payout.value!=="automatic"); form.rent.addEventListener("input",money);form.commission.addEventListener("input",money);money();
    s.querySelector("#ltNew").addEventListener("click",()=>{form.hidden=false;s.querySelector("#ltNew").hidden=true});
    s.querySelector("#ltCancel").addEventListener("click",()=>{form.hidden=true;s.querySelector("#ltNew").hidden=false});
    s.querySelector("#ltInvite").addEventListener("click",()=>s.querySelector("#ltInviteStatus").textContent=" Link de ativação simulado gerado • Sandbox");
    form.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));d.id=Date.now();d.status="Aguardando cobrança";const a=JSON.parse(localStorage.getItem(KEY)||"[]");a.unshift(d);localStorage.setItem(KEY,JSON.stringify(a));render();form.hidden=true;s.querySelector("#ltNew").hidden=false});
    function render(){const a=JSON.parse(localStorage.getItem(KEY)||"[]");s.querySelector("#ltList").innerHTML=a.length?a.map(x=>{const rent=+x.rent||0,c=rent*(+x.commission||0)/100;return `<article class="reservation-card"><strong>${esc(x.tenant)}</strong><span>Aluguel: ${brl.format(rent)} • Comissão: ${esc(x.commission)}%</span><span>Repasse: ${brl.format(rent-c)} • vencimento dia ${esc(x.due)}</span><span>${x.payout==="automatic"?"Repasse automático":"Repasse manual"} • ${x.recurring?"Cobrança recorrente":"Cobrança manual"}</span><small>Status: ${esc(x.status)}</small></article>`}).join(""):"<p>Nenhum contrato de médio/longo prazo cadastrado neste teste.</p>"} render();
    b.addEventListener("click",()=>{document.querySelectorAll("[data-screen-panel]").forEach(p=>p.hidden=p!==s);document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===b))});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();