
'use client';

type Note = {
  note: number; // MIDI note number
  duration: number; // in seconds
  time: number; // start time in seconds
};

export type Tone = {
  name: string;
  sequence: Note[];
};

let audioCtx: AudioContext | null = null;
let activeSources: (OscillatorNode | GainNode)[] = [];
let ringtoneInterval: NodeJS.Timeout | null = null;
let vibrationInterval: NodeJS.Timeout | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.");
      return null;
    }
  }
  return audioCtx;
}

// Function to convert MIDI note number to frequency
function midiToFreq(midi: number): number {
  return Math.pow(2, (midi - 69) / 12) * 440;
}

export function playTone(sequence: Note[]) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  stopAllTones(); // Stop any currently playing single tone

  const now = ctx.currentTime;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0.3, now);

  activeSources.push(gainNode);

  sequence.forEach(noteData => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(midiToFreq(noteData.note), now + noteData.time);

    oscillator.connect(gainNode);
    gainNode.gain.setValueAtTime(0.3, now + noteData.time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteData.time + noteData.duration);

    oscillator.start(now + noteData.time);
    oscillator.stop(now + noteData.time + noteData.duration);
    activeSources.push(oscillator);
  });
}

export function playRingtone(sequence: Note[]) {
  stopRingtone(); // Stop any existing ringtone first
  const totalDuration = sequence.reduce((max, note) => Math.max(max, note.time + note.duration), 0) * 1000 + 500; // Total time + pause

  const play = () => playTone(sequence);
  play(); // Play immediately
  ringtoneInterval = setInterval(play, totalDuration);
}

export function stopRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  stopAllTones();
}

export function startVibration() {
    if (typeof navigator.vibrate !== 'function') return;
    stopVibration(); // Stop any existing vibration
    
    const vibrate = () => navigator.vibrate([400, 200, 400]); // Vibrate for 400ms, pause 200ms, vibrate 400ms
    vibrate();
    vibrationInterval = setInterval(vibrate, 1000);
}

export function stopVibration() {
    if (typeof navigator.vibrate !== 'function') return;
    if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
    }
    navigator.vibrate(0); // Stop any active vibration
}


export function stopAllTones() {
    activeSources.forEach(source => {
        try {
            if (source instanceof OscillatorNode) {
                source.stop();
            }
            source.disconnect();
        } catch (e) {
            // Ignore errors from trying to disconnect already disconnected nodes
        }
    });
    activeSources = [];
}


export const tones: Tone[] = [
  { name: 'Default', sequence: [{ note: 76, duration: 0.15, time: 0 }, { note: 81, duration: 0.2, time: 0.2 }] },
  { name: 'Chime', sequence: [{ note: 88, duration: 0.1, time: 0 }, { note: 93, duration: 0.1, time: 0.15 }, { note: 98, duration: 0.2, time: 0.3 }] },
  { name: 'Alert', sequence: [{ note: 84, duration: 0.1, time: 0 }, { note: 84, duration: 0.1, time: 0.15 }] },
  { name: 'Signal', sequence: [{ note: 72, duration: 0.3, time: 0 }] },
  { name: 'Echo', sequence: [{ note: 76, duration: 0.1, time: 0 }, { note: 76, duration: 0.1, time: 0.3 }] },
  { name: 'Ascend', sequence: [{ note: 60, duration: 0.1, time: 0 }, { note: 64, duration: 0.1, time: 0.1 }, { note: 67, duration: 0.1, time: 0.2 }, { note: 72, duration: 0.15, time: 0.3 }] },
  { name: 'Descend', sequence: [{ note: 72, duration: 0.1, time: 0 }, { note: 67, duration: 0.1, time: 0.1 }, { note: 64, duration: 0.1, time: 0.2 }, { note: 60, duration: 0.15, time: 0.3 }] },
];
