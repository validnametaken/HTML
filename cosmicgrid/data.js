// Math Problem Generators & Level Configurations

const generators = {
    add: (limit) => {
        const num1 = Math.floor(Math.random() * (limit - 1)) + 1;
        const maxNum2 = limit - num1;
        const num2 = Math.floor(Math.random() * maxNum2) + 1;
        return { question: `${num1} + ${num2}`, answer: num1 + num2 };
    },
    sub: (limit) => {
        const answer = Math.floor(Math.random() * limit) + 1;
        const small = Math.floor(Math.random() * (limit - answer)) + 1;
        const big = answer + small;
        return { question: `${big} - ${small}`, answer: answer };
    },
    mult: (limit) => {
        const answer = Math.floor(Math.random() * (limit - 1)) + 1;
        const factors = [];
        for (let i = 2; i <= Math.sqrt(answer); i++) {
            if (answer % i === 0) {
                factors.push([i, answer / i]);
            }
        }
        if (factors.length === 0) {
            return { question: `${answer} * 1`, answer: answer };
        }
        const [num1, num2] = factors[Math.floor(Math.random() * factors.length)];
        return { question: `${num1} * ${num2}`, answer: answer };
    },
    div: (limit) => {
        const answer = Math.floor(Math.random() * (limit - 1)) + 1;
        const divisor = Math.floor(Math.random() * 10) + 1;
        const dividend = answer * divisor;
        return { question: `${dividend} / ${divisor}`, answer: answer };
    }
};

const STAGE_CONFIGS = {
    'add-10': { type: 'add', limit: 10 },
    'add-20': { type: 'add', limit: 20 },
    'add-100': { type: 'add', limit: 100 },
    'add-1000': { type: 'add', limit: 1000 },
    'add-10000': { type: 'add', limit: 10000 },
    'sub-10': { type: 'sub', limit: 10 },
    'sub-20': { type: 'sub', limit: 20 },
    'sub-100': { type: 'sub', limit: 100 },
    'sub-1000': { type: 'sub', limit: 1000 },
    'sub-10000': { type: 'sub', limit: 10000 },
    'mult-10': { type: 'mult', limit: 10 },
    'mult-100': { type: 'mult', limit: 100 },
    'mult-1000': { type: 'mult', limit: 1000 },
    'div-10': { type: 'div', limit: 10 },
    'div-100': { type: 'div', limit: 100 },
    'div-1000': { type: 'div', limit: 1000 }
};

export function generateEquation(stage) {
    const config = STAGE_CONFIGS[stage];
    if (!config) {
        console.warn(`Unknown stage: ${stage}, defaulting to add-10`);
        return generators.add(10);
    }
    return generators[config.type](config.limit);
}
