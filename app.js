// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
const STORAGE_PREFIX = 'assessment_'; // Prefixo seguro para dados
const STORAGE_KEYS = {
    appState: STORAGE_PREFIX + 'state',
    userData: STORAGE_PREFIX + 'user',
    analysisResults: STORAGE_PREFIX + 'results',
    lastSaved: STORAGE_PREFIX + 'timestamp'
};

const AppState = {
    currentScreen: 'welcome-screen',
    currentPhotoStep: 0,
    photos: {
        front: null,
        back: null,
        sideLeft: null,
        sideRight: null
    },
    userData: {},
    analysisResults: null
};

const PHOTO_STEPS = [
    {
        id: 'front',
        title: 'Vista Frontal',
        instructions: 'Posicione-se de frente para a câmera com os braços levemente afastados do corpo',
        stepElement: 'step-front'
    },
    {
        id: 'back',
        title: 'Vista de Costas',
        instructions: 'Vire de costas para a câmera mantendo a mesma postura',
        stepElement: 'step-back'
    },
    {
        id: 'sideLeft',
        title: 'Vista Lateral Esquerda',
        instructions: 'Posicione-se de lado esquerdo (perfil esquerdo) para a câmera',
        stepElement: 'step-side-left'
    },
    {
        id: 'sideRight',
        title: 'Vista Lateral Direita',
        instructions: 'Posicione-se de lado direito (perfil direito) para a câmera',
        stepElement: 'step-side-right'
    }
];

// ==========================================
// VALIDAÇÕES DE ENTRADA
// ==========================================

/**
 * Valida dados do usuário
 * @returns {Object} {valid: boolean, errors: string[]}
 */
function validateUserData() {
    const errors = [];
    
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    
    if (!height || isNaN(height) || height < 100 || height > 250) {
        errors.push('⚠️ Altura deve estar entre 100-250cm');
    }
    
    if (!weight || isNaN(weight) || weight < 30 || weight > 300) {
        errors.push('⚠️ Peso deve estar entre 30-300kg');
    }
    
    if (!age || isNaN(age) || age < 13 || age > 120) {
        errors.push('⚠️ Idade deve estar entre 13-120 anos');
    }
    
    if (!gender || !['male', 'female'].includes(gender)) {
        errors.push('⚠️ Selecione um gênero válido');
    }
    
    // Verificar se todas as fotos foram capturadas
    if (!AppState.photos.front || !AppState.photos.back || 
        !AppState.photos.sideLeft || !AppState.photos.sideRight) {
        errors.push('⚠️ Todas as 4 fotos são obrigatórias');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Valida arquivo de foto
 * @param {File} file - Arquivo de imagem
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePhotoFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!file) {
        return { valid: false, error: 'Nenhuma imagem selecionada' };
    }
    
    if (!validTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: `⚠️ Formato inválido. Use JPEG, PNG ou WebP (recebido: ${file.type})` 
        };
    }
    
    if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        return { 
            valid: false, 
            error: `⚠️ Imagem muito grande (${sizeMB}MB). Máximo: 5MB` 
        };
    }
    
    return { valid: true };
}

/**
 * Mostra mensagem de erro na tela
 * @param {string} message - Mensagem a exibir
 */
function showErrorMessage(message) {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        errorContainer.innerHTML = `<div class="error-alert">❌ ${message}</div>`;
        errorContainer.style.display = 'block';
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
}

/**
 * Mostra mensagens de múltiplos erros
 * @param {string[]} errors - Array de mensagens
 */
function showErrorMessages(errors) {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        const html = '<div class="error-alert">' + 
                     errors.map(e => `<div>• ${e}</div>`).join('') + 
                     '</div>';
        errorContainer.innerHTML = html;
        errorContainer.style.display = 'block';
        
        // Auto-hide após 7 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 7000);
    }
}

/**
 * Mostra mensagem de sucesso
 * @param {string} message - Mensagem a exibir
 */
