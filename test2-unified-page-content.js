(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    AUTH = "ap207-auth-profile-v1",
    LANG = "system-control-test2-suite-v1",
    PREF = "system-control-test2-preferred-property-v1",
    EXTRA_ATTACHMENTS = "system-control-test2-extra-attachments-v1";
  const read = (key, fallback) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "null") || fallback;
      } catch {
        return fallback;
      }
    },
    write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const I = {
    "pt-BR": {
      properties: "Propriedades / Proprietários",
      newProperty: "+ Nova propriedade",
      newOwner: "+ Novo proprietário",
      loadingProperties: "Carregando propriedades e proprietários…",
      expenses: "Despesas / Receitas adicionais",
      newExpense: "+ Nova despesa",
      newIncome: "+ Nova receita",
      loadingExpenses: "Carregando despesas e receitas adicionais…",
      contracts: "Contratos / iCal / API",
      settings: "Configurações / Central de Atendimento",
      admins: "Administradores",
      newAdmin: "+ Novo administrador",
      plans: "Planos & Pagamentos",
      publicity: "Publicidade",
      logs: "Logs de Acessos",
      courtesy: "Acesso Cortesia",
    },
    en: {
      properties: "Properties / Owners",
      newProperty: "+ New property",
      newOwner: "+ New owner",
      loadingProperties: "Loading properties and owners…",
      expenses: "Expenses / Additional income",
      newExpense: "+ New expense",
      newIncome: "+ New income",
      loadingExpenses: "Loading expenses and additional income…",
      contracts: "Contracts / iCal / API",
      settings: "Settings / Support Center",
      admins: "Administrators",
      newAdmin: "+ New administrator",
      plans: "Plans & Payments",
      publicity: "Advertising",
      logs: "Access Logs",
      courtesy: "Courtesy Access",
    },
    es: {
      properties: "Propiedades / Propietarios",
      newProperty: "+ Nueva propiedad",
      newOwner: "+ Nuevo propietario",
      loadingProperties: "Cargando propiedades y propietarios…",
      expenses: "Gastos / Ingresos adicionales",
      newExpense: "+ Nuevo gasto",
      newIncome: "+ Nuevo ingreso",
      loadingExpenses: "Cargando gastos e ingresos adicionales…",
      contracts: "Contratos / iCal / API",
      settings: "Configuración / Centro de Atención",
      admins: "Administradores",
      newAdmin: "+ Nuevo administrador",
      plans: "Planes y Pagos",
      publicity: "Publicidad",
      logs: "Registros de Acceso",
      courtesy: "Acceso de Cortesía",
    },
    fr: {
      properties: "Propriétés / Propriétaires",
      newProperty: "+ Nouvelle propriété",
      newOwner: "+ Nouveau propriétaire",
      loadingProperties: "Chargement des propriétés et propriétaires…",
      expenses: "Dépenses / Revenus supplémentaires",
      newExpense: "+ Nouvelle dépense",
      newIncome: "+ Nouveau revenu",
      loadingExpenses: "Chargement des dépenses et revenus supplémentaires…",
      contracts: "Contrats / iCal / API",
      settings: "Paramètres / Centre d’assistance",
      admins: "Administrateurs",
      newAdmin: "+ Nouvel administrateur",
      plans: "Forfaits et Paiements",
      publicity: "Publicité",
      logs: "Journaux d’accès",
      courtesy: "Accès de courtoisie",
    },
    de: {
      properties: "Objekte / Eigentümer",
      newProperty: "+ Neues Objekt",
      newOwner: "+ Neuer Eigentümer",
      loadingProperties: "Objekte und Eigentümer werden geladen…",
      expenses: "Ausgaben / Zusätzliche Einnahmen",
      newExpense: "+ Neue Ausgabe",
      newIncome: "+ Neue Einnahme",
      loadingExpenses: "Ausgaben und zusätzliche Einnahmen werden geladen…",
      contracts: "Verträge / iCal / API",
      settings: "Einstellungen / Support-Center",
      admins: "Administratoren",
      newAdmin: "+ Neuer Administrator",
      plans: "Pläne & Zahlungen",
      publicity: "Werbung",
      logs: "Zugriffsprotokolle",
      courtesy: "Kulanzzugang",
    },
    it: {
      properties: "Proprietà / Proprietari",
      newProperty: "+ Nuova proprietà",
      newOwner: "+ Nuovo proprietario",
      loadingProperties: "Caricamento proprietà e proprietari…",
      expenses: "Spese / Entrate aggiuntive",
      newExpense: "+ Nuova spesa",
      newIncome: "+ Nuova entrata",
      loadingExpenses: "Caricamento spese ed entrate aggiuntive…",
      contracts: "Contratti / iCal / API",
      settings: "Impostazioni / Centro Assistenza",
      admins: "Amministratori",
      newAdmin: "+ Nuovo amministratore",
      plans: "Piani e Pagamenti",
      publicity: "Pubblicità",
      logs: "Registri Accessi",
      courtesy: "Accesso di cortesia",
    },
    "pt-PT": {
      properties: "Propriedades / Proprietários",
      newProperty: "+ Nova propriedade",
      newOwner: "+ Novo proprietário",
      loadingProperties: "A carregar propriedades e proprietários…",
      expenses: "Despesas / Receitas adicionais",
      newExpense: "+ Nova despesa",
      newIncome: "+ Nova receita",
      loadingExpenses: "A carregar despesas e receitas adicionais…",
      contracts: "Contratos / iCal / API",
      settings: "Configurações / Centro de Atendimento",
      admins: "Administradores",
      newAdmin: "+ Novo administrador",
      plans: "Planos e Pagamentos",
      publicity: "Publicidade",
      logs: "Registos de Acesso",
      courtesy: "Acesso Cortesia",
    },
    "zh-CN": {
      properties: "房产 / 业主",
      newProperty: "+ 新增房产",
      newOwner: "+ 新增业主",
      loadingProperties: "正在加载房产和业主…",
      expenses: "支出 / 额外收入",
      newExpense: "+ 新增支出",
      newIncome: "+ 新增收入",
      loadingExpenses: "正在加载支出和额外收入…",
      contracts: "合同 / iCal / API",
      settings: "设置 / 客服中心",
      admins: "管理员",
      newAdmin: "+ 新增管理员",
      plans: "套餐与付款",
      publicity: "广告",
      logs: "访问日志",
      courtesy: "礼遇访问",
    },
    ja: {
      properties: "物件 / オーナー",
      newProperty: "+ 新しい物件",
      newOwner: "+ 新しいオーナー",
      loadingProperties: "物件とオーナーを読み込み中…",
      expenses: "経費 / 追加収入",
      newExpense: "+ 新しい経費",
      newIncome: "+ 新しい収入",
      loadingExpenses: "経費と追加収入を読み込み中…",
      contracts: "契約 / iCal / API",
      settings: "設定 / サポートセンター",
      admins: "管理者",
      newAdmin: "+ 新しい管理者",
      plans: "プランと支払い",
      publicity: "広告",
      logs: "アクセスログ",
      courtesy: "特別アクセス",
    },
    ko: {
      properties: "숙소 / 소유자",
      newProperty: "+ 새 숙소",
      newOwner: "+ 새 소유자",
      loadingProperties: "숙소와 소유자를 불러오는 중…",
      expenses: "지출 / 추가 수입",
      newExpense: "+ 새 지출",
      newIncome: "+ 새 수입",
      loadingExpenses: "지출과 추가 수입을 불러오는 중…",
      contracts: "계약 / iCal / API",
      settings: "설정 / 고객 지원 센터",
      admins: "관리자",
      newAdmin: "+ 새 관리자",
      plans: "요금제 및 결제",
      publicity: "광고",
      logs: "접속 로그",
      courtesy: "혜택 액세스",
    },
  };
  function role() {
    try {
      return (
        JSON.parse(localStorage.getItem(AUTH) || "{}")?.profile?.role || "owner"
      );
    } catch {
      return "owner";
    }
  }
  function lang() {
    try {
      return JSON.parse(localStorage.getItem(LANG) || "{}").language || "pt-BR";
    } catch {
      return "pt-BR";
    }
  }
  function tr() {
    return I[lang()] || I["pt-BR"];
  }
  function css() {
    if ($("t2UnifiedContentCss")) return;
    const s = document.createElement("style");
    s.id = "t2UnifiedContentCss";
    s.textContent =
      ".t2uc-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin:0 0 14px}.t2uc-head h2{margin:0}.t2uc-actions{display:flex;gap:8px;flex-wrap:wrap}.t2uc-actions button{min-height:42px}.t2uc-empty{border:1px dashed #cbd5e1;border-radius:12px;padding:18px;color:#64748b;background:#fff}#t2UnifiedFinancial #newExpenseButton{display:none!important}.t2uc-income-backdrop{position:fixed;inset:0;z-index:2147483500;background:rgba(15,23,42,.6);padding:18px;overflow:auto}.t2uc-income-dialog{width:min(760px,100%);margin:20px auto;padding:22px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.3)}.t2uc-income-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.t2uc-income-head h2{margin:0}.t2uc-income-extra{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.t2uc-income-wide{grid-column:1/-1}.t2uc-income-context{padding:11px 12px;border:1px solid #ddd8ff;border-radius:11px;background:#f8f7ff;font-weight:700}.t2uc-income-attachment{padding:12px;border:1px dashed #94a3b8;border-radius:11px;background:#f8fafc}.t2uc-income-attachment small{display:block;margin-top:6px;color:#64748b}@media(max-width:720px){.t2uc-actions{width:100%}.t2uc-actions button{flex:1 1 100%}.t2uc-income-backdrop{padding:8px}.t2uc-income-dialog{margin:8px auto}.t2uc-income-extra{grid-template-columns:1fr}}";
    document.head.append(s);
  }
  function findButton(re) {
    return [
      ...document.querySelectorAll(
        "button:not([data-t2uc-action]),a:not([data-t2uc-action])",
      ),
    ].find((x) => re.test((x.textContent || "").trim()));
  }
  function clickExisting(ids, re) {
    for (const id of ids) {
      const b = $(id);
      if (b && !b.matches("[data-t2uc-action]")) {
        b.click();
        return true;
      }
    }
    const b = findButton(re);
    if (b) {
      b.click();
      return true;
    }
    return false;
  }
  function head(root, id, title, actions = []) {
    if (!root) return;
    let h = $(id);
    if (!h) {
      h = document.createElement("section");
      h.id = id;
      h.className = "t2uc-head";
      const t = document.createElement("div"),
        ttl = document.createElement("h2"),
        a = document.createElement("div");
      ttl.dataset.t2ucTitle = "1";
      a.className = "t2uc-actions";
      t.append(ttl);
      h.append(t, a);
      root.prepend(h);
    }
    const ttl = h.querySelector("h2");
    if (ttl.textContent !== title) ttl.textContent = title;
    const a = h.querySelector(".t2uc-actions"),
      signature = actions.map((x) => x.key + ":" + x.label).join("|");
    if (a.dataset.signature === signature) return;
    a.dataset.signature = signature;
    a.replaceChildren();
    actions.forEach((x) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "button button-primary";
      b.textContent = x.label;
      b.dataset.t2ucAction = x.key;
      b.addEventListener("click", x.run);
      a.append(b);
    });
  }
  function deny(n) {
    if (!n) return;
    n.hidden = true;
    n.style.setProperty("display", "none", "important");
  }
  function allow(n) {
    if (!n) return;
    n.style.removeProperty("display");
  }
  function openNewProperty() {
    if (window.Test2PropertyModalV2?.open)
      return window.Test2PropertyModalV2.open();
    return false;
  }
  function currentProperty() {
    const selector = $("propertySelector"),
      id = selector?.value || localStorage.getItem(PREF) || "";
    return {
      id,
      label:
        selector?.selectedOptions?.[0]?.textContent?.trim() ||
        id ||
        "Propriedade selecionada",
    };
  }
  function incomeForm() {
    return $("t2ExtraRevenueForm");
  }
  function fileData(file, max = 5 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (file.size > max) return reject(new Error("SIZE"));
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: String(reader.result || ""),
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function enhanceIncomeForm(form) {
    if (!form || form.dataset.t2UnifiedIncome === "1") return;
    form.dataset.t2UnifiedIncome = "1";
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.textContent = "Salvar receita";
    const extra = document.createElement("section");
    extra.className = "t2uc-income-extra";
    extra.innerHTML =
      '<div class="field"><label for="t2ExtraType">Tipo</label><select id="t2ExtraType"><option>Receita adicional</option><option>Dano</option><option>Multa</option><option>Reembolso</option></select></div><div class="field"><label for="t2ExtraReservation">Reserva relacionada (opcional)</label><input id="t2ExtraReservation" placeholder="Nome do hóspede ou código"></div><div class="field t2uc-income-wide"><label for="t2ExtraNotes">Observações (opcional)</label><textarea id="t2ExtraNotes" rows="3"></textarea></div><div class="t2uc-income-context t2uc-income-wide" id="t2ExtraPropertyContext"></div><label class="t2uc-income-attachment t2uc-income-wide">Comprovante (opcional)<input id="t2ExtraReceipt" type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"><small>PNG, JPG ou PDF, até 5 MB.</small><span id="t2ExtraReceiptName"></span></label>';
    form.insertBefore(extra, submit || null);
    const input = extra.querySelector("#t2ExtraReceipt"),
      name = extra.querySelector("#t2ExtraReceiptName");
    let attachment = null;
    input.addEventListener("change", async () => {
      try {
        attachment = await fileData(input.files?.[0]);
        name.textContent = attachment ? `📎 ${attachment.name}` : "";
      } catch (error) {
        attachment = null;
        input.value = "";
        name.textContent = "";
        alert(
          error?.message === "SIZE"
            ? "O comprovante deve ter no máximo 5 MB."
            : "Não foi possível anexar o comprovante.",
        );
      }
    });
    form.addEventListener("submit", () => {
      const property = currentProperty(),
        metadata = {
          type:
            form.querySelector("#t2ExtraType")?.value || "Receita adicional",
          reservation:
            form.querySelector("#t2ExtraReservation")?.value?.trim() || "",
          notes: form.querySelector("#t2ExtraNotes")?.value?.trim() || "",
          propertyLabel: property.label,
        };
      setTimeout(() => {
        const state = read(LANG, {}),
          item = (state.extraRevenue || []).find(
            (entry) => String(entry.propertyId || "") === String(property.id),
          );
        if (item) {
          Object.assign(item, metadata);
          write(LANG, state);
          if (attachment) {
            const files = read(EXTRA_ATTACHMENTS, []);
            files.unshift({
              ...attachment,
              id: `${item.id}-${Date.now()}`,
              revenueId: item.id,
              propertyId: property.id,
              createdAt: new Date().toISOString(),
            });
            write(EXTRA_ATTACHMENTS, files);
          }
        }
        closeIncome();
      }, 80);
    });
  }
  function closeIncome() {
    $("t2UnifiedIncomeDialog")?.remove();
    document.body.style.overflow = "";
  }
  function openIncome() {
    const form = incomeForm();
    if (!form) return false;
    enhanceIncomeForm(form);
    closeIncome();
    const backdrop = document.createElement("div");
    backdrop.id = "t2UnifiedIncomeDialog";
    backdrop.className = "t2uc-income-backdrop";
    backdrop.innerHTML =
      '<section class="t2uc-income-dialog"><header class="t2uc-income-head"><h2>Nova receita</h2><button type="button" class="button button-secondary">← Voltar</button></header></section>';
    backdrop.querySelector("button").onclick = closeIncome;
    backdrop.onclick = (event) => {
      if (event.target === backdrop) closeIncome();
    };
    const property = currentProperty();
    form.querySelector("#t2ExtraPropertyContext").textContent =
      `Propriedade / unidade: ${property.label}`;
    form.hidden = false;
    backdrop.querySelector("section").append(form);
    document.body.append(backdrop);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => form.querySelector("input,select")?.focus());
    return true;
  }
  function setupProperties() {
    const root = $("t2UnifiedProperties");
    if (!root) return;
    const x = tr(),
      r = role();
    head(
      root,
      "t2ucPropertiesHead",
      x.properties,
      r === "owner"
        ? []
        : [
            {
              key: "new-property",
              label: x.newProperty,
              run: (e) => {
                e?.preventDefault?.();
                e?.stopPropagation?.();
                openNewProperty();
              },
            },
            {
              key: "new-owner",
              label: x.newOwner,
              run: () =>
                clickExisting(
                  [],
                  /novo proprietário|new owner|nuevo propietario|nouveau propriétaire|neuer eigentümer|nuovo proprietario|新增业主|新しいオーナー|새 소유자/i,
                ),
            },
          ],
    );
    [
      "stayUserSection",
      "propertySettings",
      "t2PropertyAssignments",
      "t2PropertyLinking",
      "t2ProfessionalOwners",
    ].forEach((id) => (r === "owner" ? deny($(id)) : allow($(id))));
  }
  function setupExpenses() {
    const root = $("t2UnifiedFinancial");
    if (!root) return;
    const x = tr(),
      r = role();
    head(
      root,
      "t2ucExpensesHead",
      x.expenses,
      r === "owner"
        ? []
        : [
            {
              key: "new-expense",
              label: x.newExpense,
              run: () =>
                clickExisting(
                  ["addExpenseButton", "newExpenseButton"],
                  /nova despesa|new expense|nuevo gasto|nouvelle dépense|neue ausgabe|nuova spesa|新增支出|新しい経費|새 지출/i,
                ),
            },
            {
              key: "new-income",
              label: x.newIncome,
              run: openIncome,
            },
          ],
    );
    if (r === "owner") deny($("t2Operations"));
    else allow($("t2Operations"));
  }
  function setupContracts() {
    const root = $("t2UnifiedContracts");
    if (root) head(root, "t2ucContractsHead", tr().contracts);
  }
  function setupSettings() {
    const root = $("t2UnifiedSettings");
    if (root) head(root, "t2ucSettingsHead", tr().settings);
  }
  function openAdminInvite() {
    if (window.Test2UnifiedInviteUser?.open) {
      window.Test2UnifiedInviteUser.open("admin");
      return true;
    }
    return false;
  }
  function setupSuper() {
    const isSuper = role() === "super_admin",
      x = tr(),
      defs = [
        ["t2ProfessionalAdmins", "t2ucAdminsHead", x.admins],
        ["t2ProfessionalPlans", "t2ucPlansHead", x.plans],
        ["t2Banners", "t2ucPublicityHead", x.publicity],
        ["t2Audit", "t2ucLogsHead", x.logs],
        ["t2CourtesyPanel", "t2ucCourtesyHead", x.courtesy],
        ["t2AccessPanel", "t2ucAccessHead", x.courtesy],
      ];
    defs.forEach(([rootId, headId, title]) => {
      const root = $(rootId);
      if (!root) return;
      if (!isSuper) {
        deny(root);
        return;
      }
      allow(root);
      const actions =
        rootId === "t2ProfessionalAdmins"
          ? [{ key: "new-admin", label: x.newAdmin, run: openAdminInvite }]
          : [];
      head(root, headId, title, actions);
    });
  }
  function enforceMenu() {
    const isSuper = role() === "super_admin";
    document
      .querySelectorAll(
        ".t2-pro-menu [data-route],.t2-pro-mobilebar [data-route]",
      )
      .forEach((b) => {
        if (
          [
            "admins",
            "plans",
            "courtesy",
            "logs",
            "publicity",
            "analytics",
          ].includes(b.dataset.route)
        ) {
          if (isSuper) b.style.removeProperty("display");
          else b.style.setProperty("display", "none", "important");
        }
      });
  }
  function apply() {
    css();
    setupProperties();
    setupExpenses();
    setupContracts();
    setupSettings();
    setupSuper();
    enforceMenu();
    document.documentElement.lang = lang();
  }
  function boot() {
    apply();
    ["stay:unified-navigation", "stay:language-change"].forEach((ev) =>
      window.addEventListener(ev, () => requestAnimationFrame(apply)),
    );
    document.addEventListener("change", (e) => {
      if (["t2AppLanguage", "t2V2Language"].includes(e.target?.id))
        requestAnimationFrame(apply);
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
