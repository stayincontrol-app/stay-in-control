(()=>{'use strict';
const RECOVERY_URL='https://raw.githack.com/marcelinhone-code/Ap207-dashboard-/main/index.html?type=recovery';
function install(){
  const button=document.getElementById('ap207ForgotPassword');
  const emailInput=document.getElementById('ap207Email');
  const message=document.getElementById('ap207AuthMessage');
  const client=globalThis.AP207Supabase;
  if(!button||!emailInput||!message||!client?.auth?.resetPasswordForEmail)return false;
  if(button.dataset.recoveryPatched==='1')return true;
  button.dataset.recoveryPatched='1';
  button.onclick=async()=>{
    const email=emailInput.value.trim();
    message.style.color='';
    if(!email){message.textContent='Digite seu e-mail acima para solicitar a redefinição da senha.';return;}
    button.disabled=true;
    message.textContent='Solicitando redefinição de senha…';
    try{
      const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:RECOVERY_URL});
      if(error){
        const d=String(error.message||'').toLowerCase();
        message.style.color='#b42318';
        message.textContent=d.includes('rate')||d.includes('limit')
          ?'Muitas solicitações em pouco tempo. Aguarde alguns minutos e tente novamente.'
          :'Não foi possível solicitar a redefinição agora. Tente novamente em alguns minutos.';
        return;
      }
      message.style.color='#166534';
      message.textContent='✅ Solicitação enviada. Verifique a Caixa de Entrada, Spam e Lixo Eletrônico. O recebimento do e-mail pode levar alguns minutos.';
      let seconds=60;
      const original=button.textContent;
      const tick=()=>{button.textContent=`Enviar novamente (${seconds}s)`;seconds-=1;if(seconds<0){clearInterval(timer);button.disabled=false;button.textContent=original;}};
      tick();const timer=setInterval(tick,1000);
    }catch(e){
      message.style.color='#b42318';
      message.textContent='Não foi possível solicitar a redefinição agora. Verifique sua conexão e tente novamente.';
      button.disabled=false;
    }
  };
  return true;
}
function boot(){const timer=setInterval(()=>{if(install())clearInterval(timer);},200);setTimeout(()=>clearInterval(timer),30000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();