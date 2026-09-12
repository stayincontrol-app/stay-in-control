# Stay in Control — QA

## Padrão permanente de paridade
- [x] Uma única aplicação e uma única lógica para celular, tablet, laptop e desktop.
- [x] Correções e novas funções devem valer para todos os tamanhos de tela; somente a apresentação/layout pode mudar.
- [x] A mesma função autorizada deve funcionar da mesma forma para Super Administrador, Administrador e Proprietário em qualquer dispositivo.
- [x] Nenhuma função pode ficar disponível somente no celular ou somente no computador sem uma decisão explícita de produto.
- [x] Todos os 10 idiomas devem acompanhar a interface estática e dinâmica em todos os dispositivos e perfis.
- [x] Dados, permissões, propriedades, usuários, reservas e valores financeiros usam o mesmo backend como fonte de verdade em todos os dispositivos.
- [x] Login, sessão, reset de senha, convites, CPF, WhatsApp, banners/rotação, navegação, propriedades, reservas, iCal, despesas, receitas, relatórios, contratos e controles de usuários fazem parte da paridade obrigatória.
- [x] Toda correção futura herda automaticamente estes critérios, mesmo quando o pedido vier a partir de um print de apenas um aparelho.

> Referência obrigatória: `DEVICE-PARITY-STANDARD.md`.

## Bloco 1 — implementação e revisão estática
- [x] Login e sessão com validação de perfil/usuário e limpeza de estado inválido.
- [x] Encerramento por inatividade e logout limpando tokens e caches sensíveis.
- [x] Recuperação de senha no mesmo aplicativo com mensagens seguras.
- [x] Login por CPF limitado ao Brasil/PT-BR, com validação dos dígitos verificadores.
- [x] Convites e gerenciamento de usuários com função, bloqueio/desbloqueio e reenviar acesso.
- [x] Administrador impedido de criar outro Administrador; Super Administrador mantém controle de função.
- [x] Propriedades filtradas por perfil/permissão com IDs normalizados e comportamento fail-closed.
- [x] Troca de propriedade e cache local impedindo contexto de unidade não autorizada.
- [x] Controle comercial de Administrador validando sessão, bloqueio, inadimplência e cortesia vencida.
- [x] Dados dinâmicos de usuários/propriedades renderizados de forma segura nas áreas revisadas.
- [x] Mensagens técnicas de autenticação, convites e serviços sanitizadas para o usuário final.
- [x] Interface de autenticação, recuperação, sessão, propriedades e acessos coberta pelos 10 idiomas definidos.
- [x] Último build do Bloco 1 aprovado pelo Vercel.

## Bloco 2 — implementação e revisão estática
- [x] Reservas e despesas isoladas por propriedade autorizada.
- [x] Comissão calculada sobre hospedagem sem aplicar automaticamente sobre limpeza, danos ou indenizações.
- [x] Despesas recorrentes vinculadas à propriedade, incluídas nos relatórios quando vencidas e limpas no encerramento de sessão.
- [x] Relatórios mensais, anuais, por unidade e consolidados com ocupação e média da diária usando denominadores financeiros consistentes.
- [x] iCal vinculado à propriedade autorizada, com sincronização real protegida pela Edge Function.
- [x] Contratos e receitas adicionais vinculados à propriedade e renderizados com saída segura.
- [x] Gestão de propriedade com país persistido no backend e cache, inclusive na edição.
- [x] Impressão de relatório revalida sessão e propriedade antes de imprimir.
- [x] Suíte revisada para falhar fechada sem perfil válido.

## Regras obrigatórias
- [x] Layout responsivo base: celular, tablet, laptop e desktop.
- [x] Paridade funcional obrigatória entre celular, tablet, laptop e desktop.
- [x] Super Administrador com área de Administradores e Analíticos.
- [x] Administrador sem Analíticos.
- [x] Proprietário em modo somente leitura.
- [x] Limite de propriedades digitável, sem faixas fixas.
- [x] Acesso cortesia/isento com término opcional.
- [x] Bloqueio/desbloqueio de administrador no controle do Super Administrador.
- [x] Controle comercial persistido no backend: limite de propriedades, valor mensal, pago/cortesia, vencimento, status de pagamento e bloqueio.
- [x] Backend impede administrador de ultrapassar o número de propriedades liberado pelo Super Administrador.
- [x] Administrador bloqueado, inadimplente ou com cortesia vencida não entra no sistema.
- [x] Central de Atendimento: +1 (561) 275-6810.
- [x] Idioma disponível na interface.
- [x] 10 idiomas configurados: PT-BR, EN, ES, FR, DE, IT, PT-PT, ZH-CN, JA e KO.
- [x] Traduções próprias restauradas para todos os idiomas, sem fallback indevido para inglês nas áreas principais.
- [x] Gestão de propriedades/unidades com rótulos, placeholders, avisos e confirmações acompanhando o idioma selecionado.
- [x] Controle de usuários e convites com cobertura multilíngue.
- [x] Recuperação de senha com cobertura multilíngue e retorno no mesmo aplicativo.
- [x] iCal configurável por plataforma/unidade; não inventa taxas/valores não fornecidos.
- [x] Short stay e contratos de médio/longo prazo.
- [x] Danos, reembolsos e indenizações separados da receita de hospedagem.
- [x] Comissão não aplicada automaticamente à limpeza/danos.
- [x] Relatório: bruto → limpeza → comissão → recorrentes/outras despesas → repasse líquido.
- [x] Relatório identifica administrador responsável, proprietário, unidade e período antes de imprimir/salvar PDF.
- [x] Troca de propriedade recarrega o contexto da unidade para evitar mistura de reservas/despesas entre imóveis.
- [x] Histórico/auditoria visível.
- [x] Banners/publicidade controlados pelo Super Administrador e rotação consistente entre dispositivos.
- [x] RLS habilitado nas tabelas públicas verificadas.
- [x] Funções SECURITY DEFINER internas sem execução direta para `anon` e `authenticated`.
- [x] Políticas RLS otimizadas para evitar reavaliação de `auth.uid()` por linha.
- [x] Políticas permissivas duplicadas consolidadas sem reduzir regras de acesso.
- [x] Índices de chaves estrangeiras críticas adicionados.
- [x] Edge Function `ical-sync` ativa com JWT obrigatório, HTTPS e proteção contra hosts privados.
- [x] Edge Function de controle de usuários ativa e protegida por JWT.
- [x] Interface conectada ao fluxo real de sincronização iCal.
- [x] Fluxo de CPF + senha conectado ao backend existente para proprietário Brasil.

## Validação contínua
- [ ] Validar login com uma tentativa em celular, tablet e desktop/laptop após mudanças de autenticação.
- [ ] Validar reset de senha e convite sem reutilizar sessão antiga.
- [ ] Validar isolamento real de dados entre Super Administrador, Administrador e Proprietário com sessões distintas.
- [ ] Validar as funções principais em pelo menos um navegador móvel e um navegador desktop após mudanças de interface.
- [ ] Validar os 10 idiomas em conteúdo estático e dinâmico quando houver alteração de tradução.
- [ ] Testar importação de pelo menos um feed iCal real de uma propriedade quando o módulo iCal mudar.
- [ ] Testar impressão/exportação do relatório em PDF quando o módulo de relatório mudar.

> Uma alteração não é considerada concluída somente porque funciona em um aparelho. O padrão de aceitação é paridade funcional entre dispositivos e respeito às permissões do perfil.