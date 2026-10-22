const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\student-dashboard\\battle\\page.js';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const idx = lines.findIndex(l => l.includes("activeTool === 'grammar'"));
  if (idx !== -1) console.log(lines.slice(idx - 2, idx + 5).join('\n'));
  else console.log('Not found in battle/page.js');
} else { console.log('File not found'); }
