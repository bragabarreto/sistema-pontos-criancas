# Sistema de Pontuação para Crianças

Sistema completo para gerenciar comportamentos e tarefas das crianças através de um sistema de pontos, com persistência em banco de dados e implantação serverless.

## 🌟 Funcionalidades

- ✅ Registro diário de atividades
- ✅ Sistema de pontos personalizável
- ✅ Multiplicadores para atividades especiais
- ✅ Controle de gastos e mesada
- ✅ Relatórios e estatísticas
- ✅ **Persistência em banco de dados PostgreSQL**
- ✅ **Deploy serverless no Vercel**
- ✅ Acesso de qualquer navegador
- ✅ API REST para integração

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 15, React 18, TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Neon](https://neon.tech) (para banco de dados PostgreSQL gratuito)
- Conta no [Vercel](https://vercel.com) (para deploy)

## 🛠️ Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/bragabarreto/sistema-pontos-criancas.git
cd sistema-pontos-criancas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
   - Crie uma conta gratuita no [Neon](https://neon.tech)
   - Crie um novo projeto
   - Copie a connection string fornecida

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione sua connection string:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

5. Execute as migrações do banco de dados:
```bash
npm run db:push
```

6. Inicialize o banco com dados padrão:
   - Acesse `http://localhost:3000/api/init` via POST request ou
   - Use o comando: `curl -X POST http://localhost:3000/api/init`

7. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

8. Acesse: [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy no Vercel

### Via CLI:

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Via Dashboard:

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe este repositório do GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Sua connection string do Neon
5. Clique em "Deploy"

### Após o Deploy:

1. Inicialize o banco de dados acessando:
   ```
   https://seu-projeto.vercel.app/api/init
   ```
   via POST request (use Postman, curl ou similar)

2. Pronto! Seu sistema está no ar 🎉

## 🗄️ Estrutura do Banco de Dados

### Tabelas:

- **children**: Dados das crianças (Luiza e Miguel)
- **activities**: Histórico de atividades realizadas
- **custom_activities**: Atividades personalizadas por criança
- **settings**: Configurações do sistema (multiplicadores, etc)

### Comandos Drizzle:

```bash
# Gerar migrações
npm run db:generate

# Aplicar migrações
npm run db:push

# Abrir Drizzle Studio (GUI para o banco)
npm run db:studio
```

## 📡 API Endpoints

### Children
- `GET /api/children` - Listar todas as crianças
- `POST /api/children` - Criar nova criança
- `GET /api/children/[id]` - Buscar criança específica
- `PUT /api/children/[id]` - Atualizar criança
- `DELETE /api/children/[id]` - Deletar criança

### Activities
- `GET /api/activities?childId=[id]` - Listar atividades
- `POST /api/activities` - Registrar nova atividade
- `DELETE /api/activities/[id]` - Deletar atividade

### Custom Activities
- `GET /api/custom-activities?childId=[id]` - Listar atividades personalizadas
- `POST /api/custom-activities` - Criar atividade personalizada
- `PUT /api/custom-activities/[id]` - Atualizar atividade personalizada
- `DELETE /api/custom-activities/[id]` - Deletar atividade personalizada

### Settings
- `GET /api/settings?key=[key]` - Buscar configuração
- `POST /api/settings` - Salvar configuração

### Init
- `POST /api/init` - Inicializar banco com dados padrão

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa o linter
npm run db:generate  # Gera migrações do banco
npm run db:push      # Aplica migrações no banco
npm run db:studio    # Abre Drizzle Studio
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | Connection string do PostgreSQL (Neon) | Sim |

## 📝 Notas Importantes

- O banco de dados Neon tem um plano gratuito generoso (0.5GB, suficiente para este projeto)
- O Vercel também oferece deploy gratuito para projetos pessoais
- Os dados agora são persistidos em banco de dados, não mais no localStorage
- É possível acessar e modificar dados de qualquer dispositivo

## 🐛 Troubleshooting

### Erro de conexão com o banco:
- Verifique se a `DATABASE_URL` está correta no `.env.local`
- Certifique-se de que incluiu `?sslmode=require` no final da URL

### Build falha no Vercel:
- Verifique se todas as variáveis de ambiente estão configuradas no dashboard do Vercel
- Confirme que a `DATABASE_URL` está acessível publicamente

### Dados não aparecem:
- Execute o endpoint `/api/init` para inicializar o banco com dados padrão

## 💡 Criado para Famílias

Sistema desenvolvido para ajudar pais a incentivar bons comportamentos e gerenciar a mesada das crianças de forma divertida e educativa.

## 📄 Licença

Este projeto é de código aberto para uso pessoal e educacional.
