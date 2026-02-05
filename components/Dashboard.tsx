'use client';

import { useEffect, useState } from 'react';
import { calculateDailyBalances, getTodayBalance, getCurrentBalance, type DailyBalance } from '@/lib/balance-calculator';

interface DashboardProps {
  childId: number | null;
  childData: any;
}

export function Dashboard({ childId, childData }: DashboardProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentWeekday, setCurrentWeekday] = useState('');
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  // FIX 1: Reset state when childId changes to prevent data mixing
  useEffect(() => {
    // Clear all child-specific data when switching children
    setActivities([]);
    setExpenses([]);
    setDailyBalances([]);
    setLoading(true);
  }, [childId]);

  // FIX 2: Load all data simultaneously to avoid race conditions
  useEffect(() => {
    if (childId && childData) {
      loadAllData();
    }
    updateCurrentDateTime();
    
    // Update time every second for real-time clock
    const interval = setInterval(updateCurrentDateTime, 1000);
    
    // Set current date as default for expense
    const today = new Date().toISOString().split('T')[0];
    setExpenseDate(today);
    
    return () => clearInterval(interval);
  }, [childId, childData]);

  const updateCurrentDateTime = () => {
    // Get current time in Fortaleza timezone
    const now = new Date();
    const fortalezaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
    
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const day = String(fortalezaTime.getDate()).padStart(2, '0');
    const month = String(fortalezaTime.getMonth() + 1).padStart(2, '0');
    const year = fortalezaTime.getFullYear();
    const hours = String(fortalezaTime.getHours()).padStart(2, '0');
    const minutes = String(fortalezaTime.getMinutes()).padStart(2, '0');
    const seconds = String(fortalezaTime.getSeconds()).padStart(2, '0');
    
    setCurrentWeekday(weekdays[fortalezaTime.getDay()]);
    setCurrentDate(`${day}/${month}/${year}`);
    setCurrentTime(`${hours}:${minutes}:${seconds}`);
  };

  // FIX 2: Load activities and expenses simultaneously
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load both activities and expenses in parallel
      const [activitiesRes, expensesRes] = await Promise.all([
        fetch(`/api/activities?childId=${childId}`),
        fetch(`/api/expenses?childId=${childId}`)
      ]);
      
      const activitiesData = await activitiesRes.json();
      const expensesData = await expensesRes.json();
      
      // Validate responses
      const validActivities = Array.isArray(activitiesData) ? activitiesData : [];
      const validExpenses = Array.isArray(expensesData) ? expensesData : [];
      
      // Update state
      setActivities(validActivities);
      setExpenses(validExpenses);
      
      // Calculate daily balances with both datasets
      if (childData) {
        const balances = calculateDailyBalances(
          validActivities,
          validExpenses,
          childData.initialBalance || 0,
          childData.startDate ? new Date(childData.startDate) : null,
          childId || undefined
        );
        setDailyBalances(balances);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setActivities([]);
      setExpenses([]);
      setDailyBalances([]);
    } finally {
      setLoading(false);
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
        loadAllData();
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
        loadAllData();
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

  const deleteActivityEntry = async (activityId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        loadAllData();
        alert('Entrada excluída com sucesso!');
        // Reload to refresh points
        window.location.reload();
      } else {
        const errorMessage = data.error || 'Erro ao excluir entrada';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting activity entry:', error);
      alert('Erro ao excluir entrada. Verifique sua conexão e tente novamente.');
    }
  };

  if (!childId || !childData) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
  }

  // Get today's balance data from the daily balances array
  // todayBalance contains pre-calculated values:
  // - positivePoints: Sum of all positive activities (already positive number)
  // - negativePoints: Sum of all negative activities (converted to positive/absolute value)
  // - expenses: Sum of all expenses for the day
  const todayBalance = getTodayBalance(dailyBalances);
  const initialBalance = todayBalance?.initialBalance ?? childData.initialBalance ?? 0;
  const positivePointsToday = todayBalance?.positivePoints ?? 0; // Always >= 0
  const negativePointsToday = todayBalance?.negativePoints ?? 0; // Always >= 0 (absolute value)
  const expensesToday = todayBalance?.expenses ?? 0;
  const currentBalance = getCurrentBalance(dailyBalances);

  return (
    <div>
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">📊 Dashboard - {childData.name}</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-lg">
              <span className="font-semibold">{currentWeekday}</span> - {currentDate}
            </p>
            <p className="text-sm opacity-90">
              ℹ️ As atribuições imediatas são referentes ao dia em curso.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p className="text-xs opacity-90 mb-1">🕐 Horário de Fortaleza - CE</p>
            <p className="text-3xl font-bold font-mono tracking-wider">{currentTime}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Rectangle 1: Initial Balance - Blue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Saldo Inicial do Dia</h3>
          <p className="text-3xl font-bold">{initialBalance}</p>
        </div>
        
        {/* Rectangle 2: Positive Points - Green */}
        {/* positivePointsToday is always >= 0 (sum of positive activities only) */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Pontos Positivos Hoje</h3>
          <p className="text-3xl font-bold">+{positivePointsToday}</p>
        </div>
        
        {/* Rectangle 3: Negative Points - Red */}
        {/* negativePointsToday is always >= 0 (absolute value of negative activities) */}
        {/* Display with minus sign: e.g., if value is 5, shows "-5" */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Pontos Negativos Hoje</h3>
          <p className="text-3xl font-bold">-{negativePointsToday}</p>
        </div>
        
        {/* Rectangle 4: Expenses - Orange */}
        {/* expensesToday is always >= 0 (sum of expense amounts) */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Gastos do Dia</h3>
          <p className="text-3xl font-bold">-{expensesToday}</p>
        </div>
        
        {/* Rectangle 5: Current Balance - Purple */}
        {/* Formula: currentBalance = initialBalance + positivePoints - negativePoints - expenses */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Saldo Atual</h3>
          <p className="text-3xl font-bold">{currentBalance}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Atividades Recentes</h3>
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500">Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold">{activity.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })} às {new Date(activity.date).toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`font-bold ${activity.category === 'negativos' || activity.category === 'graves' ? 'text-red-600' : 'text-green-600'}`}>
                      {activity.category === 'negativos' || activity.category === 'graves' ? '-' : '+'}{Math.abs(activity.points * activity.multiplier)}
                    </p>
                    <p className="text-xs text-gray-500">{activity.category}</p>
                  </div>
                  <button
                    onClick={() => deleteActivityEntry(activity.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 font-semibold"
                    title="Excluir entrada"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">💰 Gastos</h3>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            + Adicionar Gasto
          </button>
        </div>
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

      {/* Historical View Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📊 Histórico Diário de Pontos</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChart(false)}
              className={`px-4 py-2 rounded-lg font-semibold ${!showChart ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              📋 Tabela
            </button>
            <button
              onClick={() => setShowChart(true)}
              className={`px-4 py-2 rounded-lg font-semibold ${showChart ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              📈 Gráfico
            </button>
          </div>
        </div>

        {!showChart ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Saldo Inicial</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Pontos +</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Pontos -</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Gastos</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Balanço do Dia</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                {dailyBalances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                      Nenhum histórico disponível
                    </td>
                  </tr>
                ) : (
                  dailyBalances.slice().reverse().map((balance, index) => {
                    const isToday = index === 0; // First in reversed array is today
                    const dailyChange = balance.positivePoints - balance.negativePoints - balance.expenses;
                    return (
                      <tr key={balance.dateString} className={isToday ? 'bg-blue-50 font-semibold' : ''}>
                        <td className="border border-gray-300 px-4 py-2">
                          {balance.dateString}
                          {isToday && <span className="ml-2 text-blue-600 text-xs">(Hoje)</span>}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{balance.initialBalance}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-green-600">
                          {balance.positivePoints > 0 ? `+${balance.positivePoints}` : '0'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                          {balance.negativePoints > 0 ? `-${balance.negativePoints}` : '0'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-orange-600">
                          {balance.expenses > 0 ? `-${balance.expenses}` : '0'}
                        </td>
                        <td className={`border border-gray-300 px-4 py-2 text-right font-semibold ${
                          dailyChange > 0 ? 'text-green-600' : dailyChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {dailyChange > 0 ? '+' : ''}{dailyChange}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold">{balance.finalBalance}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Chart View */
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="relative" style={{ height: '400px' }}>
              {dailyBalances.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhum dado disponível para exibir
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Chart header with scale */}
                  <div className="mb-2 text-sm text-gray-600">
                    Evolução do Saldo ao Longo do Tempo
                  </div>
                  
                  {/* Simple ASCII-style chart */}
                  <div className="flex-1 flex items-end justify-between gap-1 border-b-2 border-l-2 border-gray-400 pb-2 pl-2">
                    {dailyBalances.map((balance, index) => {
                      const maxBalance = Math.max(...dailyBalances.map(b => b.finalBalance), childData.initialBalance || 0);
                      const minBalance = Math.min(...dailyBalances.map(b => b.finalBalance), 0);
                      const range = maxBalance - minBalance || 1;
                      const heightPercent = ((balance.finalBalance - minBalance) / range) * 100;
                      
                      const isToday = index === dailyBalances.length - 1;
                      const dailyChange = balance.positivePoints - balance.negativePoints - balance.expenses;
                      
                      return (
                        <div key={balance.dateString} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-full ${
                              isToday ? 'bg-blue-600' : dailyChange > 0 ? 'bg-green-500' : dailyChange < 0 ? 'bg-red-500' : 'bg-gray-400'
                            } rounded-t transition-all hover:opacity-80 cursor-pointer relative group`}
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                            title={`${balance.dateString}: ${balance.finalBalance} pontos`}
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              <div>{balance.dateString}</div>
                              <div>Saldo: {balance.finalBalance}</div>
                              <div>Balanço: {dailyChange > 0 ? '+' : ''}{dailyChange}</div>
                            </div>
                          </div>
                          {/* Show date for every 5th bar or if less than 15 days */}
                          {(dailyBalances.length <= 15 || index % 5 === 0 || isToday) && (
                            <div className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                              {balance.dateString.split('/').slice(0, 2).join('/')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Dia Positivo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Dia Negativo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>Hoje</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
