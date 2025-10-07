# Tests

Este diretório contém os testes automatizados do sistema de pontos para crianças.

## Estrutura

```
__tests__/
├── api/                      # Testes de API
│   ├── parent.test.ts        # Testes do endpoint /api/parent
│   ├── activities.test.ts    # Testes do endpoint /api/activities
│   ├── children.test.ts      # Testes do endpoint /api/children
│   └── custom-activities.test.ts  # Testes do endpoint /api/custom-activities
└── integration.test.ts       # Testes de integração e fluxos completos
```

## Executar Testes

### Pré-requisitos

1. Certifique-se de que o servidor Next.js está rodando:
   ```bash
   npm run dev
   ```

2. Configure a variável de ambiente `TEST_BASE_URL` (opcional):
   ```bash
   export TEST_BASE_URL=http://localhost:3000
   ```

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes Específicos

```bash
# Testar apenas API de pais
npm test __tests__/api/parent.test.ts

# Testar apenas API de atividades
npm test __tests__/api/activities.test.ts

# Testar apenas testes de integração
npm test __tests__/integration.test.ts
```

## Cobertura de Testes

### API de Pais (`/api/parent`)

- ✅ Validação de campos obrigatórios (nome, data)
- ✅ Validação de formato de data
- ✅ Sanitização de entrada (trim)
- ✅ Criação e atualização de registro
- ✅ Consulta de dados salvos

### API de Atividades (`/api/activities`)

- ✅ Validação de campos obrigatórios (childId, name, points, category)
- ✅ Validação de tipos de dados
- ✅ Listagem de todas as atividades
- ✅ Filtro por childId
- ✅ Tratamento de erro robusto (retorna array vazio)
- ✅ Prevenção de SQL injection

### API de Crianças (`/api/children`)

- ✅ Listagem de crianças
- ✅ Criação de criança com dados válidos
- ✅ Valores padrão (initialBalance = 0)
- ✅ Tratamento de erro robusto (retorna array vazio)

### API de Atividades Personalizadas (`/api/custom-activities`)

- ✅ Validação de campos obrigatórios (childId, activityId, name, points, category)
- ✅ Validação de tipos de dados
- ✅ Listagem de todas as atividades personalizadas
- ✅ Filtro por childId
- ✅ Tratamento de erro robusto (retorna array vazio)

### Testes de Integração

- ✅ Fluxo completo de cadastro de pai/mãe e registro de atividades
- ✅ Gestão de atividades personalizadas
- ✅ Prevenção de SQL injection
- ✅ Tratamento robusto de erros
- ✅ Acessibilidade de todas as rotas principais

## Notas sobre os Testes

### Testes que Requerem Banco de Dados

Alguns testes requerem que o banco de dados esteja configurado e acessível:
- Criação de registros (POST)
- Atualização de registros (PUT)
- Exclusão de registros (DELETE)
- Consultas que retornam dados específicos

Esses testes são projetados para validar tanto em ambientes com banco de dados quanto sem (retornando erros apropriados).

### Testes de Validação

Os testes de validação não requerem banco de dados, pois validam a lógica de entrada antes de qualquer interação com o banco:
- Validação de campos obrigatórios
- Validação de tipos de dados
- Validação de formato de data
- Prevenção de SQL injection

### Variável de Ambiente

Por padrão, os testes usam `http://localhost:3000`. Para testar em outro ambiente:

```bash
TEST_BASE_URL=https://sua-app.vercel.app npm test
```

## Filosofia de Testes

1. **Validação Rigorosa**: Todos os endpoints validam entrada antes de processar
2. **Segurança**: Testes específicos para prevenção de SQL injection
3. **Robustez**: Endpoints GET retornam arrays vazios em vez de erros para prevenir crashes no frontend
4. **Mensagens em Português**: Todas as mensagens de erro são em português
5. **Códigos HTTP Apropriados**: 
   - 200: Sucesso
   - 201: Criado
   - 400: Erro de validação
   - 404: Não encontrado
   - 500: Erro do servidor

## Adicionando Novos Testes

Ao adicionar novos endpoints ou funcionalidades:

1. Crie um novo arquivo de teste em `__tests__/api/` para testes de unidade
2. Adicione testes de integração em `__tests__/integration.test.ts`
3. Siga o padrão de nomenclatura: `[endpoint].test.ts`
4. Use TypeScript para type safety
5. Organize testes com `describe()` e `it()`
6. Use mensagens descritivas em português

## Exemplo de Teste

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Minha API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  it('deve validar campo obrigatório', async () => {
    const response = await fetch(`${baseUrl}/api/meu-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.ok(data.error);
  });
});
```

## Problemas Comuns

### Erro: Connection refused

Certifique-se de que o servidor Next.js está rodando:
```bash
npm run dev
```

### Erro: Database connection failed

Certifique-se de que a variável `DATABASE_URL` está configurada:
```bash
export DATABASE_URL=postgresql://user:pass@localhost/db
```

### Testes Falham em Produção

Os testes foram projetados para validar tanto sucessos quanto falhas apropriadas. Se um teste falha em produção, verifique:
1. Se o endpoint está acessível
2. Se o banco de dados está configurado corretamente
3. Se as variáveis de ambiente estão corretas
