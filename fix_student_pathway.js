const fs = require('fs');
const filePath = 'app/teacher-assistant/whiteboard/ReadyPathwayOverlay.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the if (isStudent) block entirely so the student sees the same modal layout as teacher
// We will rely on LiveReadyPathway to handle the teacher/student differences.
const regex = /  if \(isStudent\) return \([\s\S]*?\);\n/g;
content = content.replace(regex, '');

// Inside LiveReadyPathway, we need to pass isTeacher properly so the student doesn't see teacher controls.
// But wait, the student uses isStudent=true, so isTeacher should be !isStudent.
const renderRegex = /<LiveReadyPathway channel=\{channel\} isTeacher=\{true\} \/>/g;
content = content.replace(renderRegex, '<LiveReadyPathway channel={channel} isTeacher={!isStudent} />');

fs.writeFileSync(filePath, content, 'utf8');
