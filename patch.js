const fs = require('fs');
const file = 'e:/ملفات المنصة/-/app/virtual-classroom/P2PScreenShare.js';
let content = fs.readFileSync(file, 'utf8');

// Teacher ICE buffer fix
content = content.replace(
  const lastRequestRef = useRef({}) // { studentId: timestamp },
  const lastRequestRef = useRef({}) // { studentId: timestamp }\n  const pendingIceRef = useRef({}) // { studentId: [] }
);

content = content.replace(
  wait pc.setRemoteDescription(new RTCSessionDescription(payload.answer)),
  wait pc.setRemoteDescription(new RTCSessionDescription(payload.answer));\n            if (pendingIceRef.current[payload.from]) {\n              for (let cand of pendingIceRef.current[payload.from]) {\n                pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});\n              }\n              pendingIceRef.current[payload.from] = [];\n            }
);

content = content.replace(
  // 3. ICE Candidates from student
      if (payload.event === 'webrtc_ice_candidates' && payload.target === roomId) {
        const pc = peersRef.current[payload.from]
        if (pc && payload.candidates) {
          for (let cand of payload.candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand))
            } catch (err) {}
          }
        }
      },
  // 3. ICE Candidates from student
      if (payload.event === 'webrtc_ice_candidates' && payload.target === roomId) {
        const pc = peersRef.current[payload.from];
        if (pc && payload.candidates) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            for (let cand of payload.candidates) {
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});
            }
          } else {
            if (!pendingIceRef.current[payload.from]) pendingIceRef.current[payload.from] = [];
            pendingIceRef.current[payload.from].push(...payload.candidates);
          }
        }
      }
);

// Student ICE buffer fix
content = content.replace(
  const ssChannelRef = useRef(null)\n  const requestSentRef = useRef(false),
  const ssChannelRef = useRef(null)\n  const requestSentRef = useRef(false)\n  const pendingIceRef = useRef([])
);

content = content.replace(
  wait pc.setRemoteDescription(new RTCSessionDescription(payload.offer)),
  wait pc.setRemoteDescription(new RTCSessionDescription(payload.offer));\n          if (pendingIceRef.current.length > 0) {\n            for (let cand of pendingIceRef.current) {\n              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});\n            }\n            pendingIceRef.current = [];\n          }
);

content = content.replace(
  if (payload.event === 'webrtc_ice_candidates' && payload.target === studentId) {
        if (pcRef.current && payload.candidates) {
          for (let cand of payload.candidates) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(cand))
            } catch (err) {}
          }
        }
      },
  if (payload.event === 'webrtc_ice_candidates' && payload.target === studentId) {
        if (pcRef.current && payload.candidates) {
          if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
            for (let cand of payload.candidates) {
              pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});
            }
          } else {
            pendingIceRef.current.push(...payload.candidates);
          }
        }
      }
);

fs.writeFileSync(file, content, 'utf8');
