const fs = require('fs');

function checkFile(file, name) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/event:\s*['"]([^'"]+)['"]/g)];
  const events = [...new Set(matches.map(m => m[1]))];
  console.log(`Events in ${name}:`);
  console.log(events.join(', '));
  console.log('---');
}

checkFile('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js', 'Teacher');
checkFile('e:\\منصة الوتين\\app\\live\\LiveWhiteboardStudent.js', 'Student');
