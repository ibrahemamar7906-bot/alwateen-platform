import { useState, useEffect, useRef } from 'react';
import { useWebRTC } from './useWebRTC';
import { useAgora } from './useAgora';

export function useHybridRTC(channel, userId, userName, isTeacher, isAgoraEnabled) {
  // 1. Initialize WebRTC (Runs when !isAgoraEnabled)
  const webrtc = useWebRTC(channel, userId, userName, isTeacher, !isAgoraEnabled);

  // 2. Initialize Agora (Runs when isAgoraEnabled)
  const roomId = channel ? channel.topic.replace('realtime:', '') : 'default_room';
  const agora = useAgora(roomId, userId, userName, isTeacher, isAgoraEnabled);

  const [hybridLocalStream, setHybridLocalStream] = useState(null);
  const [hybridPeers, setHybridPeers] = useState([]);

  // 3. Construct Hybrid Local Stream for Agora
  useEffect(() => {
    if (!isAgoraEnabled) {
      setHybridLocalStream(webrtc.localStream);
      return;
    }
    const stream = new MediaStream();
    if (agora.localAgoraVideoTrack) {
      stream.addTrack(agora.localAgoraVideoTrack.getMediaStreamTrack());
    }
    setHybridLocalStream(stream.getTracks().length > 0 ? stream : null);
  }, [isAgoraEnabled, webrtc.localStream, agora.localAgoraVideoTrack]);

  // 4. Construct Hybrid Peers for Agora
  useEffect(() => {
    if (!isAgoraEnabled) {
      setHybridPeers(webrtc.peers);
      return;
    }
    const formattedPeers = agora.agoraPeers.map(p => {
      const stream = new MediaStream();
      // Audio is played natively by Agora now (in useAgora.js). We only need video here.
      if (p.videoTrack) stream.addTrack(p.videoTrack.getMediaStreamTrack());
      
      return {
        id: String(p.uid),
        name: 'مشارك', 
        hasVideo: !!p.videoTrack,
        stream: stream.getTracks().length > 0 ? stream : null
      };
    });
    setHybridPeers(formattedPeers);
  }, [isAgoraEnabled, webrtc.peers, agora.agoraPeers]);

  return {
    startAudio: isAgoraEnabled ? agora.startAgoraAudio : webrtc.startAudio,
    stopMedia: isAgoraEnabled ? agora.stopAgoraMedia : webrtc.stopMedia,
    toggleMic: isAgoraEnabled ? agora.toggleAgoraMic : webrtc.toggleMic,
    toggleCamera: isAgoraEnabled ? agora.toggleAgoraVideo : webrtc.toggleCamera,
    
    isMicOn: isAgoraEnabled ? agora.isAgoraMicOn : webrtc.isMicOn,
    isCameraOn: isAgoraEnabled ? agora.isAgoraCameraOn : webrtc.isCameraOn,
    
    localStream: hybridLocalStream,
    peers: hybridPeers,

    // WebRTC specific (pass-through for UI compatibility)
    switchCamera: webrtc.switchCamera,
    facingMode: webrtc.facingMode,
    forceMuteStudent: webrtc.forceMuteStudent,
    grantSpeakToStudent: webrtc.grantSpeakToStudent,
    pingMs: webrtc.pingMs,
    networkQuality: webrtc.networkQuality,
    conferenceMode: webrtc.conferenceMode,
    enableConferenceMode: webrtc.enableConferenceMode,
    disableConferenceMode: webrtc.disableConferenceMode,
  };
}