function showSuccessMessage(message) {
    const successContainer = document.getElementById('success-message');
    if (successContainer) {
        successContainer.innerHTML = `<div class="success-alert">✅ ${message}</div>`;
        successContainer.style.display = 'block';
        
        // Auto-hide após 3 segundos
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 3000);
    }
}

// ==========================================
// SINCRONIZAÇÃO DOM ↔️ APPSTATE - FASE 2
// ==========================================

/**
 * Sincroniza dados do DOM para AppState
 * @param {Object} source - Dados a sincronizar
 * @param {Object} target - AppState ou userData
 */
function syncDOMToState(source, target) {
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined && source[key] !== null) {
            target[key] = source[key];
        }
    });
}

/**
 * Sincroniza dados do AppState para DOM
 * @param {Object} state - Dados do AppState
 * @param {string[]} fields - Campos a sincronizar
 */
function syncStateToDOM(state, fields) {
    fields.forEach(fieldName => {
        const element = document.getElementById(`input-${fieldName}`);
        if (element && state[fieldName] !== undefined) {
            if (element.type === 'radio' || element.type === 'checkbox') {
                document.querySelector(`input[name="${fieldName}"][value="${state[fieldName]}"]`).checked = true;
            } else {
                element.value = state[fieldName];
            }
        }
    });
}

/**
 * Sincroniza todos os dados do formulário complementar para AppState
 */
function syncFormToState() {
    const formData = {
        weight: parseFloat(document.getElementById('input-weight').value),
        height: parseInt(document.getElementById('input-height').value),
        age: parseInt(document.getElementById('input-age').value),
        gender: document.querySelector('input[name="gender"]:checked')?.value || '',
        activityLevel: document.getElementById('input-activity')?.value || '',
        goal: document.getElementById('input-goal')?.value || ''
    };
    
    syncDOMToState(formData, AppState.userData);
}

// ==========================================
// STORAGE SEGURO - FASE 2
// ==========================================

/**
 * Salva dados no localStorage (apenas dados, não fotos em base64)
 * Fotos em base64 são muito grandes, então salvamos apenas metadados
 */
