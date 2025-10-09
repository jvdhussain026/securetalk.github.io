
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
let activeSource: OscillatorNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
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

  // Ensure audio context is running
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  stopAllTones();

  const now = ctx.currentTime;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0.3, now); // Set overall volume

  sequence.forEach(noteData => {
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(midiToFreq(noteData.note), now + noteData.time);

    // Simple envelope to avoid clicks
    oscillator.connect(gainNode);
    gainNode.gain.setValueAtTime(0.3, now + noteData.time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteData.time + noteData.duration);

    oscillator.start(now + noteData.time);
    oscillator.stop(now + noteData.time + noteData.duration);
  });
}

export function stopAllTones() {
    // This is a simplified stop. For complex sequences, more advanced scheduling and gain control would be needed.
    // For this app, simply creating a new audio context on each play can effectively stop previous sounds.
    // However, a better approach is to manage gain. For simplicity here, we will just disconnect.
    // A full implementation would track all oscillator nodes and stop them.
    if(activeSource) {
      activeSource.stop();
      activeSource.disconnect();
      activeSource = null;
    }
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
