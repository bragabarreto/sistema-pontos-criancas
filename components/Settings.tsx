'use client';

import { useEffect, useState } from 'react';

interface SettingsProps {
  childId: number | null;
  onUpdate: () => void;
}

interface CustomActivity {
  id: number;
  childId: number;
  activityId: string;
  name: string;
  points: number;
  category: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export function Settings({ childId, onUpdate }: SettingsProps) {
  const [multipliers, setMultipliers] = useState({
    positivos: 1,
    especiais: 50,
    negativos: 1,
    graves: 100,
  });
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CustomActivity | null>(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState(0);
  const [addEntryModalOpen, setAddEntryModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CustomActivity | null>(null);

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

  const openEditModal = (activity: CustomActivity) => {
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

  const saveEditActivity = async () => {
    if (!editingActivity) return;
    if (!editName.trim()) {
      alert('Por favor, insira um nome para a atividade');
      return;
    }

    try {
      await fetch(`/api/custom-activities/${editingActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          points: editPoints,
        }),
      });
      loadCustomActivities();
      closeEditModal();
      alert('Atividade atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating custom activity:', error);
      alert('Erro ao atualizar atividade');
    }
  };

  const moveActivity = async (activity: CustomActivity, direction: 'up' | 'down') => {
    try {
      await fetch('/api/custom-activities/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activity.childId,
          category: activity.category,
          activityId: activity.activityId,
          direction,
        }),
      });
      loadCustomActivities();
    } catch (error) {
      console.error('Error moving activity:', error);
      alert('Erro ao reordenar atividade');
    }
  };

  const openAddEntryModal = (activity: CustomActivity) => {
    setSelectedActivity(activity);
    setAddEntryModalOpen(true);
  };

  const closeAddEntryModal = () => {
    setAddEntryModalOpen(false);
    setSelectedActivity(null);
  };

  const addActivityEntry = async () => {
    if (!selectedActivity || !childId) return;

    try {
      // Fetch multipliers to calculate correct points
      const response = await fetch('/api/settings?key=multipliers');
      const data = await response.json();
      const currentMultipliers = data?.value || multipliers;
      
      const multiplier = currentMultipliers[selectedActivity.category as keyof typeof currentMultipliers] || 1;
      
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          name: selectedActivity.name,
          points: selectedActivity.points,
          category: selectedActivity.category,
          multiplier,
        }),
      });
      
      closeAddEntryModal();
      onUpdate(); // Refresh the parent component
      alert('Entrada registrada com sucesso!');
    } catch (error) {
      console.error('Error adding activity entry:', error);
      alert('Erro ao registrar entrada');
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

      // Validate that arrays are actually arrays
      const exportData = {
        children: Array.isArray(children) ? children : [],
        activities: Array.isArray(activities) ? activities : [],
        customActivities: Array.isArray(customActivities) ? customActivities : [],
        settings: Array.isArray(settings) ? settings : [],
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
            <div key={category} className="mb-6 border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg">{title}</h4>
                <button
                  onClick={() => addCustomActivity(category)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 font-semibold"
                >
                  ➕ Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {categorizedActivities[category as keyof typeof categorizedActivities].length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-2">Nenhuma atividade personalizada</p>
                ) : (
                  categorizedActivities[category as keyof typeof categorizedActivities].map((activity, index) => {
                    const categoryActivities = categorizedActivities[category as keyof typeof categorizedActivities];
                    const isFirst = index === 0;
                    const isLast = index === categoryActivities.length - 1;
                    
                    return (
                      <div key={activity.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {activity.points} pontos base × {multipliers[category as keyof typeof multipliers]} = {' '}
                            <span className="font-bold">
                              {activity.points * multipliers[category as keyof typeof multipliers]} pontos
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-1 items-center ml-4">
                          {/* Move Up Button */}
                          <button
                            onClick={() => moveActivity(activity, 'up')}
                            disabled={isFirst}
                            className={`px-2 py-1 rounded text-sm font-bold ${
                              isFirst 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title="Mover para cima"
                          >
                            ⬆️
                          </button>
                          
                          {/* Move Down Button */}
                          <button
                            onClick={() => moveActivity(activity, 'down')}
                            disabled={isLast}
                            className={`px-2 py-1 rounded text-sm font-bold ${
                              isLast 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title="Mover para baixo"
                          >
                            ⬇️
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(activity)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 font-semibold"
                            title="Editar atividade"
                          >
                            ✏️ Editar
                          </button>
                          
                          {/* Add Entry Button */}
                          <button
                            onClick={() => openAddEntryModal(activity)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 font-semibold"
                            title="Registrar entrada"
                          >
                            ➕ Entrada
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => deleteCustomActivity(activity.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 font-semibold"
                            title="Excluir atividade"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
            <div className="flex gap-3">
              <button
                onClick={saveEditActivity}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold"
              >
                💾 Salvar
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-semibold"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {addEntryModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">➕ Registrar Entrada</h3>
            <p className="mb-4">
              Deseja registrar uma entrada para a atividade:{' '}
              <span className="font-bold">{selectedActivity.name}</span>?
            </p>
            <p className="mb-4 text-sm text-gray-600">
              Pontos: <span className="font-bold">{selectedActivity.points}</span> × {' '}
              <span className="font-bold">{multipliers[selectedActivity.category as keyof typeof multipliers]}</span> = {' '}
              <span className="font-bold text-lg">
                {selectedActivity.points * multipliers[selectedActivity.category as keyof typeof multipliers]}
              </span> pontos
            </p>
            <div className="flex gap-3">
              <button
                onClick={addActivityEntry}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold"
              >
                ✅ Confirmar
              </button>
              <button
                onClick={closeAddEntryModal}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-semibold"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