function saveAssessmentData() {
    try {
        const dataToSave = {
            currentScreen: AppState.currentScreen,
            currentPhotoStep: AppState.currentPhotoStep,
            photosCaptured: {
                front: AppState.photos.front !== null,
                back: AppState.photos.back !== null,
                sideLeft: AppState.photos.sideLeft !== null,
                sideRight: AppState.photos.sideRight !== null
            },
            userData: AppState.userData,
            analysisResults: AppState.analysisResults,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_KEYS.lastSaved, new Date().getTime().toString());
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Carrega dados do localStorage
 */
function loadAssessmentData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEYS.appState);
        if (!savedData) return { success: false, data: null };
        
        const data = JSON.parse(savedData);
        const lastSaved = localStorage.getItem(STORAGE_KEYS.lastSaved);
        
        // Restaurar state (exceto fotos em base64, que serão null)
        AppState.currentScreen = data.currentScreen || 'welcome-screen';
        AppState.currentPhotoStep = data.currentPhotoStep || 0;
        AppState.userData = data.userData || {};
        AppState.analysisResults = data.analysisResults || null;
        
        return {
            success: true,
            data: data,
            lastSaved: lastSaved ? new Date(parseInt(lastSaved)).toLocaleString('pt-BR') : 'Desconhecido'
        };
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limpa dados do localStorage (após completar avaliação ou reiniciar)
 */
function clearAssessmentData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Recupera avaliação anterior (se houver)
 * Mostra aviso ao usuário se dados foram restaurados
 */
function recoverPreviousAssessment() {
    const loadResult = loadAssessmentData();
    if (loadResult.success && loadResult.data) {
        showSuccessMessage(`📋 Avaliação anterior recuperada (${loadResult.lastSaved})`);
        return true;
    }
    return false;
}

// ==========================================
// NAVEGAÇÃO ENTRE TELAS
// ==========================================
function goToScreen(screenId) {
    // Remover classe active de todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Adicionar classe active na tela destino
    document.getElementById(screenId).classList.add('active');
    AppState.currentScreen = screenId;

    // Scroll para o topo
    window.scrollTo(0, 0);
}

function startAssessment() {
    AppState.currentPhotoStep = 0;
    resetPhotoCapture();
    goToScreen('photo-capture-screen');
}

function restartAssessment() {
    // Reset completo
    AppState.currentPhotoStep = 0;
    AppState.photos = { front: null, back: null, sideLeft: null, sideRight: null };
    AppState.userData = {};
    AppState.analysisResults = null;

    // Limpar dados do storage - FASE 2
    clearAssessmentData();

    goToScreen('welcome-screen');
}

// ==========================================
// CAPTURA DE FOTOS
// ==========================================
function resetPhotoCapture() {
    updatePhotoStep();
}

function updatePhotoStep() {
    const step = PHOTO_STEPS[AppState.currentPhotoStep];

    // Atualizar título e instruções
    document.getElementById('current-view-title').textContent = step.title;
    document.getElementById('current-view-instructions').textContent = step.instructions;

    // Atualizar indicadores visuais de progresso
    PHOTO_STEPS.forEach((s, index) => {
        const stepEl = document.getElementById(s.stepElement);
        stepEl.classList.remove('active', 'completed');

        if (index < AppState.currentPhotoStep) {
            stepEl.classList.add('completed');
        } else if (index === AppState.currentPhotoStep) {
            stepEl.classList.add('active');
        }
    });

    // Limpar preview
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('btn-capture').classList.remove('hidden');
    document.getElementById('btn-next-photo').classList.add('hidden');
}

function triggerPhotoCapture() {
    document.getElementById('photo-input').click();
}

function handlePhotoCapture(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const photoData = e.target.result;
        const currentStep = PHOTO_STEPS[AppState.currentPhotoStep].id;

        // Salvar foto no estado
        AppState.photos[currentStep] = photoData;

        // Mostrar preview
        const preview = document.getElementById('photo-preview');
        preview.src = photoData;
        preview.classList.remove('hidden');

        // Esconder botão de captura, mostrar próximo
        document.getElementById('btn-capture').classList.add('hidden');
        document.getElementById('btn-next-photo').classList.remove('hidden');
    };

    reader.readAsDataURL(file);
}

function nextPhoto() {
    AppState.currentPhotoStep++;

    if (AppState.currentPhotoStep < PHOTO_STEPS.length) {
        updatePhotoStep();
    } else {
        // Todas as fotos capturadas, ir para formulário
        showDataForm();
    }
}

function showDataForm() {
    // Preencher thumbnails
    document.getElementById('thumb-front-img').src = AppState.photos.front;
    document.getElementById('thumb-back-img').src = AppState.photos.back;
    document.getElementById('thumb-side-left-img').src = AppState.photos.sideLeft;
    document.getElementById('thumb-side-right-img').src = AppState.photos.sideRight;

    goToScreen('data-form-screen');
}

// ==========================================
// FORMULÁRIO DE DADOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complementary-data-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Sincronizar dados do DOM para AppState - FASE 2
        syncFormToState();

        // VALIDAÇÃO - FASE 1
        const validation = validateUserData();
        if (!validation.valid) {
            showErrorMessages(validation.errors);
            return;
        }

        // Salvar dados antes de processar - FASE 2
        const saveResult = saveAssessmentData();
        if (!saveResult.success) {
            console.warn('Aviso: Dados não foram salvos localmente');
        }

        // Simular análise (mostrar loading e depois resultados)
        showLoadingAndAnalyze();
    });
    
    // Tentar recuperar avaliação anterior - FASE 2
    recoverPreviousAssessment();
    
    // Setup para captura de fotos com validação - FASE 1
    setupPhotoCapture();
});

/**
 * Setup de captura de fotos com validação
 */
