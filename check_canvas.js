const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js';
const content = fs.readFileSync(file, 'utf8');
const matches = [...content.matchAll(/initCanvas\.on\(['"]([^'"]+)['"]/g)];
const events = [...new Set(matches.map(m => m[1]))];
console.log('Teacher canvas listens to:', events.join(', '));
