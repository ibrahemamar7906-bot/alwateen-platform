const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes("styles.leftToolbar"));
console.log(lines.slice(idx - 2, idx + 5).join('\n'));
