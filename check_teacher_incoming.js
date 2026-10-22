const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const idx = lines.findIndex(l => l.includes("event: 'student_fabric_state'"));
if (idx !== -1) {
  console.log(lines.slice(idx - 2, idx + 15).join('\n'));
} else {
  console.log('Not found student_fabric_state');
}