function setupPhotoCapture() {
    const photoInput = document.getElementById('photo-input');
    
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) return;
            
            // VALIDAÇÃO - FASE 1
            const validation = validatePhotoFile(file);
            if (!validation.valid) {
                showErrorMessage(validation.error);
                this.value = ''; // Limpar input
                return;
            }
            
            // Processar foto válida
            const reader = new FileReader();
            reader.onload = function(event) {
                const photoId = PHOTO_STEPS[AppState.currentPhotoStep].id;
                AppState.photos[photoId] = event.target.result;
                
                // Feedback visual
                showSuccessMessage(`✓ Foto ${AppState.currentPhotoStep + 1}/4 capturada com sucesso!`);
                updatePhotoIndicator(AppState.currentPhotoStep, true);
                
                // Avançar para próxima foto
                setTimeout(() => {
                    AppState.currentPhotoStep++;
                    if (AppState.currentPhotoStep < PHOTO_STEPS.length) {
                        updatePhotoStep();
                    } else {
                        // Todas as fotos capturadas
                        showSuccessMessage('🎉 Todas as fotos foram capturadas!');
                        goToScreen('complementary-data-screen');
                    }
                }, 1000);
            };
            
            reader.onerror = function() {
                showErrorMessage('❌ Erro ao ler arquivo. Tente novamente.');
            };
            
            reader.readAsDataURL(file);
            
            // Limpar input para permitir selecionar mesmo arquivo novamente
            this.value = '';
        });
    }
}

/**
 * Atualizar indicador visual de foto capturada
 */
function updatePhotoIndicator(photoIndex, captured) {
    const step = PHOTO_STEPS[photoIndex];
    const stepEl = document.getElementById(step.stepElement);
    
    if (stepEl) {
        if (captured) {
            stepEl.classList.add('completed');
        }
    }
}

function showLoadingAndAnalyze() {
    // Simulação de processamento
    // Em produção, aqui seria uma chamada à API de análise

    setTimeout(() => {
        generateAnalysisResults();
        showResults();
    }, 2000);
}

// ==========================================
// GERAÇÃO DE RESULTADOS (MOCK)
// ==========================================
function generateAnalysisResults() {
    const { weight, height, age, gender } = AppState.userData;

    // Cálculo de IMC
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    // Estimativa de % gordura (fórmula simplificada)
    let bodyFat;
    if (gender === 'male') {
        bodyFat = (1.20 * bmi + 0.23 * age - 16.2).toFixed(1);
    } else {
        bodyFat = (1.20 * bmi + 0.23 * age - 5.4).toFixed(1);
    }

    // Peso ideal (fórmula de Devine)
    let idealWeight;
    if (gender === 'male') {
        idealWeight = (50 + 2.3 * ((height / 2.54) - 60)).toFixed(1);
    } else {
        idealWeight = (45.5 + 2.3 * ((height / 2.54) - 60)).toFixed(1);
    }

    // Massa muscular estimada
    const muscleMass = ((weight * (100 - bodyFat)) / 100).toFixed(1);
    const fatMass = (weight - muscleMass).toFixed(1);
    const otherMass = (weight * 0.15).toFixed(1); // ossos, órgãos, etc

    // Determinar tipo corporal (simplificado)
    let bodyType, bodyTypeDesc;
    if (bmi < 18.5) {
        bodyType = 'Ectomorfo';
        bodyTypeDesc = 'Tendência a ser magro com metabolismo acelerado. Dificuldade para ganhar peso.';
    } else if (bmi >= 18.5 && bmi < 25 && bodyFat < 20) {
        bodyType = 'Mesomorfo';
        bodyTypeDesc = 'Corpo atlético com facilidade para ganhar músculo. Estrutura óssea média.';
    } else {
        bodyType = 'Endomorfo';
        bodyTypeDesc = 'Tendência a acumular gordura com mais facilidade. Metabolismo mais lento.';
    }

    // Recomendações
    const recommendations = [];

    if (bodyFat > 25) {
        recommendations.push('🔥 Foco em treinos cardiovasculares para redução de gordura');
    }
    if (bodyFat < 15) {
        recommendations.push('💪 Priorize treinos de força e hipertrofia');
    }
    if (bmi < 18.5) {
        recommendations.push('🍽️ Aumente a ingestão calórica com alimentos nutritivos');
    }
    if (bmi > 25) {
        recommendations.push('📊 Considere um déficit calórico moderado aliado a exercícios');
    }

    recommendations.push('💧 Mantenha-se bem hidratado (2-3L de água por dia)');
    recommendations.push('😴 Durma 7-9 horas por noite para melhor recuperação');

    AppState.analysisResults = {
        bmi,
        bodyFat,
        idealWeight,
        muscleMass,
        fatMass,
        otherMass,
        bodyType,
        bodyTypeDesc,
        recommendations
    };
}

