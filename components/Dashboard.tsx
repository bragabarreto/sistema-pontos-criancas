'use client';

import { useEffect, useState } from 'react';

interface DashboardProps {
  childId: number | null;
  childData: any;
}

export function Dashboard({ childId, childData }: DashboardProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentWeekday, setCurrentWeekday] = useState('');

  useEffect(() => {
    if (childId) {
      loadActivities();
    }
    updateCurrentDateTime();
    
    // Update time every second for real-time clock
    const interval = setInterval(updateCurrentDateTime, 1000);
    
    return () => clearInterval(interval);
  }, [childId]);

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

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities?childId=${childId}`);
      const data = await response.json();
      
      // Validate that the response is an array
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        console.error('Invalid activities response: expected array, got:', typeof data);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
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
        loadActivities();
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

  const initialBalance = childData.initialBalance || 0;
  
  // Get today's date in Fortaleza timezone for comparison
  const now = new Date();
  const fortalezaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
  const todayStart = new Date(fortalezaTime.getFullYear(), fortalezaTime.getMonth(), fortalezaTime.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  
  // Filter activities for today only
  const todayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    const activityFortaleza = new Date(activityDate.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
    return activityFortaleza >= todayStart && activityFortaleza < todayEnd;
  });
  
  // Calculate positive and negative points from today's activities
  const positivePointsToday = todayActivities
    .filter(a => a.points > 0)
    .reduce((sum, a) => sum + (a.points * a.multiplier), 0);
  
  // Calculate negative points as absolute value for display and calculation
  const negativePointsToday = todayActivities
    .filter(a => a.points < 0)
    .reduce((sum, a) => sum + Math.abs(a.points * a.multiplier), 0);
  
  // Current balance = initial balance + positive points - negative points
  const currentBalance = initialBalance + positivePointsToday - negativePointsToday;

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Saldo Inicial do Dia</h3>
          <p className="text-3xl font-bold">{initialBalance}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Pontos Positivos Hoje</h3>
          <p className="text-3xl font-bold">+{positivePointsToday}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Pontos Negativos Hoje</h3>
          <p className="text-3xl font-bold">-{negativePointsToday}</p>
        </div>
        
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
                    <p className={`font-bold ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.points > 0 ? '+' : ''}{activity.points * activity.multiplier}
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
    </div>
  );
}
