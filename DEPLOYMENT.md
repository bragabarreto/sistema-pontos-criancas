# Guia de Implantação no Vercel

Este guia passo a passo mostra como fazer o deploy do Sistema de Pontuação para Crianças no Vercel com banco de dados Neon.

## Passo 1: Criar conta no Neon (Banco de Dados)

1. Acesse [neon.tech](https://neon.tech)
2. Clique em "Sign Up" e crie uma conta (pode usar GitHub)
3. Após o login, clique em "Create a project"
4. Dê um nome ao projeto (ex: "sistema-pontos-criancas")
5. Escolha a região mais próxima (ex: US East para melhor latência)
6. Clique em "Create project"

## Passo 2: Obter a Connection String

1. Na página do projeto Neon, procure por "Connection string"
2. Selecione "Pooled connection" (recomendado para serverless)
3. Copie a connection string completa
   - Formato: `postgresql://user:password@ep-xxxxx.region.neon.tech/dbname?sslmode=require`
4. **Guarde essa string com segurança** - você vai precisar dela no Vercel

## Passo 3: Preparar o Repositório no GitHub

1. Se ainda não fez, faça commit de todas as alterações:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. Certifique-se de que o `.gitignore` está configurado para não versionar:
   - `/node_modules`
   - `/.next`
   - `/.env*.local`

## Passo 4: Deploy no Vercel

### Opção A: Via Dashboard (Mais Fácil)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up" ou "Login" (pode usar GitHub)
3. Clique em "Add New..." → "Project"
4. Selecione o repositório `sistema-pontos-criancas`
5. Configure as variáveis de ambiente:
   - Clique em "Environment Variables"
   - Adicione:
     - Name: `DATABASE_URL`
     - Value: Cole a connection string do Neon
     - Environments: Marque Production, Preview e Development
6. Clique em "Deploy"
7. Aguarde o deploy (geralmente 1-2 minutos)

### Opção B: Via CLI

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

4. Siga as instruções:
   - Set up and deploy? Yes
   - Which scope? Selecione sua conta
   - Link to existing project? No
   - Project name? sistema-pontos-criancas
   - Directory? ./
   - Override settings? No

5. Adicione a variável de ambiente:
```bash
vercel env add DATABASE_URL
```
   - Escolha "production"
   - Cole a connection string do Neon
   - Repita para "preview" e "development"

6. Faça deploy de produção:
```bash
vercel --prod
```

## Passo 5: Inicializar o Banco de Dados

Após o deploy bem-sucedido:

1. Obtenha a URL do seu projeto (ex: `https://sistema-pontos-criancas.vercel.app`)

2. Inicialize o banco usando uma das opções:

**Opção A: Via cURL**
```bash
curl -X POST https://seu-projeto.vercel.app/api/init
```

**Opção B: Via Postman**
- Abra o Postman
- Crie uma requisição POST
- URL: `https://seu-projeto.vercel.app/api/init`
- Clique em "Send"

**Opção C: Via JavaScript no navegador**
- Abra o Console do navegador (F12)
- Execute:
```javascript
fetch('https://seu-projeto.vercel.app/api/init', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

3. Você deve receber uma resposta como:
```json
{
  "message": "Database initialized successfully",
  "children": [...],
  "activities": 28
}
```

## Passo 6: Testar o Aplicativo

1. Acesse `https://seu-projeto.vercel.app`
2. Você deve ver a interface do sistema
3. Teste as funcionalidades:
   - Selecionar criança (Luiza ou Miguel)
   - Registrar atividades
   - Ver dashboard
   - Ver relatórios

## Passo 7: Configurar Domínio Personalizado (Opcional)

1. No dashboard do Vercel, vá em "Settings" → "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `pontos.meudominio.com`)
4. Siga as instruções para configurar os DNS

## Troubleshooting

### Build falha com erro de DATABASE_URL

**Solução**: O build não precisa se conectar ao banco. O código já está preparado para usar um placeholder durante o build.

### Deploy funciona mas não carrega dados

**Problema**: Banco não foi inicializado
**Solução**: Execute o endpoint `/api/init` (Passo 5)

### Erro 500 ao acessar a aplicação

**Problema**: DATABASE_URL incorreta ou banco inacessível
**Solução**: 
1. Verifique a variável de ambiente no Vercel
2. Teste a connection string localmente
3. Certifique-se de que termina com `?sslmode=require`

### Mudanças não aparecem após deploy

**Problema**: Cache do Vercel
**Solução**:
1. Force redeploy: `vercel --prod --force`
2. Ou limpe o cache no dashboard do Vercel

## Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Neon](https://neon.tech/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Drizzle ORM](https://orm.drizzle.team)

## Limites do Plano Gratuito

### Neon (Banco de Dados)
- 0.5GB de armazenamento
- 5GB de transferência mensal
- 1 projeto ativo
- Suficiente para este projeto!

### Vercel (Hosting)
- 100GB de largura de banda
- Builds ilimitados
- Tempo de execução: 10 segundos por request
- Suficiente para este projeto!

## Próximos Passos

Após o deploy, considere:

1. **Adicionar Autenticação**: 
   - Implementar NextAuth.js
   - Permitir apenas usuários autorizados

2. **Backup Automatizado**:
   - Neon já faz backups automáticos
   - Configure snapshots no dashboard do Neon

3. **Monitoramento**:
   - Configure alertas no Vercel
   - Use Vercel Analytics para métricas

4. **Otimizações**:
   - Adicionar cache de dados
   - Implementar ISR (Incremental Static Regeneration)

Pronto! Seu sistema está no ar e acessível de qualquer lugar! 🎉
