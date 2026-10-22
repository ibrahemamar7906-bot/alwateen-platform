const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [sessionInstanceId]')) {
  content = content.replace('const [conferenceMode, setConferenceMode] = useState(false);', `const [conferenceMode, setConferenceMode] = useState(false);
  const [sessionInstanceId] = useState(() => Math.random().toString(36).substring(7));`);
}

const joinListenerRegex = /const webrtcJoinListener = ch\.on\('broadcast', \{ event: 'webrtc_join' \}, async \(\{ payload \}\) => \{[\s\S]*?let existingPeerInfo = peerMap\.current\[payload\.userId\];\s*if \(existingPeerInfo && existingPeerInfo\.pc\) \{/;

const newJoinListener = `const webrtcJoinListener = ch.on('broadcast', { event: 'webrtc_join' }, async ({ payload }) => {
      if (!payload || payload.userId === userId) return;
      
      let existingPeerInfo = peerMap.current[payload.userId];
      
      // If the peer is already connected with the EXACT SAME session instance, ignore duplicate join broadcasts!
      if (existingPeerInfo && existingPeerInfo.sessionInstanceId === payload.sessionInstanceId && payload.sessionInstanceId) {
        return;
      }

      // Always nuke existing connection on NEW webrtc_join to ensure a completely fresh start!
      if (existingPeerInfo && existingPeerInfo.pc) {`;

content = content.replace(joinListenerRegex, newJoinListener);

const getOrCreateRegex = /existing\.isTeacher = remoteIsTeacher;\s*updateTransceiverTracks\(existing\);\s*return existing\.pc;\s*\}/;
const newGetOrCreate = `existing.isTeacher = remoteIsTeacher;
        updateTransceiverTracks(existing);
        return existing.pc;
      }`;
// We don't need to change getOrCreatePeerConnection, just store sessionInstanceId when creating peerInfo.

const getOrCreateFuncRegex = /existing\.isTeacher = remoteIsTeacher;\s*updateTransceiverTracks\(existing\);\s*return existing\.pc;\s*\}/;

const createPeerInfoRegex = /peerMap\.current\[remoteUserId\] = \{\s*id: remoteUserId,\s*pc,\s*name: remoteUserName,/;
const newCreatePeerInfo = `peerMap.current[remoteUserId] = {
      id: remoteUserId,
      pc,
      name: remoteUserName,`;
// wait, instead of modifying getOrCreate, I'll just set it in webrtcJoinListener!

const setSessionIdRegex = /const peerInfo = peerMap\.current\[payload\.userId\];/;
const newSetSessionId = `const peerInfo = peerMap.current[payload.userId];
      if (peerInfo) peerInfo.sessionInstanceId = payload.sessionInstanceId;`;

content = content.replace(setSessionIdRegex, newSetSessionId);

const sendJoinRegex1 = /safeSend\('webrtc_join', \{ userId, userName, isTeacher \}\);/g;
const newSendJoin1 = `safeSend('webrtc_join', { userId, userName, isTeacher, sessionInstanceId });`;
content = content.replace(sendJoinRegex1, newSendJoin1);

const sendJoinRegex2 = /safeSend\('webrtc_join', \{ userId, userName, isTeacher: false \}\);/g;
const newSendJoin2 = `safeSend('webrtc_join', { userId, userName, isTeacher: false, sessionInstanceId });`;
content = content.replace(sendJoinRegex2, newSendJoin2);

fs.writeFileSync(file, content, 'utf8');
console.log('Added sessionInstanceId to webrtc_join to prevent double-nuking!');
