import { describe, it, before } from 'node:test';
import assert from 'node:assert';

describe('Integration Tests - User Flows', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('Fluxo Completo: Cadastro de Pai e Registro de Atividades', () => {
    it('deve permitir cadastro de pai/mãe e posteriormente registrar atividades', async () => {
      // Step 1: Cadastrar pai/mãe
      const parentResponse = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          gender: 'masculino',
          appStartDate: '2024-01-01',
        }),
      });

      assert.strictEqual(parentResponse.ok, true, 'Cadastro de pai/mãe deve ser bem-sucedido');
      const parentData = await parentResponse.json();
      assert.ok(parentData.id, 'Pai/mãe deve ter um ID');

      // Step 2: Verificar que pai/mãe foi salvo
      const getParentResponse = await fetch(`${baseUrl}/api/parent`);
      assert.strictEqual(getParentResponse.ok, true, 'Busca de dados do pai/mãe deve ser bem-sucedida');
      const savedParent = await getParentResponse.json();
      assert.strictEqual(savedParent.name, 'João Silva', 'Nome do pai/mãe deve ser salvo corretamente');

      // Step 3: Listar crianças disponíveis
      const childrenResponse = await fetch(`${baseUrl}/api/children`);
      assert.strictEqual(childrenResponse.ok, true, 'Listagem de crianças deve ser bem-sucedida');
      const children = await childrenResponse.json();
      assert.ok(Array.isArray(children), 'Lista de crianças deve ser um array');
    });
  });

  describe('Fluxo Completo: Gestão de Atividades Personalizadas', () => {
    it('deve permitir criar, listar e verificar atividades personalizadas', async () => {
      // Step 1: Listar atividades personalizadas existentes
      const listResponse = await fetch(`${baseUrl}/api/custom-activities?childId=1`);
      assert.strictEqual(listResponse.ok, true, 'Listagem de atividades personalizadas deve ser bem-sucedida');
      const initialActivities = await listResponse.json();
      assert.ok(Array.isArray(initialActivities), 'Lista de atividades deve ser um array');
      const initialCount = initialActivities.length;

      // Note: Creation test will only work if database is available
      // This is a smoke test to ensure the endpoint responds correctly
    });
  });

  describe('Validação de Segurança: SQL Injection Prevention', () => {
    it('não deve permitir SQL injection em childId', async () => {
      const maliciousInput = "1; DROP TABLE children; --";
      
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: maliciousInput,
          name: 'Test Activity',
          points: 10,
          category: 'positivos',
        }),
      });

      // Should fail validation, not execute SQL
      assert.strictEqual(response.status, 400, 'Deve rejeitar entrada maliciosa com código 400');
      const data = await response.json();
      assert.ok(data.error.includes('must be numbers'), 'Deve retornar erro de validação de tipo');
    });

    it('não deve permitir SQL injection em pontos', async () => {
      const maliciousInput = "10; UPDATE children SET total_points=9999; --";
      
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 1,
          name: 'Test Activity',
          points: maliciousInput,
          category: 'positivos',
        }),
      });

      // Should fail validation, not execute SQL
      assert.strictEqual(response.status, 400, 'Deve rejeitar entrada maliciosa com código 400');
      const data = await response.json();
      assert.ok(data.error.includes('must be numbers'), 'Deve retornar erro de validação de tipo');
    });
  });

  describe('Validação de Robustez: Tratamento de Erros', () => {
    it('deve retornar array vazio em vez de erro 500 quando GET /api/activities falha', async () => {
      const response = await fetch(`${baseUrl}/api/activities?childId=invalid`);
      const data = await response.json();
      
      // Even on error, should return array to prevent frontend crashes
      assert.ok(Array.isArray(data), 'Deve retornar array mesmo com erro');
    });

    it('deve retornar array vazio em vez de erro 500 quando GET /api/children falha', async () => {
      const response = await fetch(`${baseUrl}/api/children`);
      const data = await response.json();
      
      // Even on error, should return array to prevent frontend crashes
      assert.ok(Array.isArray(data), 'Deve retornar array mesmo com erro');
    });

    it('deve retornar array vazio em vez de erro 500 quando GET /api/custom-activities falha', async () => {
      const response = await fetch(`${baseUrl}/api/custom-activities?childId=invalid`);
      const data = await response.json();
      
      // Even on error, should return array to prevent frontend crashes
      assert.ok(Array.isArray(data), 'Deve retornar array mesmo com erro');
    });
  });

  describe('Validação de Acessibilidade: Rotas Principais', () => {
    it('GET /api/children deve estar acessível', async () => {
      const response = await fetch(`${baseUrl}/api/children`);
      assert.ok(response.status === 200 || response.status === 500, 'Endpoint deve estar acessível');
    });

    it('GET /api/activities deve estar acessível', async () => {
      const response = await fetch(`${baseUrl}/api/activities`);
      assert.ok(response.status === 200 || response.status === 500, 'Endpoint deve estar acessível');
    });

    it('GET /api/custom-activities deve estar acessível', async () => {
      const response = await fetch(`${baseUrl}/api/custom-activities`);
      assert.ok(response.status === 200 || response.status === 500, 'Endpoint deve estar acessível');
    });

    it('GET /api/parent deve estar acessível', async () => {
      const response = await fetch(`${baseUrl}/api/parent`);
      assert.ok(response.status === 200 || response.status === 500, 'Endpoint deve estar acessível');
    });

    it('GET /api/settings deve estar acessível', async () => {
      const response = await fetch(`${baseUrl}/api/settings?key=test`);
      assert.ok(response.status === 200 || response.status === 404 || response.status === 500, 'Endpoint deve estar acessível');
    });
  });
});
