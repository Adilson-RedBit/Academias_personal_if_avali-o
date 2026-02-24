# 🔌 Guia de Integração - API Body Assessment

Este documento explica como integrar o módulo de Avaliação Física em aplicações existentes.

## 📋 Visão Geral

O módulo expõe uma API JavaScript global (`window.BodyAssessment`) que permite:
- Iniciar avaliações programaticamente
- Capturar resultados via callbacks
- Integrar com sistemas de autenticação
- Personalizar fluxo e interface

## 🚀 Integração Básica

### 1. Incluir os Arquivos

```html
<!-- No seu HTML principal -->
<link rel="stylesheet" href="path/to/body-assessment-mvp/styles.css">
<script src="path/to/body-assessment-mvp/app.js"></script>

<!-- Container onde o módulo será renderizado -->
<div id="assessment-container"></div>
```

### 2. Iniciar Avaliação

```javascript
// Iniciar avaliação quando usuário clicar em um botão
document.getElementById('btn-start-assessment').addEventListener('click', () => {
    window.BodyAssessment.start();
});
```

### 3. Capturar Resultados

```javascript
// Definir callback para quando avaliação for concluída
window.BodyAssessment.onComplete = (data) => {
    console.log('Avaliação concluída:', data);
    
    // Salvar no seu backend
    saveToBackend(data);
    
    // Atualizar interface do app principal
    updateUserProfile(data.analysis);
};

function saveToBackend(assessmentData) {
    fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: getCurrentUserId(),
            photos: assessmentData.photos,
            userData: assessmentData.userData,
            analysis: assessmentData.analysis,
            timestamp: new Date().toISOString()
        })
    });
}
```

## 🎨 Integração Visual

### Opção 1: Modal/Overlay

```javascript
function openAssessmentModal() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'assessment-overlay';
    overlay.innerHTML = `
        <div class="app-container">
            <!-- O conteúdo do módulo será inserido aqui -->
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Iniciar avaliação
    window.BodyAssessment.start();
    
    // Remover overlay quando concluir
    window.BodyAssessment.onComplete = (data) => {
        handleResults(data);
        document.body.removeChild(overlay);
    };
}
```

### Opção 2: Página Dedicada

```html
<!-- assessment.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>Avaliação Física</title>
    <link rel="stylesheet" href="body-assessment-mvp/styles.css">
</head>
<body>
    <!-- O módulo renderiza automaticamente -->
    <script src="body-assessment-mvp/app.js"></script>
    <script>
        // Redirecionar para dashboard após conclusão
        window.BodyAssessment.onComplete = (data) => {
            saveAndRedirect(data);
        };
        
        function saveAndRedirect(data) {
            localStorage.setItem('lastAssessment', JSON.stringify(data));
            window.location.href = '/dashboard';
        }
    </script>
