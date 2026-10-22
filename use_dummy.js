const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('className={dummyStyles.container}')) {
    content = content.replace(/<div([^>]+)className="virtual-classroom"/, '<div$1className={`virtual-classroom ${dummyStyles.container || ""}`}')
    fs.writeFileSync(file, content, 'utf8');
    console.log('Injected dummyStyles usage');
} else {
    console.log('Already used dummyStyles');
}
