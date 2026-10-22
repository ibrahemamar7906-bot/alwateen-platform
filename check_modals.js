const fs = require('fs');
const dir = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\';
const files = [
  'GeometryToolsModal.js',
  'MathEquationModal.js',
  'SmartGraphModal.js',
  'SmartImportModal.js'
];

files.forEach(f => {
  if (fs.existsSync(dir + f)) {
    const content = fs.readFileSync(dir + f, 'utf8');
    const firstLines = content.split('\n').slice(0, 15).join('\n');
    if (!firstLines.includes('!isOpen') && !firstLines.includes('!isActive')) {
      console.log('WARNING: MISSING CHECK AT TOP in:', f);
      // Let's fix it right here
      let newContent = content.replace(/export default function [a-zA-Z]+\([^)]*\)\s*\{/, match => match + '\n  if (typeof isOpen !== "undefined" && !isOpen) return null;\n  if (typeof isActive !== "undefined" && !isActive) return null;\n');
      fs.writeFileSync(dir + f, newContent, 'utf8');
      console.log('Fixed:', f);
    } else {
      console.log('OK:', f);
    }
  }
});
