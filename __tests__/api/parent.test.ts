import { describe, it, before } from 'node:test';
import assert from 'node:assert';

describe('Parent API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('POST /api/parent', () => {
    it('deve validar campos obrigatórios - nome ausente', async () => {
      const response = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: 'masculino',
          appStartDate: '2024-01-01',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.strictEqual(data.error, 'O nome é obrigatório');
    });

    it('deve validar campos obrigatórios - data ausente', async () => {
      const response = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          gender: 'masculino',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.strictEqual(data.error, 'A data de início do app é obrigatória');
    });

    it('deve validar formato de data inválido', async () => {
      const response = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          gender: 'masculino',
          appStartDate: 'invalid-date',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.strictEqual(data.error, 'Data inválida. Use o formato correto (YYYY-MM-DD)');
    });

    it('deve aceitar dados válidos e criar/atualizar pai', async () => {
      const response = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'João Silva',
          gender: 'masculino',
          appStartDate: '2024-01-01',
        }),
      });

      assert.strictEqual(response.ok, true);
      const data = await response.json();
      assert.strictEqual(data.name, 'João Silva');
      assert.strictEqual(data.gender, 'masculino');
      assert.ok(data.id);
    });

    it('deve sanitizar nome (trim)', async () => {
      const response = await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '  Maria Santos  ',
          gender: 'feminino',
          appStartDate: '2024-01-15',
        }),
      });

      assert.strictEqual(response.ok, true);
      const data = await response.json();
      assert.strictEqual(data.name, 'Maria Santos');
    });
  });

  describe('GET /api/parent', () => {
    it('deve retornar dados do pai/mãe cadastrado', async () => {
      // First create a parent
      await fetch(`${baseUrl}/api/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Parent',
          gender: 'outro',
          appStartDate: '2024-01-01',
        }),
      });

      // Then get parent info
      const response = await fetch(`${baseUrl}/api/parent`);
      assert.strictEqual(response.ok, true);
      
      const data = await response.json();
      assert.ok(data);
      assert.ok(data.name);
      assert.ok(data.appStartDate);
    });
  });
});
