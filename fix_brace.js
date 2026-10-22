const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\live\\components\\LiveHtmlSandboxStudent.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('useEffect(() => { {', 'useEffect(() => {');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed extra brace!');
