const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\page.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('request_sync'));
console.log('Found request_sync at:', idx);
if (idx !== -1) console.log(lines.slice(idx - 5, idx + 15).join('\n'));
