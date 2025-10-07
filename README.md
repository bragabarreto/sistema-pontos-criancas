# Sistema de Pontuação para Crianças

Sistema completo para gerenciar comportamentos e tarefas das crianças através de um sistema de pontos, com persistência em banco de dados e implantação serverless.

> **🚀 Versão 2.0 - Migrado para Vercel + PostgreSQL!**  
> O sistema agora usa banco de dados e pode ser acessado de qualquer dispositivo.  
> Veja [QUICKSTART.md](./QUICKSTART.md) para um guia rápido ou [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções de deploy completas.

## 🌟 Funcionalidades

### Gerenciamento Completo de Atividades
- ✅ **Registro de atividades com calendário** - Registre atividades para dias passados
- ✅ **Atribuir e remover pontos** - Botões dedicados para cada ação
- ✅ **Editar e excluir atividades** - Gerenciamento completo de atividades personalizadas
- ✅ **Drag-and-drop** - Reordene atividades arrastando e soltando
- ✅ **4 Categorias de atividades** - Positivas, Especiais, Negativas e Graves

### Configurações Avançadas
- ✅ **Cadastro do pai/mãe** - Nome, sexo e data de início do app
- ✅ **Saldo inicial por criança** - Configure pontos iniciais e data de início
- ✅ **Multiplicadores personalizáveis** - Ajuste o peso de cada categoria
- ✅ **Backup e importação** - Export/import de dados em JSON

### Interface Moderna
- ✅ **Dashboard intuitivo** - Visualize pontos e atividades recentes
- ✅ **Data e hora atual** - Dia da semana e formato DD/MM/AAAA
- ✅ **Relatórios e estatísticas** - Acompanhe a evolução
- ✅ **Responsivo** - Funciona em desktop, tablet e celular

### Tecnologia
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

2. Configure o sistema:
   - Vá para a aba "Configurações"
   - Preencha os dados do pai/mãe
   - Configure o saldo inicial de cada criança

3. Pronto! Seu sistema está no ar 🎉

## 📚 Documentação Adicional

- [FEATURES.md](./FEATURES.md) - Guia completo de funcionalidades e uso
- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido de início
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Instruções detalhadas de deploy
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detalhes técnicos da implementação
- [TEST_REPORT.md](./TEST_REPORT.md) - Relatório de testes implementados
- [__tests__/README.md](./__tests__/README.md) - Documentação dos testes automatizados

## 🗄️ Estrutura do Banco de Dados

### Tabelas:

- **parent_user**: Dados do pai/mãe responsável
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

### Parent User
- `GET /api/parent` - Buscar dados do pai/mãe
- `POST /api/parent` - Salvar/atualizar dados do pai/mãe

### Init
- `POST /api/init` - Inicializar banco com dados padrão

## 🔧 Scripts Disponíveis

```bash
npm run dev             # Inicia servidor de desenvolvimento
npm run build           # Build para produção
npm run start           # Inicia servidor de produção
npm run lint            # Executa o linter
npm test                # Executa todos os testes
npm run test:api        # Executa testes de API
npm run test:integration # Executa testes de integração
npm run db:generate     # Gera migrações do banco
npm run db:push         # Aplica migrações no banco
npm run db:studio       # Abre Drizzle Studio
```

## 🧪 Testes Automatizados

O sistema inclui **46 testes automatizados** cobrindo:

- ✅ **Cadastro de pais** - Validação completa de campos e sanitização
- ✅ **Registro de atividades** - Validação de entrada e prevenção de SQL injection
- ✅ **Cadastro de crianças** - Criação e listagem com tratamento robusto de erros
- ✅ **Atividades personalizadas** - CRUD completo com validações
- ✅ **Testes de integração** - Fluxos completos de uso
- ✅ **Testes de segurança** - Prevenção de SQL injection
- ✅ **Testes de robustez** - Tratamento de erros que previne crashes no frontend

### Executar Testes

```bash
# Executar todos os testes (46 testes)
npm test

# Executar apenas testes de API
npm run test:api

# Executar apenas testes de integração
npm run test:integration

# Executar teste específico
npm test __tests__/api/parent.test.ts
```

**Nota**: Os testes validam a lógica de validação e segurança dos endpoints. Alguns testes requerem que o servidor Next.js esteja rodando (`npm run dev`).

Para mais detalhes, veja:
- [TEST_REPORT.md](./TEST_REPORT.md) - Relatório completo de testes
- [__tests__/README.md](./__tests__/README.md) - Guia de testes

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | Connection string do PostgreSQL (Neon) | Sim |
| `TEST_BASE_URL` | URL base para testes (padrão: http://localhost:3000) | Não |

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
