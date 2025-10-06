'use client';

import { useEffect, useState } from 'react';

interface DashboardProps {
  childId: number | null;
  childData: any;
}

export function Dashboard({ childId, childData }: DashboardProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadActivities();
    }
  }, [childId]);

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

  if (!childId || !childData) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
  }

  const totalPoints = childData.totalPoints || 0;
  const initialBalance = childData.initialBalance || 0;
  const pointsEarned = totalPoints - initialBalance;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard - {childData.name}</h2>
      
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
                <div>
                  <p className="font-semibold">{activity.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points * activity.multiplier}
                  </p>
                  <p className="text-xs text-gray-500">{activity.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
