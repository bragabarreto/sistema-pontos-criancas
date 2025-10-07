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
  const [loading, setLoading] = useState(true);
  
  // Parent user state
  const [parentName, setParentName] = useState('');
  const [parentGender, setParentGender] = useState('');
  const [appStartDate, setAppStartDate] = useState('');
  const [parentExists, setParentExists] = useState(false);
  
  // Child initial balance state
  const [childInitialBalance, setChildInitialBalance] = useState(0);
  const [childStartDate, setChildStartDate] = useState('');

  useEffect(() => {
    loadSettings();
    loadParentInfo();
    if (childId) {
      loadChildInfo();
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

  const loadParentInfo = async () => {
    try {
      const response = await fetch('/api/parent');
      const data = await response.json();
      
      if (data) {
        setParentName(data.name || '');
        setParentGender(data.gender || '');
        setAppStartDate(data.appStartDate ? new Date(data.appStartDate).toISOString().split('T')[0] : '');
        setParentExists(true);
      }
    } catch (error) {
      console.error('Error loading parent info:', error);
    }
  };

  const loadChildInfo = async () => {
    try {
      const response = await fetch(`/api/children/${childId}`);
      const data = await response.json();
      
      if (data) {
        setChildInitialBalance(data.initialBalance || 0);
        setChildStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '');
      }
    } catch (error) {
      console.error('Error loading child info:', error);
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

  const saveParentInfo = async () => {
    if (!parentName || !appStartDate) {
      alert('Por favor, preencha o nome e a data de início do app');
      return;
    }

    try {
      const response = await fetch('/api/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parentName,
          gender: parentGender,
          appStartDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Informações do pai/mãe salvas com sucesso!');
        setParentExists(true);
      } else {
        const errorMessage = data.error || 'Erro ao salvar informações';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving parent info:', error);
      alert('Erro ao salvar informações. Verifique sua conexão e tente novamente.');
    }
  };

  const saveChildInitialBalance = async () => {
    if (!childId) {
      alert('Selecione uma criança');
      return;
    }

    if (!childStartDate) {
      alert('Por favor, defina a data de início');
      return;
    }

    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialBalance: childInitialBalance,
          startDate: childStartDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Saldo inicial e data de início salvos com sucesso!');
        onUpdate();
      } else {
        const errorMessage = data.error || 'Erro ao salvar configurações';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving child initial balance:', error);
      alert('Erro ao salvar configurações. Verifique sua conexão e tente novamente.');
    }
  };

  // Drag and drop handlers
  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ Configurações</h2>

      {/* Parent User Registration Section */}
      <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">👤 Dados do Pai/Mãe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Pai/Mãe:</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Sexo:</label>
            <select
              value={parentGender}
              onChange={(e) => setParentGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Data de Início do App:</label>
            <input
              type="date"
              value={appStartDate}
              onChange={(e) => setAppStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={saveParentInfo}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-semibold"
        >
          {parentExists ? '💾 Atualizar Dados' : '💾 Salvar Dados'}
        </button>
      </div>

      {/* Child Initial Balance Section */}
      {childId && (
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-xl font-bold mb-4">🎯 Configurações da Criança</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Saldo Inicial (pontos):</label>
              <input
                type="number"
                value={childInitialBalance}
                onChange={(e) => setChildInitialBalance(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Início para a Criança:</label>
              <input
                type="date"
                value={childStartDate}
                onChange={(e) => setChildStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button
            onClick={saveChildInitialBalance}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-semibold"
          >
            💾 Salvar Configurações da Criança
          </button>
        </div>
      )}

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
    </div>
  );
}
