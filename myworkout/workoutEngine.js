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

export function getRandomExercise(group) {
    if (group.used.length === group.exercises.length) {
        group.used = [];
    }
    let availableExercises = group.exercises.filter(ex => !group.used.includes(ex));
    const randomIndex = Math.floor(Math.random() * availableExercises.length);
    const chosenExercise = availableExercises[randomIndex];
    group.used.push(chosenExercise);
    return chosenExercise;
}

export function generateWorkoutPlan() {
    let generatedPlan = [];
    const minExercisesInGroup = Math.min(...exerciseGroups.map(g => g.exercises.length));
    const numCycles = minExercisesInGroup;

    exerciseGroups.forEach(group => { group.used = []; });

    for (let cycle = 0; cycle < numCycles; cycle++) {
        exerciseGroups.forEach(group => {
            generatedPlan.push(getRandomExercise(group));
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
