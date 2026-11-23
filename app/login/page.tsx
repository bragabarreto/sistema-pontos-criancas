'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        const next = new URLSearchParams(window.location.search).get('next');
        // Only allow internal redirects
        window.location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
      } else {
        setError('Senha incorreta.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">🔒 Área dos pais</h1>
        <p className="text-sm text-gray-600 mb-4">Digite a senha para lançar e editar pontos.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
          placeholder="Senha"
          autoFocus
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <a href="/acompanhar" className="block text-center text-sm text-blue-700 mt-4 hover:underline">
          👀 Ver pontos (acesso das crianças)
        </a>
      </form>
    </main>
  );
}
