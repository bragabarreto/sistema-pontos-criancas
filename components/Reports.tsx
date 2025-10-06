'use client';

import { useEffect, useState } from 'react';

interface ReportsProps {
  childId: number | null;
}

export function Reports({ childId }: ReportsProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week'); // week, month, all

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

  if (!childId) {
    return <div className="text-center text-gray-500">Selecione uma criança</div>;
  }

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  const now = new Date();
  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return activityDate >= weekAgo;
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return activityDate >= monthAgo;
    }
    return true; // all
  });

  const stats = {
    total: filteredActivities.reduce((sum, a) => sum + (a.points * a.multiplier), 0),
    positive: filteredActivities.filter(a => a.points > 0).reduce((sum, a) => sum + (a.points * a.multiplier), 0),
    negative: filteredActivities.filter(a => a.points < 0).reduce((sum, a) => sum + (a.points * a.multiplier), 0),
    count: filteredActivities.length,
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📈 Relatórios</h2>
      
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-lg ${period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Última Semana
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Último Mês
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-lg ${period === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600">Total de Atividades</h3>
          <p className="text-2xl font-bold">{stats.count}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600">Pontos Positivos</h3>
          <p className="text-2xl font-bold text-green-600">+{stats.positive}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600">Pontos Negativos</h3>
          <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600">Saldo do Período</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Histórico Completo</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <p className="text-gray-500">Nenhuma atividade no período selecionado.</p>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm"
              >
                <div>
                  <p className="font-semibold">{activity.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points * activity.multiplier}
                  </p>
                  <p className="text-xs text-gray-500">{activity.category}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
