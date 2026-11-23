'use client';

import { useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ChildSelector } from '@/components/ChildSelector';
import { Rules } from '@/components/Rules';
import { fetchJsonWithRetry } from '@/lib/fetch-retry';

/**
 * Kids' read-only page: balance, history and rules. No button here changes
 * data, and when ADMIN_PASSWORD is set the server also refuses any write
 * that does not come from a logged-in parent.
 */
export default function AcompanharPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [currentChild, setCurrentChild] = useState<number | null>(null);
  const [tab, setTab] = useState<'pontos' | 'regras'>('pontos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchJsonWithRetry('/api/children');
      if (!Array.isArray(data)) throw new Error('invalid');
      setChildren(data);
      // ?crianca=Nome opens a specific child
      const wanted = new URLSearchParams(window.location.search).get('crianca')?.toLowerCase();
      const match = wanted && data.find((c: any) => c.name.toLowerCase() === wanted);
      setCurrentChild(match ? match.id : data[0]?.id ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const childData = children.find(c => c.id === currentChild);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Meus Pontos</h1>
          <p className="text-lg">Acompanhe seus pontos e as regras</p>
        </header>

        {loading ? (
          <p className="text-center text-white text-xl">Carregando...</p>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 text-center max-w-md mx-auto">
            <p className="mb-4">Não foi possível carregar os pontos.</p>
            <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <ChildSelector childrenList={children} currentChild={currentChild} onSelectChild={setCurrentChild} />

            <div className="flex gap-2 mb-6 flex-wrap">
              {([['pontos', '📊 Meus pontos'], ['regras', '📜 Regras']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    tab === key ? 'bg-white text-primary' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              {tab === 'pontos' && <Dashboard childId={currentChild} childData={childData} readOnly />}
              {tab === 'regras' && currentChild && <Rules childId={currentChild} />}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
