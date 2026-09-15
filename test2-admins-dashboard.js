(() => {
  "use strict";
  const AUTH = "ap207-auth-profile-v1",
    USERS = "system-control-test2-users-v1",
    INVITES = "stay-control-invitations-v1",
    COMM = "system-control-test2-commercial-v2";
  const read = (k, f) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null") || f;
    } catch {
      return f;
    }
  };
  const profile = () => read(AUTH, {})?.profile || {};
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
  const money = (v) =>
    `R$ ${Number(v || 0)
      .toFixed(2)
      .replace(".", ",")}`;
  function css() {
    if (document.getElementById("t2AdminsDashboardCss")) return;
    const s = document.createElement("style");
    s.id = "t2AdminsDashboardCss";
    s.textContent = `#t2ProfessionalAdmins{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}#t2ProfessionalAdmins>.t2pm-head,#t2ProfessionalAdmins>.t2pm-table,#t2ProfessionalAdmins>.t2ua-tabs,#t2ProfessionalAdmins>.t2ua-pane,#t2ProfessionalAdmins>.t2pm-toolbar,#t2ProfessionalAdmins>[data-t2-admin-cpf-entry],#t2ProfessionalAdmins>#t2ucAdminsHead{display:none!important}.t2ad-wrap{display:grid;gap:18px}.t2ad-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}.t2ad-top h2{font-size:30px;margin:0 0 6px}.t2ad-top p{margin:0;color:#64748b}.t2ad-new{min-height:48px;padding:0 20px;border-radius:12px;font-weight:850}.t2ad-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.t2ad-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px;display:flex;gap:14px;align-items:center}.t2ad-icon{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:#eef4ff;font-size:24px}.t2ad-card strong{display:block;font-size:26px}.t2ad-card span{color:#64748b;font-size:14px}.t2ad-tools{display:grid;grid-template-columns:1fr 220px;gap:12px}.t2ad-tools input,.t2ad-tools select{min-height:48px;border:1px solid #d8dee8;border-radius:12px;background:#fff;padding:0 14px;font:inherit}.t2ad-table-wrap{overflow:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px}.t2ad-table{width:100%;border-collapse:collapse;min-width:980px}.t2ad-table th,.t2ad-table td{text-align:left;padding:14px 16px;border-bottom:1px solid #eef1f5;vertical-align:middle}.t2ad-table th{font-size:13px;color:#475569;background:#f8fafc}.t2ad-person{display:flex;gap:10px;align-items:center}.t2ad-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#eef2ff;color:#4f46e5;font-weight:900}.t2ad-status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:850}.t2ad-status.ok{background:#dcfce7;color:#15803d}.t2ad-status.bad{background:#fee2e2;color:#b91c1c}.t2ad-status.free{background:#fef3c7;color:#92400e}.t2ad-actions{display:flex;gap:6px;flex-wrap:wrap}.t2ad-actions button{min-height:36px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;padding:0 10px;font-weight:800;cursor:pointer}.t2ad-empty{padding:30px;text-align:center;color:#64748b}@media(max-width:900px){.t2ad-metrics,.t2ad-tools{grid-template-columns:1fr}.t2ad-top .button{width:100%}}`;
    document.head.append(s);
  }
  async function fetchAdmins() {
    let rows = [];
    const c = window.AP207Supabase;
    if (c?.from) {
      try {
        const p = await c
          .from("profiles")
          .select("id,email,name,role,active,cpf,phone,login_identifier_type")
          .eq("role", "admin");
        if (!p.error) rows = p.data || [];
        const a = await c.from("property_access").select("user_id,property_id");
        const map = new Map();
        if (!a.error)
          (a.data || []).forEach((x) => {
            const v = map.get(String(x.user_id)) || [];
            v.push(String(x.property_id));
            map.set(String(x.user_id), v);
          });
        rows = rows.map((x) => ({
          ...x,
          propertyIds: map.get(String(x.id)) || [],
        }));
      } catch {
        rows = [];
      }
    }
    if (!rows.length) {
      const all = [
          ...(read(USERS, []) || []),
          ...(read(INVITES, []) || []),
        ].filter((x) => x?.role === "admin"),
        map = new Map();
      all.forEach((x) => {
        const k = String(x.id || x.userId || x.email || x.cpf || Math.random());
        if (!map.has(k))
          map.set(k, {
            ...x,
            id: k,
            propertyIds: x.propertyIds || [],
            active: x.active !== false,
          });
      });
      rows = [...map.values()];
    }
    return rows;
  }
  function maskedCpf(u) {
    const d = String(u?.cpf || "").replace(/\D/g, "");
    return d.length === 11 ? `•••.${d.slice(-3)}` : "—";
  }
  function commercialFor(u) {
    const s = read(COMM, { pricePerProperty: 10, accounts: [] }),
      keys = [u.id, u.userId, u.email, u.cpf, u.name]
        .filter(Boolean)
        .map(String),
      a = (s.accounts || []).find((x) => keys.includes(String(x.adminId))),
      units = Number(a?.units ?? (u.propertyIds || []).length),
      courtesy = Boolean(a?.courtesy);
    return {
      units,
      courtesy,
      until: a?.courtesyUntil || "",
      total: courtesy ? 0 : units * Number(s.pricePerProperty || 0),
    };
  }
  function initials(name) {
    return String(name || "A")
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0] || "")
      .join("")
      .toUpperCase();
  }
  function accessText(u) {
    return u.login_identifier_type === "cpf" || u.cpf ? "CPF" : "E-mail";
  }
  function linkFor(token) {
    return `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/cpf-invite.html?token=${encodeURIComponent(token)}`;
  }
  function phoneDigits(u) {
    let d = String(u.phone || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length === 10 || d.length === 11) d = "55" + d;
    return d;
  }
  async function createAccess(u) {
    const c = window.AP207Supabase;
    if (!c?.functions?.invoke)
      throw new Error("Serviço de convite indisponível.");
    const cpf = String(u.cpf || "").replace(/\D/g, ""),
      isCpf = u.login_identifier_type === "cpf" || cpf.length === 11,
      redirectTo = `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/invite.html?invite=1&v=${Date.now()}`,
      body = isCpf
        ? {
            name: u.name,
            role: "admin",
            identifierType: "cpf",
            cpf,
            phone: u.phone || "",
            propertyIds: u.propertyIds || [],
            resend: true,
          }
        : {
            name: u.name,
            email: u.email,
            role: "admin",
            propertyIds: u.propertyIds || [],
            redirectTo,
            resend: true,
          };
    const { data, error } = await c.functions.invoke("invite-user", { body });
    if (error || !data?.ok)
      throw (
        error || new Error(data?.error || "Não foi possível gerar o acesso.")
      );
    return {
      isCpf,
      link: isCpf && data.inviteToken ? linkFor(data.inviteToken) : redirectTo,
    };
  }
  async function accessAction(u) {
    try {
      const r = await createAccess(u);
      if (r.isCpf && r.link) {
        if (window.Test2CpfInvite?.showLink)
          window.Test2CpfInvite.showLink(r.link, u.name, "admin");
        else prompt("Link de primeiro acesso:", r.link);
      } else alert("Novo acesso enviado para o e-mail do administrador.");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Não foi possível gerar ou reenviar o acesso agora.");
    }
  }
  async function whatsappAction(u) {
    const phone = phoneDigits(u);
    if (!phone)
      return alert("Este administrador não tem número de WhatsApp cadastrado.");
    try {
      const r = await createAccess(u),
        msg =
          r.isCpf && r.link
            ? `Olá ${u.name || ""}, este é seu link de primeiro acesso ao Stay in Control: ${r.link}`
            : `Olá ${u.name || ""}, seu acesso ao Stay in Control foi enviado para ${u.email || "seu e-mail"}.`;
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener",
      );
    } catch (e) {
      console.error(e);
      alert(
        e?.message || "Não foi possível preparar o acesso para WhatsApp agora.",
      );
    }
  }
  function openPlan(u) {
    const key = String(u.id || u.userId || u.email || u.cpf || u.name);
    sessionStorage.setItem("t2-selected-plan-admin", key);
    if (!window.Test2Unified?.show?.("plans", true)) {
      location.hash = "plans";
      return;
    }
    requestAnimationFrame(() => {
      window.Test2PlansV2?.render?.();
    });
  }
  function buildRow(u) {
    const c = commercialFor(u),
      tr = document.createElement("tr"),
      status =
        u.active === false ? "Inativo" : c.courtesy ? "Cortesia" : "Ativo";
    tr.dataset.status =
      u.active === false ? "inactive" : c.courtesy ? "courtesy" : "active";
    tr.dataset.search =
      `${u.name || ""} ${u.email || ""} ${u.cpf || ""}`.toLowerCase();
    tr.innerHTML = `<td><div class="t2ad-person"><span class="t2ad-avatar">${esc(initials(u.name))}</span><div><strong>${esc(u.name || "Administrador")}</strong><div style="color:#64748b;font-size:12px">${esc(accessText(u))}</div></div></div></td><td>${esc(u.email || u.phone || "—")}</td><td>${esc(maskedCpf(u))}</td><td>${c.units}</td><td>${money(c.total)}</td><td><span class="t2ad-status ${u.active === false ? "bad" : c.courtesy ? "free" : "ok"}">${status}</span></td><td>${c.courtesy ? `Sim${c.until ? `<div style="font-size:11px;color:#64748b">até ${esc(c.until)}</div>` : ""}` : "Não"}</td><td><div class="t2ad-actions"><button type="button" data-act="plan">Plano</button><button type="button" data-act="access">Acesso</button><button type="button" data-act="wa">WhatsApp</button></div></td>`;
    tr.querySelector('[data-act="plan"]').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPlan(u);
    };
    tr.querySelector('[data-act="access"]').onclick = () => accessAction(u);
    tr.querySelector('[data-act="wa"]').onclick = () => whatsappAction(u);
    return tr;
  }
  async function render() {
    if (profile().role !== "super_admin") return;
    const root = document.getElementById("t2ProfessionalAdmins");
    if (!root) return;
    css();
    root
      .querySelectorAll(
        ".t2pm-toolbar,[data-t2-admin-cpf-entry],#t2ucAdminsHead",
      )
      .forEach((x) => x.style.setProperty("display", "none", "important"));
    let shell = root.querySelector(".t2ad-wrap");
    if (!shell) {
      shell = document.createElement("div");
      shell.className = "t2ad-wrap";
      root.append(shell);
    }
    const rows = await fetchAdmins(),
      commercial = rows.map(commercialFor),
      totalUnits = commercial.reduce((s, x) => s + x.units, 0),
      monthly = commercial.reduce((s, x) => s + x.total, 0);
    shell.innerHTML = `<div class="t2ad-top"><div><h2>Administradores</h2><p>Gerencie administradores, acessos, quantidade de unidades e cortesia.</p></div><button type="button" class="button button-primary t2ad-new">+ Novo administrador</button></div><div class="t2ad-metrics"><article class="t2ad-card"><span class="t2ad-icon">👥</span><div><strong>${rows.length}</strong><span>Administradores</span></div></article><article class="t2ad-card"><span class="t2ad-icon">🏠</span><div><strong>${totalUnits}</strong><span>Total de unidades</span></div></article><article class="t2ad-card"><span class="t2ad-icon">$</span><div><strong>${money(monthly)}</strong><span>Receita mensal estimada</span></div></article></div><div class="t2ad-tools"><input type="search" placeholder="Buscar por nome, e-mail ou CPF…"><select><option value="all">Todos os status</option><option value="active">Ativos</option><option value="courtesy">Cortesia</option><option value="inactive">Inativos</option></select></div><div class="t2ad-table-wrap"><table class="t2ad-table"><thead><tr><th>Nome</th><th>Contato</th><th>CPF</th><th>Unidades</th><th>Valor mensal</th><th>Status</th><th>Cortesia</th><th>Ações</th></tr></thead><tbody></tbody></table><div class="t2ad-empty" hidden>Nenhum administrador encontrado.</div></div>`;
    shell.querySelector(".t2ad-new").onclick = () =>
      window.Test2UnifiedInviteUser?.open?.("admin");
    const body = shell.querySelector("tbody");
    rows.forEach((u) => body.append(buildRow(u)));
    const search = shell.querySelector("input"),
      filter = shell.querySelector("select"),
      empty = shell.querySelector(".t2ad-empty"),
      apply = () => {
        const q = search.value.trim().toLowerCase(),
          st = filter.value;
        let visible = 0;
        [...body.rows].forEach((r) => {
          const show =
            (!q || r.dataset.search.includes(q)) &&
            (st === "all" || r.dataset.status === st);
          r.hidden = !show;
          if (show) visible++;
        });
        empty.hidden = visible > 0;
      };
    search.oninput = apply;
    filter.onchange = apply;
  }
  function boot() {
    window.Test2AdminsDashboard = { render };
    const ready = () => document.getElementById("t2ProfessionalAdmins");
    if (ready()) render();
    else {
      const root = document.getElementById("t2Suite") || document.body,
        obs = new MutationObserver(() => {
          if (ready()) {
            obs.disconnect();
            render();
          }
        });
      obs.observe(root, { childList: true, subtree: true });
    }
    window.addEventListener("stay:unified-navigation", (e) => {
      if (e.detail?.route === "admins") render();
    });
    window.addEventListener("stay:roles-changed", render);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
