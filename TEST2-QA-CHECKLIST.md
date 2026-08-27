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
- [x] Central de Atendimento: +1 (561) 275-6810.
- [x] Idioma disponível na interface.
- [x] iCal configurável por plataforma/unidade; não inventa taxas/valores não fornecidos.
- [x] Short stay e contratos de médio/longo prazo.
- [x] Danos, reembolsos e indenizações separados da receita de hospedagem.
- [x] Comissão não aplicada automaticamente à limpeza/danos.
- [x] Relatório: bruto → limpeza → comissão → recorrentes/outras despesas → repasse líquido.
- [x] Histórico/auditoria visível.
- [x] Banners/publicidade controlados pelo Super Administrador.

## Antes da aprovação final
- [ ] Validar login/convite em URL de preview do Vercel.
- [ ] Validar fluxo real de CPF no Brasil com backend dedicado ao Test 2.0.
- [ ] Validar reset de senha e retorno para a mesma URL do Test 2.0.
- [ ] Validar RLS/isolamento real de dados no backend separado.
- [ ] Testar iPhone Safari, Android Chrome e desktop.
- [ ] Testar importação real de feeds iCal.
- [ ] Testar geração/exportação do relatório/PDF.
- [ ] Aprovação do usuário antes de qualquer promoção para `main`/produção.

> O ambiente Test 2.0 não deve ser promovido para produção até todos os itens de validação final estarem aprovados.
