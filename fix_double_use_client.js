const fs = require('fs');
const file1 = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace(/'use client'\s*\nimport dummyStyles from '\.\.\/whiteboard\/page\.module\.css';\s*\n'use client'/g, "'use client'\nimport dummyStyles from '../whiteboard/page.module.css';");
fs.writeFileSync(file1, c1, 'utf8');

const file2 = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\page.js';
let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace(/'use client'\s*\nimport dummyStyles from '\.\/page\.module\.css';\s*\n'use client'/g, "'use client'\nimport dummyStyles from './page.module.css';");
fs.writeFileSync(file2, c2, 'utf8');

console.log('Fixed double use client');
