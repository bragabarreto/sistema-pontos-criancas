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

  useEffect(() => {
    if (childId) {
      loadCustomActivities();
      loadMultipliers();
    }
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
        }),
      });
      onUpdate();
      alert(`Atividade "${activity.name}" registrada!`);
    } catch (error) {
      console.error('Error registering activity:', error);
      alert('Erro ao registrar atividade');
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
      <h2 className="text-2xl font-bold mb-6">🎯 Atividades</h2>
      
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
    </div>
  );
}
