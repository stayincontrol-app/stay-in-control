# System Control Test 2.0 — QA

## Regras obrigatórias
- [x] Branch separada da produção.
- [x] Sem CNAME de produção no ambiente de teste.
- [x] Layout responsivo base: celular, tablet e desktop.
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
- [x] iCal configurável por plataforma/unidade; não inventa taxas/valores não fornecidos.
- [x] Short stay e contratos de médio/longo prazo.
- [x] Danos, reembolsos e indenizações separados da receita de hospedagem.
- [x] Comissão não aplicada automaticamente à limpeza/danos.
- [x] Relatório: bruto → limpeza → comissão → recorrentes/outras despesas → repasse líquido.
- [x] Relatório identifica administrador responsável, proprietário, unidade e período antes de imprimir/salvar PDF.
- [x] Troca de propriedade recarrega o contexto da unidade para evitar mistura de reservas/despesas entre imóveis.
- [x] Histórico/auditoria visível.
- [x] Banners/publicidade controlados pelo Super Administrador.
- [x] RLS habilitado nas tabelas públicas verificadas.
- [x] Funções SECURITY DEFINER internas sem execução direta para `anon` e `authenticated`.
- [x] Políticas RLS otimizadas para evitar reavaliação de `auth.uid()` por linha.
- [x] Políticas permissivas duplicadas consolidadas sem reduzir regras de acesso.
- [x] Índices de chaves estrangeiras críticas adicionados.
- [x] Edge Function `ical-sync` ativa com JWT obrigatório, HTTPS e proteção contra hosts privados.
- [x] Edge Function de controle de usuários ativa e protegida por JWT.
- [x] Interface do Test 2.0 conectada ao fluxo real de sincronização iCal.
- [x] Fluxo de CPF + senha conectado ao backend existente para proprietário Brasil.
- [x] Último build de validação do Test 2.0 aprovado pelo Vercel.

## Antes da aprovação final
- [ ] Validar login/convite em URL de preview do Vercel com conta real de teste.
- [ ] Validar fluxo real de CPF no Brasil com uma conta de proprietário configurada para CPF.
- [ ] Validar reset de senha e retorno para a mesma URL do Test 2.0.
- [ ] Validar isolamento real de dados entre Super Administrador, Administrador e Proprietário com sessões distintas.
- [ ] Ativar proteção contra senhas vazadas no Supabase Auth.
- [ ] Testar iPhone Safari, Android Chrome e desktop com interação real.
- [ ] Testar importação de pelo menos um feed iCal real de uma propriedade.
- [ ] Testar impressão/exportação do relatório em PDF no navegador.
- [ ] Aprovação do usuário antes de qualquer promoção para `main`/produção.

> O ambiente Test 2.0 não deve ser promovido para produção até todos os itens de validação final estarem aprovados.
