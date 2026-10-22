'use client';

// Web Audio API Synthesizer for cheers
let audioCtx = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 1. 🎉 Fireworks (Tada)
export const playFireworksSound = () => {
  const ctx = getCtx();
  if (!ctx) return;

  const playNote = (freq, startTime, duration, type = 'triangle') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + duration * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  // Ta-
  playNote(261.63, now, 0.15, 'triangle'); // C4
  playNote(329.63, now, 0.15, 'triangle'); // E4
  playNote(392.00, now, 0.15, 'triangle'); // G4
  
  // Da!
  playNote(261.63 * 2, now + 0.2, 0.6, 'triangle'); // C5
  playNote(329.63 * 2, now + 0.2, 0.6, 'triangle'); // E5
  playNote(392.00 * 2, now + 0.2, 0.6, 'triangle'); // G5
  
  // Fireworks pop/explosion
  const popOsc = ctx.createOscillator();
  const popGain = ctx.createGain();
  popOsc.type = 'sine';
  popOsc.frequency.setValueAtTime(200, now + 0.2);
  popOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35); // Sharp pitch drop
  
  popGain.gain.setValueAtTime(0, now + 0.2);
  popGain.gain.linearRampToValueAtTime(1, now + 0.21);
  popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  popOsc.connect(popGain);
  popGain.connect(ctx.destination);
  popOsc.start(now + 0.2);
  popOsc.stop(now + 0.5);

  // Fireworks crackles
  for (let i = 0; i < 40; i++) {
    const crackleTime = now + 0.25 + Math.random() * 1.5;
    const crackleDur = 0.03 + Math.random() * 0.05;
    
    const bufferSize = ctx.sampleRate * crackleDur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500 + Math.random() * 1000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, crackleTime);
    gain.gain.linearRampToValueAtTime(Math.random() * 0.3 + 0.1, crackleTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, crackleTime + crackleDur);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(crackleTime);
    noise.stop(crackleTime + crackleDur);
  }
};

// 2. 👏 Applause (Cheerful Arpeggio instead of noise)
export const playApplauseSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  const playBell = (freq, time, duration = 0.5) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.start(time);
    osc.stop(time + duration);
  };

  // Play a cheerful, bright C major 9 arpeggio going up and down
  const notes = [
    { freq: 261.63, time: 0 },    // C4
    { freq: 329.63, time: 0.1 },  // E4
    { freq: 392.00, time: 0.2 },  // G4
    { freq: 493.88, time: 0.3 },  // B4
    { freq: 587.33, time: 0.4 },  // D5
    { freq: 523.25, time: 0.55 }, // C5
    { freq: 659.25, time: 0.65 }, // E5
    { freq: 783.99, time: 0.75 }, // G5
  ];

  notes.forEach(note => {
    playBell(note.freq, now + note.time, 1.0);
  });
};

// 3. ⭐ Magic / Success
export const playMagicSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  const playChime = (freq, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    osc.start(time);
    osc.stop(time + 0.5);
  };
  
  const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
  freqs.forEach((freq, i) => {
    playChime(freq, now + i * 0.08);
  });
};

// 4. 🏆 Victory
export const playVictorySound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  const playTrumpet = (freq, time, duration) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'square';
    osc2.type = 'sawtooth';
    
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.01, time); // slight detune
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
    gain.gain.setValueAtTime(0.15, time + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0.01, time + duration);
    
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  };
  
  playTrumpet(392.00, now, 0.2);       // G4
  playTrumpet(392.00, now + 0.2, 0.2); // G4
  playTrumpet(392.00, now + 0.4, 0.2); // G4
  playTrumpet(523.25, now + 0.6, 0.6); // C5
};

export const playCheerSound = (type) => {
  try {
    switch (type) {
      case 'fireworks': playFireworksSound(); break;
      case 'applause': playApplauseSound(); break;
      case 'magic': playMagicSound(); break;
      case 'victory': playVictorySound(); break;
      default: playFireworksSound(); break;
    }
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};
