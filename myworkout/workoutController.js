// workoutController.js
import { formatTime, updateProgress } from './ui.js';
import { playSound } from './audio.js';

let workoutPlan = [];
let currentExercise = 0;
let currentRep = 1;
let isBreak = false;
let timer = null;
let timeLeft = 0;
let paused = false;
let progressTotal = 0;
let progressCount = 0;

const praises = ["amazing", "awesome", "incredible", "fantastic", "excellent", "superb", "outstanding"];
const randomPraise = praises[Math.floor(Math.random() * praises.length)];

// DOM elements
const currentExerciseEl = document.getElementById('current-exercise');
const exerciseImgEl = document.getElementById('exercise-img');
const exerciseExplanationEl = document.getElementById('exercise-explanation');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const progressBarEl = document.getElementById('progress-bar');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');

export function getWorkoutPlan() {
    return workoutPlan;
}

export function setWorkoutPlan(plan) {
    workoutPlan = plan;
}

export function getCurrentExercise() {
    return currentExercise;
}

export function setCurrentExercise(value) {
    currentExercise = value;
}

export function getCurrentRep() {
    return currentRep;
}

export function setCurrentRep(value) {
    currentRep = value;
}

export function getIsBreak() {
    return isBreak;
}

export function setIsBreak(value) {
    isBreak = value;
}

export function getPaused() {
    return paused;
}

export function setPaused(value) {
    paused = value;
}

export function getTimeLeft() {
    return timeLeft;
}

export function setTimeLeft(value) {
    timeLeft = value;
}

export function getProgressTotal() {
    return progressTotal;
}

export function setProgressTotal(value) {
    progressTotal = value;
}

export function getProgressCount() {
    return progressCount;
}

export function setProgressCount(value) {
    progressCount = value;
}

export function startTimer(seconds, onTick, onComplete) {
    timeLeft = seconds;
    timerEl.textContent = formatTime(timeLeft);
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        if (!paused) {
            timeLeft--;
            onTick(timeLeft);
            timerEl.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                onComplete();
            }
        }
    }, 1000);
}

export function clearTimer() {
    if (timer) clearInterval(timer);
}

export function nextStep() {
    const nextExerciseImgEl = document.getElementById('next-exercise-img');
    const exerciseVideoEl = document.getElementById('exercise-video');
    const exerciseTextEl = document.getElementById('exercise-text');

    if (currentExercise >= workoutPlan.length) {
        currentExerciseEl.textContent = `Workout Complete! Andy is ${randomPraise}!`;
        exerciseImgEl.style.display = 'none';
        exerciseVideoEl.style.display = 'none';
        exerciseTextEl.style.display = 'none';
        exerciseExplanationEl.textContent = '';
        timerEl.textContent = "";
        statusEl.textContent = "";
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        skipBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.disabled = true;
        document.getElementById('next-exercise').textContent = "";
        nextExerciseImgEl.style.display = 'none';
        return;
    }
    // Clear "next exercise" at the start of a new exercise
    document.getElementById('next-exercise').textContent = "";
    nextExerciseImgEl.style.display = 'none';

    const ex = workoutPlan[currentExercise];
    currentExerciseEl.textContent = ex.name;
    exerciseImgEl.style.display = 'none';
    exerciseVideoEl.style.display = 'none';
    exerciseVideoEl.pause();
    exerciseTextEl.style.display = 'none';

    if (ex.imgUrl.match(/\.(mp4|mov|webm)$/i)) {
        exerciseVideoEl.src = ex.imgUrl;
        exerciseVideoEl.style.display = '';
        exerciseVideoEl.play();
    } else if (ex.imgUrl.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        exerciseImgEl.src = ex.imgUrl;
        exerciseImgEl.style.display = '';
    } else {
        // Assume it's text
        exerciseTextEl.textContent = ex.imgUrl;
        exerciseTextEl.style.display = '';
    }
    exerciseExplanationEl.textContent = ex.explanation || '';

    if (!isBreak) {
        statusEl.style.color = 'var(--text-color)';
        timerEl.style.color = 'var(--accent-color)';
        statusEl.textContent = `Rep ${currentRep} of ${ex.reps}`;
        playSound('start'); // Play at the start of every rep
        startTimer(ex.repDuration, () => {
            progressCount++;
            updateProgress(progressCount, progressTotal);
        }, () => {
            if (currentRep < ex.reps) {
                playSound('end'); // Play at the end of every rep except the last
                // Break between reps
                isBreak = true;
                statusEl.style.color = '#e53935';
                timerEl.style.color = '#e53935';
                startBreak(ex.breakBetweenReps, false, () => { // <--- false for between reps
                    isBreak = false;
                    statusEl.style.color = 'var(--text-color)';
                    timerEl.style.color = 'var(--accent-color)';
                    currentRep++;
                    nextStep();
                });
            } else {
                // Break between exercises
                isBreak = true;
                statusEl.style.color = '#e53935';
                timerEl.style.color = '#e53935';
                playSound('switch'); // Only play switch sound after last rep
                currentRep = 1;
                currentExercise++;
                startBreak(ex.breakBetweenExercises, true, () => { // <--- true for between exercises
                    isBreak = false;
                    statusEl.style.color = 'var(--text-color)';
                    timerEl.style.color = 'var(--accent-color)';
                    nextStep();
                });
            }
        });
    }
}

