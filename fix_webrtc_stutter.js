const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /safeSend\('webrtc_join', \{ userId, userName, isTeacher \}\);\s*return true;\s*\} catch \(e\)/;
const replacement1 = `return true;\n    } catch (e)`;

const regex2 = /safeSend\('webrtc_camera_state', \{ userId, isCameraOn: true, facingMode: facingModeRef.current \}\);\s*safeSend\('webrtc_join', \{ userId, userName, isTeacher \}\);\s*\}\s*\} catch \(e\)/;
const replacement2 = `safeSend('webrtc_camera_state', { userId, isCameraOn: true, facingMode: facingModeRef.current });\n      }\n    } catch (e)`;

content = content.replace(regex1, replacement1);
content = content.replace(regex2, replacement2);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed WebRTC massive stutter on mic/cam toggle!');
