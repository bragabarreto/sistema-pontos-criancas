'use client';

import { useMemo, useState } from 'react';
import { getFortalezaDayKey } from '@/lib/timezone';

interface BatchEntryModalProps {
  childId: number;
  customActivities: any[];
  multipliers: Record<string, number>;
  categoryConfig: Record<string, { title: string; color: string }>;
  onClose: () => void;
  onSaved: () => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MAX_QTY = 99;

const pad = (n: number) => String(n).padStart(2, '0');
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const isNegative = (category: string) => category === 'negativos' || category === 'graves';

function formatShort(key: string) {
  const [, m, d] = key.split('-');
  return `${d}/${m}`;
}

export function BatchEntryModal({
  childId,
  customActivities,
  multipliers,
  categoryConfig,
  onClose,
  onSaved,
}: BatchEntryModalProps) {
  const todayKey = getFortalezaDayKey(new Date());
  const [todayY, todayM] = todayKey.split('-').map(Number);

  const [viewYear, setViewYear] = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM - 1);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  // Calendar grid for the visible month (leading blanks + days)
  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (string | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(toKey(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  const changeMonth = (delta: number) => {
    const date = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  const selectRange = (a: string, b: string) => {
    const [start, end] = a <= b ? [a, b] : [b, a];
    const next = new Set(selectedDays);
    const [sy, sm, sd] = start.split('-').map(Number);
    const cursor = new Date(sy, sm - 1, sd);
    for (;;) {
      const key = toKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      if (key > end) break;
      if (key <= todayKey) next.add(key);
      cursor.setDate(cursor.getDate() + 1);
    }
    setSelectedDays(next);
  };

  const handleDayClick = (key: string) => {
    if (key > todayKey) return;
    if (rangeMode) {
      if (!rangeStart) {
        setRangeStart(key);
      } else {
        selectRange(rangeStart, key);
        setRangeStart(null);
      }
      return;
    }
    const next = new Set(selectedDays);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedDays(next);
  };

  const setQty = (activityId: number, value: number) => {
    const qty = Math.max(0, Math.min(MAX_QTY, isNaN(value) ? 0 : value));
    setQuantities(prev => ({ ...prev, [activityId]: qty }));
  };

  const selectedActivities = customActivities.filter(a => (quantities[a.id] || 0) > 0);
  const sortedDays = Array.from(selectedDays).sort();

  const perDay = selectedActivities.reduce(
    (acc, a) => {
      const qty = quantities[a.id];
      const value = Math.abs(a.points * (multipliers[a.category] || 1)) * qty;
      acc.records += qty;
      acc.points += isNegative(a.category) ? -value : value;
      return acc;
    },
    { records: 0, points: 0 }
  );
  const totalRecords = perDay.records * sortedDays.length;
  const totalPoints = perDay.points * sortedDays.length;

  const save = async () => {
    if (sortedDays.length === 0 || selectedActivities.length === 0) return;
    const summary =
      `Registrar ${totalRecords} lançamento(s) em ${sortedDays.length} dia(s)?\n` +
      `Saldo: ${totalPoints >= 0 ? '+' : ''}${totalPoints} pontos`;
    if (!confirm(summary)) return;

    setSaving(true);
    try {
      const response = await fetch('/api/activities/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          dates: sortedDays,
          items: selectedActivities.map(a => ({
            name: a.name,
            points: a.points,
            category: a.category,
            multiplier: multipliers[a.category] || 1,
            quantity: quantities[a.id],
          })),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`${data.created} registro(s) lançados em ${data.days} dia(s)!`);
        onSaved();
        onClose();
      } else {
        alert(`Erro: ${data.error || 'Erro ao registrar atividades'}`);
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Erro ao registrar atividades. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">📆 Lançamento em Lote</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
          {/* Step 1: calendar */}
          <section>
            <p className="font-semibold mb-2">1. Selecione os dias</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={() => { setRangeMode(false); setRangeStart(null); }}
                className={`px-3 py-1 rounded-md text-sm font-semibold ${!rangeMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Dias avulsos
              </button>
              <button
                onClick={() => setRangeMode(true)}
                className={`px-3 py-1 rounded-md text-sm font-semibold ${rangeMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Intervalo
              </button>
              {selectedDays.size > 0 && (
                <button
                  onClick={() => { setSelectedDays(new Set()); setRangeStart(null); }}
                  className="px-3 py-1 rounded-md text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Limpar
                </button>
              )}
            </div>
            {rangeMode && (
              <p className="text-sm text-blue-700 mb-2">
                {rangeStart
                  ? `Início: ${formatShort(rangeStart)} — agora toque no último dia do período.`
                  : 'Toque no primeiro dia do período.'}
              </p>
            )}

            <div className="max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 rounded hover:bg-gray-100 text-lg" aria-label="Mês anterior">◀</button>
                <span className="font-bold">{MONTHS[viewMonth]} {viewYear}</span>
                <button
                  onClick={() => changeMonth(1)}
                  disabled={viewYear === todayY && viewMonth === todayM - 1}
                  className="px-3 py-1 rounded hover:bg-gray-100 text-lg disabled:opacity-30"
                  aria-label="Próximo mês"
                >
                  ▶
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-1">
                {WEEKDAYS.map((w, i) => <div key={i}>{w}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((key, i) => {
                  if (!key) return <div key={i} />;
                  const future = key > todayKey;
                  const selected = selectedDays.has(key);
                  const isRangeStart = rangeStart === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleDayClick(key)}
                      disabled={future}
                      className={`aspect-square rounded-md text-sm font-semibold transition-colors ${
                        future
                          ? 'text-gray-300 cursor-not-allowed'
                          : selected
                            ? 'bg-blue-600 text-white'
                            : isRangeStart
                              ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-600'
                              : 'bg-gray-100 hover:bg-blue-100'
                      } ${key === todayKey && !selected ? 'ring-1 ring-blue-400' : ''}`}
                    >
                      {Number(key.slice(8))}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {sortedDays.length === 0
                ? 'Nenhum dia selecionado.'
                : `${sortedDays.length} dia(s): ${sortedDays.map(formatShort).join(', ')}`}
            </p>
          </section>

          {/* Step 2: activities with quantities */}
          <section>
            <p className="font-semibold mb-1">2. Escolha as atividades e a quantidade por dia</p>
            <p className="text-xs text-gray-500 mb-3">
              A quantidade escolhida será lançada em cada um dos dias selecionados.
            </p>
            <div className="space-y-4">
              {Object.entries(categoryConfig).map(([category, config]) => {
                const list = customActivities.filter(a => a.category === category);
                if (list.length === 0) return null;
                return (
                  <div key={category} className={`border-2 rounded-lg p-3 ${config.color}`}>
                    <p className="font-bold mb-2">{config.title}</p>
                    <div className="space-y-2">
                      {list.map(activity => {
                        const qty = quantities[activity.id] || 0;
                        const unit = Math.abs(activity.points * (multipliers[category] || 1));
                        return (
                          <div key={activity.id} className={`bg-white rounded-md p-2 flex items-center justify-between gap-2 border ${qty > 0 ? 'border-blue-500' : 'border-gray-200'}`}>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{activity.name}</p>
                              <p className="text-xs text-gray-500">{isNegative(category) ? '-' : '+'}{unit} pts cada</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setQty(activity.id, qty - 1)}
                                disabled={qty === 0}
                                className="w-8 h-8 rounded bg-gray-200 font-bold disabled:opacity-40"
                                aria-label="Diminuir"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={MAX_QTY}
                                value={qty}
                                onChange={(e) => setQty(activity.id, parseInt(e.target.value))}
                                className="w-12 h-8 text-center border border-gray-300 rounded"
                              />
                              <button
                                onClick={() => setQty(activity.id, qty + 1)}
                                className="w-8 h-8 rounded bg-blue-600 text-white font-bold"
                                aria-label="Aumentar"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Summary + actions */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-700 mb-3">
            {perDay.records} registro(s) por dia × {sortedDays.length} dia(s) ={' '}
            <strong>{totalRecords} registro(s)</strong>, saldo{' '}
            <strong className={totalPoints >= 0 ? 'text-green-700' : 'text-red-700'}>
              {totalPoints >= 0 ? '+' : ''}{totalPoints} pts
            </strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || totalRecords === 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Lançar'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
