const fs = require('fs');
let content = fs.readFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', 'utf8');

const regex = /const emojis = \{ cat: 'إيقاف', octopus: 'إيقاف', magic: 'إيقاف', rocket: 'إيقاف', star: '\?', pencil: 'إيقاف', paw: 'إيقاف' \};/;
const replacement = "const emojis = { cat: '🐱', octopus: '🐙', magic: '✨', rocket: '🚀', star: '⭐', pencil: '✏️', paw: '🐾' };";

content = content.replace(regex, replacement);
fs.writeFileSync('e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js', content, 'utf8');
console.log('Done replacing cursor emojis!');
