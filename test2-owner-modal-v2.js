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
  const digits = (v) => String(v || "").replace(/\D/g, "");
  function profile() {
    return read(AUTH, {})?.profile || {};
  }
  function allowedIds() {
    const p = profile();
    if (p.role === "super_admin") return null;
    const a = read(AUTH, {}),
      raw = p.propertyIds || p.property_ids || a.propertyIds || [];
    return new Set((Array.isArray(raw) ? raw : []).map(String));
  }
  function props() {
    const all = read(PROPS, { properties: [] }).properties || [],
      ids = allowedIds();
    return ids === null ? all : all.filter((x) => ids.has(String(x.id)));
  }
  function cpfValid(cpf) {
    cpf = digits(cpf);
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    const calc = (len) => {
      let s = 0;
      for (let i = 0; i < len; i++) s += Number(cpf[i]) * (len + 1 - i);
      const r = (s * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
  }
  function css() {
    if (document.getElementById("t2OwnerModalV2Css")) return;
    const s = document.createElement("style");
    s.id = "t2OwnerModalV2Css";
    s.textContent = `.t2om-backdrop{position:fixed;inset:0;z-index:2147483450;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:20px}.t2om-card{width:min(820px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 30px 90px rgba(0,0,0,.3);padding:26px}.t2om-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:20px}.t2om-title{display:flex;gap:14px}.t2om-icon{width:52px;height:52px;border-radius:14px;background:#eef4ff;display:grid;place-items:center;font-size:26px}.t2om-head h2{margin:0 0 5px;font-size:28px}.t2om-head p{margin:0;color:#64748b}.t2om-x{border:0;background:transparent;font-size:28px;cursor:pointer;color:#64748b}.t2om-mode{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:18px}.t2om-mode label{display:flex;gap:8px;align-items:center;font-weight:800}.t2om-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.t2om-grid label{display:grid;gap:6px;font-weight:800}.t2om-grid input,.t2om-grid select,.t2om-grid textarea{width:100%;box-sizing:border-box;border:1px solid #d7dde8;border-radius:11px;padding:11px 12px;font:inherit;background:#fff}.t2om-grid input,.t2om-grid select{min-height:46px}.t2om-wide{grid-column:1/-1}.t2om-props{display:grid;gap:8px;border:1px solid #d7dde8;border-radius:11px;padding:12px;max-height:170px;overflow:auto}.t2om-props label{display:flex;gap:9px;align-items:center;font-weight:600}.t2om-props input{width:auto;min-height:auto}.t2om-switch{display:flex!important;align-items:center;gap:10px}.t2om-msg{min-height:20px;color:#b42318;font-weight:700}.t2om-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.t2om-actions .button{min-height:46px}.t2om-result{margin-top:14px;padding:14px;border:1px solid #c7d7fe;background:#eef4ff;border-radius:12px}.t2om-result input{width:100%;box-sizing:border-box;margin:8px 0;min-height:42px}.t2om-result-actions{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:720px){.t2om-card{padding:18px}.t2om-grid{grid-template-columns:1fr}.t2om-wide{grid-column:auto}.t2om-actions{flex-direction:column-reverse}.t2om-actions .button{width:100%}}`;
    document.head.append(s);
  }
  function inviteLink(token) {
    return `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/cpf-invite.html?token=${encodeURIComponent(token)}`;
  }
  function open() {
    const p = profile();
    if (!["super_admin", "admin"].includes(p.role)) return;
    css();
    document.getElementById("t2OwnerModalV2")?.remove();
    const m = document.createElement("div");
    m.id = "t2OwnerModalV2";
    m.className = "t2om-backdrop";
    m.innerHTML = `<section class="t2om-card"><div class="t2om-head"><div class="t2om-title"><div class="t2om-icon">👤＋</div><div><h2>Novo proprietário</h2><p>Cadastre o proprietário e defina quais propriedades ele poderá acessar.</p></div></div><button type="button" class="t2om-x" data-close>×</button></div><form><div class="t2om-mode"><strong>Tipo de cadastro</strong><label><input type="radio" name="ownerMode" value="email" checked> E-mail</label><label><input type="radio" name="ownerMode" value="cpf"> CPF (Brasil)</label></div><div class="t2om-grid"><label>Nome completo *<input data-name required placeholder="Digite o nome completo"></label><label data-email-wrap>E-mail *<input data-email type="email" placeholder="exemplo@email.com"></label><label data-cpf-wrap>CPF <span data-cpf-note>(opcional)</span><input data-cpf placeholder="000.000.000-00"></label><label>Telefone / WhatsApp<input data-phone type="tel" placeholder="(11) 98765-4321"></label><div class="t2om-wide"><strong>Propriedades</strong><p style="margin:4px 0 8px;color:#64748b">Selecione as propriedades que este proprietário poderá acessar.</p><div class="t2om-props"></div></div><label class="t2om-wide">Mensagem de convite (opcional)<textarea data-message rows="4" maxlength="300">Olá! Você foi convidado para acessar o Stay in Control. Clique no link que será enviado e crie sua senha para começar.</textarea></label><label class="t2om-wide t2om-switch"><input data-send-now type="checkbox" checked> Enviar convite agora</label><div class="t2om-wide t2om-msg" role="status"></div></div><div class="t2om-actions"><button type="button" class="button button-secondary" data-cancel>Cancelar</button><button type="submit" class="button button-primary" data-save>Salvar e enviar convite</button></div><div class="t2om-result" hidden></div></form></section>`;
    const close = () => m.remove();
    m.querySelector("[data-close]").onclick = close;
    m.querySelector("[data-cancel]").onclick = close;
    m.onclick = (e) => {
      if (e.target === m) close();
    };
    const form = m.querySelector("form"),
      email = m.querySelector("[data-email]"),
      cpf = m.querySelector("[data-cpf]"),
      cpfNote = m.querySelector("[data-cpf-note]"),
      list = m.querySelector(".t2om-props"),
      msg = m.querySelector(".t2om-msg"),
      save = m.querySelector("[data-save]");
    const ps = props();
    if (!ps.length)
      list.innerHTML =
        '<span style="color:#64748b">Nenhuma propriedade disponível.</span>';
    else
      ps.forEach((x) => {
        const l = document.createElement("label");
        l.innerHTML = `<input type="checkbox" value="${String(x.id)}"><span>${x.unit || x.name || x.id}${x.name && x.unit && x.name !== x.unit ? " — " + x.name : ""}</span>`;
        list.append(l);
      });
    const sync = () => {
      const mode = form.querySelector('input[name="ownerMode"]:checked').value,
        isCpf = mode === "cpf";
      email.disabled = isCpf;
      email.required = !isCpf;
      cpf.required = isCpf;
      cpfNote.textContent = isCpf ? "(obrigatório)" : "(opcional)";
    };
    form.addEventListener("change", (e) => {
      if (e.target.name === "ownerMode") sync();
    });
    sync();
    form.onsubmit = async (e) => {
      e.preventDefault();
      msg.textContent = "";
      const mode = form.querySelector('input[name="ownerMode"]:checked').value,
        name = m.querySelector("[data-name]").value.trim(),
        phone = m.querySelector("[data-phone]").value.trim(),
        propertyIds = [...list.querySelectorAll("input:checked")].map(
          (x) => x.value,
        ),
        sendNow = m.querySelector("[data-send-now]").checked;
      if (!name || !propertyIds.length) {
        msg.textContent =
          "Preencha o nome e selecione pelo menos uma propriedade.";
        return;
      }
      if (mode === "cpf" && !cpfValid(cpf.value)) {
        msg.textContent = "Informe um CPF válido.";
        return;
      }
      if (mode === "email" && !email.value.trim()) {
        msg.textContent = "Informe o e-mail do proprietário.";
        return;
      }
      const c = window.AP207Supabase;
      if (!c?.functions?.invoke) {
        msg.textContent = "Serviço de convite indisponível.";
        return;
      }
      save.disabled = true;
      save.textContent = "Salvando…";
      try {
        const redirectTo = `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/invite.html?invite=1&v=${Date.now()}`,
          body =
            mode === "cpf"
              ? {
                  name,
                  role: "owner",
                  identifierType: "cpf",
                  cpf: digits(cpf.value),
                  phone,
                  propertyIds,
                  resend: false,
                }
              : {
                  name,
                  email: email.value.trim(),
                  role: "owner",
                  propertyIds,
                  redirectTo,
                  resend: false,
                };
        const { data, error } = await c.functions.invoke("invite-user", {
          body,
        });
        if (error || !data?.ok)
          throw (
            error ||
            new Error(data?.error || "Não foi possível criar o convite.")
          );
        let link = "";
        if (mode === "cpf" && data.inviteToken)
          link = inviteLink(data.inviteToken);
        const result = m.querySelector(".t2om-result");
        result.hidden = false;
        if (link) {
          result.innerHTML = `<strong>Proprietário cadastrado. Link de primeiro acesso criado.</strong><input readonly value="${link.replace(/"/g, "&quot;")}"><div class="t2om-result-actions"><button type="button" class="button button-primary" data-copy>Copiar link</button><button type="button" class="button button-secondary" data-wa>Enviar pelo WhatsApp</button></div>`;
          result.querySelector("[data-copy]").onclick = async () => {
            await navigator.clipboard?.writeText(link);
            result.querySelector("[data-copy]").textContent = "Copiado ✓";
          };
          result.querySelector("[data-wa]").onclick = () => {
            let d = digits(phone);
            if (!d)
              return alert("Informe o telefone/WhatsApp do proprietário.");
            if (d.length === 10 || d.length === 11) d = "55" + d;
            const custom =
              m.querySelector("[data-message]").value.trim() ||
              `Olá ${name}, este é seu link de primeiro acesso ao Stay in Control.`;
            window.open(
              `https://wa.me/${d}?text=${encodeURIComponent(custom + " " + link)}`,
              "_blank",
              "noopener",
            );
          };
          if (sendNow && phone) result.querySelector("[data-wa]").click();
        } else {
          result.innerHTML =
            "<strong>Proprietário cadastrado e convite enviado por e-mail.</strong>";
        }
        save.textContent = "Acesso criado ✓";
        window.dispatchEvent(new Event("stay:roles-changed"));
      } catch (err) {
        console.error(err);
        msg.textContent =
          err?.message || "Não foi possível cadastrar o proprietário agora.";
        save.disabled = false;
        save.textContent = "Salvar e enviar convite";
      }
    };
    document.body.append(m);
    requestAnimationFrame(() => m.querySelector("[data-name]")?.focus());
  }
  function boot() {
    window.Test2OpenOwnerForm = open;
    window.Test2OwnerModalV2 = { open };
    document.addEventListener(
      "click",
      (e) => {
        const b = e.target.closest?.(
          '#t2ucPropertiesHead [data-t2uc-action="new-owner"]',
        );
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        open();
      },
      true,
    );
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
