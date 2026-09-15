(() => {
  "use strict";
  const AUTH = "ap207-auth-profile-v1",
    USERS = "system-control-test2-users-v1";
  const digits = (v) => String(v || "").replace(/\D/g, "");
  const profile = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH) || "{}")?.profile || {};
    } catch {
      return {};
    }
  };
  const read = (k, f) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null") || f;
    } catch {
      return f;
    }
  };
  const cpfValid = (cpf) =>
    window.Test2CpfInvite?.cpfValid
      ? window.Test2CpfInvite.cpfValid(cpf)
      : /^\d{11}$/.test(digits(cpf));
  function css() {
    if (document.getElementById("t2CpfAdminCss")) return;
    const s = document.createElement("style");
    s.id = "t2CpfAdminCss";
    s.textContent =
      ".t2-admin-invite-modal{position:fixed;inset:0;z-index:2147483450;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:18px}.t2-admin-invite-card{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.3)}.t2-admin-invite-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.t2-admin-invite-grid label{display:grid;gap:6px;font-weight:800}.t2-admin-invite-grid input{min-height:46px;padding:10px;border:1px solid #cbd5e1;border-radius:10px}.t2-admin-invite-mode{grid-column:1/-1;padding:12px;border:1px solid #ddd8ff;border-radius:12px;background:#f8f7ff}.t2-admin-invite-mode label{display:flex;align-items:center;gap:8px}.t2-admin-invite-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}.t2-admin-fallback-table{width:100%;border-collapse:collapse;margin-top:14px}.t2-admin-fallback-table th,.t2-admin-fallback-table td{padding:10px;border-bottom:1px solid #e5e7eb;text-align:left}@media(max-width:720px){.t2-admin-invite-grid{grid-template-columns:1fr}.t2-admin-invite-actions{flex-direction:column}.t2-admin-invite-actions button{width:100%}}";
    document.head.append(s);
  }
  function ensurePanel() {
    if (profile().role !== "super_admin") return null;
    let p = document.getElementById("t2ProfessionalAdmins");
    if (p) return p;
    const root = document.getElementById("t2Suite");
    if (!root) return null;
    p = document.createElement("section");
    p.id = "t2ProfessionalAdmins";
    p.className = "panel t2pm-panel";
    p.hidden = true;
    p.innerHTML =
      '<div class="t2pm-head"><div><p class="eyebrow">STAY IN CONTROL</p><h2>Administradores</h2><p class="t2-muted">Controle administradores, acesso, propriedades e status.</p></div></div>';
    const users = read(USERS, []).filter((x) => x?.role === "admin");
    const table = document.createElement("table");
    table.className = "t2-admin-fallback-table";
    table.innerHTML =
      "<thead><tr><th>Nome</th><th>E-mail / CPF</th><th>Status</th><th>Propriedades</th></tr></thead><tbody></tbody>";
    const body = table.querySelector("tbody");
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.name || "—"}</td><td>${u.email || u.cpf || "—"}</td><td>${u.active === false ? "Bloqueado" : "Ativo"}</td><td>${Array.isArray(u.propertyIds) ? u.propertyIds.length : 0}</td>`;
      body.append(tr);
    });
    if (!users.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="4">Nenhum administrador cadastrado.</td>';
      body.append(tr);
    }
    p.append(table);
    root.append(p);
    return p;
  }
  function linkFor(token) {
    return `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/cpf-invite.html?token=${encodeURIComponent(token)}`;
  }
  function open() {
    if (profile().role !== "super_admin") return;
    document.getElementById("t2AdminInviteModal")?.remove();
    const m = document.createElement("div");
    m.id = "t2AdminInviteModal";
    m.className = "t2-admin-invite-modal";
    m.innerHTML =
      '<section class="t2-admin-invite-card"><h3>Novo administrador</h3><p class="t2-muted">Escolha como o administrador fará o primeiro acesso.</p><form><div class="t2-admin-invite-grid"><div class="t2-admin-invite-mode"><strong>Forma de acesso</strong><label><input type="radio" name="mode" value="email" checked> E-mail + senha</label><label><input type="radio" name="mode" value="cpf"> CPF + senha (Brasil)</label></div><label>Nome completo<input name="name" required></label><label data-email>E-mail<input name="email" type="email" required></label><label data-cpf hidden>CPF<input name="cpf" inputmode="numeric" placeholder="000.000.000-00"></label><label>WhatsApp <span class="t2-muted">(opcional)</span><input name="phone" type="tel"></label></div><p data-msg class="t2-muted"></p><div class="t2-admin-invite-actions"><button type="button" class="button button-secondary" data-close>Cancelar</button><button type="submit" class="button button-primary">Salvar e enviar acesso</button></div></form></section>';
    document.body.append(m);
    const f = m.querySelector("form"),
      email = f.elements.email,
      cpf = f.elements.cpf,
      msg = m.querySelector("[data-msg]");
    const sync = () => {
      const useCpf = f.elements.mode.value === "cpf";
      m.querySelector("[data-email]").hidden = useCpf;
      m.querySelector("[data-cpf]").hidden = !useCpf;
      email.disabled = useCpf;
      email.required = !useCpf;
      cpf.disabled = !useCpf;
      cpf.required = useCpf;
    };
    f.addEventListener("change", (e) => {
      if (e.target.name === "mode") sync();
    });
    sync();
    m.querySelector("[data-close]").onclick = () => m.remove();
    m.onclick = (e) => {
      if (e.target === m) m.remove();
    };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.submitter,
        name = f.elements.name.value.trim(),
        mode = f.elements.mode.value,
        client = window.AP207Supabase;
      if (!name) return;
      if (mode === "cpf" && !cpfValid(cpf.value)) {
        msg.textContent = "Informe um CPF válido.";
        return;
      }
      if (!client?.functions?.invoke) {
        msg.textContent = "Serviço de convite indisponível.";
        return;
      }
      btn.disabled = true;
      msg.textContent =
        mode === "cpf"
          ? "Criando acesso por CPF…"
          : "Enviando convite por e-mail…";
      try {
        const body =
          mode === "cpf"
            ? {
                name,
                role: "admin",
                identifierType: "cpf",
                cpf: digits(cpf.value),
                phone: f.elements.phone.value.trim(),
                propertyIds: [],
                resend: false,
              }
            : {
                name,
                role: "admin",
                identifierType: "email",
                email: email.value.trim(),
                propertyIds: [],
                redirectTo: `${location.origin}${location.pathname.replace(/[^/]*$/, "")}invite.html?invite=1&v=${Date.now()}`,
                resend: false,
              };
        const { data, error } = await client.functions.invoke("invite-user", {
          body,
        });
        if (error || !data?.ok)
          throw error || new Error(data?.error || "INVITE");
        if (mode === "cpf") {
          if (!data.inviteToken) throw new Error("Link não retornado.");
          m.remove();
          window.Test2CpfInvite?.showLink?.(
            linkFor(data.inviteToken),
            name,
            "admin",
          );
        } else {
          msg.textContent = "✅ Administrador cadastrado e convite enviado.";
          btn.textContent = "Enviado ✓";
        }
        window.dispatchEvent(new Event("stay:roles-changed"));
      } catch (err) {
        console.error(err);
        msg.textContent =
          err?.message || "Não foi possível criar o acesso agora.";
        btn.disabled = false;
      }
    };
  }
  function intercept(e) {
    if (profile().role !== "super_admin") return;
    const b = e.target.closest?.(
      '#t2ProfessionalAdmins .t2pm-toolbar button,#t2ucAdminsHead [data-t2uc-action="new-admin"]',
    );
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    open();
  }
  function boot() {
    css();
    ensurePanel();
    document.addEventListener("click", intercept, true);
    window.addEventListener("stay:management-ready", ensurePanel);
    window.addEventListener("stay:unified-navigation", ensurePanel);
    window.Test2CpfAdminInvite = { open, ensurePanel };
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
