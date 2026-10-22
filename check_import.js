const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.find(l => l.includes('import styles')));
