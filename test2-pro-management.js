(() => {
  "use strict";
  const AUTH = "ap207-auth-profile-v1",
    PROPS = "ap207-dashboard-properties-v1",
    USERS = "system-control-test2-users-v1",
    COMM = "system-control-test2-commercial-v2",
    INVITES = "stay-control-invitations-v1",
    OWNER_DETAILS = "system-control-test2-owner-details-v1";
  const read = (k, f) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "null") || f;
      } catch {
        return f;
      }
    },
    write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const auth = () => read(AUTH, {}),
    profile = () => auth()?.profile || {},
    role = () => profile().role || "owner";
  function el(tag, cls, text) {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  }
  function panel(id, title, sub) {
    const root = document.getElementById("t2Suite");
    if (!root) return null;
    let p = document.getElementById(id);
    if (p) return p;
    p = el("section", "panel t2pm-panel");
    p.id = id;
    p.hidden = true;
    const head = el("div", "t2pm-head");
    head.append(el("div", "", null));
    head.firstChild.append(
      el("p", "eyebrow", "STAY IN CONTROL"),
      el("h2", "", title),
      el("p", "t2-muted", sub),
    );
    p.append(head);
    root.append(p);
    return p;
  }
  function card(title, value, meta = "") {
    const c = el("article", "t2pm-card");
    c.append(el("small", "", title), el("strong", "", String(value)));
    if (meta) c.append(el("span", "", meta));
    return c;
  }
  function visibleProperties() {
    const ps = read(PROPS, { properties: [] }).properties || [],
      a = auth(),
      p = profile();
    if (p.role === "super_admin") return ps;
    const ids = new Set(
      (a.propertyIds || p.propertyIds || p.property_ids || []).map(String),
    );
    return ps.filter((x) => ids.has(String(x.id)));
  }
  async function inviteOwner(data) {
    const client = window.AP207Supabase;
    if (!client?.functions?.invoke) throw new Error("SERVICE");
    const redirectTo = `https://stay-in-control-git-main-marcelinhone-9670s-projects.vercel.app/invite.html?invite=1&v=${Date.now()}`;
    const { data: r, error } = await client.functions.invoke("invite-user", {
      body: {
        name: data.name,
        email: data.email,
        role: "owner",
        propertyIds: data.propertyIds,
        redirectTo,
        resend: false,
      },
    });
    if (error || !r?.ok) throw new Error("INVITE");
    const all = read(INVITES, []),
      item = {
        id: "invite-" + Date.now(),
        name: data.name,
        email: data.email,
        role: "owner",
        propertyIds: data.propertyIds,
        createdBy: profile().id,
        status: "sent",
        sendCount: 1,
        sentAt: new Date().toISOString(),
        redirectTo,
      };
    const idx = all.findIndex(
      (x) => String(x.email || "").toLowerCase() === data.email.toLowerCase(),
    );
    if (idx >= 0) all[idx] = item;
    else all.push(item);
    write(INVITES, all);
    const details = read(OWNER_DETAILS, {});
    details[data.email.toLowerCase()] = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    write(OWNER_DETAILS, details);
    return item;
  }
  function openNewProperty() {
    window.Test2Unified?.show?.("properties", false);
    if (window.SystemControlPropertyManager?.open) {
      window.SystemControlPropertyManager.open();
      return;
    }
    const add = document.getElementById("newPropertyButton");
    if (!add) {
      alert("A área de propriedades ainda não está pronta.");
      return;
    }
    add.click();
  }
  async function properties() {
    const p = panel(
      "t2ProfessionalProperties",
      "Propriedades",
      "Gerencie todas as unidades e acompanhe o desempenho de cada uma.",
    );
    if (!p || p.dataset.ready || p.dataset.loading) return;
    p.dataset.loading = "1";
    let data = read(PROPS, { properties: [] }).properties || [];
    const client = window.AP207Supabase;
    if (client?.from) {
      try {
        const { data: live, error } = await client
          .from("properties")
          .select(
            "id,name,unit,owner_name,owner_id,city,state,country,address,administrator_id,deleted_at",
          )
          .is("deleted_at", null);
        if (!error && Array.isArray(live)) {
          data = live.map((x) => ({
            ...x,
            ownerName: x.owner_name || "Sem proprietário",
            ownerId: x.owner_id || "unassigned-owner",
            administratorId: x.administrator_id || "unassigned-admin",
            active: true,
          }));
          write(PROPS, { version: 1, properties: data });
        }
      } catch {}
    }
    p.dataset.ready = "1";
    delete p.dataset.loading;
    const grid = el("div", "t2pm-grid");
    grid.append(
      card("Total de propriedades", data.length),
      card("Ativas", data.filter((x) => x?.active !== false).length),
      card("Cidades", new Set(data.map((x) => x?.city).filter(Boolean)).size),
    );
    p.append(grid);
    const table = el("table", "t2pm-table");
    table.innerHTML =
      "<thead><tr><th>Unidade</th><th>Proprietário</th><th>Cidade</th><th>Status</th><th>Ação</th></tr></thead><tbody></tbody>";
    const body = table.querySelector("tbody");
    data.forEach((x) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${x.name || x.unit || x.id || "—"}</td><td>${x.owner || x.ownerName || "—"}</td><td>${[x.city, x.state].filter(Boolean).join(" • ") || "—"}</td><td><span class="t2pm-badge ok">${x.active === false ? "Inativa" : "Ativa"}</span></td><td><button type="button" class="button button-secondary">Abrir</button></td>`;
      tr.querySelector("button").onclick = () => {
        const sel = document.getElementById("propertySelector");
        if (sel) {
          sel.value = String(x.id || "");
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
        window.Test2Unified?.show?.("home", true);
      };
      body.append(tr);
    });
    if (!data.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="5">Nenhuma propriedade cadastrada.</td>';
      body.append(tr);
    }
    p.append(table);
  }
  function ownerForm(p) {
    let box = document.getElementById("t2OwnerCreateBox");
    if (box) {
      box.hidden = false;
      box.scrollIntoView({ behavior: "auto", block: "start" });
      requestAnimationFrame(() => box.querySelector("#t2OwnerName")?.focus());
      return;
    }
    box = el("section", "t2pm-create-box");
    box.id = "t2OwnerCreateBox";
    box.innerHTML =
      '<div class="t2pm-create-head"><div><p class="eyebrow">NOVO PROPRIETÁRIO</p><h3>Cadastrar proprietário</h3><p class="t2-muted">Cadastre os dados do proprietário e vincule uma ou várias propriedades.</p></div><button type="button" class="button button-secondary" data-close>Fechar</button></div><form id="t2OwnerCreateForm" class="t2pm-create-form"><div class="t2pm-form-section"><h4>Dados pessoais e contato</h4><div class="t2pm-form-grid"><label>Nome completo<input id="t2OwnerName" required></label><label>E-mail<input id="t2OwnerEmail" type="email" required></label><label>WhatsApp <span>(opcional)</span><input id="t2OwnerPhone" type="tel"></label><label>CPF / Documento <span>(opcional)</span><input id="t2OwnerDocument"></label></div></div><div class="t2pm-form-section"><h4>Endereço do proprietário</h4><div class="t2pm-form-grid"><label class="wide">Endereço / Rua<input id="t2OwnerAddress"></label><label>Número<input id="t2OwnerAddressNumber"></label><label>Complemento <span>(opcional)</span><input id="t2OwnerAddressExtra"></label><label>Bairro <span>(opcional)</span><input id="t2OwnerDistrict"></label><label>Cidade<input id="t2OwnerCity"></label><label>Estado / Província<input id="t2OwnerState"></label><label>CEP / Código postal<input id="t2OwnerZip"></label><label>País<select id="t2OwnerCountry"><option value="BR">Brasil</option><option value="US">Estados Unidos</option><option value="PT">Portugal</option><option value="OTHER">Outro país</option></select></label></div></div><div class="t2pm-form-section"><h4>Propriedades vinculadas</h4><p class="t2-muted">Selecione uma ou várias unidades já cadastradas.</p><div id="t2OwnerProps" class="t2pm-owner-props"></div></div><p id="t2OwnerMsg" class="t2pm-form-msg"></p><div class="t2pm-form-actions"><button type="submit" class="button button-primary">Salvar e enviar acesso</button><button type="button" class="button button-secondary" data-cancel>Cancelar</button></div></form>';
    p.insertBefore(box, p.querySelector(".t2pm-table"));
    const list = box.querySelector("#t2OwnerProps");
    visibleProperties().forEach((x) => {
      const lab = document.createElement("label");
      lab.className = "t2pm-prop-option";
      lab.innerHTML = `<input type="checkbox" value="${String(x.id)}"><span><strong>${x.unit || x.id} — ${x.name || "Propriedade"}</strong></span>`;
      list.append(lab);
    });
    const close = () => {
      box.hidden = true;
      box.querySelector("form").reset();
    };
    box.querySelector("[data-close]").onclick = close;
    box.querySelector("[data-cancel]").onclick = close;
    box.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      const msg = box.querySelector("#t2OwnerMsg"),
        btn = e.submitter,
        name = box.querySelector("#t2OwnerName").value.trim(),
        email = box.querySelector("#t2OwnerEmail").value.trim(),
        propertyIds = [
          ...box.querySelectorAll("#t2OwnerProps input:checked"),
        ].map((x) => x.value);
      if (!name || !email || !propertyIds.length) {
        msg.textContent =
          "Preencha nome, e-mail e selecione pelo menos uma propriedade.";
        return;
      }
      btn.disabled = true;
      try {
        await inviteOwner({
          name,
          email,
          propertyIds,
          phone: "",
          document: "",
          address: "",
          addressNumber: "",
          addressExtra: "",
          district: "",
          city: "",
          state: "",
          zip: "",
          country: "BR",
        });
        location.reload();
      } catch {
        msg.textContent = "Não foi possível enviar o acesso agora.";
        btn.disabled = false;
      }
    };
  }
  function people(kind) {
    const isAdmin = kind === "admins",
      id = isAdmin ? "t2ProfessionalAdmins" : "t2ProfessionalOwners",
      title = isAdmin ? "Administradores" : "Proprietários",
      sub = isAdmin
        ? "Controle administradores, acesso, propriedades e status."
        : "Visualize proprietários e as unidades vinculadas.";
    const p = panel(id, title, sub);
    if (!p || p.dataset.ready) return;
    p.dataset.ready = "1";
    const users = read(USERS, []).filter((x) =>
      isAdmin ? x.role === "admin" : x.role === "owner",
    );
    const table = el("table", "t2pm-table");
    table.innerHTML =
      "<thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Status</th><th>Propriedades</th></tr></thead><tbody></tbody>";
    const body = table.querySelector("tbody");
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.name || "—"}</td><td>${u.email || "—"}</td><td>${isAdmin ? "Administrador" : "Proprietário"}</td><td>${u.active === false ? "Bloqueado" : "Ativo"}</td><td>${Array.isArray(u.propertyIds) ? u.propertyIds.length : 0}</td>`;
      body.append(tr);
    });
    p.append(table);
    if (!isAdmin) window.Test2OpenOwnerForm = () => ownerForm(p);
  }
  function commercial() {
    if (role() !== "super_admin") return;
    const p = panel(
      "t2ProfessionalPlans",
      "Planos & Pagamentos",
      "Defina o preço por unidade e a quantidade contratada de cada administrador.",
    );
    if (!p || p.dataset.ready) return;
    p.dataset.ready = "1";
    let s = read(COMM, null) || {
      pricePerProperty: 10,
      currency: "BRL",
      accounts: [],
    };
    if (!Array.isArray(s.accounts)) s.accounts = [];
    const money = (v) =>
      `R$ ${Number(v || 0)
        .toFixed(2)
        .replace(".", ",")}`;
    const saveStore = () => write(COMM, s);
    saveStore();
    const grid = el("div", "t2pm-grid");
    const priceCard = card(
        "Preço por unidade",
        money(s.pricePerProperty),
        "por unidade / mês",
      ),
      admins = read(USERS, []).filter((x) => x.role === "admin"),
      active = s.accounts.filter(
        (x) => !x.courtesy && Number(x.units) > 0,
      ).length;
    grid.append(
      priceCard,
      card("Administradores com plano", active),
      card("Modelo comercial", "Por unidade", "sem planos fixos"),
    );
    p.append(grid);
    const priceBox = el("div", "t2pm-settings");
    priceBox.innerHTML =
      '<div><h3>Preço por unidade / mês</h3><p class="t2-muted">Este valor multiplica automaticamente pela quantidade contratada de cada administrador.</p></div>';
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.min = "0";
    priceInput.step = ".01";
    priceInput.value = String(s.pricePerProperty || 10);
    priceInput.style.maxWidth = "180px";
    const priceSave = el("button", "button button-primary", "Salvar preço");
    priceSave.type = "button";
    priceSave.style.marginLeft = "10px";
    priceSave.onclick = () => {
      const v = Number(priceInput.value);
      if (!Number.isFinite(v) || v < 0)
        return alert("Informe um valor válido.");
      s.pricePerProperty = v;
      saveStore();
      priceCard.querySelector("strong").textContent = money(v);
      renderAccounts();
      alert("Preço por unidade atualizado.");
    };
    priceBox.append(priceInput, priceSave);
    p.append(priceBox);
    const area = el("div", "t2pm-settings");
    const title = el("div");
    title.innerHTML =
      '<h3>Plano por administrador</h3><p class="t2-muted">Escolha qualquer quantidade de unidades. O total mensal é calculado automaticamente. Cortesia zera a cobrança sem alterar o limite de unidades.</p>';
    area.append(title);
    const rows = el("div", "t2pm-plan-accounts");
    area.append(rows);
    p.append(area);
    function accountFor(u) {
      const key = String(u.id || u.email || u.name);
      let a = s.accounts.find((x) => String(x.adminId) === key);
      if (!a) {
        a = {
          adminId: key,
          adminName: u.name || u.email || "Administrador",
          units: Array.isArray(u.propertyIds) ? u.propertyIds.length : 0,
          courtesy: false,
          courtesyUntil: "",
          status: "active",
        };
        s.accounts.push(a);
        saveStore();
      }
      return a;
    }
    function renderAccounts() {
      rows.replaceChildren();
      admins.forEach((u) => {
        const a = accountFor(u),
          row = el("section", "t2pm-create-box");
        row.style.margin = "12px 0";
        const head = el("div", "t2pm-create-head");
        const info = el("div");
        info.innerHTML = `<h4>${u.name || u.email || "Administrador"}</h4><p class="t2-muted">${u.email || ""}</p>`;
        const total = el(
          "strong",
          "",
          a.courtesy
            ? "Cortesia"
            : money(Number(a.units || 0) * Number(s.pricePerProperty || 0)) +
                "/mês",
        );
        head.append(info, total);
        row.append(head);
        const form = el("div", "t2pm-form-grid");
        const unitLab = el("label", "", "Quantidade de unidades");
        const units = document.createElement("input");
        units.type = "number";
        units.min = "0";
        units.step = "1";
        units.value = String(a.units || 0);
        unitLab.append(units);
        const courtesyLab = el("label", "", "Cortesia");
        const courtesy = document.createElement("select");
        courtesy.innerHTML =
          '<option value="no">Não</option><option value="yes">Sim</option>';
        courtesy.value = a.courtesy ? "yes" : "no";
        courtesyLab.append(courtesy);
        const untilLab = el("label", "", "Cortesia até (opcional)");
        const until = document.createElement("input");
        until.type = "date";
        until.value = a.courtesyUntil || "";
        until.disabled = !a.courtesy;
        untilLab.append(until);
        const calc = el(
          "div",
          "t2pm-owner-note",
          `Total mensal: ${a.courtesy ? "R$ 0,00 — Cortesia" : money(Number(a.units || 0) * Number(s.pricePerProperty || 0))}`,
        );
        const save = el("button", "button button-primary", "Salvar vínculo");
        save.type = "button";
        const refresh = () => {
          const n = Math.max(0, Math.floor(Number(units.value) || 0)),
            free = courtesy.value === "yes";
          until.disabled = !free;
          calc.textContent = `Total mensal: ${free ? "R$ 0,00 — Cortesia" : money(n * Number(s.pricePerProperty || 0))}`;
          total.textContent = free
            ? "Cortesia"
            : money(n * Number(s.pricePerProperty || 0)) + "/mês";
        };
        units.oninput = refresh;
        courtesy.onchange = refresh;
        save.onclick = () => {
          a.units = Math.max(0, Math.floor(Number(units.value) || 0));
          a.courtesy = courtesy.value === "yes";
          a.courtesyUntil = a.courtesy ? until.value : "";
          a.status = "active";
          a.updatedAt = new Date().toISOString();
          saveStore();
          refresh();
          alert(`Plano de ${a.adminName} atualizado.`);
        };
        form.append(unitLab, courtesyLab, untilLab);
        row.append(form, calc, save);
        rows.append(row);
      });
      if (!admins.length)
        rows.append(
          el("p", "t2-muted", "Nenhum administrador cadastrado para vincular."),
        );
    }
    renderAccounts();
  }
  function settings() {
    const p = panel(
      "t2ProfessionalSettings",
      "Configurações",
      "Preferências do sistema, idioma, perfil e segurança.",
    );
    if (!p || p.dataset.ready) return;
    p.dataset.ready = "1";
    const box = el("div", "t2pm-settings");
    box.innerHTML =
      '<div><h3>Idioma</h3><p class="t2-muted">O idioma selecionado deve ser aplicado a todo o sistema.</p></div><div><h3>Segurança da sessão</h3><p class="t2-muted">Sessão protegida e controle de acesso por perfil.</p></div>';
    p.append(box);
  }
  let initialized = false;
  function boot() {
    if (initialized) return true;
    if (
      !document.body.classList.contains("ap207-authenticated") ||
      !document.getElementById("t2Suite") ||
      !document.querySelector(".t2-pro-menu")
    )
      return false;
    initialized = true;
    properties();
    if (role() !== "owner") people("owners");
    if (role() === "super_admin") {
      people("admins");
      commercial();
    }
    settings();
    window.dispatchEvent(new Event("stay:management-ready"));
    return true;
  }
  function start() {
    if (boot()) return;
    let attempts = 0;
    const observer = new MutationObserver(() => {
      if (boot()) finish();
    });
    const timer = setInterval(() => {
      attempts += 1;
      if (boot() || attempts >= 120) finish();
    }, 250);
    function finish() {
      clearInterval(timer);
      observer.disconnect();
    }
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
