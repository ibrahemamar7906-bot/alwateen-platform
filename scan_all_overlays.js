const fs = require('fs');
const dir = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Modal.js') || f.endsWith('Overlay.js'));

files.forEach(f => {
  const content = fs.readFileSync(dir + f, 'utf8');
  const firstLines = content.split('\n').slice(0, 30).join('\n');
  if (!firstLines.includes('!isActive') && !firstLines.includes('!isOpen') && !firstLines.includes('!show')) {
    console.log('WARNING: MISSING CHECK AT TOP in:', f);
  }
});
console.log('Done scanning');
