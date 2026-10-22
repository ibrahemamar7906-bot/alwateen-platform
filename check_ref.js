const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const matches = [...content.matchAll(/reactStateRef\.current\s*=/g)];
const lineIndices = matches.map(m => content.substring(0, m.index).split('\n').length);
console.log("Lines:", lineIndices.join(', '));
for (const li of lineIndices) {
  console.log('--- Line', li);
  console.log(lines.slice(li - 5, li + 15).join('\n'));
}
