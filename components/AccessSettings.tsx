'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/** Parent-only section: kids' link, password changes and resets, logout */
export function AccessSettings() {
  const [kids, setKids] = useState<{ id: number; name: string }[]>([]);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/children')
      .then(r => r.json())
      .then(data => setKids(Array.isArray(data) ? data : []))
      .catch(() => setKids([]));
  }, []);

  const copyLink = async () => {
    const url = `${origin}/login`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado!');
    } catch {
      prompt('Copie o link:', url);
    }
  };

  const resetChild = async (kid: { id: number; name: string }) => {
    if (!confirm(`Voltar a senha de ${kid.name} para a provisória? ${kid.name} terá que criar uma nova senha no próximo acesso.`)) return;
    const response = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: `child:${kid.id}` }),
    });
    const data = await response.json().catch(() => ({}));
    alert(response.ok ? `Senha de ${kid.name} redefinida para a provisória.` : `Erro: ${data.error || 'não foi possível redefinir'}`);
  };

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.href = '/login';
  };

  return (
    <div className="mb-8 bg-green-50 border-2 border-green-300 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-2">🔐 Acesso e senhas</h3>
      <p className="text-sm text-gray-600 mb-3">
        As crianças entram pelo mesmo endereço, escolhem o próprio nome e digitam a senha delas.
        Elas só veem os próprios pontos, o histórico e as regras, sem poder alterar nada.
      </p>
      <div className="flex gap-2 flex-wrap mb-4">
        <input
          readOnly
          value={`${origin}/login`}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          onFocus={(e) => e.target.select()}
        />
        <button onClick={copyLink} className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700">
          Copiar
        </button>
        <Link href="/acompanhar" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300">
          Ver como criança
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/trocar-senha" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">
          🔑 Trocar minha senha
        </Link>
        {kids.map(kid => (
          <button
            key={kid.id}
            onClick={() => resetChild(kid)}
            className="bg-white border border-gray-300 px-4 py-2 rounded-md font-semibold hover:bg-gray-100"
          >
            Redefinir senha de {kid.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Use &quot;Redefinir&quot; se uma criança esquecer a senha: ela volta para a provisória e precisa criar outra no próximo acesso.
      </p>

      <button onClick={logout} className="mt-4 text-sm text-gray-600 underline">
        Sair neste aparelho
      </button>
    </div>
  );
}
