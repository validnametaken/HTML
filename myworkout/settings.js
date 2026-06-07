// settings.js
const DEFAULT_SETTINGS = {
    difficulty: 'normal',
    includeFlow: true,
    maxRounds: 5,
    favoriteExercises: [],
    excludedExercises: []
};

export function getSettings() {
    const stored = localStorage.getItem('workoutSettings');
    if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
    localStorage.setItem('workoutSettings', JSON.stringify(settings));
}

export function resetSettings() {
    localStorage.removeItem('workoutSettings');
    return { ...DEFAULT_SETTINGS };
}
