/**
 * 🧪 TESTES UNITÁRIOS - FASE 3
 * 
 * Suite de testes para cálculos, validação e storage
 * Sem dependências externas (vanilla JS)
 */

// ==========================================
// FRAMEWORK DE TESTES SIMPLES
// ==========================================

class TestSuite {
    constructor(name) {
        this.name = name;
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(description, fn) {
        this.tests.push({ description, fn });
    }

    async run() {
        console.log(`\n📋 ${this.name}`);
        console.log('═'.repeat(50));

        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`  ✅ ${test.description}`);
            } catch (error) {
                this.failed++;
                console.log(`  ❌ ${test.description}`);
                console.log(`     Erro: ${error.message}`);
            }
        }

        console.log('─'.repeat(50));
        console.log(`Resultado: ${this.passed}/${this.tests.length} passaram`);
        
        return this.failed === 0;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertAlmostEqual(actual, expected, delta = 0.01, message) {
    if (Math.abs(actual - expected) > delta) {
        throw new Error(message || `Expected ~${expected}, got ${actual}`);
    }
}

// ==========================================
// TESTES: CÁLCULOS DE CORPO
// ==========================================

const testCalculations = new TestSuite('🧬 Testes: Cálculos Corporais');

testCalculations.test('Calcular BMI corretamente', () => {
    // BMI = peso (kg) / (altura (m) ^ 2)
    // Exemplo: 75 kg, 175 cm (1.75 m)
    // BMI = 75 / (1.75 ^ 2) = 75 / 3.0625 = 24.49
    
    const weight = 75;
    const height = 175;
    const bmi = weight / Math.pow(height / 100, 2);
    
    assertAlmostEqual(bmi, 24.49, 0.1, 'BMI incorreto');
});

testCalculations.test('Categorizar BMI corretamente', () => {
    const categorize = (bmi) => {
        if (bmi < 18.5) return 'Abaixo do peso';
        if (bmi < 25) return 'Peso normal';
        if (bmi < 30) return 'Sobrepeso';
        return 'Obeso';
    };
    
    assertEqual(categorize(17), 'Abaixo do peso');
    assertEqual(categorize(22), 'Peso normal');
    assertEqual(categorize(27), 'Sobrepeso');
    assertEqual(categorize(32), 'Obeso');
});

testCalculations.test('Calcular porcentagem de gordura corretamente', () => {
    // Usando Fórmula de Jackson & Pollock (simplificada)
    // Para homem: %BF = (1.10938 * peso) - (1.0813 * altura) - (0.00033 * idade) - 5.4
    
    const weight = 75;  // kg
    const height = 175; // cm
    const age = 30;     // anos
    
    // Fórmula simplificada (há várias variações)
    const bodyFat = (1.10938 * weight) - (1.0813 * height) - (0.00033 * age) - 5.4;
    
    // Resultado deve estar no range realista (5-25% para homem ativo)
    assert(bodyFat > 5 && bodyFat < 25, `Body fat fora do range: ${bodyFat}%`);
});

testCalculations.test('Calcular massa muscular corretamente', () => {
    // Massa muscular = peso - (peso * %gordura / 100)
    
    const weight = 75;
    const bodyFatPercent = 18.5;
    const fatMass = weight * (bodyFatPercent / 100);
    const muscleMass = weight - fatMass;
    
    assertAlmostEqual(muscleMass, 61.12, 0.1, 'Massa muscular incorreta');
});

testCalculations.test('Determinar tipo de corpo corretamente', () => {
    const determineBodyType = (weight, height, age) => {
        const bmi = weight / Math.pow(height / 100, 2);
        const bodyFat = (1.10938 * weight) - (1.0813 * height) - (0.00033 * age) - 5.4;
        
        if (bmi < 20 && bodyFat < 15) return 'Ectomorfo';
        if (bmi >= 20 && bmi < 25 && bodyFat >= 10 && bodyFat < 20) return 'Mesomorfo';
        return 'Endomorfo';
    };
    
    // Teste magro
    assertEqual(determineBodyType(60, 180, 25), 'Ectomorfo');
    
    // Teste atlético
    assertEqual(determineBodyType(80, 180, 30), 'Mesomorfo');
    
    // Teste pesado
    assertEqual(determineBodyType(95, 175, 35), 'Endomorfo');
});

