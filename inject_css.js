const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import '../whiteboard/page.module.css'")) {
    content = "import '../whiteboard/page.module.css';\n" + content;
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added CSS import to virtual-classroom/page.js');
} else {
    console.log('Already imported');
}
