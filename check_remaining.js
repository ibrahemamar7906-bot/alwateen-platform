const fs = require('fs');
const files = [
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\MathQuizOverlay.js',
  'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\MemoryGameOverlay.js'
];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const firstLines = content.split('\n').slice(0, 30).join('\n');
  if (firstLines.includes('!isActive')) console.log(file.split('\\').pop(), 'OK');
  else console.log(file.split('\\').pop(), 'MISSING');
});
