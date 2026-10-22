const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

// Fix ICE connection state change debounce
const iceChangeStr = `    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        try { 
          pc.restartIce(); 
          if (isTeacher && peerMap.current[remoteUserId]) {
            initiateOffer(remoteUserId, pc, peerMap.current[remoteUserId]);
          }
        } catch (e) {}
      }
    };`;

const newIceChangeStr = `    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
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
      }
    };`;

content = content.replace(iceChangeStr, newIceChangeStr);

const connChangeStr = `    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        try {
          pc.restartIce();
          if (isTeacher && peerMap.current[remoteUserId]) {
            initiateOffer(remoteUserId, pc, peerMap.current[remoteUserId]);
          }
        } catch (e) {}`;

const newConnChangeStr = `    pc.onconnectionstatechange = () => {
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
        }`;

content = content.replace(connChangeStr, newConnChangeStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ICE restart debouncing');
