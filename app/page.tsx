'use client';

import { useEffect, useState } from 'react';
import { ChildSelector } from '@/components/ChildSelector';
import { Dashboard } from '@/components/Dashboard';
import { Activities } from '@/components/Activities';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';

export default function Home() {
  const [currentChild, setCurrentChild] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await fetch('/api/children');
      const data = await response.json();
      
      // Validate that the response is an array before using it
      if (Array.isArray(data)) {
        setChildren(data);
        setError(null);
        
        // Auto-select first child if available
        if (data.length > 0 && !currentChild) {
          setCurrentChild(data[0].id);
        }
      } else {
        console.error('Invalid API response: expected array, got:', typeof data);
        setChildren([]);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedChildData = Array.isArray(children) ? children.find(c => c.id === currentChild) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-2">⚠️ Erro</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadChildren();
            }}
            className="bg-white text-red-500 px-4 py-2 rounded font-semibold hover:bg-red-50 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Sistema de Pontuação</h1>
          <p className="text-lg">Luiza e Miguel - Incentivando bons comportamentos!</p>
        </header>

        <ChildSelector
          childrenList={children}
          currentChild={currentChild}
          onSelectChild={setCurrentChild}
        />

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('activities')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentTab === 'activities'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🎯 Atividades
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentTab === 'reports'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📈 Relatórios
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentTab === 'settings'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            ⚙️ Configurações
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentTab === 'dashboard' && <Dashboard childId={currentChild} childData={selectedChildData} />}
          {currentTab === 'activities' && <Activities childId={currentChild} onUpdate={loadChildren} />}
          {currentTab === 'reports' && <Reports childId={currentChild} />}
          {currentTab === 'settings' && <Settings childId={currentChild} onUpdate={loadChildren} />}
        </div>
      </div>
    </main>
  );
}
