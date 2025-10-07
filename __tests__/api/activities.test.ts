import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Activities API', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  describe('POST /api/activities', () => {
    it('deve validar campos obrigatórios - childId ausente', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Activity',
          points: 10,
          category: 'positivos',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('required'));
    });

    it('deve validar campos obrigatórios - name ausente', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 1,
          points: 10,
          category: 'positivos',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('required'));
    });

    it('deve validar campos obrigatórios - points ausente', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 1,
          name: 'Test Activity',
          category: 'positivos',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('required'));
    });

    it('deve validar campos obrigatórios - category ausente', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 1,
          name: 'Test Activity',
          points: 10,
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('required'));
    });

    it('deve validar tipos de dados - childId não numérico', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 'invalid',
          name: 'Test Activity',
          points: 10,
          category: 'positivos',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('must be numbers'));
    });

    it('deve validar tipos de dados - points não numérico', async () => {
      const response = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: 1,
          name: 'Test Activity',
          points: 'invalid',
          category: 'positivos',
        }),
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('must be numbers'));
    });
  });

  describe('GET /api/activities', () => {
    it('deve retornar todas as atividades quando childId não é fornecido', async () => {
      const response = await fetch(`${baseUrl}/api/activities`);
      assert.strictEqual(response.ok, true);
      
      const data = await response.json();
      assert.ok(Array.isArray(data));
    });

    it('deve retornar atividades filtradas por childId', async () => {
      const response = await fetch(`${baseUrl}/api/activities?childId=1`);
      assert.strictEqual(response.ok, true);
      
      const data = await response.json();
      assert.ok(Array.isArray(data));
      // All activities should have childId = 1
      data.forEach((activity: any) => {
        if (activity.childId) {
          assert.strictEqual(activity.childId, 1);
        }
      });
    });

    it('deve retornar array vazio em caso de erro (não deve quebrar frontend)', async () => {
      // Test with invalid childId format
      const response = await fetch(`${baseUrl}/api/activities?childId=invalid`);
      const data = await response.json();
      assert.ok(Array.isArray(data));
    });
  });

  describe('DELETE /api/activities/[id]', () => {
    it('deve validar ID numérico', async () => {
      const response = await fetch(`${baseUrl}/api/activities/invalid`, {
        method: 'DELETE',
      });

      // Should handle gracefully
      assert.ok(response.status >= 400);
    });
  });
});
