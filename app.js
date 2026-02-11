// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
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
    AppState.photos = { front: null, back: null, side: null };
    AppState.userData = {};
    AppState.analysisResults = null;

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

        // Coletar dados do formulário
        AppState.userData = {
            weight: parseFloat(document.getElementById('input-weight').value),
            height: parseInt(document.getElementById('input-height').value),
            age: parseInt(document.getElementById('input-age').value),
            gender: document.querySelector('input[name="gender"]:checked').value,
            activityLevel: document.getElementById('input-activity').value,
            goal: document.getElementById('input-goal').value
        };

        // Simular análise (mostrar loading e depois resultados)
        showLoadingAndAnalyze();
    });
});

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
