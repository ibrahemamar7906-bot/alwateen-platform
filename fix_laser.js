const fs = require('fs');
const path = 'e:/منصة الوتين/app/teacher-assistant/whiteboard/WhiteboardComponent.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/, Laser, Sparkles/g, ', Crosshair, Sparkles');
content = content.replace(/<Laser size=\{20\} \/>/g, '<Crosshair size={20} />');
content = content.replace(/<Laser size=\{20\}\/>/g, '<Crosshair size={20}/>');

fs.writeFileSync(path, content, 'utf8');
