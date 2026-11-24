'use client';

import { useEffect, useState } from 'react';

export default function ChangePasswordPage() {
  const [forced, setForced] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(session => setForced(Boolean(session.mustChange)))
      .catch(() => { window.location.href = '/login'; });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) {
      setError('As duas senhas novas não são iguais.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, next }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Senha alterada!');
        window.location.href = data.redirect;
      } else {
        setError(data.error || 'Não foi possível alterar a senha.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">🔑 Trocar senha</h1>
        <p className="text-sm text-gray-600 mb-4">
          {forced
            ? 'Este é o seu primeiro acesso. Crie uma senha só sua para continuar.'
            : 'Digite a senha atual e escolha a nova.'}
        </p>
        <label className="block mb-3">
          <span className="block text-sm font-semibold mb-1">{forced ? 'Senha provisória' : 'Senha atual'}</span>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            autoComplete="current-password"
            autoFocus
          />
        </label>
        <label className="block mb-3">
          <span className="block text-sm font-semibold mb-1">Nova senha</span>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            autoComplete="new-password"
          />
        </label>
        <label className="block mb-3">
          <span className="block text-sm font-semibold mb-1">Repita a nova senha</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            autoComplete="new-password"
          />
        </label>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !current || !next || !confirm}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
        <div className="flex justify-between mt-4 text-sm">
          {!forced && (
            <button type="button" onClick={() => history.back()} className="text-blue-700 hover:underline">
              ← Voltar
            </button>
          )}
          <button type="button" onClick={logout} className="text-gray-600 underline ml-auto">
            Sair
          </button>
        </div>
      </form>
    </main>
  );
}
