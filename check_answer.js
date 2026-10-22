const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\useWebRTC.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes("signal.type === 'answer'"));
console.log(lines.slice(idx - 5, idx + 25).join('\n'));
