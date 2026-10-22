const fs = require('fs');
const dir = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Modal.js') || f.endsWith('Overlay.js'));
let hasBad = false;
files.forEach(f => {
  const content = fs.readFileSync(dir + f, 'utf8');
  const lines = content.split('\n');
  const idx = lines.findIndex(l => (l.includes('!isActive') || l.includes('!isOpen') || l.includes('!show')) && l.includes('return null'));
  
  if (idx > 15) {
    console.log(`WARNING: ${f} has conditional return at line ${idx + 1}`);
    hasBad = true;
  }
});
if (!hasBad) console.log('All files are perfectly clean at the top!');
