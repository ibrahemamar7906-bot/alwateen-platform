import { useState, useEffect, useRef, useCallback } from 'react'

// Enterprise ICE Servers for instantaneous connection across 3G/4G/5G, Wi-Fi and firewalls
const ENTERPRISE_ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    // Free TURN Server for 4G/LTE/Strict Firewalls
    { 
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    { 
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    { 
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ];

// SDP Optimizer for weak 3G/4G/5G mobile & Wi-Fi networks (Zero-latency Opus voice + FEC, Data Saver Video)
const optimizeSdpForMobileNetworks = (sdp) => {
  if (!sdp) return sdp;
  let modified = sdp;
  
  // Dynamic audio bitrate from user preference (default 32kbps mono, or 64kbps/128kbps)
  let maxBitrate = 32000;
  try {
    const savedBitrate = typeof window !== 'undefined' ? localStorage.getItem('alwateen_mic_bitrate') : null;
    if (savedBitrate === '192') maxBitrate = 128000;
    else if (savedBitrate === '128') maxBitrate = 64000;
    else if (savedBitrate === '64') maxBitrate = 32000;
  } catch (e) {}

  // Enable Opus Forward Error Correction (recovers 20-30% dropped packets), DTX, 10ms frame size
  modified = modified.replace(/a=fmtp:(\d+) (.*)/g, (match, pt, params) => {
    if (params.includes('minptime=')) return match;
    return `a=fmtp:${pt} ${params};minptime=10;useinbandfec=1;usedtx=1;maxaveragebitrate=${maxBitrate};stereo=0`;
  });
  
  // Restrict Video Bandwidth to save data (b=AS: bitrate in kbps). 150kbps is enough for a small 360p bubble.
  modified = modified.replace(/m=video (.*)\r\n/g, (match) => {
    return match + 'b=AS:150\r\n';
  });

  return modified;
};

export function useWebRTC(channel, userId, userName, isTeacher, isEnabled = true) {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]); // Array of { id, name, stream, isTeacher, hasVideo, facingMode }
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [pingMs, setPingMs] = useState(null);
  const [networkQuality, setNetworkQuality] = useState('excellent'); // 'excellent' | 'good' | 'poor'
  const [conferenceMode, setConferenceMode] = useState(false);
  const [sessionInstanceId] = useState(() => Math.random().toString(36).substring(7)); // ًں”ٹ true = all-hear-all (Mesh P2P)
  
  // Peer state references: remoteUserId -> { pc, isPolite, audioTransceiver, videoTransceiver, remoteStream, name, isTeacher, hasVideo }
  const peerMap = useRef({});
  const pendingCandidates = useRef({}); // map of remoteUserId -> Array of ICE candidates
  const localStreamRef = useRef(null);
  const isMicOnRef = useRef(false);
  const isCameraOnRef = useRef(false);
  const isAudioEnabledRef = useRef(false);
  const facingModeRef = useRef('user');
  const conferenceModeRef = useRef(false);
  const enabledRef = useRef(isEnabled);

  useEffect(() => {
    enabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('micstatechange', { detail: { isMicOn } }));
    }
  }, [isMicOn]);

  useEffect(() => {
    isCameraOnRef.current = isCameraOn;
  }, [isCameraOn]);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  useEffect(() => {
    const handleTTSMute = (e) => {
      const shouldMute = e.detail.mute;
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !shouldMute; // temporarily disable track to prevent echo
        }
      }
    };
    window.addEventListener('ttsmute', handleTTSMute);
    return () => window.removeEventListener('ttsmute', handleTTSMute);
  }, []);

  // Keep channel in a ref so safeSend always uses latest channel
  const channelRef = useRef(channel);
  // Track channel identity separately â€” used to re-register listeners only when channel truly changes
  const channelIdRef = useRef(null);
  useEffect(() => {
    channelRef.current = channel;
    // Force re-registration of signaling listeners when channel object changes
    if (channel && channel !== channelIdRef.current) {
      channelIdRef.current = channel;
      setChannelVersion(v => v + 1);
    }
  }, [channel]);
  const [channelVersion, setChannelVersion] = useState(0);

  const safeSend = useCallback((event, payload) => {
    const trySend = (retries = 25) => {
      const currentCh = channelRef.current;
      if (!currentCh) {
        if (retries > 0) setTimeout(() => trySend(retries - 1), 200);
        return;
      }
      try {
        let isSocketReady = false;
        if (typeof currentCh.canPush === 'function') {
          try { isSocketReady = currentCh.canPush(); } catch (_) { isSocketReady = false; }
        } else {
          isSocketReady = currentCh.state === 'joined' && !!currentCh.socket && typeof currentCh.socket.isConnected === 'function' && currentCh.socket.isConnected();
        }

        if (isSocketReady) {
          currentCh.send({
            type: 'broadcast',
            event,
            payload
          }).catch(() => {});
        } else if (retries > 0) {
          setTimeout(() => trySend(retries - 1), 200);
        }
      } catch (e) {}
    };
    trySend();
  }, []); // No channel dependency â€” uses ref

  // Keep channel in a ref so signaling effect never needs to re-run when channel object changes

  // Drain buffered ICE candidates after remote description is set
  const processPendingCandidates = useCallback(async (remoteUserId, pc) => {
    const queue = pendingCandidates.current[remoteUserId];
    if (queue && queue.length > 0 && pc && pc.remoteDescription && pc.remoteDescription.type) {
      while (queue.length > 0) {
        const cand = queue.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('[WebRTC] Buffered ICE candidate add error:', e);
        }
      }
    }
  }, []);

  // Update transceivers with current local tracks without needing renegotiation
  const updateTransceiverTracks = useCallback((peerInfo) => {
    if (!peerInfo || !peerInfo.pc || peerInfo.pc.connectionState === 'closed') return;
    
    // Resolve transceivers if not assigned
    if (!peerInfo.audioTransceiver || !peerInfo.videoTransceiver) {
      const transceivers = peerInfo.pc.getTransceivers();
      if (!peerInfo.audioTransceiver) {
        peerInfo.audioTransceiver = transceivers.find(t => 
          (t.receiver && t.receiver.track && t.receiver.track.kind === 'audio') ||
          (t.sender && t.sender.track && t.sender.track.kind === 'audio')
        ) || transceivers[0] || null;
      }
      if (!peerInfo.videoTransceiver) {
        peerInfo.videoTransceiver = transceivers.find(t => 
          (t.receiver && t.receiver.track && t.receiver.track.kind === 'video') ||
          (t.sender && t.sender.track && t.sender.track.kind === 'video')
        ) || transceivers[1] || null;
      }
    }

    const currentStream = localStreamRef.current;
    const audioTrack = (currentStream && isAudioEnabledRef.current) ? currentStream.getAudioTracks().find(t => t.readyState === 'live') || null : null;
    const videoTrack = (currentStream && isCameraOnRef.current) ? currentStream.getVideoTracks().find(t => t.readyState === 'live') || null : null;

    let needsRenegotiation = false;

    // Update audio track
    if (peerInfo.audioTransceiver) {
      if (peerInfo.audioTransceiver.sender) {
        peerInfo.audioTransceiver.sender.replaceTrack(audioTrack).catch(err => {
          console.warn('[WebRTC] replaceTrack audio warning:', err);
        });
      }
      if (audioTrack && peerInfo.audioTransceiver.direction !== 'sendrecv' && peerInfo.audioTransceiver.direction !== 'sendonly') {
        try { peerInfo.audioTransceiver.direction = 'sendrecv'; } catch(e){}
        needsRenegotiation = true;
      }
    }

    // Update video track
    if (peerInfo.videoTransceiver) {
      if (peerInfo.videoTransceiver.sender) {
        peerInfo.videoTransceiver.sender.replaceTrack(videoTrack).catch(err => {
          console.warn('[WebRTC] replaceTrack video warning:', err);
        });
      }
      if (videoTrack && peerInfo.videoTransceiver.direction !== 'sendrecv' && peerInfo.videoTransceiver.direction !== 'sendonly') {
        try { peerInfo.videoTransceiver.direction = 'sendrecv'; } catch(e){}
        needsRenegotiation = true;
      }
    }

    if (needsRenegotiation) {
      // Small timeout to allow replaceTrack to initialize before renegotiating
      setTimeout(() => initiateOffer(peerInfo.id, peerInfo.pc, peerInfo), 100);
    }
  }, []);

  // Create Peer Connection
  const getOrCreatePeerConnection = useCallback((remoteUserId, remoteUserName, remoteIsTeacher) => {
    if (peerMap.current[remoteUserId]) {
      const existing = peerMap.current[remoteUserId];
      if (existing.pc && existing.pc.connectionState !== 'closed' && existing.pc.connectionState !== 'failed') {
        if (remoteUserName) existing.name = remoteUserName;
        existing.isTeacher = remoteIsTeacher;
        updateTransceiverTracks(existing);
        return existing.pc;
      }
    }

    // Teacher is impolite, student is polite.
    const isPolite = isTeacher ? false : (remoteIsTeacher ? true : (userId > remoteUserId));

    const pc = new RTCPeerConnection({
      iceServers: ENTERPRISE_ICE_SERVERS,
      iceCandidatePoolSize: 6,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all'
    });

    const currentStream = localStreamRef.current;
    const initialAudio = (currentStream && isAudioEnabledRef.current) ? currentStream.getAudioTracks().find(t => t.readyState === 'live') || null : null;
    const initialVideo = (currentStream && isCameraOnRef.current) ? currentStream.getVideoTracks().find(t => t.readyState === 'live') || null : null;

    // Only add transceivers if we are the initiator (Teacher) or if none exist
    let audioTransceiver = null;
    let videoTransceiver = null;
    if (isTeacher) {
      try {
        if (typeof pc.addTransceiver === 'function') {
          audioTransceiver = pc.addTransceiver(initialAudio || 'audio', { direction: 'sendrecv' });
          videoTransceiver = pc.addTransceiver(initialVideo || 'video', { direction: 'sendrecv' });
        }
      } catch (e) {
        console.warn('[WebRTC] Transceiver setup fallback:', e);
      }
    }

    const remoteStream = new MediaStream();

    const peerInfo = {
      pc,
      makingOffer: false,
      ignoreOffer: false,
      isSettingRemoteAnswerPending: false,
      isPolite,
      name: remoteUserName || (remoteIsTeacher ? 'المعلم' : 'طالب'),
      isTeacher: remoteIsTeacher,
      audioTransceiver,
      videoTransceiver,
      remoteStream,
      hasVideo: false
    };

    peerMap.current[remoteUserId] = peerInfo;
    if (!pendingCandidates.current[remoteUserId]) {
      pendingCandidates.current[remoteUserId] = [];
    }

    // ICE Candidate handler (Batched to prevent 429 Too Many Requests)
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (!peerInfo.iceCandidateBatch) {
          peerInfo.iceCandidateBatch = [];
          setTimeout(() => {
            if (peerInfo.iceCandidateBatch && peerInfo.iceCandidateBatch.length > 0) {
              safeSend('webrtc_signal', { 
                target: remoteUserId, 
                sender: userId, 
                signal: { type: 'ice-candidate-batch', candidates: peerInfo.iceCandidateBatch } 
              });
              peerInfo.iceCandidateBatch = null;
            }
          }, 1000); // Send all candidates gathered in 1 second as a single payload
        }
        peerInfo.iceCandidateBatch.push(event.candidate);
      }
    };

    // Remote Track Handler
    pc.ontrack = (event) => {
      const incomingTrack = event.track;
      
      if (!peerInfo.remoteStream.getTracks().some(t => t.id === incomingTrack.id)) {
        peerInfo.remoteStream.addTrack(incomingTrack);
      }

      // Check if video is live
      const videoLive = peerInfo.remoteStream.getVideoTracks().some(t => t.enabled && t.readyState === 'live');
      peerInfo.hasVideo = videoLive;

      // Always produce a new MediaStream instance so React components re-render immediately
      const updatedStream = new MediaStream(peerInfo.remoteStream.getTracks());

      setPeers(prev => {
        const existingIdx = prev.findIndex(p => p.id === remoteUserId);
        const peerData = {
          id: remoteUserId,
          name: remoteUserName || (remoteIsTeacher ? 'المعلم' : 'طالب'),
          isTeacher: remoteIsTeacher,
          stream: updatedStream,
          hasVideo: videoLive
        };

        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = peerData;
          return next;
        } else {
          return [...prev, peerData];
        }
      });

      const refreshState = () => {
        const hasVid = peerInfo.remoteStream.getVideoTracks().some(t => t.enabled && t.readyState === 'live');
        peerInfo.hasVideo = hasVid;
        setPeers(prev => prev.map(p => p.id === remoteUserId ? { ...p, hasVideo: hasVid, stream: new MediaStream(peerInfo.remoteStream.getTracks()) } : p));
      };

      incomingTrack.onunmute = refreshState;
      incomingTrack.onended = refreshState;
    };

    // Keepalive DataChannel to keep NAT pinhole open and prevent mobile connection drops
    if (isTeacher) {
      try {
        const dc = pc.createDataChannel('keepalive', { ordered: false, maxRetransmits: 0 });
        dc.onopen = () => {
          dc._pingInterval = setInterval(() => {
            if (dc.readyState === 'open') {
              try { dc.send('ping'); } catch (e) {}
            }
          }, 8000);
        };
        dc.onclose = () => {
          if (dc._pingInterval) clearInterval(dc._pingInterval);
        };
      } catch (e) {}
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dc.onmessage = (msg) => {
          if (msg.data === 'ping' && dc.readyState === 'open') {
            try { dc.send('pong'); } catch (e) {}
          }
        };
      };
    }      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          const pInfo = peerMap.current[remoteUserId];
          if (pInfo && !pInfo.isRestartingIce) {
            pInfo.isRestartingIce = true;
            console.log(`[WebRTC] ICE ${pc.iceConnectionState} for ${remoteUserId}. Restarting ICE...`);
            try { 
              pc.restartIce(); 
              if (isTeacher) {
                initiateOffer(remoteUserId, pc, pInfo);
              }
            } catch (e) {}
            setTimeout(() => { if (pInfo) pInfo.isRestartingIce = false; }, 3000);
          }
        }
      };
    
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        const pInfo = peerMap.current[remoteUserId];
        if (pInfo && !pInfo.isRestartingIce) {
          pInfo.isRestartingIce = true;
          try {
            pc.restartIce();
            if (isTeacher) {
              initiateOffer(remoteUserId, pc, pInfo);
            }
          } catch (e) {}
          setTimeout(() => { if (pInfo) pInfo.isRestartingIce = false; }, 5000);
        }
        
        setTimeout(() => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
            setPeers(prev => prev.filter(p => p.id !== remoteUserId));
            delete peerMap.current[remoteUserId];
            delete pendingCandidates.current[remoteUserId];
          }
        }, 15000);
      } else if (pc.connectionState === 'closed') {
        setPeers(prev => prev.filter(p => p.id !== remoteUserId));
        delete peerMap.current[remoteUserId];
        delete pendingCandidates.current[remoteUserId];
      }
    };

    return pc;
  }, [safeSend, userId, isTeacher, updateTransceiverTracks]);

  // Initiate initial offer to a remote peer (Teacher Initiates)
  const initiateOffer = useCallback(async (remoteUserId, pc, peerInfo) => {
    if (!pc || pc.connectionState === 'closed') return;
    try {
      peerInfo.makingOffer = true;
      
      // If stuck in a weird state from a previous sleep/disconnect, try to reset it
      if (pc.signalingState !== 'stable' && typeof pc.restartIce === 'function') {
        try {
          // A little hack to force state rollback if supported
          if (pc.setLocalDescription) await pc.setLocalDescription({ type: 'rollback' }).catch(()=>{});
        } catch (e) {}
      }
      
      // Ensure transceivers exist before offering (critical for student-to-student P2P)
      if (pc.getTransceivers().length === 0 && typeof pc.addTransceiver === 'function') {
        const currentStream = localStreamRef.current;
        const initialAudio = (currentStream && isAudioEnabledRef.current) ? currentStream.getAudioTracks().find(t => t.readyState === 'live') || null : null;
        const initialVideo = (currentStream && isCameraOnRef.current) ? currentStream.getVideoTracks().find(t => t.readyState === 'live') || null : null;
        try {
          peerInfo.audioTransceiver = pc.addTransceiver(initialAudio || 'audio', { direction: 'sendrecv' });
          peerInfo.videoTransceiver = pc.addTransceiver(initialVideo || 'video', { direction: 'sendrecv' });
        } catch (e) {
          console.warn('[WebRTC] initiateOffer transceiver setup fallback:', e);
        }
      }
      
      updateTransceiverTracks(peerInfo);
      
      const rawOffer = await pc.createOffer();
      const optimizedSdp = optimizeSdpForMobileNetworks(rawOffer.sdp);
      const offer = { type: rawOffer.type, sdp: optimizedSdp };

      if (pc.signalingState === 'stable') {
        await pc.setLocalDescription(offer);
        safeSend('webrtc_signal', { 
          target: remoteUserId, 
          sender: userId, 
          senderName: userName, 
          senderIsTeacher: isTeacher, 
          signal: { type: 'offer', offer: pc.localDescription } 
        });
      }
    } catch (err) {
      console.warn(`[WebRTC] initiateOffer error for ${remoteUserId}:`, err);
    } finally {
      peerInfo.makingOffer = false;
    }
  }, [safeSend, userId, userName, isTeacher, updateTransceiverTracks]);

  // Start Audio (Microphone) - Mobile resilient with fallbacks
  const startAudio = async () => {
    try {
      let stream = null;
      try {
        const preferredMic = localStorage.getItem('alwateen_mic_id');
        const echoCancel = localStorage.getItem('alwateen_echo_cancellation') !== 'false';
        const noiseSuppress = localStorage.getItem('alwateen_noise_suppression') !== 'false';
        const autoGain = localStorage.getItem('alwateen_auto_gain') !== 'false';

        let audioConfig = { 
          echoCancellation: echoCancel, 
          noiseSuppression: noiseSuppress, 
          autoGainControl: autoGain
        };
        if (preferredMic && preferredMic !== 'default') {
          audioConfig.deviceId = { exact: preferredMic };
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: audioConfig,
          video: false
        });
      } catch (e1) {
        if (e1.name === 'NotReadableError' || e1.name === 'TrackStartError') {
          if (typeof window !== 'undefined') {
            const div = document.createElement('div');
            div.textContent = '❌ تعذر الوصول للميكروفون (مستخدم بواسطة تطبيق آخر).';
            div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 5000);
          }
          throw e1;
        }
        // Fallback for strict mobile devices
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e2) {
          if (e2.name === 'NotReadableError' || e2.name === 'TrackStartError') {
            if (typeof window !== 'undefined') {
              const div = document.createElement('div');
              div.textContent = '⚠️ الميكروفون مستخدم حالياً من تطبيق آخر (مثل مكالمة هاتفية).';
              div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
              document.body.appendChild(div);
              setTimeout(() => div.remove(), 5000);
            }
          }
          throw e2;
        }
      }

      let audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return false;

      // Critical Fix: Abort if component was disabled while awaiting permissions
      if (!enabledRef.current) {
        console.warn('[WebRTC] startAudio aborted because WebRTC was disabled during join');
        stream.getTracks().forEach(t => t.stop());
        return false;
      }

      // --- ADVANCED MIC BOOST USING WEB AUDIO API ---
      try {
        const savedMicBoost = parseFloat(localStorage.getItem('alwateen_mic_boost') || '1.0');
        if (savedMicBoost > 1.0) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            if (!window._sharedAudioCtx) {
              window._sharedAudioCtx = new AudioCtx();
            }
            const ctx = window._sharedAudioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const source = ctx.createMediaStreamSource(stream);
            const gainNode = ctx.createGain();
            
            gainNode.gain.value = savedMicBoost;
            
            const dest = ctx.createMediaStreamDestination();
            source.connect(gainNode);
            gainNode.connect(dest);
            
            // Listen to global mic volume change
            window.addEventListener('micvolumechange', (e) => {
              if (gainNode && gainNode.gain) {
                gainNode.gain.value = e.detail.volume;
              }
            });
            
            // Replace the track with the boosted one
            const boostedTrack = dest.stream.getAudioTracks()[0];
            if (boostedTrack) {
              audioTrack = boostedTrack;
              stream = new MediaStream([audioTrack, ...stream.getVideoTracks()]);
            }
          }
        }
      } catch (boostErr) {
        console.warn('Could not apply mic boost:', boostErr);
      }
      // ----------------------------------------------

      if (localStreamRef.current) {
        const oldAudio = localStreamRef.current.getAudioTracks()[0];
        if (oldAudio) {
          oldAudio.stop();
          localStreamRef.current.removeTrack(oldAudio);
        }
        localStreamRef.current.addTrack(audioTrack);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      } else {
        setLocalStream(stream);
        localStreamRef.current = stream;
      }

      setIsMicOn(true);
      setIsAudioEnabled(true);
      isAudioEnabledRef.current = true;

      // Instantly inject the live audio track into all active peer connections
      Object.values(peerMap.current).forEach(peerInfo => {
        if (peerInfo.pc.getTransceivers().length === 0 && typeof peerInfo.pc.addTransceiver === 'function') {
          try {
            peerInfo.audioTransceiver = peerInfo.pc.addTransceiver('audio', { direction: 'sendrecv' });
            peerInfo.videoTransceiver = peerInfo.pc.addTransceiver('video', { direction: 'sendrecv' });
            initiateOffer(peerInfo.id, peerInfo.pc, peerInfo);
          } catch(e) { console.warn('addTransceiver error:', e); }
        } else {
          updateTransceiverTracks(peerInfo);
        }
      });

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
      console.warn('Mic permission error:', e);
      // Use non-blocking notification instead of alert() to prevent JS thread freeze
      if (typeof window !== 'undefined') {
        const div = document.createElement('div');
        div.textContent = '⚠️ تعذر فتح الميكروفون — تأكد من إذن الميكروفون في المتصفح.';
        div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
      }
      return false;
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOnRef.current) {
        // Turn off camera
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.stop();
            localStreamRef.current.removeTrack(videoTrack);
          }
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
        setIsCameraOn(false);
        isCameraOnRef.current = false;
        setPeers(prev => prev.map(p => p.id === userId ? { ...p, hasVideo: false } : p));
        
        // Instantly clear video track on all active transceivers
        Object.values(peerMap.current).forEach(peerInfo => {
          updateTransceiverTracks(peerInfo);
        });

        safeSend('webrtc_camera_state', { userId, isCameraOn: false, facingMode: facingModeRef.current });
      } else {
        // Turn on camera
        let videoStream = null;
        try {
          videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: { ideal: facingModeRef.current },
              width: { ideal: 480, max: 640 }, 
              height: { ideal: 360, max: 480 }, 
              frameRate: { ideal: 20, max: 24 }
            },
            audio: !isAudioEnabledRef.current ? { echoCancellation: true, noiseSuppression: true } : false
          });
        } catch (e1) {
          if (e1.name === 'NotReadableError' || e1.name === 'TrackStartError') {
            if (typeof window !== 'undefined') {
              const div = document.createElement('div');
              div.textContent = '⚠️ الكاميرا مستخدمة حالياً من تطبيق آخر.';
              div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
              document.body.appendChild(div);
              setTimeout(() => div.remove(), 5000);
            }
            throw e1;
          }
          try {
            videoStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: { ideal: facingModeRef.current } },
              audio: !isAudioEnabledRef.current ? true : false
            });
          } catch (e2) {
            if (e2.name === 'NotReadableError' || e2.name === 'TrackStartError') {
              if (typeof window !== 'undefined') {
                const div = document.createElement('div');
                div.textContent = '⚠️ الكاميرا مستخدمة حالياً من تطبيق آخر.';
                div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 5000);
              }
              throw e2;
            }
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
        }

        if (!enabledRef.current) {
          console.warn('[WebRTC] toggleCamera aborted because WebRTC was disabled during join');
          videoStream.getTracks().forEach(t => t.stop());
          return;
        }

        const newVideoTrack = videoStream.getVideoTracks()[0];
        const newAudioTrack = videoStream.getAudioTracks()[0];

        if (!localStreamRef.current) {
          setLocalStream(videoStream);
          localStreamRef.current = videoStream;
          if (newAudioTrack) {
            setIsAudioEnabled(true);
            isAudioEnabledRef.current = true;
            setIsMicOn(true);
          }
        } else {
          const oldVideo = localStreamRef.current.getVideoTracks()[0];
          if (oldVideo) {
            oldVideo.stop();
            localStreamRef.current.removeTrack(oldVideo);
          }
          localStreamRef.current.addTrack(newVideoTrack);
          if (newAudioTrack && localStreamRef.current.getAudioTracks().length === 0) {
            localStreamRef.current.addTrack(newAudioTrack);
            setIsAudioEnabled(true);
            isAudioEnabledRef.current = true;
            setIsMicOn(true);
          }
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        setIsCameraOn(true);
        isCameraOnRef.current = true;

        // Instantly inject the new video track into all active peer connections
        Object.values(peerMap.current).forEach(peerInfo => {
          if (peerInfo.pc.getTransceivers().length === 0 && typeof peerInfo.pc.addTransceiver === 'function') {
            try {
              peerInfo.audioTransceiver = peerInfo.pc.addTransceiver('audio', { direction: 'sendrecv' });
              peerInfo.videoTransceiver = peerInfo.pc.addTransceiver('video', { direction: 'sendrecv' });
              initiateOffer(peerInfo.id, peerInfo.pc, peerInfo);
            } catch(e) { console.warn('addTransceiver error:', e); }
          } else {
            updateTransceiverTracks(peerInfo);
          }
        });

        safeSend('webrtc_camera_state', { userId, isCameraOn: true, facingMode: facingModeRef.current });
      }
    } catch (e) {
      console.warn('Camera toggle error:', e);
      // Use non-blocking notification instead of alert() to prevent JS thread freeze
      if (typeof window !== 'undefined') {
        const div = document.createElement('div');
        div.textContent = '⚠️ تعذر فتح الكاميرا — تأكد من إذن الكاميرا في المتصفح.';
        div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
      }
    }
  };

  // Robust Camera Switching (Front <-> Back) with Hardware Release
  const switchCamera = async () => {
    const nextMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = nextMode;
    setFacingMode(nextMode);

    if (!isCameraOnRef.current || !localStreamRef.current) {
      return nextMode;
    }

    try {
      // 1. MUST stop and remove old video track FIRST so mobile hardware releases camera lock
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }

      // 2. Try to get new stream with ideal facingMode
      let newStream = null;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: nextMode },
            width: { ideal: 480, max: 640 },
            height: { ideal: 360, max: 480 },
            frameRate: { ideal: 20, max: 24 }
          },
          audio: false
        });
      } catch (e1) {
        // Fallback: try by device enumeration
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          if (videoDevices.length > 1) {
            const targetDev = nextMode === 'environment' ? videoDevices[videoDevices.length - 1] : videoDevices[0];
            newStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: targetDev.deviceId } },
              audio: false
            });
          }
        } catch (e2) {}
      }

      // Final fallback
      if (!newStream) {
        newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) return nextMode;

      // Add new video track to local stream
      localStreamRef.current.addTrack(newVideoTrack);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

      // Instantly inject new camera track into all active peer connections
      Object.values(peerMap.current).forEach(peerInfo => {
        updateTransceiverTracks(peerInfo);
      });

      safeSend('webrtc_camera_state', { userId, isCameraOn: true, facingMode: nextMode });
      return nextMode;
    } catch (err) {
      console.warn('Camera switch fallback warning:', err);
      facingModeRef.current = nextMode === 'user' ? 'environment' : 'user';
      setFacingMode(facingModeRef.current);
      return facingModeRef.current;
    }
  };

  // Main WebRTC Signaling Handlers â€” runs once per userId change, uses channelRef internally
  useEffect(() => {
    if (!isEnabled) {
      stopMedia();
      return;
    }
    if (!userId) return;
    const ch = channelRef.current;
    if (!ch) return;

    // 1. When anyone joins
    ch.on('broadcast', { event: 'webrtc_join' }, async ({ payload }) => {
      if (!enabledRef.current) return;
      if (!payload || payload.userId === userId) return;
      
      let existingPeerInfo = peerMap.current[payload.userId];
      
      // If the peer is already connected with the EXACT SAME session instance, ignore duplicate join broadcasts!
      if (existingPeerInfo && existingPeerInfo.sessionInstanceId === payload.sessionInstanceId && payload.sessionInstanceId && !payload.forceNuke) {
        return;
      }

      // Always nuke existing connection on NEW webrtc_join to ensure a completely fresh start!
      if (existingPeerInfo && existingPeerInfo.pc) {
        try { existingPeerInfo.pc.close(); } catch (e) {}
        delete peerMap.current[payload.userId];
        setPeers(prev => prev.filter(p => p.id !== payload.userId));
      }

      const pc = getOrCreatePeerConnection(payload.userId, payload.userName, payload.isTeacher);
      const peerInfo = peerMap.current[payload.userId];
      if (peerInfo) peerInfo.sessionInstanceId = payload.sessionInstanceId;

      if (isTeacher && peerInfo) {
        // Teacher creates the offer to connect to this student
        await initiateOffer(payload.userId, pc, peerInfo);
        
        // If Conference Mode is ON, inform the late joiner!
        if (conferenceModeRef.current) {
          setTimeout(() => {
            const peerList = Object.entries(peerMap.current).map(([id, info]) => ({
              id, name: info.name, isTeacher: info.isTeacher
            }));
            peerList.push({ id: userId, name: userName, isTeacher: true });
            safeSend('conference_mode_on', { peers: peerList });
          }, 2000); // Give the student time to establish the teacher connection first
        }
      } else if (!isTeacher && payload.isTeacher) {
        // Student received Teacher announcement -> Reply back so Teacher gets our userId and initiates offer
        safeSend('webrtc_join', { userId, userName, isTeacher: false, sessionInstanceId });
      } else if (!isTeacher && !payload.isTeacher && conferenceModeRef.current && peerInfo) {
        // ًں”ٹ Conference Mode: Wait for the Teacher's 'conference_mode_on' broadcast
        // The teacher automatically broadcasts 'conference_mode_on' 2 seconds after a student joins.
        // That broadcast will trigger the correct initiateOffer logic for everyone, preventing race conditions.
      }
    });

    // 2. WebRTC Signals (Offer, Answer, ICE Candidates)
    ch.on('broadcast', { event: 'webrtc_signal' }, async ({ payload }) => {
      if (!enabledRef.current) return;
      if (!payload || payload.target !== userId) return;
      
      const { sender, senderName, senderIsTeacher, signal } = payload;
      if (!sender || !signal) return;

      const pc = getOrCreatePeerConnection(sender, senderName, senderIsTeacher);
      const peerInfo = peerMap.current[sender];
      if (!pc || !peerInfo) return;

      if (signal.type === 'offer' && signal.offer) {
        const offer = new RTCSessionDescription(signal.offer);
        const readyForOffer = !peerInfo.makingOffer && (pc.signalingState === "stable" || peerInfo.isSettingRemoteAnswerPending);
        const offerCollision = !readyForOffer;

        peerInfo.ignoreOffer = !peerInfo.isPolite && offerCollision;
        if (peerInfo.ignoreOffer) {
          console.warn(`[WebRTC] Impolite peer ${userId} ignoring offer collision from ${sender}`);
          return;
        }

        peerInfo.isSettingRemoteAnswerPending = true;
        try {
          if (offerCollision && pc.signalingState !== "stable") {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" }),
              pc.setRemoteDescription(offer)
            ]);
          } else {
            await pc.setRemoteDescription(offer);
          }

          // Automatically bind transceivers created by the remote offer
          const transceivers = pc.getTransceivers();
          peerInfo.audioTransceiver = transceivers.find(t => 
            (t.receiver && t.receiver.track && t.receiver.track.kind === 'audio') ||
            (t.sender && t.sender.track && t.sender.track.kind === 'audio')
          ) || transceivers[0] || null;

          peerInfo.videoTransceiver = transceivers.find(t => 
            (t.receiver && t.receiver.track && t.receiver.track.kind === 'video') ||
            (t.sender && t.sender.track && t.sender.track.kind === 'video')
          ) || transceivers[1] || null;

          if (peerInfo.audioTransceiver) peerInfo.audioTransceiver.direction = 'sendrecv';
          if (peerInfo.videoTransceiver) peerInfo.videoTransceiver.direction = 'sendrecv';

          // Process queued ICE candidates
          await processPendingCandidates(sender, pc);

          updateTransceiverTracks(peerInfo);

          const rawAnswer = await pc.createAnswer();
          const optimizedSdp = optimizeSdpForMobileNetworks(rawAnswer.sdp);
          const answer = { type: rawAnswer.type, sdp: optimizedSdp };
          await pc.setLocalDescription(answer);

          safeSend('webrtc_signal', { 
            target: sender, 
            sender: userId, 
            senderName: userName,
            senderIsTeacher: isTeacher,
            signal: { type: 'answer', answer: pc.localDescription } 
          });
        } catch (err) {
          console.error('[WebRTC] Error handling offer:', err);
        } finally {
          peerInfo.isSettingRemoteAnswerPending = false;
        }

      } else if (signal.type === 'answer' && signal.answer) {
        if (pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
            
            // Map transceivers
            const transceivers = pc.getTransceivers();
            peerInfo.audioTransceiver = transceivers.find(t => 
              (t.receiver && t.receiver.track && t.receiver.track.kind === 'audio') ||
              (t.sender && t.sender.track && t.sender.track.kind === 'audio')
            ) || transceivers[0] || null;

            peerInfo.videoTransceiver = transceivers.find(t => 
              (t.receiver && t.receiver.track && t.receiver.track.kind === 'video') ||
              (t.sender && t.sender.track && t.sender.track.kind === 'video')
            ) || transceivers[1] || null;

            await processPendingCandidates(sender, pc);
            updateTransceiverTracks(peerInfo);
          } catch (err) {
            console.error('[WebRTC] Error setting remote answer:', err);
          }
        } else {
          console.warn(`[WebRTC] Skipping answer from ${sender} because signalingState is ${pc.signalingState}`);
        }

      } else if (signal.type === 'ice-candidate' && signal.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.warn('[WebRTC] Error adding ICE candidate:', e);
          }
        } else {
          if (!pendingCandidates.current[sender]) pendingCandidates.current[sender] = [];
          pendingCandidates.current[sender].push(signal.candidate);
        }
      } else if (signal.type === 'ice-candidate-batch' && signal.candidates) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            for (const cand of signal.candidates) {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (e) {
            console.warn('[WebRTC] Error adding ICE candidate batch:', e);
          }
        } else {
          if (!pendingCandidates.current[sender]) pendingCandidates.current[sender] = [];
          pendingCandidates.current[sender].push(...signal.candidates);
        }
      }
    });

    // 3. Teacher camera state updates
    ch.on('broadcast', { event: 'webrtc_camera_state' }, ({ payload }) => {
      if (!enabledRef.current) return;
      if (payload && payload.userId !== userId) {
        setPeers(prev => prev.map(p => {
          if (p.id === payload.userId) {
            return { ...p, hasVideo: !!payload.isCameraOn, facingMode: payload.facingMode };
          }
          return p;
        }));
      }
    });
    
    // 4. Force Mute command from Teacher (targeted)
    ch.on('broadcast', { event: 'force_mute' }, ({ payload }) => {
      if (!enabledRef.current) return;
      if (payload && payload.target === userId) {
        if (localStreamRef.current) {
          const track = localStreamRef.current.getAudioTracks()[0];
          if (track) {
            track.stop();
            localStreamRef.current.removeTrack(track);
          }
        }
        setIsMicOn(false);
        setIsAudioEnabled(false);
        isAudioEnabledRef.current = false;
        Object.values(peerMap.current).forEach(peerInfo => {
          if (peerInfo.audioTransceiver && peerInfo.audioTransceiver.sender) {
            peerInfo.audioTransceiver.sender.replaceTrack(null).catch(console.warn);
          }
        });
      }
    });

    // 5. Mute ALL students (broadcast without specific target)
    ch.on('broadcast', { event: 'teacher_force_mute_all' }, () => {
      if (!enabledRef.current) return;
      if (!isTeacher) {
        if (localStreamRef.current) {
          const track = localStreamRef.current.getAudioTracks()[0];
          if (track) {
            track.stop();
            localStreamRef.current.removeTrack(track);
          }
        }
        setIsMicOn(false);
        setIsAudioEnabled(false);
        isAudioEnabledRef.current = false;
        Object.values(peerMap.current).forEach(peerInfo => {
          if (peerInfo.audioTransceiver && peerInfo.audioTransceiver.sender) {
            peerInfo.audioTransceiver.sender.replaceTrack(null).catch(console.warn);
          }
        });
      }
    });

    // 6. Grant Speak â€” teacher allows a specific student to unmute themselves
    ch.on('broadcast', { event: 'grant_speak' }, async ({ payload }) => {
      if (!enabledRef.current) return;
      if (!isTeacher && payload && payload.target === userId) {
        // Auto-start mic for the student
        if (!isAudioEnabledRef.current) {
          await startAudio();
        }
      }
    });

    // 7. Conference Mode ON â€” teacher enables all-hear-all (Mesh P2P between students)
    ch.on('broadcast', { event: 'conference_mode_on' }, async ({ payload }) => {
      if (!enabledRef.current) return;
      if (isTeacher) return; // Teacher already has connections to everyone
      conferenceModeRef.current = true;
      setConferenceMode(true);
      
      if (payload && Array.isArray(payload.peers)) {
        for (const remotePeer of payload.peers) {
          if (remotePeer.id === userId) continue; // skip self
          if (remotePeer.isTeacher) continue;     // skip teacher
          
          const pc = getOrCreatePeerConnection(remotePeer.id, remotePeer.name, remotePeer.isTeacher);
          const peerInfo = peerMap.current[remotePeer.id];
          
          // The peer with the higher ID ALWAYS initiates the connection to prevent collisions
          if (userId > remotePeer.id) {
            initiateOffer(remotePeer.id, pc, peerInfo);
          }
        }
      }
    });

    // 8. Conference Mode OFF â€” teacher disables all-hear-all, students drop student-to-student connections
    ch.on('broadcast', { event: 'conference_mode_off' }, () => {
      if (!enabledRef.current) return;
      if (isTeacher) return;
      conferenceModeRef.current = false;
      setConferenceMode(false);
      // Close all non-teacher peer connections
      Object.entries(peerMap.current).forEach(([peerId, peerInfo]) => {
        if (!peerInfo.isTeacher) {
          try { peerInfo.pc.close(); } catch (e) {}
          delete peerMap.current[peerId];
          delete pendingCandidates.current[peerId];
        }
      });
      setPeers(prev => prev.filter(p => p.isTeacher));
    });

    // Announce our presence to the room
    safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });
    const retryTimer = setTimeout(() => {
      safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });
    }, 1000);

    return () => {
      clearTimeout(retryTimer);
    };
  }, [userId, isTeacher, channelVersion]);

  // Toggle Mic: When muted, releases hardware recording session so mobile phone immediately returns to Media Speaker mode!
  const toggleMic = async () => {
    if (isMicOn) {
      // Mute & release hardware track so phone exits In-Call mode
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.stop();
          localStreamRef.current.removeTrack(audioTrack);
        }
      }
      setIsMicOn(false);
      setIsAudioEnabled(false);
      isAudioEnabledRef.current = false;
      
      Object.values(peerMap.current).forEach(peerInfo => {
        if (peerInfo.audioTransceiver && peerInfo.audioTransceiver.sender) {
          peerInfo.audioTransceiver.sender.replaceTrack(null).catch(console.warn);
        }
      });
    } else {
      // Unmute & acquire fresh audio track
      await startAudio();
    }
  };
  
  const forceMuteStudent = (studentId) => {
    safeSend('force_mute', { target: studentId });
  };

  // Grant a student permission to speak (teacher action)
  const grantSpeakToStudent = (studentId) => {
    safeSend('grant_speak', { target: studentId });
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    Object.values(peerMap.current).forEach(peerInfo => {
      if (peerInfo.pc) peerInfo.pc.close();
    });
    peerMap.current = {};
    pendingCandidates.current = {};
    setPeers([]);
    setIsAudioEnabled(false);
    isAudioEnabledRef.current = false;
    setIsCameraOn(false);
    isCameraOnRef.current = false;
    setIsMicOn(false);
  };

  // Real-time Latency & Network Quality Monitor
  useEffect(() => {
    const statsTimer = setInterval(async () => {
      const pcs = Object.values(peerMap.current).map(p => p.pc).filter(Boolean);
      if (pcs.length === 0) {
        setPingMs(null);
        return;
      }
      for (const pc of pcs) {
        if (pc.connectionState === 'connected') {
          try {
            const stats = await pc.getStats();
            stats.forEach(report => {
              if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                if (typeof report.currentRoundTripTime === 'number') {
                  const rttMs = Math.round(report.currentRoundTripTime * 1000);
                  setPingMs(rttMs);
                  let newQuality = 'excellent';
                  if (rttMs < 120) newQuality = 'excellent';
                  else if (rttMs < 280) newQuality = 'good';
                  else newQuality = 'poor';
                  
                  setNetworkQuality(prev => {
                    if (prev !== newQuality) {
                      safeSend('student_network_quality', { userId, quality: newQuality, ping: rttMs });
                    }
                    return newQuality;
                  });
                }
              }
            });
          } catch (e) {}
        }
      }
    }, 8000); // Reduced from 2500ms â€” getStats() is expensive on mobile CPUs

    return () => clearInterval(statsTimer);
  }, [safeSend, userId]);

  // Network Online, Screen Unlock, & Tab Switch Auto-Recovery
  useEffect(() => {
    let debounceTimer = null;
    const handleReactivate = () => {
      if (!isEnabled || document.visibilityState === 'hidden') return;
      
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log('[WebRTC] Reactivated (online/visible): refreshing ICE and rejoining');

        // Check if OS killed our hardware tracks while in background
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          
          let needsMicRestart = isMicOnRef.current && (!audioTrack || audioTrack.readyState === 'ended');
          let needsCamRestart = isCameraOnRef.current && (!videoTrack || videoTrack.readyState === 'ended');
          
          if (needsMicRestart) {
            console.log('[WebRTC] Mic was killed by OS. Restarting...');
            await startAudio();
          }
          if (needsCamRestart) {
            console.log('[WebRTC] Camera was killed by OS. Restarting...');
            if (isCameraOnRef.current) {
              await toggleCamera(); // Turn off dead track
              await toggleCamera(); // Turn on fresh track
            }
          }
        }
        
        // Completely destroy all existing peer connections. They are likely dead or desynced 
        // after device sleep. We will rebuild them fresh after sending webrtc_join.
        Object.values(peerMap.current).forEach(peerInfo => {
          if (peerInfo.pc) {
            try { peerInfo.pc.close(); } catch (e) {}
          }
        });
        peerMap.current = {};
        setPeers([]);
        pendingCandidates.current = {};
        
        // Broadcast our return. Others will nuke their connection to us and we'll start fresh.
        safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });
      }, 1000);
    };

    window.addEventListener('online', handleReactivate);
    document.addEventListener('visibilitychange', handleReactivate);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('online', handleReactivate);
      document.removeEventListener('visibilitychange', handleReactivate);
    };
  }, [safeSend, userId, userName, isTeacher, initiateOffer, isEnabled]);

  // Teacher: Enable Conference Mode (all students hear each other)
  const enableConferenceMode = () => {
    if (!isTeacher) return;
    conferenceModeRef.current = true;
    setConferenceMode(true);
    // Send list of current peers so students know who to connect to
    const peerList = Object.entries(peerMap.current).map(([id, info]) => ({
      id,
      name: info.name,
      isTeacher: info.isTeacher
    }));
    peerList.push({ id: userId, name: userName, isTeacher: true });
    safeSend('conference_mode_on', { peers: peerList });
  };

  // Teacher: Disable Conference Mode (back to classroom - teacher only)
  const disableConferenceMode = () => {
    if (!isTeacher) return;
    conferenceModeRef.current = false;
    setConferenceMode(false);
    safeSend('conference_mode_off', {});
  };

  // Listen for mic device change to seamlessly switch device if mic is on
  useEffect(() => {
    const handleMicChange = async () => {
      if (isMicOnRef.current) {
        // Mute current
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.stop();
            localStreamRef.current.removeTrack(audioTrack);
          }
        }
        setIsMicOn(false);
        setIsAudioEnabled(false);
        isAudioEnabledRef.current = false;
        
        // Start fresh with new device
        setTimeout(() => {
          startAudio();
        }, 100);
      }
    };
    window.addEventListener('micdevicechange', handleMicChange);
    window.addEventListener('micconfigchange', handleMicChange);
    return () => {
      window.removeEventListener('micdevicechange', handleMicChange);
      window.removeEventListener('micconfigchange', handleMicChange);
    };
  }, []);

  return { 
    localStream, 
    startAudio, 
    toggleCamera, 
    switchCamera,
    facingMode,
    stopMedia, 
    toggleMic, 
    isMicOn, 
    isCameraOn, 
    isAudioEnabled, 
    peers, 
    forceMuteStudent,
    grantSpeakToStudent,
    pingMs,
    networkQuality,
    conferenceMode,
    enableConferenceMode,
    disableConferenceMode
  };
}





