(() => {
  "use strict";

  const AUTH = "ap207-auth-profile-v1";
  const SUITE = "system-control-test2-suite-v1";
  const RESERVATIONS = "ap207-dashboard-reservations-v1";
  const PREFERRED_PROPERTY = "system-control-test2-preferred-property-v1";
  const BUCKET = "owner-payout-receipts";
  const TABLE = "reservation_payouts";
  const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

  const copy = {
    "pt-BR": {
      open: "Repasses e comprovantes", title: "Financeiro e repasses da reserva",
      subtitle: "O recebimento da plataforma e o repasse ao proprietário ficam vinculados somente a esta reserva.",
      platform: "Repasse recebido da plataforma", platformFlow: "Plataforma → Administrador",
      owner: "Repasse ao proprietário", ownerFlow: "Administrador → Proprietário",
      stay: "Valor da estadia", cleaning: "Limpeza", commissionBase: "Base da comissão (somente estadia)",
      commission: "Comissão da administradora", platformFees: "Taxas/descontos da plataforma",
      platformReceived: "Valor recebido da plataforma", payout: "Repasse líquido ao proprietário",
      status: "Status", pending: "Pendente", received: "Recebido", paid: "Repassado",
      receivedAt: "Data do recebimento", paidAt: "Data do repasse", note: "Observação (opcional)",
      platformProof: "Anexar extrato/comprovante da plataforma", payoutProof: "Anexar comprovante do repasse",
      view: "Visualizar", save: "Salvar movimentação", saving: "Salvando…", saved: "Movimentação salva.",
      readonly: "Consulta do proprietário — os valores não podem ser alterados.",
      noProof: "Nenhum comprovante anexado.", fileHelp: "PDF, JPG, PNG ou WEBP, até 8 MB.",
      rule: "A comissão é calculada somente sobre a estadia. A limpeza não gera comissão.",
      close: "Fechar", unavailable: "Não foi possível abrir o comprovante agora.",
      error: "Não foi possível salvar a movimentação.", session: "Sua sessão expirou. Entre novamente.",
      property: "Propriedade / unidade", guest: "Hóspede",
    },
    en: {
      open: "Payouts and receipts", title: "Reservation finances and payouts",
      subtitle: "The platform receipt and owner payout remain linked only to this reservation.",
      platform: "Payout received from platform", platformFlow: "Platform → Administrator",
      owner: "Owner payout", ownerFlow: "Administrator → Owner", stay: "Stay amount", cleaning: "Cleaning",
      commissionBase: "Commission base (stay only)", commission: "Management commission",
      platformFees: "Platform fees/discounts", platformReceived: "Amount received from platform",
      payout: "Net payout to owner", status: "Status", pending: "Pending", received: "Received", paid: "Paid out",
      receivedAt: "Receipt date", paidAt: "Payout date", note: "Note (optional)",
      platformProof: "Attach platform statement/receipt", payoutProof: "Attach payout receipt",
      view: "View", save: "Save transaction", saving: "Saving…", saved: "Transaction saved.",
      readonly: "Owner view — amounts cannot be changed.", noProof: "No receipt attached.",
      fileHelp: "PDF, JPG, PNG or WEBP, up to 8 MB.", rule: "Commission is calculated only on the stay. Cleaning is never commissioned.",
      close: "Close", unavailable: "The receipt could not be opened right now.", error: "The transaction could not be saved.",
      session: "Your session has expired. Sign in again.",
      property: "Property / unit", guest: "Guest",
    },
    es: {
      open: "Pagos y comprobantes", title: "Finanzas y pagos de la reserva",
      subtitle: "El cobro de la plataforma y el pago al propietario quedan vinculados únicamente a esta reserva.",
      platform: "Pago recibido de la plataforma", platformFlow: "Plataforma → Administrador",
      owner: "Pago al propietario", ownerFlow: "Administrador → Propietario", stay: "Valor de la estancia", cleaning: "Limpieza",
      commissionBase: "Base de comisión (solo estancia)", commission: "Comisión de administración",
      platformFees: "Tarifas/descuentos de la plataforma", platformReceived: "Valor recibido de la plataforma",
      payout: "Pago neto al propietario", status: "Estado", pending: "Pendiente", received: "Recibido", paid: "Pagado",
      receivedAt: "Fecha de cobro", paidAt: "Fecha de pago", note: "Observación (opcional)",
      platformProof: "Adjuntar extracto/comprobante de la plataforma", payoutProof: "Adjuntar comprobante del pago",
      view: "Ver", save: "Guardar movimiento", saving: "Guardando…", saved: "Movimiento guardado.",
      readonly: "Consulta del propietario — los valores no se pueden modificar.", noProof: "Ningún comprobante adjunto.",
      fileHelp: "PDF, JPG, PNG o WEBP, hasta 8 MB.", rule: "La comisión se calcula únicamente sobre la estancia. La limpieza no genera comisión.",
      close: "Cerrar", unavailable: "No se pudo abrir el comprobante.", error: "No se pudo guardar el movimiento.",
      session: "La sesión venció. Inicia sesión de nuevo.",
      property: "Propiedad / unidad", guest: "Huésped",
    },
    fr: {
      open: "Versements et justificatifs", title: "Finances et versements de la réservation",
      subtitle: "Le paiement de la plateforme et le versement au propriétaire restent liés uniquement à cette réservation.",
      platform: "Paiement reçu de la plateforme", platformFlow: "Plateforme → Administrateur",
      owner: "Versement au propriétaire", ownerFlow: "Administrateur → Propriétaire", stay: "Montant du séjour", cleaning: "Nettoyage",
      commissionBase: "Base de commission (séjour uniquement)", commission: "Commission de gestion",
      platformFees: "Frais/remises de la plateforme", platformReceived: "Montant reçu de la plateforme",
      payout: "Versement net au propriétaire", status: "Statut", pending: "En attente", received: "Reçu", paid: "Versé",
      receivedAt: "Date de réception", paidAt: "Date du versement", note: "Observation (facultatif)",
      platformProof: "Joindre le relevé/justificatif de la plateforme", payoutProof: "Joindre le justificatif du versement",
      view: "Voir", save: "Enregistrer le mouvement", saving: "Enregistrement…", saved: "Mouvement enregistré.",
      readonly: "Consultation du propriétaire — les montants ne peuvent pas être modifiés.", noProof: "Aucun justificatif joint.",
      fileHelp: "PDF, JPG, PNG ou WEBP, jusqu’à 8 Mo.", rule: "La commission est calculée uniquement sur le séjour. Le nettoyage ne génère aucune commission.",
      close: "Fermer", unavailable: "Impossible d’ouvrir le justificatif pour le moment.", error: "Impossible d’enregistrer le mouvement.",
      session: "Votre session a expiré. Reconnectez-vous.", property: "Propriété / unité", guest: "Voyageur",
    },
    de: {
      open: "Auszahlungen und Belege", title: "Finanzen und Auszahlungen der Reservierung",
      subtitle: "Plattformzahlung und Eigentümerauszahlung bleiben nur mit dieser Reservierung verknüpft.",
      platform: "Von der Plattform erhalten", platformFlow: "Plattform → Administrator",
      owner: "Auszahlung an Eigentümer", ownerFlow: "Administrator → Eigentümer", stay: "Aufenthaltsbetrag", cleaning: "Reinigung",
      commissionBase: "Provisionsbasis (nur Aufenthalt)", commission: "Verwaltungsprovision",
      platformFees: "Plattformgebühren/-rabatte", platformReceived: "Von der Plattform erhaltener Betrag",
      payout: "Nettoauszahlung an Eigentümer", status: "Status", pending: "Ausstehend", received: "Erhalten", paid: "Ausgezahlt",
      receivedAt: "Eingangsdatum", paidAt: "Auszahlungsdatum", note: "Notiz (optional)",
      platformProof: "Plattformabrechnung/-beleg anhängen", payoutProof: "Auszahlungsbeleg anhängen",
      view: "Anzeigen", save: "Vorgang speichern", saving: "Speichern…", saved: "Vorgang gespeichert.",
      readonly: "Eigentümeransicht — Beträge können nicht geändert werden.", noProof: "Kein Beleg angehängt.",
      fileHelp: "PDF, JPG, PNG oder WEBP, bis 8 MB.", rule: "Die Provision wird nur auf den Aufenthalt berechnet. Für die Reinigung fällt keine Provision an.",
      close: "Schließen", unavailable: "Der Beleg kann derzeit nicht geöffnet werden.", error: "Der Vorgang konnte nicht gespeichert werden.",
      session: "Ihre Sitzung ist abgelaufen. Melden Sie sich erneut an.", property: "Objekt / Einheit", guest: "Gast",
    },
    it: {
      open: "Pagamenti e ricevute", title: "Finanze e pagamenti della prenotazione",
      subtitle: "L’incasso della piattaforma e il pagamento al proprietario restano collegati solo a questa prenotazione.",
      platform: "Pagamento ricevuto dalla piattaforma", platformFlow: "Piattaforma → Amministratore",
      owner: "Pagamento al proprietario", ownerFlow: "Amministratore → Proprietario", stay: "Importo del soggiorno", cleaning: "Pulizia",
      commissionBase: "Base commissione (solo soggiorno)", commission: "Commissione di gestione",
      platformFees: "Commissioni/sconti della piattaforma", platformReceived: "Importo ricevuto dalla piattaforma",
      payout: "Pagamento netto al proprietario", status: "Stato", pending: "In attesa", received: "Ricevuto", paid: "Pagato",
      receivedAt: "Data di ricezione", paidAt: "Data del pagamento", note: "Nota (opzionale)",
      platformProof: "Allega estratto/ricevuta della piattaforma", payoutProof: "Allega ricevuta del pagamento",
      view: "Visualizza", save: "Salva movimento", saving: "Salvataggio…", saved: "Movimento salvato.",
      readonly: "Vista proprietario — gli importi non possono essere modificati.", noProof: "Nessuna ricevuta allegata.",
      fileHelp: "PDF, JPG, PNG o WEBP, fino a 8 MB.", rule: "La commissione viene calcolata solo sul soggiorno. La pulizia non genera commissioni.",
      close: "Chiudi", unavailable: "Impossibile aprire la ricevuta ora.", error: "Impossibile salvare il movimento.",
      session: "La sessione è scaduta. Accedi di nuovo.", property: "Proprietà / unità", guest: "Ospite",
    },
    "pt-PT": {
      open: "Repasses e comprovativos", title: "Finanças e repasses da reserva",
      subtitle: "O recebimento da plataforma e o repasse ao proprietário ficam associados apenas a esta reserva.",
      platform: "Repasse recebido da plataforma", platformFlow: "Plataforma → Administrador",
      owner: "Repasse ao proprietário", ownerFlow: "Administrador → Proprietário", stay: "Valor da estadia", cleaning: "Limpeza",
      commissionBase: "Base da comissão (apenas estadia)", commission: "Comissão de gestão",
      platformFees: "Taxas/descontos da plataforma", platformReceived: "Valor recebido da plataforma",
      payout: "Repasse líquido ao proprietário", status: "Estado", pending: "Pendente", received: "Recebido", paid: "Repassado",
      receivedAt: "Data do recebimento", paidAt: "Data do repasse", note: "Observação (opcional)",
      platformProof: "Anexar extrato/comprovativo da plataforma", payoutProof: "Anexar comprovativo do repasse",
      view: "Ver", save: "Guardar movimento", saving: "A guardar…", saved: "Movimento guardado.",
      readonly: "Consulta do proprietário — os valores não podem ser alterados.", noProof: "Nenhum comprovativo anexado.",
      fileHelp: "PDF, JPG, PNG ou WEBP, até 8 MB.", rule: "A comissão é calculada apenas sobre a estadia. A limpeza não gera comissão.",
      close: "Fechar", unavailable: "Não foi possível abrir o comprovativo agora.", error: "Não foi possível guardar o movimento.",
      session: "A sua sessão expirou. Inicie sessão novamente.", property: "Propriedade / unidade", guest: "Hóspede",
    },
    "zh-CN": {
      open: "结算与凭证", title: "预订财务与结算", subtitle: "平台收款和业主结算仅关联到此预订。",
      platform: "平台入账", platformFlow: "平台 → 管理员", owner: "业主结算", ownerFlow: "管理员 → 业主",
      stay: "住宿金额", cleaning: "清洁费", commissionBase: "佣金基数（仅住宿）", commission: "管理佣金",
      platformFees: "平台费用/折扣", platformReceived: "平台实收金额", payout: "业主净结算",
      status: "状态", pending: "待处理", received: "已收到", paid: "已结算", receivedAt: "收款日期", paidAt: "结算日期",
      note: "备注（可选）", platformProof: "上传平台账单/凭证", payoutProof: "上传结算凭证",
      view: "查看", save: "保存记录", saving: "正在保存…", saved: "记录已保存。",
      readonly: "业主查看模式 — 金额不可修改。", noProof: "未上传凭证。", fileHelp: "PDF、JPG、PNG 或 WEBP，最大 8 MB。",
      rule: "佣金仅按住宿金额计算，清洁费不计佣金。", close: "关闭", unavailable: "目前无法打开凭证。",
      error: "无法保存记录。", session: "会话已过期，请重新登录。", property: "房产 / 单元", guest: "客人",
    },
    ja: {
      open: "支払いと証明書", title: "予約の会計と支払い", subtitle: "プラットフォームからの入金とオーナーへの支払いは、この予約だけに紐づきます。",
      platform: "プラットフォームからの入金", platformFlow: "プラットフォーム → 管理者", owner: "オーナーへの支払い", ownerFlow: "管理者 → オーナー",
      stay: "宿泊金額", cleaning: "清掃費", commissionBase: "手数料対象（宿泊のみ）", commission: "管理手数料",
      platformFees: "プラットフォーム手数料・割引", platformReceived: "プラットフォーム入金額", payout: "オーナーへの純支払額",
      status: "ステータス", pending: "保留中", received: "入金済み", paid: "支払済み", receivedAt: "入金日", paidAt: "支払日",
      note: "備考（任意）", platformProof: "プラットフォーム明細・証明書を添付", payoutProof: "支払い証明書を添付",
      view: "表示", save: "取引を保存", saving: "保存中…", saved: "取引を保存しました。",
      readonly: "オーナー閲覧用 — 金額は変更できません。", noProof: "証明書は添付されていません。", fileHelp: "PDF、JPG、PNG、WEBP（最大8MB）。",
      rule: "手数料は宿泊金額にのみ計算され、清掃費にはかかりません。", close: "閉じる", unavailable: "現在、証明書を開けません。",
      error: "取引を保存できませんでした。", session: "セッションの有効期限が切れました。再度ログインしてください。", property: "物件 / ユニット", guest: "ゲスト",
    },
    ko: {
      open: "정산 및 증빙", title: "예약 재무 및 정산", subtitle: "플랫폼 입금과 소유자 정산은 이 예약에만 연결됩니다.",
      platform: "플랫폼 입금", platformFlow: "플랫폼 → 관리자", owner: "소유자 정산", ownerFlow: "관리자 → 소유자",
      stay: "숙박 금액", cleaning: "청소비", commissionBase: "수수료 기준(숙박만)", commission: "관리 수수료",
      platformFees: "플랫폼 수수료/할인", platformReceived: "플랫폼 수령 금액", payout: "소유자 순정산액",
      status: "상태", pending: "대기 중", received: "수령 완료", paid: "정산 완료", receivedAt: "입금일", paidAt: "정산일",
      note: "메모(선택)", platformProof: "플랫폼 명세서/증빙 첨부", payoutProof: "정산 증빙 첨부",
      view: "보기", save: "거래 저장", saving: "저장 중…", saved: "거래가 저장되었습니다.",
      readonly: "소유자 조회용 — 금액을 변경할 수 없습니다.", noProof: "첨부된 증빙이 없습니다.", fileHelp: "PDF, JPG, PNG 또는 WEBP, 최대 8MB.",
      rule: "수수료는 숙박 금액에만 계산되며 청소비에는 부과되지 않습니다.", close: "닫기", unavailable: "현재 증빙을 열 수 없습니다.",
      error: "거래를 저장할 수 없습니다.", session: "세션이 만료되었습니다. 다시 로그인하세요.", property: "숙소 / 유닛", guest: "게스트",
    },
  };

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch { return fallback; }
  };
  const profile = () => read(AUTH, {})?.profile || null;
  const language = () => read(SUITE, {})?.language || "pt-BR";
  const words = () => copy[language()] || copy[language().split("-")[0]] || copy["pt-BR"];
  const client = () => window.AP207Supabase;
  const canManage = () => ["super_admin", "admin"].includes(profile()?.role);
  const money = (value) => Number(value || 0).toLocaleString(language() === "en" ? "en-US" : language(), { style: "currency", currency: "BRL" });
  const number = (value) => Math.max(0, Number(value) || 0);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const currentPropertyId = () => String(document.getElementById("propertySelector")?.value || localStorage.getItem(PREFERRED_PROPERTY) || "");

  function reservationById(id) {
    const propertyId = currentPropertyId();
    const scoped = read(`${RESERVATIONS}:${propertyId}`, {});
    const legacy = read(RESERVATIONS, {});
    const rows = Array.isArray(scoped?.reservations) ? scoped.reservations : Array.isArray(legacy?.reservations) ? legacy.reservations : [];
    const stored = rows.find((row) => String(row.id) === String(id));
    if (stored) return stored;
    const card = Array.from(document.querySelectorAll("#reservations .booking[data-reservation-id]"))
      .find((element) => String(element.dataset.reservationId) === String(id));
    if (!card) return null;
    return {
      id: card.dataset.reservationId,
      guest: card.dataset.guest || "",
      platform: card.dataset.platform || "Airbnb",
      checkIn: card.dataset.checkIn || "",
      checkOut: card.dataset.checkOut || "",
      gross: number(card.dataset.gross),
      cleaningFee: number(card.dataset.cleaningFee),
      cleaningMode: card.dataset.cleaningMode || "included",
      commissionRate: number(card.dataset.commissionRate),
    };
  }

  function financials(reservation) {
    const gross = number(reservation?.gross);
    const cleaning = reservation?.cleaningMode === "none" ? 0 : number(reservation?.cleaningFee ?? reservation?.cleaning);
    const mode = ["included", "separate", "none"].includes(reservation?.cleaningMode) ? reservation.cleaningMode : "included";
    const stay = mode === "included" ? Math.max(0, gross - cleaning) : gross;
    const rate = Math.min(100, number(reservation?.commissionRate));
    const commission = Math.round(stay * rate) / 100;
    const separateCleaning = mode === "separate" ? cleaning : 0;
    return { gross, cleaning, mode, stay, rate, commission, platformReceived: gross + separateCleaning, payout: Math.max(0, gross - (mode === "included" ? cleaning : 0) - commission) };
  }

  async function sessionUser() {
    try { return (await client()?.auth?.getSession())?.data?.session?.user || null; }
    catch { return null; }
  }

  async function propertyRow(propertyId) {
    const { data, error } = await client().from("properties").select("id,owner_id,administrator_id,owner_name,name,unit").eq("id", propertyId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function loadRecord(propertyId, reservationId) {
    const { data, error } = await client().from(TABLE).select("*").eq("property_id", propertyId).eq("reservation_id", String(reservationId)).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function upload(file, propertyId, reservationId, kind) {
    if (!file) return null;
    if (file.size > 8 * 1024 * 1024) throw new Error(words().fileHelp);
    if (file.type && !FILE_TYPES.includes(file.type)) throw new Error(words().fileHelp);
    const extension = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${propertyId}/reservations/${reservationId}/${kind}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client().storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    return { path, name: file.name };
  }

  async function openProof(path) {
    if (!path) return;
    const { data, error } = await client().storage.from(BUCKET).createSignedUrl(path, 300);
    if (error || !data?.signedUrl) return alert(words().unavailable);
    window.open(data.signedUrl, "_blank", "noopener");
  }

  function css() {
    if (document.getElementById("t2ReservationPayoutCss")) return;
    const style = document.createElement("style");
    style.id = "t2ReservationPayoutCss";
    style.textContent = `
      .t2-rp-open{min-height:40px}.t2-rp-modal[hidden]{display:none!important}.t2-rp-modal{position:fixed;inset:0;z-index:12000;background:rgba(15,23,42,.68);padding:20px;overflow:auto;display:grid;place-items:start center}.t2-rp-dialog{width:min(1080px,100%);margin:18px auto;background:#f6f8fc;border-radius:20px;box-shadow:0 28px 80px rgba(15,23,42,.3);overflow:hidden}.t2-rp-header{display:flex;justify-content:space-between;gap:16px;padding:22px 24px;background:#fff;border-bottom:1px solid #e3e8f1}.t2-rp-header h2{margin:3px 0 5px;font-size:1.45rem}.t2-rp-header p{margin:0;color:#64748b}.t2-rp-close{border:1px solid #cbd5e1;background:#fff;border-radius:10px;min-width:44px;min-height:44px;font-size:1.3rem;cursor:pointer}.t2-rp-context{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:16px 24px}.t2-rp-context div{background:#fff;border:1px solid #e3e8f1;border-radius:12px;padding:12px}.t2-rp-context small,.t2-rp-line small{display:block;color:#64748b;margin-bottom:4px}.t2-rp-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 24px 18px}.t2-rp-card{background:#fff;border:1px solid #dfe5ee;border-radius:16px;padding:18px}.t2-rp-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px}.t2-rp-card h3{margin:0 0 3px;font-size:1.05rem}.t2-rp-flow{color:#64748b;font-size:.86rem}.t2-rp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.t2-rp-field{display:grid;gap:5px;font-size:.78rem;font-weight:800;color:#334155}.t2-rp-field input,.t2-rp-field select,.t2-rp-field textarea{width:100%;min-height:43px;border:1px solid #cbd5e1;border-radius:9px;padding:8px 10px;font:inherit;color:#0f172a;background:#fff}.t2-rp-field textarea{min-height:70px;resize:vertical}.t2-rp-field input:disabled,.t2-rp-field select:disabled,.t2-rp-field textarea:disabled{opacity:1;background:#f8fafc;color:#334155}.t2-rp-wide{grid-column:1/-1}.t2-rp-summary{margin:11px 0 0;border-top:1px solid #eef2f7;padding-top:10px}.t2-rp-line{display:flex;justify-content:space-between;gap:12px;padding:7px 0}.t2-rp-line strong{white-space:nowrap}.t2-rp-proof{border:2px dashed #cbd5e1;background:#f8fafc;border-radius:12px;padding:12px;margin-top:12px}.t2-rp-proof label{font-size:.8rem;font-weight:850;display:block;margin-bottom:8px}.t2-rp-proof input{max-width:100%}.t2-rp-proof-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:.78rem;color:#64748b}.t2-rp-link{border:0;background:transparent;color:#5b21b6;font-weight:850;text-decoration:underline;cursor:pointer}.t2-rp-rule{margin:0 24px 18px;padding:13px 15px;border-radius:12px;background:#fff7d6;border:1px solid #f0d875;color:#6b4f00;font-weight:800}.t2-rp-footer{display:flex;align-items:center;justify-content:flex-end;gap:14px;padding:0 24px 24px}.t2-rp-state{font-size:.86rem;font-weight:800;color:#475569}.t2-rp-readonly{margin:0 24px 16px;padding:12px 14px;border-radius:12px;background:#eef2ff;color:#3730a3;font-weight:800}.t2-rp-badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:.76rem;font-weight:850}.t2-rp-badge.ok{background:#dcfce7;color:#166534}
      @media(max-width:800px){.t2-rp-context{grid-template-columns:1fr 1fr}.t2-rp-cards{grid-template-columns:1fr}.t2-rp-modal{padding:8px}.t2-rp-dialog{margin:4px auto}.t2-rp-header,.t2-rp-context,.t2-rp-cards,.t2-rp-footer{padding-left:14px;padding-right:14px}.t2-rp-rule,.t2-rp-readonly{margin-left:14px;margin-right:14px}}
      @media(max-width:480px){.t2-rp-context,.t2-rp-grid{grid-template-columns:1fr}.t2-rp-wide{grid-column:auto}.t2-rp-header{padding:16px 14px}.t2-rp-header h2{font-size:1.2rem}.t2-rp-footer{align-items:stretch;flex-direction:column}.t2-rp-footer .button{width:100%}}
    `;
    document.head.append(style);
  }

  function field(label, name, type, value, disabled, options) {
    if (type === "select") {
      const choices = options.map(([v, text]) => `<option value="${v}" ${v === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("");
      return `<label class="t2-rp-field">${escapeHtml(label)}<select name="${name}" ${disabled ? "disabled" : ""}>${choices}</select></label>`;
    }
    return `<label class="t2-rp-field">${escapeHtml(label)}<input name="${name}" type="${type}" ${type === "number" ? 'min="0" step="0.01"' : ""} value="${escapeHtml(value ?? "")}" ${disabled ? "disabled" : ""}></label>`;
  }

  async function show(reservationId) {
    const w = words(), propertyId = currentPropertyId(), reservation = reservationById(reservationId), manager = canManage();
    if (!propertyId || !reservation || !client()) return;
    const modal = document.getElementById("t2ReservationPayoutModal");
    modal.hidden = false;
    modal.innerHTML = `<div class="t2-rp-dialog" role="dialog" aria-modal="true" aria-labelledby="t2RpTitle"><header class="t2-rp-header"><div><h2 id="t2RpTitle">${escapeHtml(w.title)}</h2><p>${escapeHtml(w.subtitle)}</p></div><button class="t2-rp-close" type="button" aria-label="${escapeHtml(w.close)}">×</button></header><div class="t2-rp-context"><div>${escapeHtml(w.stay)}<strong>…</strong></div></div></div>`;
    modal.querySelector(".t2-rp-close").onclick = close;
    try {
      const selectedLabel = document.getElementById("propertySelector")?.selectedOptions?.[0]?.textContent?.trim() || propertyId;
      let property = { id: propertyId, name: selectedLabel, unit: "", owner_name: "", owner_id: null, administrator_id: null };
      let record = null;
      const [propertyResult, recordResult] = await Promise.allSettled([
        propertyRow(propertyId),
        loadRecord(propertyId, reservationId),
      ]);
      if (propertyResult.status === "fulfilled" && propertyResult.value) property = propertyResult.value;
      else console.warn("reservation payout property fallback", propertyResult.reason);
      if (recordResult.status === "fulfilled") record = recordResult.value;
      else console.warn("reservation payout record fallback", recordResult.reason);
      const f = financials(reservation), disabled = !manager;
      const data = record || {};
      const platformFees = number(data.platform_fees);
      const receivedAmount = data.platform_received_amount ?? Math.max(0, f.platformReceived - platformFees);
      const payoutAmount = data.payout_amount ?? f.payout;
      const platformStatus = data.platform_status || "pending", payoutStatus = data.payout_status || "pending";
      const platformName = reservation.platform || data.platform || "Airbnb";
      modal.innerHTML = `<form class="t2-rp-dialog" id="t2ReservationPayoutForm" role="dialog" aria-modal="true" aria-labelledby="t2RpTitle">
        <header class="t2-rp-header"><div><h2 id="t2RpTitle">${escapeHtml(w.title)}</h2><p>${escapeHtml(w.subtitle)}</p></div><button class="t2-rp-close" type="button" aria-label="${escapeHtml(w.close)}">×</button></header>
        <div class="t2-rp-context"><div><small>${escapeHtml(w.owner)}</small><strong>${escapeHtml(property?.owner_name || "—")}</strong></div><div><small>${escapeHtml(w.property)}</small><strong>${escapeHtml([property?.name, property?.unit].filter(Boolean).join(" — ") || propertyId)}</strong></div><div><small>${escapeHtml(w.guest)}</small><strong>${escapeHtml(reservation.guest || "—")}</strong></div><div><small>${escapeHtml(platformName)}</small><strong>${escapeHtml(reservation.checkIn)} → ${escapeHtml(reservation.checkOut)}</strong></div></div>
        ${manager ? "" : `<p class="t2-rp-readonly">${escapeHtml(w.readonly)}</p>`}
        <div class="t2-rp-cards">
          <section class="t2-rp-card"><div class="t2-rp-card-head"><div><h3>1. ${escapeHtml(w.platform)}</h3><span class="t2-rp-flow">${escapeHtml(w.platformFlow)}</span></div><span class="t2-rp-badge ${platformStatus === "received" ? "ok" : ""}">${escapeHtml(platformStatus === "received" ? w.received : w.pending)}</span></div>
            <div class="t2-rp-summary"><div class="t2-rp-line"><small>${escapeHtml(w.stay)}</small><strong>${money(f.stay)}</strong></div><div class="t2-rp-line"><small>${escapeHtml(w.cleaning)}</small><strong>${money(f.cleaning)}</strong></div></div>
            <div class="t2-rp-grid">${field(w.platformFees,"platformFees","number",platformFees,disabled)}${field(w.platformReceived,"platformReceived","number",receivedAmount,disabled)}${field(w.status,"platformStatus","select",platformStatus,disabled,[["pending",w.pending],["received",w.received]])}${field(w.receivedAt,"platformReceivedAt","date",data.platform_received_at || "",disabled)}</div>
            <div class="t2-rp-proof"><label>${escapeHtml(w.platformProof)}</label>${manager ? '<input name="platformProof" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp">' : ""}<div class="t2-rp-proof-row"><span>${escapeHtml(data.platform_receipt_name || w.noProof)}</span>${data.platform_receipt_path ? `<button class="t2-rp-link" type="button" data-proof="${escapeHtml(data.platform_receipt_path)}">${escapeHtml(w.view)}</button>` : ""}</div><small>${escapeHtml(w.fileHelp)}</small></div>
          </section>
          <section class="t2-rp-card"><div class="t2-rp-card-head"><div><h3>2. ${escapeHtml(w.owner)}</h3><span class="t2-rp-flow">${escapeHtml(w.ownerFlow)}</span></div><span class="t2-rp-badge ${payoutStatus === "paid" ? "ok" : ""}">${escapeHtml(payoutStatus === "paid" ? w.paid : w.pending)}</span></div>
            <div class="t2-rp-summary"><div class="t2-rp-line"><small>${escapeHtml(w.commissionBase)}</small><strong>${money(f.stay)}</strong></div><div class="t2-rp-line"><small>${escapeHtml(w.commission)} (${f.rate}%)</small><strong>− ${money(f.commission)}</strong></div><div class="t2-rp-line"><small>${escapeHtml(w.cleaning)}</small><strong>${money(f.cleaning)}</strong></div></div>
            <div class="t2-rp-grid">${field(w.payout,"payoutAmount","number",payoutAmount,disabled)}${field(w.status,"payoutStatus","select",payoutStatus,disabled,[["pending",w.pending],["paid",w.paid]])}${field(w.paidAt,"payoutPaidAt","date",data.payout_paid_at || "",disabled)}</div>
            <div class="t2-rp-proof"><label>${escapeHtml(w.payoutProof)}</label>${manager ? '<input name="payoutProof" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp">' : ""}<div class="t2-rp-proof-row"><span>${escapeHtml(data.payout_receipt_name || w.noProof)}</span>${data.payout_receipt_path ? `<button class="t2-rp-link" type="button" data-proof="${escapeHtml(data.payout_receipt_path)}">${escapeHtml(w.view)}</button>` : ""}</div><small>${escapeHtml(w.fileHelp)}</small></div>
          </section>
        </div>
        <p class="t2-rp-rule">${escapeHtml(w.rule)}</p>
        ${manager ? `<div class="t2-rp-footer"><span class="t2-rp-state" aria-live="polite"></span><button class="button button-primary" type="submit">${escapeHtml(w.save)}</button></div>` : ""}
      </form>`;
      const form = modal.querySelector("form");
      form.querySelector(".t2-rp-close").onclick = close;
      form.querySelectorAll("[data-proof]").forEach((button) => button.onclick = () => openProof(button.dataset.proof));
      if (manager) form.onsubmit = (event) => save(event, { property, reservation, record, f });
      form.querySelector("input,select,button")?.focus({ preventScroll: true });
    } catch (error) {
      console.error("reservation payout load", error);
      const state = modal.querySelector(".t2-rp-context");
      if (state) state.innerHTML = `<div><strong>${escapeHtml(error?.message || w.error)}</strong></div>`;
    }
  }

  async function save(event, context) {
    event.preventDefault();
    const form = event.currentTarget, button = form.querySelector('button[type="submit"]'), state = form.querySelector(".t2-rp-state"), w = words();
    const user = await sessionUser();
    if (!user || String(user.id) !== String(profile()?.id)) return alert(w.session);
    button.disabled = true; state.textContent = w.saving;
    let platformUpload = null, payoutUpload = null;
    try {
      const propertyId = context.property.id, reservationId = String(context.reservation.id);
      platformUpload = await upload(form.elements.platformProof?.files?.[0], propertyId, reservationId, "platform");
      payoutUpload = await upload(form.elements.payoutProof?.files?.[0], propertyId, reservationId, "owner");
      const row = {
        property_id: propertyId, reservation_id: reservationId, owner_id: context.property.owner_id || null,
        administrator_id: profile().role === "super_admin" ? (context.property.administrator_id || user.id) : user.id,
        platform: context.reservation.platform || "Airbnb", guest_name: context.reservation.guest || null,
        check_in: context.reservation.checkIn || null, check_out: context.reservation.checkOut || null,
        stay_amount: context.f.stay, cleaning_amount: context.f.cleaning, cleaning_mode: context.f.mode,
        commission_rate: context.f.rate, commission_amount: context.f.commission,
        platform_fees: number(form.elements.platformFees.value), platform_received_amount: number(form.elements.platformReceived.value),
        platform_status: form.elements.platformStatus.value, platform_received_at: form.elements.platformReceivedAt.value || null,
        platform_receipt_path: platformUpload?.path || context.record?.platform_receipt_path || null,
        platform_receipt_name: platformUpload?.name || context.record?.platform_receipt_name || null,
        payout_amount: number(form.elements.payoutAmount.value), payout_status: form.elements.payoutStatus.value,
        payout_paid_at: form.elements.payoutPaidAt.value || null,
        payout_receipt_path: payoutUpload?.path || context.record?.payout_receipt_path || null,
        payout_receipt_name: payoutUpload?.name || context.record?.payout_receipt_name || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await client().from(TABLE).upsert(row, { onConflict: "property_id,reservation_id" });
      if (error) throw error;
      state.textContent = w.saved;
      setTimeout(() => show(reservationId), 450);
    } catch (error) {
      console.error("reservation payout save", error);
      const paths = [platformUpload?.path, payoutUpload?.path].filter(Boolean);
      if (paths.length) try { await client().storage.from(BUCKET).remove(paths); } catch {}
      state.textContent = "";
      alert(error?.message || w.error);
    } finally { button.disabled = false; }
  }

  function close() {
    const modal = document.getElementById("t2ReservationPayoutModal");
    if (modal) { modal.hidden = true; modal.replaceChildren(); }
  }

  function installButtons() {
    const host = document.getElementById("reservations");
    if (!host || !profile()) return;
    host.querySelectorAll(".booking[data-reservation-id]").forEach((card) => {
      if (card.querySelector(".t2-rp-open")) return;
      const button = document.createElement("button");
      button.type = "button"; button.className = "button button-secondary t2-rp-open"; button.textContent = words().open;
      button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); show(card.dataset.reservationId); });
      const actions = card.querySelector(".booking-actions");
      if (actions) actions.append(button);
      else card.append(button);
    });
  }

  function boot() {
    css();
    if (!document.getElementById("t2ReservationPayoutModal")) {
      const modal = document.createElement("div"); modal.id = "t2ReservationPayoutModal"; modal.className = "t2-rp-modal"; modal.hidden = true;
      modal.addEventListener("click", (event) => { if (event.target === modal) close(); }); document.body.append(modal);
    }
    installButtons();
    const host = document.getElementById("reservations");
    if (host) new MutationObserver(() => requestAnimationFrame(installButtons)).observe(host, { childList: true, subtree: true });
    ["stay:unified-navigation", "stay:language-change", "pageshow"].forEach((name) => window.addEventListener(name, () => requestAnimationFrame(installButtons)));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
    window.Test2ReservationPayouts = { show, financials };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
