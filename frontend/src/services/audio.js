// F2: Simple service to generate sounds for game actions.
'use client';

// Function to generate a simple sound wave
function playTone(frequency, duration, type, volume) {
    // Check if AudioContext is available
    if (typeof window === 'undefined' || !window.AudioContext) {
        // console.warn("AudioContext not available. Skipping sound.");
        return;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Setup oscillator properties
    oscillator.type = type; // e.g., 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Setup gain (volume)
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop the tone
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Plays a distinct tone based on the game's outcome or action type.
 * @param {'success' | 'penalty' | 'neutral' | 'plant' | 'water' | 'fertilize' | 'pest'} type 
 */
export function playActionSound(type) {
    const defaultDuration = 0.1; 
    
    switch (type) {
        case 'success':
            // High, pleasant tone (General positive feedback)
            playTone(880, defaultDuration, 'sine', 0.8);
            break;
        case 'penalty':
            // Low, dissonant tone (General negative feedback)
            playTone(150, defaultDuration * 2, 'square', 0.7);
            break;
        case 'neutral':
            // Mid-range tone (Generic confirmation)
            playTone(440, defaultDuration, 'sine', 0.4);
            break;
        
        // --- NEW ACTION-SPECIFIC SOUNDS ---
        case 'plant':
            // Quick, soft descending tone (Mimics dropping something into the soil)
            playTone(400, 0.05, 'triangle', 0.6);
            setTimeout(() => playTone(300, 0.05, 'triangle', 0.6), 50);
            break;
        case 'water':
            // Continuous, gentle falling pitch (Mimics a trickle or spray)
            playTone(300, 0.3, 'sine', 0.5);
            break;
        case 'fertilize':
            // Sharp, high-frequency square wave (Mimics a quick, mechanical application)
            playTone(1200, 0.08, 'square', 0.7);
            break;
        case 'pest':
            // Low, quick pulse followed by silence (Mimics a spray or puff)
            playTone(200, 0.04, 'sawtooth', 0.7);
            setTimeout(() => playTone(250, 0.04, 'sawtooth', 0.7), 40);
            break;
        case 'harvest':
             // Ascending arpeggio (Mimics a score chime)
            playTone(600, 0.1, 'sine', 0.6);
            setTimeout(() => playTone(800, 0.1, 'sine', 0.6), 50);
            setTimeout(() => playTone(1000, 0.1, 'sine', 0.6), 100);
            break;
        default:
            break;
    }
}
