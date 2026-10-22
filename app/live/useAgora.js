import { useState, useEffect, useRef, useCallback } from 'react';

// We dynamically import Agora so it doesn't break SSR (Server-Side Rendering) in Next.js
let AgoraRTC = null;
if (typeof window !== 'undefined') {
  import('agora-rtc-sdk-ng').then((mod) => {
    AgoraRTC = mod.default;
  }).catch(err => console.error('Failed to load Agora SDK', err));
}

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export function useAgora(channelId, userId, userName, isTeacher, isEnabled) {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [agoraPeers, setAgoraPeers] = useState([]); 
  const clientRef = useRef(null);
  const joinedRef = useRef(false);
  const isMicOnRef = useRef(false);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const togglingMicRef = useRef(false);

  // Keep refs in sync and dynamically compensate remote volume when mic turns ON/OFF
  useEffect(() => { 
    isMicOnRef.current = isMicOn; 
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('micstatechange', { detail: { isMicOn } }));
    }
    try {
      const savedSpeakerBoost = parseFloat(localStorage.getItem('aljunaidi_speaker_boost') || '1.0');
      const baseVol = Math.floor(savedSpeakerBoost * 100);
      const finalVol = isMicOn ? Math.floor(baseVol * 1.45) : baseVol;
      agoraPeers.forEach(p => {
        if (p.audioTrack) {
          p.audioTrack.setVolume(Math.min(1000, finalVol));
        }
      });
    } catch (e) {}
  }, [isMicOn, agoraPeers]);
  useEffect(() => { localAudioTrackRef.current = localAudioTrack; }, [localAudioTrack]);
  useEffect(() => { localVideoTrackRef.current = localVideoTrack; }, [localVideoTrack]);

  // Initialize Agora Client when enabled
  useEffect(() => {
    if (isEnabled && !APP_ID) {
      alert('خطأ: كود APP_ID الخاص بسيرفر Agora غير موجود في الإعدادات!');
      return;
    }

    if (!isEnabled || !APP_ID || !channelId || !userId) {
      // If disabled, cleanup
      if (clientRef.current && joinedRef.current) {
        if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
        if (localVideoTrack) { localVideoTrack.stop(); localVideoTrack.close(); }
        clientRef.current.leave().catch(e => console.warn('Agora leave error:', e));
        joinedRef.current = false;
        setAgoraPeers([]);
        setIsMicOn(false);
        setIsCameraOn(false);
        setLocalAudioTrack(null);
        setLocalVideoTrack(null);
      }
      return;
    }

    let isCancelled = false;

    const initAgora = async () => {
      if (!AgoraRTC) {
        try {
          const mod = await import('agora-rtc-sdk-ng');
          AgoraRTC = mod.default;
        } catch (err) {
          console.error('Failed to load Agora SDK', err);
          return;
        }
      }
      
      if (isCancelled) return;

      if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      }
      const client = clientRef.current;

      // Helper to natively play audio and apply user-selected speaker boost + Anti-Ducking Compensation
      const playRemoteAudio = (audioTrack) => {
        if (!audioTrack) return;
        audioTrack.play();
        try {
          const savedSpeakerBoost = parseFloat(localStorage.getItem('aljunaidi_speaker_boost') || '1.0');
          // Agora volume range is 0 to 1000 (100 is default)
          const baseVol = Math.floor(savedSpeakerBoost * 100);
          const finalVol = isMicOnRef.current ? Math.floor(baseVol * 1.45) : baseVol;
          audioTrack.setVolume(Math.min(1000, finalVol));
        } catch(e) {}
      };

      client.on('user-published', async (user, mediaType) => {
        if (isCancelled) return;
        await client.subscribe(user, mediaType);
        if (isCancelled) return;
        
        // Play audio natively immediately upon subscribe!
        if (mediaType === 'audio' && user.audioTrack) {
          playRemoteAudio(user.audioTrack);
        }
        
        setAgoraPeers(prev => {
          const existing = prev.find(p => p.uid === user.uid);
          if (existing) {
            return prev.map(p => p.uid === user.uid ? { ...p, audioTrack: user.audioTrack || p.audioTrack, videoTrack: user.videoTrack || p.videoTrack } : p);
          }
          return [...prev, { uid: user.uid, audioTrack: user.audioTrack, videoTrack: user.videoTrack }];
        });
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio' && user.audioTrack) user.audioTrack.stop();
        setAgoraPeers(prev => {
          const existing = prev.find(p => p.uid === user.uid);
          if (existing) {
            return prev.map(p => p.uid === user.uid ? { ...p, audioTrack: mediaType === 'audio' ? null : p.audioTrack, videoTrack: mediaType === 'video' ? null : p.videoTrack } : p);
          }
          return prev;
        });
      });

      client.on('user-left', (user) => {
        setAgoraPeers(prev => prev.filter(p => p.uid !== user.uid));
      });

      // Handle network disconnections and freezing
      client.on('connection-state-change', (curState, revState, reason) => {
        console.log(`Agora Connection: ${curState} (Reason: ${reason})`);
        if (curState === 'RECONNECTING') {
          // You can dispatch a custom event here to show a UI toast to the teacher/student
          window.dispatchEvent(new CustomEvent('agora-reconnecting'));
        } else if (curState === 'CONNECTED') {
          window.dispatchEvent(new CustomEvent('agora-connected'));
        }
      });

      try {
        // Enable Dual Stream mode so students with bad internet get low-quality video instead of freezing!
        await client.enableDualStream().catch(console.warn);

        // Fetch token with strict 1.5s timeout to prevent start delays!
        let token = null;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(`/api/agora/token?channelName=` + encodeURIComponent(channelId) + `&uid=` + encodeURIComponent(userId), { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            token = data.token;
            console.log('Agora: token fetched successfully');
          }
        } catch (err) {
          console.warn('Agora token fetch skipped/timeout (fast join):', err.message);
        }

        if (isCancelled) return;
        await client.join(APP_ID, channelId, token, userId);
        
        // Critical Fix: Check if component unmounted or was disabled while we were awaiting join!
        if (isCancelled) {
            console.warn('Agora joined but component was disabled/cancelled during join. Leaving immediately.');
            await client.leave();
            return;
        }

        joinedRef.current = true;
        console.log('Agora: joined channel successfully');
        
        // Fix: Auto-subscribe to users who were already in the room before we joined (Late joiners)
        client.remoteUsers.forEach(async (user) => {
          if (user.hasAudio) {
            await client.subscribe(user, 'audio');
            if (isCancelled) return;
            if (user.audioTrack) playRemoteAudio(user.audioTrack);
          }
          if (user.hasVideo) {
            await client.subscribe(user, 'video');
            if (isCancelled) return;
          }
          setAgoraPeers(prev => {
            const existing = prev.find(p => p.uid === user.uid);
            if (existing) {
              return prev.map(p => p.uid === user.uid ? { ...p, audioTrack: user.audioTrack || p.audioTrack, videoTrack: user.videoTrack || p.videoTrack } : p);
            }
            return [...prev, { uid: user.uid, audioTrack: user.audioTrack, videoTrack: user.videoTrack }];
          });
        });

        // Auto-start mic instantly for teachers when they join
        if (isTeacher) {
          startAgoraAudio().then(ok => {
            if (ok) console.log('Agora: teacher mic auto-started');
          });
        }
      } catch (e) {
        console.error('Agora Join Error:', e);
      }
    };

    initAgora();

    return () => {
      isCancelled = true;
      // Cleanup on unmount (FIX: Ensure tracks are closed to prevent memory leaks/crashes)
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (clientRef.current && joinedRef.current) {
        clientRef.current.leave().catch(e => console.warn('Agora leave error:', e));
        joinedRef.current = false;
        setAgoraPeers([]);
      }
    };
  }, [isEnabled, channelId, userId]);

  // Start Audio
  const startAgoraAudio = async () => {
    if (!AgoraRTC || !clientRef.current || !joinedRef.current) return false;
    try {
      const preferredMic = localStorage.getItem('aljunaidi_mic_id');
      const echoCancel = localStorage.getItem('aljunaidi_echo_cancellation') !== 'false';
      const noiseSuppress = localStorage.getItem('aljunaidi_noise_suppression') !== 'false';
      const autoGain = localStorage.getItem('aljunaidi_auto_gain') !== 'false';
      const savedBitrate = localStorage.getItem('aljunaidi_mic_bitrate') || '128';

      const trackConfig = {
        encoderConfig: savedBitrate === '192' ? "music_standard" : savedBitrate === '128' ? "speech_standard" : "speech_low_quality", 
        AEC: echoCancel, 
        ANS: noiseSuppress,
        AGC: autoGain,
      };
      
      // Add microphoneId if a specific device was selected and it's not the default
      if (preferredMic && preferredMic !== 'default') {
        trackConfig.microphoneId = preferredMic;
      }

      const track = await AgoraRTC.createMicrophoneAudioTrack(trackConfig);
      await clientRef.current.publish([track]);
      localAudioTrackRef.current = track;
      isMicOnRef.current = true;
      setLocalAudioTrack(track);
      setIsMicOn(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resumeremoteaudio'));
        setTimeout(() => {
          document.querySelectorAll('audio').forEach(a => {
            if (a.paused && a.srcObject) {
              a.play().catch(() => {});
            }
          });
        }, 120);
      }
      return true;
    } catch (e) {
      console.error('Agora Mic Error:', e);
      return false;
    }
  };

  // Handle microphone device or audio DSP config change dynamically
  useEffect(() => {
    const handleMicChange = async (e) => {
      if (isMicOnRef.current && localAudioTrackRef.current) {
        // Stop current
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        if (clientRef.current) {
          await clientRef.current.unpublish([localAudioTrackRef.current]);
        }
        // Start new
        await startAgoraAudio();
      }
    };
    window.addEventListener('micdevicechange', handleMicChange);
    window.addEventListener('micconfigchange', handleMicChange);
    return () => {
      window.removeEventListener('micdevicechange', handleMicChange);
      window.removeEventListener('micconfigchange', handleMicChange);
    };
  }, []);

  // Toggle Mic (uses refs to avoid stale closure issues)
  const toggleAgoraMic = async () => {
    if (togglingMicRef.current) return; // prevent double-calls
    togglingMicRef.current = true;
    try {
      if (isMicOnRef.current && localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        if (clientRef.current) {
          await clientRef.current.unpublish([localAudioTrackRef.current]);
        }
        localAudioTrackRef.current = null;
        isMicOnRef.current = false;
        setLocalAudioTrack(null);
        setIsMicOn(false);
      } else {
        await startAgoraAudio();
      }
    } finally {
      togglingMicRef.current = false;
    }
  };

  // Stop all media
  const stopAgoraMedia = () => {
    if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
    if (localVideoTrack) { localVideoTrack.stop(); localVideoTrack.close(); }
    setIsMicOn(false);
    setIsCameraOn(false);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    if (clientRef.current && joinedRef.current) {
      clientRef.current.leave();
      joinedRef.current = false;
    }
    setAgoraPeers([]);
  };

    // Start Video
  const startAgoraVideo = async () => {
    if (!AgoraRTC || !clientRef.current || !joinedRef.current) return false;
    try {
      // Optimize video for better network stability (480p avoids crushing upload bandwidth)
      const track = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "480p_1" // 640x480, 15fps, 500Kbps (Very stable)
      });
      await clientRef.current.publish([track]);
      localVideoTrackRef.current = track;
      setLocalVideoTrack(track);
      setIsCameraOn(true);
      return true;
    } catch (e) {
      console.error('Agora Camera Error:', e);
      return false;
    }
  };

  // Toggle Video
  const toggleAgoraVideo = async () => {
    if (isCameraOn && localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      if (clientRef.current) {
        await clientRef.current.unpublish([localVideoTrackRef.current]).catch(console.warn);
      }
      localVideoTrackRef.current = null;
      setLocalVideoTrack(null);
      setIsCameraOn(false);
    } else {
      await startAgoraVideo();
    }
  };

  return {
    startAgoraAudio,
    toggleAgoraMic,
    toggleAgoraVideo,
    stopAgoraMedia,
    isAgoraMicOn: isMicOn,
    isAgoraCameraOn: isCameraOn,
    localAgoraVideoTrack: localVideoTrack,
    agoraPeers
  };
}




