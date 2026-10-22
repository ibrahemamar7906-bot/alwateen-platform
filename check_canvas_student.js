const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\LiveWhiteboardStudent.js';
const content = fs.readFileSync(file, 'utf8');
const matches = [...content.matchAll(/initCanvas\.on\(['"]([^'"]+)['"]/g)];
const events = [...new Set(matches.map(m => m[1]))];
console.log('Student canvas listens to:', events.join(', '));
