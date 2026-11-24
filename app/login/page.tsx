'use client';

import { useEffect, useState } from 'react';

interface ProfileOption {
  profile: string;
  label: string;
}

const icon = (option: ProfileOption) =>
  option.profile === 'parent' ? '🧑' : option.label === 'Luiza' ? '👧' : '👦';

export default function LoginPage() {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [profile, setProfile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfiles = () => {
    setError('');
    fetch('/api/auth/profiles')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('empty');
        setProfiles(data);
      })
      .catch(() => setError('Não foi possível carregar. Toque em "Tentar novamente".'));
  };

  useEffect(loadProfiles, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      // The server already sends children to their page; "next" only refines the parent's
      window.location.href = data.mustChange || profile !== 'parent' || !safeNext ? data.redirect : safeNext;
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">🏆 Sistema de Pontos</h1>
        <p className="text-sm text-gray-600 mb-4">Quem está entrando?</p>

        {profiles.length === 0 && !error && <p className="text-gray-500 mb-4">Carregando...</p>}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {profiles.map(option => (
            <button
              type="button"
              key={option.profile}
              onClick={() => { setProfile(option.profile); setError(''); }}
              className={`py-3 px-4 rounded-lg font-semibold text-left border-2 transition-colors ${
                profile === option.profile ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {icon(option)} {option.label}
            </button>
          ))}
        </div>

        {profile && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            placeholder="Senha"
            autoFocus
            autoComplete="current-password"
          />
        )}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {profiles.length === 0 && error ? (
          <button type="button" onClick={loadProfiles} className="w-full bg-gray-200 px-4 py-2 rounded-lg font-semibold">
            Tentar novamente
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !profile || !password}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        )}
      </form>
    </main>
  );
}
