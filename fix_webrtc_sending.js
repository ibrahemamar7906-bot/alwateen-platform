const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
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
`;

content = content.replace(
  /\/\/ Instantly inject the live audio track into all active peer connections\n\s*Object\.values\(peerMap\.current\)\.forEach\(peerInfo => \{\n\s*updateTransceiverTracks\(peerInfo\);\n\s*\}\);/g,
  replacement.trim()
);

const replacementCam = `
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
`;

content = content.replace(
  /\/\/ Instantly inject the new video track into all active peer connections\n\s*Object\.values\(peerMap\.current\)\.forEach\(peerInfo => \{\n\s*updateTransceiverTracks\(peerInfo\);\n\s*\}\);/g,
  replacementCam.trim()
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed WebRTC track sending for Student!');
