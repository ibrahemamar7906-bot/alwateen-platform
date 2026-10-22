const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('oniceconnectionstatechange'));
if (idx !== -1) console.log(lines.slice(idx - 2, idx + 20).join('\n'));
else console.log('Not found');
