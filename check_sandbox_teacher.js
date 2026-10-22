const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveHtmlSandboxTeacher.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('broadcastSafely'));
console.log(lines.slice(idx - 5, idx + 20).join('\n'));