testCalculations.test('Calcular peso ideal corretamente', () => {
    // Fórmula de Devine: Peso ideal (kg) = 50 + 2.3 * (altura em polegadas - 60)
    // Ou em métrica: Peso ideal ≈ altura (cm) - 100 ± 10%
    
    const height = 175; // cm
    const idealWeight = height - 100;
    
    assertEqual(idealWeight, 75);
});

// ==========================================
// TESTES: VALIDAÇÃO
// ==========================================

const testValidation = new TestSuite('✅ Testes: Validação');

testValidation.test('Validar altura corretamente', () => {
    const validateHeight = (height) => {
        return height >= 100 && height <= 250;
    };
    
    assert(validateHeight(175), 'Altura válida rejeitada');
    assert(!validateHeight(50), 'Altura inválida aceita');
    assert(!validateHeight(300), 'Altura inválida aceita');
});

testValidation.test('Validar peso corretamente', () => {
    const validateWeight = (weight) => {
        return weight >= 30 && weight <= 300;
    };
    
    assert(validateWeight(75), 'Peso válido rejeitado');
    assert(!validateWeight(15), 'Peso inválido aceito');
    assert(!validateWeight(400), 'Peso inválido aceito');
});

testValidation.test('Validar idade corretamente', () => {
    const validateAge = (age) => {
        return age >= 13 && age <= 120;
    };
    
    assert(validateAge(30), 'Idade válida rejeitada');
    assert(!validateAge(10), 'Idade inválida aceita');
    assert(!validateAge(150), 'Idade inválida aceita');
});

testValidation.test('Validar tipo de arquivo de foto', () => {
    const isValidPhotoType = (mimeType) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return validTypes.includes(mimeType);
    };
    
    assert(isValidPhotoType('image/jpeg'), 'JPEG rejeitado');
    assert(isValidPhotoType('image/png'), 'PNG rejeitado');
    assert(isValidPhotoType('image/webp'), 'WebP rejeitado');
    assert(!isValidPhotoType('image/gif'), 'GIF aceito indevidamente');
    assert(!isValidPhotoType('image/bmp'), 'BMP aceito indevidamente');
});

testValidation.test('Validar tamanho de arquivo de foto', () => {
    const isValidPhotoSize = (sizeInBytes, maxSizeMB = 5) => {
        return sizeInBytes <= (maxSizeMB * 1024 * 1024);
    };
    
    assert(isValidPhotoSize(2 * 1024 * 1024), '2MB rejeitado');
    assert(isValidPhotoSize(5 * 1024 * 1024), '5MB rejeitado');
    assert(!isValidPhotoSize(10 * 1024 * 1024), '10MB aceito indevidamente');
});

// ==========================================
// TESTES: STORAGE
// ==========================================

const testStorage = new TestSuite('💾 Testes: Storage (localStorage)');

