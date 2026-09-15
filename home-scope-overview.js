(() => {
  "use strict";
  const RES = "ap207-dashboard-reservations-v1",
    EXP = "ap207-dashboard-expenses-v1",
    PROPS = "ap207-dashboard-properties-v1",
    AUTH = "ap207-auth-profile-v1",
    SCOPE = "stay-home-scope-v1",
    INVITES = "stay-control-invitations-v1";
  const money = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    MONTHS = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
  const read = (k, f) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "null") || f;
      } catch {
        return f;
      }
    },
    save = (k, v) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    },
    profile = () =>
      read(AUTH, {
        profile: { role: "super_admin", name: "Super Administrador" },
      }).profile || { role: "super_admin" };
  let liveAdmins = [];
  function normalizeProps(list) {
    return (list || []).map((p) => {
      const key = `${p.id || ""} ${p.name || ""} ${p.unit || ""}`.toLowerCase();
      return key.includes("ap207") || /\b207\b/.test(key)
        ? {
            ...p,
            ownerName: p.ownerName || "Marcelo Estevão",
            ownerId: p.ownerId || "user-marcelo",
          }
        : p;
    });
  }
  async function attachLiveAdministrators(list) {
    const client = window.AP207Supabase;
    if (!client?.from || profile().role !== "super_admin") return list;
    try {
      const [profilesResult, accessResult] = await Promise.all([
        client
          .from("profiles")
          .select("id,email,name,role,active")
          .eq("role", "admin")
          .eq("active", true),
        client.from("property_access").select("user_id,property_id"),
      ]);
      if (profilesResult.error || accessResult.error) return list;
      liveAdmins = profilesResult.data || [];
      const byId = new Map(liveAdmins.map((user) => [String(user.id), user])),
        byProperty = new Map();
      (accessResult.data || []).forEach((access) => {
        const user = byId.get(String(access.user_id));
        if (!user) return;
        const key = String(access.property_id),
          current = byProperty.get(key) || [];
        current.push(user);
        byProperty.set(key, current);
      });
      const augmented = list.map((property) => {
        const admins = byProperty.get(String(property.id)) || [];
        return {
          ...property,
          administratorIds: admins.map((user) => String(user.id)),
          administratorNames: admins.map(
            (user) => user.name || user.email || "Administrador",
          ),
        };
      });
      window.__stayHomeDirectory = {
        properties: augmented,
        admins: liveAdmins,
      };
      return augmented;
    } catch {
      return list;
    }
  }
  async function props() {
    const x = read(PROPS, null);
    let list =
      Array.isArray(x?.properties) && x.properties.length ? x.properties : [];
    if (!list.length)
      try {
        const r = await fetch("./data.json", { cache: "no-store" }),
          d = await r.json();
        list = d.properties || [];
      } catch {
        list = [];
      }
    return attachLiveAdministrators(normalizeProps(list));
  }
  function records(k, p, f) {
    const x = read(`${k}:${p.id}`, null);
    if (Array.isArray(x?.[f])) return x[f];
    if (`${p.id} ${p.name} ${p.unit}`.toLowerCase().includes("207")) {
      const y = read(k, null);
      if (Array.isArray(y?.[f])) return y[f];
    }
    return [];
  }
  function adminId(p) {
    return String(
      p.administratorIds?.[0] || p.administratorId || p.adminId || "",
    );
  }
  function users() {
    const x = read(INVITES, []);
    return [...(Array.isArray(x) ? x : []), ...liveAdmins];
  }
  function adminEntries(p) {
    const names = Array.isArray(p.administratorNames)
        ? p.administratorNames
        : [],
      ids = Array.isArray(p.administratorIds) ? p.administratorIds : [];
    if (names.length)
      return names.map((name, index) => ({
        id: String(ids[index] || `name:${name}`),
        name,
      }));
    const direct = p.administratorName || p.adminName;
    if (direct && !/^unassigned|administrador removido/i.test(String(direct)))
      return [{ id: adminId(p) || `name:${direct}`, name: direct }];
    return users()
      .filter(
        (user) =>
          user?.role === "admin" &&
          (user.propertyIds || []).map(String).includes(String(p.id)),
      )
      .map((user) => ({
        id: String(user.id || user.userId || user.email || user.name),
        name: user.name || user.fullName || user.email || "Administrador",
      }));
  }
  function adminName(p) {
    const pr = profile();
    if (pr.role === "admin") return pr.name || pr.email || "—";
    const entries = adminEntries(p);
    if (entries.length) return entries.map((entry) => entry.name).join(", ");
    const id = adminId(p),
      u = users().find(
        (x) =>
          x?.role === "admin" &&
          (String(x.id || x.userId || "") === id ||
            String(x.email || "").toLowerCase() === id.toLowerCase() ||
            (x.propertyIds || []).map(String).includes(String(p.id))),
      );
    return (
      u?.name ||
      u?.fullName ||
      u?.email ||
      (id === "user-gestor"
        ? "Gestor AP207"
        : id && !/^unassigned/i.test(id)
          ? id
          : "—")
    );
  }
  function allowed(ps, pr) {
    if (pr.role === "super_admin") return ps;
    const ids = new Set(
      (
        read(AUTH, { propertyIds: [] }).propertyIds ||
        pr.propertyIds ||
        pr.property_ids ||
        []
      ).map(String),
    );
    if (ids.size) return ps.filter((p) => ids.has(String(p.id)));
    if (pr.role === "admin")
      return ps.filter(
        (p) =>
          adminId(p) === String(pr.id || pr.userId || "") ||
          /^unassigned/i.test(adminId(p)),
      );
    return ps.filter(
      (p) =>
        String(p.ownerId || "") === String(pr.id || pr.userId || "") ||
        String(p.ownerName || "") === String(pr.name || ""),
    );
  }
  function dateOf(x) {
    return new Date(x.checkIn || x.date || x.createdAt || 0);
  }
  function inPeriod(x, m, y) {
    const d = dateOf(x);
    return (
      !isNaN(d) &&
      d.getFullYear() === y &&
      (m === "all" || d.getMonth() === Number(m))
    );
  }
  function calc(list, m, y) {
    let reservations = 0,
      nights = 0,
      gross = 0,
      clean = 0,
      commission = 0,
      expenses = 0;
    list.forEach((p) => {
      records(RES, p, "reservations")
        .filter((r) => r.status !== "Cancelada" && inPeriod(r, m, y))
        .forEach((r) => {
          reservations++;
          gross += Number(r.gross) || 0;
          const cleaningMode = ["included", "separate", "none"].includes(
              r.cleaningMode,
            )
              ? r.cleaningMode
              : "included",
            rawCleaning = Math.max(0, Number(r.cleaningFee ?? r.cleaning) || 0),
            c = cleaningMode === "included" ? rawCleaning : 0,
            rate =
              Number(r.commissionRate ?? p.commissionRate ?? p.commission) || 0;
          clean += c;
          commission += ((Number(r.gross || 0) - c) * rate) / 100;
          const a = new Date(r.checkIn),
            b = new Date(r.checkOut);
          if (!isNaN(a) && !isNaN(b)) nights += Math.max(0, (b - a) / 86400000);
        });
      expenses += records(EXP, p, "expenses")
        .filter((e) => inPeriod(e, m, y))
        .reduce((s, e) => s + (Number(e.value) || 0), 0);
    });
    return {
      reservations,
      nights,
      gross,
      clean,
      commission,
      expenses,
      net: gross - clean - commission - expenses,
    };
  }
  function set(id, v) {
    const e = document.getElementById(id);
    if (e) e.textContent = v;
  }
  function applyMetrics(t) {
    set("periodCount", String(Math.round(t.reservations)));
    set("nightCount", String(Math.round(t.nights)));
    set("grossTotal", money.format(t.gross));
    set("netTotal", money.format(t.net));
    set("summaryGross", money.format(t.gross));
    set("summaryCleaning", money.format(t.clean));
    set("summaryCommission", money.format(t.commission));
    set(
      "summaryNetBeforeExpenses",
      money.format(t.gross - t.clean - t.commission),
    );
    set("summaryExpenses", money.format(t.expenses));
    set("summaryNet", money.format(t.net));
  }
  function syncActiveProperty(id) {
    if (!id || id === "all") return;
    const g = document.getElementById("propertySelector");
    if (g && g.value !== id && [...g.options].some((o) => o.value === id)) {
      g.value = id;
      g.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  function prepareHeader() {
    const h = document.querySelector(".page-header");
    if (!h) return null;
    ["propertySelector", "userSelector"].forEach((id) => {
      const e = document.getElementById(id),
        l = document.querySelector(`label[for="${id}"]`);
      if (e) e.style.display = "none";
      if (l) l.style.display = "none";
    });
    const now = new Date(),
      ml = document.getElementById("monthLabel");
    if (ml) {
      ml.textContent = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
      ml.style.display = "none";
    }
    return h;
  }
  function syncHeader(list) {
    if (list.length !== 1) return;
    const p = list[0],
      pr = profile(),
      owner = document.getElementById("ownerName"),
      title = document.getElementById("propertyName"),
      sub = document.getElementById("subtitle");
    let adm = document.getElementById("administratorName");
    if (owner && !adm) {
      adm = document.createElement("p");
      adm.id = "administratorName";
      adm.className = "eyebrow";
      owner.insertAdjacentElement("beforebegin", adm);
    }
    if (adm)
      adm.textContent =
        pr.role === "owner"
          ? `Proprietário: ${pr.name || pr.email || "—"}`
          : `Administrador: ${pr.role === "admin" ? pr.name || pr.email || "—" : adminName(p)}`;
    if (owner) {
      owner.style.display = pr.role === "owner" ? "none" : "";
      if (pr.role !== "owner")
        owner.textContent = "Proprietário: " + (p.ownerName || "—");
    }
    if (title)
      title.textContent =
        "Unidade: " +
        ([p.name, p.unit]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(" / ") || "—");
    if (sub) sub.textContent = [p.city, p.state].filter(Boolean).join(" • ");
  }
  async function install() {
    const home = document.querySelector('[data-screen-panel="home"]'),
      heading = home?.querySelector(".screen-heading"),
      header = prepareHeader();
    if (
      !home ||
      !heading ||
      !header ||
      document.getElementById("homeScopePanel")
    )
      return false;
    const pr = profile(),
      all = allowed(await props(), pr),
      now = new Date(),
      box = document.createElement("section");
    box.id = "homeScopePanel";
    box.className = "no-print";
    box.style.cssText =
      "margin:0 0 16px;padding:0;background:transparent;border:0;box-shadow:none";
    box.innerHTML =
      '<p class="eyebrow">Visão geral</p><h2 style="margin:4px 0 14px">Selecionar visão da conta</h2><div class="reservation-form" style="margin-top:8px"><div class="field" id="homeAdminField" hidden><label>Administrador</label><select id="homeAdmin"></select></div><div class="field"><label>Proprietário</label><select id="homeOwner"></select></div><div class="field"><label>Propriedade / unidade</label><select id="homeUnit"></select></div><div class="field"><label>Mês</label><select id="homeMonth"></select></div><div class="field"><label>Ano</label><select id="homeYear"></select></div></div><p id="homeScopeLabel" style="margin:12px 0 0;color:#64748b;font-weight:700"></p>';
    const administration = document.getElementById("propertySettings");
    if (administration)
      administration.insertAdjacentElement("beforebegin", box);
    else heading.insertAdjacentElement("afterend", box);
    const af = box.querySelector("#homeAdminField"),
      as = box.querySelector("#homeAdmin"),
      os = box.querySelector("#homeOwner"),
      us = box.querySelector("#homeUnit"),
      ms = box.querySelector("#homeMonth"),
      ys = box.querySelector("#homeYear"),
      label = box.querySelector("#homeScopeLabel");
    ms.add(new Option("Todos os meses", "all"));
    MONTHS.forEach((n, i) => ms.add(new Option(n, String(i))));
    for (let y = now.getFullYear(); y >= now.getFullYear() - 10; y--)
      ys.add(new Option(String(y), String(y)));
    ms.value = "all";
    ys.value = String(now.getFullYear());
    let base = all;
    if (pr.role === "super_admin") {
      af.hidden = false;
      const admins = [
        ...new Map(
          all.flatMap(adminEntries).map((entry) => [entry.id, entry.name]),
        ).entries(),
      ].filter((x) => x[1] && x[1] !== "—");
      as.innerHTML =
        '<option value="all">Todos os administradores</option>' +
        admins.map(([id, n]) => `<option value="${id}">${n}</option>`).join("");
      as.value = "all";
    } else {
      as.innerHTML = '<option value="self">Visão geral da minha conta</option>';
      as.disabled = true;
    }
    function adminBase() {
      return pr.role === "super_admin" && as.value !== "all"
        ? all.filter((p) =>
            adminEntries(p).some((entry) => entry.id === as.value),
          )
        : all;
    }
    function owners() {
      base = adminBase();
      const map = [
        ...new Map(
          base.map((p) => [
            p.ownerName || p.ownerId,
            p.ownerName || "Sem proprietário",
          ]),
        ).entries(),
      ];
      os.innerHTML =
        '<option value="all">Todos os proprietários</option>' +
        map.map(([id, n]) => `<option value="${id}">${n}</option>`).join("");
      os.value = "all";
      units();
    }
    function units() {
      const oid = os.value,
        list =
          oid === "all"
            ? base
            : base.filter((p) => (p.ownerName || p.ownerId) === oid);
      us.innerHTML =
        '<option value="all">Todas as propriedades/unidades</option>' +
        list
          .map(
            (p) =>
              `<option value="${p.id}">${p.unit || p.name} — ${p.name}</option>`,
          )
          .join("");
      us.value = "all";
      render();
    }
    function selected() {
      let list = base;
      if (os.value !== "all")
        list = list.filter((p) => (p.ownerName || p.ownerId) === os.value);
      if (us.value !== "all")
        list = list.filter((p) => String(p.id) === String(us.value));
      return list;
    }
    function render() {
      const list = selected(),
        m = ms.value,
        y = Number(ys.value),
        t = calc(list, m, y),
        scope = {
          admin: pr.role === "super_admin" ? as.value : "self",
          owner: os.value,
          property: us.value,
          propertyIds: list.map((p) => String(p.id)),
          month: m === "all" ? null : Number(m),
          monthMode: m,
          year: y,
        };
      save(SCOPE, scope);
      if (us.value !== "all") syncActiveProperty(us.value);
      syncHeader(list);
      applyMetrics(t);
      const period =
        m === "all" ? `Todos os meses de ${y}` : `${MONTHS[Number(m)]} de ${y}`;
      label.textContent =
        period +
        " • " +
        (us.value !== "all"
          ? `Unidade: ${us.selectedOptions[0]?.textContent}`
          : os.value !== "all"
            ? `Proprietário: ${os.selectedOptions[0]?.textContent}`
            : pr.role === "super_admin" && as.value !== "all"
              ? `Administrador: ${as.selectedOptions[0]?.textContent}`
              : "Visão geral da conta");
      const detail = { ...scope, metrics: t };
      window.__stayHomeScope = detail;
      window.dispatchEvent(new CustomEvent("stay:scope-change", { detail }));
    }
    as.addEventListener("change", owners);
    os.addEventListener("change", () => {
      const oid = os.value,
        list =
          oid === "all"
            ? base
            : base.filter((p) => (p.ownerName || p.ownerId) === oid);
      us.innerHTML =
        '<option value="all">Todas as propriedades/unidades</option>' +
        list
          .map(
            (p) =>
              `<option value="${p.id}">${p.unit || p.name} — ${p.name}</option>`,
          )
          .join("");
      us.value = "all";
      render();
    });
    us.addEventListener("change", render);
    ms.addEventListener("change", render);
    ys.addEventListener("change", render);
    owners();
    return true;
  }
  function boot() {
    window.addEventListener("stay:roles-changed", () => {
      document.getElementById("homeScopePanel")?.remove();
      liveAdmins = [];
      void install();
    });
    if (install()) return;
    const obs = new MutationObserver(() => {
      install().then((ok) => {
        if (ok) obs.disconnect();
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading")
    document.addEventListener(
      "DOMContentLoaded",
      () => requestAnimationFrame(boot),
      { once: true },
    );
  else requestAnimationFrame(boot);
})();
