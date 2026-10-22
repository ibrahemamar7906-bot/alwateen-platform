const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\MathQuizOverlay.js';
let content = fs.readFileSync(file, 'utf8');

// The messed up area is:
// } (\
// <button key={idx} onClick={() => handleAnswer(opt)} style={{

content = content.replace(/\} \(\\\s*<button key=\{idx\}/, '} \nreturn (\n<button key={idx}');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed JSX syntax properly');
