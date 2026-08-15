# AP207 Dashboard

Painel responsivo de reservas, calendário, despesas e relatórios, agora preparado para múltiplas propriedades e controle de acesso por papel.

## Estrutura SaaS inicial

- `permissions.js` concentra a política de autorização para **super administrador**, **administrador/gestor** e **proprietário**. As operações de escrita chamam essa camada; esconder botões é apenas uma melhoria de interface.
- `data.json` contém usuários e propriedades relacionados por IDs. Reservas, despesas e alterações de propriedade continuam no armazenamento local, separado por propriedade.
- O seletor de perfil é somente uma demonstração temporária dos papéis. Em produção, `currentUserId` deverá vir de uma sessão autenticada e as mesmas regras deverão ser aplicadas novamente na API/banco de dados. O cliente nunca deve ser considerado a fronteira final de segurança.

## Executar

Sirva a pasta com um servidor HTTP (por exemplo, `python3 -m http.server 8000`) e abra `http://localhost:8000`.

## Testes

```bash
node --test
```
