(() => {
  "use strict";
  const AUTH = "ap207-auth-profile-v1",
    PROPS = "ap207-dashboard-properties-v1";
  const read = (k, f) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null") || f;
    } catch {
      return f;
    }
  };
  const profile = () => read(AUTH, {})?.profile || {};
  const digits = (v) => String(v || "").replace(/\D/g, "");
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const cpfValid = (cpf) =>
    window.Test2CpfInvite?.cpfValid
      ? window.Test2CpfInvite.cpfValid(cpf)
      : /^\d{11}$/.test(digits(cpf));
  function css() {
    if (document.getElementById("t2UnifiedInviteCss")) return;
    const s = document.createElement("style");
    s.id = "t2UnifiedInviteCss";
    s.textContent = `.t2ui-modal{position:fixed;inset:0;z-index:2147483500;background:rgba(15,23,42,.6);display:grid;place-items:center;padding:18px}.t2ui-card{width:min(680px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.3)}.t2ui-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.t2ui-grid label{display:grid;gap:6px;font-weight:800}.t2ui-grid input,.t2ui-grid select{min-height:46px;padding:10px;border:1px solid #cbd5e1;border-radius:10px}.t2ui-wide{grid-column:1/-1}.t2ui-mode{grid-column:1/-1;padding:12px;border:1px solid #ddd8ff;border-radius:12px;background:#f8f7ff}.t2ui-mode label{display:flex;align-items:center;gap:8px}.t2ui-props{grid-column:1/-1;display:grid;gap:8px;padding:12px;border:1px solid #e5e7eb;border-radius:12px}.t2ui-props label{display:flex;align-items:center;gap:8px;font-weight:700}.t2ui-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}.t2ui-msg{margin:12px 0 0;font-weight:700}.t2ui-msg.bad{color:#b42318}.t2ui-msg.ok{color:#15803d}@media(max-width:720px){.t2ui-grid{grid-template-columns:1fr}.t2ui-actions{flex-direction:column}.t2ui-actions button{width:100%}}`;
    document.head.append(s);
  }
  function allowedProperties() {
    const p = profile(),
      all = read(PROPS, { properties: [] }).properties || [];
    if (p.role === "super_admin") return all;
    const a = read(AUTH, {}),
      ids = new Set(
        (a.propertyIds || p.propertyIds || p.property_ids || []).map(String),
      );
    return all.filter((x) => ids.has(String(x.id)));
  }
  function linkFor(token) {
    const base = location.href.replace(/[^/?#]+(?:[?#].*)?$/, "");
    return `${base}cpf-invite.html?token=${encodeURIComponent(token)}`;
  }
  function phoneDigits(v) {
    let d = digits(v);
    if (!d) return "";
    if (d.length === 10 || d.length === 11) d = "55" + d;
    return d;
  }
  function open(rolePreset = "owner") {
    const p = profile();
    if (!["super_admin", "admin"].includes(p.role)) return;
    const initialRole =
      p.role === "super_admin" && rolePreset === "admin" ? "admin" : "owner";
    document.getElementById("t2UnifiedInviteModal")?.remove();
    css();
    const props = allowedProperties(),
      m = document.createElement("div");
    m.id = "t2UnifiedInviteModal";
    m.className = "t2ui-modal";
    m.innerHTML = `<section class="t2ui-card"><h3>${initialRole === "admin" ? "Novo administrador" : "Convidar usuário"}</h3><p class="t2-muted">${p.role === "super_admin" ? "Cadastre Administrador ou Proprietário por e-mail ou CPF e escolha as unidades permitidas." : "Cadastre um Proprietário por e-mail ou CPF."}</p><form><div class="t2ui-grid">${p.role === "super_admin" ? '<label class="t2ui-wide">Função<select name="role"><option value="owner">Proprietário</option><option value="admin">Administrador</option></select></label>' : '<input type="hidden" name="role" value="owner">'}<div class="t2ui-mode"><strong>Forma de acesso</strong><label><input type="radio" name="mode" value="email" checked> E-mail + senha</label><label><input type="radio" name="mode" value="cpf"> CPF + senha (Brasil)</label></div><label>Nome completo<input name="name" required></label><label data-email>E-mail<input name="email" type="email" required></label><label data-cpf hidden>CPF<input name="cpf" inputmode="numeric" placeholder="000.000.000-00"></label><label>WhatsApp <span class="t2-muted">(opcional)</span><input name="phone" type="tel" placeholder="(41) 99999-9999"></label><div class="t2ui-props" data-props><strong>Propriedades / unidades permitidas</strong></div></div><p class="t2ui-msg" data-msg></p><div class="t2ui-actions"><button type="button" class="button button-secondary" data-close>Cancelar</button><button type="submit" class="button button-primary">Salvar e gerar acesso</button></div></form></section>`;
    document.body.append(m);
    const f = m.querySelector("form"),
      box = m.querySelector("[data-props]"),
      msg = m.querySelector("[data-msg]");
    if (f.elements.role) f.elements.role.value = initialRole;
    props.forEach((x) => {
      const l = document.createElement("label");
      l.innerHTML = `<input type="checkbox" value="${esc(String(x.id))}"><span>${esc(x.unit || x.name || x.id)}</span>`;
      box.append(l);
    });
    if (!props.length)
      box.insertAdjacentHTML(
        "beforeend",
        '<span class="t2-muted">Nenhuma propriedade disponível para vincular.</span>',
      );
    const sync = () => {
      const cpf = f.elements.mode.value === "cpf";
      m.querySelector("[data-email]").hidden = cpf;
      m.querySelector("[data-cpf]").hidden = !cpf;
      f.elements.email.disabled = cpf;
      f.elements.email.required = !cpf;
      f.elements.cpf.disabled = !cpf;
      f.elements.cpf.required = cpf;
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
      const role = f.elements.role.value;
      if (p.role === "admin" && role !== "owner") return;
      const name = f.elements.name.value.trim(),
        mode = f.elements.mode.value,
        email = f.elements.email.value.trim(),
        cpf = digits(f.elements.cpf.value),
        phone = f.elements.phone.value.trim(),
        propertyIds = [...box.querySelectorAll("input:checked")].map(
          (x) => x.value,
        );
      if (!name) {
        msg.className = "t2ui-msg bad";
        msg.textContent = "Informe o nome.";
        return;
      }
      if (!propertyIds.length) {
        msg.className = "t2ui-msg bad";
        msg.textContent = "Selecione pelo menos uma propriedade ou unidade.";
        return;
      }
      if (mode === "cpf" && !cpfValid(cpf)) {
        msg.className = "t2ui-msg bad";
        msg.textContent = "Informe um CPF válido.";
        return;
      }
      const client = window.AP207Supabase;
      if (!client?.functions?.invoke) {
        msg.className = "t2ui-msg bad";
        msg.textContent = "Serviço de convite indisponível.";
        return;
      }
      const btn = e.submitter;
      btn.disabled = true;
      msg.className = "t2ui-msg";
      msg.textContent =
        mode === "cpf"
          ? "Criando acesso por CPF…"
          : "Enviando convite por e-mail…";
      try {
        const redirectTo = `${location.origin}${location.pathname.replace(/[^/]*$/, "")}invite.html?invite=1&v=${Date.now()}`,
          body =
            mode === "cpf"
              ? {
                  name,
                  role,
                  identifierType: "cpf",
                  cpf,
                  phone,
                  propertyIds,
                  resend: false,
                }
              : {
                  name,
                  role,
                  identifierType: "email",
                  email,
                  phone,
                  propertyIds,
                  redirectTo,
                  resend: false,
                };
        const { data, error } = await client.functions.invoke("invite-user", {
          body,
        });
        if (error || !data?.ok)
          throw error || new Error(data?.error || "INVITE");
        if (mode === "cpf") {
          if (!data.inviteToken) throw new Error("Link não retornado.");
          const link = linkFor(data.inviteToken),
            pd = phoneDigits(phone);
          m.remove();
          if (window.Test2CpfInvite?.showLink)
            window.Test2CpfInvite.showLink(link, name, role);
          if (pd) {
            const text = encodeURIComponent(
              `Olá ${name}, este é seu link de primeiro acesso ao Stay in Control para criar sua senha: ${link}`,
            );
            window.open(
              `https://wa.me/${pd}?text=${text}`,
              "_blank",
              "noopener",
            );
          }
        } else {
          msg.className = "t2ui-msg ok";
          msg.textContent =
            "✅ Usuário cadastrado, vinculado e convite enviado por e-mail.";
          btn.textContent = "Enviado ✓";
        }
        window.dispatchEvent(new Event("stay:roles-changed"));
      } catch (err) {
        console.error(err);
        msg.className = "t2ui-msg bad";
        msg.textContent =
          err?.message || "Não foi possível criar o acesso agora.";
        btn.disabled = false;
      }
    };
  }
  function intercept(e) {
    const b = e.target.closest?.("button,a");
    if (!b) return;
    const t = (b.textContent || "").trim().toLowerCase();
    if (!/convidar usu[aá]rio/.test(t)) return;
    if (!["super_admin", "admin"].includes(profile().role)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    open();
  }
  function boot() {
    css();
    document.addEventListener("click", intercept, true);
    window.Test2UnifiedInviteUser = { open };
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
