Linkzam - Backend scaffold and frontend integrations

Setup (Windows)

1. Instale dependências:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm run dev
```

O servidor roda em `http://localhost:3000` e serve os arquivos HTML estáticos da pasta do projeto.

Funcionalidades adicionadas:
- Backend Express com APIs para `tickets`, `messages`, `clients`, `devices` e integração Socket.IO.
- SQLite automático em `data/linkzam.db` (criado no primeiro start).
- Endpoint `/download` que gera um zip do projeto para download.

Observações:
- Para produção recomendo migrar para PostgreSQL. O SQLite aqui é para desenvolvimento rápido.
- Integrações com WhatsApp/Telegram serão adicionadas como adaptadores; atualmente há tabela `integrations`.
