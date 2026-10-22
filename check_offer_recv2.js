const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes("signal.type === 'offer'"));
console.log(lines.slice(idx - 2, idx + 40).join('\n'));
