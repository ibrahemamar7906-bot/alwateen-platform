const fs = require('fs');
const path = require('path');

const dir = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\whiteboard';
const files = [
  'MemoryGameOverlay.js',
  'SpinWheelOverlay.js',
  'QuizShowOverlay.js',
  'HangmanOverlay.js',
  'WordBuilderOverlay.js',
  'WordSearchOverlay.js'
];

files.forEach(file => {
  const filepath = path.join(dir, file);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  console.log('Processing', file);
});