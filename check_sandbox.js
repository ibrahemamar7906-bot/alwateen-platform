const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\page.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes("activeTool === 'html-sandbox'"));
if (idx !== -1) console.log(lines.slice(idx - 2, idx + 10).join('\n'));
else {
  const idx2 = lines.findIndex(l => l.includes('html-sandbox'));
  console.log(lines.slice(idx2 - 2, idx2 + 10).join('\n'));
}
