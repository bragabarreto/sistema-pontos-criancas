# Deployment Checklist - Sistema de Pontos para Crianças

Este documento serve como checklist para garantir que o deploy do sistema esteja completo e funcional.

## ✅ Pré-Deploy

- [x] Remover arquivos legacy HTML/JS do repositório
- [x] Configurar .gitignore adequadamente
- [x] Verificar build local (`npm run build`)
- [x] Verificar linting (`npm run lint`)
- [x] Verificar TypeScript (`npx tsc --noEmit --skipLibCheck`)
- [x] Documentação atualizada (README.md, DEPLOYMENT.md, etc)

## ✅ Configuração do Banco de Dados (Neon)

- [ ] Criar conta no Neon (https://neon.tech)
- [ ] Criar novo projeto PostgreSQL
- [ ] Copiar connection string (pooled connection)
- [ ] Verificar que a connection string termina com `?sslmode=require`

## ✅ Configuração do Vercel

- [ ] Criar conta no Vercel (https://vercel.com)
- [ ] Conectar repositório GitHub
- [ ] Configurar variável de ambiente `DATABASE_URL`
  - Production: ✓
  - Preview: ✓
  - Development: ✓
- [ ] Verificar configuração do framework (Next.js detectado automaticamente)

## ✅ Deploy

- [ ] Fazer deploy via Vercel dashboard ou CLI
- [ ] Aguardar conclusão do build
- [ ] Verificar que não há erros no log de build
- [ ] Anotar URL do projeto (ex: `https://seu-projeto.vercel.app`)

## ✅ Pós-Deploy

### Inicialização do Banco

- [ ] Inicializar banco de dados via POST request para `/api/init`
  - Opção 1: `curl -X POST https://seu-projeto.vercel.app/api/init`
  - Opção 2: Postman/Insomnia
  - Opção 3: Console do navegador (fetch)

- [ ] Verificar resposta de sucesso:
  ```json
  {
    "message": "Database initialized successfully",
    "children": [...],
    "activities": 28
  }
  ```

### Testes Funcionais

- [ ] Acessar URL principal
- [ ] Verificar que a interface carrega corretamente
- [ ] Selecionar uma criança (Luiza ou Miguel)
- [ ] Testar registro de atividade
- [ ] Verificar que pontos são contabilizados
- [ ] Testar navegação entre abas (Dashboard, Atividades, Relatórios, Configurações)

### Configurações Iniciais

- [ ] Acessar aba "Configurações"
- [ ] Preencher dados do pai/mãe
  - Nome
  - Sexo
  - Data de início do app
- [ ] Configurar saldo inicial das crianças
- [ ] Configurar multiplicadores se necessário

### Testes de Persistência

- [ ] Registrar algumas atividades
- [ ] Fechar navegador
- [ ] Reabrir e verificar que dados permanecem
- [ ] Acessar de dispositivo diferente (opcional)
- [ ] Verificar sincronização de dados

## ✅ Verificação de Endpoints

Testar via Postman/Insomnia ou curl:

- [ ] `GET /api/children` - Lista crianças
- [ ] `GET /api/activities?childId=1` - Lista atividades
- [ ] `GET /api/custom-activities?childId=1` - Lista atividades personalizadas
- [ ] `GET /api/parent` - Busca dados do pai/mãe
- [ ] `GET /api/settings?key=positivas_multiplier` - Busca configuração

## ✅ Performance e Segurança

- [ ] Verificar tempo de carregamento inicial (< 3s ideal)
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Testar em dispositivos móveis
- [ ] Verificar que DATABASE_URL não está exposta no frontend
- [ ] Confirmar que todas as rotas API retornam respostas apropriadas

## ✅ Monitoramento

- [ ] Configurar alertas no Vercel (opcional)
- [ ] Verificar limites do plano gratuito
  - Neon: 0.5GB storage, 5GB transfer/mês
  - Vercel: 100GB bandwidth/mês
- [ ] Anotar métricas de uso inicial

## 🎯 Checklist Completo!

Quando todos os itens acima estiverem marcados:

- ✅ O sistema está completamente implantado
- ✅ O banco de dados está configurado e inicializado
- ✅ Os usuários podem acessar e usar o sistema
- ✅ Os dados estão sendo persistidos corretamente

## 📞 Suporte

Em caso de problemas, consulte:

1. **DEPLOYMENT.md** - Guia detalhado de deploy
2. **QUICKSTART.md** - Guia rápido de início
3. **README.md** - Documentação geral
4. **Troubleshooting** (em DEPLOYMENT.md) - Soluções para problemas comuns

## 🔄 Atualizações Futuras

Para fazer deploy de atualizações:

1. Faça commit e push das alterações para o GitHub
2. Vercel fará deploy automático do branch principal
3. Aguarde build completar (1-2 minutos)
4. Verificar que a atualização foi aplicada

## 📊 Métricas de Sucesso

- [ ] Build time < 2 minutos
- [ ] Page load time < 3 segundos
- [ ] Zero erros 500 em produção
- [ ] Database response time < 500ms
- [ ] 100% uptime (monitorado pelo Vercel)

---

**Data de Deploy:** _________________

**URL do Projeto:** _________________

**Responsável:** _________________

**Status Final:** [ ] Completo e Funcional
