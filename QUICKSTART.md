# Quick Start Guide - Sistema de Pontos com Vercel

## O que foi implementado? ✅

Este sistema foi **completamente migrado** de uma aplicação baseada em localStorage para uma **aplicação serverless moderna** com banco de dados persistente.

### Stack Tecnológica

- **Frontend**: Next.js 15 + React 18 + TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM
- **Deploy**: Vercel

### Principais Mudanças

| Antes (localStorage) | Depois (Database) |
|---------------------|-------------------|
| Dados apenas no navegador | Dados acessíveis de qualquer lugar |
| Backup manual via JSON | Backup automático no banco |
| Sem sincronização | Sincronização em tempo real |
| Deploy estático | Deploy serverless dinâmico |
| Sem API | API REST completa |

## Como usar agora?

### 1️⃣ Para desenvolvimento local:

```bash
# Instalar dependências
npm install

# Configurar variável de ambiente
cp .env.example .env.local
# Edite .env.local e adicione sua DATABASE_URL do Neon

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### 2️⃣ Para deploy no Vercel:

Siga o guia completo em [DEPLOYMENT.md](./DEPLOYMENT.md)

**Resumo rápido:**
1. Crie conta no Neon (https://neon.tech)
2. Copie a connection string
3. Faça deploy no Vercel (https://vercel.com)
4. Configure DATABASE_URL nas variáveis de ambiente
5. Acesse `/api/init` para inicializar o banco

## Funcionalidades Implementadas

### API Endpoints

✅ **Children (Crianças)**
- `GET /api/children` - Listar
- `POST /api/children` - Criar
- `GET /api/children/[id]` - Buscar
- `PUT /api/children/[id]` - Atualizar
- `DELETE /api/children/[id]` - Deletar

✅ **Activities (Atividades)**
- `GET /api/activities?childId=[id]` - Listar por criança
- `POST /api/activities` - Registrar nova atividade
- `DELETE /api/activities/[id]` - Deletar

✅ **Custom Activities (Atividades Personalizadas)**
- `GET /api/custom-activities?childId=[id]` - Listar
- `POST /api/custom-activities` - Criar
- `PUT /api/custom-activities/[id]` - Atualizar
- `DELETE /api/custom-activities/[id]` - Deletar

✅ **Settings (Configurações)**
- `GET /api/settings?key=[key]` - Buscar configuração
- `POST /api/settings` - Salvar configuração

✅ **Init (Inicialização)**
- `POST /api/init` - Inicializar banco com dados padrão

✅ **Import (Importação)**
- `POST /api/import` - Importar dados de backup JSON

### Interface do Usuário

✅ **Dashboard**
- Visualização de saldo inicial, pontos ganhos e total
- Atividades recentes
- Estatísticas por criança

✅ **Atividades**
- Registro rápido de atividades por categoria
- Visualização de atividades personalizadas
- Sistema de multiplicadores

✅ **Relatórios**
- Filtros por período (semana, mês, tudo)
- Estatísticas detalhadas
- Histórico completo de atividades

✅ **Configurações**
- Gerenciamento de multiplicadores
- Criação de atividades personalizadas
- **Exportação de dados** (backup JSON)
- **Importação de dados** (migração de sistema antigo)

## Estrutura do Projeto

```
sistema-pontos-criancas/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── children/            # CRUD de crianças
│   │   ├── activities/          # CRUD de atividades
│   │   ├── custom-activities/   # CRUD de atividades personalizadas
│   │   ├── settings/            # Configurações
│   │   ├── init/                # Inicialização do banco
│   │   └── import/              # Importação de dados
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais
├── components/                   # Componentes React
│   ├── ChildSelector.tsx        # Seletor de criança
│   ├── Dashboard.tsx            # Dashboard
│   ├── Activities.tsx           # Registro de atividades
│   ├── Reports.tsx              # Relatórios
│   └── Settings.tsx             # Configurações
├── lib/                         # Utilidades
│   ├── db.ts                    # Conexão com banco
│   └── schema.ts                # Schema do banco (Drizzle)
├── drizzle.config.ts            # Configuração do Drizzle
├── package.json                 # Dependências
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind config
├── next.config.js               # Next.js config
├── vercel.json                  # Vercel config
├── .env.example                 # Exemplo de variáveis de ambiente
├── README.md                    # Documentação completa
├── DEPLOYMENT.md                # Guia de deploy
└── QUICKSTART.md                # Este arquivo
```

## Schema do Banco de Dados

### Tabela: `children`
```sql
- id (serial, primary key)
- name (text, not null)
- initial_balance (integer)
- total_points (integer)
- start_date (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabela: `activities`
```sql
- id (serial, primary key)
- child_id (integer, foreign key)
- name (text, not null)
- points (integer, not null)
- category (text, not null)
- date (timestamp)
- multiplier (integer)
- created_at (timestamp)
```

### Tabela: `custom_activities`
```sql
- id (serial, primary key)
- child_id (integer, foreign key)
- activity_id (text, unique)
- name (text, not null)
- points (integer, not null)
- category (text, not null)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabela: `settings`
```sql
- id (serial, primary key)
- key (text, unique)
- value (jsonb)
- updated_at (timestamp)
```

## Migrando Dados Antigos

Se você já usava o sistema anterior (localStorage):

1. Exporte os dados do sistema antigo:
   - Abra o sistema antigo
   - Vá em Configurações
   - Clique em "Exportar Dados"
   - Salve o arquivo JSON

2. Importe no novo sistema:
   - Acesse o novo sistema
   - Vá em Configurações
   - Clique em "Importar Dados"
   - Selecione o arquivo JSON exportado

## Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Executar linter
npm run db:generate  # Gerar migrações do banco
npm run db:push      # Aplicar migrações no banco
npm run db:studio    # Abrir Drizzle Studio (GUI do banco)
```

## Custos

### Plano Gratuito é Suficiente! 🎉

- **Neon**: 0.5GB grátis (mais que suficiente)
- **Vercel**: 100GB bandwidth grátis
- **Total**: R$ 0,00 / mês

## Próximos Passos Opcionais

1. **Autenticação**: Adicionar NextAuth.js para proteger o acesso
2. **Notificações**: Implementar notificações push
3. **Gráficos**: Adicionar visualizações gráficas com Chart.js
4. **PWA**: Transformar em Progressive Web App
5. **Multi-tenant**: Permitir múltiplas famílias

## Suporte

- 📚 Leia o [README.md](./README.md) para documentação completa
- 🚀 Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para guia de deploy
- 🐛 Abra uma issue no GitHub para reportar problemas

---

**Criado com ❤️ para famílias que querem incentivar bons comportamentos!**
