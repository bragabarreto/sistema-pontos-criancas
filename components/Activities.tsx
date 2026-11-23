'use client';

import { useEffect, useState } from 'react';
import { getFortalezaDayKey } from '@/lib/timezone';
import { BatchEntryModal } from './BatchEntryModal';
import { ManageActivities, CATEGORY_CONFIG } from './ManageActivities';

const todayFortaleza = () => getFortalezaDayKey(new Date());

interface ActivitiesProps {
  childId: number | null;
  onUpdate: () => void;
}

export function Activities({ childId, onUpdate }: ActivitiesProps) {
  const [customActivities, setCustomActivities] = useState<any[]>([]);
  const [multipliers, setMultipliers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedActivityForDate, setSelectedActivityForDate] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [managing, setManaging] = useState(false);
  
  // Expense management state
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  // Quick-entry quantity per activity (defaults to 1) and batch modal
  const [quickQty, setQuickQty] = useState<Record<number, number>>({});
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (childId) {
      loadCustomActivities();
      loadMultipliers();
      loadRecentActivities();
      loadExpenses();
    }
    // Set current date as default
    const today = todayFortaleza();
    setSelectedDate(today);
    setExpenseDate(today);
  }, [childId]);

  const loadCustomActivities = async () => {
    try {
      const response = await fetch(`/api/custom-activities?childId=${childId}`);
      const data = await response.json();
      
      // Validate that the response is an array
      if (Array.isArray(data)) {
        setCustomActivities(data);
      } else {
        console.error('Invalid custom activities response: expected array, got:', typeof data);
        setCustomActivities([]);
      }
    } catch (error) {
      console.error('Error loading custom activities:', error);
      setCustomActivities([]);
    }
  };

  const loadMultipliers = async () => {
    try {
      const response = await fetch('/api/settings?key=multipliers');
      const data = await response.json();
      if (data?.value) {
        setMultipliers(data.value);
      } else {
        setMultipliers({
          positivos: 1,
          especiais: 50,
          negativos: 1,
          graves: 100
        });
      }
    } catch (error) {
      console.error('Error loading multipliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await fetch(`/api/activities?childId=${childId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Get only today's activities and recent ones
        setRecentActivities(data.slice(0, 20));
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?childId=${childId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        console.error('Invalid expenses response: expected array, got:', typeof data);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };

  const addExpense = async () => {
    if (!expenseDescription || !expenseAmount || !expenseDate) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const amount = parseInt(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('O valor deve ser um número positivo.');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          description: expenseDescription,
          amount,
          date: expenseDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Gasto registrado com sucesso!');
        setShowExpenseModal(false);
        setExpenseDescription('');
        setExpenseAmount('');
        const today = todayFortaleza();
        setExpenseDate(today);
        loadExpenses();
        onUpdate(); // Trigger Dashboard refresh
      } else {
        alert(`Erro: ${data.error || 'Erro ao registrar gasto'}`);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Erro ao registrar gasto. Verifique sua conexão e tente novamente.');
    }
  };

  const deleteExpense = async (expenseId: number) => {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        loadExpenses();
        onUpdate(); // Trigger Dashboard refresh
        alert('Gasto excluído com sucesso!');
      } else {
        const errorMessage = data.error || 'Erro ao excluir gasto';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Erro ao excluir gasto. Verifique sua conexão e tente novamente.');
    }
  };

  const deleteActivity = async (activityId: number) => {
    if (!confirm('Tem certeza que deseja remover este registro de atividade?')) return;

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        loadRecentActivities();
        onUpdate();
        alert('Registro removido com sucesso!');
      } else {
        const errorMessage = data.error || 'Erro ao remover registro';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Erro ao remover registro. Verifique sua conexão e tente novamente.');
    }
  };

  const registerActivity = async (activity: any, category: string, quantity = 1) => {
    if (!childId || registering) return;

    setRegistering(true);
    try {
      const multiplier = multipliers[category] || 1;
      // A single unit uses the original endpoint; several units go through
      // the batch endpoint so they are saved in one request
      const response = quantity > 1
        ? await fetch('/api/activities/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              childId,
              dates: [selectedDate],
              items: [{ name: activity.name, points: activity.points, category, multiplier, quantity }],
            }),
          })
        : await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              childId,
              name: activity.name,
              points: activity.points,
              category,
              multiplier,
              date: selectedDate, // Use selected date
            }),
          });

      const data = await response.json();

      if (response.ok) {
        onUpdate();
        loadRecentActivities(); // Reload activities to show the new one
        setQuickQty(prev => ({ ...prev, [activity.id]: 1 }));
        const qtyLabel = quantity > 1 ? ` ${quantity}x` : '';
        alert(`Atividade "${activity.name}"${qtyLabel} registrada para ${formatDate(selectedDate)}!`);
      } else {
        const errorMessage = data.error || 'Erro ao registrar atividade';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error registering activity:', error);
      alert('Erro ao registrar atividade. Verifique sua conexão e tente novamente.');
    } finally {
      setRegistering(false);
    }
  };

  const openDatePickerModal = (activity: any, category: string) => {
    setSelectedActivityForDate({ ...activity, category });
    setShowDatePicker(true);
  };

  const closeDatePickerModal = () => {
    setShowDatePicker(false);
    setSelectedActivityForDate(null);
  };

  const registerActivityWithDate = async () => {
    if (!selectedActivityForDate || !selectedDate) return;
    
    await registerActivity(selectedActivityForDate, selectedActivityForDate.category);
    closeDatePickerModal();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${weekdays[date.getDay()]}, ${day}/${month}/${year}`;
  };

  if (!childId) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
  }

  if (managing) {
    return (
      <ManageActivities
        childId={childId}
        onBack={() => {
          setManaging(false);
          loadCustomActivities();
          loadMultipliers();
        }}
      />
    );
  }

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  const categorizedActivities = {
    positivos: customActivities.filter(a => a.category === 'positivos'),
    especiais: customActivities.filter(a => a.category === 'especiais'),
    negativos: customActivities.filter(a => a.category === 'negativos'),
    graves: customActivities.filter(a => a.category === 'graves'),
  };

  const categoryConfig = CATEGORY_CONFIG;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-bold">🎯 Atividades</h2>
        <button
          onClick={() => setManaging(true)}
          className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
        >
          🛠️ Gerenciar atividades
        </button>
      </div>
      
      {/* Date Selection Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-gray-800">📅 Data Selecionada para Registro:</p>
            <p className="text-lg text-blue-700 font-bold">{formatDate(selectedDate)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Alterar Data:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md font-semibold"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ℹ️ Clique nas atividades abaixo para registrá-las na data selecionada. Ajuste a quantidade (×) ao lado do botão + para lançar várias de uma vez.
        </p>
        <button
          onClick={() => setShowBatchModal(true)}
          className="mt-3 w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          📆 Lançamento em lote (vários dias)
        </button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(categoryConfig).map(([category, config]) => (
          <div key={category} className={`border-2 rounded-lg p-4 ${config.color}`}>
            <h3 className="text-lg font-bold mb-3">{config.title}</h3>
            <div className="space-y-2">
              {categorizedActivities[category as keyof typeof categorizedActivities].length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade cadastrada</p>
              ) : (
                categorizedActivities[category as keyof typeof categorizedActivities].map((activity) => {
                  return (
                    <div key={activity.id} className="bg-white rounded-md p-3 border border-gray-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {category === 'negativos' || category === 'graves' ? '-' : '+'}
                            {activity.points * (multipliers[category] || 1)} pts
                          </p>
                        </div>
                        <div className="flex gap-1 items-center shrink-0">
                          {/* Remove last entry */}
                          <button
                            onClick={() => {
                              // Remove the most recent entry of this activity
                              const activityEntries = recentActivities.filter(a => a.name === activity.name);
                              if (activityEntries.length > 0) {
                                deleteActivity(activityEntries[0].id);
                              } else {
                                alert('Nenhum registro desta atividade encontrado para remover');
                              }
                            }}
                            className="bg-orange-500 text-white w-9 h-9 rounded font-bold hover:bg-orange-600"
                            title="Retirar atividade (remover última entrada)"
                          >
                            -
                          </button>
                          
                          {/* Quantity + Add Entry Button */}
                          <div className="flex items-center border border-green-500 rounded overflow-hidden">
                            <span className="text-xs text-gray-500 pl-1">×</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={99}
                              value={quickQty[activity.id] ?? 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setQuickQty(prev => ({
                                  ...prev,
                                  [activity.id]: isNaN(value) ? 1 : Math.max(1, Math.min(99, value)),
                                }));
                              }}
                              className="w-10 h-9 text-center text-sm outline-none"
                              title="Quantidade"
                              aria-label="Quantidade"
                            />
                            <button
                              onClick={() => registerActivity(activity, category, quickQty[activity.id] ?? 1)}
                              disabled={registering}
                              className="bg-green-500 text-white w-9 h-9 font-bold hover:bg-green-600 disabled:opacity-50"
                              title="Atribuir atividade (adicionar pontos)"
                            >
                              +
                            </button>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expenses Section */}
      <div className="mt-8 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">💰 Gastos</h3>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            + Adicionar Gasto
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Registre os gastos de pontos da criança (ex: prêmios, recompensas).
        </p>
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">Nenhum gasto registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 10).map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold text-orange-600">
                      -{expense.amount}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-semibold"
                    title="Excluir gasto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activities Section */}
      <div className="mt-8 bg-gray-50 border border-gray-300 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">📋 Registros Recentes (Últimos 20)</h3>
        <p className="text-sm text-gray-600 mb-3">
          Use esta seção para remover registros atribuídos anteriormente.
        </p>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nenhum registro encontrado.</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-semibold">{activity.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('pt-BR', { 
                      timeZone: 'America/Fortaleza',
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })} às {new Date(activity.date).toLocaleTimeString('pt-BR', { 
                      timeZone: 'America/Fortaleza',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`font-bold text-lg ${activity.category === 'negativos' || activity.category === 'graves' ? 'text-red-600' : 'text-green-600'}`}>
                      {activity.category === 'negativos' || activity.category === 'graves' ? '-' : '+'}{Math.abs(activity.points * activity.multiplier)}
                    </p>
                    <p className="text-xs text-gray-500">{activity.category}</p>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-semibold"
                    title="Remover registro"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Entry Modal */}
      {showBatchModal && (
        <BatchEntryModal
          childId={childId}
          customActivities={customActivities}
          multipliers={multipliers}
          categoryConfig={categoryConfig}
          onClose={() => setShowBatchModal(false)}
          onSaved={() => {
            loadRecentActivities();
            onUpdate();
          }}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Adicionar Gasto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ex: Sorvete, Brinquedo, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Valor (pontos)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ex: 10"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Data</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addExpense}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setExpenseDescription('');
                  setExpenseAmount('');
                  const today = todayFortaleza();
                  setExpenseDate(today);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
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
