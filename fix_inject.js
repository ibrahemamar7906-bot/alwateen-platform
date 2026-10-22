const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import '../whiteboard/page.module.css';\n", "import whiteboardStyles from '../whiteboard/page.module.css';\n");
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CSS import in virtual-classroom/page.js');
