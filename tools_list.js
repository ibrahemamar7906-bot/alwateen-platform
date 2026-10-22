const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js';
const content = fs.readFileSync(file, 'utf8');

console.log("TOOLTIPS:");
const matches = [...content.matchAll(/<span className=\{styles\.tooltip\}>([^<]+)<\/span>/g)];
const tooltips = [...new Set(matches.map(m => m[1]))];
console.log(tooltips.join('\n'));

console.log("\nMODAL GAMES:");
const games = [...content.matchAll(/<h5[^>]*>([^<]+)<\/h5>/g)];
console.log(games.map(m => m[1]).join('\n'));
