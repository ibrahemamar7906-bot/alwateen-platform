const fs = require('fs');

const studentFile = 'e:\\منصة الوتين\\app\\live\\LiveWhiteboardStudent.js';
const content = fs.readFileSync(studentFile, 'utf8');
const matches = [...content.matchAll(/channel\.on\('broadcast',\s*\{[^}]+\},\s*\(\{ payload \}\)\s*=>\s*\{/g)];
console.log("Student listens for:");
const events = [...content.matchAll(/channel\.on\('broadcast',\s*\{\s*event:\s*['"]([^'"]+)['"]/g)];
console.log(events.map(m => m[1]).join(', '));

