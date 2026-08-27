# System Control Test 2.0

Ambiente separado de desenvolvimento e teste do novo Stay in Control.

## Regra principal
A branch `main`/versão atual não deve ser alterada durante a construção deste teste.

## Perfis
- Super Administrador: controle global, administradores, proprietários, unidades, correções técnicas, bloqueio/desbloqueio, reenvio de acesso, planos/cortesia, pagamentos, analytics e logs.
- Administrador: gerencia suas unidades e proprietários, reservas, calendário/iCal, despesas, receitas/danos, relatórios e convites de proprietários.
- Proprietário: somente visualização dos dados e relatórios das unidades vinculadas, conforme permissões.

## Regras do produto
- Responsivo: iOS, Android, tablet e desktop.
- Relatórios filtrados por unidade e mês selecionado.
- Relatório da administradora consolidado + relatório detalhado por propriedade.
- Fluxo financeiro: valor bruto -> limpeza -> comissão da administradora -> despesas recorrentes -> outras despesas -> repasse líquido do proprietário.
- iCal traz datas; valores/taxas não fornecidos pelo iCal não devem ser inventados.
- Comissão administrativa não incide sobre limpeza, danos/reembolsos ou receitas extraordinárias.
- Despesas recorrentes devem aparecer individualmente por descrição no relatório.
- Suporte a short stay e contratos de 6/12 meses.
- Receitas por danos, reembolsos e indenizações registradas separadamente.
- Acesso cortesia/isento configurável pelo Super Administrador, com limite livre de propriedades e término opcional.
- Plano normal configurável por quantidade exata de propriedades e valor acordado.
- Super Administrador pode bloquear acesso por inadimplência.
- Histórico de relatórios: Administrador e Proprietário até 10 anos a partir da implantação; Super Administrador com histórico integral disponível.
- Recuperação de senha retorna ao mesmo aplicativo.
- Central de Atendimento via WhatsApp: +1 (561) 275-6810.
- Banners rotativos/publicidade, incluindo publicidade do próprio aplicativo.
- Segurança crítica no backend: autenticação, autorização por perfil, isolamento de dados, segredos fora do cliente e logs de auditoria.

## Internacionalização
- Idiomas iniciais: Português (Brasil), English, Español, Français, Deutsch, Italiano, Português (Portugal), 中文（简体）, 日本語 e 한국어.
- O idioma escolhido no login deve permanecer selecionado dentro do aplicativo.
- Menus, formulários, mensagens de erro, relatórios/PDF, datas, meses, calendário, iCal, controles comerciais e controles de usuário devem acompanhar o idioma selecionado.
- Datas e horários devem usar o padrão regional do idioma selecionado.
- CPF + senha somente em Português (Brasil) e somente para proprietário Brasil; nos demais idiomas/países, acesso inicialmente por e-mail + senha.
- A estrutura deve permitir adicionar novos idiomas no futuro sem refazer as regras de negócio.

## Status
Estrutura inicial criada em 26/08/2026. Construção ocorrerá nesta branch antes de qualquer promoção para produção.
