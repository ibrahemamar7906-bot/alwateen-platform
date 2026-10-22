const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const reactStateIdx = lines.findIndex(l => l.includes("event: 'react_state'"));
if (reactStateIdx !== -1) {
  console.log(lines.slice(reactStateIdx - 15, reactStateIdx + 20).join('\n'));
} else {
  console.log('Not found');
}
