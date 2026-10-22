const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\InteractiveGrammarStage.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(payload\.action === 'request_sync' && isTeacher\) \{[\s\S]*?\}\)\.catch\(e => console\.error\('Grammar sync error:', e\)\);\s*\}/;

content = content.replace(regex, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ReferenceError in InteractiveGrammarStage!');
