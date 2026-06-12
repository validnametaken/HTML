// workoutEngine.js
export let warmupExercises = [];
export let lieDownExercises = [];
export let exerciseGroups = [];
export let workoutPlan = [];
export let currentExercise = 0;
export let currentRep = 1;
export let isBreak = false;
export let paused = false;
export let timer = null;
export let timeLeft = 0;
export let progressTotal = 0;
export let progressCount = 0;

export const soundBuffers = {};
let audioContext = null;
let difficultySettings = null;

export function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
}

export async function loadSound(name, url) {
    if (!audioContext) initAudio();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    soundBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
}

export async function loadDifficultySettings() {
    const response = await fetch('difficultySettings.json');
    difficultySettings = await response.json();
}

export function playSound(name) {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    const buffer = soundBuffers[name];
    if (!buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

export function setExercises(data) {
    warmupExercises = data.warmup;
    lieDownExercises = data.liedown;
    exerciseGroups = [
        { name: "Arms", exercises: data.arms, used: [] },
        { name: "Core", exercises: data.core, used: [] },
        { name: "Legs", exercises: data.legs, used: [] },
        { name: "Flow", exercises: data.flow, used: [] }
    ];
}

export function resetWorkoutState() {
    currentExercise = 0;
    currentRep = 1;
    isBreak = false;
    paused = false;
    progressCount = 0;
}

export function getRandomExercise(group, excludedExercises = []) {
    if (group.used.length === group.exercises.length) {
        group.used = [];
    }
    let availableExercises = group.exercises.filter(ex => 
        !group.used.includes(ex) && 
        !excludedExercises.includes(ex.name)
    );
    const randomIndex = Math.floor(Math.random() * availableExercises.length);
    const chosenExercise = availableExercises[randomIndex];
    group.used.push(chosenExercise);
    return chosenExercise;
}

export function generateWorkoutPlan(settings = null) {
    let generatedPlan = [];
    
    // Use settings if provided, otherwise use defaults
    const maxRounds = settings?.maxRounds || 5;
    const includeFlow = settings?.includeFlow !== undefined ? settings.includeFlow : true;
    const favoriteExercises = settings?.favoriteExercises || [];
    const excludedExercises = settings?.excludedExercises || [];
    const difficulty = settings?.difficulty || 'normal';

    // Get difficulty-specific exercise overrides
    const difficultyOverrides = difficultySettings?.[difficulty] || {};

    exerciseGroups.forEach(group => { group.used = []; });

    // First, add favorite exercises
    favoriteExercises.forEach(favName => {
        for (const group of exerciseGroups) {
            const exercise = group.exercises.find(ex => ex.name === favName);
            if (exercise && !excludedExercises.includes(favName)) {
                // Check if there's an override for this exercise in difficulty settings
                const override = difficultyOverrides[exercise.name];
                
                // Create a copy of the exercise with exact values from override or defaults
                const adjustedExercise = {
                    ...exercise,
                    reps: override?.reps !== undefined ? override.reps : exercise.reps,
                    repDuration: override?.repDuration !== undefined ? override.repDuration : exercise.repDuration,
                    breakBetweenReps: override?.breakBetweenReps !== undefined ? override.breakBetweenReps : exercise.breakBetweenReps,
                    breakBetweenExercises: override?.breakBetweenExercises !== undefined ? override.breakBetweenExercises : exercise.breakBetweenExercises
                };
                generatedPlan.push(adjustedExercise);
                group.used.push(exercise);
                break;
            }
        }
    });

    // Determine which groups to include
    const activeGroups = exerciseGroups.filter(group => {
        if (group.name === "Flow" && !includeFlow) return false;
        return true;
    });

    // Generate workout plan with specified number of rounds
    // Each round includes one exercise from each active group
    for (let cycle = 0; cycle < maxRounds; cycle++) {
        activeGroups.forEach(group => {
            const exercise = getRandomExercise(group, excludedExercises);
            // Check if there's an override for this exercise in difficulty settings
            const override = difficultyOverrides[exercise.name];
            
            // Create a copy of the exercise with exact values from override or defaults
            const adjustedExercise = {
                ...exercise,
                reps: override?.reps !== undefined ? override.reps : exercise.reps,
                repDuration: override?.repDuration !== undefined ? override.repDuration : exercise.repDuration,
                breakBetweenReps: override?.breakBetweenReps !== undefined ? override.breakBetweenReps : exercise.breakBetweenReps,
                breakBetweenExercises: override?.breakBetweenExercises !== undefined ? override.breakBetweenExercises : exercise.breakBetweenExercises
            };
            generatedPlan.push(adjustedExercise);
        });
    }

    return generatedPlan;
}

export function initializeWorkout() {
    const mainPlan = generateWorkoutPlan();
    workoutPlan = [...warmupExercises, ...liedownExercises, ...mainPlan];
    progressTotal = workoutPlan.reduce((acc, ex, idx) => {
        const breakBetweenExercises = (idx < workoutPlan.length - 1) ? ex.breakBetweenExercises : 0;
        return acc + ex.reps * (ex.repDuration + ex.breakBetweenReps) + breakBetweenExercises;
    }, 0);
    resetWorkoutState();
}

export function setPaused(state) {
    paused = state;
}

export function setTimer(newTimer) {
    timer = newTimer;
}

export function clearTimer() {
    if (timer) clearInterval(timer);
}

export function setTimeLeft(val) {
    timeLeft = val;
}
