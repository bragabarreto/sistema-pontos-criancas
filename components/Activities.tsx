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

  useEffect(() => {
    if (childId) {
      loadCustomActivities();
      loadMultipliers();
      loadRecentActivities();
    }
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
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

  const deleteActivity = async (activityId: number) => {
    if (!confirm('Tem certeza que deseja remover este registro de atividade?')) return;

    try {
      await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });
      loadRecentActivities();
      onUpdate();
      alert('Registro removido com sucesso!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Erro ao remover registro');
    }
  };

  const registerActivity = async (activity: any, category: string) => {
    if (!childId) return;

    try {
      await fetch('/api/activities', {
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
      onUpdate();
      alert(`Atividade "${activity.name}" registrada para ${formatDate(selectedDate)}!`);
    } catch (error) {
      console.error('Error registering activity:', error);
      alert('Erro ao registrar atividade');
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
            <h3 className="text-lg font-bold mb-3">{config.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              Multiplicador: {multipliers[category] || 1}x
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categorizedActivities[category as keyof typeof categorizedActivities].length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade cadastrada</p>
              ) : (
                categorizedActivities[category as keyof typeof categorizedActivities].map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => registerActivity(activity, category)}
                    className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-3 text-left transition-all hover:shadow-md"
                  >
                    <p className="font-semibold">{activity.name}</p>
                    <p className="text-sm text-gray-600">{activity.points} pontos</p>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
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
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })} às {new Date(activity.date).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`font-bold text-lg ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.points > 0 ? '+' : ''}{activity.points * activity.multiplier}
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
    </div>
  );
}
