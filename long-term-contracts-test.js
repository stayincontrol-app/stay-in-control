(() => {
"use strict";
const CONTRACT_KEY="stay-long-term-contracts-test-v2", RES_DETAIL_KEY="stay-reservation-guest-details-v1";
const brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=()=>globalThis.crypto?.randomUUID?.()||("stay-"+Date.now()+"-"+Math.random().toString(16).slice(2));
const load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function addressFields(prefix=""){
 return `<div class="field field-wide"><h3>Endereço completo</h3></div>
 <div class="field field-wide"><label>Rua / Avenida</label><input name="${prefix}street" autocomplete="street-address"></div>
 <div class="field"><label>Número</label><input name="${prefix}number"></div>
 <div class="field"><label>Complemento</label><input name="${prefix}complement"></div>
 <div class="field"><label>Bairro</label><input name="${prefix}district"></div>
 <div class="field"><label>Cidade</label><input name="${prefix}city"></div>
 <div class="field"><label>Estado / Província</label><input name="${prefix}state"></div>
 <div class="field"><label>CEP / Código postal</label><input name="${prefix}zip"></div>
 <div class="field"><label>País</label><input name="${prefix}country" value="Brasil"></div>`;
}
function paymentFields(){
 return `<div class="field field-wide"><h3>Pagamento</h3><small class="field-help">Pode funcionar manualmente agora e automaticamente quando a integração de pagamentos estiver habilitada.</small></div>
 <div class="field"><label>Modo</label><select name="paymentMode"><option value="manual">Manual</option><option value="automatic">Automático</option></select></div>
 <div class="field"><label>Forma de cobrança</label><select name="paymentMethod"><option>Pix</option><option>Boleto</option><option>Pix Automático</option><option>Transferência</option><option>Dinheiro</option><option>Cheque</option><option>Cartão</option><option>Link de pagamento</option><option>Outro</option></select></div>
 <div class="field"><label>Status do recebimento</label><select name="paymentStatus"><option value="pending">Pendente</option><option value="paid">Pago / Recebido</option><option value="late">Atrasado</option><option value="cancelled">Cancelado</option></select></div>
 <div class="field"><label>Data do recebimento</label><input name="receivedAt" type="date"></div>
 <div class="field"><label>Multa por atraso (%)</label><input name="lateFee" type="number" min="0" step=".01" value="2"></div>
 <div class="field"><label>Juros (%)</label><input name="interest" type="number" min="0" step=".01" value="1"></div>
 <div class="field"><label>Desconto (R$)</label><input name="discount" type="number" min="0" step=".01" value="0"></div>
 <div class="field"><label>Status do repasse</label><select name="payoutStatus"><option value="pending">Aguardando repasse</option><option value="paid">Repassado</option></select></div>
 <div class="field"><label>Data do repasse</label><input name="payoutAt" type="date"></div>
 <div class="field field-wide"><label>Observações do pagamento</label><textarea name="paymentNotes" rows="2"></textarea></div>
 <div class="field field-wide"><label>Comprovante de pagamento / repasse</label><input name="paymentProof" type="file" accept="image/*,.pdf"><small class="field-help">No Teste 1 o arquivo fica apenas selecionado na tela; o armazenamento definitivo será ligado ao serviço de arquivos.</small></div>`;
}
function enhanceReservation(){
 const form=document.getElementById("reservationForm"); if(!form||form.dataset.guestDetails==="1")return;
 form.dataset.guestDetails="1";
 const guest=document.getElementById("guest")?.closest(".field"); if(!guest)return;
 const wrap=document.createElement("div"); wrap.className="reservation-extra-fields field-wide"; wrap.innerHTML=`
 <div class="field field-wide"><h3>Dados do hóspede / inquilino</h3></div>
 <div class="field"><label>E-mail</label><input name="guestEmail" type="email"></div>
 <div class="field"><label>Telefone</label><input name="guestPhone" type="tel"></div>
 <div class="field"><label>CPF / Documento / Passaporte</label><input name="guestDocument"></div>
 ${addressFields("guest")}
 ${paymentFields()}`;
 guest.after(wrap);
 form.addEventListener("submit",()=>{
   let id=document.getElementById("reservationId")?.value;
   if(!id){id=uid();document.getElementById("reservationId").value=id}
   const fd=new FormData(form), details=load(RES_DETAIL_KEY,{});
   const keys=["guestEmail","guestPhone","guestDocument","gueststreet","guestnumber","guestcomplement","guestdistrict","guestcity","gueststate","guestzip","guestcountry","paymentMode","paymentMethod","paymentStatus","receivedAt","lateFee","interest","discount","payoutStatus","payoutAt","paymentNotes"];
   details[id]=Object.fromEntries(keys.map(k=>[k,fd.get(k)||""])); save(RES_DETAIL_KEY,details);
 },true);
 document.getElementById("reservations")?.addEventListener("click",e=>{
   const btn=e.target.closest('button[data-action="edit"]'); if(!btn)return;
   setTimeout(()=>{const d=load(RES_DETAIL_KEY,{})[btn.dataset.id]||{};Object.entries(d).forEach(([k,v])=>{const el=form.elements.namedItem(k);if(el)el.value=v})},0);
 });
}
function initContracts(){
 const nav=document.querySelector(".app-nav"),main=document.querySelector("main.container");if(!nav||!main||document.getElementById("ltContractScreen"))return;
 const b=document.createElement("button");b.type="button";b.className="nav-item";b.dataset.screen="contracts";b.innerHTML="<span>▤</span>Contratos";nav.appendChild(b);
 const s=document.createElement("div");s.className="app-screen";s.dataset.screenPanel="contracts";s.id="ltContractScreen";s.hidden=true;
 s.innerHTML=`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Short, médio e longo prazo • TESTE 1</p><h2>Contratos, cobranças e repasses</h2></div><button class="button button-primary" id="ltNew" type="button">Novo contrato</button></div>
 <div id="ltList"></div><form id="ltForm" class="reservation-form" hidden>
 <div class="field field-wide"><h3>Inquilino</h3></div>
 <div class="field field-wide"><label>Nome completo</label><input name="tenant" required></div>
 <div class="field"><label>CPF / Documento / Passaporte</label><input name="cpf" required></div>
 <div class="field"><label>E-mail</label><input name="email" type="email"></div><div class="field"><label>Telefone</label><input name="phone" type="tel"></div>
 ${addressFields("")}
 <div class="field field-wide"><h3>Contrato</h3></div>
 <div class="field"><label>Tipo</label><select name="stayType"><option>Short stay</option><option selected>Long stay</option><option>Médio prazo</option></select></div>
 <div class="field"><label>Início</label><input name="start" type="date" required></div><div class="field"><label>Término</label><input name="end" type="date" required></div>
 <div class="field"><label>Aluguel / parcela (R$)</label><input name="rent" type="number" min="0" step=".01" value="2000" required></div><div class="field"><label>Vencimento (dia)</label><input name="due" type="number" min="1" max="31" value="10"></div>
 <div class="field"><label>Comissão (%)</label><input name="commission" type="number" min="0" max="100" step=".01" value="15"></div><div class="field"><label>Caução (R$)</label><input name="deposit" type="number" min="0" step=".01"></div>
 ${paymentFields()}
 <div class="field field-wide"><label>Repasse ao proprietário</label><select name="payout"><option value="manual">Manual</option><option value="automatic">Automático</option></select></div>
 <div id="ltOwner" class="field field-wide" hidden><label>Proprietário / recebedor</label><input name="owner" placeholder="Nome do proprietário"><small class="field-help">A integração automática usará o recebedor autorizado no provedor. Não pedimos senha bancária.</small><button class="button button-secondary" id="ltInvite" type="button">Preparar cadastro do recebedor</button><output id="ltInviteStatus"></output></div>
 <div class="field field-wide"><label><input name="recurring" type="checkbox" checked> Gerar parcelas/cobranças recorrentes conforme o contrato</label></div>
 <div class="field output-field"><span>Comissão</span><output id="ltCommission">R$ 0,00</output></div><div class="field output-field"><span>Repasse previsto</span><output id="ltPayout">R$ 0,00</output></div>
 <div class="form-actions field-wide"><button class="button button-primary" type="submit">Salvar contrato</button><button class="button button-secondary" id="ltCancel" type="button">Cancelar</button></div></form></section>`;
 main.appendChild(s);
 const form=s.querySelector("#ltForm"),owner=s.querySelector("#ltOwner"),money=()=>{const rent=+form.rent.value||0,rate=+form.commission.value||0,comm=rent*rate/100;s.querySelector("#ltCommission").textContent=brl.format(comm);s.querySelector("#ltPayout").textContent=brl.format(rent-comm)};
 form.payout.addEventListener("change",()=>owner.hidden=form.payout.value!=="automatic");form.rent.addEventListener("input",money);form.commission.addEventListener("input",money);money();
 s.querySelector("#ltNew").onclick=()=>{form.hidden=false;s.querySelector("#ltNew").hidden=true};s.querySelector("#ltCancel").onclick=()=>{form.hidden=true;s.querySelector("#ltNew").hidden=false};
 s.querySelector("#ltInvite").onclick=()=>s.querySelector("#ltInviteStatus").textContent=" Cadastro preparado • integração automática será ativada quando o provedor estiver conectado.";
 form.addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(form),d=Object.fromEntries(fd);d.id=uid();d.status=d.paymentStatus==="paid"?"Pago":"Pendente";d.createdAt=new Date().toISOString();const a=load(CONTRACT_KEY,[]);a.unshift(d);save(CONTRACT_KEY,a);render();form.hidden=true;s.querySelector("#ltNew").hidden=false});
 function render(){const a=load(CONTRACT_KEY,[]);s.querySelector("#ltList").innerHTML=a.length?a.map(x=>{const rent=+x.rent||0,c=rent*(+x.commission||0)/100;const addr=[x.street,x.number,x.complement,x.district,x.city,x.state,x.zip,x.country].filter(Boolean).join(", ");return `<article class="reservation-card"><strong>${esc(x.tenant)}</strong><span>${esc(x.stayType)} • ${esc(x.start)} a ${esc(x.end)}</span><span>Endereço: ${esc(addr||"não informado")}</span><span>Parcela: ${brl.format(rent)} • Comissão: ${esc(x.commission)}% • Repasse previsto: ${brl.format(rent-c)}</span><span>${x.paymentMode==="automatic"?"Cobrança automática":"Cobrança manual"} • ${esc(x.paymentMethod)} • ${x.payout==="automatic"?"Repasse automático":"Repasse manual"}</span><small>Status: ${esc(x.status)} • ${x.payoutStatus==="paid"?"Repassado":"Aguardando repasse"}</small></article>`}).join(""):"<p>Nenhum contrato cadastrado neste teste.</p>"}render();
 b.addEventListener("click",()=>{document.querySelectorAll("[data-screen-panel]").forEach(p=>p.hidden=p!==s);document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===b))});
}
function init(){enhanceReservation();initContracts()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();