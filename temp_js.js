        // SISTEMA COM SINCRONIZAÇÃO GOOGLE DRIVE
        console.log('🚀 INICIANDO SISTEMA COM GOOGLE DRIVE...');
        
        // Google Drive configuration
        const GOOGLE_CONFIG = {
            apiKey: 'AIzaSyBH8tTL79tzldlilw2M3M7cPmFk8tTL79t',
            clientId: '1002704718980-3aopluasrsqdvona293nae8atndedrq4.apps.googleusercontent.com',
            discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            scopes: 'https://www.googleapis.com/auth/drive.file'
        };
        
        // Global variables for Google Drive
        let isGoogleDriveReady = false;
        let authInstance = null;
        
        // Storage keys
        const STORAGE_KEY = 'kidsPointsSystem_functional';
        const DRIVE_FILE_NAME = 'sistema-pontos-dados.json';
        
        // Global variables
        let currentChild = 'luiza';
        let currentTab = 'dashboard';
        let editingActivityId = null;
        let editingCategory = null;
        let googleDriveFileId = null;
        let lastSyncTime = null;
        
        // Default activities
        const defaultActivities = {
            positive: [
                { id: 'pos1', name: 'Escovar os dentes', points: 1 },
                { id: 'pos2', name: 'Guardar brinquedos', points: 1 },
                { id: 'pos3', name: 'Ajudar nas tarefas', points: 1 }
            ],
            special: [
                { id: 'spe1', name: 'Ler um livro completo', points: 1 },
                { id: 'spe2', name: 'Fazer lição sem ajuda', points: 1 }
            ],
            negative: [
                { id: 'neg1', name: 'Não escovar os dentes', points: 1 },
                { id: 'neg2', name: 'Deixar quarto bagunçado', points: 1 }
            ],
            grave: [
                { id: 'gra1', name: 'Bater no irmão', points: 1 },
                { id: 'gra2', name: 'Mentir', points: 1 }
            ]
        };
        
        // App data
        let appData = {
            luiza: {
                saldoInicial: 0,
                dataInicio: null,
                activities: JSON.parse(JSON.stringify(defaultActivities)),
                todayActivities: [],
                multipliers: { positive: 1, special: 50, negative: 1, grave: 100 }
            },
            miguel: {
                saldoInicial: 0,
                dataInicio: null,
                activities: JSON.parse(JSON.stringify(defaultActivities)),
                todayActivities: [],
                multipliers: { positive: 1, special: 50, negative: 1, grave: 100 }
            },
            lastModified: new Date().toISOString(),
            version: '2.0'
        };
        
        // Load Google API script
        function loadGoogleAPI() {
            return new Promise((resolve, reject) => {
                if (typeof window.gapi !== 'undefined') {
                    console.log('✅ Google API já carregada');
                    resolve();
                    return;
                }
                
                console.log('📥 Carregando Google API...');
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.async = true;
                script.defer = true;
                
                script.onload = () => {
                    console.log('✅ Script Google API carregado');
                    window.gapi.load('auth2:client', {
                        callback: () => {
                            console.log('✅ Auth2 e Client carregados');
                            resolve();
                        },
                        onerror: () => {
                            console.error('❌ Erro ao carregar auth2:client');
                            reject(new Error('Erro ao carregar auth2:client'));
                        }
                    });
                };
                
                script.onerror = () => {
                    console.error('❌ Erro ao carregar script Google API');
                    reject(new Error('Erro ao carregar script Google API'));
                };
                
                document.head.appendChild(script);
            });
        }
        
        // Initialize Google Drive
        async function initializeGoogleDrive() {
            try {
                console.log('🔄 Iniciando inicialização do Google Drive...');
                
                // Load auth2 and client
                await new Promise((resolve, reject) => {
                    gapi.load('auth2:client', {
                        callback: resolve,
                        onerror: reject
                    });
                });
                
                console.log('🔧 Inicializando cliente Google...');
                await gapi.client.init({
                    apiKey: GOOGLE_CONFIG.apiKey,
                    clientId: GOOGLE_CONFIG.clientId,
                    discoveryDocs: [GOOGLE_CONFIG.discoveryDoc],
                    scope: GOOGLE_CONFIG.scopes
                });
                
                console.log('📁 Carregando Google Drive API...');
                await gapi.client.load('drive', 'v3');
                
                authInstance = gapi.auth2.getAuthInstance();
                isGoogleDriveReady = true;
                
                console.log('🔐 Verificando status de autenticação...');
                
                if (authInstance.isSignedIn.get()) {
                    updateSyncStatus('connected', '✅ Conectado ao Google Drive');
                    console.log('✅ Usuário já autenticado');
                    await loadData();
                } else {
                    updateSyncStatus('disconnected', '🔗 Clique em "Conectar" para sincronizar');
                    console.log('ℹ️ Usuário não autenticado');
                }
                
                console.log('✅ Google Drive inicializado com sucesso');
                
            } catch (error) {
                console.error('❌ Erro ao inicializar Google Drive:', error);
                updateSyncStatus('disconnected', '🔗 Clique em "Conectar" para sincronizar');
                isGoogleDriveReady = false;
                console.log('ℹ️ Sistema funcionando apenas com dados locais');
            }
        }
        
        // Update sync status
        function updateSyncStatus(status, message) {
            const syncStatus = document.getElementById('sync-status');
            const syncText = document.getElementById('sync-text');
            const syncBtn = document.getElementById('sync-btn');
            const settingsStatus = document.getElementById('settings-sync-status');
            
            syncStatus.className = `sync-status ${status}`;
            syncText.textContent = message;
            settingsStatus.textContent = status === 'connected' ? 'Conectado' : 'Desconectado';
            
            if (status === 'connected') {
                syncBtn.textContent = 'Desconectar';
                syncBtn.onclick = disconnectGoogleDrive;
            } else {
                syncBtn.textContent = 'Conectar';
                syncBtn.onclick = connectGoogleDrive;
            }
        }
        
        // Connect to Google Drive
        async function connectGoogleDrive() {
            try {
                console.log('🔗 Tentando conectar ao Google Drive...');
                
                if (!isGoogleDriveReady) {
                    console.log('❌ Google Drive não está pronto');
                    showNotification('Google Drive não está pronto. Recarregue a página.', 'error');
                    return;
                }
                
                updateSyncStatus('disconnected', '🔄 Conectando...');
                
                console.log('🔐 Iniciando processo de autenticação...');
                
                const user = await authInstance.signIn({
                    prompt: 'select_account'
                });
                
                console.log('👤 Usuário autenticado:', user.getBasicProfile().getEmail());
                
                if (user.isSignedIn()) {
                    updateSyncStatus('connected', '✅ Conectado ao Google Drive');
                    await loadData();
                    showNotification('Conectado ao Google Drive com sucesso!', 'success');
                    console.log('✅ Conexão estabelecida com sucesso');
                } else {
                    throw new Error('Falha na autenticação - usuário não está logado');
                }
                
            } catch (error) {
                console.error('❌ Erro ao conectar:', error);
                updateSyncStatus('disconnected', '❌ Erro na conexão');
                
                let errorMessage = 'Erro ao conectar com Google Drive';
                if (error.error === 'popup_closed_by_user') {
                    errorMessage = 'Conexão cancelada pelo usuário';
                } else if (error.error === 'access_denied') {
                    errorMessage = 'Acesso negado pelo usuário';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                showNotification(errorMessage, 'error');
            }
        }
        
        // Disconnect from Google Drive
        async function disconnectGoogleDrive() {
            try {
                if (authInstance) {
                    await authInstance.signOut();
                    updateSyncStatus('disconnected', '❌ Desconectado');
                    showNotification('Desconectado do Google Drive');
                }
            } catch (error) {
                console.error('Erro ao desconectar:', error);
                showNotification('Erro ao desconectar', 'error');
            }
        }
        
        // Toggle sync connection
        function toggleSync() {
            if (authInstance && authInstance.isSignedIn.get()) {
                disconnectGoogleDrive();
            } else {
                connectGoogleDrive();
            }
        }
        
        // Find or create file in Google Drive
        async function findOrCreateDriveFile() {
            try {
                if (!isGoogleDriveReady) return null;
                
                console.log('🔍 Procurando arquivo no Google Drive...');
                
                // Search for existing file
                const response = await gapi.client.drive.files.list({
                    q: "name='kids_points_system.json' and parents in 'appDataFolder'",
                    spaces: 'appDataFolder'
                });
                
                if (response.result.files.length > 0) {
                    const fileId = response.result.files[0].id;
                    console.log('✅ Arquivo encontrado:', fileId);
                    return fileId;
                }
                
                // Create new file
                console.log('📝 Criando novo arquivo...');
                const fileMetadata = {
                    name: 'kids_points_system.json',
                    parents: ['appDataFolder']
                };
                
                const createResponse = await gapi.client.drive.files.create({
                    resource: fileMetadata
                });
                
                const fileId = createResponse.result.id;
                console.log('✅ Arquivo criado:', fileId);
                return fileId;
                
            } catch (error) {
                console.error('❌ Erro ao encontrar/criar arquivo:', error);
                throw error;
            }
        }
        
        // Sync data to Google Drive
        async function syncToDrive() {
            if (!isGoogleDriveReady) {
                console.log('❌ Google Drive não está pronto');
                return false;
            }
            
            try {
                updateSyncStatus('connected', '🔄 Sincronizando...');
                
                const fileId = await findOrCreateDriveFile();
                if (!fileId) {
                    throw new Error('Não foi possível criar/encontrar arquivo');
                }
                
                // Update last modified
                appData.lastModified = new Date().toISOString();
                
                // Prepare data for upload
                const dataToUpload = JSON.stringify(appData, null, 2);
                
                // Upload data using the simpler files.update method
                const response = await gapi.client.drive.files.update({
                    fileId: fileId,
                    uploadType: 'media',
                    resource: {
                        name: DRIVE_FILE_NAME,
                        description: 'Dados do Sistema de Pontos para Crianças - Atualizado em ' + new Date().toLocaleString('pt-BR')
                    }
                }, dataToUpload);
                
                lastSyncTime = new Date();
                updateSyncStatus('connected', `✅ Sincronizado às ${lastSyncTime.toLocaleTimeString()}`);
                
                // Also save locally as backup
                saveDataLocal();
                
                console.log('✅ Dados sincronizados com sucesso');
                return true;
                
            } catch (error) {
                console.error('❌ Erro ao sincronizar:', error);
                updateSyncStatus('connected', '⚠️ Erro na sincronização');
                showNotification('Erro ao sincronizar com Google Drive', 'error');
                
                // Fallback to local storage
                saveDataLocal();
                return false;
            }
        }
        
        // Sync data from Google Drive
        async function syncFromDrive() {
            if (!isGoogleDriveReady) {
                console.log('❌ Google Drive não está pronto');
                return false;
            }
            
            try {
                updateSyncStatus('connected', '🔄 Carregando do Drive...');
                
                const fileId = await findOrCreateDriveFile();
                if (!fileId) {
                    console.log('⚠️ Arquivo não encontrado, usando dados locais');
                    loadDataLocal();
                    return false;
                }
                
                // Download data
                const response = await gapi.client.drive.files.get({
                    fileId: fileId,
                    alt: 'media'
                });
                
                if (!response.body) {
                    console.log('⚠️ Arquivo vazio, usando dados locais');
                    return false;
                }
                
                const driveData = JSON.parse(response.body);
                
                // Validate data structure
                if (!driveData.luiza && !driveData.miguel) {
                    console.log('⚠️ Dados inválidos no Drive, usando dados locais');
                    return false;
                }
                
                // Check if drive data is newer
                const driveModified = new Date(driveData.lastModified || 0);
                const localData = loadDataLocal(false);
                const localModified = new Date(localData?.lastModified || 0);
                
                if (driveModified > localModified) {
                    // Use drive data
                    appData = { ...appData, ...driveData };
                    saveDataLocal();
                    
                    // Update UI
                    updateChildSelector();
                    updateDisplay();
                    
                    lastSyncTime = new Date();
                    updateSyncStatus('connected', `✅ Carregado às ${lastSyncTime.toLocaleTimeString()}`);
                    
                    showNotification('Dados carregados do Google Drive', 'success');
                    console.log('✅ Dados carregados do Drive com sucesso');
                    return true;
                } else {
                    // Use local data and sync to drive
                    console.log('ℹ️ Dados locais são mais recentes, sincronizando para o Drive');
                    await syncToDrive();
                    
                    updateSyncStatus('connected', '✅ Dados locais mais recentes');
                    return true;
                }
                
            } catch (error) {
                console.error('❌ Erro ao carregar do Drive:', error);
                updateSyncStatus('connected', '⚠️ Erro ao carregar');
                showNotification('Erro ao carregar do Google Drive', 'error');
                
                // Fallback to local storage
                loadDataLocal();
                return false;
            }
        }
        
        // Force sync now
        async function forceSyncNow() {
            if (isGoogleDriveReady) {
                await syncToDrive();
                showNotification('Sincronização forçada concluída!');
            } else {
                showNotification('Google Drive não conectado', 'error');
            }
        }
        
        // Reset Google Auth
        function resetGoogleAuth() {
            disconnectGoogleDrive();
            setTimeout(() => {
                connectGoogleDrive();
            }, 1000);
        }
        
        // Save data locally (backup)
        function saveDataLocal() {
            try {
                const dataToSave = JSON.stringify(appData);
                localStorage.setItem(STORAGE_KEY, dataToSave);
                console.log('✅ Dados salvos localmente');
                return true;
            } catch (e) {
                console.error('❌ Erro ao salvar localmente:', e);
                return false;
            }
        }
        
        // Load data locally
        function loadDataLocal(showNotification = true) {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const loadedData = JSON.parse(saved);
                    
                    // Merge with default data
                    if (loadedData.luiza) {
                        appData.luiza = {
                            ...appData.luiza,
                            ...loadedData.luiza,
                            activities: loadedData.luiza.activities || appData.luiza.activities
                        };
                    }
                    
                    if (loadedData.miguel) {
                        appData.miguel = {
                            ...appData.miguel,
                            ...loadedData.miguel,
                            activities: loadedData.miguel.activities || appData.miguel.activities
                        };
                    }
                    
                    appData.lastModified = loadedData.lastModified || appData.lastModified;
                    appData.version = loadedData.version || appData.version;
                    
                    console.log('✅ Dados carregados localmente');
                    if (showNotification) {
                        // showNotification('Dados carregados localmente');
                    }
                    return appData;
                }
            } catch (e) {
                console.error('❌ Erro ao carregar localmente:', e);
            }
            return null;
        }
        
        // Main save function (tries Drive first, then local)
        async function saveData() {
            if (isGoogleDriveReady) {
                const success = await syncToDrive();
                if (success) return true;
            }
            
            // Fallback to local storage
            return saveDataLocal();
        }
        
        // Main load function
        async function loadData() {
            if (isGoogleDriveReady) {
                const success = await syncFromDrive();
                if (success) return;
            }
            
            // Fallback to local storage
            loadDataLocal();
        }
        
        // Update datetime
        function updateDateTime() {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            document.getElementById('datetime').textContent = now.toLocaleDateString('pt-BR', options);
        }
        
        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Switch child
        function switchChild(child) {
            currentChild = child;
            document.querySelectorAll('.child-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`[onclick="switchChild('${child}')"]`).classList.add('active');
            
            updateDisplay();
        }
        
        // Switch tab
        function switchTab(tab) {
            currentTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tab}-content`).classList.remove('hidden');
            
            updateDisplay();
        }
        
        // Define saldo inicial
        async function definirSaldoInicial() {
            const saldo = parseInt(document.getElementById('saldo-inicial').value) || 0;
            const data = document.getElementById('data-inicio').value;
            
            if (!data) {
                showNotification('Defina uma data de início!', 'error');
                return;
            }
            
            appData[currentChild].saldoInicial = saldo;
            appData[currentChild].dataInicio = data;
            
            await saveData();
            updateDisplay();
            showNotification('Saldo inicial definido!');
        }
        
        // Calculate total points
        function calculateTotalPoints(child) {
            const childData = appData[child];
            let total = childData.saldoInicial || 0;
            
            const today = new Date().toISOString().split('T')[0];
            childData.todayActivities.forEach(activity => {
                if (activity.date === today) {
                    const multiplier = childData.multipliers[activity.category] || 1;
                    if (activity.category === 'negative' || activity.category === 'grave') {
                        total -= activity.points * multiplier * activity.count;
                    } else {
                        total += activity.points * multiplier * activity.count;
                    }
                }
            });
            
            return Math.max(0, total);
        }
        
        // Adjust activity count
        async function adjustActivityCount(categoryKey, activityId, change) {
            const childData = appData[currentChild];
            const activity = childData.activities[categoryKey].find(a => a.id === activityId);
            
            if (!activity) return;
            
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            let todayActivity = childData.todayActivities.find(a => 
                a.id === activityId && a.date === today
            );
            
            if (!todayActivity) {
                todayActivity = {
                    id: activityId,
                    name: activity.name,
                    points: activity.points,
                    category: categoryKey,
                    count: 0,
                    date: today,
                    time: now.toLocaleTimeString('pt-BR')
                };
                childData.todayActivities.push(todayActivity);
            }
            
            todayActivity.count = Math.max(0, todayActivity.count + change);
            todayActivity.time = now.toLocaleTimeString('pt-BR');
            
            if (todayActivity.count === 0) {
                const index = childData.todayActivities.indexOf(todayActivity);
                childData.todayActivities.splice(index, 1);
            }
            
            await saveData();
            updateDisplay();
            
            const action = change > 0 ? 'adicionada' : 'removida';
            showNotification(`"${activity.name}" ${action}!`);
        }
        
        // Update multipliers
        async function updateMultipliers() {
            const childData = appData[currentChild];
            childData.multipliers.positive = parseInt(document.getElementById('mult-positive').value) || 1;
            childData.multipliers.special = parseInt(document.getElementById('mult-special').value) || 50;
            childData.multipliers.negative = parseInt(document.getElementById('mult-negative').value) || 1;
            childData.multipliers.grave = parseInt(document.getElementById('mult-grave').value) || 100;
            
            await saveData();
            updateDisplay();
            showNotification('Multiplicadores atualizados!');
        }
        
        // Edit activity
        function editActivity(categoryKey, activityId) {
            const activity = appData[currentChild].activities[categoryKey].find(a => a.id === activityId);
            if (!activity) return;
            
            editingActivityId = activityId;
            editingCategory = categoryKey;
            
            document.getElementById('edit-name').value = activity.name;
            document.getElementById('edit-points').value = activity.points;
            document.getElementById('edit-category').value = categoryKey;
            
            document.getElementById('edit-modal').style.display = 'block';
        }
        
        function closeEditModal() {
            document.getElementById('edit-modal').style.display = 'none';
            editingActivityId = null;
            editingCategory = null;
        }
        
        async function saveEditActivity() {
            if (!editingActivityId || !editingCategory) return;
            
            const newName = document.getElementById('edit-name').value.trim();
            const newPoints = parseInt(document.getElementById('edit-points').value) || 1;
            const newCategory = document.getElementById('edit-category').value;
            
            if (!newName) {
                showNotification('Nome é obrigatório!', 'error');
                return;
            }
            
            if (newPoints < 1) {
                showNotification('Pontos devem ser maior que zero!', 'error');
                return;
            }
            
            const childData = appData[currentChild];
            const activityIndex = childData.activities[editingCategory].findIndex(a => a.id === editingActivityId);
            
            if (activityIndex !== -1) {
                const activity = childData.activities[editingCategory][activityIndex];
                const oldName = activity.name;
                
                activity.name = newName;
                activity.points = newPoints;
                
                // Update today's activities with new name and points
                childData.todayActivities.forEach(ta => {
                    if (ta.id === editingActivityId) {
                        ta.name = newName;
                        ta.points = newPoints;
                        if (newCategory !== editingCategory) {
                            ta.category = newCategory;
                        }
                    }
                });
                
                if (newCategory !== editingCategory) {
                    childData.activities[editingCategory].splice(activityIndex, 1);
                    childData.activities[newCategory].push(activity);
                }
                
                await saveData();
                updateDisplay();
                showNotification(`Atividade "${oldName}" atualizada para "${newName}"!`);
            }
            
            closeEditModal();
        }
        
        // Move activity up or down
        async function moveActivity(categoryKey, currentIndex, direction) {
            const childData = appData[currentChild];
            const activities = childData.activities[categoryKey];
            const newIndex = currentIndex + direction;
            
            // Check bounds
            if (newIndex < 0 || newIndex >= activities.length) {
                return;
            }
            
            // Swap activities
            const temp = activities[currentIndex];
            activities[currentIndex] = activities[newIndex];
            activities[newIndex] = temp;
            
            await saveData();
            updateDisplay();
            
            const directionText = direction === -1 ? 'para cima' : 'para baixo';
            showNotification(`Atividade movida ${directionText}!`);
        }
        
        // Delete activity
        async function deleteActivity(categoryKey, activityId) {
            if (!confirm('Excluir esta atividade?')) return;
            
            const childData = appData[currentChild];
            const activityIndex = childData.activities[categoryKey].findIndex(a => a.id === activityId);
            
            if (activityIndex !== -1) {
                const activity = childData.activities[categoryKey][activityIndex];
                childData.activities[categoryKey].splice(activityIndex, 1);
                
                childData.todayActivities = childData.todayActivities.filter(ta => ta.id !== activityId);
                
                await saveData();
                updateDisplay();
                showNotification(`"${activity.name}" excluída!`);
            }
        }
        
        // Add new activity
        function showAddModal(categoryKey) {
            document.getElementById('add-category').value = categoryKey;
            document.getElementById('add-name').value = '';
            document.getElementById('add-points').value = '1';
            document.getElementById('add-modal').style.display = 'block';
        }
        
        function closeAddModal() {
            document.getElementById('add-modal').style.display = 'none';
        }
        
        async function saveNewActivity() {
            const name = document.getElementById('add-name').value.trim();
            const points = parseInt(document.getElementById('add-points').value) || 1;
            
            if (!name) {
                showNotification('Nome é obrigatório!', 'error');
                return;
            }
            
            if (points < 1) {
                showNotification('Pontos devem ser maior que zero!', 'error');
                return;
            }
            
            // Check for duplicate names in the same category
            const childData = appData[currentChild];
            const existingActivity = childData.activities[addingToCategory].find(a => 
                a.name.toLowerCase() === name.toLowerCase()
            );
            
            if (existingActivity) {
                showNotification('Já existe uma atividade com este nome nesta categoria!', 'error');
                return;
            }
            
            const newActivity = {
                id: Date.now().toString(),
                name: name,
                points: points
            };
            
            childData.activities[addingToCategory].push(newActivity);
            
            await saveData();
            updateDisplay();
            showNotification(`"${name}" adicionada com sucesso!`);
            
            closeAddModal();
        }
        
        // Export/Import
        function exportData() {
            const dataStr = JSON.stringify(appData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sistema-pontos-backup.json';
            link.click();
            URL.revokeObjectURL(url);
            showNotification('Dados exportados!');
        }
        
        function importData() {
            document.getElementById('import-file').click();
        }
        
        async function handleImport(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    appData = { ...appData, ...importedData };
                    await saveData();
                    updateDisplay();
                    showNotification('Dados importados!');
                } catch (error) {
                    showNotification('Erro ao importar!', 'error');
                }
            };
            reader.readAsText(file);
        }
        
        function debugStorage() {
            console.log('=== DEBUG ===');
            console.log('appData:', appData);
            console.log('localStorage:', localStorage.getItem(STORAGE_KEY));
            console.log('Google Drive Ready:', isGoogleDriveReady);
            console.log('Google Drive File ID:', googleDriveFileId);
            showNotification('Debug executado - veja o console');
        }
        
        async function clearAllData() {
            if (confirm('Apagar todos os dados?')) {
                localStorage.removeItem(STORAGE_KEY);
                
                // Also try to clear from Google Drive
                if (isGoogleDriveReady && googleDriveFileId) {
                    try {
                        await gapi.client.drive.files.delete({
                            fileId: googleDriveFileId
                        });
                        googleDriveFileId = null;
                    } catch (error) {
                        console.error('Erro ao deletar do Drive:', error);
                    }
                }
                
                location.reload();
            }
        }
        
        // Update display
        function updateDisplay() {
            const childData = appData[currentChild];
            
            // Update form fields
            document.getElementById('saldo-inicial').value = childData.saldoInicial || '';
            document.getElementById('data-inicio').value = childData.dataInicio || '';
            
            // Update saldo info
            if (childData.saldoInicial && childData.dataInicio) {
                document.getElementById('info-saldo').textContent = `${childData.saldoInicial} pontos`;
                document.getElementById('info-data').textContent = childData.dataInicio;
                
                const startDate = new Date(childData.dataInicio);
                const today = new Date();
                const diffTime = Math.abs(today - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                document.getElementById('info-dias').textContent = `${diffDays} dias`;
            } else {
                document.getElementById('info-saldo').textContent = 'Não definido';
                document.getElementById('info-data').textContent = 'Não definida';
                document.getElementById('info-dias').textContent = '0 dias';
            }
            
            // Update multiplier inputs
            document.getElementById('mult-positive').value = childData.multipliers.positive;
            document.getElementById('mult-special').value = childData.multipliers.special;
            document.getElementById('mult-negative').value = childData.multipliers.negative;
            document.getElementById('mult-grave').value = childData.multipliers.grave;
            
            // Update stats
            const totalPoints = calculateTotalPoints(currentChild);
            document.getElementById('total-points').textContent = totalPoints;
            document.getElementById('available-balance').textContent = `R$ ${(totalPoints * 0.01).toFixed(2)}`;
            
            // Calculate month points
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            let monthPoints = 0;
            
            childData.todayActivities.forEach(activity => {
                const activityDate = new Date(activity.date);
                if (activityDate >= monthStart) {
                    const multiplier = childData.multipliers[activity.category] || 1;
                    if (activity.category === 'negative' || activity.category === 'grave') {
                        monthPoints -= activity.points * multiplier * activity.count;
                    } else {
                        monthPoints += activity.points * multiplier * activity.count;
                    }
                }
            });
            
            document.getElementById('month-points').textContent = monthPoints;
            
            // Update categories
            updateCategories();
            
            // Update today's activities
            updateTodayActivities();
        }
        
        // Update categories
        function updateCategories() {
            const container = document.getElementById('categories-container');
            if (!container) return;
            
            const childData = appData[currentChild];
            
            const categories = {
                positive: { title: '✅ Positivos', class: 'positive', multiplier: childData.multipliers.positive },
                special: { title: '⭐ Especiais', class: 'special', multiplier: childData.multipliers.special },
                negative: { title: '⚠️ Negativos', class: 'negative', multiplier: childData.multipliers.negative },
                grave: { title: '🚨 Graves', class: 'grave', multiplier: childData.multipliers.grave }
            };
            
            container.innerHTML = '';
            
            Object.keys(categories).forEach(categoryKey => {
                const category = categories[categoryKey];
                const activities = childData.activities[categoryKey] || [];
                
                const categoryDiv = document.createElement('div');
                categoryDiv.className = `category-card ${category.class}`;
                
                const activitiesHtml = activities.map(activity => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayCount = childData.todayActivities
                        .filter(ta => ta.id === activity.id && ta.date === today)
                        .reduce((sum, ta) => sum + ta.count, 0);
                    
                    const finalPoints = activity.points * category.multiplier;
                    const sign = categoryKey === 'negative' || categoryKey === 'grave' ? '-' : '+';
                    
                    return `
                        <div class="activity-item">
                            <div class="drag-handle">⋮⋮</div>
                            <div class="activity-content">
                                <div class="activity-name">${activity.name}</div>
                                <div class="activity-controls">
                                    <div class="activity-counter">
                                        <button class="counter-btn" onclick="adjustActivityCount('${categoryKey}', '${activity.id}', -1)">-</button>
                                        <div class="counter-display">${todayCount}</div>
                                        <button class="counter-btn" onclick="adjustActivityCount('${categoryKey}', '${activity.id}', 1)">+</button>
                                    </div>
                                    <div class="activity-actions">
                                        <button class="move-btn" onclick="moveActivity('${categoryKey}', ${index}, -1)" title="Mover para cima">⬆️</button>
                                        <button class="move-btn" onclick="moveActivity('${categoryKey}', ${index}, 1)" title="Mover para baixo">⬇️</button>
                                        <button class="edit-btn" onclick="editActivity('${categoryKey}', '${activity.id}')">✏️</button>
                                        <button class="delete-btn" onclick="deleteActivity('${categoryKey}', '${activity.id}')">🗑️</button>
                                    </div>
                                    <div class="activity-points">${sign}${finalPoints}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                categoryDiv.innerHTML = `
                    <div class="category-header">
                        <div class="category-title">${category.title}</div>
                        <div class="category-multiplier">x${category.multiplier}</div>
                    </div>
                    <div class="activity-list">
                        ${activitiesHtml}
                    </div>
                    <button class="btn-add" onclick="showAddModal('${categoryKey}')">+ Adicionar Atividade</button>
                `;
                
                container.appendChild(categoryDiv);
            });
        }
        
        // Update today's activities
        function updateTodayActivities() {
            const container = document.getElementById('today-activities');
            const childData = appData[currentChild];
            const today = new Date().toISOString().split('T')[0];
            const todayActivities = childData.todayActivities.filter(a => a.date === today);
            
            if (todayActivities.length === 0) {
                container.innerHTML = '<p>Nenhuma atividade registrada hoje</p>';
                return;
            }
            
            container.innerHTML = todayActivities.map(activity => {
                const multiplier = childData.multipliers[activity.category] || 1;
                const finalPoints = activity.points * multiplier * activity.count;
                const sign = activity.category === 'negative' || activity.category === 'grave' ? '-' : '+';
                
                return `
                    <div class="today-activity">
                        <div>
                            <strong>${activity.name}</strong> (${activity.count}x)
                            <div class="activity-time">${activity.time}</div>
                        </div>
                        <div>
                            <span>${sign}${finalPoints} pontos</span>
                            <button class="remove-today-btn" onclick="removeTodayActivity('${activity.id}')">Remover</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Remove today activity
        async function removeTodayActivity(activityId) {
            const childData = appData[currentChild];
            const today = new Date().toISOString().split('T')[0];
            
            childData.todayActivities = childData.todayActivities.filter(a => 
                !(a.id === activityId && a.date === today)
            );
            
            await saveData();
            updateDisplay();
            showNotification('Atividade removida!');
        }
               // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 DOM carregado, inicializando...');
            
            // Load data first
            loadDataLocal();
            
            // Initialize UI
            updateChildSelector();
            updateDisplay();
            
            // Initialize Google Drive when ready
            updateSyncStatus('disconnected', '🔄 Carregando Google Drive...');
            
            // Wait for gapi to be available
            function waitForGapi() {
                if (typeof gapi !== 'undefined') {
                    console.log('✅ GAPI disponível, inicializando...');
                    initializeGoogleDrive();
                } else {
                    console.log('⏳ Aguardando GAPI...');
                    setTimeout(waitForGapi, 500);
                }
            }
            
            // Start waiting for gapi
            setTimeout(waitForGapi, 1000);
            
            console.log('✅ Sistema inicializado');
        });
        
        // Auto-sync every 2 minutes if connected
        setInterval(async () => {
            if (isGoogleDriveReady) {
                await syncToDrive();
            }
        }, 120000);
        
        // Save before unload
        window.addEventListener('beforeunload', async () => {
            await saveData();
        });
        
        // Update datetime every second
        setInterval(updateDateTime, 1000);
        updateDateTime();
        
        console.log('✅ SISTEMA COM GOOGLE DRIVE INICIADO!');
        
        // Modal close on outside click
        window.addEventListener('click', function(event) {
            const editModal = document.getElementById('edit-modal');
            const addModal = document.getElementById('add-modal');
            
            if (event.target === editModal) {
                closeEditModal();
            }
            if (event.target === addModal) {
                closeAddModal();
            }
        });
