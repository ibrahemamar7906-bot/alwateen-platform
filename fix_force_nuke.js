const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

// Update listener to respect forceNuke
const oldListenerCheck = `if (existingPeerInfo && existingPeerInfo.sessionInstanceId === payload.sessionInstanceId && payload.sessionInstanceId) {`;
const newListenerCheck = `if (existingPeerInfo && existingPeerInfo.sessionInstanceId === payload.sessionInstanceId && payload.sessionInstanceId && !payload.forceNuke) {`;
content = content.replace(oldListenerCheck, newListenerCheck);

// Update handleReactivate to send forceNuke: true
const oldHandleReactivateJoin = `safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });`;
const newHandleReactivateJoin = `safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId, forceNuke: true });`;

// Replace ONLY the one inside handleReactivate
// The easiest way is to use regex matching the handleReactivate block
const handleReactivateBlockRegex = /Object\.values\(peerMap\.current\)\.forEach\([\s\S]*?pendingCandidates\.current = \{\};\s*safeSend\('webrtc_join', \{ userId, userName, isTeacher, sessionInstanceId \}\);/g;

content = content.replace(handleReactivateBlockRegex, (match) => {
  return match.replace(`safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });`, `safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId, forceNuke: true });`);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Added forceNuke to handleReactivate!');
