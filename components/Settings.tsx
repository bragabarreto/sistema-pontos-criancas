'use client';

import { useEffect, useState } from 'react';

interface SettingsProps {
  childId: number | null;
  onUpdate: () => void;
}

export function Settings({ childId, onUpdate }: SettingsProps) {
  const [multipliers, setMultipliers] = useState({
    positivos: 1,
    especiais: 50,
    negativos: 1,
    graves: 100,
  });
  const [customActivities, setCustomActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    if (childId) {
      loadCustomActivities();
    }
  }, [childId]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=multipliers');
      const data = await response.json();
      if (data?.value) {
        setMultipliers(data.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomActivities = async () => {
    try {
      const response = await fetch(`/api/custom-activities?childId=${childId}`);
      const data = await response.json();
      setCustomActivities(data);
    } catch (error) {
      console.error('Error loading custom activities:', error);
    }
  };

  const saveMultipliers = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'multipliers',
          value: multipliers,
        }),
      });
      alert('Multiplicadores salvos com sucesso!');
    } catch (error) {
      console.error('Error saving multipliers:', error);
      alert('Erro ao salvar multiplicadores');
    }
  };

  const addCustomActivity = async (category: string) => {
    if (!childId) return;

    const name = prompt('Nome da atividade:');
    if (!name) return;

    const points = prompt('Pontos (use valores negativos para atividades negativas):');
    if (!points) return;

    try {
      await fetch('/api/custom-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          activityId: `custom-${Date.now()}`,
          name,
          points: parseInt(points),
          category,
        }),
      });
      loadCustomActivities();
      alert('Atividade adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding custom activity:', error);
      alert('Erro ao adicionar atividade');
    }
  };

  const deleteCustomActivity = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      await fetch(`/api/custom-activities/${id}`, {
        method: 'DELETE',
      });
      loadCustomActivities();
      alert('Atividade excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting custom activity:', error);
      alert('Erro ao excluir atividade');
    }
  };

  const exportData = async () => {
    try {
      // Fetch all data
      const [childrenRes, activitiesRes, customActivitiesRes, settingsRes] = await Promise.all([
        fetch('/api/children'),
        fetch('/api/activities'),
        fetch('/api/custom-activities'),
        fetch('/api/settings'),
      ]);

      const [children, activities, customActivities, settings] = await Promise.all([
        childrenRes.json(),
        activitiesRes.json(),
        customActivitiesRes.json(),
        settingsRes.json(),
      ]);

      const exportData = {
        children,
        activities,
        customActivities,
        settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sistema-pontos-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erro ao exportar dados');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importedData),
          });

          const result = await response.json();
          
          if (response.ok) {
            alert(`Dados importados com sucesso!\n\nCrianças: ${result.children}\nAtividades personalizadas: ${result.customActivities}\nAtividades: ${result.activities}`);
            onUpdate();
          } else {
            alert(`Erro ao importar dados: ${result.error}`);
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Erro ao processar arquivo de importação');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  const categorizedActivities = {
    positivos: customActivities.filter(a => a.category === 'positivos'),
    especiais: customActivities.filter(a => a.category === 'especiais'),
    negativos: customActivities.filter(a => a.category === 'negativos'),
    graves: customActivities.filter(a => a.category === 'graves'),
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ Configurações</h2>

      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">📦 Backup e Importação</h3>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <span>📥</span>
            Exportar Dados
          </button>
          <button
            onClick={importData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <span>📤</span>
            Importar Dados
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Exporte seus dados para fazer backup ou importe dados de um arquivo anterior.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Multiplicadores de Pontos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Positivas</label>
            <input
              type="number"
              value={multipliers.positivos}
              onChange={(e) => setMultipliers({ ...multipliers, positivos: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Especiais</label>
            <input
              type="number"
              value={multipliers.especiais}
              onChange={(e) => setMultipliers({ ...multipliers, especiais: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Negativas</label>
            <input
              type="number"
              value={multipliers.negativos}
              onChange={(e) => setMultipliers({ ...multipliers, negativos: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Graves</label>
            <input
              type="number"
              value={multipliers.graves}
              onChange={(e) => setMultipliers({ ...multipliers, graves: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={saveMultipliers}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Salvar Multiplicadores
        </button>
      </div>

      {childId && (
        <div>
          <h3 className="text-xl font-bold mb-4">Gerenciar Atividades Personalizadas</h3>
          
          {Object.entries({
            positivos: 'Atividades Positivas',
            especiais: 'Atividades Especiais',
            negativos: 'Atividades Negativas',
            graves: 'Atividades Graves',
          }).map(([category, title]) => (
            <div key={category} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">{title}</h4>
                <button
                  onClick={() => addCustomActivity(category)}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                >
                  + Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {categorizedActivities[category as keyof typeof categorizedActivities].length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma atividade personalizada</p>
                ) : (
                  categorizedActivities[category as keyof typeof categorizedActivities].map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <div>
                        <p className="font-semibold">{activity.name}</p>
                        <p className="text-sm text-gray-600">{activity.points} pontos</p>
                      </div>
                      <button
                        onClick={() => deleteCustomActivity(activity.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
