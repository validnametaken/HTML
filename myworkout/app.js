import { fetchExercises } from './data.js';
import { setExercises, initializeWorkout, getRandomExercise, generateWorkoutPlan, resetWorkoutState, warmupExercises, lieDownExercises, exerciseGroups } from './workoutEngine.js';
import { updateUI, updateBreakUI, formatTime, updateProgress, setButtonState } from './ui.js';
import { loadAllSounds, playSound, unlockAudioContext } from './audio.js';
import { nextStep, startBreak, pauseWorkout, resumeWorkout, resetWorkout, skipExercise, setWorkoutPlan, setProgressTotal, getWorkoutPlan, getCurrentExercise, setCurrentExercise, getCurrentRep, setCurrentRep, getIsBreak, setIsBreak, getPaused, setPaused, getTimeLeft, setTimeLeft, getProgressCount, setProgressCount, startTimer, clearTimer } from './workoutController.js';

const currentExerciseEl = document.getElementById('current-exercise');
const exerciseImgEl = document.getElementById('exercise-img');
const exerciseExplanationEl = document.getElementById('exercise-explanation');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const nextExerciseEl = document.getElementById('next-exercise');

const progressBarEl = document.getElementById('progress-bar');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');

const howToBtn = document.getElementById('howToBtn');
const howToModal = document.getElementById('howToModal');
const closeHowToBtn = document.getElementById('closeHowToBtn');
const exerciseListEl = document.getElementById('exerciseList');

howToBtn.addEventListener('click', () => {
    populateExercises();
    howToModal.classList.add('visible');
});

closeHowToBtn.addEventListener('click', () => {
    howToModal.classList.remove('visible');
});

function populateExercises() {
    exerciseListEl.innerHTML = '';
    const allGroups = [
        { name: "Warmup", list: warmupExercises },
        { name: "Arms", list: exerciseGroups.find(g => g.name === "Arms").exercises },
        { name: "Core", list: exerciseGroups.find(g => g.name === "Core").exercises },
        { name: "Legs", list: exerciseGroups.find(g => g.name === "Legs").exercises },
        { name: "Flow", list: exerciseGroups.find(g => g.name === "Flow").exercises },
        { name: "Lie Down", list: lieDownExercises }
    ];

    allGroups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.innerHTML = `<h3>${group.name}</h3>`;
        group.list.forEach(ex => {
            // Skip "Get ready!" exercise
            if (ex.name === "Get ready!") return;
            
            const exEl = document.createElement('div');
            exEl.style.marginBottom = '15px';
            exEl.style.borderBottom = '1px solid #ccc';
            exEl.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${ex.imgUrl}" alt="${ex.name}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
                    <div>
                        <h4>${ex.name}</h4>
                        <p>${ex.explanation}</p>
                    </div>
                </div>
            `;
            groupEl.appendChild(exEl);
        });
        exerciseListEl.appendChild(groupEl);
    });
}

// Initialize UI state
const audioStatusEl = document.getElementById('audio-overlay');
audioStatusEl.style.display = 'flex';
audioStatusEl.addEventListener('click', unlockAudioContext);

// Wait for everything to be ready
window.addEventListener('DOMContentLoaded', async () => {
    console.log("App initializing...");
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Ensure exercise media elements are hidden before workout starts
    document.getElementById('next-exercise').textContent = "";
    document.getElementById('next-exercise-img').style.display = 'none';
    document.getElementById('next-exercise-video').style.display = 'none';
    document.getElementById('exercise-img').style.display = 'none';
    document.getElementById('exercise-video').style.display = 'none';
    document.getElementById('exercise-text').style.display = 'none';
    
    // Load exercises from data.js
    try {
        const exerciseData = await fetchExercises();
        setExercises(exerciseData);
        console.log("Exercises loaded successfully.");
    } catch (err) {
        console.error("Failed to load exercises:", err);
        alert("Failed to load exercise data. Please refresh the page.");
        return;
    }
    
    // Check if sounds need to be loaded
    try {
        await loadAllSounds();
        console.log("Sounds loaded successfully.");
        if (startBtn) {
            startBtn.disabled = false;
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    // Hide 'How To' button container on workout start
    document.querySelector('.controls-top').style.display = 'none';

    pauseBtn.disabled = false;
    skipBtn.disabled = false;
    resetBtn.disabled = false;
    
    // Initialize workout plan on start
    const mainPlan = generateWorkoutPlan(); 
    const fullWorkoutPlan = [...warmupExercises, ...lieDownExercises, ...mainPlan]; 
    setWorkoutPlan(fullWorkoutPlan);
    
    const totalProgress = fullWorkoutPlan.reduce((acc, ex, idx) => {
        const breakBetweenExercises = (idx < fullWorkoutPlan.length - 1) ? ex.breakBetweenExercises : 0;
        return acc + ex.reps * (ex.repDuration + ex.breakBetweenReps) + breakBetweenExercises;
    }, 0);
    setProgressTotal(totalProgress);
    resetWorkout();
    
    // Calculate and show duration
    const totalDurationSeconds = fullWorkoutPlan.reduce((acc, ex) => {
        return acc + ex.reps * (ex.repDuration + ex.breakBetweenReps) + ex.breakBetweenExercises;
    }, 0);
    const m = Math.floor(totalDurationSeconds / 60);
    const s = totalDurationSeconds % 60;
    document.getElementById('workout-duration').textContent = `Total duration: ${m}:${s.toString().padStart(2, '0')}`;
    
    nextStep();
    pauseBtn.disabled = false;
});

pauseBtn.addEventListener('click', pauseWorkout);
resumeBtn.addEventListener('click', resumeWorkout);
resetBtn.addEventListener('click', resetWorkout);
skipBtn.addEventListener('click', skipExercise);
