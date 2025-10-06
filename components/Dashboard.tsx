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
  const [currentWeekday, setCurrentWeekday] = useState('');

  useEffect(() => {
    if (childId) {
      loadActivities();
    }
    updateCurrentDate();
  }, [childId]);

  const updateCurrentDate = () => {
    const now = new Date();
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    setCurrentWeekday(weekdays[now.getDay()]);
    setCurrentDate(`${day}/${month}/${year}`);
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
      await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });
      loadActivities();
      alert('Entrada excluída com sucesso!');
      // Optionally trigger parent update to refresh points
      window.location.reload();
    } catch (error) {
      console.error('Error deleting activity entry:', error);
      alert('Erro ao excluir entrada');
    }
  };

  if (!childId || !childData) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
  }

  const totalPoints = childData.totalPoints || 0;
  const initialBalance = childData.initialBalance || 0;
  const pointsEarned = totalPoints - initialBalance;

  return (
    <div>
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-1">📊 Dashboard - {childData.name}</h2>
        <p className="text-lg">
          <span className="font-semibold">{currentWeekday}</span> - {currentDate}
        </p>
        <p className="text-sm mt-1 opacity-90">
          ℹ️ As atribuições imediatas são referentes ao dia em curso. Use o calendário para registros de outros dias.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Saldo Inicial</h3>
          <p className="text-3xl font-bold">{initialBalance}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Pontos Ganhos</h3>
          <p className="text-3xl font-bold">{pointsEarned}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold mb-2">Total de Pontos</h3>
          <p className="text-3xl font-bold">{totalPoints}</p>
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
                    {new Date(activity.date).toLocaleDateString('pt-BR')} às {new Date(activity.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
