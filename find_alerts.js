const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js', 'utf8');

const matches = content.match(/alert\(['"`].*?['"`]\)/g);
if (matches) {
    matches.forEach(m => console.log(m));
} else {
    console.log("No alerts found.");
}
