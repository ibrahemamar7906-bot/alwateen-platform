const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\page.js';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
