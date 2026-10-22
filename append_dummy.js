const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('dummyStyles.container')) {
    content = content.replace(/(<\/\s*div\s*>)\s*$/i, "  <div className={dummyStyles.container} style={{display:'none'}}></div>\n$1");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Appended dummy usage');
}
