(() => {
  'use strict';

  const REDIRECT_URL = 'https://raw.githack.com/marcelinhone-code/Ap207-dashboard-/visual-share-working-20260818/index.html?type=recovery';
  const LAST_ACTIVITY_KEY = 'stay-control-last-activity-v1';

  function recoveryRequested() {
    const search = new URLSearchParams(location.search || '');
    const hash = new URLSearchParams((location.hash || '').replace(/^#/, ''));
    return search.get('type') === 'recovery' || hash.get('type') === 'recovery' || /(?:[?#&])type=recovery(?:&|$)/.test(location.href);
  }

  function messageElement() { return document.getElementById('ap207AuthMessage'); }

  async function installForgotPassword() {
    const overlay = document.getElementById('ap207AuthOverlay');
    const actions = overlay?.querySelector('.ap207-auth-actions');
    const emailInput = overlay?.querySelector('#ap207Email');
    if (!overlay || !actions || !emailInput || document.getElementById('ap207ForgotPassword')) return false;

    const button = document.createElement('button');
    button.id = 'ap207ForgotPassword';
    button.type = 'button';
    button.className = 'ap207-auth-button secondary';
    button.textContent = 'Esqueci minha senha';
    actions.append(button);

    button.addEventListener('click', async () => {
      const client = window.AP207Supabase;
      const message = messageElement();
      const email = emailInput.value.trim().toLowerCase();
      if (!email) {
        if (message) message.textContent = 'Digite seu e-mail primeiro.';
        emailInput.focus();
        return;
      }
      if (!client?.auth?.resetPasswordForEmail) {
        if (message) message.textContent = 'O serviço de acesso ainda está carregando. Tente novamente em alguns segundos.';
        return;
      }
      button.disabled = true;
      if (message) message.textContent = 'Enviando link para nova senha…';
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
      button.disabled = false;
      if (error) {
        const detail = String(error.message || '').toLowerCase();
        if (message) message.textContent = detail.includes('rate') || detail.includes('too many')
          ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
          : 'Não foi possível enviar o e-mail agora. Tente novamente.';
        return;
      }
      if (message) message.textContent = '✅ E-mail enviado com sucesso! Abra o link recebido para criar uma nova senha.';
    });
    return true;
  }

  function addStyles() {
    if (document.getElementById('stayRecoveryStyles')) return;
    const style = document.createElement('style');
    style.id = 'stayRecoveryStyles';
    style.textContent = `#stayRecoveryOverlay{position:fixed;inset:0;z-index:1000000;display:grid;place-items:center;padding:22px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#stayRecoveryOverlay .card{width:min(100%,430px);background:#fff;border-radius:22px;padding:26px;box-shadow:0 18px 55px rgba(20,35,60,.16)}#stayRecoveryOverlay h1{margin:0 0 6px;font-size:28px;color:#111827}#stayRecoveryOverlay p{color:#64748b;line-height:1.45}#stayRecoveryOverlay label{display:block;margin:15px 0 6px;font-size:13px;font-weight:700;color:#334155}#stayRecoveryOverlay .row{display:grid;grid-template-columns:1fr auto;gap:8px}#stayRecoveryOverlay input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #d7dee8;border-radius:12px;font-size:16px}#stayRecoveryOverlay .show{min-height:48px;padding:0 14px;border:1px solid #d7dee8;border-radius:12px;background:#eef2f7;font-weight:800}#stayRecoveryOverlay .save{width:100%;margin-top:18px;border:0;border-radius:12px;padding:14px 16px;background:#2563eb;color:#fff;font-size:15px;font-weight:800}#stayRecoveryMessage{min-height:22px;margin-top:12px;color:#b42318!important;font-size:14px}`;
    document.head.append(style);
  }

  function toggle(input, button) {
    button.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.textContent = visible ? 'Mostrar' : 'Ocultar';
    });
  }

  async function showRecoveryScreen() {
    if (!recoveryRequested() || document.getElementById('stayRecoveryOverlay')) return false;
    const client = window.AP207Supabase;
    if (!client?.auth) return false;
    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return false;

    addStyles();
    const overlay = document.createElement('div');
    overlay.id = 'stayRecoveryOverlay';
    overlay.innerHTML = `<section class="card"><p style="margin:0 0 4px;font-weight:800;color:#2563eb">Stay in Control 1.0</p><h1>Criar nova senha</h1><p>Digite e confirme a nova senha para sua conta.</p><form id="stayRecoveryForm"><label for="stayRecoveryPassword">Nova senha</label><div class="row"><input id="stayRecoveryPassword" type="password" minlength="6" autocomplete="new-password" required><button class="show" id="stayRecoveryShow1" type="button">Mostrar</button></div><label for="stayRecoveryConfirm">Confirmar nova senha</label><div class="row"><input id="stayRecoveryConfirm" type="password" minlength="6" autocomplete="new-password" required><button class="show" id="stayRecoveryShow2" type="button">Mostrar</button></div><button class="save" type="submit">Salvar nova senha e entrar</button></form><p id="stayRecoveryMessage" role="alert"></p></section>`;
    document.body.append(overlay);
    const password = overlay.querySelector('#stayRecoveryPassword');
    const confirm = overlay.querySelector('#stayRecoveryConfirm');
    toggle(password, overlay.querySelector('#stayRecoveryShow1'));
    toggle(confirm, overlay.querySelector('#stayRecoveryShow2'));
    overlay.querySelector('#stayRecoveryForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = overlay.querySelector('#stayRecoveryMessage');
      if (password.value.length < 6) { message.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; return; }
      if (password.value !== confirm.value) { message.textContent = 'As duas senhas precisam ser iguais.'; return; }
      message.textContent = 'Salvando nova senha…';
      const { error } = await client.auth.updateUser({ password: password.value });
      if (error) { message.textContent = error.message || 'Não foi possível alterar a senha.'; return; }
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      try { history.replaceState({}, document.title, location.pathname); } catch {}
      location.reload();
    });
    return true;
  }

  function boot() {
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        await installForgotPassword();
        await showRecoveryScreen();
      } catch {}
      if (tries > 120) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
