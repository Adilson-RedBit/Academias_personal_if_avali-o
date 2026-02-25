/**
 * Runner de testes - Node.js
 * Executa todos os testes e printa resultado
 */

// Simular localStorage para ambiente Node.js
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        data: {},
        setItem(key, value) {
            this.data[key] = value;
        },
        getItem(key) {
            return this.data[key] || null;
        },
        removeItem(key) {
            delete this.data[key];
        },
        clear() {
            this.data = {};
        }
    };
}

// Framework de testes simples
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
// TESTES: CÁLCULOS
// ==========================================

const testCalculations = new TestSuite('🧬 Testes: Cálculos Corporais');

testCalculations.test('Calcular BMI corretamente', () => {
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

testCalculations.test('Calcular massa muscular corretamente', () => {
    const weight = 75;
    const bodyFatPercent = 18.5;
    const fatMass = weight * (bodyFatPercent / 100);
    const muscleMass = weight - fatMass;
    assertAlmostEqual(muscleMass, 61.12, 0.1, 'Massa muscular incorreta');
});

testCalculations.test('Calcular peso ideal corretamente', () => {
    const height = 175;
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

testValidation.test('Validar tipo de arquivo de foto', () => {
    const isValidPhotoType = (mimeType) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return validTypes.includes(mimeType);
    };
    
    assert(isValidPhotoType('image/jpeg'), 'JPEG rejeitado');
    assert(isValidPhotoType('image/png'), 'PNG rejeitado');
    assert(!isValidPhotoType('image/gif'), 'GIF aceito indevidamente');
});

// ==========================================
// TESTES: STORAGE
// ==========================================

const testStorage = new TestSuite('💾 Testes: Storage');

testStorage.test('Salvar e carregar dados', () => {
    const testData = { weight: 75, height: 175 };
    localStorage.setItem('test_1', JSON.stringify(testData));
    const loaded = JSON.parse(localStorage.getItem('test_1'));
    assertEqual(loaded.weight, 75);
    localStorage.removeItem('test_1');
});

testStorage.test('Limpar dados do storage', () => {
    localStorage.setItem('test_2', 'data');
    assert(localStorage.getItem('test_2') !== null, 'Dados não salvos');
    localStorage.removeItem('test_2');
    assert(localStorage.getItem('test_2') === null, 'Dados não foram limpos');
});

// ==========================================
// TESTES: SINCRONIZAÇÃO
// ==========================================

const testSync = new TestSuite('🔄 Testes: Sincronização');

testSync.test('Sincronizar DOM para State', () => {
    const source = { weight: 75, height: 175 };
    const target = {};
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined && source[key] !== null) {
            target[key] = source[key];
        }
    });
    assertEqual(target.weight, 75);
    assertEqual(target.height, 175);
});

testSync.test('Ignorar valores undefined/null', () => {
    const source = { weight: 75, height: undefined };
    const target = { height: 180 };
    Object.keys(source).forEach(key => {
        if (source[key] !== undefined && source[key] !== null) {
            target[key] = source[key];
        }
    });
    assertEqual(target.weight, 75);
    assertEqual(target.height, 180);
});

// ==========================================
// EXECUTAR
// ==========================================

(async () => {
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
        process.exit(0);
    } else {
        console.log(`⚠️  ${totalFailed} teste(s) falharam.`);
        process.exit(1);
    }
})();
