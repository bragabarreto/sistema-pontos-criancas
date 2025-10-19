'use client';

import { useEffect, useState } from 'react';

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState(0);
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [newActivityCategory, setNewActivityCategory] = useState('');
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPoints, setNewActivityPoints] = useState(0);
  
  // Expense management state
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  useEffect(() => {
    if (childId) {
      loadCustomActivities();
      loadMultipliers();
      loadRecentActivities();
      loadExpenses();
    }
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
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
        const today = new Date().toISOString().split('T')[0];
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

  const registerActivity = async (activity: any, category: string) => {
    if (!childId) return;

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          name: activity.name,
          points: activity.points,
          category,
          multiplier: multipliers[category] || 1,
          date: selectedDate, // Use selected date
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onUpdate();
        loadRecentActivities(); // Reload activities to show the new one
        alert(`Atividade "${activity.name}" registrada para ${formatDate(selectedDate)}!`);
      } else {
        const errorMessage = data.error || 'Erro ao registrar atividade';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error registering activity:', error);
      alert('Erro ao registrar atividade. Verifique sua conexão e tente novamente.');
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

  // Edit custom activity
  const openEditModal = (activity: any) => {
    setEditingActivity(activity);
    setEditName(activity.name);
    setEditPoints(activity.points);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingActivity(null);
    setEditName('');
    setEditPoints(0);
  };

  const saveEditedActivity = async () => {
    if (!editingActivity || !editName || editPoints <= 0) {
      alert('Por favor, preencha todos os campos corretamente');
      return;
    }

    try {
      const response = await fetch(`/api/custom-activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          points: editPoints,
        }),
      });

      if (response.ok) {
        loadCustomActivities();
        closeEditModal();
        alert('Atividade atualizada com sucesso para ambas as crianças!');
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || 'Erro ao atualizar atividade'}`);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Erro ao atualizar atividade');
    }
  };

  // Delete custom activity
  const deleteCustomActivity = async (activityId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade personalizada? Ela será removida para ambas as crianças (Luiza e Miguel).')) return;

    try {
      const response = await fetch(`/api/custom-activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCustomActivities();
        onUpdate();
        alert('Atividade excluída com sucesso para ambas as crianças!');
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || 'Erro ao excluir atividade'}`);
      }
    } catch (error) {
      console.error('Error deleting custom activity:', error);
      alert('Erro ao excluir atividade');
    }
  };

  // Move custom activity
  const moveActivity = async (activity: any, direction: 'up' | 'down') => {
    const categoryActivities = customActivities.filter(a => a.category === activity.category);
    const currentIndex = categoryActivities.findIndex(a => a.id === activity.id);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categoryActivities.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherActivity = categoryActivities[newIndex];

    try {
      // Swap order indices - now synchronized for both children
      await fetch('/api/custom-activities/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          category: activity.category,
          activityId: activity.activityId,
          direction,
        }),
      });

      loadCustomActivities();
      alert(`Atividade movida para ${direction === 'up' ? 'cima' : 'baixo'} (sincronizado para ambas as crianças)!`);
    } catch (error) {
      console.error('Error reordering activities:', error);
      alert('Erro ao reordenar atividades');
    }
  };

  // Open new activity modal
  const openNewActivityModal = (category: string) => {
    setNewActivityCategory(category);
    setNewActivityName('');
    setNewActivityPoints(0);
    setNewActivityModalOpen(true);
  };

  // Close new activity modal
  const closeNewActivityModal = () => {
    setNewActivityModalOpen(false);
    setNewActivityCategory('');
    setNewActivityName('');
    setNewActivityPoints(0);
  };

  // Save new activity (creates for both children)
  const saveNewActivity = async () => {
    if (!newActivityName || newActivityPoints <= 0) {
      alert('Por favor, preencha todos os campos corretamente');
      return;
    }

    try {
      // Generate a unique activity ID
      const uniqueId = `custom_${Date.now()}`;
      
      const response = await fetch('/api/custom-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          activityId: uniqueId,
          name: newActivityName,
          points: newActivityPoints,
          category: newActivityCategory,
        }),
      });

      if (response.ok) {
        loadCustomActivities();
        closeNewActivityModal();
        alert('Atividade criada com sucesso para ambas as crianças!');
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error || 'Erro ao criar atividade'}`);
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Erro ao criar atividade');
    }
  };

  if (!childId) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
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

  const categoryConfig = {
    positivos: { title: '✅ Atividades Positivas', color: 'bg-green-100 border-green-300' },
    especiais: { title: '⭐ Atividades Especiais', color: 'bg-yellow-100 border-yellow-300' },
    negativos: { title: '❌ Atividades Negativas', color: 'bg-orange-100 border-orange-300' },
    graves: { title: '🚫 Atividades Graves', color: 'bg-red-100 border-red-300' },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🎯 Atividades</h2>
      
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
          ℹ️ Clique nas atividades abaixo para registrá-las na data selecionada. Você pode alterar a data para registrar atividades de dias passados.
        </p>
      </div>
      
      <div className="space-y-6">
        {Object.entries(categoryConfig).map(([category, config]) => (
          <div key={category} className={`border-2 rounded-lg p-4 ${config.color}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">{config.title}</h3>
              <button
                onClick={() => openNewActivityModal(category)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                title="Adicionar nova atividade"
              >
                + Nova Atividade
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Multiplicador: {multipliers[category] || 1}x
            </p>
            <div className="space-y-2">
              {categorizedActivities[category as keyof typeof categorizedActivities].length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade cadastrada</p>
              ) : (
                categorizedActivities[category as keyof typeof categorizedActivities].map((activity, index) => {
                  const categoryActivities = categorizedActivities[category as keyof typeof categorizedActivities];
                  const isFirst = index === 0;
                  const isLast = index === categoryActivities.length - 1;
                  
                  return (
                    <div key={activity.id} className="bg-white rounded-md p-3 border border-gray-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {activity.points} pontos base × {multipliers[category] || 1} = {' '}
                            <span className="font-bold">
                              {activity.points * (multipliers[category] || 1)} pontos
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-1 items-center flex-wrap">
                          {/* Move Up Button */}
                          <button
                            onClick={() => moveActivity(activity, 'up')}
                            disabled={isFirst}
                            className={`px-2 py-1 rounded text-sm ${
                              isFirst 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                            title="Mover para cima"
                          >
                            ↑
                          </button>
                          
                          {/* Move Down Button */}
                          <button
                            onClick={() => moveActivity(activity, 'down')}
                            disabled={isLast}
                            className={`px-2 py-1 rounded text-sm ${
                              isLast 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                            title="Mover para baixo"
                          >
                            ↓
                          </button>
                          
                          {/* Remove Entry Button (NEW) */}
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
                            className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600"
                            title="Retirar atividade (remover última entrada)"
                          >
                            -
                          </button>
                          
                          {/* Add Entry Button */}
                          <button
                            onClick={() => registerActivity(activity, category)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                            title="Atribuir atividade (adicionar pontos)"
                          >
                            +
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(activity)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                            title="Editar atividade"
                          >
                            ✏️
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => deleteCustomActivity(activity.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                            title="Excluir atividade"
                          >
                            🗑️
                          </button>
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

      {/* Edit Activity Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">✏️ Editar Atividade</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Nome da Atividade:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nome da atividade"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Pontos Base:</label>
              <input
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Pontos"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              ℹ️ Esta alteração será aplicada para ambas as crianças (Luiza e Miguel).
            </p>
            <div className="flex gap-3">
              <button
                onClick={saveEditedActivity}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Activity Modal */}
      {newActivityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">➕ Nova Atividade</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Categoria:</label>
              <input
                type="text"
                value={categoryConfig[newActivityCategory as keyof typeof categoryConfig]?.title || newActivityCategory}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Nome da Atividade:</label>
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Ler um livro"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Pontos Base:</label>
              <input
                type="number"
                value={newActivityPoints}
                onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 1, 2, 5"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              ℹ️ Esta atividade será criada para ambas as crianças (Luiza e Miguel).
            </p>
            <div className="flex gap-3">
              <button
                onClick={saveNewActivity}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Criar Atividade
              </button>
              <button
                onClick={closeNewActivityModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
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
                  const today = new Date().toISOString().split('T')[0];
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
