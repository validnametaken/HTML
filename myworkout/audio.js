// audio.js
let audioContext;
let soundBuffers = {};
let soundsLoaded = false;

const loadingOverlay = document.getElementById('loading-overlay');

export function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext;
    } catch (e) {
        console.error("AudioContext not supported");
        return null;
    }
}

export function getAudioContext() {
    if (!audioContext) {
        audioContext = initAudio();
    }
    return audioContext;
}

export function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

export async function loadSound(name, url) {
    showLoading(true);
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = getAudioContext();
        if (ctx) {
            soundBuffers[name] = await ctx.decodeAudioData(arrayBuffer);
        }
    } catch (e) {
        console.error(`Failed to load sound "${name}" from ${url}:`, e);
    } finally {
        showLoading(false);
    }
}

export async function loadAllSounds() {
    showLoading(true);
    await Promise.all([
        loadSound('start', 'exercise/audio_41203856b4.mp3'),
        loadSound('end', 'exercise/audio_336d55dfa8.mp3'),
        loadSound('switch', 'exercise/audio_c50d7fecf2.mp3')
    ]);
    soundsLoaded = true;
    showLoading(false);
    return soundsLoaded;
}

export function playSound(name) {
    const ctx = getAudioContext();
    if (!ctx) {
        console.warn('AudioContext not available');
        return;
    }
    if (ctx.state !== 'running') {
        console.warn('AudioContext is not running. Cannot play sound.');
        return;
    }
    const buffer = soundBuffers[name];
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
}

export function unlockAudioContext() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
            const audioStatusEl = document.getElementById('audio-overlay');
            if (audioStatusEl) {
                audioStatusEl.style.display = 'none';
            }
        });
    } else {
        const audioStatusEl = document.getElementById('audio-overlay');
        if (audioStatusEl) {
            audioStatusEl.style.display = 'none';
        }
    }
}

export function isSoundsLoaded() {
    return soundsLoaded;
}
