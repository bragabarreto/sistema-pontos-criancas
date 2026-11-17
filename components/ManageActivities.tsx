'use client';

import { useEffect, useState } from 'react';

export const CATEGORY_CONFIG = {
  positivos: { title: '✅ Atividades Positivas', short: 'Positivas', color: 'bg-green-100 border-green-300' },
  especiais: { title: '⭐ Atividades Especiais', short: 'Especiais', color: 'bg-yellow-100 border-yellow-300' },
  negativos: { title: '❌ Atividades Negativas', short: 'Negativas', color: 'bg-orange-100 border-orange-300' },
  graves: { title: '🚫 Atividades Graves', short: 'Graves', color: 'bg-red-100 border-red-300' },
} as const;

export type Category = keyof typeof CATEGORY_CONFIG;
const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

export const DEFAULT_MULTIPLIERS: Record<Category, number> = {
  positivos: 1,
  especiais: 50,
  negativos: 1,
  graves: 100,
};

interface ManageActivitiesProps {
  childId: number;
  onBack: () => void;
}

interface FormState {
  id: number | null; // null = new activity
  name: string;
  points: number;
  category: Category;
  originalCategory: Category | null;
}

export function ManageActivities({ childId, onBack }: ManageActivitiesProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [multipliers, setMultipliers] = useState<Record<Category, number>>(DEFAULT_MULTIPLIERS);
  const [savedMultipliers, setSavedMultipliers] = useState<Record<Category, number>>(DEFAULT_MULTIPLIERS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    Promise.all([loadActivities(), loadMultipliers()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const loadActivities = async () => {
    try {
      const response = await fetch(`/api/custom-activities?childId=${childId}`);
      const data = await response.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading custom activities:', error);
      setActivities([]);
    }
  };

  const loadMultipliers = async () => {
    try {
      const response = await fetch('/api/settings?key=multipliers');
      const data = await response.json();
      const value = { ...DEFAULT_MULTIPLIERS, ...(data?.value || {}) };
      setMultipliers(value);
      setSavedMultipliers(value);
    } catch (error) {
      console.error('Error loading multipliers:', error);
    }
  };

  const multipliersChanged = CATEGORIES.some(c => multipliers[c] !== savedMultipliers[c]);

  const saveMultipliers = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'multipliers', value: multipliers }),
      });
      if (!response.ok) throw new Error('save failed');
      setSavedMultipliers(multipliers);
      alert('Multiplicadores salvos!');
    } catch (error) {
      console.error('Error saving multipliers:', error);
      alert('Erro ao salvar multiplicadores');
    } finally {
      setBusy(false);
    }
  };

  const byCategory = (category: Category) => activities.filter(a => a.category === category);

  const moveActivity = async (activity: any, direction: 'up' | 'down') => {
    const list = byCategory(activity.category);
    const index = list.findIndex(a => a.id === activity.id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;

    // Optimistic swap so the list reacts immediately
    const other = list[target];
    setActivities(prev => {
      const next = [...prev];
      const i = next.findIndex(a => a.id === activity.id);
      const j = next.findIndex(a => a.id === other.id);
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

    try {
      const response = await fetch('/api/custom-activities/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, category: activity.category, activityId: activity.activityId, direction }),
      });
      if (!response.ok) throw new Error('reorder failed');
    } catch (error) {
      console.error('Error reordering activities:', error);
      alert('Erro ao reordenar atividades');
      loadActivities();
    }
  };

  const deleteActivity = async (activity: any) => {
    if (!confirm(`Excluir a atividade "${activity.name}"? Ela será removida para ambas as crianças. Os registros já lançados continuam no histórico.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/custom-activities/${activity.id}`, { method: 'DELETE' });
      if (response.ok) {
        setForm(null);
        await loadActivities();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || 'Erro ao excluir atividade'}`);
      }
    } catch (error) {
      console.error('Error deleting custom activity:', error);
      alert('Erro ao excluir atividade');
    } finally {
      setBusy(false);
    }
  };

  const openNew = (category: Category) =>
    setForm({ id: null, name: '', points: 1, category, originalCategory: null });

  const openEdit = (activity: any) =>
    setForm({
      id: activity.id,
      name: activity.name,
      points: activity.points,
      category: activity.category,
      originalCategory: activity.category,
    });

  const saveForm = async () => {
    if (!form) return;
    if (!form.name.trim() || !(form.points > 0)) {
      alert('Informe o nome e pontos base maiores que zero.');
      return;
    }

    // Moving to (or creating in) a category puts the activity at its end
    const nextOrderIndex =
      byCategory(form.category).reduce((max, a) => Math.max(max, a.orderIndex || 0), -1) + 1;

    setBusy(true);
    try {
      const response = form.id === null
        ? await fetch('/api/custom-activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              childId,
              activityId: `custom_${Date.now()}`,
              name: form.name.trim(),
              points: form.points,
              category: form.category,
            }),
          })
        : await fetch(`/api/custom-activities/${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name.trim(),
              points: form.points,
              ...(form.category !== form.originalCategory && {
                category: form.category,
                orderIndex: nextOrderIndex,
              }),
            }),
          });

      if (response.ok) {
        setForm(null);
        await loadActivities();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || 'Erro ao salvar atividade'}`);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Erro ao salvar atividade');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-bold">🛠️ Gerenciar Atividades</h2>
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
        >
          ← Voltar aos lançamentos
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Alterações aqui valem para ambas as crianças. Registros já lançados não são alterados.
      </p>

      {/* Category multipliers */}
      <section className="mb-6 border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-1">✖️ Multiplicadores por categoria</h3>
        <p className="text-xs text-gray-600 mb-3">
          Pontos de cada lançamento = pontos base × multiplicador da categoria. Vale para os próximos lançamentos.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(category => (
            <label key={category} className="block">
              <span className="block text-sm font-semibold mb-1">{CATEGORY_CONFIG[category].short}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={multipliers[category]}
                onChange={(e) => setMultipliers({ ...multipliers, [category]: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </label>
          ))}
        </div>
        <button
          onClick={saveMultipliers}
          disabled={busy || !multipliersChanged}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          Salvar multiplicadores
        </button>
      </section>

      {/* Activities per category */}
      <div className="space-y-6">
        {CATEGORIES.map(category => {
          const list = byCategory(category);
          const config = CATEGORY_CONFIG[category];
          return (
            <section key={category} className={`border-2 rounded-lg p-4 ${config.color}`}>
              <div className="flex justify-between items-center gap-2 mb-3">
                <h3 className="text-lg font-bold">{config.title}</h3>
                <button
                  onClick={() => openNew(category)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 whitespace-nowrap"
                >
                  + Nova
                </button>
              </div>
              {list.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {list.map((activity, index) => (
                    <div key={activity.id} className="bg-white rounded-md p-2 border border-gray-300 flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveActivity(activity, 'up')}
                          disabled={index === 0}
                          className="w-8 h-7 rounded bg-purple-500 text-white text-sm disabled:bg-gray-200 disabled:text-gray-400"
                          aria-label="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveActivity(activity, 'down')}
                          disabled={index === list.length - 1}
                          className="w-8 h-7 rounded bg-purple-500 text-white text-sm disabled:bg-gray-200 disabled:text-gray-400"
                          aria-label="Mover para baixo"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{activity.name}</p>
                        <p className="text-xs text-gray-600">
                          {activity.points} base × {multipliers[category]} = <strong>{activity.points * multipliers[category]} pts</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => openEdit(activity)}
                        className="bg-yellow-500 text-white w-9 h-9 rounded hover:bg-yellow-600"
                        aria-label="Editar"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteActivity(activity)}
                        className="bg-red-600 text-white w-9 h-9 rounded hover:bg-red-700"
                        aria-label="Excluir"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Create / edit modal */}
      {form && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{form.id === null ? '➕ Nova Atividade' : '✏️ Editar Atividade'}</h3>
            <label className="block mb-4">
              <span className="block text-sm font-semibold mb-1">Nome</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Ler um livro"
                autoFocus
              />
            </label>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <label className="block">
                <span className="block text-sm font-semibold mb-1">Pontos base</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold mb-1">Categoria</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_CONFIG[c].short}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Valor por lançamento: {form.points || 0} × {multipliers[form.category]} ={' '}
              <strong>{(form.points || 0) * multipliers[form.category]} pts</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={saveForm}
                disabled={busy}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Salvar
              </button>
              <button
                onClick={() => setForm(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
