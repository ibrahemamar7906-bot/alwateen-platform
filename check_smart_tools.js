const fs = require('fs');
const dir = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\';
const files = [
  'GeometryToolsModal.js',
  'ScientificCalculatorModal.js',
  'GraphingCalculatorModal.js'
];

files.forEach(f => {
  if (fs.existsSync(dir + f)) {
    const content = fs.readFileSync(dir + f, 'utf8');
    const firstLines = content.split('\n').slice(0, 25).join('\n');
    console.log(`--- ${f} ---`);
    if (firstLines.includes('!isActive') || firstLines.includes('!isOpen')) {
      console.log('OK');
    } else {
      console.log('MISSING !isActive AT TOP');
    }
  } else {
    console.log(`--- ${f} --- NOT FOUND`);
  }
});