export function startBreak(seconds, isBetweenExercises, callback) {
    const nextExerciseImgEl = document.getElementById('next-exercise-img');
    const nextExerciseVideoEl = document.getElementById('next-exercise-video');
    const exerciseVideoEl = document.getElementById('exercise-video');
    const exerciseTextEl = document.getElementById('exercise-text');

    // Hide current exercise media during break
    exerciseImgEl.style.display = 'none';
    exerciseVideoEl.style.display = 'none';
    exerciseVideoEl.pause();

    if (isBetweenExercises) {
        // Break between exercises
        exerciseImgEl.style.display = 'none';
        currentExerciseEl.textContent = ""; // Clear current exercise text
        exerciseExplanationEl.textContent = ""; // Clear explanation
        statusEl.textContent = "Break between exercises";
        if (currentExercise < workoutPlan.length) {
            const nextEx = workoutPlan[currentExercise];
            document.getElementById('next-exercise').textContent = `Next: ${nextEx.name}`;

            // Hide all next media elements initially
            nextExerciseImgEl.style.display = 'none';
            nextExerciseVideoEl.style.display = 'none';
            exerciseTextEl.style.display = 'none';
            nextExerciseVideoEl.pause();

            // Determine if next is video, image, or text
            if (nextEx.imgUrl.match(/\.(mp4|mov|webm)$/i)) {
                nextExerciseVideoEl.src = nextEx.imgUrl;
                nextExerciseVideoEl.style.display = '';
                nextExerciseVideoEl.play();
            } else if (nextEx.imgUrl.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                nextExerciseImgEl.src = nextEx.imgUrl;
                nextExerciseImgEl.style.display = '';
            } else {
                document.getElementById('next-exercise').textContent = nextEx.imgUrl;
            }
        } else {
            document.getElementById('next-exercise').textContent = "";
            nextExerciseImgEl.style.display = 'none';
            nextExerciseVideoEl.style.display = 'none';
            nextExerciseVideoEl.pause();
        }
    } else {
        // Break between reps - keep current image, hide next
        statusEl.textContent = "Break between reps";
        document.getElementById('next-exercise').textContent = "";
        nextExerciseImgEl.style.display = 'none';
        nextExerciseVideoEl.style.display = 'none';
        nextExerciseVideoEl.pause();
    }
    startTimer(seconds, () => {
        progressCount++;
        updateProgress(progressCount, progressTotal);
    }, () => {
        callback();
    });
}

export function pauseWorkout() {
    paused = true;
    pauseBtn.disabled = true;
    startBtn.disabled = true;
    resumeBtn.disabled = false;
    skipBtn.disabled = true;
    resetBtn.disabled = false; // Enable reset when paused
    statusEl.textContent = "Paused";
}

export function resumeWorkout() {
    paused = false;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    skipBtn.disabled = false;
    statusEl.textContent = isBreak ? (currentRep === 1 ? "Break between exercises" : "Break between reps") : `Rep ${currentRep} of ${workoutPlan[currentExercise].reps}`;
}

export function resetWorkout() {
    clearTimer();
    currentExercise = 0;
    currentRep = 1;
    isBreak = false;
    paused = false;
    progressCount = 0;
    updateProgress(progressCount, progressTotal);
    currentExerciseEl.textContent = "";
    exerciseImgEl.style.display = 'none';
    exerciseExplanationEl.textContent = ''; // Clear explanation on reset
    timerEl.textContent = "";
    statusEl.textContent = "";
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    resetBtn.disabled = true;
    startBtn.disabled = false;
    document.getElementById('next-exercise').textContent = ""; // Clear next exercise on reset
    document.getElementById('next-exercise-img').style.display = 'none'; // Hide next exercise image on reset
    // Show 'How To' button container on reset
    document.querySelector('.controls-top').style.display = '';
}

export function skipExercise() {
    clearTimer();
    isBreak = false;
    currentRep = 1;
    currentExercise++;
    nextStep();
}