</body>
</html>
```

### Opção 3: Componente Inline

```javascript
// No seu app React/Vue/Angular
function AssessmentComponent() {
    useEffect(() => {
        // Carregar scripts do módulo
        const script = document.createElement('script');
        script.src = 'body-assessment-mvp/app.js';
        document.body.appendChild(script);
        
        // Configurar callback
        script.onload = () => {
            window.BodyAssessment.onComplete = handleComplete;
        };
        
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    
    return <div id="assessment-root"></div>;
}
```

## 💾 Estrutura de Dados

### Objeto Retornado no Callback

```javascript
{
    photos: {
        front: "data:image/jpeg;base64,...",  // Foto frontal (base64)
        back: "data:image/jpeg;base64,...",   // Foto costas (base64)
        side: "data:image/jpeg;base64,..."    // Foto lateral (base64)
    },
    userData: {
        weight: 75.5,               // kg
        height: 175,                // cm
        age: 30,                    // anos
        gender: "male",             // "male" ou "female"
        activityLevel: "moderate",  // sedentary/light/moderate/very/extra
        goal: "muscle-gain"         // weight-loss/muscle-gain/maintenance/performance/health
    },
    analysis: {
        bmi: "24.7",                // Índice de Massa Corporal
        bodyFat: "18.5",            // % de gordura corporal
        idealWeight: "72.3",        // kg
        muscleMass: "61.5",         // kg
        fatMass: "14.0",            // kg
        otherMass: "11.3",          // kg (ossos, órgãos)
        bodyType: "Mesomorfo",      // Ectomorfo/Mesomorfo/Endomorfo
        bodyTypeDesc: "Corpo atlético...",
        recommendations: [          // Array de strings
            "💪 Priorize treinos de força...",
            "💧 Mantenha-se bem hidratado..."
        ]
    }
}
```

## 🔒 Integração com Autenticação

```javascript
// Passar dados do usuário para pré-preencher formulário
function startAuthenticatedAssessment(user) {
    // Pré-popular dados se já existirem
    if (user.profile) {
        document.getElementById('input-weight').value = user.profile.weight || '';
        document.getElementById('input-height').value = user.profile.height || '';
        document.getElementById('input-age').value = user.profile.age || '';
    }
    
    window.BodyAssessment.start();
    
    // Salvar com ID do usuário
    window.BodyAssessment.onComplete = (data) => {
        fetch(`/api/users/${user.id}/assessments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    };
}
```

## 💾 Persistência de Dados (FASE 2 - localStorage Seguro)

O módulo agora salva automaticamente o progresso da avaliação usando localStorage com prefixo seguro.

### Chaves de Storage

```javascript
STORAGE_KEYS = {
    appState: "assessment_state",           // Estado completo
    userData: "assessment_user",            // Dados do usuário
    analysisResults: "assessment_results",  // Resultados da análise
    lastSaved: "assessment_timestamp"       // Timestamp do último salva
}
```

### Recuperação Automática

O módulo tenta recuperar a avaliação anterior ao iniciar:

```javascript
// Automático - mostrar notificação se houver dados salvos
recoverPreviousAssessment();
// ✅ Mostra: "📋 Avaliação anterior recuperada (12/02/2026 14:30)"
```

### API de Storage Manual

```javascript
// Salvar dados manualmente
const saveResult = saveAssessmentData();
if (saveResult.success) {
    console.log('Dados salvos com sucesso');
}

// Carregar dados manualmente
const loadResult = loadAssessmentData();
if (loadResult.success) {
    console.log('Dados carregados:', loadResult.data);
    console.log('Último salvamento:', loadResult.lastSaved);
}

// Limpar dados (útil ao reiniciar)
const clearResult = clearAssessmentData();
if (clearResult.success) {
    console.log('Dados limpos');
}
```

### Sincronização DOM ↔️ AppState (FASE 2)

```javascript
// Sincronizar formulário → AppState
syncFormToState();

// Sincronizar AppState → DOM campos específicos
syncStateToDOM(AppState.userData, ['weight', 'height', 'age']);

// Sincronizar de/para objetos genéricos
syncDOMToState(source, target);
syncStateToDOM(source, ['field1', 'field2']);
```

### Estrutura de Dados Salva

```javascript
{
    currentScreen: "welcome-screen",
    currentPhotoStep: 0,
    photosCaptured: {
        front: true,
        back: false,
        sideLeft: false,
        sideRight: false
    },
    userData: {
        weight: 75.5,
        height: 175,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        goal: "muscle-gain"
    },
    analysisResults: { /* ... */ },
    timestamp: "2026-02-24T14:30:00.000Z"
}
```

**Nota:** Fotos em base64 NÃO são salvas (muito grandes). Use `photosCaptured` para rastrear quais foram feitas.

---

## 📊 Integração com Planos de Treino

```javascript
// Usar resultados para gerar plano personalizado
window.BodyAssessment.onComplete = async (data) => {
    const { bodyFat, bodyType, goal } = data.analysis;
    
    // Chamar sua API de geração de planos
    const workoutPlan = await generateWorkoutPlan({
        bodyFat: parseFloat(bodyFat),
        bodyType,
        goal: data.userData.goal,
        activityLevel: data.userData.activityLevel
    });
    
    // Exibir plano personalizado
    showWorkoutPlan(workoutPlan);
};

async function generateWorkoutPlan(profile) {
    const response = await fetch('/api/workout-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    
    return response.json();
}
```

## 🎯 Modelo de Assinatura (Freemium)

```javascript
// Verificar limite de avaliações para usuários free
function checkAssessmentLimit(user) {
    if (user.plan === 'free') {
        const assessmentsThisMonth = getAssessmentsCount(user.id);
        
        if (assessmentsThisMonth >= 1) {
            showUpgradeModal();
            return false;
        }
    }
    
    return true;
}

// Antes de iniciar avaliação
document.getElementById('btn-assess').addEventListener('click', () => {
    if (checkAssessmentLimit(currentUser)) {
        window.BodyAssessment.start();
    }
});

function showUpgradeModal() {
    alert('Você atingiu o limite do plano gratuito. Faça upgrade para Plus!');
    // Mostrar modal de upgrade
}
```

## 🔄 Sincronização com Backend

```javascript
// Exemplo de schema para banco de dados
const AssessmentSchema = {
    userId: String,
    timestamp: Date,
    photos: {
        front: String,  // URL ou base64
        back: String,
        side: String
    },
    measurements: {
        weight: Number,
        height: Number,
        age: Number,
        gender: String,
        activityLevel: String,
        goal: String
    },
    results: {
        bmi: Number,
        bodyFat: Number,
        muscleMass: Number,
        bodyType: String
    },
    generatedPlan: ObjectId  // Referência ao plano gerado
};
```

## 🎨 Customização Visual

```css
/* Sobrescrever cores do tema para combinar com seu app */
:root {
    --primary-color: #YOUR_BRAND_COLOR;
    --bg-primary: #YOUR_BG_COLOR;
    /* ... outras variáveis */
}

/* Esconder elementos específicos se necessário */
.upgrade-cta {
    display: none;  /* Se não usar modelo freemium */
}
```

## 📱 Responsividade

O módulo é 100% responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## ⚡ Performance

### Otimizações Implementadas:
- ✅ Fotos comprimidas em base64
- ✅ CSS com variáveis (performance)
- ✅ JavaScript vanilla (sem dependências)
- ✅ Lazy loading de gráficos

### Recomendações:
- Comprimir fotos antes de salvar no backend
- Usar CDN para assets estáticos
- Implementar cache de avaliações

## 🐛 Tratamento de Erros

```javascript
window.BodyAssessment.onError = (error) => {
    console.error('Erro na avaliação:', error);
    showErrorMessage('Não foi possível completar a avaliação. Tente novamente.');
};
```

## 📝 Exemplo Completo de Integração

```javascript
// App Principal de Personal Trainers
class PersonalTrainerApp {
    constructor() {
        this.currentUser = null;
        this.setupAssessmentIntegration();
    }
    
    setupAssessmentIntegration() {
        // Callback quando avaliação concluir
        window.BodyAssessment.onComplete = async (data) => {
            try {
                // 1. Salvar avaliação
                const assessment = await this.saveAssessment(data);
                
                // 2. Gerar plano de treino
                const plan = await this.generatePlan(assessment);
                
                // 3. Atualizar perfil do aluno
                await this.updateStudentProfile(data.analysis);
                
                // 4. Notificar personal trainer
                this.notifyTrainer(assessment, plan);
                
                // 5. Redirecionar para dashboard
                this.goToDashboard();
                
            } catch (error) {
                this.handleError(error);
            }
        };
    }
    
    async saveAssessment(data) {
        return fetch('/api/assessments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.currentUser.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: this.currentUser.id,
                ...data,
                timestamp: new Date()
            })
        }).then(r => r.json());
    }
    
    async generatePlan(assessment) {
        // Lógica de geração de plano baseada na avaliação
        // (conecta com o principal problema: economizar tempo do PT)
    }
}

// Inicializar
const app = new PersonalTrainerApp();
```

## 🚀 Próximos Passos

1. **Testar integração** no ambiente de desenvolvimento
2. **Adaptar estilos** às cores da sua marca
3. **Configurar backend** para salvar avaliações
4. **Implementar lógica de planos** baseada nos resultados
5. **Deploy em produção**

## 📞 Suporte

Para dúvidas técnicas sobre integração, consulte os exemplos acima ou revise o código fonte em `app.js`.

---

**Versão da API**: 1.0.0  
**Compatibilidade**: Todos os navegadores modernos (ES6+)
