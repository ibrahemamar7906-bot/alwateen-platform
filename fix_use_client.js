const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

// Remove the injected imports at the very top
content = content.replace("import whiteboardStyles from '../whiteboard/page.module.css';\n", "");
content = content.replace("import '../whiteboard/page.module.css';\n", "");

// Ensure "use client" is at the top
if (!content.startsWith('"use client"')) {
    content = '"use client";\n' + content.replace(/"use client";?\n?/, '');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed use client in virtual-classroom/page.js');
