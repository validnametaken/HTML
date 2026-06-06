// ui.js
const currentExerciseEl = document.getElementById('current-exercise');
const exerciseImgEl = document.getElementById('exercise-img');
const exerciseVideoEl = document.getElementById('exercise-video');
const exerciseTextEl = document.getElementById('exercise-text');
const exerciseExplanationEl = document.getElementById('exercise-explanation');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const progressBarEl = document.getElementById('progress-bar');
const nextExerciseEl = document.getElementById('next-exercise');
const nextExerciseImgEl = document.getElementById('next-exercise-img');
const nextExerciseVideoEl = document.getElementById('next-exercise-video');

export function updateUI(ex, currentExerciseIdx, totalExercises, currentRep, isBreak, statusText, timeLeft) {
    if (currentExerciseIdx >= totalExercises) {
        currentExerciseEl.textContent = "Workout Complete!";
        exerciseImgEl.style.display = 'none';
        exerciseVideoEl.style.display = 'none';
        exerciseTextEl.style.display = 'none';
        exerciseExplanationEl.textContent = '';
        timerEl.textContent = "";
        statusEl.textContent = "";
        nextExerciseEl.textContent = "";
        nextExerciseImgEl.style.display = 'none';
        return;
    }

    currentExerciseEl.textContent = `${ex.name} (${currentExerciseIdx + 1} of ${totalExercises})`;
    exerciseImgEl.style.display = 'none';
    exerciseVideoEl.style.display = 'none';
    exerciseTextEl.style.display = 'none';
    exerciseVideoEl.pause();

    if (ex.imgUrl.match(/\.(mp4|mov|webm)$/i)) {
        exerciseVideoEl.src = ex.imgUrl;
        exerciseVideoEl.style.display = '';
        exerciseVideoEl.play();
    } else if (ex.imgUrl.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        exerciseImgEl.src = ex.imgUrl;
        exerciseImgEl.style.display = '';
    } else {
        exerciseTextEl.textContent = ex.imgUrl;
        exerciseTextEl.style.display = '';
    }
    exerciseExplanationEl.textContent = ex.explanation || '';
    
    timerEl.textContent = formatTime(timeLeft);
    statusEl.textContent = statusText;
}

export function updateBreakUI(isBetweenExercises, nextEx, timeLeft) {
    exerciseImgEl.style.display = 'none';
    exerciseVideoEl.style.display = 'none';
    exerciseVideoEl.pause();
    
    currentExerciseEl.textContent = "";
    exerciseExplanationEl.textContent = "";
    statusEl.textContent = isBetweenExercises ? "Break between exercises" : "Break between reps";

    if (isBetweenExercises && nextEx) {
        nextExerciseEl.textContent = `Next: ${nextEx.name}`;
        nextExerciseImgEl.style.display = 'none';
        nextExerciseVideoEl.style.display = 'none';
        nextExerciseVideoEl.pause();
        
        if (nextEx.imgUrl.match(/\.(mp4|mov|webm)$/i)) {
            nextExerciseVideoEl.src = nextEx.imgUrl;
            nextExerciseVideoEl.style.display = '';
            nextExerciseVideoEl.play();
        } else if (nextEx.imgUrl.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
            nextExerciseImgEl.src = nextEx.imgUrl;
            nextExerciseImgEl.style.display = '';
        } else {
            nextExerciseEl.textContent = nextEx.imgUrl;
        }
    } else {
        nextExerciseEl.textContent = "";
        nextExerciseImgEl.style.display = 'none';
        nextExerciseVideoEl.style.display = 'none';
    }
    timerEl.textContent = formatTime(timeLeft);
}

export function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function updateProgress(progressCount, progressTotal) {
    const percent = (progressCount / progressTotal) * 100;
    progressBarEl.style.width = percent + '%';
}

export function setButtonState(btnId, disabled) {
    document.getElementById(btnId).disabled = disabled;
}