// ==========================================
// EXIBIÇÃO DE RESULTADOS
// ==========================================
function showResults() {
    const results = AppState.analysisResults;
    const userData = AppState.userData;

    // Data da análise
    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('analysis-date').textContent = `Análise realizada em ${today}`;

    // Foto de perfil (usar foto frontal)
    document.getElementById('profile-img').src = AppState.photos.front;

    // Info básica
    document.getElementById('user-basic-info').textContent =
        `${userData.age} anos • ${userData.height}cm • ${userData.weight}kg`;

    // Métricas principais
    document.getElementById('metric-bodyfat').textContent = `${results.bodyFat}%`;
    document.getElementById('metric-bmi').textContent = results.bmi;
    document.getElementById('metric-ideal-weight').textContent = `${results.idealWeight}kg`;

    // Tipo corporal
    document.getElementById('body-type-name').textContent = results.bodyType;
    document.getElementById('body-type-description').textContent = results.bodyTypeDesc;

    // Determinar ícone do tipo corporal
    const typeIcons = {
        'Ectomorfo': '🏃',
        'Mesomorfo': '💪',
        'Endomorfo': '🏋️'
    };
    document.getElementById('body-type-icon').textContent = typeIcons[results.bodyType] || '💪';

    // Atualizar legenda do gráfico
    document.getElementById('legend-muscle').textContent = `${results.muscleMass}kg (${((results.muscleMass / userData.weight) * 100).toFixed(1)}%)`;
    document.getElementById('legend-fat').textContent = `${results.fatMass}kg (${results.bodyFat}%)`;
    document.getElementById('legend-other').textContent = `${results.otherMass}kg (${((results.otherMass / userData.weight) * 100).toFixed(1)}%)`;

    // Gerar gráfico de composição
    drawCompositionChart(results.muscleMass, results.fatMass, results.otherMass);

    // Recomendações
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = '';
    results.recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.innerHTML = `<span style="flex-shrink:0;">✓</span><span>${rec}</span>`;
        recList.appendChild(div);
    });

    goToScreen('results-screen');
}

// ==========================================
// GRÁFICO DE COMPOSIÇÃO CORPORAL
// ==========================================
function drawCompositionChart(muscle, fat, other) {
    const canvas = document.getElementById('composition-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 250;
    canvas.height = 250;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    const total = parseFloat(muscle) + parseFloat(fat) + parseFloat(other);
    const muscleAngle = (muscle / total) * 2 * Math.PI;
    const fatAngle = (fat / total) * 2 * Math.PI;
    const otherAngle = (other / total) * 2 * Math.PI;

    let currentAngle = -Math.PI / 2; // Start at top

    // Muscle segment
    ctx.beginPath();
    ctx.fillStyle = '#8B5CF6';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + muscleAngle);
    ctx.closePath();
    ctx.fill();

    currentAngle += muscleAngle;

    // Fat segment
    ctx.beginPath();
    ctx.fillStyle = '#F59E0B';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + fatAngle);
    ctx.closePath();
    ctx.fill();

    currentAngle += fatAngle;

    // Other segment
    ctx.beginPath();
    ctx.fillStyle = '#10B981';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + otherAngle);
    ctx.closePath();
    ctx.fill();

    // Inner circle (donut effect)
    ctx.beginPath();
    ctx.fillStyle = '#1E293B';
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();
}

