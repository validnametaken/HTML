// data.js
function validateExercise(exercise) {
    const requiredFields = ['name', 'reps', 'repDuration', 'breakBetweenReps', 'breakBetweenExercises', 'imgUrl', 'explanation'];
    for (const field of requiredFields) {
        if (exercise[field] === undefined || exercise[field] === null) {
            throw new Error(`Exercise missing required field: ${field}`);
        }
    }
    
    if (typeof exercise.reps !== 'number' || exercise.reps < 0) {
        throw new Error(`Exercise reps must be a non-negative number`);
    }
    
    if (typeof exercise.repDuration !== 'number' || exercise.repDuration < 0) {
        throw new Error(`Exercise repDuration must be a non-negative number`);
    }
    
    if (typeof exercise.breakBetweenReps !== 'number' || exercise.breakBetweenReps < 0) {
        throw new Error(`Exercise breakBetweenReps must be a non-negative number`);
    }
    
    if (typeof exercise.breakBetweenExercises !== 'number' || exercise.breakBetweenExercises < 0) {
        throw new Error(`Exercise breakBetweenExercises must be a non-negative number`);
    }
}

function validateExerciseData(data) {
    const requiredGroups = ['warmup', 'liedown', 'arms', 'core', 'legs', 'flow'];
    
    for (const group of requiredGroups) {
        if (!data[group]) {
            throw new Error(`Missing exercise group: ${group}`);
        }
        
        if (!Array.isArray(data[group])) {
            throw new Error(`Exercise group ${group} must be an array`);
        }
        
        for (const exercise of data[group]) {
            validateExercise(exercise);
        }
    }
}

export async function fetchExercises() {
    try {
        const response = await fetch('exercises.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Validate the data structure
        validateExerciseData(data);
        
        return data;
    } catch (error) {
        console.error('Failed to fetch exercises:', error);
        throw new Error('Failed to load exercise data. Please check your internet connection.');
    }
}
