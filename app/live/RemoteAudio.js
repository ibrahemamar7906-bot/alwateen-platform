'use client';
import { useEffect, useRef } from 'react';
import { applyAudioSink, getActiveAudioSinkId } from './AudioOutputSelector';

export const RemoteAudio = ({ stream }) => {
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isMicOnRef = useRef(false);

  useEffect(() => {
    if (!stream) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Helper to calculate total volume with Anti-Ducking Compensation
    const getEffectiveVolume = (baseBoost, micActive) => {
      const boost = typeof baseBoost === 'number' ? baseBoost : parseFloat(localStorage.getItem('alwateen_speaker_boost') || '1.0');
      // If user's microphone is open, compensate by +45% to counter OS/browser ducking!
      const compensation = micActive ? 1.45 : 1.0;
      return boost * compensation;
    };

    const applyVolume = (boostVal) => {
      try {
        const effectiveVol = getEffectiveVolume(boostVal, isMicOnRef.current);
        
        // 1. If Web Audio GainNode is active, apply amplified gain (bypasses 1.0 HTML limit!)
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(effectiveVol, audioCtxRef.current?.currentTime || 0);
          audio.volume = 1.0;
        } else {
          // Standard HTMLMediaElement fallback (clamped to 1.0 max)
          audio.volume = Math.min(1.0, Math.max(0.1, effectiveVol > 1.0 ? 1.0 : effectiveVol));
        }
      } catch (e) {
        console.warn('[RemoteAudio] applyVolume error:', e);
      }
    };

    // Initialize Web Audio API Gain Node for pure high-power audio amplification & anti-ducking
    const initWebAudioBoost = () => {
      if (sourceNodeRef.current || !stream) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        // Reuse shared context or create fresh
        const ctx = window._sharedLiveAudioCtx && window._sharedLiveAudioCtx.state !== 'closed' 
          ? window._sharedLiveAudioCtx 
          : new AudioCtx();
        window._sharedLiveAudioCtx = ctx;
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const source = ctx.createMediaStreamSource(stream);
        sourceNodeRef.current = source;

        const gainNode = ctx.createGain();
        gainNodeRef.current = gainNode;

        const effectiveVol = getEffectiveVolume(null, isMicOnRef.current);
        gainNode.gain.setValueAtTime(effectiveVol, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Mute the underlying <audio> element to prevent dual playback since Web Audio handles output
        audio.muted = true;
      } catch (err) {
        console.warn('[RemoteAudio] Web Audio GainNode fallback:', err);
        audio.muted = false;
        applyVolume();
      }
    };

    const safePlay = () => {
      if (!audio) return;
      if (audio.srcObject !== stream) {
        audio.srcObject = stream;
      }

      initWebAudioBoost();
      applyVolume();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.debug('[RemoteAudio] Autoplay pending touch gesture:', err?.name);
        });
      }

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    // Initial play
    safePlay();

    // Re-apply current sink ID safely
    if (typeof applyAudioSink === 'function') {
      try { applyAudioSink(audio, getActiveAudioSinkId()); } catch (e) {}
    }

    // Auto-resume if mobile OS / browser pauses audio during mic activation or phone call
    const handlePause = () => {
      const hasLiveAudio = stream.getAudioTracks().some(t => t.readyState === 'live');
      if (hasLiveAudio) {
        setTimeout(safePlay, 100);
      }
    };
    audio.addEventListener('pause', handlePause);

    // Track listeners
    stream.onaddtrack = safePlay;
    stream.getAudioTracks().forEach(t => { 
      t.onunmute = safePlay;
      t.onended = () => {};
    });

    // Global event listeners for dynamic changes
    const handleResumeSignal = () => {
      setTimeout(safePlay, 80);
    };

    const handleVolumeChange = (e) => {
      if (e.detail && typeof e.detail.volume === 'number') {
        applyVolume(e.detail.volume);
      }
    };

    const handleSinkChange = (e) => {
      if (e.detail && e.detail.sinkId) {
        applyAudioSink(audio, e.detail.sinkId);
      }
    };

    // Anti-Ducking handler when microphone turns ON / OFF
    const handleMicStateChange = (e) => {
      const isMicOn = !!(e.detail && e.detail.isMicOn);
      isMicOnRef.current = isMicOn;
      applyVolume();
    };

    window.addEventListener('resumeremoteaudio', handleResumeSignal);
    window.addEventListener('micdevicechange', handleResumeSignal);
    window.addEventListener('speakervolumechange', handleVolumeChange);
    window.addEventListener('audiosinkchange', handleSinkChange);
    window.addEventListener('micstatechange', handleMicStateChange);

    // Global touch / click unlocks
    window.addEventListener('click', safePlay, { passive: true });
    window.addEventListener('touchstart', safePlay, { passive: true });

    return () => {
      try {
        audio.pause();
        audio.srcObject = null;
      } catch (_) {}
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch (_) {}
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (_) {}
        gainNodeRef.current = null;
      }
      audio.removeEventListener('pause', handlePause);
      window.removeEventListener('resumeremoteaudio', handleResumeSignal);
      window.removeEventListener('micdevicechange', handleResumeSignal);
      window.removeEventListener('speakervolumechange', handleVolumeChange);
      window.removeEventListener('audiosinkchange', handleSinkChange);
      window.removeEventListener('micstatechange', handleMicStateChange);
      window.removeEventListener('click', safePlay);
      window.removeEventListener('touchstart', safePlay);
    };
  }, [stream]);

  return (
    <audio 
      ref={audioRef} 
      autoPlay 
      playsInline 
      style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, pointerEvents: 'none', opacity: 0 }} 
    />
  );
};