// ==========================================
// PLANO DE TREINO
// ==========================================
function generateWorkoutPlan() {
    const results = AppState.analysisResults;
    const userData = AppState.userData;

    let planTitle, planSubtitle, planContent;

    // Determinar tipo de plano baseado no objetivo e composição
    if (results.bodyFat > 25) {
        planTitle = 'Plano Emagrecimento + Tonificação';
        planSubtitle = 'Foco em redução de gordura corporal com preservação muscular';
        planContent = `
            <h4>🔥 Treino A - Segunda/Quinta</h4>
            <ul>
                <li>Aquecimento: 10min esteira (caminhada rápida)</li>
                <li>Agachamento livre: 3x12</li>
                <li>Supino reto: 3x12</li>
                <li>Remada curvada: 3x12</li>
                <li>Cardio final: 20min (HIIT)</li>
            </ul>
            
            <h4>💪 Treino B - Terça/Sexta</h4>
            <ul>
                <li>Aquecimento: 10min bike</li>
                <li>Leg press: 3x15</li>
                <li>Desenvolvimento: 3x12</li>
                <li>Pulldown: 3x12</li>
                <li>Cardio final: 20min (moderado)</li>
            </ul>
            
            <p style="margin-top: 16px; color: var(--text-secondary); font-size: 0.875rem;">
                <strong>Nota:</strong> Esta é uma prévia. O plano completo inclui progressão, periodização e ajustes personalizados.
            </p>
        `;
    } else {
        planTitle = 'Plano Hipertrofia';
        planSubtitle = 'Foco em ganho de massa muscular';
        planContent = `
            <h4>💪 Treino A - Peito/Tríceps</h4>
            <ul>
                <li>Supino reto: 4x8-10</li>
                <li>Supino inclinado: 3x10-12</li>
                <li>Crucifixo: 3x12</li>
                <li>Tríceps testa: 3x10</li>
                <li>Tríceps corda: 3x12</li>
            </ul>
            
            <h4>🏋️ Treino B - Costas/Bíceps</h4>
            <ul>
                <li>Barra fixa: 4x máx</li>
                <li>Remada baixa: 4x10</li>
                <li>Pulldown: 3x12</li>
                <li>Rosca direta: 4x10</li>
                <li>Rosca martelo: 3x12</li>
            </ul>
            
            <p style="margin-top: 16px; color: var(--text-secondary); font-size: 0.875rem;">
                <strong>Nota:</strong> Esta é uma prévia. O plano completo inclui treino de pernas, ombros e abdômen.
            </p>
        `;
    }

    document.getElementById('plan-title').textContent = planTitle;
    document.getElementById('plan-subtitle').textContent = planSubtitle;
    document.getElementById('plan-content').innerHTML = planContent;

    goToScreen('workout-plan-screen');
}

// ==========================================
// COMPARTILHAMENTO
// ==========================================
function shareResults() {
    const results = AppState.analysisResults;
    const userData = AppState.userData;

    const shareText = `
📊 Minha Análise Corporal

• % Gordura: ${results.bodyFat}%
• IMC: ${results.bmi}
• Peso: ${userData.weight}kg
• Tipo Físico: ${results.bodyType}

Análise feita com Avaliação Física Inteligente
    `.trim();

    if (navigator.share) {
        navigator.share({
            title: 'Minha Análise Corporal',
            text: shareText
        }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('✓ Resultados copiados para a área de transferência!');
        });
    }
}

// ==========================================
// INTEGRAÇÃO API (PLACEHOLDER)
// ==========================================
/**
 * Objeto de integração para uso em outros apps
 * Permite usar este módulo de forma independente ou integrada
 */
window.BodyAssessment = {
    /**
     * Iniciar avaliação programaticamente
     */
    start: () => {
        startAssessment();
    },

    /**
     * Obter resultados da última avaliação
     */
    getResults: () => {
        return {
            photos: AppState.photos,
            userData: AppState.userData,
            analysis: AppState.analysisResults
        };
    },

    /**
     * Definir callback para quando avaliação for concluída
     */
    onComplete: null,

    /**
     * Versão da API
     */
    version: '1.0.0'
};

// Disparar callback quando análise for concluída
function notifyCompletion() {
    if (window.BodyAssessment.onComplete && typeof window.BodyAssessment.onComplete === 'function') {
        window.BodyAssessment.onComplete(window.BodyAssessment.getResults());
    }
}