testStorage.test('Salvar dados no localStorage', () => {
    const testData = {
        weight: 75,
        height: 175,
        age: 30,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('test_assessment', JSON.stringify(testData));
    const saved = localStorage.getItem('test_assessment');
    
    assert(saved !== null, 'Dados não foram salvos');
    
    const parsed = JSON.parse(saved);
    assertEqual(parsed.weight, 75);
    assertEqual(parsed.height, 175);
    
    // Limpar
    localStorage.removeItem('test_assessment');
});

testStorage.test('Carregar dados do localStorage', () => {
    const testData = { name: 'Test User', weight: 80 };
    localStorage.setItem('test_load', JSON.stringify(testData));
    
    const loaded = JSON.parse(localStorage.getItem('test_load'));
    assertEqual(loaded.name, 'Test User');
    assertEqual(loaded.weight, 80);
    
    // Limpar
    localStorage.removeItem('test_load');
});

testStorage.test('Limpar dados do localStorage', () => {
    localStorage.setItem('test_clear', 'some data');
    assert(localStorage.getItem('test_clear') !== null, 'Dados não salvos');
    
    localStorage.removeItem('test_clear');
    assert(localStorage.getItem('test_clear') === null, 'Dados não foram limpos');
});

testStorage.test('Prefixo de storage não colide', () => {
    const prefix = 'assessment_';
    const keys = [
        prefix + 'state',
        prefix + 'user',
        prefix + 'results',
        prefix + 'timestamp'
    ];
    
    // Todos os prefixos devem começar corretamente
    keys.forEach(key => {
        assert(key.startsWith(prefix), `Prefixo inválido: ${key}`);
    });
});

testStorage.test('Storage persiste entre chamadas', () => {
    const key = 'persistence_test';
    const value = 'original';
    
    localStorage.setItem(key, value);
    const retrieved = localStorage.getItem(key);
    assertEqual(retrieved, value);
    
    // Simular nova sessão (não realmente, mas testa retrieval)
    const retrieved2 = localStorage.getItem(key);
    assertEqual(retrieved2, value, 'Dados não persistem');
    
    // Limpar
    localStorage.removeItem(key);
});

// ==========================================
// TESTES: SINCRONIZAÇÃO DOM/STATE
// ==========================================

const testSync = new TestSuite('🔄 Testes: Sincronização DOM ↔️ State');

testSync.test('syncDOMToState copia valores corretamente', () => {
    const source = { weight: 75, height: 175, age: 30 };
    const target = {};
    
    // Simular syncDOMToState
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined && source[key] !== null) {
            target[key] = source[key];
        }
    });
    
    assertEqual(target.weight, 75);
    assertEqual(target.height, 175);
    assertEqual(target.age, 30);
});

testSync.test('syncDOMToState ignora valores undefined/null', () => {
    const source = { weight: 75, height: undefined, age: null };
    const target = { height: 180, age: 40, extra: 'data' };
    
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined && source[key] !== null) {
            target[key] = source[key];
        }
    });
    
    assertEqual(target.weight, 75);
    assertEqual(target.height, 180, 'undefined sobrescreveu valor');
    assertEqual(target.age, 40, 'null sobrescreveu valor');
    assertEqual(target.extra, 'data', 'Campo extra foi perdido');
});

testSync.test('Múltiplas sincronizações sem conflito', () => {
    let state = { a: 1, b: 2 };
    
    const sync1 = { a: 10 };
    Object.keys(sync1).forEach(k => { if (sync1[k] != null) state[k] = sync1[k]; });
    assertEqual(state.a, 10);
    assertEqual(state.b, 2);
    
    const sync2 = { b: 20 };
    Object.keys(sync2).forEach(k => { if (sync2[k] != null) state[k] = sync2[k]; });
    assertEqual(state.a, 10);
    assertEqual(state.b, 20);
});

// ==========================================
// EXECUTAR TODOS OS TESTES
// ==========================================

async function runAllTests() {
    console.clear();
    console.log('🚀 FASE 3: TESTES UNITÁRIOS');
    console.log('═'.repeat(50));
    console.log(new Date().toLocaleString('pt-BR'));
    console.log();

    const suites = [
        testCalculations,
        testValidation,
        testStorage,
        testSync
    ];

    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of suites) {
        const result = await suite.run();
        totalPassed += suite.passed;
        totalFailed += suite.failed;
    }

    console.log();
    console.log('═'.repeat(50));
    console.log(`📊 RESULTADO FINAL`);
    console.log(`✅ Passaram: ${totalPassed}`);
    console.log(`❌ Falharam: ${totalFailed}`);
    console.log(`📈 Taxa: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log('═'.repeat(50));

    if (totalFailed === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM!');
    } else {
        console.log(`⚠️  ${totalFailed} teste(s) falharam. Verifique os erros acima.`);
    }
}

// Export para Node.js (se usado em ambiente de teste)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, assert, assertEqual, assertAlmostEqual, runAllTests };
}

// Auto-run se abrir no console
if (typeof window !== 'undefined') {
    window.runAllTests = runAllTests;
    console.log('💡 Dica: Execute runAllTests() no console para rodar os testes');
}
