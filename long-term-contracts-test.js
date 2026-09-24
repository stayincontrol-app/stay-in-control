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
function initContracts(){
 const nav=document.querySelector(".app-nav"),main=document.querySelector("main.container");if(!nav||!main||document.getElementById("ltContractScreen"))return;
 const b=document.createElement("button");b.type="button";b.className="nav-item";b.dataset.screen="contracts";b.innerHTML="<span>▤</span>Contratos";nav.appendChild(b);
 const s=document.createElement("div");s.className="app-screen";s.dataset.screenPanel="contracts";s.id="ltContractScreen";s.hidden=true;
 s.innerHTML=`<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Short, médio e longo prazo • TESTE 1</p><h2>Contratos, cobranças e repasses</h2></div><button class="button button-primary" id="ltNew" type="button">Novo contrato</button></div>
 <div id="ltList"></div><form id="ltForm" class="reservation-form" hidden>
 <div class="field field-wide"><h3>Inquilino</h3></div>
 <div class="field field-wide"><label>Nome completo</label><input name="tenant" required></div>
 <div class="field"><label>CPF / Documento / Passaporte</label><input name="cpf"></div>
 <div class="field"><label>E-mail</label><input name="email" type="email"></div><div class="field"><label>Telefone</label><input name="phone" type="tel"></div>
 ${addressFields("")}
 <div class="field field-wide"><h3>Imóvel alugado</h3></div>
 <div class="field field-wide"><label>Endereço completo do imóvel alugado</label><input name="rentalAddress" placeholder="Rua, número, complemento, bairro"></div>
 <div class="field"><label>Cidade do imóvel</label><input name="rentalCity"></div><div class="field"><label>Estado</label><input name="rentalState"></div><div class="field"><label>CEP</label><input name="rentalZip"></div>
 <div class="field field-wide"><h3>Contrato</h3></div>
 <div class="field"><label>Tipo</label><select name="stayType"><option>Short stay</option><option selected>Long stay</option><option>Médio prazo</option></select></div>
 <div class="field"><label>Início</label><input name="start" type="date"></div><div class="field"><label>Término</label><input name="end" type="date"></div>
 <div class="field"><label>Aluguel / parcela (R$)</label><input name="rent" type="number" min="0" step=".01" placeholder="0,00"></div><div class="field"><label>Vencimento (dia)</label><input name="due" type="number" min="1" max="31" value="10"></div>
 <div class="field"><label>Comissão (%)</label><input name="commission" type="number" min="0" max="100" step=".01" value="15"></div><div class="field"><label>Caução (R$)</label><input name="deposit" type="number" min="0" step=".01"></div>
 <div class="field field-wide"><h3>Pagamento do contrato</h3><small class="field-help">O contrato pode ser controlado manualmente ou enviado ao Asaas quando a integração estiver conectada.</small></div>
 <div class="field"><label>Modo</label><select name="paymentMode"><option value="manual">Manual</option><option value="automatic">Automático via Asaas</option></select></div>
 <div class="field"><label>Forma de cobrança</label><select name="paymentMethod"><option>Pix</option><option>Boleto</option><option>Cartão</option><option>Link de pagamento</option><option>Pix Automático</option></select></div>
 <div class="field"><label>Status</label><select name="paymentStatus"><option value="pending">Pendente</option><option value="paid">Pago / Recebido</option><option value="late">Atrasado</option></select></div>
 <div class="field"><label>Multa por atraso (%)</label><input name="lateFee" type="number" min="0" step=".01" value="2"></div><div class="field"><label>Juros (%)</label><input name="interest" type="number" min="0" step=".01" value="1"></div>
 <div class="field field-wide"><div class="panel"><strong>Integração Asaas</strong><p>Conecte sua conta para criar cobranças reais, links de pagamento, Pix, boleto e receber atualizações automáticas por webhook.</p><a class="button button-primary" href="https://www.asaas.com/" target="_blank" rel="noopener">Criar / acessar conta Asaas</a> <a class="button button-secondary" href="https://docs.asaas.com/docs/visao-geral" target="_blank" rel="noopener">Configurar integração Asaas</a><small class="field-help">A chave da API deve ser configurada com segurança no servidor; nunca dentro deste formulário ou no navegador.</small></div></div>
 <div class="field field-wide"><label>Repasse ao proprietário</label><select name="payout"><option value="manual">Manual</option><option value="automatic">Automático</option></select></div>
 <div id="ltOwner" class="field field-wide" hidden><label>Proprietário / recebedor</label><input name="owner" placeholder="Nome do proprietário"><small class="field-help">A integração automática usará o recebedor autorizado no provedor. Não pedimos senha bancária.</small><button class="button button-secondary" id="ltInvite" type="button">Preparar cadastro do recebedor</button><output id="ltInviteStatus"></output></div>
 <div class="field field-wide"><label><input name="recurring" type="checkbox" checked> Gerar parcelas/cobranças recorrentes conforme o contrato</label></div>
 <div class="field output-field"><span>Comissão</span><output id="ltCommission">R$ 0,00</output></div><div class="field output-field"><span>Repasse previsto</span><output id="ltPayout">R$ 0,00</output></div>
 <div class="form-actions field-wide"><button class="button button-primary" type="submit">Salvar contrato</button><button class="button button-secondary" id="ltCancel" type="button">Cancelar</button></div></form></section>`;
 main.appendChild(s);
 const form=s.querySelector("#ltForm"),owner=s.querySelector("#ltOwner"),input=name=>form.elements.namedItem(name),money=()=>{const rent=+input("rent").value||0,rate=+input("commission").value||0,comm=rent*rate/100;s.querySelector("#ltCommission").textContent=brl.format(comm);s.querySelector("#ltPayout").textContent=brl.format(rent-comm)};
 input("payout").addEventListener("change",()=>owner.hidden=input("payout").value!=="automatic");input("rent").addEventListener("input",money);input("commission").addEventListener("input",money);money();
 const newButton=s.querySelector("#ltNew"),message=document.createElement("p");message.id="ltSaveStatus";message.setAttribute("role","status");form.before(message);
 newButton.onclick=()=>{form.reset();form.dataset.editId="";form.hidden=false;newButton.hidden=true;message.textContent=""};s.querySelector("#ltCancel").onclick=()=>{form.hidden=true;newButton.hidden=false;message.textContent=""};
 s.querySelector("#ltInvite").onclick=()=>s.querySelector("#ltInviteStatus").textContent=" Cadastro preparado • integração automática será ativada quando o provedor estiver conectado.";
 form.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries([...new FormData(form)].filter(([,value])=>typeof value==="string"));d.tenant=String(d.tenant||"").trim();if(!d.tenant){message.textContent="Informe o nome da pessoa para salvar.";input("tenant").focus();return}if(d.start&&d.end&&d.end<d.start){message.textContent="A data final deve ser igual ou posterior à inicial.";input("end").focus();return}const a=load(CONTRACT_KEY,[]),old=a.find(x=>String(x.id)===form.dataset.editId);d.id=old?.id||uid();d.createdAt=old?.createdAt||new Date().toISOString();d.status=d.paymentStatus==="paid"?"Pago":d.paymentStatus==="late"?"Atrasado":"Pendente";d.payments=old?.payments||[];if(old)a.splice(a.indexOf(old),1);a.unshift(d);try{save(CONTRACT_KEY,a);render();form.hidden=true;newButton.hidden=false;form.dataset.editId="";message.textContent="Contrato salvo. Abra o cadastro abaixo para ver os dados e registrar pagamentos."}catch{message.textContent="Não foi possível salvar no navegador. Verifique o espaço disponível e tente novamente."}});
 function render(){const a=load(CONTRACT_KEY,[]),list=s.querySelector("#ltList");list.innerHTML=a.length?a.map(x=>{const rent=+x.rent||0,c=rent*(+x.commission||0)/100;const addr=[x.street,x.number,x.complement,x.district,x.city,x.state,x.zip,x.country].filter(Boolean).join(", ");return `<article class="reservation-card"><strong>${esc(x.tenant)}</strong><span>${esc(x.stayType)} • ${esc(x.start||"Data não informada")} a ${esc(x.end||"Data não informada")}</span><span>Endereço: ${esc(addr||"não informado")}</span><span>Parcela: ${brl.format(rent)} • Comissão: ${esc(x.commission)}% • Repasse previsto: ${brl.format(rent-c)}</span><small>Status: ${esc(x.status)}</small><button class="button button-secondary" type="button" data-open-contract="${esc(x.id)}">Abrir contrato</button></article>`}).join(""):"<p>Nenhum contrato cadastrado neste teste.</p>";list.querySelectorAll("[data-open-contract]").forEach(button=>button.onclick=()=>openContract(button.dataset.openContract))}
 function openContract(id){const x=load(CONTRACT_KEY,[]).find(item=>String(item.id)===id);if(!x)return;let detail=s.querySelector("#ltDetail");if(!detail){detail=document.createElement("section");detail.id="ltDetail";detail.className="panel";s.querySelector("#ltList").after(detail)}detail.replaceChildren();const title=document.createElement("h3");title.textContent=x.tenant;detail.append(title);const info=document.createElement("p");info.textContent=`${x.stayType||"Contrato"} • Documento: ${x.cpf||"não informado"} • ${x.start||"sem início"} a ${x.end||"sem término"} • ${brl.format(+x.rent||0)} por parcela`;detail.append(info);const edit=document.createElement("button");edit.type="button";edit.className="button button-secondary";edit.textContent="Editar contrato";edit.onclick=()=>{form.reset();for(const [name,value] of Object.entries(x)){const control=input(name);if(control&&control.type!=="file")control.type==="checkbox"?control.checked=!!value:control.value=String(value??"")}form.dataset.editId=String(x.id);form.hidden=false;newButton.hidden=true;form.scrollIntoView({block:"start"})};detail.append(edit);const heading=document.createElement("h4");heading.textContent="Pagamentos deste contrato";detail.append(heading);for(const p of x.payments||[]){const row=document.createElement("p");row.textContent=`${p.date||"Sem data"} • ${brl.format(+p.amount||0)} • ${p.kind||"Recebimento"}${p.note?" • "+p.note:""}`;detail.append(row)}const payment=document.createElement("form");payment.innerHTML='<label>Data <input name="date" type="date" required></label> <label>Valor recebido (R$) <input name="amount" type="number" min="0" step=".01" required></label> <label>Tipo <select name="kind"><option>Recebimento</option><option>Repasse</option></select></label> <label>Observação / recibo <input name="note"></label> <button class="button button-primary" type="submit">Registrar pagamento</button>';payment.onsubmit=e=>{e.preventDefault();const all=load(CONTRACT_KEY,[]),record=all.find(item=>String(item.id)===id);if(!record)return;record.payments=Array.isArray(record.payments)?record.payments:[];record.payments.push(Object.fromEntries(new FormData(payment)));try{save(CONTRACT_KEY,all);openContract(id);message.textContent="Pagamento registrado no histórico do contrato."}catch{message.textContent="Não foi possível salvar o pagamento no navegador."}};detail.append(payment);detail.scrollIntoView({block:"start"})}render();
 b.addEventListener("click",()=>{document.querySelectorAll("[data-screen-panel]").forEach(p=>p.hidden=p!==s);document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===b))});
}
function init(){initContracts()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
