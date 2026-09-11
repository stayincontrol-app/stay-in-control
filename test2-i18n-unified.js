(()=>{'use strict';
const K='system-control-test2-suite-v1';
const L=['pt-BR','en','es','fr','de','it','pt-PT','zh-CN','ja','ko'];
const R=[
['Propriedades / Proprietários','Properties / Owners','Propiedades / Propietarios','Propriétés / Propriétaires','Objekte / Eigentümer','Proprietà / Proprietari','Propriedades / Proprietários','房产 / 业主','物件 / オーナー','숙소 / 소유자'],
['Despesas / Receitas adicionais','Expenses / Additional income','Gastos / Ingresos adicionales','Dépenses / Revenus supplémentaires','Ausgaben / Zusätzliche Einnahmen','Spese / Entrate aggiuntive','Despesas / Receitas adicionais','支出 / 额外收入','経費 / 追加収入','지출 / 추가 수입'],
['Configurações / Central de Atendimento','Settings / Support Center','Configuración / Centro de Atención','Paramètres / Centre d’assistance','Einstellungen / Support-Center','Impostazioni / Centro Assistenza','Configurações / Centro de Atendimento','设置 / 客服中心','設定 / サポートセンター','설정 / 고객 지원 센터'],
['Planos & Pagamentos','Plans & Payments','Planes y Pagos','Forfaits et Paiements','Pläne & Zahlungen','Piani e Pagamenti','Planos e Pagamentos','套餐与付款','プランと支払い','요금제 및 결제'],
['Publicidade','Advertising','Publicidad','Publicité','Werbung','Pubblicità','Publicidade','广告','広告','광고'],
['Logs de Acessos','Access Logs','Registros de Acceso','Journaux d’accès','Zugriffsprotokolle','Registri Accessi','Registos de Acesso','访问日志','アクセスログ','접속 로그'],
['Administradores','Administrators','Administradores','Administrateurs','Administratoren','Amministratori','Administradores','管理员','管理者','관리자'],
['Administrador','Administrator','Administrador','Administrateur','Administrator','Amministratore','Administrador','管理员','管理者','관리자'],
['Proprietário','Owner','Propietario','Propriétaire','Eigentümer','Proprietario','Proprietário','业主','オーナー','소유자'],
['Propriedade / unidade','Property / unit','Propiedad / unidad','Propriété / unité','Objekt / Einheit','Proprietà / unità','Propriedade / unidade','房产 / 单元','物件 / ユニット','숙소 / 유닛'],
['Todos os administradores','All administrators','Todos los administradores','Tous les administrateurs','Alle Administratoren','Tutti gli amministratori','Todos os administradores','所有管理员','すべての管理者','모든 관리자'],
['Todos os proprietários','All owners','Todos los propietarios','Tous les propriétaires','Alle Eigentümer','Tutti i proprietari','Todos os proprietários','所有业主','すべてのオーナー','모든 소유자'],
['Todas as propriedades/unidades','All properties/units','Todas las propiedades/unidades','Toutes les propriétés/unités','Alle Objekte/Einheiten','Tutte le proprietà/unità','Todas as propriedades/unidades','所有房产/单元','すべての物件/ユニット','모든 숙소/유닛'],
['Idioma','Language','Idioma','Langue','Sprache','Lingua','Idioma','语言','言語','언어'],
['Sair','Log out','Salir','Déconnexion','Abmelden','Esci','Sair','退出','ログアウト','로그아웃'],
['Início','Home','Inicio','Accueil','Start','Home','Início','首页','ホーム','홈'],
['Reservas','Reservations','Reservas','Réservations','Reservierungen','Prenotazioni','Reservas','预订','予約','예약'],
['Relatórios','Reports','Informes','Rapports','Berichte','Report','Relatórios','报告','レポート','보고서'],
['Despesas','Expenses','Gastos','Dépenses','Ausgaben','Spese','Despesas','支出','経費','지출'],
['Controle de usuários','User management','Control de usuarios','Gestion des utilisateurs','Benutzerverwaltung','Gestione utenti','Controlo de utilizadores','用户管理','ユーザー管理','사용자 관리'],
['Alterar função, bloquear/desbloquear e revisar acessos cadastrados.','Change roles, block/unblock, and review registered access.','Cambiar función, bloquear/desbloquear y revisar accesos registrados.','Modifier les rôles, bloquer/débloquer et vérifier les accès enregistrés.','Rollen ändern, sperren/entsperren und registrierte Zugriffe prüfen.','Modifica ruoli, blocca/sblocca e verifica gli accessi registrati.','Alterar função, bloquear/desbloquear e rever acessos registados.','更改角色、锁定/解锁并查看已注册的访问权限。','役割の変更、ブロック/解除、登録済みアクセスの確認。','역할 변경, 차단/해제 및 등록된 접근 검토.'],
['NOME','NAME','NOMBRE','NOM','NAME','NOME','NOME','姓名','名前','이름'],
['E-MAIL','EMAIL','CORREO','E-MAIL','E-MAIL','E-MAIL','E-MAIL','电子邮件','メール','이메일'],
['FUNÇÃO','ROLE','FUNCIÓN','RÔLE','ROLLE','RUOLO','FUNÇÃO','角色','役割','역할'],
['Todos / sem administrador definido','All / no administrator assigned','Todos / sin administrador asignado','Tous / aucun administrateur attribué','Alle / kein Administrator zugewiesen','Tutti / nessun amministratore assegnato','Todos / sem administrador definido','全部 / 未分配管理员','すべて / 管理者未設定','전체 / 관리자 미지정'],
['Selecione o proprietário','Select owner','Seleccione el propietario','Sélectionnez le propriétaire','Eigentümer auswählen','Seleziona proprietario','Selecione o proprietário','选择业主','オーナーを選択','소유자 선택'],
['Selecione a propriedade/unidade','Select property/unit','Seleccione la propiedad/unidad','Sélectionnez la propriété/unité','Objekt/Einheit auswählen','Seleziona proprietà/unità','Selecione a propriedade/unidade','选择房产/单元','物件/ユニットを選択','숙소/유닛 선택'],
['INTEGRAÇÃO DE CALENDÁRIO','CALENDAR INTEGRATION','INTEGRACIÓN DE CALENDARIO','INTÉGRATION DU CALENDRIER','KALENDERINTEGRATION','INTEGRAZIONE CALENDARIO','INTEGRAÇÃO DE CALENDÁRIO','日历集成','カレンダー連携','캘린더 연동'],
['iCal por propriedade/unidade','iCal by property/unit','iCal por propiedad/unidad','iCal par propriété/unité','iCal nach Objekt/Einheit','iCal per proprietà/unità','iCal por propriedade/unidade','按房产/单元的 iCal','物件/ユニット別 iCal','숙소/유닛별 iCal'],
['Cada link fica ligado somente à unidade selecionada.','Each link is connected only to the selected unit.','Cada enlace queda vinculado únicamente a la unidad seleccionada.','Chaque lien est associé uniquement à l’unité sélectionnée.','Jeder Link ist nur mit der ausgewählten Einheit verbunden.','Ogni link è collegato solo all’unità selezionata.','Cada link fica ligado apenas à unidade selecionada.','每个链接仅关联到所选单元。','各リンクは選択したユニットのみに紐づきます。','각 링크는 선택한 유닛에만 연결됩니다.'],
['Link iCal desta propriedade','iCal link for this property','Enlace iCal de esta propiedad','Lien iCal de cette propriété','iCal-Link für dieses Objekt','Link iCal di questa proprietà','Link iCal desta propriedade','此房产的 iCal 链接','この物件の iCal リンク','이 숙소의 iCal 링크'],
['Salvar iCal desta unidade','Save iCal for this unit','Guardar iCal de esta unidad','Enregistrer l’iCal de cette unité','iCal für diese Einheit speichern','Salva iCal per questa unità','Guardar iCal desta unidade','保存此单元的 iCal','このユニットの iCal を保存','이 유닛의 iCal 저장'],
['Nova propriedade','New property','Nueva propiedad','Nouvelle propriété','Neues Objekt','Nuova proprietà','Nova propriedade','新建房产','新しい物件','새 숙소'],
['Nova reserva','New reservation','Nueva reserva','Nouvelle réservation','Neue Reservierung','Nuova prenotazione','Nova reserva','新预订','新しい予約','새 예약'],
['Gerar relatório','Generate report','Generar informe','Générer le rapport','Bericht erstellen','Genera report','Gerar relatório','生成报告','レポートを生成','보고서 생성'],
['Desempenho por propriedade','Performance by property','Rendimiento por propiedad','Performance par propriété','Leistung nach Objekt','Prestazioni per proprietà','Desempenho por propriedade','按房产的表现','物件別パフォーマンス','숙소별 성과'],
['Sem administrador','No administrator','Sin administrador','Sans administrateur','Kein Administrator','Nessun amministratore','Sem administrador','无管理员','管理者なし','관리자 없음'],
['Arquivados / Excluídos','Archived / Deleted','Archivados / Eliminados','Archivés / Supprimés','Archiviert / Gelöscht','Archiviati / Eliminati','Arquivados / Eliminados','已归档 / 已删除','アーカイブ / 削除済み','보관됨 / 삭제됨'],
['PATROCINADO','SPONSORED','PATROCINADO','SPONSORISÉ','GESPONSERT','SPONSORIZZATO','PATROCINADO','赞助','スポンサー','스폰서'],
['Patrocinado','Sponsored','Patrocinado','Sponsorisé','Gesponsert','Sponsorizzato','Patrocinado','赞助','スポンサー','스폰서'],
['Proprietários','Owners','Propietarios','Propriétaires','Eigentümer','Proprietari','Proprietários','业主','オーナー','소유자'],
['Novo administrador','New administrator','Nuevo administrador','Nouvel administrateur','Neuer Administrator','Nuovo amministratore','Novo administrador','新管理员','新しい管理者','새 관리자'],
['Novo proprietário','New owner','Nuevo propietario','Nouveau propriétaire','Neuer Eigentümer','Nuovo proprietario','Novo proprietário','新业主','新しいオーナー','새 소유자'],
['Forma de acesso','Access method','Forma de acceso','Mode d’accès','Zugriffsmethode','Metodo di accesso','Forma de acesso','访问方式','アクセス方法','접근 방식'],
['Nome completo','Full name','Nombre completo','Nom complet','Vollständiger Name','Nome completo','Nome completo','全名','氏名','전체 이름'],
['WhatsApp (opcional)','WhatsApp (optional)','WhatsApp (opcional)','WhatsApp (facultatif)','WhatsApp (optional)','WhatsApp (opzionale)','WhatsApp (opcional)','WhatsApp（可选）','WhatsApp（任意）','WhatsApp(선택)'],
['Salvar e enviar acesso','Save and send access','Guardar y enviar acceso','Enregistrer et envoyer l’accès','Speichern und Zugang senden','Salva e invia accesso','Guardar e enviar acesso','保存并发送访问权限','保存してアクセスを送信','저장하고 접근 전송'],
['E-mail + senha','Email + password','Correo + contraseña','E-mail + mot de passe','E-Mail + Passwort','E-mail + password','E-mail + palavra-passe','电子邮件 + 密码','メール + パスワード','이메일 + 비밀번호'],
['CPF + senha (Brasil)','CPF + password (Brazil)','CPF + contraseña (Brasil)','CPF + mot de passe (Brésil)','CPF + Passwort (Brasilien)','CPF + password (Brasile)','CPF + palavra-passe (Brasil)','CPF + 密码（巴西）','CPF + パスワード（ブラジル）','CPF + 비밀번호(브라질)'],
['Gerar novo link','Generate new link','Generar nuevo enlace','Générer un nouveau lien','Neuen Link erstellen','Genera nuovo link','Gerar novo link','生成新链接','新しいリンクを生成','새 링크 생성'],
['Copiar link','Copy link','Copiar enlace','Copier le lien','Link kopieren','Copia link','Copiar link','复制链接','リンクをコピー','링크 복사'],
['Enviar pelo WhatsApp','Send via WhatsApp','Enviar por WhatsApp','Envoyer via WhatsApp','Über WhatsApp senden','Invia via WhatsApp','Enviar pelo WhatsApp','通过 WhatsApp 发送','WhatsAppで送信','WhatsApp으로 보내기'],
['Fechar','Close','Cerrar','Fermer','Schließen','Chiudi','Fechar','关闭','閉じる','닫기'],
['Bloquear','Block','Bloquear','Bloquer','Sperren','Blocca','Bloquear','锁定','ブロック','차단'],
['Desbloquear','Unblock','Desbloquear','Débloquer','Entsperren','Sblocca','Desbloquear','解锁','ブロック解除','차단 해제'],
['Alterar função','Change role','Cambiar función','Modifier le rôle','Rolle ändern','Cambia ruolo','Alterar função','更改角色','役割を変更','역할 변경'],
['Reenviar acesso','Resend access','Reenviar acceso','Renvoyer l’accès','Zugang erneut senden','Reinvia accesso','Reenviar acesso','重新发送访问权限','アクセスを再送','접근 재전송'],
['Controle financeiro','Financial control','Control financiero','Contrôle financier','Finanzkontrolle','Controllo finanziario','Controlo financeiro','财务管理','財務管理','재무 관리'],
['Receita bruta','Gross revenue','Ingresos brutos','Revenu brut','Bruttoumsatz','Ricavi lordi','Receita bruta','总收入','総収益','총수익'],
['Repasse líquido','Net payout','Pago neto','Versement net','Nettoauszahlung','Pagamento netto','Repasse líquido','净结算','純支払額','순지급액'],
['Comissão','Commission','Comisión','Commission','Provision','Commissione','Comissão','佣金','手数料','수수료'],
['Despesas recorrentes','Recurring expenses','Gastos recurrentes','Dépenses récurrentes','Wiederkehrende Ausgaben','Spese ricorrenti','Despesas recorrentes','经常性支出','定期経費','정기 지출'],
['Relatório financeiro','Financial report','Informe financiero','Rapport financier','Finanzbericht','Report finanziario','Relatório financeiro','财务报告','財務レポート','재무 보고서'],
['Relatório geral','Overall report','Informe general','Rapport général','Gesamtbericht','Report generale','Relatório geral','总报告','全体レポート','전체 보고서'],
['Cancelar','Cancel','Cancelar','Annuler','Abbrechen','Annulla','Cancelar','取消','キャンセル','취소'],
['Excluir','Delete','Eliminar','Supprimer','Löschen','Elimina','Eliminar','删除','削除','삭제'],
['Editar','Edit','Editar','Modifier','Bearbeiten','Modifica','Editar','编辑','編集','편집'],
['Ativo','Active','Activo','Actif','Aktiv','Attivo','Ativo','启用','有効','활성'],
['Inativo','Inactive','Inactivo','Inactif','Inaktiv','Inattivo','Inativo','停用','無効','비활성']
];
const idx=new Map();R.forEach(r=>r.forEach(v=>{if(v)idx.set(v.trim(),r)}));
function lang(){try{return JSON.parse(localStorage.getItem(K)||'{}').language||'pt-BR'}catch{return'pt-BR'}}
function li(){const i=L.indexOf(lang());return i<0?0:i}
function dynamic(t,i){let m=t.match(/^(?:Olá|Hello|Hola|Bonjour|Hallo|Ciao|Olá|你好|こんにちは|안녕하세요),\s*(.+?)(?:!\s*👋)?$/i);if(m){const a=['Olá','Hello','Hola','Bonjour','Hallo','Ciao','Olá','你好','こんにちは','안녕하세요'];return `${a[i]}, ${m[1]}! 👋`}m=t.match(/^(?:Proprietário|Owner|Propietario|Propriétaire|Eigentümer|Proprietario|业主|オーナー|소유자):\s*(.+)$/i);if(m){const a=['Proprietário','Owner','Propietario','Propriétaire','Eigentümer','Proprietario','Proprietário','业主','オーナー','소유자'];return `${a[i]}: ${m[1]}`}m=t.match(/^(?:Administrador|Administrator|Administrateur|Amministratore|管理员|管理者|관리자):\s*(.+)$/i);if(m){const a=['Administrador','Administrator','Administrador','Administrateur','Administrator','Amministratore','Administrador','管理员','管理者','관리자'];return `${a[i]}: ${m[1]}`}return null}
let busy=false,pending=false,last='';
function tr(t){const i=li(),r=idx.get(t.trim());return r?r[i]:dynamic(t.trim(),i)}
function text(n){if(!n||n.nodeType!==3)return;const raw=n.nodeValue||'',t=raw.trim();if(!t)return;const x=tr(t);if(x&&x!==t)n.nodeValue=raw.replace(t,x)}
function attrs(el){['placeholder','aria-label','title'].forEach(a=>{if(!el.hasAttribute?.(a))return;const v=el.getAttribute(a)||'',x=tr(v);if(x&&x!==v)el.setAttribute(a,x)})}
function apply(){if(busy||!document.body)return;busy=true;document.documentElement.lang=lang();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){const e=n.parentElement;return e&&/^(SCRIPT|STYLE|NOSCRIPT)$/.test(e.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});let n;while(n=w.nextNode())text(n);document.querySelectorAll('body *').forEach(attrs);last=lang();busy=false}
function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;apply()},40)}
function boot(){apply();new MutationObserver(m=>{if(!busy&&m.some(x=>x.addedNodes.length||x.type==='characterData'))schedule()}).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('change',e=>{if(['t2AppLanguage','t2V2Language'].includes(e.target?.id))schedule()},true);['stay:language-change','stay:navigation','stay:unified-navigation','stay:screens-organized','stay:management-ready','stay:roles-changed'].forEach(ev=>window.addEventListener(ev,schedule));setInterval(()=>{if(lang()!==last)schedule()},400);window.Test2I18nUnified={apply,schedule,languages:L.slice()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();