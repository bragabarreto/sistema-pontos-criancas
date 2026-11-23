'use client';

import { useEffect, useState } from 'react';
import { CATEGORY_CONFIG, DEFAULT_MULTIPLIERS, type Category } from './ManageActivities';

interface RulesProps {
  childId: number;
}

const CATEGORY_HINT: Record<Category, string> = {
  positivos: 'Ganham pontos',
  especiais: 'Ganham muitos pontos',
  negativos: 'Perdem pontos',
  graves: 'Perdem muitos pontos',
};

/** Read-only list of activities and how many points each one is worth */
export function Rules({ childId }: RulesProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [multipliers, setMultipliers] = useState<Record<string, number>>(DEFAULT_MULTIPLIERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/custom-activities?childId=${childId}`).then(r => r.json()).catch(() => []),
      fetch('/api/settings?key=multipliers').then(r => r.json()).catch(() => null),
    ]).then(([acts, settings]) => {
      setActivities(Array.isArray(acts) ? acts : []);
      setMultipliers({ ...DEFAULT_MULTIPLIERS, ...(settings?.value || {}) });
    }).finally(() => setLoading(false));
  }, [childId]);

  if (loading) return <p className="text-center text-gray-500">Carregando...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">📜 Regras</h2>
      <p className="text-sm text-gray-600 mb-6">Veja quanto vale cada atividade.</p>
      <div className="space-y-6">
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map(category => {
          const list = activities.filter(a => a.category === category);
          if (list.length === 0) return null;
          const negative = category === 'negativos' || category === 'graves';
          return (
            <section key={category} className={`border-2 rounded-lg p-4 ${CATEGORY_CONFIG[category].color}`}>
              <h3 className="text-lg font-bold">{CATEGORY_CONFIG[category].title}</h3>
              <p className="text-xs text-gray-600 mb-3">{CATEGORY_HINT[category]}</p>
              <ul className="space-y-2">
                {list.map(activity => (
                  <li key={activity.id} className="bg-white rounded-md p-3 border border-gray-200 flex justify-between items-center gap-3">
                    <span className="font-semibold text-gray-800">{activity.name}</span>
                    <span className={`font-bold whitespace-nowrap ${negative ? 'text-red-600' : 'text-green-600'}`}>
                      {negative ? '-' : '+'}{activity.points * (multipliers[category] || 1)} pts
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
