const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `  const updateTransceiverTracks = useCallback((peerInfo) => {
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

    // Update audio track
    if (peerInfo.audioTransceiver && peerInfo.audioTransceiver.sender) {
      peerInfo.audioTransceiver.sender.replaceTrack(audioTrack).catch(err => {
        console.warn('[WebRTC] replaceTrack audio warning:', err);
      });
    }

    // Update video track
    if (peerInfo.videoTransceiver && peerInfo.videoTransceiver.sender) {
      peerInfo.videoTransceiver.sender.replaceTrack(videoTrack).catch(err => {
        console.warn('[WebRTC] replaceTrack video warning:', err);
      });
    }
  }, []);`;

const newFunc = `  const updateTransceiverTracks = useCallback((peerInfo) => {
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
  }, []);`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed WebRTC updateTransceiverTracks to renegotiate on inactive direction!');
